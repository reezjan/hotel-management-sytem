import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  CalendarIcon, 
  FileText, 
  DollarSign, 
  Users, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  Activity,
  Shield,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Eye,
  Image as ImageIcon,
  FilePlus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Ban
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function AuditTransparencyPage() {
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [activeTab, setActiveTab] = useState("overview");

  // Financial Tab States
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterTxnType, setFilterTxnType] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [viewBillUrl, setViewBillUrl] = useState<string>("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  // Quick filter handlers
  const setToday = () => {
    const today = new Date();
    setDateRange({ from: startOfDay(today), to: endOfDay(today) });
  };

  const setLast7Days = () => {
    const today = new Date();
    setDateRange({ from: startOfDay(subDays(today, 7)), to: endOfDay(today) });
  };

  const setLast30Days = () => {
    const today = new Date();
    setDateRange({ from: startOfDay(subDays(today, 30)), to: endOfDay(today) });
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  // Export handler
  const handleExport = (type: 'csv' | 'pdf') => {
    console.log(`Exporting as ${type}`);
  };

  // Financial Activity - Use financial overview logic (real-time)
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"]
  });

  // Maintenance Approvals - Use maintenance requests logic (real-time)
  const { data: maintenanceRequests = [], isLoading: loadingMaintenance } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  // Real-time updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    events: ['transaction:created', 'transaction:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    events: ['maintenance:updated']
  });

  // Filter transactions by date if range is selected
  const filteredTransactions = dateRange.from && dateRange.to 
    ? transactions.filter(t => {
        const txnDate = new Date(t.createdAt);
        return txnDate >= dateRange.from! && txnDate <= dateRange.to!;
      })
    : transactions;

  // Filter maintenance by date if range is selected
  const filteredMaintenance = dateRange.from && dateRange.to
    ? maintenanceRequests.filter(m => {
        const reqDate = new Date(m.createdAt);
        return reqDate >= dateRange.from! && reqDate <= dateRange.to!;
      })
    : maintenanceRequests;

  const buildQueryUrl = (baseUrl: string, from?: Date, to?: Date) => {
    if (!from || !to) return baseUrl;
    const params = new URLSearchParams({
      startDate: from.toISOString(),
      endDate: to.toISOString()
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const { data: auditLogs = [], isLoading: loadingAuditLogs } = useQuery({
    queryKey: ['/api/audit-logs', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/audit-logs', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000
  });

  const { data: priceChangeLogs = [], isLoading: loadingPriceChanges } = useQuery({
    queryKey: ['/api/price-change-logs', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/price-change-logs', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000
  });

  const { data: inventoryMovements = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['/api/inventory-movement-logs', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/inventory-movement-logs', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000
  });

  const { data: staffActivity = [], isLoading: loadingStaffActivity } = useQuery({
    queryKey: ['/api/staff-activity-summary', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/staff-activity-summary', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000
  });

  // Calculate stats for Overview Dashboard
  const today = new Date();
  const todayTransactions = transactions.filter(t => {
    const txnDate = new Date(t.createdAt);
    return txnDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayTransactions
    .filter(t => t.txnType === 'revenue' || t.txnType?.includes('_in'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const todayExpenses = todayTransactions
    .filter(t => t.txnType === 'expense' || t.txnType?.includes('_out'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const activeStaffCount = new Set(staffActivity.map((s: any) => s.userId)).size;

  const pendingApprovalsCount = maintenanceRequests.filter(
    (m: any) => m.status === 'pending'
  ).length;

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const securityAlertsCount = auditLogs.filter((log: any) => {
    const logDate = new Date(log.createdAt);
    return logDate >= last24Hours && !log.success;
  }).length;

  const cashInOutRatio = todayRevenue > 0 ? (todayRevenue / (todayExpenses || 1)).toFixed(2) : '0.00';

  // Recent activity timeline (last 10 activities from audit logs)
  const recentActivities = auditLogs.slice(0, 10);

  // Financial Tab Calculations
  const totalRevenue = useMemo(() => {
    return filteredTransactions
      .filter(t => t.txnType === 'revenue' || t.txnType?.includes('_in'))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.txnType === 'expense' || t.txnType?.includes('_out'))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  }, [filteredTransactions]);

  const netProfitLoss = totalRevenue - totalExpenses;

  const largestTransaction = useMemo(() => {
    if (filteredTransactions.length === 0) return null;
    return filteredTransactions.reduce((max, t) => 
      parseFloat(t.amount || 0) > parseFloat(max.amount || 0) ? t : max
    , filteredTransactions[0]);
  }, [filteredTransactions]);

  const voidedTransactionsCount = useMemo(() => {
    return filteredTransactions.filter(t => t.isVoided).length;
  }, [filteredTransactions]);

  // Payment method breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const breakdown = {
      cash: 0,
      pos: 0,
      fonepay: 0,
      other: 0
    };
    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.amount || 0);
      const method = t.paymentMethod?.toLowerCase() || 'other';
      if (method === 'cash') breakdown.cash += amount;
      else if (method === 'pos') breakdown.pos += amount;
      else if (method === 'fonepay') breakdown.fonepay += amount;
      else breakdown.other += amount;
    });
    return breakdown;
  }, [filteredTransactions]);

  const totalPayments = paymentMethodBreakdown.cash + paymentMethodBreakdown.pos + 
                        paymentMethodBreakdown.fonepay + paymentMethodBreakdown.other;

  // Flagged transactions
  const flaggedTransactions = useMemo(() => {
    const threshold = 50000; // Large transaction threshold
    return {
      large: filteredTransactions.filter(t => parseFloat(t.amount || 0) >= threshold),
      noBillProof: filteredTransactions.filter(t => 
        t.txnType?.includes('_out') && !t.billPhotoUrl && !t.billPdfUrl
      ),
      voided: filteredTransactions.filter(t => t.isVoided),
      requiresApproval: filteredTransactions.filter(t => t.requiresApproval && !t.approvedBy)
    };
  }, [filteredTransactions]);

  // Sorting and filtering for transactions table
  const processedTransactions = useMemo(() => {
    let result = [...filteredTransactions];

    // Filter by transaction type
    if (filterTxnType !== 'all') {
      result = result.filter(t => t.txnType === filterTxnType);
    }

    // Filter by payment method
    if (filterPaymentMethod !== 'all') {
      result = result.filter(t => t.paymentMethod?.toLowerCase() === filterPaymentMethod.toLowerCase());
    }

    // Filter by staff
    if (filterStaff !== 'all') {
      result = result.filter(t => t.createdBy === filterStaff);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.purpose?.toLowerCase().includes(query) ||
        t.reference?.toLowerCase().includes(query) ||
        t.creator?.username?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount') {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      } else if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [filteredTransactions, filterTxnType, filterPaymentMethod, filterStaff, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);
  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique values for filters
  const uniqueTxnTypes = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.txnType))).filter(Boolean);
  }, [transactions]);

  const uniquePaymentMethods = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.paymentMethod))).filter(Boolean);
  }, [transactions]);

  const uniqueStaff = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.creator).filter(Boolean)));
  }, [transactions]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const viewTransactionDetails = (txn: any) => {
    setSelectedTransaction(txn);
    setShowTransactionModal(true);
  };

  const viewBill = (url: string) => {
    setViewBillUrl(url);
    setShowBillModal(true);
  };

  const isLoading = loadingTransactions || loadingMaintenance || loadingAuditLogs || 
                    loadingPriceChanges || loadingInventory || loadingStaffActivity;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/owner")}
              data-testid="button-back"
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" data-testid="heading-audit-transparency">
                Audit & Transparency Center
              </h1>
              <p className="text-muted-foreground mt-1">Complete oversight of all hotel operations and financial activities</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-date-range" className="min-w-[240px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" data-testid="button-export">
                  <Download className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleExport('csv')}
                    data-testid="button-export-csv"
                    className="justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleExport('pdf')}
                    data-testid="button-export-pdf"
                    className="justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={dateRange.from && dateRange.to && 
                    dateRange.from.toDateString() === startOfDay(new Date()).toDateString() ? "default" : "outline"} 
            size="sm" 
            onClick={setToday}
            data-testid="button-filter-today"
          >
            <Clock className="mr-2 h-3 w-3" />
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setLast7Days}
            data-testid="button-filter-7days"
          >
            Last 7 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setLast30Days}
            data-testid="button-filter-30days"
          >
            Last 30 Days
          </Button>
          {(dateRange.from || dateRange.to) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearDateRange}
              data-testid="button-filter-clear"
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {/* Tab-based Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="overview" data-testid="tab-overview" className="flex items-center gap-2 py-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financial" data-testid="tab-financial" className="flex items-center gap-2 py-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="staff" data-testid="tab-staff" className="flex items-center gap-2 py-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="photos" data-testid="tab-photos" className="flex items-center gap-2 py-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Photos</span>
          </TabsTrigger>
          <TabsTrigger value="location" data-testid="tab-location" className="flex items-center gap-2 py-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Transactions Today */}
            <Card data-testid="card-total-transactions" className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-total-transactions">
                      {todayTransactions.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Active today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Revenue Today */}
            <Card data-testid="card-total-revenue" className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-total-revenue">
                      {formatCurrency(todayRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cash in today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Expenses Today */}
            <Card data-testid="card-total-expenses" className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses Today</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-total-expenses">
                      {formatCurrency(todayExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cash out today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Active Staff Count */}
            <Card data-testid="card-active-staff" className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-active-staff">
                      {activeStaffCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Performed actions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card data-testid="card-pending-approvals" className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-pending-approvals">
                      {pendingApprovalsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting review
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card data-testid="card-security-alerts" className="border-l-4 border-l-red-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-security-alerts">
                      {securityAlertsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last 24 hours
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cash In/Out Ratio */}
            <Card data-testid="card-cash-ratio" className="border-l-4 border-l-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash In/Out Ratio</CardTitle>
                <DollarSign className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-cash-ratio">
                      {cashInOutRatio}:1
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Today's ratio
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Wastage This Week - Placeholder */}
            <Card data-testid="card-wastage" className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wastage This Week</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-wastage">
                      0
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Items reported
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity Timeline
              </CardTitle>
              <CardDescription>Last 10 system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-activity">
                      No recent activities found.
                    </p>
                  ) : (
                    recentActivities.map((log: any, index: number) => (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-4 pb-4 border-b last:border-0" 
                        data-testid={`activity-${log.id}`}
                      >
                        <div className={`rounded-full p-2 ${log.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          {log.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium" data-testid={`text-activity-action-${log.id}`}>
                            {log.action} - {log.resourceType}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-activity-time-${log.id}`}>
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={log.success ? "default" : "destructive"} 
                          data-testid={`badge-activity-status-${log.id}`}
                        >
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Financial Activity */}
        <TabsContent value="financial" className="space-y-6">
          {/* Section 1: Transaction Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card data-testid="card-financial-revenue" className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-financial-revenue">
                      {formatCurrency(totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All income transactions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-financial-expenses" className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-financial-expenses">
                      {formatCurrency(totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All outgoing transactions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-net-profit" className={`border-l-4 ${netProfitLoss >= 0 ? 'border-l-green-600' : 'border-l-red-600'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
                <DollarSign className={`h-4 w-4 ${netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-net-profit">
                      {formatCurrency(Math.abs(netProfitLoss))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {netProfitLoss >= 0 ? 'Profit' : 'Loss'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-largest-transaction" className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Transaction</CardTitle>
                <Receipt className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-largest-transaction">
                      {largestTransaction ? formatCurrency(parseFloat(largestTransaction.amount || 0)) : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {largestTransaction?.purpose || 'No transactions'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-voided-transactions" className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voided Transactions</CardTitle>
                <Ban className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-voided-count">
                      {voidedTransactionsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cancelled transactions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Payment Method Breakdown */}
          <Card data-testid="card-payment-breakdown">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Method Breakdown
              </CardTitle>
              <CardDescription>Distribution of transactions by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Cash */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Cash</span>
                      <span data-testid="text-cash-amount">{formatCurrency(paymentMethodBreakdown.cash)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.cash / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* POS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">POS</span>
                      <span data-testid="text-pos-amount">{formatCurrency(paymentMethodBreakdown.pos)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.pos / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Fonepay */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Fonepay</span>
                      <span data-testid="text-fonepay-amount">{formatCurrency(paymentMethodBreakdown.fonepay)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.fonepay / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Other */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Other</span>
                      <span data-testid="text-other-amount">{formatCurrency(paymentMethodBreakdown.other)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.other / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Transactions Table */}
          <Card data-testid="card-transactions-table">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detailed Transaction Records
              </CardTitle>
              <CardDescription>Complete audit trail with filtering and sorting capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-4">
                <Input
                  placeholder="Search purpose, reference, staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                  className="md:col-span-1"
                />

                <Select value={filterTxnType} onValueChange={setFilterTxnType}>
                  <SelectTrigger data-testid="select-txn-type">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTxnTypes.map(type => (
                      <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {uniquePaymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStaff} onValueChange={setFilterStaff}>
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="Staff Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {uniqueStaff.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')} data-testid="th-date">
                        <div className="flex items-center gap-1">
                          Date/Time
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('txnType')} data-testid="th-type">
                        <div className="flex items-center gap-1">
                          Type
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('amount')} data-testid="th-amount">
                        <div className="flex items-center gap-1">
                          Amount
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead data-testid="th-payment">Payment Method</TableHead>
                      <TableHead data-testid="th-purpose">Purpose</TableHead>
                      <TableHead data-testid="th-created-by">Created By</TableHead>
                      <TableHead data-testid="th-bill">Bill Proof</TableHead>
                      <TableHead data-testid="th-status">Status</TableHead>
                      <TableHead data-testid="th-actions">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(9)].map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground" data-testid="text-no-table-data">
                          No transactions found matching the filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((txn: any) => (
                        <TableRow 
                          key={txn.id} 
                          className="cursor-pointer" 
                          onClick={() => viewTransactionDetails(txn)}
                          data-testid={`table-row-${txn.id}`}
                        >
                          <TableCell className="text-xs" data-testid={`td-date-${txn.id}`}>
                            {new Date(txn.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell data-testid={`td-type-${txn.id}`}>
                            <Badge variant="outline" className="text-xs">
                              {txn.txnType?.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`td-amount-${txn.id}`}>
                            {formatCurrency(parseFloat(txn.amount || 0))}
                          </TableCell>
                          <TableCell className="text-xs" data-testid={`td-payment-${txn.id}`}>
                            {txn.paymentMethod || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate" data-testid={`td-purpose-${txn.id}`}>
                            {txn.purpose || '-'}
                          </TableCell>
                          <TableCell className="text-xs" data-testid={`td-creator-${txn.id}`}>
                            {txn.creator?.username || 'Unknown'}
                          </TableCell>
                          <TableCell data-testid={`td-bill-${txn.id}`}>
                            {(txn.billPhotoUrl || txn.billPdfUrl) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewBill(txn.billPhotoUrl || txn.billPdfUrl);
                                }}
                                data-testid={`button-view-bill-${txn.id}`}
                              >
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell data-testid={`td-status-${txn.id}`}>
                            {txn.isVoided ? (
                              <Badge variant="destructive" className="text-xs">Voided</Badge>
                            ) : txn.requiresApproval && !txn.approvedBy ? (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            ) : txn.approvedBy ? (
                              <Badge variant="default" className="text-xs">Approved</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewTransactionDetails(txn);
                              }}
                              data-testid={`button-view-details-${txn.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedTransactions.length)} of {processedTransactions.length} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm" data-testid="text-current-page">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Flagged Transactions */}
          <Card data-testid="card-flagged-transactions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Flagged Transactions
              </CardTitle>
              <CardDescription>Transactions requiring attention or review</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Large Transactions */}
                  {flaggedTransactions.large.length > 0 && (
                    <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/10" data-testid="section-large-transactions">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Large Transactions (≥ NPR 50,000)
                        <Badge variant="outline">{flaggedTransactions.large.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.large.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-large-${txn.id}`}
                          >
                            <span className="truncate flex-1">{txn.purpose || 'Large Transaction'}</span>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cash Out Without Bill Proof */}
                  {flaggedTransactions.noBillProof.length > 0 && (
                    <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10" data-testid="section-no-bill">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FilePlus className="h-4 w-4" />
                        Cash Out Without Bill Proof
                        <Badge variant="outline">{flaggedTransactions.noBillProof.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.noBillProof.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-no-bill-${txn.id}`}
                          >
                            <span className="truncate flex-1">{txn.purpose || 'No Bill Proof'}</span>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voided Transactions */}
                  {flaggedTransactions.voided.length > 0 && (
                    <div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/10" data-testid="section-voided">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Ban className="h-4 w-4" />
                        Voided Transactions
                        <Badge variant="outline">{flaggedTransactions.voided.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.voided.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-orange-100 dark:hover:bg-orange-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-voided-${txn.id}`}
                          >
                            <div className="flex-1">
                              <p className="truncate">{txn.purpose || 'Voided Transaction'}</p>
                              {txn.voidReason && (
                                <p className="text-xs text-muted-foreground truncate">Reason: {txn.voidReason}</p>
                              )}
                            </div>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requires Approval */}
                  {flaggedTransactions.requiresApproval.length > 0 && (
                    <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10" data-testid="section-requires-approval">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Requires Approval
                        <Badge variant="outline">{flaggedTransactions.requiresApproval.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.requiresApproval.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-blue-100 dark:hover:bg-blue-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-approval-${txn.id}`}
                          >
                            <span className="truncate flex-1">{txn.purpose || 'Pending Approval'}</span>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Flagged Transactions */}
                  {flaggedTransactions.large.length === 0 && 
                   flaggedTransactions.noBillProof.length === 0 && 
                   flaggedTransactions.voided.length === 0 && 
                   flaggedTransactions.requiresApproval.length === 0 && (
                    <div className="text-center py-8" data-testid="text-no-flagged">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No flagged transactions. All transactions are in good standing.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Staff Activity */}
        <TabsContent value="staff" className="space-y-6">
          <Card data-testid="card-staff-activity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Activity Summary
              </CardTitle>
              <CardDescription>Track all staff actions and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {staffActivity.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-staff-activity">
                      No staff activity recorded.
                    </p>
                  ) : (
                    staffActivity.map((activity: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-start justify-between border-b pb-4 hover:bg-muted/50 p-2 rounded-lg transition-colors" 
                        data-testid={`staff-activity-${index}`}
                      >
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium" data-testid={`text-staff-name-${index}`}>
                            {activity.username} ({activity.role})
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-staff-actions-${index}`}>
                            Total Actions: {activity.actionCount || 0}
                          </p>
                        </div>
                        <Badge data-testid={`badge-staff-status-${index}`}>
                          Active
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Security Alerts */}
        <TabsContent value="security" className="space-y-6">
          <Card data-testid="card-security-alerts-detail">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Alerts & Failed Operations
              </CardTitle>
              <CardDescription>Monitor failed login attempts, unauthorized access, and system security events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.filter((log: any) => !log.success).length === 0 ? (
                    <div className="text-center py-8" data-testid="text-no-alerts">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No security alerts. All systems operating normally.</p>
                    </div>
                  ) : (
                    auditLogs
                      .filter((log: any) => !log.success)
                      .map((log: any) => (
                        <div 
                          key={log.id} 
                          className="flex items-start gap-4 p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10 rounded" 
                          data-testid={`security-alert-${log.id}`}
                        >
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium" data-testid={`text-alert-action-${log.id}`}>
                              {log.action} - {log.resourceType}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-alert-time-${log.id}`}>
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="destructive" data-testid={`badge-alert-status-${log.id}`}>
                            Failed
                          </Badge>
                        </div>
                      ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Photo Evidence */}
        <TabsContent value="photos" className="space-y-6">
          <Card data-testid="card-photo-evidence">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Evidence & Documentation
              </CardTitle>
              <CardDescription>View all photos attached to maintenance requests, incidents, and operations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMaintenance.filter((m: any) => m.photoUrls && m.photoUrls.length > 0).length === 0 ? (
                    <div className="text-center py-8" data-testid="text-no-photos">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No photos available for the selected period.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredMaintenance
                        .filter((m: any) => m.photoUrls && m.photoUrls.length > 0)
                        .flatMap((m: any) => 
                          m.photoUrls.map((url: string, idx: number) => (
                            <div 
                              key={`${m.id}-${idx}`} 
                              className="relative group cursor-pointer overflow-hidden rounded-lg border"
                              data-testid={`photo-${m.id}-${idx}`}
                            >
                              <img 
                                src={url} 
                                alt={`Maintenance ${m.id} - Photo ${idx + 1}`}
                                className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white text-xs">{m.title}</p>
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Device & Location History */}
        <TabsContent value="location" className="space-y-6">
          <Card data-testid="card-location-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Device & Location History
              </CardTitle>
              <CardDescription>Track staff login locations, devices used, and access patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" data-testid="text-no-location">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Device and location tracking not yet implemented</p>
                  <p className="text-xs text-muted-foreground">This feature will track IP addresses, devices, and login locations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="max-w-2xl" data-testid="modal-transaction-details">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="text-sm" data-testid="modal-txn-id">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <p className="text-sm" data-testid="modal-txn-date">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge data-testid="modal-txn-type">{selectedTransaction.txnType?.replace(/_/g, ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold" data-testid="modal-txn-amount">{formatCurrency(parseFloat(selectedTransaction.amount || 0))}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="text-sm" data-testid="modal-txn-payment">{selectedTransaction.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <p className="text-sm" data-testid="modal-txn-creator">{selectedTransaction.creator?.username || 'Unknown'}</p>
                </div>
                {selectedTransaction.reference && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Reference</p>
                    <p className="text-sm" data-testid="modal-txn-reference">{selectedTransaction.reference}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                  <p className="text-sm" data-testid="modal-txn-purpose">{selectedTransaction.purpose || '-'}</p>
                </div>
                {selectedTransaction.isVoided && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Void Reason</p>
                    <p className="text-sm text-red-600" data-testid="modal-txn-void-reason">{selectedTransaction.voidReason || 'No reason provided'}</p>
                  </div>
                )}
                {(selectedTransaction.billPhotoUrl || selectedTransaction.billPdfUrl) && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Bill Proof</p>
                    <Button
                      variant="outline"
                      onClick={() => viewBill(selectedTransaction.billPhotoUrl || selectedTransaction.billPdfUrl)}
                      data-testid="modal-button-view-bill"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      View Bill
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bill View Modal */}
      <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
        <DialogContent className="max-w-4xl" data-testid="modal-bill-view">
          <DialogHeader>
            <DialogTitle>Bill Proof</DialogTitle>
            <DialogDescription>Transaction bill documentation</DialogDescription>
          </DialogHeader>
          <div className="max-h-[600px] overflow-auto">
            {viewBillUrl && (
              viewBillUrl.endsWith('.pdf') ? (
                <iframe
                  src={viewBillUrl}
                  className="w-full h-[600px]"
                  title="Bill PDF"
                  data-testid="iframe-bill-pdf"
                />
              ) : (
                <img
                  src={viewBillUrl}
                  alt="Bill Proof"
                  className="w-full h-auto"
                  data-testid="img-bill-photo"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
