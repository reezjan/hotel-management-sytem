import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileText, DollarSign, Package, Users, Settings, History, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuditTransparencyPage() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['/api/audit-logs', dateRange.from, dateRange.to],
    enabled: !!dateRange.from && !!dateRange.to
  });

  const { data: priceChangeLogs } = useQuery({
    queryKey: ['/api/price-change-logs', dateRange.from, dateRange.to]
  });

  const { data: taxChangeLogs } = useQuery({
    queryKey: ['/api/tax-change-logs']
  });

  const { data: inventoryMovements } = useQuery({
    queryKey: ['/api/inventory-movement-logs', dateRange.from, dateRange.to]
  });

  const { data: staffActivity } = useQuery({
    queryKey: ['/api/staff-activity-summary', dateRange.from, dateRange.to]
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-audit-transparency">Audit & Transparency</h1>
          <p className="text-muted-foreground">Complete visibility into all hotel operations and changes</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" data-testid="button-date-range">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from && dateRange.to ? (
                `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
              ) : (
                "Select date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <History className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="financial" data-testid="tab-financial">
            <DollarSign className="mr-2 h-4 w-4" />
            Financial Activity
          </TabsTrigger>
          <TabsTrigger value="price-changes" data-testid="tab-price-changes">
            <TrendingUp className="mr-2 h-4 w-4" />
            Price Changes
          </TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory Movements
          </TabsTrigger>
          <TabsTrigger value="staff" data-testid="tab-staff">
            <Users className="mr-2 h-4 w-4" />
            Staff Activity
          </TabsTrigger>
          <TabsTrigger value="maintenance" data-testid="tab-maintenance">
            <Settings className="mr-2 h-4 w-4" />
            Maintenance Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-logs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Audit Logs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-audit-count">{Array.isArray(auditLogs) ? auditLogs.length : 0}</div>
                <p className="text-xs text-muted-foreground">In selected period</p>
              </CardContent>
            </Card>

            <Card data-testid="card-price-changes">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price Changes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-price-changes">{Array.isArray(priceChangeLogs) ? priceChangeLogs.length : 0}</div>
                <p className="text-xs text-muted-foreground">Items updated</p>
              </CardContent>
            </Card>

            <Card data-testid="card-inventory-movements">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Movements</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-inventory-count">{Array.isArray(inventoryMovements) ? inventoryMovements.length : 0}</div>
                <p className="text-xs text-muted-foreground">Transactions recorded</p>
              </CardContent>
            </Card>

            <Card data-testid="card-active-staff">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-staff-count">
                  {Array.isArray(staffActivity) ? new Set(staffActivity.map((s: any) => s.userId)).size : 0}
                </div>
                <p className="text-xs text-muted-foreground">Performed actions</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>Latest system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(auditLogs) && auditLogs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-start justify-between border-b pb-4" data-testid={`log-${log.id}`}>
                    <div className="space-y-1">
                      <p className="text-sm font-medium" data-testid={`text-log-action-${log.id}`}>
                        {log.action} - {log.resourceType}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-log-time-${log.id}`}>
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={log.success ? "default" : "destructive"} data-testid={`badge-log-status-${log.id}`}>
                      {log.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                ))}
                {(!Array.isArray(auditLogs) || auditLogs.length === 0) && (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-logs">
                    No audit logs found. Select a date range to view logs.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price-changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Change History</CardTitle>
              <CardDescription>Track all pricing modifications with who made them</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(priceChangeLogs) && priceChangeLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start justify-between border-b pb-4" data-testid={`price-change-${log.id}`}>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium" data-testid={`text-item-name-${log.id}`}>
                        {log.itemName} ({log.itemType})
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span data-testid={`text-old-price-${log.id}`}>
                          Old: NPR {parseFloat(log.previousPrice || 0).toLocaleString()}
                        </span>
                        <span>→</span>
                        <span data-testid={`text-new-price-${log.id}`}>
                          New: NPR {parseFloat(log.newPrice || 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground" data-testid={`text-changed-by-${log.id}`}>
                        Changed by: {log.changedBy?.username} ({log.changedBy?.role}) on{" "}
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant={parseFloat(log.newPrice) > parseFloat(log.previousPrice) ? "default" : "secondary"}
                      data-testid={`badge-price-trend-${log.id}`}
                    >
                      {parseFloat(log.newPrice) > parseFloat(log.previousPrice) ? "Increase" : "Decrease"}
                    </Badge>
                  </div>
                ))}
                {(!Array.isArray(priceChangeLogs) || priceChangeLogs.length === 0) && (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-price-changes">
                    No price changes recorded in the selected period.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {Array.isArray(taxChangeLogs) && taxChangeLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tax Configuration Changes</CardTitle>
                <CardDescription>History of tax rate modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxChangeLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start justify-between border-b pb-4" data-testid={`tax-change-${log.id}`}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium" data-testid={`text-tax-type-${log.id}`}>{log.taxType}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span data-testid={`text-old-tax-${log.id}`}>Old: {log.previousPercent}%</span>
                          <span>→</span>
                          <span data-testid={`text-new-tax-${log.id}`}>New: {log.newPercent}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground" data-testid={`text-tax-changed-by-${log.id}`}>
                          Changed by: {log.changedBy?.username} on {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Movement Tracking</CardTitle>
              <CardDescription>Detailed logs of all stock movements with responsible persons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(inventoryMovements) && inventoryMovements.map((movement: any) => (
                  <div key={movement.id} className="flex items-start justify-between border-b pb-4" data-testid={`inventory-movement-${movement.id}`}>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium" data-testid={`text-item-${movement.id}`}>
                        {movement.item?.name} ({movement.item?.sku})
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span data-testid={`text-qty-${movement.id}`}>
                          Qty: {movement.qtyPackage} {movement.item?.unit}
                        </span>
                        {movement.department && (
                          <span data-testid={`text-dept-${movement.id}`}>Dept: {movement.department}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground" data-testid={`text-recorded-by-${movement.id}`}>
                        Recorded by: {movement.recordedBy?.username} ({movement.recordedBy?.role})
                        {movement.issuedTo && ` | Issued to: ${movement.issuedTo.username} (${movement.issuedTo.role})`}
                      </p>
                      {movement.notes && (
                        <p className="text-xs text-muted-foreground" data-testid={`text-notes-${movement.id}`}>
                          Notes: {movement.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground" data-testid={`text-time-${movement.id}`}>
                        {new Date(movement.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge data-testid={`badge-transaction-type-${movement.id}`}>
                      {movement.transactionType}
                    </Badge>
                  </div>
                ))}
                {(!Array.isArray(inventoryMovements) || inventoryMovements.length === 0) && (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-inventory">
                    No inventory movements recorded.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Activity Summary</CardTitle>
              <CardDescription>Overview of actions performed by each staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(staffActivity) && staffActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start justify-between border-b pb-4" data-testid={`staff-activity-${index}`}>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium" data-testid={`text-staff-${index}`}>
                        {activity.username} ({activity.role})
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-activity-${index}`}>
                        {activity.action} on {activity.resourceType}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-last-${index}`}>
                        Last activity: {new Date(activity.lastActivity).toLocaleString()}
                      </p>
                    </div>
                    <Badge data-testid={`badge-count-${index}`}>{activity.count} times</Badge>
                  </div>
                ))}
                {(!Array.isArray(staffActivity) || staffActivity.length === 0) && (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-staff-activity">
                    No staff activity recorded.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Transaction Details</CardTitle>
              <CardDescription>Complete transaction history with creator information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                View detailed financial transactions from the Finance dashboard. This section provides transparency on who created each transaction and full audit trails.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Request Approvals</CardTitle>
              <CardDescription>Track who approved/declined each maintenance request</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Maintenance approval history is available when viewing individual maintenance requests. Click on any request to see its complete approval timeline.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
