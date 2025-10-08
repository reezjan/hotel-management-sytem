import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Printer, CreditCard, Banknote, Smartphone, Plus, Minus, Trash2, History, Edit, Users, Split } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface PaymentEntry {
  id: string;
  paymentMethod: string;
  amount: number;
  reference?: string;
}

export default function CashierTableBilling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Table selection - support multiple tables
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  
  // Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  
  // Tip/Gratuity
  const [tipType, setTipType] = useState<"percentage" | "flat">("percentage");
  const [tipValue, setTipValue] = useState<number>(0);
  
  // Split bill
  const [splitMode, setSplitMode] = useState<"none" | "equal" | "custom">("none");
  const [splitCount, setSplitCount] = useState<number>(2);
  const [customSplits, setCustomSplits] = useState<{ name: string; amount: number }[]>([]);
  
  // Payment - support multiple partial payments
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState("");
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState("");
  const [currentPaymentReference, setCurrentPaymentReference] = useState("");
  
  // Amendment modal
  const [amendmentDialogOpen, setAmendmentDialogOpen] = useState(false);
  const [amendmentNote, setAmendmentNote] = useState("");
  const [selectedBillForAmendment, setSelectedBillForAmendment] = useState<any>(null);
  
  // History filters
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"]
  });

  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/restaurant-tables"],
  });

  const { data: kotOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/kot-orders"],
  });

  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"]
  });

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"]
  });

  // Fetch bill history
  const { data: billHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/bills", historyStartDate, historyEndDate, historyStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (historyStartDate) params.append("startDate", historyStartDate);
      if (historyEndDate) params.append("endDate", historyEndDate);
      if (historyStatus) params.append("status", historyStatus);
      
      const response = await fetch(`/api/hotels/current/bills?${params.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch bills");
      return response.json();
    }
  });

  const validateVoucherMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!code || code.trim().length === 0) {
        throw new Error("Please enter a voucher code");
      }
      const response = await apiRequest("POST", "/api/vouchers/validate", { code: code.trim() });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.valid && data.voucher) {
        setAppliedVoucher(data.voucher);
        const discountText = data.voucher.discountType === 'percentage' 
          ? `${data.voucher.discountAmount}% off`
          : `${formatCurrency(data.voucher.discountAmount)} off`;
        toast({ 
          title: "✓ Voucher Applied!", 
          description: `Code: ${data.voucher.code} - ${discountText}`,
        });
      } else {
        setAppliedVoucher(null);
        toast({ 
          title: "Invalid Voucher", 
          description: "Voucher code not found or expired", 
          variant: "destructive" 
        });
      }
    },
    onError: (error: any) => {
      setAppliedVoucher(null);
      toast({ 
        title: "Validation Error", 
        description: error?.message || "Unable to validate voucher", 
        variant: "destructive" 
      });
    }
  });

  const createBillMutation = useMutation({
    mutationFn: async (billData: any) => {
      return await apiRequest("POST", "/api/hotels/current/bills", billData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/bills"] });
      toast({ title: "Bill created and payment processed successfully" });
      
      // Reset form
      setSelectedTables([]);
      setAppliedVoucher(null);
      setVoucherCode("");
      setTipType("percentage");
      setTipValue(0);
      setSplitMode("none");
      setPayments([]);
      setCurrentPaymentMethod("");
      setCurrentPaymentAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const amendBillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/hotels/current/bills/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/bills"] });
      toast({ title: "Bill amended successfully" });
      setAmendmentDialogOpen(false);
      setAmendmentNote("");
      setSelectedBillForAmendment(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Toggle table selection
  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  // Filter orders from selected tables with approved/ready items
  const selectedTableOrders = kotOrders.filter(
    (order: any) => {
      if (!selectedTables.includes(order.tableId)) return false;
      if (order.status === 'cancelled' || order.status === 'served') return false;
      return order.items?.some((item: any) => item.status === 'approved' || item.status === 'ready');
    }
  );

  // Calculate bill with cascading taxes
  const calculateBill = () => {
    let subtotal = 0;
    const items: any[] = [];
    
    // Calculate subtotal from approved/ready items only
    selectedTableOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.status === 'approved' || item.status === 'ready') {
          const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
          if (menuItem) {
            subtotal += menuItem.price * item.qty;
            items.push({
              orderId: order.id,
              itemId: item.id,
              menuItemId: item.menuItemId,
              name: menuItem.name,
              qty: item.qty,
              price: menuItem.price,
              total: menuItem.price * item.qty
            });
          }
        }
      });
    });

    // Get active taxes and sort them
    const activeTaxes = hotelTaxes.filter((tax: any) => tax.isActive);
    const taxOrder = ['vat', 'service_tax', 'luxury_tax'];
    const sortedTaxes = activeTaxes.sort((a: any, b: any) => {
      const aIndex = taxOrder.indexOf(a.taxType);
      const bIndex = taxOrder.indexOf(b.taxType);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    // Apply cascading taxes
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
    
    // Apply voucher discount after taxes
    let discountAmount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.discountType === 'percentage') {
        discountAmount = Math.round((grandTotal * (parseFloat(appliedVoucher.discountAmount) / 100)) * 100) / 100;
      } else if (appliedVoucher.discountType === 'fixed') {
        discountAmount = Math.min(parseFloat(appliedVoucher.discountAmount), grandTotal);
      }
      grandTotal = Math.round((grandTotal - discountAmount) * 100) / 100;
    }

    // Calculate tip
    let tipAmount = 0;
    if (tipValue > 0) {
      if (tipType === "percentage") {
        tipAmount = Math.round((grandTotal * (tipValue / 100)) * 100) / 100;
      } else {
        tipAmount = Math.round(tipValue * 100) / 100;
      }
      grandTotal = Math.round((grandTotal + tipAmount) * 100) / 100;
    }

    return {
      subtotal,
      taxBreakdown,
      totalTax,
      discountAmount,
      tipAmount,
      grandTotal,
      items
    };
  };

  const billCalc = calculateBill();

  // Calculate total of payments entered
  const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = Math.max(0, billCalc.grandTotal - totalPaymentAmount);

  const handleAddPayment = () => {
    if (!currentPaymentMethod) {
      toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
      return;
    }
    
    const amount = parseFloat(currentPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid payment amount", variant: "destructive" });
      return;
    }

    if (amount > remainingAmount) {
      toast({ title: "Error", description: "Payment amount exceeds remaining balance", variant: "destructive" });
      return;
    }

    const newPayment: PaymentEntry = {
      id: Date.now().toString(),
      paymentMethod: currentPaymentMethod,
      amount,
      reference: currentPaymentReference || undefined
    };

    setPayments([...payments, newPayment]);
    setCurrentPaymentMethod("");
    setCurrentPaymentAmount("");
    setCurrentPaymentReference("");
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleApplyVoucher = () => {
    if (voucherCode.trim()) {
      validateVoucherMutation.mutate(voucherCode.trim());
    }
  };

  const handleProcessBill = async () => {
    if (selectedTables.length === 0) {
      toast({ title: "Error", description: "Please select at least one table", variant: "destructive" });
      return;
    }

    if (selectedTableOrders.length === 0) {
      toast({ title: "Error", description: "No orders to process", variant: "destructive" });
      return;
    }

    if (payments.length === 0) {
      toast({ title: "Error", description: "Please add at least one payment", variant: "destructive" });
      return;
    }

    if (Math.abs(remainingAmount) > 0.01) {
      toast({ title: "Error", description: "Total payments must equal the bill amount", variant: "destructive" });
      return;
    }

    // Prepare split details if applicable
    let splitDetails = null;
    if (splitMode === "equal") {
      const splitAmount = Math.round((billCalc.grandTotal / splitCount) * 100) / 100;
      splitDetails = {
        mode: "equal",
        count: splitCount,
        amountPerPerson: splitAmount
      };
    } else if (splitMode === "custom" && customSplits.length > 0) {
      splitDetails = {
        mode: "custom",
        splits: customSplits
      };
    }

    const billData = {
      tableIds: selectedTables,
      orderIds: selectedTableOrders.map((o: any) => o.id),
      subtotal: billCalc.subtotal.toString(),
      taxBreakdown: billCalc.taxBreakdown,
      totalTax: billCalc.totalTax.toString(),
      discount: billCalc.discountAmount.toString(),
      voucherId: appliedVoucher?.id || null,
      voucherCode: appliedVoucher?.code || null,
      tipType: tipValue > 0 ? tipType : null,
      tipValue: tipValue > 0 ? tipValue.toString() : "0",
      tipAmount: billCalc.tipAmount.toString(),
      grandTotal: billCalc.grandTotal.toString(),
      splitMode: splitMode !== "none" ? splitMode : null,
      splitDetails,
      items: billCalc.items,
      status: "final",
      payments: payments.map(p => ({
        paymentMethod: p.paymentMethod,
        amount: p.amount.toString(),
        reference: p.reference
      }))
    };

    createBillMutation.mutate(billData);
  };

  const handlePrintBill = (bill?: any) => {
    const billToPrint = bill || {
      billNumber: `PREVIEW-${Date.now().toString().slice(-6)}`,
      ...billCalc,
      tableNames: selectedTables.map(id => tables.find((t: any) => t.id === id)?.name).join(", "),
      createdAt: new Date().toISOString(),
      payments: payments
    };

    const hotelName = hotel?.name || "HOTEL";
    const hotelAddress = hotel?.address || "";
    const hotelPhone = hotel?.phone || "";
    const now = new Date(billToPrint.createdAt);
    
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
    ${billToPrint.tableNames || billToPrint.tableIds?.map((id: string) => tables.find((t: any) => t.id === id)?.name).join(", ")}
  </div>
  
  <div style="font-size: 11px; margin-bottom: 10px;">
    <div>Date: ${now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</div>
    <div>Time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
    <div>Bill No: ${billToPrint.billNumber}</div>
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
      <tbody>`;

    (billToPrint.items || []).forEach((item: any) => {
      billContent += `
        <tr>
          <td style="padding: 3px 0;">${item.name}</td>
          <td style="text-align: center;">${item.qty}</td>
          <td style="text-align: right;">${formatCurrency(item.total)}</td>
        </tr>`;
    });

    billContent += `
      </tbody>
    </table>
  </div>
  
  <div style="font-size: 11px; margin-top: 10px;">
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Subtotal:</span>
      <span>${formatCurrency(billToPrint.subtotal)}</span>
    </div>`;

    Object.entries(billToPrint.taxBreakdown || {}).forEach(([taxName, taxInfo]: [string, any]) => {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0; padding-left: 10px;">
      <span>${taxName} (${taxInfo.rate}%):</span>
      <span>${formatCurrency(taxInfo.amount)}</span>
    </div>`;
    });

    if (billToPrint.discountAmount > 0) {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0; color: green;">
      <span>Discount:</span>
      <span>-${formatCurrency(billToPrint.discountAmount)}</span>
    </div>`;
    }

    if (billToPrint.tipAmount > 0) {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Tip/Gratuity:</span>
      <span>${formatCurrency(billToPrint.tipAmount)}</span>
    </div>`;
    }

    billContent += `
    <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 5px; border-top: 2px solid #000; font-weight: bold; font-size: 13px;">
      <span>GRAND TOTAL:</span>
      <span>${formatCurrency(billToPrint.grandTotal)}</span>
    </div>
  </div>`;

    if (billToPrint.payments && billToPrint.payments.length > 0) {
      billContent += `
  <div style="font-size: 11px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px;">
    <div style="font-weight: bold; margin-bottom: 5px;">Payment Details:</div>`;
      
      billToPrint.payments.forEach((payment: any) => {
        const methodName = payment.paymentMethod === 'cash' ? 'Cash' :
                          payment.paymentMethod === 'pos' ? 'Card/POS' : 
                          payment.paymentMethod === 'fonepay' ? 'Fonepay' : payment.paymentMethod;
        billContent += `
    <div style="display: flex; justify-content: space-between; padding: 2px 0;">
      <span>${methodName}:</span>
      <span>${formatCurrency(payment.amount)}</span>
    </div>`;
      });

      billContent += `
  </div>`;
    }

    if (billToPrint.splitMode && billToPrint.splitDetails) {
      billContent += `
  <div style="font-size: 11px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px;">
    <div style="font-weight: bold; margin-bottom: 5px;">Split Bill:</div>`;
      
      if (billToPrint.splitMode === 'equal') {
        billContent += `
    <div>Split ${billToPrint.splitDetails.count} ways: ${formatCurrency(billToPrint.splitDetails.amountPerPerson)} each</div>`;
      } else if (billToPrint.splitMode === 'custom') {
        billToPrint.splitDetails.splits.forEach((split: any) => {
          billContent += `
    <div style="display: flex; justify-content: space-between; padding: 2px 0;">
      <span>${split.name}:</span>
      <span>${formatCurrency(split.amount)}</span>
    </div>`;
        });
      }

      billContent += `
  </div>`;
    }

    billContent += `
  
  <div style="text-align: center; font-size: 10px; margin-top: 15px; padding-top: 10px; border-top: 2px dashed #000;">
    Thank you for your visit!<br/>
    Please come again
  </div>
</div>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bill ${billToPrint.billNumber}</title>
          </head>
          <body>${billContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleAmendBill = () => {
    if (!selectedBillForAmendment) return;
    if (!amendmentNote.trim()) {
      toast({ title: "Error", description: "Please provide an amendment note", variant: "destructive" });
      return;
    }

    amendBillMutation.mutate({
      id: selectedBillForAmendment.id,
      data: {
        amendmentNote: amendmentNote.trim(),
        status: 'amended'
      }
    });
  };

  return (
    <DashboardLayout title="Table Billing">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Table Billing</h1>
        </div>

        <Tabs defaultValue="billing" className="w-full">
          <TabsList>
            <TabsTrigger value="billing" data-testid="tab-billing">
              <Receipt className="w-4 h-4 mr-2" />
              Create Bill
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              Bill History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Table Selection & Order Details */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Select Tables
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
                          <div
                            key={table.id}
                            className={`flex items-center space-x-2 p-3 rounded-lg border ${
                              selectedTables.includes(table.id) ? 'bg-blue-50 border-blue-500' : 'border-gray-200'
                            } ${!hasOrders ? 'opacity-50' : 'cursor-pointer hover:bg-gray-50'}`}
                            onClick={() => hasOrders && handleTableToggle(table.id)}
                            data-testid={`table-select-${table.id}`}
                          >
                            <Checkbox
                              checked={selectedTables.includes(table.id)}
                              disabled={!hasOrders}
                              onCheckedChange={() => hasOrders && handleTableToggle(table.id)}
                              data-testid={`checkbox-table-${table.id}`}
                            />
                            <div>
                              <div className="font-medium">{table.name}</div>
                              {hasOrders && <div className="text-xs text-green-600">Active Orders</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTableOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Select tables to view orders</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedTableOrders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-3">
                            <div className="font-medium text-sm mb-2">
                              Table: {tables.find((t: any) => t.id === order.tableId)?.name}
                            </div>
                            {order.items?.filter((item: any) => item.status === 'approved' || item.status === 'ready').map((item: any) => {
                              const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
                              if (!menuItem) return null;
                              return (
                                <div key={item.id} className="flex justify-between items-center text-sm py-1">
                                  <span>{menuItem.name}</span>
                                  <span>x{item.qty}</span>
                                  <span className="font-medium">{formatCurrency(menuItem.price * item.qty)}</span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Bill Details & Payment */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bill Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span data-testid="text-subtotal">{formatCurrency(billCalc.subtotal)}</span>
                      </div>
                      
                      {Object.entries(billCalc.taxBreakdown).map(([taxName, taxInfo]: [string, any]) => (
                        <div key={taxName} className="flex justify-between text-sm pl-4">
                          <span>{taxName} ({taxInfo.rate}%):</span>
                          <span>{formatCurrency(taxInfo.amount)}</span>
                        </div>
                      ))}

                      {billCalc.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span data-testid="text-discount">-{formatCurrency(billCalc.discountAmount)}</span>
                        </div>
                      )}

                      {/* Tip/Gratuity */}
                      <div className="border-t pt-3 mt-3">
                        <Label className="text-sm font-medium">Tip/Gratuity (Optional)</Label>
                        <div className="flex gap-2 mt-2">
                          <Select value={tipType} onValueChange={(val: any) => setTipType(val)}>
                            <SelectTrigger className="w-32" data-testid="select-tip-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="flat">Flat Amount</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder={tipType === "percentage" ? "%" : "Amount"}
                            value={tipValue}
                            onChange={(e) => setTipValue(parseFloat(e.target.value) || 0)}
                            className="flex-1"
                            data-testid="input-tip-value"
                          />
                        </div>
                        {billCalc.tipAmount > 0 && (
                          <div className="flex justify-between text-sm mt-2">
                            <span>Tip Amount:</span>
                            <span data-testid="text-tip-amount">{formatCurrency(billCalc.tipAmount)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                        <span>GRAND TOTAL:</span>
                        <span data-testid="text-grand-total">{formatCurrency(billCalc.grandTotal)}</span>
                      </div>
                    </div>

                    {/* Voucher */}
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium">Apply Voucher</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Voucher code"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          disabled={!!appliedVoucher}
                          data-testid="input-voucher-code"
                        />
                        <Button 
                          onClick={handleApplyVoucher}
                          disabled={validateVoucherMutation.isPending || !!appliedVoucher}
                          data-testid="button-apply-voucher"
                        >
                          Apply
                        </Button>
                        {appliedVoucher && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setAppliedVoucher(null);
                              setVoucherCode("");
                            }}
                            data-testid="button-remove-voucher"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Split Bill */}
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium flex items-center">
                        <Split className="w-4 h-4 mr-2" />
                        Split Bill
                      </Label>
                      <Select value={splitMode} onValueChange={(val: any) => setSplitMode(val)}>
                        <SelectTrigger className="mt-2" data-testid="select-split-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Split</SelectItem>
                          <SelectItem value="equal">Split Equally</SelectItem>
                          <SelectItem value="custom">Custom Split</SelectItem>
                        </SelectContent>
                      </Select>

                      {splitMode === "equal" && (
                        <div className="mt-2">
                          <Label className="text-xs">Number of people</Label>
                          <Input
                            type="number"
                            min="2"
                            value={splitCount}
                            onChange={(e) => setSplitCount(parseInt(e.target.value) || 2)}
                            data-testid="input-split-count"
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            {formatCurrency(billCalc.grandTotal / splitCount)} per person
                          </p>
                        </div>
                      )}

                      {splitMode === "custom" && (
                        <div className="mt-2 space-y-2">
                          {customSplits.map((split, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Name"
                                value={split.name}
                                onChange={(e) => {
                                  const newSplits = [...customSplits];
                                  newSplits[index].name = e.target.value;
                                  setCustomSplits(newSplits);
                                }}
                                className="flex-1"
                                data-testid={`input-split-name-${index}`}
                              />
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={split.amount}
                                onChange={(e) => {
                                  const newSplits = [...customSplits];
                                  newSplits[index].amount = parseFloat(e.target.value) || 0;
                                  setCustomSplits(newSplits);
                                }}
                                className="w-32"
                                data-testid={`input-split-amount-${index}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCustomSplits(customSplits.filter((_, i) => i !== index))}
                                data-testid={`button-remove-split-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCustomSplits([...customSplits, { name: "", amount: 0 }])}
                            data-testid="button-add-split"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Split
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Payment Form */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Payment Method</Label>
                        <Select value={currentPaymentMethod} onValueChange={setCurrentPaymentMethod}>
                          <SelectTrigger data-testid="select-payment-method">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="pos">Card/POS</SelectItem>
                            <SelectItem value="fonepay">Fonepay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Amount</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={currentPaymentAmount}
                          onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                          data-testid="input-payment-amount"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Reference (Optional)</Label>
                        <Input
                          placeholder="Transaction ref"
                          value={currentPaymentReference}
                          onChange={(e) => setCurrentPaymentReference(e.target.value)}
                          data-testid="input-payment-reference"
                        />
                      </div>

                      <Button 
                        onClick={handleAddPayment} 
                        className="w-full"
                        variant="outline"
                        data-testid="button-add-payment"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment
                      </Button>
                    </div>

                    {/* Payment List */}
                    {payments.length > 0 && (
                      <div className="border-t pt-4 space-y-2">
                        <Label className="text-sm font-medium">Payments Added:</Label>
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded" data-testid={`payment-entry-${payment.id}`}>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {payment.paymentMethod === 'cash' ? 'Cash' :
                                 payment.paymentMethod === 'pos' ? 'Card/POS' : 'Fonepay'}
                              </div>
                              <div className="text-xs text-gray-600">{formatCurrency(payment.amount)}</div>
                              {payment.reference && <div className="text-xs text-gray-500">Ref: {payment.reference}</div>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePayment(payment.id)}
                              data-testid={`button-remove-payment-${payment.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium pt-2 border-t">
                          <span>Total Paid:</span>
                          <span data-testid="text-total-paid">{formatCurrency(totalPaymentAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Remaining:</span>
                          <span className={remainingAmount > 0 ? 'text-red-600' : 'text-green-600'} data-testid="text-remaining">
                            {formatCurrency(remainingAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleProcessBill} 
                        disabled={createBillMutation.isPending || remainingAmount !== 0 || payments.length === 0}
                        className="flex-1"
                        data-testid="button-process-bill"
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Process Bill
                      </Button>
                      <Button 
                        onClick={() => handlePrintBill()} 
                        variant="outline"
                        data-testid="button-print-preview"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filter Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm">Start Date</Label>
                    <Input
                      type="date"
                      value={historyStartDate}
                      onChange={(e) => setHistoryStartDate(e.target.value)}
                      data-testid="input-history-start-date"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Date</Label>
                    <Input
                      type="date"
                      value={historyEndDate}
                      onChange={(e) => setHistoryEndDate(e.target.value)}
                      data-testid="input-history-end-date"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Status</Label>
                    <Select value={historyStatus} onValueChange={setHistoryStatus}>
                      <SelectTrigger data-testid="select-history-status">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="amended">Amended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setHistoryStartDate("");
                        setHistoryEndDate("");
                        setHistoryStatus("");
                      }}
                      variant="outline"
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bill History</CardTitle>
              </CardHeader>
              <CardContent>
                {billHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No bills found</p>
                ) : (
                  <div className="space-y-3">
                    {billHistory.map((bill: any) => (
                      <div key={bill.id} className="border rounded-lg p-4" data-testid={`bill-history-${bill.id}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{bill.billNumber}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(bill.createdAt).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Tables: {bill.tableIds?.map((id: string) => 
                                tables.find((t: any) => t.id === id)?.name
                              ).join(", ")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(parseFloat(bill.grandTotal))}</div>
                            <div className={`text-xs px-2 py-1 rounded ${
                              bill.status === 'final' ? 'bg-green-100 text-green-700' :
                              bill.status === 'amended' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                            }`}>
                              {bill.status}
                            </div>
                          </div>
                        </div>

                        {bill.amendmentNote && (
                          <div className="text-xs bg-yellow-50 p-2 rounded mb-2">
                            <strong>Amendment:</strong> {bill.amendmentNote}
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintBill(bill)}
                            data-testid={`button-print-bill-${bill.id}`}
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Print
                          </Button>
                          {(user?.role?.name === 'manager' || user?.role?.name === 'owner') && bill.status === 'final' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBillForAmendment(bill);
                                setAmendmentDialogOpen(true);
                              }}
                              data-testid={`button-amend-bill-${bill.id}`}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Amend
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Amendment Dialog */}
        <Dialog open={amendmentDialogOpen} onOpenChange={setAmendmentDialogOpen}>
          <DialogContent data-testid="dialog-amendment">
            <DialogHeader>
              <DialogTitle>Amend Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bill Number</Label>
                <Input value={selectedBillForAmendment?.billNumber || ""} disabled />
              </div>
              <div>
                <Label>Amendment Note (Required)</Label>
                <Textarea
                  placeholder="Explain why this bill is being amended..."
                  value={amendmentNote}
                  onChange={(e) => setAmendmentNote(e.target.value)}
                  rows={4}
                  data-testid="textarea-amendment-note"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAmendmentDialogOpen(false);
                  setAmendmentNote("");
                  setSelectedBillForAmendment(null);
                }}
                data-testid="button-cancel-amendment"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAmendBill}
                disabled={!amendmentNote.trim() || amendBillMutation.isPending}
                data-testid="button-confirm-amendment"
              >
                Confirm Amendment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
