import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChart, FileText, Download, TrendingUp, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  const [reportType, setReportType] = useState('financial');

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/rooms"],
    refetchInterval: 3000
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vendors"],
    refetchInterval: 3000
  });

  // Real-time updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    events: ['transaction:created', 'transaction:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/rooms"],
    refetchInterval: 3000,
    events: ['room:updated', 'room:created']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000,
    events: ['user:created', 'user:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000,
    events: ['inventory:created', 'inventory:updated', 'inventory:deleted']
  });

  useRealtimeQuery({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000,
    events: ['attendance:updated']
  });

  const filteredTransactions = transactions.filter(t => {
    const txnDate = new Date(t.createdAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return txnDate >= fromDate && txnDate <= toDate;
  });

  const totalRevenue = filteredTransactions
    .filter(t => t.txnType === 'revenue')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.txnType === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const occupancyRate = rooms.length > 0 ? 
    (rooms.filter(r => r.isOccupied).length / rooms.length) * 100 : 0;

  const activeStaff = staff.filter(s => s.isActive).length;

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReport = (format: string) => {
    const dateFrom = new Date(dateRange.from).toLocaleDateString();
    const dateTo = new Date(dateRange.to).toLocaleDateString();
    
    if (format === 'financial') {
      let csv = `Financial Report (${dateFrom} - ${dateTo})\n\n`;
      csv += `SUMMARY\n`;
      csv += `Total Revenue,${totalRevenue}\n`;
      csv += `Total Expenses,${totalExpenses}\n`;
      csv += `Net Profit,${totalRevenue - totalExpenses}\n`;
      csv += `Profit Margin,${totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0}%\n\n`;
      
      csv += `TRANSACTIONS\n`;
      csv += `Date,Type,Purpose,Amount,Payment Method\n`;
      filteredTransactions.forEach(txn => {
        csv += `${new Date(txn.createdAt).toLocaleDateString()},${txn.txnType},"${txn.purpose || ''}",${txn.amount},${txn.paymentMethod || ''}\n`;
      });
      
      downloadCSV(csv, `financial_report_${dateRange.from}_to_${dateRange.to}.csv`);
      toast({ title: "Financial Report Exported", description: "CSV file downloaded successfully" });
    } else if (format === 'occupancy') {
      let csv = `Occupancy Report (${dateFrom} - ${dateTo})\n\n`;
      csv += `Room Number,Type,Status,Occupied\n`;
      rooms.forEach(room => {
        csv += `${room.roomNumber},${room.type || 'Standard'},${room.isOccupied ? 'Occupied' : 'Available'},${room.isOccupied ? 'Yes' : 'No'}\n`;
      });
      csv += `\nSUMMARY\n`;
      csv += `Total Rooms,${rooms.length}\n`;
      csv += `Occupied Rooms,${rooms.filter(r => r.isOccupied).length}\n`;
      csv += `Available Rooms,${rooms.filter(r => !r.isOccupied).length}\n`;
      csv += `Occupancy Rate,${occupancyRate.toFixed(1)}%\n`;
      
      downloadCSV(csv, `occupancy_report_${dateRange.from}_to_${dateRange.to}.csv`);
      toast({ title: "Occupancy Report Exported", description: "CSV file downloaded successfully" });
    } else if (format === 'staff') {
      let csv = `Staff Report (${dateFrom} - ${dateTo})\n\n`;
      csv += `Username,Full Name,Role,Status,Email\n`;
      staff.forEach(member => {
        csv += `${member.username},${member.fullName || ''},${member.role?.name || ''},${member.isActive ? 'Active' : 'Inactive'},${member.email || ''}\n`;
      });
      csv += `\nSUMMARY\n`;
      csv += `Total Staff,${staff.length}\n`;
      csv += `Active Staff,${activeStaff}\n`;
      csv += `Inactive Staff,${staff.length - activeStaff}\n`;
      
      downloadCSV(csv, `staff_report_${dateRange.from}_to_${dateRange.to}.csv`);
      toast({ title: "Staff Report Exported", description: "CSV file downloaded successfully" });
    }
  };

  const generateReport = () => {
    exportReport(reportType);
  };

  return (
    <DashboardLayout title="Financial Report">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">Comprehensive financial insights and analytics</p>
        </div>

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
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="occupancy">Occupancy Report</SelectItem>
                    <SelectItem value="staff">Staff Report</SelectItem>
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
                  data-testid="input-date-from"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  data-testid="input-date-to"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex gap-2">
                  <Button onClick={generateReport} className="flex-1" data-testid="button-generate">
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  data-testid="button-export-financial"
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
                  data-testid="button-export-occupancy"
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
                  data-testid="button-export-staff"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Staff Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </DashboardLayout>
  );
}
