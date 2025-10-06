import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Printer, CreditCard, Banknote, Smartphone, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function WaiterBilling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"]
  });

  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/restaurant-tables"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: kotOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/kot-orders"],
    refetchInterval: 3000,
    refetchIntervalInBackground: true
  });

  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"]
  });

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"]
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      await apiRequest("POST", "/api/transactions", transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Payment processed successfully" });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/kot-orders/${orderId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
    }
  });

  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast({ title: "Please enter a voucher code", variant: "destructive" });
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim() }),
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.valid && data.voucher) {
        setAppliedVoucher(data.voucher);
        toast({ title: "Voucher applied successfully!" });
      } else {
        setAppliedVoucher(null);
        toast({ title: "Invalid voucher", description: data.message || "Voucher code is invalid", variant: "destructive" });
      }
    } catch (error) {
      setAppliedVoucher(null);
      toast({ title: "Error validating voucher", variant: "destructive" });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const redeemVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      await apiRequest("POST", "/api/vouchers/redeem", { voucherId });
    }
  });


  // Filter orders that have approved or ready items
  const selectedTableOrders = kotOrders.filter(
    (order: any) => {
      if (order.tableId !== selectedTable) return false;
      if (order.status === 'cancelled' || order.status === 'served') return false;
      // Only show orders with approved or ready items
      return order.items?.some((item: any) => item.status === 'approved' || item.status === 'ready');
    }
  );

  // Calculate bill with cascading taxes
  const calculateBill = () => {
    let subtotal = 0;
    
    // Calculate subtotal from approved/ready items only
    selectedTableOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.status === 'approved' || item.status === 'ready') {
          const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
          if (menuItem) {
            subtotal += menuItem.price * item.qty;
          }
        }
      });
    });

    // Get active taxes
    const activeTaxes = hotelTaxes.filter((tax: any) => tax.isActive);
    
    // Sort taxes to apply VAT first, then service tax, then luxury tax
    // Tax types in DB are: 'vat', 'service_tax', 'luxury_tax'
    const taxOrder = ['vat', 'service_tax', 'luxury_tax'];
    const sortedTaxes = activeTaxes.sort((a: any, b: any) => {
      const aIndex = taxOrder.indexOf(a.taxType);
      const bIndex = taxOrder.indexOf(b.taxType);
      // Handle unknown tax types by putting them at the end
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    // Apply cascading taxes
    let runningTotal = subtotal;
    const taxBreakdown: any = {};
    
    sortedTaxes.forEach((tax: any) => {
      const taxRate = parseFloat(tax.percent) / 100;
      const taxAmount = Math.round((runningTotal * taxRate) * 100) / 100;
      // Use display name for breakdown
      const displayName = tax.taxType === 'vat' ? 'VAT' : 
                          tax.taxType === 'service_tax' ? 'Service Tax' : 
                          tax.taxType === 'luxury_tax' ? 'Luxury Tax' : tax.taxType;
      taxBreakdown[displayName] = {
        rate: parseFloat(tax.percent),
        amount: taxAmount
      };
      runningTotal = Math.round((runningTotal + taxAmount) * 100) / 100;
    });

    const totalTax = Object.values(taxBreakdown).reduce((sum: number, t: any) => sum + t.amount, 0);
    let grandTotal = Math.round((subtotal + totalTax) * 100) / 100;
    
    // Apply voucher discount (same logic as hotel billing)
    let discountAmount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.discountType === 'percentage') {
        discountAmount = Math.round((grandTotal * (parseFloat(appliedVoucher.discountAmount) / 100)) * 100) / 100;
      } else if (appliedVoucher.discountType === 'fixed') {
        discountAmount = Math.min(parseFloat(appliedVoucher.discountAmount), grandTotal);
      }
      grandTotal = Math.round((grandTotal - discountAmount) * 100) / 100;
    }

    return {
      subtotal,
      taxBreakdown,
      totalTax,
      discountAmount,
      grandTotal
    };
  };

  const billCalc = calculateBill();

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
      return;
    }

    if (selectedTableOrders.length === 0) {
      toast({ title: "Error", description: "No orders to process", variant: "destructive" });
      return;
    }

    try {
      // Redeem voucher if applied
      if (appliedVoucher) {
        await redeemVoucherMutation.mutateAsync(appliedVoucher.id);
      }

      // Create transaction
      await createTransactionMutation.mutateAsync({
        txnType: selectedPaymentMethod === 'cash' ? 'cash_in' : selectedPaymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
        amount: billCalc.grandTotal.toFixed(2),
        paymentMethod: selectedPaymentMethod,
        purpose: 'restaurant_sale',
        reference: `Table: ${tables.find((t: any) => t.id === selectedTable)?.name || selectedTable}${appliedVoucher ? ` | Voucher: ${appliedVoucher.code}` : ''}`
      });

      // Mark all orders as served
      for (const order of selectedTableOrders) {
        await updateOrderStatusMutation.mutateAsync({
          orderId: order.id,
          status: 'served'
        });
      }

      handlePrintBill();
      
      // Reset selection
      setSelectedTable("");
      setSelectedPaymentMethod("");
      setVoucherCode("");
      setAppliedVoucher(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to process payment", variant: "destructive" });
    }
  };


  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    toast({ title: "Voucher removed" });
  };


  const handlePrintBill = () => {
    const hotelName = hotel?.name || "HOTEL";
    const hotelAddress = hotel?.address || "";
    const hotelPhone = hotel?.phone || "";
    const tableName = tables.find((t: any) => t.id === selectedTable)?.name || "Unknown";
    const now = new Date();
    
    let billContent = `
<div style="font-family: 'Courier New', monospace; width: 300px; padding: 10px;">
  <div style="text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
    ${hotelName}
  </div>
  
  <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">
    ${hotelAddress ? `${hotelAddress}<br/>` : ''}
    ${hotelPhone ? `Tel: ${hotelPhone}<br/>` : ''}
  </div>
  
  <div style="text-align: center; font-size: 12px; margin-bottom: 15px;">
    Restaurant Bill<br/>
    ${tableName}
  </div>
  
  <div style="font-size: 11px; margin-bottom: 10px;">
    <div>Date: ${now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</div>
    <div>Time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
    <div>Bill No: ${now.getTime().toString().slice(-8)}</div>
    <div>Waiter: ${user?.username}</div>
  </div>
  
  <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin: 10px 0;">
    <table style="width: 100%; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="text-align: left; padding-bottom: 5px;">Item</th>
          <th style="text-align: center; padding-bottom: 5px;">Qty</th>
          <th style="text-align: right; padding-bottom: 5px;">Amount</th>
        </tr>
      </thead>
      <tbody>
`;

    selectedTableOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.status === 'approved' || item.status === 'ready') {
          const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
          if (menuItem) {
            billContent += `
        <tr>
          <td style="padding: 3px 0;">${menuItem.name}</td>
          <td style="text-align: center;">${item.qty}</td>
          <td style="text-align: right;">${formatCurrency(menuItem.price * item.qty)}</td>
        </tr>`;
          }
        }
      });
    });

    billContent += `
      </tbody>
    </table>
  </div>
  
  <div style="font-size: 11px; margin-top: 10px;">
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Subtotal:</span>
      <span>${formatCurrency(billCalc.subtotal)}</span>
    </div>
`;

    Object.entries(billCalc.taxBreakdown).forEach(([taxType, details]: [string, any]) => {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>${taxType} (${details.rate}%):</span>
      <span>${formatCurrency(details.amount)}</span>
    </div>`;
    });

    if (billCalc.discountAmount > 0 && appliedVoucher) {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #16a34a;">
      <span>Discount (${appliedVoucher.code}):</span>
      <span>-${formatCurrency(billCalc.discountAmount)}</span>
    </div>`;
    }

    billContent += `
    <div style="display: flex; justify-content: space-between; padding: 10px 0 5px 0; margin-top: 5px; border-top: 2px dashed #000; font-weight: bold; font-size: 14px;">
      <span>GRAND TOTAL:</span>
      <span>${formatCurrency(billCalc.grandTotal)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold;">
      <span>Payment Method:</span>
      <span>${selectedPaymentMethod.toUpperCase()}</span>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px;">
    Thank You! Visit Again<br/>
    <div style="margin-top: 5px; font-size: 10px;">
      This is a computer generated bill
    </div>
  </div>
</div>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bill - ${hotelName}</title>
            <style>
              @media print {
                body { margin: 0; }
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: 'Courier New', monospace;
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${billContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <DashboardLayout title="Billing">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Generate Bill
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Table
              </label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table: any) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTable && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Order Items (Approved/Ready)</h3>
                  {selectedTableOrders.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No approved orders for this table</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTableOrders.map((order: any) => (
                        <div key={order.id} className="text-sm">
                          {order.items?.map((item: any, idx: number) => {
                            if (item.status === 'approved' || item.status === 'ready') {
                              const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
                              if (!menuItem) return null;
                              return (
                                <div key={idx} className="flex justify-between py-1">
                                  <span>{menuItem.name} x {item.qty}</span>
                                  <span>{formatCurrency(menuItem.price * item.qty)}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTableOrders.length > 0 && (
                  <>
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(billCalc.subtotal)}</span>
                      </div>
                      {Object.entries(billCalc.taxBreakdown).map(([taxType, details]: [string, any]) => (
                        <div key={taxType} className="flex justify-between text-sm">
                          <span>{taxType} ({details.rate}%):</span>
                          <span>{formatCurrency(details.amount)}</span>
                        </div>
                      ))}
                      {billCalc.discountAmount > 0 && appliedVoucher && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({appliedVoucher.code}):</span>
                          <span>-{formatCurrency(billCalc.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(billCalc.grandTotal)}</span>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        Discount Voucher (Optional)
                      </label>
                      {!appliedVoucher ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter voucher code"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="input-voucher-code"
                          />
                          <Button 
                            onClick={handleValidateVoucher}
                            disabled={!voucherCode.trim() || isValidatingVoucher}
                            data-testid="button-apply-voucher"
                          >
                            Apply
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Voucher Applied: {appliedVoucher.code}
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-300">
                                {appliedVoucher.discountType === 'percentage' 
                                  ? `${appliedVoucher.discountAmount}% discount` 
                                  : `${formatCurrency(parseFloat(appliedVoucher.discountAmount))} off`}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRemoveVoucher}
                            data-testid="button-remove-voucher"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Payment Method
                      </label>
                      <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="pos">POS</SelectItem>
                          <SelectItem value="fonepay">Fonepay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={handlePrintBill} variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Bill
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={handleProcessPayment}
                        disabled={!selectedPaymentMethod || createTransactionMutation.isPending}
                      >
                        {selectedPaymentMethod === 'cash' && <Banknote className="h-4 w-4 mr-2" />}
                        {selectedPaymentMethod === 'pos' && <CreditCard className="h-4 w-4 mr-2" />}
                        {selectedPaymentMethod === 'fonepay' && <Smartphone className="h-4 w-4 mr-2" />}
                        Process Payment
                      </Button>
                    </div>
                  </>
                )}

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
