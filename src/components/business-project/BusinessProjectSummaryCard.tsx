import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calculator, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada transaksi dalam proyek ini</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Currency breakdown table */}
        {groupedByCurrency.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Rincian per Mata Uang</h4>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th rowSpan={2} className="px-3 py-2 text-left font-medium border-r">
                      Mata Uang
                    </th>
                    <th colSpan={3} className="px-3 py-2 text-center font-medium">
                      Nilai dalam Mata Uang Asli
                    </th>
                    <th colSpan={3} className="px-3 py-2 text-center font-medium border-l">
                      Nilai dalam Mata Uang Dasar
                    </th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 text-center font-medium text-green-700">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowUpCircle className="w-3 h-3" /> Pemasukan
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-red-700">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowDownCircle className="w-3 h-3" /> Pengeluaran
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Net
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-green-700 border-l">
                      Pemasukan
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-red-700">
                      Pengeluaran
                    </th>
                    <th className="px-3 py-2 text-center font-medium">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupedByCurrency.map((group, index) => (
                    <tr key={group.currency_code} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="px-3 py-2 font-medium border-r">
                        {group.currency_code}
                      </td>
                      <td className="px-3 py-2 text-center text-green-700">
                        {formatAmountCurrency(group.income_amount, group.currency_code, group.currency_symbol)}
                      </td>
                      <td className="px-3 py-2 text-center text-red-700">
                        {formatAmountCurrency(group.expense_amount, group.currency_code, group.currency_symbol)}
                      </td>
                      <td className="px-3 py-2 text-center font-medium">
                        <span className={group.net_amount >= 0 ? "text-green-700" : "text-red-700"}>
                          {group.net_amount >= 0 ? "+" : ""}{formatAmountCurrency(group.net_amount, group.currency_code, group.currency_symbol)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center border-l">
                        {group.has_exchange_rate || group.currency_code === group.base_currency_code ? (
                          <span className="text-green-700">
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
                      <td className="px-3 py-2 text-center">
                        {group.has_exchange_rate || group.currency_code === group.base_currency_code ? (
                          <span className="text-red-700">
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
                      <td className="px-3 py-2 text-center font-medium">
                        {group.has_exchange_rate || group.currency_code === group.base_currency_code ? (
                          <span className={
                            (group.currency_code === group.base_currency_code ? group.net_amount : group.net_amount_in_base_currency || 0) >= 0
                              ? "text-green-700"
                              : "text-red-700"
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
                  <tfoot className="bg-primary/10 border-t-2 border-primary/20">
                    <tr>
                      <td className="px-3 py-3 font-bold border-r">
                        Total ({totalCalculation.base_currency_code})
                      </td>
                      <td colSpan={3} className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-center font-bold text-green-700 border-l">
                        {formatAmountCurrency(totalCalculation.total_income, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-red-700">
                        {formatAmountCurrency(totalCalculation.total_expense, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-lg font-bold ${totalCalculation.total_net >= 0 ? "text-green-700" : "text-red-700"}`}>
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
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-l-yellow-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Tidak dapat menghitung total dalam mata uang dasar
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Beberapa transaksi tidak memiliki kurs mata uang yang diperlukan untuk konversi.
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
