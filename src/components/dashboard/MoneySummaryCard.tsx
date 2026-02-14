import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wallet, DollarSign, Coins, ChevronRight, Search, ChevronLeft, Calculator, Info } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { MoneySummaryGroupByCurrency, MoneySummaryModel, WalletSummary } from "@/models/money-summary";
import {
  FourColumnLayout,
  WalletRow,
  InstrumentRow,
  createAmountData
} from "@/components/dashboard/money-summary";
import { ZakatInfo } from "@/components/dashboard/ZakatInfo";
import { useUserSettings } from "@/hooks/queries/use-user-settings";

interface MoneySummaryCardProps {
  isLoading?: boolean;
  moneySummaries: MoneySummaryModel[];
}

const MoneySummaryCard = ({
  isLoading,
  moneySummaries
}: MoneySummaryCardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedWallets, setExpandedWallets] = useState<Set<number>>(new Set());
  const [expandedInstruments, setExpandedInstruments] = useState<Set<string>>(new Set());
  const itemsPerPage = 5;

  // Get user's base currency
  const { data: userSettings } = useUserSettings();

  // Helper function to calculate actual amount (considering asset value)
  const getActualAmount = (row: MoneySummaryModel): number => {
    // If asset has latest_asset_value and amount_unit, use calculated value
    if (row.latest_asset_value && row.amount_unit) {
      return row.latest_asset_value * row.amount_unit;
    }
    // Otherwise use the original amount
    return row.total_amount || 0;
  };

  // Process currency totals with both original and calculated amounts
  const currencyMap = new Map<string, MoneySummaryGroupByCurrency & {
    originalAmount: number;
    calculatedAmount: number;
    unrealizedAmount: number;
  }>();

  for (const row of moneySummaries) {
    const key = row.original_currency_code;
    const existing = currencyMap.get(key);
    const actualAmount = getActualAmount(row);
    const originalAmount = row.total_amount || 0;

    if (existing) {
      existing.originalAmount += originalAmount;
      existing.calculatedAmount += actualAmount;
      existing.amount += actualAmount; // Keep for backward compatibility
      existing.active_capital += row.active_capital || 0;
      existing.active_capital_base_currency += row.active_capital_base_currency || 0;
      existing.unrealized_profit += row.unrealized_profit || 0;
      existing.unrealized_asset_profit_base_currency += row.unrealized_asset_profit_base_currency || 0;
      existing.unrealized_currency_profit += row.unrealized_currency_profit || 0;
      existing.current_value += row.current_value || 0;
      existing.current_value_base_currency += row.current_value_base_currency || 0;
    } else {
      currencyMap.set(key, {
        original_currency_code: row.original_currency_code,
        original_currency_symbol: row.original_currency_symbol,
        amount: actualAmount, // Keep for backward compatibility
        originalAmount: originalAmount,
        calculatedAmount: actualAmount,
        unrealizedAmount: 0, // Will be calculated after
        active_capital: row.active_capital || 0,
        active_capital_base_currency: row.active_capital_base_currency || 0,
        unrealized_profit: row.unrealized_profit || 0,
        unrealized_asset_profit_base_currency: row.unrealized_asset_profit_base_currency || 0,
        unrealized_currency_profit: row.unrealized_currency_profit || 0,
        current_value: row.current_value || 0,
        current_value_base_currency: row.current_value_base_currency || 0,
        base_currency_code: row.base_currency_code,
        base_currency_symbol: row.base_currency_symbol,
        latest_rate: row.latest_rate ?? null,
        latest_rate_date: row.latest_rate_date ?? null,
      });
    }
  }

  // Calculate unrealized amounts
  for (const [key, currencyData] of currencyMap.entries()) {
    currencyData.unrealizedAmount = currencyData.calculatedAmount - currencyData.originalAmount;
  }
  const currencies = Array.from(currencyMap.keys());

  // Calculate total amount in default currency with unrealized breakdown
  const totalAmountCalculation = useMemo(() => {
    if (!userSettings?.base_currency_code || currencies.length === 0) {
      return {
        canCalculate: false,
        totalAmount: 0,
        totalOriginalAmount: 0,
        totalUnrealizedAmount: 0,
        missingRates: []
      };
    }

    const missingRates: string[] = [];
    let totalAmount = 0;
    let totalOriginalAmount = 0;
    let canCalculate = true;

    for (const currency of currencies) {
      const currencyData = currencyMap.get(currency);
      if (!currencyData) continue;

      const calculatedAmount = currencyData.calculatedAmount || 0;
      const originalAmount = currencyData.originalAmount || 0;

      // If it's the same as default currency, no conversion needed
      if (currency === userSettings?.base_currency_code) {
        totalAmount += calculatedAmount;
        totalOriginalAmount += originalAmount;
      } else {
        // Need exchange rate for conversion
        if (currencyData.latest_rate === null) {
          missingRates.push(currency);
          canCalculate = false;
        } else {
          const rate = currencyData.latest_rate || 0;
          totalAmount += calculatedAmount * rate;
          totalOriginalAmount += originalAmount * rate;
        }
      }
    }

    const totalUnrealizedAmount = totalAmount - totalOriginalAmount;

    return {
      canCalculate,
      totalAmount,
      totalOriginalAmount,
      totalUnrealizedAmount,
      missingRates
    };
  }, [currencies, currencyMap, userSettings]);

  // Process wallet hierarchy: wallet → instrument → asset
  const processedWallets = useMemo(() => {
    const walletMap = new Map<number, WalletSummary>();

    for (const row of moneySummaries) {
      if (!row.wallet_id || !row.wallet_name) continue;

      // Get or create wallet
      let wallet = walletMap.get(row.wallet_id);
      if (!wallet) {
        wallet = {
          wallet_id: row.wallet_id,
          wallet_name: row.wallet_name,
          amount: 0,
          originalAmount: 0,
          calculatedAmount: 0,
          unrealizedAmount: 0,
          active_capital: 0,
          active_capital_base_currency: 0,
          unrealized_profit: 0,
          unrealized_asset_profit_base_currency: 0,
          unrealized_currency_profit: 0,
          current_value: 0,
          current_value_base_currency: 0,
          original_currency_code: row.original_currency_code,
          original_currency_symbol: row.original_currency_symbol,
          latest_rate: row.latest_rate,
          latest_rate_date: row.latest_rate_date,
          base_currency_code: row.base_currency_code,
          base_currency_symbol: row.base_currency_symbol,
          instruments: []
        };
        walletMap.set(row.wallet_id, wallet);
      }

      // Add to wallet total using both amounts
      const actualAmount = getActualAmount(row);
      const originalAmount = row.total_amount || 0;
      wallet.amount += actualAmount; // Keep for backward compatibility
      wallet.originalAmount += originalAmount;
      wallet.calculatedAmount += actualAmount;
      wallet.unrealizedAmount = wallet.calculatedAmount - wallet.originalAmount;
      wallet.active_capital += row.active_capital || 0;
      wallet.active_capital_base_currency += row.active_capital_base_currency || 0;
      wallet.unrealized_profit += row.unrealized_profit || 0;
      wallet.unrealized_asset_profit_base_currency += row.unrealized_asset_profit_base_currency || 0;
      wallet.unrealized_currency_profit += row.unrealized_currency_profit || 0;
      wallet.current_value += row.current_value || 0;
      wallet.current_value_base_currency += row.current_value_base_currency || 0;

      // Get or create instrument
      const instrumentKey = row.instrument_id || 0;
      let instrument = wallet.instruments.find(i => (i.instrument_id || 0) === instrumentKey);
      if (!instrument) {
        instrument = {
          instrument_id: row.instrument_id,
          instrument_name: row.instrument_name || 'Bukan instrumen',
          amount: 0,
          originalAmount: 0,
          calculatedAmount: 0,
          unrealizedAmount: 0,
          active_capital: 0,
          active_capital_base_currency: 0,
          unrealized_profit: 0,
          unrealized_asset_profit_base_currency: 0,
          unrealized_currency_profit: 0,
          current_value: 0,
          current_value_base_currency: 0,
          original_currency_code: row.original_currency_code,
          original_currency_symbol: row.original_currency_symbol,
          latest_rate: row.latest_rate,
          base_currency_code: row.base_currency_code,
          base_currency_symbol: row.base_currency_symbol,
          latest_rate_date: row.latest_rate_date,
          assets: []
        };
        wallet.instruments.push(instrument);
      }

      // Add to instrument total using both amounts
      instrument.amount += actualAmount; // Keep for backward compatibility
      instrument.originalAmount += originalAmount;
      instrument.calculatedAmount += actualAmount;
      instrument.unrealizedAmount = instrument.calculatedAmount - instrument.originalAmount;
      instrument.active_capital += row.active_capital || 0;
      instrument.active_capital_base_currency += row.active_capital_base_currency || 0;
      instrument.unrealized_profit += row.unrealized_profit || 0;
      instrument.unrealized_asset_profit_base_currency += row.unrealized_asset_profit_base_currency || 0;
      instrument.unrealized_currency_profit += row.unrealized_currency_profit || 0;
      instrument.current_value += row.current_value || 0;
      instrument.current_value_base_currency += row.current_value_base_currency || 0;

      // Get or create asset
      const assetKey = row.asset_id || 0;
      let asset = instrument.assets.find(a => (a.asset_id || 0) === assetKey);
      if (!asset) {
        asset = {
          asset_id: row.asset_id,
          asset_name: row.asset_name || 'Bukan aset',
          amount: 0,
          originalAmount: 0,
          calculatedAmount: 0,
          unrealizedAmount: 0,
          active_capital: row.active_capital || 0,
          active_capital_base_currency: row.active_capital_base_currency || 0,
          unrealized_profit: row.unrealized_profit || 0,
          unrealized_asset_profit_base_currency: row.unrealized_asset_profit_base_currency || 0,
          unrealized_currency_profit: row.unrealized_currency_profit || 0,
          current_value: row.current_value || 0,
          current_value_base_currency: row.current_value_base_currency || 0,
          amount_unit: 0,
          original_currency_code: row.original_currency_code,
          original_currency_symbol: row.original_currency_symbol,
          latest_asset_value: row.latest_asset_value,
          latest_asset_value_date: row.latest_asset_value_date,
          latest_rate: row.latest_rate,
          base_currency_code: row.base_currency_code,
          base_currency_symbol: row.base_currency_symbol,
        };
        instrument.assets.push(asset);
      }

      // Add to asset using both amounts
      asset.amount += actualAmount; // Keep for backward compatibility
      asset.originalAmount += originalAmount;
      asset.calculatedAmount += actualAmount;
      asset.unrealizedAmount = asset.calculatedAmount - asset.originalAmount;
      // Asset level fields are taken directly from the row for the first occurrence
      // and shouldn't be accumulated like wallet/instrument level fields
      asset.amount_unit += row.amount_unit || 0;
    }

    // Custom sorting function: positive, zero, negative, then by name
    const customSort = (a: { amount?: number; name: string }, b: { amount?: number; name: string }) => {
      const aAmount = a.amount || 0;
      const bAmount = b.amount || 0;

      // First sort by amount category (positive > zero > negative)
      if (aAmount > 0 && bAmount <= 0) return -1;
      if (aAmount <= 0 && bAmount > 0) return 1;
      if (aAmount === 0 && bAmount < 0) return -1;
      if (aAmount < 0 && bAmount === 0) return 1;

      // Then sort by name within same category
      return a.name.localeCompare(b.name);
    };

    // Sort wallets by amount category, then by name
    const sortedWallets = Array.from(walletMap.values()).sort((a, b) =>
      customSort(
        { amount: a.amount, name: a.wallet_name },
        { amount: b.amount, name: b.wallet_name }
      )
    );

    // Sort instruments and assets within each wallet
    sortedWallets.forEach(wallet => {
      wallet.instruments.sort((a, b) =>
        customSort(
          { amount: a.amount, name: a.instrument_name || '' },
          { amount: b.amount, name: b.instrument_name || '' }
        )
      );
      wallet.instruments.forEach(instrument => {
        instrument.assets.sort((a, b) =>
          customSort(
            { amount: a.amount, name: a.asset_name || '' },
            { amount: b.amount, name: b.asset_name || '' }
          )
        );
      });
    });

    return sortedWallets;
  }, [moneySummaries]);

  // Filter wallets based on search term
  const filteredWallets = useMemo(() => {
    if (!searchTerm) return processedWallets;
    return processedWallets.filter(wallet =>
      wallet.wallet_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedWallets, searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWallets = filteredWallets.slice(startIndex, startIndex + itemsPerPage);

  const toggleWalletExpansion = (walletId: number) => {
    const newExpanded = new Set(expandedWallets);
    if (newExpanded.has(walletId)) {
      newExpanded.delete(walletId);
    } else {
      newExpanded.add(walletId);
    }
    setExpandedWallets(newExpanded);
  };

  const toggleInstrumentExpansion = (walletId: number, instrumentId: number | null) => {
    const key = `${walletId}-${instrumentId || 0}`;
    const newExpanded = new Set(expandedInstruments);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedInstruments(newExpanded);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Ringkasan Keuangan</h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold">Ringkasan Keuangan</h3>
      </div>

      <div className="space-y-6">
        {/* Total Amount Section */}
        {userSettings?.base_currency_code && currencies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-600" />
              <h4 className="font-medium">Total Keseluruhan</h4>
            </div>
            {totalAmountCalculation.canCalculate ? (
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">
                    Total dalam {userSettings.base_currency_code}:
                  </span>
                  <span className="text-lg font-bold text-green-800">
                    {formatAmountCurrency(totalAmountCalculation.totalAmount, userSettings.base_currency_code, userSettings.currencies?.symbol)}
                  </span>
                </div>

                {/* Show breakdown of total amounts */}
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-green-600">
                    <span>Nilai Awal:</span>
                    <span>
                      {totalAmountCalculation.totalUnrealizedAmount === 0
                        ? "-"
                        : formatAmountCurrency(totalAmountCalculation.totalOriginalAmount, userSettings.base_currency_code, userSettings.currencies?.symbol)}
                    </span>
                  </div>
                  {totalAmountCalculation.totalUnrealizedAmount !== 0 && (
                    <div className={`flex justify-between font-medium ${totalAmountCalculation.totalUnrealizedAmount >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      <span>Total Belum Terealisasi:</span>
                      <span>
                        {totalAmountCalculation.totalUnrealizedAmount >= 0 ? '+' : ''}
                        {formatAmountCurrency(totalAmountCalculation.totalUnrealizedAmount, userSettings.base_currency_code, userSettings.currencies?.symbol)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-l-amber-500">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700">
                      Total tidak dapat dihitung
                    </p>
                    <p className="text-xs text-amber-600">
                      kurs tidak tersedia untuk mata uang: {totalAmountCalculation.missingRates.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zakat Information */}
        {userSettings?.base_currency_code && currencies.length > 0 && (
          <ZakatInfo
            totalWealth={totalAmountCalculation.totalAmount}
            baseCurrency={userSettings.base_currency_code}
            baseCurrencySymbol={userSettings.currencies?.symbol}
            canCalculateWealth={totalAmountCalculation.canCalculate}
          />
        )}

        {/* Grand Totals - Only Original Currency with Base Currency conversion */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium">Total per Mata Uang</h4>
          </div>
          <div className="space-y-2">
            {currencies.length > 0 ? (
              currencies.map((currency) => {
                const currencyData = currencyMap.get(currency);
                const show_in_base_currency = currencyData?.latest_rate !== null;
                const same_original_and_base_currency = currencyData.original_currency_code === currencyData.base_currency_code;
                const hasNullRate = currencyData?.latest_rate === null && currencyData?.base_currency_code;

                return (
                  <div key={currency} className="p-4 bg-blue-50 rounded-lg">
                    <FourColumnLayout
                      infoData={{
                        name: currency,
                        rate: show_in_base_currency && !same_original_and_base_currency ? currencyData?.latest_rate : undefined,
                        rateDate: show_in_base_currency && !same_original_and_base_currency ? currencyData?.latest_rate_date : undefined,
                        hasNullRate: !!hasNullRate
                      }}
                      amountData={createAmountData(
                        currencyData?.originalAmount || 0,
                        currencyData?.calculatedAmount || 0,
                        currency,
                        currencyData?.original_currency_symbol,
                        currencyData?.base_currency_code,
                        currencyData?.base_currency_symbol,
                        show_in_base_currency && !same_original_and_base_currency ? currencyData?.latest_rate : undefined,
                        currencyData?.active_capital ?? 0,
                        currencyData?.active_capital_base_currency ?? 0,
                        currencyData?.unrealized_profit ?? 0,
                        currencyData?.unrealized_asset_profit_base_currency ?? 0,
                        currencyData?.unrealized_currency_profit ?? 0,
                        currencyData?.current_value ?? 0,
                        currencyData?.current_value_base_currency ?? 0
                      )}
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada data</p>
            )}
          </div>
        </div>

        {/* Wallet Summaries with Search and Pagination */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium">Ringkasan per Dompet</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari dompet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
            </div>
          </div>

          {filteredWallets.length > 0 ? (
            <div className="space-y-4">
              {paginatedWallets.map((wallet) => (
                <Card key={wallet.wallet_id} className="border-l-4 border-l-purple-500">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleWalletExpansion(wallet.wallet_id)}
                      >
                        <WalletRow
                          wallet={wallet}
                          isExpanded={expandedWallets.has(wallet.wallet_id)}
                        />
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <div className="space-y-3 pt-3">
                          {wallet.instruments.map((instrument) => {
                            const instrumentKey = `${wallet.wallet_id}-${instrument.instrument_id || 0}`;
                            const hasAssets = instrument.assets.length > 1 || (instrument.assets.length === 1 && instrument.assets[0].asset_id !== null);

                            if (!hasAssets) {
                              // Direct card without expandable for instruments without assets
                              const asset = instrument.assets[0];
                              return (
                                <div key={`${instrument.instrument_id || 0}`} className="bg-white p-4 rounded border">
                                  <FourColumnLayout
                                    infoData={{
                                      name: instrument.instrument_name || 'Bukan instrumen',
                                      unit: asset && asset.amount_unit > 0 && asset.latest_asset_value ? asset.amount_unit : undefined,
                                      assetValueDate: asset?.latest_asset_value_date || undefined
                                    }}
                                    amountData={createAmountData(
                                      asset?.originalAmount || instrument.originalAmount,
                                      asset?.calculatedAmount || instrument.calculatedAmount,
                                      asset?.original_currency_code || instrument.original_currency_code,
                                      asset?.original_currency_symbol || instrument.original_currency_symbol,
                                      asset?.base_currency_code,
                                      asset?.base_currency_symbol,
                                      asset && asset.latest_rate && asset.base_currency_code && asset.base_currency_code !== asset.original_currency_code ? asset.latest_rate : undefined,
                                      asset?.active_capital || instrument.active_capital,
                                      asset?.active_capital_base_currency || instrument.active_capital_base_currency,
                                      asset?.unrealized_profit || instrument.unrealized_profit,
                                      asset?.unrealized_asset_profit_base_currency || instrument.unrealized_asset_profit_base_currency,
                                      asset?.unrealized_currency_profit || instrument.unrealized_currency_profit,
                                      asset?.current_value || instrument.current_value,
                                      asset?.current_value_base_currency || instrument.current_value_base_currency
                                    )}
                                  />
                                </div>
                              );
                            }

                            // Expandable instrument with assets
                            return (
                              <div key={`${instrument.instrument_id || 0}`} className="bg-white rounded border">
                                <Collapsible>
                                  <CollapsibleTrigger asChild>
                                    <div
                                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => toggleInstrumentExpansion(wallet.wallet_id, instrument.instrument_id)}
                                    >
                                      <InstrumentRow
                                        instrument={instrument}
                                        isExpanded={expandedInstruments.has(instrumentKey)}
                                      />
                                    </div>
                                  </CollapsibleTrigger>

                                  <CollapsibleContent>
                                    <div className="px-3 pb-3 border-t bg-gray-25">
                                      <div className="space-y-2 pt-2">
                                        {instrument.assets.map((asset) => (
                                          <div key={`${asset.asset_id || 0}`} className="bg-white p-3 rounded border border-gray-200">
                                            <FourColumnLayout
                                              infoData={{
                                                name: asset.asset_name || 'Bukan aset',
                                                unit: asset.amount_unit > 0 && asset.latest_asset_value ? asset.amount_unit : undefined,
                                                assetValueDate: asset.latest_asset_value_date || undefined
                                              }}
                                              amountData={createAmountData(
                                                asset.originalAmount,
                                                asset.calculatedAmount,
                                                asset.original_currency_code,
                                                asset.original_currency_symbol,
                                                asset.base_currency_code,
                                                asset.base_currency_symbol,
                                                asset.latest_rate && asset.base_currency_code !== asset.original_currency_code ? asset.latest_rate : undefined,
                                                asset.active_capital,
                                                asset.active_capital_base_currency,
                                                asset.unrealized_profit,
                                                asset.unrealized_asset_profit_base_currency,
                                                asset.unrealized_currency_profit,
                                                asset.current_value,
                                                asset.current_value_base_currency
                                              )}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredWallets.length)} dari {filteredWallets.length} dompet
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-4 text-center text-muted-foreground">
              <p className="text-sm">
                {searchTerm ? `Tidak ada dompet yang cocok dengan "${searchTerm}"` : "Belum ada data ringkasan dompet"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MoneySummaryCard;
