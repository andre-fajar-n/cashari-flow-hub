import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wallet, DollarSign, Coins, ChevronDown, ChevronRight, Search, ChevronLeft } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { WalletSummary, CurrencyTotal, MoneySummaryItem } from "@/hooks/queries/use-money-summary";

interface MoneySummaryCardProps {
  walletSummaries: WalletSummary[];
  totalsByOriginalCurrency: CurrencyTotal[];
  totalsByBaseCurrency: CurrencyTotal[];
  isLoading?: boolean;
}

interface EnhancedCurrencyTotal extends CurrencyTotal {
  base_currency_amount?: number;
  base_currency_code?: string;
}

const MoneySummaryCard = ({
  walletSummaries,
  totalsByOriginalCurrency,
  totalsByBaseCurrency,
  isLoading
}: MoneySummaryCardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedWallets, setExpandedWallets] = useState<Set<number>>(new Set());
  const itemsPerPage = 5;

  // Helper function to calculate base currency amount for totals
  const calculateBaseCurrencyForTotal = (currencyCode: string, amount: number): { amount: number; code: string } | null => {
    // Find any item with this currency that has a rate to base currency
    for (const wallet of walletSummaries) {
      for (const item of wallet.items) {
        if (item.original_currency_code === currencyCode && item.latest_rate && item.base_currency_code) {
          return {
            amount: amount * item.latest_rate,
            code: item.base_currency_code
          };
        }
      }
    }
    return null;
  };

  // Filter wallets based on search
  const filteredWallets = useMemo(() => {
    if (!searchTerm) return walletSummaries;

    return walletSummaries.filter(wallet =>
      wallet.wallet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.items.some(item =>
        item.goal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.instrument_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.asset_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [walletSummaries, searchTerm]);

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
        {/* Grand Totals - Only Original Currency with Base Currency conversion */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium">Total per Mata Uang</h4>
          </div>
          <div className="space-y-2">
            {totalsByOriginalCurrency.length > 0 ? (
              totalsByOriginalCurrency.map((total) => {
                const baseCurrencyInfo = calculateBaseCurrencyForTotal(total.currency_code, total.total_amount);
                return (
                  <div key={total.currency_code} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {total.currency_code}
                      </Badge>
                      <span className="font-semibold">
                        {formatAmountCurrency(total.total_amount, total.currency_code)}
                      </span>
                    </div>
                    {baseCurrencyInfo && (
                      <div className="flex justify-between items-center mt-1 text-sm text-muted-foreground">
                        <span>≈ {baseCurrencyInfo.code}</span>
                        <span>{formatAmountCurrency(baseCurrencyInfo.amount, baseCurrencyInfo.code)}</span>
                      </div>
                    )}
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {expandedWallets.has(wallet.wallet_id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <h5 className="font-medium">{wallet.wallet_name}</h5>
                          </div>

                          {/* Wallet totals by original currency */}
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(wallet.totalByOriginalCurrency).map(([currency, amount]) => (
                              <div key={currency} className="text-xs bg-blue-50 px-2 py-1 rounded">
                                <span className="font-medium">{formatAmountCurrency(amount, currency)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <div className="space-y-3 pt-3">
                          {wallet.items.map((item, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <div className="space-y-2">
                                {/* Hierarchy: Goal → Instrument → Asset */}
                                <div className="text-sm">
                                  {item.goal_name && (
                                    <span className="font-medium text-purple-600">{item.goal_name}</span>
                                  )}
                                  {item.instrument_name && (
                                    <span className="text-muted-foreground"> → {item.instrument_name}</span>
                                  )}
                                  {item.asset_name && (
                                    <span className="text-muted-foreground"> → {item.asset_name}</span>
                                  )}
                                </div>

                                {/* Amount display */}
                                <div className="space-y-1">
                                  {/* Amount unit if available */}
                                  {item.amount_unit && (
                                    <div className="text-xs text-muted-foreground">
                                      Unit: {item.amount_unit.toLocaleString("id-ID", { maximumFractionDigits: 4 })}
                                    </div>
                                  )}

                                  {/* Asset value calculation if available */}
                                  {item.latest_asset_value && item.amount_unit ? (
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Nilai Aset:</span>
                                        <span className="font-semibold">
                                          {formatAmountCurrency(item.latest_asset_value * item.amount_unit, item.original_currency_code || 'IDR')}
                                        </span>
                                      </div>
                                      {/* Base currency conversion if available */}
                                      {item.latest_rate && item.base_currency_code && (
                                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                                          <span>≈ {item.base_currency_code}:</span>
                                          <span>
                                            {formatAmountCurrency(
                                              item.latest_asset_value * item.amount_unit * item.latest_rate,
                                              item.base_currency_code
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    /* Regular saldo display */
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium">Saldo:</span>
                                      <span className="font-semibold">
                                        {formatAmountCurrency(item.saldo || 0, item.original_currency_code || 'IDR')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
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
