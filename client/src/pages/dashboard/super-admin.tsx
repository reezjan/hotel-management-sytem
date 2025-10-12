import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateHotelModal } from "@/components/modals/create-hotel-modal";
import { CreateOwnerModal } from "@/components/modals/create-owner-modal";
import { Hotel, Users, Shield, TrendingUp, Plus, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SuperAdminDashboard() {
  const [isCreateHotelModalOpen, setIsCreateHotelModalOpen] = useState(false);
  const [isCreateOwnerModalOpen, setIsCreateOwnerModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);
  const queryClient = useQueryClient();

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels"],
    refetchInterval: 3000,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
    refetchInterval: 3000,
  });

  const toggleHotelStatus = useMutation({
    mutationFn: async ({ hotelId, activate }: { hotelId: string, activate: boolean }) => {
      const endpoint = activate ? `/api/hotels/${hotelId}/activate` : `/api/hotels/${hotelId}/deactivate`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to ${activate ? 'activate' : 'deactivate'} hotel`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast.success(`Hotel ${variables.activate ? 'activated' : 'deactivated'} successfully`);
      setShowConfirmDialog(false);
      setSelectedHotel(null);
      setConfirmAction(null);
    },
    onError: () => {
      toast.error("Failed to update hotel status");
    }
  });

  const handleToggleHotel = (hotel: any, activate: boolean) => {
    setSelectedHotel(hotel);
    setConfirmAction(activate ? 'activate' : 'deactivate');
    setShowConfirmDialog(true);
  };

  const confirmToggle = () => {
    if (selectedHotel && confirmAction) {
      toggleHotelStatus.mutate({
        hotelId: selectedHotel.id,
        activate: confirmAction === 'activate'
      });
    }
  };

  const hotelColumns = [
    { key: "name", label: "Hotel Name", sortable: true },
    { key: "address", label: "Address", sortable: true },
    { key: "vatNo", label: "VAT No", sortable: true },
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
    { 
      label: "Activate", 
      action: (row: any) => handleToggleHotel(row, true),
      variant: "default" as const,
      show: (row: any) => !row.isActive
    },
    { 
      label: "Deactivate", 
      action: (row: any) => handleToggleHotel(row, false),
      variant: "destructive" as const,
      show: (row: any) => row.isActive
    }
  ];

  const ownerActions = [
    { label: "View Details", action: (row: any) => {/* TODO: Implement view details */} }
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
          />
          <StatsCard
            title="Active Hotels"
            value={hotels.filter(h => h.isActive).length}
            icon={<Power />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Total Owners"
            value={owners.length}
            icon={<Users />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Super Admins"
            value={users.filter(u => u.role?.name === 'super_admin').length}
            icon={<Shield />}
            iconColor="text-orange-500"
          />
        </div>

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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'activate' ? 'Activate Hotel' : 'Deactivate Hotel'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'activate' 
                ? `Are you sure you want to activate "${selectedHotel?.name}"? Users will be able to log in again.`
                : `Are you sure you want to deactivate "${selectedHotel?.name}"? All users from this hotel will be unable to log in, but their data will be preserved.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setSelectedHotel(null);
                setConfirmAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'activate' ? 'default' : 'destructive'}
              onClick={confirmToggle}
              disabled={toggleHotelStatus.isPending}
            >
              {toggleHotelStatus.isPending ? 'Processing...' : confirmAction === 'activate' ? 'Activate' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
