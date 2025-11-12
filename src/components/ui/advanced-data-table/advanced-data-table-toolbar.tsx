import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";
import { DataTableViewOptions } from "./data-table-view-options";

export interface SelectFilterOption {
  label: string;
  value: string;
}

export interface SelectFilterConfig {
  key: string;
  placeholder: string;
  options: SelectFilterOption[];
  width?: string; // e.g., "w-[200px]"
}

export interface AdvancedDataTableToolbarProps {
  // Search
  searchTerm: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  selectFilters?: SelectFilterConfig[];
  
  // Table instance for view options
  table?: Table<any>;
  
  // Custom actions (render prop)
  actions?: React.ReactNode;
}

export const AdvancedDataTableToolbar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  onFiltersChange,
  selectFilters = [],
  table,
  actions,
}: AdvancedDataTableToolbarProps) => {
  const [localSearch, setLocalSearch] = React.useState(searchTerm);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };
    if (!value || value === "all") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    onSearchChange("");
    onFiltersChange({});
  };

  const hasActiveFilters = localSearch || Object.keys(filters).length > 0;

  return (
    <div className="space-y-3 mb-4">
      {/* Top Row: Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search - Takes more space */}
        <div className="relative flex-1 min-w-0 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {/* Custom actions */}
          {actions}

          {/* View Options (Hide/Show Columns) */}
          {table && <DataTableViewOptions table={table} />}
        </div>
      </div>

      {/* Bottom Row: Filters (only show if there are filters) */}
      {selectFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Select Filters */}
          {selectFilters.map((filterConfig) => (
            <Select
              key={filterConfig.key}
              value={filters[filterConfig.key] || "all"}
              onValueChange={(value) => handleFilterChange(filterConfig.key, value)}
            >
              <SelectTrigger className={filterConfig.width || "w-[180px]"}>
                <SelectValue placeholder={filterConfig.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filterConfig.placeholder}</SelectItem>
                {filterConfig.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              size="sm"
              className="h-10"
            >
              <X className="w-4 h-4 mr-2" />
              Reset Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

