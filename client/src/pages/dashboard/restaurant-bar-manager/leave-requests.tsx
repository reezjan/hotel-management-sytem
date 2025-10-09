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

  const queryClient = useQueryClient();

  // Fetch user's leave requests
  const { data: myRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests/my-requests"],
    refetchInterval: 3000
  });

  // Fetch leave balances
  const { data: leaveBalances = [] } = useQuery<any[]>({
    queryKey: ["/api/leave-balances"],
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
      setIsAddDialogOpen(false);
      setNewRequest({ leaveType: "", startDate: "", endDate: "", reason: "" });
      toast.success("Leave request submitted successfully");
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  const columns = [
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
      key: "reason", 
      label: "Reason", 
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate">
          {value || 'No reason provided'}
        </span>
      )
    },
    {
      key: "managerNotes",
      label: "Manager Notes",
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate">
          {value || '-'}
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

  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = myRequests.filter(r => r.status === 'approved').length;
  const rejectedRequests = myRequests.filter(r => r.status === 'rejected').length;

  return (
    <DashboardLayout title="Leave Requests">
      <div className="space-y-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingRequests}</p>
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

        {/* Leave Requests Table */}
        <DataTable
          title="My Leave Requests"
          data={myRequests}
          columns={columns}
          isLoading={isLoading}
          onAdd={() => setIsAddDialogOpen(true)}
          addButtonLabel="Request Leave"
          searchPlaceholder="Search leave requests..."
        />

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
                  <SelectTrigger>
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
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest}
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}