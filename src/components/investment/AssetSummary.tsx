import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wallet, Target, PieChart, ChevronDown, ChevronUp } from "lucide-react";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { MoneySummaryModel } from "@/models/money-summary";

interface AssetSummaryProps {
  assetId: number;
  assetName: string;
}

const AssetSummary = ({ assetId, assetName }: AssetSummaryProps) => {
  const [expandedWallets, setExpandedWallets] = useState<Record<string, boolean>>({});
  const { data: fundSummary, isLoading } = useMoneySummary({ assetId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Summary Aset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Memuat summary aset...</p>
        </CardContent>
      </Card>
    );
  }

  // Filter records for this specific asset
  const assetRecords = fundSummary?.filter(record => record.asset_id === assetId) || [];

  if (assetRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Summary Aset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Belum ada transaksi untuk aset {assetName}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group records by wallet first, then by goal
  const groupedRecords = assetRecords.reduce((walletGroups, record) => {
    const walletKey = record.wallet_name || 'Tidak ada wallet';
    const goalKey = record.goal_name || 'Tidak ada goal';

    // Initialize wallet group if not exists
    if (!walletGroups[walletKey]) {
      walletGroups[walletKey] = {
        walletName: record.wallet_name || 'Tidak ada wallet',
        totalAmount: 0,
        totalUnit: 0,
        goals: {}
      };
    }

    // Initialize goal within wallet if not exists
    if (!walletGroups[walletKey].goals[goalKey]) {
      walletGroups[walletKey].goals[goalKey] = {
        goalName: record.goal_name || 'Tidak ada goal',
        records: [],
        totalAmount: 0,
        totalUnit: 0
      };
    }

    // Add record to goal
    walletGroups[walletKey].goals[goalKey].records.push(record);
    walletGroups[walletKey].goals[goalKey].totalAmount += record.amount || 0;
    walletGroups[walletKey].goals[goalKey].totalUnit += record.amount_unit || 0;

    // Update wallet totals
    walletGroups[walletKey].totalAmount += record.amount || 0;
    walletGroups[walletKey].totalUnit += record.amount_unit || 0;

    return walletGroups;
  }, {} as Record<string, {
    walletName: string;
    totalAmount: number;
    totalUnit: number;
    goals: Record<string, {
      goalName: string;
      records: MoneySummaryModel[];
      totalAmount: number;
      totalUnit: number;
    }>
  }>);

  // Sort wallets by total amount (descending)
  const sortedWalletKeys = Object.keys(groupedRecords).sort((a, b) =>
    groupedRecords[b].totalAmount - groupedRecords[a].totalAmount
  );

  // Calculate total summary
  const totalAmount = Object.values(groupedRecords).reduce((sum, group) => sum + group.totalAmount, 0);
  const totalUnit = Object.values(groupedRecords).reduce((sum, group) => sum + group.totalUnit, 0);
  const currencyCode = assetRecords[0]?.original_currency_code || 'unknown currency';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Ringkasan Aset - {assetName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-center">
            <AmountText
              amount={totalAmount}
              className="text-2xl font-bold"
              showSign={true}
            >
              {formatAmountCurrency(totalAmount, currencyCode)}
            </AmountText>
            {totalUnit > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Total: {totalUnit.toLocaleString("id-ID")} unit
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Total nilai di semua goal dan wallet
            </p>
          </div>
        </div>

        {/* Wallet-based Grouping */}
        {sortedWalletKeys.map(walletKey => {
          const wallet = groupedRecords[walletKey];
          const isExpanded = expandedWallets[walletKey] || false;

          return (
            <Collapsible key={walletKey} open={isExpanded} onOpenChange={(open) =>
              setExpandedWallets(prev => ({ ...prev, [walletKey]: open }))
            }>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        {wallet.walletName}
                      </div>
                      <div className="flex items-center gap-2">
                        <AmountText
                          amount={wallet.totalAmount}
                          className="font-semibold"
                        >
                          {formatAmountCurrency(wallet.totalAmount, 'IDR')}
                        </AmountText>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    {Object.keys(wallet.goals).map(goalKey => {
                      const goal = wallet.goals[goalKey];
                      return (
                        <div key={goalKey} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{goal.goalName}</span>
                            </div>
                            <div className="text-right">
                              <AmountText
                                amount={goal.totalAmount}
                                className="font-semibold text-sm"
                              >
                                {formatAmountCurrency(goal.totalAmount, 'IDR')}
                              </AmountText>
                              {goal.totalUnit > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {goal.totalUnit.toLocaleString("id-ID")} unit
                                </p>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AssetSummary;