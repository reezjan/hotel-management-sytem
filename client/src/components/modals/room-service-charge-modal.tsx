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
  const [duration, setDuration] = useState("");
  const [numberOfTrips, setNumberOfTrips] = useState("1");
  const [notes, setNotes] = useState("");
  const [calculatedTotal, setCalculatedTotal] = useState(0);

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
  const isInHouseGuest = selectedReservation?.status === 'checked_in';

  // Determine service type and calculation method
  const getServiceType = (serviceKind: string) => {
    const lowerKind = serviceKind?.toLowerCase() || '';
    if (lowerKind.includes('laundry')) return 'weight';
    if (lowerKind.includes('transfer') || lowerKind.includes('airport') || lowerKind.includes('taxi')) return 'trip';
    if (lowerKind.includes('spa') || lowerKind.includes('massage') || lowerKind.includes('therapy')) return 'duration';
    return 'quantity';
  };

  // Get display unit based on service kind
  const getServiceUnit = (serviceKind: string) => {
    const type = getServiceType(serviceKind);
    if (type === 'weight') return 'kg';
    if (type === 'trip') return 'trip';
    if (type === 'duration') return 'hour';
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
        case 'weight':
          total = unitPrice * (Number(weight) || 0);
          break;
        case 'trip':
          total = unitPrice * (Number(numberOfTrips) || 0);
          break;
        case 'duration':
          total = unitPrice * (Number(duration) || 0);
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
  }, [selectedService, quantity, weight, duration, numberOfTrips, isInHouseGuest]);

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
    setDuration("");
    setNumberOfTrips("1");
    setNotes("");
    setCalculatedTotal(0);
  };

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
      case 'weight':
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
      case 'trip':
        if (!numberOfTrips) {
          toast({ 
            title: "Missing trips",
            description: "Please enter number of trips",
            variant: "destructive" 
          });
          return;
        }
        quantityValue = numberOfTrips;
        break;
      case 'duration':
        if (!duration) {
          toast({ 
            title: "Missing duration",
            description: "Please enter duration in hours",
            variant: "destructive" 
          });
          return;
        }
        quantityValue = duration;
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
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.kind})
                  </SelectItem>
                ))}
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
              {getServiceType(selectedService.kind) === 'weight' && (
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
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

              {getServiceType(selectedService.kind) === 'trip' && (
                <div>
                  <Label htmlFor="trips">Number of Trips *</Label>
                  <Input
                    id="trips"
                    type="number"
                    min="1"
                    value={numberOfTrips}
                    onChange={(e) => setNumberOfTrips(e.target.value)}
                    placeholder="Enter number of trips"
                    data-testid="input-trips"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Charged at {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} per trip
                  </p>
                </div>
              )}

              {getServiceType(selectedService.kind) === 'duration' && (
                <div>
                  <Label htmlFor="duration">Duration (hours) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Enter duration in hours"
                    data-testid="input-duration"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Charged at {formatCurrency(isInHouseGuest ? selectedService.priceInhouse : selectedService.priceWalkin)} per hour
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
              disabled={!selectedService || !quantity || addServiceChargeMutation.isPending}
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
