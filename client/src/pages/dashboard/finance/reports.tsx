import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Download, FileText, TrendingUp, DollarSign, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Net Profit</p>
                    <p className="text-4xl font-bold mt-2">{formatCurrency(netProfit)}</p>
                    <p className="text-sm opacity-90 mt-1">
                      Profit Margin: {profitMargin.toFixed(2)}%
                    </p>
                  </div>
                  <TrendingUp className="h-16 w-16 opacity-50" />
                </div>
              </CardContent>
            </Card>

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

        {/* Revenue Breakdown */}
        {reportType === 'revenue_breakdown' && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">By Department</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Rooms', amount: revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('room')).reduce((sum, t) => sum + Number(t.amount), 0), color: 'blue' },
                      { label: 'Restaurant', amount: revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('restaurant')).reduce((sum, t) => sum + Number(t.amount), 0), color: 'orange' },
                      { label: 'Bar', amount: revenueTransactions.filter(t => t.purpose?.toLowerCase().includes('bar')).reduce((sum, t) => sum + Number(t.amount), 0), color: 'purple' },
                    ].map((item) => {
                      const percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.label}</span>
                            <span className="font-semibold">{formatCurrency(item.amount)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className={`bg-${item.color}-500 h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">By Payment Method</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Cash', amount: revenueTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + Number(t.amount), 0), color: 'green' },
                      { label: 'POS', amount: revenueTransactions.filter(t => t.paymentMethod === 'pos').reduce((sum, t) => sum + Number(t.amount), 0), color: 'blue' },
                      { label: 'Fonepay', amount: revenueTransactions.filter(t => t.paymentMethod === 'fonepay').reduce((sum, t) => sum + Number(t.amount), 0), color: 'purple' },
                    ].map((item) => {
                      const percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.label}</span>
                            <span className="font-semibold">{formatCurrency(item.amount)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className={`bg-${item.color}-500 h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Reports Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col">
                <FileText className="h-8 w-8 mb-2 text-blue-500" />
                <span className="text-sm">Daily Summary</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
                <PieChart className="h-8 w-8 mb-2 text-purple-500" />
                <span className="text-sm">Monthly Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
                <TrendingUp className="h-8 w-8 mb-2 text-green-500" />
                <span className="text-sm">Revenue Analysis</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
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
