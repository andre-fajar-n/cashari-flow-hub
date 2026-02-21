import { useState, ElementType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Wallet,
  Target,
  HelpCircle,
  ListTree,
  ArrowLeftRight,
} from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import {
  InvestmentSummaryExtended
} from "@/hooks/queries/use-goal-detail-summary";
import {
  buildGoalFirstBreakdown,
  buildWalletFirstBreakdown,
  GoalBreakdownForInstrument,
  WalletFirstBreakdown,
  WalletBreakdownForInstrument,
  GoalUnderWallet,
} from "@/hooks/queries/use-instrument-detail-summary";

interface AssetBreakdownSectionProps {
  items: InvestmentSummaryExtended[];
  baseCurrencyCode: string;
}

type BreakdownMode = "goal-first" | "wallet-first";

// ============= Helper Components =============

const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center gap-1 cursor-help text-muted-foreground text-sm">
          {label}
          <HelpCircle className="w-3 h-3" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// ============= Hierarchy Detail Item (Internal) =============
const HierarchyDetailItem = ({
  icon: Icon,
  name,
  originalCurrency,
  activeCapital,
  activeCapitalBase,
  currentValue,
  currentValueBase,
  totalProfit,
  totalProfitBase,
  realizedProfitBase,
  unrealizedAssetProfitBase,
  unrealizedCurrencyProfitBase,
  baseCurrency,
}: {
  icon: ElementType;
  name: string;
  originalCurrency: string;
  activeCapital: number;
  activeCapitalBase: number;
  currentValue: number;
  currentValueBase: number;
  totalProfit: number;
  totalProfitBase: number;
  realizedProfitBase: number;
  unrealizedAssetProfitBase: number;
  unrealizedCurrencyProfitBase: number;
  baseCurrency: string;
}) => {
  return (
    <div className="border rounded-lg p-3 bg-background space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <p className="font-medium text-sm">{name}</p>
          <Badge variant="outline" className="text-xs">{originalCurrency}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-sm font-semibold ${activeCapital < 0 ? 'text-red-500' : ''}`}>
              {formatAmountCurrency(activeCapital, originalCurrency, originalCurrency)}
            </p>
            <p className={`text-xs text-muted-foreground italic ${activeCapitalBase < 0 ? 'text-red-500' : ''}`}>
              ≈ {formatAmountCurrency(activeCapitalBase, baseCurrency, baseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground">Modal Aktif</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${currentValue < 0 ? 'text-red-500' : ''}`}>
              {formatAmountCurrency(currentValue, originalCurrency, originalCurrency)}
            </p>
            <p className={`text-xs text-muted-foreground italic ${currentValue < 0 ? 'text-red-500' : ''}`}>
              ≈ {formatAmountCurrency(currentValueBase, baseCurrency, baseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
          </div>
          <div className="text-right">
            <AmountText amount={totalProfit} showSign={true} className="text-sm font-semibold text-primary">
              {formatAmountCurrency(Math.abs(totalProfit), originalCurrency, originalCurrency)}
            </AmountText>
            <p className="text-xs text-muted-foreground italic">
              ≈ {formatAmountCurrency(Math.abs(totalProfitBase), baseCurrency, baseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground">Profit</p>
          </div>
        </div>
      </div>

      {/* Profit Breakdown */}
      <ProfitBreakdown
        realizedProfitBaseCurrency={realizedProfitBase}
        unrealizedAssetProfitBaseCurrency={unrealizedAssetProfitBase}
        unrealizedCurrencyProfitBaseCurrency={unrealizedCurrencyProfitBase}
        baseCurrency={baseCurrency}
      />
    </div>
  );
};

// ============= Hierarchy Header Item (Internal) =============
const HierarchyHeaderItem = ({
  icon: Icon,
  name,
  subtitle,
  originalCurrency,
  activeCapital,
  activeCapitalBase,
  currentValue,
  currentValueBase,
  totalProfit,
  totalProfitBase,
  baseCurrency,
  children,
  childCount,
  childLabel,
}: {
  icon: ElementType;
  name: string;
  subtitle?: React.ReactNode;
  originalCurrency: string;
  activeCapital: number;
  activeCapitalBase: number;
  currentValue: number;
  currentValueBase: number;
  totalProfit: number;
  totalProfitBase: number;
  baseCurrency: string;
  children: React.ReactNode;
  childCount: number;
  childLabel: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-card shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto hover:bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{name}</p>
                {subtitle}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`text-base font-bold ${activeCapital < 0 ? 'text-red-500' : ''}`}>
                  {formatAmountCurrency(activeCapital, originalCurrency, originalCurrency)}
                </p>
                <p className={`text-xs text-muted-foreground italic ${activeCapitalBase < 0 ? 'text-red-500' : ''}`}>
                  ≈ {formatAmountCurrency(activeCapitalBase, baseCurrency, baseCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Modal Aktif</p>
              </div>
              <div className="text-right">
                <p className={`text-base font-bold ${currentValue < 0 ? 'text-red-500' : ''}`}>
                  {formatAmountCurrency(currentValue, originalCurrency, originalCurrency)}
                </p>
                <p className={`text-xs text-muted-foreground italic ${currentValueBase < 0 ? 'text-red-500' : ''}`}>
                  ≈ {formatAmountCurrency(currentValueBase, baseCurrency, baseCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
              </div>
              <div className="text-right hidden sm:block">
                <AmountText amount={totalProfit} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(totalProfit), originalCurrency, originalCurrency)}
                </AmountText>
                <p className="text-xs text-muted-foreground italic">
                  ≈ {formatAmountCurrency(Math.abs(totalProfitBase), baseCurrency, baseCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Profit</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {childCount} {childLabel}
            </p>
            <div className="space-y-2">
              {children}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// ============= Wallet Item (under Goal) =============
const WalletItemUnderGoal = ({
  wallet,
  baseCurrency,
}: {
  wallet: WalletBreakdownForInstrument;
  baseCurrency: string;
}) => {
  return (
    <HierarchyDetailItem
      icon={Wallet}
      name={wallet.walletName}
      originalCurrency={wallet.originalCurrencyCode}
      activeCapital={wallet.activeCapital}
      activeCapitalBase={wallet.activeCapitalBaseCurrency}
      currentValue={wallet.currentValue}
      currentValueBase={wallet.currentValueBaseCurrency}
      totalProfit={wallet.totalProfit}
      totalProfitBase={wallet.totalProfitBaseCurrency}
      realizedProfitBase={wallet.realizedProfitBaseCurrency}
      unrealizedAssetProfitBase={wallet.unrealizedAssetProfitBaseCurrency}
      unrealizedCurrencyProfitBase={wallet.unrealizedCurrencyProfitBaseCurrency}
      baseCurrency={baseCurrency}
    />
  );
};

// ============= Goal Item (Header Level 1) =============
const GoalItem = ({
  goal,
  baseCurrency,
}: {
  goal: GoalBreakdownForInstrument;
  baseCurrency: string;
}) => {
  return (
    <HierarchyHeaderItem
      icon={Target}
      name={goal.goalName}
      subtitle={<p className="text-xs text-muted-foreground">{goal.wallets.length} wallet</p>}
      originalCurrency={goal.originalCurrencyCode}
      activeCapital={goal.activeCapital}
      activeCapitalBase={goal.activeCapitalBaseCurrency}
      currentValue={goal.currentValue}
      currentValueBase={goal.currentValueBaseCurrency}
      totalProfit={goal.totalProfit}
      totalProfitBase={goal.totalProfitBaseCurrency}
      baseCurrency={baseCurrency}
      childCount={goal.wallets.length}
      childLabel="Wallet"
    >
      {goal.wallets
        .sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency)
        .map((wallet) => (
          <WalletItemUnderGoal
            key={wallet.walletId}
            wallet={wallet}
            baseCurrency={baseCurrency}
          />
        ))}
    </HierarchyHeaderItem>
  );
};

// ============= Goal Item (under Wallet) =============
const GoalItemUnderWallet = ({
  goal,
  baseCurrency,
}: {
  goal: GoalUnderWallet;
  baseCurrency: string;
}) => {
  return (
    <HierarchyDetailItem
      icon={Target}
      name={goal.goalName}
      originalCurrency={goal.originalCurrencyCode}
      activeCapital={goal.activeCapital}
      activeCapitalBase={goal.activeCapitalBaseCurrency}
      currentValue={goal.currentValue}
      currentValueBase={goal.currentValueBaseCurrency}
      totalProfit={goal.totalProfit}
      totalProfitBase={goal.totalProfitBaseCurrency}
      realizedProfitBase={goal.realizedProfitBaseCurrency}
      unrealizedAssetProfitBase={goal.unrealizedAssetProfitBaseCurrency}
      unrealizedCurrencyProfitBase={goal.unrealizedCurrencyProfitBaseCurrency}
      baseCurrency={baseCurrency}
    />
  );
};

const ProfitBreakdown = ({
  realizedProfitBaseCurrency,
  unrealizedAssetProfitBaseCurrency,
  unrealizedCurrencyProfitBaseCurrency,
  baseCurrency,
}: {
  realizedProfitBaseCurrency: number;
  unrealizedAssetProfitBaseCurrency: number;
  unrealizedCurrencyProfitBaseCurrency: number;
  baseCurrency: string;
}) => {
  const hasCurrencyProfit = unrealizedCurrencyProfitBaseCurrency !== 0;
  const unrealizedProfitBaseCurrency = unrealizedAssetProfitBaseCurrency + unrealizedCurrencyProfitBaseCurrency;
  const columns = hasCurrencyProfit ? 2 : 1;

  return (
    <div className="space-y-2 pt-2">
      <div className="grid grid-cols-1 gap-1 border-b">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] text-muted-foreground">Terealisasi</span>
          <AmountText amount={realizedProfitBaseCurrency} showSign={true} className="text-[10px] font-medium">
            {formatAmountCurrency(Math.abs(realizedProfitBaseCurrency), baseCurrency, baseCurrency)}
          </AmountText>
        </div>
      </div>

      <div className={`grid grid-cols-${columns} gap-${columns}`}>
        <div className="flex justify-between items-center px-1 border-r-2">
          <span className="text-[10px] text-muted-foreground">Belum Terealisasi</span>
          <AmountText amount={unrealizedProfitBaseCurrency} showSign={true} className="text-[10px] font-medium">
            {formatAmountCurrency(Math.abs(unrealizedProfitBaseCurrency), baseCurrency, baseCurrency)}
          </AmountText>
        </div>
        {hasCurrencyProfit && (
          <div className="grid grid-rows-2 gap-2 border-l-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] text-muted-foreground italic">Aset</span>
              <AmountText amount={unrealizedAssetProfitBaseCurrency} showSign={true} className="text-[9px] font-normal">
                {formatAmountCurrency(Math.abs(unrealizedAssetProfitBaseCurrency), baseCurrency, baseCurrency)}
              </AmountText>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] text-muted-foreground italic">Kurs</span>
              <AmountText amount={unrealizedCurrencyProfitBaseCurrency} showSign={true} className="text-[9px] font-normal">
                {formatAmountCurrency(Math.abs(unrealizedCurrencyProfitBaseCurrency), baseCurrency, baseCurrency)}
              </AmountText>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============= Wallet Item (Header Level 1) =============
const WalletItem = ({
  wallet,
  baseCurrency,
}: {
  wallet: WalletFirstBreakdown;
  baseCurrency: string;
}) => {
  return (
    <HierarchyHeaderItem
      icon={Wallet}
      name={wallet.walletName}
      subtitle={<Badge variant="outline" className="text-xs mt-0.5">{wallet.originalCurrencyCode}</Badge>}
      originalCurrency={wallet.originalCurrencyCode}
      activeCapital={wallet.activeCapital}
      activeCapitalBase={wallet.activeCapitalBaseCurrency}
      currentValue={wallet.currentValue}
      currentValueBase={wallet.currentValueBaseCurrency}
      totalProfit={wallet.totalProfit}
      totalProfitBase={wallet.totalProfitBaseCurrency}
      baseCurrency={baseCurrency}
      childCount={wallet.goals.length}
      childLabel="Goal"
    >
      {wallet.goals
        .sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency)
        .map((goal) => (
          <GoalItemUnderWallet
            key={goal.goalId}
            goal={goal}
            baseCurrency={baseCurrency}
          />
        ))}
    </HierarchyHeaderItem>
  );
};

// ============= Main Component =============

const AssetBreakdownSection = ({
  items,
  baseCurrencyCode,
}: AssetBreakdownSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState<BreakdownMode>("goal-first");

  const goalFirstData = buildGoalFirstBreakdown(items);
  const walletFirstData = buildWalletFirstBreakdown(items);

  if (items.length === 0) {
    return null;
  }

  const toggleMode = () => {
    setMode(mode === "goal-first" ? "wallet-first" : "goal-first");
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <ListTree className="w-5 h-5" />
                Rincian Alokasi Aset
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {mode === "goal-first"
                    ? `${goalFirstData.length} goal`
                    : `${walletFirstData.length} wallet`}
                </span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {/* Mode Switch */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                {mode === "goal-first"
                  ? "Rincian per Goal → Dompet"
                  : "Rincian per Dompet → Goal"}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMode();
                      }}
                      className="gap-2"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      {mode === "goal-first" ? "Lihat per Dompet" : "Lihat per Goal"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ganti tampilan hierarki breakdown</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Render based on mode */}
            {mode === "goal-first" ? (
              goalFirstData.map((goal) => (
                <GoalItem
                  key={goal.goalId}
                  goal={goal}
                  baseCurrency={baseCurrencyCode}
                />
              ))
            ) : (
              walletFirstData.map((wallet) => (
                <WalletItem
                  key={wallet.walletId}
                  wallet={wallet}
                  baseCurrency={baseCurrencyCode}
                />
              ))
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AssetBreakdownSection;
