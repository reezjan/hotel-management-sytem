import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Car, Plus } from "lucide-react";

export default function SurveillanceOfficerVehicleLogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: "",
    vehicleType: "car",
    driverName: "",
    purpose: ""
  });
  
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicleLogs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vehicle-logs"]
  });

  const checkInVehicleMutation = useMutation({
    mutationFn: async (data: typeof vehicleForm) => {
      return await apiRequest("POST", "/api/hotels/current/vehicle-logs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vehicle-logs"] });
      toast({ title: "Vehicle checked in successfully" });
      setVehicleForm({ vehicleNumber: "", vehicleType: "car", driverName: "", purpose: "" });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to check in vehicle", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const checkOutVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      return await apiRequest("PATCH", `/api/vehicle-logs/${vehicleId}/checkout`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/vehicle-logs"] });
      toast({ title: "Vehicle checked out successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to check out vehicle", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const handleVehicleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.vehicleNumber || !vehicleForm.vehicleType || !vehicleForm.driverName) {
      toast({ title: "Vehicle number, type, and driver name are required", variant: "destructive" });
      return;
    }
    checkInVehicleMutation.mutate(vehicleForm);
  };

  const myVehicleLogs = vehicleLogs.filter(v => v.recordedBy === user?.id);
  const activeVehicles = myVehicleLogs.filter(v => !v.checkOut);
  
  const filteredLogs = myVehicleLogs.filter(log => 
    searchQuery === "" || 
    log.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.driverName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Vehicle Logs">
      <div className="space-y-6">
        {/* Stats Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vehicles On Premises</p>
                <p className="text-4xl font-bold">{activeVehicles.length}</p>
              </div>
              <Car className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Check-in Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vehicle Check-in</CardTitle>
                <CardDescription>Record new vehicle entry</CardDescription>
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)} 
                size="sm"
                data-testid="button-toggle-form"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showForm ? 'Cancel' : 'Check-in Vehicle'}
              </Button>
            </div>
          </CardHeader>
          {showForm && (
            <CardContent>
              <form onSubmit={handleVehicleCheckIn} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                    <Input
                      id="vehicleNumber"
                      data-testid="input-vehicle-number"
                      value={vehicleForm.vehicleNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                      placeholder="e.g., BA 12 PA 1234"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select 
                      value={vehicleForm.vehicleType} 
                      onValueChange={(value) => setVehicleForm({ ...vehicleForm, vehicleType: value })}
                    >
                      <SelectTrigger data-testid="select-vehicle-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="driverName">Driver Name *</Label>
                    <Input
                      id="driverName"
                      data-testid="input-driver-name"
                      value={vehicleForm.driverName}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                      placeholder="Driver's full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      data-testid="input-purpose"
                      value={vehicleForm.purpose}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, purpose: e.target.value })}
                      placeholder="Purpose of visit"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={checkInVehicleMutation.isPending}
                  data-testid="button-submit-checkin"
                >
                  {checkInVehicleMutation.isPending ? 'Checking in...' : 'Check-in Vehicle'}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Vehicle Logs */}
        <Card>
          <CardHeader>
            <CardTitle>My Vehicle Logs</CardTitle>
            <CardDescription>
              <div className="mt-2">
                <Label htmlFor="vehicleSearch">Search</Label>
                <Input
                  id="vehicleSearch"
                  data-testid="input-vehicle-search"
                  placeholder="Search by vehicle number or driver name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-vehicles">Loading vehicle logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-vehicles">
                {searchQuery ? 'No matching vehicles found.' : 'No vehicle logs yet.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" 
                    data-testid={`vehicle-${log.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-lg" data-testid={`vehicle-number-${log.id}`}>
                          {log.vehicleNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          {log.vehicleType}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground ml-8">
                        <p>Driver: {log.driverName}</p>
                        {log.purpose && <p>Purpose: {log.purpose}</p>}
                        <p className="mt-1">
                          Check-in: {format(new Date(log.checkIn), 'MMM dd, yyyy HH:mm')}
                        </p>
                        {log.checkOut && (
                          <p>Check-out: {format(new Date(log.checkOut), 'MMM dd, yyyy HH:mm')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        log.checkOut ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                      }`} data-testid={`vehicle-status-${log.id}`}>
                        {log.checkOut ? 'Checked Out' : 'On Premises'}
                      </span>
                      {!log.checkOut && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => checkOutVehicleMutation.mutate(log.id)}
                          disabled={checkOutVehicleMutation.isPending}
                          data-testid={`button-checkout-${log.id}`}
                        >
                          Check Out
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
