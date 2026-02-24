import { ElementType, useState, ReactNode } from "react";
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
  HelpCircle,
  BarChart3,
  ChevronRight,
  AlertCircle,
  ArrowLeftRight,
} from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import {
  AssetBreakdownForInstrument,
  GoalBreakdownForInstrument,
  GoalUnderWallet,
  WalletBreakdownForInstrument,
  WalletFirstBreakdown,
} from "@/hooks/queries/use-instrument-detail-summary";
import { Wallet, Target } from "lucide-react";

// ============= Base Components =============
export const LabelWithTooltip = ({ label, tooltip, className }: { label: string; tooltip: string; className?: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`flex items-center gap-1.5 cursor-help text-muted-foreground text-sm ${className}`}>
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

export const DualCurrencyMetric = ({
  label,
  tooltip,
  originalValue,
  originalCurrency,
  baseValue,
  baseCurrency,
  showSign = false,
  hideBaseIfSame = true,
  showBaseOnly = false,
  className = "",
}: {
  label: string;
  tooltip: string;
  originalValue: number;
  originalCurrency: string;
  baseValue: number;
  baseCurrency: string;
  showSign?: boolean;
  hideBaseIfSame?: boolean;
  showBaseOnly?: boolean;
  className?: string;
}) => {
  const isSameCurrency = originalCurrency === baseCurrency;
  const showedValue = showBaseOnly ? baseValue : originalValue;
  const showedCurrency = showBaseOnly ? baseCurrency : originalCurrency;

  return (
    <div className={`flex justify-between items-start py-1.5 ${className}`}>
      <LabelWithTooltip label={label} tooltip={tooltip} />
      <div className="text-right">
        {showSign ? (
          <AmountText amount={showedValue} showSign={true} className="text-sm font-medium">
            {formatAmountCurrency(Math.abs(showedValue), showedCurrency, showedCurrency)}
          </AmountText>
        ) : (
          <p className="text-sm font-medium">
            {formatAmountCurrency(showedValue, showedCurrency, showedCurrency)}
          </p>
        )}
        {(!showBaseOnly && (!hideBaseIfSame || !isSameCurrency)) && (
          <p className="text-xs text-muted-foreground italic">
            ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
          </p>
        )}
      </div>
    </div>
  );
};

// ============= Profit Breakdown Grid =============
interface ProfitBreakdownProps {
  realizedProfitBaseCurrency: number;
  unrealizedAssetProfitBaseCurrency: number;
  unrealizedCurrencyProfitBaseCurrency: number;
  baseCurrency: string;
  className?: string;
}

export const ProfitBreakdownGrid = ({
  realizedProfitBaseCurrency,
  unrealizedAssetProfitBaseCurrency,
  unrealizedCurrencyProfitBaseCurrency,
  baseCurrency,
  className = "",
}: ProfitBreakdownProps) => {
  const hasCurrencyProfit = unrealizedCurrencyProfitBaseCurrency !== 0;
  const totalUnrealizedProfitBaseCurrency = unrealizedAssetProfitBaseCurrency + unrealizedCurrencyProfitBaseCurrency;
  const columns = hasCurrencyProfit ? 2 : 1;

  return (
    <div className={`space-y-2 pt-2 ${className}`}>
      <div className="grid grid-cols-1 gap-1 border-b">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] text-muted-foreground">Terealisasi</span>
          <AmountText amount={realizedProfitBaseCurrency} showSign={true} className="text-[10px] font-medium">
            {formatAmountCurrency(Math.abs(realizedProfitBaseCurrency), baseCurrency, baseCurrency)}
          </AmountText>
        </div>
      </div>

      <div className={`grid grid-cols-${columns} gap-${columns}`}>
        <div className="flex justify-between items-center px-1 border-r-2 last:border-r-0">
          <span className="text-[10px] text-muted-foreground">Belum Terealisasi</span>
          <AmountText amount={totalUnrealizedProfitBaseCurrency} showSign={true} className="text-[10px] font-medium">
            {formatAmountCurrency(Math.abs(totalUnrealizedProfitBaseCurrency), baseCurrency, baseCurrency)}
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

// ============= Hierarchy Base Components =============
export interface BreakdownHeaderProps {
  Icon: ElementType;
  name: string;
  originalCurrency: string;
  activeCapital: number;
  activeCapitalBase: number;
  currentValue: number;
  currentValueBase: number;
  totalProfit: number;
  totalProfitBase: number;
  baseCurrency: string;
  isCollapsible?: boolean;
  isOpen?: boolean;
  hasAsset?: boolean;
  isTrackable?: boolean | null;
  className?: string;
  badgeContent?: React.ReactNode;
}

export const BreakdownHeaderItem = ({
  Icon,
  name,
  originalCurrency,
  activeCapital,
  activeCapitalBase,
  currentValue,
  currentValueBase,
  totalProfit,
  totalProfitBase,
  baseCurrency,
  isCollapsible = false,
  isOpen,
  hasAsset = false,
  isTrackable = null,
  className = "",
  badgeContent,
}: BreakdownHeaderProps) => {
  const isSameCurrency = originalCurrency === baseCurrency;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <p className="font-medium text-sm text-balance text-left">{name}</p>
        <div className="flex items-center gap-1.5">
          {badgeContent ? (
            badgeContent
          ) : hasAsset && isTrackable !== null ? (
            <Badge
              variant={isTrackable ? "secondary" : "outline"}
              className="text-[10px] py-0 px-1.5 h-4"
            >
              {isTrackable ? "Trackable" : "Non-trackable"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">{originalCurrency}</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-6 sm:ml-0">
        <div className="text-right">
          <p className={`text-sm font-semibold ${activeCapital < 0 ? 'text-red-500' : ''}`}>
            {formatAmountCurrency(activeCapital, originalCurrency, originalCurrency)}
          </p>
          {!isSameCurrency && (
            <p className={`text-xs text-muted-foreground italic ${activeCapitalBase < 0 ? 'text-red-500' : ''}`}>
              ≈ {formatAmountCurrency(activeCapitalBase, baseCurrency, baseCurrency)}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">Modal Aktif</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${currentValue < 0 ? 'text-red-500' : ''}`}>
            {formatAmountCurrency(currentValue, originalCurrency, originalCurrency)}
          </p>
          {!isSameCurrency && (
            <p className={`text-xs text-muted-foreground italic ${currentValue < 0 ? 'text-red-500' : ''}`}>
              ≈ {formatAmountCurrency(currentValueBase, baseCurrency, baseCurrency)}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">Nilai Saat Ini</p>
        </div>
        <div className="text-right hidden sm:block">
          <AmountText amount={totalProfit} showSign={true} className="text-sm font-semibold">
            {formatAmountCurrency(Math.abs(totalProfit), originalCurrency, originalCurrency)}
          </AmountText>
          {!isSameCurrency && (
            <p className="text-xs text-muted-foreground italic">
              ≈ {formatAmountCurrency(totalProfitBase, baseCurrency, baseCurrency)}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">Total Keuntungan</p>
        </div>
        {isCollapsible && (isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />)}
      </div>
    </div>
  );
};

interface BreakdownHierarchyGroupProps extends BreakdownHeaderProps {
  children: React.ReactNode;
  childCount: number;
  childLabel: string;
  subtitle?: React.ReactNode;
  initialOpen?: boolean;
}

export const BreakdownHierarchyGroup = (props: BreakdownHierarchyGroupProps) => {
  const { children, childCount, childLabel, subtitle, initialOpen = false, ...headerProps } = props;
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto hover:bg-muted/50 rounded-lg">
            <div className="w-full">
              <BreakdownHeaderItem
                {...headerProps}
                isCollapsible={true}
                isOpen={isOpen}
              />
              {subtitle && <div className="ml-6 mt-1 text-left">{subtitle}</div>}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t bg-muted/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
              {childCount} {childLabel}
            </p>
            <div className="space-y-3">
              {children}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

interface BreakdownHierarchyLeafProps extends BreakdownHeaderProps {
  realizedProfitBase: number;
  unrealizedAssetProfitBase: number;
  unrealizedCurrencyProfitBase: number;
}

export const BreakdownHierarchyLeaf = (props: BreakdownHierarchyLeafProps) => {
  const { realizedProfitBase, unrealizedAssetProfitBase, unrealizedCurrencyProfitBase, baseCurrency, ...headerProps } = props;

  return (
    <div className="border rounded-lg p-3 bg-background space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <BreakdownHeaderItem
          {...headerProps}
          baseCurrency={baseCurrency}
        />
      </div>

      <ProfitBreakdownGrid
        realizedProfitBaseCurrency={realizedProfitBase}
        unrealizedAssetProfitBaseCurrency={unrealizedAssetProfitBase}
        unrealizedCurrencyProfitBaseCurrency={unrealizedCurrencyProfitBase}
        baseCurrency={baseCurrency}
      />
    </div>
  );
};

// ============= High-Level Mapping Components =============
export const AssetItemHierarchy = ({
  asset,
  baseCurrency,
}: {
  asset: AssetBreakdownForInstrument;
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnrealizedDetail, setShowUnrealizedDetail] = useState(false);
  const isSameCurrency = asset.originalCurrencyCode === baseCurrency;

  return (
    <div className="border rounded-lg bg-background shadow-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50 rounded-none">
            <BreakdownHeaderItem
              Icon={BarChart3}
              name={asset.assetName || (asset.assetId === null ? 'Saldo / Tunai' : 'Tanpa Nama Aset')}
              originalCurrency={asset.originalCurrencyCode}
              activeCapital={asset.activeCapital}
              activeCapitalBase={asset.activeCapitalBaseCurrency}
              currentValue={asset.currentValue}
              currentValueBase={asset.currentValueBaseCurrency}
              totalProfit={asset.totalProfit}
              totalProfitBase={asset.totalProfitBaseCurrency}
              baseCurrency={baseCurrency}
              isCollapsible={true}
              isOpen={isOpen}
              hasAsset={asset.assetId !== null}
              isTrackable={asset.isTrackable}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-1 border-t pt-3 bg-muted/5">
            <DualCurrencyMetric
              label="Total Modal"
              tooltip="Total dana yang pernah dimasukkan untuk aset ini."
              originalValue={asset.investedCapital}
              originalCurrency={asset.originalCurrencyCode}
              baseValue={asset.investedCapitalBaseCurrency}
              baseCurrency={baseCurrency}
            />

            {asset.isTrackable ? (
              <>
                {asset.amountUnit !== null && asset.amountUnit > 0 && (
                  <div className="flex justify-between items-center py-1.5">
                    <LabelWithTooltip
                      label="Jumlah Unit"
                      tooltip="Jumlah unit aset yang saat ini dimiliki."
                    />
                    <Badge variant="secondary" className="font-mono text-[10px]">
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
              </>
            ) : (
              <DualCurrencyMetric
                label="Dana Aktif"
                tooltip="Dana yang saat ini masih berada dalam aset ini."
                originalValue={asset.activeCapital}
                originalCurrency={asset.originalCurrencyCode}
                baseValue={asset.activeCapitalBaseCurrency}
                baseCurrency={baseCurrency}
              />
            )}

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
                    amount={(asset.unrealizedAssetProfitBaseCurrency || 0) + (asset.unrealizedCurrencyProfit || 0)}
                    showSign={true}
                    className="text-sm font-medium"
                  >
                    {formatAmountCurrency(Math.abs(asset.unrealizedProfit || 0), asset.originalCurrencyCode, asset.originalCurrencyCode)}
                  </AmountText>
                  {!isSameCurrency && (
                    <p className="text-xs text-muted-foreground italic">
                      {formatAmountCurrency((asset.unrealizedAssetProfitBaseCurrency || 0) + (asset.unrealizedCurrencyProfit || 0), baseCurrency, baseCurrency)}
                    </p>
                  )}
                </div>
              </div>

              {showUnrealizedDetail && asset.unrealizedCurrencyProfit !== null && (
                <div className="mt-2 ml-4 p-2 rounded-md bg-muted/40 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <LabelWithTooltip
                      label="Keuntungan Aset"
                      tooltip="Keuntungan karena perubahan harga aset."
                      className="text-muted-foreground"
                    />
                    <AmountText
                      amount={asset.unrealizedAssetProfitBaseCurrency || 0}
                      showSign={true}
                      className="font-medium"
                    >
                      {formatAmountCurrency(Math.abs(asset.unrealizedAssetProfitBaseCurrency || 0), baseCurrency, baseCurrency)}
                    </AmountText>
                  </div>
                  <div className="flex justify-between">
                    <LabelWithTooltip
                      label="Keuntungan Kurs"
                      tooltip="Keuntungan karena perubahan nilai tukar mata uang."
                      className="text-muted-foreground"
                    />
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
              label="Total Keuntungan"
              tooltip="Total keuntungan dari aset ini (terealisasi + belum terealisasi)."
              originalValue={asset.totalProfit}
              originalCurrency={asset.originalCurrencyCode}
              baseValue={asset.totalProfitBaseCurrency}
              baseCurrency={baseCurrency}
              showSign={true}
            />

            {!asset.isTrackable && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-muted/50 border border-dashed">
                <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground">
                  Aset ini tidak memiliki pencatatan nilai pasar (Non-trackable).
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const WalletHierarchyItem = ({
  wallet,
  baseCurrency,
  mode = "nested",
  Icon = Wallet,
}: {
  wallet: WalletBreakdownForInstrument | WalletFirstBreakdown;
  baseCurrency: string;
  mode?: "nested" | "leaf";
  Icon?: ElementType;
}) => {
  const isWalletFirst = "goals" in wallet;
  const hasGoals = isWalletFirst && wallet.goals.length > 0;
  const hasAssets = !isWalletFirst && "assets" in wallet && wallet.assets.some((a) => a.assetId !== null);

  if (mode === "leaf" || (!hasGoals && !hasAssets)) {
    return (
      <BreakdownHierarchyLeaf
        Icon={Icon}
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
  }

  return (
    <BreakdownHierarchyGroup
      Icon={Icon}
      name={wallet.walletName}
      badgeContent={
        isWalletFirst ? (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 mt-0.5">
            {wallet.originalCurrencyCode}
          </Badge>
        ) : undefined
      }
      originalCurrency={wallet.originalCurrencyCode}
      activeCapital={wallet.activeCapital}
      activeCapitalBase={wallet.activeCapitalBaseCurrency}
      currentValue={wallet.currentValue}
      currentValueBase={wallet.currentValueBaseCurrency}
      totalProfit={wallet.totalProfit}
      totalProfitBase={wallet.totalProfitBaseCurrency}
      baseCurrency={baseCurrency}
      childCount={isWalletFirst ? wallet.goals.length : (wallet as WalletBreakdownForInstrument).assets.length}
      childLabel={isWalletFirst ? "Goal" : "Aset"}
    >
      {isWalletFirst
        ? (wallet as WalletFirstBreakdown).goals
          .sort(
            (a, b) =>
              b.currentValueBaseCurrency - a.currentValueBaseCurrency ||
              b.totalProfitBaseCurrency - a.totalProfitBaseCurrency
          )
          .map((goal) => <GoalHierarchyItem key={goal.goalId} goal={goal} baseCurrency={baseCurrency} mode="nested" />)
        : (wallet as WalletBreakdownForInstrument).assets
          .sort(
            (a, b) =>
              (b.currentValueBaseCurrency || 0) - (a.currentValueBaseCurrency || 0) ||
              b.totalProfitBaseCurrency - a.totalProfitBaseCurrency
          )
          .map((asset, idx) => <AssetItemHierarchy key={idx} asset={asset} baseCurrency={baseCurrency} />)}
    </BreakdownHierarchyGroup>
  );
};

export const GoalHierarchyItem = ({
  goal,
  baseCurrency,
  mode = "nested",
  Icon = Target,
}: {
  goal: GoalBreakdownForInstrument | GoalUnderWallet;
  baseCurrency: string;
  mode?: "nested" | "leaf";
  Icon?: ElementType;
}) => {
  const isGoalFirst = "wallets" in goal;
  const hasWallets = isGoalFirst && goal.wallets.length > 0;
  const hasAssets = !isGoalFirst && "assets" in goal && goal.assets.some((a) => a.assetId !== null);

  if (mode === "leaf" || (!hasWallets && !hasAssets)) {
    return (
      <BreakdownHierarchyLeaf
        Icon={Icon}
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
  }

  return (
    <BreakdownHierarchyGroup
      Icon={Icon}
      name={goal.goalName}
      subtitle={
        isGoalFirst ? (
          <p className="text-xs text-muted-foreground">{(goal as GoalBreakdownForInstrument).wallets.length} wallet</p>
        ) : undefined
      }
      originalCurrency={goal.originalCurrencyCode}
      activeCapital={goal.activeCapital}
      activeCapitalBase={goal.activeCapitalBaseCurrency}
      currentValue={goal.currentValue}
      currentValueBase={goal.currentValueBaseCurrency}
      totalProfit={goal.totalProfit}
      totalProfitBase={goal.totalProfitBaseCurrency}
      baseCurrency={baseCurrency}
      childCount={isGoalFirst ? (goal as GoalBreakdownForInstrument).wallets.length : (goal as GoalUnderWallet).assets.length}
      childLabel={isGoalFirst ? "Wallet" : "Aset"}
    >
      {isGoalFirst
        ? (goal as GoalBreakdownForInstrument).wallets
          .sort(
            (a, b) =>
              b.currentValueBaseCurrency - a.currentValueBaseCurrency ||
              b.totalProfitBaseCurrency - a.totalProfitBaseCurrency
          )
          .map((wallet) => (
            <WalletHierarchyItem key={wallet.walletId} wallet={wallet} baseCurrency={baseCurrency} mode="nested" />
          ))
        : (goal as GoalUnderWallet).assets
          .sort(
            (a, b) =>
              (b.currentValueBaseCurrency || 0) - (a.currentValueBaseCurrency || 0) ||
              b.totalProfitBaseCurrency - a.totalProfitBaseCurrency
          )
          .map((asset, idx) => <AssetItemHierarchy key={idx} asset={asset} baseCurrency={baseCurrency} />)}
    </BreakdownHierarchyGroup>
  );
};

// ============= Section Layout Container =============
interface BreakdownSectionLayoutProps {
  title: string;
  icon: ElementType;
  childCount: number;
  childLabel: string;
  hierarchyDescription: string;
  onModeToggle: () => void;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export const BreakdownSectionLayout = ({
  title,
  icon: Icon,
  childCount,
  childLabel,
  hierarchyDescription,
  onModeToggle,
  children,
  isOpen,
  onOpenChange,
  className = "",
}: BreakdownSectionLayoutProps) => {
  return (
    <Card className={`border shadow-sm overflow-hidden ${className}`}>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CardHeader className="cursor-pointer pb-3 hover:bg-muted/30 transition-colors" onClick={() => onOpenChange(!isOpen)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="w-5 h-5 text-primary" />
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                  {childCount} {childLabel}
                </span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center justify-between py-2 border-b border-dashed">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Hierarki: {hierarchyDescription}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onModeToggle();
                }}
                className="h-7 gap-1.5 text-[10px] font-bold"
              >
                <ArrowLeftRight className="w-3 h-3" />
                Ganti Tampilan
              </Button>
            </div>
            <div className="space-y-4 pt-2">
              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
