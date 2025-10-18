import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wine, Clock, CheckCircle, XCircle, Package, AlertTriangle, Camera, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef } from "react";
import Webcam from "react-webcam";

interface KotItem {
  id: string;
  menuItemId: string;
  qty: number;
  notes: string | null;
  status: string;
  declineReason: string | null;
  menuItem?: { name: string };
}

interface KotOrder {
  id: string;
  tableId: string;
  status: string;
  createdAt: string;
  items?: KotItem[];
}

interface RestaurantTable {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
}

export default function BartenderDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [wastageDialogOpen, setWastageDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KotItem | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [wastageData, setWastageData] = useState({
    itemId: "",
    qty: "",
    unit: "",
    reason: ""
  });
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const { data: kotOrders = [] } = useQuery({
    queryKey: ["/api/hotels/current/kot-orders"],
    refetchInterval: 3000,
    refetchIntervalInBackground: true
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["/api/hotels/current/restaurant-tables"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const updateKotItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/kot-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/kot-orders"] });
      toast({ title: "KOT item updated successfully" });
      setDeclineDialogOpen(false);
      setDeclineReason("");
      setSelectedItem(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const createWastageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/hotels/current/wastages", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to record wastage");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Wastage recorded successfully" });
      setWastageDialogOpen(false);
      setWastageData({ itemId: "", qty: "", unit: "", reason: "" });
      setCapturedPhoto(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleApprove = (item: KotItem) => {
    updateKotItemMutation.mutate({
      id: item.id,
      data: { status: "approved" }
    });
  };

  const handleDecline = (item: KotItem) => {
    setSelectedItem(item);
    setDeclineDialogOpen(true);
  };

  const handleSetReady = (item: KotItem) => {
    updateKotItemMutation.mutate({
      id: item.id,
      data: { status: "ready" }
    });
  };

  const submitDecline = () => {
    if (!selectedItem || !declineReason.trim()) {
      toast({ title: "Please provide a reason for declining", variant: "destructive" });
      return;
    }
    if (declineReason.trim().length < 10) {
      toast({ title: "Decline reason must be at least 10 characters", variant: "destructive" });
      return;
    }
    updateKotItemMutation.mutate({
      id: selectedItem.id,
      data: { status: "declined", declineReason: declineReason.trim() }
    });
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const timestamp = new Date().toLocaleString();
          ctx.font = 'bold 20px Arial';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(10, img.height - 40, ctx.measureText(timestamp).width + 20, 35);
          ctx.fillStyle = 'white';
          ctx.fillText(timestamp, 20, img.height - 15);
          setCapturedPhoto(canvas.toDataURL('image/jpeg'));
        }
      };
      img.src = imageSrc;
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const submitWastage = async () => {
    if (!wastageData.itemId || !wastageData.qty || !wastageData.reason.trim()) {
      toast({ title: "Please fill all wastage fields", variant: "destructive" });
      return;
    }
    if (!capturedPhoto) {
      toast({ title: "Please capture a photo of the wastage", variant: "destructive" });
      return;
    }
    const qty = parseFloat(wastageData.qty);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "Please enter a valid quantity", variant: "destructive" });
      return;
    }

    const blob = await (await fetch(capturedPhoto)).blob();
    const formData = new FormData();
    formData.append('photo', blob, 'wastage.jpg');
    formData.append('itemId', wastageData.itemId);
    formData.append('qty', qty.toString());
    formData.append('unit', wastageData.unit);
    formData.append('reason', wastageData.reason.trim());

    createWastageMutation.mutate(formData);
  };

  const pendingOrders = Array.isArray(kotOrders) ? (kotOrders as KotOrder[]).filter((order: KotOrder) => 
    order.items?.some((item: KotItem) => item.status === 'pending')
  ) : [];
  
  const approvedOrders = Array.isArray(kotOrders) ? (kotOrders as KotOrder[]).filter((order: KotOrder) => 
    order.items?.some((item: KotItem) => item.status === 'approved')
  ) : [];
  
  const readyOrders = Array.isArray(kotOrders) ? (kotOrders as KotOrder[]).filter((order: KotOrder) => 
    order.items?.every((item: KotItem) => item.status === 'ready')
  ) : [];
  
  const declinedOrders = Array.isArray(kotOrders) ? (kotOrders as KotOrder[]).filter((order: KotOrder) => 
    order.items?.some((item: KotItem) => item.status === 'declined')
  ) : [];

  const getTableNumber = (tableId: string) => {
    if (!Array.isArray(tables)) return tableId;
    const table = (tables as RestaurantTable[]).find((t: RestaurantTable) => t.id === tableId);
    return table?.name || tableId;
  };

  const renderKotCard = (order: KotOrder) => (
    <Card key={order.id}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{getTableNumber(order.tableId)}</span>
          <span className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {order.items?.map((item: KotItem) => (
          <div key={item.id} className="mb-4 p-3 border rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{item.menuItem?.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                {item.notes && <p className="text-sm text-gray-500">Notes: {item.notes}</p>}
                {item.declineReason && (
                  <p className="text-sm text-red-600">Declined: {item.declineReason}</p>
                )}
              </div>
              <Badge variant={
                item.status === 'approved' ? 'default' :
                item.status === 'ready' ? 'default' :
                item.status === 'declined' ? 'destructive' : 'secondary'
              }>
                {item.status}
              </Badge>
            </div>
            {item.status === 'pending' && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(item)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDecline(item)}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Decline
                </Button>
              </div>
            )}
            {item.status === 'approved' && (
              <Button
                size="sm"
                onClick={() => handleSetReady(item)}
                className="w-full mt-2"
              >
                <Clock className="w-4 h-4 mr-1" /> Set Ready
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Bartender Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pending Orders"
            value={pendingOrders.length}
            icon={<Clock />}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="In Preparation"
            value={approvedOrders.length}
            icon={<Wine />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Ready to Serve"
            value={readyOrders.length}
            icon={<CheckCircle />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Declined"
            value={declinedOrders.length}
            icon={<XCircle />}
            iconColor="text-red-500"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Dialog open={wastageDialogOpen} onOpenChange={setWastageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" /> Record Wastage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Wastage</DialogTitle>
                <DialogDescription>Capture photo and record inventory wastage</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Inventory Item *</Label>
                  <Select
                    value={wastageData.itemId}
                    onValueChange={(value) => {
                      const selectedInventoryItem = (inventoryItems as InventoryItem[]).find(item => item.id === value);
                      setWastageData({ 
                        ...wastageData, 
                        itemId: value,
                        unit: selectedInventoryItem?.unit || 'piece'
                      });
                    }}
                  >
                    <SelectTrigger data-testid="select-wastage-item">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(inventoryItems) && (inventoryItems as InventoryItem[]).map((item: InventoryItem) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity *</Label>
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
                  <Label>Reason *</Label>
                  <Textarea
                    value={wastageData.reason}
                    onChange={(e) => setWastageData({ ...wastageData, reason: e.target.value })}
                    placeholder="Explain reason for wastage"
                    data-testid="input-wastage-reason"
                  />
                </div>
                <div>
                  <Label>Photo Evidence * (Required)</Label>
                  {!capturedPhoto ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden bg-black">
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          screenshotFormat="image/jpeg"
                          className="w-full"
                          videoConstraints={{
                            facingMode: "environment"
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={capturePhoto}
                        className="w-full"
                        variant="secondary"
                        data-testid="button-capture-photo"
                      >
                        <Camera className="w-4 h-4 mr-2" /> Capture Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img src={capturedPhoto} alt="Captured wastage" className="w-full" />
                      </div>
                      <Button
                        type="button"
                        onClick={retakePhoto}
                        className="w-full"
                        variant="outline"
                        data-testid="button-retake-photo"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Retake Photo
                      </Button>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={submitWastage} 
                  className="w-full" 
                  disabled={createWastageMutation.isPending}
                  data-testid="button-submit-wastage"
                >
                  {createWastageMutation.isPending ? "Recording..." : "Record Wastage"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wine className="h-5 w-5 text-purple-500" />
              <span>Bar Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Pending Orders ({pendingOrders.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrders.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4">No pending orders</p>
                  ) : (
                    pendingOrders.map(renderKotCard)
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">In Preparation ({approvedOrders.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedOrders.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4">No orders in preparation</p>
                  ) : (
                    approvedOrders.map(renderKotCard)
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Ready ({readyOrders.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readyOrders.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4">No ready orders</p>
                  ) : (
                    readyOrders.map(renderKotCard)
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Declined ({declinedOrders.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {declinedOrders.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-4">No declined orders</p>
                  ) : (
                    declinedOrders.map(renderKotCard)
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline KOT Item</DialogTitle>
            <DialogDescription>Please provide a reason for declining this item</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Decline</Label>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Out of stock, Equipment issue"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDeclineDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={submitDecline} className="flex-1" variant="destructive" disabled={updateKotItemMutation.isPending}>
                Decline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
