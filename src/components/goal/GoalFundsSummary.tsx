import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, PieChart, ChevronDown, ChevronUp } from "lucide-react";
import { useGoalFundsSummary } from "@/hooks/queries/use-goal-funds-summary";
import { formatAmountCurrency } from "@/lib/currency";
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

  // Group funds hierarchically: Wallet → Instrument → Asset
  const groupedFunds = fundsSummary.reduce((groups, fund) => {
    const walletKey = fund.wallet_name || 'Unknown Wallet';
    const instrumentKey = fund.instrument_name || 'Cash & Wallet';

    if (!groups[walletKey]) {
      groups[walletKey] = {};
    }
    if (!groups[walletKey][instrumentKey]) {
      groups[walletKey][instrumentKey] = [];
    }
    groups[walletKey][instrumentKey].push(fund);
    return groups;
  }, {} as Record<string, Record<string, any[]>>);

  // Calculate totals for each level
  const walletTotals = Object.keys(groupedFunds).reduce((totals, walletKey) => {
    totals[walletKey] = Object.values(groupedFunds[walletKey])
      .flat()
      .reduce((sum, fund) => sum + fund.total_amount, 0);
    return totals;
  }, {} as Record<string, number>);

  // Sort wallets by total amount (descending)
  const sortedWalletKeys = Object.keys(groupedFunds).sort((a, b) => walletTotals[b] - walletTotals[a]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const isGroupExpanded = (groupName: string) => expandedGroups.includes(groupName);

  // Render individual asset item
  const renderAssetItem = (fund: any, index: number) => (
    <div key={index} className="flex items-center justify-between p-3 border rounded-lg ml-12">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-sm">{fund.asset_name}</p>
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
        {fund.total_amount_unit !== null ? (
          <p className="text-xs text-muted-foreground">
            {fund.total_amount_unit.toLocaleString("id-ID", { maximumFractionDigits: 4 })} {fund.unit_label || 'unit'}
          </p>
        ): null}
      </div>
    </div>
  );

  // Render instrument group with assets
  const renderInstrumentGroup = (funds: any[], instrumentName: string, instrumentTotal: number, walletKey: string) => {
    const instrumentKey = `${walletKey}-${instrumentName}`;
    const isExpanded = isGroupExpanded(instrumentKey);
    const currencyCode = funds[0]?.currency_code || 'IDR';

    // Check if this instrument has any assets
    const hasAssets = funds.some(fund => fund.asset_name);

    if (!hasAssets) {
      // For instruments without assets, render as simple item (no expandability)
      const fund = funds[0]; // Take first fund for display info
      return (
        <div className="ml-6">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {instrumentName === 'Cash & Wallet' ? (
                  <Wallet className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{instrumentName}</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {fund.currency_code}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <AmountText
                amount={instrumentTotal}
                className="font-semibold text-sm"
                showSign={true}
              >
                {formatAmountCurrency(instrumentTotal, currencyCode)}
              </AmountText>
              {fund.total_amount_unit !== null ? (
                <p className="text-xs text-muted-foreground">
                  {fund.total_amount_unit.toLocaleString("id-ID", { maximumFractionDigits: 4 })} {fund.unit_label || 'unit'}
                </p>
              ): null}
            </div>
          </div>
        </div>
      );
    }

    // For instruments with assets, render expandable group
    const assetsMap = funds.reduce((map, fund) => {
      if (fund.asset_name) {
        const assetKey = fund.asset_name;
        if (!map[assetKey]) {
          map[assetKey] = [];
        }
        map[assetKey].push(fund);
      }
      return map;
    }, {} as Record<string, any[]>);

    return (
      <div className="ml-6">
        <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(instrumentKey)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">{instrumentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {Object.keys(assetsMap).length} asset(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AmountText
                  amount={instrumentTotal}
                  className="font-semibold text-sm"
                  showSign={true}
                >
                  {formatAmountCurrency(instrumentTotal, currencyCode)}
                </AmountText>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 px-3 pb-3">
            {Object.entries(assetsMap).map(([, assetFunds]) => {
              return (assetFunds as any[]).map((fund, index) => renderAssetItem(fund, index));
            })}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // Render wallet group with instruments
  const renderWalletGroup = (walletKey: string, instruments: Record<string, any[]>, walletTotal: number) => {
    const isExpanded = isGroupExpanded(walletKey);
    const allFunds = Object.values(instruments).flat();
    const currencyCode = allFunds[0]?.currency_code || 'IDR';

    // Sort instruments by total amount
    const sortedInstruments = Object.keys(instruments).sort((a, b) => {
      const totalA = instruments[a].reduce((sum, fund) => sum + fund.total_amount, 0);
      const totalB = instruments[b].reduce((sum, fund) => sum + fund.total_amount, 0);
      return totalB - totalA;
    });

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(walletKey)}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium">{walletKey}</p>
                <p className="text-sm text-muted-foreground">{sortedInstruments.length} instrument(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AmountText
                amount={walletTotal}
                className="font-semibold"
                showSign={true}
              >
                {formatAmountCurrency(walletTotal, currencyCode)}
              </AmountText>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 px-4 pb-4">
          {sortedInstruments.map(instrumentKey => {
            const instrumentFunds = instruments[instrumentKey];
            const instrumentTotal = instrumentFunds.reduce((sum, fund) => sum + fund.total_amount, 0);
            return (
              <div key={instrumentKey}>
                {renderInstrumentGroup(instrumentFunds, instrumentKey, instrumentTotal, walletKey)}
              </div>
            );
          })}
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
        {sortedWalletKeys.map(walletKey => {
          const instruments = groupedFunds[walletKey];
          const total = walletTotals[walletKey];

          return (
            <div key={walletKey}>
              {renderWalletGroup(walletKey, instruments, total)}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default GoalFundsSummary;
