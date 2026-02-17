import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, TrendingUp, TrendingDown, Wallet, Target, Percent, DollarSign } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import AmountText from "@/components/ui/amount-text";
import { GoalDetailSummary } from "@/hooks/queries/use-goal-detail-summary";
import { GoalModel } from "@/models/goals";

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
}: {
  title: string;
  tooltip: string;
  value: number;
  icon: React.ElementType;
  isProfit?: boolean;
  currencyCode: string;
  currencySymbol: string;
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-1">
        {isProfit !== undefined ? (
          <AmountText
            amount={value}
            showSign={true}
            className="text-xl font-bold"
          >
            {formatAmountCurrency(Math.abs(value), currencyCode, currencySymbol)}
          </AmountText>
        ) : (
          <p className="text-xl font-bold">
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

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {value !== null ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : 'N/A'}
        </span>
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
    <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Pencapaian Target</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">
                Persentase nilai saat ini terhadap target goal yang telah ditentukan.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatAmountCurrency(currentValue, currencyCode, currencySymbol)} dari {formatAmountCurrency(targetAmount, currencyCode, currencySymbol)}
          </span>
          <Badge variant={isAchieved ? "default" : "secondary"} className="ml-2">
            {progressPercentage}%
          </Badge>
        </div>
        <Progress
          value={progressPercentage}
          className="h-3"
        />
        {isAchieved && (
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Target telah tercapai!
          </p>
        )}
      </div>
    </div>
  );
};

const GoalSummaryHeader = ({ goal, summary, currencySymbol }: GoalSummaryHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Ringkasan Goal
          </CardTitle>
          <Badge variant={goal.is_active ? "default" : "secondary"}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Modal"
            tooltip="Total dana yang pernah dimasukkan ke goal ini. Mencakup semua investasi dari berbagai wallet dan mata uang."
            value={summary.totalInvestedCapital}
            icon={Wallet}
            currencyCode={goal.currency_code}
            currencySymbol={currencySymbol}
          />
          <MetricCard
            title="Nilai Saat Ini"
            tooltip="Nilai goal berdasarkan kondisi terbaru. Untuk aset yang memiliki harga pasar, nilai dihitung dari harga terkini."
            value={summary.currentValue}
            icon={DollarSign}
            currencyCode={goal.currency_code}
            currencySymbol={currencySymbol}
          />
          <MetricCard
            title="Total Keuntungan"
            tooltip="Akumulasi keuntungan yang sudah terealisasi (dicairkan) dan belum terealisasi (masih di atas kertas)."
            value={summary.totalProfit}
            icon={summary.totalProfit >= 0 ? TrendingUp : TrendingDown}
            isProfit={true}
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
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Semua nilai ditampilkan dalam {goal.currency_code}. Detail per wallet dan mata uang dapat dilihat di bagian Rincian Goal.
        </p>
      </CardContent>
    </Card>
  );
};

export default GoalSummaryHeader;