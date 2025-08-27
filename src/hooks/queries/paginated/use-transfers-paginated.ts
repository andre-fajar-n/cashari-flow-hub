import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useTransfersPaginated = (params: PaginatedParams) => {
  return usePaginatedSupabase(params, {
    queryKeyBase: "transfers_paginated",
    table: "transfers",
    select: `*,
      from_wallet:wallets!transfers_from_wallet_id_fkey(id, name, currency_code, initial_amount),
      to_wallet:wallets!transfers_to_wallet_id_fkey(id, name, currency_code, initial_amount)`,
    orderBy: { column: "date", ascending: false },
    mapSearch: (q: any, term: string) => {
      const isNumeric = /^\d+(?:\.\d+)?$/.test(term);
      return isNumeric ? q.or(`from_amount.eq.${term},to_amount.eq.${term}`) : q;
    },
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        if (key === 'date') {
          if (typeof value === 'string' && value.includes(',')) {
            const [start, end] = value.split(',');
            q = q.gte('date', start).lte('date', end);
          } else if (typeof value === 'string' && value) {
            q = q.eq('date', value);
          }
        } else if (key === 'from_wallet.currency_code') {
          q = q.eq('wallets!transfers_from_wallet_id_fkey.currency_code', value);
        } else if (key === 'to_wallet.currency_code') {
          q = q.eq('wallets!transfers_to_wallet_id_fkey.currency_code', value);
        } else {
          q = q.eq(key, value);
        }
      });
      return q;
    },
  });
};

