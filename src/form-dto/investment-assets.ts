
export interface AssetFormData {
  name: string;
  symbol: string;
  instrument_id: number;
  currency_code?: string;
}

export const defaultAssetFormValues: AssetFormData = {
  name: "",
  symbol: "",
  instrument_id: 0,
  currency_code: "",
};
