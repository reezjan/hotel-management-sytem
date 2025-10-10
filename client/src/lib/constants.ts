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

export const COUNTRIES = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AM", name: "Armenia", flag: "🇦🇲" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "BN", name: "Brunei", flag: "🇧🇳" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GE", name: "Georgia", flag: "🇬🇪" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "LA", name: "Laos", flag: "🇱🇦" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MV", name: "Maldives", flag: "🇲🇻" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "YE", name: "Yemen", flag: "🇾🇪" }
] as const;

export const NAVIGATION_ITEMS = {
  [ROLES.SUPER_ADMIN]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' }
  ],
  [ROLES.OWNER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Users', label: 'Guest Management', id: 'guests' },
    { icon: 'CalendarCheck', label: 'Hall Bookings', id: 'hall-bookings' },
    { icon: 'PieChart', label: 'Financial Overview', id: 'financial' },
    { icon: 'Package', label: 'Inventory Tracking', id: 'inventory' },
    { icon: 'Bed', label: 'Room Occupancy', id: 'occupancy' },
    { icon: 'Calculator', label: 'Tax Configuration', id: 'taxes' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'FileCheck', label: 'Leave Approvals', id: 'leave-approvals' },
    { icon: 'FileText', label: 'Report', id: 'report' },
    { icon: 'BarChart', label: 'Financial Report', id: 'reports' }
  ],
  [ROLES.MANAGER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Users', label: 'Guest Management', id: 'guests' },
    { icon: 'CalendarCheck', label: 'Hall Bookings', id: 'hall-bookings' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'ClipboardCheck', label: 'Attendance Reports', id: 'attendance' },
    { icon: 'CreditCard', label: 'Vendor Payments', id: 'payments' },
    { icon: 'Tag', label: 'Discount Vouchers', id: 'vouchers' },
    { icon: 'DoorOpen', label: 'Room Setup', id: 'rooms' },
    { icon: 'DollarSign', label: 'Room Pricing', id: 'pricing' },
    { icon: 'Waves', label: 'Amenities', id: 'amenities' },
    { icon: 'UtensilsCrossed', label: 'Meal Plans', id: 'meal-plans' },
    { icon: 'FileCheck', label: 'Leave Approvals', id: 'leave-approvals' },
    { icon: 'Receipt', label: 'Transactions', id: 'transactions' }
  ],
  [ROLES.CASHIER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Receipt', label: 'Table Billing', id: 'table-billing' },
    { icon: 'CalendarCheck', label: 'Hall Bookings', id: 'hall-bookings' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.FRONT_DESK]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Users', label: 'Guest Management', id: 'guests' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.HOUSEKEEPING_SUPERVISOR]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'Clock', label: 'Duty Tracking', id: 'duty' },
    { icon: 'DoorClosed', label: 'Room Cleaning Queue', id: 'cleaning-queue' },
    { icon: 'ClipboardList', label: 'Task Assignment', id: 'tasks' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' },
    { icon: 'MapPin', label: 'Staff Tracking', id: 'tracking' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.HOUSEKEEPING_STAFF]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.RESTAURANT_BAR_MANAGER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'UserCog', label: 'Staff Management', id: 'staff' },
    { icon: 'Package', label: 'Stock Requests', id: 'stock-requests' },
    { icon: 'Clock', label: 'Duty Tracking', id: 'duty' },
    { icon: 'ClipboardList', label: 'Task Assignment', id: 'tasks' },
    { icon: 'Menu', label: 'Menu Management', id: 'menu' },
    { icon: 'Table', label: 'Table Setup', id: 'tables' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' },
    { icon: 'CheckCircle', label: 'Leave Approvals', id: 'leave-approvals' }
  ],
  [ROLES.WAITER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'ShoppingCart', label: 'Orders', id: 'orders' },
    { icon: 'Receipt', label: 'Billing', id: 'billing' },
    { icon: 'Search', label: 'Food Search', id: 'search' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.KITCHEN_STAFF]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.BARTENDER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.BARISTA]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.SECURITY_HEAD]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' },
    { icon: 'CheckCircle', label: 'Leave Approvals', id: 'leave-approvals' }
  ],
  [ROLES.SECURITY_GUARD]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'Car', label: 'Vehicle Check', id: 'vehicles' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.SURVEILLANCE_OFFICER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Clock', label: 'Duty Status', id: 'duty' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'Car', label: 'Vehicle Logs', id: 'vehicles' },
    { icon: 'Wrench', label: 'Maintenance Reports', id: 'maintenance' },
    { icon: 'Package', label: 'Request Stock', id: 'request-stock' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.FINANCE]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'CalendarCheck', label: 'Hall Bookings', id: 'hall-bookings' },
    { icon: 'Receipt', label: 'Transactions', id: 'transactions' },
    { icon: 'TrendingUp', label: 'Revenue Reports', id: 'revenue' },
    { icon: 'TrendingDown', label: 'Expense Tracking', id: 'expenses' },
    { icon: 'DollarSign', label: 'Cash Flow', id: 'cashflow' },
    { icon: 'CreditCard', label: 'Payment Reconciliation', id: 'reconciliation' },
    { icon: 'FileText', label: 'Reports & Summary', id: 'reports' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ],
  [ROLES.STOREKEEPER]: [
    { icon: 'LayoutDashboard', label: 'Dashboard', id: 'dashboard' },
    { icon: 'Package', label: 'Inventory Tracking', id: 'inventory' },
    { icon: 'Edit', label: 'Inventory Management', id: 'management' },
    { icon: 'ClipboardCheck', label: 'Stock Requests', id: 'stock-requests' },
    { icon: 'Wrench', label: 'Maintenance Requests', id: 'maintenance' },
    { icon: 'CheckSquare', label: 'My Tasks', id: 'tasks' },
    { icon: 'FileCheck', label: 'Leave Requests', id: 'leave' }
  ]
};
