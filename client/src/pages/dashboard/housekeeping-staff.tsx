import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Clock, Wrench, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getStatusColor } from "@/lib/utils";

export default function HousekeepingStaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<string>("");

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "tasks"],
    enabled: !!user?.id,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
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
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/hotels/current/maintenance-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request submitted successfully" });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setLocation("");
      setPhoto("");
    },
    onError: () => {
      toast({ 
        title: "Failed to submit request", 
        description: "Please try again later",
        variant: "destructive" 
      });
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

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !location || !photo) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in all required fields including photo",
        variant: "destructive" 
      });
      return;
    }

    createMaintenanceRequestMutation.mutate({
      title,
      description,
      priority,
      location,
      photo,
      status: 'pending'
    });
  };

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
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {task.priority?.toUpperCase() || 'MEDIUM'}
                          </Badge>
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
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Submit Maintenance Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Broken AC in Room 201"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    data-testid="input-maintenance-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Room 201, Hallway 2nd Floor"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    data-testid="input-maintenance-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority" className="h-11" data-testid="select-maintenance-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait</SelectItem>
                      <SelectItem value="medium">Medium - Soon</SelectItem>
                      <SelectItem value="high">High - Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    data-testid="textarea-maintenance-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo *</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    required
                    data-testid="input-maintenance-photo"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {photo && (
                    <div className="mt-2">
                      <img src={photo} alt="Preview" className="max-w-full h-32 object-cover rounded border" />
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 min-h-11"
                  disabled={createMaintenanceRequestMutation.isPending}
                  data-testid="button-submit-maintenance"
                >
                  {createMaintenanceRequestMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
