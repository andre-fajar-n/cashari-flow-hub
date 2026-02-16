export interface WalletFormData {
  name: string;
  currency_code: string | null;
  initial_amount: number;
  initial_exchange_rate_date: string | null;
}

export const defaultWalletFormValues: WalletFormData = {
  name: "",
  currency_code: null,
  initial_amount: 0,
  initial_exchange_rate_date: null,
};
