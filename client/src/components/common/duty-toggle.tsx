import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DutyToggleProps {
  userId: string;
}

export function DutyToggle({ userId }: DutyToggleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnDuty, setIsOnDuty] = useState(false);

  const { data: userData } = useQuery<any>({
    queryKey: ["/api/user"]
  });

  useEffect(() => {
    if (userData?.isOnline !== undefined) {
      setIsOnDuty(userData.isOnline);
    }
  }, [userData]);

  const updateDutyMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      await apiRequest("POST", `/api/users/${userId}/duty`, { isOnline });
    },
    onSuccess: (_, isOnline) => {
      setIsOnDuty(isOnline);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Duty Status Updated",
        description: `You are now ${isOnline ? "online" : "offline"}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update duty status",
        variant: "destructive",
      });
    },
  });

  const handleToggle = () => {
    const newStatus = !isOnDuty;
    updateDutyMutation.mutate(newStatus);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Duty Status:</span>
      <Button
        size="sm"
        variant={isOnDuty ? "default" : "destructive"}
        onClick={handleToggle}
        disabled={updateDutyMutation.isPending}
        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
        data-testid="button-duty-toggle"
      >
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnDuty ? "bg-white" : "bg-current"
        )} />
        <span>{isOnDuty ? "Online" : "Offline"}</span>
      </Button>
    </div>
  );
}
