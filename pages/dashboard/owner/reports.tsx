import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChart, FileText, Download, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  const [reportType, setReportType] = useState('financial');

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions", dateRange]
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

  // Calculate report metrics
  const totalRevenue = transactions
    .filter(t => t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.txnType === 'cash_out' || t.txnType === 'vendor_payment')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const occupancyRate = rooms.length > 0 ? 
    (rooms.filter(r => r.isOccupied).length / rooms.length) * 100 : 0;

  const activeStaff = staff.filter(s => s.isActive).length;

  const generateReport = () => {
    console.log("Generating report:", { reportType, dateRange });
    // TODO: Implement report generation
  };

  const exportReport = (format: string) => {
    console.log("Exporting report in format:", format);
    // TODO: Implement report export
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
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
                  <span>Online Now:</span>
                  <span className="font-bold">{staff.filter(s => s.isOnline).length}</span>
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

        {/* Recent Activity Summary */}
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
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <div key={transaction.id || index} className="flex justify-between text-sm">
                        <span className="truncate">{transaction.txnType?.replace(/_/g, ' ')}</span>
                        <span className={`font-medium ${
                          transaction.txnType?.includes('in') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Number(transaction.amount))}
                        </span>
                      </div>
                    ))}
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
      </div>
    </DashboardLayout>
  );
}