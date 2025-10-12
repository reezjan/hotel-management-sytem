import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { DollarSign, TrendingUp, TrendingDown, Receipt, CreditCard, Smartphone, Building, CheckCircle, XCircle, Landmark, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction, MaintenanceRequest, Vendor } from "@shared/schema";

export default function FinanceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [isBankDepositModalOpen, setIsBankDepositModalOpen] = useState(false);
  const [isVendorPaymentModalOpen, setIsVendorPaymentModalOpen] = useState(false);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const bankDepositForm = useForm({
    defaultValues: {
      amount: "",
      bankName: "",
      notes: ""
    }
  });

  const vendorPaymentForm = useForm({
    defaultValues: {
      vendorId: "",
      amount: "",
      paymentMethod: "",
      chequeNumber: "",
      bankName: "",
      notes: ""
    }
  });

  const addVendorForm = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: ""
    }
  });

  const addExpenseForm = useForm({
    defaultValues: {
      category: "utilities",
      amount: "",
      paymentMethod: "cash",
      chequeNumber: "",
      bankName: "",
      description: ""
    }
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
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

  // Listen for real-time user updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000,
    events: ['user:created', 'user:updated']
  });

  // Listen for real-time maintenance updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    refetchInterval: 3000,
    events: ['maintenance:updated', 'maintenance:created']
  });

  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/hotels/current/vendors"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  // Filter cash deposit requests (cash_deposit_request transactions)
  const cashDepositRequests = transactions.filter(t => 
    t.txnType === 'cash_deposit_request'
  );

  const pendingCashDeposits = cashDepositRequests.filter(t => !t.reference?.includes('APPROVED') && !t.reference?.includes('REJECTED'));

  const approveCashDepositMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) throw new Error("Transaction not found");
      
      const currentDetails = transaction.details as Record<string, any> || {};
      await apiRequest("PUT", `/api/transactions/${transactionId}`, {
        reference: `${transaction.reference || ''} - APPROVED by ${user?.username}`,
        details: { ...currentDetails, approvedBy: user?.username, approvedAt: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Cash deposit request approved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve cash deposit request", variant: "destructive" });
    }
  });

  const rejectCashDepositMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) throw new Error("Transaction not found");
      
      const currentDetails = transaction.details as Record<string, any> || {};
      await apiRequest("PUT", `/api/transactions/${transactionId}`, {
        reference: `${transaction.reference || ''} - REJECTED by ${user?.username}`,
        details: { ...currentDetails, rejectedBy: user?.username, rejectedAt: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Cash deposit request rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject cash deposit request", variant: "destructive" });
    }
  });

  const bankDepositMutation = useMutation({
    mutationFn: async (data: any) => {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      if (!data.bankName || data.bankName.trim() === "") {
        throw new Error("Bank name is required");
      }

      await apiRequest("POST", "/api/transactions", {
        hotelId: user?.hotelId,
        txnType: "bank_deposit",
        amount: amount.toFixed(2),
        paymentMethod: "cash",
        purpose: "Cash deposited to bank",
        reference: `Deposited by ${user?.username}`,
        details: {
          bankName: data.bankName.trim(),
          notes: data.notes || "",
          depositedBy: user?.username,
          depositedAt: new Date().toISOString()
        },
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Success", description: "Cash deposited to bank successfully" });
      bankDepositForm.reset();
      setIsBankDepositModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to deposit cash to bank", 
        variant: "destructive" 
      });
    }
  });

  const vendorPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      if (!data.vendorId) {
        throw new Error("Please select a vendor");
      }
      if (!data.paymentMethod) {
        throw new Error("Please select a payment method");
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

      const vendor = vendors.find(v => v.id === data.vendorId);
      const details: any = {
        vendorId: data.vendorId,
        vendorName: vendor?.name || "Unknown",
        notes: data.notes || "",
        paidBy: user?.username
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
        purpose: `Payment to ${vendor?.name || 'vendor'}`,
        reference: `Paid by ${user?.username}`,
        details,
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Success", description: "Vendor payment processed successfully" });
      vendorPaymentForm.reset();
      setIsVendorPaymentModalOpen(false);
      setSelectedVendor(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to process vendor payment", 
        variant: "destructive" 
      });
    }
  });

  const addVendorMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!data.name || data.name.trim() === "") {
        throw new Error("Vendor name is required");
      }

      const contact: any = {};
      if (data.phone) contact.phone = data.phone.trim();
      if (data.email) contact.email = data.email.trim();
      if (data.address) contact.address = data.address.trim();

      await apiRequest("POST", "/api/hotels/current/vendors", {
        hotelId: user?.hotelId,
        name: data.name.trim(),
        contact
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vendors"] });
      toast({ title: "Success", description: "Vendor added successfully" });
      addVendorForm.reset();
      setIsAddVendorModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add vendor", 
        variant: "destructive" 
      });
    }
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
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

      const details: any = {};
      if (data.paymentMethod === "cheque") {
        details.chequeNumber = data.chequeNumber.trim();
        details.bankName = data.bankName.trim();
      }

      await apiRequest("POST", "/api/transactions", {
        hotelId: user?.hotelId,
        txnType: "cash_out",
        amount: amount.toFixed(2),
        paymentMethod: data.paymentMethod,
        purpose: `${data.category} - ${data.description}`,
        reference: data.category,
        details,
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Success", description: "Expense recorded successfully" });
      addExpenseForm.reset();
      setIsAddExpenseModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to record expense", 
        variant: "destructive" 
      });
    }
  });

  // Calculate financial totals - separate revenue (income) from expenses
  // Exclude cash_deposit_request as it's a transfer, not revenue or expense
  const revenueTransactions = transactions.filter(t => 
    t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in' || 
    t.txnType === 'revenue' || (t.txnType && t.txnType.includes('_in'))
  );
  
  const expenseTransactions = transactions.filter(t => 
    (t.txnType === 'cash_out' || t.txnType === 'vendor_payment' || 
    (t.txnType && t.txnType.includes('_out'))) && 
    t.txnType !== 'cash_deposit_request'
  );

  // Revenue by payment method (only count income transactions)
  const cashRevenue = revenueTransactions
    .filter(t => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const posRevenue = revenueTransactions
    .filter(t => t.paymentMethod === 'pos')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const fonepayRevenue = revenueTransactions
    .filter(t => t.paymentMethod === 'fonepay')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netRevenue = totalRevenue - totalExpenses;
  
  // Calculate profit margin
  const profitMargin = totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100) : 0;

  // For display purposes - all transactions by payment method (including expenses)
  const allCashTransactions = transactions.filter(t => t.paymentMethod === 'cash');
  const allPosTransactions = transactions.filter(t => t.paymentMethod === 'pos');
  const allFonepayTransactions = transactions.filter(t => t.paymentMethod === 'fonepay');

  // Calculate vendor payments specifically if needed for separate display
  const vendorPayments = transactions.filter(t => t.txnType === 'vendor_payment');
  const totalVendorPayments = vendorPayments.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Bank balance tracking: POS + Fonepay revenue goes to bank
  // When cash is deposited to bank, it's deducted from cash and added to bank
  const bankDeposits = transactions.filter(t => t.txnType === 'bank_deposit');
  const totalBankDeposits = bankDeposits.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  // Bank Balance = POS Revenue + Fonepay Revenue + Cash Deposits to Bank
  const bankBalance = posRevenue + fonepayRevenue + totalBankDeposits;
  
  // Cash Balance = Cash Revenue - Cash Deposits to Bank
  const cashBalance = cashRevenue - totalBankDeposits;

  const maintenanceColumns = [
    { key: "description", label: "Request", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { 
      key: "reportedBy", 
      label: "Raised By", 
      render: (value: any, row: any) => {
        if (typeof value === 'object' && value?.username) {
          return value.username;
        }
        return "Unknown";
      }
    },
    { key: "status", label: "Status", sortable: true },
    { key: "createdAt", label: "Date", sortable: true }
  ];

  const transactionColumns = [
    { key: "txnType", label: "Type", sortable: true },
    { key: "amount", label: "Amount", sortable: true, render: (value: number) => formatCurrency(value) },
    { key: "paymentMethod", label: "Method", sortable: true },
    { 
      key: "purpose", 
      label: "Purpose", 
      sortable: true,
      render: (value: string, row: any) => {
        if (row.purpose === 'room_checkout_payment' && row.details) {
          return (
            <div className="space-y-1">
              <div className="font-medium">{value}</div>
              <div className="text-xs text-muted-foreground">
                Room {row.details.roomNumber} - {row.details.guestName}
                {row.details.numberOfDays && ` (${row.details.numberOfDays} day${row.details.numberOfDays > 1 ? 's' : ''})`}
              </div>
            </div>
          );
        }
        return value;
      }
    },
    { 
      key: "details", 
      label: "Details", 
      render: (value: any, row: any) => {
        if (row.txnType === 'cash_deposit_request') {
          if (row.reference?.includes('APPROVED')) {
            return (
              <Badge className="bg-green-600 text-white" data-testid={`status-approved-${row.id}`}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            );
          } else if (row.reference?.includes('REJECTED')) {
            return (
              <Badge variant="destructive" data-testid={`status-rejected-${row.id}`}>
                <XCircle className="h-3 w-3 mr-1" />
                Rejected
              </Badge>
            );
          } else {
            return (
              <Badge variant="secondary" data-testid={`status-pending-${row.id}`}>
                Pending
              </Badge>
            );
          }
        }
        if (row.purpose === 'room_checkout_payment' && value) {
          return (
            <div className="text-xs space-y-1">
              {value.roomCharges > 0 && (
                <div className="text-muted-foreground">Room: {formatCurrency(value.roomCharges)}</div>
              )}
              {value.mealPlanCharges > 0 && (
                <div className="text-muted-foreground">Meals: {formatCurrency(value.mealPlanCharges)}</div>
              )}
              {value.foodCharges > 0 && (
                <div className="text-muted-foreground">Food: {formatCurrency(value.foodCharges)}</div>
              )}
              {value.totalTax > 0 && (
                <div className="text-muted-foreground">Tax: {formatCurrency(value.totalTax)}</div>
              )}
              {value.discountAmount > 0 && (
                <div className="text-green-600">Discount: -{formatCurrency(value.discountAmount)}</div>
              )}
            </div>
          );
        }
        return '-';
      }
    },
    { key: "createdAt", label: "Date", sortable: true }
  ];

  const vendorColumns = [
    { key: "name", label: "Vendor Name", sortable: true },
    { 
      key: "contact", 
      label: "Contact", 
      render: (value: any) => {
        if (typeof value === 'object' && value?.phone) {
          return value.phone;
        }
        return "N/A";
      }
    },
    { key: "createdAt", label: "Added", sortable: true }
  ];

  const expenseColumns = [
    { key: "purpose", label: "Expense", sortable: true },
    { key: "amount", label: "Amount", sortable: true, render: (value: number) => formatCurrency(value) },
    { key: "paymentMethod", label: "Payment Method", sortable: true },
    { key: "createdAt", label: "Date", sortable: true }
  ];

  const vendorActions = [
    { 
      label: "Pay", 
      action: (row: any) => {
        setSelectedVendor(row);
        vendorPaymentForm.setValue("vendorId", row.id);
        setIsVendorPaymentModalOpen(true);
      }
    }
  ];

  const expenseActions: any[] = [];

  // Filter expenses (cash_out transactions)
  const expenses = transactions.filter(t => t.txnType === 'cash_out' || t.txnType === 'vendor_payment');

  const isLoading = transactionsLoading || maintenanceLoading || vendorsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Finance Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading financial data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Finance Dashboard">
      <div className="space-y-6">
        {/* Financial Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign />}
            iconColor="text-green-500"
            trend={{ value: revenueTransactions.length, label: "transactions", isPositive: true }}
          />
          <StatsCard
            title="Net Revenue"
            value={formatCurrency(netRevenue)}
            icon={<TrendingUp />}
            iconColor="text-blue-500"
            trend={{ value: Number(profitMargin.toFixed(1)), label: "profit margin", isPositive: profitMargin > 0 }}
          />
          <StatsCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<TrendingDown />}
            iconColor="text-red-500"
            trend={{ value: expenseTransactions.length, label: "transactions", isPositive: false }}
          />
          <StatsCard
            title="Pending Cash Deposits"
            value={pendingCashDeposits.length}
            icon={<Receipt />}
            iconColor="text-orange-500"
          />
        </div>

        {/* Bank Balance Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Balance & Cash Flow</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Bank balance includes POS + Fonepay revenue. Cash deposits to bank are deducted from cash.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Balance */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-lg border-2 border-blue-200 dark:border-blue-800" data-testid="balance-bank">
                <div className="flex items-center justify-between mb-4">
                  <Landmark className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Bank Balance</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(bankBalance)}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">POS Revenue:</span>
                    <span className="font-medium">{formatCurrency(posRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fonepay Revenue:</span>
                    <span className="font-medium">{formatCurrency(fonepayRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cash Deposits:</span>
                    <span className="font-medium">{formatCurrency(totalBankDeposits)}</span>
                  </div>
                </div>
              </div>

              {/* Cash Balance */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800" data-testid="balance-cash">
                <div className="flex items-center justify-between mb-4">
                  <Receipt className="h-12 w-12 text-green-600 dark:text-green-400" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cash on Hand</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(cashBalance)}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-green-200 dark:border-green-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cash Revenue:</span>
                    <span className="font-medium">{formatCurrency(cashRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposited to Bank:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(totalBankDeposits)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposits Count:</span>
                    <span className="font-medium">{bankDeposits.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg" data-testid="revenue-cash">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-foreground">Cash Revenue</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(cashRevenue)}</p>
                <p className="text-sm text-muted-foreground">{allCashTransactions.length} total transactions</p>
              </div>
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg" data-testid="revenue-pos">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-foreground">POS Revenue</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(posRevenue)}</p>
                <p className="text-sm text-muted-foreground">{allPosTransactions.length} total transactions</p>
              </div>
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg" data-testid="revenue-fonepay">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-foreground">Fonepay Revenue</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(fonepayRevenue)}</p>
                <p className="text-sm text-muted-foreground">{allFonepayTransactions.length} total transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <DataTable
          title="Maintenance Requests from Departments"
          data={maintenanceRequests}
          columns={maintenanceColumns}
          searchPlaceholder="Search maintenance requests..."
        />

        {/* Recent Transactions */}
        <DataTable
          title="Recent Transactions"
          data={transactions.slice(0, 20)}
          columns={transactionColumns}
          searchPlaceholder="Search transactions..."
        />

        {/* Expense Tracking */}
        <DataTable
          title="Expense Tracking"
          data={expenses}
          columns={expenseColumns}
          actions={expenseActions}
          onAdd={() => setIsAddExpenseModalOpen(true)}
          addButtonLabel="Add Expense"
          searchPlaceholder="Search expenses..."
        />

        {/* Vendor Management */}
        <DataTable
          title="Vendor Management"
          data={vendors}
          columns={vendorColumns}
          actions={vendorActions}
          onAdd={() => setIsAddVendorModalOpen(true)}
          addButtonLabel="Add Vendor"
          searchPlaceholder="Search vendors..."
        />

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="summary-revenue">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                <div className="text-sm text-green-700">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg" data-testid="summary-expenses">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
                <div className="text-sm text-red-700">Total Expenses</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="summary-profit">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(netRevenue)}</div>
                <div className="text-sm text-blue-700">Net Profit</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="summary-margin">
                <div className="text-2xl font-bold text-purple-600">
                  {totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-purple-700">Profit Margin</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Deposit Requests */}
        {pendingCashDeposits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Cash Deposit Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingCashDeposits.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Receipt className="h-4 w-4 text-orange-600" />
                        <h4 className="font-semibold text-foreground">{request.purpose}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.reference}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                          {formatCurrency(Number(request.amount))}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(request.createdAt || '').toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => approveCashDepositMutation.mutate(request.id)}
                        disabled={approveCashDepositMutation.isPending}
                        data-testid={`button-approve-${request.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => rejectCashDepositMutation.mutate(request.id)}
                        disabled={rejectCashDepositMutation.isPending}
                        data-testid={`button-reject-${request.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cash Flow Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg" data-testid="cashflow-inflow">
                <div className="flex items-center">
                  <TrendingUp className="text-green-500 mr-3 h-6 w-6" />
                  <div>
                    <h4 className="font-medium text-foreground">Cash Inflow</h4>
                    <p className="text-sm text-muted-foreground">Revenue from all sources</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-green-700">{revenueTransactions.length} transactions</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg" data-testid="cashflow-outflow">
                <div className="flex items-center">
                  <TrendingDown className="text-red-500 mr-3 h-6 w-6" />
                  <div>
                    <h4 className="font-medium text-foreground">Cash Outflow</h4>
                    <p className="text-sm text-muted-foreground">Expenses and vendor payments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                  <p className="text-sm text-red-700">{expenseTransactions.length} transactions</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg" data-testid="cashflow-net">
                <div className="flex items-center">
                  <DollarSign className="text-blue-500 mr-3 h-6 w-6" />
                  <div>
                    <h4 className="font-medium text-foreground">Net Cash Flow</h4>
                    <p className="text-sm text-muted-foreground">Inflow minus outflow</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(netRevenue)}</p>
                  <p className="text-sm text-blue-700">Profit margin: {totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Deposit Modal */}
        <Dialog open={isBankDepositModalOpen} onOpenChange={setIsBankDepositModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Deposit Cash to Bank</DialogTitle>
            </DialogHeader>
            
            <Form {...bankDepositForm}>
              <form onSubmit={bankDepositForm.handleSubmit((data) => bankDepositMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={bankDepositForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-bank-amount" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bankDepositForm.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter bank name" data-testid="input-bank-name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bankDepositForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes..." rows={2} data-testid="textarea-bank-notes" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={bankDepositMutation.isPending}
                    data-testid="button-submit-bank-deposit"
                  >
                    {bankDepositMutation.isPending ? "Processing..." : "Deposit to Bank"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsBankDepositModalOpen(false)}
                    data-testid="button-cancel-bank-deposit"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Vendor Payment Modal */}
        <Dialog open={isVendorPaymentModalOpen} onOpenChange={setIsVendorPaymentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Vendor Payment</DialogTitle>
            </DialogHeader>
            
            <Form {...vendorPaymentForm}>
              <form onSubmit={vendorPaymentForm.handleSubmit((data) => vendorPaymentMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={vendorPaymentForm.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vendor">
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-method">
                            <SelectValue placeholder="Select payment method" />
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes..." rows={2} data-testid="textarea-vendor-notes" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={vendorPaymentMutation.isPending}
                    data-testid="button-submit-vendor-payment"
                  >
                    {vendorPaymentMutation.isPending ? "Processing..." : "Process Payment"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setIsVendorPaymentModalOpen(false);
                      setSelectedVendor(null);
                    }}
                    data-testid="button-cancel-vendor-payment"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Vendor Modal */}
        <Dialog open={isAddVendorModalOpen} onOpenChange={setIsAddVendorModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            
            <Form {...addVendorForm}>
              <form onSubmit={addVendorForm.handleSubmit((data) => addVendorMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={addVendorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter vendor name" data-testid="input-vendor-name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addVendorForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone number" data-testid="input-vendor-phone" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addVendorForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" data-testid="input-vendor-email" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addVendorForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter address" rows={2} data-testid="textarea-vendor-address" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={addVendorMutation.isPending}
                    data-testid="button-submit-add-vendor"
                  >
                    {addVendorMutation.isPending ? "Adding..." : "Add Vendor"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsAddVendorModalOpen(false)}
                    data-testid="button-cancel-add-vendor"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Expense Modal */}
        <Dialog open={isAddExpenseModalOpen} onOpenChange={setIsAddExpenseModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            
            <Form {...addExpenseForm}>
              <form onSubmit={addExpenseForm.handleSubmit((data) => addExpenseMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={addExpenseForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-expense-category">
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
                  control={addExpenseForm.control}
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
                  control={addExpenseForm.control}
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
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="pos">POS</SelectItem>
                          <SelectItem value="fonepay">Fonepay</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                {addExpenseForm.watch("paymentMethod") === "cheque" && (
                  <>
                    <FormField
                      control={addExpenseForm.control}
                      name="chequeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cheque Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter cheque number" data-testid="input-expense-cheque-number" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addExpenseForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Which bank cheque issued from" data-testid="input-expense-cheque-bank" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <FormField
                  control={addExpenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Expense description" rows={3} data-testid="textarea-expense-description" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={addExpenseMutation.isPending}
                    data-testid="button-submit-add-expense"
                  >
                    {addExpenseMutation.isPending ? "Recording..." : "Record Expense"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsAddExpenseModalOpen(false)}
                    data-testid="button-cancel-add-expense"
                  >
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
