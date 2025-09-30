import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Car, Clock, UserPlus, ClipboardList, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function SecurityHeadDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/users"]
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/tasks"]
  });

  const { data: maintenanceRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/maintenance-requests"]
  });

  const { data: vehicleLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/vehicle-logs"]
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/hotel-id/tasks"] });
      toast({ title: "Task updated successfully" });
    }
  });

  const createMaintenanceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/maintenance-requests", {
        hotelId: user?.hotelId,
        raisedBy: user?.id,
        department: "security",
        description: data.description,
        status: "open"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/hotel-id/maintenance-requests"] });
      toast({ title: "Maintenance request submitted to finance" });
    }
  });

  const securityGuards = staff.filter(s => s.role?.name === 'security_guard');
  const onlineGuards = securityGuards.filter(s => s.isOnline);
  const securityTasks = tasks.filter(t => t.department === 'security' || t.context?.department === 'security');
  const pendingTasks = securityTasks.filter(t => t.status === 'pending');
  const completedTasks = securityTasks.filter(t => t.status === 'completed');

  const staffColumns = [
    { key: "username", label: "Name", sortable: true },
    { 
      key: "isOnline", 
      label: "Duty Status", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span>{value ? 'On Duty' : 'Off Duty'}</span>
        </span>
      )
    },
    { 
      key: "lastLogin", 
      label: "Last Active", 
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }) : 'Never'
    },
    { key: "createdAt", label: "Joined", sortable: true }
  ];

  const taskColumns = [
    { key: "title", label: "Task", sortable: true },
    { 
      key: "assignedTo", 
      label: "Assigned To", 
      render: (value: any, row: any) => {
        const assignee = staff.find(s => s.id === row.assignedTo);
        return assignee?.username || "Unassigned";
      }
    },
    { key: "status", label: "Status", sortable: true },
    { key: "createdAt", label: "Created", sortable: true }
  ];

  const vehicleColumns = [
    { key: "vehicleNumber", label: "Vehicle Number", sortable: true },
    { key: "driverName", label: "Driver", sortable: true },
    { key: "purpose", label: "Purpose", sortable: true },
    { key: "checkIn", label: "Check In", sortable: true },
    { key: "checkOut", label: "Check Out", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      render: (value: any, row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.checkOut ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
        }`}>
          {row.checkOut ? 'Checked Out' : 'On Premises'}
        </span>
      )
    }
  ];

  const maintenanceColumns = [
    { key: "description", label: "Request", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "createdAt", label: "Reported", sortable: true }
  ];

  const staffActions = [
    { label: "Assign Task", action: (row: any) => console.log("Assign task to:", row) },
    { label: "View Schedule", action: (row: any) => console.log("View schedule:", row) },
    { label: "Remove", action: (row: any) => console.log("Remove guard:", row), variant: "destructive" as const }
  ];

  const taskActions = [
    { label: "Edit", action: (row: any) => console.log("Edit task:", row) },
    { label: "Reassign", action: (row: any) => console.log("Reassign task:", row) },
    { label: "Complete", action: (row: any) => updateTaskMutation.mutate({ taskId: row.id, status: 'completed' }) }
  ];

  const vehicleActions = [
    { label: "Check Out", action: (row: any) => console.log("Check out vehicle:", row) },
    { label: "View Details", action: (row: any) => console.log("View vehicle details:", row) }
  ];

  const maintenanceActions = [
    { label: "Forward to Finance", action: (row: any) => {
      createMaintenanceRequestMutation.mutate({
        description: `Security Department: ${row.description}`,
        department: "finance"
      });
    }},
    { label: "Assign Guard", action: (row: any) => console.log("Assign to guard:", row) }
  ];

  return (
    <DashboardLayout title="Security Head Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Security Guards"
            value={securityGuards.length}
            icon={<Users />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="On Duty"
            value={onlineGuards.length}
            icon={<Shield />}
            iconColor="text-green-500"
            trend={{ 
              value: onlineGuards.length > 0 ? Math.round((onlineGuards.length / securityGuards.length) * 100) : 0, 
              label: "coverage", 
              isPositive: true 
            }}
          />
          <StatsCard
            title="Vehicles on Premises"
            value={vehicleLogs.filter(v => !v.checkOut).length}
            icon={<Car />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<ClipboardList />}
            iconColor="text-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Security Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-add-guard">
                <UserPlus className="h-6 w-6 mb-2" />
                <span className="text-sm">Add Guard</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-assign-tasks">
                <ClipboardList className="h-6 w-6 mb-2" />
                <span className="text-sm">Assign Tasks</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-vehicle-logs">
                <Car className="h-6 w-6 mb-2" />
                <span className="text-sm">Vehicle Logs</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-duty-roster">
                <Clock className="h-6 w-6 mb-2" />
                <span className="text-sm">Duty Roster</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Guards Management */}
        <DataTable
          title="Security Guards"
          data={securityGuards}
          columns={staffColumns}
          actions={staffActions}
          onAdd={() => console.log("Add security guard")}
          addButtonLabel="Add Security Guard"
          searchPlaceholder="Search guards..."
        />

        {/* Task Management */}
        <DataTable
          title="Security Tasks"
          data={securityTasks}
          columns={taskColumns}
          actions={taskActions}
          onAdd={() => console.log("Create security task")}
          addButtonLabel="Create Task"
          searchPlaceholder="Search tasks..."
        />

        {/* Vehicle Logs */}
        <DataTable
          title="Vehicle Check-in/Check-out Records"
          data={vehicleLogs}
          columns={vehicleColumns}
          actions={vehicleActions}
          searchPlaceholder="Search vehicles..."
        />

        {/* Maintenance Requests */}
        <DataTable
          title="Maintenance Requests"
          data={maintenanceRequests.filter(r => r.department === 'security')}
          columns={maintenanceColumns}
          actions={maintenanceActions}
          searchPlaceholder="Search maintenance requests..."
        />

        {/* Security Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Security Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="summary-patrols">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-blue-700">Patrols Completed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="summary-incidents">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-700">Security Incidents</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="summary-vehicles">
                <div className="text-2xl font-bold text-purple-600">{vehicleLogs.length}</div>
                <div className="text-sm text-purple-700">Vehicle Entries</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="summary-alerts">
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-sm text-orange-700">System Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded" data-testid="activity-patrol">
                <div className="flex items-center">
                  <Shield className="text-blue-500 mr-3 h-5 w-5" />
                  <span className="text-foreground">Night patrol completed - All clear</span>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded" data-testid="activity-vehicle">
                <div className="flex items-center">
                  <Car className="text-green-500 mr-3 h-5 w-5" />
                  <span className="text-foreground">Vehicle BA-1234 checked in - Delivery truck</span>
                </div>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded" data-testid="activity-alert">
                <div className="flex items-center">
                  <AlertTriangle className="text-orange-500 mr-3 h-5 w-5" />
                  <span className="text-foreground">CCTV camera #3 maintenance scheduled</span>
                </div>
                <span className="text-xs text-muted-foreground">6 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
