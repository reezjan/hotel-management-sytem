import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertCircle, CheckCircle, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function MaintenanceRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch maintenance requests from restaurant staff
  const { data: maintenanceRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    refetchInterval: 3000,
    select: (data) => {
      // Filter only requests from restaurant staff
      const restaurantStaffRoles = ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'];
      return data.filter((request: any) => 
        restaurantStaffRoles.includes(request.reportedBy?.role?.name || '')
      );
    }
  });

  // Update maintenance request status
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/maintenance-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, notes })
      });
      if (!response.ok) throw new Error("Failed to update request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast.success("Request status updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { 
      key: "title", 
      label: "Issue", 
      sortable: true 
    },
    { 
      key: "location", 
      label: "Location", 
      sortable: true 
    },
    { 
      key: "reportedBy", 
      label: "Reported By", 
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.username || 'Unknown'}</div>
          <div className="text-xs text-gray-500">
            {value?.role?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </div>
        </div>
      )
    },
    { 
      key: "priority", 
      label: "Priority", 
      render: (value: string) => (
        <Badge className={getPriorityColor(value)}>
          {value?.toUpperCase()}
        </Badge>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      )
    },
    { 
      key: "createdAt", 
      label: "Date", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('en-GB')
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => updateRequestMutation.mutate({ id: row.id, status: 'approved' })}
                data-testid={`button-approve-${row.id}`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => updateRequestMutation.mutate({ id: row.id, status: 'declined' })}
                data-testid={`button-decline-${row.id}`}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          )}
          {row.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateRequestMutation.mutate({ id: row.id, status: 'resolved' })}
              data-testid={`button-resolve-${row.id}`}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      )
    }
  ];

  const pendingRequests = maintenanceRequests.filter(r => r.status === 'pending');
  const approvedRequests = maintenanceRequests.filter(r => r.status === 'approved');
  const resolvedRequests = maintenanceRequests.filter(r => r.status === 'resolved');

  return (
    <DashboardLayout title="Maintenance Requests">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <ThumbsUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Being handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Requests Table */}
      <DataTable 
        data={maintenanceRequests} 
        columns={columns} 
        title="Staff Maintenance Requests"
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
}
