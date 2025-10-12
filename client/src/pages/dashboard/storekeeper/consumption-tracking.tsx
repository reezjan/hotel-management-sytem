import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingDown, Search, Calendar } from "lucide-react";
import { useState } from "react";

export default function StorekeeperConsumptionTracking() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: consumptions = [], isLoading: loadingConsumptions } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-consumptions"],
    refetchInterval: 3000
  });

  const { data: inventoryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/inventory-items"],
    refetchInterval: 3000
  });

  const enrichedConsumptions = consumptions.map((consumption: any) => {
    const item = inventoryItems.find((i: any) => i.id === consumption.itemId);
    return {
      ...consumption,
      itemName: item?.name || 'Unknown Item',
      unit: consumption.unit || item?.baseUnit || item?.unit || '',
      type: consumption.referenceEntity === 'wastage' ? 'wastage' : 'consumption'
    };
  });

  const filteredConsumptions = enrichedConsumptions.filter((consumption: any) =>
    consumption.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalConsumptions = enrichedConsumptions.length;
  const wastageCount = enrichedConsumptions.filter((c: any) => c.type === 'wastage').length;
  const regularConsumptions = totalConsumptions - wastageCount;

  return (
    <DashboardLayout title="Consumption Tracking">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Consumptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-total-consumptions">
                {totalConsumptions}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Regular Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-regular-consumptions">
                {regularConsumptions}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wastage Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="count-wastage">
                {wastageCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Consumption History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search consumptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-consumption"
                />
              </div>
            </div>

            {loadingConsumptions ? (
              <p className="text-center text-muted-foreground py-8">Loading consumption history...</p>
            ) : filteredConsumptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="no-consumptions-message">
                {searchTerm ? 'No consumptions found' : 'No consumption records'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredConsumptions.map((consumption: any) => (
                  <div
                    key={consumption.id}
                    className={`p-4 border rounded-lg ${
                      consumption.type === 'wastage'
                        ? 'border-red-200 bg-red-50 dark:bg-red-950'
                        : 'hover:bg-accent'
                    } transition-colors`}
                    data-testid={`consumption-item-${consumption.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold" data-testid={`consumption-item-name-${consumption.id}`}>
                            {consumption.itemName}
                          </h3>
                          <Badge 
                            variant={consumption.type === 'wastage' ? 'destructive' : 'default'}
                            data-testid={`consumption-type-${consumption.id}`}
                          >
                            {consumption.type || 'consumption'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">Quantity:</span> {consumption.qty} {consumption.unit}
                          </p>
                          {consumption.notes && (
                            <p>
                              <span className="font-medium">Notes:</span> {consumption.notes}
                            </p>
                          )}
                          {consumption.department && (
                            <p>
                              <span className="font-medium">Department:</span> {consumption.department}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {consumption.createdAt && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(consumption.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
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
