import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, CheckSquare, Wrench, UserPlus, ClipboardList } from "lucide-react";

export default function HousekeepingSupervisorDashboard() {
  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/users"]
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/tasks"]
  });

  const { data: maintenanceRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/maintenance-requests"]
  });

  const housekeepingStaff = staff.filter(s => s.role?.name === 'housekeeping_staff');
  const onlineStaff = housekeepingStaff.filter(s => s.isOnline);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const staffColumns = [
    { key: "username", label: "Name", sortable: true },
    { 
      key: "isOnline", 
      label: "Duty Status", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span>{value ? 'Online' : 'Offline'}</span>
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

  const maintenanceColumns = [
    { key: "description", label: "Request", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "createdAt", label: "Reported", sortable: true }
  ];

  const staffActions = [
    { label: "Assign Task", action: (row: any) => console.log("Assign task to:", row) },
    { label: "Remove", action: (row: any) => console.log("Remove staff:", row), variant: "destructive" as const }
  ];

  const taskActions = [
    { label: "Edit", action: (row: any) => console.log("Edit task:", row) },
    { label: "Complete", action: (row: any) => console.log("Complete task:", row) }
  ];

  const maintenanceActions = [
    { label: "Forward to Finance", action: (row: any) => console.log("Forward to finance:", row) },
    { label: "Assign", action: (row: any) => console.log("Assign maintenance:", row) }
  ];

  return (
    <DashboardLayout title="Housekeeping Supervisor Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Staff"
            value={housekeepingStaff.length}
            icon={<Users />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Online Staff"
            value={onlineStaff.length}
            icon={<Clock />}
            iconColor="text-green-500"
            trend={{ 
              value: onlineStaff.length > 0 ? (onlineStaff.length / housekeepingStaff.length) * 100 : 0, 
              label: "on duty", 
              isPositive: true 
            }}
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<CheckSquare />}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="Completed Today"
            value={completedTasks.filter(t => {
              const today = new Date().toDateString();
              return new Date(t.updatedAt || t.createdAt).toDateString() === today;
            }).length}
            icon={<ClipboardList />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Housekeeping Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-add-staff">
                <UserPlus className="h-6 w-6 mb-2" />
                <span className="text-sm">Add Staff</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-assign-tasks">
                <CheckSquare className="h-6 w-6 mb-2" />
                <span className="text-sm">Assign Tasks</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-duty-roster">
                <Clock className="h-6 w-6 mb-2" />
                <span className="text-sm">Duty Roster</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-maintenance">
                <Wrench className="h-6 w-6 mb-2" />
                <span className="text-sm">Maintenance</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Staff Management */}
        <DataTable
          title="Housekeeping Staff"
          data={housekeepingStaff}
          columns={staffColumns}
          actions={staffActions}
          onAdd={() => console.log("Add housekeeping staff")}
          addButtonLabel="Add Staff Member"
          searchPlaceholder="Search staff..."
        />

        {/* Task Assignment */}
        <DataTable
          title="Task Management"
          data={tasks}
          columns={taskColumns}
          actions={taskActions}
          onAdd={() => console.log("Create new task")}
          addButtonLabel="Create Task"
          searchPlaceholder="Search tasks..."
        />

        {/* Maintenance Requests */}
        <DataTable
          title="Maintenance Requests"
          data={maintenanceRequests}
          columns={maintenanceColumns}
          actions={maintenanceActions}
          searchPlaceholder="Search maintenance requests..."
        />

        {/* Daily Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="summary-rooms-cleaned">
                  <div className="text-2xl font-bold text-blue-600">18</div>
                  <div className="text-sm text-blue-700">Rooms Cleaned</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="summary-tasks-completed">
                  <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                  <div className="text-sm text-green-700">Tasks Completed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="summary-maintenance-pending">
                  <div className="text-2xl font-bold text-orange-600">{maintenanceRequests.filter(r => r.status === 'open').length}</div>
                  <div className="text-sm text-orange-700">Maintenance Pending</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="summary-staff-efficiency">
                  <div className="text-2xl font-bold text-purple-600">92%</div>
                  <div className="text-sm text-purple-700">Staff Efficiency</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
