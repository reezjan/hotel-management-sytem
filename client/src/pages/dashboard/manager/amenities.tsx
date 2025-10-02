import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Building, Waves, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface Hall {
  id: string;
  name: string;
  capacity: number;
  priceInhouse: string;
  priceWalkin: string;
  createdAt: string;
}

interface Pool {
  id: string;
  name: string;
  priceInhouse: string;
  priceWalkin: string;
  createdAt: string;
}

interface Service {
  id: string;
  kind: string;
  name: string;
  priceInhouse: string;
  priceWalkin: string;
}

const ServiceTypes = [
  'Spa',
  'Jacuzzi',
  'Massage',
  'Fitness Center',
  'Sauna',
  'Beauty Salon',
  'Laundry',
  'Car Rental',
  'Tour Guide',
  'Airport Transfer',
  'Conference Room',
  'Business Center',
  'Other'
];

export default function AmenitiesPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('halls');

  // Dialog states
  const [showHallDialog, setShowHallDialog] = useState(false);
  const [showPoolDialog, setShowPoolDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'hall' | 'pool' | 'service', id: string} | null>(null);

  // Form states
  const [hallForm, setHallForm] = useState({
    name: '',
    capacity: '',
    priceInhouse: '',
    priceWalkin: ''
  });

  const [poolForm, setPoolForm] = useState({
    name: '',
    priceInhouse: '',
    priceWalkin: ''
  });

  const [serviceForm, setServiceForm] = useState({
    kind: '',
    name: '',
    priceInhouse: '',
    priceWalkin: ''
  });

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const [hallsRes, poolsRes, servicesRes] = await Promise.all([
        fetch('/api/halls'),
        fetch('/api/pools'),
        fetch('/api/services')
      ]);

      if (hallsRes.ok) {
        const hallsData = await hallsRes.json();
        setHalls(hallsData);
      }

      if (poolsRes.ok) {
        const poolsData = await poolsRes.json();
        setPools(poolsData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }
    } catch (error) {
      toast.error('Failed to fetch amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const resetForms = () => {
    setHallForm({ name: '', capacity: '', priceInhouse: '', priceWalkin: '' });
    setPoolForm({ name: '', priceInhouse: '', priceWalkin: '' });
    setServiceForm({ kind: '', name: '', priceInhouse: '', priceWalkin: '' });
    setEditingHall(null);
    setEditingPool(null);
    setEditingService(null);
  };

  const handleHallSubmit = async () => {
    try {
      const data = {
        name: hallForm.name,
        capacity: parseInt(hallForm.capacity),
        priceInhouse: hallForm.priceInhouse,
        priceWalkin: hallForm.priceWalkin
      };

      const response = editingHall
        ? await fetch(`/api/halls/${editingHall.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
        : await fetch('/api/halls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

      if (response.ok) {
        toast.success(editingHall ? 'Hall updated successfully' : 'Hall created successfully');
        setShowHallDialog(false);
        resetForms();
        fetchAmenities();
      } else {
        toast.error('Failed to save hall');
      }
    } catch (error) {
      toast.error('Failed to save hall');
    }
  };

  const handlePoolSubmit = async () => {
    try {
      const data = {
        name: poolForm.name,
        priceInhouse: poolForm.priceInhouse,
        priceWalkin: poolForm.priceWalkin
      };

      const response = editingPool
        ? await fetch(`/api/pools/${editingPool.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
        : await fetch('/api/pools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

      if (response.ok) {
        toast.success(editingPool ? 'Pool updated successfully' : 'Pool created successfully');
        setShowPoolDialog(false);
        resetForms();
        fetchAmenities();
      } else {
        toast.error('Failed to save pool');
      }
    } catch (error) {
      toast.error('Failed to save pool');
    }
  };

  const handleServiceSubmit = async () => {
    try {
      const data = {
        kind: serviceForm.kind,
        name: serviceForm.name,
        priceInhouse: serviceForm.priceInhouse,
        priceWalkin: serviceForm.priceWalkin
      };

      const response = editingService
        ? await fetch(`/api/services/${editingService.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
        : await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

      if (response.ok) {
        toast.success(editingService ? 'Service updated successfully' : 'Service created successfully');
        setShowServiceDialog(false);
        resetForms();
        fetchAmenities();
      } else {
        toast.error('Failed to save service');
      }
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/${deleteConfirm.type}s/${deleteConfirm.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success(`${deleteConfirm.type} deleted successfully`);
        setDeleteConfirm(null);
        fetchAmenities();
      } else {
        toast.error(`Failed to delete ${deleteConfirm.type}`);
      }
    } catch (error) {
      toast.error(`Failed to delete ${deleteConfirm.type}`);
    }
  };

  const editHall = (hall: Hall) => {
    setHallForm({
      name: hall.name,
      capacity: hall.capacity.toString(),
      priceInhouse: hall.priceInhouse,
      priceWalkin: hall.priceWalkin
    });
    setEditingHall(hall);
    setShowHallDialog(true);
  };

  const editPool = (pool: Pool) => {
    setPoolForm({
      name: pool.name,
      priceInhouse: pool.priceInhouse,
      priceWalkin: pool.priceWalkin
    });
    setEditingPool(pool);
    setShowPoolDialog(true);
  };

  const editService = (service: Service) => {
    setServiceForm({
      kind: service.kind,
      name: service.name,
      priceInhouse: service.priceInhouse,
      priceWalkin: service.priceWalkin
    });
    setEditingService(service);
    setShowServiceDialog(true);
  };

  const formatPrice = (price: string) => {
    return `NPR ${parseFloat(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Amenities Management">
        <div className="text-center">Loading amenities...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Amenities Management">
      <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Amenities Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage hotel amenities including halls, pools, and services with dual pricing for in-house guests and walk-in customers.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{halls.length}</p>
                <p className="text-sm text-muted-foreground">Event Halls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Waves className="h-8 w-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold">{pools.length}</p>
                <p className="text-sm text-muted-foreground">Pools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{services.length}</p>
                <p className="text-sm text-muted-foreground">Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="halls">Event Halls</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Halls Tab */}
        <TabsContent value="halls" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Event Halls</h2>
            <Dialog open={showHallDialog} onOpenChange={(open) => {
              setShowHallDialog(open);
              if (!open) resetForms();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hall
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingHall ? 'Edit Hall' : 'Add New Hall'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hall-name">Hall Name</Label>
                    <Input
                      id="hall-name"
                      value={hallForm.name}
                      onChange={(e) => setHallForm({...hallForm, name: e.target.value})}
                      placeholder="e.g., Grand Ballroom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hall-capacity">Capacity</Label>
                    <Input
                      id="hall-capacity"
                      type="number"
                      value={hallForm.capacity}
                      onChange={(e) => setHallForm({...hallForm, capacity: e.target.value})}
                      placeholder="e.g., 200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hall-price-inhouse">In-House Price (NPR)</Label>
                      <Input
                        id="hall-price-inhouse"
                        type="number"
                        step="0.01"
                        value={hallForm.priceInhouse}
                        onChange={(e) => setHallForm({...hallForm, priceInhouse: e.target.value})}
                        placeholder="5000.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hall-price-walkin">Walk-in Price (NPR)</Label>
                      <Input
                        id="hall-price-walkin"
                        type="number"
                        step="0.01"
                        value={hallForm.priceWalkin}
                        onChange={(e) => setHallForm({...hallForm, priceWalkin: e.target.value})}
                        placeholder="8000.00"
                      />
                    </div>
                  </div>
                  <Button onClick={handleHallSubmit} className="w-full">
                    {editingHall ? 'Update Hall' : 'Create Hall'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>In-House Price</TableHead>
                    <TableHead>Walk-in Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {halls.map((hall) => (
                    <TableRow key={hall.id}>
                      <TableCell className="font-medium">{hall.name}</TableCell>
                      <TableCell>{hall.capacity} people</TableCell>
                      <TableCell>{formatPrice(hall.priceInhouse)}</TableCell>
                      <TableCell>{formatPrice(hall.priceWalkin)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => editHall(hall)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setDeleteConfirm({type: 'hall', id: hall.id})}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {halls.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No halls configured. Add your first hall to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pools Tab */}
        <TabsContent value="pools" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Swimming Pools</h2>
            <Dialog open={showPoolDialog} onOpenChange={(open) => {
              setShowPoolDialog(open);
              if (!open) resetForms();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pool
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPool ? 'Edit Pool' : 'Add New Pool'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pool-name">Pool Name</Label>
                    <Input
                      id="pool-name"
                      value={poolForm.name}
                      onChange={(e) => setPoolForm({...poolForm, name: e.target.value})}
                      placeholder="e.g., Olympic Pool"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pool-price-inhouse">In-House Price (NPR)</Label>
                      <Input
                        id="pool-price-inhouse"
                        type="number"
                        step="0.01"
                        value={poolForm.priceInhouse}
                        onChange={(e) => setPoolForm({...poolForm, priceInhouse: e.target.value})}
                        placeholder="500.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pool-price-walkin">Walk-in Price (NPR)</Label>
                      <Input
                        id="pool-price-walkin"
                        type="number"
                        step="0.01"
                        value={poolForm.priceWalkin}
                        onChange={(e) => setPoolForm({...poolForm, priceWalkin: e.target.value})}
                        placeholder="800.00"
                      />
                    </div>
                  </div>
                  <Button onClick={handlePoolSubmit} className="w-full">
                    {editingPool ? 'Update Pool' : 'Create Pool'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>In-House Price</TableHead>
                    <TableHead>Walk-in Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pools.map((pool) => (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.name}</TableCell>
                      <TableCell>{formatPrice(pool.priceInhouse)}</TableCell>
                      <TableCell>{formatPrice(pool.priceWalkin)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => editPool(pool)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setDeleteConfirm({type: 'pool', id: pool.id})}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pools.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No pools configured. Add your first pool to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Hotel Services</h2>
            <Dialog open={showServiceDialog} onOpenChange={(open) => {
              setShowServiceDialog(open);
              if (!open) resetForms();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="service-kind">Service Type</Label>
                    <Select 
                      value={serviceForm.kind} 
                      onValueChange={(value) => setServiceForm({...serviceForm, kind: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ServiceTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="service-name">Service Name</Label>
                    <Input
                      id="service-name"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                      placeholder="e.g., Swedish Massage"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service-price-inhouse">In-House Price (NPR)</Label>
                      <Input
                        id="service-price-inhouse"
                        type="number"
                        step="0.01"
                        value={serviceForm.priceInhouse}
                        onChange={(e) => setServiceForm({...serviceForm, priceInhouse: e.target.value})}
                        placeholder="1500.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-price-walkin">Walk-in Price (NPR)</Label>
                      <Input
                        id="service-price-walkin"
                        type="number"
                        step="0.01"
                        value={serviceForm.priceWalkin}
                        onChange={(e) => setServiceForm({...serviceForm, priceWalkin: e.target.value})}
                        placeholder="2000.00"
                      />
                    </div>
                  </div>
                  <Button onClick={handleServiceSubmit} className="w-full">
                    {editingService ? 'Update Service' : 'Create Service'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>In-House Price</TableHead>
                    <TableHead>Walk-in Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Badge variant="secondary">{service.kind}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{formatPrice(service.priceInhouse)}</TableCell>
                      <TableCell>{formatPrice(service.priceWalkin)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => editService(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setDeleteConfirm({type: 'service', id: service.id})}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {services.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No services configured. Add your first service to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {deleteConfirm?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </DashboardLayout>
  );
}