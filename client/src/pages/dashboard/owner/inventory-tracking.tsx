import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingDown, BarChart } from "lucide-react";

export default function InventoryTracking() {
  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"]
  });

  const { data: consumptions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-consumptions"]
  });

  // Calculate inventory metrics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => 
    Number(item.baseStockQty) <= Number(item.reorderLevel)
  ).length;
  const outOfStockItems = inventory.filter(item => 
    Number(item.baseStockQty) === 0
  ).length;
  const totalValue = inventory.reduce((sum, item) => 
    sum + (Number(item.baseStockQty) * (Number(item.costPerUnit) || 0)), 0
  );

  const inventoryColumns = [
    { key: "name", label: "Item Name", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { 
      key: "baseStockQty", 
      label: "Current Stock", 
      sortable: true,
      render: (value: any, row: any) => {
        const baseStock = Number(value || 0).toFixed(2);
        const packageStock = Number(row.packageStockQty || 0).toFixed(2);
        return `${baseStock} ${row.baseUnit}${row.packageUnit ? ` (${packageStock} ${row.packageUnit})` : ''}`;
      }
    },
    { key: "reorderLevel", label: "Reorder Level", sortable: true },
    { key: "baseUnit", label: "Unit", sortable: true },
    { 
      key: "costPerUnit", 
      label: "Cost/Unit", 
      sortable: true,
      render: (value: any) => `NPR ${Number(value || 0).toFixed(2)}`
    },
    { key: "storageLocation", label: "Storage", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      render: (value: any, row: any) => {
        const stock = Number(row.baseStockQty);
        const reorder = Number(row.reorderLevel);
        if (stock === 0) {
          return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Out of Stock</span>;
        } else if (stock <= reorder) {
          return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Low Stock</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">In Stock</span>;
      }
    }
  ];

  const consumptionColumns = [
    { key: "itemName", label: "Item", sortable: true },
    { key: "qty", label: "Quantity", sortable: true },
    { key: "reason", label: "Reason", sortable: true },
    { key: "createdAt", label: "Date", sortable: true, render: (value: string) => 
      new Date(value).toLocaleDateString()
    }
  ];

  const inventoryActions = [
    { label: "Update Stock", action: (row: any) => console.log("Update stock:", row) },
    { label: "Edit Item", action: (row: any) => console.log("Edit item:", row) },
    { label: "Remove", action: (row: any) => console.log("Remove item:", row), variant: "destructive" as const }
  ];

  return (
    <DashboardLayout title="Inventory Tracking">
      <div className="space-y-6">
        {/* Inventory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Items"
            value={totalItems}
            icon={<Package />}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Low Stock Items"
            value={lowStockItems}
            icon={<AlertTriangle />}
            iconColor="text-yellow-500"
          />
          <StatsCard
            title="Out of Stock"
            value={outOfStockItems}
            icon={<TrendingDown />}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Total Value"
            value={`NPR ${totalValue.toLocaleString()}`}
            icon={<BarChart />}
            iconColor="text-green-500"
          />
        </div>

        {/* Quick Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {inventory.filter(item => Number(item.baseStockQty) > Number(item.reorderLevel)).length}
                </div>
                <div className="text-sm text-green-700 mt-2">Items in Stock</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{lowStockItems}</div>
                <div className="text-sm text-yellow-700 mt-2">Low Stock Items</div>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{outOfStockItems}</div>
                <div className="text-sm text-red-700 mt-2">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <DataTable
          title="Inventory Items"
          data={inventory}
          columns={inventoryColumns}
          actions={inventoryActions}
          onAdd={() => console.log("Add item")}
          addButtonLabel="Add Inventory Item"
          searchPlaceholder="Search inventory..."
        />

        {/* Recent Consumptions */}
        <DataTable
          title="Recent Inventory Consumptions"
          data={consumptions.slice(0, 20)}
          columns={consumptionColumns}
          searchPlaceholder="Search consumptions..."
        />
      </div>
    </DashboardLayout>
  );
}