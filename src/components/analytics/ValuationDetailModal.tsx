import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useValuationDetail } from "@/hooks/queries/use-valuation-detail";
import { formatAmountCurrency } from "@/lib/currency";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, CheckCircle2, RefreshCw, Pencil, Loader2, X, Save, Coins, BarChart2, Calendar } from "lucide-react";
import { useFetchExchangeRates } from "@/hooks/mutations/use-fetch-exchange-rates";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateInvestmentAssetValue } from "@/hooks/queries";
import { ValuationStatus } from "@/lib/balance-trend";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { ZAKAT_CONSTANTS } from "@/lib/zakat";
import { useGoldPriceTrend } from "@/hooks/queries/use-gold-price-trend";
import { cn } from "@/lib/utils/cn";

interface ValuationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  isGoldMode?: boolean;
}

const ValuationDetailModal = ({ isOpen, onClose, date, isGoldMode = false }: ValuationDetailModalProps) => {
  const { data: userSettings } = useUserSettings();
  const { data: details, isLoading } = useValuationDetail(isOpen && !isGoldMode ? date : null);

  const { data: goldTrend } = useGoldPriceTrend(
    date || "",
    date || "",
    'day',
    userSettings?.base_currency_code || ""
  );

  const fetchFXRate = useFetchExchangeRates();
  const updatePrice = useCreateInvestmentAssetValue();

  const [editingPrice, setEditingPrice] = useState<{ asset_id: string; price: string } | null>(null);
  const [fetchingRowKey, setFetchingRowKey] = useState<string | null>(null);

  const handleUpdatePrice = async (asset_id: number) => {
    if (!editingPrice || !date) return;
    await updatePrice.mutateAsync({
      asset_id,
      value: parseFloat(editingPrice.price),
      date
    });
    setEditingPrice(null);
  };

  const getStatusIcon = (status: ValuationStatus) => {
    switch (status) {
      case 'Exact': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Old Price & FX':
      case 'Old Price':
      case 'Old FX': return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      case 'Missing': return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ValuationStatus) => {
    switch (status) {
      case 'Exact':
        return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 h-auto leading-tight whitespace-nowrap">Lengkap</Badge>;
      case 'Old Price & FX':
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400 text-[10px] px-1.5 py-0.5 h-auto">Harga & Kurs Lama</Badge>;
      case 'Old Price':
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400 text-[10px] px-1.5 py-0.5 h-auto">Harga Lama</Badge>;
      case 'Old FX':
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400 text-[10px] px-1.5 py-0.5 h-auto">Kurs Lama</Badge>;
      case 'Missing':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 h-auto leading-tight whitespace-nowrap">Tidak Lengkap</Badge>;
    }
  };

  const formattedDate = date && isValid(parseISO(date))
    ? format(parseISO(date), "dd MMMM yyyy", { locale: id })
    : "";

  const goldData = goldTrend?.[0];
  const isGoldPriceOld = goldData && date && goldData.actual_date !== date;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-background">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
              isGoldMode ? "bg-amber-100 dark:bg-amber-900/50" : "bg-primary/10"
            )}>
              {isGoldMode
                ? <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                : <BarChart2 className="h-5 w-5 text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold">
                {isGoldMode ? "Detail Nisab Zakat" : "Detail Valuasi Aset"}
              </DialogTitle>
              {formattedDate && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {isGoldMode ? (
          <div className="px-6 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Gold calculation card */}
              <div className="p-5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/30 dark:from-amber-950/30 dark:to-amber-950/10 dark:border-amber-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                    <Coins className="w-4 h-4" />
                    <h3 className="text-sm">Kalkulasi Nisab Emas</h3>
                  </div>
                  {isGoldPriceOld && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-100 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-300 text-[10px]">
                      Harga Lama
                    </Badge>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700/70 dark:text-amber-400/70">Standar Nisab</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-200">{ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS} gram emas</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700/70 dark:text-amber-400/70">Harga per gram</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      {goldData
                        ? formatAmountCurrency(goldData.nisab_value / ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS, userSettings?.base_currency_code || "", userSettings?.currencies?.symbol)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700/70 dark:text-amber-400/70">Tanggal harga</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-900 dark:text-amber-200">
                        {goldData?.actual_date ? format(parseISO(goldData.actual_date), "dd MMM yyyy", { locale: id }) : "—"}
                      </span>
                      {isGoldPriceOld && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                          onClick={() => date && fetchFXRate.mutate({
                            date,
                            fromCurrency: 'XAU',
                            toCurrency: userSettings?.base_currency_code
                          })}
                          disabled={fetchFXRate.isPending}
                          title="Sync FX Rate"
                        >
                          {fetchFXRate.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-amber-200 dark:border-amber-700/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-amber-800 dark:text-amber-200">Total Nisab</span>
                    <span className="text-xl font-black text-amber-900 dark:text-amber-100">
                      {goldData ? formatAmountCurrency(goldData.nisab_value, userSettings?.base_currency_code || "", userSettings?.currencies?.symbol) : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info card */}
              <div className="p-5 rounded-xl border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <h3>Tentang Nisab Zakat</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nisab zakat mal setara dengan <strong>85 gram emas murni</strong>. Jika total kekayaan (saldo) Anda pada tanggal ini melebihi nilai nisab, maka Anda diwajibkan menunaikan zakat sebesar <strong>2,5%</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="outline" className="bg-background text-xs">
                    XAU / {userSettings?.base_currency_code}
                  </Badge>
                  <Badge variant="outline" className="bg-background text-xs">
                    Standar: {ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS}g emas
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aset</TableHead>
                  <TableHead className="px-3 text-right py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit</TableHead>
                  <TableHead className="px-3 text-right py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Harga</TableHead>
                  <TableHead className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tgl Harga</TableHead>
                  <TableHead className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mata Uang</TableHead>
                  <TableHead className="px-3 text-right py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kurs</TableHead>
                  <TableHead className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tgl Kurs</TableHead>
                  <TableHead className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  <TableHead className="pr-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j} className="py-3">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : details?.map((detail, idx) => (
                  <TableRow
                    key={detail.asset_id + detail.original_currency_code}
                    className={cn(
                      "transition-colors",
                      idx % 2 === 0 ? "bg-muted/20 hover:bg-muted/40" : "hover:bg-muted/20"
                    )}
                  >
                    <TableCell className="font-medium min-w-[180px] px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold leading-tight">{detail.asset_name}</span>
                        <span className="text-[11px] text-muted-foreground">{detail.instrument_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 text-right py-3 tabular-nums text-sm">
                      {detail.units.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3 text-right py-3">
                      {editingPrice?.asset_id === detail.asset_id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Input
                            type="number"
                            className="w-24 h-7 text-right text-sm"
                            value={editingPrice.price}
                            onChange={(e) => setEditingPrice({ ...editingPrice, price: e.target.value })}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdatePrice(Number(detail.asset_id));
                              if (e.key === 'Escape') setEditingPrice(null);
                            }}
                          />
                        </div>
                      ) : (
                        <span className="tabular-nums text-sm">
                          {detail.price ? formatAmountCurrency(detail.price, "", "") : "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 whitespace-nowrap py-3 text-sm text-muted-foreground">
                      {detail.price_date ? format(parseISO(detail.price_date), "dd MMM yyyy", { locale: id }) : "—"}
                    </TableCell>
                    <TableCell className="px-3 text-center py-3">
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 h-5 bg-background">
                        {detail.original_currency_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 text-right py-3 tabular-nums text-sm text-muted-foreground">
                      {detail.fx_rate ? detail.fx_rate.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="px-3 whitespace-nowrap py-3 text-sm text-muted-foreground">
                      {detail.fx_date ? format(parseISO(detail.fx_date), "dd MMM yyyy", { locale: id }) : "—"}
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(detail.status)}
                        {getStatusBadge(detail.status)}
                      </div>
                    </TableCell>
                    <TableCell className="pr-5 py-3">
                      <div className="flex items-center gap-1">
                        {detail.is_trackable && (
                          editingPrice?.asset_id === detail.asset_id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleUpdatePrice(Number(detail.asset_id))}
                              >
                                <Save className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive/80"
                                onClick={() => setEditingPrice(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : detail.price_date !== date ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => setEditingPrice({ asset_id: detail.asset_id, price: detail.price?.toString() || "" })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          ) : null
                        )}
                        {(detail.status === 'Old FX' || detail.status === 'Missing' || detail.status === 'Old Price & FX') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              if (!date) return;
                              const rowKey = `${detail.asset_id}:${detail.original_currency_code}`;
                              setFetchingRowKey(rowKey);
                              fetchFXRate.mutate(
                                { date, fromCurrency: detail.original_currency_code, toCurrency: userSettings?.base_currency_code },
                                { onSettled: () => setFetchingRowKey(null) }
                              );
                            }}
                            disabled={fetchingRowKey === `${detail.asset_id}:${detail.original_currency_code}`}
                          >
                            {fetchingRowKey === `${detail.asset_id}:${detail.original_currency_code}`
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <RefreshCw className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && (!details || details.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BarChart2 className="h-8 w-8 opacity-30" />
                        <span className="text-sm">Tidak ada data aset untuk tanggal ini</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ValuationDetailModal;
