import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

interface LeavePolicy {
  id: string;
  hotelId: string;
  leaveType: string;
  displayName: string;
  defaultDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LeavePoliciesPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "",
    displayName: "",
    defaultDays: 0,
    isActive: true
  });

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"],
    refetchInterval: 3000
  });

  const { data: policies = [], isLoading } = useQuery<LeavePolicy[]>({
    queryKey: ["/api/hotels/current/leave-policies"],
    refetchInterval: 3000
  });

  // Real-time updates for leave policy changes
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/leave-policies"],
    refetchInterval: 3000,
    events: ['leave-policy:created', 'leave-policy:updated', 'leave-policy:deleted']
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/hotels/current/leave-policies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-policies"] });
      toast({ title: "Success", description: "Leave policy created successfully" });
      setIsCreating(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create leave policy", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/leave-policies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-policies"] });
      toast({ title: "Success", description: "Leave policy updated successfully" });
      setEditingId(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update leave policy", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/leave-policies/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/leave-policies"] });
      toast({ title: "Success", description: "Leave policy deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete leave policy", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      leaveType: "",
      displayName: "",
      defaultDays: 0,
      isActive: true
    });
  };

  const handleCreate = () => {
    if (!formData.leaveType || !formData.displayName || formData.defaultDays <= 0) {
      toast({ title: "Validation Error", description: "Please fill all fields correctly", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: string) => {
    if (!formData.displayName || formData.defaultDays <= 0) {
      toast({ title: "Validation Error", description: "Please fill all fields correctly", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ 
      id, 
      data: {
        displayName: formData.displayName,
        defaultDays: formData.defaultDays,
        isActive: formData.isActive
      }
    });
  };

  const startEdit = (policy: LeavePolicy) => {
    setEditingId(policy.id);
    setFormData({
      leaveType: policy.leaveType,
      displayName: policy.displayName,
      defaultDays: policy.defaultDays,
      isActive: policy.isActive
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Leave Policies" currentHotel={hotel?.name}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading leave policies...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Leave Policies" currentHotel={hotel?.name}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Policy Configuration</CardTitle>
                <CardDescription>
                  Configure annual leave days for different leave types. These settings will apply to all staff members.
                </CardDescription>
              </div>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)} data-testid="button-add-policy">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leave Policy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isCreating && (
                <Card className="border-2 border-primary">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-leave-type">Leave Type</Label>
                        <Input
                          id="new-leave-type"
                          placeholder="e.g., sick, vacation"
                          value={formData.leaveType}
                          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value.toLowerCase() })}
                          data-testid="input-leave-type"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-display-name">Display Name</Label>
                        <Input
                          id="new-display-name"
                          placeholder="e.g., Sick Leave"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          data-testid="input-display-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-default-days">Annual Days</Label>
                        <Input
                          id="new-default-days"
                          type="number"
                          min="0"
                          placeholder="e.g., 15"
                          value={formData.defaultDays || ""}
                          onChange={(e) => setFormData({ ...formData, defaultDays: parseInt(e.target.value) || 0 })}
                          data-testid="input-default-days"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button 
                          onClick={handleCreate} 
                          disabled={createMutation.isPending}
                          data-testid="button-save-new-policy"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={cancelEdit} data-testid="button-cancel-new">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {policies.length === 0 && !isCreating ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No leave policies configured yet.</p>
                  <p className="text-sm">Click "Add Leave Policy" to create your first policy.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <Card key={policy.id} className={editingId === policy.id ? "border-2 border-primary" : ""}>
                      <CardContent className="pt-6">
                        {editingId === policy.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Leave Type</Label>
                              <Input value={policy.leaveType} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-display-name-${policy.id}`}>Display Name</Label>
                              <Input
                                id={`edit-display-name-${policy.id}`}
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                data-testid={`input-edit-display-name-${policy.id}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-default-days-${policy.id}`}>Annual Days</Label>
                              <Input
                                id={`edit-default-days-${policy.id}`}
                                type="number"
                                min="0"
                                value={formData.defaultDays || ""}
                                onChange={(e) => setFormData({ ...formData, defaultDays: parseInt(e.target.value) || 0 })}
                                data-testid={`input-edit-days-${policy.id}`}
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <Button 
                                onClick={() => handleUpdate(policy.id)} 
                                disabled={updateMutation.isPending}
                                data-testid={`button-save-${policy.id}`}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={cancelEdit} data-testid={`button-cancel-${policy.id}`}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                                <p className="font-medium" data-testid={`text-leave-type-${policy.id}`}>{policy.leaveType}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                                <p className="font-medium" data-testid={`text-display-name-${policy.id}`}>{policy.displayName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Annual Days</p>
                                <p className="font-medium" data-testid={`text-days-${policy.id}`}>{policy.defaultDays} days</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={policy.isActive}
                                    onCheckedChange={(checked) => {
                                      updateMutation.mutate({ 
                                        id: policy.id, 
                                        data: { isActive: checked }
                                      });
                                    }}
                                    data-testid={`switch-active-${policy.id}`}
                                  />
                                  <span className="text-sm" data-testid={`text-status-${policy.id}`}>
                                    {policy.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => startEdit(policy)}
                                data-testid={`button-edit-${policy.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={async () => {
                                  await confirm({
                                    title: "Delete Leave Policy",
                                    description: "Are you sure you want to delete this leave policy?",
                                    confirmText: "Delete",
                                    cancelText: "Cancel",
                                    variant: "destructive",
                                    onConfirm: () => {
                                      deleteMutation.mutate(policy.id);
                                    }
                                  });
                                }}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-${policy.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Leave Policies Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• <strong>Leave Type:</strong> A unique identifier for the leave category (e.g., sick, vacation, personal)</p>
            <p>• <strong>Display Name:</strong> The user-friendly name shown to staff (e.g., "Sick Leave", "Annual Vacation")</p>
            <p>• <strong>Annual Days:</strong> The number of leave days allocated to each staff member per year</p>
            <p>• <strong>Status:</strong> Active policies are available for staff to use; inactive policies are hidden</p>
            <p>• Leave balances are automatically initialized for all active staff members at the beginning of each year</p>
            <p>• Changes to leave policies will apply to new leave balance allocations in future years</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
