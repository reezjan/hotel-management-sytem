import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bed, Users, DoorOpen, Calendar as CalendarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function RoomOccupancy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [checkInDialog, setCheckInDialog] = useState(false);
  const [checkOutDialog, setCheckOutDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Room type management
  const [roomTypeDialog, setRoomTypeDialog] = useState(false);
  const [editRoomTypeDialog, setEditRoomTypeDialog] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [roomTypeName, setRoomTypeName] = useState("");
  const [priceWalkin, setPriceWalkin] = useState("");
  const [priceInhouse, setPriceInhouse] = useState("");
  
  // Room form states
  const [roomNumber, setRoomNumber] = useState("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");
  
  // Check-in form states
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [advancePayment, setAdvancePayment] = useState("");
  const [selectedMealPlanId, setSelectedMealPlanId] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState("");
  const [guestType, setGuestType] = useState<"inhouse" | "walkin">("walkin");
  const [officeName, setOfficeName] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  
  // Checkout states
  const [selectedCheckoutPaymentMethod, setSelectedCheckoutPaymentMethod] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [validatedVoucher, setValidatedVoucher] = useState<any>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  
  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/rooms"]
  });

  const { data: roomTypes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/room-types"]
  });

  const { data: reservations = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/reservations"]
  });

  const { data: mealPlans = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels", user?.hotelId, "meal-plans"],
    enabled: !!user?.hotelId
  });

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"],
    enabled: !!user?.hotelId
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    enabled: !!user?.hotelId
  });

  // Helper functions
  const resetRoomTypeForm = () => {
    setRoomTypeName("");
    setPriceWalkin("");
    setPriceInhouse("");
    setSelectedRoomType(null);
  };

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

  // Populate room type form when editing
  useEffect(() => {
    if (selectedRoomType && editRoomTypeDialog) {
      setRoomTypeName(selectedRoomType.name || "");
      setPriceWalkin(selectedRoomType.priceWalkin || "");
      setPriceInhouse(selectedRoomType.priceInhouse || "");
    } else if (!editRoomTypeDialog && !roomTypeDialog) {
      resetRoomTypeForm();
    }
  }, [selectedRoomType, editRoomTypeDialog, roomTypeDialog]);

  // Mutations
  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/rooms", data);
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
      await apiRequest("PUT", `/api/rooms/${id}`, data);
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

  // Room Type Mutations
  const createRoomTypeMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/room-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/room-types"] });
      toast({ title: "Success", description: "Room type created successfully!" });
      setRoomTypeDialog(false);
      resetRoomTypeForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create room type", variant: "destructive" });
    }
  });

  const updateRoomTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PUT", `/api/room-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/room-types"] });
      toast({ title: "Success", description: "Room type updated successfully!" });
      setEditRoomTypeDialog(false);
      resetRoomTypeForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update room type", variant: "destructive" });
    }
  });

  const deleteRoomTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/room-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/room-types"] });
      toast({ title: "Success", description: "Room type deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete room type", variant: "destructive" });
    }
  });

  const checkInGuestMutation = useMutation({
    mutationFn: async (data: any) => {
      const selectedMealPlan = mealPlans.find((plan) => plan.id === data.mealPlanId);
      const room = rooms.find(r => r.id === data.roomId);
      const roomType = roomTypes.find(rt => rt.id === room?.roomTypeId);
      
      if (!roomType) {
        throw new Error('Room type information is missing. Please ensure the room is properly configured.');
      }
      
      const price = data.guestType === "inhouse" ? roomType.priceInhouse : roomType.priceWalkin;
      const roomPrice = price ? Number(price) : 0;
      
      if (roomPrice <= 0) {
        throw new Error(`Room price is not configured for ${data.guestType} guests. Please configure room pricing first.`);
      }
      
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

      if (data.advancePayment && Number(data.advancePayment) > 0) {
        await apiRequest("POST", "/api/transactions", {
          hotelId: user?.hotelId,
          txnType: data.paymentMethod === 'cash' ? 'cash_in' : data.paymentMethod === 'pos' ? 'pos_in' : 'fonepay_in',
          amount: String(Number(data.advancePayment)),
          paymentMethod: data.paymentMethod,
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
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Guest checked in successfully" });
      resetCheckInForm();
      setCheckInDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Check-in failed", 
        description: error.message || "Failed to check in guest",
        variant: "destructive" 
      });
    }
  });

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
      if (!selectedCheckoutPaymentMethod || !['cash', 'pos', 'fonepay'].includes(selectedCheckoutPaymentMethod)) {
        throw new Error('Please select a payment method (Cash, POS, or Fonepay) before checking out');
      }

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
            numberOfDays: data.billingDetails?.numberOfDays || 1,
            subtotal: data.billingDetails?.subtotal || 0,
            roomCharges: data.billingDetails?.totalRoomCharges || 0,
            mealPlanCharges: data.billingDetails?.totalMealPlanCharges || 0,
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      toast({ title: "Guest checked out successfully" });
      resetCheckoutForm();
      setCheckOutDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Checkout failed", 
        description: error.message || "Failed to check out guest",
        variant: "destructive" 
      });
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

  const resetCheckInForm = () => {
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setIdNumber("");
    setNationality("");
    setCheckInDate(new Date());
    setCheckOutDate(undefined);
    setAdvancePayment("");
    setSelectedMealPlanId("");
    setNumberOfPersons("");
    setGuestType("walkin");
    setOfficeName("");
    setSelectedPaymentMethod("");
  };

  const resetCheckoutForm = () => {
    setVoucherCode("");
    setValidatedVoucher(null);
    setSelectedCheckoutPaymentMethod("");
  };

  const handleCheckIn = (room: any) => {
    setSelectedRoom(room);
    resetCheckInForm();
    setCheckInDialog(true);
  };

  const handleCheckOut = (room: any) => {
    setSelectedRoom(room);
    resetCheckoutForm();
    setCheckOutDialog(true);
  };

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

  const calculateCheckoutBill = (room: any) => {
    const roomPricePerDay = room.occupantDetails?.roomPrice ? Number(room.occupantDetails.roomPrice) : 0;
    const checkInDateObj = room.occupantDetails?.checkInDate ? new Date(room.occupantDetails.checkInDate) : null;
    const actualCheckOutDate = new Date();
    
    let numberOfDays = 1;
    if (checkInDateObj) {
      const timeDiff = actualCheckOutDate.getTime() - checkInDateObj.getTime();
      const gracePeriodMs = 2 * 60 * 60 * 1000;
      const adjustedTimeDiff = Math.max(0, timeDiff - gracePeriodMs);
      numberOfDays = Math.max(1, Math.ceil(adjustedTimeDiff / (1000 * 3600 * 24)));
    }
    
    const totalRoomCharges = roomPricePerDay * numberOfDays;
    const mealPlanCostPerDay = room.occupantDetails?.mealPlan?.totalCost || 0;
    const totalMealPlanCharges = parseFloat(mealPlanCostPerDay.toString()) * numberOfDays;
    const subtotal = totalRoomCharges + totalMealPlanCharges;

    let discountAmount = 0;
    let discountedSubtotal = subtotal;
    
    if (validatedVoucher) {
      if (validatedVoucher.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * (parseFloat(validatedVoucher.discountAmount) / 100)) * 100) / 100;
        discountedSubtotal = Math.round((subtotal - discountAmount) * 100) / 100;
      } else if (validatedVoucher.discountType === 'fixed') {
        discountAmount = Math.min(parseFloat(validatedVoucher.discountAmount), subtotal);
        discountedSubtotal = Math.round((subtotal - discountAmount) * 100) / 100;
      }
    }

    const activeTaxes = hotelTaxes.filter((tax: any) => tax.isActive);
    const taxOrder = ['vat', 'service_tax', 'luxury_tax'];
    const sortedTaxes = activeTaxes.sort((a: any, b: any) => {
      const aIndex = taxOrder.indexOf(a.taxType);
      const bIndex = taxOrder.indexOf(b.taxType);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

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
    let grandTotal = Math.round((discountedSubtotal + totalTax) * 100) / 100;

    const roomId = room.id;
    const guestName = room.occupantDetails?.name || '';
    const roomNumber = room.roomNumber || '';
    
    const advancePayments = transactions.filter((txn: any) => {
      const isAdvancePayment = txn.purpose === 'room_advance_payment';
      if (txn.details?.roomId) {
        return isAdvancePayment && txn.details.roomId === roomId;
      }
      const matchesRoom = txn.reference?.includes(`Room ${roomNumber}`);
      const matchesGuest = txn.reference?.includes(guestName);
      return isAdvancePayment && matchesRoom && matchesGuest;
    });
    
    const totalAdvancePayment = advancePayments.reduce((sum: number, txn: any) => {
      return sum + (parseFloat(txn.amount) || 0);
    }, 0);

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
      numberOfDays,
      totalRoomCharges,
      mealPlanCostPerDay: parseFloat(mealPlanCostPerDay.toString()),
      totalMealPlanCharges: parseFloat(totalMealPlanCharges.toString())
    };
  };

  const handleSubmitCheckIn = () => {
    if (!guestName.trim() || !guestPhone.trim() || !checkInDate || !checkOutDate) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (!selectedPaymentMethod && advancePayment && Number(advancePayment) > 0) {
      toast({ title: "Error", description: "Please select payment method for advance payment", variant: "destructive" });
      return;
    }

    if (guestType === "inhouse" && !officeName.trim()) {
      toast({ title: "Error", description: "Office name is required for in-house guests", variant: "destructive" });
      return;
    }

    checkInGuestMutation.mutate({
      roomId: selectedRoom?.id,
      guestName,
      guestEmail,
      guestPhone,
      idNumber,
      nationality,
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      advancePayment,
      mealPlanId: selectedMealPlanId,
      numberOfPersons,
      guestType,
      officeName: guestType === "inhouse" ? officeName : null,
      paymentMethod: selectedPaymentMethod
    });
  };

  const handleSubmitCheckout = () => {
    if (!selectedRoom) return;

    const billCalc = calculateCheckoutBill(selectedRoom);
    
    checkOutGuestMutation.mutate({
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      guestName: selectedRoom.occupantDetails?.name || '',
      totalAmount: billCalc.grandTotal,
      discountAmount: billCalc.discountAmount,
      finalAmount: billCalc.finalAmount,
      voucherId: validatedVoucher?.id,
      billingDetails: billCalc
    });
  };

  const handleSaveRoomType = () => {
    if (!roomTypeName.trim()) {
      toast({ title: "Error", description: "Room type name is required", variant: "destructive" });
      return;
    }
    const data = {
      hotelId: user?.hotelId,
      name: roomTypeName,
      priceWalkin: priceWalkin || "0",
      priceInhouse: priceInhouse || "0"
    };
    if (selectedRoomType && editRoomTypeDialog) {
      updateRoomTypeMutation.mutate({ id: selectedRoomType.id, data });
    } else {
      createRoomTypeMutation.mutate(data);
    }
  };

  // Calculate room metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.isOccupied).length;
  const availableRooms = totalRooms - occupiedRooms;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

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
      render: (value: any) => value ? value.name || 'N/A' : 'N/A'
    }
  ];

  const roomActions = [
    { 
      label: "Check In", 
      action: (row: any) => handleCheckIn(row),
      show: (row: any) => !row.isOccupied
    },
    { 
      label: "Check Out", 
      action: (row: any) => handleCheckOut(row),
      show: (row: any) => row.isOccupied
    },
    { 
      label: "Edit", 
      action: (row: any) => {
        setSelectedRoom(row);
        setEditDialog(true);
      }
    }
  ];

  const roomTypeColumns = [
    { key: "name", label: "Room Type Name", sortable: true },
    { 
      key: "priceWalkin", 
      label: "Walk-in Price", 
      sortable: true,
      render: (value: any) => `NPR ${Number(value || 0).toFixed(2)}`
    },
    { 
      key: "priceInhouse", 
      label: "In-house Price", 
      sortable: true,
      render: (value: any) => `NPR ${Number(value || 0).toFixed(2)}`
    }
  ];

  const roomTypeActions = [
    { 
      label: "Edit", 
      action: (row: any) => {
        setSelectedRoomType(row);
        setEditRoomTypeDialog(true);
      }
    },
    { 
      label: "Delete", 
      action: (row: any) => {
        if (confirm(`Are you sure you want to delete room type "${row.name}"?`)) {
          deleteRoomTypeMutation.mutate(row.id);
        }
      }, 
      variant: "destructive" as const 
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
            icon={<CalendarIcon />}
            iconColor="text-orange-500"
          />
        </div>

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

        {/* Room Types & Pricing Management */}
        <DataTable
          title="Room Types & Pricing"
          data={roomTypes}
          columns={roomTypeColumns}
          actions={roomTypeActions}
          onAdd={() => setRoomTypeDialog(true)}
          addButtonLabel="Add Room Type"
          searchPlaceholder="Search room types..."
        />

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

        {/* Check-In Dialog */}
        <Dialog open={checkInDialog} onOpenChange={(open) => {
          setCheckInDialog(open);
          if (!open) {
            setSelectedRoom(null);
            resetCheckInForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Check In - Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>Enter guest information to check in</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Guest Type</Label>
                <Select value={guestType} onValueChange={(value: any) => setGuestType(value)}>
                  <SelectTrigger data-testid="select-guest-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walkin">Walk-in Guest</SelectItem>
                    <SelectItem value="inhouse">In-House Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {guestType === "inhouse" && (
                <div className="space-y-2">
                  <Label htmlFor="office-name">Office/Company Name *</Label>
                  <Input
                    id="office-name"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    placeholder="Enter office or company name"
                    data-testid="input-office-name"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-name">Guest Name *</Label>
                  <Input
                    id="guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter guest name"
                    data-testid="input-guest-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-phone">Phone Number *</Label>
                  <Input
                    id="guest-phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Enter phone number"
                    data-testid="input-guest-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Enter email"
                    data-testid="input-guest-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id-number">ID Number</Label>
                  <Input
                    id="id-number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter ID number"
                    data-testid="input-id-number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Enter nationality"
                    data-testid="input-nationality"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meal Plan</Label>
                  <Select value={selectedMealPlanId} onValueChange={setSelectedMealPlanId}>
                    <SelectTrigger data-testid="select-meal-plan">
                      <SelectValue placeholder="Select meal plan (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealPlans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.planName} ({plan.planType}) - NPR {plan.pricePerPerson}/person
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedMealPlanId && (
                <div className="space-y-2">
                  <Label htmlFor="num-persons">Number of Persons</Label>
                  <Input
                    id="num-persons"
                    type="number"
                    value={numberOfPersons}
                    onChange={(e) => setNumberOfPersons(e.target.value)}
                    placeholder="Enter number of persons"
                    data-testid="input-num-persons"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-In Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkInDate && "text-muted-foreground"
                        )}
                        data-testid="button-checkin-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Check-Out Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkOutDate && "text-muted-foreground"
                        )}
                        data-testid="button-checkout-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advance-payment">Advance Payment</Label>
                  <Input
                    id="advance-payment"
                    type="number"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    placeholder="Enter advance amount"
                    data-testid="input-advance-payment"
                  />
                </div>
                {advancePayment && Number(advancePayment) > 0 && (
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="pos">POS</SelectItem>
                        <SelectItem value="fonepay">Fonepay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setCheckInDialog(false)} data-testid="button-cancel-checkin">
                  Cancel
                </Button>
                <Button onClick={handleSubmitCheckIn} disabled={checkInGuestMutation.isPending} data-testid="button-submit-checkin">
                  {checkInGuestMutation.isPending ? "Checking in..." : "Check In"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Check-Out Dialog */}
        <Dialog open={checkOutDialog} onOpenChange={(open) => {
          setCheckOutDialog(open);
          if (!open) {
            setSelectedRoom(null);
            resetCheckoutForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Check Out - Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>Review bill and complete checkout</DialogDescription>
            </DialogHeader>
            {selectedRoom && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h3 className="font-semibold">Guest Information</h3>
                  <div className="text-sm">
                    <p><span className="font-medium">Name:</span> {selectedRoom.occupantDetails?.name}</p>
                    <p><span className="font-medium">Phone:</span> {selectedRoom.occupantDetails?.phone}</p>
                    {selectedRoom.occupantDetails?.email && (
                      <p><span className="font-medium">Email:</span> {selectedRoom.occupantDetails?.email}</p>
                    )}
                  </div>
                </div>

                {(() => {
                  const billCalc = calculateCheckoutBill(selectedRoom);
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Room Charges ({billCalc.numberOfDays} nights):</span>
                          <span>{formatCurrency(billCalc.totalRoomCharges)}</span>
                        </div>
                        {billCalc.totalMealPlanCharges > 0 && (
                          <div className="flex justify-between">
                            <span>Meal Plan ({billCalc.numberOfDays} nights):</span>
                            <span>{formatCurrency(billCalc.totalMealPlanCharges)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(billCalc.subtotal)}</span>
                        </div>

                        {billCalc.discountAmount > 0 && (
                          <>
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-{formatCurrency(billCalc.discountAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discounted Subtotal:</span>
                              <span>{formatCurrency(billCalc.discountedSubtotal)}</span>
                            </div>
                          </>
                        )}

                        {Object.entries(billCalc.taxBreakdown).map(([name, details]: any) => (
                          <div key={name} className="flex justify-between text-sm">
                            <span>{name} ({details.rate}%):</span>
                            <span>{formatCurrency(details.amount)}</span>
                          </div>
                        ))}

                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Grand Total:</span>
                          <span>{formatCurrency(billCalc.grandTotal)}</span>
                        </div>

                        {billCalc.advancePayment > 0 && (
                          <>
                            <div className="flex justify-between text-blue-600">
                              <span>Advance Payment:</span>
                              <span>-{formatCurrency(billCalc.advancePayment)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                              <span>Amount Due:</span>
                              <span>{formatCurrency(billCalc.finalAmount)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="voucher-code">Apply Voucher Code</Label>
                        <div className="flex gap-2">
                          <Input
                            id="voucher-code"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            placeholder="Enter voucher code"
                            disabled={!!validatedVoucher}
                            data-testid="input-voucher-code"
                          />
                          {validatedVoucher ? (
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setVoucherCode("");
                                setValidatedVoucher(null);
                              }}
                              data-testid="button-remove-voucher"
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button 
                              onClick={handleValidateVoucher} 
                              disabled={isValidatingVoucher}
                              data-testid="button-apply-voucher"
                            >
                              {isValidatingVoucher ? "Validating..." : "Apply"}
                            </Button>
                          )}
                        </div>
                        {validatedVoucher && (
                          <p className="text-sm text-green-600">
                            Voucher "{validatedVoucher.code}" applied!
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Payment Method *</Label>
                        <Select value={selectedCheckoutPaymentMethod} onValueChange={setSelectedCheckoutPaymentMethod}>
                          <SelectTrigger data-testid="select-checkout-payment">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="pos">POS</SelectItem>
                            <SelectItem value="fonepay">Fonepay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button variant="outline" onClick={() => setCheckOutDialog(false)} data-testid="button-cancel-checkout">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitCheckout} 
                          disabled={checkOutGuestMutation.isPending || !selectedCheckoutPaymentMethod}
                          data-testid="button-submit-checkout"
                        >
                          {checkOutGuestMutation.isPending ? "Checking out..." : "Check Out"}
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog open={editDialog} onOpenChange={(open) => {
          setEditDialog(open);
          if (!open) {
            setSelectedRoom(null);
            setRoomNumber("");
            setSelectedRoomTypeId("");
          }
        }}>
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

        {/* Add Room Dialog */}
        <Dialog open={addDialog} onOpenChange={(open) => {
          setAddDialog(open);
          if (!open) {
            setRoomNumber("");
            setSelectedRoomTypeId("");
          }
        }}>
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

        {/* Add/Edit Room Type Dialog */}
        <Dialog open={roomTypeDialog || editRoomTypeDialog} onOpenChange={(open) => {
          if (!open) {
            setRoomTypeDialog(false);
            setEditRoomTypeDialog(false);
            resetRoomTypeForm();
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editRoomTypeDialog ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
              <DialogDescription>
                {editRoomTypeDialog ? 'Update room type and pricing information' : 'Create a new room type with pricing'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-type-name">Room Type Name *</Label>
                <Input
                  id="room-type-name"
                  value={roomTypeName}
                  onChange={(e) => setRoomTypeName(e.target.value)}
                  placeholder="e.g., Deluxe, Standard, Suite"
                  data-testid="input-room-type-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-walkin">Walk-in Price (NPR) *</Label>
                <Input
                  id="price-walkin"
                  type="number"
                  value={priceWalkin}
                  onChange={(e) => setPriceWalkin(e.target.value)}
                  placeholder="Enter walk-in price"
                  data-testid="input-price-walkin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-inhouse">In-house Price (NPR) *</Label>
                <Input
                  id="price-inhouse"
                  type="number"
                  value={priceInhouse}
                  onChange={(e) => setPriceInhouse(e.target.value)}
                  placeholder="Enter in-house price"
                  data-testid="input-price-inhouse"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setRoomTypeDialog(false);
                  setEditRoomTypeDialog(false);
                  resetRoomTypeForm();
                }} data-testid="button-cancel-room-type">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveRoomType} 
                  disabled={createRoomTypeMutation.isPending || updateRoomTypeMutation.isPending}
                  data-testid="button-save-room-type"
                >
                  {(createRoomTypeMutation.isPending || updateRoomTypeMutation.isPending) ? "Saving..." : editRoomTypeDialog ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
