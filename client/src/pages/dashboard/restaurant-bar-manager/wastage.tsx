import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

export default function StaffWastage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWastage, setSelectedWastage] = useState<any>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(true);

  const { data: wastages = [] } = useQuery({
    queryKey: ["/api/hotels/current/wastages"],
    refetchInterval: 5000
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: hotelUsers = [] } = useQuery({
    queryKey: ["/api/hotels/current/users"]
  });

  // Filter wastages from restaurant/bar staff only
  const staffWastages = wastages.filter((wastage: any) => {
    const recorder = hotelUsers.find((u: any) => u.id === wastage.recordedBy);
    return recorder && ['barista', 'bartender', 'kitchen_staff', 'waiter', 'cashier'].includes(recorder.role?.name || '');
  });

  const pendingWastages = staffWastages.filter((w: any) => w.status === 'pending_approval');
  const approvedWastages = staffWastages.filter((w: any) => w.status === 'approved');
  const rejectedWastages = staffWastages.filter((w: any) => w.status === 'rejected');

  const approvalMutation = useMutation({
    mutationFn: async ({ id, approved, rejectionReason }: any) => {
      return await apiRequest("POST", `/api/wastages/${id}/approve`, {
        approved,
        rejectionReason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/wastages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: isApproving ? "Wastage approved successfully" : "Wastage rejected" });
      setApprovalDialogOpen(false);
      setSelectedWastage(null);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getItemName = (itemId: string) => {
    const item = inventoryItems.find((i: any) => i.id === itemId);
    return item?.name || 'Unknown Item';
  };

  const getItemUnit = (itemId: string) => {
    const item = inventoryItems.find((i: any) => i.id === itemId);
    return item?.baseUnit || item?.unit || 'unit';
  };

  const getUserName = (userId: string) => {
    const foundUser = hotelUsers.find((u: any) => u.id === userId);
    return foundUser?.username || 'Unknown User';
  };

  const getUserRole = (userId: string) => {
    const foundUser = hotelUsers.find((u: any) => u.id === userId);
    return foundUser?.role?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown';
  };

  const handleApprove = (wastage: any) => {
    setSelectedWastage(wastage);
    setIsApproving(true);
    setApprovalDialogOpen(true);
  };

  const handleReject = (wastage: any) => {
    setSelectedWastage(wastage);
    setIsApproving(false);
    setApprovalDialogOpen(true);
  };

  const submitApproval = () => {
    if (!isApproving && (!rejectionReason || rejectionReason.trim().length < 10)) {
      toast({ 
        title: "Rejection reason required", 
        description: "Please provide a detailed reason (minimum 10 characters)",
        variant: "destructive" 
      });
      return;
    }

    approvalMutation.mutate({
      id: selectedWastage.id,
      approved: isApproving,
      rejectionReason: isApproving ? null : rejectionReason.trim()
    });
  };

  const renderWastageCard = (wastage: any) => {
    const itemName = getItemName(wastage.itemId);
    const itemUnit = getItemUnit(wastage.itemId);
    const recorderName = getUserName(wastage.recordedBy);
    const recorderRole = getUserRole(wastage.recordedBy);
    const estimatedValue = wastage.estimatedValue || 0;

    return (
      <Card key={wastage.id} className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-base">{itemName}</span>
            <Badge variant={
              wastage.status === 'approved' ? 'default' :
              wastage.status === 'rejected' ? 'destructive' : 'secondary'
            }>
              {wastage.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Recorded by:</strong> {recorderName} ({recorderRole})</p>
            <p><strong>Quantity:</strong> {wastage.qty} {wastage.unit || itemUnit}</p>
            <p><strong>Estimated Value:</strong> {formatCurrency(estimatedValue)}</p>
            <p><strong>Reason:</strong> {wastage.reason}</p>
            <p><strong>Date:</strong> {new Date(wastage.createdAt).toLocaleString()}</p>
            {wastage.approvedBy && (
              <p><strong>Approved by:</strong> {getUserName(wastage.approvedBy)}</p>
            )}
            {wastage.rejectedBy && (
              <p><strong>Rejected by:</strong> {getUserName(wastage.rejectedBy)}</p>
            )}
            {wastage.rejectionReason && (
              <p className="text-red-600"><strong>Rejection Reason:</strong> {wastage.rejectionReason}</p>
            )}
          </div>
          {wastage.status === 'pending_approval' && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => handleApprove(wastage)}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(wastage)}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="Staff Wastage Management">
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingWastages.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Total Value: {formatCurrency(pendingWastages.reduce((sum, w) => sum + (w.estimatedValue || 0), 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedWastages.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Total Value: {formatCurrency(approvedWastages.reduce((sum, w) => sum + (w.estimatedValue || 0), 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedWastages.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Total Value: {formatCurrency(rejectedWastages.reduce((sum, w) => sum + (w.estimatedValue || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">Pending ({pendingWastages.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedWastages.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedWastages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingWastages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending wastage approvals
                </CardContent>
              </Card>
            ) : (
              pendingWastages.map(renderWastageCard)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedWastages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No approved wastages
                </CardContent>
              </Card>
            ) : (
              approvedWastages.map(renderWastageCard)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedWastages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No rejected wastages
                </CardContent>
              </Card>
            ) : (
              rejectedWastages.map(renderWastageCard)
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isApproving ? 'Approve Wastage' : 'Reject Wastage'}
              </DialogTitle>
            </DialogHeader>
            {selectedWastage && (
              <div className="space-y-4">
                <div className="text-sm">
                  <p><strong>Item:</strong> {getItemName(selectedWastage.itemId)}</p>
                  <p><strong>Quantity:</strong> {selectedWastage.qty} {selectedWastage.unit || getItemUnit(selectedWastage.itemId)}</p>
                  <p><strong>Reported by:</strong> {getUserName(selectedWastage.recordedBy)}</p>
                  <p><strong>Reason:</strong> {selectedWastage.reason}</p>
                </div>

                {!isApproving && (
                  <div className="space-y-2">
                    <Label>Rejection Reason *</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a detailed reason for rejecting this wastage report (minimum 10 characters)"
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setApprovalDialogOpen(false);
                      setRejectionReason("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitApproval}
                    disabled={approvalMutation.isPending}
                    className="flex-1"
                    variant={isApproving ? "default" : "destructive"}
                  >
                    {approvalMutation.isPending ? "Processing..." : (isApproving ? "Approve" : "Reject")}
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
