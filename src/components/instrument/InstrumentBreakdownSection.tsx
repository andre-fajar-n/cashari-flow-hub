import { useState } from "react";
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
  BarChart3,
  HelpCircle,
  AlertCircle,
  ListTree,
  ChevronRight,
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
  WalletBreakdownForInstrument,
  WalletFirstBreakdown,
  GoalUnderWallet,
  AssetBreakdownForInstrument,
} from "@/hooks/queries/use-instrument-detail-summary";

interface InstrumentBreakdownSectionProps {
  items: InvestmentSummaryExtended[];
  baseCurrencyCode: string;
  originalCurrencyCode: string;
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

const DualCurrencyMetric = ({
  label,
  tooltip,
  originalValue,
  originalCurrency,
  baseValue,
  baseCurrency,
  showSign = false,
  hideBaseIfSame = true,
}: {
  label: string;
  tooltip: string;
  originalValue: number;
  originalCurrency: string;
  baseValue: number;
  baseCurrency: string;
  showSign?: boolean;
  hideBaseIfSame?: boolean;
}) => {
  const isSameCurrency = originalCurrency === baseCurrency;

  return (
    <div className="flex justify-between items-start py-1.5">
      <LabelWithTooltip label={label} tooltip={tooltip} />
      <div className="text-right">
        {showSign ? (
          <AmountText amount={originalValue} showSign={true} className="text-sm font-medium">
            {formatAmountCurrency(Math.abs(originalValue), originalCurrency, originalCurrency)}
          </AmountText>
        ) : (
          <p className="text-sm font-medium">
            {formatAmountCurrency(originalValue, originalCurrency, originalCurrency)}
          </p>
        )}
        {(!hideBaseIfSame || !isSameCurrency) && (
          <p className="text-xs text-muted-foreground italic">
            ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
          </p>
        )}
      </div>
    </div>
  );
};

// ============= Asset Item (Bottom Level) =============

const AssetItem = ({
  asset,
  baseCurrency
}: {
  asset: AssetBreakdownForInstrument;
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnrealizedDetail, setShowUnrealizedDetail] = useState(false);
  const isSameCurrency = asset.originalCurrencyCode === baseCurrency;

  return (
    <div className="border rounded-lg bg-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">{asset.assetName || 'Tanpa Nama Aset'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-xs py-0 px-1.5">
                    {asset.originalCurrencyCode}
                  </Badge>
                  <Badge
                    variant={asset.isTrackable ? "secondary" : "outline"}
                    className="text-xs py-0 px-1.5"
                  >
                    {asset.isTrackable ? "Trackable" : "Non-trackable"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <AmountText amount={asset.totalProfitBaseCurrency} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(asset.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
                </AmountText>
                <p className="text-xs text-muted-foreground">Total Profit</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-1 border-t pt-3">
            {asset.isTrackable ? (
              <>
                <DualCurrencyMetric
                  label="Total Modal"
                  tooltip="Total dana yang pernah dimasukkan untuk aset ini."
                  originalValue={asset.investedCapital}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.investedCapitalBaseCurrency}
                  baseCurrency={baseCurrency}
                />

                {asset.amountUnit !== null && asset.amountUnit > 0 && (
                  <div className="flex justify-between items-center py-1.5">
                    <LabelWithTooltip
                      label="Jumlah Unit"
                      tooltip="Jumlah unit aset yang saat ini dimiliki."
                    />
                    <Badge variant="secondary" className="font-mono">
                      {asset.amountUnit.toLocaleString('id-ID', { maximumFractionDigits: 4 })} unit
                    </Badge>
                  </div>
                )}

                {asset.latestUnitPrice !== null && (
                  <div className="flex justify-between items-center py-1.5">
                    <LabelWithTooltip
                      label="Harga Pasar Terakhir"
                      tooltip="Harga pasar terbaru per unit aset."
                    />
                    <p className="text-sm font-medium">
                      {formatAmountCurrency(asset.latestUnitPrice, asset.originalCurrencyCode, asset.originalCurrencyCode)}
                    </p>
                  </div>
                )}

                <DualCurrencyMetric
                  label="Nilai Saat Ini"
                  tooltip="Nilai aset berdasarkan harga pasar terakhir dikalikan jumlah unit."
                  originalValue={asset.currentValue}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.currentValueBaseCurrency}
                  baseCurrency={baseCurrency}
                />

                <div className="border-t my-2" />

                <DualCurrencyMetric
                  label="Keuntungan Terealisasi"
                  tooltip="Keuntungan yang sudah benar-benar diterima, seperti dividen, bunga, atau keuntungan yang telah dicairkan."
                  originalValue={asset.realizedProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.realizedProfitBaseCurrency}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />

                <div className="py-1.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1">
                      <LabelWithTooltip
                        label="Keuntungan Belum Terealisasi"
                        tooltip="Keuntungan di atas kertas yang belum dicairkan."
                      />
                      {(asset.unrealizedCurrencyProfit !== null && asset.unrealizedCurrencyProfit !== 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUnrealizedDetail(!showUnrealizedDetail);
                          }}
                        >
                          <ChevronRight className={`w-3 h-3 transition-transform ${showUnrealizedDetail ? 'rotate-90' : ''}`} />
                        </Button>
                      )}
                    </div>
                    <div className="text-right">
                      <AmountText
                        amount={asset.unrealizedProfitBaseCurrency || 0}
                        showSign={true}
                        className="text-sm font-medium"
                      >
                        {formatAmountCurrency(Math.abs(asset.unrealizedProfitBaseCurrency || 0), baseCurrency, baseCurrency)}
                      </AmountText>
                      {!isSameCurrency && (
                        <p className="text-xs text-muted-foreground italic">
                          {asset.originalCurrencyCode}: {formatAmountCurrency(asset.unrealizedProfit, asset.originalCurrencyCode, asset.originalCurrencyCode)}
                        </p>
                      )}
                    </div>
                  </div>

                  {showUnrealizedDetail && asset.unrealizedCurrencyProfit !== null && (
                    <div className="mt-2 ml-4 p-2 rounded-md bg-muted/30 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          Keuntungan Aset
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                Keuntungan karena perubahan harga aset.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <AmountText
                          amount={(asset.unrealizedProfitBaseCurrency || 0) - (asset.unrealizedCurrencyProfit || 0)}
                          showSign={true}
                          className="font-medium"
                        >
                          {formatAmountCurrency(Math.abs((asset.unrealizedProfitBaseCurrency || 0) - (asset.unrealizedCurrencyProfit || 0)), baseCurrency, baseCurrency)}
                        </AmountText>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          Keuntungan Kurs
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                Keuntungan karena perubahan nilai tukar mata uang.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <AmountText
                          amount={asset.unrealizedCurrencyProfit}
                          showSign={true}
                          className="font-medium"
                        >
                          {formatAmountCurrency(Math.abs(asset.unrealizedCurrencyProfit), baseCurrency, baseCurrency)}
                        </AmountText>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t my-2" />

                <DualCurrencyMetric
                  label="Total Profit"
                  tooltip="Total keuntungan dari aset ini (terealisasi + belum terealisasi)."
                  originalValue={asset.totalProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.totalProfitBaseCurrency}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />
              </>
            ) : (
              <>
                <DualCurrencyMetric
                  label="Total Modal"
                  tooltip="Total dana yang pernah dimasukkan untuk aset ini."
                  originalValue={asset.investedCapital}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.investedCapitalBaseCurrency}
                  baseCurrency={baseCurrency}
                />

                <DualCurrencyMetric
                  label="Dana Aktif"
                  tooltip="Dana yang saat ini masih berada dalam aset ini."
                  originalValue={asset.activeCapital}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.activeCapitalBaseCurrency}
                  baseCurrency={baseCurrency}
                />

                <div className="border-t my-2" />

                <DualCurrencyMetric
                  label="Keuntungan Terealisasi"
                  tooltip="Keuntungan yang sudah benar-benar diterima."
                  originalValue={asset.realizedProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.realizedProfitBaseCurrency}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />

                <DualCurrencyMetric
                  label="Total Profit"
                  tooltip="Total keuntungan dari aset ini."
                  originalValue={asset.totalProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.totalProfitBaseCurrency}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />

                <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-muted/50">
                  <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Aset ini tidak memiliki pencatatan nilai pasar.
                  </p>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// ============= Wallet Item (for Goal-first mode) =============

const WalletItemUnderGoal = ({
  wallet,
  baseCurrency,
}: {
  wallet: WalletBreakdownForInstrument;
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasAssets = wallet.assets.length > 0;

  if (!hasAssets) {
    return (
      <div className="border rounded-lg p-3 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <p className="font-medium text-sm">{wallet.walletName}</p>
            <Badge variant="outline" className="text-xs">{wallet.originalCurrencyCode}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatAmountCurrency(wallet.currentValueBaseCurrency, baseCurrency, baseCurrency)}
              </p>
              <p className="text-xs text-muted-foreground">Nilai</p>
            </div>
            <div className="text-right">
              <AmountText amount={wallet.totalProfitBaseCurrency} showSign={true} className="text-sm font-semibold">
                {formatAmountCurrency(Math.abs(wallet.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
              </AmountText>
              <p className="text-xs text-muted-foreground">Profit</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">{wallet.walletName}</p>
                <Badge variant="outline" className="text-xs mt-0.5">{wallet.originalCurrencyCode}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatAmountCurrency(wallet.currentValueBaseCurrency, baseCurrency, baseCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Nilai</p>
              </div>
              <div className="text-right">
                <AmountText amount={wallet.totalProfitBaseCurrency} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(wallet.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
                </AmountText>
                <p className="text-xs text-muted-foreground">Profit</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 space-y-2 border-t">
            {wallet.assets
              .sort((a, b) => b.totalProfitBaseCurrency - a.totalProfitBaseCurrency)
              .map((asset, idx) => (
                <AssetItem key={idx} asset={asset} baseCurrency={baseCurrency} />
              ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// ============= Goal Item (for Goal-first mode - Level 1) =============

const GoalItem = ({
  goal,
  baseCurrency,
}: {
  goal: GoalBreakdownForInstrument;
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-card shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto hover:bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{goal.goalName}</p>
                <p className="text-xs text-muted-foreground">{goal.wallets.length} wallet</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-base font-bold">
                  {formatAmountCurrency(goal.currentValueBaseCurrency, baseCurrency, baseCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
              </div>
              <div className="text-right hidden sm:block">
                <AmountText amount={goal.totalProfitBaseCurrency} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(goal.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
                </AmountText>
                <p className="text-xs text-muted-foreground">Profit</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t space-y-2">
            {goal.wallets
              .sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency)
              .map((wallet) => (
                <WalletItemUnderGoal
                  key={wallet.walletId}
                  wallet={wallet}
                  baseCurrency={baseCurrency}
                />
              ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// ============= Goal Item under Wallet (for Wallet-first mode) =============

const GoalItemUnderWallet = ({
  goal,
  baseCurrency,
}: {
  goal: GoalUnderWallet;
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasAssets = goal.assets.length > 0;

  if (!hasAssets) {
    return (
      <div className="border rounded-lg p-3 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <p className="font-medium text-sm">{goal.goalName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatAmountCurrency(goal.currentValueBaseCurrency, baseCurrency, baseCurrency)}
              </p>
              <p className="text-xs text-muted-foreground">Nilai</p>
            </div>
            <div className="text-right">
              <AmountText amount={goal.totalProfitBaseCurrency} showSign={true} className="text-sm font-semibold">
                {formatAmountCurrency(Math.abs(goal.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
              </AmountText>
              <p className="text-xs text-muted-foreground">Profit</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">{goal.goalName}</p>
                <p className="text-xs text-muted-foreground">{goal.assets.length} aset</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatAmountCurrency(goal.currentValueBaseCurrency, baseCurrency, baseCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Nilai</p>
              </div>
              <div className="text-right">
                <AmountText amount={goal.totalProfitBaseCurrency} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(goal.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
                </AmountText>
                <p className="text-xs text-muted-foreground">Profit</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 space-y-2 border-t">
            {goal.assets
              .sort((a, b) => b.totalProfitBaseCurrency - a.totalProfitBaseCurrency)
              .map((asset, idx) => (
                <AssetItem key={idx} asset={asset} baseCurrency={baseCurrency} />
              ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// ============= Wallet Item (for Wallet-first mode - Level 1) =============

const WalletItem = ({
  wallet,
  baseCurrency,
}: {
  wallet: WalletFirstBreakdown;
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSameCurrency = wallet.originalCurrencyCode === baseCurrency;

  return (
    <div className="border rounded-lg bg-card shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto hover:bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{wallet.walletName}</p>
                <Badge variant="outline" className="text-xs mt-0.5">{wallet.originalCurrencyCode}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-base font-bold">
                  {formatAmountCurrency(wallet.currentValueBaseCurrency, baseCurrency, baseCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
              </div>
              <div className="text-right hidden sm:block">
                <AmountText amount={wallet.totalProfitBaseCurrency} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(wallet.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
                </AmountText>
                <p className="text-xs text-muted-foreground">Profit</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Wallet summary metrics */}
          <div className="px-4 pb-3 pt-2 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-0.5">
                <LabelWithTooltip
                  label="Dana Aktif"
                  tooltip="Dana yang saat ini masih berada di instrumen dan belum ditarik."
                />
                <p className="text-sm font-medium">
                  {formatAmountCurrency(wallet.activeCapital, wallet.originalCurrencyCode, wallet.originalCurrencyCode)}
                </p>
                {!isSameCurrency && (
                  <p className="text-xs text-muted-foreground italic">
                    ≈ {formatAmountCurrency(wallet.activeCapitalBaseCurrency, baseCurrency, baseCurrency)}
                  </p>
                )}
              </div>

              <div className="space-y-0.5">
                <LabelWithTooltip
                  label="Nilai Saat Ini"
                  tooltip="Nilai wallet berdasarkan kondisi terbaru."
                />
                <p className="text-sm font-semibold text-primary">
                  {formatAmountCurrency(wallet.currentValueBaseCurrency, baseCurrency, baseCurrency)}
                </p>
              </div>

              <div className="space-y-0.5">
                <LabelWithTooltip
                  label="Total Profit"
                  tooltip="Total keuntungan dari wallet ini."
                />
                <AmountText
                  amount={wallet.totalProfitBaseCurrency}
                  showSign={true}
                  className="text-sm font-semibold"
                >
                  {formatAmountCurrency(Math.abs(wallet.totalProfitBaseCurrency), baseCurrency, baseCurrency)}
                </AmountText>
              </div>
            </div>
          </div>

          {/* Goals list */}
          <div className="px-4 pb-4 pt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {wallet.goals.length} Goal
            </p>
            <div className="space-y-2">
              {wallet.goals
                .sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency)
                .map((goal) => (
                  <GoalItemUnderWallet
                    key={goal.goalId}
                    goal={goal}
                    baseCurrency={baseCurrency}
                  />
                ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// ============= Main Component =============

const InstrumentBreakdownSection = ({
  items,
  baseCurrencyCode,
  originalCurrencyCode,
}: InstrumentBreakdownSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
                Rincian Instrumen
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
                  ? "Rincian per Goal → Dompet → Aset" 
                  : "Rincian per Dompet → Goal → Aset"}
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

export default InstrumentBreakdownSection;
