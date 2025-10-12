import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, UserCheck } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

export default function AttendanceReports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data: allStaff = [], isLoading: staffLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  const { data: dailyAttendance = [], isLoading: attendanceLoading } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  const { data: allAttendance = [], isLoading: allAttendanceLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/attendance"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/attendance", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
    refetchInterval: 3000
  });

  const activeAttendanceUserIds = dailyAttendance
    .filter(a => a.status === 'active')
    .map(a => a.userId);

  const onDutyStaff = allStaff.filter(s => activeAttendanceUserIds.includes(s.id));
  const offDutyStaff = allStaff.filter(s => !activeAttendanceUserIds.includes(s.id));

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const monthlyAttendance = allAttendance.filter(record => {
    if (!record.clockInTime) return false;
    const clockInDate = parseISO(record.clockInTime);
    return clockInDate >= monthStart && clockInDate <= monthEnd;
  });

  const totalHoursWorked = monthlyAttendance.reduce((sum, record) => {
    return sum + (Number(record.totalHours) || 0);
  }, 0);

  const avgHoursPerDay = monthlyAttendance.length > 0 
    ? totalHoursWorked / monthlyAttendance.length 
    : 0;

  const columns = [
    { 
      key: "clockInTime", 
      label: "Date", 
      sortable: true,
      render: (value: any) => value ? format(parseISO(value), 'MMM dd, yyyy') : "N/A"
    },
    { 
      key: "fullName", 
      label: "Name", 
      sortable: true,
      render: (value: any, row: any) => {
        const user = allStaff.find(s => s.id === row.userId);
        return user?.fullName || "N/A";
      }
    },
    { 
      key: "username", 
      label: "Username", 
      sortable: true,
      render: (value: any, row: any) => {
        const user = allStaff.find(s => s.id === row.userId);
        return user?.username || "Unknown";
      }
    },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (_: any, row: any) => {
        const user = allStaff.find(s => s.id === row.userId);
        return user?.role?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "N/A";
      }
    },
    { 
      key: "clockInTime", 
      label: "Clock In", 
      sortable: true,
      render: (value: any) => value ? formatDateTime(value) : "N/A"
    },
    { 
      key: "clockOutTime", 
      label: "Clock Out", 
      sortable: true,
      render: (value: any) => value ? formatDateTime(value) : "Still on duty"
    },
    { 
      key: "totalHours", 
      label: "Total Hours", 
      sortable: true,
      render: (value: any) => {
        const hours = Number(value) || 0;
        return hours > 0 ? `${hours.toFixed(2)} hrs` : "N/A";
      }
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value: any) => (
        <Badge 
          variant={value === 'active' ? 'default' : 'secondary'}
          className={cn(
            value === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          )}
        >
          {value === 'active' ? 'Active' : 'Completed'}
        </Badge>
      )
    }
  ];

  const currentAttendanceColumns = [
    { 
      key: "fullName", 
      label: "Name", 
      sortable: true 
    },
    { 
      key: "username", 
      label: "Username", 
      sortable: true 
    },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (value: any) => value?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    },
    { 
      key: "id", 
      label: "Duty Status", 
      render: (_: any, row: any) => {
        const isOnDuty = activeAttendanceUserIds.includes(row.id);
        const attendance = dailyAttendance.find(a => a.userId === row.id && a.status === 'active');
        return (
          <div className="space-y-1">
            <Badge 
              variant={isOnDuty ? 'default' : 'secondary'}
              className={cn(
                isOnDuty 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
              )}
            >
              {isOnDuty ? 'On Duty' : 'Off Duty'}
            </Badge>
            {attendance && (
              <div className="text-xs text-muted-foreground">
                Since {formatDateTime(attendance.clockInTime)}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DashboardLayout title="Attendance Reports">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Staff"
            value={allStaff.length}
            icon={<Users />}
            iconColor="text-blue-500"
            data-testid="stats-total-staff"
          />
          <StatsCard
            title="On Duty"
            value={onDutyStaff.length}
            icon={<UserCheck />}
            iconColor="text-green-500"
            data-testid="stats-on-duty"
          />
          <StatsCard
            title="Total Hours (This Month)"
            value={`${totalHoursWorked.toFixed(1)} hrs`}
            icon={<Clock />}
            iconColor="text-purple-500"
            data-testid="stats-total-hours"
          />
          <StatsCard
            title="Avg Hours/Day"
            value={`${avgHoursPerDay.toFixed(1)} hrs`}
            icon={<Calendar />}
            iconColor="text-orange-500"
            data-testid="stats-avg-hours"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Current Duty Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Staff Duty Status"
              data={allStaff}
              columns={currentAttendanceColumns}
              searchPlaceholder="Search staff..."
              isLoading={staffLoading}
              data-testid="table-current-duty"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance Records - {format(selectedMonth, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title="Attendance History"
              data={monthlyAttendance}
              columns={columns}
              searchPlaceholder="Search attendance records..."
              isLoading={allAttendanceLoading}
              data-testid="table-attendance-records"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
