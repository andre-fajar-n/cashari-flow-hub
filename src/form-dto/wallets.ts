export interface WalletFormData {
  name: string;
  currency_code: string | null;
  initial_amount: number;
}

export const defaultWalletFormValues: WalletFormData = {
  name: "",
  currency_code: null,
  initial_amount: 0,
};
