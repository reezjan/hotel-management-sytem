import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, CheckSquare, ClipboardList, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function StorekeeperDashboard() {
  const [, setLocation] = useLocation();

  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  const { data: lowStockItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/low-stock-items"],
    refetchInterval: 3000
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks/my-tasks"],
    refetchInterval: 3000
  });

  const { data: stockRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/stock-requests/pending"],
    refetchInterval: 3000
  });

  // Real-time updates for stock requests
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/stock-requests/pending"],
    refetchInterval: 3000,
    events: ['stock-request:created', 'stock-request:updated']
  });

  // Real-time updates for inventory and tasks
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000,
    events: ['stock:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/tasks/my-tasks"],
    refetchInterval: 3000,
    events: ['task:created', 'task:updated', 'task:deleted']
  });

  const pendingTasks = tasks.filter((t: any) => t.status === 'pending');

  const menuItems = [
    {
      title: "सामान हेर्नुहोस् / View Stock",
      subtitle: `${inventoryItems.length} items in store`,
      icon: <Package className="h-12 w-12" />,
      color: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      route: "/storekeeper/inventory-tracking",
      badge: null,
      testId: "button-view-stock"
    },
    {
      title: "कम सामान / Low Stock",
      subtitle: lowStockItems.length > 0 ? `${lowStockItems.length} items need reorder` : "All items are in stock",
      icon: <AlertTriangle className="h-12 w-12" />,
      color: lowStockItems.length > 0 ? "bg-red-50 hover:bg-red-100" : "bg-gray-50 hover:bg-gray-100",
      iconColor: lowStockItems.length > 0 ? "text-red-600" : "text-gray-400",
      route: "/storekeeper/inventory-tracking",
      badge: lowStockItems.length > 0 ? lowStockItems.length : null,
      testId: "button-low-stock"
    },
    {
      title: "सामान दिनु/लिनु / Give/Receive Stock",
      subtitle: "Manage inventory in/out",
      icon: <Settings className="h-12 w-12" />,
      color: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
      route: "/storekeeper/inventory-management",
      badge: null,
      testId: "button-manage-stock"
    },
    {
      title: "माग आएको / Stock Requests",
      subtitle: stockRequests.length > 0 ? `${stockRequests.length} pending requests` : "No pending requests",
      icon: <ClipboardList className="h-12 w-12" />,
      color: stockRequests.length > 0 ? "bg-orange-50 hover:bg-orange-100" : "bg-gray-50 hover:bg-gray-100",
      iconColor: stockRequests.length > 0 ? "text-orange-600" : "text-gray-400",
      route: "/storekeeper/stock-requests",
      badge: stockRequests.length > 0 ? stockRequests.length : null,
      testId: "button-stock-requests"
    },
    {
      title: "मेरो काम / My Tasks",
      subtitle: pendingTasks.length > 0 ? `${pendingTasks.length} tasks pending` : "No pending tasks",
      icon: <CheckSquare className="h-12 w-12" />,
      color: pendingTasks.length > 0 ? "bg-purple-50 hover:bg-purple-100" : "bg-gray-50 hover:bg-gray-100",
      iconColor: pendingTasks.length > 0 ? "text-purple-600" : "text-gray-400",
      route: "/storekeeper/my-tasks",
      badge: pendingTasks.length > 0 ? pendingTasks.length : null,
      testId: "button-my-tasks"
    }
  ];

  return (
    <DashboardLayout title="स्टोर व्यवस्थापक / Storekeeper">
      <div className="space-y-6 p-2 sm:p-6">
        {/* Status Summary */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Store Status</h2>
                <p className="text-blue-100">Everything at a glance</p>
              </div>
              <Package className="h-16 w-16 opacity-50" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-3xl font-bold">{inventoryItems.length}</div>
                <div className="text-sm text-blue-100">Total Items</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-3xl font-bold">{lowStockItems.length}</div>
                <div className="text-sm text-blue-100">Low Stock</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-3xl font-bold">{stockRequests.length}</div>
                <div className="text-sm text-blue-100">Requests</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-3xl font-bold">{pendingTasks.length}</div>
                <div className="text-sm text-blue-100">Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Menu - Large Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Card
              key={item.route}
              className={`${item.color} border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg relative`}
              onClick={() => setLocation(item.route)}
              data-testid={item.testId}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`${item.iconColor} flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-base">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  {item.badge !== null && (
                    <Badge className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-red-500 text-white text-lg font-bold">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-red-900 text-lg">
                    ⚠️ Attention! / ध्यान दिनुहोस्!
                  </h4>
                  <p className="text-red-700 text-base">
                    {lowStockItems.length} items are running low. Please check and reorder.
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    {lowStockItems.length} सामान सकिँदै छ। कृपया जाँच गर्नुहोस्।
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Requests Alert */}
        {stockRequests.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <ClipboardList className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-orange-900 text-lg">
                    📋 New Requests / नयाँ माग
                  </h4>
                  <p className="text-orange-700 text-base">
                    {stockRequests.length} staff members are waiting for stock. Click "Stock Requests" above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
