import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Send, Clock, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function FinanceMaintenanceRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<string>("");

  const { data: myRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    refetchInterval: 3000,
    select: (data: any) => {
      return data.filter((req: any) => req.reportedBy?.id === user?.id || req.reportedBy === user?.id);
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/hotels/current/maintenance-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request submitted successfully to Manager" });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setLocation("");
      setPhoto("");
    },
    onError: () => {
      toast({ 
        title: "Failed to submit request", 
        description: "Please try again later",
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !location || !photo) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in all required fields including photo",
        variant: "destructive" 
      });
      return;
    }

    createRequestMutation.mutate({
      title,
      description,
      priority,
      location,
      photo,
      status: 'pending'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
    }
  };

  return (
    <DashboardLayout title="Maintenance Requests">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Submit Request to Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Office AC Not Working"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  data-testid="input-maintenance-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Finance Office, Accounting Department"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  data-testid="input-maintenance-location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority" className="h-11" data-testid="select-maintenance-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait</SelectItem>
                    <SelectItem value="medium">Medium - Soon</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  data-testid="input-maintenance-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo *</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  required
                  data-testid="input-maintenance-photo"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhoto(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {photo && (
                  <div className="mt-2">
                    <img src={photo} alt="Preview" className="max-w-full h-32 object-cover rounded border" />
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 min-h-11"
                disabled={createRequestMutation.isPending}
                data-testid="button-submit-maintenance"
              >
                {createRequestMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit to Manager
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No maintenance requests submitted yet
                </p>
              ) : (
                myRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                    data-testid={`maintenance-request-${request.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(request.status)}
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground leading-tight">
                            {request.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground pl-8">
                      {request.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pl-8">
                      <Badge className={getPriorityColor(request.priority)} variant="outline">
                        {request.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {request.resolvedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400 pl-8">
                        ✓ Resolved on {new Date(request.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
