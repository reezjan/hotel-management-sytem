import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, ShoppingCart } from "lucide-react";

export default function InventoryTracking() {

  // Fetch inventory items
  const { data: inventory = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  // Restaurant bar managers have read-only access to inventory

  const getStockStatus = (baseStockQty: number, reorderLevel: number) => {
    if (baseStockQty <= reorderLevel) {
      return { status: 'Low Stock', color: 'text-red-600 bg-red-100' };
    } else if (baseStockQty <= reorderLevel * 1.5) {
      return { status: 'Medium', color: 'text-orange-600 bg-orange-100' };
    }
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const lowStockItems = inventory.filter(item => 
    Number(item.baseStockQty) <= Number(item.reorderLevel)
  );
  
  const totalValue = inventory.reduce((sum, item) => 
    sum + (Number(item.baseStockQty) * Number(item.costPerUnit || 0)), 0
  );

  const columns = [
    { key: "name", label: "Item Name", sortable: true },
    { 
      key: "baseStockQty", 
      label: "Current Stock", 
      sortable: true,
      render: (value: number, row: any) => {
        const baseStock = Number(value || 0).toFixed(2);
        const packageStock = Number(row.packageStockQty || 0).toFixed(2);
        return (
          <span>
            {baseStock} {row.baseUnit}
            {row.packageUnit && ` (${packageStock} ${row.packageUnit})`}
          </span>
        );
      }
    },
    { 
      key: "reorderLevel", 
      label: "Reorder Level", 
      render: (value: number, row: any) => `${Number(value).toFixed(2)} ${row.baseUnit}`
    },
    { 
      key: "costPerUnit", 
      label: "Cost/Unit", 
      render: (value: any) => {
        const numValue = Number(value);
        return !isNaN(numValue) && numValue > 0 ? `NPR ${numValue.toFixed(2)}` : 'N/A';
      }
    },
    { 
      key: "storageLocation",
      label: "Storage Location",
      render: (value: string) => value || 'N/A'
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value: any, row: any) => {
        const { status, color } = getStockStatus(Number(row.baseStockQty), Number(row.reorderLevel));
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        );
      }
    }
  ];

  return (
    <DashboardLayout title="Restaurant Inventory Tracking">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">रु{totalValue.toFixed(0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Need Reorder</p>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-3">
                {lowStockItems.length} item(s) are running low and need to be restocked:
              </p>
              <div className="space-y-1">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="text-sm text-red-600">
                    • {item.name}: {Number(item.baseStockQty).toFixed(2)} {item.baseUnit} (Reorder at {Number(item.reorderLevel).toFixed(2)} {item.baseUnit})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <DataTable
          title="Restaurant Inventory"
          data={inventory}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search inventory items..."
        />
      </div>
    </DashboardLayout>
  );
}