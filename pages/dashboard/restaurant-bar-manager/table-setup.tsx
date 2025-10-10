import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, Plus, Users, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function TableSetup() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    name: "",
    capacity: "",
    location: "",
    status: "available"
  });

  const queryClient = useQueryClient();

  // Fetch restaurant tables
  const { data: tables = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/restaurant-tables"],
    refetchInterval: 3000
  });

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (tableData: any) => {
      const response = await fetch("/api/hotels/current/restaurant-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...tableData,
          capacity: parseInt(tableData.capacity)
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create table");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/restaurant-tables"] });
      setIsAddDialogOpen(false);
      setNewTable({ name: "", capacity: "", location: "", status: "available" });
      toast.success("Table created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  // Update table status mutation
  const updateTableMutation = useMutation({
    mutationFn: async ({ tableId, status }: { tableId: string; status: string }) => {
      const response = await fetch(`/api/hotels/current/restaurant-tables/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update table");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/restaurant-tables"] });
      toast.success("Table status updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleCreateTable = () => {
    if (!newTable.name || !newTable.capacity) {
      toast.error("Please fill in table name and capacity");
      return;
    }

    createTableMutation.mutate(newTable);
  };

  const handleStatusChange = (table: any, status: string) => {
    updateTableMutation.mutate({ tableId: table.id, status });
  };

  const handleDeleteTable = async (table: any) => {
    if (confirm(`Are you sure you want to delete table "${table.name}"?`)) {
      try {
        const response = await fetch(`/api/hotels/current/restaurant-tables/${table.id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to delete table");
        queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/restaurant-tables"] });
        toast.success("Table deleted successfully");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'occupied': return 'text-red-600 bg-red-100';
      case 'reserved': return 'text-orange-600 bg-orange-100';
      case 'cleaning': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns = [
    { key: "name", label: "Table Name", sortable: true },
    { 
      key: "capacity", 
      label: "Capacity", 
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{value} guests</span>
        </div>
      )
    },
    { 
      key: "location", 
      label: "Location", 
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      ) : 'Not specified'
    },
    { 
      key: "status", 
      label: "Status", 
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </span>
          <Select 
            value={value} 
            onValueChange={(newStatus) => handleStatusChange(row, newStatus)}
          >
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }
  ];

  const actions = [
    { 
      label: "Delete", 
      action: handleDeleteTable, 
      variant: "destructive" as const 
    }
  ];

  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const totalCapacity = tables.reduce((sum, table) => sum + (table.capacity || 0), 0);

  return (
    <DashboardLayout title="Table Setup">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tables</p>
                  <p className="text-2xl font-bold">{totalTables}</p>
                </div>
                <Table className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{availableTables}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                  <p className="text-2xl font-bold">{occupiedTables}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold">{totalCapacity}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Table */}
        <DataTable
          title="Restaurant Tables"
          data={tables}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          onAdd={() => setIsAddDialogOpen(true)}
          addButtonLabel="Add Table"
          searchPlaceholder="Search tables..."
        />

        {/* Add Table Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Restaurant Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Table Name *</Label>
                <Input
                  id="name"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder="e.g., Table 1, VIP A, Patio 3"
                />
              </div>
              
              <div>
                <Label htmlFor="capacity">Capacity (Number of Guests) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  placeholder="Enter number of seats"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location/Area</Label>
                <Input
                  id="location"
                  value={newTable.location}
                  onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                  placeholder="e.g., Indoor, Patio, VIP Section"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select 
                  value={newTable.status} 
                  onValueChange={(value) => setNewTable({ ...newTable, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTable}
                  disabled={createTableMutation.isPending}
                >
                  {createTableMutation.isPending ? "Creating..." : "Create Table"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}