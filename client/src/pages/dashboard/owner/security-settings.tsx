import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Mail, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { SecuritySettings } from "@shared/schema";

const securitySettingsSchema = z.object({
  ownerEmail: z.string().email("Invalid email address"),
  ownerPhone: z.string().optional(),
  alertOnNewDevice: z.boolean().default(true),
  alertOnNewLocation: z.boolean().default(true),
  alertOnLargeTransaction: z.boolean().default(true),
  largeTransactionThreshold: z.coerce.number().min(0, "Threshold must be positive"),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional().transform(val => {
    // Don't send masked password back to server
    if (val === '••••••••') return undefined;
    return val;
  }),
});

type SecuritySettingsForm = z.infer<typeof securitySettingsSchema>;

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);

  const { data: settings, isLoading } = useQuery<SecuritySettings>({
    queryKey: ["/api/hotels/current/security-settings"],
  });

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"],
  });

  const form = useForm<SecuritySettingsForm>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      ownerEmail: settings?.ownerEmail || "",
      ownerPhone: settings?.ownerPhone || "",
      alertOnNewDevice: settings?.alertOnNewDevice ?? true,
      alertOnNewLocation: settings?.alertOnNewLocation ?? true,
      alertOnLargeTransaction: settings?.alertOnLargeTransaction ?? true,
      largeTransactionThreshold: Number(settings?.largeTransactionThreshold) || 10000,
      smtpHost: settings?.smtpHost || "",
      smtpPort: settings?.smtpPort || 587,
      smtpUser: settings?.smtpUser || "",
      smtpPassword: settings?.smtpPassword || "",
    },
    values: settings ? {
      ownerEmail: settings.ownerEmail || "",
      ownerPhone: settings.ownerPhone || "",
      alertOnNewDevice: settings.alertOnNewDevice ?? true,
      alertOnNewLocation: settings.alertOnNewLocation ?? true,
      alertOnLargeTransaction: settings.alertOnLargeTransaction ?? true,
      largeTransactionThreshold: Number(settings.largeTransactionThreshold) || 10000,
      smtpHost: settings.smtpHost || "",
      smtpPort: settings.smtpPort || 587,
      smtpUser: settings.smtpUser || "",
      smtpPassword: settings.smtpPassword || "",
    } : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: SecuritySettingsForm) => {
      // Remove smtpPassword if it's empty or masked (not changed)
      const payload = { ...data };
      if (!payload.smtpPassword || payload.smtpPassword === '••••••••') {
        delete payload.smtpPassword;
      }
      return await apiRequest("PUT", "/api/hotels/current/security-settings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/security-settings"] });
      toast({
        title: "Settings Saved",
        description: "Security settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const email = form.getValues("ownerEmail");
      return await apiRequest("POST", "/api/hotels/current/security-settings/test-email", { email });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Test Email Sent",
        description: data.message || "A test alert has been sent to your email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SecuritySettingsForm) => {
    saveMutation.mutate(data);
  };

  const handleTestEmail = () => {
    const email = form.getValues("ownerEmail");
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address before testing.",
        variant: "destructive",
      });
      return;
    }
    testEmailMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Security Settings" currentHotel={hotel?.name}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Security Settings" currentHotel={hotel?.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Security Settings</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Alert Configuration Section */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
                <CardDescription>
                  Configure security alerts and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Owner Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ownerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="owner@hotel.com"
                            data-testid="input-owner-email"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Email address for receiving security alerts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+977 9800000000"
                            data-testid="input-owner-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          For future SMS alerts (not yet implemented)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Alert Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alert Preferences</h3>
                  
                  <FormField
                    control={form.control}
                    name="alertOnNewDevice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-alert-device"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable Device Alerts</FormLabel>
                          <FormDescription>
                            Get notified when staff login from a new device
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alertOnNewLocation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-alert-location"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable Location Alerts</FormLabel>
                          <FormDescription>
                            Get notified when staff login from a new location
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alertOnLargeTransaction"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-alert-transaction"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable Large Transaction Alerts</FormLabel>
                          <FormDescription>
                            Get notified when a transaction exceeds the threshold
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="largeTransactionThreshold"
                    render={({ field }) => (
                      <FormItem className="max-w-md">
                        <FormLabel>Large Transaction Threshold (Rs.)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="10000"
                            data-testid="input-transaction-threshold"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert when transaction amount exceeds this value
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Test Email Button */}
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestEmail}
                    disabled={testEmailMutation.isPending}
                    data-testid="button-test-email"
                  >
                    {testEmailMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Configuration Section (Collapsible) */}
            <Card>
              <CardHeader>
                <Collapsible open={isEmailConfigOpen} onOpenChange={setIsEmailConfigOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <CardTitle>Email Configuration (Advanced)</CardTitle>
                      <CardDescription className="mt-1.5">
                        Configure custom SMTP settings for email alerts
                      </CardDescription>
                    </div>
                    {isEmailConfigOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-6">
                    <CardContent className="space-y-6 pt-0">
                      <p className="text-sm text-muted-foreground">
                        Leave these fields empty to use the default system email service. Only configure
                        if you want to use your own SMTP server.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="smtpHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Host</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="smtp.gmail.com"
                                  data-testid="input-smtp-host"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Port</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="587"
                                  data-testid="input-smtp-port"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="smtpUser"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Username</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="your-email@gmail.com"
                                  data-testid="input-smtp-user"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder={field.value === '••••••••' ? 'Enter new password to change' : '••••••••'}
                                  data-testid="input-smtp-password"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value === '••••••••' && 'Password is set. Enter a new password to change it.'}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save-settings"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
