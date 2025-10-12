import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function SurveillanceOfficerDutyStatus() {
  const { data: attendanceStatus } = useQuery<any>({
    queryKey: ["/api/attendance/status"],
    refetchInterval: 3000
  });

  const { data: attendanceHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/history"],
    refetchInterval: 3000
  });

  const isOnDuty = attendanceStatus?.isOnDuty || false;
  const activeAttendance = attendanceStatus?.attendance;
  const recentAttendance = attendanceHistory.slice(0, 5);

  return (
    <DashboardLayout title="Duty Status">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Duty Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-foreground">Current Status</h4>
                    <p className="text-sm text-muted-foreground">Your duty status for today</p>
                  </div>
                </div>
                <Badge 
                  className={isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} 
                  variant="secondary"
                  data-testid="duty-status-badge"
                >
                  {isOnDuty ? 'On Duty' : 'Off Duty'}
                </Badge>
              </div>

              {activeAttendance && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <LogIn className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Clock In Time</p>
                          <p className="font-medium text-foreground" data-testid="clock-in-time">
                            {formatDateTime(activeAttendance.clockInTime)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium text-foreground" data-testid="clock-in-location">
                            {activeAttendance.clockInLocation || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Note:</strong> Use the duty toggle in the top navigation bar to clock in or clock out. 
                    Your attendance is automatically tracked when you're on duty.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-muted-foreground">No attendance records found</p>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record: any, index: number) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`attendance-record-${index}`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <LogIn className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-medium text-foreground">{formatDateTime(record.clockInTime)}</p>
                      </div>
                      {record.clockOutTime && (
                        <div className="flex items-center space-x-2 mt-1">
                          <LogOut className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-muted-foreground">{formatDateTime(record.clockOutTime)}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
                        {record.status === 'active' ? 'Active' : 'Completed'}
                      </Badge>
                      {record.totalHours && (
                        <p className="text-xs text-muted-foreground mt-1">{parseFloat(record.totalHours).toFixed(2)} hours</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
