import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle } from "lucide-react";

export default function HousekeepingSupervisorMaintenanceRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: maintenanceRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/maintenance-requests", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");
      const data = await response.json();
      return data.filter((request: any) => 
        request.reportedBy?.role?.name === 'housekeeping_staff'
      );
    }
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    }
  });

  const financeStaff = staff.filter(s => s.role?.name === 'finance');

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, assignedTo }: { id: string; status: string; assignedTo?: string }) => {
      const response = await fetch(`/api/hotels/current/maintenance-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, assignedTo })
      });
      if (!response.ok) throw new Error("Failed to update request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Request updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const handleForwardToFinance = (request: any) => {
    if (financeStaff.length === 0) {
      toast({ title: "No finance staff available", variant: "destructive" });
      return;
    }
    
    updateRequestMutation.mutate({
      id: request.id,
      status: "in_progress",
      assignedTo: financeStaff[0].id
    });
  };

  const handleResolve = (request: any) => {
    updateRequestMutation.mutate({
      id: request.id,
      status: "resolved"
    });
  };

  const columns = [
    { key: "title", label: "Issue", sortable: true },
    { key: "location", label: "Location", sortable: true },
    { 
      key: "reportedBy", 
      label: "Reported By", 
      render: (value: any) => value?.username || "Unknown"
    },
    { key: "priority", label: "Priority", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { 
      key: "createdAt", 
      label: "Reported At", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' })
    }
  ];

  const actions = [
    {
      label: "Forward to Finance",
      action: (row: any) => handleForwardToFinance(row)
    },
    {
      label: "Mark Resolved",
      action: (row: any) => handleResolve(row)
    }
  ];

  return (
    <DashboardLayout title="Maintenance Requests">
      <DataTable
        title="Maintenance Requests from Housekeeping Staff"
        data={maintenanceRequests}
        columns={columns}
        actions={actions}
        searchPlaceholder="Search maintenance requests..."
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
}
