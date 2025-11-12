import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  totalCount: number
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

export function DataTablePagination<TData>({
  totalCount,
  page,
  pageSize,
  setPage,
  setPageSize,
}: DataTablePaginationProps<TData>) {
  const displayTotalCount = totalCount ?? 0
  const currentPage = page
  const totalPages = Math.ceil(displayTotalCount / pageSize)

  // Calculate range of items being displayed
  const startItem = displayTotalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, displayTotalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t bg-gray-50/50">
      {/* Left side: Item count info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>Menampilkan</span>
          <span className="font-medium text-gray-900">
            {startItem}-{endItem}
          </span>
          <span>dari</span>
          <span className="font-medium text-gray-900">{displayTotalCount}</span>
          <span>item</span>
        </div>
      </div>

      {/* Right side: Pagination controls */}
      <div className="flex items-center gap-6">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Tampilkan</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value)) // This will trigger handlePageSizeChange which resets to page 1
            }}
          >
            <SelectTrigger className="h-9 w-[75px] bg-white border-gray-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">item</span>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          {/* First page button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 w-9 p-0 lg:flex bg-white hover:bg-gray-100"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Ke halaman pertama</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 bg-white hover:bg-gray-100"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <span className="sr-only">Ke halaman sebelumnya</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page indicator */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md min-w-[120px] justify-center">
            <span className="text-sm text-gray-600">Hal.</span>
            <span className="text-sm font-semibold text-gray-900">{currentPage}</span>
            <span className="text-sm text-gray-600">dari</span>
            <span className="text-sm font-semibold text-gray-900">{totalPages}</span>
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 bg-white hover:bg-gray-100"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <span className="sr-only">Ke halaman selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 w-9 p-0 lg:flex bg-white hover:bg-gray-100"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <span className="sr-only">Ke halaman terakhir</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

