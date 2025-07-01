export interface TransferFormData {
  from_wallet_id: string;
  to_wallet_id: string;
  amount_from: number;
  amount_to: number;
  date: string;
}

export const defaultTransferFormData: TransferFormData = {
  from_wallet_id: "",
  to_wallet_id: "",
  amount_from: 0,
  amount_to: 0,
  date: new Date().toISOString().split("T")[0],
};
