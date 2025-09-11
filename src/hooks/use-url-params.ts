import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

export interface UseUrlParamsOptions {
  defaultPage?: number;
  defaultItemsPerPage?: number;
  defaultSearch?: string;
  defaultFilters?: Record<string, any>;
}

export const useUrlParams = (options: UseUrlParamsOptions = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    defaultPage = 1,
    defaultItemsPerPage = 10,
    defaultSearch = "",
    defaultFilters = {}
  } = options;

  // Parse current URL params
  const currentParams = useMemo(() => {
    const page = parseInt(searchParams.get("page") || defaultPage.toString());
    const itemsPerPage = parseInt(searchParams.get("itemsPerPage") || defaultItemsPerPage.toString());
    const search = searchParams.get("search") || defaultSearch;
    
    // Parse filters from URL
    const filters: Record<string, any> = { ...defaultFilters };
    searchParams.forEach((value, key) => {
      if (key.startsWith("filter_")) {
        const filterKey = key.replace("filter_", "");
        filters[filterKey] = value;
      }
    });

    return {
      page: Math.max(1, page),
      itemsPerPage: Math.max(1, itemsPerPage),
      search,
      filters
    };
  }, [searchParams, defaultPage, defaultItemsPerPage, defaultSearch, defaultFilters]);

  // Update URL params
  const updateParams = useCallback((updates: {
    page?: number;
    itemsPerPage?: number;
    search?: string;
    filters?: Record<string, any>;
  }) => {
    const newParams = new URLSearchParams(searchParams);

    // Update page
    if (updates.page !== undefined) {
      if (updates.page === defaultPage) {
        newParams.delete("page");
      } else {
        newParams.set("page", updates.page.toString());
      }
    }

    // Update itemsPerPage
    if (updates.itemsPerPage !== undefined) {
      if (updates.itemsPerPage === defaultItemsPerPage) {
        newParams.delete("itemsPerPage");
      } else {
        newParams.set("itemsPerPage", updates.itemsPerPage.toString());
      }
    }

    // Update search
    if (updates.search !== undefined) {
      if (updates.search === defaultSearch) {
        newParams.delete("search");
      } else {
        newParams.set("search", updates.search);
      }
    }

    // Update filters
    if (updates.filters !== undefined) {
      // Remove existing filter params
      const keysToDelete: string[] = [];
      newParams.forEach((_, key) => {
        if (key.startsWith("filter_")) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => newParams.delete(key));

      // Add new filter params
      Object.entries(updates.filters).forEach(([key, value]) => {
        if (value && value !== "" && value !== defaultFilters[key]) {
          newParams.set(`filter_${key}`, value.toString());
        }
      });
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams, defaultPage, defaultItemsPerPage, defaultSearch, defaultFilters]);

  // Helper functions
  const setPage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  const setSearch = useCallback((search: string) => {
    updateParams({ search, page: 1 }); // Reset to page 1 when searching
  }, [updateParams]);

  const setFilters = useCallback((filters: Record<string, any>) => {
    updateParams({ filters, page: 1 }); // Reset to page 1 when filtering
  }, [updateParams]);

  const resetParams = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    ...currentParams,
    setPage,
    setSearch,
    setFilters,
    updateParams,
    resetParams
  };
};
