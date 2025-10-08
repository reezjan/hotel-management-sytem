import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { DoorClosed, Clock, UserCheck, CheckCircle2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function HousekeepingSupervisorCleaningQueue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<any>(null);

  const form = useForm({
    defaultValues: {
      assignedTo: "",
      description: "",
      priority: "high"
    }
  });

  const { data: cleaningQueue = [], isLoading: isLoadingQueue } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/room-cleaning-queue"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"]
  });

  const housekeepingStaff = staff.filter(s => s.role?.name === 'housekeeping_staff');
  const onlineStaff = housekeepingStaff.filter(s => 
    dailyAttendance.some(a => a.userId === s.id && a.status === 'active')
  );

  const pendingRooms = cleaningQueue.filter((item: any) => item.status === 'pending');
  const assignedRooms = cleaningQueue.filter((item: any) => item.status === 'assigned');
  const completedRooms = cleaningQueue.filter((item: any) => item.status === 'completed');

  const assignCleaningTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      await apiRequest("POST", "/api/hotels/current/tasks", {
        hotelId: user?.hotelId,
        createdBy: user?.id,
        assignedTo: taskData.assignedTo,
        title: `Clean Room ${taskData.roomNumber}`,
        description: taskData.description || `Clean room ${taskData.roomNumber} after checkout`,
        status: "pending",
        priority: taskData.priority,
        context: {
          type: "room_cleaning",
          roomId: taskData.roomId,
          roomNumber: taskData.roomNumber,
          guestName: taskData.guestName,
          checkoutAt: taskData.checkoutAt,
          queueId: taskData.queueId
        }
      });

      await apiRequest("PUT", `/api/hotels/current/room-cleaning-queue/${taskData.queueId}`, {
        status: "assigned",
        taskId: taskData.taskId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/room-cleaning-queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/tasks"] });
      toast({ title: "Cleaning task assigned successfully" });
      setIsAssignDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to assign task", variant: "destructive" });
    }
  });

  const handleAssignTask = (queueItem: any) => {
    setSelectedQueueItem(queueItem);
    setIsAssignDialogOpen(true);
    form.reset({
      assignedTo: "",
      description: `Clean room ${queueItem.roomNumber} after checkout`,
      priority: "high"
    });
  };

  const onSubmitAssignment = (data: any) => {
    if (!selectedQueueItem) return;

    assignCleaningTaskMutation.mutate({
      assignedTo: data.assignedTo,
      roomId: selectedQueueItem.roomId,
      roomNumber: selectedQueueItem.roomNumber,
      guestName: selectedQueueItem.guestName,
      checkoutAt: selectedQueueItem.checkoutAt,
      description: data.description,
      priority: data.priority,
      queueId: selectedQueueItem.id
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" data-testid="badge-status-pending">Pending</Badge>;
      case 'assigned':
        return <Badge variant="default" data-testid="badge-status-assigned">Assigned</Badge>;
      case 'completed':
        return <Badge variant="secondary" data-testid="badge-status-completed">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Room Cleaning Queue">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Pending Cleaning"
            value={pendingRooms.length}
            icon={<DoorClosed />}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Assigned Tasks"
            value={assignedRooms.length}
            icon={<Clock />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Completed Today"
            value={completedRooms.length}
            icon={<CheckCircle2 />}
            iconColor="text-green-500"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Checked-Out Rooms Requiring Cleaning</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingQueue ? (
              <p className="text-muted-foreground">Loading cleaning queue...</p>
            ) : cleaningQueue.length === 0 ? (
              <p className="text-center text-muted-foreground py-4" data-testid="no-rooms-message">
                No rooms in cleaning queue
              </p>
            ) : (
              <div className="space-y-4">
                {cleaningQueue.map((queueItem, index) => (
                  <div
                    key={queueItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`queue-item-${index}`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-lg" data-testid={`text-room-${queueItem.roomNumber}`}>
                          Room {queueItem.roomNumber}
                        </h4>
                        {getStatusBadge(queueItem.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div data-testid={`text-guest-${index}`}>
                          <span className="font-medium">Guest: </span>
                          {queueItem.guestName || 'N/A'}
                        </div>
                        <div data-testid={`text-checkout-${index}`}>
                          <span className="font-medium">Checked Out: </span>
                          {queueItem.checkoutAt ? format(new Date(queueItem.checkoutAt), 'MMM dd, yyyy hh:mm a') : 'N/A'}
                        </div>
                      </div>

                      {queueItem.status === 'assigned' && (
                        <div className="text-sm text-blue-600">
                          <span className="font-medium">Status: </span>
                          Cleaning task assigned to staff
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {queueItem.status === 'pending' && (
                        <Button
                          onClick={() => handleAssignTask(queueItem)}
                          disabled={onlineStaff.length === 0}
                          data-testid={`button-assign-${index}`}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Assign Staff
                        </Button>
                      )}
                      {queueItem.status === 'completed' && (
                        <Badge variant="secondary">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Cleaned
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {onlineStaff.length === 0 && pendingRooms.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No housekeeping staff is currently online. Tasks can be assigned once staff members are on duty.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Cleaning Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAssignment)} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Room: {selectedQueueItem?.roomNumber}</p>
                <p className="text-sm text-muted-foreground">Guest: {selectedQueueItem?.guestName || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">
                  Checked Out: {selectedQueueItem?.checkoutAt ? format(new Date(selectedQueueItem.checkoutAt), 'MMM dd, yyyy hh:mm a') : 'N/A'}
                </p>
              </div>

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Staff Member</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-staff">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {onlineStaff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.username} (On Duty)
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
                          <SelectValue placeholder="Select priority" />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional cleaning instructions..."
                        rows={3}
                        data-testid="input-description"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={assignCleaningTaskMutation.isPending}
                  data-testid="button-submit"
                >
                  {assignCleaningTaskMutation.isPending ? "Assigning..." : "Assign Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
