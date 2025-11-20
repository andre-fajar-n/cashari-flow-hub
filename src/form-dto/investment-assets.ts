
export interface AssetFormData {
  name: string;
  symbol: string;
  instrument_id: number | null;
}

export const defaultAssetFormValues: AssetFormData = {
  name: "",
  symbol: "",
  instrument_id: null,
};
