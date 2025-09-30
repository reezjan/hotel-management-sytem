import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Users, CheckCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function DutyTracking() {
  const queryClient = useQueryClient();

  // Fetch restaurant staff
  const { data: allStaff = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    }
  });

  // Filter for restaurant staff only
  const restaurantStaff = allStaff.filter(staff => 
    ['waiter', 'kitchen_staff', 'bartender', 'barista', 'cashier'].includes(staff.role?.name || '')
  );

  // Toggle duty status mutation
  const toggleDutyMutation = useMutation({
    mutationFn: async ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      const response = await fetch(`/api/hotels/current/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isOnline })
      });
      if (!response.ok) throw new Error("Failed to update duty status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/users"] });
      toast.success("Duty status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleToggleDuty = (staff: any) => {
    toggleDutyMutation.mutate({
      userId: staff.id,
      isOnline: !staff.isOnline
    });
  };

  const columns = [
    { key: "username", label: "Staff Name", sortable: true },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (value: any) => value?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    },
    { 
      key: "isOnline", 
      label: "Duty Status", 
      render: (value: boolean, row: any) => (
        <div className="flex items-center space-x-3">
          <Switch
            checked={value}
            onCheckedChange={() => handleToggleDuty(row)}
            disabled={toggleDutyMutation.isPending}
          />
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? 'On Duty' : 'Off Duty'}
          </span>
        </div>
      )
    },
    { 
      key: "lastLogin", 
      label: "Last Active", 
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }) : 'Never'
    }
  ];

  const onDutyStaff = restaurantStaff.filter(s => s.isOnline);
  const offDutyStaff = restaurantStaff.filter(s => !s.isOnline);

  return (
    <DashboardLayout title="Restaurant Duty Tracking">
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
                  <p className="text-2xl font-bold">{onDutyStaff.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Off Duty</p>
                  <p className="text-2xl font-bold">{offDutyStaff.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duty Coverage</p>
                  <p className="text-2xl font-bold">
                    {restaurantStaff.length > 0 ? Math.round((onDutyStaff.length / restaurantStaff.length) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Duty Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  restaurantStaff.forEach(staff => {
                    if (!staff.isOnline) {
                      handleToggleDuty(staff);
                    }
                  });
                }}
                disabled={toggleDutyMutation.isPending}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark All On Duty
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  restaurantStaff.forEach(staff => {
                    if (staff.isOnline) {
                      handleToggleDuty(staff);
                    }
                  });
                }}
                disabled={toggleDutyMutation.isPending}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark All Off Duty
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Duty Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Waiters</span>
                  <span className="font-medium">
                    {restaurantStaff.filter(s => s.role?.name === 'waiter' && s.isOnline).length} / {restaurantStaff.filter(s => s.role?.name === 'waiter').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Kitchen Staff</span>
                  <span className="font-medium">
                    {restaurantStaff.filter(s => s.role?.name === 'kitchen_staff' && s.isOnline).length} / {restaurantStaff.filter(s => s.role?.name === 'kitchen_staff').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bartenders</span>
                  <span className="font-medium">
                    {restaurantStaff.filter(s => s.role?.name === 'bartender' && s.isOnline).length} / {restaurantStaff.filter(s => s.role?.name === 'bartender').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Baristas</span>
                  <span className="font-medium">
                    {restaurantStaff.filter(s => s.role?.name === 'barista' && s.isOnline).length} / {restaurantStaff.filter(s => s.role?.name === 'barista').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cashiers</span>
                  <span className="font-medium">
                    {restaurantStaff.filter(s => s.role?.name === 'cashier' && s.isOnline).length} / {restaurantStaff.filter(s => s.role?.name === 'cashier').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Duty Table */}
        <DataTable
          title="Restaurant Staff Duty Status"
          data={restaurantStaff}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search staff..."
        />
      </div>
    </DashboardLayout>
  );
}