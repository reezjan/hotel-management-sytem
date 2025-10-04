import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Bed, Users, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function OwnerDashboard() {
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
    queryKey: ["/api/hotels/current/inventory"]
  });

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"]
  });

  // Calculate real metrics without fake trends
  const totalRevenue = transactions
    .filter(t => t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  const occupiedRooms = rooms.filter(r => r.isOccupied).length;
  const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;
  const lowStockItems = inventory.filter(item => 
    Number(item.stockQty) <= Number(item.reorderLevel)
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
                  <span>Online:</span>
                  <span className="font-medium text-green-600">{users.filter(u => u.isOnline).length}</span>
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
                      <div className="text-sm font-medium">{transaction.txnType?.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-bold">
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
                  .filter(item => Number(item.stockQty) <= Number(item.reorderLevel))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-orange-600">Low Stock</div>
                      </div>
                      <div className="text-sm">
                        {item.stockQty} {item.unit}
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
