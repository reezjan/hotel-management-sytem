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
import OwnerReports from "@/pages/dashboard/owner/reports";
import ManagerDashboard from "@/pages/dashboard/manager";
import StaffManagement from "@/pages/dashboard/manager/staff-management";
import VendorPayments from "@/pages/dashboard/manager/vendor-payments";
import DiscountVouchers from "@/pages/dashboard/manager/discount-vouchers";
import RoomSetup from "@/pages/dashboard/manager/room-setup";
import AmenitiesSetup from "@/pages/dashboard/manager/amenities";
import ManagerTransactions from "@/pages/dashboard/manager/transactions";
import ManagerLeaveApprovals from "@/pages/dashboard/manager/leave-approvals";
import HousekeepingSupervisorDashboard from "@/pages/dashboard/housekeeping-supervisor";
import HousekeepingStaffDashboard from "@/pages/dashboard/housekeeping-staff";
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
import BartenderDashboard from "@/pages/dashboard/bartender";
import BaristaDashboard from "@/pages/dashboard/barista";
import CashierDashboard from "@/pages/dashboard/cashier";
import SecurityHeadDashboard from "@/pages/dashboard/security-head";
import SecurityGuardDashboard from "@/pages/dashboard/security-guard";
import FinanceDashboard from "@/pages/dashboard/finance";
import FrontDeskDashboard from "@/pages/dashboard/front-desk";

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
      <ProtectedRoute path="/owner/reports" component={OwnerReports} allowedRoles={["owner"]} />
      
      <ProtectedRoute path="/manager" component={ManagerDashboard} allowedRoles={["manager"]} />
      <ProtectedRoute path="/manager/staff" component={StaffManagement} allowedRoles={["manager", "owner"]} />
      <ProtectedRoute path="/manager/vendor-payments" component={VendorPayments} allowedRoles={["manager", "owner"]} />
      <ProtectedRoute path="/manager/discount-vouchers" component={DiscountVouchers} allowedRoles={["manager", "owner"]} />
      <ProtectedRoute path="/manager/room-setup" component={RoomSetup} allowedRoles={["manager", "owner"]} />
      <ProtectedRoute path="/manager/amenities" component={AmenitiesSetup} allowedRoles={["manager", "owner"]} />
      <ProtectedRoute path="/manager/transactions" component={ManagerTransactions} allowedRoles={["manager", "owner"]} />
      <ProtectedRoute path="/manager/leave-approvals" component={ManagerLeaveApprovals} allowedRoles={["manager", "owner"]} />
      <ProtectedRoute path="/housekeeping-supervisor" component={HousekeepingSupervisorDashboard} allowedRoles={["housekeeping_supervisor"]} />
      <ProtectedRoute path="/housekeeping-staff" component={HousekeepingStaffDashboard} allowedRoles={["housekeeping_staff"]} />
      <ProtectedRoute path="/restaurant-bar-manager" component={RestaurantBarManagerDashboard} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/staff-management" component={RestaurantStaffManagement} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/task-assignment" component={RestaurantTaskAssignment} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/menu-management" component={RestaurantMenuManagement} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/table-setup" component={RestaurantTableSetup} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/inventory-tracking" component={RestaurantInventoryTracking} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/duty-tracking" component={RestaurantDutyTracking} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/leave-requests" component={RestaurantLeaveRequests} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/restaurant-bar-manager/maintenance-requests" component={RestaurantMaintenanceRequests} allowedRoles={["restaurant_bar_manager"]} />
      <ProtectedRoute path="/waiter" component={WaiterDashboard} allowedRoles={["waiter"]} />
      <ProtectedRoute path="/waiter/my-tasks" component={WaiterMyTasks} allowedRoles={["waiter"]} />
      <ProtectedRoute path="/waiter/maintenance" component={WaiterMaintenance} allowedRoles={["waiter"]} />
      <ProtectedRoute path="/waiter/duty-status" component={WaiterDutyStatus} allowedRoles={["waiter"]} />
      <ProtectedRoute path="/waiter/orders" component={WaiterOrders} allowedRoles={["waiter"]} />
      <ProtectedRoute path="/waiter/billing" component={WaiterBilling} allowedRoles={["waiter"]} />
      <ProtectedRoute path="/waiter/food-search" component={WaiterFoodSearch} allowedRoles={["waiter"]} />
      <ProtectedRoute path="/kitchen-staff" component={KitchenStaffDashboard} allowedRoles={["kitchen_staff"]} />
      <ProtectedRoute path="/bartender" component={BartenderDashboard} allowedRoles={["bartender"]} />
      <ProtectedRoute path="/barista" component={BaristaDashboard} allowedRoles={["barista"]} />
      <ProtectedRoute path="/cashier" component={CashierDashboard} allowedRoles={["cashier"]} />
      <ProtectedRoute path="/security-head" component={SecurityHeadDashboard} allowedRoles={["security_head"]} />
      <ProtectedRoute path="/security-guard" component={SecurityGuardDashboard} allowedRoles={["security_guard"]} />
      <ProtectedRoute path="/surveillance-officer" component={SecurityGuardDashboard} allowedRoles={["surveillance_officer"]} />
      <ProtectedRoute path="/finance" component={FinanceDashboard} allowedRoles={["finance"]} />
      <ProtectedRoute path="/front-desk" component={FrontDeskDashboard} allowedRoles={["front_desk"]} />
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
