import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { SelectHallBooking } from "@shared/schema";

const finalBillingSchema = z.object({
  actualNumberOfPeople: z.number().min(1, "Number of people is required"),
  finalPaymentMethod: z.string().min(1, "Payment method is required"),
  finalPaymentAmount: z.number().min(0, "Payment amount must be positive")
});

type FinalBillingFormData = z.infer<typeof finalBillingSchema>;

interface FinalBillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: SelectHallBooking | null;
  onSuccess: () => void;
}

export function FinalBillingModal({ open, onOpenChange, booking, onSuccess }: FinalBillingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"],
    enabled: !!user?.hotelId && open
  });

  const form = useForm<FinalBillingFormData>({
    resolver: zodResolver(finalBillingSchema),
    defaultValues: {
      actualNumberOfPeople: booking?.numberOfPeople || 1,
      finalPaymentMethod: "",
      finalPaymentAmount: 0
    }
  });

  const watchedActualPeople = form.watch("actualNumberOfPeople");
  const watchedFinalPayment = form.watch("finalPaymentAmount");

  // Calculate final total (using booking's total amount)
  const calculateFinalTotal = () => {
    if (!booking) return 0;

    const bookingTotal = Number(booking.totalAmount || 0);
    setCalculatedTotal(bookingTotal);
    return bookingTotal;
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open && booking) {
      form.reset({
        actualNumberOfPeople: booking.numberOfPeople || 1,
        finalPaymentMethod: "",
        finalPaymentAmount: 0
      });
    }
  }, [open, booking?.id]);

  // Recalculate when values change
  useEffect(() => {
    if (open && booking) {
      const total = calculateFinalTotal();
      const advance = Number(booking.advancePaid || 0);
      const balance = total - advance;
      form.setValue("finalPaymentAmount", Math.max(0, balance));
    }
  }, [watchedActualPeople, open, booking]);

  const finalizeBillingMutation = useMutation({
    mutationFn: async (data: FinalBillingFormData) => {
      if (!booking) throw new Error("No booking selected");

      const finalTotal = calculateFinalTotal();
      const advancePaid = Number(booking.advancePaid || 0);
      const balanceDue = finalTotal - advancePaid;

      const updateData = {
        actualNumberOfPeople: data.actualNumberOfPeople,
        totalAmount: finalTotal.toFixed(2),
        balanceDue: balanceDue.toFixed(2),
        paymentMethod: data.finalPaymentMethod,
        status: "completed"
      };

      // Update booking
      await apiRequest("PATCH", `/api/hotels/${user?.hotelId}/hall-bookings/${booking.id}`, updateData);

      // Record final payment
      if (data.finalPaymentAmount > 0) {
        await apiRequest("POST", `/api/hotels/${user?.hotelId}/booking-payments`, {
          bookingId: booking.id,
          amount: data.finalPaymentAmount.toFixed(2),
          paymentMethod: data.finalPaymentMethod,
          notes: "Final payment"
        });
      }
    },
    onSuccess: () => {
      toast({ title: "Billing finalized successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      form.reset();
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to finalize billing",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  if (!booking) return null;

  const handleSubmit = (data: FinalBillingFormData) => {
    finalizeBillingMutation.mutate(data);
  };

  const bookingTotal = Number(booking.totalAmount || 0);
  const advancePaid = Number(booking.advancePaid || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Final Billing - {booking.customerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Guest Count:</span>
                <span className="font-medium">{booking.numberOfPeople} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quotation Amount:</span>
                <span className="font-medium">{formatCurrency(bookingTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advance Paid:</span>
                <span className="font-medium">{formatCurrency(advancePaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">{booking.paymentMethod || "N/A"}</span>
              </div>
              {(booking.foodServices && typeof booking.foodServices === 'string') ? (
                <div className="mt-2 pt-2 border-t">
                  <span className="text-muted-foreground">Services Included:</span>
                  <p className="font-medium text-sm mt-1">{booking.foodServices}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="actualNumberOfPeople"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Number of People (Event Day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value) || 1);
                          setTimeout(calculateFinalTotal, 0);
                        }}
                        data-testid="input-actual-people"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              <Card className="p-4 bg-muted">
                <h3 className="font-semibold mb-3">Final Bill</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(calculatedTotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="text-sm">Advance Paid:</span>
                    <span className="font-medium">- {formatCurrency(advancePaid)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(Math.max(0, calculatedTotal - advancePaid))}</span>
                  </div>
                </div>
              </Card>

              <FormField
                control={form.control}
                name="finalPaymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Payment Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-final-payment"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Balance due: {formatCurrency(Math.max(0, calculatedTotal - advancePaid))}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="finalPaymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-final-payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="pos">POS/Card</SelectItem>
                        <SelectItem value="fonepay">Fonepay</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-cancel-billing"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={finalizeBillingMutation.isPending}
                  data-testid="button-finalize-billing"
                >
                  {finalizeBillingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalize Billing
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
