import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getStatusColor } from "@/lib/utils";

export default function StorekeeperMyTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks/my-tasks"],
    refetchInterval: 3000
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      toast({ title: "Task updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update task", 
        variant: "destructive" 
      });
    }
  });

  const pendingTasks = tasks.filter((t: any) => t.status === 'pending');
  const performingTasks = tasks.filter((t: any) => t.status === 'performing');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');

  const handleTaskStatusUpdate = (task: any, newStatus: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const getTaskActions = (task: any) => {
    if (task.status === 'pending') {
      return (
        <Button
          variant="default"
          size="sm"
          onClick={() => handleTaskStatusUpdate(task, 'performing')}
          disabled={updateTaskMutation.isPending}
          data-testid={`button-start-task-${task.id}`}
        >
          Start Task
        </Button>
      );
    }
    if (task.status === 'performing') {
      return (
        <Button
          variant="default"
          size="sm"
          onClick={() => handleTaskStatusUpdate(task, 'completed')}
          disabled={updateTaskMutation.isPending}
          data-testid={`button-complete-task-${task.id}`}
        >
          Mark Complete
        </Button>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title="My Tasks">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-pending-tasks">
                {pendingTasks.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-performing-tasks">
                {performingTasks.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-completed-tasks">
                {completedTasks.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              All Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="no-tasks-message">
                No tasks assigned
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    data-testid={`task-item-${task.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold" data-testid={`task-title-${task.id}`}>
                            {task.title}
                          </h3>
                          <Badge variant={getStatusColor(task.status) as any} data-testid={`task-status-${task.id}`}>
                            {task.status}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {task.priority && (
                            <span className="flex items-center gap-1">
                              Priority: <Badge variant="outline">{task.priority}</Badge>
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getTaskActions(task)}
                      </div>
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
