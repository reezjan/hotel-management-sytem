import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LeaveRequests() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [managerNotes, setManagerNotes] = useState("");

  const queryClient = useQueryClient();

  // Fetch user's own leave requests
  const { data: myRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests/my-requests"],
    refetchInterval: 3000
  });

  // Fetch leave balances
  const { data: leaveBalances = [] } = useQuery<any[]>({
    queryKey: ["/api/leave-balances"],
    refetchInterval: 3000
  });

  // Fetch pending leave requests for approval from subordinates
  const { data: pendingApprovals = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests/pending-approvals"],
    refetchInterval: 3000
  });

  // Fetch all leave requests from subordinates
  const { data: subordinateRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests"],
    refetchInterval: 3000
  });

  // Create leave request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await fetch("/api/hotels/current/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create leave request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-requests/my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-balances"] });
      setIsAddDialogOpen(false);
      setNewRequest({ leaveType: "", startDate: "", endDate: "", reason: "" });
      toast.success("Leave request submitted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
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

  const handleCreateRequest = () => {
    if (!newRequest.leaveType || !newRequest.startDate || !newRequest.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(newRequest.endDate) < new Date(newRequest.startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    createRequestMutation.mutate(newRequest);
  };

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

  // Columns for my requests
  const myRequestsColumns = [
    { 
      key: "leaveType", 
      label: "Type", 
      sortable: true,
      render: (value: string) => (
        <span className="font-medium capitalize" data-testid={`text-type-${value}`}>
          {value?.replace(/_/g, ' ')}
        </span>
      )
    },
    { 
      key: "startDate", 
      label: "Start Date", 
      sortable: true,
      render: (value: string) => <span data-testid="text-startdate">{formatDate(value)}</span>
    },
    { 
      key: "endDate", 
      label: "End Date", 
      sortable: true,
      render: (value: string) => <span data-testid="text-enddate">{formatDate(value)}</span>
    },
    {
      key: "duration",
      label: "Duration",
      render: (value: any, row: any) => (
        <span className="text-sm text-muted-foreground" data-testid="text-duration">
          {getDaysDifference(row.startDate, row.endDate)} day(s)
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <Badge variant="outline" className={getStatusColor(value)} data-testid={`badge-status-${value}`}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        </div>
      )
    },
    { 
      key: "reason", 
      label: "Reason", 
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate" data-testid="text-reason">
          {value || 'No reason provided'}
        </span>
      )
    },
    {
      key: "managerNotes",
      label: "Manager Notes",
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate" data-testid="text-managernotes">
          {value || '-'}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Submitted", 
      sortable: true,
      render: (value: string) => <span data-testid="text-submitted">{formatDate(value)}</span>
    }
  ];

  // Columns for pending approvals
  const pendingApprovalsColumns = [
    { 
      key: "requestedBy", 
      label: "Employee", 
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span data-testid={`text-employee-${row.id}`}>{row.requestedByUser?.username || 'Unknown User'}</span>
        </div>
      )
    },
    { 
      key: "leaveType", 
      label: "Type", 
      sortable: true,
      render: (value: string) => (
        <span className="font-medium capitalize" data-testid={`text-leavetype-${value}`}>
          {value?.replace(/_/g, ' ')}
        </span>
      )
    },
    { 
      key: "startDate", 
      label: "Start Date", 
      sortable: true,
      render: (value: string) => <span data-testid="text-startdate-approval">{formatDate(value)}</span>
    },
    { 
      key: "endDate", 
      label: "End Date", 
      sortable: true,
      render: (value: string) => <span data-testid="text-enddate-approval">{formatDate(value)}</span>
    },
    {
      key: "duration",
      label: "Duration",
      render: (value: any, row: any) => (
        <span className="text-sm text-muted-foreground" data-testid="text-duration-approval">
          {getDaysDifference(row.startDate, row.endDate)} day(s)
        </span>
      )
    },
    { 
      key: "reason", 
      label: "Reason", 
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate" data-testid="text-reason-approval">
          {value || 'No reason provided'}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Submitted", 
      sortable: true,
      render: (value: string) => <span data-testid="text-submitted-approval">{formatDate(value)}</span>
    }
  ];

  // Columns for all subordinate requests
  const allSubordinateColumns = [
    ...pendingApprovalsColumns,
    { 
      key: "status", 
      label: "Status", 
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <Badge variant="outline" className={getStatusColor(value)} data-testid={`badge-subordinate-status-${value}`}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        </div>
      )
    },
    {
      key: "managerNotes",
      label: "Notes",
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate" data-testid="text-notes-subordinate">
          {value || '-'}
        </span>
      )
    }
  ];

  const approvalActions = [
    { 
      label: "Approve", 
      action: (row: any) => handleApprovalAction(row, 'approve'),
      variant: "default" as const,
      testId: "button-approve"
    },
    { 
      label: "Reject", 
      action: (row: any) => handleApprovalAction(row, 'reject'),
      variant: "destructive" as const,
      testId: "button-reject"
    }
  ];

  const pendingMyRequests = myRequests.filter(r => r.status === 'pending').length;
  const approvedMyRequests = myRequests.filter(r => r.status === 'approved').length;
  const rejectedMyRequests = myRequests.filter(r => r.status === 'rejected').length;

  const approvedSubordinate = subordinateRequests.filter(r => r.status === 'approved').length;
  const rejectedSubordinate = subordinateRequests.filter(r => r.status === 'rejected').length;

  return (
    <DashboardLayout title="Leave Requests">
      <div className="space-y-6">
        <Tabs defaultValue="my-requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-leave-requests">
            <TabsTrigger value="my-requests" data-testid="tab-my-requests">My Leave Requests</TabsTrigger>
            <TabsTrigger value="team-approvals" data-testid="tab-team-approvals">
              Team Approvals
              {pendingApprovals.length > 0 && (
                <Badge className="ml-2 bg-orange-500" data-testid="badge-pending-count">
                  {pendingApprovals.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="space-y-6">
            {/* Leave Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaveBalances.map((balance: any) => (
                <Card key={balance.id} data-testid={`balance-card-${balance.leaveType}`}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground capitalize">
                        {balance.leaveType.replace(/_/g, ' ')} Leave Balance
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-3xl font-bold" data-testid={`balance-remaining-${balance.leaveType}`}>
                          {parseFloat(balance.remainingDays)}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          / {parseFloat(balance.totalDays)} days
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used: {parseFloat(balance.usedDays)} days
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* My Request Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold" data-testid="text-pending">{pendingMyRequests}</p>
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
                      <p className="text-2xl font-bold" data-testid="text-approved">{approvedMyRequests}</p>
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
                      <p className="text-2xl font-bold" data-testid="text-rejected">{rejectedMyRequests}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Requests Table */}
            <DataTable
              title="My Leave Requests"
              data={myRequests}
              columns={myRequestsColumns}
              isLoading={isLoading}
              onAdd={() => setIsAddDialogOpen(true)}
              addButtonLabel="Request Leave"
              searchPlaceholder="Search leave requests..."
            />
          </TabsContent>

          <TabsContent value="team-approvals" className="space-y-6">
            {/* Team Approval Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                      <p className="text-2xl font-bold" data-testid="text-pending-approval">{pendingApprovals.length}</p>
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
                      <p className="text-2xl font-bold" data-testid="text-approved-subordinate">{approvedSubordinate}</p>
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
                      <p className="text-2xl font-bold" data-testid="text-rejected-subordinate">{rejectedSubordinate}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Approvals Table */}
            <DataTable
              title="Pending Leave Requests"
              data={pendingApprovals}
              columns={pendingApprovalsColumns}
              actions={approvalActions}
              isLoading={isLoading}
              searchPlaceholder="Search pending requests..."
            />

            {/* All Subordinate Requests Table */}
            <DataTable
              title="All Team Leave Requests"
              data={subordinateRequests}
              columns={allSubordinateColumns}
              isLoading={isLoading}
              searchPlaceholder="Search all requests..."
            />
          </TabsContent>
        </Tabs>

        {/* Add Leave Request Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select 
                  value={newRequest.leaveType} 
                  onValueChange={(value) => setNewRequest({ ...newRequest, leaveType: value })}
                >
                  <SelectTrigger data-testid="select-leavetype">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                    <SelectItem value="family">Family Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newRequest.startDate}
                  onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-startdate"
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newRequest.endDate}
                  onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                  min={newRequest.startDate || new Date().toISOString().split('T')[0]}
                  data-testid="input-enddate"
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request"
                  rows={3}
                  data-testid="textarea-reason"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest}
                  disabled={createRequestMutation.isPending}
                  data-testid="button-submit"
                >
                  {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                    data-testid="textarea-managernotes"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} data-testid="button-cancel-action">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmAction}
                    disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending || (actionType === 'reject' && !managerNotes.trim())}
                    variant={actionType === 'approve' ? 'default' : 'destructive'}
                    data-testid="button-confirm-action"
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
