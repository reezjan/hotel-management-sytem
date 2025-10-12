import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Plus, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function TaskAssignment() {
  const { confirm } = useConfirmDialog();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDateTime: ""
  });

  const queryClient = useQueryClient();

  // Fetch restaurant staff
  const { data: allStaff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  // Filter for restaurant staff only
  const restaurantStaff = allStaff.filter(staff => 
    ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'].includes(staff.role?.name || '')
  );

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/tasks"],
    refetchInterval: 3000
  });

  // Filter for restaurant tasks only
  const restaurantTasks = tasks.filter(task => 
    restaurantStaff.some(staff => staff.id === task.assignedTo)
  );

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await fetch("/api/hotels/current/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(taskData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/tasks"] });
      setIsAddDialogOpen(false);
      setNewTask({ title: "", description: "", assignedTo: "", priority: "medium", dueDateTime: "" });
      toast.success("Task assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await fetch(`/api/hotels/current/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/tasks"] });
      toast.success("Task status updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignedTo) {
      toast.error("Please fill in title and assign to a staff member");
      return;
    }

    const { dueDateTime, ...taskData } = newTask;
    createTaskMutation.mutate({
      ...taskData,
      dueDate: dueDateTime || null
    });
  };

  const handleStatusChange = (task: any, status: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status });
  };

  const handleDeleteTask = async (task: any) => {
    await confirm({
      title: "Delete Task",
      description: `Are you sure you want to delete "${task.title}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/hotels/current/tasks/${task.id}`, {
            method: "DELETE",
            credentials: "include"
          });
          if (!response.ok) throw new Error("Failed to delete task");
          queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/tasks"] });
          toast.success("Task deleted successfully");
        } catch (error: any) {
          toast.error(error.message);
        }
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'performing': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns = [
    { key: "title", label: "Task", sortable: true },
    { 
      key: "assignedTo", 
      label: "Assigned To", 
      render: (value: any, row: any) => {
        const staff = restaurantStaff.find(s => s.id === row.assignedTo);
        return staff ? (
          <div>
            <div className="font-medium">{staff.username}</div>
            <div className="text-sm text-muted-foreground">
              {staff.role?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </div>
          </div>
        ) : 'Unknown Staff';
      }
    },
    { 
      key: "priority", 
      label: "Priority", 
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <Select 
            value={value} 
            onValueChange={(newStatus) => handleStatusChange(row, newStatus)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="performing">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    { 
      key: "dueDateTime", 
      label: "Due Date", 
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'No due date'
    }
  ];

  const actions = [
    { 
      label: "Delete", 
      action: handleDeleteTask, 
      variant: "destructive" as const 
    }
  ];

  const pendingTasks = restaurantTasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = restaurantTasks.filter(t => t.status === 'performing').length;
  const completedTasks = restaurantTasks.filter(t => t.status === 'completed').length;
  const onDutyStaff = restaurantStaff.filter(s => 
    dailyAttendance.some(a => a.userId === s.id && a.status === 'active')
  ).length;

  return (
    <DashboardLayout title="Task Assignment">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold">{pendingTasks}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressTasks}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Staff On Duty</p>
                  <p className="text-2xl font-bold">{onDutyStaff}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <DataTable
          title="Restaurant Tasks"
          data={restaurantTasks}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          onAdd={() => setIsAddDialogOpen(true)}
          addButtonLabel="Assign New Task"
          searchPlaceholder="Search tasks..."
        />

        {/* Add Task Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="assignedTo">Assign To *</Label>
                <Select 
                  value={newTask.assignedTo} 
                  onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurantStaff.map((staff) => {
                      const isOnDuty = dailyAttendance.some(a => a.userId === staff.id && a.status === 'active');
                      return (
                        <SelectItem key={staff.id} value={staff.id}>
                          <div className="flex items-center space-x-2">
                            <span>{staff.username}</span>
                            <span className="text-sm text-muted-foreground">
                              ({staff.role?.name?.replace(/_/g, ' ')})
                            </span>
                            {isOnDuty && (
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dueDateTime">Due Date & Time</Label>
                <Input
                  id="dueDateTime"
                  type="datetime-local"
                  value={newTask.dueDateTime}
                  onChange={(e) => setNewTask({ ...newTask, dueDateTime: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}