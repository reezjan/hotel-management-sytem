import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function FinancialOverview() {
  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000
  });

  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/payments"],
    refetchInterval: 3000
  });

  // Real-time updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    events: ['transaction:created', 'transaction:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/payments"],
    refetchInterval: 3000,
    events: ['payment:created', 'payment:updated']
  });

  // Calculate real financial metrics
  // Calculate total revenue from all income transactions
  const revenueTransactions = transactions.filter(t => 
    t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in' || 
    t.txnType === 'revenue' || (t.txnType && t.txnType.includes('_in'))
  );
  
  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter(t => 
      t.txnType === 'cash_out' || t.txnType === 'vendor_payment' || 
      (t.txnType && t.txnType.includes('_out'))
    )
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Revenue by payment method (already defined above)

  const cashRevenue = revenueTransactions
    .filter(t => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  const posRevenue = revenueTransactions
    .filter(t => t.paymentMethod === 'pos')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  const fonepayRevenue = revenueTransactions
    .filter(t => t.paymentMethod === 'fonepay')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // All transactions by payment method for transaction count
  const allCashTransactions = transactions.filter(t => t.paymentMethod === 'cash');
  const allPosTransactions = transactions.filter(t => t.paymentMethod === 'pos');
  const allFonepayTransactions = transactions.filter(t => t.paymentMethod === 'fonepay');

  return (
    <DashboardLayout title="Financial Overview">
      <div className="space-y-6">
        {/* Revenue Overview */}
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
            title="Net Profit"
            value={formatCurrency(totalRevenue - totalExpenses)}
            icon={<Receipt />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Total Transactions"
            value={transactions.length}
            icon={<CreditCard />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{formatCurrency(cashRevenue)}</div>
                <div className="text-sm text-green-700 mt-2">Cash Revenue</div>
                <div className="text-xs text-green-600">{allCashTransactions.length} total transactions</div>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(posRevenue)}</div>
                <div className="text-sm text-blue-700 mt-2">POS Revenue</div>
                <div className="text-xs text-blue-600">{allPosTransactions.length} total transactions</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{formatCurrency(fonepayRevenue)}</div>
                <div className="text-sm text-purple-700 mt-2">Fonepay Revenue</div>
                <div className="text-xs text-purple-600">{allFonepayTransactions.length} total transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction, index) => (
                <div key={transaction.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.txnType?.replace(/_/g, ' ').toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">{transaction.purpose || 'No description'}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.txnType?.includes('in') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.txnType?.includes('in') ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.paymentMethod?.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}