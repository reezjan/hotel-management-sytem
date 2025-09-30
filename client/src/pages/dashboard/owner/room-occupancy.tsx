import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, Users, DoorOpen, Calendar } from "lucide-react";

export default function RoomOccupancy() {
  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/hotels/current/rooms"]
  });

  const { data: roomTypes = [] } = useQuery({
    queryKey: ["/api/hotels/current/room-types"]
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["/api/hotels/current/reservations"]
  });

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
    { label: "Check In", action: (row: any) => console.log("Check in:", row) },
    { label: "Check Out", action: (row: any) => console.log("Check out:", row) },
    { label: "Maintenance", action: (row: any) => console.log("Set maintenance:", row) },
    { label: "Edit", action: (row: any) => console.log("Edit room:", row) }
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
          onAdd={() => console.log("Add room")}
          addButtonLabel="Add Room"
          searchPlaceholder="Search rooms..."
        />
      </div>
    </DashboardLayout>
  );
}