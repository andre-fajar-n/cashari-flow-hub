import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Calculator, ArrowUpCircle, ArrowDownCircle, TrendingUp, Info } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { BusinessProjectSummaryModel } from "@/models/business-projects";

interface CurrencyGroup {
  currency_code: string;
  currency_symbol: string;
  base_currency_code: string;
  base_currency_symbol: string;
  income_amount: number;
  expense_amount: number;
  net_amount: number;
  income_amount_in_base_currency: number | null;
  expense_amount_in_base_currency: number | null;
  net_amount_in_base_currency: number | null;
  has_exchange_rate: boolean;
}

interface TotalCalculation {
  total_income: number;
  total_expense: number;
  total_net: number;
  base_currency_code: string | null;
  base_currency_symbol: string | null;
  can_calculate: boolean;
}

export const groupProjectSummaryByCurrency = (data: BusinessProjectSummaryModel[]): CurrencyGroup[] => {
  const groups: Record<string, CurrencyGroup> = {};

  data.forEach((item) => {
    const currencyCode = item.currency_code || "UNKNOWN";

    if (!groups[currencyCode]) {
      groups[currencyCode] = {
        currency_code: currencyCode,
        currency_symbol: item.currency_symbol || "",
        base_currency_code: item.base_currency_code || "",
        base_currency_symbol: item.base_currency_symbol || "",
        income_amount: 0,
        expense_amount: 0,
        net_amount: 0,
        income_amount_in_base_currency: 0,
        expense_amount_in_base_currency: 0,
        net_amount_in_base_currency: 0,
        has_exchange_rate: true,
      };
    }

    groups[currencyCode].income_amount += Number(item.income_amount) || 0;
    groups[currencyCode].expense_amount += Number(item.expense_amount) || 0;
    groups[currencyCode].net_amount += Number(item.net_amount) || 0;

    if (item.income_amount_in_base_currency !== null) {
      groups[currencyCode].income_amount_in_base_currency! += Number(item.income_amount_in_base_currency);
    } else if (currencyCode !== item.base_currency_code) {
      groups[currencyCode].has_exchange_rate = false;
    }

    if (item.expense_amount_in_base_currency !== null) {
      groups[currencyCode].expense_amount_in_base_currency! += Number(item.expense_amount_in_base_currency);
    } else if (currencyCode !== item.base_currency_code) {
      groups[currencyCode].has_exchange_rate = false;
    }

    if (item.net_amount_in_base_currency !== null) {
      groups[currencyCode].net_amount_in_base_currency! += Number(item.net_amount_in_base_currency);
    } else if (currencyCode !== item.base_currency_code) {
      groups[currencyCode].has_exchange_rate = false;
    }
  });

  return Object.values(groups);
};

export const calculateProjectTotalInBaseCurrency = (data: BusinessProjectSummaryModel[]): TotalCalculation => {
  if (!data || data.length === 0) {
    return { total_income: 0, total_expense: 0, total_net: 0, base_currency_code: null, base_currency_symbol: null, can_calculate: true };
  }

  const baseCurrencyCode = data[0]?.base_currency_code || null;
  const baseCurrencySymbol = data[0]?.base_currency_symbol || null;

  let totalIncome = 0;
  let totalExpense = 0;
  let totalNet = 0;
  let canCalculate = true;

  data.forEach((item) => {
    const currencyCode = item.currency_code;
    const isSameCurrency = currencyCode === baseCurrencyCode;

    if (isSameCurrency) {
      totalIncome += Number(item.income_amount) || 0;
      totalExpense += Number(item.expense_amount) || 0;
      totalNet += Number(item.net_amount) || 0;
    } else if (item.income_amount_in_base_currency !== null) {
      totalIncome += Number(item.income_amount_in_base_currency);
      totalExpense += Number(item.expense_amount_in_base_currency) || 0;
      totalNet += Number(item.net_amount_in_base_currency) || 0;
    } else {
      canCalculate = false;
    }
  });

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    total_net: totalNet,
    base_currency_code: baseCurrencyCode,
    base_currency_symbol: baseCurrencySymbol,
    can_calculate: canCalculate,
  };
};

interface BusinessProjectSummaryCardProps {
  summaryData: BusinessProjectSummaryModel[];
  title?: string;
}

const BusinessProjectSummaryCard = ({ summaryData, title = "Ringkasan Proyek Bisnis" }: BusinessProjectSummaryCardProps) => {
  const groupedByCurrency = useMemo(() => groupProjectSummaryByCurrency(summaryData), [summaryData]);
  const totalCalculation = useMemo(() => calculateProjectTotalInBaseCurrency(summaryData), [summaryData]);

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
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Belum ada transaksi dalam proyek ini</p>
        </CardContent>
      </Card>
    );
  }

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
            <h4 className="text-sm font-medium text-muted-foreground">Rincian per Mata Uang</h4>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th rowSpan={2} className="px-3 py-2 text-left font-semibold border-r text-[11px] uppercase tracking-wide text-muted-foreground">
                      Mata Uang
                    </th>
                    <th colSpan={3} className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                      Nilai dalam Mata Uang Asli
                    </th>
                    <th colSpan={3} className="px-3 py-2 text-center font-semibold border-l text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                      Nilai dalam Mata Uang Dasar
                    </th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold text-emerald-700 text-[11px] uppercase tracking-wide">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowUpCircle className="w-3 h-3" /> Pemasukan
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-rose-700 text-[11px] uppercase tracking-wide">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowDownCircle className="w-3 h-3" /> Pengeluaran
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Net
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-emerald-700 border-l text-[11px] uppercase tracking-wide">
                      Pemasukan
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-rose-700 text-[11px] uppercase tracking-wide">
                      Pengeluaran
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupedByCurrency.map((group, index) => (
                    <tr key={group.currency_code} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="px-3 py-2 font-semibold border-r text-sm">
                        {group.currency_code}
                      </td>
                      <td className="px-3 py-2 text-center text-emerald-700 tabular-nums">
                        {formatAmountCurrency(group.income_amount, group.currency_code, group.currency_symbol)}
                      </td>
                      <td className="px-3 py-2 text-center text-rose-700 tabular-nums">
                        {formatAmountCurrency(group.expense_amount, group.currency_code, group.currency_symbol)}
                      </td>
                      <td className="px-3 py-2 text-center font-medium tabular-nums">
                        <span className={group.net_amount >= 0 ? "text-emerald-700" : "text-rose-700"}>
                          {group.net_amount >= 0 ? "+" : ""}{formatAmountCurrency(group.net_amount, group.currency_code, group.currency_symbol)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center border-l tabular-nums">
                        {group.has_exchange_rate || group.currency_code === group.base_currency_code ? (
                          <span className="text-emerald-700">
                            {formatAmountCurrency(
                              group.currency_code === group.base_currency_code ? group.income_amount : group.income_amount_in_base_currency || 0,
                              group.base_currency_code,
                              group.base_currency_symbol
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums">
                        {group.has_exchange_rate || group.currency_code === group.base_currency_code ? (
                          <span className="text-rose-700">
                            {formatAmountCurrency(
                              group.currency_code === group.base_currency_code ? group.expense_amount : group.expense_amount_in_base_currency || 0,
                              group.base_currency_code,
                              group.base_currency_symbol
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-medium tabular-nums">
                        {group.has_exchange_rate || group.currency_code === group.base_currency_code ? (
                          <span className={
                            (group.currency_code === group.base_currency_code ? group.net_amount : group.net_amount_in_base_currency || 0) >= 0
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }>
                            {(group.currency_code === group.base_currency_code ? group.net_amount : group.net_amount_in_base_currency || 0) >= 0 ? "+" : ""}
                            {formatAmountCurrency(
                              group.currency_code === group.base_currency_code ? group.net_amount : group.net_amount_in_base_currency || 0,
                              group.base_currency_code,
                              group.base_currency_symbol
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Total row as table footer */}
                {totalCalculation.can_calculate && (
                  <tfoot className="bg-primary/5 border-t-2 border-primary/20">
                    <tr>
                      <td className="px-3 py-3 font-bold border-r text-foreground text-sm">
                        Total ({totalCalculation.base_currency_code})
                      </td>
                      <td colSpan={3} className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-center font-bold text-emerald-700 border-l tabular-nums">
                        {formatAmountCurrency(totalCalculation.total_income, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-rose-700 tabular-nums">
                        {formatAmountCurrency(totalCalculation.total_expense, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums">
                        <span className={`text-lg font-bold ${totalCalculation.total_net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {totalCalculation.total_net >= 0 ? "+" : ""}{formatAmountCurrency(totalCalculation.total_net, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                        </span>
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
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
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

export default BusinessProjectSummaryCard;
