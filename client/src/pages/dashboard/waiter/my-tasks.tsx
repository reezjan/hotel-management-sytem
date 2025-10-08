import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function WaiterMyTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/tasks"]
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/hotels/current/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/tasks"] });
      toast({ title: "Task status updated successfully" });
    }
  });

  const myTasks = tasks
    .filter((task: any) => task.assignedTo === user?.id)
    .sort((a: any, b: any) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending_review':
        return <CheckCircle2 className="h-5 w-5 text-yellow-600" />;
      case 'pending':
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const pendingTasks = myTasks.filter((task: any) => task.status === 'pending');
  const performingTasks = myTasks.filter((task: any) => task.status === 'in_progress');
  const completedTasks = myTasks.filter((task: any) => task.status === 'completed' || task.status === 'pending_review');

  return (
    <DashboardLayout title="My Tasks">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{performingTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tasks assigned to you</p>
              ) : (
                myTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground leading-tight">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                              {task.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <Badge variant="secondary">
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.status === 'pending' && (
                        <Button
                          className="h-11 min-h-11"
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          disabled={updateTaskMutation.isPending}
                        >
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <>
                          <Button
                            className="h-11 min-h-11"
                            variant="outline"
                            onClick={() => handleStatusChange(task.id, 'pending')}
                            disabled={updateTaskMutation.isPending}
                          >
                            Mark Pending
                          </Button>
                          <Button
                            className="h-11 min-h-11"
                            onClick={() => handleStatusChange(task.id, 'completed')}
                            disabled={updateTaskMutation.isPending}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {task.status === 'pending_review' && (
                        <Badge className="bg-yellow-100 text-yellow-800 h-11 flex items-center px-4" variant="secondary">
                          Pending Approval
                        </Badge>
                      )}
                      {task.status === 'completed' && (
                        <Button
                          className="h-11 min-h-11"
                          variant="outline"
                          onClick={() => handleStatusChange(task.id, 'pending')}
                          disabled={updateTaskMutation.isPending}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
