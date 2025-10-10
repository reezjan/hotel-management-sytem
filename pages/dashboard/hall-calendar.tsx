import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, addDays, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import type { Hall } from "@shared/schema";

export default function HallCalendar() {
  const { user } = useAuth();
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  const { data: halls = [] } = useQuery<Hall[]>({
    queryKey: ["/api/halls"],
    enabled: !!user?.hotelId
  });

  const { data: calendarData } = useQuery({
    queryKey: ["/api/halls", selectedHall, "calendar", format(currentDate, "yyyy-MM-dd")],
    enabled: !!selectedHall,
    queryFn: async () => {
      const response = await fetch(`/api/halls/${selectedHall}/calendar?date=${format(currentDate, "yyyy-MM-dd")}`, {
        credentials: "include"
      });
      return response.json();
    }
  });

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const days = view === "week" ? getWeekDays() : getMonthDays();

  const handlePrevious = () => {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const getBookingsForDay = (day: Date) => {
    if (!calendarData?.slots) return [];
    return calendarData.slots.filter((slot: any) => {
      const slotDate = new Date(slot.startTime);
      return format(slotDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-red-500";
      case "in_progress": return "bg-yellow-500";
      case "quotation": return "bg-blue-500";
      case "deposit_pending": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout title="Hall Calendar">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold" data-testid="heading-hall-calendar">Hall Calendar</h1>
          <div className="flex gap-2">
            <Select value={view} onValueChange={(value: any) => setView(value)}>
              <SelectTrigger className="w-32" data-testid="select-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Select value={selectedHall} onValueChange={setSelectedHall}>
            <SelectTrigger className="w-64" data-testid="select-hall-calendar">
              <SelectValue placeholder="Select a hall" />
            </SelectTrigger>
            <SelectContent>
              {halls.map((hall) => (
                <SelectItem key={hall.id} value={hall.id}>
                  {hall.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious} data-testid="button-previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[200px] text-center">
              {view === "week" 
                ? `${format(days[0], "MMM d")} - ${format(days[6], "MMM d, yyyy")}`
                : format(currentDate, "MMMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={handleNext} data-testid="button-next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={() => setCurrentDate(new Date())} data-testid="button-today">
            Today
          </Button>
        </div>

        {!selectedHall ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a hall to view its calendar</p>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className={cn("grid gap-2", view === "week" ? "grid-cols-7" : "grid-cols-7")}>
              {view === "week" && days.map((day) => (
                <div key={day.toString()} className="text-center font-medium text-sm text-muted-foreground p-2">
                  {format(day, "EEE")}
                </div>
              ))}
              
              {days.map((day) => {
                const bookings = getBookingsForDay(day);
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                
                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "min-h-[120px] border rounded-lg p-2 space-y-1",
                      isToday && "border-primary bg-primary/5"
                    )}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  >
                    <div className={cn("text-sm font-medium", isToday && "text-primary")}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {bookings.map((booking: any) => (
                        <div
                          key={booking.id}
                          className={cn(
                            "text-xs p-1 rounded text-white truncate",
                            getStatusColor(booking.status)
                          )}
                          title={`${booking.customerName} - ${format(new Date(booking.startTime), "HH:mm")} - ${format(new Date(booking.endTime), "HH:mm")}`}
                          data-testid={`booking-slot-${booking.id}`}
                        >
                          {format(new Date(booking.startTime), "HH:mm")} {booking.customerName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span>Quotation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span>Deposit Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span>Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span>In Progress</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
