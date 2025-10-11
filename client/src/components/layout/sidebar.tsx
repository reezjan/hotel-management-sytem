import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { useLocation } from "wouter";
import * as Icons from "lucide-react";

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps = {}) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  const userRole = user?.role?.name;
  const navigationItems = userRole ? (NAVIGATION_ITEMS as any)[userRole] || [] : [];

  const getItemPath = (itemId: string, role: string) => {
    const pathMaps: Record<string, Record<string, string>> = {
      'super_admin': {
        'dashboard': '/',
        'hotels': '/super-admin/hotels',
        'owners': '/super-admin/owners',
        'superadmins': '/super-admin/superadmins',
        'alldata': '/super-admin/alldata',
        'deleted': '/super-admin/deleted',
        'analytics': '/super-admin/analytics'
      },
      'owner': {
        'dashboard': '/owner',
        'guests': '/guests',
        'hall-bookings': '/hall-bookings',
        'financial': '/owner/financial',
        'inventory': '/owner/inventory',
        'occupancy': '/owner/occupancy',
        'amenities': '/owner/amenities',
        'vouchers': '/owner/vouchers',
        'taxes': '/owner/taxes',
        'staff': '/owner/staff',
        'leave-policies': '/owner/leave-policies',
        'leave-approvals': '/owner/leave-approvals',
        'report': '/owner/report',
        'reports': '/owner/reports'
      },
      'manager': {
        'dashboard': '/manager',
        'guests': '/guests',
        'hall-bookings': '/hall-bookings',
        'staff': '/manager/staff',
        'attendance': '/manager/attendance-reports',
        'payments': '/manager/vendor-payments',
        'vouchers': '/manager/discount-vouchers',
        'rooms': '/manager/room-setup',
        'pricing': '/manager/room-pricing',
        'amenities': '/manager/amenities',
        'meal-plans': '/manager/meal-plans',
        'maintenance-requests': '/manager/maintenance-requests',
        'leave-approvals': '/manager/leave-approvals',
        'transactions': '/manager/transactions'
      },
      'housekeeping_supervisor': {
        'dashboard': '/housekeeping-supervisor',
        'staff': '/housekeeping-supervisor/staff-management',
        'duty': '/housekeeping-supervisor/duty-tracking',
        'cleaning-queue': '/housekeeping-supervisor/cleaning-queue',
        'tasks': '/housekeeping-supervisor/task-assignment',
        'maintenance': '/housekeeping-supervisor/maintenance-requests',
        'tracking': '/housekeeping-supervisor/staff-tracking',
        'leave': '/housekeeping-supervisor/leave-requests'
      },
      'restaurant_bar_manager': {
        'dashboard': '/restaurant-bar-manager',
        'staff': '/restaurant-bar-manager/staff-management',
        'tables': '/restaurant-bar-manager/table-setup',
        'stock-requests': '/restaurant-bar-manager/stock-requests',
        'duty': '/restaurant-bar-manager/duty-tracking',
        'tasks': '/restaurant-bar-manager/task-assignment',
        'menu': '/restaurant-bar-manager/menu-management',
        'maintenance': '/restaurant-bar-manager/maintenance-requests',
        'leave': '/restaurant-bar-manager/leave-requests',
        'leave-approvals': '/restaurant-bar-manager/leave-approvals'
      },
      'security_head': {
        'dashboard': '/security-head',
        'request-stock': '/security-head/request-stock',
        'leave': '/security-head/leave-requests',
        'leave-approvals': '/security-head/leave-approvals'
      },
      'finance': {
        'dashboard': '/finance',
        'hall-bookings': '/hall-bookings',
        'transactions': '/finance/transactions',
        'revenue': '/finance/revenue',
        'expenses': '/finance/expenses',
        'cashflow': '/finance/cashflow',
        'reconciliation': '/finance/reconciliation',
        'reports': '/finance/reports',
        'maintenance-requests': '/finance/maintenance-requests',
        'leave': '/leave-requests'
      },
      'waiter': {
        'dashboard': '/waiter',
        'duty': '/waiter/duty-status',
        'tasks': '/waiter/my-tasks',
        'orders': '/waiter/orders',
        'billing': '/waiter/billing',
        'search': '/waiter/food-search',
        'request-stock': '/waiter/request-stock',
        'maintenance': '/waiter/maintenance',
        'leave': '/leave-requests'
      },
      'cashier': {
        'dashboard': '/cashier',
        'table-billing': '/cashier/table-billing',
        'hall-bookings': '/hall-bookings',
        'maintenance': '/cashier/maintenance',
        'leave': '/leave-requests'
      },
      'front_desk': {
        'dashboard': '/front-desk',
        'guests': '/guests',
        'hall-bookings': '/hall-bookings',
        'request-stock': '/front-desk/request-stock',
        'maintenance': '/front-desk/maintenance-requests',
        'leave': '/leave-requests'
      },
      'surveillance_officer': {
        'dashboard': '/surveillance-officer',
        'duty': '/surveillance-officer/duty-status',
        'tasks': '/surveillance-officer/my-tasks',
        'vehicles': '/surveillance-officer/vehicle-logs',
        'maintenance': '/surveillance-officer/maintenance-reports',
        'request-stock': '/surveillance-officer/request-stock',
        'leave': '/leave-requests'
      },
      'housekeeping_staff': {
        'dashboard': '/housekeeping-staff',
        'duty': '/housekeeping-staff/duty-status',
        'tasks': '/housekeeping-staff/my-tasks',
        'request-stock': '/housekeeping-staff/request-stock',
        'maintenance': '/housekeeping-staff/maintenance-reports',
        'leave': '/leave-requests'
      },
      'kitchen_staff': {
        'dashboard': '/kitchen-staff',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'kot': '/kot-orders',
        'request-stock': '/kitchen-staff/request-stock',
        'maintenance': '/kitchen-staff/maintenance',
        'leave': '/leave-requests'
      },
      'bartender': {
        'dashboard': '/bartender',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'kot': '/kot-orders',
        'request-stock': '/bartender/request-stock',
        'maintenance': '/bartender/maintenance',
        'leave': '/leave-requests'
      },
      'barista': {
        'dashboard': '/barista',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'kot': '/kot-orders',
        'request-stock': '/barista/request-stock',
        'maintenance': '/barista/maintenance',
        'leave': '/leave-requests'
      },
      'security_guard': {
        'dashboard': '/security-guard',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'vehicles': '/vehicle-check',
        'maintenance': '/maintenance-reports',
        'request-stock': '/security-guard/request-stock',
        'leave': '/leave-requests'
      },
      'storekeeper': {
        'dashboard': '/storekeeper',
        'duty': '/storekeeper/duty-status',
        'inventory': '/storekeeper/inventory-tracking',
        'management': '/storekeeper/inventory-management',
        'stock-requests': '/storekeeper/stock-requests',
        'maintenance': '/storekeeper/maintenance-requests',
        'tasks': '/storekeeper/my-tasks',
        'leave': '/leave-requests'
      }
    };

    const rolePathMap = pathMaps[role];
    if (rolePathMap && rolePathMap[itemId]) {
      return rolePathMap[itemId];
    }
    
    // Fallback to role base path
    const roleDashboards: Record<string, string> = {
      'super_admin': '/super-admin',
      'owner': '/owner',
      'manager': '/manager',
      'housekeeping_supervisor': '/housekeeping-supervisor',
      'housekeeping_staff': '/housekeeping-staff',
      'restaurant_bar_manager': '/restaurant-bar-manager',
      'waiter': '/waiter',
      'kitchen_staff': '/kitchen-staff',
      'bartender': '/bartender',
      'barista': '/barista',
      'cashier': '/cashier',
      'security_head': '/security-head',
      'security_guard': '/security-guard',
      'surveillance_officer': '/surveillance-officer',
      'finance': '/finance',
      'front_desk': '/front-desk',
      'storekeeper': '/storekeeper'
    };
    
    return roleDashboards[role] || `/${role}`;
  };

  const isActiveItem = (itemId: string) => {
    if (!userRole) return false;
    const expectedPath = getItemPath(itemId, userRole);
    return location === expectedPath;
  };

  const handleItemClick = (itemId: string) => {
    if (!userRole) return;
    const path = getItemPath(itemId, userRole);
    setLocation(path);
    onItemClick?.();
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Icons.Circle className="w-4 h-4" />;
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-80px)] overflow-y-auto" data-testid="sidebar">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item: any) => (
          <Button
            key={item.id}
            variant={isActiveItem(item.id) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start space-x-3",
              isActiveItem(item.id) && "bg-primary text-primary-foreground"
            )}
            onClick={() => handleItemClick(item.id)}
            data-testid={`nav-item-${item.id}`}
          >
            {getIcon(item.icon)}
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
