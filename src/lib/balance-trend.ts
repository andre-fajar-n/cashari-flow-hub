import { DailyCumulative } from "@/models/daily-cumulative";

export type ValuationStatus = 'Exact' | 'Old Price' | 'Old FX' | 'Missing';

export const getStatus = (item: DailyCumulative, date: string) => {
  let status: ValuationStatus = 'Exact';
  const FXRateDateNotSameAsDate = item.fx_rate_date_used !== date &&
    item.original_currency_code !== item.base_currency_code &&
    item.cumulative_amount !== 0;
  const AssetPriceDateNotSameAsDate = item.asset_price_date_used !== date &&
    item.is_trackable &&
    item.cumulative_unit !== 0;
  const isMissingFX = !item.historical_fx_rate &&
    item.original_currency_code !== item.base_currency_code &&
    item.cumulative_amount !== 0;
  const isMissingPrice = !item.historical_asset_price &&
    item.is_trackable &&
    item.cumulative_unit !== 0;

  if (isMissingPrice && isMissingFX) {
    status = 'Missing';
  } else if (AssetPriceDateNotSameAsDate) {
    status = 'Old Price';
  } else if (FXRateDateNotSameAsDate) {
    status = 'Old FX';
  }
  return status;
}