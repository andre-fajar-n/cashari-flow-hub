export interface AssetFormData {
  name: string;
  symbol: string;
  instrument_id: number;
}

export const defaultAssetFormValues: AssetFormData = {
  name: "",
  symbol: "",
  instrument_id: 0,
};
