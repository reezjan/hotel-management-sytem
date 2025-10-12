import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { DutyToggle } from "../common/duty-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Hotel, User, Menu } from "lucide-react";
import { DUTY_ROLES } from "@/lib/constants";
import { useLocation } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  currentHotel?: string;
}

export function DashboardLayout({ children, title, currentHotel }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fetch current hotel data if not provided
  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"],
    enabled: !!user?.hotelId && !currentHotel // Only fetch if user has hotelId and currentHotel not provided
  });
  
  const displayHotelName = currentHotel || hotel?.name || "Hotel Management System";
  const userRole = user?.role?.name;
  const showDutyToggle = userRole && DUTY_ROLES.includes(userRole as any);

  const handleMyProfileClick = () => {
    setLocation("/my-profile");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border shadow-sm" data-testid="nav-top">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Hamburger Menu */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
              
              <Hotel className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-base md:text-xl font-bold text-foreground truncate max-w-[150px] md:max-w-none" data-testid="text-app-title">
                {title}
              </h1>
              <span className="hidden sm:inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm" data-testid="text-current-hotel">
                {displayHotelName}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Duty Status Toggle - Visible on all screens */}
              {showDutyToggle && (
                <DutyToggle />
              )}
              
              {/* User Info */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-foreground" data-testid="text-current-user">
                    {user?.username || "Unknown User"}
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid="text-current-role">
                    {user?.role?.name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Unknown Role"}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleMyProfileClick}
                  data-testid="button-my-profile"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-y-auto" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
