import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle, UserCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function DutyTracking() {
  const { data: allStaff = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  const restaurantStaff = allStaff.filter(staff => 
    ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'].includes(staff.role?.name || '')
  );

  const activeAttendanceUserIds = dailyAttendance.filter(a => a.status === 'active').map(a => a.userId);
  const onDutyStaff = restaurantStaff.filter(s => activeAttendanceUserIds.includes(s.id));
  const offDutyStaff = restaurantStaff.filter(s => !activeAttendanceUserIds.includes(s.id));

  const getStaffAttendance = (userId: string) => {
    return dailyAttendance.find(a => a.userId === userId && a.status === 'active');
  };

  const columns = [
    { key: "username", label: "Staff Name", sortable: true },
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
        const attendance = getStaffAttendance(row.id);
        return (
          <div className="space-y-1">
            <Badge 
              variant={isOnDuty ? 'default' : 'secondary'}
              className={isOnDuty ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}
            >
              {isOnDuty ? 'On Duty' : 'Off Duty'}
            </Badge>
            {attendance && (
              <p className="text-xs text-muted-foreground">
                Since {formatDateTime(attendance.clockInTime)}
              </p>
            )}
          </div>
        );
      }
    },
    { 
      key: "id", 
      label: "Total Hours Today", 
      render: (_: any, row: any) => {
        const userAttendance = dailyAttendance.filter(a => a.userId === row.id);
        const totalHours = userAttendance.reduce((sum, a) => {
          if (a.totalHours) {
            return sum + parseFloat(a.totalHours);
          }
          return sum;
        }, 0);
        return totalHours > 0 ? `${totalHours.toFixed(2)} hrs` : '-';
      }
    }
  ];

  const getRoleCount = (roleName: string, isOnDuty: boolean) => {
    const roleStaff = restaurantStaff.filter(s => s.role?.name === roleName);
    const onDutyCount = roleStaff.filter(s => activeAttendanceUserIds.includes(s.id)).length;
    return isOnDuty ? onDutyCount : roleStaff.length;
  };

  return (
    <DashboardLayout title="Restaurant Duty Tracking">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{restaurantStaff.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On Duty</p>
                  <p className="text-2xl font-bold">{onDutyStaff.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Off Duty</p>
                  <p className="text-2xl font-bold">{offDutyStaff.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duty Coverage</p>
                  <p className="text-2xl font-bold">
                    {restaurantStaff.length > 0 ? Math.round((onDutyStaff.length / restaurantStaff.length) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Duty Summary by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Waiters</span>
                <span className="font-medium">
                  {getRoleCount('waiter', true)} / {getRoleCount('waiter', false)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Kitchen Staff</span>
                <span className="font-medium">
                  {getRoleCount('kitchen_staff', true)} / {getRoleCount('kitchen_staff', false)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bartenders</span>
                <span className="font-medium">
                  {getRoleCount('bartender', true)} / {getRoleCount('bartender', false)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Baristas</span>
                <span className="font-medium">
                  {getRoleCount('barista', true)} / {getRoleCount('barista', false)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cashiers</span>
                <span className="font-medium">
                  {getRoleCount('cashier', true)} / {getRoleCount('cashier', false)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Staff members manage their own duty status using the duty toggle. Attendance is tracked automatically when staff clock in and out.
            </p>
          </CardContent>
        </Card>

        <DataTable
          title="Restaurant Staff Duty Status"
          data={restaurantStaff}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search staff..."
        />
      </div>
    </DashboardLayout>
  );
}
