import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Utensils, Package, Calendar, ChefHat, Coffee } from "lucide-react";

export default function RestaurantBarManagerDashboard() {
  const [, setLocation] = useLocation();
  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"],
    refetchInterval: 3000
  });

  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/restaurant-tables"],
    refetchInterval: 3000
  });

  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  const { data: kotOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/kot-orders"],
    refetchInterval: 3000
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  const restaurantStaff = staff.filter(s => 
    ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'].includes(s.role?.name || '')
  );
  const onlineStaff = restaurantStaff.filter(s => {
    return dailyAttendance.some(a => a.userId === s.id && a.status === 'active');
  });
  const activeMenuItems = menuItems.filter(item => item.active);
  const lowStockItems = inventory.filter(item => 
    Number(item.stockQty) <= Number(item.reorderLevel)
  );

  const staffColumns = [
    { key: "username", label: "Name", sortable: true },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (value: any) => value?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    },
    { 
      key: "id", 
      label: "Status", 
      render: (userId: string) => {
        const isOnDuty = dailyAttendance.some(a => a.userId === userId && a.status === 'active');
        return (
          <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
          </span>
        );
      }
    },
    { 
      key: "lastLogin", 
      label: "Last Active", 
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }) : 'Never'
    }
  ];

  const menuColumns = [
    { key: "name", label: "Item", sortable: true },
    { 
      key: "category", 
      label: "Category", 
      render: (value: any, row: any) => row.category?.name || "Uncategorized"
    },
    { key: "price", label: "Price", sortable: true, render: (value: number) => `रु${value}` },
    { 
      key: "active", 
      label: "Status", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const tableColumns = [
    { key: "name", label: "Table", sortable: true },
    { key: "capacity", label: "Capacity", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      render: () => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Available</span>
      )
    }
  ];

  const inventoryColumns = [
    { key: "name", label: "Item", sortable: true },
    { key: "stockQty", label: "Stock", sortable: true },
    { key: "unit", label: "Unit", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      render: (value: any, row: any) => {
        const stock = Number(row.stockQty);
        const reorder = Number(row.reorderLevel);
        if (stock <= reorder) {
          return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Low Stock</span>;
        } else if (stock <= reorder * 1.5) {
          return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Medium</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">In Stock</span>;
      }
    }
  ];

  const staffActions = [
    { label: "View", action: () => setLocation("/restaurant-bar-manager/staff-management") }
  ];

  const menuActions = [
    { label: "Manage", action: () => setLocation("/restaurant-bar-manager/menu-management") }
  ];

  const tableActions = [
    { label: "Manage", action: () => setLocation("/restaurant-bar-manager/table-setup") }
  ];

  return (
    <DashboardLayout title="Restaurant & Bar Manager Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Staff Members"
            value={restaurantStaff.length}
            icon={<Users />}
            iconColor="text-blue-500"
            trend={{ 
              value: onlineStaff.length > 0 ? Math.round((onlineStaff.length / restaurantStaff.length) * 100) : 0, 
              label: "on duty", 
              isPositive: true 
            }}
          />
          <StatsCard
            title="Menu Items"
            value={activeMenuItems.length}
            icon={<Utensils />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Tables Available"
            value={tables.length}
            icon={<Calendar />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={lowStockItems.length}
            icon={<Package />}
            iconColor="text-red-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-add-staff"
                onClick={() => setLocation("/restaurant-bar-manager/staff-management")}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Staff</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-menu-management"
                onClick={() => setLocation("/restaurant-bar-manager/menu-management")}
              >
                <Utensils className="h-6 w-6" />
                <span className="text-sm">Menu Management</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-table-setup"
                onClick={() => setLocation("/restaurant-bar-manager/table-setup")}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Table Setup</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-inventory"
                onClick={() => setLocation("/restaurant-bar-manager/inventory-tracking")}
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">Inventory</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Staff Management */}
        <DataTable
          title="Restaurant Staff"
          data={restaurantStaff}
          columns={staffColumns}
          actions={staffActions}
          onAdd={() => setLocation("/restaurant-bar-manager/staff-management")}
          addButtonLabel="Add Staff Member"
          searchPlaceholder="Search staff..."
        />

        {/* Menu Management */}
        <DataTable
          title="Menu Management"
          data={menuItems}
          columns={menuColumns}
          actions={menuActions}
          onAdd={() => setLocation("/restaurant-bar-manager/menu-management")}
          addButtonLabel="Add Menu Item"
          searchPlaceholder="Search menu items..."
        />

        {/* Table Management */}
        <DataTable
          title="Table Management"
          data={tables}
          columns={tableColumns}
          actions={tableActions}
          onAdd={() => setLocation("/restaurant-bar-manager/table-setup")}
          addButtonLabel="Add Table"
          searchPlaceholder="Search tables..."
        />

        {/* Inventory Status */}
        <DataTable
          title="Inventory Status"
          data={inventory}
          columns={inventoryColumns}
          searchPlaceholder="Search inventory items..."
        />

        {/* Today's KOT Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's KOT Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="kot-summary-total">
                <div className="text-2xl font-bold text-blue-600">{kotOrders.length}</div>
                <div className="text-sm text-blue-700">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="kot-summary-completed">
                <div className="text-2xl font-bold text-green-600">{kotOrders.filter(k => k.status === 'served').length}</div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="kot-summary-preparing">
                <div className="text-2xl font-bold text-orange-600">{kotOrders.filter(k => k.status === 'preparing').length}</div>
                <div className="text-sm text-orange-700">Preparing</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="kot-summary-revenue">
                <div className="text-2xl font-bold text-purple-600">
                  रु{kotOrders.reduce((total, order) => {
                    if (order.status === 'served') {
                      // Calculate order total from items if available
                      return total + (order.total || 0);
                    }
                    return total;
                  }, 0).toLocaleString()}
                </div>
                <div className="text-sm text-purple-700">Today's Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {restaurantStaff.slice(0, 5).map((staff, index) => (
                <div key={staff.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg" data-testid={`staff-performance-${index}`}>
                  <div className="flex items-center space-x-3">
                    {staff.role?.name === 'waiter' && <Users className="h-5 w-5 text-blue-500" />}
                    {staff.role?.name === 'kitchen_staff' && <ChefHat className="h-5 w-5 text-green-500" />}
                    {staff.role?.name === 'bartender' && <Coffee className="h-5 w-5 text-purple-500" />}
                    {staff.role?.name === 'barista' && <Coffee className="h-5 w-5 text-orange-500" />}
                    {staff.role?.name === 'cashier' && <Users className="h-5 w-5 text-red-500" />}
                    <div>
                      <h4 className="font-medium text-foreground">{staff.username}</h4>
                      <p className="text-sm text-muted-foreground">
                        {staff.role?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const isOnDuty = dailyAttendance.some(a => a.userId === staff.id && a.status === 'active');
                      return (
                        <>
                          <div className="text-sm font-medium text-foreground">
                            {isOnDuty ? 'On Duty' : 'Available'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isOnDuty ? 'Currently on duty' : 'Off duty'}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
