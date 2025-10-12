import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wrench, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HousekeepingStaffMaintenanceReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      title: "",
      location: "",
      description: "",
      priority: "medium"
    }
  });

  const { data: myRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    refetchInterval: 3000,
    queryFn: async () => {
      const response = await fetch("/api/hotels/current/maintenance-requests", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");
      const data = await response.json();
      return data.filter((req: any) => req.reportedBy?.id === user?.id);
    },
    enabled: !!user?.id
  });

  const createMaintenanceRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/maintenance-requests", {
        hotelId: user?.hotelId,
        reportedBy: user?.id,
        title: data.title,
        location: data.location,
        description: data.description,
        priority: data.priority,
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request submitted successfully" });
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to submit request", variant: "destructive" });
    }
  });

  const onSubmitMaintenanceRequest = (data: any) => {
    createMaintenanceRequestMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout title="Maintenance Reports">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>Report Maintenance Issue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitMaintenanceRequest)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Broken AC in Room 305"
                          data-testid="input-title" 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Room 305, Floor 3"
                          data-testid="input-location" 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the maintenance issue in detail..."
                          rows={4}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createMaintenanceRequestMutation.isPending}
                  className="w-full"
                  data-testid="button-submit"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {createMaintenanceRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : myRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4" data-testid="no-requests">
                No maintenance requests submitted
              </p>
            ) : (
              <div className="space-y-3">
                {myRequests.map((request, index) => (
                  <div key={request.id} className="p-4 border rounded-lg" data-testid={`request-item-${index}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{request.title}</h4>
                      <Badge className={getStatusColor(request.status)} variant="secondary">
                        {request.status}
                      </Badge>
                    </div>
                    {request.location && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Location:</strong> {request.location}
                      </p>
                    )}
                    {request.description && (
                      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(request.priority)} variant="outline">
                        {request.priority} priority
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' })}
                      </span>
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
