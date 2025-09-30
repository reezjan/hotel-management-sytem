import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { 
  CalendarDays, 
  Users, 
  Bed, 
  UserCheck, 
  UserMinus, 
  CalendarPlus, 
  HandPlatter, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Printer,
  Clock,
  CheckSquare,
  Plus,
  Calendar as CalendarIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, getStatusColor, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function FrontDeskDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isRoomServiceModalOpen, setIsRoomServiceModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/hotels/hotel-id/rooms"]
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "tasks"]
  });

  const { data: roomServiceOrders = [] } = useQuery({
    queryKey: ["/api/hotels/hotel-id/room-service-orders"]
  });

  const checkInForm = useForm({
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      idNumber: "",
      checkInDate: "",
      checkOutDate: "",
      roomId: "",
      advancePayment: ""
    }
  });

  const reservationForm = useForm({
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      checkInDate: "",
      checkOutDate: "",
      roomId: "",
      specialRequests: ""
    }
  });

  const roomServiceForm = useForm({
    defaultValues: {
      roomId: "",
      serviceType: "",
      specialInstructions: ""
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await apiRequest("PUT", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "tasks"] });
      toast({ title: "Task updated successfully" });
    }
  });

  const checkInGuestMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update room occupancy
      await apiRequest("PUT", `/api/rooms/${data.roomId}`, {
        isOccupied: true,
        occupantDetails: {
          name: data.guestName,
          email: data.guestEmail,
          phone: data.guestPhone,
          idNumber: data.idNumber,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate
        }
      });

      // Create transaction for advance payment if provided
      if (data.advancePayment && Number(data.advancePayment) > 0) {
        await apiRequest("POST", "/api/transactions", {
          hotelId: user?.hotelId,
          txnType: selectedPaymentMethod === 'cash' ? 'cash_in' : selectedPaymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
          amount: Number(data.advancePayment),
          paymentMethod: selectedPaymentMethod,
          purpose: 'room_advance_payment',
          reference: `Room ${selectedRoom?.roomNumber} - ${data.guestName}`,
          createdBy: user?.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/hotel-id/rooms"] });
      toast({ title: "Guest checked in successfully" });
      checkInForm.reset();
      setIsCheckInModalOpen(false);
      setSelectedRoom(null);
      setSelectedPaymentMethod("");
    }
  });

  const checkOutGuestMutation = useMutation({
    mutationFn: async (roomId: string) => {
      await apiRequest("PUT", `/api/rooms/${roomId}`, {
        isOccupied: false,
        occupantDetails: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/hotel-id/rooms"] });
      toast({ title: "Guest checked out successfully" });
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data: any) => {
      // In a real implementation, this would create a reservation record
      await apiRequest("POST", "/api/reservations", {
        hotelId: user?.hotelId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        roomId: data.roomId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        specialRequests: data.specialRequests,
        status: 'confirmed',
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      toast({ title: "Reservation created successfully" });
      reservationForm.reset();
      setIsReservationModalOpen(false);
      handlePrintReservationConfirmation();
    }
  });

  const createRoomServiceOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/room-service-orders", {
        hotelId: user?.hotelId,
        roomId: data.roomId,
        requestedBy: user?.id,
        status: 'pending',
        specialInstructions: `${data.serviceType}: ${data.specialInstructions}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/hotel-id/room-service-orders"] });
      toast({ title: "Room service order created successfully" });
      roomServiceForm.reset();
      setIsRoomServiceModalOpen(false);
    }
  });

  const availableRooms = rooms.filter(r => !r.isOccupied);
  const occupiedRooms = rooms.filter(r => r.isOccupied);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const performingTasks = tasks.filter(t => t.status === 'performing');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const todaysCheckIns = occupiedRooms.filter(r => {
    const today = new Date().toDateString();
    const checkInDate = r.occupantDetails?.checkInDate;
    return checkInDate && new Date(checkInDate).toDateString() === today;
  });

  const todaysCheckOuts = occupiedRooms.filter(r => {
    const today = new Date().toDateString();
    const checkOutDate = r.occupantDetails?.checkOutDate;
    return checkOutDate && new Date(checkOutDate).toDateString() === today;
  });

  const handleTaskStatusUpdate = (task: any, newStatus: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const handleCheckIn = (room: any) => {
    setSelectedRoom(room);
    setIsCheckInModalOpen(true);
  };

  const handleCheckOut = (room: any) => {
    if (confirm(`Are you sure you want to check out guest from ${room.roomNumber}?`)) {
      checkOutGuestMutation.mutate(room.id);
    }
  };

  const onSubmitCheckIn = (data: any) => {
    if (!selectedPaymentMethod && data.advancePayment && Number(data.advancePayment) > 0) {
      toast({ title: "Error", description: "Please select payment method for advance payment", variant: "destructive" });
      return;
    }
    checkInGuestMutation.mutate({ ...data, roomId: selectedRoom?.id });
  };

  const onSubmitReservation = (data: any) => {
    createReservationMutation.mutate(data);
  };

  const onSubmitRoomService = (data: any) => {
    createRoomServiceOrderMutation.mutate(data);
  };

  const handlePrintReceipt = (room: any, type: 'checkin' | 'checkout') => {
    const guest = room.occupantDetails;
    const receiptContent = `
      ========================================
                GRAND PLAZA HOTEL
             ${type === 'checkin' ? 'Check-in' : 'Check-out'} Receipt
      ========================================
      Guest: ${guest?.name || 'N/A'}
      Room: ${room.roomNumber}
      ${type === 'checkin' ? 'Check-in' : 'Check-out'} Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      Front Desk: ${user?.username}
      ========================================
      ${type === 'checkin' ? `
      Check-out Date: ${guest?.checkOutDate ? new Date(guest.checkOutDate).toLocaleDateString() : 'N/A'}
      Contact: ${guest?.phone || 'N/A'}
      Email: ${guest?.email || 'N/A'}` : ''}
      ========================================
      Thank you for choosing our hotel!
      ========================================
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: monospace; white-space: pre-line; }
            </style>
          </head>
          <body>${receiptContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const handlePrintReservationConfirmation = () => {
    const confirmationContent = `
      ========================================
                GRAND PLAZA HOTEL
            Reservation Confirmation
      ========================================
      Confirmation Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      ========================================
      Your reservation has been confirmed.
      Thank you for choosing our hotel!
      ========================================
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Reservation Confirmation</title>
            <style>
              body { font-family: monospace; white-space: pre-line; }
            </style>
          </head>
          <body>${confirmationContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <DashboardLayout title="Front Desk Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Available Rooms"
            value={availableRooms.length}
            icon={<Bed />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Occupied Rooms"
            value={occupiedRooms.length}
            icon={<UserCheck />}
            iconColor="text-blue-500"
            trend={{ 
              value: rooms.length > 0 ? Math.round((occupiedRooms.length / rooms.length) * 100) : 0, 
              label: "occupancy", 
              isPositive: true 
            }}
          />
          <StatsCard
            title="Today's Check-ins"
            value={todaysCheckIns.length}
            icon={<CalendarPlus />}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="Today's Check-outs"
            value={todaysCheckOuts.length}
            icon={<UserMinus />}
            iconColor="text-red-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Front Desk Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => setIsCheckInModalOpen(true)}
                data-testid="button-check-in"
              >
                <UserCheck className="h-6 w-6 mb-2" />
                <span className="text-sm">Check-in Guest</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => setIsReservationModalOpen(true)}
                data-testid="button-new-reservation"
              >
                <CalendarPlus className="h-6 w-6 mb-2" />
                <span className="text-sm">New Reservation</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => setIsRoomServiceModalOpen(true)}
                data-testid="button-room-service"
              >
                <HandPlatter className="h-6 w-6 mb-2" />
                <span className="text-sm">Room Service</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-print-reports">
                <Printer className="h-6 w-6 mb-2" />
                <span className="text-sm">Print Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Room Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Room Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {rooms.slice(0, 12).map((room, index) => (
                <div
                  key={room.id}
                  className={`p-4 border-2 rounded-lg text-center ${
                    room.isOccupied 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-green-300 bg-green-50'
                  }`}
                  data-testid={`room-status-${index}`}
                >
                  <Bed className={`h-6 w-6 mx-auto mb-2 ${room.isOccupied ? 'text-red-600' : 'text-green-600'}`} />
                  <h3 className="font-medium text-foreground">{room.roomNumber}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {room.roomType?.name || 'Standard'}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={room.isOccupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                  >
                    {room.isOccupied ? 'Occupied' : 'Available'}
                  </Badge>
                  {room.isOccupied && room.occupantDetails && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-foreground font-medium">{room.occupantDetails.name}</p>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(room)}
                          className="h-6 text-xs px-2"
                          data-testid={`button-checkout-${index}`}
                        >
                          Check Out
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintReceipt(room, 'checkout')}
                          className="h-6 text-xs px-2"
                          data-testid={`button-print-${index}`}
                        >
                          Print
                        </Button>
                      </div>
                    </div>
                  )}
                  {!room.isOccupied && (
                    <Button
                      size="sm"
                      className="mt-2 h-6 text-xs"
                      onClick={() => handleCheckIn(room)}
                      data-testid={`button-checkin-${index}`}
                    >
                      Check In
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4" data-testid="no-tasks-message">
                  No tasks assigned
                </p>
              ) : (
                tasks.slice(0, 5).map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`task-item-${index}`}>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(task.status)} variant="secondary">
                          {task.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleTaskStatusUpdate(task, 'performing')}
                          disabled={updateTaskMutation.isPending}
                          data-testid={`button-start-task-${index}`}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'performing' && (
                        <Button
                          size="sm"
                          onClick={() => handleTaskStatusUpdate(task, 'completed')}
                          disabled={updateTaskMutation.isPending}
                          data-testid={`button-complete-task-${index}`}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Room Service Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Room Service Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roomServiceOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4" data-testid="no-room-service-message">
                  No room service orders
                </p>
              ) : (
                roomServiceOrders.slice(0, 5).map((order, index) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`room-service-item-${index}`}>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        Room {rooms.find(r => r.id === order.roomId)?.roomNumber || 'Unknown'}
                      </h4>
                      <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Check-in Modal */}
        <Dialog open={isCheckInModalOpen} onOpenChange={setIsCheckInModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Check-in Guest - Room {selectedRoom?.roomNumber}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...checkInForm}>
              <form onSubmit={checkInForm.handleSubmit(onSubmitCheckIn)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={checkInForm.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Full name" data-testid="input-guest-name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={checkInForm.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" data-testid="input-guest-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={checkInForm.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" data-testid="input-guest-phone" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={checkInForm.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Passport/ID number" data-testid="input-id-number" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={checkInForm.control}
                    name="checkInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-checkin-date" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={checkInForm.control}
                    name="checkOutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-checkout-date" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={checkInForm.control}
                  name="advancePayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Payment (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="0" data-testid="input-advance-payment" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {checkInForm.watch('advancePayment') && Number(checkInForm.watch('advancePayment')) > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Payment Method</h4>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                        onClick={() => setSelectedPaymentMethod('cash')}
                        data-testid="button-payment-cash"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cash
                      </Button>
                      <Button
                        type="button"
                        variant={selectedPaymentMethod === 'pos' ? 'default' : 'outline'}
                        onClick={() => setSelectedPaymentMethod('pos')}
                        data-testid="button-payment-pos"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        POS
                      </Button>
                      <Button
                        type="button"
                        variant={selectedPaymentMethod === 'fonepay' ? 'default' : 'outline'}
                        onClick={() => setSelectedPaymentMethod('fonepay')}
                        data-testid="button-payment-fonepay"
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Fonepay
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={checkInGuestMutation.isPending}
                    data-testid="button-confirm-checkin"
                  >
                    {checkInGuestMutation.isPending ? "Checking In..." : "Check In & Print Receipt"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsCheckInModalOpen(false)}
                    data-testid="button-cancel-checkin"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Reservation Modal */}
        <Dialog open={isReservationModalOpen} onOpenChange={setIsReservationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Reservation</DialogTitle>
            </DialogHeader>
            
            <Form {...reservationForm}>
              <form onSubmit={reservationForm.handleSubmit(onSubmitReservation)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={reservationForm.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Full name" data-testid="input-reservation-name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reservationForm.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" data-testid="input-reservation-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reservationForm.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" data-testid="input-reservation-phone" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reservationForm.control}
                    name="roomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-reservation-room">
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.roomNumber} - {room.roomType?.name || 'Standard'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reservationForm.control}
                    name="checkInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Date *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-reservation-checkin" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reservationForm.control}
                    name="checkOutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Date *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-reservation-checkout" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={reservationForm.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Any special requests or notes..." rows={3} data-testid="textarea-special-requests" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createReservationMutation.isPending}
                    data-testid="button-create-reservation"
                  >
                    {createReservationMutation.isPending ? "Creating..." : "Create Reservation"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsReservationModalOpen(false)}
                    data-testid="button-cancel-reservation"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Room Service Modal */}
        <Dialog open={isRoomServiceModalOpen} onOpenChange={setIsRoomServiceModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Room Service Order</DialogTitle>
            </DialogHeader>
            
            <Form {...roomServiceForm}>
              <form onSubmit={roomServiceForm.handleSubmit(onSubmitRoomService)} className="space-y-4">
                <FormField
                  control={roomServiceForm.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-room-service-room">
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {occupiedRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.roomNumber} - {room.occupantDetails?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={roomServiceForm.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service-type">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="housekeeping">Housekeeping</SelectItem>
                          <SelectItem value="food_delivery">Food Delivery</SelectItem>
                          <SelectItem value="laundry">Laundry</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={roomServiceForm.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Special instructions..." rows={3} data-testid="textarea-service-instructions" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createRoomServiceOrderMutation.isPending}
                    data-testid="button-create-room-service"
                  >
                    {createRoomServiceOrderMutation.isPending ? "Creating..." : "Create Order"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsRoomServiceModalOpen(false)}
                    data-testid="button-cancel-room-service"
                  >
                    Cancel
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
