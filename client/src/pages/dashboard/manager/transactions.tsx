import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Receipt, Plus, Filter, CreditCard, Banknote, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/use-websocket";

interface Transaction {
  id: string;
  hotelId: string;
  amount: string;
  paymentMethod: string;
  txnType: string;
  purpose?: string;
  createdBy: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    paymentMethod: "",
    txnType: "",
    purpose: ""
  });

  const queryClient = useQueryClient();
  const ws = useWebSocket();

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/transactions", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    }
  });

  // Real-time updates via WebSocket
  useEffect(() => {
    const unsubscribers = [
      ws.on('transaction:created', () => {
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      }),
      ws.on('transaction:updated', () => {
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws, queryClient]);

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...transactionData,
          amount: parseFloat(transactionData.amount)
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create transaction");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      setIsCreateDialogOpen(false);
      setNewTransaction({ amount: "", paymentMethod: "", txnType: "", purpose: "" });
      toast.success("Transaction recorded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record transaction");
    }
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const methodMatch = filterMethod === "all" || transaction.paymentMethod === filterMethod;
    const typeMatch = filterType === "all" || transaction.txnType === filterType;
    return methodMatch && typeMatch;
  });

  // Calculate totals
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const cashTotal = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + Number(t.amount), 0);
  const posTotal = transactions.filter(t => t.paymentMethod === 'pos').reduce((sum, t) => sum + Number(t.amount), 0);
  const fonepayTotal = transactions.filter(t => t.paymentMethod === 'fonepay').reduce((sum, t) => sum + Number(t.amount), 0);

  const transactionColumns = [
    { 
      key: "amount", 
      label: "Amount", 
      sortable: true,
      render: (value: string) => `रु${Number(value).toLocaleString()}`
    },
    { 
      key: "paymentMethod", 
      label: "Payment Method", 
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {value === 'cash' && <Banknote className="h-4 w-4 text-green-500" />}
          {value === 'pos' && <CreditCard className="h-4 w-4 text-blue-500" />}
          {value === 'fonepay' && <Smartphone className="h-4 w-4 text-purple-500" />}
          <span className="capitalize">{value}</span>
        </div>
      )
    },
    { 
      key: "txnType", 
      label: "Type", 
      sortable: true,
      render: (value: string) => (
        <span className="capitalize">{value.replace(/_/g, ' ')}</span>
      )
    },
    { key: "purpose", label: "Purpose", sortable: true },
    { 
      key: "createdAt", 
      label: "Date", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString()
    }
  ];

  const handleCreateTransaction = () => {
    if (!newTransaction.amount || !newTransaction.paymentMethod || !newTransaction.txnType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isNaN(Number(newTransaction.amount)) || Number(newTransaction.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createTransactionMutation.mutate(newTransaction);
  };

  const resetForm = () => {
    setNewTransaction({ amount: "", paymentMethod: "", txnType: "", purpose: "" });
  };

  return (
    <DashboardLayout title="Transaction Management">
      <div className="space-y-6">
        {/* Transaction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">रु{totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{filteredTransactions.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
              <Banknote className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">रु{cashTotal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.paymentMethod === 'cash').length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">POS Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">रु{posTotal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.paymentMethod === 'pos').length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fonepay Payments</CardTitle>
              <Smartphone className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">रु{fonepayTotal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.paymentMethod === 'fonepay').length} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Create Button */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="filter-method">Payment Method</Label>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="w-[180px]">
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

              <div className="space-y-2">
                <Label htmlFor="filter-type">Transaction Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="room_booking">Room Booking</SelectItem>
                    <SelectItem value="restaurant_order">Restaurant Order</SelectItem>
                    <SelectItem value="vendor_payment">Vendor Payment</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Record Transaction
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <DataTable
          title="All Transactions"
          data={filteredTransactions}
          columns={transactionColumns}
          searchPlaceholder="Search transactions..."
          isLoading={isLoading}
        />

        {/* Create Transaction Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Transaction</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select 
                  value={newTransaction.paymentMethod} 
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                    <SelectItem value="fonepay">Fonepay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="txnType">Transaction Type *</Label>
                <Select 
                  value={newTransaction.txnType} 
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, txnType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room_booking">Room Booking</SelectItem>
                    <SelectItem value="restaurant_order">Restaurant Order</SelectItem>
                    <SelectItem value="vendor_payment">Vendor Payment</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose/Description</Label>
                <Input
                  id="purpose"
                  placeholder="Optional description"
                  value={newTransaction.purpose}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCreateTransaction}
                  disabled={createTransactionMutation.isPending}
                  className="flex-1"
                >
                  {createTransactionMutation.isPending ? "Recording..." : "Record Transaction"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}