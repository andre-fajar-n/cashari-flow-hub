import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Wallet, TrendingUp, PieChart, ChevronDown, ChevronUp } from "lucide-react";
import { useGoalFundsSummary } from "@/hooks/queries/use-goal-funds-summary";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";

interface GoalFundsSummaryProps {
  goalId: number;
}

const GoalFundsSummary = ({ goalId }: GoalFundsSummaryProps) => {
  const { data: fundsSummary, isLoading } = useGoalFundsSummary(goalId);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showZero, setShowZero] = useState(false);

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

  // Helper to build grouped structure and totals per wallet
  const buildGrouped = (list: any[]) => {
    const grouped = list.reduce((groups, fund) => {
      const walletKey = fund.wallet_name || 'Unknown Wallet';
      const instrumentKey = fund.instrument_name || 'Cash & Wallet';
      if (!groups[walletKey]) groups[walletKey] = {};
      if (!groups[walletKey][instrumentKey]) groups[walletKey][instrumentKey] = [];
      groups[walletKey][instrumentKey].push(fund);
      return groups;
    }, {} as Record<string, Record<string, any[]>>);

    const walletTotals = Object.keys(grouped).reduce((totals: Record<string, number>, walletKey) => {
      const total = (Object.values(grouped[walletKey]) as any[][])
        .flat()
        .reduce((sum: number, fund: any) => sum + (fund.total_amount ?? 0), 0);
      totals[walletKey] = total;
      return totals;
    }, {} as Record<string, number>);

    const sortedWalletKeys = Object.keys(grouped).sort((a, b) => (walletTotals[b] ?? 0) - (walletTotals[a] ?? 0));
    return { grouped, walletTotals, sortedWalletKeys };
  };

  // Split into active (amount > 0) and zero (amount === 0)
  const activeList = fundsSummary.filter((f: any) => (f.total_amount ?? 0) > 0);
  const zeroList = fundsSummary.filter((f: any) => (f.total_amount ?? 0) <= 0);

  const { grouped: groupedActive, walletTotals: walletTotalsActive, sortedWalletKeys: sortedWalletKeysActive } = buildGrouped(activeList);
  const { grouped: groupedZero, walletTotals: walletTotalsZero, sortedWalletKeys: sortedWalletKeysZero } = buildGrouped(zeroList);

  const isGroupExpanded = (groupKey: string) => Boolean(expandedGroups[groupKey]);

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
  const renderInstrumentGroup = (funds: any[], instrumentName: string, instrumentTotal: number, walletKey: string, ns: string = "") => {
    const instrumentKey = `${ns}${walletKey}-${instrumentName}`;
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
          map[assetKey] = [] as any[];
        }
        map[assetKey].push(fund);
      }
      return map;
    }, {} as Record<string, any[]>);

    // Sort assets by total amount (descending)
    const assetTotals: Record<string, number> = Object.keys(assetsMap).reduce((acc, key) => {
      acc[key] = (assetsMap[key] as any[]).reduce((sum, f: any) => sum + (f.total_amount ?? 0), 0);
      return acc;
    }, {} as Record<string, number>);
    const sortedAssetKeys = Object.keys(assetsMap).sort((a, b) => (assetTotals[b] ?? 0) - (assetTotals[a] ?? 0));

    return (
      <div className="ml-6">
        <Collapsible open={isExpanded} onOpenChange={(open) => setExpandedGroups(prev => ({ ...prev, [instrumentKey]: open }))}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">{instrumentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {sortedAssetKeys.length} asset(s)
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
            {sortedAssetKeys.map((assetKey) => (
              (assetsMap[assetKey] as any[]).map((fund, index) => renderAssetItem(fund, index))
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // Render wallet group with instruments
  const renderWalletGroup = (walletKey: string, instruments: Record<string, any[]>, walletTotal: number, ns: string = "") => {
    const walletKeyScoped = `${ns}${walletKey}`;
    const isExpanded = isGroupExpanded(walletKeyScoped);
    const allFunds = (Object.values(instruments) as any[][]).flat();
    const currencyCode = allFunds[0]?.currency_code || 'IDR';

    // Sort instruments by total amount
    const sortedInstruments = Object.keys(instruments).sort((a, b) => {
      const totalA = instruments[a].reduce((sum, fund) => sum + (fund.total_amount ?? 0), 0);
      const totalB = instruments[b].reduce((sum, fund) => sum + (fund.total_amount ?? 0), 0);
      return totalB - totalA;
    });

    return (
      <Collapsible open={isExpanded} onOpenChange={(open) => setExpandedGroups(prev => ({ ...prev, [walletKeyScoped]: open }))}>
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
                {renderInstrumentGroup(instrumentFunds, instrumentKey, instrumentTotal, walletKey, ns)}
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
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Ringkasan Dana
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tampilkan dana kosong</span>
            <Switch checked={showZero} onCheckedChange={setShowZero} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dana Aktif (amount > 0) */}
        {sortedWalletKeysActive.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Dana Aktif</p>
            {sortedWalletKeysActive.map(walletKey => {
              const instruments = groupedActive[walletKey];
              const total = walletTotalsActive[walletKey];
              return (
                <div key={`active-${walletKey}`}>
                  {renderWalletGroup(walletKey, instruments, total, "active-")}
                </div>
              );
            })}
          </div>
        )}

        {/* Dana Kosong (amount = 0) */}
        {showZero && sortedWalletKeysZero.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Dana Kosong</p>
            {sortedWalletKeysZero.map(walletKey => {
              const instruments = groupedZero[walletKey];
              const total = walletTotalsZero[walletKey];
              return (
                <div key={`zero-${walletKey}`}>
                  {renderWalletGroup(walletKey, instruments, total, "zero-")}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalFundsSummary;
