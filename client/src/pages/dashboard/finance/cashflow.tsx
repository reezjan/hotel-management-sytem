import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function FinanceCashFlowPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");

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

  const cashInTransactions = transactions.filter(t => 
    t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in' || t.txnType?.includes('_in')
  );
  const cashOutTransactions = transactions.filter(t => 
    t.txnType === 'cash_out' || t.txnType === 'vendor_payment' || t.txnType?.includes('_out')
  );

  const totalCashIn = cashInTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalCashOut = cashOutTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netCashFlow = totalCashIn - totalCashOut;
  const cashFlowRatio = totalCashOut > 0 ? (totalCashIn / totalCashOut) : totalCashIn > 0 ? Infinity : 0;

  return (
    <DashboardLayout title="Cash Flow Analysis">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Cash Flow Overview</CardTitle>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Cash Inflow</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalCashIn)}</p>
                  <p className="text-sm opacity-90 mt-1">{cashInTransactions.length} transactions</p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Cash Outflow</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalCashOut)}</p>
                  <p className="text-sm opacity-90 mt-1">{cashOutTransactions.length} transactions</p>
                </div>
                <TrendingDown className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-r ${netCashFlow >= 0 ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-red-600'} text-white`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Net Cash Flow</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(netCashFlow)}</p>
                  <p className="text-sm opacity-90 mt-1">{netCashFlow >= 0 ? 'Positive' : 'Negative'}</p>
                </div>
                <DollarSign className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Cash Flow Ratio</p>
                  <p className="text-3xl font-bold mt-2">{cashFlowRatio === Infinity ? '∞' : cashFlowRatio.toFixed(2)}</p>
                  <p className="text-sm opacity-90 mt-1">Inflow/Outflow</p>
                </div>
                <Activity className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-lg">Cash Inflow</h3>
                      <p className="text-sm text-muted-foreground">Revenue from all sources</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCashIn)}</p>
                    <p className="text-sm text-muted-foreground">{cashInTransactions.length} transactions</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs text-muted-foreground">Cash</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(cashInTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + Number(t.amount), 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs text-muted-foreground">POS</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(cashInTransactions.filter(t => t.paymentMethod === 'pos').reduce((sum, t) => sum + Number(t.amount), 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs text-muted-foreground">Fonepay</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(cashInTransactions.filter(t => t.paymentMethod === 'fonepay').reduce((sum, t) => sum + Number(t.amount), 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-lg">Cash Outflow</h3>
                      <p className="text-sm text-muted-foreground">Expenses and payments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCashOut)}</p>
                    <p className="text-sm text-muted-foreground">{cashOutTransactions.length} transactions</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs text-muted-foreground">Cash</p>
                    <p className="font-bold text-red-600">
                      {formatCurrency(cashOutTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + Number(t.amount), 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs text-muted-foreground">POS</p>
                    <p className="font-bold text-red-600">
                      {formatCurrency(cashOutTransactions.filter(t => t.paymentMethod === 'pos').reduce((sum, t) => sum + Number(t.amount), 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs text-muted-foreground">Fonepay</p>
                    <p className="font-bold text-red-600">
                      {formatCurrency(cashOutTransactions.filter(t => t.paymentMethod === 'fonepay').reduce((sum, t) => sum + Number(t.amount), 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-6 ${netCashFlow >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className={`h-8 w-8 ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    <div>
                      <h3 className="font-semibold text-lg">Net Cash Flow</h3>
                      <p className="text-sm text-muted-foreground">Inflow minus outflow</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatCurrency(netCashFlow)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {netCashFlow >= 0 ? 'Surplus' : 'Deficit'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Health Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Operating Cash Flow</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(netCashFlow)}</p>
                <p className="text-xs text-muted-foreground mt-2">Current period</p>
              </div>

              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Cash Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalCashIn > 0 ? ((netCashFlow / totalCashIn) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">Efficiency metric</p>
              </div>

              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Burn Rate</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalCashOut / 30)}</p>
                <p className="text-xs text-muted-foreground mt-2">Per day average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
