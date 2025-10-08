import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, DoorOpen, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface RoomType {
  id: number;
  hotelId: string;
  name: string;
  description?: string;
}

interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  roomTypeId?: number;
  isOccupied: boolean;
  occupantDetails?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export default function RoomSetupPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Room Type Dialog States
  const [isRoomTypeDialogOpen, setIsRoomTypeDialogOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [roomTypeName, setRoomTypeName] = useState("");
  const [roomTypeDescription, setRoomTypeDescription] = useState("");
  
  // Room Dialog States
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isBulkRoomDialogOpen, setIsBulkRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  
  // Bulk Room Creation States
  const [bulkRoomType, setBulkRoomType] = useState<string>("");
  const [roomPrefix, setRoomPrefix] = useState("");
  const [startNumber, setStartNumber] = useState("");
  const [endNumber, setEndNumber] = useState("");

  // Default room types for hotels
  const defaultRoomTypes = [
    { name: "Standard", description: "Basic comfortable rooms with essential amenities" },
    { name: "Deluxe", description: "Spacious rooms with premium amenities and city view" },
    { name: "Suite", description: "Luxury rooms with separate living area and premium services" },
    { name: "Presidential", description: "Ultimate luxury suites with exclusive amenities and services" },
    { name: "Executive", description: "Business-class rooms with work facilities and executive lounge access" }
  ];

  useEffect(() => {
    if (user?.hotelId) {
      fetchRoomTypes();
      fetchRooms();
    }
  }, [user?.hotelId]);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/hotels/current/room-types");
      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data);
      }
    } catch (error) {
      console.error("Failed to fetch room types:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/hotels/current/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultRoomTypes = async () => {
    try {
      for (const roomType of defaultRoomTypes) {
        await fetch("/api/room-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomType)
        });
      }
      toast({ title: "Success", description: "Default room types created successfully!" });
      fetchRoomTypes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create default room types", variant: "destructive" });
    }
  };

  const handleSaveRoomType = async () => {
    if (!roomTypeName.trim()) {
      toast({ title: "Error", description: "Room type name is required", variant: "destructive" });
      return;
    }

    try {
      const data = {
        name: roomTypeName,
        description: roomTypeDescription
      };

      const response = editingRoomType
        ? await fetch(`/api/room-types/${editingRoomType.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          })
        : await fetch("/api/room-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

      if (response.ok) {
        toast({ 
          title: "Success", 
          description: `Room type ${editingRoomType ? 'updated' : 'created'} successfully!` 
        });
        fetchRoomTypes();
        resetRoomTypeForm();
        setIsRoomTypeDialogOpen(false);
      } else {
        throw new Error("Failed to save room type");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save room type", variant: "destructive" });
    }
  };

  const handleDeleteRoomType = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room type?")) return;

    try {
      const response = await fetch(`/api/room-types/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast({ title: "Success", description: "Room type deleted successfully!" });
        fetchRoomTypes();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete room type", variant: "destructive" });
    }
  };

  const handleSaveRoom = async () => {
    if (!roomNumber.trim()) {
      toast({ title: "Error", description: "Room number is required", variant: "destructive" });
      return;
    }

    try {
      const data = {
        roomNumber,
        roomTypeId: selectedRoomTypeId ? parseInt(selectedRoomTypeId) : null
      };

      const response = editingRoom
        ? await fetch(`/api/rooms/${editingRoom.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          })
        : await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

      if (response.ok) {
        toast({ 
          title: "Success", 
          description: `Room ${editingRoom ? 'updated' : 'created'} successfully!` 
        });
        fetchRooms();
        resetRoomForm();
        setIsRoomDialogOpen(false);
      } else {
        throw new Error("Failed to save room");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save room", variant: "destructive" });
    }
  };

  const handleBulkCreateRooms = async () => {
    if (!bulkRoomType || !roomPrefix || !startNumber || !endNumber) {
      toast({ title: "Error", description: "All fields are required for bulk creation", variant: "destructive" });
      return;
    }

    const start = parseInt(startNumber);
    const end = parseInt(endNumber);

    if (start > end) {
      toast({ title: "Error", description: "Start number must be less than end number", variant: "destructive" });
      return;
    }

    try {
      const promises = [];
      for (let i = start; i <= end; i++) {
        const roomNumber = `${roomPrefix}${i.toString().padStart(3, '0')}`;
        promises.push(
          fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomNumber,
              roomTypeId: parseInt(bulkRoomType)
            })
          })
        );
      }

      await Promise.all(promises);
      toast({ title: "Success", description: `${end - start + 1} rooms created successfully!` });
      fetchRooms();
      resetBulkRoomForm();
      setIsBulkRoomDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create rooms", variant: "destructive" });
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast({ title: "Success", description: "Room deleted successfully!" });
        fetchRooms();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete room", variant: "destructive" });
    }
  };

  const resetRoomTypeForm = () => {
    setEditingRoomType(null);
    setRoomTypeName("");
    setRoomTypeDescription("");
  };

  const resetRoomForm = () => {
    setEditingRoom(null);
    setRoomNumber("");
    setSelectedRoomTypeId("");
  };

  const resetBulkRoomForm = () => {
    setBulkRoomType("");
    setRoomPrefix("");
    setStartNumber("");
    setEndNumber("");
  };

  const editRoomType = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setRoomTypeName(roomType.name);
    setRoomTypeDescription(roomType.description || "");
    setIsRoomTypeDialogOpen(true);
  };

  const editRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setSelectedRoomTypeId(room.roomTypeId?.toString() || "");
    setIsRoomDialogOpen(true);
  };

  const getRoomTypeName = (roomTypeId?: number) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType?.name || "Unassigned";
  };

  if (loading) {
    return (
      <DashboardLayout title="Room Setup">
        <div className="flex items-center justify-center h-64">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Room Setup">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Room Setup</h1>
          <p className="text-muted-foreground">Manage room types and room configurations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Types Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Room Types
            </CardTitle>
            <CardDescription>
              Define different categories of rooms (Standard, Deluxe, Suite, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Dialog open={isRoomTypeDialogOpen} onOpenChange={setIsRoomTypeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetRoomTypeForm} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Room Type
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRoomType ? "Edit Room Type" : "Create Room Type"}
                    </DialogTitle>
                    <DialogDescription>
                      Add a new category of rooms for your hotel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="roomTypeName">Name</Label>
                      <Input
                        id="roomTypeName"
                        value={roomTypeName}
                        onChange={(e) => setRoomTypeName(e.target.value)}
                        placeholder="e.g., Deluxe, Suite, Presidential"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roomTypeDescription">Description</Label>
                      <Textarea
                        id="roomTypeDescription"
                        value={roomTypeDescription}
                        onChange={(e) => setRoomTypeDescription(e.target.value)}
                        placeholder="Describe the features and amenities of this room type"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveRoomType}>
                        {editingRoomType ? "Update" : "Create"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsRoomTypeDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {roomTypes.length === 0 && (
                <Button variant="outline" onClick={handleCreateDefaultRoomTypes}>
                  Create Default Types
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {roomTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No room types found. Create some room types to get started.
                </p>
              ) : (
                roomTypes.map((roomType) => (
                  <div key={roomType.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{roomType.name}</h4>
                      {roomType.description && (
                        <p className="text-sm text-muted-foreground">{roomType.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editRoomType(roomType)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteRoomType(roomType.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rooms Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5" />
              Rooms
            </CardTitle>
            <CardDescription>
              Manage individual rooms and assign them to room types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetRoomForm} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRoom ? "Edit Room" : "Create Room"}
                    </DialogTitle>
                    <DialogDescription>
                      Add a new room to your hotel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="roomNumber">Room Number</Label>
                      <Input
                        id="roomNumber"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g., 101, A-101, Presidential-01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roomType">Room Type</Label>
                      <Select value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room type" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((roomType) => (
                            <SelectItem key={roomType.id} value={roomType.id.toString()}>
                              {roomType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveRoom}>
                        {editingRoom ? "Update" : "Create"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isBulkRoomDialogOpen} onOpenChange={setIsBulkRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={roomTypes.length === 0}>
                    Bulk Create
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Create Rooms</DialogTitle>
                    <DialogDescription>
                      Create multiple rooms with sequential numbering
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bulkRoomType">Room Type</Label>
                      <Select value={bulkRoomType} onValueChange={setBulkRoomType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room type" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((roomType) => (
                            <SelectItem key={roomType.id} value={roomType.id.toString()}>
                              {roomType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="roomPrefix">Room Prefix</Label>
                      <Input
                        id="roomPrefix"
                        value={roomPrefix}
                        onChange={(e) => setRoomPrefix(e.target.value)}
                        placeholder="e.g., A, B, FL1, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startNumber">Start Number</Label>
                        <Input
                          id="startNumber"
                          type="number"
                          value={startNumber}
                          onChange={(e) => setStartNumber(e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endNumber">End Number</Label>
                        <Input
                          id="endNumber"
                          type="number"
                          value={endNumber}
                          onChange={(e) => setEndNumber(e.target.value)}
                          placeholder="50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleBulkCreateRooms}>
                        Create Rooms
                      </Button>
                      <Button variant="outline" onClick={() => setIsBulkRoomDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No rooms found. Create some rooms to get started.
                </p>
              ) : (
                rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{room.roomNumber}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getRoomTypeName(room.roomTypeId)}
                          </Badge>
                          {room.isOccupied && (
                            <Badge variant="destructive">Occupied</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editRoom(room)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{roomTypes.length}</div>
            <p className="text-sm text-muted-foreground">Room Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-sm text-muted-foreground">Total Rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{rooms.filter(r => r.isOccupied).length}</div>
            <p className="text-sm text-muted-foreground">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{rooms.filter(r => !r.isOccupied).length}</div>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}