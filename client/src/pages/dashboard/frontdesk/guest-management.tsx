import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightLeft, DollarSign, UserCog, Users } from "lucide-react";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { formatCurrency } from "@/lib/utils";
import type { Room, RoomType, Guest } from "@shared/schema";

const transferRoomSchema = z.object({
  newRoomId: z.string().min(1, "Please select a room")
});

const changeRateSchema = z.object({
  newRoomRate: z.string().min(1, "Room rate is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be a valid positive number"),
  newMealPlanRate: z.string().optional()
});

const updateGuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  idNumber: z.string().optional(),
  nationality: z.string().optional()
});

export default function GuestManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [guestInfoDialogOpen, setGuestInfoDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);

  const { data: rooms = [] } = useQuery<Array<Room & { roomType?: RoomType }>>({
    queryKey: ["/api/hotels", user?.hotelId, "rooms"],
    enabled: !!user?.hotelId
  });

  const { data: reservations = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/reservations"],
    enabled: !!user?.hotelId
  });

  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ["/api/hotels/current/guests"],
    enabled: !!user?.hotelId
  });

  const transferForm = useForm({
    resolver: zodResolver(transferRoomSchema),
    defaultValues: {
      newRoomId: ""
    }
  });

  const rateForm = useForm({
    resolver: zodResolver(changeRateSchema),
    defaultValues: {
      newRoomRate: "",
      newMealPlanRate: ""
    }
  });

  const guestInfoForm = useForm({
    resolver: zodResolver(updateGuestSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      idNumber: "",
      nationality: ""
    }
  });

  // Helper function to get room number from room ID
  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.roomNumber || 'Unknown';
  };

  const transferRoomMutation = useMutation({
    mutationFn: async (data: { reservationId: string; newRoomId: string }) => {
      return apiRequest("PATCH", `/api/reservations/${data.reservationId}/transfer-room`, { newRoomId: data.newRoomId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
      toast({ title: "Room transferred successfully" });
      setTransferDialogOpen(false);
      setSelectedReservation(null);
      transferForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Transfer failed",
        description: error.message || "Failed to transfer room",
        variant: "destructive"
      });
    }
  });

  const updateRateMutation = useMutation({
    mutationFn: async (data: { reservationId: string; newRoomRate: string; newMealPlanRate?: string }) => {
      return apiRequest("PATCH", `/api/reservations/${data.reservationId}/rate`, {
        newRoomRate: data.newRoomRate,
        newMealPlanRate: data.newMealPlanRate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
      toast({ title: "Rate updated successfully" });
      setRateDialogOpen(false);
      setSelectedReservation(null);
      rateForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Rate update failed",
        description: error.message || "Failed to update rate",
        variant: "destructive"
      });
    }
  });

  const updateGuestMutation = useMutation({
    mutationFn: async (data: { guestId: string; updates: any }) => {
      return apiRequest("PATCH", `/api/guests/${data.guestId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/guests"] });
      toast({ title: "Guest information updated successfully" });
      setGuestInfoDialogOpen(false);
      setSelectedGuest(null);
      guestInfoForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update guest information",
        variant: "destructive"
      });
    }
  });

  const checkedInReservations = reservations.filter(r => r.status === 'checked_in' || r.status === 'confirmed');
  const activeReservations = reservations.filter(r => r.status === 'checked_in' || r.status === 'confirmed');
  const availableRooms = rooms.filter(r => !r.isOccupied);

  const handleTransferRoom = (reservation: any) => {
    setSelectedReservation(reservation);
    transferForm.reset({ newRoomId: "" });
    setTransferDialogOpen(true);
  };

  const handleChangeRate = (reservation: any) => {
    setSelectedReservation(reservation);
    rateForm.reset({
      newRoomRate: reservation.roomPrice || "",
      newMealPlanRate: reservation.mealPlanPrice || ""
    });
    setRateDialogOpen(true);
  };

  const handleEditGuest = (guest: any) => {
    setSelectedGuest(guest);
    guestInfoForm.reset({
      name: `${guest.firstName} ${guest.lastName}`,
      phone: guest.phone || "",
      email: guest.email || "",
      idNumber: guest.idNumber || "",
      nationality: guest.nationality || ""
    });
    setGuestInfoDialogOpen(true);
  };

  const onTransferSubmit = (data: any) => {
    if (!selectedReservation) return;
    
    confirm({
      title: "Confirm Room Transfer",
      description: `Transfer guest from Room ${getRoomNumber(selectedReservation.roomId)} to Room ${getRoomNumber(data.newRoomId)}?`,
      onConfirm: () => {
        transferRoomMutation.mutate({
          reservationId: selectedReservation.id,
          newRoomId: data.newRoomId
        });
      }
    });
  };

  const onRateSubmit = (data: any) => {
    if (!selectedReservation) return;

    confirm({
      title: "Confirm Rate Change",
      description: `Update room rate from ${formatCurrency(Number(selectedReservation.roomPrice))} to ${formatCurrency(Number(data.newRoomRate))}?`,
      onConfirm: () => {
        updateRateMutation.mutate({
          reservationId: selectedReservation.id,
          newRoomRate: data.newRoomRate,
          newMealPlanRate: data.newMealPlanRate || undefined
        });
      }
    });
  };

  const onGuestInfoSubmit = (data: any) => {
    if (!selectedGuest) return;

    // Split name into firstName and lastName
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    updateGuestMutation.mutate({
      guestId: selectedGuest.id,
      updates: {
        firstName,
        lastName,
        phone: data.phone,
        email: data.email || undefined,
        idNumber: data.idNumber || undefined,
        nationality: data.nationality || undefined
      }
    });
  };

  const getGuestName = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    return reservation?.guestName || "Unknown";
  };

  return (
    <DashboardLayout title="Guest Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8" />
            Guest Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage room transfers, rate changes, and guest information
          </p>
        </div>

        <Tabs defaultValue="transfer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transfer" data-testid="tab-room-transfer">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Room Transfer
            </TabsTrigger>
            <TabsTrigger value="rate" data-testid="tab-change-rate">
              <DollarSign className="h-4 w-4 mr-2" />
              Change Rate
            </TabsTrigger>
            <TabsTrigger value="guest-info" data-testid="tab-change-guest-info">
              <Users className="h-4 w-4 mr-2" />
              Change Guest Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Room Transfer</CardTitle>
                <CardDescription>
                  Transfer confirmed or checked-in guests from one room to another
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkedInReservations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No guests available for transfer
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest Name</TableHead>
                        <TableHead>Current Room</TableHead>
                        <TableHead>Check-in Date</TableHead>
                        <TableHead>Check-out Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkedInReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            {reservation.guestName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Room {getRoomNumber(reservation.roomId)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(reservation.checkInDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(reservation.checkOutDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleTransferRoom(reservation)}
                              disabled={availableRooms.length === 0}
                              data-testid={`button-transfer-${reservation.id}`}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-1" />
                              Transfer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Rate</CardTitle>
                <CardDescription>
                  Modify room and meal plan rates for active reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeReservations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active reservations available
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest Name</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Current Room Rate</TableHead>
                        <TableHead>Current Meal Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            {reservation.guestName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Room {getRoomNumber(reservation.roomId)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(reservation.roomPrice || 0))}
                          </TableCell>
                          <TableCell>
                            {reservation.mealPlanPrice 
                              ? formatCurrency(Number(reservation.mealPlanPrice))
                              : "N/A"
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={reservation.status === 'checked_in' ? 'default' : 'secondary'}>
                              {reservation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleChangeRate(reservation)}
                              data-testid={`button-change-rate-${reservation.id}`}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Change Rate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guest-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Guest Information</CardTitle>
                <CardDescription>
                  Update guest contact and identification details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {guests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No guests available
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>ID Number</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">{guest.firstName} {guest.lastName}</TableCell>
                          <TableCell>{guest.phone}</TableCell>
                          <TableCell>{guest.email || "N/A"}</TableCell>
                          <TableCell>{guest.idNumber || "N/A"}</TableCell>
                          <TableCell>{guest.nationality || "N/A"}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditGuest(guest)}
                              data-testid={`button-edit-guest-${guest.id}`}
                            >
                              <UserCog className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent data-testid="dialog-transfer-room">
          <DialogHeader>
            <DialogTitle>Transfer Room</DialogTitle>
            <DialogDescription>
              Select a new room for {selectedReservation?.guestName}
            </DialogDescription>
          </DialogHeader>
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Room</Label>
                <Input 
                  value={selectedReservation ? `Room ${getRoomNumber(selectedReservation.roomId)}` : ""} 
                  disabled 
                  data-testid="input-current-room"
                />
              </div>
              <FormField
                control={transferForm.control}
                name="newRoomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Room</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-new-room">
                          <SelectValue placeholder="Select available room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.roomNumber} ({room.roomType?.name || "Unknown"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTransferDialogOpen(false)}
                  data-testid="button-cancel-transfer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={transferRoomMutation.isPending}
                  data-testid="button-confirm-transfer"
                >
                  {transferRoomMutation.isPending ? "Transferring..." : "Transfer Room"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent data-testid="dialog-change-rate">
          <DialogHeader>
            <DialogTitle>Change Rate</DialogTitle>
            <DialogDescription>
              Update rates for {selectedReservation?.guestName}
            </DialogDescription>
          </DialogHeader>
          <Form {...rateForm}>
            <form onSubmit={rateForm.handleSubmit(onRateSubmit)} className="space-y-4">
              <FormField
                control={rateForm.control}
                name="newRoomRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Room Rate (per night)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Enter new room rate" 
                        {...field}
                        data-testid="input-new-room-rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={rateForm.control}
                name="newMealPlanRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Meal Plan Rate (per night, optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Enter new meal plan rate" 
                        {...field}
                        data-testid="input-new-meal-rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRateDialogOpen(false)}
                  data-testid="button-cancel-rate"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateRateMutation.isPending}
                  data-testid="button-confirm-rate"
                >
                  {updateRateMutation.isPending ? "Updating..." : "Update Rate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={guestInfoDialogOpen} onOpenChange={setGuestInfoDialogOpen}>
        <DialogContent data-testid="dialog-edit-guest">
          <DialogHeader>
            <DialogTitle>Edit Guest Information</DialogTitle>
            <DialogDescription>
              Update information for {selectedGuest?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...guestInfoForm}>
            <form onSubmit={guestInfoForm.handleSubmit(onGuestInfoSubmit)} className="space-y-4">
              <FormField
                control={guestInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter guest name" {...field} data-testid="input-guest-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestInfoForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} data-testid="input-guest-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestInfoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} data-testid="input-guest-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestInfoForm.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ID number" {...field} data-testid="input-guest-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={guestInfoForm.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter nationality" {...field} data-testid="input-guest-nationality" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGuestInfoDialogOpen(false)}
                  data-testid="button-cancel-guest"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateGuestMutation.isPending}
                  data-testid="button-confirm-guest"
                >
                  {updateGuestMutation.isPending ? "Updating..." : "Update Information"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
