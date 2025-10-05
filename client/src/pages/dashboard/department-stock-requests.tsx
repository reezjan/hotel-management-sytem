import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, Truck, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DepartmentStockRequests() {
  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/stock-requests/department"]
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50"><Truck className="w-3 h-3 mr-1" /> Ready to Pickup</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemById = (itemId: string) => {
    return inventoryItems.find((item: any) => item.id === itemId);
  };

  return (
    <DashboardLayout title="Department Stock Requests">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Department Stock Requests</h1>
          <p className="text-muted-foreground mt-1">View stock requests from your department staff</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stock Request Records</CardTitle>
            <CardDescription>All stock requests from department staff members</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No stock requests from your department</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request: any) => {
                  const item = getItemById(request.itemId);
                  return (
                    <div key={request.id} className="border rounded-lg p-4" data-testid={`request-${request.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-lg" data-testid={`text-item-${request.id}`}>{item?.name || 'Unknown Item'}</div>
                          <div className="text-sm text-muted-foreground">
                            Requested Quantity: <span className="font-medium">{request.quantity} {request.unit}</span>
                          </div>
                          {request.notes && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Notes: {request.notes}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            Requested: {new Date(request.createdAt).toLocaleString()}
                          </div>
                          {request.status === 'approved' && request.approvedAt && (
                            <div className="text-xs text-muted-foreground">
                              Approved: {new Date(request.approvedAt).toLocaleString()}
                            </div>
                          )}
                          {request.status === 'delivered' && request.deliveredAt && (
                            <div className="text-xs text-muted-foreground">
                              Delivered: {new Date(request.deliveredAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div data-testid={`status-${request.id}`}>{getStatusBadge(request.status)}</div>
                      </div>
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
