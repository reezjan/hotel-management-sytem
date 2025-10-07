import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { SelectHallBooking } from "@shared/schema";

interface ServiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

const finalBillingSchema = z.object({
  actualNumberOfPeople: z.number().min(1, "Number of people is required"),
  foodBuffetDescription: z.string().optional(),
  perPersonFoodPrice: z.number().min(0).default(0),
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
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"],
    enabled: !!user?.hotelId && open
  });

  const form = useForm<FinalBillingFormData>({
    resolver: zodResolver(finalBillingSchema),
    defaultValues: {
      actualNumberOfPeople: booking?.numberOfPeople || 1,
      foodBuffetDescription: "",
      perPersonFoodPrice: 0,
      finalPaymentMethod: "",
      finalPaymentAmount: 0
    }
  });

  const watchedActualPeople = form.watch("actualNumberOfPeople");
  const watchedPerPersonPrice = form.watch("perPersonFoodPrice");
  const watchedFinalPayment = form.watch("finalPaymentAmount");

  // Service item management
  const addServiceItem = () => {
    setServiceItems([...serviceItems, {
      id: Date.now().toString(),
      name: "",
      quantity: 1,
      unitPrice: 0
    }]);
  };

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: any) => {
    setServiceItems(serviceItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id));
  };

  const getServicesTotal = () => {
    return serviceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Calculate final total
  const calculateFinalTotal = () => {
    if (!booking) return 0;

    const hallBasePrice = Number(booking.hallBasePrice || 0);
    const foodCost = watchedActualPeople * watchedPerPersonPrice;
    const servicesTotal = getServicesTotal();
    const subtotal = hallBasePrice + foodCost + servicesTotal;

    // Calculate taxes
    let totalTax = 0;
    hotelTaxes.forEach((tax: any) => {
      if (tax.isActive) {
        const taxAmount = subtotal * (Number(tax.percent) / 100);
        totalTax += taxAmount;
      }
    });

    const total = subtotal + totalTax;
    setCalculatedTotal(total);
    return total;
  };

  // Reset form and services when modal opens
  useEffect(() => {
    if (open && booking) {
      form.reset({
        actualNumberOfPeople: booking.numberOfPeople || 1,
        foodBuffetDescription: "",
        perPersonFoodPrice: 0,
        finalPaymentMethod: "",
        finalPaymentAmount: 0
      });
      setServiceItems([]);
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
  }, [watchedActualPeople, watchedPerPersonPrice, serviceItems, open, booking]);

  const finalizeBillingMutation = useMutation({
    mutationFn: async (data: FinalBillingFormData) => {
      if (!booking) throw new Error("No booking selected");

      const finalTotal = calculateFinalTotal();
      const advancePaid = Number(booking.advancePaid || 0);
      const balanceDue = finalTotal - advancePaid;

      // Format services as descriptive text
      const servicesDescription = serviceItems
        .filter(item => item.name.trim())
        .map(item => `${item.name} (${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)})`)
        .join(', ');
      
      const foodDescription = data.perPersonFoodPrice > 0 
        ? `Food Buffet: ${data.foodBuffetDescription || 'Not specified'} (${data.actualNumberOfPeople} persons × ${formatCurrency(data.perPersonFoodPrice)} = ${formatCurrency(data.actualNumberOfPeople * data.perPersonFoodPrice)})`
        : '';
      
      const fullServicesDescription = [foodDescription, servicesDescription]
        .filter(s => s)
        .join(' | ');

      const updateData = {
        actualNumberOfPeople: data.actualNumberOfPeople,
        customServices: fullServicesDescription,
        totalAmount: finalTotal.toFixed(2),
        balanceDue: balanceDue.toFixed(2),
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

  const hallBasePrice = Number(booking.hallBasePrice || 0);
  const foodCost = watchedActualPeople * watchedPerPersonPrice;
  const subtotal = hallBasePrice + foodCost;
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
                <span className="text-muted-foreground">Booked Guest Count:</span>
                <span className="font-medium">{booking.numberOfPeople} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hall Base Price:</span>
                <span className="font-medium">{formatCurrency(hallBasePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advance Paid:</span>
                <span className="font-medium">{formatCurrency(advancePaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">{booking.paymentMethod || "N/A"}</span>
              </div>
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
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Food Buffet (Per Person)</h3>
                
                <FormField
                  control={form.control}
                  name="foodBuffetDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Items Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="E.g., Chicken curry, Dal, Vegetable curry, Rice, Naan, Mixed salad, Dessert..."
                          rows={3}
                          data-testid="textarea-food-description"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Describe what food items are included in the buffet</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="perPersonFoodPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Person</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            setTimeout(calculateFinalTotal, 0);
                          }}
                          data-testid="input-per-person-price"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Total food cost: {formatCurrency(watchedActualPeople * watchedPerPersonPrice)}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Additional Services</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addServiceItem}
                    data-testid="button-add-service"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Service
                  </Button>
                </div>
                
                {serviceItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No additional services added. Click "Add Service" to include decoration, sound system, etc.</p>
                ) : (
                  <div className="space-y-2">
                    {serviceItems.map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-5">
                            <label className="text-xs text-muted-foreground">Service Name</label>
                            <Input
                              placeholder="E.g., Decoration, Sound System"
                              value={item.name}
                              onChange={(e) => updateServiceItem(item.id, 'name', e.target.value)}
                              data-testid={`input-service-name-${item.id}`}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">Qty</label>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateServiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              data-testid={`input-service-qty-${item.id}`}
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="text-xs text-muted-foreground">Unit Price</label>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => updateServiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              data-testid={`input-service-price-${item.id}`}
                            />
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeServiceItem(item.id)}
                              data-testid={`button-remove-service-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <Card className="p-4 bg-muted">
                <h3 className="font-semibold mb-3">Final Bill Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Hall Base Price:</span>
                    <span className="font-medium">{formatCurrency(hallBasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Food ({watchedActualPeople} × {formatCurrency(watchedPerPersonPrice)}):
                    </span>
                    <span className="font-medium">{formatCurrency(foodCost)}</span>
                  </div>
                  {serviceItems.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Additional Services:</span>
                      <span className="font-medium">{formatCurrency(getServicesTotal())}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {hotelTaxes.filter((tax: any) => tax.isActive).map((tax: any) => {
                    const taxAmount = subtotal * (Number(tax.percent) / 100);
                    return (
                      <div key={tax.id} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {tax.taxType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} ({tax.percent}%):
                        </span>
                        <span className="font-medium">{formatCurrency(taxAmount)}</span>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Final Total:</span>
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
