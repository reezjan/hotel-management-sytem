import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function HousekeepingSupervisorTaskAssignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      dueDateTime: ""
    }
  });

  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/tasks", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true
  });

  const housekeepingStaff = staff.filter(s => s.role?.name === 'housekeeping_staff');
  const onlineStaff = housekeepingStaff.filter(s => s.isOnline);
  const housekeepingTasks = tasks.filter(task => 
    housekeepingStaff.some(s => s.id === task.assignedTo)
  );

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
      form.reset();
      toast({ title: "Task assigned successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

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
      toast({ title: "Task status updated" });
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const handleCreateTask = (data: any) => {
    if (!data.title || !data.assignedTo) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createTaskMutation.mutate({
      ...data,
      hotelId: user?.hotelId,
      createdBy: user?.id,
      dueDate: data.dueDateTime || null
    });
  };

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
    { key: "priority", label: "Priority", sortable: true },
    { 
      key: "createdAt", 
      label: "Created", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('en-GB', { timeZone: 'Asia/Kathmandu' })
    }
  ];

  const taskActions = [
    { 
      label: "Mark Complete", 
      action: (row: any) => updateTaskMutation.mutate({ taskId: row.id, status: "completed" })
    }
  ];

  return (
    <DashboardLayout title="Task Assignment">
      <DataTable
        title="Housekeeping Tasks"
        data={housekeepingTasks}
        columns={taskColumns}
        actions={taskActions}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Assign New Task"
        searchPlaceholder="Search tasks..."
        isLoading={isLoading}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-title" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="textarea-description" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To (Only On-Duty Staff)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-assignedto">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {onlineStaff.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.username} (Online)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" data-testid="input-duedate" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit">
                  {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
