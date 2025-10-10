import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle, AlertCircle, DollarSign, CreditCard, Smartphone } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function FinanceReconciliationPage() {
  const { user } = useAuth();
  const [reconciliationStatus, setReconciliationStatus] = useState("pending");

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    enabled: !!user?.hotelId
  });

  // Listen for real-time transaction updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    events: ['transaction:created', 'transaction:updated']
  });

  const cashTransactions = transactions.filter(t => t.paymentMethod === 'cash');
  const posTransactions = transactions.filter(t => t.paymentMethod === 'pos');
  const fonepayTransactions = transactions.filter(t => t.paymentMethod === 'fonepay');

  const totalCashIn = cashTransactions.filter(t => t.txnType?.includes('_in')).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalCashOut = cashTransactions.filter(t => t.txnType?.includes('_out') || t.txnType === 'vendor_payment').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const cashBalance = totalCashIn - totalCashOut;

  const totalPosIn = posTransactions.filter(t => t.txnType?.includes('_in')).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPosOut = posTransactions.filter(t => t.txnType?.includes('_out') || t.txnType === 'vendor_payment').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const posBalance = totalPosIn - totalPosOut;

  const totalFonepayIn = fonepayTransactions.filter(t => t.txnType?.includes('_in')).reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalFonepayOut = fonepayTransactions.filter(t => t.txnType?.includes('_out') || t.txnType === 'vendor_payment').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const fonepayBalance = totalFonepayIn - totalFonepayOut;

  return (
    <DashboardLayout title="Payment Reconciliation">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Payment Reconciliation Dashboard</CardTitle>
              <div className="flex gap-2">
                <Select value={reconciliationStatus} onValueChange={setReconciliationStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reconciled">Reconciled</SelectItem>
                    <SelectItem value="discrepancy">Discrepancy</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Generate Report</Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Cash Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cash In:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalCashIn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cash Out:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(totalCashOut)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Cash Balance:</span>
                    <span className={`font-bold text-lg ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(cashBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Reconciled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                POS Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">POS In:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalPosIn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">POS Out:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(totalPosOut)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">POS Balance:</span>
                    <span className={`font-bold text-lg ${posBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(posBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Reconciled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-500" />
                Fonepay Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fonepay In:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalFonepayIn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fonepay Out:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(totalFonepayOut)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Fonepay Balance:</span>
                    <span className={`font-bold text-lg ${fonepayBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(fonepayBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Reconciled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions Requiring Reconciliation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Payment Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{formatDate(transaction.createdAt)}</td>
                        <td className="px-4 py-3 text-sm">{transaction.txnType}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatCurrency(Number(transaction.amount))}</td>
                        <td className="px-4 py-3 text-sm capitalize">{transaction.paymentMethod}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Reconciled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{transactions.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Transactions</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Reconciled</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-muted-foreground mt-1">Pending</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">0</p>
                <p className="text-sm text-muted-foreground mt-1">Discrepancies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
