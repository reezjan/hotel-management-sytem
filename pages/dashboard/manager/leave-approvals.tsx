import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LeaveApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [managerNotes, setManagerNotes] = useState("");

  const queryClient = useQueryClient();

  // Fetch pending leave requests for approval
  const { data: pendingRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests/pending-approvals"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/leave-requests/pending-approvals", { 
        credentials: "include" 
      });
      if (!response.ok) throw new Error("Failed to fetch pending leave requests");
      return response.json();
    },
    refetchInterval: 3000
  });

  // Fetch all leave requests for overview
  const { data: allRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/leave-requests", { 
        credentials: "include" 
      });
      if (!response.ok) throw new Error("Failed to fetch leave requests");
      return response.json();
    },
    refetchInterval: 3000
  });

  // Approve leave request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await fetch(`/api/leave-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ managerNotes: notes })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve leave request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-requests/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-requests"] });
      setIsActionDialogOpen(false);
      setSelectedRequest(null);
      setManagerNotes("");
      toast.success("Leave request approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  // Reject leave request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const response = await fetch(`/api/leave-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ managerNotes: notes })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject leave request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-requests/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-requests"] });
      setIsActionDialogOpen(false);
      setSelectedRequest(null);
      setManagerNotes("");
      toast.success("Leave request rejected");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleApprovalAction = (request: any, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setManagerNotes("");
    setIsActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedRequest) return;
    
    if (actionType === 'approve') {
      approveRequestMutation.mutate({
        id: selectedRequest.id,
        notes: managerNotes
      });
    } else {
      rejectRequestMutation.mutate({
        id: selectedRequest.id,
        notes: managerNotes
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysDifference = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const pendingColumns = [
    { 
      key: "requestedBy", 
      label: "Employee", 
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.requestedByUser?.username || 'Unknown User'}</span>
        </div>
      )
    },
    { 
      key: "leaveType", 
      label: "Type", 
      sortable: true,
      render: (value: string) => (
        <span className="font-medium capitalize">
          {value?.replace(/_/g, ' ')}
        </span>
      )
    },
    { 
      key: "startDate", 
      label: "Start Date", 
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    { 
      key: "endDate", 
      label: "End Date", 
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    {
      key: "duration",
      label: "Duration",
      render: (value: any, row: any) => (
        <span className="text-sm text-muted-foreground">
          {getDaysDifference(row.startDate, row.endDate)} day(s)
        </span>
      )
    },
    { 
      key: "reason", 
      label: "Reason", 
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate">
          {value || 'No reason provided'}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Submitted", 
      sortable: true,
      render: (value: string) => formatDate(value)
    }
  ];

  const allRequestsColumns = [
    ...pendingColumns,
    { 
      key: "status", 
      label: "Status", 
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <Badge variant="outline" className={getStatusColor(value)}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        </div>
      )
    },
    {
      key: "managerNotes",
      label: "Notes",
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate">
          {value || '-'}
        </span>
      )
    }
  ];

  const pendingActions = [
    { 
      label: "Approve", 
      action: (row: any) => handleApprovalAction(row, 'approve'),
      variant: "default" as const 
    },
    { 
      label: "Reject", 
      action: (row: any) => handleApprovalAction(row, 'reject'),
      variant: "destructive" as const 
    }
  ];

  const approvedRequests = allRequests.filter(r => r.status === 'approved').length;
  const rejectedRequests = allRequests.filter(r => r.status === 'rejected').length;

  return (
    <DashboardLayout title="Leave Request Approvals">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{approvedRequests}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{rejectedRequests}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Table */}
        <DataTable
          title="Pending Leave Requests"
          data={pendingRequests}
          columns={pendingColumns}
          actions={pendingActions}
          isLoading={isLoading}
          searchPlaceholder="Search pending requests..."
        />

        {/* All Requests Table */}
        <DataTable
          title="All Leave Requests"
          data={allRequests}
          columns={allRequestsColumns}
          isLoading={isLoading}
          searchPlaceholder="Search all requests..."
        />

        {/* Approval/Rejection Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Request Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Employee:</strong> {selectedRequest.requestedByUser?.username || 'Unknown'}</p>
                    <p><strong>Type:</strong> {selectedRequest.leaveType?.replace(/_/g, ' ')}</p>
                    <p><strong>Period:</strong> {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}</p>
                    <p><strong>Duration:</strong> {getDaysDifference(selectedRequest.startDate, selectedRequest.endDate)} day(s)</p>
                    {selectedRequest.reason && (
                      <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="managerNotes">
                    Manager Notes {actionType === 'reject' ? '(Required)' : '(Optional)'}
                  </Label>
                  <Textarea
                    id="managerNotes"
                    value={managerNotes}
                    onChange={(e) => setManagerNotes(e.target.value)}
                    placeholder={`Add notes for the ${actionType} decision...`}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmAction}
                    disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending || (actionType === 'reject' && !managerNotes.trim())}
                    variant={actionType === 'approve' ? 'default' : 'destructive'}
                  >
                    {(approveRequestMutation.isPending || rejectRequestMutation.isPending) 
                      ? (actionType === 'approve' ? "Approving..." : "Rejecting...") 
                      : (actionType === 'approve' ? "Approve Request" : "Reject Request")
                    }
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}