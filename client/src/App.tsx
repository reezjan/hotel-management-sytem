import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ConfirmDialogProvider } from "@/hooks/use-confirm-dialog";
import { ProtectedRoute } from "./lib/protected-route";

// Eager load auth page only (needed immediately)
import AuthPage from "@/pages/auth-page";

// Lazy load all dashboard pages for code splitting
const NotFound = lazy(() => import("@/pages/not-found"));
const SuperAdminDashboard = lazy(() => import("@/pages/dashboard/super-admin"));
const OwnerDashboard = lazy(() => import("@/pages/dashboard/owner"));
const OwnerFinancialOverview = lazy(() => import("@/pages/dashboard/owner/financial-overview"));
const OwnerInventoryTracking = lazy(() => import("@/pages/dashboard/owner/inventory-tracking"));
const OwnerRoomOccupancy = lazy(() => import("@/pages/dashboard/owner/room-occupancy"));
const OwnerTaxConfiguration = lazy(() => import("@/pages/dashboard/owner/tax-configuration"));
const OwnerStaffManagement = lazy(() => import("@/pages/dashboard/owner/staff-management"));
const OwnerAttendanceReports = lazy(() => import("@/pages/dashboard/owner/attendance-reports"));
const OwnerLeavePolicies = lazy(() => import("@/pages/dashboard/owner/leave-policies"));
const OwnerReports = lazy(() => import("@/pages/dashboard/owner/reports"));
const OwnerReport = lazy(() => import("@/pages/dashboard/owner/report"));
const OwnerAuditTransparency = lazy(() => import("@/pages/dashboard/owner/audit-transparency"));
const OwnerAmenities = lazy(() => import("@/pages/dashboard/owner/amenities"));
const OwnerApprovals = lazy(() => import("@/pages/dashboard/owner/approvals"));
const ManagerDashboard = lazy(() => import("@/pages/dashboard/manager"));
const StaffManagement = lazy(() => import("@/pages/dashboard/manager/staff-management"));
const AttendanceReports = lazy(() => import("@/pages/dashboard/manager/attendance-reports"));
const VendorPayments = lazy(() => import("@/pages/dashboard/manager/vendor-payments"));
const DiscountVouchers = lazy(() => import("@/pages/dashboard/manager/discount-vouchers"));
const RoomSetup = lazy(() => import("@/pages/dashboard/manager/room-setup"));
const RoomPricing = lazy(() => import("@/pages/dashboard/manager/room-pricing"));
const AmenitiesSetup = lazy(() => import("@/pages/dashboard/manager/amenities"));
const ManagerTransactions = lazy(() => import("@/pages/dashboard/manager/transactions"));
const ManagerLeaveApprovals = lazy(() => import("@/pages/dashboard/manager/leave-approvals"));
const ManagerMealPlans = lazy(() => import("@/pages/dashboard/manager/meal-plans"));
const ManagerMaintenanceRequests = lazy(() => import("@/pages/dashboard/manager/maintenance-requests"));
const HousekeepingSupervisorDashboard = lazy(() => import("@/pages/dashboard/housekeeping-supervisor"));
const HousekeepingSupervisorStaffManagement = lazy(() => import("@/pages/dashboard/housekeeping-supervisor/staff-management"));
const HousekeepingSupervisorDutyTracking = lazy(() => import("@/pages/dashboard/housekeeping-supervisor/duty-tracking"));
const HousekeepingSupervisorCleaningQueue = lazy(() => import("@/pages/dashboard/housekeeping-supervisor/cleaning-queue"));
const HousekeepingSupervisorTaskAssignment = lazy(() => import("@/pages/dashboard/housekeeping-supervisor/task-assignment"));
const HousekeepingSupervisorMaintenanceRequests = lazy(() => import("@/pages/dashboard/housekeeping-supervisor/maintenance-requests"));
const HousekeepingSupervisorStaffTracking = lazy(() => import("@/pages/dashboard/housekeeping-supervisor/staff-tracking"));
const HousekeepingSupervisorLeaveRequests = lazy(() => import("@/pages/dashboard/housekeeping-supervisor/leave-requests"));
const HousekeepingStaffDashboard = lazy(() => import("@/pages/dashboard/housekeeping-staff"));
const HousekeepingStaffDutyStatus = lazy(() => import("@/pages/dashboard/housekeeping-staff/duty-status"));
const HousekeepingStaffMyTasks = lazy(() => import("@/pages/dashboard/housekeeping-staff/my-tasks"));
const HousekeepingStaffMaintenanceReports = lazy(() => import("@/pages/dashboard/housekeeping-staff/maintenance-reports"));
const RestaurantBarManagerDashboard = lazy(() => import("@/pages/dashboard/restaurant-bar-manager"));
const RestaurantStaffManagement = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/staff-management"));
const RestaurantTaskAssignment = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/task-assignment"));
const RestaurantMenuManagement = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/menu-management"));
const RestaurantTableSetup = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/table-setup"));
const RestaurantInventoryTracking = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/inventory-tracking"));
const RestaurantDutyTracking = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/duty-tracking"));
const RestaurantLeaveRequests = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/leave-requests"));
const RestaurantMaintenanceRequests = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/maintenance-requests"));
const RestaurantBarManagerWastage = lazy(() => import("@/pages/dashboard/restaurant-bar-manager/wastage"));
const WaiterDashboard = lazy(() => import("@/pages/dashboard/waiter"));
const WaiterMyTasks = lazy(() => import("@/pages/dashboard/waiter/my-tasks"));
const WaiterMaintenance = lazy(() => import("@/pages/dashboard/waiter/maintenance"));
const WaiterDutyStatus = lazy(() => import("@/pages/dashboard/waiter/duty-status"));
const WaiterOrders = lazy(() => import("@/pages/dashboard/waiter/orders"));
const WaiterBilling = lazy(() => import("@/pages/dashboard/waiter/billing"));
const WaiterFoodSearch = lazy(() => import("@/pages/dashboard/waiter/food-search"));
const KitchenStaffDashboard = lazy(() => import("@/pages/dashboard/kitchen-staff"));
const KitchenStaffMaintenance = lazy(() => import("@/pages/dashboard/kitchen-staff/maintenance"));
const BartenderDashboard = lazy(() => import("@/pages/dashboard/bartender"));
const BartenderMaintenance = lazy(() => import("@/pages/dashboard/bartender/maintenance"));
const BaristaDashboard = lazy(() => import("@/pages/dashboard/barista"));
const BaristaMaintenance = lazy(() => import("@/pages/dashboard/barista/maintenance"));
const CashierDashboard = lazy(() => import("@/pages/dashboard/cashier"));
const CashierTableBilling = lazy(() => import("@/pages/dashboard/cashier/table-billing"));
const CashierMaintenance = lazy(() => import("@/pages/dashboard/cashier/maintenance"));
const SecurityHeadDashboard = lazy(() => import("@/pages/dashboard/security-head"));
const SecurityHeadStaffManagement = lazy(() => import("@/pages/dashboard/security-head/staff-management"));
const SecurityHeadLeaveRequests = lazy(() => import("@/pages/dashboard/security-head/leave-requests"));
const SecurityHeadVehicleLogs = lazy(() => import("@/pages/dashboard/security-head/vehicle-logs"));
const SecurityGuardDashboard = lazy(() => import("@/pages/dashboard/security-guard"));
const SurveillanceOfficerDashboard = lazy(() => import("@/pages/dashboard/surveillance-officer"));
const SurveillanceOfficerDutyStatus = lazy(() => import("@/pages/dashboard/surveillance-officer/duty-status"));
const SurveillanceOfficerMyTasks = lazy(() => import("@/pages/dashboard/surveillance-officer/my-tasks"));
const SurveillanceOfficerVehicleLogs = lazy(() => import("@/pages/dashboard/surveillance-officer/vehicle-logs"));
const SurveillanceOfficerMaintenanceReports = lazy(() => import("@/pages/dashboard/surveillance-officer/maintenance-reports"));
const FinanceDashboard = lazy(() => import("@/pages/dashboard/finance"));
const FinanceTransactions = lazy(() => import("@/pages/dashboard/finance/transactions"));
const FinanceRevenue = lazy(() => import("@/pages/dashboard/finance/revenue"));
const FinanceExpenses = lazy(() => import("@/pages/dashboard/finance/expenses"));
const FinanceCashFlow = lazy(() => import("@/pages/dashboard/finance/cashflow"));
const FinanceReconciliation = lazy(() => import("@/pages/dashboard/finance/reconciliation"));
const FinanceReports = lazy(() => import("@/pages/dashboard/finance/reports"));
const FinanceMaintenanceRequests = lazy(() => import("@/pages/dashboard/finance/maintenance-requests"));
const FrontDeskDashboard = lazy(() => import("@/pages/dashboard/front-desk"));
const FrontdeskMaintenanceRequests = lazy(() => import("@/pages/dashboard/frontdesk/maintenance-requests"));
const GuestsPage = lazy(() => import("@/pages/dashboard/guests"));
const StorekeeperDashboard = lazy(() => import("@/pages/dashboard/storekeeper"));
const StorekeeperDutyStatus = lazy(() => import("@/pages/dashboard/storekeeper/duty-status"));
const StorekeeperInventoryTracking = lazy(() => import("@/pages/dashboard/storekeeper/inventory-tracking"));
const StorekeeperInventoryManagement = lazy(() => import("@/pages/dashboard/storekeeper/inventory-management"));
const StorekeeperMaintenanceRequests = lazy(() => import("@/pages/dashboard/storekeeper/maintenance-requests"));
const StorekeeperMyTasks = lazy(() => import("@/pages/dashboard/storekeeper/my-tasks"));
const RequestStock = lazy(() => import("@/pages/dashboard/stock-requests/request-stock"));
const StorekeeperStockRequests = lazy(() => import("@/pages/dashboard/storekeeper/stock-requests"));
const DepartmentStockRequests = lazy(() => import("@/pages/dashboard/department-stock-requests"));
const MyProfile = lazy(() => import("@/pages/dashboard/my-profile"));
const HallBookings = lazy(() => import("@/pages/dashboard/hall-bookings"));
const HallCalendar = lazy(() => import("@/pages/dashboard/hall-calendar"));
const BookingDetail = lazy(() => import("@/pages/dashboard/booking-detail"));
const LeaveRequests = lazy(() => import("@/pages/dashboard/leave-requests"));

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <ProtectedRoute path="/" component={SuperAdminDashboard} allowedRoles={["super_admin"]} />
        
        {/* Owner Routes */}
        <ProtectedRoute path="/owner" component={OwnerDashboard} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/financial" component={OwnerFinancialOverview} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/inventory" component={OwnerInventoryTracking} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/occupancy" component={OwnerRoomOccupancy} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/taxes" component={OwnerTaxConfiguration} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/staff" component={OwnerStaffManagement} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/attendance" component={OwnerAttendanceReports} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/leave-policies" component={OwnerLeavePolicies} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/leave-approvals" component={ManagerLeaveApprovals} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/report" component={OwnerReport} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/reports" component={OwnerReports} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/audit-transparency" component={OwnerAuditTransparency} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/amenities" component={OwnerAmenities} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/approvals" component={OwnerApprovals} allowedRoles={["owner"]} />
        <ProtectedRoute path="/owner/vouchers" component={DiscountVouchers} allowedRoles={["owner"]} />
        
        <ProtectedRoute path="/manager" component={ManagerDashboard} allowedRoles={["manager"]} />
        <ProtectedRoute path="/manager/staff" component={StaffManagement} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/attendance-reports" component={AttendanceReports} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/vendor-payments" component={VendorPayments} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/discount-vouchers" component={DiscountVouchers} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/room-setup" component={RoomSetup} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/room-pricing" component={RoomPricing} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/amenities" component={AmenitiesSetup} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/meal-plans" component={ManagerMealPlans} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/transactions" component={ManagerTransactions} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/leave-approvals" component={ManagerLeaveApprovals} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/manager/maintenance-requests" component={ManagerMaintenanceRequests} allowedRoles={["manager", "owner"]} />
        <ProtectedRoute path="/housekeeping-supervisor" component={HousekeepingSupervisorDashboard} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/staff-management" component={HousekeepingSupervisorStaffManagement} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/duty-tracking" component={HousekeepingSupervisorDutyTracking} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/cleaning-queue" component={HousekeepingSupervisorCleaningQueue} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/task-assignment" component={HousekeepingSupervisorTaskAssignment} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/maintenance-requests" component={HousekeepingSupervisorMaintenanceRequests} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/staff-tracking" component={HousekeepingSupervisorStaffTracking} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/leave-requests" component={HousekeepingSupervisorLeaveRequests} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-supervisor/leave-approvals" component={ManagerLeaveApprovals} allowedRoles={["housekeeping_supervisor"]} />
        <ProtectedRoute path="/housekeeping-staff" component={HousekeepingStaffDashboard} allowedRoles={["housekeeping_staff"]} />
        <ProtectedRoute path="/housekeeping-staff/duty-status" component={HousekeepingStaffDutyStatus} allowedRoles={["housekeeping_staff"]} />
        <ProtectedRoute path="/housekeeping-staff/my-tasks" component={HousekeepingStaffMyTasks} allowedRoles={["housekeeping_staff"]} />
        <ProtectedRoute path="/housekeeping-staff/request-stock" component={RequestStock} allowedRoles={["housekeeping_staff"]} />
        <ProtectedRoute path="/housekeeping-staff/maintenance-reports" component={HousekeepingStaffMaintenanceReports} allowedRoles={["housekeeping_staff"]} />
        <ProtectedRoute path="/restaurant-bar-manager" component={RestaurantBarManagerDashboard} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/staff-management" component={RestaurantStaffManagement} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/task-assignment" component={RestaurantTaskAssignment} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/menu-management" component={RestaurantMenuManagement} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/table-setup" component={RestaurantTableSetup} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/inventory-tracking" component={RestaurantInventoryTracking} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/stock-requests" component={DepartmentStockRequests} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/duty-tracking" component={RestaurantDutyTracking} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/leave-requests" component={RestaurantLeaveRequests} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/leave-approvals" component={ManagerLeaveApprovals} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/maintenance-requests" component={RestaurantMaintenanceRequests} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/restaurant-bar-manager/wastage" component={RestaurantBarManagerWastage} allowedRoles={["restaurant_bar_manager"]} />
        <ProtectedRoute path="/waiter" component={WaiterDashboard} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/waiter/my-tasks" component={WaiterMyTasks} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/waiter/maintenance" component={WaiterMaintenance} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/waiter/duty-status" component={WaiterDutyStatus} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/waiter/orders" component={WaiterOrders} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/waiter/billing" component={WaiterBilling} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/waiter/food-search" component={WaiterFoodSearch} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/waiter/request-stock" component={RequestStock} allowedRoles={["waiter"]} />
        <ProtectedRoute path="/kitchen-staff" component={KitchenStaffDashboard} allowedRoles={["kitchen_staff"]} />
        <ProtectedRoute path="/kitchen-staff/request-stock" component={RequestStock} allowedRoles={["kitchen_staff"]} />
        <ProtectedRoute path="/kitchen-staff/maintenance" component={KitchenStaffMaintenance} allowedRoles={["kitchen_staff"]} />
        <ProtectedRoute path="/bartender" component={BartenderDashboard} allowedRoles={["bartender"]} />
        <ProtectedRoute path="/bartender/request-stock" component={RequestStock} allowedRoles={["bartender"]} />
        <ProtectedRoute path="/bartender/maintenance" component={BartenderMaintenance} allowedRoles={["bartender"]} />
        <ProtectedRoute path="/barista" component={BaristaDashboard} allowedRoles={["barista"]} />
        <ProtectedRoute path="/barista/request-stock" component={RequestStock} allowedRoles={["barista"]} />
        <ProtectedRoute path="/barista/maintenance" component={BaristaMaintenance} allowedRoles={["barista"]} />
        <ProtectedRoute path="/cashier" component={CashierDashboard} allowedRoles={["cashier"]} />
        <ProtectedRoute path="/cashier/table-billing" component={CashierTableBilling} allowedRoles={["cashier"]} />
        <ProtectedRoute path="/cashier/maintenance" component={CashierMaintenance} allowedRoles={["cashier"]} />
        <ProtectedRoute path="/security-head" component={SecurityHeadDashboard} allowedRoles={["security_head"]} />
        <ProtectedRoute path="/security-head/staff-management" component={SecurityHeadStaffManagement} allowedRoles={["security_head"]} />
        <ProtectedRoute path="/security-head/vehicles" component={SecurityHeadVehicleLogs} allowedRoles={["security_head"]} />
        <ProtectedRoute path="/security-head/request-stock" component={RequestStock} allowedRoles={["security_head"]} />
        <ProtectedRoute path="/security-head/leave-requests" component={SecurityHeadLeaveRequests} allowedRoles={["security_head"]} />
        <ProtectedRoute path="/security-head/leave-approvals" component={ManagerLeaveApprovals} allowedRoles={["security_head"]} />
        <ProtectedRoute path="/security-guard" component={SecurityGuardDashboard} allowedRoles={["security_guard"]} />
        <ProtectedRoute path="/security-guard/request-stock" component={RequestStock} allowedRoles={["security_guard"]} />
        <ProtectedRoute path="/surveillance-officer" component={SurveillanceOfficerDashboard} allowedRoles={["surveillance_officer"]} />
        <ProtectedRoute path="/surveillance-officer/duty-status" component={SurveillanceOfficerDutyStatus} allowedRoles={["surveillance_officer"]} />
        <ProtectedRoute path="/surveillance-officer/my-tasks" component={SurveillanceOfficerMyTasks} allowedRoles={["surveillance_officer"]} />
        <ProtectedRoute path="/surveillance-officer/vehicle-logs" component={SurveillanceOfficerVehicleLogs} allowedRoles={["surveillance_officer"]} />
        <ProtectedRoute path="/surveillance-officer/maintenance-reports" component={SurveillanceOfficerMaintenanceReports} allowedRoles={["surveillance_officer"]} />
        <ProtectedRoute path="/surveillance-officer/request-stock" component={RequestStock} allowedRoles={["surveillance_officer"]} />
        
        {/* Finance Routes - Specific routes MUST come before general /finance route */}
        <ProtectedRoute path="/finance/transactions" component={FinanceTransactions} allowedRoles={["finance"]} />
        <ProtectedRoute path="/finance/revenue" component={FinanceRevenue} allowedRoles={["finance"]} />
        <ProtectedRoute path="/finance/expenses" component={FinanceExpenses} allowedRoles={["finance"]} />
        <ProtectedRoute path="/finance/cashflow" component={FinanceCashFlow} allowedRoles={["finance"]} />
        <ProtectedRoute path="/finance/reconciliation" component={FinanceReconciliation} allowedRoles={["finance"]} />
        <ProtectedRoute path="/finance/reports" component={FinanceReports} allowedRoles={["finance"]} />
        <ProtectedRoute path="/finance/maintenance-requests" component={FinanceMaintenanceRequests} allowedRoles={["finance"]} />
        <ProtectedRoute path="/finance" component={FinanceDashboard} allowedRoles={["finance"]} />
        
        <ProtectedRoute path="/front-desk" component={FrontDeskDashboard} allowedRoles={["front_desk"]} />
        <ProtectedRoute path="/front-desk/request-stock" component={RequestStock} allowedRoles={["front_desk"]} />
        <ProtectedRoute path="/front-desk/maintenance-requests" component={FrontdeskMaintenanceRequests} allowedRoles={["front_desk"]} />
        <ProtectedRoute path="/guests" component={GuestsPage} allowedRoles={["front_desk", "manager", "owner"]} />
        <ProtectedRoute path="/dashboard/hall-calendar" component={HallCalendar} allowedRoles={["front_desk", "manager", "owner", "finance", "cashier"]} />
        <ProtectedRoute path="/dashboard/bookings/:id" component={BookingDetail} allowedRoles={["front_desk", "manager", "owner", "finance", "cashier"]} />
        <ProtectedRoute path="/dashboard/hall-bookings" component={HallBookings} allowedRoles={["front_desk", "manager", "owner", "finance", "cashier"]} />
        <ProtectedRoute path="/hall-bookings" component={HallBookings} allowedRoles={["front_desk", "manager", "owner", "finance", "cashier"]} />
        
        {/* Storekeeper Routes */}
        <ProtectedRoute path="/storekeeper" component={StorekeeperDashboard} allowedRoles={["storekeeper"]} />
        <ProtectedRoute path="/storekeeper/duty-status" component={StorekeeperDutyStatus} allowedRoles={["storekeeper"]} />
        <ProtectedRoute path="/storekeeper/inventory-tracking" component={StorekeeperInventoryTracking} allowedRoles={["storekeeper"]} />
        <ProtectedRoute path="/storekeeper/inventory-management" component={StorekeeperInventoryManagement} allowedRoles={["storekeeper"]} />
        <ProtectedRoute path="/storekeeper/stock-requests" component={StorekeeperStockRequests} allowedRoles={["storekeeper"]} />
        <ProtectedRoute path="/storekeeper/maintenance-requests" component={StorekeeperMaintenanceRequests} allowedRoles={["storekeeper"]} />
        <ProtectedRoute path="/storekeeper/my-tasks" component={StorekeeperMyTasks} allowedRoles={["storekeeper"]} />
        
        {/* Leave Requests - accessible to all staff members */}
        <ProtectedRoute path="/leave-requests" component={LeaveRequests} allowedRoles={["manager", "housekeeping_staff", "kitchen_staff", "bartender", "barista", "security_guard", "surveillance_officer", "waiter", "storekeeper", "restaurant_bar_manager", "cashier", "finance", "front_desk"]} />
        
        {/* My Profile - accessible to all authenticated users */}
        <ProtectedRoute path="/my-profile" component={MyProfile} allowedRoles={["super_admin", "owner", "manager", "housekeeping_supervisor", "housekeeping_staff", "restaurant_bar_manager", "waiter", "kitchen_staff", "bartender", "barista", "security_head", "security_guard", "surveillance_officer", "finance", "front_desk", "cashier", "storekeeper"]} />
        
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <ConfirmDialogProvider />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
