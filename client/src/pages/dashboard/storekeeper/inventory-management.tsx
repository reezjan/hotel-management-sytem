import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, TrendingUp, ArrowRightLeft, History, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function StorekeeperInventoryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isReceiveStockModalOpen, setIsReceiveStockModalOpen] = useState(false);
  const [isIssueStockModalOpen, setIsIssueStockModalOpen] = useState(false);
  const [receiveStockMode, setReceiveStockMode] = useState<'package' | 'base'>('package');
  const [issueStockMode, setIssueStockMode] = useState<'package' | 'base'>('base');

  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: hotelUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"]
  });

  const { data: inventoryTransactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-transactions"]
  });

  const addItemForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      baseUnit: "piece",
      packageUnit: "",
      baseUnitsPerPackage: 0,
      reorderLevel: 0,
      storageLocation: "",
      costPerUnit: 0,
      departments: [] as string[]
    }
  });

  const receiveStockForm = useForm({
    defaultValues: {
      qtyPackage: 0,
      qtyBase: 0,
      notes: ""
    }
  });

  const issueStockForm = useForm({
    defaultValues: {
      issuedToUserId: "",
      department: "",
      qtyPackage: 0,
      qtyBase: 0,
      notes: ""
    }
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const baseUnitsPerPackage = data.packageUnit ? parseFloat(data.baseUnitsPerPackage) || 0 : 0;
      
      await apiRequest("POST", "/api/hotels/current/inventory-items", {
        hotelId: user?.hotelId,
        name: data.name,
        description: data.description,
        sku: data.sku,
        baseUnit: data.baseUnit,
        packageUnit: data.packageUnit || null,
        baseUnitsPerPackage: baseUnitsPerPackage > 0 ? baseUnitsPerPackage.toString() : '0',
        packageStockQty: '0',
        baseStockQty: '0',
        reorderLevel: data.reorderLevel.toString(),
        storageLocation: data.storageLocation,
        costPerUnit: data.costPerUnit.toString(),
        departments: data.departments || []
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
      const item = selectedItem;
      const hasPackageUnit = item.packageUnit && parseFloat(item.baseUnitsPerPackage) > 0;
      const baseUnitsPerPackage = parseFloat(item.baseUnitsPerPackage) || 1;
      
      let qtyPackage = 0;
      let qtyBase = 0;
      
      if (hasPackageUnit && receiveStockMode === 'package') {
        qtyPackage = parseFloat(data.qtyPackage) || 0;
        qtyBase = qtyPackage * baseUnitsPerPackage;
      } else {
        qtyBase = parseFloat(data.qtyBase) || 0;
        if (hasPackageUnit) {
          qtyPackage = qtyBase / baseUnitsPerPackage;
        }
      }
      
      const currentPackageQty = parseFloat(item.packageStockQty) || 0;
      const currentBaseQty = parseFloat(item.baseStockQty) || 0;
      
      const updateData: any = {
        baseStockQty: (currentBaseQty + qtyBase).toFixed(3)
      };
      
      if (hasPackageUnit) {
        updateData.packageStockQty = (currentPackageQty + qtyPackage).toFixed(3);
      }
      
      await apiRequest("PUT", `/api/hotels/current/inventory-items/${item.id}`, updateData);
      
      const transactionData: any = {
        hotelId: user?.hotelId,
        itemId: item.id,
        transactionType: 'receive',
        qtyBase: qtyBase.toFixed(3),
        recordedBy: user?.id,
        notes: data.notes
      };
      
      if (hasPackageUnit) {
        transactionData.qtyPackage = qtyPackage.toFixed(3);
      }
      
      await apiRequest("POST", "/api/hotels/current/inventory-transactions", transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-transactions"] });
      toast({ title: "Stock received successfully" });
      receiveStockForm.reset();
      setSelectedItem(null);
      setIsReceiveStockModalOpen(false);
    }
  });

  const issueStockMutation = useMutation({
    mutationFn: async (data: any) => {
      const item = selectedItem;
      const hasPackageUnit = item.packageUnit && parseFloat(item.baseUnitsPerPackage) > 0;
      const baseUnitsPerPackage = parseFloat(item.baseUnitsPerPackage) || 1;
      
      let qtyPackage = 0;
      let qtyBase = 0;
      
      if (hasPackageUnit && issueStockMode === 'package') {
        qtyPackage = parseFloat(data.qtyPackage) || 0;
        qtyBase = qtyPackage * baseUnitsPerPackage;
      } else {
        qtyBase = parseFloat(data.qtyBase) || 0;
        if (hasPackageUnit) {
          qtyPackage = qtyBase / baseUnitsPerPackage;
        }
      }
      
      const currentBaseStock = parseFloat(item.baseStockQty) || 0;
      if (qtyBase > currentBaseStock) {
        throw new Error(`Insufficient stock. Available: ${currentBaseStock} ${item.baseUnit}`);
      }
      
      const currentPackageQty = parseFloat(item.packageStockQty) || 0;
      
      const updateData: any = {
        baseStockQty: Math.max(0, currentBaseStock - qtyBase).toFixed(3)
      };
      
      if (hasPackageUnit) {
        updateData.packageStockQty = Math.max(0, currentPackageQty - qtyPackage).toFixed(3);
      }
      
      await apiRequest("PUT", `/api/hotels/current/inventory-items/${item.id}`, updateData);
      
      const transactionData: any = {
        hotelId: user?.hotelId,
        itemId: item.id,
        transactionType: 'issue',
        qtyBase: qtyBase.toFixed(3),
        issuedToUserId: data.issuedToUserId || null,
        department: data.department || null,
        recordedBy: user?.id,
        notes: data.notes
      };
      
      if (hasPackageUnit) {
        transactionData.qtyPackage = qtyPackage.toFixed(3);
      }
      
      await apiRequest("POST", "/api/hotels/current/inventory-transactions", transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-transactions"] });
      toast({ title: "Stock issued successfully" });
      issueStockForm.reset();
      setSelectedItem(null);
      setIsIssueStockModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to issue stock", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const onAddItem = (data: any) => {
    if (data.packageUnit && (!data.baseUnitsPerPackage || data.baseUnitsPerPackage <= 0)) {
      toast({
        title: "Invalid input",
        description: "Please specify how many base units are in one package",
        variant: "destructive"
      });
      return;
    }
    createItemMutation.mutate(data);
  };

  const onReceiveStock = (data: any) => {
    receiveStockMutation.mutate(data);
  };

  const onIssueStock = (data: any) => {
    if (!data.issuedToUserId && !data.department) {
      toast({
        title: "Missing information",
        description: "Please select a user or enter a department",
        variant: "destructive"
      });
      return;
    }
    issueStockMutation.mutate(data);
  };

  const getUserName = (userId: string) => {
    const foundUser = hotelUsers.find((u: any) => u.id === userId);
    return foundUser ? foundUser.username : 'Unknown User';
  };

  return (
    <DashboardLayout title="Inventory Management">
      <Tabs defaultValue="items" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <TabsList className="grid w-full grid-cols-3 max-w-full sm:max-w-[500px]">
          <TabsTrigger value="items" className="text-xs sm:text-sm">Inventory Items</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
          <TabsTrigger value="low-stock" className="text-xs sm:text-sm">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Manage Inventory Items</h2>
            <Button 
              onClick={() => setIsAddItemModalOpen(true)}
              data-testid="button-add-item"
              className="w-full sm:w-auto"
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
                  {inventoryItems.map((item: any) => {
                    const baseStock = parseFloat(item.baseStockQty) || 0;
                    const packageStock = parseFloat(item.packageStockQty) || 0;
                    const reorderLevel = parseFloat(item.reorderLevel) || 0;
                    const isLowStock = baseStock <= reorderLevel;
                    
                    return (
                      <div
                        key={item.id}
                        className={`p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors ${isLowStock ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}`}
                        data-testid={`manage-item-${item.id}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-semibold text-base">{item.name}</h3>
                              {isLowStock && (
                                <Badge variant="destructive" className="text-xs w-fit">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Low Stock
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                              <span className="font-medium">
                                Stock: {baseStock.toFixed(2)} {item.baseUnit}
                                {item.packageUnit && ` (${packageStock.toFixed(2)} ${item.packageUnit})`}
                              </span>
                              {item.storageLocation && (
                                <span className="text-muted-foreground">
                                  Location: {item.storageLocation}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsReceiveStockModalOpen(true);
                                receiveStockForm.reset();
                              }}
                              data-testid={`button-receive-stock-${item.id}`}
                              className="flex-1 sm:flex-none"
                            >
                              <TrendingUp className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Receive</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsIssueStockModalOpen(true);
                                issueStockForm.reset();
                              }}
                              data-testid={`button-issue-stock-${item.id}`}
                              className="flex-1 sm:flex-none"
                            >
                              <ArrowRightLeft className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Issue</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions recorded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {inventoryTransactions.map((transaction: any) => {
                    const item = inventoryItems.find((i: any) => i.id === transaction.itemId);
                    const isReceive = transaction.transactionType === 'receive';
                    const isWastage = transaction.transactionType === 'wastage';
                    
                    const getBadgeVariant = () => {
                      if (isReceive) return "default";
                      if (isWastage) return "destructive";
                      return "secondary";
                    };
                    
                    return (
                      <div
                        key={transaction.id}
                        className="p-4 border rounded-lg space-y-2"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant()}>
                                {transaction.transactionType.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{item?.name || 'Unknown Item'}</span>
                            </div>
                            <div className="mt-2 text-sm space-y-1">
                              <p>
                                Quantity: {parseFloat(transaction.qtyBase).toFixed(2)} {item?.baseUnit}
                                {item?.packageUnit && transaction.qtyPackage && 
                                  ` (${parseFloat(transaction.qtyPackage).toFixed(2)} ${item.packageUnit})`
                                }
                              </p>
                              {transaction.issuedToUserId && (
                                <p className="text-muted-foreground">
                                  Issued to: {getUserName(transaction.issuedToUserId)}
                                </p>
                              )}
                              {transaction.department && (
                                <p className="text-muted-foreground">
                                  Department: {transaction.department}
                                </p>
                              )}
                              {transaction.notes && (
                                <p className="text-muted-foreground">Notes: {transaction.notes}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleString()} by {getUserName(transaction.recordedBy)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryItems.filter((item: any) => 
                (parseFloat(item.baseStockQty) || 0) <= (parseFloat(item.reorderLevel) || 0)
              ).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No items are low on stock
                </p>
              ) : (
                <div className="space-y-3">
                  {inventoryItems
                    .filter((item: any) => 
                      (parseFloat(item.baseStockQty) || 0) <= (parseFloat(item.reorderLevel) || 0)
                    )
                    .map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 border border-red-300 bg-red-50 dark:bg-red-950/20 rounded-lg"
                        data-testid={`low-stock-item-${item.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Current: {parseFloat(item.baseStockQty).toFixed(2)} {item.baseUnit} | 
                              Reorder Level: {parseFloat(item.reorderLevel).toFixed(2)} {item.baseUnit}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsReceiveStockModalOpen(true);
                              receiveStockForm.reset();
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Modal - Simplified for Storekeepers */}
      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Item to Store</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Fill in the basic details below</p>
          </DialogHeader>
          <Form {...addItemForm}>
            <form onSubmit={addItemForm.handleSubmit(onAddItem)} className="space-y-5">
              {/* Item Name - Most Important */}
              <FormField
                control={addItemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">1. What is the item called? *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Example: Rice, Soap, Towels" 
                        className="text-base h-11"
                        data-testid="input-item-name" 
                      />
                    </FormControl>
                    <FormDescription className="text-sm">Write the name of the item you want to add</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Who uses it */}
              <FormField
                control={addItemForm.control}
                name="departments"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">2. Who will use this item? *</FormLabel>
                    <FormDescription className="text-sm mb-3">
                      Check the boxes for departments that need this item
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-3 bg-muted/30 p-4 rounded-lg">
                      {[
                        { value: 'all', label: '✓ Everyone (All Departments)', highlight: true },
                        { value: 'kitchen', label: 'Kitchen' },
                        { value: 'restaurant', label: 'Restaurant' },
                        { value: 'bar', label: 'Bar' },
                        { value: 'housekeeping', label: 'Housekeeping/Cleaning' },
                        { value: 'laundry', label: 'Laundry' },
                        { value: 'maintenance', label: 'Maintenance/Repair' },
                        { value: 'front_desk', label: 'Front Desk' },
                        { value: 'security', label: 'Security' }
                      ].map((dept) => (
                        <FormField
                          key={dept.value}
                          control={addItemForm.control}
                          name="departments"
                          render={({ field }) => (
                            <FormItem className={`flex items-center space-x-3 space-y-0 p-2 rounded ${dept.highlight ? 'bg-primary/10 border border-primary/20' : ''}`}>
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(dept.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (dept.value === 'all') {
                                      if (checked) {
                                        field.onChange(['all']);
                                      } else {
                                        field.onChange([]);
                                      }
                                    } else {
                                      if (checked) {
                                        const newValue = currentValue.filter((v: string) => v !== 'all');
                                        field.onChange([...newValue, dept.value]);
                                      } else {
                                        field.onChange(currentValue.filter((v: string) => v !== dept.value));
                                      }
                                    }
                                  }}
                                  data-testid={`checkbox-dept-${dept.value}`}
                                  className="h-5 w-5"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer leading-tight">
                                {dept.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* How to measure */}
              <FormField
                control={addItemForm.control}
                name="baseUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">3. How do you count/measure this? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base h-11" data-testid="select-base-unit">
                          <SelectValue placeholder="Choose how to measure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="piece">Pieces (1, 2, 3...)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg) - for heavy items</SelectItem>
                        <SelectItem value="g">Grams (g) - for light items</SelectItem>
                        <SelectItem value="L">Liters (L) - for liquids</SelectItem>
                        <SelectItem value="ml">Milliliters (ml) - for small liquid amounts</SelectItem>
                        <SelectItem value="pack">Packs/Packets</SelectItem>
                        <SelectItem value="dozen">Dozen (12 pieces)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm">Select how you will count or weigh this item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Where to keep it */}
              <FormField
                control={addItemForm.control}
                name="storageLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">4. Where do you keep this item?</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Example: Shelf 1, Cold Room, Top Rack" 
                        className="text-base h-11"
                        data-testid="input-storage-location" 
                      />
                    </FormControl>
                    <FormDescription className="text-sm">Where in the store is this item kept?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional: What it looks like / Notes */}
              <FormField
                control={addItemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">5. Any notes? (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Example: White color, comes in blue bags, expires quickly" 
                        className="text-base"
                        rows={3}
                        data-testid="input-item-description" 
                      />
                    </FormControl>
                    <FormDescription className="text-sm">Add any helpful details about this item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Advanced fields hidden by default - Only show if needed */}
              <details className="border rounded-lg p-4 bg-muted/20">
                <summary className="cursor-pointer font-semibold text-base mb-4">
                  ⚙️ Advanced Settings (Optional - Click to show)
                </summary>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={addItemForm.control}
                      name="packageUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., sack, box, carton" data-testid="input-package-unit" />
                          </FormControl>
                          <FormDescription className="text-xs">If items come in packages</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addItemForm.control}
                      name="baseUnitsPerPackage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How many in 1 package?</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              step="0.001"
                              placeholder="e.g., 50"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-base-units-per-package"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={addItemForm.control}
                      name="reorderLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Stock Alert</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              step="0.001"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-reorder-level"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">Alert when stock goes below this</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addItemForm.control}
                      name="costPerUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Unit</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-cost-per-unit"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addItemForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Code/SKU</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., ITM-001" data-testid="input-item-sku" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </details>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={createItemMutation.isPending}
                data-testid="button-submit-item"
              >
                {createItemMutation.isPending ? 'Adding Item...' : '✓ Add Item to Store'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Modal */}
      <Dialog open={isReceiveStockModalOpen} onOpenChange={setIsReceiveStockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Stock: {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <Form {...receiveStockForm}>
            <form onSubmit={receiveStockForm.handleSubmit(onReceiveStock)} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={receiveStockMode === 'package' ? 'default' : 'outline'}
                  onClick={() => setReceiveStockMode('package')}
                  disabled={!selectedItem?.packageUnit}
                  className="flex-1"
                  data-testid="button-mode-package"
                >
                  <Package className="w-4 h-4 mr-2" />
                  By Package
                </Button>
                <Button
                  type="button"
                  variant={receiveStockMode === 'base' ? 'default' : 'outline'}
                  onClick={() => setReceiveStockMode('base')}
                  className="flex-1"
                  data-testid="button-mode-base"
                >
                  By {selectedItem?.baseUnit || 'Unit'}
                </Button>
              </div>

              {receiveStockMode === 'package' ? (
                <FormField
                  control={receiveStockForm.control}
                  name="qtyPackage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity ({selectedItem?.packageUnit})</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.001"
                          onChange={(e) => {
                            const pkg = parseFloat(e.target.value) || 0;
                            field.onChange(pkg);
                            const baseUnitsPerPkg = parseFloat(selectedItem?.baseUnitsPerPackage) || 1;
                            receiveStockForm.setValue('qtyBase', pkg * baseUnitsPerPkg);
                          }}
                          data-testid="input-receive-qty-package"
                        />
                      </FormControl>
                      <FormDescription>
                        = {(receiveStockForm.watch('qtyPackage') * (parseFloat(selectedItem?.baseUnitsPerPackage) || 1)).toFixed(2)} {selectedItem?.baseUnit}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={receiveStockForm.control}
                  name="qtyBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity ({selectedItem?.baseUnit})</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.001"
                          onChange={(e) => {
                            const base = parseFloat(e.target.value) || 0;
                            field.onChange(base);
                            const baseUnitsPerPkg = parseFloat(selectedItem?.baseUnitsPerPackage) || 1;
                            receiveStockForm.setValue('qtyPackage', base / baseUnitsPerPkg);
                          }}
                          data-testid="input-receive-qty-base"
                        />
                      </FormControl>
                      {selectedItem?.packageUnit && (
                        <FormDescription>
                          = {(receiveStockForm.watch('qtyBase') / (parseFloat(selectedItem?.baseUnitsPerPackage) || 1)).toFixed(3)} {selectedItem?.packageUnit}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={receiveStockForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Purchase details, vendor info..." data-testid="input-receive-notes" />
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
        </DialogContent>
      </Dialog>

      {/* Issue Stock Modal */}
      <Dialog open={isIssueStockModalOpen} onOpenChange={setIsIssueStockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Stock: {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <Form {...issueStockForm}>
            <form onSubmit={issueStockForm.handleSubmit(onIssueStock)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={issueStockForm.control}
                  name="issuedToUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued To (User)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-issued-to-user">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hotelUsers.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.username} - {user.roleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={issueStockForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="housekeeping">Housekeeping</SelectItem>
                          <SelectItem value="front_desk">Front Desk</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={issueStockMode === 'package' ? 'default' : 'outline'}
                  onClick={() => setIssueStockMode('package')}
                  disabled={!selectedItem?.packageUnit}
                  className="flex-1"
                  data-testid="button-issue-mode-package"
                >
                  <Package className="w-4 h-4 mr-2" />
                  By Package
                </Button>
                <Button
                  type="button"
                  variant={issueStockMode === 'base' ? 'default' : 'outline'}
                  onClick={() => setIssueStockMode('base')}
                  className="flex-1"
                  data-testid="button-issue-mode-base"
                >
                  By {selectedItem?.baseUnit || 'Unit'}
                </Button>
              </div>

              {issueStockMode === 'package' ? (
                <FormField
                  control={issueStockForm.control}
                  name="qtyPackage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity ({selectedItem?.packageUnit})</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.001"
                          onChange={(e) => {
                            const pkg = parseFloat(e.target.value) || 0;
                            field.onChange(pkg);
                            const baseUnitsPerPkg = parseFloat(selectedItem?.baseUnitsPerPackage) || 1;
                            issueStockForm.setValue('qtyBase', pkg * baseUnitsPerPkg);
                          }}
                          data-testid="input-issue-qty-package"
                        />
                      </FormControl>
                      <FormDescription>
                        = {(issueStockForm.watch('qtyPackage') * (parseFloat(selectedItem?.baseUnitsPerPackage) || 1)).toFixed(2)} {selectedItem?.baseUnit}
                        <br />
                        Available: {parseFloat(selectedItem?.baseStockQty || 0).toFixed(2)} {selectedItem?.baseUnit}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={issueStockForm.control}
                  name="qtyBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity ({selectedItem?.baseUnit})</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.001"
                          onChange={(e) => {
                            const base = parseFloat(e.target.value) || 0;
                            field.onChange(base);
                            const baseUnitsPerPkg = parseFloat(selectedItem?.baseUnitsPerPackage) || 1;
                            issueStockForm.setValue('qtyPackage', base / baseUnitsPerPkg);
                          }}
                          data-testid="input-issue-qty-base"
                        />
                      </FormControl>
                      <FormDescription>
                        Available: {parseFloat(selectedItem?.baseStockQty || 0).toFixed(2)} {selectedItem?.baseUnit}
                        {selectedItem?.packageUnit && (
                          <><br />= {(issueStockForm.watch('qtyBase') / (parseFloat(selectedItem?.baseUnitsPerPackage) || 1)).toFixed(3)} {selectedItem?.packageUnit}</>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={issueStockForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Purpose, reason..." data-testid="input-issue-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={issueStockMutation.isPending}
                data-testid="button-submit-issue"
              >
                {issueStockMutation.isPending ? 'Processing...' : 'Issue Stock'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
