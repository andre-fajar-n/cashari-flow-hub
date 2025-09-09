import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, DollarSign, Coins } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { WalletSummary, CurrencyTotal } from "@/hooks/queries/use-money-summary";

interface MoneySummaryCardProps {
  walletSummaries: WalletSummary[];
  totalsByOriginalCurrency: CurrencyTotal[];
  totalsByBaseCurrency: CurrencyTotal[];
  isLoading?: boolean;
}

const MoneySummaryCard = ({ 
  walletSummaries, 
  totalsByOriginalCurrency, 
  totalsByBaseCurrency, 
  isLoading 
}: MoneySummaryCardProps) => {
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
        {/* Grand Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total by Original Currency */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-sm">Total per Mata Uang Asli</h4>
            </div>
            <div className="space-y-2">
              {totalsByOriginalCurrency.length > 0 ? (
                totalsByOriginalCurrency.map((total) => (
                  <div key={total.currency_code} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <Badge variant="outline" className="text-xs">
                      {total.currency_code}
                    </Badge>
                    <span className="font-semibold text-sm">
                      {formatAmountCurrency(total.total_amount, total.currency_code)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </div>

          {/* Total by Base Currency */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-sm">Total per Mata Uang Dasar</h4>
            </div>
            <div className="space-y-2">
              {totalsByBaseCurrency.length > 0 ? (
                totalsByBaseCurrency.map((total) => (
                  <div key={total.currency_code} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <Badge variant="outline" className="text-xs">
                      {total.currency_code}
                    </Badge>
                    <span className="font-semibold text-sm">
                      {formatAmountCurrency(total.total_amount, total.currency_code)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Summaries */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium">Ringkasan per Dompet</h4>
          </div>
          
          {walletSummaries.length > 0 ? (
            <div className="space-y-4">
              {walletSummaries.map((wallet) => (
                <Card key={wallet.wallet_id} className="p-4 border-l-4 border-l-purple-500">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{wallet.wallet_name}</h5>
                      <Badge variant="secondary" className="text-xs">
                        {wallet.items.length} item{wallet.items.length > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Wallet totals by original currency */}
                    {Object.keys(wallet.totalByOriginalCurrency).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Mata Uang Asli:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(wallet.totalByOriginalCurrency).map(([currency, amount]) => (
                            <div key={currency} className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
                              <span className="font-medium">{currency}:</span>
                              <span>{formatAmountCurrency(amount, currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wallet totals by base currency */}
                    {Object.keys(wallet.totalByBaseCurrency).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Mata Uang Dasar:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(wallet.totalByBaseCurrency).map(([currency, amount]) => (
                            <div key={currency} className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded">
                              <span className="font-medium">{currency}:</span>
                              <span>{formatAmountCurrency(amount, currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4 text-center text-muted-foreground">
              <p className="text-sm">Belum ada data ringkasan dompet</p>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MoneySummaryCard;
