import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, Tag, DoorOpen, Receipt, TrendingUp, BarChart3, Building2 } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function ManagerDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  
  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/users"],
    refetchInterval: 3000
  });

  const { data: dailyAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance/daily"],
    refetchInterval: 3000
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    refetchInterval: 3000
  });

  const { data: vouchers = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/vouchers"],
    refetchInterval: 3000
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/rooms"],
    refetchInterval: 3000
  });

  // Real-time updates via WebSocket
  useEffect(() => {
    const unsubscribers = [
      ws.on('transaction:created', () => {
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      }),
      ws.on('transaction:updated', () => {
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/transactions"] });
      }),
      ws.on('room:updated', () => {
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/rooms"] });
      }),
      ws.on('attendance:updated', () => {
        queryClient.invalidateQueries({ queryKey: ["/api/attendance/daily"] });
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws, queryClient]);

  const cashTransactions = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + Number(t.amount), 0);
  const posTransactions = transactions.filter(t => t.paymentMethod === 'pos').reduce((sum, t) => sum + Number(t.amount), 0);
  const fonepayTransactions = transactions.filter(t => t.paymentMethod === 'fonepay').reduce((sum, t) => sum + Number(t.amount), 0);

  const staffColumns = [
    { key: "username", label: "Name", sortable: true },
    { 
      key: "role", 
      label: "Role", 
      sortable: true,
      render: (value: any) => value?.name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    },
    { 
      key: "id", 
      label: "Status", 
      render: (userId: string) => {
        const isOnDuty = dailyAttendance.some(a => a.userId === userId && a.status === 'active');
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {isOnDuty ? 'On Duty' : 'Off Duty'}
          </span>
        );
      }
    },
    { key: "createdAt", label: "Hired", sortable: true }
  ];

  const voucherColumns = [
    { key: "code", label: "Code", sortable: true },
    { key: "discountAmount", label: "Discount", sortable: true },
    { key: "discountType", label: "Type", sortable: true },
    { key: "validUntil", label: "Expires", sortable: true },
    { key: "usedCount", label: "Used", sortable: true },
    { key: "maxUses", label: "Max Uses", sortable: true }
  ];

  const roomColumns = [
    { key: "roomNumber", label: "Room", sortable: true },
    { 
      key: "roomType", 
      label: "Type", 
      render: (value: any, row: any) => row.roomType?.name || "Standard"
    },
    { 
      key: "isOccupied", 
      label: "Status", 
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {value ? 'Occupied' : 'Available'}
        </span>
      )
    }
  ];

  const staffActions = [
    { label: "View", action: (row: any) => setLocation("/manager/staff") },
    { label: "Manage", action: (row: any) => setLocation("/manager/staff"), variant: "outline" as const }
  ];

  const voucherActions = [
    { label: "View", action: (row: any) => setLocation("/manager/discount-vouchers") },
    { label: "Manage", action: (row: any) => setLocation("/manager/discount-vouchers"), variant: "outline" as const }
  ];

  const roomActions = [
    { label: "View", action: (row: any) => setLocation("/manager/room-setup") },
    { label: "Manage", action: (row: any) => setLocation("/manager/room-setup"), variant: "outline" as const }
  ];

  return (
    <DashboardLayout title="Manager Dashboard">
      <div className="space-y-6">
        {/* Transaction Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Cash Transactions"
            value={`रु${cashTransactions.toLocaleString()}`}
            icon={<Receipt />}
            iconColor="text-green-500"
          />
          <StatsCard
            title="POS Transactions"
            value={`रु${posTransactions.toLocaleString()}`}
            icon={<CreditCard />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Fonepay Transactions"
            value={`रु${fonepayTransactions.toLocaleString()}`}
            icon={<TrendingUp />}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Active Vouchers"
            value={vouchers.length}
            icon={<Tag />}
            iconColor="text-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Manager Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-add-staff" onClick={() => setLocation("/manager/staff")}>
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Staff</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-vendor-payment" onClick={() => setLocation("/manager/vendor-payments")}>
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Vendor Payment</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-create-voucher" onClick={() => setLocation("/manager/discount-vouchers")}>
                <Tag className="h-6 w-6" />
                <span className="text-sm">Create Voucher</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-room-setup" onClick={() => setLocation("/manager/room-setup")}>
                <DoorOpen className="h-6 w-6" />
                <span className="text-sm">Room Setup</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-amenities" onClick={() => setLocation("/manager/amenities")}>
                <Receipt className="h-6 w-6" />
                <span className="text-sm">Amenities</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-hall-bookings" onClick={() => setLocation("/hall-bookings")}>
                <Building2 className="h-6 w-6" />
                <span className="text-sm">Hall Bookings</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-0.5 p-0 [&_svg]:size-6" data-testid="button-transactions" onClick={() => setLocation("/manager/transactions")}>
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Transactions</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Staff Management */}
        <DataTable
          title="Staff Management"
          data={staff}
          columns={staffColumns}
          actions={staffActions}
          onAdd={() => setLocation("/manager/staff")}
          addButtonLabel="Add Staff Member"
          searchPlaceholder="Search staff..."
        />

        {/* Voucher Management */}
        <DataTable
          title="Discount Vouchers"
          data={vouchers}
          columns={voucherColumns}
          actions={voucherActions}
          onAdd={() => setLocation("/manager/discount-vouchers")}
          addButtonLabel="Create Voucher"
          searchPlaceholder="Search vouchers..."
        />

        {/* Room Management */}
        <DataTable
          title="Room Management"
          data={rooms}
          columns={roomColumns}
          actions={roomActions}
          onAdd={() => setLocation("/manager/room-setup")}
          addButtonLabel="Add Room"
          searchPlaceholder="Search rooms..."
        />

        {/* Vendor Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Vendor Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.filter(t => t.txnType === 'vendor_payment').slice(0, 5).map((payment, index) => (
                <div key={payment.id || index} className="flex items-center justify-between p-3 bg-secondary rounded" data-testid={`payment-item-${index}`}>
                  <div className="flex items-center">
                    <CreditCard className="text-blue-500 mr-3 h-5 w-5" />
                    <div>
                      <span className="font-medium">{payment.purpose || 'Vendor Payment'}</span>
                      <p className="text-sm text-muted-foreground">Payment method: {payment.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">रु{Number(payment.amount).toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
