import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Activity, BarChart, Ticket, Package, ShoppingCart, Hotel, Calendar, Users, Shield, AlertCircle, CheckCircle, XCircle, Clock, Utensils } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function Report() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/rooms"],
    refetchInterval: 3000
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  const { data: maintenanceRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    refetchInterval: 3000
  });

  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vendors"],
    refetchInterval: 3000
  });

  const { data: vouchers = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vouchers"],
    refetchInterval: 3000
  });

  const { data: stockRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/stock-requests"],
    refetchInterval: 3000
  });

  const { data: kotOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/kot-orders"],
    refetchInterval: 3000
  });

  const { data: consumptions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-consumptions"],
    refetchInterval: 3000
  });

  const { data: reservations = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/reservations"],
    refetchInterval: 3000
  });

  const { data: hallBookings = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/hall-bookings"],
    refetchInterval: 3000
  });

  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"],
    refetchInterval: 3000
  });

  const { data: guests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/guests"],
    refetchInterval: 3000
  });

  const filteredVouchers = vouchers.filter((v: any) => {
    if (!v.createdAt) return false;
    const vDate = new Date(v.createdAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return vDate >= fromDate && vDate <= toDate;
  });

  const filteredStockRequests = stockRequests.filter((r: any) => {
    if (!r.requestedAt) return false;
    const rDate = new Date(r.requestedAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return rDate >= fromDate && rDate <= toDate;
  });

  const filteredKotOrders = kotOrders.filter((o: any) => {
    if (!o.createdAt) return false;
    const oDate = new Date(o.createdAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return oDate >= fromDate && oDate <= toDate;
  });

  const filteredReservations = reservations.filter((r: any) => {
    if (!r.checkIn) return false;
    const rDate = new Date(r.checkIn);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return rDate >= fromDate && rDate <= toDate;
  });

  const filteredHallBookings = hallBookings.filter((b: any) => {
    if (!b.bookingDate) return false;
    const bDate = new Date(b.bookingDate);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return bDate >= fromDate && bDate <= toDate;
  });

  const filteredConsumptions = consumptions.filter((c: any) => {
    if (!c.createdAt) return false;
    const cDate = new Date(c.createdAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return cDate >= fromDate && cDate <= toDate;
  });

  const occupancyRate = rooms.length > 0 ? 
    (rooms.filter(r => r.isOccupied).length / rooms.length) * 100 : 0;

  const activeStaff = staff.filter(s => s.isActive).length;

  const getUserById = (id: string) => staff.find((u: any) => u.id === id);
  const getGuestById = (id: string) => guests.find((g: any) => g.id === id);
  const getItemById = (id: string) => inventory.find((i: any) => i.id === id);
  const getMenuItemById = (id: string) => menuItems.find((m: any) => m.id === id);

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportComprehensiveReport = () => {
    const dateFrom = new Date(dateRange.from).toLocaleDateString();
    const dateTo = new Date(dateRange.to).toLocaleDateString();
    
    let csv = `COMPREHENSIVE HOTEL OPERATIONAL TRANSPARENCY REPORT (${dateFrom} - ${dateTo})\n\n`;
    
    csv += `=== OCCUPANCY SUMMARY ===\n`;
    csv += `Total Rooms,${rooms.length}\n`;
    csv += `Occupied,${rooms.filter(r => r.isOccupied).length}\n`;
    csv += `Available,${rooms.filter(r => !r.isOccupied).length}\n`;
    csv += `Occupancy Rate,${occupancyRate.toFixed(1)}%\n\n`;
    
    csv += `=== STAFF SUMMARY ===\n`;
    csv += `Total Staff,${staff.length}\n`;
    csv += `Active Staff,${activeStaff}\n\n`;
    
    csv += `=== DISCOUNT VOUCHERS ===\n`;
    csv += `Code,Type,Amount,Used/Max,Created By,Created At,Valid Until\n`;
    filteredVouchers.forEach((v: any) => {
      const creator = getUserById(v.createdBy);
      csv += `${v.code},${v.discountType || 'fixed'},${v.discountAmount || 0},${v.usedCount || 0}/${v.maxUses || 'unlimited'},${creator?.username || 'Unknown'},${new Date(v.createdAt).toLocaleString()},${v.validUntil ? new Date(v.validUntil).toLocaleDateString() : 'No expiry'}\n`;
    });
    csv += `\n`;
    
    csv += `=== STOCK REQUESTS ===\n`;
    csv += `Item,Quantity,Department,Requested By,Status,Requested At,Delivered At\n`;
    filteredStockRequests.forEach((r: any) => {
      const requester = getUserById(r.requestedBy);
      const item = getItemById(r.itemId);
      csv += `${item?.name || 'Unknown'},${r.quantity} ${r.unit || ''},${requester?.role?.name || 'Unknown'},${requester?.username || 'Unknown'},${r.status},${new Date(r.requestedAt).toLocaleString()},${r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : 'Pending'}\n`;
    });
    csv += `\n`;
    
    csv += `=== FOOD & DRINK ORDERS (KOT) ===\n`;
    csv += `Table,Items,Status,Created By,Created At\n`;
    filteredKotOrders.forEach((order: any) => {
      const creator = getUserById(order.createdBy);
      const itemsDesc = order.items?.map((i: any) => `${i.description} (${i.qty})`).join('; ') || 'No items';
      csv += `Table ${order.tableId},${itemsDesc},${order.status},${creator?.username || 'Unknown'},${new Date(order.createdAt).toLocaleString()}\n`;
    });
    csv += `\n`;
    
    csv += `=== INVENTORY CONSUMPTION ===\n`;
    csv += `Item,Quantity,Reason,Used By,Date\n`;
    filteredConsumptions.forEach((c: any) => {
      const item = getItemById(c.itemId);
      const user = getUserById(c.createdBy);
      csv += `${item?.name || 'Unknown'},${c.qty} ${c.unit || ''},${c.reason || 'Usage'},${user?.username || 'System'},${new Date(c.createdAt).toLocaleString()}\n`;
    });
    csv += `\n`;
    
    csv += `=== ROOM RESERVATIONS ===\n`;
    csv += `Guest,Room,Check-In,Check-Out,Status,Meal Plan\n`;
    filteredReservations.forEach((r: any) => {
      const guest = getGuestById(r.guestId);
      csv += `${guest?.fullName || 'Unknown'},${r.roomNumber || r.roomId},${new Date(r.checkIn).toLocaleDateString()},${new Date(r.checkOut).toLocaleDateString()},${r.status},${r.mealPlan || 'None'}\n`;
    });
    csv += `\n`;
    
    csv += `=== HALL BOOKINGS ===\n`;
    csv += `Customer,Hall,Event Date,Purpose,Guests,Status\n`;
    filteredHallBookings.forEach((b: any) => {
      csv += `${b.customerName || 'Unknown'},${b.hallId},${new Date(b.bookingDate).toLocaleDateString()},${b.purpose || 'Event'},${b.numberOfGuests || 0},${b.status}\n`;
    });
    
    downloadCSV(csv, `hotel_operational_report_${dateRange.from}_to_${dateRange.to}.csv`);
    toast({ title: "Operational Report Exported", description: "Complete hotel operational report downloaded" });
  };

  return (
    <DashboardLayout title="Hotel Operational Transparency">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Complete Operational Transparency</h2>
            <p className="text-muted-foreground">Full visibility into all hotel operations - vouchers, stock, orders, bookings & more</p>
          </div>
          <Button onClick={exportComprehensiveReport} data-testid="button-export-comprehensive">
            <Download className="h-4 w-4 mr-2" />
            Export Complete Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-from">From Date</Label>
            <Input
              id="date-from"
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              data-testid="input-date-from"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-to">To Date</Label>
            <Input
              id="date-to"
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              data-testid="input-date-to"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<BarChart />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Active Staff"
            value={activeStaff}
            icon={<Users />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Period Vouchers"
            value={filteredVouchers.length}
            icon={<Ticket />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Stock Requests"
            value={filteredStockRequests.length}
            icon={<Package />}
            iconColor="text-orange-500"
          />
        </div>

        <Tabs defaultValue="vouchers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-2">
            <TabsTrigger value="vouchers" data-testid="tab-vouchers">
              <Ticket className="h-4 w-4 mr-2" />
              Vouchers
            </TabsTrigger>
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="restaurant" data-testid="tab-restaurant">
              <Utensils className="h-4 w-4 mr-2" />
              Restaurant & Bar
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              <Hotel className="h-4 w-4 mr-2" />
              Rooms & Bookings
            </TabsTrigger>
            <TabsTrigger value="operations" data-testid="tab-operations">
              <Users className="h-4 w-4 mr-2" />
              Staff & Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vouchers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Discount Vouchers - Creation & Usage
                </CardTitle>
                <CardDescription>Complete voucher tracking - who created, who used, when and how many times</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredVouchers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No vouchers in selected period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVouchers.map((voucher: any) => {
                      const creator = getUserById(voucher.createdBy);
                      return (
                        <Card key={voucher.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold">{voucher.code}</h3>
                                  <Badge variant={voucher.usedCount >= (voucher.maxUses || Infinity) ? "destructive" : "default"}>
                                    {voucher.discountType === 'percentage' ? `${voucher.discountAmount}%` : `Rs. ${voucher.discountAmount}`}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Created By:</span>
                                    <span className="ml-2 font-medium">{creator?.username || 'Unknown'}</span>
                                    <span className="ml-1 text-xs text-muted-foreground">({creator?.role?.name || 'Unknown'})</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Created At:</span>
                                    <span className="ml-2 font-medium">{new Date(voucher.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Usage:</span>
                                    <span className="ml-2 font-medium">{voucher.usedCount || 0} / {voucher.maxUses || 'Unlimited'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Valid Until:</span>
                                    <span className="ml-2 font-medium">{voucher.validUntil ? new Date(voucher.validUntil).toLocaleDateString() : 'No expiry'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Stock Requests & Issuance Tracking
                </CardTitle>
                <CardDescription>Complete storeroom activity - who took what stock, when, from which department</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStockRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No stock requests in selected period</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Delivered At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockRequests.map((request: any) => {
                        const requester = getUserById(request.requestedBy);
                        const item = getItemById(request.itemId);
                        return (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{item?.name || 'Unknown Item'}</TableCell>
                            <TableCell>{request.quantity} {request.unit || ''}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{requester?.username || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{requester?.role?.name || 'Unknown'}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{requester?.role?.name || 'Unknown'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                request.status === 'delivered' ? 'default' :
                                request.status === 'approved' ? 'secondary' : 'outline'
                              }>
                                {request.status === 'delivered' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(request.requestedAt).toLocaleString()}</TableCell>
                            <TableCell className="text-sm">{request.deliveredAt ? new Date(request.deliveredAt).toLocaleString() : '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Separator className="my-6" />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Inventory Consumption & Usage
                </CardTitle>
                <CardDescription>Stock usage tracking - what was used, how much, and by whom</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredConsumptions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No consumption records in selected period</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reason/Purpose</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsumptions.map((consumption: any) => {
                        const item = getItemById(consumption.itemId);
                        const user = getUserById(consumption.createdBy);
                        return (
                          <TableRow key={consumption.id}>
                            <TableCell className="font-medium">{item?.name || 'Unknown'}</TableCell>
                            <TableCell>{consumption.qty} {consumption.unit || ''}</TableCell>
                            <TableCell>{consumption.reason || 'Usage'}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user?.username || 'System'}</div>
                                <div className="text-xs text-muted-foreground">{user?.role?.name || ''}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(consumption.createdAt).toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Food & Drink Orders (KOT)
                </CardTitle>
                <CardDescription>All restaurant and bar orders with items and quantities</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredKotOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders in selected period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredKotOrders.map((order: any) => {
                      const creator = getUserById(order.createdBy);
                      return (
                        <Card key={order.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-bold">Table {order.tableId}</h3>
                                  <Badge variant={
                                    order.status === 'closed' ? 'default' :
                                    order.status === 'open' ? 'secondary' : 'outline'
                                  }>
                                    {order.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Created by {creator?.username || 'Unknown'} on {new Date(order.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            {order.items && order.items.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Items Ordered:</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Quantity</TableHead>
                                      <TableHead>Unit</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {order.items.map((item: any, idx: number) => (
                                      <TableRow key={idx}>
                                        <TableCell className="font-medium">{item.description || item.menuItemId}</TableCell>
                                        <TableCell>{item.qty}</TableCell>
                                        <TableCell>{item.unit || 'plate'}</TableCell>
                                        <TableCell>
                                          <Badge variant={
                                            item.status === 'ready' ? 'default' :
                                            item.status === 'approved' ? 'secondary' :
                                            item.status === 'declined' ? 'destructive' : 'outline'
                                          }>
                                            {item.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Rooms & Occupancy Status
                </CardTitle>
                <CardDescription>Real-time room status and occupancy information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Rooms</div>
                    <div className="text-2xl font-bold">{rooms.length}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Occupied</div>
                    <div className="text-2xl font-bold">{rooms.filter((r: any) => r.isOccupied).length}</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Occupancy Rate</div>
                    <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room: any) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-bold">{room.roomNumber}</TableCell>
                        <TableCell>{room.type?.name || 'Standard'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            room.status === 'available' ? 'default' :
                            room.status === 'maintenance' ? 'destructive' : 'secondary'
                          }>
                            {room.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {room.isOccupied ? (
                            <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Occupied</Badge>
                          ) : (
                            <Badge variant="outline">Available</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">Rs. {room.pricePerNight || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Room Reservations & Hall Bookings
                </CardTitle>
                <CardDescription>All reservations and bookings in the selected period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Room Reservations ({filteredReservations.length})</h3>
                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No room reservations in selected period</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Guest</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Check-In</TableHead>
                          <TableHead>Check-Out</TableHead>
                          <TableHead>Meal Plan</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReservations.map((reservation: any) => {
                          const guest = getGuestById(reservation.guestId);
                          return (
                            <TableRow key={reservation.id}>
                              <TableCell className="font-medium">{guest?.fullName || 'Unknown'}</TableCell>
                              <TableCell>{reservation.roomNumber || reservation.roomId}</TableCell>
                              <TableCell>{new Date(reservation.checkIn).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(reservation.checkOut).toLocaleDateString()}</TableCell>
                              <TableCell><Badge variant="outline">{reservation.mealPlan || 'EP'}</Badge></TableCell>
                              <TableCell>
                                <Badge variant={
                                  reservation.status === 'confirmed' ? 'default' :
                                  reservation.status === 'cancelled' ? 'destructive' : 'secondary'
                                }>
                                  {reservation.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">Hall Bookings ({filteredHallBookings.length})</h3>
                  {filteredHallBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Hotel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hall bookings in selected period</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Hall</TableHead>
                          <TableHead>Event Date</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Guests</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHallBookings.map((booking: any) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.customerName || 'Unknown'}</TableCell>
                            <TableCell>{booking.hallId}</TableCell>
                            <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                            <TableCell>{booking.purpose || 'Event'}</TableCell>
                            <TableCell>{booking.numberOfGuests || 0}</TableCell>
                            <TableCell>
                              <Badge variant={
                                booking.status === 'confirmed' ? 'default' :
                                booking.status === 'cancelled' ? 'destructive' : 'secondary'
                              }>
                                {booking.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Directory & Activity
                </CardTitle>
                <CardDescription>Complete staff information and current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Staff</div>
                    <div className="text-2xl font-bold">{staff.length}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Active</div>
                    <div className="text-2xl font-bold">{activeStaff}</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Online Now</div>
                    <div className="text-2xl font-bold">{staff.filter((s: any) => s.isOnline).length}</div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Online</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.username}</TableCell>
                        <TableCell><Badge variant="outline">{member.role?.name || 'Unknown'}</Badge></TableCell>
                        <TableCell>
                          {member.isActive ? (
                            <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
                          ) : (
                            <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.isOnline ? (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">Online</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                              <span className="text-sm">Offline</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Separator className="my-6" />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Maintenance Requests & History
                </CardTitle>
                <CardDescription>All maintenance requests with photos and complete details</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No maintenance requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRequests.map((request: any) => {
                      return (
                        <Card key={request.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold">{request.title}</h3>
                                  <Badge variant={
                                    request.status === 'completed' ? 'default' :
                                    request.status === 'in_progress' ? 'secondary' :
                                    request.status === 'pending' ? 'outline' : 'destructive'
                                  }>
                                    {request.status}
                                  </Badge>
                                  <Badge variant={
                                    request.priority === 'high' ? 'destructive' :
                                    request.priority === 'medium' ? 'secondary' : 'outline'
                                  }>
                                    {request.priority} priority
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="ml-2 font-medium">{request.location}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Reported By:</span>
                                    <span className="ml-2 font-medium">{request.reportedBy?.username || 'Unknown'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Assigned To:</span>
                                    <span className="ml-2 font-medium">{request.assignedTo?.username || 'Unassigned'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="ml-2 font-medium">{new Date(request.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              {request.photo && (
                                <img src={request.photo} alt="Maintenance issue" className="w-32 h-32 object-cover rounded-lg ml-4" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
