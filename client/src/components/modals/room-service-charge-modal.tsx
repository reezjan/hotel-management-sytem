import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

interface RoomServiceChargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId?: string;
  roomId?: string;
}

export function RoomServiceChargeModal({ open, onOpenChange, reservationId, roomId }: RoomServiceChargeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [hours, setHours] = useState("");
  const [days, setDays] = useState("");
  const [notes, setNotes] = useState("");
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/services"],
    enabled: !!user?.hotelId && open
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels", user?.hotelId, "rooms"],
    enabled: !!user?.hotelId && open
  });

  const { data: reservations = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/reservations"],
    enabled: !!user?.hotelId && open
  });

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedReservation = reservations.find(r => r.id === reservationId);
  
  // Always use in-house pricing for all services
  // Services should always be charged at in-house rates regardless of guest type
  const isInHouseGuest = true;

  // Determine service type and calculation method based on user requirements
  const getServiceType = (serviceKind: string) => {
    const lowerKind = serviceKind?.toLowerCase() || '';
    
    // Fixed price services
    if (lowerKind.includes('airport') || lowerKind.includes('transfer')) return 'fixed';
    if (lowerKind.includes('tour guide')) return 'fixed';
    if (lowerKind.includes('business center')) return 'fixed';
    
    // Per hour services
    if (lowerKind.includes('spa')) return 'hours';
    if (lowerKind.includes('jacuzzi')) return 'hours';
    if (lowerKind.includes('massage')) return 'hours';
    if (lowerKind.includes('sauna')) return 'hours';
    if (lowerKind.includes('beauty salon')) return 'hours';
    
    // Per kg services
    if (lowerKind.includes('laundry')) return 'kg';
    
    // Per day services
    if (lowerKind.includes('gym') || lowerKind.includes('fitness')) return 'days';
    if (lowerKind.includes('car rental')) return 'days';
    if (lowerKind.includes('conference room')) return 'days';
    
    // Default to other (can be fixed or custom)
    if (lowerKind.includes('other')) return 'custom';
    
    return 'quantity';
  };

  // Get display unit based on service kind
  const getServiceUnit = (serviceKind: string) => {
    const type = getServiceType(serviceKind);
    if (type === 'kg') return 'kg';
    if (type === 'hours') return 'hour';
    if (type === 'days') return 'day';
    if (type === 'fixed') return 'service';
    if (type === 'custom') return 'unit';
    return 'unit';
  };

  // Calculate total when service or inputs change
  useEffect(() => {
    if (selectedService) {
      const unitPrice = isInHouseGuest 
        ? Number(selectedService.priceInhouse || 0)
        : Number(selectedService.priceWalkin || 0);
      
      const serviceType = getServiceType(selectedService.kind);
      let total = 0;

      switch (serviceType) {
        case 'kg':
          // Laundry: price per kg
          total = unitPrice * (Number(weight) || 0);
          break;
        case 'hours':
          // Spa, Jacuzzi, Massage, Sauna, Beauty Salon: price per hour
          total = unitPrice * (Number(hours) || 0);
          break;
        case 'days':
          // Gym, Car Rental, Conference Room: price per day
          total = unitPrice * (Number(days) || 0);
          break;
        case 'fixed':
          // Airport Transfer, Tour Guide, Business Center: fixed price
          total = unitPrice;
          break;
        case 'custom':
          // Other services: can use quantity or be fixed
          total = unitPrice * (Number(quantity) || 1);
          break;
        case 'quantity':
        default:
          total = unitPrice * (Number(quantity) || 0);
          break;
      }

      setCalculatedTotal(total);
    } else {
      setCalculatedTotal(0);
    }
  }, [selectedService, quantity, weight, hours, days, isInHouseGuest]);

  const addServiceChargeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/hotels/current/room-service-charges", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/room-service-charges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/reservations"] });
      toast({ title: "Service charge added successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to add service charge", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setSelectedServiceId("");
    setQuantity("");
    setWeight("");
    setHours("");
    setDays("");
    setNotes("");
    setCalculatedTotal(0);
    setServiceSearchQuery("");
  };

  // Filter services based on search query
  const filteredServices = services.filter((service) => {
    if (!serviceSearchQuery.trim()) return true;
    const query = serviceSearchQuery.toLowerCase();
    return (
      service.name?.toLowerCase().includes(query) ||
      service.kind?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = () => {
    if (!selectedService || !reservationId) {
      toast({ 
        title: "Missing required fields",
        description: "Please select a service",
        variant: "destructive" 
      });
      return;
    }

    const serviceType = getServiceType(selectedService.kind);
    let quantityValue = "";
    
    // Validate based on service type
    switch (serviceType) {
      case 'kg':
        if (!weight) {
          toast({ 
            title: "Missing weight",
            description: "Please enter weight in kg",
            variant: "destructive" 
          });
          return;
        }
        quantityValue = weight;
        break;
      case 'hours':
        if (!hours) {
          toast({ 
            title: "Missing hours",
            description: "Please enter number of hours",
            variant: "destructive" 
          });
          return;
        }
        quantityValue = hours;
        break;
      case 'days':
        if (!days) {
          toast({ 
            title: "Missing days",
            description: "Please enter number of days",
            variant: "destructive" 
          });
          return;
        }
        quantityValue = days;
        break;
      case 'fixed':
        // Fixed price services don't need quantity input
        quantityValue = "1";
        break;
      case 'custom':
        quantityValue = quantity || "1";
        break;
      default:
        if (!quantity) {
          toast({ 
            title: "Missing quantity",
            description: "Please enter quantity",
            variant: "destructive" 
          });
          return;
        }
        quantityValue = quantity;
    }

    const unitPrice = isInHouseGuest 
      ? Number(selectedService.priceInhouse || 0)
      : Number(selectedService.priceWalkin || 0);

    const unit = getServiceUnit(selectedService.kind);

    addServiceChargeMutation.mutate({
      reservationId,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceKind: selectedService.kind,
      quantity: quantityValue,
      unit: unit,
      unitPrice: unitPrice.toFixed(2),
      totalCharge: calculatedTotal.toFixed(2),
      notes: notes || null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Room Service Charge</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="service">Service *</Label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger id="service" data-testid="select-service">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 pb-2 sticky top-0 bg-background z-10">
                  <Input
                    placeholder="Search services..."
                    value={serviceSearchQuery}
                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                    className="h-8 text-sm"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.kind})
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No services found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Type:</span>
                    <span className="font-medium">{selectedService.kind}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate ({isInHouseGuest ? 'In-House' : 'Walk-In'}):</span>
                    <span className="font-medium">
                      {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} / {getServiceUnit(selectedService.kind)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Different forms based on service type */}
              {getServiceType(selectedService.kind) === 'kg' && (
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight in kg"
                    data-testid="input-weight"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Charged at {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} per kg
                  </p>
                </div>
              )}

              {getServiceType(selectedService.kind) === 'hours' && (
                <div>
                  <Label htmlFor="hours">Hours *</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Enter number of hours"
                    data-testid="input-hours"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Charged at {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} per hour
                  </p>
                </div>
              )}

              {getServiceType(selectedService.kind) === 'days' && (
                <div>
                  <Label htmlFor="days">Days *</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="Enter number of days"
                    data-testid="input-days"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Charged at {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} per day
                  </p>
                </div>
              )}

              {getServiceType(selectedService.kind) === 'fixed' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This is a fixed-price service. The full amount will be charged.
                  </p>
                </div>
              )}

              {getServiceType(selectedService.kind) === 'custom' && (
                <div>
                  <Label htmlFor="quantity">Quantity (Optional)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity (default: 1)"
                    data-testid="input-quantity"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Charged at {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} per unit
                  </p>
                </div>
              )}

              {getServiceType(selectedService.kind) === 'quantity' && (
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    data-testid="input-quantity"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Charged at {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} per unit
                  </p>
                </div>
              )}

              {calculatedTotal > 0 && (
                <div className="p-3 bg-primary/10 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Charge:</span>
                    <span className="text-lg font-bold">{formatCurrency(calculatedTotal)}</span>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  data-testid="textarea-notes"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedService || addServiceChargeMutation.isPending}
              className="flex-1"
              data-testid="button-add-charge"
            >
              {addServiceChargeMutation.isPending ? "Adding..." : "Add Charge"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
