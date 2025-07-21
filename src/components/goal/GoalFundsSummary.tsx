import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, PieChart } from "lucide-react";
import { useGoalFundsSummary } from "@/hooks/queries/use-goal-funds-summary";
import { formatAmountCurrency } from "@/lib/utils";
import { AmountText } from "@/components/ui/amount-text";

interface GoalFundsSummaryProps {
  goalId: number;
}

const GoalFundsSummary = ({ goalId }: GoalFundsSummaryProps) => {
  const { data: fundsSummary, isLoading } = useGoalFundsSummary(goalId);

  fundsSummary?.sort((a, b) => b.total_amount - a.total_amount);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Ringkasan Dana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Memuat ringkasan dana...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Ringkasan Dana
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!fundsSummary || fundsSummary.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada dana dalam goal ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fundsSummary.map((fund, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {fund.instrument_name ? (
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Wallet className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {fund.instrument_name || 'Cash/Wallet'}
                    </p>
                    {fund.asset_name && (
                      <p className="text-sm text-muted-foreground">
                        {fund.asset_name} {fund.asset_symbol && `(${fund.asset_symbol})`}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {fund.currency_code}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <AmountText
                    amount={fund.total_amount}
                    className="font-semibold"
                  >
                    {formatAmountCurrency(fund.total_amount, fund.currency_code)}
                  </AmountText>
                  <p>
                    <span className="text-sm text-muted-foreground">
                      {fund.total_amount_unit.toLocaleString("id-ID")} {fund.unit_label || 'unit'}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalFundsSummary;
