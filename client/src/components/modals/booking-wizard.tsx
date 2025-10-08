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
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, Clock, Users, DollarSign, Package, CheckCircle, Loader2, Search, AlertCircle, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import type { Hall, SelectServicePackage, Guest } from "@shared/schema";

interface ServiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

const wizardSchema = z.object({
  // Step 1: Hall & Time
  hallId: z.string().min(1, "Hall is required"),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  isInHouseGuest: z.boolean().default(false),
  
  // Step 2: Customer Info
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  guestId: z.string().optional(),
  numberOfPeople: z.number().min(1, "Estimated number of people is required"),
  
  // Step 3: Payment (quotation only)
  totalAmount: z.number(),
  advancePaid: z.number().min(0, "Advance cannot be negative"),
  balanceDue: z.number(),
  paymentMethod: z.string().optional(),
  specialRequests: z.string().optional()
}).refine((data) => data.advancePaid <= data.totalAmount, {
  message: "Advance payment cannot exceed total amount",
  path: ["advancePaid"]
});

type WizardFormData = z.infer<typeof wizardSchema>;

interface BookingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BookingWizard({ open, onOpenChange, onSuccess }: BookingWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [guestSearch, setGuestSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{ available: boolean; suggestions?: any[] } | null>(null);
  const [foodDescription, setFoodDescription] = useState("");
  const [perPersonFoodPrice, setPerPersonFoodPrice] = useState(0);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      hallId: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      duration: 1,
      isInHouseGuest: false,
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      numberOfPeople: 1,
      totalAmount: 0,
      advancePaid: 0,
      balanceDue: 0,
      paymentMethod: "",
      specialRequests: ""
    }
  });

  const { data: halls = [] } = useQuery<Hall[]>({
    queryKey: ["/api/halls"],
    enabled: !!user?.hotelId && open
  });


  const { data: hotelSettings } = useQuery({
    queryKey: ["/api/hotels/current"],
    enabled: !!user?.hotelId && open
  });

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"],
    enabled: !!user?.hotelId && open
  });

  const watchedHallId = form.watch("hallId");
  const watchedDate = form.watch("date");
  const watchedStartTime = form.watch("startTime");
  const watchedEndTime = form.watch("endTime");
  const watchedDuration = form.watch("duration");
  const watchedNumberOfPeople = form.watch("numberOfPeople");

  const selectedHall = halls.find(h => h.id === watchedHallId);
  
  // Clear availability status when key fields change
  useEffect(() => {
    setAvailabilityStatus(null);
  }, [watchedHallId, watchedDate, watchedStartTime, watchedEndTime]);
  
  // Calculate duration when start/end time changes
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.max(0, (endMinutes - startMinutes) / 60);
  };

  // Update duration when times change
  const handleStartTimeChange = (value: string) => {
    form.setValue("startTime", value);
    const duration = calculateDuration(value, watchedEndTime);
    if (duration > 0) {
      form.setValue("duration", duration);
      calculateTotal();
    }
  };

  const handleEndTimeChange = (value: string) => {
    form.setValue("endTime", value);
    const duration = calculateDuration(watchedStartTime, value);
    if (duration > 0) {
      form.setValue("duration", duration);
      calculateTotal();
    }
  };

  // Check availability
  const checkAvailability = async (): Promise<boolean> => {
    if (!watchedHallId || !watchedDate || !watchedStartTime || !watchedEndTime) return true;
    
    // Clear any previous status first
    setAvailabilityStatus(null);
    
    try {
      const result = await apiRequest("POST", "/api/halls/check-availability-quick", {
        hallId: watchedHallId,
        date: format(watchedDate, "yyyy-MM-dd"),
        startTime: watchedStartTime,
        endTime: watchedEndTime
      }) as any;
      
      console.log("Availability API result:", result);
      
      // Check if available is explicitly false
      if (result && result.available === false) {
        setAvailabilityStatus(result as { available: boolean; suggestions?: any[] });
        toast({
          title: "Hall Not Available",
          description: result.suggestions?.length 
            ? "Alternative time slots are suggested below" 
            : "No alternative slots available for this date",
          variant: "destructive"
        });
        return false;
      }
      
      // If available is true or not explicitly false, allow proceeding
      return true;
    } catch (error) {
      toast({
        title: "Error checking availability",
        variant: "destructive"
      });
      return false;
    }
  };

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

  // Calculate quotation total (hall base price + food + services + taxes)
  const calculateTotal = () => {
    if (!selectedHall) return;
    
    const isInHouse = form.getValues("isInHouseGuest");
    const hourlyRate = isInHouse 
      ? (selectedHall.priceInhouse ? Number(selectedHall.priceInhouse) : 0)
      : (selectedHall.priceWalkin ? Number(selectedHall.priceWalkin) : 0);
    const basePrice = hourlyRate * watchedDuration;
    
    // Add food cost
    const foodCost = watchedNumberOfPeople * perPersonFoodPrice;
    
    // Add services cost
    const servicesTotal = getServicesTotal();
    
    const subtotal = basePrice + foodCost + servicesTotal;
    
    // Calculate taxes from database (VAT, service charge, luxury tax)
    let totalTax = 0;
    hotelTaxes.forEach((tax: any) => {
      if (tax.isActive) {
        const taxAmount = subtotal * (Number(tax.percent) / 100);
        totalTax += taxAmount;
      }
    });
    
    const total = subtotal + totalTax;
    
    form.setValue("totalAmount", Number(total.toFixed(2)));
    
    const advance = form.getValues("advancePaid") || 0;
    form.setValue("balanceDue", Number((total - advance).toFixed(2)));
  };

  // Search guest
  const searchGuest = async () => {
    if (!guestSearch) return;
    
    setIsSearching(true);
    try {
      const guest = await apiRequest("GET", `/api/guests/search?phone=${encodeURIComponent(guestSearch)}`) as any;
      
      if (guest) {
        form.setValue("customerName", `${guest.firstName} ${guest.lastName}`);
        form.setValue("customerPhone", guest.phone);
        form.setValue("customerEmail", guest.email || "");
        form.setValue("guestId", guest.id);
        toast({ title: "Guest found", description: "Information auto-filled" });
      } else {
        toast({ title: "Guest not found", description: "Please enter details manually" });
      }
    } catch (error) {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Recalculate when food or services change
  useEffect(() => {
    if (currentStep === 3) {
      calculateTotal();
    }
  }, [perPersonFoodPrice, serviceItems, currentStep]);

  const createBookingMutation = useMutation({
    mutationFn: async (data: WizardFormData) => {
      // Format food and services as description
      const servicesDescription = serviceItems
        .filter(item => item.name.trim())
        .map(item => `${item.name} (${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)})`)
        .join(', ');
      
      const foodDescriptionText = perPersonFoodPrice > 0 
        ? `Food: ${foodDescription || 'Not specified'} (${data.numberOfPeople} persons × ${formatCurrency(perPersonFoodPrice)} = ${formatCurrency(data.numberOfPeople * perPersonFoodPrice)})`
        : '';
      
      const fullServicesDescription = [foodDescriptionText, servicesDescription]
        .filter(s => s)
        .join(' | ');

      const bookingData = {
        hallId: data.hallId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || undefined,
        guestId: data.guestId || undefined,
        isInHouseGuest: data.isInHouseGuest,
        bookingStartTime: new Date(`${format(data.date, "yyyy-MM-dd")}T${data.startTime}`),
        bookingEndTime: new Date(`${format(data.date, "yyyy-MM-dd")}T${data.endTime}`),
        duration: data.duration.toString(),
        numberOfPeople: data.numberOfPeople,
        hallBasePrice: (data.isInHouseGuest 
          ? (selectedHall?.priceInhouse ? Number(selectedHall.priceInhouse) * data.duration : 0)
          : (selectedHall?.priceWalkin ? Number(selectedHall.priceWalkin) * data.duration : 0)
        ).toFixed(2),
        totalAmount: data.totalAmount.toString(),
        advancePaid: data.advancePaid.toString(),
        balanceDue: data.balanceDue.toString(),
        paymentMethod: data.paymentMethod || undefined,
        specialRequests: data.specialRequests || undefined,
        foodServices: fullServicesDescription || undefined,
        status: "quotation"
      };

      await apiRequest("POST", `/api/hotels/${user?.hotelId}/hall-bookings`, bookingData);
    },
    onSuccess: () => {
      toast({ title: "Booking created successfully" });
      form.reset();
      setCurrentStep(1);
      setAvailabilityStatus(null);
      setFoodDescription("");
      setPerPersonFoodPrice(0);
      setServiceItems([]);
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    }
  });

  const handleNext = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await form.trigger(["hallId", "date", "startTime", "endTime", "duration"]);
        console.log("Step 1 validation:", isValid, form.formState.errors);
        if (!isValid) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields correctly",
            variant: "destructive"
          });
          return;
        }
        const isAvailable = await checkAvailability();
        console.log("Availability check:", isAvailable);
        if (isAvailable) {
          setCurrentStep(2);
        }
        break;
      case 2:
        isValid = await form.trigger(["customerName", "customerPhone", "customerEmail", "numberOfPeople"]);
        console.log("Step 2 validation:", isValid, form.formState.errors);
        if (!isValid) {
          toast({
            title: "Validation Error",
            description: "Please fill in all customer information",
            variant: "destructive"
          });
          return;
        }
        calculateTotal();
        setCurrentStep(3);
        break;
      case 3:
        form.handleSubmit((data) => createBookingMutation.mutate(data))();
        break;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: "Hall & Time", icon: CalendarIcon },
    { number: 2, title: "Customer Info", icon: Users },
    { number: 3, title: "Quotation", icon: DollarSign }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-green-500 text-white",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={cn(
                      "text-sm mt-2",
                      isActive && "font-semibold text-primary",
                      !isActive && "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <Separator className={cn(
                      "flex-1 mx-2",
                      isCompleted && "bg-green-500"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-4">
            {currentStep === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="isInHouseGuest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Type</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value === "true");
                        calculateTotal();
                      }} value={field.value ? "true" : "false"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-customer-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="false">Walk-in Customer</SelectItem>
                          <SelectItem value="true">In-House Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hallId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Hall</FormLabel>
                      <Select onValueChange={(value) => { field.onChange(value); calculateTotal(); }} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-hall-wizard">
                            <SelectValue placeholder="Choose a hall" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {halls.map((hall) => (
                            <SelectItem key={hall.id} value={hall.id}>
                              {hall.name} - Capacity: {hall.capacity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} data-testid="button-select-date">
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} onChange={(e) => { field.onChange(e); handleStartTimeChange(e.target.value); }} data-testid="input-start-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} onChange={(e) => { field.onChange(e); handleEndTimeChange(e.target.value); }} data-testid="input-end-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration: {field.value} hour(s)</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={24}
                          step={0.5}
                          value={[field.value]}
                          onValueChange={(value) => { field.onChange(value[0]); calculateTotal(); }}
                          data-testid="slider-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedHall && (
                  <Card className="p-4 bg-muted">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price Type:</span>
                        <span className="font-medium">{form.watch("isInHouseGuest") ? "In-House Guest" : "Walk-in Customer"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                        <span className="font-medium">
                          {formatCurrency(form.watch("isInHouseGuest") 
                            ? Number(selectedHall.priceInhouse || 0)
                            : Number(selectedHall.priceWalkin || 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Base Price ({watchedDuration}h):</span>
                        <span className="font-medium">
                          {formatCurrency((form.watch("isInHouseGuest") 
                            ? Number(selectedHall.priceInhouse || 0)
                            : Number(selectedHall.priceWalkin || 0)
                          ) * watchedDuration)}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}

                {availabilityStatus && !availabilityStatus.available && availabilityStatus.suggestions && availabilityStatus.suggestions.length > 0 && (
                  <Card className="p-4 border-yellow-500">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium">Alternative Time Slots:</p>
                        {availabilityStatus.suggestions.map((slot, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => {
                              const startTime = format(new Date(slot.startTime), "HH:mm");
                              const endTime = format(new Date(slot.endTime), "HH:mm");
                              form.setValue("startTime", startTime);
                              form.setValue("endTime", endTime);
                              handleStartTimeChange(startTime);
                              handleEndTimeChange(endTime);
                              setAvailabilityStatus(null);
                            }}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {format(new Date(slot.startTime), "h:mm a")} - {format(new Date(slot.endTime), "h:mm a")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by phone or email"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    data-testid="input-guest-search"
                  />
                  <Button type="button" onClick={searchGuest} disabled={isSearching} data-testid="button-search-guest">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter customer name" data-testid="input-customer-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" data-testid="input-customer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" data-testid="input-customer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="numberOfPeople"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of People</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={1} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} data-testid="input-number-people" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 3 && (
              <>
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Food Buffet (Per Person)</h3>
                  
                  <div>
                    <label className="text-sm font-medium">Food Items Description</label>
                    <Textarea
                      value={foodDescription}
                      onChange={(e) => setFoodDescription(e.target.value)}
                      placeholder="E.g., Chicken curry, Dal, Vegetable curry, Rice, Naan, Mixed salad, Dessert..."
                      rows={3}
                      data-testid="textarea-food-description"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Describe what food items are included in the buffet</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Price Per Person</label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={perPersonFoodPrice}
                      onChange={(e) => setPerPersonFoodPrice(parseFloat(e.target.value) || 0)}
                      data-testid="input-per-person-price"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Total food cost: {formatCurrency(watchedNumberOfPeople * perPersonFoodPrice)}
                    </p>
                  </div>
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
                  <h3 className="font-semibold mb-3">Quotation Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Hall Base Price ({watchedDuration}h):</span>
                      <span className="font-medium">
                        {formatCurrency((form.watch("isInHouseGuest")
                          ? (selectedHall?.priceInhouse ? Number(selectedHall.priceInhouse) : 0)
                          : (selectedHall?.priceWalkin ? Number(selectedHall.priceWalkin) : 0)
                        ) * watchedDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Food ({watchedNumberOfPeople} × {formatCurrency(perPersonFoodPrice)}):
                      </span>
                      <span className="font-medium">{formatCurrency(watchedNumberOfPeople * perPersonFoodPrice)}</span>
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
                      <span className="font-medium">
                        {formatCurrency((form.watch("isInHouseGuest")
                          ? (selectedHall?.priceInhouse ? Number(selectedHall.priceInhouse) : 0)
                          : (selectedHall?.priceWalkin ? Number(selectedHall.priceWalkin) : 0)
                        ) * watchedDuration + watchedNumberOfPeople * perPersonFoodPrice + getServicesTotal())}
                      </span>
                    </div>
                    {hotelTaxes.filter((tax: any) => tax.isActive).map((tax: any) => {
                      const subtotal = (form.watch("isInHouseGuest")
                        ? (selectedHall?.priceInhouse ? Number(selectedHall.priceInhouse) : 0)
                        : (selectedHall?.priceWalkin ? Number(selectedHall.priceWalkin) : 0)
                      ) * watchedDuration + watchedNumberOfPeople * perPersonFoodPrice + getServicesTotal();
                      const taxAmount = subtotal * (Number(tax.percent) / 100);
                      
                      return (
                        <div key={tax.id} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {tax.taxType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} ({tax.percent}%):
                          </span>
                          <span className="font-medium">
                            {formatCurrency(taxAmount)}
                          </span>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Quotation Amount:</span>
                      <span>{formatCurrency(form.getValues("totalAmount"))}</span>
                    </div>
                  </div>
                </Card>

                <FormField
                  control={form.control}
                  name="advancePaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Payment</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value}
                          onChange={(e) => {
                            const advance = Number(e.target.value || 0);
                            field.onChange(advance);
                            const total = form.getValues("totalAmount");
                            form.setValue("balanceDue", Number((total - advance).toFixed(2)));
                          }}
                          data-testid="input-advance-paid"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-method">
                            <SelectValue placeholder="Select payment method" />
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
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Any special requirements or notes" rows={3} data-testid="textarea-special-requests" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card className="p-4 border-green-500 bg-green-50 dark:bg-green-950">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Balance Due:</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(form.getValues("balanceDue"))}
                    </span>
                  </div>
                </Card>
              </>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={createBookingMutation.isPending}
              data-testid="button-next"
            >
              {createBookingMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentStep === 4 ? "Create Booking" : "Next"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
