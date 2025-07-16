import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  searchFields: (keyof T)[];
  columnFilters?: ColumnFilter[];
  itemsPerPage?: number;
  renderItem: (item: T) => React.ReactNode;
  emptyStateMessage?: string;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
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
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilterValues, setColumnFilterValues] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const resetFilters = () => {
    setSearchTerm("");
    setColumnFilterValues({});
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || Object.keys(columnFilterValues).some(key => columnFilterValues[key] !== "");

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchTerm);
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
            const itemDate = new Date(itemValue);

            if (value.includes(',')) {
              // Range format: "startDate,endDate"
              const [startDate, endDate] = value.split(',');
              const start = new Date(startDate);
              const end = new Date(endDate);
              return itemDate >= start && itemDate <= end;
            } else {
              // Single date format
              const filterDate = new Date(value);
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
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          if (typeof itemValue === 'number') {
            return itemValue.toString().includes(value);
          }
          return false;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, columnFilterValues, searchFields, columnFilters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <Card className="mb-6">
      {/* Fixed/Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        {(title || description || headerActions) && (
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            {(title || description) && (
              <div>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
            )}
            {headerActions}
          </CardHeader>
        )}
        
        {/* Compact Search and Filter Controls */}
        <div className="px-6 pb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-9"
              />
            </div>
            <div className="flex gap-2 items-center">
              {columnFilters.length > 0 && (
                <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                      {hasActiveFilters && (
                        <span className="ml-1 bg-primary text-primary-foreground rounded-full w-2 h-2"></span>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              )}
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="h-9">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible Filter Fields */}
          {columnFilters.length > 0 && (
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent className="space-y-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-3 border-t">
                  {columnFilters.map((filter) => (
                    <div key={filter.field} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {filter.label}
                      </label>
                      {filter.type === 'select' ? (
                        <Select
                          value={columnFilterValues[filter.field] || ""}
                          onValueChange={(value) => {
                            setColumnFilterValues(prev => ({
                              ...prev,
                              [filter.field]: value === "all" ? "" : value
                            }));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Semua" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            {filter.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : filter.type === 'daterange' ? (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            <Input
                              placeholder="Dari"
                              type="date"
                              value={columnFilterValues[filter.field]?.split(',')[0] || ""}
                              onChange={(e) => {
                                const currentValue = columnFilterValues[filter.field] || "";
                                const endDate = currentValue.includes(',') ? currentValue.split(',')[1] : "";
                                const newValue = endDate ? `${e.target.value},${endDate}` : e.target.value;
                                setColumnFilterValues(prev => ({
                                  ...prev,
                                  [filter.field]: newValue
                                }));
                                setCurrentPage(1);
                              }}
                              className="h-8 text-xs"
                            />
                            <Input
                              placeholder="Sampai"
                              type="date"
                              value={columnFilterValues[filter.field]?.split(',')[1] || ""}
                              onChange={(e) => {
                                const currentValue = columnFilterValues[filter.field] || "";
                                const startDate = currentValue.includes(',') ? currentValue.split(',')[0] : currentValue;
                                const newValue = startDate ? `${startDate},${e.target.value}` : `,${e.target.value}`;
                                setColumnFilterValues(prev => ({
                                  ...prev,
                                  [filter.field]: newValue
                                }));
                                setCurrentPage(1);
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <Input
                          placeholder={`Filter...`}
                          value={columnFilterValues[filter.field] || ""}
                          onChange={(e) => {
                            setColumnFilterValues(prev => ({
                              ...prev,
                              [filter.field]: e.target.value
                            }));
                            setCurrentPage(1);
                          }}
                          type={filter.type === 'number' ? 'number' : filter.type === 'date' ? 'date' : 'text'}
                          className="h-8 text-xs"
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

      <CardContent>
        {/* Data Display */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {data.length === 0 ? emptyStateMessage : "Tidak ada data yang sesuai dengan pencarian"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentData.map((item, index) => (
                <div key={index}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
            {renderPagination()}
            {filteredData.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
