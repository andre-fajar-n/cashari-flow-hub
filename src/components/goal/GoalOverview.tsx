import { GoalModel } from "@/models/goals";
import { CurrencyModel } from "@/models/currencies";
import { useGoalDetailSummary } from "@/hooks/queries/use-goal-detail-summary";
import GoalSummaryHeader from "@/components/goal/GoalSummaryHeader";
import GoalBreakdownSection from "@/components/goal/GoalBreakdownSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface GoalOverviewProps {
  goal: GoalModel;
  currency: CurrencyModel;
}

const GoalOverview = ({ goal, currency }: GoalOverviewProps) => {
  const { data: summary, isLoading } = useGoalDetailSummary(goal.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-4">
      <GoalSummaryHeader
        goal={goal}
        summary={summary}
        currencySymbol={currency.symbol}
      />
      <GoalBreakdownSection
        items={summary.items}
        baseCurrencyCode={summary.baseCurrencyCode || goal.currency_code}
      />
    </div>
  );
};

export default GoalOverview;
