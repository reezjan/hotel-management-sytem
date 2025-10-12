import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Download, Plus, Filter, DollarSign, CreditCard, Smartphone, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function FinanceTransactionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  // Listen for real-time transaction updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    events: ['transaction:created', 'transaction:updated']
  });

  const transactionForm = useForm({
    defaultValues: {
      txnType: "cash_in",
      amount: "",
      paymentMethod: "cash",
      purpose: "",
      reference: ""
    }
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/transactions", {
        hotelId: user?.hotelId,
        txnType: data.txnType,
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        purpose: data.purpose,
        reference: data.reference,
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Transaction created successfully" });
      transactionForm.reset();
      setIsAddTransactionModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create transaction", variant: "destructive" });
    }
  });

  const onSubmitTransaction = (data: any) => {
    createTransactionMutation.mutate(data);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filterType === "all" || t.txnType === filterType;
    const paymentMatch = filterPaymentMethod === "all" || t.paymentMethod === filterPaymentMethod;
    return typeMatch && paymentMatch;
  });

  // Calculate totals
  const cashInTransactions = filteredTransactions.filter(t => 
    t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in' || t.txnType?.includes('_in')
  );
  const cashOutTransactions = filteredTransactions.filter(t => 
    t.txnType === 'cash_out' || t.txnType === 'vendor_payment' || t.txnType?.includes('_out')
  );

  const totalCashIn = cashInTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalCashOut = cashOutTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netCashFlow = totalCashIn - totalCashOut;

  // Payment method breakdown
  const cashTransactions = filteredTransactions.filter(t => t.paymentMethod === 'cash');
  const posTransactions = filteredTransactions.filter(t => t.paymentMethod === 'pos');
  const fonepayTransactions = filteredTransactions.filter(t => t.paymentMethod === 'fonepay');

  const totalCash = cashTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPos = posTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalFonepay = fonepayTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Payment Method', 'Purpose', 'Reference'],
      ...filteredTransactions.map(t => [
        formatDate(t.createdAt),
        t.txnType,
        t.amount,
        t.paymentMethod,
        t.purpose || '',
        t.reference || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Transactions exported successfully" });
  };

  return (
    <DashboardLayout title="Transaction Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cash In</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCashIn)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cashInTransactions.length} transactions</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cash Out</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCashOut)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cashOutTransactions.length} transactions</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netCashFlow)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Current balance</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Filtered results</p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cash</p>
                    <p className="text-xl font-bold">{formatCurrency(totalCash)}</p>
                    <p className="text-xs text-muted-foreground">{cashTransactions.length} transactions</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">POS</p>
                    <p className="text-xl font-bold">{formatCurrency(totalPos)}</p>
                    <p className="text-xs text-muted-foreground">{posTransactions.length} transactions</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fonepay</p>
                    <p className="text-xl font-bold">{formatCurrency(totalFonepay)}</p>
                    <p className="text-xs text-muted-foreground">{fonepayTransactions.length} transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>All Transactions</CardTitle>
              <div className="flex gap-2">
                <Button onClick={exportTransactions} variant="outline" data-testid="button-export">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={() => setIsAddTransactionModalOpen(true)} data-testid="button-add-transaction">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Transaction Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger data-testid="filter-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cash_in">Cash In</SelectItem>
                    <SelectItem value="cash_out">Cash Out</SelectItem>
                    <SelectItem value="pos_in">POS In</SelectItem>
                    <SelectItem value="fonepay_in">Fonepay In</SelectItem>
                    <SelectItem value="vendor_payment">Vendor Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                  <SelectTrigger data-testid="filter-payment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                    <SelectItem value="fonepay">Fonepay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger data-testid="filter-date">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions Table */}
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
                      <th className="px-4 py-3 text-left text-sm font-medium">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">{formatDate(transaction.createdAt)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              transaction.txnType?.includes('_in') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {transaction.txnType}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium ${
                            transaction.txnType?.includes('_in') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(Number(transaction.amount))}
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">{transaction.paymentMethod}</td>
                          <td className="px-4 py-3 text-sm">{transaction.purpose || '-'}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{transaction.reference || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Transaction Modal */}
        <Dialog open={isAddTransactionModalOpen} onOpenChange={setIsAddTransactionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            
            <Form {...transactionForm}>
              <form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)} className="space-y-4">
                <FormField
                  control={transactionForm.control}
                  name="txnType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="input-txn-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash_in">Cash In</SelectItem>
                          <SelectItem value="cash_out">Cash Out</SelectItem>
                          <SelectItem value="pos_in">POS In</SelectItem>
                          <SelectItem value="fonepay_in">Fonepay In</SelectItem>
                          <SelectItem value="vendor_payment">Vendor Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-amount" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="input-payment-method">
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
                  control={transactionForm.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Transaction purpose" data-testid="input-purpose" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Reference number or note" data-testid="input-reference" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={createTransactionMutation.isPending} data-testid="button-submit">
                    {createTransactionMutation.isPending ? "Creating..." : "Create Transaction"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddTransactionModalOpen(false)}>
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
