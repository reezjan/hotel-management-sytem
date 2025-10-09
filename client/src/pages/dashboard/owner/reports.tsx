import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChart, FileText, Download, Calendar, TrendingUp, DollarSign, TrendingDown, PieChart, Activity, ArrowUpRight, ArrowDownRight, Percent, Image, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  const [reportType, setReportType] = useState('financial');
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"]
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/rooms"]
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"]
  });

  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"]
  });

  const { data: maintenanceRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vendors"]
  });

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const txnDate = new Date(t.createdAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999); // Include the entire end date
    return txnDate >= fromDate && txnDate <= toDate;
  });

  // Calculate report metrics
  const totalRevenue = filteredTransactions
    .filter(t => t.txnType === 'revenue')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.txnType === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const occupancyRate = rooms.length > 0 ? 
    (rooms.filter(r => r.isOccupied).length / rooms.length) * 100 : 0;

  const activeStaff = staff.filter(s => s.isActive).length;

  // Advanced calculations
  const revenueBySource = {
    rooms: filteredTransactions
      .filter(t => t.txnType === 'revenue' && t.purpose?.toLowerCase().includes('room'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    restaurant: filteredTransactions
      .filter(t => t.txnType === 'revenue' && t.purpose?.toLowerCase().includes('restaurant'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    halls: filteredTransactions
      .filter(t => t.txnType === 'revenue' && t.purpose?.toLowerCase().includes('hall'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    other: filteredTransactions
      .filter(t => t.txnType === 'revenue' && 
        !t.purpose?.toLowerCase().includes('room') && 
        !t.purpose?.toLowerCase().includes('restaurant') && 
        !t.purpose?.toLowerCase().includes('hall'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
  };

  const expensesByCategory = {
    utilities: filteredTransactions
      .filter(t => t.txnType === 'expense' && (t.purpose?.toLowerCase().includes('electricity') || t.purpose?.toLowerCase().includes('water')))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    supplies: filteredTransactions
      .filter(t => t.txnType === 'expense' && (t.purpose?.toLowerCase().includes('supplies') || t.purpose?.toLowerCase().includes('food')))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    salaries: filteredTransactions
      .filter(t => t.txnType === 'expense' && t.purpose?.toLowerCase().includes('salary'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    maintenance: filteredTransactions
      .filter(t => t.txnType === 'expense' && (t.purpose?.toLowerCase().includes('maintenance') || t.purpose?.toLowerCase().includes('repair')))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    other: filteredTransactions
      .filter(t => t.txnType === 'expense' && 
        !t.purpose?.toLowerCase().includes('electricity') && 
        !t.purpose?.toLowerCase().includes('water') && 
        !t.purpose?.toLowerCase().includes('supplies') && 
        !t.purpose?.toLowerCase().includes('food') && 
        !t.purpose?.toLowerCase().includes('salary') && 
        !t.purpose?.toLowerCase().includes('maintenance') && 
        !t.purpose?.toLowerCase().includes('repair'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
  };

  const refunds = filteredTransactions
    .filter(t => t.txnType === 'refund')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netProfit = totalRevenue - totalExpenses - refunds;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

  // Payment method breakdown
  const paymentMethods = {
    cash: filteredTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    creditCard: filteredTransactions.filter(t => t.paymentMethod === 'credit_card').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    bankTransfer: filteredTransactions.filter(t => t.paymentMethod === 'bank_transfer').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
  };

  const generateReport = () => {
    console.log("Generating report:", { reportType, dateRange });
    // TODO: Implement report generation
  };

  const exportReport = (format: string) => {
    console.log("Exporting report in format:", format);
    // TODO: Implement CSV export with detailed data
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        {/* View Mode Selector */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Financial Reports</h2>
            <p className="text-muted-foreground">Comprehensive financial insights and analytics</p>
          </div>
          <Select value={viewMode} onValueChange={(value: 'basic' | 'advanced') => setViewMode(value)}>
            <SelectTrigger className="w-[180px]" data-testid="select-view-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic View</SelectItem>
              <SelectItem value="advanced">Advanced View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Report Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<TrendingUp />}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<BarChart />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Active Staff"
            value={activeStaff}
            icon={<FileText />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="occupancy">Occupancy Report</SelectItem>
                    <SelectItem value="staff">Staff Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex gap-2">
                  <Button onClick={generateReport} className="flex-1">
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span className="font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Net Profit:</span>
                  <span className="font-bold">{formatCurrency(totalRevenue - totalExpenses)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => exportReport('financial')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Financial Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Occupancy Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Rooms:</span>
                  <span className="font-bold">{rooms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupied:</span>
                  <span className="font-bold">{rooms.filter(r => r.isOccupied).length}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Occupancy Rate:</span>
                  <span className="font-bold">{occupancyRate.toFixed(1)}%</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => exportReport('occupancy')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Occupancy Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staff Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Staff:</span>
                  <span className="font-bold">{staff.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-bold text-green-600">{activeStaff}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>On Duty Now:</span>
                  <span className="font-bold">{staff.filter(s => dailyAttendance.some(a => a.userId === s.id && a.status === 'active')).length}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => exportReport('staff')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Staff Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conditional View: Basic or Advanced */}
        {viewMode === 'basic' ? (
          /* Basic View - Recent Activity Summary */
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Recent Transactions</h4>
                    <div className="space-y-2">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.slice(0, 5).map((transaction, index) => (
                          <div key={transaction.id || index} className="flex justify-between text-sm">
                            <span className="truncate">{transaction.purpose || transaction.txnType?.replace(/_/g, ' ')}</span>
                            <span className={`font-medium ${
                              transaction.txnType === 'revenue' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(Number(transaction.amount))}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No transactions in selected date range</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Low Stock Items</h4>
                    <div className="space-y-2">
                      {inventory
                        .filter(item => Number(item.stockQty) <= Number(item.reorderLevel))
                        .slice(0, 5)
                        .map((item, index) => (
                          <div key={item.id || index} className="flex justify-between text-sm">
                            <span className="truncate">{item.name}</span>
                            <span className="text-orange-600 font-medium">
                              {item.stockQty} {item.unit}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Advanced View - Comprehensive Hotel Management Dashboard */
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Financial Overview</TabsTrigger>
              <TabsTrigger value="transactions" data-testid="tab-transactions">All Transactions</TabsTrigger>
              <TabsTrigger value="maintenance" data-testid="tab-maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Visual Analytics</TabsTrigger>
            </TabsList>

            {/* Tab 1: Financial Overview */}
            <TabsContent value="overview" className="space-y-6">
            {/* Profit & Loss Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Profit & Loss Statement
                </CardTitle>
                <CardDescription>Comprehensive financial performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue Breakdown */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
                      <Badge variant="outline" className="text-green-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Income
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Room Bookings</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((revenueBySource.rooms / (totalRevenue || 1)) * 100)}% of total revenue
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(revenueBySource.rooms)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Restaurant & Bar</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((revenueBySource.restaurant / (totalRevenue || 1)) * 100)}% of total revenue
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(revenueBySource.restaurant)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Hall Bookings</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((revenueBySource.halls / (totalRevenue || 1)) * 100)}% of total revenue
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(revenueBySource.halls)}</p>
                        </div>
                      </div>
                      {revenueBySource.other > 0 && (
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">Other Revenue</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round((revenueBySource.other / (totalRevenue || 1)) * 100)}% of total revenue
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(revenueBySource.other)}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t-2">
                        <p className="text-lg font-bold">Total Revenue</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Expenses Breakdown */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Expenses Breakdown</h3>
                      <Badge variant="outline" className="text-red-600">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        Expenses
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Salaries & Wages</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((expensesByCategory.salaries / (totalExpenses || 1)) * 100)}% of total expenses
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(expensesByCategory.salaries)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Food & Supplies</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((expensesByCategory.supplies / (totalExpenses || 1)) * 100)}% of total expenses
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(expensesByCategory.supplies)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Utilities</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((expensesByCategory.utilities / (totalExpenses || 1)) * 100)}% of total expenses
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(expensesByCategory.utilities)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Maintenance & Repairs</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((expensesByCategory.maintenance / (totalExpenses || 1)) * 100)}% of total expenses
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(expensesByCategory.maintenance)}</p>
                        </div>
                      </div>
                      {expensesByCategory.other > 0 && (
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">Other Expenses</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round((expensesByCategory.other / (totalExpenses || 1)) * 100)}% of total expenses
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{formatCurrency(expensesByCategory.other)}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t-2">
                        <p className="text-lg font-bold">Total Expenses</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Net Profit */}
                  <div className="bg-primary/5 p-6 rounded-lg">
                    <div className="space-y-4">
                      {refunds > 0 && (
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Less: Refunds & Adjustments</p>
                          <p className="font-bold text-orange-600">({formatCurrency(refunds)})</p>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t-2">
                        <div>
                          <p className="text-2xl font-bold">Net Profit</p>
                          <p className="text-sm text-muted-foreground">After all expenses and adjustments</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(netProfit)}
                          </p>
                          <div className="flex items-center gap-1 text-sm">
                            <Percent className="h-3 w-3" />
                            <span>Profit Margin: {profitMargin.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods & Transaction Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Payment Methods Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">Cash Transactions</p>
                      <p className="font-bold">{formatCurrency(paymentMethods.cash)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">Credit Card</p>
                      <p className="font-bold">{formatCurrency(paymentMethods.creditCard)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">Bank Transfer</p>
                      <p className="font-bold">{formatCurrency(paymentMethods.bankTransfer)}</p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Payment Distribution</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Cash</span>
                            <span>{Math.round((paymentMethods.cash / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${(paymentMethods.cash / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Credit Card</span>
                            <span>{Math.round((paymentMethods.creditCard / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${(paymentMethods.creditCard / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Bank Transfer</span>
                            <span>{Math.round((paymentMethods.bankTransfer / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500" 
                              style={{ width: `${(paymentMethods.bankTransfer / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Key Financial Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Average Transaction Value</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(filteredTransactions.length > 0 ? (totalRevenue + totalExpenses) / filteredTransactions.length : 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                      <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {filteredTransactions.filter(t => t.txnType === 'revenue').length} revenue • {filteredTransactions.filter(t => t.txnType === 'expense').length} expenses
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Operating Expense Ratio</p>
                      <p className="text-2xl font-bold">
                        {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower is better (industry avg: 60-70%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </TabsContent>

            {/* Tab 2: All Transactions - Complete Transparency */}
            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Complete Transaction History
                  </CardTitle>
                  <CardDescription>
                    All {filteredTransactions.length} transactions in selected date range - Complete transparency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((txn) => {
                            const vendor = vendors.find(v => v.id === txn.vendorId);
                            const creator = staff.find(u => u.id === txn.createdBy);
                            return (
                              <TableRow key={txn.id}>
                                <TableCell className="whitespace-nowrap">
                                  {new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={txn.txnType === 'revenue' ? 'default' : txn.txnType === 'expense' ? 'destructive' : 'outline'}>
                                    {txn.txnType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <div className="truncate" title={txn.purpose}>
                                    {txn.purpose || '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="capitalize">
                                  {txn.paymentMethod?.replace(/_/g, ' ') || '-'}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {txn.reference || '-'}
                                </TableCell>
                                <TableCell>
                                  {vendor?.name || '-'}
                                </TableCell>
                                <TableCell>
                                  {creator?.username || '-'}
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                  <span className={txn.txnType === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(Number(txn.amount))}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {txn.isVoided ? (
                                    <Badge variant="secondary" className="text-gray-500">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Voided
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-green-600">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Active
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No transactions found in the selected date range
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Maintenance Requests with Photos */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    All Maintenance Requests
                  </CardTitle>
                  <CardDescription>
                    Complete maintenance history with photos and full details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceRequests.length > 0 ? (
                      maintenanceRequests.map((request) => {
                        const reporter = staff.find(u => u.id === request.reportedBy);
                        const assignee = staff.find(u => u.id === request.assignedTo);
                        return (
                          <Card key={request.id} className="overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex gap-6">
                                {/* Photo Section */}
                                {request.photo && (
                                  <div className="flex-shrink-0">
                                    <img 
                                      src={request.photo} 
                                      alt={request.title}
                                      className="w-48 h-48 object-cover rounded-lg border-2"
                                    />
                                  </div>
                                )}
                                
                                {/* Details Section */}
                                <div className="flex-1 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-bold">{request.title}</h3>
                                      <p className="text-sm text-muted-foreground">{request.location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge variant={
                                        request.status === 'resolved' ? 'default' : 
                                        request.status === 'pending' ? 'secondary' : 
                                        'outline'
                                      }>
                                        {request.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                        {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                        {request.status}
                                      </Badge>
                                      <Badge variant={
                                        request.priority === 'high' ? 'destructive' :
                                        request.priority === 'medium' ? 'default' :
                                        'secondary'
                                      }>
                                        {request.priority} priority
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Reported By</p>
                                      <p className="font-medium">{reporter?.username || 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Assigned To</p>
                                      <p className="font-medium">{assignee?.username || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Created</p>
                                      <p className="font-medium">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {request.resolvedAt && (
                                      <div>
                                        <p className="text-muted-foreground">Resolved</p>
                                        <p className="font-medium">
                                          {new Date(request.resolvedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                                    <p className="text-sm">{request.description}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No maintenance requests found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Visual Analytics with Charts */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Revenue & Expenses Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Revenue vs Expenses Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Revenue Bar Chart */}
                    <div>
                      <h3 className="text-sm font-semibold mb-4 text-green-600">Revenue by Source</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Room Bookings</span>
                            <span className="font-bold">{formatCurrency(revenueBySource.rooms)}</span>
                          </div>
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 flex items-center justify-end pr-3 text-white text-xs font-bold"
                              style={{ width: `${(revenueBySource.rooms / totalRevenue) * 100}%` }}
                            >
                              {Math.round((revenueBySource.rooms / totalRevenue) * 100)}%
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Restaurant & Bar</span>
                            <span className="font-bold">{formatCurrency(revenueBySource.restaurant)}</span>
                          </div>
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-600 flex items-center justify-end pr-3 text-white text-xs font-bold"
                              style={{ width: `${(revenueBySource.restaurant / totalRevenue) * 100}%` }}
                            >
                              {Math.round((revenueBySource.restaurant / totalRevenue) * 100)}%
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Hall Bookings</span>
                            <span className="font-bold">{formatCurrency(revenueBySource.halls)}</span>
                          </div>
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-700 flex items-center justify-end pr-3 text-white text-xs font-bold"
                              style={{ width: `${(revenueBySource.halls / totalRevenue) * 100}%` }}
                            >
                              {Math.round((revenueBySource.halls / totalRevenue) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Expenses Bar Chart */}
                    <div>
                      <h3 className="text-sm font-semibold mb-4 text-red-600">Expenses by Category</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Salaries & Wages</span>
                            <span className="font-bold">{formatCurrency(expensesByCategory.salaries)}</span>
                          </div>
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 flex items-center justify-end pr-3 text-white text-xs font-bold"
                              style={{ width: `${(expensesByCategory.salaries / totalExpenses) * 100}%` }}
                            >
                              {Math.round((expensesByCategory.salaries / totalExpenses) * 100)}%
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Food & Supplies</span>
                            <span className="font-bold">{formatCurrency(expensesByCategory.supplies)}</span>
                          </div>
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-600 flex items-center justify-end pr-3 text-white text-xs font-bold"
                              style={{ width: `${(expensesByCategory.supplies / totalExpenses) * 100}%` }}
                            >
                              {Math.round((expensesByCategory.supplies / totalExpenses) * 100)}%
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Utilities</span>
                            <span className="font-bold">{formatCurrency(expensesByCategory.utilities)}</span>
                          </div>
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-700 flex items-center justify-end pr-3 text-white text-xs font-bold"
                              style={{ width: `${(expensesByCategory.utilities / totalExpenses) * 100}%` }}
                            >
                              {Math.round((expensesByCategory.utilities / totalExpenses) * 100)}%
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Maintenance & Repairs</span>
                            <span className="font-bold">{formatCurrency(expensesByCategory.maintenance)}</span>
                          </div>
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-800 flex items-center justify-end pr-3 text-white text-xs font-bold"
                              style={{ width: `${(expensesByCategory.maintenance / totalExpenses) * 100}%` }}
                            >
                              {Math.round((expensesByCategory.maintenance / totalExpenses) * 100)}%
                            </div>
                          </div>
                        </div>
                        {expensesByCategory.other > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Other Expenses</span>
                              <span className="font-bold">{formatCurrency(expensesByCategory.other)}</span>
                            </div>
                            <div className="h-8 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-900 flex items-center justify-end pr-3 text-white text-xs font-bold"
                                style={{ width: `${(expensesByCategory.other / totalExpenses) * 100}%` }}
                              >
                                {Math.round((expensesByCategory.other / totalExpenses) * 100)}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods Pie Chart Representation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Payment Methods Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-6 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {Math.round((paymentMethods.cash / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100)}%
                        </div>
                        <p className="text-sm font-medium">Cash</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(paymentMethods.cash)}
                        </p>
                      </div>
                      <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {Math.round((paymentMethods.creditCard / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100)}%
                        </div>
                        <p className="text-sm font-medium">Credit Card</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(paymentMethods.creditCard)}
                        </p>
                      </div>
                      <div className="p-6 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {Math.round((paymentMethods.bankTransfer / (paymentMethods.cash + paymentMethods.creditCard + paymentMethods.bankTransfer || 1)) * 100)}%
                        </div>
                        <p className="text-sm font-medium">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(paymentMethods.bankTransfer)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Detailed Reports</CardTitle>
                  <CardDescription>Download comprehensive data for external analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => exportReport('all_transactions')}>
                      <Download className="h-4 w-4 mr-2" />
                      All Transactions (CSV)
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('profit_loss')}>
                      <Download className="h-4 w-4 mr-2" />
                      P&L Statement (CSV)
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('maintenance')}>
                      <Download className="h-4 w-4 mr-2" />
                      Maintenance Log (CSV)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}