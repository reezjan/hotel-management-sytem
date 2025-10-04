import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table2, ShoppingCart, Receipt, Search, Plus, Minus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, getStatusColor } from "@/lib/utils";

export default function WaiterDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isViewOrdersModalOpen, setIsViewOrdersModalOpen] = useState(false);
  const [selectedTableOrders, setSelectedTableOrders] = useState<any[]>([]);

  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/restaurant-tables"]
  });

  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"]
  });

  const { data: kotOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/kot-orders"]
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      await apiRequest("POST", "/api/kot-orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      toast({ title: "Order placed successfully" });
      setCurrentOrder([]);
      setIsOrderModalOpen(false);
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/kot-orders/${orderId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      toast({ title: "Order updated successfully" });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest("DELETE", `/api/kot-orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      toast({ title: "Order deleted successfully" });
      setIsViewOrdersModalOpen(false);
    }
  });

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) && item.active
  );

  const myOrders = kotOrders.filter(order => order.createdBy === user?.id);
  const activeOrders = myOrders.filter(order => ['open', 'preparing'].includes(order.status));
  const completedOrders = myOrders.filter(order => order.status === 'served');

  const addToOrder = (menuItem: any) => {
    const existingItem = currentOrder.find(item => item.id === menuItem.id);
    if (existingItem) {
      setCurrentOrder(prev =>
        prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCurrentOrder(prev => [...prev, { ...menuItem, quantity: 1 }]);
    }
  };

  const removeFromOrder = (menuItemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(menuItemId);
      return;
    }
    setCurrentOrder(prev =>
      prev.map(item =>
        item.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
    if (!selectedTable || currentOrder.length === 0) {
      toast({ title: "Error", description: "Please select a table and add items to order", variant: "destructive" });
      return;
    }

    createOrderMutation.mutate({
      hotelId: user?.hotelId,
      tableId: selectedTable.id,
      createdBy: user?.id,
      status: 'open',
      items: currentOrder.map(item => ({
        menuItemId: item.id,
        description: item.name,
        qty: item.quantity,
        unit: 'piece'
      }))
    });
  };

  const handleOrderStatusUpdate = (order: any, newStatus: string) => {
    updateOrderMutation.mutate({ orderId: order.id, status: newStatus });
  };

  const handleTableRightClick = (e: React.MouseEvent, table: any) => {
    e.preventDefault();
    const tableOrders = kotOrders.filter(order => order.tableId === table.id && ['open', 'preparing', 'ready'].includes(order.status));
    setSelectedTable(table);
    setSelectedTableOrders(tableOrders);
    setIsViewOrdersModalOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleEditOrder = (order: any) => {
    // Load existing order items and prepare for editing
    const table = tables.find((t: any) => t.id === order.tableId);
    setSelectedTable(table);
    
    // Convert order items to the format expected by currentOrder
    const orderItems = order.items?.map((item: any) => {
      const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
      return menuItem ? { ...menuItem, quantity: item.qty } : null;
    }).filter(Boolean) || [];
    
    setCurrentOrder(orderItems);
    setIsViewOrdersModalOpen(false);
    setIsOrderModalOpen(true);
  };

  return (
    <DashboardLayout title="Waiter Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Active Orders"
            value={activeOrders.length}
            icon={<ShoppingCart />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Available Tables"
            value={tables.length}
            icon={<Table2 />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Table Layout */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Restaurant Layout</CardTitle>
              <Button 
                className="h-11"
                onClick={() => setIsOrderModalOpen(true)}
                disabled={!selectedTable}
                data-testid="button-new-order"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table, index) => (
                <div
                  key={table.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTable?.id === table.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTable(table)}
                  onContextMenu={(e) => handleTableRightClick(e, table)}
                  data-testid={`table-${index}`}
                  title="Right-click to view orders for this table"
                >
                  <div className="text-center">
                    <Table2 className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <h3 className="font-medium text-foreground">{table.name}</h3>
                    <p className="text-sm text-muted-foreground">{table.capacity} seats</p>
                    <Badge variant="secondary" className="mt-2">Available</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Orders */}
        <Card>
          <CardHeader>
            <CardTitle>My Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4" data-testid="no-orders-message">
                  No active orders
                </p>
              ) : (
                activeOrders.map((order, index) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`order-item-${index}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-foreground">
                          {tables.find(t => t.id === order.tableId)?.name || `Table ${index + 1}`}
                        </h4>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {order.status === 'open' && (
                        <Button
                          className="h-11 min-h-11"
                          variant="outline"
                          onClick={() => handleOrderStatusUpdate(order, 'preparing')}
                          disabled={updateOrderMutation.isPending}
                          data-testid={`button-send-kitchen-${index}`}
                        >
                          Send to Kitchen
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          className="h-11 min-h-11"
                          onClick={() => handleOrderStatusUpdate(order, 'served')}
                          disabled={updateOrderMutation.isPending}
                          data-testid={`button-mark-served-${index}`}
                        >
                          Mark as Served
                        </Button>
                      )}
                      <Button
                        className="h-11 min-h-11"
                        variant="outline"
                        data-testid={`button-view-bill-${index}`}
                      >
                        View Bill
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Modal */}
        <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                New Order - {selectedTable?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Menu Items */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-menu-search"
                  />
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredMenuItems.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`menu-item-${index}`}>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-sm font-medium text-primary">{formatCurrency(item.price)}</p>
                      </div>
                      <Button
                        className="h-11 w-11 min-h-11 min-w-11"
                        onClick={() => addToOrder(item)}
                        data-testid={`button-add-item-${index}`}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Order */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentOrder.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4" data-testid="empty-order-message">
                      No items added to order
                    </p>
                  ) : (
                    currentOrder.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg" data-testid={`order-item-${index}`}>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            className="h-11 w-11 min-h-11 min-w-11 rounded-full"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-${index}`}
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <Button
                            className="h-11 w-11 min-h-11 min-w-11 rounded-full"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${index}`}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                          <Button
                            className="h-11 min-h-11"
                            variant="destructive"
                            onClick={() => removeFromOrder(item.id)}
                            data-testid={`button-remove-${index}`}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {currentOrder.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-primary" data-testid="order-total">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                    <Button
                      className="w-full h-11"
                      onClick={handlePlaceOrder}
                      disabled={createOrderMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Table Orders Modal */}
        <Dialog open={isViewOrdersModalOpen} onOpenChange={setIsViewOrdersModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Orders for {selectedTable?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedTableOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active orders for this table
                </p>
              ) : (
                selectedTableOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => handleEditOrder(order)}
                          className="flex-1"
                        >
                          Edit Order
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="flex-1"
                        >
                          Delete Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
