import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateHotelModal } from "@/components/modals/create-hotel-modal";
import { CreateOwnerModal } from "@/components/modals/create-owner-modal";
import { Hotel, Users, Shield, TrendingUp, Plus } from "lucide-react";

export default function SuperAdminDashboard() {
  const [isCreateHotelModalOpen, setIsCreateHotelModalOpen] = useState(false);
  const [isCreateOwnerModalOpen, setIsCreateOwnerModalOpen] = useState(false);

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels"]
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/users"]
  });

  const hotelColumns = [
    { key: "name", label: "Hotel Name", sortable: true },
    { key: "address", label: "Address", sortable: true },
    { key: "vatNo", label: "VAT No", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      render: () => <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
    }
  ];

  const ownerColumns = [
    { key: "username", label: "Username", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    { 
      key: "isActive", 
      label: "Status", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const hotelActions = [
    { label: "Edit", action: (row: any) => console.log("Edit hotel:", row) },
    { label: "Delete", action: (row: any) => console.log("Delete hotel:", row), variant: "destructive" as const }
  ];

  const ownerActions = [
    { label: "Edit", action: (row: any) => console.log("Edit owner:", row) },
    { label: "Deactivate", action: (row: any) => console.log("Deactivate owner:", row), variant: "destructive" as const }
  ];

  const owners = users.filter(user => user.role?.name === 'owner');

  return (
    <DashboardLayout title="Super Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Hotels"
            value={hotels.length}
            icon={<Hotel />}
            iconColor="text-primary"
            trend={{ value: 12, label: "this month", isPositive: true }}
          />
          <StatsCard
            title="Total Owners"
            value={owners.length}
            icon={<Users />}
            iconColor="text-green-500"
            trend={{ value: 8, label: "this month", isPositive: true }}
          />
          <StatsCard
            title="Super Admins"
            value={users.filter(u => u.role?.name === 'super_admin').length}
            icon={<Shield />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="System Health"
            value="99.9%"
            icon={<TrendingUp />}
            iconColor="text-orange-500"
            trend={{ value: 0.1, label: "uptime", isPositive: true }}
          />
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded" data-testid="activity-item-hotel-created">
                <div className="flex items-center">
                  <Hotel className="text-primary mr-3 h-5 w-5" />
                  <span className="text-foreground">New hotel "Mountain View Resort" created</span>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded" data-testid="activity-item-owner-created">
                <div className="flex items-center">
                  <Users className="text-green-500 mr-3 h-5 w-5" />
                  <span className="text-foreground">Owner account created for John Smith</span>
                </div>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded" data-testid="activity-item-superadmin-login">
                <div className="flex items-center">
                  <Shield className="text-blue-500 mr-3 h-5 w-5" />
                  <span className="text-foreground">Super Admin login from new location detected</span>
                </div>
                <span className="text-xs text-muted-foreground">6 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Management */}
        <DataTable
          title="Hotel Management"
          data={hotels}
          columns={hotelColumns}
          actions={hotelActions}
          onAdd={() => setIsCreateHotelModalOpen(true)}
          addButtonLabel="Create Hotel"
          searchPlaceholder="Search hotels..."
        />

        {/* Owner Management */}
        <DataTable
          title="Owner Management"
          data={owners}
          columns={ownerColumns}
          actions={ownerActions}
          onAdd={() => setIsCreateOwnerModalOpen(true)}
          addButtonLabel="Create Owner"
          searchPlaceholder="Search owners..."
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col" 
                data-testid="button-create-hotel"
                onClick={() => setIsCreateHotelModalOpen(true)}
              >
                <Hotel className="h-6 w-6 mb-2" />
                <span className="text-sm">Create Hotel</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col" 
                data-testid="button-manage-owners"
                onClick={() => setIsCreateOwnerModalOpen(true)}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Create Owner</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-system-analytics">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">System Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-create-superadmin">
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm">Create Super Admin</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateHotelModal 
        isOpen={isCreateHotelModalOpen} 
        onClose={() => setIsCreateHotelModalOpen(false)} 
      />
      <CreateOwnerModal 
        isOpen={isCreateOwnerModalOpen} 
        onClose={() => setIsCreateOwnerModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
