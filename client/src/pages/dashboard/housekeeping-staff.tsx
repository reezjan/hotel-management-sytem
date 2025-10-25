import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Clock, CheckCircle, ListTodo, Wrench, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Task {
  id: string;
  roomId: string;
  assignedToId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
  room?: {
    number: string;
    floor: string;
  };
}

export default function HousekeepingStaffDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: myTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/hotels/current/tasks/my-tasks"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const pendingTasks = Array.isArray(myTasks) ? myTasks.filter((task: Task) => task.status === 'pending') : [];
  const inProgressTasks = Array.isArray(myTasks) ? myTasks.filter((task: Task) => task.status === 'in_progress') : [];
  const completedTasks = Array.isArray(myTasks) ? myTasks.filter((task: Task) => task.status === 'completed') : [];

  const highPriorityTasks = Array.isArray(myTasks) ? myTasks.filter((task: Task) => task.priority === 'high' && task.status !== 'completed') : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="text-base">Room {task.room?.number || 'N/A'}</span>
              {getPriorityBadge(task.priority)}
            </div>
            <span className="text-sm font-medium text-gray-700">{task.title}</span>
          </div>
          {getStatusBadge(task.status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{task.description}</p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Housekeeping Staff Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<Clock />}
            iconColor="text-orange-500"
            data-testid="stat-pending-tasks"
          />
          <StatsCard
            title="In Progress"
            value={inProgressTasks.length}
            icon={<ListTodo />}
            iconColor="text-blue-500"
            data-testid="stat-in-progress-tasks"
          />
          <StatsCard
            title="Completed Today"
            value={completedTasks.length}
            icon={<CheckCircle />}
            iconColor="text-green-500"
            data-testid="stat-completed-tasks"
          />
          <StatsCard
            title="High Priority"
            value={highPriorityTasks.length}
            icon={<ClipboardCheck />}
            iconColor="text-red-500"
            data-testid="stat-high-priority-tasks"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => setLocation("/housekeeping-staff/my-tasks")}
            className="h-20 text-lg"
            data-testid="button-my-tasks"
          >
            <ListTodo className="w-6 h-6 mr-2" />
            My Tasks
          </Button>
          <Button
            onClick={() => setLocation("/housekeeping-staff/maintenance-reports")}
            variant="outline"
            className="h-20 text-lg"
            data-testid="button-maintenance-reports"
          >
            <Wrench className="w-6 h-6 mr-2" />
            Report Maintenance
          </Button>
          <Button
            onClick={() => setLocation("/housekeeping-staff/duty-status")}
            variant="outline"
            className="h-20 text-lg"
            data-testid="button-duty-status"
          >
            <Clock className="w-6 h-6 mr-2" />
            Duty Status
          </Button>
        </div>

        {highPriorityTasks.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <ClipboardCheck className="h-5 w-5" />
                <span>High Priority Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highPriorityTasks.map(renderTaskCard)}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ListTodo className="h-5 w-5 text-blue-500" />
              <span>My Cleaning Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Pending ({pendingTasks.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTasks.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4" data-testid="no-pending-tasks">
                      No pending tasks
                    </p>
                  ) : (
                    pendingTasks.map(renderTaskCard)
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-blue-500" />
                  In Progress ({inProgressTasks.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressTasks.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4" data-testid="no-in-progress-tasks">
                      No tasks in progress
                    </p>
                  ) : (
                    inProgressTasks.map(renderTaskCard)
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Completed Today ({completedTasks.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasks.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4" data-testid="no-completed-tasks">
                      No completed tasks today
                    </p>
                  ) : (
                    completedTasks.map(renderTaskCard)
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
