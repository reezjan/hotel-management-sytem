import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: pendingApprovals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions", { pendingApproval: "true" }],
    refetchInterval: 3000
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"]
  });

  const approveMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return apiRequest("POST", `/api/transactions/${transactionId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Transaction Approved",
        description: "The transaction has been successfully approved."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      setShowApproveDialog(false);
      setSelectedTransaction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve transaction",
        variant: "destructive"
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: string; reason: string }) => {
      return apiRequest("POST", `/api/transactions/${transactionId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Transaction Rejected",
        description: "The transaction has been rejected."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      setShowRejectDialog(false);
      setSelectedTransaction(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject transaction",
        variant: "destructive"
      });
    }
  });

  const handleApprove = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowApproveDialog(true);
  };

  const handleReject = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowRejectDialog(true);
  };

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailsDialog(true);
  };

  const confirmApprove = () => {
    if (selectedTransaction) {
      approveMutation.mutate(selectedTransaction.id);
    }
  };

  const confirmReject = () => {
    if (selectedTransaction && rejectionReason.trim().length >= 10) {
      rejectMutation.mutate({
        transactionId: selectedTransaction.id,
        reason: rejectionReason
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Rejection reason must be at least 10 characters",
        variant: "destructive"
      });
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.username || user?.fullName || "Unknown";
  };

  const getTransactionTypeLabel = (txnType: string) => {
    const labels: Record<string, string> = {
      cash_out: "Cash Out",
      expense: "Expense",
      vendor_payment: "Vendor Payment",
      miscellaneous: "Miscellaneous",
      revenue: "Revenue",
      cash_in: "Cash In"
    };
    return labels[txnType] || txnType;
  };

  return (
    <DashboardLayout title="Pending Approvals">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Transactions Pending Approval ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending approvals
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {formatCurrency(Number(transaction.amount))}
                          </span>
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                            {getTransactionTypeLabel(transaction.txnType)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Purpose: {transaction.purpose || "N/A"}</p>
                          <p>Created by: {getUserName(transaction.createdBy)}</p>
                          <p>Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                          {transaction.billInvoiceNumber && (
                            <p>Invoice #: {transaction.billInvoiceNumber}</p>
                          )}
                          {!transaction.billPhotoUrl && !transaction.billPdfUrl && transaction.txnType === 'cash_out' && (
                            <p className="text-red-600 font-medium">⚠️ No bill document provided</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(transaction)}
                          data-testid={`button-view-${transaction.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(transaction)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-${transaction.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(transaction)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-${transaction.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent data-testid="dialog-approve">
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this transaction?
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-2 py-4">
              <p><strong>Amount:</strong> {formatCurrency(Number(selectedTransaction.amount))}</p>
              <p><strong>Type:</strong> {getTransactionTypeLabel(selectedTransaction.txnType)}</p>
              <p><strong>Purpose:</strong> {selectedTransaction.purpose || "N/A"}</p>
              <p><strong>Created by:</strong> {getUserName(selectedTransaction.createdBy)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} data-testid="button-cancel-approve">
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              data-testid="button-confirm-approve"
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent data-testid="dialog-reject">
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this transaction (minimum 10 characters).
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p><strong>Amount:</strong> {formatCurrency(Number(selectedTransaction.amount))}</p>
                <p><strong>Type:</strong> {getTransactionTypeLabel(selectedTransaction.txnType)}</p>
                <p><strong>Purpose:</strong> {selectedTransaction.purpose || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="textarea-rejection-reason"
                />
                <p className="text-sm text-muted-foreground">
                  {rejectionReason.length}/10 characters minimum
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              data-testid="button-cancel-reject"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectMutation.isPending || rejectionReason.trim().length < 10}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-details">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(Number(selectedTransaction.amount))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{getTransactionTypeLabel(selectedTransaction.txnType)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p>{selectedTransaction.purpose || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p>{selectedTransaction.paymentMethod || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p>{getUserName(selectedTransaction.createdBy)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                {selectedTransaction.billInvoiceNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p>{selectedTransaction.billInvoiceNumber}</p>
                  </div>
                )}
                {selectedTransaction.reference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p>{selectedTransaction.reference}</p>
                  </div>
                )}
              </div>
              {selectedTransaction.billPhotoUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Bill Photo</p>
                  <img
                    src={selectedTransaction.billPhotoUrl}
                    alt="Bill"
                    className="max-w-full rounded-lg border"
                  />
                </div>
              )}
              {!selectedTransaction.billPhotoUrl && !selectedTransaction.billPdfUrl && selectedTransaction.txnType === 'cash_out' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">⚠️ No bill document provided</p>
                  <p className="text-sm text-red-600 mt-1">This transaction requires approval as no bill evidence was submitted.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)} data-testid="button-close-details">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
