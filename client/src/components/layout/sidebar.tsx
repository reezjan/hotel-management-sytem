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
        'dashboard': '/super-admin',
        'hotels': '/super-admin/hotels',
        'owners': '/super-admin/owners',
        'superadmins': '/super-admin/superadmins',
        'alldata': '/super-admin/alldata',
        'deleted': '/super-admin/deleted',
        'analytics': '/super-admin/analytics'
      },
      'owner': {
        'dashboard': '/owner',
        'financial': '/owner/financial',
        'inventory': '/owner/inventory',
        'occupancy': '/owner/occupancy',
        'taxes': '/owner/taxes',
        'staff': '/owner/staff',
        'reports': '/owner/reports'
      },
      'manager': {
        'dashboard': '/manager',
        'staff': '/manager/staff',
        'payments': '/manager/vendor-payments',
        'vouchers': '/manager/discount-vouchers',
        'rooms': '/manager/room-setup',
        'amenities': '/manager/amenities',
        'transactions': '/manager/transactions'
      },
      'housekeeping_supervisor': {
        'dashboard': '/housekeeping-supervisor',
        'staff': '/staff-management',
        'duty': '/duty-tracking',
        'tasks': '/task-assignment',
        'maintenance': '/maintenance-requests',
        'tracking': '/staff-tracking'
      },
      'restaurant_bar_manager': {
        'dashboard': '/restaurant-bar-manager',
        'staff': '/restaurant-bar-manager/staff-management',
        'tables': '/restaurant-bar-manager/table-setup',
        'inventory': '/restaurant-bar-manager/inventory-tracking',
        'duty': '/restaurant-bar-manager/duty-tracking',
        'tasks': '/restaurant-bar-manager/task-assignment',
        'menu': '/restaurant-bar-manager/menu-management',
        'maintenance': '/restaurant-bar-manager/maintenance-requests',
        'leave': '/restaurant-bar-manager/leave-requests'
      },
      'security_head': {
        'dashboard': '/security-head',
        'staff': '/staff-management',
        'vehicles': '/vehicle-logs',
        'duty': '/duty-tracking',
        'tasks': '/task-assignment',
        'maintenance': '/maintenance-requests'
      },
      'finance': {
        'dashboard': '/finance',
        'maintenance': '/maintenance-requests',
        'cashout': '/cash-out-tracking',
        'payments': '/vendor-payments',
        'summary': '/financial-summary'
      },
      'waiter': {
        'dashboard': '/waiter',
        'duty': '/waiter/duty-status',
        'tasks': '/waiter/my-tasks',
        'orders': '/waiter/orders',
        'billing': '/waiter/billing',
        'search': '/waiter/food-search',
        'maintenance': '/waiter/maintenance'
      },
      'cashier': {
        'dashboard': '/cashier',
        'duty': '/duty-status',
        'tasks': '/task-management',
        'orders': '/orders',
        'billing': '/billing',
        'search': '/food-search',
        'print': '/print-bills'
      },
      'front_desk': {
        'dashboard': '/front-desk',
        'duty': '/duty-status',
        'tasks': '/task-management',
        'checkin': '/check-in-out',
        'roomservice': '/room-service',
        'reservations': '/reservations',
        'customers': '/customer-details',
        'print': '/print-receipts'
      },
      'surveillance_officer': {
        'dashboard': '/surveillance-officer',
        'duty': '/surveillance-officer/duty-status',
        'tasks': '/surveillance-officer/my-tasks',
        'vehicles': '/surveillance-officer/vehicle-logs',
        'maintenance': '/surveillance-officer/maintenance-reports'
      },
      'housekeeping_staff': {
        'dashboard': '/housekeeping-staff',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'maintenance': '/maintenance-reports'
      },
      'kitchen_staff': {
        'dashboard': '/kitchen-staff',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'kot': '/kot-orders',
        'maintenance': '/maintenance-reports'
      },
      'bartender': {
        'dashboard': '/bartender',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'kot': '/kot-orders',
        'maintenance': '/maintenance-reports'
      },
      'barista': {
        'dashboard': '/barista',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'kot': '/kot-orders',
        'maintenance': '/maintenance-reports'
      },
      'security_guard': {
        'dashboard': '/security-guard',
        'duty': '/duty-status',
        'tasks': '/my-tasks',
        'vehicles': '/vehicle-check',
        'maintenance': '/maintenance-reports'
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
      'front_desk': '/front-desk'
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
