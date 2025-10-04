import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, AlertTriangle, TrendingUp, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function InventoryTracking() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stockQty: "",
    unit: "",
    reorderLevel: "",
    costPerUnit: ""
  });

  const queryClient = useQueryClient();

  // Fetch inventory items
  const { data: inventory = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/inventory-items", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch inventory");
      return response.json();
    }
  });

  // Create inventory item mutation
  const createItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await fetch("/api/hotels/current/inventory-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...itemData,
          stockQty: parseFloat(itemData.stockQty),
          reorderLevel: parseFloat(itemData.reorderLevel),
          costPerUnit: itemData.costPerUnit ? parseFloat(itemData.costPerUnit) : null
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create inventory item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      setIsAddDialogOpen(false);
      setNewItem({ name: "", category: "", stockQty: "", unit: "", reorderLevel: "", costPerUnit: "" });
      toast.success("Inventory item created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ itemId, stockQty }: { itemId: string; stockQty: number }) => {
      const response = await fetch(`/api/hotels/current/inventory-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stockQty })
      });
      if (!response.ok) throw new Error("Failed to update stock");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast.success("Stock updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleCreateItem = () => {
    if (!newItem.name || !newItem.stockQty || !newItem.unit) {
      toast.error("Please fill in name, stock quantity, and unit");
      return;
    }

    createItemMutation.mutate(newItem);
  };

  const handleStockUpdate = (item: any, newStock: number) => {
    updateStockMutation.mutate({ itemId: item.id, stockQty: newStock });
  };

  const handleDeleteItem = async (item: any) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const response = await fetch(`/api/hotels/current/inventory-items/${item.id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to delete item");
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
        toast.success("Item deleted successfully");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const getStockStatus = (stockQty: number, reorderLevel: number) => {
    if (stockQty <= reorderLevel) {
      return { status: 'Low Stock', color: 'text-red-600 bg-red-100' };
    } else if (stockQty <= reorderLevel * 1.5) {
      return { status: 'Medium', color: 'text-orange-600 bg-orange-100' };
    }
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const lowStockItems = inventory.filter(item => 
    Number(item.stockQty) <= Number(item.reorderLevel)
  );
  
  const totalValue = inventory.reduce((sum, item) => 
    sum + (Number(item.stockQty) * Number(item.costPerUnit || 0)), 0
  );

  const columns = [
    { key: "name", label: "Item Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { 
      key: "stockQty", 
      label: "Current Stock", 
      sortable: true,
      render: (value: number, row: any) => (
        <div className="flex items-center space-x-2">
          <span>{value} {row.unit}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newStock = prompt(`Update stock for ${row.name}:`, value.toString());
              if (newStock !== null && !isNaN(Number(newStock))) {
                handleStockUpdate(row, Number(newStock));
              }
            }}
          >
            Edit
          </Button>
        </div>
      )
    },
    { 
      key: "reorderLevel", 
      label: "Reorder Level", 
      render: (value: number, row: any) => `${value} ${row.unit}`
    },
    { 
      key: "costPerUnit", 
      label: "Cost/Unit", 
      render: (value: any) => {
        const numValue = Number(value);
        return !isNaN(numValue) && numValue > 0 ? `₹${numValue.toFixed(2)}` : 'N/A';
      }
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value: any, row: any) => {
        const { status, color } = getStockStatus(Number(row.stockQty), Number(row.reorderLevel));
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        );
      }
    }
  ];

  const actions = [
    { 
      label: "Delete", 
      action: handleDeleteItem, 
      variant: "destructive" as const 
    }
  ];

  return (
    <DashboardLayout title="Restaurant Inventory Tracking">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">₹{totalValue.toFixed(0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Need Reorder</p>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-3">
                {lowStockItems.length} item(s) are running low and need to be restocked:
              </p>
              <div className="space-y-1">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="text-sm text-red-600">
                    • {item.name}: {item.stockQty} {item.unit} (Reorder at {item.reorderLevel} {item.unit})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <DataTable
          title="Restaurant Inventory"
          data={inventory}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          onAdd={() => setIsAddDialogOpen(true)}
          addButtonLabel="Add Inventory Item"
          searchPlaceholder="Search inventory items..."
        />

        {/* Add Item Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredients">Ingredients</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stockQty">Stock Quantity *</Label>
                  <Input
                    id="stockQty"
                    type="number"
                    step="0.01"
                    value={newItem.stockQty}
                    onChange={(e) => setNewItem({ ...newItem, stockQty: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select 
                    value={newItem.unit} 
                    onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="bottles">bottles</SelectItem>
                      <SelectItem value="cans">cans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  step="0.01"
                  value={newItem.reorderLevel}
                  onChange={(e) => setNewItem({ ...newItem, reorderLevel: e.target.value })}
                  placeholder="Minimum stock level"
                />
              </div>
              
              <div>
                <Label htmlFor="costPerUnit">Cost per Unit (₹)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  value={newItem.costPerUnit}
                  onChange={(e) => setNewItem({ ...newItem, costPerUnit: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateItem}
                  disabled={createItemMutation.isPending}
                >
                  {createItemMutation.isPending ? "Creating..." : "Add Item"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}