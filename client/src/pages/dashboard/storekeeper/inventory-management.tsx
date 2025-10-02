import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function StorekeeperInventoryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const addItemForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      unit: "",
      currentQty: 0,
      minQty: 0,
      maxQty: 0,
      location: ""
    }
  });

  const receiveStockForm = useForm({
    defaultValues: {
      qty: 0,
      notes: ""
    }
  });

  const recordWastageForm = useForm({
    defaultValues: {
      qty: 0,
      reason: ""
    }
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/inventory-items", {
        ...data,
        hotelId: user?.hotelId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Inventory item created successfully" });
      addItemForm.reset();
      setIsAddItemModalOpen(false);
    }
  });

  const receiveStockMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/inventory-items/${selectedItem.id}`, {
        currentQty: selectedItem.currentQty + data.qty
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Stock received successfully" });
      receiveStockForm.reset();
      setSelectedItem(null);
    }
  });

  const recordWastageMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/inventory-consumptions", {
        hotelId: user?.hotelId,
        inventoryItemId: selectedItem.id,
        qty: data.qty,
        unit: selectedItem.unit,
        type: 'wastage',
        notes: data.reason
      });
      await apiRequest("PUT", `/api/inventory-items/${selectedItem.id}`, {
        currentQty: Math.max(0, selectedItem.currentQty - data.qty)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-consumptions"] });
      toast({ title: "Wastage recorded successfully" });
      recordWastageForm.reset();
      setSelectedItem(null);
    }
  });

  const onAddItem = (data: any) => {
    createItemMutation.mutate(data);
  };

  const onReceiveStock = (data: any) => {
    receiveStockMutation.mutate(data);
  };

  const onRecordWastage = (data: any) => {
    recordWastageMutation.mutate(data);
  };

  return (
    <DashboardLayout title="Inventory Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Inventory</h2>
          <Button 
            onClick={() => setIsAddItemModalOpen(true)}
            data-testid="button-add-item"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="no-items-message">
                No inventory items. Add your first item to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {inventoryItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    data-testid={`manage-item-${item.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Stock: {item.currentQty} {item.unit}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            receiveStockForm.reset();
                          }}
                          data-testid={`button-receive-stock-${item.id}`}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Receive Stock
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            recordWastageForm.reset();
                          }}
                          data-testid={`button-record-wastage-${item.id}`}
                        >
                          <TrendingDown className="w-4 h-4 mr-1" />
                          Record Wastage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <Form {...addItemForm}>
              <form onSubmit={addItemForm.handleSubmit(onAddItem)} className="space-y-4">
                <FormField
                  control={addItemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-item-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addItemForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="input-item-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addItemForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., kg, pieces" data-testid="input-item-unit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addItemForm.control}
                    name="currentQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-item-current-qty"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addItemForm.control}
                    name="minQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-item-min-qty"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addItemForm.control}
                    name="maxQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-item-max-qty"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addItemForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-item-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createItemMutation.isPending}
                  data-testid="button-submit-item"
                >
                  {createItemMutation.isPending ? 'Creating...' : 'Create Item'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedItem && receiveStockForm.formState.isDirty === false && recordWastageForm.formState.isDirty === false} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage: {selectedItem?.name}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="receive">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="receive">Receive Stock</TabsTrigger>
                <TabsTrigger value="wastage">Record Wastage</TabsTrigger>
              </TabsList>
              <TabsContent value="receive" className="space-y-4">
                <Form {...receiveStockForm}>
                  <form onSubmit={receiveStockForm.handleSubmit(onReceiveStock)} className="space-y-4">
                    <FormField
                      control={receiveStockForm.control}
                      name="qty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity to Receive ({selectedItem?.unit})</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-receive-qty"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={receiveStockForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-receive-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={receiveStockMutation.isPending}
                      data-testid="button-submit-receive"
                    >
                      {receiveStockMutation.isPending ? 'Processing...' : 'Receive Stock'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="wastage" className="space-y-4">
                <Form {...recordWastageForm}>
                  <form onSubmit={recordWastageForm.handleSubmit(onRecordWastage)} className="space-y-4">
                    <FormField
                      control={recordWastageForm.control}
                      name="qty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity Wasted ({selectedItem?.unit})</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-wastage-qty"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recordWastageForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Wastage</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-wastage-reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={recordWastageMutation.isPending}
                      data-testid="button-submit-wastage"
                    >
                      {recordWastageMutation.isPending ? 'Processing...' : 'Record Wastage'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
