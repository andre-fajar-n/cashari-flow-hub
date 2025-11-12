import React from "react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";

export interface EmptyStateConfig {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export interface AdvancedDataTableProps<TData, TValue> {
  // Table data
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Pagination (server-side)
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // Loading state
  isLoading?: boolean;

  // Column visibility (controlled from parent if needed)
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;

  // Empty states
  emptyState?: EmptyStateConfig;
  noResultsState?: EmptyStateConfig;

  // Toolbar (render prop pattern)
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;

  // Additional filters for empty state detection
  hasActiveFilters?: boolean;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  emptyState,
  noResultsState,
  toolbar,
  hasActiveFilters = false,
}: AdvancedDataTableProps<TData, TValue>) {
  // Internal column visibility state (if not controlled)
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});

  // Use controlled or internal state
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility = onColumnVisibilityChange ?? setInternalColumnVisibility;

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  // Check if there's no data at all (not just filtered out)
  const hasNoDataAtAll = totalCount === 0 && !hasActiveFilters;

  return (
    <div className="space-y-4">
      {/* Toolbar (if provided) */}
      {toolbar && toolbar(table)}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : hasNoDataAtAll && emptyState ? (
              // Custom empty state when no data at all
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64"
                >
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    {emptyState.icon && (
                      <div className="mb-4">
                        {emptyState.icon}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {emptyState.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {emptyState.description}
                    </p>
                    {emptyState.action}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : noResultsState ? (
              // Custom no results state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24"
                >
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    {noResultsState.icon && (
                      <div className="mb-2">
                        {noResultsState.icon}
                      </div>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {noResultsState.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {noResultsState.description}
                    </p>
                    {noResultsState.action}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Default no results
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data yang sesuai dengan filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        setPage={onPageChange}
        setPageSize={onPageSizeChange}
      />
    </div>
  );
}

