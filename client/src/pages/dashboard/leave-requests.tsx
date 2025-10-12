import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

export default function LeaveRequests() {
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const queryClient = useQueryClient();

  const { data: myRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/leave-requests/my-requests"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/leave-requests/my-requests", { 
        credentials: "include" 
      });
      if (!response.ok) throw new Error("Failed to fetch leave requests");
      return response.json();
    }
  });

  const { data: leaveBalances = [] } = useQuery<any[]>({
    queryKey: ["/api/leave-balances"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/leave-balances", { 
        credentials: "include" 
      });
      if (!response.ok) throw new Error("Failed to fetch leave balances");
      return response.json();
    }
  });

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

  const handleCreateRequest = () => {
    if (!newRequest.leaveType || !newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    createRequestMutation.mutate(newRequest);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      'pending': { variant: 'secondary', icon: AlertCircle },
      'approved': { variant: 'default', icon: CheckCircle },
      'rejected': { variant: 'destructive', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const requestColumns = [
    { 
      key: "leaveType", 
      label: "Leave Type",
      sortable: true,
      render: (value: any) => value?.name || "N/A"
    },
    { 
      key: "startDate", 
      label: "Start Date", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: "endDate", 
      label: "End Date", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: "totalDays", 
      label: "Days", 
      sortable: true 
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    }
  ];

  return (
    <DashboardLayout title="My Leave Requests">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveBalances.map((balance: any) => (
            <Card key={balance.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {balance.leaveTypeDetails?.name || balance.leaveType || "Leave Type"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{balance.remainingDays}</div>
                  <div className="text-sm text-muted-foreground">
                    of {balance.totalDays} days
                  </div>
                </div>
                <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${(balance.remainingDays / balance.totalDays) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {leaveBalances.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-muted-foreground">
                No leave balance information available
              </CardContent>
            </Card>
          )}
        </div>

        {/* Request Leave Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Leave Requests</h2>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Request Leave
          </Button>
        </div>

        {/* My Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : myRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No leave requests yet. Click "Request Leave" to submit your first request.
              </p>
            ) : (
              <DataTable
                title="My Requests"
                data={myRequests}
                columns={requestColumns}
                searchPlaceholder="Search requests..."
              />
            )}
          </CardContent>
        </Card>

        {/* Create Leave Request Dialog */}
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
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveBalances.map((balance: any) => (
                      <SelectItem key={balance.id} value={balance.leavePolicyId}>
                        {balance.leavePolicy?.name} ({balance.remainingDays} days available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewRequest({ leaveType: "", startDate: "", endDate: "", reason: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRequest}
                  disabled={createRequestMutation.isPending}
                  className="flex-1"
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
