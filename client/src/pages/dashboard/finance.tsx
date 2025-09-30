import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Receipt, CreditCard, Smartphone, Building } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FinanceDashboard() {
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/hotels/current/transactions"]
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors"]
  });

  // Calculate financial totals - separate revenue (income) from expenses
  const revenueTransactions = transactions.filter(t => 
    t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in' || 
    t.txnType === 'revenue' || (t.txnType && t.txnType.includes('_in'))
  );
  
  const expenseTransactions = transactions.filter(t => 
    t.txnType === 'cash_out' || t.txnType === 'vendor_payment' || 
    (t.txnType && t.txnType.includes('_out'))
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

  // For display purposes - all transactions by payment method (including expenses)
  const allCashTransactions = transactions.filter(t => t.paymentMethod === 'cash');
  const allPosTransactions = transactions.filter(t => t.paymentMethod === 'pos');
  const allFonepayTransactions = transactions.filter(t => t.paymentMethod === 'fonepay');

  // Calculate vendor payments specifically if needed for separate display
  const vendorPayments = transactions.filter(t => t.txnType === 'vendor_payment');
  const totalVendorPayments = vendorPayments.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const maintenanceColumns = [
    { key: "description", label: "Request", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { 
      key: "raisedBy", 
      label: "Raised By", 
      render: (value: any, row: any) => {
        // In a real app, this would lookup the user by ID
        return row.raisedBy || "Unknown";
      }
    },
    { key: "status", label: "Status", sortable: true },
    { key: "createdAt", label: "Date", sortable: true }
  ];

  const transactionColumns = [
    { key: "txnType", label: "Type", sortable: true },
    { key: "amount", label: "Amount", sortable: true, render: (value: number) => formatCurrency(value) },
    { key: "paymentMethod", label: "Method", sortable: true },
    { key: "purpose", label: "Purpose", sortable: true },
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

  const maintenanceActions = [
    { label: "Approve", action: (row: any) => console.log("Approve maintenance:", row) },
    { label: "Assign Budget", action: (row: any) => console.log("Assign budget:", row) },
    { label: "View Details", action: (row: any) => console.log("View details:", row) }
  ];

  const vendorActions = [
    { label: "Pay", action: (row: any) => console.log("Pay vendor:", row) },
    { label: "View History", action: (row: any) => console.log("View payment history:", row) },
    { label: "Edit", action: (row: any) => console.log("Edit vendor:", row) }
  ];

  const expenseActions = [
    { label: "View Receipt", action: (row: any) => console.log("View receipt:", row) },
    { label: "Edit", action: (row: any) => console.log("Edit expense:", row) }
  ];

  // Filter expenses (cash_out transactions)
  const expenses = transactions.filter(t => t.txnType === 'cash_out' || t.txnType === 'vendor_payment');

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
            trend={{ value: 12.5, label: "this month", isPositive: true }}
          />
          <StatsCard
            title="Net Revenue"
            value={formatCurrency(netRevenue)}
            icon={<TrendingUp />}
            iconColor="text-blue-500"
            trend={{ value: 8.3, label: "after expenses", isPositive: true }}
          />
          <StatsCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<TrendingDown />}
            iconColor="text-red-500"
            trend={{ value: 15.2, label: "this month", isPositive: false }}
          />
          <StatsCard
            title="Pending Requests"
            value={maintenanceRequests.filter(r => r.status === 'open').length}
            icon={<Building />}
            iconColor="text-orange-500"
          />
        </div>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg" data-testid="revenue-cash">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold text-foreground">Cash Revenue</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(cashRevenue)}</p>
                <p className="text-sm text-muted-foreground">{allCashTransactions.length} total transactions</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg" data-testid="revenue-pos">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold text-foreground">POS Revenue</h3>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(posRevenue)}</p>
                <p className="text-sm text-muted-foreground">{allPosTransactions.length} total transactions</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg" data-testid="revenue-fonepay">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold text-foreground">Fonepay Revenue</h3>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(fonepayRevenue)}</p>
                <p className="text-sm text-muted-foreground">{allFonepayTransactions.length} total transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Finance Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-vendor-payment">
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm">Vendor Payment</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-expense-report">
                <Receipt className="h-6 w-6 mb-2" />
                <span className="text-sm">Expense Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-financial-report">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">Financial Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-budget-planning">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-sm">Budget Planning</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <DataTable
          title="Maintenance Requests from Departments"
          data={maintenanceRequests}
          columns={maintenanceColumns}
          actions={maintenanceActions}
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
          onAdd={() => console.log("Add expense")}
          addButtonLabel="Add Expense"
          searchPlaceholder="Search expenses..."
        />

        {/* Vendor Management */}
        <DataTable
          title="Vendor Management"
          data={vendors}
          columns={vendorColumns}
          actions={vendorActions}
          onAdd={() => console.log("Add vendor")}
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
                  <p className="text-sm text-green-700">+12.5% this month</p>
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
                  <p className="text-sm text-red-700">+8.2% this month</p>
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
                  <p className="text-sm text-blue-700">+15.8% this month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
