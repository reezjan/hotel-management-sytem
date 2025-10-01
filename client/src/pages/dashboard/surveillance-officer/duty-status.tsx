import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function SurveillanceOfficerDutyStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDutyOn, setIsDutyOn] = useState(user?.isOnline || false);

  const toggleDutyMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      return await apiRequest("PATCH", "/api/users/me/duty", { isOnline });
    },
    onSuccess: (data: any) => {
      setIsDutyOn(data.isOnline);
      toast({ 
        title: data.isOnline ? "Duty started" : "Duty ended",
        description: data.isOnline ? "You are now on duty" : "You are now off duty"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update duty status", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const handleDutyToggle = (checked: boolean) => {
    toggleDutyMutation.mutate(checked);
  };

  return (
    <DashboardLayout title="Duty Status">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Duty Status</CardTitle>
            <CardDescription>Toggle your duty status on or off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-full ${isDutyOn ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
                <div>
                  <p className="text-2xl font-bold">
                    {isDutyOn ? 'On Duty' : 'Off Duty'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isDutyOn ? 'You are currently active and available' : 'You are currently offline'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isDutyOn}
                onCheckedChange={handleDutyToggle}
                disabled={toggleDutyMutation.isPending}
                data-testid="switch-duty-status"
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Turn on duty when you start your shift</p>
            <p>• You can only be assigned tasks when on duty</p>
            <p>• Turn off duty when you end your shift or take a break</p>
            <p>• Your supervisor can see your duty status in real-time</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
