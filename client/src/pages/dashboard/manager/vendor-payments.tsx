import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Ban, Plus, DollarSign, Calendar, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Vendor {
  id: string;
  name: string;
  contact: any;
  hotelId: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  hotelId: string;
  txnType: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  vendorId: string | null;
  purpose: string;
  reference: string;
  createdBy: string;
  createdAt: string;
  deletedAt: string | null;
  isVoided: boolean;
  voidedBy: string | null;
  voidedAt: string | null;
  voidReason: string | null;
}

export default function VendorPayments() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [purpose, setPurpose] = useState("");
  const [reference, setReference] = useState("");

  const queryClient = useQueryClient();

  // Get current user and hotel info
  const { data: currentUser, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/user"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/user", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    }
  });

  // Fetch vendors for this hotel
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/hotels/current/vendors"],
    refetchInterval: 3000,
    enabled: !!currentUser?.hotelId,
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/vendors", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch vendors");
      return response.json();
    }
  });

  // Fetch vendor payments (transactions with vendorId)
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    enabled: !!currentUser?.hotelId,
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/transactions", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const allTransactions = await response.json();
      // Filter to only vendor payments
      return allTransactions.filter((t: Transaction) => t.vendorId && t.txnType === "vendor_payment");
    }
  });

  // Create payment mutation
  const createPayment = useMutation({
    mutationFn: async (paymentData: any) => {
      if (!currentUser?.hotelId || !currentUser?.id) {
        throw new Error("User information not available");
      }
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...paymentData,
          hotelId: currentUser.hotelId,
          txnType: "vendor_payment",
          createdBy: currentUser.id
        })
      });
      if (!response.ok) throw new Error("Failed to create payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast.success("Payment recorded successfully");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    }
  });

  // Void payment mutation
  const voidPayment = useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: string; reason: string }) => {
      const response = await fetch(`/api/transactions/${transactionId}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to void payment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast.success("Payment voided successfully");
      setShowVoidDialog(false);
      setVoidReason("");
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to void payment");
    }
  });

  const resetForm = () => {
    setVendorName("");
    setAmount("");
    setPaymentMethod("");
    setPurpose("");
    setReference("");
    setShowPaymentForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.hotelId || !currentUser?.id) {
      toast.error("Please wait for user information to load");
      return;
    }
    
    if (!vendorName.trim() || !amount || !paymentMethod || !purpose || !reference.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      // Find or create vendor
      let vendor = vendors.find(v => v.name.toLowerCase() === vendorName.trim().toLowerCase());
      
      if (!vendor) {
        // Create new vendor
        const createResponse = await fetch("/api/hotels/current/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: vendorName.trim(),
            contact: {}
          })
        });
        
        if (!createResponse.ok) {
          throw new Error("Failed to create vendor");
        }
        
        vendor = await createResponse.json();
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vendors"] });
      }

      if (!vendor) {
        throw new Error("Failed to get vendor information");
      }

      // Create payment with vendor ID
      createPayment.mutate({
        vendorId: vendor.id,
        amount: Number(amount).toFixed(2),
        currency: "NPR",
        paymentMethod,
        purpose,
        reference: reference.trim()
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to process payment");
    }
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || "Unknown Vendor";
  };

  const formatCurrency = (amount: string) => {
    return `NPR ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (userLoading || vendorsLoading || transactionsLoading) {
    return (
      <DashboardLayout title="Vendor Payments">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Vendor Payments">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Payments</h1>
          <p className="text-gray-600 mt-1">Manage payments to vendors and suppliers</p>
        </div>
        <Button 
          onClick={() => setShowPaymentForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2))}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">Registered vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record New Payment</CardTitle>
            <CardDescription>Enter payment details for vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor Name *</Label>
                  <Input
                    id="vendor"
                    placeholder="Enter vendor name"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Type vendor name (will be created if doesn't exist)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (NPR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="reference"
                    placeholder="Invoice/PO number, cheque number, etc."
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    data-testid="input-reference"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Textarea
                  id="purpose"
                  placeholder="Description of payment purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createPayment.isPending}>
                  {createPayment.isPending ? "Recording..." : "Record Payment"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent vendor payments</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vendor payments recorded yet</p>
              <p className="text-sm">Click "Record Payment" to add your first payment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{getVendorName(transaction.vendorId!)}</h3>
                      <Badge variant="outline" className="capitalize">
                        {transaction.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{transaction.purpose}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                    {transaction.reference && (
                      <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(transaction.amount)}</p>
                    {transaction.isVoided ? (
                      <Badge variant="destructive" className="mt-2">VOIDED</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowVoidDialog(true);
                        }}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        disabled={voidPayment.isPending}
                        data-testid={`button-void-${transaction.id}`}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Void Transaction Dialog */}
    <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
      <DialogContent data-testid="dialog-void-transaction">
        <DialogHeader>
          <DialogTitle>Void Payment Transaction</DialogTitle>
          <DialogDescription>
            Voiding a payment transaction is permanent and creates an audit trail. 
            Please provide a detailed reason (minimum 15 characters).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="void-reason">Reason for Voiding</Label>
            <Textarea
              id="void-reason"
              placeholder="e.g., Duplicate payment entry, incorrect amount, payment reversal requested..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              rows={4}
              data-testid="input-void-reason"
            />
            <p className="text-sm text-gray-500">
              {voidReason.length}/15 characters minimum
            </p>
          </div>
          {selectedTransaction && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-1">
              <p className="text-sm font-medium">Transaction Details:</p>
              <p className="text-sm text-gray-600">Amount: {formatCurrency(selectedTransaction.amount)}</p>
              <p className="text-sm text-gray-600">Vendor: {getVendorName(selectedTransaction.vendorId!)}</p>
              <p className="text-sm text-gray-600">Purpose: {selectedTransaction.purpose}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowVoidDialog(false);
              setVoidReason("");
              setSelectedTransaction(null);
            }}
            data-testid="button-cancel-void"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (selectedTransaction && voidReason.trim().length >= 15) {
                voidPayment.mutate({
                  transactionId: selectedTransaction.id,
                  reason: voidReason.trim()
                });
              }
            }}
            disabled={voidReason.trim().length < 15 || voidPayment.isPending}
            data-testid="button-confirm-void"
          >
            {voidPayment.isPending ? "Voiding..." : "Void Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </DashboardLayout>
  );
}