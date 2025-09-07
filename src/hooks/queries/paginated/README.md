# Paginated Supabase Hooks

This directory contains hooks for paginated data fetching from Supabase with support for search, filtering, and multiple order by columns.

## Features

- **Server-side pagination** with configurable page size
- **Search functionality** with custom search mapping
- **Column-based filtering** with custom filter logic
- **Multiple order by columns** support
- **User-scoped queries** by default
- **React Query integration** with caching and background updates

## Multiple Order By Support

The `usePaginatedSupabase` hook now supports multiple order by columns for better data sorting consistency.

### Single Order By (Backward Compatible)

```typescript
orderBy: { column: "name", ascending: true }
```

### Multiple Order By (New Feature)

```typescript
orderBy: [
  { column: "date", ascending: false },
  { column: "created_at", ascending: false }
]
```

### Example Usage

```typescript
// For transactions - order by date first, then created_at for consistency
export const useTransactionsPaginated = (params: PaginatedParams) => {
  return usePaginatedSupabase(params, {
    queryKeyBase: "transactions_paginated",
    table: "transactions",
    select: `*,
      categories(id, name, is_income, parent_id, application),
      wallets(id, name, currency_code, initial_amount)`,
    orderBy: [
      { column: "date", ascending: false },
      { column: "created_at", ascending: false }
    ],
    mapSearch: (q: any, term: string) => {
      if (!term) return q;
      return q.or(`amount.eq.${term},description.ilike.%${term}%`);
    },
    mapFilters: (q: any, filters: Record<string, any>) => {
      // Custom filter logic here
      return q;
    },
  });
};
```

## Benefits of Multiple Order By

1. **Consistent Sorting**: When primary sort column has duplicate values (e.g., same date), secondary sort ensures consistent ordering
2. **Better UX**: Users see predictable data order across page refreshes
3. **Database Performance**: Proper indexing on multiple columns can improve query performance

## Recommended Order By Patterns

### For Date-based Tables
```typescript
orderBy: [
  { column: "date", ascending: false },        // Primary: Most recent first
  { column: "created_at", ascending: false }   // Secondary: Creation order
]
```

### For Name-based Tables
```typescript
orderBy: [
  { column: "name", ascending: true },         // Primary: Alphabetical
  { column: "created_at", ascending: false }   // Secondary: Most recent first
]
```

### For Status-based Tables
```typescript
orderBy: [
  { column: "status", ascending: true },       // Primary: Group by status
  { column: "updated_at", ascending: false },  // Secondary: Most recently updated
  { column: "created_at", ascending: false }   // Tertiary: Creation order
]
```

## Implementation Details

The multiple order by feature works by:

1. Checking if `orderBy` is an array
2. If array: applying each order clause sequentially
3. If single object: applying single order (backward compatibility)

```typescript
if (options.orderBy) {
  if (Array.isArray(options.orderBy)) {
    options.orderBy.forEach((orderOption) => {
      query = query.order(orderOption.column, { ascending: orderOption.ascending ?? false });
    });
  } else {
    query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
  }
}
```

## Migration Guide

### Before (Single Order By)
```typescript
orderBy: { column: "date", ascending: false }
```

### After (Multiple Order By)
```typescript
orderBy: [
  { column: "date", ascending: false },
  { column: "created_at", ascending: false }
]
```

No breaking changes - existing single order by configurations continue to work.
