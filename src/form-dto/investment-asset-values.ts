import { InvestmentAssetValueModel } from "@/models/investment-asset-values";

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

export const mapAssetValueToFormData = (assetValue: InvestmentAssetValueModel): AssetValueFormData => ({
  asset_id: assetValue.asset_id,
  value: assetValue.value,
  date: assetValue.date,
});
