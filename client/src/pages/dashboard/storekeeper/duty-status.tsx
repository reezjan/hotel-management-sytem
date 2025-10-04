import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Power } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function StorekeeperDutyStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dutyStatus = (user as any)?.dutyStatus || 'off';

  const updateDutyStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest("PATCH", `/api/users/${user?.id}`, { dutyStatus: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ 
        title: "Duty status updated", 
        description: `You are now ${dutyStatus === 'on' ? 'off' : 'on'} duty` 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update duty status", 
        variant: "destructive" 
      });
    }
  });

  const handleToggleDuty = () => {
    const newStatus = dutyStatus === 'on' ? 'off' : 'on';
    updateDutyStatusMutation.mutate(newStatus);
  };

  return (
    <DashboardLayout title="Duty Status">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Duty Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 border rounded-lg bg-accent/50">
              <div className="flex items-center gap-4">
                <Power className={`w-8 h-8 ${dutyStatus === 'on' ? 'text-green-500' : 'text-gray-500'}`} />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={dutyStatus === 'on' ? 'default' : 'secondary'}
                    className="mt-1"
                    data-testid="current-duty-status"
                  >
                    {dutyStatus === 'on' ? 'ON DUTY' : 'OFF DUTY'}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={handleToggleDuty}
                disabled={updateDutyStatusMutation.isPending}
                variant={dutyStatus === 'on' ? 'destructive' : 'default'}
                size="lg"
                data-testid="button-toggle-duty"
              >
                {updateDutyStatusMutation.isPending ? (
                  'Updating...'
                ) : dutyStatus === 'on' ? (
                  'Clock Out'
                ) : (
                  'Clock In'
                )}
              </Button>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium">Duty Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• When on duty, you can manage inventory and complete assigned tasks</p>
                <p>• Remember to clock out at the end of your shift</p>
                <p>• Your duty hours are tracked for attendance purposes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
