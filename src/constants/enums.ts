export const DEBT_TYPES = {
  LOAN: 'loan' as const,
  BORROWED: 'borrowed' as const,
} as const;

export const CATEGORY_APPLICATIONS = {
  TRANSACTION: 'transaction' as const,
  INVESTMENT: 'investment' as const,
  DEBT: 'debt' as const,
} as const;

export const MOVEMENT_TYPES = {
  TRANSACTION: 'transactions' as const,
  TRANSFER: 'transfers' as const,
  GOAL_TRANSFER: 'goal_transfers' as const,
  INVESTMENT_GROWTH: 'investment_growth' as const,
  DEBT_HISTORY: 'debt_histories' as const,
} as const;

export type CategoryApplication = typeof CATEGORY_APPLICATIONS[keyof typeof CATEGORY_APPLICATIONS];
