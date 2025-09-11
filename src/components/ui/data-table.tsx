import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUrlParams as useUrlParamsHook } from "@/hooks/use-url-params";

export interface ColumnFilter {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  options?: { label: string; value: string }[];
}

export interface DataTableProps<T> {
  data: T[];
  isLoading: boolean;
  searchPlaceholder?: string;
  // Allow simple keys or nested paths using dot notation
  searchFields: (keyof T | string)[];
  columnFilters?: ColumnFilter[];
  itemsPerPage?: number;
  renderItem: (item: T) => React.ReactNode;
  emptyStateMessage?: string;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  // Server-side pagination mode
  serverMode?: boolean;
  totalCount?: number;
  page?: number;
  onServerParamsChange?: (params: { searchTerm: string; filters: Record<string, any>; page: number; itemsPerPage: number; }) => void;
  // URL params integration
  useUrlParams?: boolean;
  urlParamsPrefix?: string;
  // Search behavior
  searchMode?: 'debounce' | 'explicit'; // 'debounce' for auto search, 'explicit' for Enter/button
}

export function DataTable<T extends Record<string, any>>({
  data,
  isLoading,
  searchPlaceholder = "Cari...",
  searchFields,
  columnFilters = [],
  itemsPerPage = 10,
  renderItem,
  emptyStateMessage = "Tidak ada data",
  title,
  description,
  headerActions,
  serverMode = false,
  totalCount,
  page,
  onServerParamsChange,
  useUrlParams = true,
  urlParamsPrefix = "",
  searchMode = 'explicit', // Default to explicit search when using URL params
}: DataTableProps<T>) {
  // URL params integration - only use if enabled
  const urlParamsHook = useUrlParams ? useUrlParamsHook({
    defaultPage: 1,
    defaultItemsPerPage: itemsPerPage,
    defaultSearch: "",
    defaultFilters: {}
  }) : null;

  // Local state for when URL params are disabled
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localDebouncedSearchTerm, setLocalDebouncedSearchTerm] = useState("");
  const [localColumnFilterValues, setLocalColumnFilterValues] = useState<Record<string, any>>({});
  const [localCurrentPage, setLocalCurrentPage] = useState(page ?? 1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // For explicit search mode, we need separate input state
  const [searchInput, setSearchInput] = useState("");

  // Determine which state to use based on URL params availability
  const searchTerm = urlParamsHook ? urlParamsHook.search : localSearchTerm;
  const debouncedSearchTerm = urlParamsHook ? urlParamsHook.search : localDebouncedSearchTerm;
  const columnFilterValues = urlParamsHook ? urlParamsHook.filters : localColumnFilterValues;
  const currentPage = urlParamsHook ? urlParamsHook.page : localCurrentPage;

  // Initialize search input from URL params or local state
  React.useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Helper functions for state updates
  const updateSearchTerm = (value: string) => {
    if (urlParamsHook) {
      urlParamsHook.setSearch(value);
    } else {
      setLocalSearchTerm(value);
    }
  };

  // Handle explicit search (Enter key or search button)
  const handleExplicitSearch = () => {
    updateSearchTerm(searchInput);
  };

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);

    // If using debounce mode, update search term immediately
    if (searchMode === 'debounce') {
      updateSearchTerm(value);
    }
  };

  const updateColumnFilterValues = (filters: Record<string, any>) => {
    if (urlParamsHook) {
      urlParamsHook.setFilters(filters);
    } else {
      setLocalColumnFilterValues(filters);
    }
  };

  const updateCurrentPage = (pageNum: number) => {
    if (urlParamsHook) {
      urlParamsHook.setPage(pageNum);
    } else {
      setLocalCurrentPage(pageNum);
    }
  };

  const resetAllFilters = () => {
    setSearchInput(""); // Reset search input
    if (urlParamsHook) {
      urlParamsHook.resetParams();
    } else {
      setLocalSearchTerm("");
      setLocalDebouncedSearchTerm("");
      setLocalColumnFilterValues({});
      setLocalCurrentPage(1);
    }
  };

  // Debounce search term with 300ms delay (only in debounce mode)
  useEffect(() => {
    if (searchMode !== 'debounce') return;

    const timer = setTimeout(() => {
      if (!urlParamsHook) {
        setLocalDebouncedSearchTerm(searchTerm);
      }
      updateCurrentPage(1);

      // Trigger server-side search automatically in server mode
      if (serverMode && onServerParamsChange) {
        onServerParamsChange({
          searchTerm,
          filters: columnFilterValues,
          page: 1,
          itemsPerPage
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, serverMode, onServerParamsChange, itemsPerPage, urlParamsHook, searchMode]);

  // Handle explicit search trigger (for explicit mode)
  useEffect(() => {
    if (searchMode !== 'explicit') return;

    // Trigger server-side search when search term changes in explicit mode
    if (serverMode && onServerParamsChange) {
      onServerParamsChange({
        searchTerm,
        filters: columnFilterValues,
        page: currentPage,
        itemsPerPage
      });
    }
  }, [searchTerm, serverMode, onServerParamsChange, itemsPerPage, columnFilterValues, currentPage, searchMode]);

  // Sync internal page with controlled prop in server mode
  useEffect(() => {
    if (serverMode && typeof page === 'number') {
      updateCurrentPage(page);
    }
  }, [page, serverMode]);

  // Guard against undefined data to avoid runtime errors when pages pass undefined during initial load
  const safeData = (data ?? []) as T[];

  const resetFilters = () => {
    resetAllFilters();
    if (serverMode && onServerParamsChange) {
      onServerParamsChange({ searchTerm: "", filters: {}, page: 1, itemsPerPage });
    }
  };

  const hasActiveFilters = debouncedSearchTerm !== "" || Object.keys(columnFilterValues).some(key => columnFilterValues[key] !== "");

  const filteredData = useMemo(() => {
    let filtered = safeData;

    // Apply search filter using debounced search term
    if (debouncedSearchTerm) {
      // Helper to get nested value using dot notation (e.g., "categories.name")
      const getNestedValue = (obj: any, path: string | number | symbol) => {
        if (typeof path === 'string' && path.includes('.')) {
          return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
        }
        return obj[path as keyof typeof obj];
      };

      const termLower = debouncedSearchTerm.toLowerCase();

      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = getNestedValue(item, field as any);
          if (typeof value === 'string') {
            return value.toLowerCase().includes(termLower);
          }
          if (typeof value === 'number') {
            return value.toString().includes(termLower);
          }
          return false;
        })
      );
    }

    // Apply column filters
    Object.entries(columnFilterValues).forEach(([field, value]) => {
      if (value && value !== "") {
        filtered = filtered.filter((item) => {
          const itemValue = item[field];

          // Handle date range filtering (format: "2024-01-01,2024-01-31" or single date "2024-01-01")
          const filter = columnFilters.find(f => f.field === field);

          if (filter?.type === 'daterange') {
            const itemDate = new Date(itemValue as string);
            const valueStr = value as string;

            if (valueStr.includes(',')) {
              // Range format: "startDate,endDate"
              const [startDate, endDate] = valueStr.split(',');
              const start = new Date(startDate);
              const end = new Date(endDate);
              return itemDate >= start && itemDate <= end;
            } else {
              // Single date format
              const filterDate = new Date(valueStr);
              return itemDate.toDateString() === filterDate.toDateString();
            }
          }

          if (filter?.type === 'select') {
            // Handle special NULL_VALUE case
            if (value === 'NULL_VALUE') {
              return itemValue === null || itemValue === undefined;
            }

            // Handle boolean values
            if (value === 'true') {
              return itemValue === true;
            }
            if (value === 'false') {
              return itemValue === false;
            }

            // Handle regular string/number comparison
            return itemValue?.toString() === value;
          }

          // Handle regular filtering
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes((value as string).toLowerCase());
          }
          if (typeof itemValue === 'number') {
            return itemValue.toString().includes(value as string);
          }
          return false;
        });
      }
    });

    return filtered;
  }, [data, debouncedSearchTerm, columnFilterValues, searchFields, columnFilters]);

  const effectiveTotal = serverMode ? (totalCount ?? 0) : (filteredData?.length || 0);
  const totalPages = Math.ceil(effectiveTotal / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = serverMode ? safeData : filteredData.slice(startIndex, endIndex);

  const handlePageChange = (pageNum: number) => {
    const next = Math.max(1, Math.min(pageNum, totalPages));
    updateCurrentPage(next);
    if (serverMode && onServerParamsChange) {
      onServerParamsChange({ searchTerm: debouncedSearchTerm, filters: columnFilterValues, page: next, itemsPerPage });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-6 p-4 sm:p-0 bg-gray-50 sm:bg-transparent rounded-xl sm:rounded-none">
        {/* Responsive pagination info */}
        <div className="text-sm text-gray-600 font-medium sm:font-normal order-2 sm:order-1">
          Halaman {currentPage} dari {totalPages}
        </div>

        {/* Responsive pagination controls */}
        <div className="order-1 sm:order-2">
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`h-10 sm:h-8 px-3 sm:px-2 rounded-xl sm:rounded-md text-base sm:text-sm font-medium sm:font-normal ${
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-white sm:hover:bg-gray-100 hover:shadow-sm sm:hover:shadow-none"
                  }`}
                />
              </PaginationItem>

              {/* Show fewer pages on mobile */}
              {pages.slice(0, window.innerWidth < 640 ? 3 : pages.length).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className={`h-10 sm:h-8 px-3 sm:px-2 rounded-xl sm:rounded-md text-base sm:text-sm font-medium sm:font-normal cursor-pointer ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground shadow-sm sm:shadow-none"
                        : "hover:bg-white sm:hover:bg-gray-100 hover:shadow-sm sm:hover:shadow-none"
                    }`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Show ellipsis on mobile if there are more pages */}
              {window.innerWidth < 640 && pages.length > 3 && currentPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="h-10 sm:h-8 px-3 sm:px-2 flex items-center text-gray-500">...</span>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`h-10 sm:h-8 px-3 sm:px-2 rounded-xl sm:rounded-md text-base sm:text-sm font-medium sm:font-normal ${
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-white sm:hover:bg-gray-100 hover:shadow-sm sm:hover:shadow-none"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-6 mx-2 sm:mx-0">
      {/* Fixed/Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        {(title || description || headerActions) && (
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 px-4 sm:px-6">
            {(title || description) && (
              <div className="text-center sm:text-left">
                {title && <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 sm:font-semibold sm:text-lg">{title}</CardTitle>}
                {description && <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0">{description}</p>}
              </div>
            )}
            {headerActions && (
              <div className="flex justify-center sm:justify-end">
                {headerActions}
              </div>
            )}
          </CardHeader>
        )}

        {/* Responsive Search and Filter Controls */}
        <div className="px-4 sm:px-6 pb-4 space-y-4 sm:space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchMode === 'explicit' ? searchInput : searchTerm}
                onChange={(e) => {
                  const nextTerm = e.target.value;
                  if (searchMode === 'explicit') {
                    handleSearchInputChange(nextTerm);
                  } else {
                    updateSearchTerm(nextTerm);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchMode === 'explicit') {
                    handleExplicitSearch();
                  }
                }}
                className="pl-11 sm:pl-10 h-12 sm:h-9 text-base sm:text-sm rounded-xl sm:rounded-md border-2 sm:border focus:border-primary"
              />
              {searchMode === 'explicit' && (
                <Button
                  onClick={handleExplicitSearch}
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch sm:items-center">
              {columnFilters.length > 0 && (
                <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="flex-1 sm:flex-initial">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="h-12 sm:h-9 w-full sm:w-auto rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-sm font-medium">
                      <Filter className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                      Filter
                      {hasActiveFilters && (
                        <span className="ml-2 sm:ml-1 bg-primary text-primary-foreground rounded-full w-3 h-3 sm:w-2 sm:h-2 flex items-center justify-center text-xs">
                          {window.innerWidth >= 640 ? '' : '•'}
                        </span>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              )}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="h-12 sm:h-9 px-4 sm:px-3 rounded-xl sm:rounded-md text-base sm:text-sm font-medium"
                >
                  <RotateCcw className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Responsive Filter Fields */}
          {columnFilters.length > 0 && (
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent className="space-y-0 max-h-80 sm:max-h-72 overflow-y-auto pr-1 pb-2 scroll-pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-3 pt-4 sm:pt-3 pb-4 sm:pb-3 border-t border-gray-200">
                  {columnFilters.map((filter) => (
                    <div key={filter.field} className="space-y-2 sm:space-y-1 min-w-0">
                      <label className="text-sm font-semibold text-gray-700 sm:text-xs sm:font-medium sm:text-muted-foreground block">
                        {filter.label}
                      </label>
                      {filter.type === 'select' ? (
                        <SearchableSelect
                          value={columnFilterValues[filter.field] || ""}
                          onValueChange={(value) => {
                            const nextFilters = {
                              ...columnFilterValues,
                              [filter.field]: value === "all" ? "" : value
                            };
                            updateColumnFilterValues(nextFilters);
                            updateCurrentPage(1);
                            if (serverMode && onServerParamsChange) {
                              onServerParamsChange({ searchTerm: debouncedSearchTerm, filters: nextFilters, page: 1, itemsPerPage });
                            }
                          }}
                          options={[
                            { label: "Semua", value: "all" },
                            ...(filter.options?.map((option) => ({
                              label: option.label,
                              value: option.value
                            })) || [])
                          ]}
                          placeholder="Semua"
                          searchPlaceholder="Cari..."
                          className="h-12 sm:h-8 text-base sm:text-xs rounded-xl sm:rounded-md border-2 sm:border w-full"
                        />
                      ) : filter.type === 'daterange' ? (
                        <div className="space-y-3 sm:space-y-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 sm:hidden">Dari</label>
                              <Input
                                placeholder="Dari"
                                type="date"
                                value={columnFilterValues[filter.field]?.split(',')[0] || ""}
                                onChange={(e) => {
                                  const currentValue = columnFilterValues[filter.field] || "";
                                  const endDate = currentValue.includes(',') ? currentValue.split(',')[1] : "";
                                  const newValue = endDate ? `${e.target.value},${endDate}` : e.target.value;
                                  const nextFilters = { ...columnFilterValues, [filter.field]: newValue };
                                  updateColumnFilterValues(nextFilters);
                                  updateCurrentPage(1);
                                  if (serverMode && onServerParamsChange) {
                                    onServerParamsChange({ searchTerm: debouncedSearchTerm, filters: nextFilters, page: 1, itemsPerPage });
                                  }
                                }}
                                className="h-12 sm:h-8 text-base sm:text-xs rounded-xl sm:rounded-md border-2 sm:border w-full"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-gray-500 sm:hidden">Sampai</label>
                              <Input
                                placeholder="Sampai"
                                type="date"
                                value={columnFilterValues[filter.field]?.split(',')[1] || ""}
                                onChange={(e) => {
                                  const currentValue = columnFilterValues[filter.field] || "";
                                  const startDate = currentValue.includes(',') ? currentValue.split(',')[0] : currentValue;
                                  const newValue = startDate ? `${startDate},${e.target.value}` : `,${e.target.value}`;
                                  const nextFilters = { ...columnFilterValues, [filter.field]: newValue };
                                  updateColumnFilterValues(nextFilters);
                                  updateCurrentPage(1);
                                  if (serverMode && onServerParamsChange) {
                                    onServerParamsChange({ searchTerm: debouncedSearchTerm, filters: nextFilters, page: 1, itemsPerPage });
                                  }
                                }}
                                className="h-12 sm:h-8 text-base sm:text-xs rounded-xl sm:rounded-md border-2 sm:border w-full"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Input
                          placeholder={`Filter...`}
                          value={columnFilterValues[filter.field] || ""}
                          onChange={(e) => {
                            const nextFilters = { ...columnFilterValues, [filter.field]: e.target.value };
                            updateColumnFilterValues(nextFilters);
                            updateCurrentPage(1);
                            if (serverMode && onServerParamsChange) {
                              onServerParamsChange({ searchTerm: debouncedSearchTerm, filters: nextFilters, page: 1, itemsPerPage });
                            }
                          }}
                          type={filter.type === 'number' ? 'number' : filter.type === 'date' ? 'date' : 'text'}
                          className="h-12 sm:h-8 text-base sm:text-xs rounded-xl sm:rounded-md border-2 sm:border w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>

      <CardContent className="px-4 sm:px-6">
        {/* Responsive Data Display */}
        {isLoading ? (
          <div className="text-center py-12 sm:py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-8 sm:h-8 rounded-full bg-blue-50 mb-4 sm:mb-2">
              <div className="w-6 h-6 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-base sm:text-sm text-muted-foreground font-medium sm:font-normal">Memuat data...</p>
          </div>
        ) : (serverMode ? safeData.length === 0 : filteredData.length === 0) ? (
          <div className="text-center py-12 sm:py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-12 sm:h-12 rounded-full bg-gray-50 mb-4 sm:mb-2">
              <div className="w-8 h-8 sm:w-6 sm:h-6 text-gray-400">📋</div>
            </div>
            <p className="text-base sm:text-sm text-muted-foreground font-medium sm:font-normal mb-2 sm:mb-1">
              {safeData.length === 0 ? emptyStateMessage : "Tidak ada data yang sesuai"}
            </p>
            {safeData.length > 0 && (
              <p className="text-sm text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {(serverMode ? safeData : currentData).map((item, index) => (
                <div key={index}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
            {renderPagination()}
            {(serverMode ? effectiveTotal : filteredData.length) > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-6 sm:mt-4 py-4 sm:py-2 bg-gray-50 sm:bg-transparent rounded-xl sm:rounded-none">
                <span className="font-medium sm:font-normal">
                  Menampilkan {startIndex + 1}-{serverMode ? Math.min(endIndex, effectiveTotal) : Math.min(endIndex, filteredData.length)} dari {serverMode ? effectiveTotal : filteredData.length} data
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
