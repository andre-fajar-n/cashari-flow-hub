import { MOVEMENT_TYPES } from "@/constants/enums";
import { TransactionTypeConfig } from "@/components/ui/transaction-items/types";
import {
  Receipt,
  ArrowLeftRight,
  Target,
  TrendingUp,
  CreditCard
} from "lucide-react";

/**
 * Get type configuration with icon and styling for different movement types
 */
export const getTransactionTypeConfig = (resourceType: string): TransactionTypeConfig => {
  switch (resourceType) {
    case MOVEMENT_TYPES.TRANSACTION:
      return {
        text: "Transaksi",
        icon: Receipt,
        variant: "default" as const,
        className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      };
    case MOVEMENT_TYPES.TRANSFER:
      return {
        text: "Transfer",
        icon: ArrowLeftRight,
        variant: "secondary" as const,
        className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
      };
    case MOVEMENT_TYPES.GOAL_TRANSFER:
      return {
        text: "Transfer Target",
        icon: Target,
        variant: "outline" as const,
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
      };
    case MOVEMENT_TYPES.INVESTMENT_GROWTH:
      return {
        text: "Progres Investasi",
        icon: TrendingUp,
        variant: "outline" as const,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
      };
    case MOVEMENT_TYPES.DEBT_HISTORY:
      return {
        text: "Hutang/Piutang",
        icon: CreditCard,
        variant: "destructive" as const,
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
      };
    default:
      return {
        text: "Tidak Diketahui",
        icon: Receipt,
        variant: "outline" as const,
        className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
      };
  }
};

/**
 * Generate unique key for transaction items
 */
export const generateTransactionKey = (
  prefix: string,
  movementId: number | null,
  resourceId: number | null,
  resourceType: string | null,
  ...additionalIds: (number | null)[]
): string => {
  const ids = [movementId, resourceId, resourceType, ...additionalIds]
    .filter(id => id !== null && id !== undefined)
    .join('-');
  return `${prefix}-${ids}`;
};

/**
 * Utility functions for movement data processing
 */
export const hasTransferBetweenDifferentEntities = (
  entityId: number | null | undefined,
  oppositeEntityId: number | null | undefined
): boolean => {
  return !!(entityId && oppositeEntityId && entityId !== oppositeEntityId);
};

export const hasSingleEntity = (
  entityId: number | null | undefined,
  oppositeEntityId: number | null | undefined
): boolean => {
  return !!(entityId && !oppositeEntityId);
};

export const getTransferDirection = (amount: number): "from" | "to" => {
  return amount > 0 ? "from" : "to";
};

export const getDirectionalLabel = (amount: number, entityType: string): string => {
  const direction = amount > 0 ? "Ke" : "Dari";
  return `${direction} ${entityType}`;
};
