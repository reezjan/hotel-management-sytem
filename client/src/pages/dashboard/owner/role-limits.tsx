import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Save, Loader2, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface RoleLimit {
  id?: string;
  roleId: number;
  roleName: string;
  roleDescription?: string;
  maxTransactionAmount: string | null;
  maxDailyAmount: string | null;
  requiresApprovalAbove: string | null;
  canVoidTransactions: boolean;
  canApproveWastage: boolean;
}

export default function RoleLimitsPage() {
  const { toast } = useToast();
  const [limits, setLimits] = useState<RoleLimit[]>([]);

  const { data: roleLimitsData, isLoading } = useQuery<RoleLimit[]>({
    queryKey: ["/api/hotels/current/role-limits"],
  });

  useEffect(() => {
    if (roleLimitsData) {
      setLimits(roleLimitsData);
    }
  }, [roleLimitsData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", "/api/hotels/current/role-limits", limits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels/current/role-limits"] });
      toast({
        title: "Role Limits Saved",
        description: "Transaction limits have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save role limits",
        variant: "destructive",
      });
    },
  });

  const handleUpdateLimit = (roleId: number, field: keyof RoleLimit, value: any) => {
    setLimits(prev => 
      prev.map(limit => 
        limit.roleId === roleId 
          ? { ...limit, [field]: value }
          : limit
      )
    );
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Role Transaction Limits">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Role Transaction Limits">
      <div className="space-y-6">
        <Alert data-testid="alert-role-limits-info">
          <Info className="h-4 w-4" />
          <AlertTitle>Configure Role-Based Transaction Limits</AlertTitle>
          <AlertDescription>
            Set financial limits and permissions for each role to enhance security and control. Leave fields empty for no limit.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Transaction Limits by Role
            </CardTitle>
            <CardDescription>
              Configure maximum transaction amounts and approval thresholds for each role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Role</TableHead>
                    <TableHead className="min-w-[150px]">Max Transaction</TableHead>
                    <TableHead className="min-w-[150px]">Max Daily Total</TableHead>
                    <TableHead className="min-w-[150px]">Approval Above</TableHead>
                    <TableHead className="w-[120px]">Can Void</TableHead>
                    <TableHead className="w-[150px]">Approve Wastage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {limits.map((limit) => (
                    <TableRow key={limit.roleId} data-testid={`row-role-limit-${limit.roleId}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{limit.roleName}</div>
                          {limit.roleDescription && (
                            <div className="text-xs text-muted-foreground">{limit.roleDescription}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="No limit"
                          value={limit.maxTransactionAmount || ""}
                          onChange={(e) => handleUpdateLimit(limit.roleId, "maxTransactionAmount", e.target.value || null)}
                          className="w-full"
                          data-testid={`input-max-transaction-${limit.roleId}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="No limit"
                          value={limit.maxDailyAmount || ""}
                          onChange={(e) => handleUpdateLimit(limit.roleId, "maxDailyAmount", e.target.value || null)}
                          className="w-full"
                          data-testid={`input-max-daily-${limit.roleId}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="No approval"
                          value={limit.requiresApprovalAbove || ""}
                          onChange={(e) => handleUpdateLimit(limit.roleId, "requiresApprovalAbove", e.target.value || null)}
                          className="w-full"
                          data-testid={`input-approval-above-${limit.roleId}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={limit.canVoidTransactions}
                          onCheckedChange={(checked) => handleUpdateLimit(limit.roleId, "canVoidTransactions", checked)}
                          data-testid={`checkbox-void-${limit.roleId}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={limit.canApproveWastage}
                          onCheckedChange={(checked) => handleUpdateLimit(limit.roleId, "canApproveWastage", checked)}
                          data-testid={`checkbox-wastage-${limit.roleId}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                data-testid="button-save-limits"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Limits
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Limits Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Max Transaction Amount:</strong> The maximum amount a user with this role can process in a single transaction. Transactions exceeding this limit will be rejected.
            </div>
            <div>
              <strong className="text-foreground">Max Daily Total:</strong> The maximum total amount a user can process per day. Once this limit is reached, no more transactions can be created until the next day.
            </div>
            <div>
              <strong className="text-foreground">Approval Required Above:</strong> Transactions above this amount will require approval from a manager or owner, even if they're below the max transaction amount.
            </div>
            <div>
              <strong className="text-foreground">Can Void Transactions:</strong> When enabled, users with this role can void (cancel) transactions with a reason. This is typically restricted to managers and owners.
            </div>
            <div>
              <strong className="text-foreground">Can Approve Wastage:</strong> When enabled, users with this role can approve wastage reports from other staff members.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
