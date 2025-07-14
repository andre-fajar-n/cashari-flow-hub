import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search } from "lucide-react";

export interface ColumnFilter {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
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
  onRefresh?: () => void;
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
  onRefresh,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilterValues, setColumnFilterValues] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);

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
  }, [data, searchTerm, columnFilterValues, searchFields]);

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
      {(title || description || headerActions) && (
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {(title || description) && (
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          )}
          {headerActions}
        </CardHeader>
      )}
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                Refresh
              </Button>
            )}
          </div>

          {/* Column Filters */}
          {columnFilters.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {columnFilters.map((filter) => (
                <div key={filter.field}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
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
                      <SelectTrigger>
                        <SelectValue placeholder={`Filter ${filter.label}`} />
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
                  ) : (
                    <Input
                      placeholder={`Filter ${filter.label}`}
                      value={columnFilterValues[filter.field] || ""}
                      onChange={(e) => {
                        setColumnFilterValues(prev => ({
                          ...prev,
                          [filter.field]: e.target.value
                        }));
                        setCurrentPage(1);
                      }}
                      type={filter.type === 'number' ? 'number' : filter.type === 'date' ? 'date' : 'text'}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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