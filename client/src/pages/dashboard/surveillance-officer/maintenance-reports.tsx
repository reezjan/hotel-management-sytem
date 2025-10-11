import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { AlertTriangle, Plus } from "lucide-react";

export default function SurveillanceOfficerMaintenanceReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    location: "",
    description: "",
    priority: "medium",
    photo: ""
  });

  const { data: maintenanceRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"]
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: typeof maintenanceForm) => {
      return await apiRequest("POST", "/api/hotels/current/maintenance-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request sent to Security Head successfully" });
      setMaintenanceForm({ title: "", location: "", description: "", priority: "medium", photo: "" });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to send maintenance request", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceForm.title || !maintenanceForm.location) {
      toast({ title: "Title and location are required", variant: "destructive" });
      return;
    }
    if (!maintenanceForm.photo) {
      toast({ title: "Photo is required", variant: "destructive" });
      return;
    }
    createMaintenanceMutation.mutate(maintenanceForm);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaintenanceForm({ ...maintenanceForm, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const myMaintenanceRequests = maintenanceRequests.filter(r => r.reportedBy?.id === user?.id);
  const pendingRequests = myMaintenanceRequests.filter(r => r.status === 'pending');
  const resolvedRequests = myMaintenanceRequests.filter(r => r.status === 'resolved');

  return (
    <DashboardLayout title="Maintenance Reports">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-3xl font-bold">{pendingRequests.length}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Requests</p>
                  <p className="text-3xl font-bold">{resolvedRequests.length}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Submit Maintenance Request</CardTitle>
                <CardDescription>Report issues to Security Head</CardDescription>
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)} 
                size="sm"
                data-testid="button-toggle-form"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showForm ? 'Cancel' : 'New Request'}
              </Button>
            </div>
          </CardHeader>
          {showForm && (
            <CardContent>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      data-testid="input-maintenance-title"
                      value={maintenanceForm.title}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                      placeholder="e.g., CCTV Camera Malfunction"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      data-testid="input-maintenance-location"
                      value={maintenanceForm.location}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, location: e.target.value })}
                      placeholder="e.g., Main Entrance"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={maintenanceForm.priority} 
                    onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, priority: value })}
                  >
                    <SelectTrigger data-testid="select-maintenance-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="textarea-maintenance-description"
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    placeholder="Detailed description of the issue"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="photo">Photo *</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    data-testid="input-maintenance-photo"
                    onChange={handlePhotoChange}
                    required
                  />
                  {maintenanceForm.photo && (
                    <div className="mt-2">
                      <img src={maintenanceForm.photo} alt="Preview" className="max-w-xs rounded border" />
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={createMaintenanceMutation.isPending}
                  data-testid="button-submit-maintenance"
                >
                  {createMaintenanceMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Maintenance Requests</CardTitle>
            <CardDescription>Track your submitted requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-maintenance">Loading maintenance requests...</div>
            ) : myMaintenanceRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-maintenance">
                No maintenance requests yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myMaintenanceRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors" 
                    data-testid={`maintenance-${request.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <h4 className="font-medium" data-testid={`maintenance-title-${request.id}`}>
                            {request.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            request.priority === 'high' ? 'bg-red-100 text-red-800' :
                            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`} data-testid={`maintenance-status-${request.id}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                        {request.description && (
                          <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Location: {request.location}</span>
                          <span>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
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
