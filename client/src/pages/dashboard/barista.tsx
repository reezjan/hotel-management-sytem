import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Coffee, Clock, CheckCircle, Wrench, Thermometer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getStatusColor } from "@/lib/utils";

export default function BaristaDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kotOrders = [] } = useQuery({
    queryKey: ["/api/hotels/hotel-id/kot-orders"]
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["/api/hotels/hotel-id/restaurant-tables"]
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/hotels/hotel-id/menu-items"]
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
        department: "coffee_bar",
        description: data.description,
        status: "open"
      });
    },
    onSuccess: () => {
      toast({ title: "Maintenance request submitted successfully" });
      form.reset();
    }
  });

  // Filter for coffee/beverage related orders
  const coffeeItems = menuItems.filter(item => 
    item.name.toLowerCase().includes('coffee') || 
    item.name.toLowerCase().includes('tea') || 
    item.name.toLowerCase().includes('latte') ||
    item.name.toLowerCase().includes('cappuccino') ||
    item.name.toLowerCase().includes('espresso') ||
    item.name.toLowerCase().includes('frappuccino')
  );

  const coffeeOrders = kotOrders; // In a real app, this would be filtered for coffee-specific orders
  const pendingOrders = coffeeOrders.filter(order => order.status === 'open');
  const preparingOrders = coffeeOrders.filter(order => order.status === 'preparing');
  const readyOrders = coffeeOrders.filter(order => order.status === 'ready');
  const completedToday = coffeeOrders.filter(order => {
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
    <DashboardLayout title="Barista Dashboard">
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
            title="Brewing"
            value={preparingOrders.length}
            icon={<Coffee />}
            iconColor="text-brown-500"
          />
          <StatsCard
            title="Ready to Serve"
            value={readyOrders.length}
            icon={<CheckCircle />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Served Today"
            value={completedToday.length}
            icon={<CheckCircle />}
            iconColor="text-blue-500"
          />
        </div>

        {/* Coffee Station Status */}
        <Card>
          <CardHeader>
            <CardTitle>Coffee Station Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center" data-testid="station-espresso">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-foreground">Espresso Machine</h4>
                <p className="text-sm text-green-700">Operational</p>
                <div className="flex items-center justify-center mt-2">
                  <Thermometer className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-xs text-green-600">Perfect Temp</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center" data-testid="station-grinder">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-foreground">Coffee Grinder</h4>
                <p className="text-sm text-blue-700">Ready</p>
                <div className="flex items-center justify-center mt-2">
                  <span className="text-xs text-blue-600">Fresh Beans</span>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center" data-testid="station-steamer">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <h4 className="font-medium text-foreground">Milk Steamer</h4>
                <p className="text-sm text-yellow-700">Warming Up</p>
                <div className="flex items-center justify-center mt-2">
                  <Thermometer className="h-4 w-4 mr-1 text-yellow-600" />
                  <span className="text-xs text-yellow-600">Heating</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coffee Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span>Pending Coffee Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-pending-orders">
                    No pending coffee orders
                  </p>
                ) : (
                  pendingOrders.slice(0, 10).map((order, index) => (
                    <div key={order.id} className="p-4 border rounded-lg" data-testid={`pending-order-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {tables.find(t => t.id === order.tableId)?.name || `Table ${index + 1}`}
                        </h4>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          New Order
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
                        data-testid={`button-start-brewing-${index}`}
                      >
                        Start Brewing
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
                <Coffee className="h-5 w-5 text-brown-500" />
                <span>Brewing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preparingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-brewing-orders">
                    No orders brewing
                  </p>
                ) : (
                  preparingOrders.slice(0, 10).map((order, index) => (
                    <div key={order.id} className="p-4 border rounded-lg bg-amber-50" data-testid={`brewing-order-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {tables.find(t => t.id === order.tableId)?.name || `Table ${index + 1}`}
                        </h4>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          Brewing
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
              <span>Ready for Pickup</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-4" data-testid="no-ready-orders">
                  No coffee orders ready for pickup
                </p>
              ) : (
                readyOrders.map((order, index) => (
                  <div key={order.id} className="p-4 border rounded-lg bg-green-50" data-testid={`ready-order-${index}`}>
                    <div className="text-center">
                      <Coffee className="h-8 w-8 mx-auto mb-2 text-green-600" />
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

        {/* Coffee Menu Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Coffee Menu Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-amber-50 rounded-lg text-center" data-testid="menu-espresso">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                <h4 className="font-medium text-foreground">Espresso</h4>
                <p className="text-sm text-muted-foreground">Single/Double Shot</p>
              </div>
              <div className="p-4 bg-brown-50 rounded-lg text-center" data-testid="menu-latte">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-brown-600" />
                <h4 className="font-medium text-foreground">Latte</h4>
                <p className="text-sm text-muted-foreground">Steamed Milk & Foam</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center" data-testid="menu-cappuccino">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h4 className="font-medium text-foreground">Cappuccino</h4>
                <p className="text-sm text-muted-foreground">Equal Parts Coffee & Milk</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center" data-testid="menu-americano">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <h4 className="font-medium text-foreground">Americano</h4>
                <p className="text-sm text-muted-foreground">Espresso with Hot Water</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-red-500" />
              <span>Report Coffee Equipment Issue</span>
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
                          placeholder="Describe the coffee equipment issue (espresso machine, grinder, steamer, etc.)..."
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

        {/* Daily Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="performance-accuracy">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-green-700">Order Accuracy</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg" data-testid="performance-avg-time">
                <div className="text-2xl font-bold text-blue-600">3m</div>
                <div className="text-sm text-blue-700">Avg. Brew Time</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg" data-testid="performance-coffee-today">
                <div className="text-2xl font-bold text-amber-600">{coffeeOrders.length}</div>
                <div className="text-sm text-amber-700">Coffees Today</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg" data-testid="performance-satisfaction">
                <div className="text-2xl font-bold text-orange-600">4.9</div>
                <div className="text-sm text-orange-700">Customer Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
