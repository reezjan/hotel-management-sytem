import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, AlertTriangle, TrendingDown, BarChart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function InventoryTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [updateStockDialog, setUpdateStockDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("piece");
  const [reorderLevel, setReorderLevel] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [stockQty, setStockQty] = useState("");
  
  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: consumptions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-consumptions"]
  });

  // Populate form when editing
  useEffect(() => {
    if (selectedItem && editDialog) {
      setName(selectedItem.name || "");
      setDescription(selectedItem.description || "");
      setSku(selectedItem.sku || "");
      setUnit(selectedItem.unit || selectedItem.baseUnit || "piece");
      setReorderLevel(selectedItem.reorderLevel || "");
      setStorageLocation(selectedItem.storageLocation || "");
      setCostPerUnit(selectedItem.costPerUnit || "");
    } else if (selectedItem && updateStockDialog) {
      setStockQty(selectedItem.baseStockQty || "");
    } else if (!editDialog && !addDialog && !updateStockDialog) {
      resetForm();
    }
  }, [selectedItem, editDialog, addDialog, updateStockDialog]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSku("");
    setUnit("piece");
    setReorderLevel("");
    setStorageLocation("");
    setCostPerUnit("");
    setStockQty("");
  };

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/hotels/current/inventory-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Success", description: "Inventory item created successfully!" });
      setAddDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create inventory item", variant: "destructive" });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/hotels/current/inventory-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Success", description: "Inventory item updated successfully!" });
      setEditDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update inventory item", variant: "destructive" });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/hotels/current/inventory-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Success", description: "Inventory item removed successfully!" });
      setRemoveDialog(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove inventory item", variant: "destructive" });
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/hotels/current/inventory-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Success", description: "Stock updated successfully!" });
      setUpdateStockDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update stock", variant: "destructive" });
    }
  });

  const handleSaveItem = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Item name is required", variant: "destructive" });
      return;
    }

    const data = {
      hotelId: user?.hotelId,
      name,
      description: description || null,
      sku: sku || "AUTO",
      unit: unit || "piece",
      packageUnit: null,
      baseUnitsPerPackage: "0",
      packageStockQty: "0",
      baseStockQty: "0",
      reorderLevel: reorderLevel || "0",
      storageLocation: storageLocation || null,
      costPerUnit: costPerUnit || "0",
      departments: []
    };

    if (selectedItem && editDialog) {
      updateItemMutation.mutate({ id: selectedItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleUpdateStock = () => {
    if (!stockQty || Number(stockQty) < 0) {
      toast({ title: "Error", description: "Please enter a valid stock quantity", variant: "destructive" });
      return;
    }

    updateStockMutation.mutate({ 
      id: selectedItem.id, 
      data: { baseStockQty: stockQty } 
    });
  };

  const handleRemoveItem = () => {
    if (selectedItem) {
      deleteItemMutation.mutate(selectedItem.id);
    }
  };

  // Calculate inventory metrics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => 
    Number(item.baseStockQty) <= Number(item.reorderLevel)
  ).length;
  const outOfStockItems = inventory.filter(item => 
    Number(item.baseStockQty) === 0
  ).length;
  const totalValue = inventory.reduce((sum, item) => 
    sum + (Number(item.baseStockQty) * (Number(item.costPerUnit) || 0)), 0
  );

  const inventoryColumns = [
    { key: "name", label: "Item Name", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { 
      key: "baseStockQty", 
      label: "Current Stock", 
      sortable: true,
      render: (value: any, row: any) => {
        const baseStock = Number(value || 0).toFixed(2);
        const packageStock = Number(row.packageStockQty || 0).toFixed(2);
        const displayUnit = row.unit || row.baseUnit || "piece";
        return `${baseStock} ${displayUnit}${row.packageUnit ? ` (${packageStock} ${row.packageUnit})` : ''}`;
      }
    },
    { key: "reorderLevel", label: "Reorder Level", sortable: true },
    { 
      key: "unit", 
      label: "Unit", 
      sortable: true,
      render: (value: any, row: any) => value || row.baseUnit || "piece"
    },
    { 
      key: "costPerUnit", 
      label: "Cost/Unit", 
      sortable: true,
      render: (value: any) => `NPR ${Number(value || 0).toFixed(2)}`
    },
    { key: "storageLocation", label: "Storage", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      render: (value: any, row: any) => {
        const stock = Number(row.baseStockQty);
        const reorder = Number(row.reorderLevel);
        if (stock === 0) {
          return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Out of Stock</span>;
        } else if (stock <= reorder) {
          return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Low Stock</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">In Stock</span>;
      }
    }
  ];

  const consumptionColumns = [
    { key: "itemName", label: "Item", sortable: true },
    { key: "qty", label: "Quantity", sortable: true },
    { key: "reason", label: "Reason", sortable: true },
    { key: "createdAt", label: "Date", sortable: true, render: (value: string) => 
      new Date(value).toLocaleDateString()
    }
  ];

  const inventoryActions = [
    { 
      label: "Update Stock", 
      action: (row: any) => {
        setSelectedItem(row);
        setUpdateStockDialog(true);
      }
    },
    { 
      label: "Edit Item", 
      action: (row: any) => {
        setSelectedItem(row);
        setEditDialog(true);
      }
    },
    { 
      label: "Remove", 
      action: (row: any) => {
        setSelectedItem(row);
        setRemoveDialog(true);
      }, 
      variant: "destructive" as const 
    }
  ];

  return (
    <DashboardLayout title="Inventory Tracking">
      <div className="space-y-6">
        {/* Inventory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Items"
            value={totalItems}
            icon={<Package />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Low Stock Items"
            value={lowStockItems}
            icon={<AlertTriangle />}
            iconColor="text-yellow-500"
          />
          <StatsCard
            title="Out of Stock"
            value={outOfStockItems}
            icon={<TrendingDown />}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Total Value"
            value={`NPR ${totalValue.toLocaleString()}`}
            icon={<BarChart />}
            iconColor="text-green-500"
          />
        </div>

        {/* Quick Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {inventory.filter(item => Number(item.baseStockQty) > Number(item.reorderLevel)).length}
                </div>
                <div className="text-sm text-green-700 mt-2">Items in Stock</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{lowStockItems}</div>
                <div className="text-sm text-yellow-700 mt-2">Low Stock Items</div>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{outOfStockItems}</div>
                <div className="text-sm text-red-700 mt-2">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <DataTable
          title="Inventory Items"
          data={inventory}
          columns={inventoryColumns}
          actions={inventoryActions}
          onAdd={() => setAddDialog(true)}
          addButtonLabel="Add Inventory Item"
          searchPlaceholder="Search inventory..."
        />

        {/* Recent Consumptions */}
        <DataTable
          title="Recent Inventory Consumptions"
          data={consumptions.slice(0, 20)}
          columns={consumptionColumns}
          searchPlaceholder="Search consumptions..."
        />

        {/* Dialogs */}
        <Dialog open={updateStockDialog} onOpenChange={setUpdateStockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock - {selectedItem?.name}</DialogTitle>
              <DialogDescription>Adjust inventory stock quantity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stock-qty">Current Stock ({selectedItem?.unit || selectedItem?.baseUnit || 'units'})</Label>
                <Input
                  id="stock-qty"
                  type="number"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder="Enter stock quantity"
                  data-testid="input-stock-qty"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setUpdateStockDialog(false)} data-testid="button-cancel-update-stock">Cancel</Button>
                <Button onClick={handleUpdateStock} disabled={updateStockMutation.isPending} data-testid="button-update-stock">
                  {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Item - {selectedItem?.name}</DialogTitle>
              <DialogDescription>Update inventory item details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Item Name *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter item name"
                    data-testid="input-item-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Enter SKU"
                    data-testid="input-sku"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  data-testid="input-description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., piece, kg, liter"
                    data-testid="input-unit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reorder-level">Reorder Level</Label>
                  <Input
                    id="edit-reorder-level"
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="Minimum stock level"
                    data-testid="input-reorder-level"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-storage">Storage Location</Label>
                  <Input
                    id="edit-storage"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="Storage location"
                    data-testid="input-storage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cost">Cost Per Unit</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    placeholder="Cost per unit"
                    data-testid="input-cost"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialog(false)} data-testid="button-cancel-edit">Cancel</Button>
                <Button onClick={handleSaveItem} disabled={updateItemMutation.isPending} data-testid="button-save-item">
                  {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={removeDialog} onOpenChange={setRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Item - {selectedItem?.name}</DialogTitle>
              <DialogDescription>Are you sure you want to remove this item?</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The item will be permanently removed from the inventory.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setRemoveDialog(false)} data-testid="button-cancel-remove">Cancel</Button>
                <Button variant="destructive" onClick={handleRemoveItem} disabled={deleteItemMutation.isPending} data-testid="button-confirm-remove">
                  {deleteItemMutation.isPending ? "Removing..." : "Remove Item"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Create a new inventory item</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Item Name *</Label>
                  <Input
                    id="add-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter item name"
                    data-testid="input-item-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-sku">SKU</Label>
                  <Input
                    id="add-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Enter SKU"
                    data-testid="input-sku"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  data-testid="input-description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-unit">Unit</Label>
                  <Input
                    id="add-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., piece, kg, liter"
                    data-testid="input-unit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-reorder-level">Reorder Level</Label>
                  <Input
                    id="add-reorder-level"
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="Minimum stock level"
                    data-testid="input-reorder-level"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-storage">Storage Location</Label>
                  <Input
                    id="add-storage"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="Storage location"
                    data-testid="input-storage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-cost">Cost Per Unit</Label>
                  <Input
                    id="add-cost"
                    type="number"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    placeholder="Cost per unit"
                    data-testid="input-cost"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddDialog(false)} data-testid="button-cancel-add">Cancel</Button>
                <Button onClick={handleSaveItem} disabled={createItemMutation.isPending} data-testid="button-create-item">
                  {createItemMutation.isPending ? "Creating..." : "Create Item"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}