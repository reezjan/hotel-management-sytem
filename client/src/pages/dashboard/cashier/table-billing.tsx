import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Printer, CreditCard, Banknote, Smartphone, CheckCircle2, Utensils } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CashierTableBilling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [fonepayAmount, setFonepayAmount] = useState<string>("");
  const [orderItemQuantities, setOrderItemQuantities] = useState<Record<string, number>>({});

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

  const selectedTableOrders = kotOrders.filter(
    (order: any) => {
      if (order.tableId !== selectedTable) return false;
      if (order.status === 'cancelled' || order.status === 'served') return false;
      return order.items?.some((item: any) => item.status === 'approved' || item.status === 'ready');
    }
  );

  const calculateBill = () => {
    let subtotal = 0;
    
    selectedTableOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.status === 'approved' || item.status === 'ready') {
          const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
          if (menuItem) {
            const quantity = orderItemQuantities[item.id] ?? item.qty;
            subtotal += menuItem.price * quantity;
          }
        }
      });
    });

    const activeTaxes = hotelTaxes.filter((tax: any) => tax.isActive);
    const taxOrder = ['vat', 'service_tax', 'luxury_tax'];
    const sortedTaxes = activeTaxes.sort((a: any, b: any) => {
      const aIndex = taxOrder.indexOf(a.taxType);
      const bIndex = taxOrder.indexOf(b.taxType);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    let runningTotal = subtotal;
    const taxBreakdown: any = {};
    
    sortedTaxes.forEach((tax: any) => {
      const taxRate = parseFloat(tax.percent) / 100;
      const taxAmount = Math.round((runningTotal * taxRate) * 100) / 100;
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

  const cashReceivedAmount = parseFloat(cashReceived) || 0;
  const fonepayReceivedAmount = parseFloat(fonepayAmount) || 0;
  const totalReceived = cashReceivedAmount + fonepayReceivedAmount;
  const changeAmount = Math.max(0, totalReceived - billCalc.grandTotal);

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
      return;
    }

    if (selectedTableOrders.length === 0) {
      toast({ title: "Error", description: "No orders to process", variant: "destructive" });
      return;
    }

    if (selectedPaymentMethod === 'cash' && cashReceivedAmount < billCalc.grandTotal) {
      toast({ title: "Error", description: "Cash received must be at least the bill amount", variant: "destructive" });
      return;
    }

    if (selectedPaymentMethod === 'cash_fonepay') {
      const tolerance = 0.01;
      const difference = Math.abs(totalReceived - billCalc.grandTotal);
      
      if (difference > tolerance) {
        if (totalReceived < billCalc.grandTotal) {
          toast({ title: "Error", description: `Total payment is ${formatCurrency(billCalc.grandTotal - totalReceived)} short. Cash + Fonepay must equal the bill amount.`, variant: "destructive" });
        } else {
          toast({ title: "Error", description: `Total payment is ${formatCurrency(totalReceived - billCalc.grandTotal)} over. Cash + Fonepay must equal the bill amount.`, variant: "destructive" });
        }
        return;
      }
      if (cashReceivedAmount <= 0 || fonepayReceivedAmount <= 0) {
        toast({ title: "Error", description: "Both cash and fonepay amounts must be greater than zero", variant: "destructive" });
        return;
      }
    }

    try {
      if (appliedVoucher) {
        await redeemVoucherMutation.mutateAsync(appliedVoucher.id);
      }

      const tableRef = `Table: ${tables.find((t: any) => t.id === selectedTable)?.name || selectedTable}${appliedVoucher ? ` | Voucher: ${appliedVoucher.code}` : ''}`;

      if (selectedPaymentMethod === 'cash_fonepay') {
        // Create separate transactions for cash and fonepay
        await createTransactionMutation.mutateAsync({
          txnType: 'cash_in',
          amount: cashReceivedAmount.toFixed(2),
          paymentMethod: 'cash',
          purpose: 'restaurant_sale',
          reference: tableRef
        });

        await createTransactionMutation.mutateAsync({
          txnType: 'fonepay_in',
          amount: fonepayReceivedAmount.toFixed(2),
          paymentMethod: 'fonepay',
          purpose: 'restaurant_sale',
          reference: tableRef
        });
      } else {
        // Single payment method
        const txnType = selectedPaymentMethod === 'cash' ? 'cash_in' : 
                        selectedPaymentMethod === 'pos' ? 'pos_in' : 
                        selectedPaymentMethod === 'fonepay' ? 'fonepay_in' : 'cash_in';

        await createTransactionMutation.mutateAsync({
          txnType: txnType,
          amount: billCalc.grandTotal.toFixed(2),
          paymentMethod: selectedPaymentMethod,
          purpose: 'restaurant_sale',
          reference: tableRef
        });
      }

      for (const order of selectedTableOrders) {
        await updateOrderStatusMutation.mutateAsync({
          orderId: order.id,
          status: 'served'
        });
      }

      // Mark table as available for new guests
      await apiRequest("PUT", `/api/hotels/current/restaurant-tables/${selectedTable}`, {
        status: 'available'
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/restaurant-tables"] });

      handlePrintBill();
      
      toast({ title: "Payment processed successfully" });
      
      setSelectedTable("");
      setSelectedPaymentMethod("");
      setVoucherCode("");
      setAppliedVoucher(null);
      setCashReceived("");
      setFonepayAmount("");
      setOrderItemQuantities({});
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
    <div>Cashier: ${user?.username}</div>
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
            const quantity = orderItemQuantities[item.id] ?? item.qty;
            if (quantity > 0) {
              billContent += `
        <tr>
          <td style="padding: 3px 0;">${menuItem.name}</td>
          <td style="text-align: center;">${quantity}</td>
          <td style="text-align: right;">${formatCurrency(menuItem.price * quantity)}</td>
        </tr>`;
            }
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

    const paymentMethodText = selectedPaymentMethod === 'cash' ? 'CASH' :
                              selectedPaymentMethod === 'pos' ? 'CARD/POS' :
                              selectedPaymentMethod === 'fonepay' ? 'FONEPAY' :
                              selectedPaymentMethod === 'cash_fonepay' ? 'CASH + FONEPAY' : selectedPaymentMethod.toUpperCase();

    billContent += `
    <div style="display: flex; justify-content: space-between; padding: 10px 0 5px 0; margin-top: 5px; border-top: 2px dashed #000; font-weight: bold; font-size: 14px;">
      <span>GRAND TOTAL:</span>
      <span>${formatCurrency(billCalc.grandTotal)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold;">
      <span>Payment Method:</span>
      <span>${paymentMethodText}</span>
    </div>`;

    if (selectedPaymentMethod === 'cash' && cashReceivedAmount > 0) {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Cash Received:</span>
      <span>${formatCurrency(cashReceivedAmount)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold;">
      <span>Change:</span>
      <span>${formatCurrency(changeAmount)}</span>
    </div>`;
    }

    if (selectedPaymentMethod === 'cash_fonepay') {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Cash:</span>
      <span>${formatCurrency(cashReceivedAmount)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Fonepay:</span>
      <span>${formatCurrency(fonepayReceivedAmount)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold;">
      <span>Total Received:</span>
      <span>${formatCurrency(totalReceived)}</span>
    </div>`;
      if (changeAmount > 0) {
        billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold;">
      <span>Change:</span>
      <span>${formatCurrency(changeAmount)}</span>
    </div>`;
      }
    }

    billContent += `
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
    <DashboardLayout title="Cashier Billing">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Table Billing</h1>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Visual Table Selection */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2" />
                      Select Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tables.map((table: any) => {
                        const hasOrders = kotOrders.some((order: any) => 
                          order.tableId === table.id && 
                          order.status !== 'cancelled' && 
                          order.status !== 'served' &&
                          order.items?.some((item: any) => item.status === 'approved' || item.status === 'ready')
                        );
                        
                        return (
                          <button
                            key={table.id}
                            onClick={() => hasOrders && setSelectedTable(table.id)}
                            disabled={!hasOrders}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedTable === table.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                : hasOrders
                                ? 'border-gray-300 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900'
                            }`}
                            data-testid={`table-visual-${table.id}`}
                          >
                            <div className="text-center">
                              <div className="font-bold text-lg">{table.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Capacity: {table.capacity}
                              </div>
                              {hasOrders && (
                                <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                  Active Orders
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {selectedTable && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Items (Approved/Ready)</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                    <div key={idx} className="flex justify-between py-1" data-testid={`order-item-${idx}`}>
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
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Bill Summary & Payment */}
              <div className="space-y-6">
                {selectedTable && selectedTableOrders.length > 0 && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Bill Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="font-medium text-sm mb-2">Order Items</div>
                          {selectedTableOrders.map((order: any) => (
                            <div key={order.id} className="space-y-2">
                              {order.items?.map((item: any, idx: number) => {
                                if (item.status === 'approved' || item.status === 'ready') {
                                  const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
                                  if (!menuItem) return null;
                                  const quantity = orderItemQuantities[item.id] ?? item.qty;
                                  return (
                                    <div key={idx} className="flex items-center justify-between gap-2 py-1 border-b last:border-b-0" data-testid={`bill-item-${idx}`}>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">{menuItem.name}</div>
                                        <div className="text-xs text-muted-foreground">{formatCurrency(menuItem.price)} each</div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          min="0"
                                          max={item.qty}
                                          value={quantity}
                                          onChange={(e) => {
                                            const newQty = parseInt(e.target.value) || 0;
                                            if (newQty >= 0 && newQty <= item.qty) {
                                              setOrderItemQuantities(prev => ({
                                                ...prev,
                                                [item.id]: newQty
                                              }));
                                            }
                                          }}
                                          className="w-16 h-8 text-center"
                                          data-testid={`input-item-quantity-${idx}`}
                                        />
                                        <span className="text-sm text-muted-foreground">/ {item.qty}</span>
                                        <span className="text-sm font-medium min-w-[80px] text-right">
                                          {formatCurrency(menuItem.price * quantity)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          ))}
                        </div>

                        <div className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span data-testid="text-subtotal">{formatCurrency(billCalc.subtotal)}</span>
                          </div>
                          {Object.entries(billCalc.taxBreakdown).map(([taxType, details]: [string, any]) => (
                            <div key={taxType} className="flex justify-between text-sm">
                              <span>{taxType} ({details.rate}%):</span>
                              <span>{formatCurrency(details.amount)}</span>
                            </div>
                          ))}
                          {billCalc.discountAmount > 0 && appliedVoucher && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                              <span>Discount ({appliedVoucher.code}):</span>
                              <span>-{formatCurrency(billCalc.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total:</span>
                            <span data-testid="text-grand-total">{formatCurrency(billCalc.grandTotal)}</span>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 space-y-3">
                          <label className="text-sm font-medium text-foreground">
                            Discount Voucher (Optional)
                          </label>
                          {!appliedVoucher ? (
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Enter voucher code"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
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
                            <SelectTrigger className="w-full" data-testid="select-payment-method">
                              <SelectValue placeholder="Choose payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash" data-testid="payment-option-cash">
                                <div className="flex items-center">
                                  <Banknote className="h-4 w-4 mr-2" />
                                  Cash
                                </div>
                              </SelectItem>
                              <SelectItem value="fonepay" data-testid="payment-option-fonepay">
                                <div className="flex items-center">
                                  <Smartphone className="h-4 w-4 mr-2" />
                                  Fonepay
                                </div>
                              </SelectItem>
                              <SelectItem value="pos" data-testid="payment-option-pos">
                                <div className="flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  POS
                                </div>
                              </SelectItem>
                              <SelectItem value="cash_fonepay" data-testid="payment-option-cash-fonepay">
                                <div className="flex items-center">
                                  <Banknote className="h-4 w-4 mr-1" />
                                  <Smartphone className="h-4 w-4 mr-2" />
                                  Cash + Fonepay
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedPaymentMethod === 'cash' && (
                          <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20">
                            <Label className="text-sm font-medium">Cash Received</Label>
                            <Input
                              type="number"
                              placeholder="Enter cash amount"
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              step="0.01"
                              min={billCalc.grandTotal}
                              data-testid="input-cash-received"
                            />
                            {cashReceivedAmount >= billCalc.grandTotal && (
                              <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg">
                                <span className="font-medium text-green-900 dark:text-green-100">Change:</span>
                                <span className="text-xl font-bold text-green-700 dark:text-green-300" data-testid="text-change-amount">
                                  {formatCurrency(changeAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedPaymentMethod === 'cash_fonepay' && (
                          <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Cash Amount</Label>
                                <Input
                                  type="number"
                                  placeholder="Enter cash amount"
                                  value={cashReceived}
                                  onChange={(e) => setCashReceived(e.target.value)}
                                  step="0.01"
                                  min="0"
                                  data-testid="input-cash-amount-split"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Fonepay Amount</Label>
                                <Input
                                  type="number"
                                  placeholder="Enter fonepay amount"
                                  value={fonepayAmount}
                                  onChange={(e) => setFonepayAmount(e.target.value)}
                                  step="0.01"
                                  min="0"
                                  data-testid="input-fonepay-amount"
                                />
                              </div>
                              {(() => {
                                const tolerance = 0.01;
                                const difference = Math.abs(totalReceived - billCalc.grandTotal);
                                const isExactMatch = difference <= tolerance;
                                
                                if (totalReceived === 0) {
                                  return (
                                    <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg">
                                      <span className="font-medium">Total Received:</span>
                                      <span className="text-lg font-bold" data-testid="text-total-received">
                                        {formatCurrency(totalReceived)}
                                      </span>
                                    </div>
                                  );
                                }
                                
                                if (isExactMatch) {
                                  return (
                                    <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg">
                                      <span className="font-medium text-green-900 dark:text-green-100">✓ Total Received (Exact Match):</span>
                                      <span className="text-lg font-bold text-green-700 dark:text-green-300" data-testid="text-total-received">
                                        {formatCurrency(totalReceived)}
                                      </span>
                                    </div>
                                  );
                                }
                                
                                if (totalReceived < billCalc.grandTotal) {
                                  return (
                                    <>
                                      <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg">
                                        <span className="font-medium">Total Received:</span>
                                        <span className="text-lg font-bold" data-testid="text-total-received">
                                          {formatCurrency(totalReceived)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-lg">
                                        <span className="font-medium text-yellow-900 dark:text-yellow-100">Remaining:</span>
                                        <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300" data-testid="text-remaining-amount">
                                          {formatCurrency(billCalc.grandTotal - totalReceived)}
                                        </span>
                                      </div>
                                    </>
                                  );
                                }
                                
                                return (
                                  <>
                                    <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg">
                                      <span className="font-medium">Total Received:</span>
                                      <span className="text-lg font-bold" data-testid="text-total-received">
                                        {formatCurrency(totalReceived)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
                                      <span className="font-medium text-red-900 dark:text-red-100">Over by:</span>
                                      <span className="text-lg font-bold text-red-700 dark:text-red-300" data-testid="text-over-amount">
                                        {formatCurrency(totalReceived - billCalc.grandTotal)}
                                      </span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button className="flex-1" onClick={handlePrintBill} variant="outline" data-testid="button-print-bill">
                            <Printer className="h-4 w-4 mr-2" />
                            Print Bill
                          </Button>
                          <Button 
                            className="flex-1" 
                            onClick={handleProcessPayment}
                            disabled={!selectedPaymentMethod || createTransactionMutation.isPending}
                            data-testid="button-process-payment"
                          >
                            {selectedPaymentMethod === 'cash' && <Banknote className="h-4 w-4 mr-2" />}
                            {selectedPaymentMethod === 'pos' && <CreditCard className="h-4 w-4 mr-2" />}
                            {selectedPaymentMethod === 'fonepay' && <Smartphone className="h-4 w-4 mr-2" />}
                            {selectedPaymentMethod === 'cash_fonepay' && (
                              <>
                                <Banknote className="h-4 w-4 mr-1" />
                                <Smartphone className="h-4 w-4 mr-2" />
                              </>
                            )}
                            Process Payment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
