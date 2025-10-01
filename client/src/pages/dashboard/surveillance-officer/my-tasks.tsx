import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Clock, CheckSquare, AlertCircle } from "lucide-react";

export default function SurveillanceOfficerMyTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/security/tasks"]
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/security/tasks"] });
      toast({ title: "Task status updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update task", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const myTasks = tasks.filter(t => t.assignedTo === user?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  return (
    <DashboardLayout title="My Tasks">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{pendingTasks.length}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold">{inProgressTasks.length}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{completedTasks.length}</p>
                </div>
                <CheckSquare className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>My Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-tasks">Loading tasks...</div>
            ) : myTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-tasks">
                No tasks assigned yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid={`task-${task.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium" data-testid={`task-title-${task.id}`}>{task.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`} data-testid={`task-status-${task.id}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {task.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: 'in_progress' })}
                            disabled={updateTaskMutation.isPending}
                            data-testid={`button-start-${task.id}`}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: 'completed' })}
                            disabled={updateTaskMutation.isPending}
                            data-testid={`button-complete-${task.id}`}
                          >
                            Complete
                          </Button>
                        )}
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
