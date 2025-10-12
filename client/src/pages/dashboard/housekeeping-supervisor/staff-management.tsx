import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

const staffSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function HousekeepingSupervisorStaffManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      fullName: "",
      address: "",
      password: ""
    }
  });

  const { data: allStaff = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    }
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<any[]>({
    queryKey: ["/api/roles"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/roles", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch roles");
      return response.json();
    }
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  const housekeepingStaff = allStaff.filter(s => s.role?.name === 'housekeeping_staff');
  const housekeepingStaffRole = roles.find(r => r.name === 'housekeeping_staff');

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
      form.reset();
      toast({ title: "Staff member created successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/users/${staffId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to delete staff member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      toast({ title: "Staff member removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const handleCreateStaff = (data: any) => {
    if (!housekeepingStaffRole) {
      toast({ title: "Housekeeping staff role not found", variant: "destructive" });
      return;
    }

    createStaffMutation.mutate({
      ...data,
      roleId: housekeepingStaffRole.id,
      hotelId: user?.hotelId
    });
  };

  const handleDeleteStaff = async (staffId: string) => {
    await confirm({
      title: "Remove Staff Member",
      description: "Are you sure you want to remove this staff member?",
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        deleteStaffMutation.mutate(staffId);
      }
    });
  };

  const staffColumns = [
    { key: "fullName", label: "Name", sortable: true },
    { key: "username", label: "Username", sortable: true },
    { key: "address", label: "Address", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { 
      key: "id", 
      label: "Status", 
      render: (userId: string) => {
        const isOnDuty = dailyAttendance.some(a => a.userId === userId && a.status === 'active');
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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

  const staffActions = [
    { 
      label: "Remove", 
      action: (row: any) => handleDeleteStaff(row.id), 
      variant: "destructive" as const
    }
  ];

  return (
    <DashboardLayout title="Housekeeping Staff Management">
      <DataTable
        title="Housekeeping Staff"
        data={housekeepingStaff}
        columns={staffColumns}
        actions={staffActions}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Add Staff Member"
        searchPlaceholder="Search staff..."
        isLoading={isLoading}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateStaff)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-username" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-phone" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-fullname" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-address" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" data-testid="input-email" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" data-testid="input-password" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createStaffMutation.isPending || rolesLoading || !housekeepingStaffRole} 
                  data-testid="button-submit"
                >
                  {createStaffMutation.isPending ? "Creating..." : rolesLoading ? "Loading..." : !housekeepingStaffRole ? "Role Not Found" : "Create Staff"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
