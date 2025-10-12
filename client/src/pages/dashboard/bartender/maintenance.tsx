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
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export default function BartenderMaintenance() {
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
    enabled: !!user,
    select: (data: any) => {
      return data.filter((req: any) => req.reportedBy?.id === user?.id);
    }
  });

  useRealtimeQuery({
    queryKey: ["/api/hotels/current/maintenance-requests"],
    refetchInterval: 3000,
    events: ['maintenance:created', 'maintenance:updated', 'maintenance:deleted']
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/hotels/current/maintenance-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/maintenance-requests"] });
      toast({ title: "Maintenance request submitted successfully" });
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Wrench className="h-5 w-5 text-blue-600" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-orange-500" />;
    }
  };

  return (
    <DashboardLayout title="Maintenance Requests">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Submit New Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Ice maker not working"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Bar Counter, Storage Area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  data-testid="input-location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority" className="h-11" data-testid="select-priority">
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
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo *</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  required
                  data-testid="input-photo"
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
                    <img src={photo} alt="Preview" className="max-w-full h-32 object-cover rounded border" data-testid="img-photo-preview" />
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 min-h-11"
                disabled={createRequestMutation.isPending}
                data-testid="button-submit-request"
              >
                {createRequestMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
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
                <p className="text-center text-muted-foreground py-8" data-testid="text-no-requests">
                  No maintenance requests submitted yet
                </p>
              ) : (
                myRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                    data-testid={`card-request-${request.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(request.status)}
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground leading-tight" data-testid={`text-title-${request.id}`}>
                            {request.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-location-${request.id}`}>
                            {request.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground pl-8" data-testid={`text-description-${request.id}`}>
                      {request.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pl-8">
                      <Badge className={getPriorityColor(request.priority)} variant="outline" data-testid={`badge-priority-${request.id}`}>
                        {request.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" data-testid={`badge-status-${request.id}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground" data-testid={`text-date-${request.id}`}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {request.resolvedAt && (
                      <p className="text-xs text-green-600 pl-8" data-testid={`text-resolved-${request.id}`}>
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
