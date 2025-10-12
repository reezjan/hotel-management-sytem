import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { Label } from "@/components/ui/label";
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
  Calendar as CalendarIcon,
  CalendarCheck,
  Wrench,
  Search,
  Utensils,
  Building2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useWebSocket } from "@/hooks/use-websocket";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { formatCurrency, getStatusColor, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Room, Task, RoomServiceOrder, MealPlan, Voucher, MenuItem, MenuCategory, RoomType } from "@shared/schema";
import { RoomServiceChargeModal } from "@/components/modals/room-service-charge-modal";

export default function FrontDeskDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const [, setLocation] = useLocation();
  const { confirm } = useConfirmDialog();
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isRoomServiceModalOpen, setIsRoomServiceModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isCashDepositModalOpen, setIsCashDepositModalOpen] = useState(false);
  const [isFoodOrderModalOpen, setIsFoodOrderModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedCheckoutPaymentMethod, setSelectedCheckoutPaymentMethod] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [validatedVoucher, setValidatedVoucher] = useState<any>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [foodOrderItems, setFoodOrderItems] = useState<Array<{ item: MenuItem; quantity: number }>>([]);
  const [guestType, setGuestType] = useState<"inhouse" | "walkin">("walkin");
  const [officeName, setOfficeName] = useState("");
  const [isExtendStayModalOpen, setIsExtendStayModalOpen] = useState(false);
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date | undefined>(undefined);
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [isViewReservationsModalOpen, setIsViewReservationsModalOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [isServiceChargeModalOpen, setIsServiceChargeModalOpen] = useState(false);
  const [selectedReservationForService, setSelectedReservationForService] = useState<string>("");

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: guests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/guests"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: rooms = [] } = useQuery<Array<Room & { roomType?: RoomType }>>({
    queryKey: ["/api/hotels", user?.hotelId, "rooms"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/users", user?.id, "tasks"],
    refetchInterval: 3000,
    enabled: !!user?.id
  });

  const { data: roomServiceOrders = [] } = useQuery<RoomServiceOrder[]>({
    queryKey: ["/api/hotels", user?.hotelId, "room-service-orders"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: mealPlans = [] } = useQuery<MealPlan[]>({
    queryKey: ["/api/hotels", user?.hotelId, "meal-plans"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: vouchers = [] } = useQuery<Voucher[]>({
    queryKey: ["/api/hotels", user?.hotelId, "vouchers"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: menuItems = [] } = useQuery<Array<MenuItem & { category?: MenuCategory }>>({
    queryKey: ["/api/hotels", user?.hotelId, "menu-items"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: menuCategories = [] } = useQuery<MenuCategory[]>({
    queryKey: ["/api/hotels", user?.hotelId, "menu-categories"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: reservations = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/reservations"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/services"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const { data: roomServiceCharges = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/room-service-charges"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  const checkInForm = useForm({
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      idNumber: "",
      nationality: "",
      checkInDate: "",
      checkOutDate: "",
      roomId: "",
      advancePayment: "",
      mealPlanId: "",
      numberOfPersons: ""
    }
  });

  const maintenanceForm = useForm({
    defaultValues: {
      title: "",
      location: "",
      description: "",
      priority: "medium"
    }
  });

  // Real-time updates for services and other resources
  useRealtimeQuery({
    queryKey: ["/api/services"],
    refetchInterval: 3000,
    events: ['service:created', 'service:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/rooms"],
    refetchInterval: 3000,
    events: ['room:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000,
    events: ['transaction:created', 'transaction:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/guests"],
    refetchInterval: 3000,
    events: ['guest:created', 'guest:updated']
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/room-service-charges"],
    refetchInterval: 3000,
    events: ['room-service-charge:created', 'room-service-charge:deleted']
  });

  const cashDepositForm = useForm({
    defaultValues: {
      amount: "",
      purpose: "",
      paymentMethod: "cash"
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
      numberOfPersons: "",
      mealPlanId: "",
      specialRequests: ""
    }
  });

  // Real-time WebSocket updates for front desk
  useEffect(() => {
    if (!user?.hotelId) return;

    // Listen for room status updates
    const unsubRoomUpdate = ws.on('room:updated', (room) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "rooms"] });
      toast({ 
        title: "Room Updated", 
        description: `Room ${room.roomNumber} status has been updated`
      });
    });

    // Listen for guest updates
    const unsubGuestCreated = ws.on('guest:created', (guest) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/guests"] });
      toast({ 
        title: "New Guest", 
        description: `${guest.name} has been added`
      });
    });

    const unsubGuestUpdated = ws.on('guest:updated', (guest) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/guests"] });
    });

    // Listen for maintenance updates
    const unsubMaintenanceUpdated = ws.on('maintenance:updated', (request) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ 
        title: "Maintenance Update", 
        description: `Request "${request.title}" has been updated`
      });
    });

    // Listen for transaction updates
    const unsubTransactionCreated = ws.on('transaction:created', (transaction) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
    });

    return () => {
      unsubRoomUpdate();
      unsubGuestCreated();
      unsubGuestUpdated();
      unsubMaintenanceUpdated();
      unsubTransactionCreated();
    };
  }, [user?.hotelId, ws, queryClient, toast]);

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
      const selectedMealPlan = mealPlans.find((plan) => plan.id === data.mealPlanId);
      const room = rooms.find(r => r.id === data.roomId);
      const roomType = room?.roomType;
      
      // Validate room type exists
      if (!roomType) {
        throw new Error('Room type information is missing. Please ensure the room is properly configured.');
      }
      
      // Get the correct room price based on guest type
      const price = data.guestType === "inhouse" ? roomType.priceInhouse : roomType.priceWalkin;
      const roomPrice = price ? Number(price) : 0;
      
      if (roomPrice <= 0) {
        throw new Error(`Room price is not configured for ${data.guestType} guests. Please configure room pricing first.`);
      }
      
      // Update room occupancy
      await apiRequest("PUT", `/api/rooms/${data.roomId}`, {
        isOccupied: true,
        occupantDetails: {
          name: data.guestName,
          email: data.guestEmail,
          phone: data.guestPhone,
          idNumber: data.idNumber,
          nationality: data.nationality,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          guestType: data.guestType || "walkin",
          officeName: data.officeName || null,
          roomTypeId: roomType?.id || null,
          roomTypeName: roomType?.name || null,
          roomPrice: roomPrice,
          mealPlan: selectedMealPlan ? {
            planId: selectedMealPlan.id,
            planType: selectedMealPlan.planType,
            planName: selectedMealPlan.planName,
            pricePerPerson: selectedMealPlan.pricePerPerson,
            numberOfPersons: Number(data.numberOfPersons) || 0,
            totalCost: Number(selectedMealPlan.pricePerPerson) * (Number(data.numberOfPersons) || 0)
          } : null
        }
      });

      // Create transaction for advance payment if provided
      if (data.advancePayment && Number(data.advancePayment) > 0) {
        await apiRequest("POST", "/api/transactions", {
          hotelId: user?.hotelId,
          txnType: selectedPaymentMethod === 'cash' ? 'cash_in' : selectedPaymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
          amount: String(Number(data.advancePayment)),
          paymentMethod: selectedPaymentMethod,
          purpose: 'room_advance_payment',
          reference: `Room ${selectedRoom?.roomNumber} - ${data.guestName}`,
          details: {
            roomId: data.roomId,
            roomNumber: selectedRoom?.roomNumber,
            guestName: data.guestName,
            checkInDate: data.checkInDate
          },
          createdBy: user?.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Guest checked in successfully" });
      checkInForm.reset();
      setIsCheckInModalOpen(false);
      setSelectedRoom(null);
      setSelectedPaymentMethod("");
      setGuestType("walkin");
      setSelectedGuest(null);
      setGuestSearchQuery("");
      setOfficeName("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Check-in failed", 
        description: error.message || "Failed to check in guest",
        variant: "destructive" 
      });
    }
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/maintenance-requests", {
        hotelId: user?.hotelId,
        reportedBy: user?.id,
        title: data.title,
        location: data.location,
        description: data.description,
        priority: data.priority,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast({ title: "Maintenance request sent to manager successfully" });
      maintenanceForm.reset();
      setIsMaintenanceModalOpen(false);
    }
  });

  const createCashDepositMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/transactions", {
        hotelId: user?.hotelId,
        txnType: 'cash_deposit_request',
        amount: String(Number(data.amount)),
        paymentMethod: data.paymentMethod,
        purpose: data.purpose || 'Cash Deposit Request',
        reference: `Cash deposit by ${user?.username}`,
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "transactions"] });
      toast({ title: "Cash deposit request sent to finance successfully" });
      cashDepositForm.reset();
      setIsCashDepositModalOpen(false);
    }
  });

  const extendStayMutation = useMutation({
    mutationFn: async (data: { roomId: string; newCheckoutDate: Date }) => {
      const room = rooms.find(r => r.id === data.roomId);
      if (!room || !room.occupantDetails) {
        throw new Error("Room not found or not occupied");
      }

      await apiRequest("PUT", `/api/rooms/${data.roomId}`, {
        occupantDetails: {
          ...room.occupantDetails,
          checkOutDate: data.newCheckoutDate.toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "rooms"] });
      toast({ title: "Checkout date extended successfully" });
      setIsExtendStayModalOpen(false);
      setSelectedRoom(null);
      setNewCheckoutDate(undefined);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to extend stay", 
        description: error.message || "Could not update checkout date",
        variant: "destructive" 
      });
    }
  });

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast({ title: "Please enter a voucher code", variant: "destructive" });
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode }),
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.valid) {
        setValidatedVoucher(data.voucher);
        toast({ title: "Voucher applied successfully!" });
      } else {
        setValidatedVoucher(null);
        toast({ title: "Invalid voucher", description: data.message || "Voucher code is invalid", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error validating voucher", variant: "destructive" });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const checkOutGuestMutation = useMutation({
    mutationFn: async (data: { 
      roomId: string; 
      roomNumber: string;
      guestName: string;
      totalAmount: number; 
      discountAmount: number; 
      finalAmount: number; 
      voucherId?: string;
      billingDetails?: any;
    }) => {
      // Validate payment method is selected
      if (!selectedCheckoutPaymentMethod || !['cash', 'pos', 'fonepay'].includes(selectedCheckoutPaymentMethod)) {
        throw new Error('Please select a payment method (Cash, POS, or Fonepay) before checking out');
      }

      // Check if this is a reservation-based checkout
      const room = rooms.find(r => r.id === data.roomId);
      const reservationId = room?.currentReservationId || (room?.occupantDetails as any)?.reservationId;

      if (reservationId) {
        // Use reservation-based checkout with balance validation
        // First record the payment to update paidAmount
        await apiRequest("POST", "/api/transactions", {
          hotelId: user?.hotelId,
          txnType: selectedCheckoutPaymentMethod === 'cash' ? 'cash_in' : selectedCheckoutPaymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
          amount: String(data.finalAmount),
          paymentMethod: selectedCheckoutPaymentMethod,
          purpose: 'room_checkout_payment',
          reference: `Checkout - Room ${data.roomNumber} - ${data.guestName}${data.voucherId ? ` (Voucher Applied)` : ''}`,
          details: {
            roomNumber: data.roomNumber,
            guestName: data.guestName,
            checkInDate: selectedRoom?.occupantDetails?.checkInDate,
            checkOutDate: selectedRoom?.occupantDetails?.checkOutDate,
            numberOfNights: data.billingDetails?.numberOfNights || 1,
            subtotal: data.billingDetails?.subtotal || 0,
            roomCharges: data.billingDetails?.totalRoomCharges || 0,
            mealPlanCharges: data.billingDetails?.totalMealPlanCharges || 0,
            foodCharges: data.billingDetails?.totalFoodCharges || 0,
            taxBreakdown: data.billingDetails?.taxBreakdown || {},
            totalTax: data.billingDetails?.totalTax || 0,
            discountAmount: data.discountAmount,
            voucherCode: validatedVoucher?.code || null,
            grandTotal: data.finalAmount,
            paymentMethod: selectedCheckoutPaymentMethod,
            reservationId
          },
          createdBy: user?.id
        });

        // Update reservation paidAmount
        await apiRequest("PATCH", `/api/reservations/${reservationId}`, {
          paidAmount: String(data.finalAmount)
        });

        // Now attempt checkout - this will validate balance
        try {
          await apiRequest("POST", `/api/reservations/${reservationId}/check-out`, {});
        } catch (error: any) {
          // If balance due error, show option to override for managers
          if (error.message && error.message.includes('outstanding balance')) {
            const isManager = user?.role?.name === 'manager' || user?.role?.name === 'owner';
            if (isManager) {
              await confirm({
                title: "Manager Override Required",
                description: `${error.message}\n\nAs a manager, do you want to override and check out anyway?`,
                confirmText: "Override & Check Out",
                cancelText: "Cancel",
                variant: "destructive",
                onConfirm: async () => {
                  await apiRequest("POST", `/api/reservations/${reservationId}/check-out`, {
                    overrideBalance: true,
                    overrideReason: 'Manager override from front desk'
                  });
                },
                onCancel: () => {
                  throw new Error('Checkout cancelled - payment required');
                }
              });
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }

        // Update voucher used count if voucher was used
        if (data.voucherId) {
          await apiRequest("POST", `/api/vouchers/redeem`, { voucherId: data.voucherId });
        }
      } else {
        // Legacy checkout flow for non-reservation guests
        await apiRequest("PUT", `/api/rooms/${data.roomId}`, {
          isOccupied: false,
          occupantDetails: null
        });

        if (data.finalAmount > 0) {
          await apiRequest("POST", "/api/transactions", {
            hotelId: user?.hotelId,
            txnType: selectedCheckoutPaymentMethod === 'cash' ? 'cash_in' : selectedCheckoutPaymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
            amount: String(data.finalAmount),
            paymentMethod: selectedCheckoutPaymentMethod,
            purpose: 'room_checkout_payment',
            reference: `Checkout - Room ${data.roomNumber} - ${data.guestName}${data.voucherId ? ` (Voucher Applied)` : ''}`,
            details: {
              roomNumber: data.roomNumber,
              guestName: data.guestName,
              checkInDate: selectedRoom?.occupantDetails?.checkInDate,
              checkOutDate: selectedRoom?.occupantDetails?.checkOutDate,
              numberOfNights: data.billingDetails?.numberOfNights || 1,
              subtotal: data.billingDetails?.subtotal || 0,
              roomCharges: data.billingDetails?.totalRoomCharges || 0,
              mealPlanCharges: data.billingDetails?.totalMealPlanCharges || 0,
              foodCharges: data.billingDetails?.totalFoodCharges || 0,
              taxBreakdown: data.billingDetails?.taxBreakdown || {},
              totalTax: data.billingDetails?.totalTax || 0,
              discountAmount: data.discountAmount,
              voucherCode: validatedVoucher?.code || null,
              grandTotal: data.finalAmount,
              paymentMethod: selectedCheckoutPaymentMethod
            },
            createdBy: user?.id
          });
        }

        if (data.voucherId) {
          await apiRequest("POST", `/api/vouchers/redeem`, { voucherId: data.voucherId });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
      toast({ title: "Guest checked out successfully" });
      
      // Print receipt automatically before clearing room data
      if (selectedRoom) {
        handlePrintReceipt(selectedRoom, 'checkout');
      }
      
      setIsCheckOutModalOpen(false);
      setSelectedRoom(null);
      setSelectedVoucher("");
      setVoucherCode("");
      setValidatedVoucher(null);
      setSelectedCheckoutPaymentMethod("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Checkout failed", 
        description: error.message || "Failed to check out guest",
        variant: "destructive" 
      });
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data: any) => {
      const room = rooms.find(r => r.id === data.roomId);
      const roomPrice = room?.roomType?.priceWalkin ? Number(room.roomType.priceWalkin) : 0;
      
      const plan = mealPlans.find(p => p.id === data.mealPlanId);
      const mealPlanPrice = plan && data.numberOfPersons 
        ? Number(plan.pricePerPerson) * Number(data.numberOfPersons) 
        : 0;
      
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
      
      const totalPrice = (roomPrice + mealPlanPrice) * nights;

      await apiRequest("POST", "/api/reservations", {
        hotelId: user?.hotelId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        roomId: data.roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfPersons: Number(data.numberOfPersons),
        mealPlanId: data.mealPlanId || null,
        roomPrice: String(roomPrice),
        mealPlanPrice: String(mealPlanPrice),
        totalPrice: String(totalPrice),
        specialRequests: data.specialRequests,
        status: 'confirmed',
        createdBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
      toast({ title: "Reservation created successfully" });
      reservationForm.reset();
      setIsReservationModalOpen(false);
      handlePrintReservationConfirmation();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create reservation", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const availableRooms = rooms.filter(r => !r.isOccupied);
  const occupiedRooms = rooms.filter(r => r.isOccupied);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const performingTasks = tasks.filter(t => t.status === 'performing');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const todaysCheckIns = occupiedRooms.filter(r => {
    const today = new Date().toDateString();
    const checkInDate = (r.occupantDetails as any)?.checkInDate;
    return checkInDate && new Date(checkInDate).toDateString() === today;
  });

  const todaysCheckOuts = occupiedRooms.filter(r => {
    const today = new Date().toDateString();
    const checkOutDate = (r.occupantDetails as any)?.checkOutDate;
    return checkOutDate && new Date(checkOutDate).toDateString() === today;
  });

  const handleTaskStatusUpdate = (task: any, newStatus: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  // Calculate checkout bill with taxes
  const calculateCheckoutBill = (room: any) => {
    const roomPricePerNight = room.occupantDetails?.roomPrice ? Number(room.occupantDetails.roomPrice) : 0;
    const checkInDate = room.occupantDetails?.checkInDate ? new Date(room.occupantDetails.checkInDate) : null;
    // Use actual checkout date (today) instead of booked checkout date for accurate billing
    const actualCheckOutDate = new Date();
    
    // Calculate number of NIGHTS with 2pm cutoff rule
    let numberOfNights = 1;
    if (checkInDate) {
      // Get date-only components (ignoring time) for check-in and check-out
      const checkInDateOnly = new Date(checkInDate);
      checkInDateOnly.setHours(0, 0, 0, 0);
      
      const checkOutDateOnly = new Date(actualCheckOutDate);
      checkOutDateOnly.setHours(0, 0, 0, 0);
      
      // Calculate base nights (full days between dates)
      const daysDiff = Math.floor((checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 3600 * 24));
      numberOfNights = Math.max(1, daysDiff);
      
      // Apply 2pm cutoff rule: if check-out time is after 2pm (14:00), charge an extra night
      const checkOutHour = actualCheckOutDate.getHours();
      const checkOutMinute = actualCheckOutDate.getMinutes();
      const checkOutTimeInMinutes = checkOutHour * 60 + checkOutMinute;
      const cutoffTimeInMinutes = 14 * 60; // 2pm = 14:00
      
      if (checkOutTimeInMinutes > cutoffTimeInMinutes) {
        numberOfNights += 1;
      }
    }
    
    const totalRoomCharges = roomPricePerNight * numberOfNights;
    const mealPlanCostPerNight = room.occupantDetails?.mealPlan?.totalCost || 0;
    const totalMealPlanCharges = parseFloat(mealPlanCostPerNight.toString()) * numberOfNights;
    const foodCharges = room.occupantDetails?.foodCharges || [];
    const totalFoodCharges = foodCharges.reduce((sum: number, charge: any) => sum + parseFloat(charge.totalAmount || 0), 0);
    
    // Get room service charges for this reservation
    const reservationId = room.currentReservationId || (room.occupantDetails as any)?.reservationId;
    const serviceCharges = reservationId 
      ? roomServiceCharges.filter((charge: any) => charge.reservationId === reservationId)
      : [];
    const totalServiceCharges = serviceCharges.reduce((sum: number, charge: any) => 
      sum + parseFloat(charge.totalCharge || 0), 0);
    
    const subtotal = totalRoomCharges + totalMealPlanCharges + totalFoodCharges + totalServiceCharges;

    // Apply voucher discount on subtotal first
    let discountAmount = 0;
    let discountedSubtotal = subtotal;
    
    if (validatedVoucher) {
      if (validatedVoucher.discountType === 'percentage') {
        // Apply percentage discount on subtotal (before tax)
        discountAmount = Math.round((subtotal * (parseFloat(validatedVoucher.discountAmount) / 100)) * 100) / 100;
        discountedSubtotal = Math.round((subtotal - discountAmount) * 100) / 100;
      } else if (validatedVoucher.discountType === 'fixed') {
        // Apply fixed discount on subtotal
        discountAmount = Math.min(parseFloat(validatedVoucher.discountAmount), subtotal);
        discountedSubtotal = Math.round((subtotal - discountAmount) * 100) / 100;
      }
    }

    // Get active taxes
    const activeTaxes = hotelTaxes.filter((tax: any) => tax.isActive);
    
    // Sort taxes to apply VAT first, then service tax, then luxury tax
    const taxOrder = ['vat', 'service_tax', 'luxury_tax'];
    const sortedTaxes = activeTaxes.sort((a: any, b: any) => {
      const aIndex = taxOrder.indexOf(a.taxType);
      const bIndex = taxOrder.indexOf(b.taxType);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    // Apply cascading taxes on discounted subtotal
    let runningTotal = discountedSubtotal;
    const taxBreakdown: any = {};
    
    sortedTaxes.forEach((tax: any) => {
      const taxRate = parseFloat(tax.percent) / 100;
      const taxAmount = Math.round((runningTotal * taxRate) * 100) / 100;
      const displayName = tax.taxType === 'vat' ? 'VAT' : 
                          tax.taxType === 'service_tax' ? 'Service Tax' : 
                          tax.taxType === 'luxury_tax' ? 'Luxury Tax' : tax.taxType;
      taxBreakdown[displayName] = {
        rate: parseFloat(tax.percent),
        amount: taxAmount
      };
      runningTotal = Math.round((runningTotal + taxAmount) * 100) / 100;
    });

    const totalTax = Object.values(taxBreakdown).reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Calculate grand total: discounted subtotal + tax
    let grandTotal = Math.round((discountedSubtotal + totalTax) * 100) / 100;

    // Calculate advance payment deductions
    const roomId = room.id;
    const guestName = room.occupantDetails?.name || '';
    const roomNumber = room.roomNumber || '';
    
    // Find all advance payment transactions for this specific room
    // Use exact roomId match for new transactions, fallback to reference string matching for legacy transactions
    const advancePayments = transactions.filter((txn: any) => {
      const isAdvancePayment = txn.purpose === 'room_advance_payment';
      
      // Prefer exact roomId match if available (new transactions)
      if (txn.details?.roomId) {
        return isAdvancePayment && txn.details.roomId === roomId;
      }
      
      // Fallback to reference string matching for legacy transactions (before this fix)
      const matchesRoom = txn.reference?.includes(`Room ${roomNumber}`);
      const matchesGuest = txn.reference?.includes(guestName);
      return isAdvancePayment && matchesRoom && matchesGuest;
    });
    
    // Sum up all advance payments
    const totalAdvancePayment = advancePayments.reduce((sum: number, txn: any) => {
      return sum + (parseFloat(txn.amount) || 0);
    }, 0);

    // Deduct advance payment from grand total
    const finalAmount = Math.max(0, Math.round((grandTotal - totalAdvancePayment) * 100) / 100);

    return {
      subtotal,
      discountedSubtotal,
      taxBreakdown,
      totalTax,
      discountAmount,
      advancePayment: totalAdvancePayment,
      grandTotal,
      finalAmount,
      numberOfNights,
      totalRoomCharges,
      mealPlanCostPerNight: parseFloat(mealPlanCostPerNight.toString()),
      totalMealPlanCharges: parseFloat(totalMealPlanCharges.toString()),
      totalFoodCharges,
      totalServiceCharges,
      serviceCharges
    };
  };

  const handleCheckIn = (room: any) => {
    setSelectedRoom(room);
    setGuestType("walkin");
    setOfficeName("");
    setIsCheckInModalOpen(true);
  };

  const handleCheckOut = (room: any) => {
    setSelectedRoom(room);
    setVoucherCode("");
    setValidatedVoucher(null);
    setSelectedCheckoutPaymentMethod("");
    setIsCheckOutModalOpen(true);
  };

  const handleExtendStay = (room: any) => {
    setSelectedRoom(room);
    const currentCheckoutDate = room.occupantDetails?.checkOutDate ? new Date(room.occupantDetails.checkOutDate) : new Date();
    setNewCheckoutDate(currentCheckoutDate);
    setIsExtendStayModalOpen(true);
  };

  const checkInFromReservationMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      await apiRequest("POST", `/api/reservations/${reservationId}/check-in`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "rooms"] });
      toast({ title: "Guest checked in successfully from reservation" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Check-in failed", 
        description: error.message || "Failed to check in guest from reservation",
        variant: "destructive" 
      });
    }
  });

  const handleCheckInFromReservation = (reservation: any) => {
    // Directly check in from reservation using the proper API endpoint
    checkInFromReservationMutation.mutate(reservation.id);
  };

  // Filter today's and upcoming reservations
  const todaysReservations = reservations.filter((res: any) => {
    const checkInDate = new Date(res.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate.getTime() === today.getTime() && res.status === 'confirmed';
  });

  const upcomingReservations = reservations.filter((res: any) => {
    const checkInDate = new Date(res.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate.getTime() > today.getTime() && res.status === 'confirmed';
  }).slice(0, 5); // Show only next 5

  const onSubmitCheckIn = (data: any) => {
    if (!selectedPaymentMethod && data.advancePayment && Number(data.advancePayment) > 0) {
      toast({ title: "Error", description: "Please select payment method for advance payment", variant: "destructive" });
      return;
    }
    if (guestType === "inhouse" && !officeName.trim()) {
      toast({ title: "Error", description: "Office name is required for in-house guests", variant: "destructive" });
      return;
    }
    checkInGuestMutation.mutate({ ...data, roomId: selectedRoom?.id, guestType, officeName: guestType === "inhouse" ? officeName : null });
  };

  const onSubmitReservation = (data: any) => {
    createReservationMutation.mutate(data);
  };

  const onSubmitRoomService = (data: any) => {
    // Room service functionality has been replaced with service charges modal
    toast({ title: "Please use the Service button on the room card" });
  };

  const onSubmitMaintenance = (data: any) => {
    createMaintenanceMutation.mutate(data);
  };

  const onSubmitCashDeposit = (data: any) => {
    createCashDepositMutation.mutate(data);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = !foodSearchQuery || item.name?.toLowerCase().includes(foodSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && item.active;
  });

  const addFoodItem = (item: MenuItem) => {
    const existing = foodOrderItems.find(i => i.item.id === item.id);
    if (existing) {
      setFoodOrderItems(foodOrderItems.map(i => 
        i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setFoodOrderItems([...foodOrderItems, { item, quantity: 1 }]);
    }
  };

  const removeFoodItem = (itemId: string) => {
    setFoodOrderItems(foodOrderItems.filter(i => i.item.id !== itemId));
  };

  const updateFoodQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFoodItem(itemId);
    } else {
      setFoodOrderItems(foodOrderItems.map(i => 
        i.item.id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const submitFoodOrder = async () => {
    if (!selectedRoom || foodOrderItems.length === 0) {
      toast({ title: "Error", description: "Please select a room and add items", variant: "destructive" });
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = foodOrderItems.reduce((sum, { item, quantity }) => 
        sum + Number(item.price) * quantity, 0
      );

      // Create itemized list for room service order
      const itemsList = foodOrderItems.map(({ item, quantity }) => 
        `${item.name} x ${quantity} - ${formatCurrency(Number(item.price) * quantity)}`
      ).join('\n');

      // Get current occupant details and add food charges
      const currentOccupantDetails = selectedRoom.occupantDetails || {};
      const existingFoodCharges = currentOccupantDetails.foodCharges || [];
      
      const newFoodCharge = {
        items: foodOrderItems.map(({ item, quantity }) => ({
          name: item.name,
          quantity,
          price: Number(item.price),
          total: Number(item.price) * quantity
        })),
        totalAmount,
        orderedAt: new Date().toISOString(),
        orderedBy: user?.username
      };

      // Update room with food charges in occupantDetails
      await apiRequest("PUT", `/api/rooms/${selectedRoom.id}`, {
        occupantDetails: {
          ...currentOccupantDetails,
          foodCharges: [...existingFoodCharges, newFoodCharge]
        }
      });

      // Create room service order for record keeping
      await apiRequest("POST", "/api/room-service-orders", {
        hotelId: user?.hotelId,
        roomId: selectedRoom.id,
        requestedBy: user?.id,
        status: 'completed',
        specialInstructions: `Food Order:\n${itemsList}\nTotal: ${formatCurrency(totalAmount)}`
      });

      toast({ title: "Food order added to room bill successfully" });
      setFoodOrderItems([]);
      setFoodSearchQuery("");
      setSelectedCategory("all");
      setIsFoodOrderModalOpen(false);
      setSelectedRoom(null);
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "room-service-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "rooms"] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit food order", variant: "destructive" });
    }
  };

  const handlePrintReceipt = (room: any, type: 'checkin' | 'checkout' | 'bill') => {
    const guest = room.occupantDetails;
    const mealPlan = guest?.mealPlan;
    const roomType = rooms.find(r => r.id === room.id)?.roomType;
    const hotelName = hotel?.name || 'HOTEL MANAGEMENT';
    const hotelAddress = hotel?.address || '';
    const hotelPhone = hotel?.phone || '';
    const hotelZip = hotel?.zip || '';
    const hotelVatNo = hotel?.vatNo || '';
    
    // Calculate bill for checkout
    const billCalc = type === 'checkout' ? calculateCheckoutBill(room) : null;
    
    let receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type === 'checkin' ? 'Check-in' : type === 'checkout' ? 'Check-out' : 'Bill'} Receipt</title>
          <style>
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              max-width: 300px;
              margin: 0 auto;
              padding: 10px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 5px 0; }
            .double-line { border-top: 2px solid #000; margin: 5px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 3px 0; }
            .total { font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${hotelName.toUpperCase()}</div>
          ${hotelAddress ? `<div class="center">${hotelAddress}</div>` : ''}
          ${hotelZip ? `<div class="center">Zip: ${hotelZip}</div>` : ''}
          ${hotelPhone ? `<div class="center">Phone: ${hotelPhone}</div>` : ''}
          ${hotelVatNo ? `<div class="center">VAT No: ${hotelVatNo}</div>` : ''}
          <div class="center">================================</div>
          <div class="center bold">${type === 'checkin' ? 'CHECK-IN RECEIPT' : type === 'checkout' ? 'CHECK-OUT RECEIPT' : 'BILL'}</div>
          <div class="center">================================</div>
          <br>
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>Time: ${new Date().toLocaleTimeString()}</div>
          <div>Receipt #: ${Date.now().toString().slice(-8)}</div>
          <div class="line"></div>
          <div class="bold">GUEST DETAILS</div>
          <div>Name: ${guest?.name || 'N/A'}</div>
          <div>Room: ${room.roomNumber}${roomType ? ` (${roomType.name})` : ''}</div>
          <div>Number of People: ${guest?.mealPlan?.numberOfPersons || 1}</div>
          ${guest?.phone ? `<div>Phone: ${guest.phone}</div>` : ''}
          ${guest?.email ? `<div>Email: ${guest.email}</div>` : ''}
          ${guest?.nationality ? `<div>Nationality: ${guest.nationality}</div>` : ''}
          ${guest?.idNumber ? `<div>ID: ${guest.idNumber}</div>` : ''}
          ${guest?.guestType ? `<div>Type: ${guest.guestType === 'inhouse' ? 'In-House' : 'Walk-in'}</div>` : ''}
          ${guest?.officeName ? `<div>Office: ${guest.officeName}</div>` : ''}
          <div class="line"></div>
          ${type === 'checkin' ? `
            <div class="bold">CHECK-IN INFORMATION</div>
            <div>Check-in: ${guest?.checkInDate ? new Date(guest.checkInDate).toLocaleDateString() : 'N/A'}</div>
            <div>Check-out: ${guest?.checkOutDate ? new Date(guest.checkOutDate).toLocaleDateString() : 'N/A'}</div>
            ${mealPlan ? `
              <div class="line"></div>
              <div class="bold">MEAL PLAN</div>
              <div>${mealPlan.planName} (${mealPlan.planType})</div>
              <div>${mealPlan.numberOfPersons} person(s) x ${formatCurrency(Number(mealPlan.pricePerPerson))}</div>
              <div class="bold">Total: ${formatCurrency(mealPlan.totalCost)}</div>
            ` : ''}
          ` : type === 'checkout' && billCalc ? `
            <div class="bold">CHECK-OUT INFORMATION</div>
            <div>Check-in: ${guest?.checkInDate ? new Date(guest.checkInDate).toLocaleDateString() : 'N/A'}</div>
            <div>Check-out: ${new Date().toLocaleDateString()}</div>
            <div>Duration: ${billCalc.numberOfNights} ${billCalc.numberOfNights === 1 ? 'night' : 'nights'}</div>
            <div class="line"></div>
            <div class="bold">CHARGES SUMMARY</div>
            ${billCalc.totalRoomCharges > 0 ? `
              <div class="item-row">
                <span>Room (${billCalc.numberOfNights}x${formatCurrency(Number(guest?.roomPrice || 0))}):</span>
                <span>${formatCurrency(billCalc.totalRoomCharges)}</span>
              </div>
            ` : ''}
            ${billCalc.totalMealPlanCharges > 0 ? `
              <div class="item-row">
                <span>Meal Plan (${billCalc.numberOfNights}x${formatCurrency(billCalc.mealPlanCostPerNight)}):</span>
                <span>${formatCurrency(billCalc.totalMealPlanCharges)}</span>
              </div>
            ` : ''}
            ${billCalc.totalFoodCharges > 0 && guest?.foodCharges?.length > 0 ? `
              <div class="bold" style="margin-top: 5px;">Food & Beverage:</div>
              ${guest.foodCharges.map((charge: any) => 
                charge.items.map((item: any) => `
                  <div class="item-row" style="font-size: 11px; padding-left: 10px;">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${formatCurrency(item.total)}</span>
                  </div>
                `).join('')
              ).join('')}
              <div class="item-row" style="padding-left: 10px;">
                <span class="bold">F&B Subtotal:</span>
                <span class="bold">${formatCurrency(billCalc.totalFoodCharges)}</span>
              </div>
            ` : ''}
            ${billCalc.totalServiceCharges > 0 && billCalc.serviceCharges?.length > 0 ? `
              <div class="bold" style="margin-top: 5px;">Room Service Charges:</div>
              ${billCalc.serviceCharges.map((charge: any) => `
                <div class="item-row" style="font-size: 11px; padding-left: 10px;">
                  <span>${charge.serviceName} (${charge.quantity} ${charge.unit})</span>
                  <span>${formatCurrency(parseFloat(charge.totalCharge))}</span>
                </div>
              `).join('')}
              <div class="item-row" style="padding-left: 10px;">
                <span class="bold">Service Subtotal:</span>
                <span class="bold">${formatCurrency(billCalc.totalServiceCharges)}</span>
              </div>
            ` : ''}
            <div class="line"></div>
            <div class="item-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(billCalc.subtotal)}</span>
            </div>
            ${billCalc.discountAmount > 0 ? `
              <div class="item-row">
                <span>Discount ${validatedVoucher ? `(${validatedVoucher.code})` : ''}:</span>
                <span>-${formatCurrency(billCalc.discountAmount)}</span>
              </div>
              <div class="item-row bold">
                <span>Discounted Subtotal:</span>
                <span>${formatCurrency(billCalc.discountedSubtotal)}</span>
              </div>
            ` : ''}
            ${Object.entries(billCalc.taxBreakdown).map(([name, tax]: [string, any]) => `
              <div class="item-row">
                <span>${name} (${tax.rate}%):</span>
                <span>${formatCurrency(tax.amount)}</span>
              </div>
            `).join('')}
            ${billCalc.totalTax > 0 ? `
              <div class="item-row">
                <span>Total Tax:</span>
                <span>${formatCurrency(billCalc.totalTax)}</span>
              </div>
            ` : ''}
            <div class="double-line"></div>
            <div class="item-row total">
              <span>GRAND TOTAL:</span>
              <span>${formatCurrency(billCalc.grandTotal)}</span>
            </div>
          ` : ''}
          <div class="double-line"></div>
          <div class="center">Served by: ${user?.username}</div>
          <div class="center">================================</div>
          <div class="center bold">THANK YOU FOR YOUR STAY!</div>
          <div class="center">================================</div>
          <br>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
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

        {/* Quick Actions - Grouped Operations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Front Desk Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guest Services */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Guest Services
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 dark:hover:bg-blue-950/30"
                  onClick={() => setIsCheckInModalOpen(true)}
                  data-testid="button-check-in"
                >
                  <UserCheck className="h-7 w-7 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Check-in Guest</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/20 dark:border-green-900 dark:hover:bg-green-950/30"
                  onClick={() => setIsReservationModalOpen(true)}
                  data-testid="button-new-reservation"
                >
                  <CalendarPlus className="h-7 w-7 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">New Booking</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900 dark:hover:bg-purple-950/30"
                  onClick={() => setIsViewReservationsModalOpen(true)}
                  data-testid="button-view-reservations"
                >
                  <CalendarCheck className="h-7 w-7 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">All Bookings</span>
                </Button>
              </div>
            </div>

            {/* Service Requests */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <HandPlatter className="h-4 w-4" />
                Service & Support
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900 dark:hover:bg-orange-950/30"
                  onClick={() => setIsFoodOrderModalOpen(true)}
                  data-testid="button-food-order"
                >
                  <Utensils className="h-7 w-7 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Food Order</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 border-teal-200 dark:bg-teal-950/20 dark:border-teal-900 dark:hover:bg-teal-950/30"
                  onClick={() => {
                    // Show room selector modal
                    if (occupiedRooms.length === 0) {
                      toast({ title: "No occupied rooms", description: "There are no occupied rooms to add service charges to", variant: "destructive" });
                    } else {
                      setIsRoomServiceModalOpen(true);
                    }
                  }}
                  data-testid="button-room-service"
                >
                  <HandPlatter className="h-7 w-7 text-teal-600" />
                  <span className="text-sm font-medium text-teal-900 dark:text-teal-100">Room Service</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/20 dark:border-red-900 dark:hover:bg-red-950/30"
                  onClick={() => setLocation('/front-desk/maintenance-requests')}
                  data-testid="button-maintenance-request"
                >
                  <Wrench className="h-7 w-7 text-red-600" />
                  <span className="text-sm font-medium text-red-900 dark:text-red-100">Maintenance</span>
                </Button>
              </div>
            </div>

            {/* Finance & Administrative */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Finance & Admin
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900 dark:hover:bg-emerald-950/30"
                  onClick={() => setIsCashDepositModalOpen(true)}
                  data-testid="button-cash-deposit"
                >
                  <DollarSign className="h-7 w-7 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Cash Deposit</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900 dark:hover:bg-indigo-950/30"
                  onClick={() => setLocation('/hall-bookings')}
                  data-testid="button-hall-bookings"
                >
                  <Building2 className="h-7 w-7 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Hall Bookings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950/20 dark:border-slate-700 dark:hover:bg-slate-950/30"
                  onClick={() => {
                    const room = rooms.find(r => r.isOccupied);
                    if (room) handlePrintReceipt(room, 'bill');
                    else toast({ title: "No occupied rooms to print", variant: "destructive" });
                  }}
                  data-testid="button-print-reports"
                >
                  <Printer className="h-7 w-7 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Print Bill</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Reservations */}
        {todaysReservations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5" />
                Today's Expected Arrivals ({todaysReservations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysReservations.map((reservation: any) => {
                  const room = rooms.find(r => r.id === reservation.roomId);
                  return (
                    <div 
                      key={reservation.id} 
                      className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20"
                      data-testid={`reservation-today-${reservation.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-lg" data-testid="text-guest-name">{reservation.guestName}</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              {reservation.guestPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              Room {room?.roomNumber || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>{reservation.numberOfPersons} {reservation.numberOfPersons === 1 ? 'person' : 'persons'}</span>
                            <span>Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleCheckInFromReservation(reservation)}
                        size="sm"
                        className="ml-4"
                        data-testid="button-quick-checkin"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Quick Check-in
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Reservations */}
        {upcomingReservations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingReservations.map((reservation: any) => {
                  const room = rooms.find(r => r.id === reservation.roomId);
                  return (
                    <div 
                      key={reservation.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`reservation-upcoming-${reservation.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium" data-testid="text-guest-name">{reservation.guestName}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="mr-4">Room {room?.roomNumber || 'N/A'}</span>
                          <span className="mr-4">Check-in: {new Date(reservation.checkInDate).toLocaleDateString()}</span>
                          <span>{reservation.numberOfPersons} {reservation.numberOfPersons === 1 ? 'person' : 'persons'}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {Math.ceil((new Date(reservation.checkInDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Room Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Room Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {rooms.slice(0, 12).map((room, index) => (
                <div
                  key={room.id}
                  className={`p-2 sm:p-3 md:p-4 border-2 rounded-lg text-center ${
                    room.isOccupied 
                      ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' 
                      : 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                  }`}
                  data-testid={`room-status-${index}`}
                >
                  <Bed className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 ${room.isOccupied ? 'text-red-600' : 'text-green-600'}`} />
                  <h3 className="font-medium text-sm sm:text-base text-foreground">{room.roomNumber}</h3>
                  <p className="text-xs text-muted-foreground mb-1 sm:mb-2">
                    {room.roomType?.name || 'Standard'}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={room.isOccupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                  >
                    {room.isOccupied ? 'Occupied' : 'Available'}
                  </Badge>
                  {room.isOccupied && room.occupantDetails ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-foreground font-medium">{(room.occupantDetails as any)?.name || 'Guest'}</p>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            let reservation = reservations.find((r: any) => 
                              r.roomId === room.id && r.status === 'checked_in'
                            );
                            
                            if (reservation) {
                              setSelectedReservationForService(reservation.id);
                              setIsServiceChargeModalOpen(true);
                            } else {
                              // Create a reservation for this checked-in room
                              try {
                                const occupantDetails = room.occupantDetails as any;
                                const response = await apiRequest("POST", "/api/reservations", {
                                  hotelId: user?.hotelId,
                                  guestName: occupantDetails?.name || 'Guest',
                                  guestEmail: occupantDetails?.email || '',
                                  guestPhone: occupantDetails?.phone || '',
                                  roomId: room.id,
                                  checkInDate: occupantDetails?.checkInDate || new Date().toISOString(),
                                  checkOutDate: occupantDetails?.checkOutDate || new Date(Date.now() + 86400000).toISOString(),
                                  numberOfPersons: occupantDetails?.mealPlan?.numberOfPersons || 1,
                                  mealPlanId: occupantDetails?.mealPlan?.planId || null,
                                  roomPrice: String(occupantDetails?.roomPrice || 0),
                                  mealPlanPrice: String(occupantDetails?.mealPlan?.totalCost || 0),
                                  totalPrice: String(parseFloat(occupantDetails?.roomPrice || 0) + parseFloat(occupantDetails?.mealPlan?.totalCost || 0)),
                                  guestType: occupantDetails?.guestType || 'walkin',
                                  status: 'checked_in',
                                  createdBy: user?.id
                                });
                                
                                const newReservation = await response.json();
                                setSelectedReservationForService(newReservation.id);
                                queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
                                setIsServiceChargeModalOpen(true);
                              } catch (error: any) {
                                toast({ 
                                  title: "Error creating reservation", 
                                  description: error.message || "Failed to create reservation for service",
                                  variant: "destructive" 
                                });
                              }
                            }
                          }}
                          className="h-6 text-xs px-2"
                          data-testid={`button-service-${index}`}
                        >
                          <HandPlatter className="h-3 w-3 mr-1" />
                          Service
                        </Button>
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
                          onClick={() => handleExtendStay(room)}
                          className="h-6 text-xs px-2"
                          data-testid={`button-extend-${index}`}
                        >
                          Extend
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
                  ) : !room.isOccupied ? (
                    <Button
                      size="sm"
                      className="mt-2 h-6 text-xs"
                      onClick={() => handleCheckIn(room)}
                      data-testid={`button-checkin-${index}`}
                    >
                      Check In
                    </Button>
                  ) : null}
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
                        <Badge className={getStatusColor(task.status || 'pending')} variant="secondary">
                          {task.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
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
                        <Badge className={getStatusColor(order.status || 'pending')} variant="secondary">
                          {order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
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
            
            {/* Guest Search Feature */}
            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Search Existing Guest</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedGuest(null);
                    setGuestSearchQuery("");
                    checkInForm.reset();
                  }}
                  data-testid="button-clear-guest"
                >
                  Clear
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-guest"
                />
              </div>
              
              {guestSearchQuery && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {guests.filter((guest: any) => {
                    const search = guestSearchQuery.toLowerCase();
                    return (
                      guest.firstName.toLowerCase().includes(search) ||
                      guest.lastName.toLowerCase().includes(search) ||
                      guest.phone.toLowerCase().includes(search)
                    );
                  }).length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No guests found. Enter details below to check in a new guest.
                    </div>
                  ) : (
                    guests.filter((guest: any) => {
                      const search = guestSearchQuery.toLowerCase();
                      return (
                        guest.firstName.toLowerCase().includes(search) ||
                        guest.lastName.toLowerCase().includes(search) ||
                        guest.phone.toLowerCase().includes(search)
                      );
                    }).map((guest: any) => (
                      <button
                        key={guest.id}
                        type="button"
                        onClick={() => {
                          setSelectedGuest(guest);
                          setGuestSearchQuery("");
                          checkInForm.setValue("guestName", `${guest.firstName} ${guest.lastName}`);
                          checkInForm.setValue("guestEmail", guest.email || "");
                          checkInForm.setValue("guestPhone", guest.phone || "");
                          checkInForm.setValue("idNumber", guest.idNumber || "");
                          checkInForm.setValue("nationality", guest.nationality || "");
                          toast({ title: `Selected guest: ${guest.firstName} ${guest.lastName}` });
                        }}
                        className="w-full p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                        data-testid={`button-select-guest-${guest.id}`}
                      >
                        <div className="font-medium">{guest.firstName} {guest.lastName}</div>
                        <div className="text-sm text-muted-foreground">{guest.phone}</div>
                        {guest.email && <div className="text-xs text-muted-foreground">{guest.email}</div>}
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {selectedGuest && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        ✓ Guest Selected: {selectedGuest.firstName} {selectedGuest.lastName}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">{selectedGuest.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
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
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Country of origin" data-testid="input-nationality" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Guest Type</h4>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={guestType === 'walkin' ? 'default' : 'outline'}
                      onClick={() => { setGuestType('walkin'); setOfficeName(''); }}
                      className="flex-1"
                      data-testid="button-guest-type-walkin"
                    >
                      Walk-in
                    </Button>
                    <Button
                      type="button"
                      variant={guestType === 'inhouse' ? 'default' : 'outline'}
                      onClick={() => setGuestType('inhouse')}
                      className="flex-1"
                      data-testid="button-guest-type-inhouse"
                    >
                      In-House
                    </Button>
                  </div>
                  {guestType === 'inhouse' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Office Name *</label>
                      <Input 
                        value={officeName}
                        onChange={(e) => setOfficeName(e.target.value)}
                        placeholder="Enter office/company name"
                        data-testid="input-office-name"
                      />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {selectedRoom && selectedRoom.roomType && (
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Room Rate ({guestType === 'inhouse' ? 'In-House' : 'Walk-in'}):</span>
                        <span className="font-semibold">
                          NPR {parseFloat(guestType === 'inhouse' ? (selectedRoom.roomType.priceInhouse || '0') : (selectedRoom.roomType.priceWalkin || '0')).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={checkInForm.control}
                    name="mealPlanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Plan (Optional)</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="select-meal-plan"
                          >
                            <option value="">No meal plan</option>
                            {mealPlans.map((plan: any) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.planType} - {plan.planName} (NPR {parseFloat(plan.pricePerPerson).toFixed(2)}/person)
                              </option>
                            ))}
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {checkInForm.watch('mealPlanId') && (
                    <FormField
                      control={checkInForm.control}
                      name="numberOfPersons"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Persons</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" placeholder="1" data-testid="input-number-of-persons" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  
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

        {/* Checkout Modal */}
        <Dialog open={isCheckOutModalOpen} onOpenChange={setIsCheckOutModalOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Guest Check-out</DialogTitle>
            </DialogHeader>
            
            {selectedRoom && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Room & Guest Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Room Number</p>
                        <p className="font-semibold">{selectedRoom.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Room Type</p>
                        <p className="font-semibold">{selectedRoom.occupantDetails?.roomTypeName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Room Price</p>
                        <p className="font-semibold">{formatCurrency(Number(selectedRoom.occupantDetails?.roomPrice || 0))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Guest Name</p>
                        <p className="font-semibold">{selectedRoom.occupantDetails?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Number of People</p>
                        <p className="font-semibold">{selectedRoom.occupantDetails?.mealPlan?.numberOfPersons || 1}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in Date</p>
                        <p className="font-semibold">{selectedRoom.occupantDetails?.checkInDate ? formatDate(selectedRoom.occupantDetails.checkInDate) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-out Date</p>
                        <p className="font-semibold">{selectedRoom.occupantDetails?.checkOutDate ? formatDate(selectedRoom.occupantDetails.checkOutDate) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    {selectedRoom.occupantDetails?.mealPlan && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Meal Plan</p>
                        <p className="text-sm">{selectedRoom.occupantDetails.mealPlan.planType} - {selectedRoom.occupantDetails.mealPlan.planName}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRoom.occupantDetails.mealPlan.numberOfPersons} person(s) × NPR {parseFloat(selectedRoom.occupantDetails.mealPlan.pricePerPerson).toFixed(2)} = NPR {parseFloat(selectedRoom.occupantDetails.mealPlan.totalCost).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Apply Discount Voucher (Optional)</label>
                    <div className="flex gap-2">
                      <Input
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Enter voucher code"
                        className="flex-1"
                        data-testid="input-voucher-code"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidateVoucher}
                        disabled={isValidatingVoucher || !voucherCode.trim()}
                        data-testid="button-validate-voucher"
                      >
                        {isValidatingVoucher ? "Validating..." : "Apply"}
                      </Button>
                    </div>
                    {validatedVoucher && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          ✓ Voucher "{validatedVoucher.code}" applied: {validatedVoucher.discountType === 'percentage' ? `${validatedVoucher.discountAmount}%` : `NPR ${parseFloat(validatedVoucher.discountAmount).toFixed(2)}`} off
                        </p>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const billCalc = calculateCheckoutBill(selectedRoom);
                    const roomPricePerNight = selectedRoom.occupantDetails?.roomPrice || 0;

                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-sm sm:text-base">Room Charges ({billCalc.numberOfNights} {billCalc.numberOfNights === 1 ? 'night' : 'nights'} × NPR {parseFloat(roomPricePerNight.toString()).toFixed(2)})</span>
                            <span className="font-medium text-sm sm:text-base shrink-0" data-testid="checkout-room-price">NPR {billCalc.totalRoomCharges.toFixed(2)}</span>
                          </div>
                          {billCalc.totalMealPlanCharges > 0 && (
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-sm sm:text-base">Meal Plan Charges ({billCalc.numberOfNights} {billCalc.numberOfNights === 1 ? 'night' : 'nights'} × NPR {billCalc.mealPlanCostPerNight.toFixed(2)})</span>
                              <span className="font-medium text-sm sm:text-base shrink-0" data-testid="checkout-meal-price">NPR {billCalc.totalMealPlanCharges.toFixed(2)}</span>
                            </div>
                          )}
                          {billCalc.totalFoodCharges > 0 && (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">Food & Beverage:</div>
                              {selectedRoom.occupantDetails?.foodCharges?.map((charge: any, chargeIdx: number) => (
                                <div key={chargeIdx} className="pl-4 space-y-0.5">
                                  {charge.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="flex justify-between text-sm text-muted-foreground">
                                      <span>{item.name} × {item.quantity}</span>
                                      <span>NPR {item.total.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                              <div className="flex justify-between font-medium text-sm pl-4 pt-1 border-t">
                                <span>F&B Subtotal:</span>
                                <span data-testid="checkout-food-price">NPR {billCalc.totalFoodCharges.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                          {billCalc.totalServiceCharges > 0 && (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">Room Service Charges:</div>
                              {billCalc.serviceCharges.map((charge: any, chargeIdx: number) => (
                                <div key={chargeIdx} className="pl-4 flex justify-between text-sm text-muted-foreground">
                                  <span>{charge.serviceName} ({charge.quantity} {charge.unit})</span>
                                  <span>NPR {parseFloat(charge.totalCharge).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-medium text-sm pl-4 pt-1 border-t">
                                <span>Service Subtotal:</span>
                                <span data-testid="checkout-service-price">NPR {billCalc.totalServiceCharges.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t">
                            <span>Subtotal</span>
                            <span data-testid="checkout-subtotal">NPR {billCalc.subtotal.toFixed(2)}</span>
                          </div>
                          {billCalc.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount {validatedVoucher ? `(${validatedVoucher.code})` : ''}</span>
                              <span data-testid="checkout-discount">- NPR {billCalc.discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {billCalc.discountAmount > 0 && (
                            <div className="flex justify-between pt-1 border-t font-medium">
                              <span>Discounted Subtotal</span>
                              <span data-testid="checkout-discounted-subtotal">NPR {billCalc.discountedSubtotal.toFixed(2)}</span>
                            </div>
                          )}
                          {Object.keys(billCalc.taxBreakdown).map((taxType) => {
                            const details = billCalc.taxBreakdown[taxType];
                            return (
                              <div key={taxType} className="flex justify-between text-sm">
                                <span>{taxType} ({details.rate}%):</span>
                                <span data-testid={`checkout-tax-${taxType.toLowerCase().replace(/\s+/g, '-')}`}>NPR {details.amount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                          {billCalc.totalTax > 0 && (
                            <div className="flex justify-between pt-1 border-t font-medium">
                              <span>Total Tax</span>
                              <span data-testid="checkout-total-tax">NPR {billCalc.totalTax.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total Amount</span>
                            <span data-testid="checkout-total">NPR {billCalc.grandTotal.toFixed(2)}</span>
                          </div>
                          {billCalc.advancePayment > 0 && (
                            <div className="flex justify-between text-blue-600">
                              <span>Advance Payment Paid</span>
                              <span data-testid="checkout-advance-payment">- NPR {billCalc.advancePayment.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-xl pt-2 border-t border-2">
                            <span>Amount to Pay</span>
                            <span className="text-primary" data-testid="checkout-final-amount">NPR {billCalc.finalAmount.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  <div>
                    <label className="text-sm font-medium mb-2 block">Payment Method</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        variant={selectedCheckoutPaymentMethod === 'cash' ? 'default' : 'outline'}
                        onClick={() => setSelectedCheckoutPaymentMethod('cash')}
                        className="flex-1"
                        data-testid="button-checkout-payment-cash"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cash
                      </Button>
                      <Button
                        type="button"
                        variant={selectedCheckoutPaymentMethod === 'pos' ? 'default' : 'outline'}
                        onClick={() => setSelectedCheckoutPaymentMethod('pos')}
                        className="flex-1"
                        data-testid="button-checkout-payment-pos"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        POS
                      </Button>
                      <Button
                        type="button"
                        variant={selectedCheckoutPaymentMethod === 'fonepay' ? 'default' : 'outline'}
                        onClick={() => setSelectedCheckoutPaymentMethod('fonepay')}
                        className="flex-1"
                        data-testid="button-checkout-payment-fonepay"
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Fonepay
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      className="flex-1"
                      disabled={!selectedCheckoutPaymentMethod || checkOutGuestMutation.isPending}
                      onClick={() => {
                        const billCalc = calculateCheckoutBill(selectedRoom);

                        checkOutGuestMutation.mutate({
                          roomId: selectedRoom.id,
                          roomNumber: selectedRoom.roomNumber,
                          guestName: selectedRoom.occupantDetails?.name || 'Guest',
                          totalAmount: billCalc.subtotal + billCalc.totalTax,
                          discountAmount: billCalc.discountAmount,
                          finalAmount: billCalc.finalAmount,
                          voucherId: validatedVoucher?.id || undefined,
                          billingDetails: billCalc
                        });
                      }}
                      data-testid="button-confirm-checkout"
                    >
                      {checkOutGuestMutation.isPending ? "Processing..." : "Complete Check-out & Print Receipt"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setIsCheckOutModalOpen(false);
                        setSelectedRoom(null);
                        setSelectedVoucher("");
                        setVoucherCode("");
                        setValidatedVoucher(null);
                        setSelectedCheckoutPaymentMethod("");
                      }}
                      data-testid="button-cancel-checkout"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Extend Stay Modal */}
        <Dialog open={isExtendStayModalOpen} onOpenChange={setIsExtendStayModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Extend Guest Stay</DialogTitle>
            </DialogHeader>
            
            {selectedRoom && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Room:</span>
                    <span className="text-sm">{selectedRoom.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Guest:</span>
                    <span className="text-sm">{selectedRoom.occupantDetails?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Current Checkout:</span>
                    <span className="text-sm">
                      {selectedRoom.occupantDetails?.checkOutDate ? formatDate(selectedRoom.occupantDetails.checkOutDate) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">New Checkout Date</label>
                  <Calendar
                    mode="single"
                    selected={newCheckoutDate}
                    onSelect={setNewCheckoutDate}
                    disabled={(date) => {
                      const checkInDate = selectedRoom.occupantDetails?.checkInDate ? new Date(selectedRoom.occupantDetails.checkInDate) : new Date();
                      return date <= checkInDate;
                    }}
                    className="rounded-md border"
                    data-testid="calendar-extend-checkout"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    disabled={!newCheckoutDate || extendStayMutation.isPending}
                    onClick={() => {
                      if (newCheckoutDate && selectedRoom) {
                        extendStayMutation.mutate({
                          roomId: selectedRoom.id,
                          newCheckoutDate: newCheckoutDate
                        });
                      }
                    }}
                    data-testid="button-confirm-extend"
                  >
                    {extendStayMutation.isPending ? "Updating..." : "Confirm Extension"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setIsExtendStayModalOpen(false);
                      setSelectedRoom(null);
                      setNewCheckoutDate(undefined);
                    }}
                    data-testid="button-cancel-extend"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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
                  
                  <FormField
                    control={reservationForm.control}
                    name="numberOfPersons"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Persons *</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" placeholder="1" data-testid="input-reservation-persons" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={reservationForm.control}
                    name="mealPlanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Plan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-reservation-meal-plan">
                              <SelectValue placeholder="Select meal plan (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mealPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.planName} - {formatCurrency(Number(plan.pricePerPerson))}/person/day
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {reservationForm.watch("roomId") && reservationForm.watch("checkInDate") && reservationForm.watch("checkOutDate") && (
                  <Card className="bg-muted">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between font-medium">
                          <span>Pricing Summary:</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Room:</span>
                          <span>{(() => {
                            const room = rooms.find(r => r.id === reservationForm.watch("roomId"));
                            return room?.roomType?.name || 'N/A';
                          })()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Room Price/Night:</span>
                          <span>{(() => {
                            const room = rooms.find(r => r.id === reservationForm.watch("roomId"));
                            const price = room?.roomType?.priceWalkin;
                            return price ? formatCurrency(Number(price)) : 'N/A';
                          })()}</span>
                        </div>
                        {reservationForm.watch("mealPlanId") && (
                          <div className="flex justify-between">
                            <span>Meal Plan ({reservationForm.watch("numberOfPersons") || 0} persons):</span>
                            <span>{(() => {
                              const plan = mealPlans.find(p => p.id === reservationForm.watch("mealPlanId"));
                              const persons = Number(reservationForm.watch("numberOfPersons")) || 0;
                              return plan ? `${formatCurrency(Number(plan.pricePerPerson))} × ${persons} = ${formatCurrency(Number(plan.pricePerPerson) * persons)}/night` : 'N/A';
                            })()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Number of Nights:</span>
                          <span>{(() => {
                            const checkIn = reservationForm.watch("checkInDate");
                            const checkOut = reservationForm.watch("checkOutDate");
                            if (checkIn && checkOut) {
                              const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
                              return nights > 0 ? nights : 0;
                            }
                            return 0;
                          })()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-2 border-t">
                          <span>Estimated Total:</span>
                          <span>{(() => {
                            const room = rooms.find(r => r.id === reservationForm.watch("roomId"));
                            const roomPrice = room?.roomType?.priceWalkin ? Number(room.roomType.priceWalkin) : 0;
                            const plan = mealPlans.find(p => p.id === reservationForm.watch("mealPlanId"));
                            const mealPrice = plan && reservationForm.watch("numberOfPersons") 
                              ? Number(plan.pricePerPerson) * Number(reservationForm.watch("numberOfPersons")) 
                              : 0;
                            const checkIn = reservationForm.watch("checkInDate");
                            const checkOut = reservationForm.watch("checkOutDate");
                            let nights = 0;
                            if (checkIn && checkOut) {
                              nights = Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));
                            }
                            const total = (roomPrice + mealPrice) * nights;
                            return formatCurrency(total);
                          })()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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

        {/* Room Service Modal - Select Room First */}
        <Dialog open={isRoomServiceModalOpen} onOpenChange={setIsRoomServiceModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Room Service Charge</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Select Room *</Label>
                <Select onValueChange={(roomId) => {
                  const room = occupiedRooms.find(r => r.id === roomId);
                  if (room && room.occupantDetails) {
                    // Try to find reservation first
                    const reservation = reservations.find(r => 
                      r.roomId === room.id && r.status === 'checked_in'
                    );
                    
                    if (reservation) {
                      setSelectedReservationForService(reservation.id);
                      setIsRoomServiceModalOpen(false);
                      setIsServiceChargeModalOpen(true);
                    } else {
                      // If no reservation found in new system, create a temporary one
                      // This handles rooms checked in using the old system
                      const occupantData = room.occupantDetails as any;
                      
                      // Create a reservation for this room
                      apiRequest("POST", "/api/hotels/current/reservations", {
                        guestName: occupantData.name || "Guest",
                        guestEmail: occupantData.email || "",
                        guestPhone: occupantData.phone || "",
                        roomId: room.id,
                        checkInDate: occupantData.checkInDate || new Date().toISOString(),
                        checkOutDate: occupantData.checkOutDate || new Date(Date.now() + 86400000).toISOString(),
                        numberOfPersons: occupantData.numberOfPersons || 1,
                        roomPrice: occupantData.roomPrice || "0",
                        mealPlanPrice: "0",
                        totalPrice: occupantData.roomPrice || "0",
                        paidAmount: occupantData.advancePayment || "0",
                        guestType: occupantData.guestType || 'walkin',
                        status: 'checked_in'
                      }).then((newReservation: any) => {
                        setSelectedReservationForService(newReservation.id);
                        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
                        setIsRoomServiceModalOpen(false);
                        setIsServiceChargeModalOpen(true);
                      }).catch((error: any) => {
                        toast({ 
                          title: "Error creating reservation", 
                          description: error.message,
                          variant: "destructive" 
                        });
                      });
                    }
                  }
                }}>
                  <SelectTrigger data-testid="select-room-for-service">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupiedRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} - {(room.occupantDetails as any)?.name || 'Guest'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setIsRoomServiceModalOpen(false)}
                data-testid="button-cancel-room-service"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Maintenance Request Modal */}
        <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Maintenance Request to Manager</DialogTitle>
            </DialogHeader>
            
            <Form {...maintenanceForm}>
              <form onSubmit={maintenanceForm.handleSubmit(onSubmitMaintenance)} className="space-y-4">
                <FormField
                  control={maintenanceForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Brief description" data-testid="input-maintenance-title" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={maintenanceForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Room/Area" data-testid="input-maintenance-location" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={maintenanceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Detailed description..." rows={3} data-testid="textarea-maintenance-description" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={maintenanceForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-maintenance-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createMaintenanceMutation.isPending}
                    data-testid="button-submit-maintenance"
                  >
                    {createMaintenanceMutation.isPending ? "Sending..." : "Send to Manager"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsMaintenanceModalOpen(false)}
                    data-testid="button-cancel-maintenance"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Cash Deposit Modal */}
        <Dialog open={isCashDepositModalOpen} onOpenChange={setIsCashDepositModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Cash Deposit Request to Finance</DialogTitle>
            </DialogHeader>
            
            <Form {...cashDepositForm}>
              <form onSubmit={cashDepositForm.handleSubmit(onSubmitCashDeposit)} className="space-y-4">
                <FormField
                  control={cashDepositForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-deposit-amount" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cashDepositForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-deposit-method">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="pos">POS</SelectItem>
                          <SelectItem value="fonepay">Fonepay</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cashDepositForm.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Reason for deposit..." rows={2} data-testid="textarea-deposit-purpose" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createCashDepositMutation.isPending}
                    data-testid="button-submit-deposit"
                  >
                    {createCashDepositMutation.isPending ? "Sending..." : "Send to Finance"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsCashDepositModalOpen(false)}
                    data-testid="button-cancel-deposit"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Food Order Modal */}
        <Dialog open={isFoodOrderModalOpen} onOpenChange={setIsFoodOrderModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Food Order - Add to Room Bill</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Room</label>
                  <Select onValueChange={(value) => setSelectedRoom(occupiedRooms.find(r => r.id === value))}>
                    <SelectTrigger data-testid="select-food-order-room">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {occupiedRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} - {(room.occupantDetails as any)?.name || 'Guest'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Search Food</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name..."
                        value={foodSearchQuery}
                        onChange={(e) => setFoodSearchQuery(e.target.value)}
                        className="pl-8"
                        data-testid="input-food-search"
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="select-food-category">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {menuCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded p-2">
                {filteredMenuItems.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No menu items found
                  </div>
                ) : (
                  filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded p-3 hover:bg-accent cursor-pointer"
                      onClick={() => addFoodItem(item)}
                      data-testid={`food-item-${item.id}`}
                    >
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <p className="text-sm font-bold mt-1">{formatCurrency(Number(item.price || 0))}</p>
                    </div>
                  ))
                )}
              </div>

              {foodOrderItems.length > 0 && (
                <div className="border rounded p-3 space-y-2">
                  <h3 className="font-bold">Order Items</h3>
                  {foodOrderItems.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center justify-between" data-testid={`order-item-${item.id}`}>
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFoodQuantity(item.id, quantity - 1)}
                          data-testid={`decrease-qty-${item.id}`}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center" data-testid={`qty-${item.id}`}>{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFoodQuantity(item.id, quantity + 1)}
                          data-testid={`increase-qty-${item.id}`}
                        >
                          +
                        </Button>
                        <span className="w-24 text-right font-bold">
                          {formatCurrency(Number(item.price) * quantity)}
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFoodItem(item.id)}
                          data-testid={`remove-item-${item.id}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span data-testid="total-amount">
                        {formatCurrency(
                          foodOrderItems.reduce((sum, { item, quantity }) => 
                            sum + Number(item.price) * quantity, 0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  className="flex-1"
                  onClick={submitFoodOrder}
                  disabled={!selectedRoom || foodOrderItems.length === 0}
                  data-testid="button-submit-food-order"
                >
                  Add to Room Bill
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setIsFoodOrderModalOpen(false);
                    setFoodOrderItems([]);
                    setFoodSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedRoom(null);
                  }}
                  data-testid="button-cancel-food-order"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View All Reservations Modal - Calendar View */}
        <Dialog open={isViewReservationsModalOpen} onOpenChange={setIsViewReservationsModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reservations Calendar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No reservations found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCalendarDate(newDate);
                      }}
                      data-testid="button-prev-month"
                    >
                      ← Previous
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCalendarDate(newDate);
                      }}
                      data-testid="button-next-month"
                    >
                      Next →
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-semibold text-sm py-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {(() => {
                      const year = calendarDate.getFullYear();
                      const month = calendarDate.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const daysInMonth = lastDay.getDate();
                      const startingDayOfWeek = firstDay.getDay();
                      
                      const days = [];
                      
                      // Empty cells before first day
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(<div key={`empty-${i}`} className="aspect-square" />);
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const currentDate = new Date(year, month, day, 0, 0, 0, 0);
                        
                        // Find reservations for this date - checking if current date falls within reservation period
                        const dayReservations = reservations.filter((res: any) => {
                          const checkIn = new Date(res.checkInDate);
                          const checkOut = new Date(res.checkOutDate);
                          
                          // Normalize all dates to midnight local time for accurate comparison
                          const checkInNormalized = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate(), 0, 0, 0, 0);
                          const checkOutNormalized = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate(), 0, 0, 0, 0);
                          const currentNormalized = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
                          
                          // Check if current date is within the stay period (inclusive of check-in, inclusive of check-out)
                          return currentNormalized.getTime() >= checkInNormalized.getTime() && 
                                 currentNormalized.getTime() <= checkOutNormalized.getTime();
                        });
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        currentDate.setHours(0, 0, 0, 0);
                        const isToday = currentDate.getTime() === today.getTime();
                        const isSelected = selectedCalendarDate && 
                          currentDate.toDateString() === selectedCalendarDate.toDateString();
                        
                        days.push(
                          <button
                            key={day}
                            onClick={() => setSelectedCalendarDate(currentDate)}
                            className={cn(
                              "aspect-square p-2 border rounded-lg hover:bg-muted transition-colors relative",
                              isToday && "border-blue-500 border-2",
                              isSelected && "bg-blue-100 dark:bg-blue-950",
                              dayReservations.length > 0 && "bg-green-50 dark:bg-green-950/20"
                            )}
                            data-testid={`calendar-day-${day}`}
                          >
                            <div className="text-sm font-medium">{day}</div>
                            {dayReservations.length > 0 && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                {dayReservations.slice(0, 3).map((_, idx) => (
                                  <div key={idx} className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      }
                      
                      return days;
                    })()}
                  </div>

                  {/* Reservations for selected date */}
                  {selectedCalendarDate && (() => {
                    const dayReservations = reservations.filter((res: any) => {
                      const checkIn = new Date(res.checkInDate);
                      const checkOut = new Date(res.checkOutDate);
                      
                      // Normalize all dates to midnight local time for accurate comparison
                      const checkInNormalized = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate(), 0, 0, 0, 0);
                      const checkOutNormalized = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate(), 0, 0, 0, 0);
                      const selectedNormalized = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), selectedCalendarDate.getDate(), 0, 0, 0, 0);
                      
                      // Check if selected date is within the stay period (inclusive of check-in, inclusive of check-out)
                      return selectedNormalized.getTime() >= checkInNormalized.getTime() && 
                             selectedNormalized.getTime() <= checkOutNormalized.getTime();
                    });

                    return dayReservations.length > 0 ? (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">
                          Reservations for {selectedCalendarDate.toLocaleDateString()} ({dayReservations.length})
                        </h4>
                        <div className="space-y-3">
                          {dayReservations.map((reservation: any) => {
                            const room = rooms.find(r => r.id === reservation.roomId);
                            const mealPlan = mealPlans.find(mp => mp.id === reservation.mealPlanId);
                            const checkInDate = new Date(reservation.checkInDate);
                            const checkOutDate = new Date(reservation.checkOutDate);
                            
                            // Normalize dates for accurate comparison
                            const checkInNormalized = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate(), 0, 0, 0, 0);
                            const checkOutNormalized = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate(), 0, 0, 0, 0);
                            const selectedNormalized = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), selectedCalendarDate.getDate(), 0, 0, 0, 0);
                            
                            const isCheckInDay = selectedNormalized.getTime() === checkInNormalized.getTime();
                            const isCheckOutDay = selectedNormalized.getTime() === checkOutNormalized.getTime();
                            const nights = Math.ceil((checkOutNormalized.getTime() - checkInNormalized.getTime()) / (1000 * 3600 * 24));

                            return (
                              <div 
                                key={reservation.id}
                                className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                                data-testid={`reservation-${reservation.id}`}
                              >
                                <div className="space-y-3">
                                  {/* Header with guest name and status */}
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-semibold text-lg" data-testid="text-guest-name">{reservation.guestName}</h5>
                                        <Badge variant="outline">{reservation.status}</Badge>
                                        {isCheckInDay && <Badge className="bg-green-500">Check-in Day</Badge>}
                                        {isCheckOutDay && <Badge className="bg-orange-500">Check-out Day</Badge>}
                                      </div>
                                    </div>
                                    {isCheckInDay && reservation.status === 'confirmed' && (
                                      <Button 
                                        size="sm"
                                        onClick={() => {
                                          handleCheckInFromReservation(reservation);
                                          setIsViewReservationsModalOpen(false);
                                        }}
                                        data-testid="button-quick-checkin-modal"
                                      >
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Check-in
                                      </Button>
                                    )}
                                  </div>

                                  {/* Guest Contact Details */}
                                  <div className="bg-muted/50 p-3 rounded-md">
                                    <h6 className="text-sm font-semibold mb-2 text-muted-foreground">Guest Contact</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Email:</span>
                                        <span className="text-muted-foreground">{reservation.guestEmail || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Phone:</span>
                                        <span className="text-muted-foreground">{reservation.guestPhone || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Reservation Details */}
                                  <div className="bg-muted/50 p-3 rounded-md">
                                    <h6 className="text-sm font-semibold mb-2 text-muted-foreground">Reservation Details</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Bed className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Room:</span>
                                        <span className="text-muted-foreground">
                                          {room?.roomNumber || 'N/A'} - {room?.roomType?.name || 'Standard'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Guests:</span>
                                        <span className="text-muted-foreground">{reservation.numberOfPersons} {reservation.numberOfPersons === 1 ? 'person' : 'persons'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Check-in:</span>
                                        <span className="text-muted-foreground">{checkInDate.toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Check-out:</span>
                                        <span className="text-muted-foreground">{checkOutDate.toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Duration:</span>
                                        <span className="text-muted-foreground">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                                      </div>
                                      {mealPlan && (
                                        <div className="flex items-center gap-2">
                                          <Utensils className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">Meal Plan:</span>
                                          <span className="text-muted-foreground">{mealPlan.planName}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Pricing Breakdown */}
                                  <div className="bg-muted/50 p-3 rounded-md">
                                    <h6 className="text-sm font-semibold mb-2 text-muted-foreground">Pricing</h6>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Room ({formatCurrency(Number(reservation.roomPrice || 0))} × {nights} {nights === 1 ? 'night' : 'nights'}):</span>
                                        <span className="font-medium">{formatCurrency(Number(reservation.roomPrice || 0) * nights)}</span>
                                      </div>
                                      {mealPlan && reservation.mealPlanPrice && Number(reservation.mealPlanPrice) > 0 && (
                                        <div className="flex justify-between">
                                          <span>Meal Plan ({formatCurrency(Number(reservation.mealPlanPrice))} × {nights} {nights === 1 ? 'night' : 'nights'}):</span>
                                          <span className="font-medium">{formatCurrency(Number(reservation.mealPlanPrice) * nights)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between pt-2 border-t font-semibold text-base">
                                        <span>Total Amount:</span>
                                        <span className="text-primary">{formatCurrency(Number(reservation.totalPrice || 0))}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Special Requests */}
                                  {reservation.specialRequests && (
                                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                                      <h6 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Special Requests
                                      </h6>
                                      <p className="text-sm text-muted-foreground">{reservation.specialRequests}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4 text-center text-muted-foreground">
                        <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No reservations on {selectedCalendarDate.toLocaleDateString()}</p>
                      </div>
                    );
                  })()}

                  {/* Legend */}
                  <div className="border-t pt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                      <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-50 dark:bg-green-950/20 border rounded"></div>
                      <span>Has Reservations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>Reservation Indicator</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Service Charge Modal */}
        <RoomServiceChargeModal
          open={isServiceChargeModalOpen}
          onOpenChange={setIsServiceChargeModalOpen}
          reservationId={selectedReservationForService}
        />
      </div>
    </DashboardLayout>
  );
}
