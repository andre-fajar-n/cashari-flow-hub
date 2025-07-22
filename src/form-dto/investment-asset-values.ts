
export interface AssetValueFormData {
  asset_id: number;
  value: number;
  date: string;
}

export const defaultAssetValueFormValues: AssetValueFormData = {
  asset_id: 0,
  value: 0,
  date: new Date().toISOString().split('T')[0],
};
