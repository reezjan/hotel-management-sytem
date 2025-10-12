import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Truck, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function StorekeeperStockRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  const { data: pendingRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/stock-requests/pending"],
    refetchInterval: 3000
  });

  // Real-time updates for stock requests
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/stock-requests/pending"],
    refetchInterval: 3000,
    events: ['stock-request:created', 'stock-request:updated']
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/hotels/current/stock-requests/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/stock-requests/pending"] });
      toast({
        title: "Success",
        description: "Stock request approved"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive"
      });
    }
  });

  const deliverMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/hotels/current/stock-requests/${id}/deliver`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/stock-requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({
        title: "Success",
        description: "Stock delivered and inventory updated"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deliver stock",
        variant: "destructive"
      });
    }
  });

  const getItemById = (itemId: string) => {
    return inventoryItems.find((item: any) => item.id === itemId);
  };

  return (
    <DashboardLayout title="Stock Requests">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Requests</h1>
          <p className="text-muted-foreground mt-1">Manage pending stock requests from staff</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Approve and deliver stock requests</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending stock requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request: any) => {
                  const item = getItemById(request.itemId);
                  const isApproved = request.status === 'approved';
                  return (
                    <div key={request.id} className="border rounded-lg p-4" data-testid={`request-${request.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-lg" data-testid={`text-item-${request.id}`}>{item?.name || 'Unknown Item'}</div>
                          <div className="text-sm text-muted-foreground">
                            Requested Quantity: <span className="font-medium">{request.quantity} {request.unit}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Available Stock: <span className="font-medium">{item?.baseStockQty || item?.stockQty || 0} {item?.baseUnit || item?.unit || 'units'}</span>
                          </div>
                          {request.notes && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Notes: {request.notes}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            Requested: {new Date(request.createdAt).toLocaleString()}
                          </div>
                          {isApproved && request.approvedAt && (
                            <div className="text-xs text-muted-foreground">
                              Approved: {new Date(request.approvedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!isApproved ? (
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${request.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => deliverMutation.mutate(request.id)}
                              disabled={deliverMutation.isPending}
                              data-testid={`button-deliver-${request.id}`}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                      {isApproved && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-blue-50">
                            <Clock className="w-3 h-3 mr-1" /> Ready for Pickup
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
