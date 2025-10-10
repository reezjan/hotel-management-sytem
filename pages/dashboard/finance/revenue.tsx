import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Bed, UtensilsCrossed, Wine, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function FinanceRevenuePage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/transactions"],
    enabled: !!user?.hotelId
  });

  // Listen for real-time transaction updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/transactions"],
    events: ['transaction:created', 'transaction:updated']
  });

  // Filter revenue transactions
  const revenueTransactions = transactions.filter(t => 
    t.txnType === 'cash_in' || t.txnType === 'pos_in' || t.txnType === 'fonepay_in' || t.txnType?.includes('_in')
  );

  // Categorize revenue by department based on purpose
  const roomRevenue = revenueTransactions.filter(t => 
    t.purpose?.toLowerCase().includes('room') || t.purpose?.toLowerCase().includes('checkout')
  );
  const restaurantRevenue = revenueTransactions.filter(t => 
    t.purpose?.toLowerCase().includes('restaurant') || t.purpose?.toLowerCase().includes('food')
  );
  const barRevenue = revenueTransactions.filter(t => 
    t.purpose?.toLowerCase().includes('bar') || t.purpose?.toLowerCase().includes('drink')
  );
  const otherRevenue = revenueTransactions.filter(t => 
    !roomRevenue.includes(t) && !restaurantRevenue.includes(t) && !barRevenue.includes(t)
  );

  const totalRoomRevenue = roomRevenue.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalRestaurantRevenue = restaurantRevenue.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalBarRevenue = barRevenue.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalOtherRevenue = otherRevenue.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalRevenue = totalRoomRevenue + totalRestaurantRevenue + totalBarRevenue + totalOtherRevenue;

  // Calculate percentages
  const roomPercent = totalRevenue > 0 ? (totalRoomRevenue / totalRevenue) * 100 : 0;
  const restaurantPercent = totalRevenue > 0 ? (totalRestaurantRevenue / totalRevenue) * 100 : 0;
  const barPercent = totalRevenue > 0 ? (totalBarRevenue / totalRevenue) * 100 : 0;
  const otherPercent = totalRevenue > 0 ? (totalOtherRevenue / totalRevenue) * 100 : 0;

  return (
    <DashboardLayout title="Revenue Reports">
      <div className="space-y-6">
        {/* Header with Period Selector */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Revenue Analysis by Department</CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-40" data-testid="select-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-4xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm opacity-90 mt-1">{revenueTransactions.length} transactions</p>
              </div>
              <TrendingUp className="h-16 w-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Department Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Bed className="h-10 w-10 text-blue-500" />
                <span className="text-2xl font-bold text-blue-600">{roomPercent.toFixed(1)}%</span>
              </div>
              <h3 className="font-semibold mb-1">Rooms Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalRoomRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">{roomRevenue.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <UtensilsCrossed className="h-10 w-10 text-orange-500" />
                <span className="text-2xl font-bold text-orange-600">{restaurantPercent.toFixed(1)}%</span>
              </div>
              <h3 className="font-semibold mb-1">Restaurant Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalRestaurantRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">{restaurantRevenue.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Wine className="h-10 w-10 text-purple-500" />
                <span className="text-2xl font-bold text-purple-600">{barPercent.toFixed(1)}%</span>
              </div>
              <h3 className="font-semibold mb-1">Bar Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalBarRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">{barRevenue.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-10 w-10 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{otherPercent.toFixed(1)}%</span>
              </div>
              <h3 className="font-semibold mb-1">Other Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalOtherRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">{otherRevenue.length} transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Meal Plan Revenue Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Meal Plan Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const mealPlanTransactions = revenueTransactions.filter(t => 
                  t.details?.mealPlanCharges && Number(t.details.mealPlanCharges) > 0
                );
                
                const totalMealPlanRevenue = mealPlanTransactions.reduce((sum, t) => 
                  sum + Number(t.details?.mealPlanCharges || 0), 0
                );
                
                if (totalMealPlanRevenue === 0) {
                  return (
                    <p className="text-center text-muted-foreground py-8">No meal plan revenue data available</p>
                  );
                }
                
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Meal Plan Revenue</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalMealPlanRevenue)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{mealPlanTransactions.length} reservations</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Average per Guest</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(mealPlanTransactions.length > 0 ? totalMealPlanRevenue / mealPlanTransactions.length : 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">per reservation</p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">% of Total Revenue</p>
                        <p className="text-2xl font-bold text-orange-600 mt-1">
                          {totalRevenue > 0 ? ((totalMealPlanRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">of {formatCurrency(totalRevenue)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-3">Recent Meal Plan Transactions</h4>
                      <div className="space-y-2">
                        {mealPlanTransactions.slice(0, 5).map((t, i) => (
                          <div key={i} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{t.details?.guestName || 'Guest'}</p>
                              <p className="text-xs text-muted-foreground">
                                {t.details?.numberOfDays || 1} days × {formatCurrency(Number(t.details?.mealPlanCharges || 0) / (t.details?.numberOfDays || 1))}/day
                              </p>
                            </div>
                            <span className="font-bold text-green-600">{formatCurrency(Number(t.details?.mealPlanCharges || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution Chart (Visual Representation) */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Rooms</span>
                  <span className="text-muted-foreground">{formatCurrency(totalRoomRevenue)} ({roomPercent.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${roomPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Restaurant</span>
                  <span className="text-muted-foreground">{formatCurrency(totalRestaurantRevenue)} ({restaurantPercent.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${restaurantPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Bar</span>
                  <span className="text-muted-foreground">{formatCurrency(totalBarRevenue)} ({barPercent.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${barPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Other</span>
                  <span className="text-muted-foreground">{formatCurrency(totalOtherRevenue)} ({otherPercent.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${otherPercent}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department-wise Transaction Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Room Revenue Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roomRevenue.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.purpose || 'Room Charge'}</p>
                      <p className="text-xs text-muted-foreground">{t.paymentMethod?.toUpperCase()}</p>
                    </div>
                    <span className="font-bold text-green-600">{formatCurrency(Number(t.amount))}</span>
                  </div>
                ))}
                {roomRevenue.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No room revenue transactions</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Restaurant Revenue Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {restaurantRevenue.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.purpose || 'Restaurant Sale'}</p>
                      <p className="text-xs text-muted-foreground">{t.paymentMethod?.toUpperCase()}</p>
                    </div>
                    <span className="font-bold text-green-600">{formatCurrency(Number(t.amount))}</span>
                  </div>
                ))}
                {restaurantRevenue.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No restaurant revenue transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
