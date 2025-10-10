import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CalendarCheck,
  Plus,
  Calendar as CalendarIcon,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Building2,
  Edit,
  Trash2,
  Eye,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { insertHallBookingSchema } from "@shared/schema";
import type { SelectHallBooking, Hall } from "@shared/schema";
import { z } from "zod";
import { BookingWizard } from "@/components/modals/booking-wizard";
import { FinalBillingModal } from "@/components/modals/final-billing-modal";
import { HallQuotation } from "@/components/print/hall-quotation";

const bookingFormSchema = insertHallBookingSchema.omit({ 
  hotelId: true, 
  createdBy: true,
  confirmedBy: true,
  cancelledBy: true,
  cancellationReason: true
});

export default function HallBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<SelectHallBooking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isFinalBillingOpen, setIsFinalBillingOpen] = useState(false);
  const [isPrintQuotationOpen, setIsPrintQuotationOpen] = useState(false);
  const [quotationBooking, setQuotationBooking] = useState<SelectHallBooking | null>(null);

  const { data: halls = [] } = useQuery<Hall[]>({
    queryKey: ["/api/halls"],
    enabled: !!user?.hotelId
  });

  const { data: bookings = [] } = useQuery<SelectHallBooking[]>({
    queryKey: ["/api/hotels", user?.hotelId, "hall-bookings"],
    enabled: !!user?.hotelId
  });

  const bookingForm = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      hallId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      bookingStartTime: new Date(),
      bookingEndTime: new Date(),
      numberOfPeople: 0,
      hallBasePrice: "0",
      totalAmount: "0",
      advancePaid: "0",
      balanceDue: "0",
      paymentMethod: "",
      specialRequests: "",
      status: "pending" as const
    }
  });

  // Watch for hall selection to auto-populate base price
  const selectedHallId = bookingForm.watch("hallId");
  const numberOfPeople = bookingForm.watch("numberOfPeople");
  const hallBasePrice = bookingForm.watch("hallBasePrice");
  
  // Auto-populate hall price when hall is selected
  const handleHallChange = (hallId: string) => {
    const selectedHall = halls.find(h => h.id === hallId);
    if (selectedHall) {
      const basePrice = selectedHall.priceInhouse || selectedHall.priceWalkin || "0";
      bookingForm.setValue("hallBasePrice", basePrice);
      // Recalculate total when hall changes
      calculateTotalPrice(basePrice, numberOfPeople);
    }
  };

  // Calculate total price based on base price and number of people
  const calculateTotalPrice = (basePrice: string, numPeople: number) => {
    const base = parseFloat(basePrice || "0");
    const perPersonCost = 0; // You can add per-person cost logic here if needed
    const total = base + (numPeople * perPersonCost);
    bookingForm.setValue("totalAmount", total.toFixed(2));
    
    // Recalculate balance due
    const advance = parseFloat(bookingForm.getValues("advancePaid") || "0");
    bookingForm.setValue("balanceDue", (total - advance).toFixed(2));
  };

  // Recalculate when number of people changes
  const handlePeopleChange = (value: string) => {
    const numPeople = parseInt(value) || 0;
    bookingForm.setValue("numberOfPeople", numPeople);
    calculateTotalPrice(hallBasePrice, numPeople);
  };

  // Recalculate balance when advance payment changes
  const handleAdvanceChange = (value: string) => {
    const advance = parseFloat(value || "0");
    const total = parseFloat(bookingForm.getValues("totalAmount") || "0");
    bookingForm.setValue("balanceDue", (total - advance).toFixed(2));
  };

  const editForm = useForm({
    resolver: zodResolver(bookingFormSchema.partial()),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      bookingStartTime: new Date(),
      bookingEndTime: new Date(),
      numberOfPeople: 0,
      hallBasePrice: "0",
      totalAmount: "0",
      advancePaid: "0",
      balanceDue: "0",
      paymentMethod: "",
      specialRequests: ""
    }
  });

  // Edit form handlers for dynamic calculation
  const handleEditAdvanceChange = (value: string) => {
    const advance = parseFloat(value || "0");
    const total = parseFloat(editForm.getValues("totalAmount") || "0");
    editForm.setValue("balanceDue", (total - advance).toFixed(2));
  };

  const handleEditTotalChange = (value: string) => {
    const total = parseFloat(value || "0");
    const advance = parseFloat(editForm.getValues("advancePaid") || "0");
    editForm.setValue("balanceDue", (total - advance).toFixed(2));
  };

  const checkAvailabilityMutation = useMutation({
    mutationFn: async (data: { hallId: string; startTime: Date; endTime: Date; excludeBookingId?: string }) => {
      const response = await apiRequest("POST", `/api/halls/${data.hallId}/check-availability`, {
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        excludeBookingId: data.excludeBookingId
      }) as unknown as { available: boolean };
      return response;
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const availability = await checkAvailabilityMutation.mutateAsync({
        hallId: data.hallId,
        startTime: data.bookingStartTime,
        endTime: data.bookingEndTime
      });

      if (!availability.available) {
        throw new Error("Hall is not available for the selected time");
      }

      await apiRequest("POST", `/api/hotels/${user?.hotelId}/hall-bookings`, {
        ...data,
        bookingStartTime: data.bookingStartTime.toISOString(),
        bookingEndTime: data.bookingEndTime.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "hall-bookings"] });
      toast({ title: "Booking created successfully" });
      bookingForm.reset();
      setIsWizardOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Booking failed", 
        description: error.message || "Failed to create booking",
        variant: "destructive" 
      });
    }
  });

  const updateBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.bookingStartTime || data.bookingEndTime) {
        const availability = await checkAvailabilityMutation.mutateAsync({
          hallId: selectedBooking!.hallId,
          startTime: data.bookingStartTime || new Date(selectedBooking!.bookingStartTime!),
          endTime: data.bookingEndTime || new Date(selectedBooking!.bookingEndTime!),
          excludeBookingId: selectedBooking!.id
        });

        if (!availability.available) {
          throw new Error("Hall is not available for the selected time");
        }
      }

      const updateData = {
        ...data,
        bookingStartTime: data.bookingStartTime?.toISOString(),
        bookingEndTime: data.bookingEndTime?.toISOString()
      };

      await apiRequest("PUT", `/api/hall-bookings/${selectedBooking!.id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "hall-bookings"] });
      toast({ title: "Booking updated successfully" });
      editForm.reset();
      setIsEditModalOpen(false);
      setSelectedBooking(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update failed", 
        description: error.message || "Failed to update booking",
        variant: "destructive" 
      });
    }
  });

  const confirmBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await apiRequest("POST", `/api/hall-bookings/${bookingId}/confirm`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "hall-bookings"] });
      toast({ title: "Booking confirmed successfully" });
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      await apiRequest("POST", `/api/hall-bookings/${bookingId}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "hall-bookings"] });
      toast({ title: "Booking cancelled successfully" });
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
      setCancelReason("");
    }
  });

  const handleEditBooking = (booking: SelectHallBooking) => {
    setSelectedBooking(booking);
    editForm.reset({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail || "",
      customerPhone: booking.customerPhone || "",
      bookingStartTime: booking.bookingStartTime ? new Date(booking.bookingStartTime) : new Date(),
      bookingEndTime: booking.bookingEndTime ? new Date(booking.bookingEndTime) : new Date(),
      numberOfPeople: booking.numberOfPeople || 0,
      hallBasePrice: booking.hallBasePrice || "0",
      totalAmount: booking.totalAmount || "0",
      advancePaid: booking.advancePaid || "0",
      balanceDue: booking.balanceDue || "0",
      paymentMethod: booking.paymentMethod || "",
      specialRequests: booking.specialRequests || ""
    });
    setIsEditModalOpen(true);
  };

  const handleCancelBooking = (booking: SelectHallBooking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      confirmed: { variant: "default", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} data-testid={`badge-status-${status}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatPaymentMethod = (method: string | null | undefined) => {
    if (!method) return "N/A";
    const methodMap: Record<string, string> = {
      cash: "Cash",
      cheque: "Cheque",
      pos: "POS/Card",
      fonepay: "Fonepay",
      bank_transfer: "Bank Transfer"
    };
    return methodMap[method] || method;
  };

  const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "quotation");
  const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "deposit_pending" || b.status === "in_progress" || b.status === "completed");
  const cancelledBookings = bookings.filter(b => b.status === "cancelled");

  // Role-based permissions
  const userRole = user?.role?.name || '';
  const canManage = ['manager', 'owner', 'super_admin'].includes(userRole);
  const isFinance = userRole === 'finance';
  const isCashier = userRole === 'cashier';
  const canViewOnly = isCashier;

  return (
    <DashboardLayout title="Hall Bookings">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-hall-bookings">Hall Bookings</h1>
            <p className="text-muted-foreground">Manage hall reservations and events</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/hall-calendar">
              <Button variant="outline" data-testid="button-calendar-view">
                <CalendarCheck className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
            </Link>
            {canManage && (
              <Button onClick={() => setIsWizardOpen(true)} data-testid="button-create-booking">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pending-count">{pendingBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-confirmed-count">{confirmedBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled Bookings</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-cancelled-count">{cancelledBookings.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8" data-testid="text-no-bookings">
                  No bookings found. Create your first booking to get started.
                </p>
              ) : (
                bookings.map((booking) => {
                  const hall = halls.find(h => h.id === booking.hallId);
                  return (
                    <div key={booking.id} className="border rounded-lg p-4 space-y-3" data-testid={`card-booking-${booking.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold" data-testid={`text-hall-name-${booking.id}`}>{hall?.name || "Unknown Hall"}</h3>
                            {getStatusBadge(booking.status!)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span data-testid={`text-customer-${booking.id}`}>{booking.customerName}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setQuotationBooking(booking);
                              setIsPrintQuotationOpen(true);
                            }}
                            data-testid={`button-print-quotation-${booking.id}`}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Quotation
                          </Button>
                          <Link href={`/dashboard/bookings/${booking.id}`}>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-view-${booking.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {(booking.status === "quotation" || booking.status === "confirmed") && canManage && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsFinalBillingOpen(true);
                              }}
                              data-testid={`button-finalize-${booking.id}`}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Finalize Billing
                            </Button>
                          )}
                          {booking.status === "pending" && canManage && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => confirmBookingMutation.mutate(booking.id)}
                                data-testid={`button-confirm-${booking.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditBooking(booking)}
                                data-testid={`button-edit-${booking.id}`}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </>
                          )}
                          {isFinance && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditBooking(booking)}
                              data-testid={`button-edit-payment-${booking.id}`}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Update Payment
                            </Button>
                          )}
                          {booking.status !== "cancelled" && canManage && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking)}
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Start Time</p>
                          <p className="font-medium" data-testid={`text-start-time-${booking.id}`}>
                            {booking.bookingStartTime ? format(new Date(booking.bookingStartTime), "PPp") : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Time</p>
                          <p className="font-medium" data-testid={`text-end-time-${booking.id}`}>
                            {booking.bookingEndTime ? format(new Date(booking.bookingEndTime), "PPp") : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-medium" data-testid={`text-total-${booking.id}`}>
                            {formatCurrency(parseFloat(booking.totalAmount || "0"))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Advance Paid</p>
                          <p className="font-medium" data-testid={`text-advance-${booking.id}`}>
                            {formatCurrency(parseFloat(booking.advancePaid || "0"))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Balance Due</p>
                          <p className="font-medium" data-testid={`text-balance-${booking.id}`}>
                            {formatCurrency(parseFloat(booking.balanceDue || "0"))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment Method</p>
                          <p className="font-medium" data-testid={`text-payment-method-${booking.id}`}>
                            {formatPaymentMethod(booking.paymentMethod)}
                          </p>
                        </div>
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Special Requests</p>
                          <p className="font-medium" data-testid={`text-special-requests-${booking.id}`}>{booking.specialRequests}</p>
                        </div>
                      )}

                      {booking.cancellationReason && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Cancellation Reason</p>
                          <p className="font-medium text-destructive" data-testid={`text-cancel-reason-${booking.id}`}>{booking.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <BookingWizard
          open={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "hall-bookings"] });
          }}
        />

        <FinalBillingModal
          open={isFinalBillingOpen}
          onOpenChange={setIsFinalBillingOpen}
          booking={selectedBooking}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/hotels", user?.hotelId, "hall-bookings"] });
          }}
        />

        {quotationBooking && (
          <HallQuotation
            booking={quotationBooking}
            open={isPrintQuotationOpen}
            onOpenChange={setIsPrintQuotationOpen}
          />
        )}

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isFinance ? 'Update Payment Details' : 'Edit Booking'}</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit((data) => updateBookingMutation.mutate(data))} className="space-y-4">
                {!isFinance && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter customer name" data-testid="input-edit-customer-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter phone number" data-testid="input-edit-customer-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={editForm.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="Enter email" data-testid="input-edit-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="numberOfPeople"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of People</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0" data-testid="input-edit-num-people" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="hallBasePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hall Base Price</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" readOnly className="bg-muted" data-testid="input-edit-base-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount (Editable)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            data-testid="input-edit-total"
                            onChange={(e) => { field.onChange(e); handleEditTotalChange(e.target.value); }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-payment-method">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash" data-testid="option-edit-payment-cash">Cash</SelectItem>
                            <SelectItem value="card" data-testid="option-edit-payment-card">Card</SelectItem>
                            <SelectItem value="bank_transfer" data-testid="option-edit-payment-bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="advancePaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Paid</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            data-testid="input-edit-advance"
                            onChange={(e) => { field.onChange(e); handleEditAdvanceChange(e.target.value); }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="balanceDue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Balance Due (Auto-calculated)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" readOnly className="bg-muted" data-testid="input-edit-balance" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter any special requests" data-testid="input-edit-special-requests" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} data-testid="button-cancel-edit">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateBookingMutation.isPending} data-testid="button-submit-edit">
                    {updateBookingMutation.isPending ? "Updating..." : "Update Booking"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel this booking? Please provide a reason.
              </p>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason"
                data-testid="input-cancel-reason"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} data-testid="button-cancel-cancel">
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => cancelBookingMutation.mutate({ bookingId: selectedBooking!.id, reason: cancelReason })}
                  disabled={!cancelReason.trim() || cancelBookingMutation.isPending}
                  data-testid="button-submit-cancel"
                >
                  {cancelBookingMutation.isPending ? "Cancelling..." : "Cancel Booking"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
