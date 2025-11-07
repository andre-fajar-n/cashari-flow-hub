export interface TransferFormData {
  from_wallet_id: string;
  to_wallet_id: string;
  from_amount: number;
  to_amount: number;
  date: string;
}

export const defaultTransferFormData: TransferFormData = {
  from_wallet_id: "",
  to_wallet_id: "",
  from_amount: 0,
  to_amount: 0,
  date: new Date().toISOString().split("T")[0],
};

export interface TransferFilter {
  ids?: number[];
}
