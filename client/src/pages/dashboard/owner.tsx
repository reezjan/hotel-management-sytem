import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Bed, Users, TrendingUp, Package, AlertTriangle, Building2, Settings, Receipt, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"]
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/rooms"]
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"]
  });

  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"]
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"]
  });

  // Calculate real metrics without fake trends
  const totalRevenue = transactions
    .filter(t => t.txnType === 'revenue')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  const occupiedRooms = rooms.filter(r => r.isOccupied).length;
  const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;
  const lowStockItems = inventory.filter(item => 
    Number(item.baseStockQty) <= Number(item.reorderLevel)
  ).length;


  return (
    <DashboardLayout title="Owner Dashboard" currentHotel={hotel?.name}>
      <div className="space-y-6">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Room Occupancy"
            value={`${occupancyRate.toFixed(0)}%`}
            icon={<Bed />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Total Staff"
            value={users.length}
            icon={<Users />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Low Stock Items"
            value={lowStockItems}
            icon={<AlertTriangle />}
            iconColor="text-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-audit" onClick={() => setLocation("/owner/audit-transparency")}>
                <Shield className="h-6 w-6" />
                <span className="text-sm">Audit & Transparency</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-financial" onClick={() => setLocation("/owner/financial")}>
                <Receipt className="h-6 w-6" />
                <span className="text-sm">Financial</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-occupancy" onClick={() => setLocation("/owner/occupancy")}>
                <Bed className="h-6 w-6" />
                <span className="text-sm">Occupancy</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-staff" onClick={() => setLocation("/owner/staff")}>
                <Users className="h-6 w-6" />
                <span className="text-sm">Staff</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transactions:</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  View detailed financial reports in Financial Overview
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Room Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Rooms:</span>
                  <span className="font-bold">{rooms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupied:</span>
                  <span className="font-medium text-blue-600">{occupiedRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-medium text-green-600">{rooms.length - occupiedRooms}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  View detailed room status in Room Occupancy
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Staff:</span>
                  <span className="font-bold">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>On Duty:</span>
                  <span className="font-medium text-green-600">{users.filter(u => dailyAttendance.some(a => a.userId === u.id && a.status === 'active')).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium">{users.filter(u => u.isActive).length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Manage staff in Staff Management
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={transaction.id || index} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <div className="text-sm font-medium">{transaction.purpose || transaction.txnType?.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.paymentMethod?.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      transaction.txnType === 'revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Number(transaction.amount))}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent transactions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventory
                  .filter(item => Number(item.baseStockQty) <= Number(item.reorderLevel))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-orange-600">Low Stock</div>
                      </div>
                      <div className="text-sm">
                        {Number(item.baseStockQty).toFixed(2)} {item.baseUnit}
                        {item.packageUnit && ` (${Number(item.packageStockQty).toFixed(2)} ${item.packageUnit})`}
                      </div>
                    </div>
                  ))}
                {lowStockItems === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    All items are well stocked
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
