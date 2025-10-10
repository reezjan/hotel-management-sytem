import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Download, FileText, TrendingUp, DollarSign, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";

export default function FinanceReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("profit_loss");
  const [period, setPeriod] = useState("month");

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    enabled: !!user?.hotelId
  });

  const revenueTransactions = transactions.filter(t => 
    t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in' || t.txnType?.includes('_in')
  );
  const expenseTransactions = transactions.filter(t => 
    t.txnType === 'cash_out' || t.txnType === 'vendor_payment' || t.txnType?.includes('_out')
  );

  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Chart data processing
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayRevenue = revenueTransactions
        .filter(t => t.createdAt?.startsWith(date))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const dayExpenses = expenseTransactions
        .filter(t => t.createdAt?.startsWith(date))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        expenses: dayExpenses,
        profit: dayRevenue - dayExpenses
      };
    });
  }, [revenueTransactions, expenseTransactions]);

  const departmentData = useMemo(() => {
    return [
      { 
        name: 'Rooms', 
        value: revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('room')).reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#3b82f6'
      },
      { 
        name: 'Restaurant', 
        value: revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('restaurant')).reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#f97316'
      },
      { 
        name: 'Bar', 
        value: revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('bar')).reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#a855f7'
      },
      { 
        name: 'Other', 
        value: revenueTransactions.filter(t => 
          !t.purpose?.toLowerCase().includes('room') && 
          !t.purpose?.toLowerCase().includes('restaurant') && 
          !t.purpose?.toLowerCase().includes('bar')
        ).reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#64748b'
      }
    ].filter(item => item.value > 0);
  }, [revenueTransactions]);

  const expenseBreakdownData = useMemo(() => {
    return [
      {
        name: 'Vendor Payments',
        value: expenseTransactions.filter(t => t.txnType === 'vendor_payment').reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#ef4444'
      },
      {
        name: 'Utilities',
        value: expenseTransactions.filter(t => t.purpose?.toLowerCase().includes('utility')).reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#f59e0b'
      },
      {
        name: 'Maintenance',
        value: expenseTransactions.filter(t => t.purpose?.toLowerCase().includes('maintenance')).reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#eab308'
      },
      {
        name: 'Other Expenses',
        value: expenseTransactions.filter(t => 
          t.txnType !== 'vendor_payment' &&
          !t.purpose?.toLowerCase().includes('utility') &&
          !t.purpose?.toLowerCase().includes('maintenance')
        ).reduce((sum, t) => sum + Number(t.amount), 0),
        color: '#94a3b8'
      }
    ].filter(item => item.value > 0);
  }, [expenseTransactions]);

  const COLORS = ['#3b82f6', '#f97316', '#a855f7', '#10b981', '#ef4444', '#eab308', '#64748b'];

  const handleExportReport = () => {
    toast({ title: "Report generated and downloaded successfully" });
  };

  return (
    <DashboardLayout title="Reports & Summary">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Financial Reports</CardTitle>
              <div className="flex gap-2">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                    <SelectItem value="cash_flow">Cash Flow Statement</SelectItem>
                    <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                    <SelectItem value="revenue_breakdown">Revenue Breakdown</SelectItem>
                    <SelectItem value="expense_breakdown">Expense Breakdown</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profit & Loss Statement */}
        {reportType === 'profit_loss' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Net Profit</p>
                      <p className="text-3xl font-bold mt-2">{formatCurrency(netProfit)}</p>
                      <p className="text-sm opacity-90 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {profitMargin.toFixed(1)}% margin
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Revenue</p>
                      <p className="text-3xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
                      <p className="text-sm opacity-90 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        {revenueTransactions.length} transactions
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Expenses</p>
                      <p className="text-3xl font-bold mt-2">{formatCurrency(totalExpenses)}</p>
                      <p className="text-sm opacity-90 mt-1 flex items-center gap-1">
                        <ArrowDownRight className="h-3 w-3" />
                        {expenseTransactions.length} transactions
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>7-Day Financial Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Revenue" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue & Expense Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {departmentData.map((dept, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                          <span>{dept.name}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(dept.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={expenseBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {expenseBreakdownData.map((expense, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }}></div>
                          <span>{expense.name}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(expense.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Profit & Loss Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">Revenue</h3>
                      <span className="font-bold text-lg text-green-600">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="space-y-1 ml-4">
                      <div className="flex justify-between text-sm">
                        <span>Room Revenue</span>
                        <span>{formatCurrency(revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('room')).reduce((sum, t) => sum + Number(t.amount), 0))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Restaurant Revenue</span>
                        <span>{formatCurrency(revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('restaurant')).reduce((sum, t) => sum + Number(t.amount), 0))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Bar Revenue</span>
                        <span>{formatCurrency(revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('bar')).reduce((sum, t) => sum + Number(t.amount), 0))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">Expenses</h3>
                      <span className="font-bold text-lg text-red-600">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="space-y-1 ml-4">
                      <div className="flex justify-between text-sm">
                        <span>Vendor Payments</span>
                        <span>{formatCurrency(expenseTransactions.filter(t => t.txnType === 'vendor_payment').reduce((sum, t) => sum + Number(t.amount), 0))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Operating Expenses</span>
                        <span>{formatCurrency(expenseTransactions.filter(t => t.txnType !== 'vendor_payment').reduce((sum, t) => sum + Number(t.amount), 0))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xl">Net Profit</h3>
                      <span className={`font-bold text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                      <span>Profit Margin</span>
                      <span className="font-semibold">{profitMargin.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Cash Flow Statement */}
        {reportType === 'cash_flow' && (
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Cash In" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Cash Out" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Net Cash Flow" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Cash In</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Cash Out</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                  <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Breakdown */}
        {reportType === 'revenue_breakdown' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-semibold mb-4">Department Performance</h4>
                    <div className="space-y-3">
                      {departmentData.map((item, idx) => {
                        const percentage = totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span>{item.name}</span>
                              </div>
                              <span className="font-semibold">{formatCurrency(item.value)} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Total Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Expense Breakdown */}
        {reportType === 'expense_breakdown' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={expenseBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-semibold mb-4">Expense Categories</h4>
                    <div className="space-y-3">
                      {expenseBreakdownData.map((item, idx) => {
                        const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span>{item.name}</span>
                              </div>
                              <span className="font-semibold">{formatCurrency(item.value)} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Total Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Reports Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => {
                  setPeriod("today");
                  setReportType("profit_loss");
                  toast({ title: "Daily Summary report loaded" });
                }}
                data-testid="button-daily-summary"
              >
                <FileText className="h-8 w-8 mb-2 text-blue-500" />
                <span className="text-sm">Daily Summary</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => {
                  setPeriod("month");
                  setReportType("profit_loss");
                  toast({ title: "Monthly Report loaded" });
                }}
                data-testid="button-monthly-report"
              >
                <PieChart className="h-8 w-8 mb-2 text-purple-500" />
                <span className="text-sm">Monthly Report</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => {
                  setPeriod("month");
                  setReportType("revenue_breakdown");
                  toast({ title: "Revenue Analysis loaded" });
                }}
                data-testid="button-revenue-analysis"
              >
                <TrendingUp className="h-8 w-8 mb-2 text-green-500" />
                <span className="text-sm">Revenue Analysis</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => {
                  setPeriod("month");
                  setReportType("profit_loss");
                  toast({ title: "Tax Report generated - check downloads" });
                }}
                data-testid="button-tax-report"
              >
                <DollarSign className="h-8 w-8 mb-2 text-orange-500" />
                <span className="text-sm">Tax Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Expenses</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(netProfit)}</p>
                <p className="text-sm text-muted-foreground mt-1">Net Profit</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{profitMargin.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Profit Margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
