export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  HOUSEKEEPING_SUPERVISOR: 'housekeeping_supervisor',
  HOUSEKEEPING_STAFF: 'housekeeping_staff',
  RESTAURANT_BAR_MANAGER: 'restaurant_bar_manager',
  WAITER: 'waiter',
  KITCHEN_STAFF: 'kitchen_staff',
  BARTENDER: 'bartender',
  BARISTA: 'barista',
  CASHIER: 'cashier',
  SECURITY_HEAD: 'security_head',
  SECURITY_GUARD: 'security_guard',
  SURVEILLANCE_OFFICER: 'surveillance_officer',
  FINANCE: 'finance',
  FRONT_DESK: 'front_desk',
  STOREKEEPER: 'storekeeper'
} as const;

export const ROLE_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.OWNER]: 'Hotel Owner',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.HOUSEKEEPING_SUPERVISOR]: 'Housekeeping Supervisor',
  [ROLES.HOUSEKEEPING_STAFF]: 'Housekeeping Staff',
  [ROLES.RESTAURANT_BAR_MANAGER]: 'Restaurant & Bar Manager',
  [ROLES.WAITER]: 'Waiter',
  [ROLES.KITCHEN_STAFF]: 'Kitchen Staff',
  [ROLES.BARTENDER]: 'Bartender',
  [ROLES.BARISTA]: 'Barista',
  [ROLES.CASHIER]: 'Cashier',
  [ROLES.SECURITY_HEAD]: 'Security Head',
  [ROLES.SECURITY_GUARD]: 'Security Guard',
  [ROLES.SURVEILLANCE_OFFICER]: 'Surveillance Officer',
  [ROLES.FINANCE]: 'Finance',
  [ROLES.FRONT_DESK]: 'Front Desk',
  [ROLES.STOREKEEPER]: 'Storekeeper'
} as const;

export const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: '/',
  [ROLES.OWNER]: '/owner',
  [ROLES.MANAGER]: '/manager',
  [ROLES.HOUSEKEEPING_SUPERVISOR]: '/housekeeping-supervisor',
  [ROLES.HOUSEKEEPING_STAFF]: '/housekeeping-staff',
  [ROLES.RESTAURANT_BAR_MANAGER]: '/restaurant-bar-manager',
  [ROLES.WAITER]: '/waiter',
  [ROLES.KITCHEN_STAFF]: '/kitchen-staff',
  [ROLES.BARTENDER]: '/bartender',
  [ROLES.BARISTA]: '/barista',
  [ROLES.CASHIER]: '/cashier',
  [ROLES.SECURITY_HEAD]: '/security-head',
  [ROLES.SECURITY_GUARD]: '/security-guard',
  [ROLES.SURVEILLANCE_OFFICER]: '/surveillance-officer',
  [ROLES.FINANCE]: '/finance',
  [ROLES.FRONT_DESK]: '/front-desk',
  [ROLES.STOREKEEPER]: '/storekeeper'
} as const;

export const DUTY_ROLES = [
  ROLES.HOUSEKEEPING_STAFF,
  ROLES.WAITER,
  ROLES.KITCHEN_STAFF,
  ROLES.BARTENDER,
  ROLES.BARISTA,
  ROLES.CASHIER,
  ROLES.SECURITY_GUARD,
  ROLES.SURVEILLANCE_OFFICER,
  ROLES.FRONT_DESK,
  ROLES.STOREKEEPER
];

export const TASK_STATUSES = {
  PENDING: 'pending',
  PERFORMING: 'performing',
  COMPLETED: 'completed'
} as const;

export const TRANSACTION_TYPES = {
  CASH_IN: 'cash_in',
  CASH_OUT: 'cash_out',
  VENDOR_PAYMENT: 'vendor_payment',
  POS_IN: 'pos_in',
  FONEPAY_IN: 'fonepay_in'
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  POS: 'pos',
  FONEPAY: 'fonepay'
} as const;

export const KOT_STATUSES = {
  OPEN: 'open',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served'
} as const;

export const MAINTENANCE_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export const ROOM_TYPES = {
  DELUXE: 'deluxe',
  SUITE: 'suite',
  PRESIDENTIAL: 'presidential'
} as const;

export const TAX_TYPES = {
  VAT: 'vat',
  SERVICE_TAX: 'service_tax',
  LUXURY_TAX: 'luxury_tax'
} as const;

export const NAVIGATION_ITEMS = {
  [ROLES.SUPER_ADMIN]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Hotel', label: 'Hotel Management', id: 'hotels' },
    { icon: 'Users', label: 'Owner Management', id: 'owners' },
    { icon: 'Shield', label: 'Super Admin Accounts', id: 'superadmins' },
    { icon: 'Database', label: 'All Data Access', id: 'alldata' },
    { icon: 'Trash2', label: 'Deleted Records', id: 'deleted' },
    { icon: 'TrendingUp', label: 'System Analytics', id: 'analytics' }
  ],
  [ROLES.OWNER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'PieChart', label: 'Financial Overview', id: 'financial' },
    { icon: 'Package', label: 'Inventory Tracking', id: 'inventory' },
    { icon: 'Bed', label: 'Room Occupancy', id: 'occupancy' },
    { icon: 'Calculator', label: 'Tax Configuration', id: 'taxes' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'BarChart', label: 'Reports', id: 'reports' }
  ],
  [ROLES.MANAGER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'CreditCard', label: 'Vendor Payments', id: 'payments' },
    { icon: 'Tag', label: 'Discount Vouchers', id: 'vouchers' },
    { icon: 'DoorOpen', label: 'Room Setup', id: 'rooms' },
    { icon: 'DollarSign', label: 'Room Pricing', id: 'pricing' },
    { icon: 'Waves', label: 'Amenities', id: 'amenities' },
    { icon: 'UtensilsCrossed', label: 'Meal Plans', id: 'meal-plans' },
    { icon: 'Receipt', label: 'Transactions', id: 'transactions' }
  ],
  [ROLES.CASHIER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' }
  ],
  [ROLES.FRONT_DESK]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' }
  ],
  [ROLES.HOUSEKEEPING_SUPERVISOR]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'Clock', label: 'Duty Tracking', id: 'duty' },
    { icon: 'ClipboardList', label: 'Task Assignment', id: 'tasks' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' },
    { icon: 'MapPin', label: 'Staff Tracking', id: 'tracking' }
  ],
  [ROLES.HOUSEKEEPING_STAFF]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' }
  ],
  [ROLES.RESTAURANT_BAR_MANAGER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'Package', label: 'Inventory Tracking', id: 'inventory' },
    { icon: 'Clock', label: 'Duty Tracking', id: 'duty' },
    { icon: 'ClipboardList', label: 'Task Assignment', id: 'tasks' },
    { icon: 'Menu', label: 'Menu Management', id: 'menu' },
    { icon: 'Table', label: 'Table Setup', id: 'tables' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' }
  ],
  [ROLES.WAITER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'ShoppingCart', label: 'Orders', id: 'orders' },
    { icon: 'Receipt', label: 'Billing', id: 'billing' },
    { icon: 'Search', label: 'Food Search', id: 'search' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' }
  ],
  [ROLES.KITCHEN_STAFF]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'ClipboardList', label: 'KOT Orders', id: 'kot' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' }
  ],
  [ROLES.BARTENDER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'ClipboardList', label: 'KOT Orders', id: 'kot' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' }
  ],
  [ROLES.BARISTA]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'ClipboardList', label: 'KOT Orders', id: 'kot' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' }
  ],
  [ROLES.SECURITY_HEAD]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'UserCog', label: 'Guard Management', id: 'staff' },
    { icon: 'Clock', label: 'Duty Tracking', id: 'duty' },
    { icon: 'ClipboardList', label: 'Task Assignment', id: 'tasks' },
    { icon: 'Car', label: 'Vehicle Logs', id: 'vehicles' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' }
  ],
  [ROLES.SECURITY_GUARD]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'Car', label: 'Vehicle Check', id: 'vehicles' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' }
  ],
  [ROLES.SURVEILLANCE_OFFICER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'Car', label: 'Vehicle Logs', id: 'vehicles' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' }
  ],
  [ROLES.FINANCE]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' },
    { icon: 'TrendingDown', label: 'Cash Out Tracking', id: 'cashout' },
    { icon: 'CreditCard', label: 'Vendor Payments', id: 'payments' },
    { icon: 'PieChart', label: 'Financial Summary', id: 'summary' }
  ],
  [ROLES.STOREKEEPER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Package', label: 'Inventory Tracking', id: 'inventory' },
    { icon: 'Edit', label: 'Inventory Management', id: 'management' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'TrendingDown', label: 'Consumption Tracking', id: 'consumption' }
  ]
};
