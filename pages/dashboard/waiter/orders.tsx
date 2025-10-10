import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, CheckCircle2, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getStatusColor } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function WaiterOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/kot-orders"],
    select: (data) => data.filter((order: any) => order.createdBy === user?.id),
  });

  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/restaurant-tables"],
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest("DELETE", `/api/kot-orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      toast({ title: "Order deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const activeOrders = orders.filter(order => ['open', 'preparing'].includes(order.status));
  const completedOrders = orders.filter(order => ['served', 'completed'].includes(order.status));

  const getTableName = (tableId: string) => {
    const table = tables.find((t: any) => t.id === tableId);
    return table?.name || 'Unknown Table';
  };

  const handleDeleteOrder = async (orderId: string, orderStatus: string) => {
    if (orderStatus === 'served' || orderStatus === 'completed') {
      toast({ 
        title: "Cannot delete", 
        description: "Completed orders cannot be deleted", 
        variant: "destructive" 
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleEditOrder = (orderId: string) => {
    toast({ title: "Edit order in main dashboard", description: "Right-click on the table to edit orders" });
    setLocation(`/waiter`);
  };

  return (
    <DashboardLayout title="My Orders">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeOrders.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedOrders.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No orders found
                </p>
              ) : (
                orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-foreground">
                          {getTableName(order.tableId)}
                        </h4>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {order.items.length} item(s)
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.status !== 'served' && order.status !== 'completed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditOrder(order.id)}
                            data-testid={`button-edit-order-${order.id}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id, order.status)}
                            data-testid={`button-delete-order-${order.id}`}
                            disabled={deleteOrderMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                      {(order.status === 'served' || order.status === 'completed') && (
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
