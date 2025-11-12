import { useState, useCallback, startTransition } from "react";

export interface TableStateConfig {
  initialPage?: number;
  initialPageSize?: number;
  initialSearchTerm?: string;
  initialFilters?: Record<string, any>;
}

export interface TableState {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: Record<string, any>;
}

export interface TableStateActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchTerm: (search: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (newPageSize: number) => void;
  handleSearchChange: (search: string) => void;
  handleFiltersChange: (newFilters: Record<string, any>) => void;
  resetFilters: () => void;
}

export interface UseTableStateReturn {
  state: TableState;
  actions: TableStateActions;
}

/**
 * Generic hook for managing table state (pagination, search, filters)
 * 
 * Features:
 * - Stable callbacks with useCallback (prevents unnecessary re-renders)
 * - Auto-reset to page 1 when search/filters change
 * - Batched state updates for page size change
 * 
 * @example
 * ```typescript
 * const { state, actions } = useTableState({
 *   initialPage: 1,
 *   initialPageSize: 10,
 * });
 * 
 * // Use in component
 * <MyTable
 *   page={state.page}
 *   pageSize={state.pageSize}
 *   searchTerm={state.searchTerm}
 *   filters={state.filters}
 *   onPageChange={actions.handlePageChange}
 *   onPageSizeChange={actions.handlePageSizeChange}
 *   onSearchChange={actions.handleSearchChange}
 *   onFiltersChange={actions.handleFiltersChange}
 * />
 * ```
 */
export const useTableState = (config: TableStateConfig = {}): UseTableStateReturn => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialSearchTerm = "",
    initialFilters = {},
  } = config;

  // State
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  // Stable callbacks using useCallback with empty dependency array
  // This prevents child components from re-rendering unnecessarily
  
  /**
   * Handle page change
   * Just updates the page number
   */
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  /**
   * Handle page size change
   * Resets to page 1 and updates page size
   * Uses React.startTransition to batch updates
   */
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    // Use batch update to avoid race condition
    startTransition(() => {
      setPageSize(newPageSize);
      setPage(1); // Reset to page 1 when changing page size
    });
  }, []);

  /**
   * Handle search change
   * Resets to page 1 and updates search term
   */
  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    setPage(1); // Reset to page 1 when searching
  }, []);

  /**
   * Handle filters change
   * Resets to page 1 and updates filters
   */
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 when filtering
  }, []);

  /**
   * Reset all filters and search
   * Resets to page 1
   */
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({});
    setPage(1);
  }, []);

  return {
    state: {
      page,
      pageSize,
      searchTerm,
      filters,
    },
    actions: {
      setPage,
      setPageSize,
      setSearchTerm,
      setFilters,
      handlePageChange,
      handlePageSizeChange,
      handleSearchChange,
      handleFiltersChange,
      resetFilters,
    },
  };
};

