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
import { Switch } from "@/components/ui/switch";
import { Users, UserPlus, ChefHat, Coffee } from "lucide-react";
import { toast } from "sonner";

export default function RestaurantStaffManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    username: "",
    email: "",
    phone: "",
    fullName: "",
    address: "",
    password: "",
    role: ""
  });

  const queryClient = useQueryClient();

  // Fetch restaurant staff
  const { data: allStaff = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  // Filter for restaurant staff only
  const restaurantStaff = allStaff.filter(staff => 
    ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'].includes(staff.role?.name || '')
  );

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  // Restaurant roles that manager can create
  const restaurantRoles = [
    { name: "waiter", label: "Waiter" },
    { name: "kitchen_staff", label: "Kitchen Staff" },
    { name: "bartender", label: "Bartender" },
    { name: "barista", label: "Barista" },
    { name: "cashier", label: "Cashier" }
  ];

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      const response = await fetch("/api/hotels/current/users", {
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
      setNewStaff({ username: "", email: "", phone: "", fullName: "", address: "", password: "", role: "" });
      toast.success("Restaurant staff member created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleAddStaff = () => {
    if (!newStaff.username || !newStaff.email || !newStaff.password || !newStaff.role || !newStaff.phone || !newStaff.fullName || !newStaff.address) {
      toast.error("Please fill in all required fields (username, email, password, role, phone, full name, and address)");
      return;
    }

    createStaffMutation.mutate({
      ...newStaff,
      confirmPassword: newStaff.password
    });
  };


  const handleDeleteStaff = async (staff: any) => {
    if (confirm(`Are you sure you want to remove ${staff.username}?`)) {
      try {
        const response = await fetch(`/api/hotels/current/users/${staff.id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error("Failed to delete staff member");
        }
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
        toast.success("Staff member removed successfully");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const columns = [
    { key: "username", label: "Name", sortable: true },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          {value?.name === 'waiter' && <Users className="h-4 w-4 text-blue-500" />}
          {value?.name === 'kitchen_staff' && <ChefHat className="h-4 w-4 text-green-500" />}
          {value?.name === 'bartender' && <Coffee className="h-4 w-4 text-purple-500" />}
          {value?.name === 'barista' && <Coffee className="h-4 w-4 text-orange-500" />}
          {value?.name === 'cashier' && <Users className="h-4 w-4 text-red-500" />}
          <span>{value?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
        </div>
      )
    },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { 
      key: "id", 
      label: "Duty Status", 
      render: (userId: string) => {
        const isOnDuty = dailyAttendance.some(a => a.userId === userId && a.status === 'active');
        return (
          <span className={`px-3 py-1 rounded-full text-xs ${isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {isOnDuty ? 'On Duty' : 'Off Duty'}
          </span>
        );
      }
    },
    { 
      key: "lastLogin", 
      label: "Last Active", 
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }) : 'Never'
    }
  ];

  const actions = [
    { 
      label: "Remove", 
      action: handleDeleteStaff, 
      variant: "destructive" as const 
    }
  ];

  return (
    <DashboardLayout title="Restaurant Staff Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{restaurantStaff.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On Duty</p>
                  <p className="text-2xl font-bold">{restaurantStaff.filter(s => dailyAttendance.some(a => a.userId === s.id && a.status === 'active')).length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Kitchen Staff</p>
                  <p className="text-2xl font-bold">
                    {restaurantStaff.filter(s => ['kitchen_staff', 'barista'].includes(s.role?.name || '')).length}
                  </p>
                </div>
                <ChefHat className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service Staff</p>
                  <p className="text-2xl font-bold">
                    {restaurantStaff.filter(s => ['waiter', 'bartender', 'cashier'].includes(s.role?.name || '')).length}
                  </p>
                </div>
                <Coffee className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <DataTable
          title="Restaurant Staff"
          data={restaurantStaff}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          onAdd={() => setIsAddDialogOpen(true)}
          addButtonLabel="Add Staff Member"
          searchPlaceholder="Search restaurant staff..."
        />

        {/* Add Staff Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Restaurant Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={newStaff.address}
                  onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                  placeholder="Enter address"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurantRoles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddStaff}
                  disabled={createStaffMutation.isPending}
                >
                  {createStaffMutation.isPending ? "Creating..." : "Create Staff"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}