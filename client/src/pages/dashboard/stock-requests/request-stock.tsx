import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, CheckCircle, Clock, Truck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { getCategoryForUnit, getSupportedUnitsForItem, getUnitLabel, type UnitCode } from "@shared/measurements";

const requestStockSchema = z.object({
  itemId: z.string().min(1, "Please select an item"),
  quantity: z.string()
    .min(1, "Quantity is required")
    .refine((val) => {
      const trimmed = val.trim();
      const num = Number(trimmed);
      return trimmed !== "" && Number.isFinite(num) && num > 0;
    }, {
      message: "Quantity must be a valid positive number"
    }),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().optional()
});

type RequestStockForm = z.infer<typeof requestStockSchema>;

export default function RequestStock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [availableUnits, setAvailableUnits] = useState<UnitCode[]>([]);

  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: myRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/stock-requests/my-requests"]
  });

  const form = useForm<RequestStockForm>({
    resolver: zodResolver(requestStockSchema),
    defaultValues: {
      itemId: "",
      quantity: "",
      unit: "",
      notes: ""
    }
  });

  const requestMutation = useMutation({
    mutationFn: async (data: RequestStockForm) => {
      return await apiRequest("POST", "/api/hotels/current/stock-requests", {
        ...data,
        quantity: parseFloat(data.quantity)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/stock-requests/my-requests"] });
      toast({
        title: "Success",
        description: "Stock request submitted successfully"
      });
      setIsRequestModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit stock request",
        variant: "destructive"
      });
    }
  });

  const handleItemSelect = (itemId: string) => {
    const item = inventoryItems.find((i: any) => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      form.setValue("itemId", itemId);
      
      const rawBaseUnit = item.baseUnit || "piece";
      const baseUnitCode = rawBaseUnit as UnitCode;
      const category = getCategoryForUnit(baseUnitCode);
      
      if (category) {
        const units = getSupportedUnitsForItem(category);
        if (units && units.length > 0) {
          setAvailableUnits(units);
          const matchedUnit = units.find(u => u === baseUnitCode) || units[0];
          form.setValue("unit", matchedUnit);
        } else {
          console.warn(`No units found for category ${category}, falling back to base unit: ${rawBaseUnit}`);
          setAvailableUnits([baseUnitCode]);
          form.setValue("unit", baseUnitCode);
        }
      } else {
        console.warn(`No category found for unit ${rawBaseUnit}, using as-is`);
        setAvailableUnits([baseUnitCode]);
        form.setValue("unit", baseUnitCode);
      }
    }
  };

  const handleSubmit = (data: RequestStockForm) => {
    requestMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50"><Truck className="w-3 h-3 mr-1" /> Ready to Pickup</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Request Stock">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Request Stock</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Request inventory items from the storekeeper</p>
          </div>
          <Button onClick={() => setIsRequestModalOpen(true)} data-testid="button-request-stock" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Stock Requests</CardTitle>
            <CardDescription>View the status of your stock requests</CardDescription>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No stock requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((request: any) => {
                  const item = inventoryItems.find((i: any) => i.id === request.itemId);
                  return (
                    <div key={request.id} className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3" data-testid={`request-${request.id}`}>
                      <div className="flex-1">
                        <div className="font-semibold" data-testid={`text-item-${request.id}`}>{item?.name || 'Unknown Item'}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {request.quantity} {request.unit}
                        </div>
                        {request.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Notes: {request.notes}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div data-testid={`status-${request.id}`} className="self-start sm:self-center">{getStatusBadge(request.status)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Stock</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleItemSelect(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-item">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inventoryItems.map((item: any) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.baseStockQty || item.stockQty || 0} {item.baseUnit || item.unit || 'units'} available)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="Enter quantity"
                            {...field}
                            data-testid="input-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedItem || availableUnits.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableUnits.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {getUnitLabel(unit)} ({unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Any additional notes"
                          {...field}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRequestModalOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={requestMutation.isPending} data-testid="button-submit">
                    {requestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
