import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bed, Users, DoorOpen, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RoomOccupancy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [checkInDialog, setCheckInDialog] = useState(false);
  const [checkOutDialog, setCheckOutDialog] = useState(false);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Room form states
  const [roomNumber, setRoomNumber] = useState("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");
  
  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/rooms"]
  });

  const { data: roomTypes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/room-types"]
  });

  const { data: reservations = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/reservations"]
  });

  // Populate form when editing
  useEffect(() => {
    if (selectedRoom && editDialog) {
      setRoomNumber(selectedRoom.roomNumber || "");
      setSelectedRoomTypeId(selectedRoom.roomTypeId?.toString() || "");
    } else if (addDialog && !selectedRoom) {
      setRoomNumber("");
      setSelectedRoomTypeId("");
    } else if (!editDialog && !addDialog) {
      setRoomNumber("");
      setSelectedRoomTypeId("");
      setSelectedRoom(null);
    }
  }, [selectedRoom, editDialog, addDialog]);

  // Mutations
  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/hotels/current/rooms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/rooms"] });
      toast({ title: "Success", description: "Room created successfully!" });
      setAddDialog(false);
      setRoomNumber("");
      setSelectedRoomTypeId("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create room", variant: "destructive" });
    }
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/hotels/current/rooms/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/rooms"] });
      toast({ title: "Success", description: "Room updated successfully!" });
      setEditDialog(false);
      setRoomNumber("");
      setSelectedRoomTypeId("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update room", variant: "destructive" });
    }
  });

  const handleSaveRoom = () => {
    if (!roomNumber.trim()) {
      toast({ title: "Error", description: "Room number is required", variant: "destructive" });
      return;
    }

    const data = {
      roomNumber,
      roomTypeId: selectedRoomTypeId ? parseInt(selectedRoomTypeId) : null
    };

    if (selectedRoom && editDialog) {
      updateRoomMutation.mutate({ id: selectedRoom.id, data });
    } else {
      createRoomMutation.mutate(data);
    }
  };

  // Calculate room metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.isOccupied).length;
  const availableRooms = totalRooms - occupiedRooms;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Rooms in maintenance (this should come from a maintenance status field)
  const maintenanceRooms = 0; // TODO: Add maintenance status to rooms
  const cleaningRooms = 0; // TODO: Add cleaning status to rooms

  const roomColumns = [
    { key: "roomNumber", label: "Room Number", sortable: true },
    { 
      key: "roomType", 
      label: "Room Type", 
      sortable: true,
      render: (value: any, row: any) => {
        const roomType = roomTypes.find(rt => rt.id === row.roomTypeId);
        return roomType?.name || 'Unknown';
      }
    },
    { 
      key: "isOccupied", 
      label: "Status", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {value ? 'Occupied' : 'Available'}
        </span>
      )
    },
    { 
      key: "occupantDetails", 
      label: "Guest Details", 
      render: (value: any) => value ? JSON.stringify(value) : 'N/A'
    },
    { 
      key: "createdAt", 
      label: "Last Updated", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const roomActions = [
    { 
      label: "Check In", 
      action: (row: any) => {
        setSelectedRoom(row);
        setCheckInDialog(true);
      }
    },
    { 
      label: "Check Out", 
      action: (row: any) => {
        setSelectedRoom(row);
        setCheckOutDialog(true);
      }
    },
    { 
      label: "Maintenance", 
      action: (row: any) => {
        setSelectedRoom(row);
        setMaintenanceDialog(true);
      }
    },
    { 
      label: "Edit", 
      action: (row: any) => {
        setSelectedRoom(row);
        setEditDialog(true);
      }
    }
  ];

  return (
    <DashboardLayout title="Room Occupancy">
      <div className="space-y-6">
        {/* Room Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Rooms"
            value={totalRooms}
            icon={<Bed />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<Users />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Available Rooms"
            value={availableRooms}
            icon={<DoorOpen />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Reservations"
            value={reservations.length}
            icon={<Calendar />}
            iconColor="text-orange-500"
          />
        </div>

        {/* Room Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Room Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
                <div className="text-sm text-green-700">Available</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{occupiedRooms}</div>
                <div className="text-sm text-red-700">Occupied</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{maintenanceRooms}</div>
                <div className="text-sm text-orange-700">Maintenance</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{cleaningRooms}</div>
                <div className="text-sm text-purple-700">Cleaning</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Room Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roomTypes.map((type) => {
                const typeRooms = rooms.filter(r => r.roomTypeId === type.id);
                const typeOccupied = typeRooms.filter(r => r.isOccupied).length;
                const typeOccupancyRate = typeRooms.length > 0 ? (typeOccupied / typeRooms.length) * 100 : 0;
                
                return (
                  <div key={type.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg">{type.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Total: {typeRooms.length} rooms
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Occupied: {typeOccupied} rooms
                      </div>
                      <div className="text-sm font-medium">
                        Occupancy: {typeOccupancyRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <DataTable
          title="All Rooms"
          data={rooms}
          columns={roomColumns}
          actions={roomActions}
          onAdd={() => setAddDialog(true)}
          addButtonLabel="Add Room"
          searchPlaceholder="Search rooms..."
        />

        {/* Dialogs */}
        <Dialog open={checkInDialog} onOpenChange={setCheckInDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check In - Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>Guest check-in functionality</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please use the Guest Management page to check in guests with reservations.
                This will automatically update room occupancy status.
              </p>
              <Button onClick={() => setCheckInDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={checkOutDialog} onOpenChange={setCheckOutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check Out - Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>Guest check-out functionality</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please use the Guest Management page to check out guests.
                This will automatically update room occupancy status and add the room to the cleaning queue.
              </p>
              <Button onClick={() => setCheckOutDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={maintenanceDialog} onOpenChange={setMaintenanceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Maintenance - Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>Mark room for maintenance</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Room maintenance management is available in the Manager dashboard under Room Setup.
                Managers can update room status to 'maintenance' with reason tracking.
              </p>
              <Button onClick={() => setMaintenanceDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>Update room details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-room-number">Room Number</Label>
                <Input
                  id="edit-room-number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Enter room number"
                  data-testid="input-room-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-type">Room Type</Label>
                <Select value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId}>
                  <SelectTrigger id="edit-room-type" data-testid="select-room-type">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialog(false)} data-testid="button-cancel-edit">Cancel</Button>
                <Button onClick={handleSaveRoom} disabled={updateRoomMutation.isPending} data-testid="button-save-room">
                  {updateRoomMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>Create a new room</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-room-number">Room Number</Label>
                <Input
                  id="add-room-number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Enter room number"
                  data-testid="input-room-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room-type">Room Type</Label>
                <Select value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId}>
                  <SelectTrigger id="add-room-type" data-testid="select-room-type">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddDialog(false)} data-testid="button-cancel-add">Cancel</Button>
                <Button onClick={handleSaveRoom} disabled={createRoomMutation.isPending} data-testid="button-create-room">
                  {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}