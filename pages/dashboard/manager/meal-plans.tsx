import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface MealPlan {
  id: string;
  hotelId: string;
  planType: string;
  planName: string;
  pricePerPerson: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const MEAL_PLAN_TYPES = [
  { value: 'EP', label: 'EP - European Plan', description: 'Room only, no meals included' },
  { value: 'BB', label: 'BB - Bed & Breakfast', description: 'Room with breakfast' },
  { value: 'AP', label: 'AP - American Plan', description: 'Room with all meals' },
  { value: 'MAP', label: 'MAP - Modified American Plan', description: 'Room with breakfast and one meal' }
];

export default function MealPlansPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<string>('');

  const [form, setForm] = useState({
    planType: '',
    planName: '',
    pricePerPerson: '',
    description: ''
  });

  const { data: user } = useQuery<{ hotelId?: string }>({
    queryKey: ['/api/user'],
    refetchInterval: 3000
  });

  const queryClientInstance = useQueryClient();

  useEffect(() => {
    if (user?.hotelId) {
      setHotelId(user.hotelId);
    }
  }, [user]);

  const { data: mealPlans = [], isLoading } = useQuery<MealPlan[]>({
    queryKey: ['/api/hotels', hotelId, 'meal-plans'],
    enabled: !!hotelId,
    refetchInterval: 3000
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest('POST', `/api/hotels/${hotelId}/meal-plans`, data);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/hotels', hotelId, 'meal-plans'] });
      toast.success('Meal plan created successfully');
      resetForm();
      setShowDialog(false);
    },
    onError: () => {
      toast.error('Failed to create meal plan');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; values: Partial<typeof form> }) => {
      return apiRequest('PUT', `/api/hotels/${hotelId}/meal-plans/${data.id}`, data.values);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/hotels', hotelId, 'meal-plans'] });
      toast.success('Meal plan updated successfully');
      resetForm();
      setShowDialog(false);
      setEditingPlan(null);
    },
    onError: () => {
      toast.error('Failed to update meal plan');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/hotels/${hotelId}/meal-plans/${id}`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/hotels', hotelId, 'meal-plans'] });
      toast.success('Meal plan deleted successfully');
      setDeleteConfirm(null);
    },
    onError: () => {
      toast.error('Failed to delete meal plan');
    }
  });

  const resetForm = () => {
    setForm({
      planType: '',
      planName: '',
      pricePerPerson: '',
      description: ''
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan: MealPlan) => {
    setEditingPlan(plan);
    setForm({
      planType: plan.planType,
      planName: plan.planName,
      pricePerPerson: plan.pricePerPerson,
      description: plan.description || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.planType || !form.planName || !form.pricePerPerson) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, values: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handlePlanTypeChange = (value: string) => {
    const selectedPlan = MEAL_PLAN_TYPES.find(p => p.value === value);
    setForm({
      ...form,
      planType: value,
      planName: selectedPlan?.label || value
    });
  };

  return (
    <DashboardLayout title="Meal Plans">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-meal-plans">Meal Plans</h1>
            <p className="text-muted-foreground mt-1">Manage meal plan add-ons for room bookings</p>
          </div>
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-meal-plan">
                <Plus className="h-4 w-4 mr-2" />
                Add Meal Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPlan ? 'Edit Meal Plan' : 'Add Meal Plan'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="planType">Plan Type *</Label>
                  <Select
                    value={form.planType}
                    onValueChange={handlePlanTypeChange}
                    disabled={!!editingPlan}
                  >
                    <SelectTrigger data-testid="select-plan-type">
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_PLAN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.planType && (
                    <p className="text-sm text-muted-foreground">
                      {MEAL_PLAN_TYPES.find(t => t.value === form.planType)?.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name *</Label>
                  <Input
                    id="planName"
                    value={form.planName}
                    onChange={(e) => setForm({ ...form, planName: e.target.value })}
                    placeholder="e.g., BB - Bed & Breakfast"
                    required
                    data-testid="input-plan-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerPerson">Price per Person *</Label>
                  <Input
                    id="pricePerPerson"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.pricePerPerson}
                    onChange={(e) => setForm({ ...form, pricePerPerson: e.target.value })}
                    placeholder="0.00"
                    required
                    data-testid="input-price-per-person"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Additional details about this meal plan..."
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      resetForm();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-meal-plan"
                  >
                    {editingPlan ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Available Meal Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : mealPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No meal plans configured. Add your first meal plan to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Type</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price per Person</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mealPlans.map((plan) => (
                    <TableRow key={plan.id} data-testid={`row-meal-plan-${plan.id}`}>
                      <TableCell>
                        <Badge variant="outline" data-testid={`badge-plan-type-${plan.id}`}>
                          {plan.planType}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-plan-name-${plan.id}`}>
                        {plan.planName}
                      </TableCell>
                      <TableCell data-testid={`text-price-${plan.id}`}>
                        NPR {parseFloat(plan.pricePerPerson).toFixed(2)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`text-description-${plan.id}`}>
                        {plan.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            data-testid={`button-edit-${plan.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(plan.id)}
                            data-testid={`button-delete-${plan.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meal plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
