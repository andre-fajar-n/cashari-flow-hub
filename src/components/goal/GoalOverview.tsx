
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateGoalProgress } from "@/components/goal/GoalProgressCalculator";
import { formatAmountCurrency } from "@/lib/currency";
import { GoalModel } from "@/models/goals";
import { Database } from "@/integrations/supabase/types";
import AmountText from "@/components/ui/amount-text";

interface GoalOverviewProps {
  goal: GoalModel;
  goalTransfers: Database["public"]["Tables"]["goal_transfers"]["Row"][];
  goalRecords: any[];
}

const GoalOverview = ({ goal, goalTransfers, goalRecords }: GoalOverviewProps) => {
  const progress = calculateGoalProgress(goal.id, goal.target_amount, goalTransfers, goalRecords);

  return (
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
            <AmountText amount={progress.totalAmount} showSign={true} className="text-xl font-semibold">
              {formatAmountCurrency(Math.abs(progress.totalAmount), goal.currency_code)}
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
              {progress.percentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Transfer: {progress.transferAmount.toLocaleString('id-ID')}</span>
            <span>Records: {progress.recordAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalOverview;
