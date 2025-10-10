import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Receipt, ShoppingCart, Plus, Minus, CreditCard, DollarSign, Smartphone, Printer, Wrench, Banknote, AlertCircle, CheckCircle2, Clock, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

export default function CashierDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [customerType, setCustomerType] = useState<"inhouse" | "walkin">("inhouse");
  const [isCashDepositModalOpen, setIsCashDepositModalOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<any[]>([]);

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"]
  });

  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"]
  });

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"]
  });

  const { data: halls = [] } = useQuery<any[]>({
    queryKey: ["/api/halls"]
  });

  const { data: pools = [] } = useQuery<any[]>({
    queryKey: ["/api/pools"]
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/services"]
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "tasks"]
  });

  const cashDepositForm = useForm({
    defaultValues: {
      amount: "",
      description: ""
    }
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

  const cashDepositMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.hotelId) {
        throw new Error("User not associated with a hotel");
      }
      
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      
      const result = await apiRequest("POST", "/api/transactions", {
        hotelId: user.hotelId,
        txnType: "cash_deposit_request",
        amount: amount.toFixed(2),
        purpose: `Cash Deposit Request: ${data.description}`,
        reference: `Cashier: ${user.username}`,
        paymentMethod: "cash",
        createdBy: user.id
      });
      return result;
    },
    onSuccess: () => {
      toast({ 
        title: "Success!", 
        description: "Cash deposit request sent to Finance department",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setIsCashDepositModalOpen(false);
      cashDepositForm.reset();
    },
    onError: (error: any) => {
      console.error("Cash deposit error:", error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to submit cash deposit request. Please check the amount and try again.", 
        variant: "destructive" 
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "tasks"] });
      toast({ title: "Task updated successfully" });
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
          variant: "default"
        });
      } else {
        setAppliedVoucher(null);
        const errorMessage = data.message || "Voucher code not found or expired";
        toast({ 
          title: "Invalid Voucher", 
          description: `${errorMessage}. Please check the code and try again. Vouchers must be created by Manager first.`, 
          variant: "destructive" 
        });
      }
    },
    onError: (error: any) => {
      console.error("Voucher validation error:", error);
      setAppliedVoucher(null);
      toast({ 
        title: "Validation Error", 
        description: error?.message || "Unable to validate voucher. Please ensure the voucher exists in the system.", 
        variant: "destructive" 
      });
    }
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { low: 0, medium: 1, high: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  const pendingTasks = sortedTasks.filter(t => t.status === 'pending');
  const performingTasks = sortedTasks.filter(t => t.status === 'performing');
  const completedTasks = sortedTasks.filter(t => t.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <CheckCircle2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const calculateTaxBreakdown = (subtotalWithTax: number, discount: number = 0) => {
    const activeTaxes = hotelTaxes.filter((tax: any) => tax.isActive);
    
    let totalTaxRate = 0;
    activeTaxes.forEach((tax: any) => {
      totalTaxRate += parseFloat(tax.percent) / 100;
    });

    const basePrice = Math.round((subtotalWithTax / (1 + totalTaxRate)) * 100) / 100;
    const discountedBase = Math.max(0, Math.round((basePrice - discount) * 100) / 100);
    
    const taxBreakdown: any = {};
    let totalTax = 0;
    activeTaxes.forEach((tax: any) => {
      const taxRate = parseFloat(tax.percent) / 100;
      const taxAmount = Math.round((discountedBase * taxRate) * 100) / 100;
      taxBreakdown[tax.taxType] = {
        rate: parseFloat(tax.percent),
        amount: taxAmount
      };
      totalTax += taxAmount;
    });

    const grandTotal = Math.round((discountedBase + totalTax) * 100) / 100;

    return {
      basePrice: Math.round(basePrice * 100) / 100,
      discountedBase: Math.round(discountedBase * 100) / 100,
      taxBreakdown,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal
    };
  };

  const addToOrder = (menuItem: any) => {
    const existingItem = currentOrder.find(item => item.id === menuItem.id);
    if (existingItem) {
      setCurrentOrder(prev =>
        prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCurrentOrder(prev => [...prev, { ...menuItem, quantity: 1 }]);
    }
  };

  const addAmenity = (amenity: any, type: string) => {
    const price = customerType === 'inhouse' ? amenity.priceInhouse : amenity.priceWalkin;
    const existingItem = selectedAmenities.find(item => item.id === amenity.id);
    
    if (!existingItem) {
      setSelectedAmenities(prev => [...prev, {
        ...amenity,
        type,
        price,
        quantity: 1
      }]);
    }
  };

  const removeFromOrder = (menuItemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== menuItemId));
  };

  const removeAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => prev.filter(item => item.id !== amenityId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(menuItemId);
      return;
    }
    setCurrentOrder(prev =>
      prev.map(item =>
        item.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const calculateSubtotal = () => {
    const menuTotal = currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
    const amenitiesTotal = selectedAmenities.reduce((total, item) => total + (item.price * item.quantity), 0);
    return menuTotal + amenitiesTotal;
  };

  const calculateFinalBill = () => {
    const subtotalWithTax = calculateSubtotal();
    
    let discount = 0;
    if (appliedVoucher) {
      const discountAmount = parseFloat(appliedVoucher.discountAmount);
      if (appliedVoucher.discountType === 'percentage') {
        // Calculate percentage discount from base amount (before taxes)
        const activeTaxes = hotelTaxes.filter((tax: any) => tax.isActive);
        let totalTaxRate = 0;
        activeTaxes.forEach((tax: any) => {
          totalTaxRate += parseFloat(tax.percent) / 100;
        });
        const basePrice = Math.round((subtotalWithTax / (1 + totalTaxRate)) * 100) / 100;
        discount = Math.round((basePrice * discountAmount / 100) * 100) / 100;
      } else {
        // Fixed amount discount
        discount = Math.round(discountAmount * 100) / 100;
      }
    }

    const taxCalc = calculateTaxBreakdown(subtotalWithTax, discount);

    return {
      ...taxCalc,
      discount
    };
  };

  const handleApplyVoucher = () => {
    if (voucherCode.trim()) {
      validateVoucherMutation.mutate(voucherCode.trim());
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
      return;
    }

    const billCalc = calculateFinalBill();
    
    try {
      await createTransactionMutation.mutateAsync({
        txnType: selectedPaymentMethod === 'cash' ? 'cash_in' : selectedPaymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
        amount: billCalc.grandTotal.toString(),
        paymentMethod: selectedPaymentMethod,
        purpose: customerType === 'inhouse' ? 'restaurant_sale' : 'walk_in_sale',
        reference: appliedVoucher ? `Voucher: ${appliedVoucher.code}` : undefined
      });

      if (appliedVoucher) {
        try {
          await apiRequest("POST", "/api/vouchers/redeem", {
            voucherId: appliedVoucher.id
          });
        } catch (error) {
          toast({ title: "Warning", description: "Transaction successful but voucher redemption failed", variant: "destructive" });
        }
      }

      handlePrintBill();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process payment", variant: "destructive" });
    }
  };

  const handlePrintBill = () => {
    const billCalc = calculateFinalBill();
    const hotelName = hotel?.name || "HOTEL";
    const hotelAddress = hotel?.address || "";
    const hotelPhone = hotel?.phone || "";
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
    ${customerType === 'walkin' ? 'WALK-IN CUSTOMER' : 'IN-HOUSE GUEST'}
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

    currentOrder.forEach(item => {
      billContent += `
        <tr>
          <td style="padding: 3px 0;">${item.name}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`;
    });

    selectedAmenities.forEach(item => {
      billContent += `
        <tr>
          <td style="padding: 3px 0;">${item.name} (${item.type})</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`;
    });

    billContent += `
      </tbody>
    </table>
  </div>
  
  <div style="font-size: 11px; margin-top: 10px;">
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Subtotal (Excl. Tax):</span>
      <span>${formatCurrency(billCalc.basePrice)}</span>
    </div>
`;

    Object.entries(billCalc.taxBreakdown).forEach(([taxType, details]: [string, any]) => {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>${taxType} (${details.rate}%):</span>
      <span>${formatCurrency(details.amount)}</span>
    </div>`;
    });

    if (billCalc.discount > 0) {
      billContent += `
    <div style="display: flex; justify-content: space-between; padding: 3px 0; color: green;">
      <span>Discount (${appliedVoucher?.code}):</span>
      <span>- ${formatCurrency(billCalc.discount)}</span>
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

    setIsBillingModalOpen(false);
    setCurrentOrder([]);
    setSelectedAmenities([]);
    setSelectedPaymentMethod("");
    setAppliedVoucher(null);
    setVoucherCode("");
  };

  const handleTaskStatusUpdate = (task: any, newStatus: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  return (
    <DashboardLayout title="Cashier Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<Clock />}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="In Progress"
            value={performingTasks.length}
            icon={<ShoppingCart />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Completed"
            value={completedTasks.length}
            icon={<CheckCircle2 />}
            iconColor="text-green-500"
          />
          <Button 
            className="h-full min-h-[100px]" 
            onClick={() => setIsBillingModalOpen(true)}
            size="lg"
          >
            <Receipt className="h-6 w-6 mr-2" />
            New Checkout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks (Priority Order)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No tasks assigned</p>
                ) : (
                  sortedTasks.map((task) => (
                    <div key={task.id} className={`flex items-center justify-between p-4 border-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getPriorityIcon(task.priority)}
                          <h4 className="font-semibold">{task.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90">{task.description}</p>
                        <Badge variant="secondary" className="text-xs mt-2">
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskStatusUpdate(task, 'performing')}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'performing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskStatusUpdate(task, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16"
                  onClick={() => setLocation('/hall-bookings')}
                  data-testid="button-hall-bookings"
                >
                  <Building2 className="h-5 w-5 mr-3" />
                  View Hall Bookings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16"
                  onClick={() => setIsCashDepositModalOpen(true)}
                >
                  <Banknote className="h-5 w-5 mr-3" />
                  Request Cash Deposit to Finance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16"
                  onClick={() => setLocation('/cashier/maintenance')}
                  data-testid="button-maintenance"
                >
                  <Wrench className="h-5 w-5 mr-3" />
                  Report Maintenance Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isCashDepositModalOpen} onOpenChange={setIsCashDepositModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Cash Deposit to Finance</DialogTitle>
            </DialogHeader>
            <Form {...cashDepositForm}>
              <form onSubmit={cashDepositForm.handleSubmit((data) => cashDepositMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={cashDepositForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (NPR)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" min="0.01" placeholder="Enter amount" required />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={cashDepositForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Reason for deposit" required />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={cashDepositMutation.isPending}>
                  {cashDepositMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isBillingModalOpen} onOpenChange={setIsBillingModalOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto p-3 sm:p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl">Checkout & Billing</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col gap-4">
              {/* Customer Type Selector - Mobile Optimized */}
              <div className="w-full">
                <Select value={customerType} onValueChange={(value: any) => setCustomerType(value)}>
                  <SelectTrigger className="w-full sm:w-64 h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inhouse" className="text-base">In-House Guest</SelectItem>
                    <SelectItem value="walkin" className="text-base">Walk-In Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items Selection - Mobile Optimized */}
              <Tabs defaultValue="menu" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="menu" className="text-sm sm:text-base">Menu Items</TabsTrigger>
                  <TabsTrigger value="amenities" className="text-sm sm:text-base">Amenities</TabsTrigger>
                </TabsList>
                
                <TabsContent value="menu" className="space-y-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto mt-3">
                  {menuItems.filter(item => item.active).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 touch-manipulation">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <Button size="lg" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" onClick={() => addToOrder(item)}>
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="amenities" className="space-y-3 max-h-[200px] sm:max-h-[300px] overflow-y-auto mt-3">
                  {halls.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Halls</h4>
                      {halls.map((hall) => (
                        <div key={hall.id} className="flex items-center justify-between p-3 border rounded-lg touch-manipulation">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm truncate">{hall.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {customerType === 'inhouse' ? formatCurrency(hall.priceInhouse) : formatCurrency(hall.priceWalkin)}
                            </p>
                          </div>
                          <Button size="lg" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" onClick={() => addAmenity(hall, 'Hall')}>
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(pools.length > 0 || services.length > 0) && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Pools & Services</h4>
                      {pools.map((pool) => (
                        <div key={pool.id} className="flex items-center justify-between p-3 border rounded-lg touch-manipulation">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm truncate">{pool.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {customerType === 'inhouse' ? formatCurrency(pool.priceInhouse) : formatCurrency(pool.priceWalkin)}
                            </p>
                          </div>
                          <Button size="lg" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" onClick={() => addAmenity(pool, 'Pool')}>
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg touch-manipulation">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm truncate">{service.name} ({service.kind})</p>
                            <p className="text-xs text-muted-foreground">
                              {customerType === 'inhouse' ? formatCurrency(service.priceInhouse) : formatCurrency(service.priceWalkin)}
                            </p>
                          </div>
                          <Button size="lg" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" onClick={() => addAmenity(service, service.kind)}>
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Current Order - Mobile Optimized */}
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Current Order</h4>
                {currentOrder.length === 0 && selectedAmenities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No items added yet</p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {currentOrder.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1 font-medium text-sm min-w-0 truncate">{item.name}</span>
                        <div className="flex items-center gap-1 sm:gap-2 justify-between sm:justify-end">
                          <Button size="sm" className="h-8 w-8 sm:h-9 sm:w-9" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="w-6 sm:w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <Button size="sm" className="h-8 w-8 sm:h-9 sm:w-9" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="w-16 sm:w-20 text-right text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                          <Button size="sm" className="h-8 w-8 sm:h-9 sm:w-9" variant="destructive" onClick={() => removeFromOrder(item.id)}>×</Button>
                        </div>
                      </div>
                    ))}
                    {selectedAmenities.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1 font-medium text-sm min-w-0 truncate">{item.name} ({item.type})</span>
                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <span className="w-20 text-right text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                          <Button size="sm" className="h-8 w-8 sm:h-9 sm:w-9" variant="destructive" onClick={() => removeAmenity(item.id)}>×</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bill Summary - Mobile Optimized */}
              <Card className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Bill Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(() => {
                    const bill = calculateFinalBill();
                    return (
                      <>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Subtotal (Excl. Tax):</span>
                          <span className="font-semibold">{formatCurrency(bill.basePrice)}</span>
                        </div>
                        {Object.entries(bill.taxBreakdown).map(([taxType, details]: [string, any]) => (
                          <div key={taxType} className="flex justify-between text-xs sm:text-sm">
                            <span>{taxType} ({details.rate}%):</span>
                            <span className="font-semibold">{formatCurrency(details.amount)}</span>
                          </div>
                        ))}
                        {bill.discount > 0 && (
                          <div className="flex justify-between text-xs sm:text-sm text-green-600">
                            <span>Discount:</span>
                            <span className="font-semibold">- {formatCurrency(bill.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
                          <span>GRAND TOTAL:</span>
                          <span>{formatCurrency(bill.grandTotal)}</span>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Voucher Section - Mobile Optimized */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">Voucher Code (Optional)</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter voucher code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="h-12 text-base"
                  />
                  <Button 
                    onClick={handleApplyVoucher} 
                    disabled={validateVoucherMutation.isPending || !voucherCode.trim()}
                    className="h-12 px-6 shrink-0"
                  >
                    {validateVoucherMutation.isPending ? "..." : "Apply"}
                  </Button>
                </div>
                {appliedVoucher && (
                  <p className="text-xs sm:text-sm text-green-600">
                    ✓ Voucher "{appliedVoucher.code}" applied: -{formatCurrency(appliedVoucher.discountAmount)}
                  </p>
                )}
              </div>

              {/* Payment Method - Mobile Optimized */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm sm:text-base">Payment Method</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                    className="h-12 justify-start text-base"
                    onClick={() => setSelectedPaymentMethod('cash')}
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Cash
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === 'pos' ? 'default' : 'outline'}
                    className="h-12 justify-start text-base"
                    onClick={() => setSelectedPaymentMethod('pos')}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    POS/Card
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === 'fonepay' ? 'default' : 'outline'}
                    className="h-12 justify-start text-base"
                    onClick={() => setSelectedPaymentMethod('fonepay')}
                  >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Fonepay
                  </Button>
                </div>
              </div>

              {/* Checkout Button - Mobile Optimized */}
              <Button
                className="w-full h-14 text-base sm:text-lg"
                size="lg"
                onClick={handleProcessPayment}
                disabled={createTransactionMutation.isPending || (currentOrder.length === 0 && selectedAmenities.length === 0) || !selectedPaymentMethod}
              >
                <Printer className="h-5 w-5 mr-2" />
                {createTransactionMutation.isPending ? "Processing..." : "Checkout & Print Bill"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
