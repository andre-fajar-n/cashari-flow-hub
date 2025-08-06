import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatAmountCurrency } from "@/lib/currency";
import { GoalModel } from "@/models/goals";
import AmountText from "@/components/ui/amount-text";
import GoalFundsSummary from "@/components/goal/GoalFundsSummary";

interface GoalOverviewProps {
  goal: GoalModel;
  totalAmount: number;
  percentage: number;
  totalAmountRecord: number;
  totalAmountTransfer: number;
}

const GoalOverview = ({ goal, totalAmount, percentage, totalAmountRecord, totalAmountTransfer }: GoalOverviewProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ringkasan Goal</span>
            <Badge variant={goal.is_achieved ? "default" : goal.is_active ? "secondary" : "outline"}>
              {goal.is_achieved ? 'Tercapai' : goal.is_active ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Target Amount</p>
              <p className="text-xl font-semibold">{goal.target_amount.toLocaleString('id-ID')} {goal.currency_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress Amount</p>
              <AmountText amount={totalAmount} showSign={true} className="text-xl font-semibold">
                {formatAmountCurrency(Math.abs(totalAmount), goal.currency_code)}
              </AmountText>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Date</p>
              <p className="text-xl font-semibold">
                {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Tidak ada'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={percentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Transfer: {totalAmountTransfer.toLocaleString('id-ID')}</span>
              <span>Records: {totalAmountRecord.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <GoalFundsSummary goalId={goal.id} />
    </div>
  );
};

export default GoalOverview;
