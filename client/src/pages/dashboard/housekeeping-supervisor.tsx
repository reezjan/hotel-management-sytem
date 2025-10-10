import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, CheckSquare, Wrench, UserPlus, ClipboardList } from "lucide-react";

export default function HousekeepingSupervisorDashboard() {
  const [, setLocation] = useLocation();

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/tasks"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"]
  });

  const housekeepingStaff = staff.filter(s => s.role?.name === 'housekeeping_staff');
  const onlineStaff = housekeepingStaff.filter(s => {
    return dailyAttendance.some(a => a.userId === s.id && a.status === 'active');
  });
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const staffColumns = [
    { key: "username", label: "Name", sortable: true },
    { 
      key: "id", 
      label: "Duty Status", 
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

  const staffActions = [
    { label: "Assign Task", action: (row: any) => console.log("Assign task to:", row) },
    { label: "Remove", action: (row: any) => console.log("Remove staff:", row), variant: "destructive" as const }
  ];

  const taskActions = [
    { label: "Edit", action: (row: any) => console.log("Edit task:", row) },
    { label: "Complete", action: (row: any) => console.log("Complete task:", row) }
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
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-add-staff"
                onClick={() => setLocation("/housekeeping-supervisor/staff-management")}
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Add Staff</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-assign-tasks"
                onClick={() => setLocation("/housekeeping-supervisor/task-assignment")}
              >
                <CheckSquare className="h-6 w-6" />
                <span className="text-sm">Assign Tasks</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-duty-roster"
                onClick={() => setLocation("/housekeeping-supervisor/duty-tracking")}
              >
                <Clock className="h-6 w-6" />
                <span className="text-sm">Duty Roster</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" 
                data-testid="button-maintenance"
                onClick={() => setLocation("/housekeeping-supervisor/maintenance-requests")}
              >
                <Wrench className="h-6 w-6" />
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
          onAdd={() => setLocation("/housekeeping-supervisor/staff-management")}
          addButtonLabel="Add Staff Member"
          searchPlaceholder="Search staff..."
        />

        {/* Task Assignment */}
        <DataTable
          title="Task Management"
          data={tasks}
          columns={taskColumns}
          actions={taskActions}
          onAdd={() => setLocation("/housekeeping-supervisor/task-assignment")}
          addButtonLabel="Create Task"
          searchPlaceholder="Search tasks..."
        />
      </div>
    </DashboardLayout>
  );
}
