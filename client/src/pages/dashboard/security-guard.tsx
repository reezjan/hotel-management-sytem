import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Shield, Car, Clock, Wrench, AlertTriangle, Plus, CheckSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getStatusColor } from "@/lib/utils";

export default function SecurityGuardDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "tasks"]
  });

  const { data: vehicleLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/hotel-id/vehicle-logs"]
  });

  const vehicleForm = useForm({
    defaultValues: {
      vehicleNumber: "",
      driverName: "",
      purpose: ""
    }
  });

  const maintenanceForm = useForm({
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
    }
  });

  const createVehicleLogMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vehicle-logs", {
        hotelId: user?.hotelId,
        vehicleNumber: data.vehicleNumber,
        driverName: data.driverName,
        purpose: data.purpose,
        recordedBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/hotel-id/vehicle-logs"] });
      toast({ title: "Vehicle logged successfully" });
      vehicleForm.reset();
      setIsVehicleModalOpen(false);
    }
  });

  const createMaintenanceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/maintenance-requests", {
        hotelId: user?.hotelId,
        raisedBy: user?.id,
        department: "security",
        description: data.description,
        status: "open"
      });
    },
    onSuccess: () => {
      toast({ title: "Maintenance request submitted to security head" });
      maintenanceForm.reset();
    }
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const performingTasks = tasks.filter(t => t.status === 'performing');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const todayCompleted = completedTasks.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.updatedAt || t.createdAt).toDateString() === today;
  });

  const todayVehicles = vehicleLogs.filter(v => {
    const today = new Date().toDateString();
    return new Date(v.checkIn).toDateString() === today;
  });

  const vehiclesOnPremises = vehicleLogs.filter(v => !v.checkOut);

  const handleTaskStatusUpdate = (task: any, newStatus: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const onSubmitVehicleLog = (data: any) => {
    createVehicleLogMutation.mutate(data);
  };

  const onSubmitMaintenanceRequest = (data: any) => {
    createMaintenanceRequestMutation.mutate(data);
  };

  return (
    <DashboardLayout title="Security Guard Dashboard">
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
            icon={<Shield />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Completed Today"
            value={todayCompleted.length}
            icon={<CheckSquare />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Vehicles Today"
            value={todayVehicles.length}
            icon={<Car />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Security Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => setIsVehicleModalOpen(true)}
                data-testid="button-log-vehicle"
              >
                <Car className="h-6 w-6 mb-2" />
                <span className="text-sm">Log Vehicle</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-patrol-report">
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-sm">Patrol Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-incident-report">
                <AlertTriangle className="h-6 w-6 mb-2" />
                <span className="text-sm">Incident Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-emergency">
                <AlertTriangle className="h-6 w-6 mb-2 text-red-500" />
                <span className="text-sm">Emergency</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>My Security Tasks</CardTitle>
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

        {/* Vehicle Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicleLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4" data-testid="no-vehicles-message">
                  No vehicle activity today
                </p>
              ) : (
                vehicleLogs.slice(0, 10).map((log, index) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`vehicle-log-${index}`}>
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-purple-500" />
                      <div>
                        <h4 className="font-medium text-foreground">{log.vehicleNumber}</h4>
                        <p className="text-sm text-muted-foreground">Driver: {log.driverName}</p>
                        <p className="text-xs text-muted-foreground">{log.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={log.checkOut ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"} 
                        variant="secondary"
                      >
                        {log.checkOut ? 'Checked Out' : 'On Premises'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        In: {new Date(log.checkIn).toLocaleTimeString()}
                      </p>
                      {log.checkOut && (
                        <p className="text-xs text-muted-foreground">
                          Out: {new Date(log.checkOut).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Duty Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Duty Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg" data-testid="schedule-morning">
                  <h4 className="font-medium text-blue-900 mb-2">Morning Shift (6 AM - 2 PM)</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Main entrance monitoring</li>
                    <li>• Perimeter patrol</li>
                    <li>• Vehicle logging</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg" data-testid="schedule-afternoon">
                  <h4 className="font-medium text-green-900 mb-2">Afternoon Tasks</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Lobby surveillance</li>
                    <li>• Guest assistance</li>
                    <li>• Equipment check</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg" data-testid="schedule-evening">
                  <h4 className="font-medium text-orange-900 mb-2">Evening Priority</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Parking area patrol</li>
                    <li>• Emergency response</li>
                    <li>• Incident reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-red-500" />
              <span>Report Issue to Security Head</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...maintenanceForm}>
              <form onSubmit={maintenanceForm.handleSubmit(onSubmitMaintenanceRequest)} className="space-y-4">
                <FormField
                  control={maintenanceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the security equipment issue (CCTV, access control, radios, etc.)..."
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

        {/* Vehicle Logging Modal */}
        <Dialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Vehicle Entry</DialogTitle>
            </DialogHeader>
            
            <Form {...vehicleForm}>
              <form onSubmit={vehicleForm.handleSubmit(onSubmitVehicleLog)} className="space-y-4">
                <FormField
                  control={vehicleForm.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., BA-1234"
                          data-testid="input-vehicle-number"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={vehicleForm.control}
                  name="driverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Driver's full name"
                          data-testid="input-driver-name"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={vehicleForm.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Visit</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Delivery, Guest visit, Service"
                          data-testid="input-purpose"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createVehicleLogMutation.isPending}
                    data-testid="button-log-entry"
                  >
                    {createVehicleLogMutation.isPending ? "Logging..." : "Log Entry"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsVehicleModalOpen(false)}
                    data-testid="button-cancel-log"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Security Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="performance-attendance">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-green-700">Attendance Rate</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="performance-patrols">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-700">Patrols Today</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="performance-vehicles">
                <div className="text-2xl font-bold text-purple-600">{todayVehicles.length}</div>
                <div className="text-sm text-purple-700">Vehicles Logged</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="performance-incidents">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-orange-700">Incidents Reported</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
