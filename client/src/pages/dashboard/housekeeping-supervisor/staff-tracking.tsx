import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckSquare } from "lucide-react";

export default function HousekeepingSupervisorStaffTracking() {
  const { data: staff = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/tasks", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"]
  });

  const housekeepingStaff = staff.filter(s => s.role?.name === 'housekeeping_staff');

  const getStaffTasks = (staffId: string) => {
    return tasks.filter(t => t.assignedTo === staffId);
  };

  const getStaffCurrentTask = (staffId: string) => {
    const staffTasks = getStaffTasks(staffId);
    return staffTasks.find(t => t.status === 'performing') || staffTasks.find(t => t.status === 'pending');
  };

  return (
    <DashboardLayout title="Staff Tracking">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : housekeepingStaff.length === 0 ? (
              <p className="text-muted-foreground" data-testid="no-staff">No housekeeping staff found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {housekeepingStaff.map((member, index) => {
                  const currentTask = getStaffCurrentTask(member.id);
                  const completedTasks = getStaffTasks(member.id).filter(t => t.status === 'completed').length;

                  return (
                    <Card key={member.id} data-testid={`staff-card-${index}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{member.username}</h4>
                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                          </div>
                          <Badge 
                            className={dailyAttendance.some(a => a.userId === member.id && a.status === 'active') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} 
                            variant="secondary"
                          >
                            {dailyAttendance.some(a => a.userId === member.id && a.status === 'active') ? 'On Duty' : 'Off Duty'}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Last Active: {member.lastLogin ? new Date(member.lastLogin).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kathmandu' }) : 'Never'}
                            </span>
                          </div>

                          <div className="flex items-center text-sm">
                            <CheckSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Completed: {completedTasks} tasks
                            </span>
                          </div>

                          {currentTask && (
                            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-900">Current Task</p>
                                  <p className="text-xs text-blue-700">{currentTask.title}</p>
                                  <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs" variant="secondary">
                                    {currentTask.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}

                          {!currentTask && dailyAttendance.some(a => a.userId === member.id && a.status === 'active') && (
                            <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                              <p className="text-xs text-gray-600">No active tasks</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
