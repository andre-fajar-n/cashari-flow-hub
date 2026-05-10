/**
 * Minimal structural interface: any object exposing a Supabase-shaped
 * `.range(from, to)` method that resolves to `{ data, error }`.
 * Avoids leaking PostgrestFilterBuilder generics across the codebase
 * and survives the conditional `query = query.eq(...)` reassignment pattern.
 */
export interface Rangeable<T> {
  range(from: number, to: number): PromiseLike<{ data: T[] | null; error: any }>;
}

/**
 * Fetch all rows from a Supabase query builder by paging through the 1000-row limit.
 * - Apply all .eq/.in/.gte/.lte/.order/etc. BEFORE passing the builder in; do NOT call .range().
 * - Errors are thrown immediately so React Query's queryFn contract surfaces them.
 */
export async function fetchAllRows<T>(
  query: Rangeable<T>,
  pageSize = 1000
): Promise<T[]> {
  const allData: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) {
      console.error("Error in fetchAllRows:", error);
      throw error;
    }
    const batch = (data ?? []) as T[];
    allData.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return allData;
}
