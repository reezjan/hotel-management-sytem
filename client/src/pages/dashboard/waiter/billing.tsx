import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Printer, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WaiterBilling() {
  const [selectedTable, setSelectedTable] = useState<string>("");

  const { data: tables = [] } = useQuery({
    queryKey: ["/api/hotels/current/restaurant-tables"],
  });

  const { data: kotOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/kot-orders"],
  });

  const selectedTableOrders = kotOrders.filter(
    (order: any) => order.tableId === selectedTable && order.status !== 'cancelled'
  );

  const calculateTotal = () => {
    return selectedTableOrders.reduce((total, order) => {
      return total + (order.items?.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.qty || 1), 0) || 0);
    }, 0);
  };

  const subtotal = calculateTotal();
  const tax = subtotal * 0.13; // 13% VAT
  const serviceCharge = subtotal * 0.10; // 10% Service Charge
  const total = subtotal + tax + serviceCharge;

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Billing">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Generate Bill
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Table
              </label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table: any) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTable && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Order Items</h3>
                  {selectedTableOrders.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No orders for this table</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTableOrders.map((order: any) => (
                        <div key={order.id} className="text-sm">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between py-1">
                              <span>{item.description} x {item.qty}</span>
                              <span>{formatCurrency((item.price || 0) * (item.qty || 1))}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTableOrders.length > 0 && (
                  <>
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>VAT (13%):</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service Charge (10%):</span>
                        <span>{formatCurrency(serviceCharge)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Bill
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
