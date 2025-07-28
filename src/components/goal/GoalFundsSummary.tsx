
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, PieChart, ChevronDown, ChevronUp } from "lucide-react";
import { useGoalFundsSummary } from "@/hooks/queries/use-goal-funds-summary";
import { formatAmountCurrency } from "@/lib/utils";
import { AmountText } from "@/components/ui/amount-text";

interface GoalFundsSummaryProps {
  goalId: number;
}

const GoalFundsSummary = ({ goalId }: GoalFundsSummaryProps) => {
  const { data: fundsSummary, isLoading } = useGoalFundsSummary(goalId);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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

  if (!fundsSummary || fundsSummary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Ringkasan Dana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada dana dalam goal ini</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group funds by instrument
  const groupedFunds = fundsSummary.reduce((groups, fund) => {
    const instrumentKey = fund.instrument_name || 'Cash & Wallet';
    if (!groups[instrumentKey]) {
      groups[instrumentKey] = [];
    }
    groups[instrumentKey].push(fund);
    return groups;
  }, {} as Record<string, any[]>);

  // Calculate totals for each group
  const groupTotals = Object.keys(groupedFunds).reduce((totals, instrumentKey) => {
    totals[instrumentKey] = groupedFunds[instrumentKey].reduce((sum, fund) => sum + fund.total_amount, 0);
    return totals;
  }, {} as Record<string, number>);

  // Sort groups by total amount (descending)
  const sortedGroupKeys = Object.keys(groupedFunds).sort((a, b) => groupTotals[b] - groupTotals[a]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const isGroupExpanded = (groupName: string) => expandedGroups.includes(groupName);

  const renderFundGroup = (funds: any[], groupName: string, groupTotal: number, groupIcon: React.ReactNode) => {
    if (funds.length === 0) return null;

    const isExpanded = isGroupExpanded(groupName);
    const currencyCode = funds[0]?.currency_code || 'IDR';

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(groupName)}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3">
              {groupIcon}
              <div className="text-left">
                <p className="font-medium">{groupName}</p>
                <p className="text-sm text-muted-foreground">{funds.length} item(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AmountText
                amount={groupTotal}
                className="font-semibold"
                showSign={true}
              >
                {formatAmountCurrency(groupTotal, currencyCode)}
              </AmountText>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 px-4 pb-4">
          {funds.map((fund, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg ml-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {fund.instrument_name ? (
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Wallet className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {fund.asset_name || fund.instrument_name || 'Cash/Wallet'}
                  </p>
                  {fund.asset_symbol && (
                    <p className="text-xs text-muted-foreground">
                      Symbol: {fund.asset_symbol}
                    </p>
                  )}
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {fund.currency_code}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <AmountText
                  amount={fund.total_amount}
                  className="font-semibold text-sm"
                  showSign={true}
                >
                  {formatAmountCurrency(fund.total_amount, fund.currency_code)}
                </AmountText>
                {fund.total_amount_unit && (
                  <p className="text-xs text-muted-foreground">
                    {fund.total_amount_unit.toLocaleString("id-ID", { maximumFractionDigits: 4 })} {fund.unit_label || 'unit'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Ringkasan Dana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedGroupKeys.map(instrumentKey => {
          const funds = groupedFunds[instrumentKey];
          const total = groupTotals[instrumentKey];
          const icon = instrumentKey === 'Cash & Wallet'
            ? <Wallet className="w-5 h-5 text-green-600" />
            : <TrendingUp className="w-5 h-5 text-blue-600" />;

          return (
            <div key={instrumentKey}>
              {renderFundGroup(funds, instrumentKey, total, icon)}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default GoalFundsSummary;
