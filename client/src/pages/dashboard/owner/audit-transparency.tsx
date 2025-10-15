import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
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
  XCircle
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
          <Card data-testid="card-financial-activity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Transaction History
              </CardTitle>
              <CardDescription>Complete audit trail of all financial transactions with creator information</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-transactions">
                      No financial transactions found.
                    </p>
                  ) : (
                    filteredTransactions.map((txn: any) => (
                      <div 
                        key={txn.id} 
                        className="flex items-start justify-between border-b pb-4 hover:bg-muted/50 p-2 rounded-lg transition-colors" 
                        data-testid={`transaction-${txn.id}`}
                      >
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium" data-testid={`text-txn-purpose-${txn.id}`}>
                            {txn.purpose || 'Transaction'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span data-testid={`text-txn-type-${txn.id}`}>Type: {txn.txnType?.replace(/_/g, ' ')}</span>
                            <span data-testid={`text-txn-amount-${txn.id}`}>
                              Amount: NPR {parseFloat(txn.amount || 0).toLocaleString()}
                            </span>
                            {txn.paymentMethod && (
                              <span data-testid={`text-payment-method-${txn.id}`}>
                                Method: {txn.paymentMethod}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground" data-testid={`text-created-by-${txn.id}`}>
                            Created by: {txn.creator?.username || 'Unknown'} ({txn.creator?.role?.replace(/_/g, ' ') || 'N/A'}) on{" "}
                            {new Date(txn.createdAt).toLocaleString()}
                          </p>
                          {txn.reference && (
                            <p className="text-xs text-muted-foreground" data-testid={`text-reference-${txn.id}`}>
                              Reference: {txn.reference}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={txn.txnType === 'revenue' || txn.txnType?.includes('_in') ? 'default' : txn.txnType === 'expense' || txn.txnType?.includes('_out') ? 'destructive' : 'secondary'}
                          data-testid={`badge-txn-type-${txn.id}`}
                        >
                          {formatCurrency(parseFloat(txn.amount || 0))}
                        </Badge>
                      </div>
                    ))
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
    </div>
  );
}
