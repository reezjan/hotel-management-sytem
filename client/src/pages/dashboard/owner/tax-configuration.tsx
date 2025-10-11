import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Save, Settings } from "lucide-react";

interface TaxSetting {
  id?: string;
  taxType: string;
  percent: number;
  isActive: boolean;
}

export default function TaxConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hotelTaxes = [] } = useQuery<any[]>({
    queryKey: ["/api/hotels/current/taxes"]
  });

  const { data: hotel } = useQuery<any>({
    queryKey: ["/api/hotels/current"]
  });

  // Initialize tax settings with default values
  const [taxSettings, setTaxSettings] = useState<Record<string, TaxSetting>>({
    vat: { taxType: 'vat', percent: 13, isActive: false },
    service_tax: { taxType: 'service_tax', percent: 10, isActive: false },
    luxury_tax: { taxType: 'luxury_tax', percent: 5, isActive: false }
  });

  // Update tax settings when hotel taxes data is loaded
  useEffect(() => {
    if (hotelTaxes && hotelTaxes.length > 0) {
      const updatedSettings = { ...taxSettings };
      hotelTaxes.forEach((tax: any) => {
        if (tax.taxType in updatedSettings) {
          updatedSettings[tax.taxType] = {
            id: tax.id,
            taxType: tax.taxType,
            percent: parseFloat(tax.percent) || 0,
            isActive: tax.isActive || false
          };
        }
      });
      setTaxSettings(updatedSettings);
    }
  }, [hotelTaxes]);

  const updateTaxMutation = useMutation({
    mutationFn: async (taxData: TaxSetting) => {
      const response = await fetch("/api/hotels/current/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taxData,
          percentType: 'number'
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update tax settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/taxes"] });
      toast({
        title: "Success",
        description: "Tax settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tax settings",
        variant: "destructive",
      });
    },
  });

  const handleTaxToggle = (taxType: string, enabled: boolean) => {
    const updatedTax = { ...taxSettings[taxType], isActive: enabled };
    setTaxSettings(prev => ({
      ...prev,
      [taxType]: updatedTax
    }));
    // Automatically save when toggled
    updateTaxMutation.mutate(updatedTax);
  };

  const handlePercentChange = (taxType: string, percent: number) => {
    setTaxSettings(prev => ({
      ...prev,
      [taxType]: { ...prev[taxType], percent }
    }));
    // Note: Don't auto-save on percent change to allow user to finish typing
  };

  const handleSaveTax = (taxType: string) => {
    const taxData = taxSettings[taxType];
    updateTaxMutation.mutate(taxData);
  };

  const calculateTaxExample = (amount: number) => {
    let total = amount;
    let breakdown: any = { subtotal: amount };

    Object.entries(taxSettings).forEach(([key, tax]) => {
      if (tax.isActive) {
        const taxAmount = (amount * tax.percent) / 100;
        breakdown[key] = taxAmount;
        total += taxAmount;
      }
    });

    return { total, breakdown };
  };

  const exampleAmount = 1000;
  const taxExample = calculateTaxExample(exampleAmount);

  return (
    <DashboardLayout title="Tax Configuration">
      <div className="space-y-6">
        {/* Tax Configuration Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* VAT Configuration */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">VAT</h4>
                    <p className="text-sm text-muted-foreground">Value Added Tax</p>
                  </div>
                  <Switch
                    checked={taxSettings.vat.isActive}
                    onCheckedChange={(checked) => handleTaxToggle('vat', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat-percent">Tax Percentage</Label>
                  <div className="flex gap-2">
                    <Input
                      id="vat-percent"
                      type="number"
                      value={taxSettings.vat.percent}
                      onChange={(e) => handlePercentChange('vat', Number(e.target.value))}
                      disabled={!taxSettings.vat.isActive}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveTax('vat')}
                      disabled={updateTaxMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Service Tax Configuration */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Service Tax</h4>
                    <p className="text-sm text-muted-foreground">Service charge</p>
                  </div>
                  <Switch
                    checked={taxSettings.service_tax.isActive}
                    onCheckedChange={(checked) => handleTaxToggle('service_tax', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-percent">Tax Percentage</Label>
                  <div className="flex gap-2">
                    <Input
                      id="service-percent"
                      type="number"
                      value={taxSettings.service_tax.percent}
                      onChange={(e) => handlePercentChange('service_tax', Number(e.target.value))}
                      disabled={!taxSettings.service_tax.isActive}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveTax('service_tax')}
                      disabled={updateTaxMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Luxury Tax Configuration */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Luxury Tax</h4>
                    <p className="text-sm text-muted-foreground">Premium services</p>
                  </div>
                  <Switch
                    checked={taxSettings.luxury_tax.isActive}
                    onCheckedChange={(checked) => handleTaxToggle('luxury_tax', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="luxury-percent">Tax Percentage</Label>
                  <div className="flex gap-2">
                    <Input
                      id="luxury-percent"
                      type="number"
                      value={taxSettings.luxury_tax.percent}
                      onChange={(e) => handlePercentChange('luxury_tax', Number(e.target.value))}
                      disabled={!taxSettings.luxury_tax.isActive}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveTax('luxury_tax')}
                      disabled={updateTaxMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Calculation Example */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Calculation Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Example calculation for NPR {exampleAmount.toLocaleString()}:
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>NPR {taxExample.breakdown.subtotal.toLocaleString()}</span>
                </div>
                
                {Object.entries(taxSettings).map(([key, tax]) => {
                  if (!tax.isActive) return null;
                  const taxAmount = taxExample.breakdown[key] || 0;
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span>{tax.taxType.replace('_', ' ').toUpperCase()} ({tax.percent}%):</span>
                      <span>NPR {taxAmount.toLocaleString()}</span>
                    </div>
                  );
                })}
                
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>NPR {taxExample.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Hotel Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vat-number">VAT Number</Label>
                  <Input 
                    id="vat-number" 
                    placeholder="Enter VAT registration number" 
                    defaultValue={hotel?.vatNo || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="business-address">Business Address</Label>
                  <Input 
                    id="business-address" 
                    placeholder="Enter business address" 
                    defaultValue={hotel?.address || ''}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={() => {
                const vatNumber = (document.getElementById('vat-number') as HTMLInputElement)?.value;
                const address = (document.getElementById('business-address') as HTMLInputElement)?.value;
                // TODO: Add hotel update mutation
                toast({
                  title: "Feature Coming Soon",
                  description: "Hotel information update will be implemented",
                });
              }}>
                Update Hotel Information
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}