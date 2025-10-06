import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, AlertTriangle, CheckSquare, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { getSupportedUnitsForItem, getUnitLabel } from "@shared/measurements";

export default function StorekeeperDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [wastageDialogOpen, setWastageDialogOpen] = useState(false);
  const [wastageData, setWastageData] = useState({
    itemId: "",
    qty: "",
    unit: "",
    reason: ""
  });

  const { data: inventoryItems = [], isLoading: loadingInventory } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: lowStockItems = [], isLoading: loadingLowStock } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/low-stock-items"]
  });

  const { data: consumptions = [], isLoading: loadingConsumptions } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-consumptions"]
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery<any[]>({
    queryKey: ["/api/tasks/my-tasks"]
  });

  const pendingTasks = tasks.filter((t: any) => t.status === 'pending');

  const selectedItem = useMemo(() => {
    return inventoryItems.find((item: any) => item.id === wastageData.itemId);
  }, [inventoryItems, wastageData.itemId]);

  const availableUnits = useMemo(() => {
    if (!selectedItem) return [];
    const category = selectedItem.measurementCategory || 'weight';
    const conversionProfile = selectedItem.conversionProfile || {};
    return getSupportedUnitsForItem(category as any, conversionProfile);
  }, [selectedItem]);

  const createWastageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/hotels/current/wastages", data);
    },
    onSuccess: () => {
      toast({ title: "Wastage recorded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-consumptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/inventory-transactions"] });
      setWastageDialogOpen(false);
      setWastageData({ itemId: "", qty: "", unit: "", reason: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const submitWastage = () => {
    if (!wastageData.itemId || !wastageData.qty || !wastageData.unit || !wastageData.reason.trim()) {
      toast({ title: "Please fill all wastage fields", variant: "destructive" });
      return;
    }
    const qty = parseFloat(wastageData.qty);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "Please enter a valid quantity", variant: "destructive" });
      return;
    }
    createWastageMutation.mutate({
      itemId: wastageData.itemId,
      qty: qty.toString(),
      unit: wastageData.unit,
      reason: wastageData.reason.trim()
    });
  };

  const recentActivity = consumptions.slice(0, 10).map((consumption: any) => {
    const item = inventoryItems.find((i: any) => i.id === consumption.itemId);
    return {
      ...consumption,
      itemName: item?.name || 'Unknown Item',
      unit: consumption.unit || item?.baseUnit || item?.unit || '',
      type: consumption.referenceEntity === 'wastage' ? 'wastage' : 'consumption'
    };
  });

  return (
    <DashboardLayout title="Storekeeper Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Items"
            value={inventoryItems.length}
            icon={<Package />}
            iconColor="text-blue-500"
            data-testid="stat-total-items"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={lowStockItems.length}
            icon={<AlertTriangle />}
            iconColor="text-red-500"
            data-testid="stat-low-stock"
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={<CheckSquare />}
            iconColor="text-orange-500"
            data-testid="stat-pending-tasks"
          />
        </div>

        <div className="flex justify-end">
          <Dialog open={wastageDialogOpen} onOpenChange={setWastageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-record-wastage">
                <Trash2 className="w-4 h-4 mr-2" /> Record Wastage
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-record-wastage">
              <DialogHeader>
                <DialogTitle>Record Wastage</DialogTitle>
                <DialogDescription>Record inventory wastage with reason</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Inventory Item</Label>
                  <Select
                    value={wastageData.itemId}
                    onValueChange={(value) => {
                      const item = inventoryItems.find((i: any) => i.id === value);
                      const defaultUnit = item?.baseUnit || item?.unit || '';
                      setWastageData({ ...wastageData, itemId: value, unit: defaultUnit });
                    }}
                  >
                    <SelectTrigger data-testid="select-wastage-item">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.unit || item.baseUnit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={wastageData.qty}
                    onChange={(e) => setWastageData({ ...wastageData, qty: e.target.value })}
                    placeholder="Enter quantity"
                    data-testid="input-wastage-quantity"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={wastageData.unit}
                    onValueChange={(value) => setWastageData({ ...wastageData, unit: value })}
                    disabled={!wastageData.itemId}
                  >
                    <SelectTrigger data-testid="select-wastage-unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {getUnitLabel(unit as any)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={wastageData.reason}
                    onChange={(e) => setWastageData({ ...wastageData, reason: e.target.value })}
                    placeholder="Explain reason for wastage"
                    data-testid="input-wastage-reason"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setWastageDialogOpen(false)}
                    data-testid="button-cancel-wastage"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitWastage}
                    disabled={createWastageMutation.isPending}
                    data-testid="button-submit-wastage"
                  >
                    {createWastageMutation.isPending ? "Recording..." : "Record Wastage"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Inventory Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingConsumptions ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4" data-testid="no-activity-message">
                No recent inventory activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity: any, index: number) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`activity-item-name-${activity.id}`}>
                        {activity.itemName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {activity.qty} {activity.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.type === 'wastage' ? 'destructive' : 'default'}>
                        {activity.type || 'consumption'}
                      </Badge>
                      {activity.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950"
                    data-testid={`low-stock-item-${item.id}`}
                  >
                    <div>
                      <p className="font-medium" data-testid={`low-stock-name-${item.id}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.currentQty} {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      Min: {item.minQty} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
