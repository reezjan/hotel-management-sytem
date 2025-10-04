import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CheckSquare, Clock, Wrench, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getStatusColor } from "@/lib/utils";

export default function HousekeepingStaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "tasks"]
  });

  const form = useForm({
    defaultValues: {
      description: ""
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "tasks"] });
      toast({ title: "Task updated successfully" });
      setSelectedTask(null);
    }
  });

  const createMaintenanceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/maintenance-requests", {
        hotelId: user?.hotelId,
        raisedBy: user?.id,
        department: "housekeeping",
        description: data.description,
        status: "open"
      });
    },
    onSuccess: () => {
      toast({ title: "Maintenance request submitted successfully" });
      form.reset();
    }
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const performingTasks = tasks.filter(t => t.status === 'performing');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const todayCompleted = completedTasks.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.updatedAt || t.createdAt).toDateString() === today;
  });

  const handleTaskStatusUpdate = (task: any, newStatus: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const onSubmitMaintenanceRequest = (data: any) => {
    createMaintenanceRequestMutation.mutate(data);
  };

  return (
    <DashboardLayout title="Housekeeping Staff Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<Clock />}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="In Progress"
            value={performingTasks.length}
            icon={<CheckSquare />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Completed Today"
            value={todayCompleted.length}
            icon={<CheckSquare />}
            iconColor="text-green-500"
            trend={{ 
              value: todayCompleted.length > 0 ? 100 : 0, 
              label: "completion rate", 
              isPositive: true 
            }}
          />
          <StatsCard
            title="Total Tasks"
            value={tasks.length}
            icon={<CheckSquare />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Task Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-tasks-message">
                    No tasks assigned
                  </p>
                ) : (
                  tasks.slice(0, 10).map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`task-item-${index}`}>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getStatusColor(task.status)} variant="secondary">
                            {task.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskStatusUpdate(task, 'performing')}
                            disabled={updateTaskMutation.isPending}
                            data-testid={`button-start-task-${index}`}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'performing' && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskStatusUpdate(task, 'completed')}
                            disabled={updateTaskMutation.isPending}
                            data-testid={`button-complete-task-${index}`}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Request */}
          <Card>
            <CardHeader>
              <CardTitle>Report Maintenance Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitMaintenanceRequest)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the maintenance issue..."
                            rows={4}
                            data-testid="textarea-maintenance-description"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={createMaintenanceRequestMutation.isPending}
                    data-testid="button-submit-maintenance"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    {createMaintenanceRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg" data-testid="schedule-morning">
                  <h4 className="font-medium text-blue-900 mb-2">Morning Shift (6 AM - 2 PM)</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Room cleaning (101-120)</li>
                    <li>• Linen replacement</li>
                    <li>• Bathroom sanitization</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg" data-testid="schedule-afternoon">
                  <h4 className="font-medium text-green-900 mb-2">Afternoon Tasks</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Public area cleaning</li>
                    <li>• Inventory check</li>
                    <li>• Special requests</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg" data-testid="schedule-priority">
                  <h4 className="font-medium text-orange-900 mb-2">Priority Items</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• VIP room preparation</li>
                    <li>• Maintenance follow-up</li>
                    <li>• Quality check</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="performance-completion-rate">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-green-700">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="performance-rooms-cleaned">
                <div className="text-2xl font-bold text-blue-600">142</div>
                <div className="text-sm text-blue-700">Rooms This Week</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="performance-avg-time">
                <div className="text-2xl font-bold text-purple-600">28m</div>
                <div className="text-sm text-purple-700">Avg. Time/Room</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg" data-testid="performance-quality-score">
                <div className="text-2xl font-bold text-yellow-600">4.8</div>
                <div className="text-sm text-yellow-700">Quality Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
