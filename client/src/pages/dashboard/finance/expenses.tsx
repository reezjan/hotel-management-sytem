import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Plus, TrendingDown, Building, Truck, Users, Wrench, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function FinanceExpensesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVendorPaymentModalOpen, setIsVendorPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    enabled: !!user?.hotelId
  });

  // Listen for real-time transaction updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    events: ['transaction:created', 'transaction:updated']
  });

  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vendors"],
    enabled: !!user?.hotelId
  });

  const vendorPaymentForm = useForm({
    defaultValues: {
      vendorName: "",
      amount: "",
      paymentMethod: "cash",
      chequeNumber: "",
      bankName: "",
      reference: ""
    }
  });

  const expenseForm = useForm({
    defaultValues: {
      category: "utilities",
      amount: "",
      paymentMethod: "cash",
      description: ""
    }
  });

  const createVendorPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      // Validate amount
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Validate cheque details if payment method is cheque
      if (data.paymentMethod === "cheque") {
        if (!data.chequeNumber || data.chequeNumber.trim() === "") {
          throw new Error("Cheque number is required");
        }
        if (!data.bankName || data.bankName.trim() === "") {
          throw new Error("Bank name is required for cheque payment");
        }
      }

      const details: any = {
        vendorName: data.vendorName,
        notes: data.reference || ""
      };

      if (data.paymentMethod === "cheque") {
        details.chequeNumber = data.chequeNumber.trim();
        details.bankName = data.bankName.trim();
      }

      await apiRequest("POST", "/api/transactions", {
        hotelId: user?.hotelId,
        txnType: "vendor_payment",
        amount: amount.toFixed(2),
        paymentMethod: data.paymentMethod,
        purpose: `Vendor Payment - ${data.vendorName}`,
        reference: data.reference,
        details,
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Vendor payment recorded successfully" });
      vendorPaymentForm.reset();
      setIsVendorPaymentModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to process vendor payment", 
        variant: "destructive" 
      });
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      await apiRequest("POST", "/api/transactions", {
        hotelId: user?.hotelId,
        txnType: "cash_out",
        amount: amount.toFixed(2),
        paymentMethod: data.paymentMethod,
        purpose: `${data.category} - ${data.description}`,
        reference: data.category,
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Expense recorded successfully" });
      expenseForm.reset();
      setIsExpenseModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to record expense", 
        variant: "destructive" 
      });
    }
  });

  // Filter expense transactions
  const expenseTransactions = transactions.filter(t => 
    t.txnType === 'cash_out' || t.txnType === 'vendor_payment' || t.txnType?.includes('_out')
  );

  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const vendorPayments = expenseTransactions.filter(t => t.txnType === 'vendor_payment');
  const otherExpenses = expenseTransactions.filter(t => t.txnType !== 'vendor_payment');
  
  const totalVendorPayments = vendorPayments.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalOtherExpenses = otherExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <DashboardLayout title="Expense Tracking">
      <div className="space-y-6">
        {/* Add Expense Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsExpenseModalOpen(true)}
            data-testid="button-add-expense"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Expenses</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalExpenses)}</p>
                  <p className="text-sm opacity-90 mt-1">{expenseTransactions.length} transactions</p>
                </div>
                <TrendingDown className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor Payments</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalVendorPayments)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{vendorPayments.length} payments</p>
                </div>
                <Truck className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Other Expenses</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOtherExpenses)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{otherExpenses.length} expenses</p>
                </div>
                <Building className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Expenses</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Payment Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No expenses recorded yet
                        </td>
                      </tr>
                    ) : (
                      expenseTransactions.slice(0, 20).map((expense) => (
                        <tr key={expense.id} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">{formatDate(expense.createdAt)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-block px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              {expense.txnType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-red-600">
                            {formatCurrency(Number(expense.amount))}
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">{expense.paymentMethod}</td>
                          <td className="px-4 py-3 text-sm">{expense.purpose || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Payment Modal */}
        <Dialog open={isVendorPaymentModalOpen} onOpenChange={setIsVendorPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Vendor Payment</DialogTitle>
            </DialogHeader>
            <Form {...vendorPaymentForm}>
              <form onSubmit={vendorPaymentForm.handleSubmit((data) => createVendorPaymentMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={vendorPaymentForm.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter vendor name" data-testid="input-vendor-name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={vendorPaymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-vendor-amount" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={vendorPaymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vendor-payment-method">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="pos">POS</SelectItem>
                          <SelectItem value="fonepay">Fonepay</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {vendorPaymentForm.watch("paymentMethod") === "cheque" && (
                  <>
                    <FormField
                      control={vendorPaymentForm.control}
                      name="chequeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cheque Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter cheque number" data-testid="input-cheque-number" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={vendorPaymentForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Which bank cheque issued from" data-testid="input-cheque-bank" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={vendorPaymentForm.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Invoice number or reference" data-testid="input-vendor-reference" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={createVendorPaymentMutation.isPending}>
                    {createVendorPaymentMutation.isPending ? "Processing..." : "Record Payment"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsVendorPaymentModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Expense Modal */}
        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="supplies">Supplies</SelectItem>
                          <SelectItem value="salaries">Salaries</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-expense-amount" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-expense-payment-method">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="pos">POS</SelectItem>
                          <SelectItem value="fonepay">Fonepay</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Expense description" rows={3} data-testid="input-expense-description" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={createExpenseMutation.isPending}>
                    {createExpenseMutation.isPending ? "Recording..." : "Record Expense"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsExpenseModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
