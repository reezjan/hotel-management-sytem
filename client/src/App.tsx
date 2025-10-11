import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import SuperAdminDashboard from "@/pages/dashboard/super-admin";
import OwnerDashboard from "@/pages/dashboard/owner";
import OwnerFinancialOverview from "@/pages/dashboard/owner/financial-overview";
import OwnerInventoryTracking from "@/pages/dashboard/owner/inventory-tracking";
import OwnerRoomOccupancy from "@/pages/dashboard/owner/room-occupancy";
import OwnerTaxConfiguration from "@/pages/dashboard/owner/tax-configuration";
import OwnerStaffManagement from "@/pages/dashboard/owner/staff-management";
import OwnerLeavePolicies from "@/pages/dashboard/owner/leave-policies";
import OwnerReports from "@/pages/dashboard/owner/reports";
import OwnerReport from "@/pages/dashboard/owner/report";
import OwnerAuditTransparency from "@/pages/dashboard/owner/audit-transparency";
import OwnerAmenities from "@/pages/dashboard/owner/amenities";
import ManagerDashboard from "@/pages/dashboard/manager";
import StaffManagement from "@/pages/dashboard/manager/staff-management";
import AttendanceReports from "@/pages/dashboard/manager/attendance-reports";
import VendorPayments from "@/pages/dashboard/manager/vendor-payments";
import DiscountVouchers from "@/pages/dashboard/manager/discount-vouchers";
import RoomSetup from "@/pages/dashboard/manager/room-setup";
import RoomPricing from "@/pages/dashboard/manager/room-pricing";
import AmenitiesSetup from "@/pages/dashboard/manager/amenities";
import ManagerTransactions from "@/pages/dashboard/manager/transactions";
import ManagerLeaveApprovals from "@/pages/dashboard/manager/leave-approvals";
import ManagerMealPlans from "@/pages/dashboard/manager/meal-plans";
import ManagerMaintenanceRequests from "@/pages/dashboard/manager/maintenance-requests";
import HousekeepingSupervisorDashboard from "@/pages/dashboard/housekeeping-supervisor";
import HousekeepingSupervisorStaffManagement from "@/pages/dashboard/housekeeping-supervisor/staff-management";
import HousekeepingSupervisorDutyTracking from "@/pages/dashboard/housekeeping-supervisor/duty-tracking";
import HousekeepingSupervisorCleaningQueue from "@/pages/dashboard/housekeeping-supervisor/cleaning-queue";
import HousekeepingSupervisorTaskAssignment from "@/pages/dashboard/housekeeping-supervisor/task-assignment";
import HousekeepingSupervisorMaintenanceRequests from "@/pages/dashboard/housekeeping-supervisor/maintenance-requests";
import HousekeepingSupervisorStaffTracking from "@/pages/dashboard/housekeeping-supervisor/staff-tracking";
import HousekeepingSupervisorLeaveRequests from "@/pages/dashboard/housekeeping-supervisor/leave-requests";
import HousekeepingStaffDashboard from "@/pages/dashboard/housekeeping-staff";
import HousekeepingStaffDutyStatus from "@/pages/dashboard/housekeeping-staff/duty-status";
import HousekeepingStaffMyTasks from "@/pages/dashboard/housekeeping-staff/my-tasks";
import HousekeepingStaffMaintenanceReports from "@/pages/dashboard/housekeeping-staff/maintenance-reports";
import RestaurantBarManagerDashboard from "@/pages/dashboard/restaurant-bar-manager";
import RestaurantStaffManagement from "@/pages/dashboard/restaurant-bar-manager/staff-management";
import RestaurantTaskAssignment from "@/pages/dashboard/restaurant-bar-manager/task-assignment";
import RestaurantMenuManagement from "@/pages/dashboard/restaurant-bar-manager/menu-management";
import RestaurantTableSetup from "@/pages/dashboard/restaurant-bar-manager/table-setup";
import RestaurantInventoryTracking from "@/pages/dashboard/restaurant-bar-manager/inventory-tracking";
import RestaurantDutyTracking from "@/pages/dashboard/restaurant-bar-manager/duty-tracking";
import RestaurantLeaveRequests from "@/pages/dashboard/restaurant-bar-manager/leave-requests";
import RestaurantMaintenanceRequests from "@/pages/dashboard/restaurant-bar-manager/maintenance-requests";
import WaiterDashboard from "@/pages/dashboard/waiter";
import WaiterMyTasks from "@/pages/dashboard/waiter/my-tasks";
import WaiterMaintenance from "@/pages/dashboard/waiter/maintenance";
import WaiterDutyStatus from "@/pages/dashboard/waiter/duty-status";
import WaiterOrders from "@/pages/dashboard/waiter/orders";
import WaiterBilling from "@/pages/dashboard/waiter/billing";
import WaiterFoodSearch from "@/pages/dashboard/waiter/food-search";
import KitchenStaffDashboard from "@/pages/dashboard/kitchen-staff";
import KitchenStaffMaintenance from "@/pages/dashboard/kitchen-staff/maintenance";
import BartenderDashboard from "@/pages/dashboard/bartender";
import BartenderMaintenance from "@/pages/dashboard/bartender/maintenance";
import BaristaDashboard from "@/pages/dashboard/barista";
import BaristaMaintenance from "@/pages/dashboard/barista/maintenance";
import CashierDashboard from "@/pages/dashboard/cashier";
import CashierTableBilling from "@/pages/dashboard/cashier/table-billing";
import CashierMaintenance from "@/pages/dashboard/cashier/maintenance";
import SecurityHeadDashboard from "@/pages/dashboard/security-head";
import SecurityHeadLeaveRequests from "@/pages/dashboard/security-head/leave-requests";
import SecurityGuardDashboard from "@/pages/dashboard/security-guard";
import SurveillanceOfficerDashboard from "@/pages/dashboard/surveillance-officer";
import SurveillanceOfficerDutyStatus from "@/pages/dashboard/surveillance-officer/duty-status";
import SurveillanceOfficerMyTasks from "@/pages/dashboard/surveillance-officer/my-tasks";
import SurveillanceOfficerVehicleLogs from "@/pages/dashboard/surveillance-officer/vehicle-logs";
import SurveillanceOfficerMaintenanceReports from "@/pages/dashboard/surveillance-officer/maintenance-reports";
import FinanceDashboard from "@/pages/dashboard/finance";
import FinanceTransactions from "@/pages/dashboard/finance/transactions";
import FinanceRevenue from "@/pages/dashboard/finance/revenue";
import FinanceExpenses from "@/pages/dashboard/finance/expenses";
import FinanceCashFlow from "@/pages/dashboard/finance/cashflow";
import FinanceReconciliation from "@/pages/dashboard/finance/reconciliation";
import FinanceReports from "@/pages/dashboard/finance/reports";
import FinanceMaintenanceRequests from "@/pages/dashboard/finance/maintenance-requests";
import FrontDeskDashboard from "@/pages/dashboard/front-desk";
import FrontdeskMaintenanceRequests from "@/pages/dashboard/frontdesk/maintenance-requests";
import GuestsPage from "@/pages/dashboard/guests";
import StorekeeperDashboard from "@/pages/dashboard/storekeeper";
import StorekeeperDutyStatus from "@/pages/dashboard/storekeeper/duty-status";
import StorekeeperInventoryTracking from "@/pages/dashboard/storekeeper/inventory-tracking";
import StorekeeperInventoryManagement from "@/pages/dashboard/storekeeper/inventory-management";
import StorekeeperMaintenanceRequests from "@/pages/dashboard/storekeeper/maintenance-requests";
import StorekeeperMyTasks from "@/pages/dashboard/storekeeper/my-tasks";
import RequestStock from "@/pages/dashboard/stock-requests/request-stock";
import StorekeeperStockRequests from "@/pages/dashboard/storekeeper/stock-requests";
import DepartmentStockRequests from "@/pages/dashboard/department-stock-requests";
import MyProfile from "@/pages/dashboard/my-profile";
import HallBookings from "@/pages/dashboard/hall-bookings";
import HallCalendar from "@/pages/dashboard/hall-calendar";
import BookingDetail from "@/pages/dashboard/booking-detail";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={SuperAdminDashboard} allowedRoles={["super_admin"]} />
      
      {/* Owner Routes */}
      <ProtectedRoute path="/owner" component={OwnerDashboard} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/financial" component={OwnerFinancialOverview} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/inventory" component={OwnerInventoryTracking} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/occupancy" component={OwnerRoomOccupancy} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/taxes" component={OwnerTaxConfiguration} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/staff" component={OwnerStaffManagement} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/leave-policies" component={OwnerLeavePolicies} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/leave-approvals" component={ManagerLeaveApprovals} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/report" component={OwnerReport} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/reports" component={OwnerReports} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/audit-transparency" component={OwnerAuditTransparency} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/amenities" component={OwnerAmenities} allowedRoles={["owner"]} />
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
      <ProtectedRoute path="/leave-requests" component={RestaurantLeaveRequests} allowedRoles={["housekeeping_staff", "kitchen_staff", "bartender", "barista", "security_guard", "surveillance_officer", "waiter", "storekeeper", "restaurant_bar_manager", "cashier", "finance", "front_desk"]} />
      
      {/* My Profile - accessible to all authenticated users */}
      <ProtectedRoute path="/my-profile" component={MyProfile} allowedRoles={["super_admin", "owner", "manager", "housekeeping_supervisor", "housekeeping_staff", "restaurant_bar_manager", "waiter", "kitchen_staff", "bartender", "barista", "security_head", "security_guard", "surveillance_officer", "finance", "front_desk", "cashier", "storekeeper"]} />
      
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
