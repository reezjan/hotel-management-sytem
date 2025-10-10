import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { cn, getStatusColor } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  searchPlaceholder?: string;
  actions?: {
    label: string;
    action: (row: any) => void;
    variant?: "default" | "destructive" | "outline" | "secondary";
    show?: (row: any) => boolean;
  }[];
  onAdd?: () => void;
  addButtonLabel?: string;
  className?: string;
  isLoading?: boolean;
}

export function DataTable({
  title,
  data,
  columns,
  searchPlaceholder = "Search...",
  actions = [],
  onAdd,
  addButtonLabel = "Add New",
  className,
  isLoading = false
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleExport = () => {
    if (sortedData.length === 0) return;

    const headers = columns.map(col => col.label).join(',');
    const rows = sortedData.map(row => 
      columns.map(col => {
        let value = row[col.key];
        
        // Use render function if available to get proper formatted value
        if (col.render) {
          const rendered = col.render(value, row);
          // Extract text content from React elements
          if (typeof rendered === 'object' && rendered !== null) {
            // If it's a React element with props.children, try to extract text
            if ('props' in rendered && rendered.props && 'children' in rendered.props) {
              value = String(rendered.props.children);
            } else {
              value = String(value || '');
            }
          } else {
            value = String(rendered || '');
          }
        } else if (typeof value === 'object' && value !== null) {
          // Handle objects - try to extract a display value
          if (value.name) value = value.name;
          else if (value.label) value = value.label;
          else value = JSON.stringify(value);
        } else {
          value = String(value || '');
        }
        
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : filteredData;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const renderCellValue = (column: Column, value: any, row: any) => {
    if (column.render) {
      return column.render(value, row);
    }

    if (column.key.includes("status")) {
      return (
        <Badge className={getStatusColor(value)} variant="secondary">
          {value}
        </Badge>
      );
    }

    if (column.key.includes("date") || column.key.includes("time")) {
      return new Date(value).toLocaleDateString();
    }

    if (column.key.includes("amount") || column.key.includes("price")) {
      return `रु${Number(value).toLocaleString()}`;
    }

    return value;
  };

  return (
    <Card className={cn("", className)} data-testid={`table-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="p-4 md:p-6">
        <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
          <CardTitle className="text-base md:text-lg" data-testid={`table-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-48 md:w-64"
                data-testid="input-search"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-export"
                onClick={handleExport}
                disabled={sortedData.length === 0}
                title="Export to CSV"
                className="flex-1 sm:flex-initial"
              >
                <Download className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="sm:inline">Export</span>
              </Button>
              {onAdd && (
                <Button onClick={onAdd} size="sm" data-testid="button-add" className="flex-1 sm:flex-initial">
                  {addButtonLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "text-left p-3 md:p-4 text-foreground font-medium text-xs md:text-sm whitespace-nowrap",
                      column.sortable && "cursor-pointer hover:bg-muted"
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                    data-testid={`table-header-${column.key}`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="text-left p-3 md:p-4 text-foreground font-medium text-xs md:text-sm whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`loading-${index}`} className="border-b border-border">
                    {columns.map((column) => (
                      <td key={column.key} className="p-3 md:p-4">
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="p-3 md:p-4">
                        <div className="flex space-x-2">
                          {actions.map((_, actionIndex) => (
                            <div
                              key={actionIndex}
                              className="h-8 w-16 bg-muted animate-pulse rounded"
                            ></div>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="text-center p-6 md:p-8 text-muted-foreground text-sm"
                    data-testid="table-empty-state"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => (
                  <tr 
                    key={row.id || index} 
                    className="border-b border-border hover:bg-muted/50"
                    data-testid={`table-row-${index}`}
                  >
                    {columns.map((column) => (
                      <td 
                        key={column.key} 
                        className="p-3 md:p-4 text-xs md:text-sm"
                        data-testid={`table-cell-${column.key}-${index}`}
                      >
                        {renderCellValue(column, row[column.key], row)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          {actions.map((action, actionIndex) => {
                            const shouldShow = action.show ? action.show(row) : true;
                            if (!shouldShow) return null;
                            return (
                              <Button
                                key={actionIndex}
                                variant={action.variant || "outline"}
                                size="sm"
                                onClick={() => action.action(row)}
                                data-testid={`table-action-${action.label.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                                className="text-xs whitespace-nowrap"
                              >
                                {action.label}
                              </Button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
