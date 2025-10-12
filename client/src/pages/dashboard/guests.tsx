import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, UserPlus, Search, Edit, Trash2, Phone, Mail, MapPin, CalendarIcon, IdCard } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { formatDate, cn } from "@/lib/utils";
import { insertGuestSchema, type Guest } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { COUNTRIES } from "@/lib/constants";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

const guestFormSchema = insertGuestSchema.extend({
  dateOfBirth: z.date().optional().nullable()
});

type GuestFormData = z.infer<typeof guestFormSchema>;

export default function GuestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [openCountryAdd, setOpenCountryAdd] = useState(false);
  const [openCountryEdit, setOpenCountryEdit] = useState(false);

  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ["/api/hotels/current/guests"],
    refetchInterval: 3000,
    enabled: !!user?.hotelId
  });

  // Listen for real-time guest updates
  useRealtimeQuery({
    queryKey: ["/api/hotels/current/guests"],
    refetchInterval: 3000,
    events: ['guest:created', 'guest:updated']
  });

  const guestForm = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      idType: "",
      idNumber: "",
      nationality: "",
      notes: "",
      dateOfBirth: null
    }
  });

  const createGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      const formattedData = {
        ...data,
        hotelId: user?.hotelId,
        createdBy: user?.id,
        dateOfBirth: dateOfBirth || null
      };
      await apiRequest("POST", "/api/hotels/current/guests", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/guests"] });
      toast({ title: "Guest added successfully" });
      guestForm.reset();
      setDateOfBirth(undefined);
      setIsAddModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to add guest", 
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const updateGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      if (!selectedGuest) return;
      const formattedData = {
        ...data,
        dateOfBirth: dateOfBirth || null
      };
      await apiRequest("PUT", `/api/hotels/current/guests/${selectedGuest.id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/guests"] });
      toast({ title: "Guest updated successfully" });
      guestForm.reset();
      setDateOfBirth(undefined);
      setSelectedGuest(null);
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update guest", 
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      await apiRequest("DELETE", `/api/hotels/current/guests/${guestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/guests"] });
      toast({ title: "Guest deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to delete guest",
        variant: "destructive"
      });
    }
  });

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    guestForm.reset({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || "",
      phone: guest.phone,
      address: guest.address || "",
      city: guest.city || "",
      country: guest.country || "",
      idType: guest.idType || "",
      idNumber: guest.idNumber || "",
      nationality: guest.nationality || "",
      notes: guest.notes || "",
      dateOfBirth: guest.dateOfBirth ? new Date(guest.dateOfBirth) : null
    });
    if (guest.dateOfBirth) {
      setDateOfBirth(new Date(guest.dateOfBirth));
    }
    setIsEditModalOpen(true);
  };

  const handleDeleteGuest = async (guestId: string) => {
    await confirm({
      title: "Delete Guest",
      description: "Are you sure you want to delete this guest?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        deleteGuestMutation.mutate(guestId);
      }
    });
  };

  const filteredGuests = guests.filter(guest => {
    const search = searchQuery.toLowerCase();
    return (
      guest.firstName.toLowerCase().includes(search) ||
      guest.lastName.toLowerCase().includes(search) ||
      guest.phone.toLowerCase().includes(search) ||
      (guest.email && guest.email.toLowerCase().includes(search))
    );
  });

  return (
    <DashboardLayout title="Guest Management">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Guests</p>
                <p className="text-4xl font-bold mt-2">{guests.length}</p>
                <p className="text-sm opacity-90 mt-1">Registered in the system</p>
              </div>
              <Users className="h-16 w-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>All Guests</CardTitle>
              <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-guest">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Guest
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guests by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-guests"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading guests...</div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No guests found matching your search" : "No guests registered yet"}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredGuests.map((guest) => (
                  <Card key={guest.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          <h3 className="text-lg font-semibold" data-testid={`text-guest-name-${guest.id}`}>
                            {guest.firstName} {guest.lastName}
                          </h3>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {guest.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{guest.phone}</span>
                              </div>
                            )}
                            {guest.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{guest.email}</span>
                              </div>
                            )}
                            {guest.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{guest.city}{guest.country && `, ${guest.country}`}</span>
                              </div>
                            )}
                            {guest.idNumber && (
                              <div className="flex items-center gap-2">
                                <IdCard className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{guest.idType || "ID"}: {guest.idNumber}</span>
                              </div>
                            )}
                          </div>
                          {guest.notes && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">Notes:</span> {guest.notes}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">
                            Added on {guest.createdAt ? formatDate(guest.createdAt) : 'N/A'}
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditGuest(guest)}
                            data-testid={`button-edit-guest-${guest.id}`}
                            className="flex-1 md:flex-initial"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteGuest(guest.id)}
                            data-testid={`button-delete-guest-${guest.id}`}
                            className="flex-1 md:flex-initial"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
            </DialogHeader>
            <Form {...guestForm}>
              <form onSubmit={guestForm.handleSubmit((data) => createGuestMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="John" data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Doe" data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="+977-9800000000" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="email" placeholder="john@example.com" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={guestForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Street address" data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Kathmandu" data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Country</FormLabel>
                        <Popover open={openCountryAdd} onOpenChange={setOpenCountryAdd}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="select-country"
                              >
                                {field.value
                                  ? COUNTRIES.find((country) => country.name === field.value)
                                    ? `${COUNTRIES.find((country) => country.name === field.value)?.flag} ${field.value}`
                                    : "Select country"
                                  : "Select country"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Type to search countries..." />
                              <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                  {COUNTRIES.map((country) => (
                                    <CommandItem
                                      key={country.code}
                                      value={country.name}
                                      onSelect={() => {
                                        field.onChange(country.name);
                                        setOpenCountryAdd(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          country.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <span className="text-lg mr-2">{country.flag}</span>
                                      {country.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="idType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-id-type">
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="national_id">National ID</SelectItem>
                            <SelectItem value="driving_license">Driving License</SelectItem>
                            <SelectItem value="citizenship">Citizenship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="ID number" data-testid="input-id-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Nepali" data-testid="input-nationality" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !dateOfBirth && "text-muted-foreground"
                            )}
                            data-testid="button-select-dob"
                          >
                            {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={setDateOfBirth}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                </div>

                <FormField
                  control={guestForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Additional notes about the guest" rows={3} data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1" disabled={createGuestMutation.isPending} data-testid="button-submit-guest">
                    {createGuestMutation.isPending ? "Adding..." : "Add Guest"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Guest</DialogTitle>
            </DialogHeader>
            <Form {...guestForm}>
              <form onSubmit={guestForm.handleSubmit((data) => updateGuestMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="+977-9800000000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="email" placeholder="john@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={guestForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Street address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Kathmandu" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Country</FormLabel>
                        <Popover open={openCountryEdit} onOpenChange={setOpenCountryEdit}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? COUNTRIES.find((country) => country.name === field.value)
                                    ? `${COUNTRIES.find((country) => country.name === field.value)?.flag} ${field.value}`
                                    : "Select country"
                                  : "Select country"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Type to search countries..." />
                              <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                  {COUNTRIES.map((country) => (
                                    <CommandItem
                                      key={country.code}
                                      value={country.name}
                                      onSelect={() => {
                                        field.onChange(country.name);
                                        setOpenCountryEdit(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          country.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <span className="text-lg mr-2">{country.flag}</span>
                                      {country.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="idType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="national_id">National ID</SelectItem>
                            <SelectItem value="driving_license">Driving License</SelectItem>
                            <SelectItem value="citizenship">Citizenship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="ID number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={guestForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Nepali" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !dateOfBirth && "text-muted-foreground"
                            )}
                          >
                            {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={setDateOfBirth}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                </div>

                <FormField
                  control={guestForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Additional notes about the guest" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1" disabled={updateGuestMutation.isPending}>
                    {updateGuestMutation.isPending ? "Updating..." : "Update Guest"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
