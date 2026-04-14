import { useMemo } from "react";
import { DebtModel } from "@/models/debts";
import { DebtSummaryModel } from "@/models/debt-summary";
import { UserSettingsModel } from "@/models/user-settings";
import { calculateTotalInBaseCurrency } from "@/lib/debt-summary";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { Landmark, AlertTriangle, CalendarClock, HelpCircle, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DEBT_TYPES } from "@/constants/enums";

interface DebtOverviewSectionProps {
  debts: DebtModel[];
  debtSummary: DebtSummaryModel[];
  userSettings: UserSettingsModel;
}

export const DebtOverviewSection = ({ debts, debtSummary, userSettings }: DebtOverviewSectionProps) => {
  const activeDebts = debts.filter((d) => d.status === "active");
  const loanDebts = activeDebts.filter((d) => d.type === DEBT_TYPES.LOAN);
  const borrowedDebts = activeDebts.filter((d) => d.type === DEBT_TYPES.BORROWED);

  // Total hutang (loans we owe) in base currency
  const loanSummaries = debtSummary.filter((s) =>
    loanDebts.some((d) => d.id === s.debt_id)
  );
  const totalLoan = useMemo(() => calculateTotalInBaseCurrency(loanSummaries), [loanSummaries]);

  // Total piutang (money owed to us)
  const borrowedSummaries = debtSummary.filter((s) =>
    borrowedDebts.some((d) => d.id === s.debt_id)
  );
  const totalBorrowed = useMemo(() => calculateTotalInBaseCurrency(borrowedSummaries), [borrowedSummaries]);

  // Nearest due date among active debts
  const nearestDueDate = useMemo(() => {
    const today = new Date();
    const upcoming = activeDebts
      .filter((d) => d.due_date)
      .map((d) => ({ debt: d, date: new Date(d.due_date!) }))
      .filter(({ date }) => date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] ?? null;
  }, [activeDebts]);

  const daysUntilDue = nearestDueDate
    ? Math.ceil((nearestDueDate.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const baseCurrency = userSettings?.currencies;

  const renderAmount = (
    total: ReturnType<typeof calculateTotalInBaseCurrency>,
    netField: "total_net" | "total_income" | "total_outcome"
  ) => {
    if (!total.can_calculate) {
      return (
        <div className="flex items-center gap-1 text-amber-600 text-sm">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Kurs tidak tersedia</span>
        </div>
      );
    }
    const amount = Math.abs(total[netField] ?? 0);
    return (
      <p className="text-xl font-bold tabular-nums">
        {formatAmountCurrency(amount, baseCurrency?.code, baseCurrency?.symbol)}
      </p>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Hutang */}
      <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/60 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-500/10 shrink-0">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Hutang
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">Jumlah seluruh hutang aktif yang belum dilunasi, dikonversi ke mata uang dasar.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="text-rose-700">
          {loanDebts.length > 0
            ? renderAmount(totalLoan, "total_net")
            : <p className="text-sm text-muted-foreground">Tidak ada hutang aktif</p>
          }
        </div>
        <p className="text-xs text-muted-foreground">{loanDebts.length} hutang aktif</p>
      </div>

      {/* Total Piutang */}
      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/60 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 shrink-0">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Piutang
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">Jumlah seluruh piutang aktif (uang yang dipinjamkan dan belum dikembalikan).</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="text-emerald-700">
          {borrowedDebts.length > 0
            ? renderAmount(totalBorrowed, "total_net")
            : <p className="text-sm text-muted-foreground">Tidak ada piutang aktif</p>
          }
        </div>
        <p className="text-xs text-muted-foreground">{borrowedDebts.length} piutang aktif</p>
      </div>

      {/* Jatuh Tempo Terdekat */}
      <div className={`p-4 rounded-xl border space-y-2 ${
        daysUntilDue !== null && daysUntilDue <= 7
          ? "border-amber-200 bg-amber-50/60"
          : "border-border bg-muted/20"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md shrink-0 ${
            daysUntilDue !== null && daysUntilDue <= 7 ? "bg-amber-500/10" : "bg-muted"
          }`}>
            <CalendarClock className={`w-3.5 h-3.5 ${
              daysUntilDue !== null && daysUntilDue <= 7 ? "text-amber-600" : "text-muted-foreground"
            }`} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Jatuh Tempo Terdekat
          </span>
        </div>
        {nearestDueDate ? (
          <>
            <p className={`text-base font-bold ${
              daysUntilDue !== null && daysUntilDue <= 7 ? "text-amber-700" : "text-foreground"
            }`}>
              {formatDate(nearestDueDate.debt.due_date!)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {nearestDueDate.debt.name}
              {daysUntilDue !== null && (
                <span className={`ml-1 font-medium ${daysUntilDue <= 7 ? "text-amber-600" : ""}`}>
                  ({daysUntilDue} hari lagi)
                </span>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Tidak ada jatuh tempo</p>
        )}
      </div>

      {/* DTI */}
      <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted shrink-0">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Rasio Utang/Pendapatan
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">Rasio utang/pendapatan (DTI) dihitung dari total kewajiban bulanan dibagi rata-rata pemasukan 30 hari terakhir. Memerlukan konfigurasi cicilan bulanan per hutang.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xl font-bold text-muted-foreground">—</p>
        <p className="text-xs text-muted-foreground">Belum tersedia</p>
      </div>
    </div>
  );
};
