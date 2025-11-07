import { MoneyMovementModel } from "@/models/money-movements";

export interface CommonItemProps {
  movement: MoneyMovementModel;
  hideTypeText?: boolean;
  onEdit?: (movement: MoneyMovementModel) => void;
  onDelete?: (resourceId: number) => void;
}

export interface CommonHeaderItemProps {
  movement: MoneyMovementModel;
}

export interface CommonDescriptionItemProps {
  movement: MoneyMovementModel;
}

export interface CommonActionItemProps {
  movement: MoneyMovementModel;
  onEdit?: (movement: MoneyMovementModel) => void;
  onDelete?: (resourceId: number) => void;
}

export interface CommonAdditionalInfoProps {
  movement: MoneyMovementModel;
}

export interface TransactionAdditionalInfoProps {
  movement: MoneyMovementModel;
}

export type TransactionTypeConfig = {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "secondary" | "outline" | "destructive";
  className: string;
};

export type VariantClasses = {
  blue: string;
  green: string;
  purple: string;
  orange: string;
  red: string;
};
