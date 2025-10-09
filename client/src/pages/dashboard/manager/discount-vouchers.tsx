import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Edit, Ticket, Clock, Users, Percent } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface Voucher {
  id: string;
  hotelId: string;
  code: string;
  discountAmount: string;
  discountType: string;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  createdBy: string;
  createdAt: string;
}

export default function DiscountVouchers() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxUses, setMaxUses] = useState("");

  const queryClient = useQueryClient();

  // Get current user and hotel info
  const { data: currentUser, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await fetch("/api/user", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    refetchInterval: 3000
  });

  // Fetch vouchers for this hotel
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery<Voucher[]>({
    queryKey: ["/api/hotels/current/vouchers"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/vouchers", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch vouchers");
      return response.json();
    },
    refetchInterval: 3000
  });

  // Create voucher mutation
  const createVoucher = useMutation({
    mutationFn: async (voucherData: any) => {
      if (!currentUser?.hotelId || !currentUser?.id) {
        throw new Error("User information not available");
      }
      
      const response = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(voucherData)
      });
      if (!response.ok) throw new Error("Failed to create voucher");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vouchers"] });
      toast.success("Voucher created successfully");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create voucher");
    }
  });

  // Update voucher mutation
  const updateVoucher = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update voucher");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vouchers"] });
      toast.success("Voucher updated successfully");
      setEditingVoucher(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update voucher");
    }
  });

  // Delete voucher mutation
  const deleteVoucher = useMutation({
    mutationFn: async (voucherId: string) => {
      const response = await fetch(`/api/vouchers/${voucherId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to delete voucher");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vouchers"] });
      toast.success("Voucher deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete voucher");
    }
  });

  const resetForm = () => {
    setCode("");
    setDiscountAmount("");
    setDiscountType("");
    setValidFrom("");
    setValidUntil("");
    setMaxUses("");
    setShowCreateForm(false);
    setEditingVoucher(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.hotelId || !currentUser?.id) {
      toast.error("Please wait for user information to load");
      return;
    }
    
    if (!code || !discountAmount || !discountType || !validFrom || !validUntil || !maxUses) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isNaN(Number(discountAmount)) || Number(discountAmount) <= 0) {
      toast.error("Please enter a valid discount amount");
      return;
    }

    if (isNaN(Number(maxUses)) || Number(maxUses) <= 0) {
      toast.error("Please enter a valid maximum uses");
      return;
    }

    const voucherData = {
      code: code.toUpperCase(),
      discountAmount: Number(discountAmount).toFixed(2),
      discountType,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
      maxUses: Number(maxUses)
    };

    if (editingVoucher) {
      updateVoucher.mutate({ id: editingVoucher.id, data: voucherData });
    } else {
      createVoucher.mutate(voucherData);
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setCode(voucher.code);
    setDiscountAmount(voucher.discountAmount);
    setDiscountType(voucher.discountType);
    setValidFrom(new Date(voucher.validFrom).toISOString().split('T')[0]);
    setValidUntil(new Date(voucher.validUntil).toISOString().split('T')[0]);
    setMaxUses(voucher.maxUses.toString());
    setShowCreateForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (voucher: Voucher) => {
    const now = new Date();
    const validFrom = new Date(voucher.validFrom);
    const validUntil = new Date(voucher.validUntil);
    
    if (now < validFrom) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (voucher.usedCount >= voucher.maxUses) {
      return <Badge variant="secondary">Exhausted</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  const getDiscountDisplay = (voucher: Voucher) => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountAmount}%`;
    } else {
      return `NPR ${Number(voucher.discountAmount).toLocaleString()}`;
    }
  };

  const activeVouchers = vouchers.filter(v => {
    const now = new Date();
    const validFrom = new Date(v.validFrom);
    const validUntil = new Date(v.validUntil);
    return now >= validFrom && now <= validUntil && v.usedCount < v.maxUses;
  });

  const totalUsages = vouchers.reduce((sum, v) => sum + v.usedCount, 0);

  if (userLoading || vouchersLoading) {
    return (
      <DashboardLayout title="Discount Vouchers">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Discount Vouchers">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discount Vouchers</h1>
          <p className="text-gray-600 mt-1">Create and manage discount vouchers for your customers</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Voucher
        </Button>
      </div>

      {/* Voucher Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchers.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vouchers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVouchers.length}</div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsages}</div>
            <p className="text-xs text-muted-foreground">Times redeemed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Usage Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.length > 0 ? 
                Math.round((totalUsages / vouchers.reduce((sum, v) => sum + v.maxUses, 0)) * 100) : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">Average redemption</p>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Voucher Form */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? "Edit Voucher" : "Create New Voucher"}</DialogTitle>
            <DialogDescription>
              {editingVoucher ? "Update voucher details" : "Create a new discount voucher for customers"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Voucher Code *</Label>
              <Input
                id="code"
                placeholder="e.g., WELCOME10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountAmount">
                  Amount * {discountType === "percentage" ? "(%)" : "(NPR)"}
                </Label>
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  placeholder={discountType === "percentage" ? "10" : "100"}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Maximum Uses *</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="100"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={createVoucher.isPending || updateVoucher.isPending}
                className="flex-1"
              >
                {createVoucher.isPending || updateVoucher.isPending 
                  ? (editingVoucher ? "Updating..." : "Creating...") 
                  : (editingVoucher ? "Update Voucher" : "Create Voucher")
                }
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vouchers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Vouchers</CardTitle>
          <CardDescription>Manage your discount vouchers and track usage</CardDescription>
        </CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vouchers created yet</p>
              <p className="text-sm">Create your first discount voucher to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <div 
                  key={voucher.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{voucher.code}</h3>
                      {getStatusBadge(voucher)}
                      <span className="font-bold text-green-600">
                        {getDiscountDisplay(voucher)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Valid: </span>
                        {formatDate(voucher.validFrom)} - {formatDate(voucher.validUntil)}
                      </div>
                      <div>
                        <span className="font-medium">Usage: </span>
                        {voucher.usedCount}/{voucher.maxUses}
                      </div>
                      <div>
                        <span className="font-medium">Remaining: </span>
                        {voucher.maxUses - voucher.usedCount}
                      </div>
                      <div>
                        <span className="font-medium">Created: </span>
                        {formatDate(voucher.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(voucher)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVoucher.mutate(voucher.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={deleteVoucher.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}