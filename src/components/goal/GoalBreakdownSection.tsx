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
  TrendingUp, 
  BarChart3,
  HelpCircle,
  AlertCircle,
  ListTree
} from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { 
  buildBreakdownData, 
  WalletBreakdown, 
  InstrumentBreakdown, 
  AssetBreakdown,
  InvestmentSummaryExtended 
} from "@/hooks/queries/use-goal-detail-summary";

interface GoalBreakdownSectionProps {
  items: InvestmentSummaryExtended[];
  baseCurrencyCode: string;
  baseCurrencySymbol: string;
}

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

const MetricRow = ({ 
  label, 
  tooltip, 
  originalValue, 
  originalCurrency, 
  baseValue, 
  baseCurrency,
  showSign = false,
  hideBase = false,
}: { 
  label: string; 
  tooltip: string;
  originalValue: number;
  originalCurrency: string;
  baseValue: number;
  baseCurrency: string;
  showSign?: boolean;
  hideBase?: boolean;
}) => (
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
      {!hideBase && originalCurrency !== baseCurrency && (
        <p className="text-xs text-muted-foreground">
          ≈ {formatAmountCurrency(baseValue, baseCurrency, baseCurrency)}
        </p>
      )}
    </div>
  </div>
);

// Asset Breakdown Item
const AssetItem = ({ 
  asset, 
  baseCurrency 
}: { 
  asset: AssetBreakdown; 
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg ml-8 bg-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">{asset.assetName || 'Unknown Asset'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs">
                    {asset.originalCurrencyCode}
                  </Badge>
                  {asset.isTrackable ? (
                    <Badge variant="secondary" className="text-xs">Trackable</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Non-trackable</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <AmountText amount={asset.totalProfit} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(asset.totalProfit), asset.originalCurrencyCode, asset.originalCurrencyCode)}
                </AmountText>
                <p className="text-xs text-muted-foreground">Total Profit</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-1 border-t">
            {asset.isTrackable ? (
              // Trackable Asset Details
              <>
                <MetricRow
                  label="Total Modal"
                  tooltip="Total dana yang pernah dimasukkan untuk aset ini."
                  originalValue={asset.investedCapital}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.investedCapitalBaseCurrency}
                  baseCurrency={baseCurrency}
                />
                {asset.amountUnit !== null && (
                  <div className="flex justify-between items-center py-1.5">
                    <LabelWithTooltip 
                      label="Jumlah Unit" 
                      tooltip="Jumlah unit aset yang saat ini dimiliki."
                    />
                    <p className="text-sm font-medium">
                      {asset.amountUnit.toLocaleString('id-ID', { maximumFractionDigits: 4 })} unit
                    </p>
                  </div>
                )}
                {asset.avgUnitPrice !== null && (
                  <div className="flex justify-between items-center py-1.5">
                    <LabelWithTooltip 
                      label="Harga Rata-rata" 
                      tooltip="Harga rata-rata per unit saat membeli."
                    />
                    <p className="text-sm font-medium">
                      {formatAmountCurrency(asset.avgUnitPrice, asset.originalCurrencyCode, asset.originalCurrencyCode)}
                    </p>
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
                <MetricRow
                  label="Nilai Saat Ini"
                  tooltip="Nilai aset berdasarkan harga pasar terakhir dikalikan jumlah unit."
                  originalValue={asset.currentValue}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.currentValueBaseCurrency}
                  baseCurrency={baseCurrency}
                />
                <div className="border-t my-2" />
                <MetricRow
                  label="Keuntungan Terealisasi"
                  tooltip="Keuntungan yang sudah benar-benar diterima dari penjualan aset."
                  originalValue={asset.realizedProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.realizedProfitBaseCurrency}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />
                <MetricRow
                  label="Keuntungan Belum Terealisasi"
                  tooltip="Keuntungan di atas kertas yang belum dicairkan, dihitung dari selisih nilai saat ini dengan modal."
                  originalValue={asset.unrealizedProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.unrealizedProfitBaseCurrency || 0}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />
                {asset.unrealizedCurrencyProfit !== null && asset.unrealizedCurrencyProfit !== 0 && (
                  <div className="flex justify-between items-center py-1.5">
                    <LabelWithTooltip 
                      label="Keuntungan dari Kurs" 
                      tooltip="Keuntungan karena perubahan nilai tukar mata uang."
                    />
                    <AmountText 
                      amount={asset.unrealizedCurrencyProfit} 
                      showSign={true} 
                      className="text-sm font-medium"
                    >
                      {formatAmountCurrency(Math.abs(asset.unrealizedCurrencyProfit), baseCurrency, baseCurrency)}
                    </AmountText>
                  </div>
                )}
              </>
            ) : (
              // Non-trackable Asset Details
              <>
                <MetricRow
                  label="Total Modal"
                  tooltip="Total dana yang pernah dimasukkan untuk aset ini."
                  originalValue={asset.investedCapital}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.investedCapitalBaseCurrency}
                  baseCurrency={baseCurrency}
                />
                <MetricRow
                  label="Dana Aktif"
                  tooltip="Dana yang saat ini masih berada dalam aset ini."
                  originalValue={asset.activeCapital}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.activeCapitalBaseCurrency}
                  baseCurrency={baseCurrency}
                />
                <div className="border-t my-2" />
                <MetricRow
                  label="Keuntungan Terealisasi"
                  tooltip="Keuntungan yang sudah benar-benar diterima."
                  originalValue={asset.realizedProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.realizedProfitBaseCurrency}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />
                <MetricRow
                  label="Total Profit"
                  tooltip="Total keuntungan dari aset ini."
                  originalValue={asset.totalProfit}
                  originalCurrency={asset.originalCurrencyCode}
                  baseValue={asset.totalProfitBaseCurrency}
                  baseCurrency={baseCurrency}
                  showSign={true}
                />
                <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-muted/50">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
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

// Instrument Breakdown Item
const InstrumentItem = ({ 
  instrument, 
  baseCurrency,
  walletCurrency,
}: { 
  instrument: InstrumentBreakdown; 
  baseCurrency: string;
  walletCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasAssets = instrument.assets.length > 0 && instrument.assets.some(a => a.assetName);

  // If no named assets, show as a simple item
  if (!hasAssets) {
    const singleAsset = instrument.assets[0];
    if (!singleAsset) return null;
    
    return (
      <div className="border rounded-lg ml-4 p-3 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div>
              <p className="font-medium text-sm">{instrument.instrumentName}</p>
              <Badge variant="outline" className="text-xs mt-0.5">
                {walletCurrency}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">
              {formatAmountCurrency(instrument.currentValue, walletCurrency, walletCurrency)}
            </p>
            {walletCurrency !== baseCurrency && (
              <p className="text-xs text-muted-foreground">
                ≈ {formatAmountCurrency(instrument.currentValueBaseCurrency, baseCurrency, baseCurrency)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg ml-4 bg-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">{instrument.instrumentName}</p>
                <p className="text-xs text-muted-foreground">{instrument.assets.length} aset</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <AmountText amount={instrument.totalProfit} showSign={true} className="text-sm font-semibold">
                  {formatAmountCurrency(Math.abs(instrument.totalProfit), walletCurrency, walletCurrency)}
                </AmountText>
                {walletCurrency !== baseCurrency && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatAmountCurrency(instrument.totalProfitBaseCurrency, baseCurrency, baseCurrency)}
                  </p>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 px-2 pb-3">
          {instrument.assets
            .sort((a, b) => b.totalProfitBaseCurrency - a.totalProfitBaseCurrency)
            .map((asset, idx) => (
              <AssetItem key={idx} asset={asset} baseCurrency={baseCurrency} />
            ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Wallet Breakdown Item
const WalletItem = ({ 
  wallet, 
  baseCurrency 
}: { 
  wallet: WalletBreakdown; 
  baseCurrency: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-semibold">{wallet.walletName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs">{wallet.originalCurrencyCode}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {wallet.instruments.length} instrumen
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold">
                  {formatAmountCurrency(wallet.currentValue, wallet.originalCurrencyCode, wallet.originalCurrencyCode)}
                </p>
                {wallet.originalCurrencyCode !== baseCurrency && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatAmountCurrency(wallet.currentValueBaseCurrency, baseCurrency, baseCurrency)}
                  </p>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Wallet summary metrics */}
          <div className="px-4 pb-2 grid grid-cols-2 gap-4 border-t pt-3">
            <div>
              <LabelWithTooltip 
                label="Total Modal" 
                tooltip="Total dana yang pernah dimasukkan melalui wallet ini."
              />
              <p className="text-sm font-medium mt-0.5">
                {formatAmountCurrency(wallet.investedCapital, wallet.originalCurrencyCode, wallet.originalCurrencyCode)}
              </p>
            </div>
            <div>
              <LabelWithTooltip 
                label="Dana Aktif" 
                tooltip="Dana dari wallet ini yang masih berada di goal."
              />
              <p className="text-sm font-medium mt-0.5">
                {formatAmountCurrency(wallet.activeCapital, wallet.originalCurrencyCode, wallet.originalCurrencyCode)}
              </p>
            </div>
          </div>
          
          {/* Instruments list */}
          <div className="px-3 pb-4 space-y-2">
            {wallet.instruments
              .sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency)
              .map((instrument, idx) => (
                <InstrumentItem 
                  key={idx} 
                  instrument={instrument} 
                  baseCurrency={baseCurrency}
                  walletCurrency={wallet.originalCurrencyCode}
                />
              ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const GoalBreakdownSection = ({ items, baseCurrencyCode, baseCurrencySymbol }: GoalBreakdownSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const breakdownData = buildBreakdownData(items);

  if (breakdownData.length === 0) {
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <ListTree className="w-5 h-5" />
                Rincian Goal
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {breakdownData.map((wallet) => (
              <WalletItem 
                key={wallet.walletId} 
                wallet={wallet} 
                baseCurrency={baseCurrencyCode}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default GoalBreakdownSection;