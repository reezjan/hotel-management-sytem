import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatDateTime } from "@/lib/utils";

export default function HousekeepingSupervisorDutyTracking() {
  const { data: staff = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    }
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/attendance/daily", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    }
  });

  const housekeepingStaff = staff.filter(s => s.role?.name === 'housekeeping_staff');
  const activeAttendanceUserIds = dailyAttendance.filter(a => a.status === 'active').map(a => a.userId);
  const onlineStaff = housekeepingStaff.filter(s => activeAttendanceUserIds.includes(s.id));
  const offlineStaff = housekeepingStaff.filter(s => !activeAttendanceUserIds.includes(s.id));

  return (
    <DashboardLayout title="Duty Tracking">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Staff"
            value={housekeepingStaff.length}
            icon={<Users />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="On Duty"
            value={onlineStaff.length}
            icon={<UserCheck />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Off Duty"
            value={offlineStaff.length}
            icon={<UserX />}
            iconColor="text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff On Duty</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : onlineStaff.length === 0 ? (
                <p className="text-muted-foreground" data-testid="no-online-staff">No staff currently on duty</p>
              ) : (
                <div className="space-y-3">
                  {onlineStaff.map((member, index) => {
                    const attendance = dailyAttendance.find(a => a.userId === member.id && a.status === 'active');
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`online-staff-${index}`}>
                        <div>
                          <h4 className="font-medium text-foreground">{member.username}</h4>
                          <p className="text-sm text-muted-foreground">{member.phone}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" variant="secondary">On Duty</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {attendance?.clockInTime ? formatDateTime(attendance.clockInTime) : 'Active'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff Off Duty</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : offlineStaff.length === 0 ? (
                <p className="text-muted-foreground" data-testid="no-offline-staff">All staff are on duty</p>
              ) : (
                <div className="space-y-3">
                  {offlineStaff.map((member, index) => {
                    const lastAttendance = dailyAttendance
                      .filter(a => a.userId === member.id && a.status === 'completed')
                      .sort((a, b) => new Date(b.clockOutTime).getTime() - new Date(a.clockOutTime).getTime())[0];
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`offline-staff-${index}`}>
                        <div>
                          <h4 className="font-medium text-foreground">{member.username}</h4>
                          <p className="text-sm text-muted-foreground">{member.phone}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" variant="secondary">Off Duty</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lastAttendance?.clockOutTime ? formatDateTime(lastAttendance.clockOutTime) : 'No recent activity'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
