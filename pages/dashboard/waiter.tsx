import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editedItems, setEditedItems] = useState<Record<string, number>>({});

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
    }
  });

  const updateKotItemMutation = useMutation({
    mutationFn: async ({ itemId, qty }: { itemId: string; qty: number }) => {
      await apiRequest("PUT", `/api/kot-items/${itemId}`, { qty });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      toast({ title: "Item quantity updated successfully" });
    }
  });

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) && item.active
  );

  const myOrders = kotOrders.filter(order => order.createdBy === user?.id);
  const activeOrders = myOrders.filter(order => ['open', 'preparing'].includes(order.status));

  const getTableOrders = (tableId: string) => {
    return kotOrders.filter(order => order.tableId === tableId && ['open', 'preparing', 'ready'].includes(order.status));
  };

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

  const handleTableClick = (table: any) => {
    setSelectedTable(table);
    setCurrentOrder([]);
    setIsTableModalOpen(true);
  };

  const handlePlaceOrder = () => {
    if (!selectedTable || currentOrder.length === 0) {
      toast({ title: "Error", description: "Please add items to order", variant: "destructive" });
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

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleEditOrder = (order: any) => {
    setEditingOrderId(order.id);
    const itemQuantities: Record<string, number> = {};
    order.items?.forEach((item: any) => {
      itemQuantities[item.id] = item.qty;
    });
    setEditedItems(itemQuantities);
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setEditedItems({});
  };

  const handleSaveEdit = async (order: any) => {
    try {
      const updatePromises = order.items
        .filter((item: any) => editedItems[item.id] && editedItems[item.id] !== item.qty)
        .map((item: any) => 
          updateKotItemMutation.mutateAsync({
            itemId: item.id,
            qty: editedItems[item.id]
          })
        );
      
      await Promise.all(updatePromises);
      setEditingOrderId(null);
      setEditedItems({});
    } catch (error) {
      toast({ title: "Error", description: "Failed to update items", variant: "destructive" });
    }
  };

  const updateEditedItemQty = (itemId: string, qty: number) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: Math.max(1, qty)
    }));
  };

  const tableOrders = selectedTable ? getTableOrders(selectedTable.id) : [];

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
            <CardTitle>Restaurant Layout</CardTitle>
            <p className="text-sm text-muted-foreground">Click on any table to view orders or add new items</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table, index) => {
                const ordersCount = getTableOrders(table.id).length;
                return (
                  <div
                    key={table.id}
                    className="p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/50"
                    onClick={() => handleTableClick(table)}
                    data-testid={`table-${index}`}
                  >
                    <div className="text-center">
                      <Table2 className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <h3 className="font-medium text-foreground">{table.name}</h3>
                      <p className="text-sm text-muted-foreground">{table.capacity} seats</p>
                      {ordersCount > 0 ? (
                        <Badge variant="default" className="mt-2">
                          {ordersCount} {ordersCount === 1 ? 'Order' : 'Orders'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-2">Available</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
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
                        onClick={() => {
                          const table = tables.find(t => t.id === order.tableId);
                          if (table) handleTableClick(table);
                        }}
                        data-testid={`button-view-${index}`}
                      >
                        View Table
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table Modal with Tabs */}
        <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedTable?.name} ({selectedTable?.capacity} seats)
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="menu" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="menu">Menu & New Order</TabsTrigger>
                <TabsTrigger value="orders">
                  Active Orders ({tableOrders.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="menu" className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
                  {/* Menu Items */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Menu Items</h3>
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
                            size="icon"
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
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-card" data-testid={`order-item-${index}`}>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                data-testid={`button-decrease-${index}`}
                              >
                                <Minus className="h-5 w-5" />
                              </Button>
                              <span className="w-10 text-center font-medium text-foreground">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                data-testid={`button-increase-${index}`}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
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
                          className="w-full"
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
              </TabsContent>
              
              <TabsContent value="orders" className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {tableOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No active orders for this table
                    </p>
                  ) : (
                    tableOrders.map((order) => {
                      const isEditing = editingOrderId === order.id;
                      return (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(order.status)} variant="secondary">
                                {order.status}
                              </Badge>
                            </div>
                            
                            {order.items && order.items.length > 0 && (
                              <div className="mb-3 space-y-2">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm flex items-center justify-between p-2 rounded border bg-card">
                                    <span className="flex-1">{item.menuItem?.name || item.notes || 'Unknown Item'}</span>
                                    {isEditing ? (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8"
                                          onClick={() => updateEditedItemQty(item.id, (editedItems[item.id] || item.qty) - 1)}
                                          data-testid={`button-decrease-edit-${idx}`}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-12 text-center font-medium">
                                          {editedItems[item.id] || item.qty}
                                        </span>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8"
                                          onClick={() => updateEditedItemQty(item.id, (editedItems[item.id] || item.qty) + 1)}
                                          data-testid={`button-increase-edit-${idx}`}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">x{item.qty}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex space-x-2 mt-4">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleCancelEdit}
                                    data-testid="button-cancel-edit"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    className="flex-1"
                                    onClick={() => handleSaveEdit(order)}
                                    disabled={updateKotItemMutation.isPending}
                                    data-testid="button-save-edit"
                                  >
                                    {updateKotItemMutation.isPending ? "Saving..." : "Save Changes"}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {order.status === 'ready' && (
                                    <Button
                                      className="flex-1"
                                      onClick={() => handleOrderStatusUpdate(order, 'served')}
                                      disabled={updateOrderMutation.isPending}
                                      data-testid="button-mark-served"
                                    >
                                      Mark as Served
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleEditOrder(order)}
                                    data-testid="button-edit-order"
                                  >
                                    Edit Order
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleDeleteOrder(order.id)}
                                    data-testid="button-delete-order"
                                  >
                                    Delete Order
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
