import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function ManagerMaintenanceRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const { data: maintenanceRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/maintenance-requests", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");
      return response.json();
    }
  });

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
      toast({ title: "Request updated successfully" });
      setShowApproveDialog(false);
      setShowDeclineDialog(false);
      setSelectedRequest(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const handleApprove = (request: any) => {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  const handleDecline = (request: any) => {
    setSelectedRequest(request);
    setShowDeclineDialog(true);
  };

  const confirmApprove = () => {
    if (!selectedRequest) return;
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status: "approved",
      notes: notes || undefined
    });
  };

  const confirmDecline = () => {
    if (!selectedRequest || !notes.trim()) {
      toast({ title: "Please provide a reason for declining", variant: "destructive" });
      return;
    }
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status: "declined",
      notes: notes
    });
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    };
    return <Badge variant={variants[priority as keyof typeof variants] as any}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      resolved: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || ""}>
        {status}
      </Badge>
    );
  };

  const columns = [
    { 
      key: "title", 
      label: "Issue", 
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          {row.description && (
            <div className="text-sm text-muted-foreground truncate max-w-xs">{row.description}</div>
          )}
        </div>
      )
    },
    { key: "location", label: "Location", sortable: true },
    { 
      key: "reportedBy", 
      label: "Reported By", 
      render: (value: any) => (
        <div>
          <div>{value?.username || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">{value?.role?.name || ""}</div>
        </div>
      )
    },
    { 
      key: "priority", 
      label: "Priority", 
      sortable: true,
      render: (value: string) => getPriorityBadge(value)
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: "createdAt",
      label: "Date Reported",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(row)}
                data-testid={`button-approve-${row.id}`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(row)}
                data-testid={`button-decline-${row.id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          )}
          {row.status === "approved" && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Awaiting Assignment
            </Badge>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout title="Maintenance Requests">
      <div className="space-y-6">
        <DataTable
          title="All Maintenance Requests"
          data={maintenanceRequests}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search requests..."
        />
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to approve this maintenance request?</p>
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any approval notes or instructions..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove} disabled={updateRequestMutation.isPending}>
              {updateRequestMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please provide a reason for declining this maintenance request:</p>
            <div className="space-y-2">
              <Label htmlFor="decline-notes">Reason *</Label>
              <Textarea
                id="decline-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why this request is being declined..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDecline} 
              disabled={updateRequestMutation.isPending || !notes.trim()}
            >
              {updateRequestMutation.isPending ? "Declining..." : "Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
