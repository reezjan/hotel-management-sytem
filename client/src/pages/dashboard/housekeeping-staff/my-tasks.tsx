import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getStatusColor } from "@/lib/utils";
import { CheckSquare, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function HousekeepingStaffMyTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "tasks"],
    enabled: !!user?.id,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/hotels/current/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "tasks"] });
      toast({ title: "Task updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update task", variant: "destructive" });
    }
  });

  const pendingTasks = tasks.filter((t: any) => t.status === 'pending');
  const performingTasks = tasks.filter((t: any) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed' || t.status === 'pending_review');

  const handleTaskStatusUpdate = (task: any, newStatus: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  return (
    <DashboardLayout title="My Tasks">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            title="Completed"
            value={completedTasks.length}
            icon={<CheckSquare />}
            iconColor="text-green-500"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4" data-testid="no-tasks-message">
                No tasks assigned
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`task-item-${index}`}>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge className={getStatusColor(task.status)} variant="secondary">
                          {task.status}
                        </Badge>
                        {task.priority && (
                          <Badge variant="outline" className="text-xs">
                            Priority: {task.priority}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(task.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kathmandu' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleTaskStatusUpdate(task, 'in_progress')}
                          disabled={updateTaskMutation.isPending}
                          data-testid={`button-start-task-${index}`}
                        >
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleTaskStatusUpdate(task, 'completed')}
                          disabled={updateTaskMutation.isPending}
                          data-testid={`button-complete-task-${index}`}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {task.status === 'pending_review' && (
                        <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                          Pending Approval
                        </Badge>
                      )}
                      {task.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800" variant="secondary">
                          Done ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
