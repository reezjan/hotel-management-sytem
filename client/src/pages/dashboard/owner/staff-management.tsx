import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, UserX, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

// Define the staff creation schema
const staffSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number must be less than 20 characters"),
  address: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type StaffFormData = z.infer<typeof staffSchema>;

// Owner can create these roles
const OWNER_CREATABLE_ROLES = [
  { value: 'manager', label: 'Manager' },
  { value: 'housekeeping_supervisor', label: 'Housekeeping Supervisor' },
  { value: 'restaurant_bar_manager', label: 'Restaurant & Bar Manager' },
  { value: 'security_head', label: 'Security Head' },
  { value: 'finance', label: 'Finance' }
];

export default function StaffManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  const { data: roles = [] } = useQuery<any[]>({
    queryKey: ["/api/roles"],
    refetchInterval: 3000
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  // Real-time updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000,
    events: ['user:created', 'user:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000,
    events: ['attendance:updated']
  });

  // Form for staff creation
  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      role: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Form for staff editing
  const editForm = useForm<Omit<StaffFormData, 'password' | 'confirmPassword'>>({
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      role: ""
    }
  });

  // Update edit form when selectedStaff changes
  useEffect(() => {
    if (selectedStaff && isEditModalOpen) {
      editForm.reset({
        username: selectedStaff.username || "",
        email: selectedStaff.email || "",
        firstName: selectedStaff.firstName || "",
        lastName: selectedStaff.lastName || "",
        phone: selectedStaff.phone || "",
        address: selectedStaff.address || "",
        role: selectedStaff.role?.name || ""
      });
    }
  }, [selectedStaff, isEditModalOpen, editForm]);

  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const { confirmPassword, ...staffData } = data;
      const res = await apiRequest("POST", "/api/users", staffData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      toast({
        title: "Staff Member Created Successfully",
        description: "The new staff account has been created and can now access the system.",
      });
      form.reset();
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Staff Member",
        description: error.message || "Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to delete staff member" }));
        throw new Error(error.message);
      }
      // 204 No Content - don't try to parse JSON
      if (response.status === 204) {
        return null;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      toast({
        title: "Success",
        description: "Staff member removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove staff member",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      toast({
        title: "Success",
        description: "Staff status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update staff status",
        variant: "destructive",
      });
    },
  });

  const editStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert role name to roleId
      const role = roles.find(r => r.name === data.role);
      if (!role) {
        throw new Error("Invalid role selected");
      }
      
      const { role: _, ...updateData } = data;
      const payload = {
        ...updateData,
        roleId: role.id,
        hotelId: user?.hotelId
      };
      
      const response = await fetch(`/api/users/${selectedStaff?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update staff member");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      editForm.reset();
      setIsEditModalOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  // Calculate staff metrics
  const totalStaff = staff.length;
  const onlineStaff = staff.filter(s => dailyAttendance.some(a => a.userId === s.id && a.status === 'active')).length;
  const offlineStaff = totalStaff - onlineStaff;
  const activeStaff = staff.filter(s => s.isActive).length;

  // Group staff by role
  const staffByRole = staff.reduce((acc, member) => {
    const roleName = member.role?.name || 'unknown';
    if (!acc[roleName]) acc[roleName] = [];
    acc[roleName].push(member);
    return acc;
  }, {} as Record<string, any[]>);

  const staffColumns = [
    { key: "username", label: "Username", sortable: true },
    { 
      key: "fullName", 
      label: "Name", 
      sortable: true,
      render: (value: any, row: any) => {
        // Use fullName if available, otherwise combine firstName and lastName
        if (value) return value;
        if (row.firstName || row.lastName) {
          return `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-';
        }
        return '-';
      }
    },
    { 
      key: "role", 
      label: "Role", 
      sortable: true, 
      render: (value: any) => (
        <Badge variant="outline">
          {value?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'No Role'}
        </Badge>
      )
    },
    { 
      key: "address", 
      label: "Address", 
      sortable: true,
      render: (value: any) => value || '-'
    },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { 
      key: "id", 
      label: "Status", 
      render: (userId: string) => {
        const isOnDuty = dailyAttendance.some(a => a.userId === userId && a.status === 'active');
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isOnDuty ? 'On Duty' : 'Off Duty'}
          </span>
        );
      }
    },
    { 
      key: "isActive", 
      label: "Active", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Joined", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const { confirm } = useConfirmDialog();

  const staffActions = [
    { 
      label: "Edit", 
      action: (row: any) => {
        setSelectedStaff(row);
        setIsEditModalOpen(true);
      } 
    },
    { 
      label: "Toggle Status", 
      action: (row: any) => {
        const newStatus = !row.isActive;
        toggleStatusMutation.mutate({ userId: row.id, isActive: newStatus });
      } 
    },
    { 
      label: "Remove", 
      action: async (row: any) => {
        await confirm({
          title: "Remove Staff Member",
          description: `Are you sure you want to remove ${row.username}? This action cannot be undone.`,
          confirmText: "Remove",
          cancelText: "Cancel",
          variant: "destructive",
          onConfirm: () => {
            deleteStaffMutation.mutate(row.id);
          }
        });
      }, 
      variant: "destructive" as const 
    }
  ];

  return (
    <DashboardLayout title="Staff Management">
      <div className="space-y-6">
        {/* Staff Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Staff"
            value={totalStaff}
            icon={<Users />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Online Staff"
            value={onlineStaff}
            icon={<UserCheck />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Offline Staff"
            value={offlineStaff}
            icon={<UserX />}
            iconColor="text-gray-500"
          />
          <StatsCard
            title="Active Staff"
            value={activeStaff}
            icon={<UserPlus />}
            iconColor="text-purple-500"
          />
        </div>

        {/* Staff by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(staffByRole).map(([roleName, members]) => {
                const membersList = members as any[];
                return (
                  <div key={roleName} className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg capitalize">
                      {roleName.replace(/_/g, ' ')}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <div className="text-2xl font-bold text-blue-600">
                        {membersList.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {membersList.filter((m: any) => dailyAttendance.some(a => a.userId === m.id && a.status === 'active')).length} on duty
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <DataTable
          title="All Staff Members"
          data={staff}
          columns={staffColumns}
          actions={staffActions}
          onAdd={() => setIsCreateModalOpen(true)}
          addButtonLabel="Add Staff Member"
          searchPlaceholder="Search staff..."
        />

        {/* Create Staff Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Create New Staff Member</span>
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createStaffMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="staff@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {OWNER_CREATABLE_ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Account Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setIsCreateModalOpen(false);
                    }}
                    disabled={createStaffMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createStaffMutation.isPending}
                  >
                    {createStaffMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Staff Member
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Edit Staff Member</span>
              </DialogTitle>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit((data) => editStaffMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="staff@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.filter(role => role.name !== 'super_admin' && role.name !== 'owner').map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      editForm.reset();
                      setIsEditModalOpen(false);
                      setSelectedStaff(null);
                    }}
                    disabled={editStaffMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={editStaffMutation.isPending}
                  >
                    {editStaffMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Staff Member
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