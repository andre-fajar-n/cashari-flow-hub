import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calculator } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { groupBudgetSummaryByCurrency, calculateTotalSpentInBaseCurrency } from "@/lib/budget-summary";
import { BudgetSummary } from "@/models/budgets";

interface BudgetSummaryCardProps {
  summaryData: BudgetSummary[];
  title?: string;
}

const BudgetSummaryCard = ({ summaryData, title = "Ringkasan Pengeluaran Budget" }: BudgetSummaryCardProps) => {
  const groupedByCurrency = useMemo(() => groupBudgetSummaryByCurrency(summaryData), [summaryData]);
  const totalCalculation = useMemo(() => calculateTotalSpentInBaseCurrency(summaryData), [summaryData]);

  if (!summaryData || summaryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada transaksi dalam budget ini</p>
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
            <h4 className="text-sm font-medium text-gray-700">Rincian per Mata Uang</h4>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th rowSpan={2} className="px-3 py-2 text-left font-medium text-gray-700 border-r">
                      Mata Uang
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center font-medium text-gray-700">
                      Total Terpakai
                    </th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 text-center font-medium text-gray-600 border-r">
                      Mata Uang Asli
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600">
                      Mata Uang Dasar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedByCurrency.map((group, index) => (
                    <tr key={group.currency_code} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 font-medium border-r">
                        {group.currency_code}
                      </td>
                      <td className="px-3 py-2 text-center border-r">
                        <span className="font-medium text-red-600">
                          {formatAmountCurrency(group.total_spent, group.currency_code, group.currency_symbol)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {group.has_exchange_rate && group.total_spent_in_base_currency !== null ? (
                          <span className="font-medium text-red-600">
                            {formatAmountCurrency(group.total_spent_in_base_currency, group.base_currency_code, group.base_currency_symbol)}
                          </span>
                        ) : group.currency_code === group.base_currency_code ? (
                          <span className="font-medium text-red-600">
                            {formatAmountCurrency(group.total_spent, group.currency_code, group.currency_symbol)}
                          </span>
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
                  <tfoot className="bg-red-50 border-t-2 border-red-200">
                    <tr>
                      <td className="px-3 py-3 font-bold text-red-900 border-r">
                        Total dalam {totalCalculation.base_currency_code}
                      </td>
                      <td className="px-3 py-3 text-center border-r"></td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-lg font-bold text-red-800">
                          {formatAmountCurrency(totalCalculation.total_spent || 0, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Warning if cannot calculate */}
            {!totalCalculation.can_calculate && (
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-l-yellow-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Tidak dapat menghitung total dalam mata uang dasar
                    </p>
                    <p className="text-xs text-yellow-700">
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

export default BudgetSummaryCard;
