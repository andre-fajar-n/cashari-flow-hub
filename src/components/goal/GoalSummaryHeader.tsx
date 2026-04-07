import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, TrendingUp, TrendingDown, Wallet, Target, Percent, DollarSign, CheckCircle2 } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import AmountText from "@/components/ui/amount-text";
import { GoalDetailSummary } from "@/hooks/queries/use-goal-detail-summary";
import { GoalModel } from "@/models/goals";
import { formatPercentage } from "@/lib/number";
import { cn } from "@/lib/utils/cn";

interface GoalSummaryHeaderProps {
  goal: GoalModel;
  summary: GoalDetailSummary;
  currencySymbol: string;
}

const MetricCard = ({
  title,
  tooltip,
  value,
  icon: Icon,
  isProfit,
  currencyCode,
  currencySymbol,
  iconBg,
  iconColor,
  cardBg,
  cardBorder,
}: {
  title: string;
  tooltip: string;
  value: number;
  icon: React.ElementType;
  isProfit?: boolean;
  currencyCode: string;
  currencySymbol: string;
  iconBg?: string;
  iconColor?: string;
  cardBg?: string;
  cardBorder?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-3 p-4 rounded-xl border shadow-none transition-colors", cardBg, cardBorder)}>
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help shrink-0 mt-0.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
        {isProfit !== undefined ? (
          <AmountText
            amount={value}
            showSign={true}
            className="text-lg font-bold leading-tight tabular-nums"
          >
            {formatAmountCurrency(Math.abs(value), currencyCode, currencySymbol)}
          </AmountText>
        ) : (
          <p className="text-lg font-bold leading-tight tabular-nums">
            {formatAmountCurrency(value, currencyCode, currencySymbol)}
          </p>
        )}
      </div>
    </div>
  );
};

const RoiCard = ({
  title,
  tooltip,
  value,
}: {
  title: string;
  tooltip: string;
  value: number | null;
}) => {
  const isPositive = (value || 0) >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const roiColor = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const roiIconBg = isPositive ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-rose-100 dark:bg-rose-900/50";
  const roiIconColor = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const roiBg = isPositive ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-rose-50/50 dark:bg-rose-950/20";
  const roiBorder = isPositive ? "border-emerald-100 dark:border-emerald-900/50" : "border-rose-100 dark:border-rose-900/50";

  return (
    <div className={cn("flex flex-col gap-3 p-4 rounded-xl border shadow-none", roiBg, roiBorder)}>
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", roiIconBg)}>
          <Percent className={cn("w-4 h-4", roiIconColor)} />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help shrink-0 mt-0.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
        <div className="flex items-center gap-1.5">
          <Icon className={cn("w-4 h-4", roiIconColor)} />
          <span className={cn("text-lg font-bold leading-tight tabular-nums", roiColor)}>
            {value !== null ? `${value >= 0 ? '+' : ''}${formatPercentage(value)}%` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProgressSection = ({
  goal,
  currentValue,
  currencyCode,
  currencySymbol,
}: {
  goal: GoalModel;
  currentValue: number;
  currencyCode: string;
  currencySymbol: string;
}) => {
  const targetAmount = goal.target_amount || 0;
  const progressPercentage = targetAmount > 0
    ? Math.min(Math.round((currentValue / targetAmount) * 100), 100)
    : 0;
  const isAchieved = currentValue >= targetAmount && targetAmount > 0;

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-xl border",
      isAchieved
        ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50"
        : "bg-muted/20 border-border"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAchieved
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            : <Target className="w-4 h-4 text-muted-foreground" />
          }
          <span className={cn("text-sm font-semibold", isAchieved ? "text-emerald-700 dark:text-emerald-400" : "")}>
            Pencapaian Target
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-bold",
              isAchieved
                ? "bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:border-emerald-700 dark:text-emerald-300"
                : "bg-background"
            )}
          >
            {progressPercentage}%
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">Persentase nilai saat ini terhadap target goal yang telah ditentukan.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">{formatAmountCurrency(currentValue, currencyCode, currencySymbol)}</span>
          <span className="tabular-nums">dari {formatAmountCurrency(targetAmount, currencyCode, currencySymbol)}</span>
        </div>
        <Progress
          value={progressPercentage}
          className={cn("h-2.5", isAchieved ? "[&>div]:bg-emerald-500" : "")}
        />
        {isAchieved && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Target telah tercapai!
          </p>
        )}
      </div>
    </div>
  );
};

const GoalSummaryHeader = ({ goal, summary, currencySymbol }: GoalSummaryHeaderProps) => {
  const profitPositive = summary.totalProfit >= 0;

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4" />
            Ringkasan Goal
          </CardTitle>
          <Badge
            variant="outline"
            className={goal.is_active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-muted/50 text-muted-foreground border-border"
            }
          >
            {goal.is_active ? 'Aktif' : 'Tidak Aktif'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <ProgressSection
          goal={goal}
          currentValue={summary.currentValue}
          currencyCode={goal.currency_code}
          currencySymbol={currencySymbol}
        />

        {/* 4 Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Total Modal"
            tooltip="Total dana yang pernah dimasukkan ke goal ini. Mencakup semua investasi dari berbagai wallet dan mata uang."
            value={summary.totalInvestedCapital}
            icon={Wallet}
            iconBg="bg-blue-100 dark:bg-blue-900/50"
            iconColor="text-blue-600 dark:text-blue-400"
            cardBg="bg-blue-50/40 dark:bg-blue-950/20"
            cardBorder="border-blue-100 dark:border-blue-900/50"
            currencyCode={goal.currency_code}
            currencySymbol={currencySymbol}
          />
          <MetricCard
            title="Nilai Saat Ini"
            tooltip="Nilai goal berdasarkan kondisi terbaru. Untuk aset yang memiliki harga pasar, nilai dihitung dari harga terkini."
            value={summary.currentValue}
            icon={DollarSign}
            iconBg="bg-violet-100 dark:bg-violet-900/50"
            iconColor="text-violet-600 dark:text-violet-400"
            cardBg="bg-violet-50/40 dark:bg-violet-950/20"
            cardBorder="border-violet-100 dark:border-violet-900/50"
            currencyCode={goal.currency_code}
            currencySymbol={currencySymbol}
          />
          <MetricCard
            title="Total Keuntungan"
            tooltip="Akumulasi keuntungan yang sudah terealisasi (dicairkan) dan belum terealisasi (masih di atas kertas)."
            value={summary.totalProfit}
            icon={profitPositive ? TrendingUp : TrendingDown}
            isProfit={true}
            iconBg={profitPositive ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-rose-100 dark:bg-rose-900/50"}
            iconColor={profitPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}
            cardBg={profitPositive ? "bg-emerald-50/40 dark:bg-emerald-950/20" : "bg-rose-50/40 dark:bg-rose-950/20"}
            cardBorder={profitPositive ? "border-emerald-100 dark:border-emerald-900/50" : "border-rose-100 dark:border-rose-900/50"}
            currencyCode={goal.currency_code}
            currencySymbol={currencySymbol}
          />
          <RoiCard
            title="ROI"
            tooltip="Return on Investment - Persentase total keuntungan dibandingkan total modal yang diinvestasikan."
            value={summary.roi}
          />
        </div>

        {/* Helper text */}
        <p className="text-[11px] text-muted-foreground text-center pt-2 border-t">
          Semua nilai ditampilkan dalam {goal.currency_code}. Detail per wallet dan mata uang dapat dilihat di bagian Rincian Goal.
        </p>
      </CardContent>
    </Card>
  );
};

export default GoalSummaryHeader;
