import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Clock, CheckSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getStatusColor } from "@/lib/utils";

export default function StorekeeperDashboard() {
  const { user } = useAuth();

  const { data: inventoryItems = [], isLoading: loadingInventory } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: lowStockItems = [], isLoading: loadingLowStock } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/low-stock-items"]
  });

  const { data: consumptions = [], isLoading: loadingConsumptions } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-consumptions"]
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery<any[]>({
    queryKey: ["/api/tasks/my-tasks"]
  });

  const pendingTasks = tasks.filter((t: any) => t.status === 'pending');
  const dutyStatus = (user as any)?.dutyStatus || 'off';

  const recentActivity = consumptions.slice(0, 10).map((consumption: any) => {
    const item = inventoryItems.find((i: any) => i.id === consumption.inventoryItemId);
    return {
      ...consumption,
      itemName: item?.name || 'Unknown Item'
    };
  });

  return (
    <DashboardLayout title="Storekeeper Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Items"
            value={inventoryItems.length}
            icon={<Package />}
            iconColor="text-blue-500"
            data-testid="stat-total-items"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={lowStockItems.length}
            icon={<AlertTriangle />}
            iconColor="text-red-500"
            data-testid="stat-low-stock"
          />
          <StatsCard
            title="Duty Status"
            value={dutyStatus === 'on' ? 'On Duty' : 'Off Duty'}
            icon={<Clock />}
            iconColor={dutyStatus === 'on' ? 'text-green-500' : 'text-gray-500'}
            data-testid="stat-duty-status"
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<CheckSquare />}
            iconColor="text-orange-500"
            data-testid="stat-pending-tasks"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Inventory Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingConsumptions ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4" data-testid="no-activity-message">
                No recent inventory activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity: any, index: number) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`activity-item-name-${activity.id}`}>
                        {activity.itemName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {activity.qty} {activity.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.type === 'wastage' ? 'destructive' : 'default'}>
                        {activity.type || 'consumption'}
                      </Badge>
                      {activity.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950"
                    data-testid={`low-stock-item-${item.id}`}
                  >
                    <div>
                      <p className="font-medium" data-testid={`low-stock-name-${item.id}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.currentQty} {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      Min: {item.minQty} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
