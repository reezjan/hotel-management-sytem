import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Car, Clock, CheckSquare, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function SurveillanceOfficerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Vehicle check-in form
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: "",
    driverName: "",
    purpose: ""
  });
  
  // Maintenance request form
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    location: "",
    description: "",
    priority: "medium",
    photo: ""
  });

  // Fetch my tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/security/tasks"]
  });

  // Fetch vehicle logs
  const { data: vehicleLogs = [], isLoading: vehicleLogsLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vehicle-logs"]
  });

  // Fetch my maintenance requests
  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  // Vehicle check-in mutation
  const checkInVehicleMutation = useMutation({
    mutationFn: async (data: typeof vehicleForm) => {
      return await apiRequest("POST", "/api/hotels/current/vehicle-logs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vehicle-logs"] });
      toast({ title: "Vehicle checked in successfully" });
      setVehicleForm({ vehicleNumber: "", driverName: "", purpose: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to check in vehicle", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  // Vehicle check-out mutation
  const checkOutVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      return await apiRequest("PATCH", `/api/vehicle-logs/${vehicleId}/checkout`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vehicle-logs"] });
      toast({ title: "Vehicle checked out successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to check out vehicle", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  // Update task status mutation
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

  // Create maintenance request mutation (using waiter pattern)
  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: typeof maintenanceForm) => {
      return await apiRequest("POST", "/api/hotels/current/maintenance-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request sent to Security Head successfully" });
      setMaintenanceForm({ title: "", location: "", description: "", priority: "medium", photo: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to send maintenance request", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const handleVehicleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.vehicleNumber || !vehicleForm.driverName) {
      toast({ title: "Vehicle number and driver name are required", variant: "destructive" });
      return;
    }
    checkInVehicleMutation.mutate(vehicleForm);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceForm.title || !maintenanceForm.location) {
      toast({ title: "Title and location are required", variant: "destructive" });
      return;
    }
    createMaintenanceMutation.mutate(maintenanceForm);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaintenanceForm({ ...maintenanceForm, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const myTasks = tasks.filter(t => t.assignedTo === user?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  
  const myVehicleLogs = vehicleLogs.filter(v => v.recordedBy === user?.id);
  const activeVehicles = myVehicleLogs.filter(v => !v.checkOut);
  
  const myMaintenanceRequests = maintenanceRequests.filter(r => r.reportedBy === user?.id);

  return (
    <DashboardLayout title="Surveillance Officer Dashboard">
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
            value={inProgressTasks.length}
            icon={<Shield />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Completed"
            value={completedTasks.length}
            icon={<CheckSquare />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Active Vehicles"
            value={activeVehicles.length}
            icon={<Car />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks" data-testid="tab-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="vehicles" data-testid="tab-vehicles">Vehicle Logs</TabsTrigger>
            <TabsTrigger value="maintenance" data-testid="tab-maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="checkin" data-testid="tab-checkin">Check-in Vehicle</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>My Assigned Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-8" data-testid="loading-tasks">Loading tasks...</div>
                ) : myTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-tasks">
                    No tasks assigned yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTasks.map((task) => (
                      <div key={task.id} className="p-4 border rounded-lg" data-testid={`task-${task.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
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
                                {task.status}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground mt-1">
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
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>My Vehicle Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {vehicleLogsLoading ? (
                  <div className="text-center py-8" data-testid="loading-vehicles">Loading vehicle logs...</div>
                ) : myVehicleLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-vehicles">
                    No vehicle logs yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myVehicleLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`vehicle-${log.id}`}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium" data-testid={`vehicle-number-${log.id}`}>{log.vehicleNumber}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Driver: {log.driverName} • Purpose: {log.purpose}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Check-in: {format(new Date(log.checkIn), 'MMM dd, yyyy HH:mm')}
                            {log.checkOut && ` • Check-out: ${format(new Date(log.checkOut), 'MMM dd, yyyy HH:mm')}`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            log.checkOut ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                          }`} data-testid={`vehicle-status-${log.id}`}>
                            {log.checkOut ? 'Checked Out' : 'On Premises'}
                          </span>
                          {!log.checkOut && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => checkOutVehicleMutation.mutate(log.id)}
                              disabled={checkOutVehicleMutation.isPending}
                              data-testid={`button-checkout-${log.id}`}
                            >
                              Check Out
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>My Maintenance Requests</CardTitle>
                <CardDescription>Requests sent to Security Head</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="text-center py-8" data-testid="loading-maintenance">Loading maintenance requests...</div>
                ) : myMaintenanceRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-maintenance">
                    No maintenance requests yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myMaintenanceRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg" data-testid={`maintenance-${request.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <h4 className="font-medium" data-testid={`maintenance-title-${request.id}`}>{request.title}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                request.priority === 'high' ? 'bg-red-100 text-red-800' :
                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {request.priority}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>Location: {request.location}</span>
                              <span data-testid={`maintenance-status-${request.id}`}>Status: {request.status}</span>
                              <span>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Request Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Submit New Maintenance Request</CardTitle>
                <CardDescription>Report maintenance issues to Security Head</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      data-testid="input-maintenance-title"
                      value={maintenanceForm.title}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                      placeholder="e.g., CCTV Camera Malfunction"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      data-testid="input-maintenance-location"
                      value={maintenanceForm.location}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, location: e.target.value })}
                      placeholder="e.g., Main Entrance"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={maintenanceForm.priority} onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, priority: value })}>
                      <SelectTrigger data-testid="select-maintenance-priority">
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      data-testid="textarea-maintenance-description"
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                      placeholder="Detailed description of the issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo">Photo (optional)</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      data-testid="input-maintenance-photo"
                      onChange={handlePhotoChange}
                    />
                    {maintenanceForm.photo && (
                      <img src={maintenanceForm.photo} alt="Preview" className="mt-2 h-32 rounded" />
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createMaintenanceMutation.isPending}
                    data-testid="button-submit-maintenance"
                  >
                    {createMaintenanceMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in Vehicle Tab */}
          <TabsContent value="checkin">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Check-in</CardTitle>
                <CardDescription>Register a vehicle entering the premises</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVehicleCheckIn} className="space-y-4">
                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                    <Input
                      id="vehicleNumber"
                      data-testid="input-vehicle-number"
                      value={vehicleForm.vehicleNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                      placeholder="e.g., BA-1234"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverName">Driver Name *</Label>
                    <Input
                      id="driverName"
                      data-testid="input-driver-name"
                      value={vehicleForm.driverName}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      data-testid="input-vehicle-purpose"
                      value={vehicleForm.purpose}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, purpose: e.target.value })}
                      placeholder="e.g., Delivery"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={checkInVehicleMutation.isPending}
                    data-testid="button-checkin-vehicle"
                  >
                    {checkInVehicleMutation.isPending ? "Checking in..." : "Check In Vehicle"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
