import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Car } from "lucide-react";

export default function SecurityHeadVehicleLogs() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicleLogs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vehicle-logs"],
    refetchInterval: 3000
  });

  const activeVehicles = vehicleLogs.filter(v => !v.checkOut);
  
  const filteredLogs = vehicleLogs.filter(log => 
    searchQuery === "" || 
    log.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.recordedByUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Vehicle Logs */}
        <Card>
          <CardHeader>
            <CardTitle>All Vehicle Logs</CardTitle>
            <CardDescription>
              <div className="mt-2">
                <Label htmlFor="vehicleSearch">Search</Label>
                <Input
                  id="vehicleSearch"
                  data-testid="input-vehicle-search"
                  placeholder="Search by vehicle number, driver name, or recorded by..."
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
                        <p>Recorded by: {log.recordedByUser?.username || 'Unknown'}</p>
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
