import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Calculator } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { DebtSummaryModel } from "@/models/debt-summary";
import { groupDebtSummaryByCurrency, calculateTotalInBaseCurrency, getDebtStatusBadge } from "@/lib/debt-summary";
import AmountText from "@/components/ui/amount-text";

interface DebtSummaryCardProps {
  summaryData: DebtSummaryModel[];
  title?: string;
  debtType?: 'loan' | 'borrowed';
}

const DebtSummaryCard = ({
  summaryData,
  title = "Ringkasan Hutang/Piutang",
  debtType = 'loan'
}: DebtSummaryCardProps) => {
  const groupedByCurrency = useMemo(() => groupDebtSummaryByCurrency(summaryData), [summaryData]);
  const totalCalculation = useMemo(() => calculateTotalInBaseCurrency(summaryData), [summaryData]);

  // Labels based on debt type
  const labels = useMemo(() => {
    if (debtType === 'loan') {
      return {
        income: 'Hutang Diterima',
        outcome: 'Pembayaran Hutang',
        net: 'Sisa Hutang'
      };
    } else {
      return {
        income: 'Pengembalian Diterima',
        outcome: 'Uang Dipinjamkan',
        net: 'Sisa Piutang'
      };
    }
  }, [debtType]);

  if (!summaryData || summaryData.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/20 shrink-0">
              <Calculator className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">{title}</span>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Belum ada data hutang/piutang</p>
        </CardContent>
      </Card>
    );
  }


  const renderNetAmountBadge = (netAmount: number) => {
    const badgeInfo = getDebtStatusBadge(netAmount, debtType);
    const IconComponent = badgeInfo.icon === 'up' ? TrendingUp : badgeInfo.icon === 'down' ? TrendingDown : Minus;

    return (
      <Badge variant={badgeInfo.variant} className={badgeInfo.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {badgeInfo.text}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/20 shrink-0">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        {/* Currency breakdown table */}
        {groupedByCurrency.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Rincian per Mata Uang</h4>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th rowSpan={2} className="px-3 py-2 text-left font-semibold border-r text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center font-semibold border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                      {labels.income}
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center font-semibold border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                      {labels.outcome}
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
                      Saldo/Net
                    </th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold border-r text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang Asli
                    </th>
                    <th className="px-3 py-2 text-center font-semibold border-r text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang Dasar
                    </th>
                    <th className="px-3 py-2 text-center font-semibold border-r text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang Asli
                    </th>
                    <th className="px-3 py-2 text-center font-semibold border-r text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang Dasar
                    </th>
                    <th className="px-3 py-2 text-center font-semibold border-r text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang Asli
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang Dasar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupedByCurrency.map((group, index) => (
                    <tr key={group.currency_code} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="px-3 py-2 font-medium border-r">
                        {group.currency_code}
                      </td>
                      {/* Income - Original Currency */}
                      <td className="px-3 py-2 text-center border-r">
                        <AmountText amount={group.income_amount} className="font-medium">
                          {formatAmountCurrency(group.income_amount, group.currency_code, group.currency_symbol)}
                        </AmountText>
                      </td>
                      {/* Income - Base Currency */}
                      <td className="px-3 py-2 text-center border-r">
                        {group.has_exchange_rate && group.income_amount_in_base_currency !== null ? (
                          <AmountText amount={group.income_amount_in_base_currency} className="font-medium">
                            {formatAmountCurrency(group.income_amount_in_base_currency, group.base_currency_code, group.base_currency_symbol)}
                          </AmountText>
                        ) : group.currency_code === group.base_currency_code ? (
                          <AmountText amount={group.income_amount} className="font-medium">
                            {formatAmountCurrency(group.income_amount, group.currency_code, group.currency_symbol)}
                          </AmountText>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Tidak ada kurs
                          </span>
                        )}
                      </td>
                      {/* Outcome - Original Currency */}
                      <td className="px-3 py-2 text-center border-r">
                        <AmountText amount={group.outcome_amount} className="font-medium">
                          {formatAmountCurrency(group.outcome_amount, group.currency_code, group.currency_symbol)}
                        </AmountText>
                      </td>
                      {/* Outcome - Base Currency */}
                      <td className="px-3 py-2 text-center border-r">
                        {group.has_exchange_rate && group.outcome_amount_in_base_currency !== null ? (
                          <AmountText amount={group.outcome_amount_in_base_currency} className="font-medium">
                            {formatAmountCurrency(group.outcome_amount_in_base_currency, group.base_currency_code, group.base_currency_symbol)}
                          </AmountText>
                        ) : group.currency_code === group.base_currency_code ? (
                          <AmountText amount={group.outcome_amount} className="font-medium">
                            {formatAmountCurrency(group.outcome_amount, group.currency_code, group.currency_symbol)}
                          </AmountText>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Tidak ada kurs
                          </span>
                        )}
                      </td>
                      {/* Net - Original Currency */}
                      <td className="px-3 py-2 text-center border-r">
                        <AmountText amount={group.net_amount} className="font-medium">
                          {formatAmountCurrency(group.net_amount, group.currency_code, group.currency_symbol)}
                        </AmountText>
                      </td>
                      {/* Net - Base Currency */}
                      <td className="px-3 py-2 text-center">
                        {group.has_exchange_rate && group.net_amount_in_base_currency !== null ? (
                          <AmountText amount={group.net_amount_in_base_currency} className="font-medium">
                            {formatAmountCurrency(group.net_amount_in_base_currency, group.base_currency_code, group.base_currency_symbol)}
                          </AmountText>
                        ) : group.currency_code === group.base_currency_code ? (
                          <AmountText amount={group.net_amount} className="font-medium">
                            {formatAmountCurrency(group.net_amount, group.currency_code, group.currency_symbol)}
                          </AmountText>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Tidak ada kurs
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Total row as table footer */}
                {totalCalculation.can_calculate && (
                  <tfoot className="bg-primary/5 border-t-2 border-primary/20">
                    <tr>
                      <td className="px-3 py-3 font-bold border-r text-foreground text-sm" colSpan={1}>
                        Total dalam {totalCalculation.base_currency_code}
                      </td>
                      {/* Income - we skip original currency column, only show base currency */}
                      <td className="px-3 py-3 text-center border-r"></td>
                      <td className="px-3 py-3 text-center border-r">
                        <AmountText amount={totalCalculation.total_income || 0} className="font-bold text-emerald-700">
                          {formatAmountCurrency(totalCalculation.total_income || 0, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                        </AmountText>
                      </td>
                      {/* Outcome */}
                      <td className="px-3 py-3 text-center border-r"></td>
                      <td className="px-3 py-3 text-center border-r">
                        <AmountText amount={totalCalculation.total_outcome || 0} className="font-bold text-rose-700">
                          {formatAmountCurrency(totalCalculation.total_outcome || 0, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                        </AmountText>
                      </td>
                      {/* Net */}
                      <td className="px-3 py-3 text-center border-r"></td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <AmountText amount={totalCalculation.total_net || 0} className="font-bold text-foreground">
                            {formatAmountCurrency(totalCalculation.total_net || 0, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                          </AmountText>
                          {renderNetAmountBadge(totalCalculation.total_net || 0)}
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Warning if cannot calculate */}
            {!totalCalculation.can_calculate && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Total tidak dapat dihitung</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Beberapa transaksi tidak memiliki kurs mata uang yang diperlukan untuk konversi ke mata uang dasar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtSummaryCard;

