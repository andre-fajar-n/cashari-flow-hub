import { useQueryClient } from "@tanstack/react-query";

export interface MutationHandlerConfig {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  setIsLoading?: (loading: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  form?: {
    reset: () => void;
  };
  queryKeysToInvalidate: string[];
}

export interface MutationCallbacksConfig {
  setIsLoading: (loading: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  form?: {
    reset: () => void;
  };
  queryKeysToInvalidate: readonly string[] | string[];
}

/**
 * Creates standardized success and error handlers for mutations
 * @param config Configuration object for the handlers
 * @returns Object with handleSuccess and handleError functions
 */
export const createMutationHandlers = (config: MutationHandlerConfig) => {
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    // Reset loading state
    if (config.setIsLoading) {
      config.setIsLoading(false);
    }

    // Close dialog/modal
    if (config.onOpenChange) {
      config.onOpenChange(false);
    }

    // Reset form
    if (config.form?.reset) {
      config.form.reset();
    }

    // Call custom success callback
    if (config.onSuccess) {
      config.onSuccess();
    }

    // Invalidate specified queries
    config.queryKeysToInvalidate.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    });
  };

  const handleError = (error?: any) => {
    // Reset loading state to allow retry
    if (config.setIsLoading) {
      config.setIsLoading(false);
    }

    // Call custom error callback
    if (config.onError) {
      config.onError(error);
    }
  };

  return {
    handleSuccess,
    handleError
  };
};

/**
 * Hook that provides standardized mutation callbacks
 * @param config Configuration object for the callbacks
 * @returns Object with handleSuccess and handleError functions
 */
export const useMutationCallbacks = (config: MutationCallbacksConfig) => {
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    // Reset loading state
    config.setIsLoading(false);

    // Close dialog/modal
    config.onOpenChange(false);

    // Reset form
    if (config.form?.reset) {
      config.form.reset();
    }

    // Call custom success callback
    if (config.onSuccess) {
      config.onSuccess();
    }

    // Invalidate specified queries
    config.queryKeysToInvalidate.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    });

    // Special handling for money_movements - invalidate all variations
    if (config.queryKeysToInvalidate.includes("money_movements")) {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "money_movements"
      });
    }
  };

  const handleError = () => {
    // Reset loading state to allow retry
    config.setIsLoading(false);
  };

  return {
    handleSuccess,
    handleError
  };
};

/**
 * Predefined query key sets for common scenarios
 */
export const QUERY_KEY_SETS = {
  TRANSACTIONS: ["transactions", "transactions_paginated", "wallets", "budgets", "business_projects", "money_movements_paginated"],
  WALLETS: ["wallets", "transactions", "transfers", "money_movements_paginated"],
  CATEGORIES: ["categories", "transactions"],
  BUDGETS: ["budgets", "transactions", "money_movements_paginated"],
  BUSINESS_PROJECTS: ["business_projects", "transactions", "money_movements_paginated"],
  DEBTS: ["debts", "debt_histories", "debt-summary", "money_movements_paginated"],
  TRANSFERS: ["transfers", "transfers_paginated", "wallets", "money_movements_paginated"],
  GOAL_TRANSFERS: ["goal_transfers", "goals", "goal_movements", "wallets", "money_movements", "goal_investment_records", "goal_funds_summary", "money_movements_paginated"],
  INVESTMENT_ASSETS: ["investment_assets", "investment_asset_values", "goal_investment_records", "money_movements_paginated"],
  INVESTMENT_ASSET_VALUES: ["investment_asset_values", "investment_asset_values_paginated", "money_movements_paginated"],
  INVESTMENT_INSTRUMENTS: ["investment_instruments", "investment_instruments_paginated"],
  GOALS: ["goals", "goal_transfers", "goal_movements", "goal_funds_summary", "money_movements_paginated"],
  INVESTMENT_RECORDS: ["goal_investment_records", "goals", "investment_assets", "money_movements", "goal_funds_summary", "money_movements_paginated"],
} as const;

/**
 * Helper function to execute mutation with standardized callbacks
 * @param mutation The mutation function to execute
 * @param data The data to pass to the mutation
 * @param callbacks The success and error callbacks
 */
export const executeMutationWithCallbacks = <T>(
  mutation: { mutate: (data: T, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => void },
  data: T,
  callbacks: { handleSuccess: () => void; handleError: (error?: any) => void }
) => {
  mutation.mutate(data, {
    onSuccess: callbacks.handleSuccess,
    onError: callbacks.handleError
  });
};
