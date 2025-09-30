import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function StaffManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: ""
  });

  const queryClient = useQueryClient();

  // Fetch current staff
  const { data: staff = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/users", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      return response.json();
    }
  });

  // Fetch available roles that manager can create
  const { data: allRoles = [] } = useQuery<any[]>({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const response = await fetch("/api/roles", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      return response.json();
    }
  });

  // Roles that a manager can create
  const managerCanCreate = ["housekeeping_supervisor", "restaurant_bar_manager", "security_head", "finance", "front_desk"];
  const availableRoles = allRoles.filter((role: any) => managerCanCreate.includes(role.name));

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(staffData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create staff member");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      setIsAddDialogOpen(false);
      setNewStaff({ username: "", email: "", phone: "", password: "", role: "" });
      toast.success("Staff member created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create staff member");
    }
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/users/${staffId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to delete staff member");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      toast.success("Staff member removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove staff member");
    }
  });

  const handleCreateStaff = () => {
    if (!newStaff.username || !newStaff.password || !newStaff.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedRole = availableRoles.find((r: any) => r.name === newStaff.role);
    if (!selectedRole) {
      toast.error("Invalid role selected");
      return;
    }

    createStaffMutation.mutate({
      ...newStaff,
      roleId: selectedRole.id,
      verification: {}
    });
  };

  const handleDeleteStaff = (staffMember: any) => {
    if (window.confirm(`Are you sure you want to remove ${staffMember.username}?`)) {
      deleteStaffMutation.mutate(staffMember.id);
    }
  };

  const staffColumns = [
    { key: "username", label: "Username", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (value: any) => value?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Unknown"
    },
    { 
      key: "isOnline", 
      label: "Status", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Online' : 'Offline'}
        </span>
      )
    },
    { key: "createdAt", label: "Hired", sortable: true, render: (value: string) => new Date(value).toLocaleDateString() }
  ];

  const staffActions = [
    { 
      label: "Remove", 
      action: handleDeleteStaff, 
      variant: "destructive" as const,
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  return (
    <DashboardLayout title="Staff Management">
      <div className="space-y-6">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Staff Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{staff.length}</div>
                <div className="text-sm text-blue-600">Total Staff</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{staff.filter((s: any) => s.isOnline).length}</div>
                <div className="text-sm text-green-600">Online Now</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{availableRoles.length}</div>
                <div className="text-sm text-orange-600">Available Roles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <DataTable
          title="Staff Members"
          data={staff as any[]}
          columns={staffColumns}
          actions={staffActions}
          onAdd={() => setIsAddDialogOpen(true)}
          addButtonLabel="Add Staff Member"
          searchPlaceholder="Search staff..."
          isLoading={isLoading}
        />

        {/* Add Staff Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Staff Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={newStaff.role} onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role: any) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateStaff}
                  disabled={createStaffMutation.isPending}
                >
                  {createStaffMutation.isPending ? "Creating..." : "Create Staff Member"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}