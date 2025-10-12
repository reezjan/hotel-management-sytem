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
import { Package, Plus, TrendingUp, ArrowRightLeft, History, AlertTriangle, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function StorekeeperInventoryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isReceiveStockModalOpen, setIsReceiveStockModalOpen] = useState(false);
  const [isIssueStockModalOpen, setIsIssueStockModalOpen] = useState(false);
  const [receiveStockMode, setReceiveStockMode] = useState<'package' | 'base'>('package');
  const [issueStockMode, setIssueStockMode] = useState<'package' | 'base'>('base');
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const { data: allInventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/inventory-items"],
    events: ['inventory:created', 'inventory:updated', 'inventory:deleted']
  });

  // Filter items by department
  const inventoryItems = allInventoryItems.filter((item: any) => {
    if (departmentFilter === "all") return true;
    const departments = item.departments || [];
    return departments.includes('all') || departments.includes(departmentFilter);
  });

  const { data: hotelUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"]
  });

  const { data: inventoryTransactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-transactions"],
    refetchInterval: 3000
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/inventory-transactions"],
    events: ['inventory_transaction:created', 'inventory_transaction:updated']
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
      department: "",
      expiryDate: "",
      hasExpiry: false
    }
  });

  const editItemForm = useForm({
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
      expiryDate: "",
      hasExpiry: false
    }
  });

  const receiveStockForm = useForm({
    defaultValues: {
      qtyPackage: 0,
      qtyBase: 0,
      supplierName: "",
      referenceNumber: "",
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
      if (selectedDepartments.length === 0) {
        throw new Error("Please select at least one department");
      }
      
      const baseUnitsPerPackage = data.packageUnit ? parseFloat(data.baseUnitsPerPackage) || 0 : 0;
      // Auto-generate SKU if not provided
      const sku = data.sku.trim() || `SKU-${Date.now()}`;
      
      await apiRequest("POST", "/api/hotels/current/inventory-items", {
        hotelId: user?.hotelId,
        name: data.name,
        description: data.description || "",
        sku: sku,
        unit: data.baseUnit,
        baseUnit: data.baseUnit,
        packageUnit: data.packageUnit || null,
        baseUnitsPerPackage: baseUnitsPerPackage > 0 ? baseUnitsPerPackage.toString() : '0',
        packageStockQty: '0',
        baseStockQty: '0',
        reorderLevel: data.reorderLevel.toString(),
        storageLocation: data.storageLocation || "",
        costPerUnit: data.costPerUnit.toString(),
        departments: selectedDepartments
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Inventory item created successfully" });
      addItemForm.reset();
      setSelectedDepartments([]);
      setIsAddItemModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create inventory item", 
        variant: "destructive" 
      });
    }
  });

  const editItemMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedDepartments.length === 0) {
        throw new Error("Please select at least one department");
      }
      
      const baseUnitsPerPackage = data.packageUnit ? parseFloat(data.baseUnitsPerPackage) || 0 : 0;
      
      await apiRequest("PUT", `/api/hotels/current/inventory-items/${selectedItem.id}`, {
        name: data.name,
        description: data.description || "",
        sku: data.sku,
        unit: data.baseUnit,
        baseUnit: data.baseUnit,
        packageUnit: data.packageUnit || null,
        baseUnitsPerPackage: baseUnitsPerPackage > 0 ? baseUnitsPerPackage.toString() : '0',
        reorderLevel: data.reorderLevel.toString(),
        storageLocation: data.storageLocation || "",
        costPerUnit: data.costPerUnit.toString(),
        departments: selectedDepartments
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      toast({ title: "Inventory item updated successfully" });
      editItemForm.reset();
      setSelectedDepartments([]);
      setSelectedItem(null);
      setIsEditItemModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update inventory item", 
        variant: "destructive" 
      });
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
        supplierName: data.supplierName || "",
        referenceNumber: data.referenceNumber || "",
        notes: data.notes || ""
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="laundry">Laundry</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="front_desk">Front Desk</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setIsAddItemModalOpen(true)}
                data-testid="button-add-item"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Items ({inventoryItems.length})</CardTitle>
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
                                // Handle both new departments array and legacy department string
                                const depts = item.departments ?? (item.department ? [item.department] : []);
                                setSelectedDepartments(depts);
                                editItemForm.reset({
                                  name: item.name,
                                  description: item.description || "",
                                  sku: item.sku,
                                  baseUnit: item.baseUnit,
                                  packageUnit: item.packageUnit || "",
                                  baseUnitsPerPackage: parseFloat(item.baseUnitsPerPackage) || 0,
                                  reorderLevel: parseFloat(item.reorderLevel) || 0,
                                  storageLocation: item.storageLocation || "",
                                  costPerUnit: parseFloat(item.costPerUnit) || 0
                                });
                                setIsEditItemModalOpen(true);
                              }}
                              data-testid={`button-edit-item-${item.id}`}
                              className="flex-1 sm:flex-none"
                            >
                              <Package className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
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

      {/* Add Item Modal - Matching Owner Design */}
      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <p className="text-sm text-muted-foreground">Create a new inventory item</p>
          </DialogHeader>
          <Form {...addItemForm}>
            <form onSubmit={addItemForm.handleSubmit(onAddItem)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addItemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter item name" 
                          data-testid="input-item-name" 
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
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter SKU" data-testid="input-sku" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addItemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter description" 
                        rows={3}
                        data-testid="input-item-description" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addItemForm.control}
                  name="baseUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-base-unit">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="g">Gram (g)</SelectItem>
                          <SelectItem value="L">Liter (L)</SelectItem>
                          <SelectItem value="ml">Milliliter (ml)</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addItemForm.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          value={field.value || ''} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="Minimum stock level" 
                          data-testid="input-reorder-level" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addItemForm.control}
                  name="storageLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Storage location" 
                          data-testid="input-storage-location" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addItemForm.control}
                  name="costPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Per Unit</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="Cost per unit" 
                          data-testid="input-cost-per-unit" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <FormLabel>Departments * (Select one or more)</FormLabel>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-md">
                  {[
                    { value: "all", label: "All Departments" },
                    { value: "kitchen", label: "Kitchen" },
                    { value: "restaurant", label: "Restaurant" },
                    { value: "bar", label: "Bar" },
                    { value: "housekeeping", label: "Housekeeping" },
                    { value: "laundry", label: "Laundry" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "front_desk", label: "Front Desk" },
                    { value: "security", label: "Security" }
                  ].map((dept) => (
                    <div key={dept.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept.value}`}
                        checked={selectedDepartments.includes(dept.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDepartments([...selectedDepartments, dept.value]);
                          } else {
                            setSelectedDepartments(selectedDepartments.filter(d => d !== dept.value));
                          }
                        }}
                        data-testid={`checkbox-dept-${dept.value}`}
                      />
                      <label
                        htmlFor={`dept-${dept.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {dept.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedDepartments.length === 0 && (
                  <p className="text-sm text-red-500">Please select at least one department</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsAddItemModalOpen(false)}
                  data-testid="button-cancel-add"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createItemMutation.isPending}
                  data-testid="button-submit-item"
                >
                  {createItemMutation.isPending ? 'Adding...' : 'Add Item'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditItemModalOpen} onOpenChange={setIsEditItemModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <p className="text-sm text-muted-foreground">Update inventory item details</p>
          </DialogHeader>
          <Form {...editItemForm}>
            <form onSubmit={editItemForm.handleSubmit((data) => editItemMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editItemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter item name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editItemForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter SKU" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editItemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter description" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editItemForm.control}
                  name="baseUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="g">Gram (g)</SelectItem>
                          <SelectItem value="L">Liter (L)</SelectItem>
                          <SelectItem value="ml">Milliliter (ml)</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editItemForm.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          value={field.value || ''} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="Minimum stock level" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editItemForm.control}
                  name="storageLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Storage location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editItemForm.control}
                  name="costPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Per Unit</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="Cost per unit" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <FormLabel>Departments * (Select one or more)</FormLabel>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-md">
                  {[
                    { value: "all", label: "All Departments" },
                    { value: "kitchen", label: "Kitchen" },
                    { value: "restaurant", label: "Restaurant" },
                    { value: "bar", label: "Bar" },
                    { value: "housekeeping", label: "Housekeeping" },
                    { value: "laundry", label: "Laundry" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "front_desk", label: "Front Desk" },
                    { value: "security", label: "Security" }
                  ].map((dept) => (
                    <div key={dept.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-dept-${dept.value}`}
                        checked={selectedDepartments.includes(dept.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDepartments([...selectedDepartments, dept.value]);
                          } else {
                            setSelectedDepartments(selectedDepartments.filter(d => d !== dept.value));
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-dept-${dept.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {dept.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedDepartments.length === 0 && (
                  <p className="text-sm text-red-500">Please select at least one department</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsEditItemModalOpen(false);
                    setSelectedDepartments([]);
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editItemMutation.isPending}
                >
                  {editItemMutation.isPending ? 'Updating...' : 'Update Item'}
                </Button>
              </div>
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
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter supplier/vendor name" data-testid="input-supplier-name" />
                    </FormControl>
                    <FormDescription>Required for purchase tracking</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={receiveStockForm.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill/Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter bill or invoice number" data-testid="input-reference-number" />
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
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional details..." data-testid="input-receive-notes" />
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
