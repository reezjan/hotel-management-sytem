import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DutyToggle } from "@/components/common/duty-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2 } from "lucide-react";

export default function WaiterDutyStatus() {
  const { user } = useAuth();

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/user"],
  });

  return (
    <DashboardLayout title="Duty Status">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Your Duty Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-secondary rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {currentUser?.isOnline ? "You are ON DUTY" : "You are OFF DUTY"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Toggle your duty status to start or stop receiving tasks
                </p>
              </div>
              <DutyToggle userId={user?.id || ""} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    {currentUser?.isOnline ? (
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    ) : (
                      <Clock className="h-8 w-8 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold">
                        {currentUser?.isOnline ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="text-lg font-semibold">
                      {currentUser?.lastLogin
                        ? new Date(currentUser.lastLogin).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> When you are on duty, you can receive task assignments from the restaurant manager and take orders from customers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
