import { TransferModel } from "@/models/transfer";

export interface TransferFormData {
  from_wallet_id: string | null;
  to_wallet_id: string | null;
  from_amount: number;
  to_amount: number;
  date: string;
}

export const defaultTransferFormData: TransferFormData = {
  from_wallet_id: null,
  to_wallet_id: null,
  from_amount: 0,
  to_amount: 0,
  date: new Date().toISOString().split("T")[0],
};

export const mapTransferToFormData = (transfer: TransferModel): Partial<TransferFormData> => ({
  from_wallet_id: transfer.from_wallet_id?.toString() || null,
  to_wallet_id: transfer.to_wallet_id?.toString() || null,
  from_amount: transfer.from_amount || 0,
  to_amount: transfer.to_amount || 0,
  date: transfer.date || new Date().toISOString().split("T")[0],
});

export interface TransferFilter {
  ids?: number[];
}
