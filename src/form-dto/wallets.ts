export interface WalletFormData {
  name: string;
  currency_code: string | null;
}

export const defaultWalletFormValues: WalletFormData = {
  name: "",
  currency_code: null,
};
