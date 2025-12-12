import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calculator, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { DebtSummaryModel } from "@/models/debt-summary";
import { groupDebtSummaryByCurrency, calculateTotalInBaseCurrency } from "@/lib/debt-summary";

interface DebtSummaryCardProps {
  summaryData: DebtSummaryModel[];
  showDetailedBreakdown?: boolean;
  title?: string;
}

const DebtSummaryCard = ({ summaryData, showDetailedBreakdown = false, title = "Ringkasan Hutang/Piutang" }: DebtSummaryCardProps) => {
  const groupedByCurrency = useMemo(() => groupDebtSummaryByCurrency(summaryData), [summaryData]);
  const totalCalculation = useMemo(() => calculateTotalInBaseCurrency(summaryData), [summaryData]);

  if (!summaryData || summaryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada data hutang/piutang</p>
        </CardContent>
      </Card>
    );
  }

  const renderNetAmountBadge = (netAmount: number) => {
    if (netAmount > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          Surplus
        </Badge>
      );
    } else if (netAmount < 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <TrendingDown className="w-3 h-3 mr-1" />
          Defisit
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
          <Minus className="w-3 h-3 mr-1" />
          Seimbang
        </Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total dalam Base Currency */}
        {totalCalculation.can_calculate && totalCalculation.base_currency_code && (
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Total dalam {totalCalculation.base_currency_code}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-700">Pemasukan:</span>
                <span className="font-medium text-green-800">
                  {formatAmountCurrency(totalCalculation.total_income || 0, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-700">Pengeluaran:</span>
                <span className="font-medium text-red-800">
                  {formatAmountCurrency(totalCalculation.total_outcome || 0, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t pt-1">
                <span className="font-medium">Net:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {formatAmountCurrency(totalCalculation.total_net || 0, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                  </span>
                  {renderNetAmountBadge(totalCalculation.total_net || 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning jika tidak bisa menghitung total */}
        {!totalCalculation.can_calculate && (
          <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Tidak dapat menghitung total karena ada mata uang yang belum memiliki kurs
              </span>
            </div>
          </div>
        )}

        {/* Breakdown per Currency */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Per Mata Uang</h4>
          {groupedByCurrency.map((group) => (
            <div key={group.currency_code} className="p-2 bg-gray-50 rounded border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{group.currency_code}</span>
                {renderNetAmountBadge(group.net_amount)}
              </div>

              {showDetailedBreakdown && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-700">Pemasukan:</span>
                    <span className="text-green-800 font-medium">
                      {formatAmountCurrency(group.income_amount, group.currency_code, group.currency_symbol)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Pengeluaran:</span>
                    <span className="text-red-800 font-medium">
                      {formatAmountCurrency(group.outcome_amount, group.currency_code, group.currency_symbol)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm border-t pt-1 mt-1">
                <span className="font-medium">Net:</span>
                <span className="font-bold">
                  {formatAmountCurrency(group.net_amount, group.currency_code, group.currency_symbol)}
                </span>
              </div>

              {/* Show base currency equivalent if available */}
              {group.has_exchange_rate && group.net_amount_in_base_currency !== null && group.base_currency_code && group.currency_code !== group.base_currency_code && (
                <div className="text-xs text-muted-foreground mt-1">
                  ≈ {formatAmountCurrency(group.net_amount_in_base_currency, group.base_currency_code, group.base_currency_symbol)}
                </div>
              )}

              {/* Warning for missing exchange rate */}
              {!group.has_exchange_rate && group.currency_code !== group.base_currency_code && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Kurs belum tersedia</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtSummaryCard;
