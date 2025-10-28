import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Mail, Phone, MapPin, Edit, Trash2, Plus, Search } from "lucide-react";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Company } from "@shared/schema";

const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  discountPercentage: z.string().optional(),
  creditLimit: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true)
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

export default function CompanyProfiles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/hotels/current/companies"],
    enabled: !!user?.hotelId
  });

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      taxId: "",
      discountPercentage: "0",
      creditLimit: "",
      notes: "",
      isActive: true
    }
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return apiRequest("POST", "/api/hotels/current/companies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/companies"] });
      toast({ title: "Company created successfully" });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create company",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<CompanyFormData> }) => {
      return apiRequest("PUT", `/api/companies/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/companies"] });
      toast({ title: "Company updated successfully" });
      setDialogOpen(false);
      setEditingCompany(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update company",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/companies/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/companies"] });
      toast({ title: "Company deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete company",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const handleAddCompany = () => {
    setEditingCompany(null);
    form.reset({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      taxId: "",
      discountPercentage: "0",
      creditLimit: "",
      notes: "",
      isActive: true
    });
    setDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    form.reset({
      name: company.name,
      contactPerson: company.contactPerson || "",
      email: company.email || "",
      phone: company.phone,
      address: company.address || "",
      city: company.city || "",
      country: company.country || "",
      taxId: company.taxId || "",
      discountPercentage: company.discountPercentage || "0",
      creditLimit: company.creditLimit || "",
      notes: company.notes || "",
      isActive: company.isActive
    });
    setDialogOpen(true);
  };

  const handleDeleteCompany = async (company: Company) => {
    const confirmed = await confirm({
      title: "Delete Company",
      description: `Are you sure you want to delete ${company.name}? This action can be undone by managers.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (confirmed) {
      deleteCompanyMutation.mutate(company.id);
    }
  };

  const onSubmit = (data: CompanyFormData) => {
    if (editingCompany) {
      updateCompanyMutation.mutate({ id: editingCompany.id, updates: data });
    } else {
      createCompanyMutation.mutate(data);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const search = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(search) ||
      (company.contactPerson?.toLowerCase() || "").includes(search) ||
      (company.email?.toLowerCase() || "").includes(search) ||
      company.phone.toLowerCase().includes(search) ||
      (company.city?.toLowerCase() || "").includes(search)
    );
  });

  const activeCompanies = filteredCompanies.filter(c => c.isActive);
  const inactiveCompanies = filteredCompanies.filter(c => !c.isActive);

  return (
    <DashboardLayout title="Company Profiles">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Profiles</h1>
            <p className="text-muted-foreground">Manage corporate clients and business accounts</p>
          </div>
          <Button onClick={handleAddCompany} data-testid="button-add-company">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-companies"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading companies...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeCompanies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Companies ({activeCompanies.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCompanies.map((company) => (
                    <Card key={company.id} className="hover:shadow-lg transition-shadow" data-testid={`card-company-${company.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg" data-testid={`text-company-name-${company.id}`}>{company.name}</CardTitle>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCompany(company)}
                              data-testid={`button-edit-company-${company.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCompany(company)}
                              data-testid={`button-delete-company-${company.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {company.contactPerson && (
                          <CardDescription data-testid={`text-contact-person-${company.id}`}>
                            Contact: {company.contactPerson}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {company.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span data-testid={`text-phone-${company.id}`}>{company.phone}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span data-testid={`text-email-${company.id}`}>{company.email}</span>
                          </div>
                        )}
                        {(company.city || company.country) && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span data-testid={`text-location-${company.id}`}>
                              {[company.city, company.country].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {company.discountPercentage && Number(company.discountPercentage) > 0 && (
                            <Badge variant="secondary" data-testid={`badge-discount-${company.id}`}>
                              {company.discountPercentage}% Discount
                            </Badge>
                          )}
                          {company.creditLimit && Number(company.creditLimit) > 0 && (
                            <Badge variant="outline" data-testid={`badge-credit-${company.id}`}>
                              Credit: Rs. {company.creditLimit}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {inactiveCompanies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-muted-foreground">
                  Inactive Companies ({inactiveCompanies.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveCompanies.map((company) => (
                    <Card key={company.id} className="opacity-60" data-testid={`card-company-${company.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                          </div>
                          <Badge variant="secondary">Inactive</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                          data-testid={`button-edit-company-${company.id}`}
                        >
                          Reactivate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {filteredCompanies.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No companies found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm ? "Try a different search term" : "Get started by adding your first company"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleAddCompany} data-testid="button-add-first-company">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Company
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle data-testid="dialog-title-company">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </DialogTitle>
              <DialogDescription>
                {editingCompany
                  ? "Update company information and settings"
                  : "Enter company details to create a new business account"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC Corporation" data-testid="input-company-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" data-testid="input-contact-person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+977-1234567890" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contact@company.com" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Kathmandu" data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nepal" data-testid="input-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID / VAT Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123456789" data-testid="input-tax-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage (%)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0" data-testid="input-discount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Credit Limit (Rs.)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0" data-testid="input-credit-limit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Street address" data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes..." rows={3} data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                          data-testid="checkbox-is-active"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingCompany(null);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                    data-testid="button-submit-company"
                  >
                    {createCompanyMutation.isPending || updateCompanyMutation.isPending
                      ? "Saving..."
                      : editingCompany
                      ? "Update Company"
                      : "Create Company"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
