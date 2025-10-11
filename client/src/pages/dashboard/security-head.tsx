import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Car, ClipboardList, UserPlus, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function SecurityHeadDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateOfficerOpen, setIsCreateOfficerOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  // New officer form
  const [newOfficer, setNewOfficer] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    fullName: "",
    address: ""
  });
  
  // New task form
  const [newTask, setNewTask] = useState({
    assignedTo: "",
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });

  // Fetch surveillance officers
  const { data: officers = [], isLoading: officersLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/security/officers"]
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/security/tasks"]
  });

  // Fetch vehicle logs
  const { data: vehicleLogs = [], isLoading: vehicleLogsLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vehicle-logs"]
  });

  // Fetch maintenance requests (filter officer-submitted ones)
  const { data: allMaintenanceRequests = [], isLoading: maintenanceLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"]
  });

  // Filter maintenance requests from surveillance officers
  const maintenanceRequests = allMaintenanceRequests.filter(req => {
    return req.reportedBy?.role?.name === 'surveillance_officer';
  });

  // Create officer mutation
  const createOfficerMutation = useMutation({
    mutationFn: async (data: typeof newOfficer) => {
      return await apiRequest("POST", "/api/hotels/current/security/officers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/security/officers"] });
      toast({ title: "Surveillance Officer created successfully" });
      setIsCreateOfficerOpen(false);
      setNewOfficer({ username: "", password: "", email: "", phone: "", fullName: "", address: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create officer", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof newTask) => {
      return await apiRequest("POST", "/api/hotels/current/security/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/security/tasks"] });
      toast({ title: "Task assigned successfully" });
      setIsCreateTaskOpen(false);
      setNewTask({ assignedTo: "", title: "", description: "", priority: "medium", dueDate: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create task", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  // Approve maintenance request mutation
  const approveMaintenanceMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest("PUT", `/api/maintenance-requests/${requestId}`, { 
        status: 'approved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request approved successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to approve request", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  // Mark as resolved mutation
  const resolveMaintenanceMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest("PUT", `/api/maintenance-requests/${requestId}`, { 
        status: 'resolved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request marked as resolved" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to resolve request", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  // Decline maintenance request mutation
  const declineMaintenanceMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest("PUT", `/api/maintenance-requests/${requestId}`, { 
        status: 'declined'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request declined successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to decline request", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.username || !newOfficer.password || !newOfficer.email || !newOfficer.phone || !newOfficer.fullName || !newOfficer.address) {
      toast({ title: "All fields are required (username, password, email, phone, full name, and address)", variant: "destructive" });
      return;
    }
    createOfficerMutation.mutate(newOfficer);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.assignedTo || !newTask.title) {
      toast({ title: "Please select an officer and enter task title", variant: "destructive" });
      return;
    }
    createTaskMutation.mutate(newTask);
  };

  const onlineOfficers = officers.filter(o => {
    return dailyAttendance.some(a => a.userId === o.id && a.status === 'active');
  });
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const activeVehicles = vehicleLogs.filter(v => !v.checkOut);
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending');

  return (
    <DashboardLayout title="Security Head Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Surveillance Officers"
            value={officers.length}
            icon={<Users />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="On Duty"
            value={onlineOfficers.length}
            icon={<Shield />}
            iconColor="text-green-500"
            trend={{ 
              value: officers.length > 0 ? Math.round((onlineOfficers.length / officers.length) * 100) : 0, 
              label: "coverage", 
              isPositive: true 
            }}
          />
          <StatsCard
            title="Vehicles on Premises"
            value={activeVehicles.length}
            icon={<Car />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<ClipboardList />}
            iconColor="text-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Dialog open={isCreateOfficerOpen} onOpenChange={setIsCreateOfficerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-add-officer">
                    <UserPlus className="h-6 w-6" />
                    <span className="text-sm">Add Officer</span>
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-create-officer">
                  <DialogHeader>
                    <DialogTitle>Create Surveillance Officer</DialogTitle>
                    <DialogDescription>
                      Create a new surveillance officer account with username and password
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateOfficer} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        data-testid="input-officer-username"
                        value={newOfficer.username}
                        onChange={(e) => setNewOfficer({ ...newOfficer, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        data-testid="input-officer-password"
                        value={newOfficer.password}
                        onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        data-testid="input-officer-email"
                        value={newOfficer.email}
                        onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        data-testid="input-officer-phone"
                        value={newOfficer.phone}
                        onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        data-testid="input-officer-fullname"
                        value={newOfficer.fullName}
                        onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        data-testid="input-officer-address"
                        value={newOfficer.address}
                        onChange={(e) => setNewOfficer({ ...newOfficer, address: e.target.value })}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createOfficerMutation.isPending}
                        data-testid="button-submit-officer"
                      >
                        {createOfficerMutation.isPending ? "Creating..." : "Create Officer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-assign-task">
                    <ClipboardList className="h-6 w-6" />
                    <span className="text-sm">Assign Task</span>
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-create-task">
                  <DialogHeader>
                    <DialogTitle>Assign Task to Officer</DialogTitle>
                    <DialogDescription>
                      Create a new task and assign it to a surveillance officer
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                      <Label htmlFor="officer">Assign To *</Label>
                      <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                        <SelectTrigger data-testid="select-task-officer">
                          <SelectValue placeholder="Select an officer" />
                        </SelectTrigger>
                        <SelectContent>
                          {officers.map((officer) => {
                            const isOnDuty = dailyAttendance.some(a => a.userId === officer.id && a.status === 'active');
                            return (
                              <SelectItem key={officer.id} value={officer.id}>
                                {officer.username} {isOnDuty ? '(On Duty)' : '(Off Duty)'}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="title">Task Title *</Label>
                      <Input
                        id="title"
                        data-testid="input-task-title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        data-testid="textarea-task-description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                        <SelectTrigger data-testid="select-task-priority">
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
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        data-testid="input-task-duedate"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createTaskMutation.isPending}
                        data-testid="button-submit-task"
                      >
                        {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-vehicle-logs">
                <Car className="h-6 w-6" />
                <span className="text-sm">View Vehicles</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="officers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="officers" data-testid="tab-officers">Officers</TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks</TabsTrigger>
            <TabsTrigger value="vehicles" data-testid="tab-vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="maintenance" data-testid="tab-maintenance">Maintenance</TabsTrigger>
          </TabsList>

          {/* Officers Tab */}
          <TabsContent value="officers">
            <Card>
              <CardHeader>
                <CardTitle>Surveillance Officers</CardTitle>
              </CardHeader>
              <CardContent>
                {officersLoading ? (
                  <div className="text-center py-8" data-testid="loading-officers">Loading officers...</div>
                ) : officers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-officers">
                    No surveillance officers yet. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {officers.map((officer) => {
                      const isOnDuty = dailyAttendance.some(a => a.userId === officer.id && a.status === 'active');
                      return (
                        <div key={officer.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`officer-${officer.id}`}>
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${isOnDuty ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div>
                              <div className="font-medium" data-testid={`officer-name-${officer.id}`}>{officer.username}</div>
                              <div className="text-sm text-muted-foreground">
                                {officer.email || 'No email'} • {officer.phone || 'No phone'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs ${isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`} data-testid={`officer-status-${officer.id}`}>
                              {isOnDuty ? 'On Duty' : 'Off Duty'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-8" data-testid="loading-tasks">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-tasks">
                    No tasks assigned yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => {
                      const assignee = officers.find(o => o.id === task.assignedTo);
                      return (
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
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <span data-testid={`task-assignee-${task.id}`}>Assigned to: {assignee?.username || 'Unknown'}</span>
                                <span data-testid={`task-status-${task.id}`}>Status: {task.status}</span>
                                {task.dueDate && (
                                  <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Check-in/Check-out Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {vehicleLogsLoading ? (
                  <div className="text-center py-8" data-testid="loading-vehicles">Loading vehicle logs...</div>
                ) : vehicleLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-vehicles">
                    No vehicle logs yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vehicleLogs.map((log) => (
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
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          log.checkOut ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                        }`} data-testid={`vehicle-status-${log.id}`}>
                          {log.checkOut ? 'Checked Out' : 'On Premises'}
                        </span>
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
                <CardTitle>Maintenance Requests from Officers</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="text-center py-8" data-testid="loading-maintenance">Loading maintenance requests...</div>
                ) : maintenanceRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-maintenance">
                    No maintenance requests from officers yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRequests.map((request) => (
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
                                <span>Reported by: {request.reportedBy?.username || 'Unknown'}</span>
                                <span>Location: {request.location}</span>
                                <span data-testid={`maintenance-status-${request.id}`}>Status: {request.status}</span>
                              </div>
                            </div>
                            {request.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => approveMaintenanceMutation.mutate(request.id)}
                                  disabled={approveMaintenanceMutation.isPending}
                                  data-testid={`button-approve-${request.id}`}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => declineMaintenanceMutation.mutate(request.id)}
                                  disabled={declineMaintenanceMutation.isPending}
                                  data-testid={`button-decline-${request.id}`}
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                            {request.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => resolveMaintenanceMutation.mutate(request.id)}
                                disabled={resolveMaintenanceMutation.isPending}
                                data-testid={`button-resolve-${request.id}`}
                              >
                                Mark as Resolved
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
