import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, AlertTriangle, Search } from "lucide-react";
import { useState } from "react";

export default function StorekeeperInventoryTracking() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: inventoryItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: lowStockItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/low-stock-items"]
  });

  const filteredItems = inventoryItems.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (itemId: string) => {
    return lowStockItems.some((lowItem: any) => lowItem.id === itemId);
  };

  return (
    <DashboardLayout title="Inventory Tracking">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="w-5 h-5" />
              All Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search inventory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-inventory"
                />
              </div>
            </div>

            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading inventory...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="no-items-message">
                {searchTerm ? 'No items found' : 'No inventory items'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-4 border rounded-lg ${
                      isLowStock(item.id)
                        ? 'border-red-300 bg-red-50 dark:bg-red-950'
                        : 'hover:bg-accent'
                    } transition-colors`}
                    data-testid={`inventory-item-${item.id}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg" data-testid={`item-name-${item.id}`}>
                            {item.name}
                          </h3>
                          {isLowStock(item.id) && (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current Stock:</span>
                            <span className="ml-2 font-medium" data-testid={`item-current-qty-${item.id}`}>
                              {item.baseStockQty || 0} {item.baseUnit || 'units'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reorder Level:</span>
                            <span className="ml-2 font-medium">
                              {item.reorderLevel || 0} {item.baseUnit || 'units'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost/Unit:</span>
                            <span className="ml-2 font-medium">
                              रु{parseFloat(item.costPerUnit || 0).toFixed(2)}
                            </span>
                          </div>
                          {item.storageLocation && (
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2 font-medium">{item.storageLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alerts ({lowStockItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950"
                    data-testid={`low-stock-alert-${item.id}`}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.currentQty} {item.unit} | Min: {item.minQty} {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">Action Required</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
