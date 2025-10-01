import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Clock, CheckSquare, Car, AlertTriangle, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function SurveillanceOfficerDashboard() {
  const { user } = useAuth();
  
  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/security/tasks"]
  });

  const { data: vehicleLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vehicle-logs"]
  });

  const { data: maintenanceRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  const myTasks = tasks.filter(t => t.assignedTo === user?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  
  const myVehicleLogs = vehicleLogs.filter(v => v.recordedBy === user?.id);
  const activeVehicles = myVehicleLogs.filter(v => !v.checkOut);
  
  const myMaintenanceRequests = maintenanceRequests.filter(r => r.reportedBy === user?.id);
  const pendingMaintenanceRequests = myMaintenanceRequests.filter(r => r.status === 'pending');

  return (
    <DashboardLayout title="Surveillance Officer Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Shield className="h-12 w-12 text-primary" />
              <div>
                <h2 className="text-2xl font-bold">Welcome, {user?.username}</h2>
                <p className="text-muted-foreground">Monitor and secure the premises</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
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
            title="Active Vehicles"
            value={activeVehicles.length}
            icon={<Car />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Pending Maintenance"
            value={pendingMaintenanceRequests.length}
            icon={<AlertTriangle />}
            iconColor="text-red-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/surveillance-officer/duty-status">
                <Button className="w-full" variant="outline" data-testid="link-duty-status">
                  <Clock className="h-4 w-4 mr-2" />
                  Duty Status
                </Button>
              </Link>
              <Link href="/surveillance-officer/vehicle-logs">
                <Button className="w-full" variant="outline" data-testid="link-vehicle-logs">
                  <Car className="h-4 w-4 mr-2" />
                  Vehicle Check-in/Out
                </Button>
              </Link>
              <Link href="/surveillance-officer/my-tasks">
                <Button className="w-full" variant="outline" data-testid="link-my-tasks">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  View My Tasks
                </Button>
              </Link>
              <Link href="/surveillance-officer/maintenance-reports">
                <Button className="w-full" variant="outline" data-testid="link-maintenance">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Maintenance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {myTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.dueDate && `Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {myTasks.length > 3 && (
                  <Link href="/surveillance-officer/my-tasks">
                    <Button variant="link" className="w-full">View all tasks →</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Vehicle Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Vehicle Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {myVehicleLogs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No vehicle logs yet.</p>
            ) : (
              <div className="space-y-3">
                {myVehicleLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <p className="font-medium">{log.vehicleNumber}</p>
                        <span className="text-sm text-muted-foreground">• {log.driverName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.checkIn), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.checkOut ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {log.checkOut ? 'Checked Out' : 'On Premises'}
                    </span>
                  </div>
                ))}
                {myVehicleLogs.length > 3 && (
                  <Link href="/surveillance-officer/vehicle-logs">
                    <Button variant="link" className="w-full">View all logs →</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
