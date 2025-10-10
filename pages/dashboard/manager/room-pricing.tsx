import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Edit, Check, X } from "lucide-react";
import { toast } from "sonner";

interface RoomType {
  id: number;
  hotelId: string;
  name: string;
  description?: string;
  priceInhouse?: string;
  priceWalkin?: string;
}

export default function RoomPricingPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [priceInhouse, setPriceInhouse] = useState("");
  const [priceWalkin, setPriceWalkin] = useState("");

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/hotels/current/room-types", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data);
      } else {
        toast.error("Failed to fetch room types");
      }
    } catch (error) {
      toast.error("Failed to fetch room types");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPricing = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setPriceInhouse(roomType.priceInhouse || "");
    setPriceWalkin(roomType.priceWalkin || "");
    setShowEditDialog(true);
  };

  const handleSavePricing = async () => {
    if (!editingRoomType) return;

    if (!priceInhouse || !priceWalkin) {
      toast.error("Both in-house and walk-in prices are required");
      return;
    }

    if (isNaN(Number(priceInhouse)) || Number(priceInhouse) < 0) {
      toast.error("Please enter a valid in-house price");
      return;
    }

    if (isNaN(Number(priceWalkin)) || Number(priceWalkin) < 0) {
      toast.error("Please enter a valid walk-in price");
      return;
    }

    try {
      const response = await fetch(`/api/room-types/${editingRoomType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editingRoomType.name,
          description: editingRoomType.description,
          priceInhouse: Number(priceInhouse).toFixed(2),
          priceWalkin: Number(priceWalkin).toFixed(2)
        })
      });

      if (response.ok) {
        toast.success("Room pricing updated successfully");
        fetchRoomTypes();
        resetForm();
      } else {
        toast.error("Failed to update room pricing");
      }
    } catch (error) {
      toast.error("Failed to update room pricing");
    }
  };

  const resetForm = () => {
    setEditingRoomType(null);
    setPriceInhouse("");
    setPriceWalkin("");
    setShowEditDialog(false);
  };

  const formatPrice = (price?: string) => {
    if (!price) return "Not set";
    return `NPR ${Number(price).toLocaleString()}`;
  };

  const hasPricing = (roomType: RoomType) => {
    return roomType.priceInhouse && roomType.priceWalkin;
  };

  if (loading) {
    return (
      <DashboardLayout title="Room Pricing">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading room types...</div>
        </div>
      </DashboardLayout>
    );
  }

  const roomTypesWithPricing = roomTypes.filter(rt => hasPricing(rt));
  const roomTypesWithoutPricing = roomTypes.filter(rt => !hasPricing(rt));

  return (
    <DashboardLayout title="Room Pricing">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Room Pricing Management</h1>
          <p className="text-muted-foreground mt-2">
            Set prices for different room types with separate rates for in-house guests and walk-in customers.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{roomTypes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Room Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{roomTypesWithPricing.length}</p>
                  <p className="text-sm text-muted-foreground">Priced Room Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <X className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{roomTypesWithoutPricing.length}</p>
                  <p className="text-sm text-muted-foreground">Unpriced Room Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Types Pricing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Room Type Pricing</CardTitle>
            <CardDescription>
              Configure daily rates for each room type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roomTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No room types found</p>
                <p className="text-sm">Create room types in the Room Setup page first</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>In-House Price</TableHead>
                    <TableHead>Walk-in Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomTypes.map((roomType) => (
                    <TableRow key={roomType.id}>
                      <TableCell className="font-medium">{roomType.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {roomType.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <span className={!roomType.priceInhouse ? "text-muted-foreground italic" : ""}>
                          {formatPrice(roomType.priceInhouse)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={!roomType.priceWalkin ? "text-muted-foreground italic" : ""}>
                          {formatPrice(roomType.priceWalkin)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {hasPricing(roomType) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Priced
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <X className="h-3 w-3 mr-1" />
                            Not Set
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPricing(roomType)}
                          data-testid={`button-edit-pricing-${roomType.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {hasPricing(roomType) ? "Edit" : "Set"} Price
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Pricing Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRoomType ? `Set Pricing for ${editingRoomType.name}` : "Set Room Pricing"}
              </DialogTitle>
              <DialogDescription>
                Configure daily rates for in-house guests and walk-in customers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price-inhouse">In-House Price (NPR) *</Label>
                <Input
                  id="price-inhouse"
                  type="number"
                  step="0.01"
                  placeholder="2500.00"
                  value={priceInhouse}
                  onChange={(e) => setPriceInhouse(e.target.value)}
                  data-testid="input-price-inhouse"
                />
                <p className="text-xs text-muted-foreground">
                  Price per night for hotel guests
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price-walkin">Walk-in Price (NPR) *</Label>
                <Input
                  id="price-walkin"
                  type="number"
                  step="0.01"
                  placeholder="3500.00"
                  value={priceWalkin}
                  onChange={(e) => setPriceWalkin(e.target.value)}
                  data-testid="input-price-walkin"
                />
                <p className="text-xs text-muted-foreground">
                  Price per night for external customers
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSavePricing} className="flex-1" data-testid="button-save-pricing">
                  Save Pricing
                </Button>
                <Button variant="outline" onClick={resetForm} data-testid="button-cancel-pricing">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
