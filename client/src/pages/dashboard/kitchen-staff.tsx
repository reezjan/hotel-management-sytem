import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ChefHat, Clock, CheckCircle, Wrench } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getStatusColor } from "@/lib/utils";

export default function KitchenStaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kotOrders = [] } = useQuery({
    queryKey: ["/api/hotels/hotel-id/kot-orders"]
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["/api/hotels/hotel-id/restaurant-tables"]
  });

  const form = useForm({
    defaultValues: {
      description: ""
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/kot-orders/${orderId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/hotel-id/kot-orders"] });
      toast({ title: "Order status updated successfully" });
    }
  });

  const createMaintenanceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/maintenance-requests", {
        hotelId: user?.hotelId,
        raisedBy: user?.id,
        department: "kitchen",
        description: data.description,
        status: "open"
      });
    },
    onSuccess: () => {
      toast({ title: "Maintenance request submitted successfully" });
      form.reset();
    }
  });

  const pendingOrders = kotOrders.filter(order => order.status === 'open');
  const preparingOrders = kotOrders.filter(order => order.status === 'preparing');
  const readyOrders = kotOrders.filter(order => order.status === 'ready');
  const completedToday = kotOrders.filter(order => {
    const today = new Date().toDateString();
    return order.status === 'served' && new Date(order.updatedAt || order.createdAt).toDateString() === today;
  });

  const handleOrderStatusUpdate = (order: any, newStatus: string) => {
    updateOrderMutation.mutate({ orderId: order.id, status: newStatus });
  };

  const onSubmitMaintenanceRequest = (data: any) => {
    createMaintenanceRequestMutation.mutate(data);
  };

  return (
    <DashboardLayout title="Kitchen Staff Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pending Orders"
            value={pendingOrders.length}
            icon={<Clock />}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="In Preparation"
            value={preparingOrders.length}
            icon={<ChefHat />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Ready to Serve"
            value={readyOrders.length}
            icon={<CheckCircle />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Completed Today"
            value={completedToday.length}
            icon={<CheckCircle />}
            iconColor="text-purple-500"
          />
        </div>

        {/* KOT Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span>Pending Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-pending-orders">
                    No pending orders
                  </p>
                ) : (
                  pendingOrders.slice(0, 10).map((order, index) => (
                    <div key={order.id} className="p-4 border rounded-lg" data-testid={`pending-order-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {tables.find(t => t.id === order.tableId)?.name || `Table ${index + 1}`}
                        </h4>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Order #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleOrderStatusUpdate(order, 'preparing')}
                        disabled={updateOrderMutation.isPending}
                        className="w-full"
                        data-testid={`button-start-cooking-${index}`}
                      >
                        Start Cooking
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders in Preparation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-blue-500" />
                <span>In Preparation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preparingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-preparing-orders">
                    No orders in preparation
                  </p>
                ) : (
                  preparingOrders.slice(0, 10).map((order, index) => (
                    <div key={order.id} className="p-4 border rounded-lg bg-blue-50" data-testid={`preparing-order-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {tables.find(t => t.id === order.tableId)?.name || `Table ${index + 1}`}
                        </h4>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Order #{order.id.slice(0, 8)} • Started {new Date(order.updatedAt || order.createdAt).toLocaleTimeString()}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleOrderStatusUpdate(order, 'ready')}
                        disabled={updateOrderMutation.isPending}
                        className="w-full"
                        data-testid={`button-mark-ready-${index}`}
                      >
                        Mark as Ready
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ready Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Ready to Serve</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-4" data-testid="no-ready-orders">
                  No orders ready for service
                </p>
              ) : (
                readyOrders.map((order, index) => (
                  <div key={order.id} className="p-4 border rounded-lg bg-green-50" data-testid={`ready-order-${index}`}>
                    <div className="text-center">
                      <h4 className="font-medium text-foreground mb-1">
                        {tables.find(t => t.id === order.tableId)?.name || `Table ${index + 1}`}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        Ready for Pickup
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-red-500" />
              <span>Report Kitchen Issue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitMaintenanceRequest)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the kitchen equipment issue or maintenance need..."
                          rows={4}
                          data-testid="textarea-maintenance-description"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createMaintenanceRequestMutation.isPending}
                  data-testid="button-submit-maintenance"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  {createMaintenanceRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Kitchen Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Kitchen Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="performance-completion-rate">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-green-700">Order Accuracy</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="performance-avg-time">
                <div className="text-2xl font-bold text-blue-600">12m</div>
                <div className="text-sm text-blue-700">Avg. Prep Time</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg" data-testid="performance-orders-today">
                <div className="text-2xl font-bold text-purple-600">{kotOrders.length}</div>
                <div className="text-sm text-purple-700">Orders Today</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="performance-efficiency">
                <div className="text-2xl font-bold text-orange-600">94%</div>
                <div className="text-sm text-orange-700">Kitchen Efficiency</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
