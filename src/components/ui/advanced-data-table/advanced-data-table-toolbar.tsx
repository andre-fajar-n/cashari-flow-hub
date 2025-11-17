import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Table } from "@tanstack/react-table";
import { DataTableViewOptions } from "./data-table-view-options";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

export interface SelectFilterOption {
  label: string;
  value: string;
}

export interface SelectFilterConfig {
  key: string;
  label: string; // Label above the select (e.g., "Tipe", "Dompet")
  placeholder?: string; // Optional placeholder for empty state
  options: SelectFilterOption[];
  width?: string; // e.g., "w-[200px]"
}

export interface DateRangeFilterConfig {
  key: string;
  label: string; // Label above the date picker (e.g., "Tanggal")
  placeholder?: string; // Optional placeholder
  width?: string; // e.g., "w-[280px]"
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
  dateRangeFilter?: DateRangeFilterConfig;

  // Table instance for view options
  table?: Table<any>;

  // Custom actions (render prop)
  actions?: React.ReactNode;
}

const MAXIMUM_PRIMARY_FILTERS = 5;

export const AdvancedDataTableToolbar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  onFiltersChange,
  selectFilters = [],
  dateRangeFilter,
  table,
  actions,
}: AdvancedDataTableToolbarProps) => {
  const [localSearch, setLocalSearch] = React.useState(searchTerm);
  const [showMoreFilters, setShowMoreFilters] = React.useState(false);

  // Dynamic filter separation based on total count
  // Rules:
  // - If total filters <= MAXIMUM_PRIMARY_FILTERS: show all filters, no "More Filters" button
  // - If total filters > MAXIMUM_PRIMARY_FILTERS: show first MAXIMUM_PRIMARY_FILTERS - 1 filters, rest in "More Filters"
  const allFilters = React.useMemo(() => {
    const filters: Array<{ type: 'select' | 'dateRange', config: SelectFilterConfig | DateRangeFilterConfig }> = [];

    // Add date range filter first if exists (to ensure it appears in primary filters)
    if (dateRangeFilter) {
      filters.push({ type: 'dateRange', config: dateRangeFilter });
    }

    // Add all select filters after date range
    selectFilters.forEach(config => {
      filters.push({ type: 'select', config });
    });

    return filters;
  }, [selectFilters, dateRangeFilter]);

  const totalFiltersCount = allFilters.length;
  const shouldShowMoreFilters = totalFiltersCount > MAXIMUM_PRIMARY_FILTERS;
  const primaryFiltersCount = shouldShowMoreFilters ? MAXIMUM_PRIMARY_FILTERS - 1 : totalFiltersCount;

  const primaryFilters = allFilters.slice(0, primaryFiltersCount);
  const moreFilters = shouldShowMoreFilters ? allFilters.slice(primaryFiltersCount) : [];

  // Count active more filters
  const activeMoreFiltersCount = React.useMemo(() => {
    let count = 0;

    moreFilters.forEach(filter => {
      if (filter.type === 'select') {
        const config = filter.config as SelectFilterConfig;
        if (filters[config.key] && filters[config.key] !== "all") {
          count++;
        }
      } else if (filter.type === 'dateRange') {
        const config = filter.config as DateRangeFilterConfig;
        if (filters[`${config.key}_from`] || filters[`${config.key}_to`]) {
          count++;
        }
      }
    });

    return count;
  }, [filters, moreFilters]);

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

  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const newFilters = { ...filters };
    if (!range || (!range.from && !range.to)) {
      // Remove date filters if range is cleared
      if (dateRangeFilter) {
        delete newFilters[`${dateRangeFilter.key}_from`];
        delete newFilters[`${dateRangeFilter.key}_to`];
      }
    } else {
      // Set date filters using local timezone
      if (dateRangeFilter) {
        if (range.from) {
          newFilters[`${dateRangeFilter.key}_from`] = formatDateToLocal(range.from);
        }
        if (range.to) {
          newFilters[`${dateRangeFilter.key}_to`] = formatDateToLocal(range.to);
        }
      }
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
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search - Full width */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Custom actions */}
          {actions}

          {/* View Options (Hide/Show Columns) */}
          {table && <DataTableViewOptions table={table} />}
        </div>
      </div>

      {/* Bottom Row: Filters (only show if there are filters) */}
      {totalFiltersCount > 0 && (
        <div className="flex items-start gap-4">
          {/* Left side: Filters (can wrap) */}
          <div className="flex flex-wrap items-start gap-4 flex-1 min-w-0">
            {/* Primary Filters (first MAXIMUM_PRIMARY_FILTERS - 1 if > MAXIMUM_PRIMARY_FILTERS total, otherwise all) */}
            {primaryFilters.map((filter) => {
              if (filter.type === 'select') {
                const filterConfig = filter.config as SelectFilterConfig;
                return (
                  <div key={filterConfig.key} className="flex flex-col gap-1.5">
                    {/* Label */}
                    <label className="text-sm font-medium text-gray-700">
                      {filterConfig.label}
                    </label>

                    {/* Select Dropdown - Fixed width and height */}
                    <Select
                      value={filters[filterConfig.key] || "all"}
                      onValueChange={(value) => handleFilterChange(filterConfig.key, value)}
                    >
                      <SelectTrigger className="w-[200px] h-[52px]">
                        <SelectValue placeholder={filterConfig.placeholder || "Semua"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {filterConfig.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              } else {
                // Date Range Filter - Fixed width
                const filterConfig = filter.config as DateRangeFilterConfig;
                return (
                  <div key={filterConfig.key} className="flex flex-col gap-1.5">
                    {/* Label */}
                    <label className="text-sm font-medium text-gray-700">
                      {filterConfig.label}
                    </label>

                    {/* Date Range Picker - Fixed width */}
                    <DateRangePicker
                      value={{
                        from: filters[`${filterConfig.key}_from`]
                          ? new Date(filters[`${filterConfig.key}_from`])
                          : undefined,
                        to: filters[`${filterConfig.key}_to`]
                          ? new Date(filters[`${filterConfig.key}_to`])
                          : undefined,
                      }}
                      onChange={handleDateRangeChange}
                      placeholder={filterConfig.placeholder || "Pilih tanggal"}
                      className="w-[200px]"
                    />
                  </div>
                );
              }
            })}

            {/* More Filters Button (Sheet Trigger) - Only show if > 4 filters */}
            {shouldShowMoreFilters && (
              <Sheet open={showMoreFilters} onOpenChange={setShowMoreFilters}>
                <SheetTrigger asChild>
                  <div className="flex flex-col gap-1.5">
                    {/* Empty label for alignment */}
                    <div className="h-[20px]"></div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-[52px] relative w-[180px]"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Filter Lainnya</span>
                      {activeMoreFiltersCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 px-1.5 py-0 h-5 min-w-5 flex items-center justify-center flex-shrink-0"
                        >
                          {activeMoreFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Filter Lainnya</SheetTitle>
                    <SheetDescription>
                      Pilih filter tambahan untuk menyaring data
                    </SheetDescription>
                  </SheetHeader>

                  {/* More Filters Content */}
                  <div className="mt-6 space-y-6">
                    {moreFilters.map((filter) => {
                      if (filter.type === 'select') {
                        const filterConfig = filter.config as SelectFilterConfig;
                        return (
                          <div key={filterConfig.key} className="flex flex-col gap-1.5">
                            {/* Label */}
                            <label className="text-sm font-medium text-gray-700">
                              {filterConfig.label}
                            </label>

                            {/* Select Dropdown */}
                            <Select
                              value={filters[filterConfig.key] || "all"}
                              onValueChange={(value) => handleFilterChange(filterConfig.key, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={filterConfig.placeholder || "Semua"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {filterConfig.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      } else {
                        // Date Range Filter
                        const filterConfig = filter.config as DateRangeFilterConfig;
                        return (
                          <div key={filterConfig.key} className="flex flex-col gap-1.5">
                            {/* Label */}
                            <label className="text-sm font-medium text-gray-700">
                              {filterConfig.label}
                            </label>

                            {/* Date Range Picker */}
                            <DateRangePicker
                              value={{
                                from: filters[`${filterConfig.key}_from`]
                                  ? new Date(filters[`${filterConfig.key}_from`])
                                  : undefined,
                                to: filters[`${filterConfig.key}_to`]
                                  ? new Date(filters[`${filterConfig.key}_to`])
                                  : undefined,
                              }}
                              onChange={handleDateRangeChange}
                              placeholder={filterConfig.placeholder || "Pilih tanggal"}
                              className="w-full"
                            />
                          </div>
                        );
                      }
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Right side: Reset Button (always visible, disabled when no active filters) */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {/* Empty label for alignment */}
            <div className="h-[20px]"></div>
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              size="sm"
              className="h-[52px] w-[140px]"
              disabled={!hasActiveFilters}
            >
              <X className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Reset Filter</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

