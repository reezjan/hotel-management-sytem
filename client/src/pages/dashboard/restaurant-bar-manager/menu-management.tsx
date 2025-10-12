import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Utensils, Plus, Coffee, Wine, Cake, X, Beaker } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function MenuManagement() {
  const { confirm } = useConfirmDialog();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isIngredientsDialogOpen, setIsIngredientsDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [ingredients, setIngredients] = useState<Array<{inventoryItemId: string; quantity: number; unit?: string}>>([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    active: true
  });
  const [newCategory, setNewCategory] = useState({ name: "" });

  const queryClient = useQueryClient();

  // Fetch menu items
  const { data: menuItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"],
    refetchInterval: 3000
  });

  // Fetch menu categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-categories"],
    refetchInterval: 3000
  });

  // Fetch inventory items for ingredients
  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await fetch("/api/hotels/current/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...itemData,
          price: parseFloat(itemData.price),
          categoryId: itemData.categoryId || null
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create menu item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/menu-items"] });
      setIsAddDialogOpen(false);
      setNewMenuItem({ name: "", description: "", price: "", categoryId: "", active: true });
      toast.success("Menu item created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ itemId, active }: { itemId: string; active: boolean }) => {
      const response = await fetch(`/api/hotels/current/menu-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active })
      });
      if (!response.ok) throw new Error("Failed to update menu item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/menu-items"] });
      toast.success("Menu item status updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string }) => {
      const response = await fetch("/api/hotels/current/menu-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(categoryData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/menu-categories"] });
      setIsCategoryDialogOpen(false);
      setNewCategory({ name: "" });
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/hotels/current/menu-categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/menu-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleCreateMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      toast.error("Please fill in name and price");
      return;
    }

    createMenuItemMutation.mutate(newMenuItem);
  };

  const handleToggleActive = (item: any) => {
    toggleActiveMutation.mutate({
      itemId: item.id,
      active: !item.active
    });
  };

  const handleDeleteMenuItem = async (item: any) => {
    await confirm({
      title: "Delete Menu Item",
      description: `Are you sure you want to delete "${item.name}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/hotels/current/menu-items/${item.id}`, {
            method: "DELETE",
            credentials: "include"
          });
          if (!response.ok) throw new Error("Failed to delete menu item");
          queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/menu-items"] });
          toast.success("Menu item deleted successfully");
        } catch (error: any) {
          toast.error(error.message);
        }
      }
    });
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    createCategoryMutation.mutate(newCategory);
  };

  const handleDeleteCategory = async (category: any) => {
    await confirm({
      title: "Delete Category",
      description: `Are you sure you want to delete "${category.name}" category?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        deleteCategoryMutation.mutate(category.id);
      }
    });
  };

  const handleManageIngredients = (item: any) => {
    setSelectedMenuItem(item);
    // Load existing ingredients from recipe if available
    const existingIngredients = item.recipe?.ingredients || [];
    setIngredients(existingIngredients);
    setIsIngredientsDialogOpen(true);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { inventoryItemId: "", quantity: 0, unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const getUnitsForItem = (inventoryItemId: string) => {
    const item = inventoryItems.find(i => i.id === inventoryItemId);
    if (!item) return [];
    
    const category = item.measurementCategory || 'weight';
    const baseUnit = item.baseUnit || 'kg';
    
    const weightUnits = ['mg', 'g', 'kg', 'oz', 'lb'];
    const volumeUnits = ['ml', 'L', 'tsp', 'tbsp', 'cup', 'fl_oz'];
    const countUnits = ['piece', 'dozen', 'pack'];
    
    let units: string[] = [];
    if (category === 'weight') {
      units = weightUnits;
    } else if (category === 'volume') {
      units = volumeUnits;
    } else if (category === 'count') {
      units = countUnits;
    } else {
      units = [baseUnit];
    }
    
    if (item.conversionProfile && typeof item.conversionProfile === 'object') {
      const customUnits = Object.keys(item.conversionProfile).filter(
        k => k !== 'baseUnit' && k !== 'baseToKg' && k !== 'baseToL'
      );
      units = Array.from(new Set([...units, ...customUnits]));
    }
    
    return units;
  };

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      mg: "mg", g: "g", kg: "kg", oz: "oz", lb: "lb",
      ml: "ml", L: "L", tsp: "tsp", tbsp: "tbsp", cup: "cup", fl_oz: "fl oz",
      piece: "piece", dozen: "dozen", pack: "pack"
    };
    return labels[unit] || unit;
  };

  const saveIngredientsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/hotels/current/menu-items/${selectedMenuItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipe: {
            ingredients: ingredients.filter(ing => ing.inventoryItemId && ing.quantity > 0 && ing.unit)
          }
        })
      });
      if (!response.ok) throw new Error("Failed to save ingredients");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/menu-items"] });
      setIsIngredientsDialogOpen(false);
      toast.success("Ingredients saved successfully with unit conversions");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const isBeverageItem = (item: any) => {
    const categoryName = item.category?.name?.toLowerCase() || '';
    return categoryName.includes('coffee') || 
           categoryName.includes('beverage') || 
           categoryName.includes('drink') ||
           categoryName.includes('bar');
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('coffee') || name.includes('beverage')) return <Coffee className="h-4 w-4" />;
    if (name.includes('wine') || name.includes('alcohol') || name.includes('drink')) return <Wine className="h-4 w-4" />;
    if (name.includes('dessert') || name.includes('cake')) return <Cake className="h-4 w-4" />;
    return <Utensils className="h-4 w-4" />;
  };

  const columns = [
    { key: "name", label: "Item Name", sortable: true },
    { 
      key: "category", 
      label: "Category", 
      render: (value: any) => value ? (
        <div className="flex items-center space-x-2">
          {getCategoryIcon(value.name)}
          <span>{value.name}</span>
        </div>
      ) : 'Uncategorized'
    },
    { 
      key: "price", 
      label: "Price", 
      sortable: true, 
      render: (value: any) => {
        const numValue = Number(value);
        return `रु${!isNaN(numValue) ? numValue.toFixed(2) : '0.00'}`;
      }
    },
    { 
      key: "active", 
      label: "Status", 
      render: (value: boolean, row: any) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value}
            onCheckedChange={() => handleToggleActive(row)}
            disabled={toggleActiveMutation.isPending}
          />
          <span className={`text-sm ${value ? 'text-green-600' : 'text-gray-600'}`}>
            {value ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    }
  ];

  const handleManageIngredientsClick = (item: any) => {
    if (!isBeverageItem(item)) {
      toast.error("Ingredients can only be managed for beverage items (coffee, drinks, bar)");
      return;
    }
    handleManageIngredients(item);
  };

  const actions = [
    {
      label: "Manage Ingredients",
      action: handleManageIngredientsClick,
      variant: "default" as const
    },
    {
      label: "Delete",
      action: handleDeleteMenuItem,
      variant: "destructive" as const
    }
  ];

  const activeItems = menuItems.filter(item => item.active).length;
  const totalItems = menuItems.length;
  const avgPrice = menuItems.length > 0 
    ? menuItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0) / menuItems.length 
    : 0;

  return (
    <DashboardLayout title="Menu Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
                <Utensils className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                  <p className="text-2xl font-bold">{activeItems}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <Coffee className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                  <p className="text-2xl font-bold">रु{avgPrice.toFixed(0)}</p>
                </div>
                <Wine className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Menu Categories</CardTitle>
              <Button onClick={() => setIsCategoryDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No categories yet. Create your first category to organize your menu.
                </p>
              ) : (
                categories.map((category) => (
                  <Card key={category.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category.name)}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Table */}
        <DataTable
          title="Menu Items"
          data={menuItems}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          onAdd={() => setIsAddDialogOpen(true)}
          addButtonLabel="Add Menu Item"
          searchPlaceholder="Search menu items..."
        />

        {/* Add Menu Item Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price (रु) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                  placeholder="Enter price"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newMenuItem.categoryId} 
                  onValueChange={(value) => setNewMenuItem({ ...newMenuItem, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newMenuItem.active}
                  onCheckedChange={(checked) => setNewMenuItem({ ...newMenuItem, active: checked })}
                />
                <Label htmlFor="active">Active (available for ordering)</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateMenuItem}
                  disabled={createMenuItemMutation.isPending}
                >
                  {createMenuItemMutation.isPending ? "Creating..." : "Create Item"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Menu Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  placeholder="e.g., Appetizers, Main Course, Beverages"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Ingredients Dialog */}
        <Dialog open={isIngredientsDialogOpen} onOpenChange={setIsIngredientsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Manage Ingredients - {selectedMenuItem?.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Set ingredients for automatic inventory deduction when this item is ordered
              </p>
            </DialogHeader>
            <div className="space-y-4">
              {ingredients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => {
                    const availableUnits = ingredient.inventoryItemId ? getUnitsForItem(ingredient.inventoryItemId) : [];
                    const selectedItem = inventoryItems.find(i => i.id === ingredient.inventoryItemId);
                    
                    return (
                      <div key={index} className="flex items-end gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label>Inventory Item *</Label>
                          <Select
                            value={ingredient.inventoryItemId}
                            onValueChange={(value) => {
                              updateIngredient(index, 'inventoryItemId', value);
                              const item = inventoryItems.find(i => i.id === value);
                              if (item && !ingredient.unit) {
                                updateIngredient(index, 'unit', item.baseUnit || 'kg');
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-28">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ingredient.quantity || ""}
                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="w-28">
                          <Label>Unit *</Label>
                          <Select
                            value={ingredient.unit || selectedItem?.baseUnit || ''}
                            onValueChange={(value) => updateIngredient(index, 'unit', value)}
                            disabled={!ingredient.inventoryItemId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUnits.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {getUnitLabel(unit)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={addIngredient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsIngredientsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => saveIngredientsMutation.mutate()}
                  disabled={saveIngredientsMutation.isPending}
                >
                  {saveIngredientsMutation.isPending ? "Saving..." : "Save Ingredients"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}