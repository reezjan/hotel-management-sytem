import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, DollarSign, Clock, User, Calendar, CheckCircle, Receipt } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { z } from "zod";
import type { SelectHallBooking, SelectBookingPayment, Hall } from "@shared/schema";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
  receiptNumber: z.string().optional()
});

export default function BookingDetail() {
  const [, params] = useRoute("/dashboard/bookings/:id");
  const bookingId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: booking } = useQuery<SelectHallBooking>({
    queryKey: ["/api/hall-bookings", bookingId],
    enabled: !!bookingId
  });

  const { data: payments = [] } = useQuery<SelectBookingPayment[]>({
    queryKey: ["/api/bookings", bookingId, "payments"],
    enabled: !!bookingId
  });

  const { data: hall } = useQuery<Hall>({
    queryKey: ["/api/halls", booking?.hallId],
    enabled: !!booking?.hallId
  });

  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "",
      notes: "",
      receiptNumber: ""
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentSchema>) => {
      // Validate payment amount doesn't exceed balance
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const balanceRemaining = Number(booking?.totalAmount) - totalPaid;
      
      if (data.amount > balanceRemaining) {
        throw new Error(`Payment amount (${data.amount}) cannot exceed balance due (${balanceRemaining.toFixed(2)})`);
      }
      
      await apiRequest("POST", `/api/bookings/${bookingId}/payments`, {
        ...data,
        amount: data.amount.toString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hall-bookings", bookingId] });
      toast({ title: "Payment recorded successfully" });
      paymentForm.reset();
      setIsPaymentModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record payment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      quotation: "bg-blue-500",
      deposit_pending: "bg-orange-500",
      confirmed: "bg-green-500",
      in_progress: "bg-yellow-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500"
    };
    return <Badge className={colors[status] || "bg-gray-500"}>{status.replace(/_/g, " ").toUpperCase()}</Badge>;
  };

  const formatPaymentMethod = (method: string | undefined | null) => {
    if (!method) return "Unknown";
    const methodMap: Record<string, string> = {
      cash: "Cash",
      pos: "POS/Card",
      fonepay: "Fonepay",
      bank_transfer: "Bank Transfer"
    };
    return methodMap[method] || method;
  };

  const userRole = user?.role?.name || '';
  const canRecordPayment = ['manager', 'owner', 'super_admin', 'front_desk', 'cashier', 'finance'].includes(userRole);

  if (!booking) {
    return (
      <DashboardLayout title="Loading...">
        <div className="p-6">
          <p className="text-center text-muted-foreground">Loading booking details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const balanceRemaining = Number(booking.totalAmount) - totalPaid;

  return (
    <DashboardLayout title="Booking Details">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/hall-bookings">
              <Button variant="outline" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold" data-testid="heading-booking-detail">Booking Details</h1>
              <p className="text-muted-foreground">View and manage booking information</p>
            </div>
          </div>
          {getStatusBadge(booking.status!)}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Hall</p>
                <p className="font-medium" data-testid="text-hall-name">{hall?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium" data-testid="text-customer-name">{booking.customerName}</p>
                <p className="text-sm">{booking.customerPhone}</p>
                {booking.customerEmail && <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium" data-testid="text-start-time">
                    {booking.bookingStartTime ? format(new Date(booking.bookingStartTime), "PPp") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium" data-testid="text-end-time">
                    {booking.bookingEndTime ? format(new Date(booking.bookingEndTime), "PPp") : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Number of People</p>
                <p className="font-medium" data-testid="text-num-people">{booking.numberOfPeople || 0}</p>
              </div>
              {booking.specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground">Special Requests</p>
                  <p className="text-sm" data-testid="text-special-requests">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="font-medium" data-testid="text-total-amount">{formatCurrency(Number(booking.totalAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Paid:</span>
                <span className="font-medium text-green-600" data-testid="text-total-paid">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Balance Due:</span>
                <span className={balanceRemaining > 0 ? "text-red-600" : "text-green-600"} data-testid="text-balance-due">
                  {formatCurrency(balanceRemaining)}
                </span>
              </div>
              {canRecordPayment && balanceRemaining > 0 && (
                <Button className="w-full" onClick={() => setIsPaymentModalOpen(true)} data-testid="button-record-payment">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="text-no-payments">
                No payments recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0" data-testid={`payment-record-${payment.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(Number(payment.amount))}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.createdAt!), "PPp")} • {formatPaymentMethod(payment.paymentMethod)}
                        </p>
                        {payment.receiptNumber && (
                          <p className="text-xs text-muted-foreground">Receipt: {payment.receiptNumber}</p>
                        )}
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                    <Receipt className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Booking Created</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.createdAt ? format(new Date(booking.createdAt), "PPp") : "N/A"}
                  </p>
                </div>
              </div>
              {booking.confirmedAt && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Booking Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.confirmedAt), "PPp")}
                    </p>
                  </div>
                </div>
              )}
              {booking.cancelledAt && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Booking Cancelled</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.cancelledAt), "PPp")}
                    </p>
                    {booking.cancellationReason && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit((data) => recordPaymentMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (Max: {formatCurrency(balanceRemaining)})</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value || 0))}
                          data-testid="input-payment-amount" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-method">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="pos">POS/Card</SelectItem>
                          <SelectItem value="fonepay">Fonepay</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Number (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter receipt number" data-testid="input-receipt-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes" rows={3} data-testid="textarea-payment-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)} data-testid="button-cancel-payment">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={recordPaymentMutation.isPending} data-testid="button-submit-payment">
                    {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
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
