export const DEBT_TYPES = {
  LOAN: 'loan' as const,
  BORROWED: 'borrowed' as const,
} as const;

export const CATEGORY_APPLICATIONS = {
  TRANSACTION: 'transaction' as const,
  INVESTMENT: 'investment' as const,
  DEBT: 'debt' as const,
} as const;

export type DebtType = typeof DEBT_TYPES[keyof typeof DEBT_TYPES];
export type CategoryApplication = typeof CATEGORY_APPLICATIONS[keyof typeof CATEGORY_APPLICATIONS];
