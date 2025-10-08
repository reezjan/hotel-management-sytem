import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Utensils, Coffee, Wine } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WaiterFoodSearch() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: menuItems = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/menu-items"],
  });

  const filteredItems = menuItems.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('coffee') || name.includes('beverage')) return <Coffee className="h-4 w-4" />;
    if (name.includes('wine') || name.includes('alcohol') || name.includes('drink')) return <Wine className="h-4 w-4" />;
    return <Utensils className="h-4 w-4" />;
  };

  return (
    <DashboardLayout title="Food Search">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Found {filteredItems.length} item(s)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item: any) => (
                <Card key={item.id} className={!item.active ? 'opacity-50' : ''}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        {item.category && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                            {getCategoryIcon(item.category.name)}
                            <span>{item.category.name}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant={item.active ? "default" : "secondary"}>
                        {item.active ? "Available" : "Unavailable"}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(item.price)}
                      </span>
                      {item.preparationTime && (
                        <span className="text-xs text-muted-foreground">
                          ~{item.preparationTime} min
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items found matching "{searchTerm}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
