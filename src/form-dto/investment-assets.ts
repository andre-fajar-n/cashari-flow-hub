import { InvestmentAssetModel } from "@/models/investment-assets";

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

export const mapAssetToFormData = (asset: InvestmentAssetModel): AssetFormData => ({
  name: asset.name || "",
  symbol: asset.symbol || "",
  instrument_id: asset.instrument_id || null,
});
