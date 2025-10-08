import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DutyToggle() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnDuty, setIsOnDuty] = useState(false);

  const { data: attendanceStatus } = useQuery<any>({
    queryKey: ["/api/attendance/status"]
  });

  useEffect(() => {
    if (attendanceStatus?.isOnDuty !== undefined) {
      setIsOnDuty(attendanceStatus.isOnDuty);
    }
  }, [attendanceStatus]);

  const updateDutyMutation = useMutation({
    mutationFn: async (shouldClockIn: boolean) => {
      if (shouldClockIn) {
        const res = await apiRequest("POST", "/api/attendance/clock-in", {
          location: "Web Dashboard",
          source: "web"
        });
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/attendance/clock-out", {
          location: "Web Dashboard",
          source: "web"
        });
        return res.json();
      }
    },
    onSuccess: (_, shouldClockIn) => {
      setIsOnDuty(shouldClockIn);
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: shouldClockIn ? "Clocked In" : "Clocked Out",
        description: shouldClockIn ? "You are now on duty" : "You have clocked out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update duty status",
        variant: "destructive",
      });
    },
  });

  const handleToggle = () => {
    const newStatus = !isOnDuty;
    updateDutyMutation.mutate(newStatus);
  };

  return (
    <div className="flex items-center space-x-1 md:space-x-2">
      <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Duty Status:</span>
      <Button
        size="sm"
        variant={isOnDuty ? "default" : "destructive"}
        onClick={handleToggle}
        disabled={updateDutyMutation.isPending}
        className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
        data-testid="button-duty-toggle"
      >
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnDuty ? "bg-white" : "bg-current"
        )} />
        <span>{isOnDuty ? "On Duty" : "Off Duty"}</span>
      </Button>
    </div>
  );
}
