import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  CalendarIcon, 
  FileText, 
  DollarSign, 
  Users, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  Activity,
  Shield,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Eye,
  Image as ImageIcon,
  FilePlus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Ban
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

// Staff Activity Tab Component
function StaffActivityTab({ dateRange }: { dateRange: { from: Date | undefined; to: Date | undefined } }) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch users data
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ["/api/users"]
  });

  // Fetch leave requests
  const { data: leaveRequests = [], isLoading: loadingLeaves } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests"]
  });

  // Fetch audit logs for staff activity
  const buildQueryUrl = (baseUrl: string, from?: Date, to?: Date) => {
    if (!from || !to) return baseUrl;
    const params = new URLSearchParams({
      startDate: from.toISOString(),
      endDate: to.toISOString()
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const { data: auditLogs = [], isLoading: loadingAuditLogs } = useQuery({
    queryKey: ['/api/audit-logs', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/audit-logs', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000
  });

  // Real-time updates
  useRealtimeQuery({
    queryKey: ["/api/users"],
    events: ['user:updated']
  });

  useRealtimeQuery({
    queryKey: ['/api/audit-logs'],
    events: ['audit:created']
  });

  const isLoading = loadingUsers || loadingLeaves || loadingAuditLogs;

  // Filter active staff
  const activeStaff = allUsers.filter(u => u.isActive && !u.deletedAt);
  
  // Filter online staff
  const onlineStaff = activeStaff.filter(u => u.isOnline);
  
  // Filter staff on leave today
  const today = new Date();
  const staffOnLeaveToday = leaveRequests.filter((lr: any) => {
    if (lr.status !== 'approved') return false;
    const startDate = new Date(lr.startDate);
    const endDate = new Date(lr.endDate);
    return today >= startDate && today <= endDate;
  });

  // Calculate most active staff
  const activityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLogs.forEach((log: any) => {
      if (log.userId) {
        counts[log.userId] = (counts[log.userId] || 0) + 1;
      }
    });
    return counts;
  }, [auditLogs]);

  const mostActiveStaff = useMemo(() => {
    if (Object.keys(activityCounts).length === 0) return null;
    const sortedEntries = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);
    const [userId, count] = sortedEntries[0];
    const user = allUsers.find(u => u.id === userId);
    return { user, count };
  }, [activityCounts, allUsers]);

  // Filter and sort audit logs for activity table
  const filteredAuditLogs = useMemo(() => {
    let result = [...auditLogs];

    if (selectedStaffId !== "all") {
      result = result.filter(log => log.userId === selectedStaffId);
    }

    if (filterAction !== "all") {
      result = result.filter(log => log.action === filterAction);
    }

    if (filterRole !== "all") {
      result = result.filter(log => log.user?.role?.name === filterRole);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [auditLogs, selectedStaffId, filterAction, filterRole, sortField, sortDirection]);

  // Get login/logout events
  const loginHistory = useMemo(() => {
    return auditLogs.filter((log: any) => 
      log.action === 'login' || log.action === 'logout'
    ).map((log: any) => {
      // Parse user agent for device info
      const ua = log.userAgent || '';
      let browser = 'Unknown';
      let os = 'Unknown';
      
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac')) os = 'MacOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS')) os = 'iOS';

      return {
        ...log,
        browser,
        os,
        device: `${browser} on ${os}`,
        isNewDevice: log.details?.isNewDevice || false,
        isNewLocation: log.details?.isNewLocation || false
      };
    });
  }, [auditLogs]);

  // Group login/logout events by user
  const loginSessions = useMemo(() => {
    const sessions: any[] = [];
    const userLogins: Record<string, any> = {};

    loginHistory.forEach((log: any) => {
      if (log.action === 'login') {
        userLogins[log.userId] = log;
      } else if (log.action === 'logout' && userLogins[log.userId]) {
        const loginLog = userLogins[log.userId];
        const loginTime = new Date(loginLog.createdAt);
        const logoutTime = new Date(log.createdAt);
        const duration = (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60); // minutes

        sessions.push({
          user: loginLog.user,
          loginTime: loginLog.createdAt,
          logoutTime: log.createdAt,
          duration: duration.toFixed(0),
          device: loginLog.device,
          browser: loginLog.browser,
          os: loginLog.os,
          location: loginLog.ipAddress,
          isNewDevice: loginLog.isNewDevice,
          isNewLocation: loginLog.isNewLocation
        });

        delete userLogins[log.userId];
      }
    });

    // Add active sessions (login without logout)
    Object.values(userLogins).forEach((loginLog: any) => {
      sessions.push({
        user: loginLog.user,
        loginTime: loginLog.createdAt,
        logoutTime: null,
        duration: null,
        device: loginLog.device,
        browser: loginLog.browser,
        os: loginLog.os,
        location: loginLog.ipAddress,
        isNewDevice: loginLog.isNewDevice,
        isNewLocation: loginLog.isNewLocation
      });
    });

    return sessions.sort((a, b) => 
      new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    );
  }, [loginHistory]);

  // Get action color
  const getActionColor = (action: string) => {
    if (action === 'create') return 'text-green-600 dark:text-green-400';
    if (action === 'update') return 'text-blue-600 dark:text-blue-400';
    if (action === 'delete' || action === 'void') return 'text-red-600 dark:text-red-400';
    if (action === 'approve') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getActionBgColor = (action: string) => {
    if (action === 'create') return 'bg-green-50 dark:bg-green-900/10';
    if (action === 'update') return 'bg-blue-50 dark:bg-blue-900/10';
    if (action === 'delete' || action === 'void') return 'bg-red-50 dark:bg-red-900/10';
    if (action === 'approve') return 'bg-yellow-50 dark:bg-yellow-900/10';
    return 'bg-gray-50 dark:bg-gray-900/10';
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get unique values for filters
  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log: any) => log.action))).filter(Boolean) as string[];
  }, [auditLogs]);

  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log: any) => log.user?.role?.name).filter(Boolean))) as string[];
  }, [auditLogs]);

  // Get selected staff details
  const selectedStaffDetails = useMemo(() => {
    if (selectedStaffId === "all") return null;
    
    const staff = allUsers.find(u => u.id === selectedStaffId);
    if (!staff) return null;

    const staffLogs = auditLogs.filter((log: any) => log.userId === selectedStaffId);
    const staffTransactions = staffLogs.filter((log: any) => log.resourceType === 'transaction');
    const staffApprovals = staffLogs.filter((log: any) => log.action === 'approve');
    const staffLogins = loginHistory.filter((log: any) => log.userId === selectedStaffId);
    
    const devices = Array.from(new Set(staffLogins.map((log: any) => log.device))) as string[];

    return {
      staff,
      totalActions: staffLogs.length,
      transactions: staffTransactions.length,
      approvals: staffApprovals.length,
      logins: staffLogins.length,
      devices,
      recentActivity: staffLogs.slice(0, 10)
    };
  }, [selectedStaffId, allUsers, auditLogs, loginHistory]);

  return (
    <div className="space-y-6">
      {/* Section 1: Staff Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-active-staff" className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-active-staff-count">
                  {activeStaff.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active employees
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-online-staff" className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Online</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-online-staff-count">
                  {onlineStaff.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Staff online now
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-staff-on-leave" className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff on Leave Today</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-on-leave-count">
                  {staffOnLeaveToday.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  On approved leave
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-most-active-staff" className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Staff</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : mostActiveStaff ? (
              <>
                <div className="text-lg font-bold truncate" data-testid="text-most-active-name">
                  {mostActiveStaff.user?.username || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-most-active-count">
                  {mostActiveStaff.count} actions
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Staff Activity Table */}
      <Card data-testid="card-staff-activity-table">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Staff Activity Log
          </CardTitle>
          <CardDescription>Detailed log of all staff actions and operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="w-[200px]" data-testid="select-staff-filter">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {activeStaff.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>{staff.username}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[200px]" data-testid="select-action-filter">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[200px]" data-testid="select-role-filter">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('user')} data-testid="th-staff-name">
                    <div className="flex items-center gap-1">
                      Staff Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead data-testid="th-role">Role</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('action')} data-testid="th-action">
                    <div className="flex items-center gap-1">
                      Action
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead data-testid="th-resource">Resource</TableHead>
                  <TableHead data-testid="th-details">Details</TableHead>
                  <TableHead data-testid="th-device-info">Device</TableHead>
                  <TableHead data-testid="th-location">Location</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')} data-testid="th-time">
                    <div className="flex items-center gap-1">
                      Time
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredAuditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground" data-testid="text-no-activity">
                      No staff activity found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAuditLogs.slice(0, 50).map((log: any) => (
                    <TableRow 
                      key={log.id} 
                      className={getActionBgColor(log.action)}
                      data-testid={`activity-row-${log.id}`}
                    >
                      <TableCell className="font-medium text-xs" data-testid={`td-staff-${log.id}`}>
                        {log.user?.username || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-role-${log.id}`}>
                        {log.user?.role?.name || '-'}
                      </TableCell>
                      <TableCell data-testid={`td-action-${log.id}`}>
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-resource-${log.id}`}>
                        {log.resourceType || '-'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" data-testid={`td-details-${log.id}`}>
                        {log.resourceId || '-'}
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-device-${log.id}`}>
                        {log.userAgent ? (
                          <span className="truncate max-w-[150px] block" title={log.userAgent}>
                            {log.userAgent.split(' ')[0]}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-location-${log.id}`}>
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap" data-testid={`td-time-${log.id}`}>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Login History */}
      <Card data-testid="card-login-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>All login and logout events with device information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="th-login-staff">Staff Name</TableHead>
                  <TableHead data-testid="th-login-time">Login Time</TableHead>
                  <TableHead data-testid="th-logout-time">Logout Time</TableHead>
                  <TableHead data-testid="th-duration">Duration</TableHead>
                  <TableHead data-testid="th-browser">Browser</TableHead>
                  <TableHead data-testid="th-os">OS</TableHead>
                  <TableHead data-testid="th-ip">Location (IP)</TableHead>
                  <TableHead data-testid="th-flags">Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : loginSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground" data-testid="text-no-logins">
                      No login history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  loginSessions.slice(0, 30).map((session: any, index: number) => (
                    <TableRow 
                      key={index}
                      className={session.isNewDevice || session.isNewLocation ? 'bg-red-50 dark:bg-red-900/10' : ''}
                      data-testid={`login-row-${index}`}
                    >
                      <TableCell className="font-medium text-xs" data-testid={`td-login-staff-${index}`}>
                        {session.user?.username || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap" data-testid={`td-login-time-${index}`}>
                        {new Date(session.loginTime).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap" data-testid={`td-logout-time-${index}`}>
                        {session.logoutTime ? new Date(session.logoutTime).toLocaleString() : (
                          <Badge variant="outline" className="text-green-600">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-duration-${index}`}>
                        {session.duration ? `${session.duration} min` : '-'}
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-browser-${index}`}>
                        {session.browser}
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-os-${index}`}>
                        {session.os}
                      </TableCell>
                      <TableCell className="text-xs" data-testid={`td-ip-${index}`}>
                        {session.location || '-'}
                      </TableCell>
                      <TableCell data-testid={`td-flags-${index}`}>
                        {session.isNewDevice && (
                          <Badge variant="destructive" className="text-xs mr-1">New Device</Badge>
                        )}
                        {session.isNewLocation && (
                          <Badge variant="destructive" className="text-xs">New Location</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Per-Staff Drill-Down */}
      <Card data-testid="card-staff-drilldown">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Staff Detail View
          </CardTitle>
          <CardDescription>Select a staff member to view their detailed activity timeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger data-testid="select-staff-drilldown">
              <SelectValue placeholder="Select a staff member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select a staff member</SelectItem>
              {activeStaff.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.username} ({staff.role?.name || 'N/A'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStaffDetails && (
            <div className="space-y-4">
              {/* Staff Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold" data-testid="text-staff-total-actions">
                      {selectedStaffDetails.totalActions}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Actions</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold" data-testid="text-staff-transactions">
                      {selectedStaffDetails.transactions}
                    </div>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold" data-testid="text-staff-approvals">
                      {selectedStaffDetails.approvals}
                    </div>
                    <p className="text-xs text-muted-foreground">Approvals Given</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold" data-testid="text-staff-logins">
                      {selectedStaffDetails.logins}
                    </div>
                    <p className="text-xs text-muted-foreground">Login Sessions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Devices Used */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Devices Used</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStaffDetails.devices.length > 0 ? (
                    selectedStaffDetails.devices.map((device: string, idx: number) => (
                      <Badge key={idx} variant="outline" data-testid={`badge-device-${idx}`}>
                        {device}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No device information available</p>
                  )}
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Recent Activity Timeline</h4>
                <div className="space-y-2">
                  {selectedStaffDetails.recentActivity.length > 0 ? (
                    selectedStaffDetails.recentActivity.map((activity: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-lg ${getActionBgColor(activity.action)}`}
                        data-testid={`timeline-item-${idx}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getActionColor(activity.action)}>
                            {activity.action}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{activity.resourceType}</p>
                            <p className="text-xs text-muted-foreground">{activity.resourceId || 'N/A'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedStaffId === "all" && (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-select-staff">
              Please select a staff member to view their detailed activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuditTransparencyPage() {
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [activeTab, setActiveTab] = useState("overview");

  // Financial Tab States
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterTxnType, setFilterTxnType] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [viewBillUrl, setViewBillUrl] = useState<string>("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  // Quick filter handlers
  const setToday = () => {
    const today = new Date();
    setDateRange({ from: startOfDay(today), to: endOfDay(today) });
  };

  const setLast7Days = () => {
    const today = new Date();
    setDateRange({ from: startOfDay(subDays(today, 7)), to: endOfDay(today) });
  };

  const setLast30Days = () => {
    const today = new Date();
    setDateRange({ from: startOfDay(subDays(today, 30)), to: endOfDay(today) });
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  // Export handler
  const handleExport = (type: 'csv' | 'pdf') => {
    console.log(`Exporting as ${type}`);
  };

  // Financial Activity - Use financial overview logic (real-time)
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"]
  });

  // Maintenance Approvals - Use maintenance requests logic (real-time)
  const { data: maintenanceRequests = [], isLoading: loadingMaintenance } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  // Real-time updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    events: ['transaction:created', 'transaction:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    events: ['maintenance:updated']
  });

  // Filter transactions by date if range is selected
  const filteredTransactions = dateRange.from && dateRange.to 
    ? transactions.filter(t => {
        const txnDate = new Date(t.createdAt);
        return txnDate >= dateRange.from! && txnDate <= dateRange.to!;
      })
    : transactions;

  // Filter maintenance by date if range is selected
  const filteredMaintenance = dateRange.from && dateRange.to
    ? maintenanceRequests.filter(m => {
        const reqDate = new Date(m.createdAt);
        return reqDate >= dateRange.from! && reqDate <= dateRange.to!;
      })
    : maintenanceRequests;

  const buildQueryUrl = (baseUrl: string, from?: Date, to?: Date) => {
    if (!from || !to) return baseUrl;
    const params = new URLSearchParams({
      startDate: from.toISOString(),
      endDate: to.toISOString()
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const { data: auditLogs = [], isLoading: loadingAuditLogs } = useQuery({
    queryKey: ['/api/audit-logs', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/audit-logs', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000
  });

  const { data: priceChangeLogs = [], isLoading: loadingPriceChanges } = useQuery({
    queryKey: ['/api/price-change-logs', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/price-change-logs', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000
  });

  const { data: inventoryMovements = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['/api/inventory-movement-logs', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/inventory-movement-logs', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000
  });

  const { data: staffActivity = [], isLoading: loadingStaffActivity } = useQuery({
    queryKey: ['/api/staff-activity-summary', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      const url = buildQueryUrl('/api/staff-activity-summary', dateRange.from, dateRange.to);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000
  });

  // Calculate stats for Overview Dashboard
  const today = new Date();
  const todayTransactions = transactions.filter(t => {
    const txnDate = new Date(t.createdAt);
    return txnDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayTransactions
    .filter(t => t.txnType === 'revenue' || t.txnType?.includes('_in'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const todayExpenses = todayTransactions
    .filter(t => t.txnType === 'expense' || t.txnType?.includes('_out'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const activeStaffCount = new Set(staffActivity.map((s: any) => s.userId)).size;

  const pendingApprovalsCount = maintenanceRequests.filter(
    (m: any) => m.status === 'pending'
  ).length;

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const securityAlertsCount = auditLogs.filter((log: any) => {
    const logDate = new Date(log.createdAt);
    return logDate >= last24Hours && !log.success;
  }).length;

  const cashInOutRatio = todayRevenue > 0 ? (todayRevenue / (todayExpenses || 1)).toFixed(2) : '0.00';

  // Recent activity timeline (last 10 activities from audit logs)
  const recentActivities = auditLogs.slice(0, 10);

  // Financial Tab Calculations
  const totalRevenue = useMemo(() => {
    return filteredTransactions
      .filter(t => t.txnType === 'revenue' || t.txnType?.includes('_in'))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.txnType === 'expense' || t.txnType?.includes('_out'))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  }, [filteredTransactions]);

  const netProfitLoss = totalRevenue - totalExpenses;

  const largestTransaction = useMemo(() => {
    if (filteredTransactions.length === 0) return null;
    return filteredTransactions.reduce((max, t) => 
      parseFloat(t.amount || 0) > parseFloat(max.amount || 0) ? t : max
    , filteredTransactions[0]);
  }, [filteredTransactions]);

  const voidedTransactionsCount = useMemo(() => {
    return filteredTransactions.filter(t => t.isVoided).length;
  }, [filteredTransactions]);

  // Payment method breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const breakdown = {
      cash: 0,
      pos: 0,
      fonepay: 0,
      other: 0
    };
    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.amount || 0);
      const method = t.paymentMethod?.toLowerCase() || 'other';
      if (method === 'cash') breakdown.cash += amount;
      else if (method === 'pos') breakdown.pos += amount;
      else if (method === 'fonepay') breakdown.fonepay += amount;
      else breakdown.other += amount;
    });
    return breakdown;
  }, [filteredTransactions]);

  const totalPayments = paymentMethodBreakdown.cash + paymentMethodBreakdown.pos + 
                        paymentMethodBreakdown.fonepay + paymentMethodBreakdown.other;

  // Flagged transactions
  const flaggedTransactions = useMemo(() => {
    const threshold = 50000; // Large transaction threshold
    return {
      large: filteredTransactions.filter(t => parseFloat(t.amount || 0) >= threshold),
      noBillProof: filteredTransactions.filter(t => 
        t.txnType?.includes('_out') && !t.billPhotoUrl && !t.billPdfUrl
      ),
      voided: filteredTransactions.filter(t => t.isVoided),
      requiresApproval: filteredTransactions.filter(t => t.requiresApproval && !t.approvedBy)
    };
  }, [filteredTransactions]);

  // Sorting and filtering for transactions table
  const processedTransactions = useMemo(() => {
    let result = [...filteredTransactions];

    // Filter by transaction type
    if (filterTxnType !== 'all') {
      result = result.filter(t => t.txnType === filterTxnType);
    }

    // Filter by payment method
    if (filterPaymentMethod !== 'all') {
      result = result.filter(t => t.paymentMethod?.toLowerCase() === filterPaymentMethod.toLowerCase());
    }

    // Filter by staff
    if (filterStaff !== 'all') {
      result = result.filter(t => t.createdBy === filterStaff);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.purpose?.toLowerCase().includes(query) ||
        t.reference?.toLowerCase().includes(query) ||
        t.creator?.username?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount') {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      } else if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [filteredTransactions, filterTxnType, filterPaymentMethod, filterStaff, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);
  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique values for filters
  const uniqueTxnTypes = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.txnType))).filter(Boolean);
  }, [transactions]);

  const uniquePaymentMethods = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.paymentMethod))).filter(Boolean);
  }, [transactions]);

  const uniqueStaff = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.creator).filter(Boolean)));
  }, [transactions]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const viewTransactionDetails = (txn: any) => {
    setSelectedTransaction(txn);
    setShowTransactionModal(true);
  };

  const viewBill = (url: string) => {
    setViewBillUrl(url);
    setShowBillModal(true);
  };

  const isLoading = loadingTransactions || loadingMaintenance || loadingAuditLogs || 
                    loadingPriceChanges || loadingInventory || loadingStaffActivity;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/owner")}
              data-testid="button-back"
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" data-testid="heading-audit-transparency">
                Audit & Transparency Center
              </h1>
              <p className="text-muted-foreground mt-1">Complete oversight of all hotel operations and financial activities</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-date-range" className="min-w-[240px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" data-testid="button-export">
                  <Download className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleExport('csv')}
                    data-testid="button-export-csv"
                    className="justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleExport('pdf')}
                    data-testid="button-export-pdf"
                    className="justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={dateRange.from && dateRange.to && 
                    dateRange.from.toDateString() === startOfDay(new Date()).toDateString() ? "default" : "outline"} 
            size="sm" 
            onClick={setToday}
            data-testid="button-filter-today"
          >
            <Clock className="mr-2 h-3 w-3" />
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setLast7Days}
            data-testid="button-filter-7days"
          >
            Last 7 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setLast30Days}
            data-testid="button-filter-30days"
          >
            Last 30 Days
          </Button>
          {(dateRange.from || dateRange.to) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearDateRange}
              data-testid="button-filter-clear"
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {/* Tab-based Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="overview" data-testid="tab-overview" className="flex items-center gap-2 py-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financial" data-testid="tab-financial" className="flex items-center gap-2 py-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="staff" data-testid="tab-staff" className="flex items-center gap-2 py-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="photos" data-testid="tab-photos" className="flex items-center gap-2 py-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Photos</span>
          </TabsTrigger>
          <TabsTrigger value="location" data-testid="tab-location" className="flex items-center gap-2 py-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Transactions Today */}
            <Card data-testid="card-total-transactions" className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-total-transactions">
                      {todayTransactions.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Active today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Revenue Today */}
            <Card data-testid="card-total-revenue" className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-total-revenue">
                      {formatCurrency(todayRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cash in today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Expenses Today */}
            <Card data-testid="card-total-expenses" className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses Today</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-total-expenses">
                      {formatCurrency(todayExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cash out today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Active Staff Count */}
            <Card data-testid="card-active-staff" className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-active-staff">
                      {activeStaffCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Performed actions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card data-testid="card-pending-approvals" className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-pending-approvals">
                      {pendingApprovalsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting review
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card data-testid="card-security-alerts" className="border-l-4 border-l-red-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-security-alerts">
                      {securityAlertsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last 24 hours
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cash In/Out Ratio */}
            <Card data-testid="card-cash-ratio" className="border-l-4 border-l-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash In/Out Ratio</CardTitle>
                <DollarSign className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-cash-ratio">
                      {cashInOutRatio}:1
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Today's ratio
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Wastage This Week - Placeholder */}
            <Card data-testid="card-wastage" className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wastage This Week</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-wastage">
                      0
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Items reported
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity Timeline
              </CardTitle>
              <CardDescription>Last 10 system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-activity">
                      No recent activities found.
                    </p>
                  ) : (
                    recentActivities.map((log: any, index: number) => (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-4 pb-4 border-b last:border-0" 
                        data-testid={`activity-${log.id}`}
                      >
                        <div className={`rounded-full p-2 ${log.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          {log.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium" data-testid={`text-activity-action-${log.id}`}>
                            {log.action} - {log.resourceType}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-activity-time-${log.id}`}>
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={log.success ? "default" : "destructive"} 
                          data-testid={`badge-activity-status-${log.id}`}
                        >
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Financial Activity */}
        <TabsContent value="financial" className="space-y-6">
          {/* Section 1: Transaction Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card data-testid="card-financial-revenue" className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-financial-revenue">
                      {formatCurrency(totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All income transactions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-financial-expenses" className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-financial-expenses">
                      {formatCurrency(totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All outgoing transactions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-net-profit" className={`border-l-4 ${netProfitLoss >= 0 ? 'border-l-green-600' : 'border-l-red-600'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
                <DollarSign className={`h-4 w-4 ${netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-net-profit">
                      {formatCurrency(Math.abs(netProfitLoss))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {netProfitLoss >= 0 ? 'Profit' : 'Loss'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-largest-transaction" className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Transaction</CardTitle>
                <Receipt className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-largest-transaction">
                      {largestTransaction ? formatCurrency(parseFloat(largestTransaction.amount || 0)) : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {largestTransaction?.purpose || 'No transactions'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-voided-transactions" className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voided Transactions</CardTitle>
                <Ban className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-voided-count">
                      {voidedTransactionsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cancelled transactions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Payment Method Breakdown */}
          <Card data-testid="card-payment-breakdown">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Method Breakdown
              </CardTitle>
              <CardDescription>Distribution of transactions by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Cash */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Cash</span>
                      <span data-testid="text-cash-amount">{formatCurrency(paymentMethodBreakdown.cash)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.cash / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* POS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">POS</span>
                      <span data-testid="text-pos-amount">{formatCurrency(paymentMethodBreakdown.pos)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.pos / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Fonepay */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Fonepay</span>
                      <span data-testid="text-fonepay-amount">{formatCurrency(paymentMethodBreakdown.fonepay)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.fonepay / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Other */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Other</span>
                      <span data-testid="text-other-amount">{formatCurrency(paymentMethodBreakdown.other)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500 transition-all"
                        style={{ width: `${totalPayments > 0 ? (paymentMethodBreakdown.other / totalPayments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Transactions Table */}
          <Card data-testid="card-transactions-table">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detailed Transaction Records
              </CardTitle>
              <CardDescription>Complete audit trail with filtering and sorting capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-4">
                <Input
                  placeholder="Search purpose, reference, staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                  className="md:col-span-1"
                />

                <Select value={filterTxnType} onValueChange={setFilterTxnType}>
                  <SelectTrigger data-testid="select-txn-type">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTxnTypes.map(type => (
                      <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {uniquePaymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStaff} onValueChange={setFilterStaff}>
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="Staff Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {uniqueStaff.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')} data-testid="th-date">
                        <div className="flex items-center gap-1">
                          Date/Time
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('txnType')} data-testid="th-type">
                        <div className="flex items-center gap-1">
                          Type
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('amount')} data-testid="th-amount">
                        <div className="flex items-center gap-1">
                          Amount
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead data-testid="th-payment">Payment Method</TableHead>
                      <TableHead data-testid="th-purpose">Purpose</TableHead>
                      <TableHead data-testid="th-created-by">Created By</TableHead>
                      <TableHead data-testid="th-bill">Bill Proof</TableHead>
                      <TableHead data-testid="th-status">Status</TableHead>
                      <TableHead data-testid="th-actions">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(9)].map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground" data-testid="text-no-table-data">
                          No transactions found matching the filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((txn: any) => (
                        <TableRow 
                          key={txn.id} 
                          className="cursor-pointer" 
                          onClick={() => viewTransactionDetails(txn)}
                          data-testid={`table-row-${txn.id}`}
                        >
                          <TableCell className="text-xs" data-testid={`td-date-${txn.id}`}>
                            {new Date(txn.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell data-testid={`td-type-${txn.id}`}>
                            <Badge variant="outline" className="text-xs">
                              {txn.txnType?.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`td-amount-${txn.id}`}>
                            {formatCurrency(parseFloat(txn.amount || 0))}
                          </TableCell>
                          <TableCell className="text-xs" data-testid={`td-payment-${txn.id}`}>
                            {txn.paymentMethod || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate" data-testid={`td-purpose-${txn.id}`}>
                            {txn.purpose || '-'}
                          </TableCell>
                          <TableCell className="text-xs" data-testid={`td-creator-${txn.id}`}>
                            {txn.creator?.username || 'Unknown'}
                          </TableCell>
                          <TableCell data-testid={`td-bill-${txn.id}`}>
                            {(txn.billPhotoUrl || txn.billPdfUrl) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewBill(txn.billPhotoUrl || txn.billPdfUrl);
                                }}
                                data-testid={`button-view-bill-${txn.id}`}
                              >
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell data-testid={`td-status-${txn.id}`}>
                            {txn.isVoided ? (
                              <Badge variant="destructive" className="text-xs">Voided</Badge>
                            ) : txn.requiresApproval && !txn.approvedBy ? (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            ) : txn.approvedBy ? (
                              <Badge variant="default" className="text-xs">Approved</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewTransactionDetails(txn);
                              }}
                              data-testid={`button-view-details-${txn.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedTransactions.length)} of {processedTransactions.length} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm" data-testid="text-current-page">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Flagged Transactions */}
          <Card data-testid="card-flagged-transactions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Flagged Transactions
              </CardTitle>
              <CardDescription>Transactions requiring attention or review</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Large Transactions */}
                  {flaggedTransactions.large.length > 0 && (
                    <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/10" data-testid="section-large-transactions">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Large Transactions (≥ NPR 50,000)
                        <Badge variant="outline">{flaggedTransactions.large.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.large.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-large-${txn.id}`}
                          >
                            <span className="truncate flex-1">{txn.purpose || 'Large Transaction'}</span>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cash Out Without Bill Proof */}
                  {flaggedTransactions.noBillProof.length > 0 && (
                    <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10" data-testid="section-no-bill">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FilePlus className="h-4 w-4" />
                        Cash Out Without Bill Proof
                        <Badge variant="outline">{flaggedTransactions.noBillProof.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.noBillProof.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-no-bill-${txn.id}`}
                          >
                            <span className="truncate flex-1">{txn.purpose || 'No Bill Proof'}</span>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voided Transactions */}
                  {flaggedTransactions.voided.length > 0 && (
                    <div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/10" data-testid="section-voided">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Ban className="h-4 w-4" />
                        Voided Transactions
                        <Badge variant="outline">{flaggedTransactions.voided.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.voided.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-orange-100 dark:hover:bg-orange-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-voided-${txn.id}`}
                          >
                            <div className="flex-1">
                              <p className="truncate">{txn.purpose || 'Voided Transaction'}</p>
                              {txn.voidReason && (
                                <p className="text-xs text-muted-foreground truncate">Reason: {txn.voidReason}</p>
                              )}
                            </div>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requires Approval */}
                  {flaggedTransactions.requiresApproval.length > 0 && (
                    <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10" data-testid="section-requires-approval">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Requires Approval
                        <Badge variant="outline">{flaggedTransactions.requiresApproval.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {flaggedTransactions.requiresApproval.slice(0, 3).map((txn: any) => (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between text-sm hover:bg-blue-100 dark:hover:bg-blue-900/20 p-2 rounded cursor-pointer"
                            onClick={() => viewTransactionDetails(txn)}
                            data-testid={`flagged-approval-${txn.id}`}
                          >
                            <span className="truncate flex-1">{txn.purpose || 'Pending Approval'}</span>
                            <span className="font-medium ml-4">{formatCurrency(parseFloat(txn.amount || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Flagged Transactions */}
                  {flaggedTransactions.large.length === 0 && 
                   flaggedTransactions.noBillProof.length === 0 && 
                   flaggedTransactions.voided.length === 0 && 
                   flaggedTransactions.requiresApproval.length === 0 && (
                    <div className="text-center py-8" data-testid="text-no-flagged">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No flagged transactions. All transactions are in good standing.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Staff Activity */}
        <TabsContent value="staff" className="space-y-6">
          <StaffActivityTab dateRange={dateRange} />
        </TabsContent>

        {/* Tab 4: Security Alerts */}
        <TabsContent value="security" className="space-y-6">
          <Card data-testid="card-security-alerts-detail">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Alerts & Failed Operations
              </CardTitle>
              <CardDescription>Monitor failed login attempts, unauthorized access, and system security events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.filter((log: any) => !log.success).length === 0 ? (
                    <div className="text-center py-8" data-testid="text-no-alerts">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No security alerts. All systems operating normally.</p>
                    </div>
                  ) : (
                    auditLogs
                      .filter((log: any) => !log.success)
                      .map((log: any) => (
                        <div 
                          key={log.id} 
                          className="flex items-start gap-4 p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10 rounded" 
                          data-testid={`security-alert-${log.id}`}
                        >
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium" data-testid={`text-alert-action-${log.id}`}>
                              {log.action} - {log.resourceType}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-alert-time-${log.id}`}>
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="destructive" data-testid={`badge-alert-status-${log.id}`}>
                            Failed
                          </Badge>
                        </div>
                      ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Photo Evidence */}
        <TabsContent value="photos" className="space-y-6">
          <Card data-testid="card-photo-evidence">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Evidence & Documentation
              </CardTitle>
              <CardDescription>View all photos attached to maintenance requests, incidents, and operations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMaintenance.filter((m: any) => m.photoUrls && m.photoUrls.length > 0).length === 0 ? (
                    <div className="text-center py-8" data-testid="text-no-photos">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No photos available for the selected period.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredMaintenance
                        .filter((m: any) => m.photoUrls && m.photoUrls.length > 0)
                        .flatMap((m: any) => 
                          m.photoUrls.map((url: string, idx: number) => (
                            <div 
                              key={`${m.id}-${idx}`} 
                              className="relative group cursor-pointer overflow-hidden rounded-lg border"
                              data-testid={`photo-${m.id}-${idx}`}
                            >
                              <img 
                                src={url} 
                                alt={`Maintenance ${m.id} - Photo ${idx + 1}`}
                                className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white text-xs">{m.title}</p>
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Device & Location History */}
        <TabsContent value="location" className="space-y-6">
          <Card data-testid="card-location-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Device & Location History
              </CardTitle>
              <CardDescription>Track staff login locations, devices used, and access patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" data-testid="text-no-location">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Device and location tracking not yet implemented</p>
                  <p className="text-xs text-muted-foreground">This feature will track IP addresses, devices, and login locations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="max-w-2xl" data-testid="modal-transaction-details">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="text-sm" data-testid="modal-txn-id">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <p className="text-sm" data-testid="modal-txn-date">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge data-testid="modal-txn-type">{selectedTransaction.txnType?.replace(/_/g, ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold" data-testid="modal-txn-amount">{formatCurrency(parseFloat(selectedTransaction.amount || 0))}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="text-sm" data-testid="modal-txn-payment">{selectedTransaction.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <p className="text-sm" data-testid="modal-txn-creator">{selectedTransaction.creator?.username || 'Unknown'}</p>
                </div>
                {selectedTransaction.reference && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Reference</p>
                    <p className="text-sm" data-testid="modal-txn-reference">{selectedTransaction.reference}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                  <p className="text-sm" data-testid="modal-txn-purpose">{selectedTransaction.purpose || '-'}</p>
                </div>
                {selectedTransaction.isVoided && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Void Reason</p>
                    <p className="text-sm text-red-600" data-testid="modal-txn-void-reason">{selectedTransaction.voidReason || 'No reason provided'}</p>
                  </div>
                )}
                {(selectedTransaction.billPhotoUrl || selectedTransaction.billPdfUrl) && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Bill Proof</p>
                    <Button
                      variant="outline"
                      onClick={() => viewBill(selectedTransaction.billPhotoUrl || selectedTransaction.billPdfUrl)}
                      data-testid="modal-button-view-bill"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      View Bill
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bill View Modal */}
      <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
        <DialogContent className="max-w-4xl" data-testid="modal-bill-view">
          <DialogHeader>
            <DialogTitle>Bill Proof</DialogTitle>
            <DialogDescription>Transaction bill documentation</DialogDescription>
          </DialogHeader>
          <div className="max-h-[600px] overflow-auto">
            {viewBillUrl && (
              viewBillUrl.endsWith('.pdf') ? (
                <iframe
                  src={viewBillUrl}
                  className="w-full h-[600px]"
                  title="Bill PDF"
                  data-testid="iframe-bill-pdf"
                />
              ) : (
                <img
                  src={viewBillUrl}
                  alt="Bill Proof"
                  className="w-full h-auto"
                  data-testid="img-bill-photo"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
