import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut } from "lucide-react";

export default function HousekeepingStaffDutyStatus() {
  const { user } = useAuth();

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
                  className={user?.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} 
                  variant="secondary"
                  data-testid="duty-status-badge"
                >
                  {user?.isOnline ? 'On Duty' : 'Off Duty'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <LogIn className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Login</p>
                        <p className="font-medium text-foreground" data-testid="last-login">
                          {user?.lastLogin 
                            ? new Date(user.lastLogin).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }) 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <LogOut className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Logout</p>
                        <p className="font-medium text-foreground" data-testid="last-logout">
                          {user?.lastLogout 
                            ? new Date(user.lastLogout).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }) 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Use the duty toggle in the top navigation bar to mark yourself as on duty or off duty. 
                    Only on-duty staff can receive new task assignments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
