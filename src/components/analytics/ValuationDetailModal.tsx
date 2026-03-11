import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useValuationDetail } from "@/hooks/queries/use-valuation-detail";
import { formatAmountCurrency } from "@/lib/currency";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, CheckCircle2, RefreshCw, Pencil, Loader2, X, Save, Coins } from "lucide-react";
import { useFetchExchangeRates } from "@/hooks/mutations/use-fetch-exchange-rates";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateInvestmentAssetValue } from "@/hooks/queries";
import { ValuationStatus } from "@/lib/balance-trend";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { ZAKAT_CONSTANTS } from "@/lib/zakat";
import { useGoldPriceTrend } from "@/hooks/queries/use-gold-price-trend";

interface ValuationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  isGoldMode?: boolean;
}

const ValuationDetailModal = ({ isOpen, onClose, date, isGoldMode = false }: ValuationDetailModalProps) => {
  const { data: userSettings } = useUserSettings();
  const { data: details, isLoading } = useValuationDetail(isOpen && !isGoldMode ? date : null);

  // Fetch gold trend data for this specific date if in gold mode
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
      case 'Exact': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'Old Price & FX':
      case 'Old Price':
      case 'Old FX': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Missing': return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ValuationStatus) => {
    switch (status) {
      case 'Exact': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Lengkap</Badge>;
      case 'Old Price & FX': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Harga & Kurs Lama</Badge>;
      case 'Old Price': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Harga Lama</Badge>;
      case 'Old FX': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Kurs Lama</Badge>;
      case 'Missing': return <Badge variant="destructive">Tidak Lengkap</Badge>;
    }
  };

  const formattedDate = date && isValid(parseISO(date))
    ? format(parseISO(date), "dd MMMM yyyy", { locale: id })
    : "";

  const goldData = goldTrend?.[0];
  const isGoldPriceOld = goldData && date && goldData.actual_date !== date;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b shrink-0">
          <DialogTitle>
            {isGoldMode ? "Detail Nisab Zakat" : "Detail Valuasi"} - {formattedDate}
          </DialogTitle>
        </DialogHeader>

        {isGoldMode ? (
          <div className="px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl border bg-amber-50/50 border-amber-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <Coins className="w-5 h-5" />
                    <h3>Kalkulasi Nisab Gold</h3>
                  </div>
                  {isGoldPriceOld && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                      Kurs Lama
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700/70">Nisab (Standar)</span>
                    <span className="font-medium text-amber-900">{ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS} gram</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700/70">Harga Emas (per gram)</span>
                    <span className="font-medium text-amber-900">
                      {goldData ? formatAmountCurrency(goldData.nisab_value / ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS, userSettings?.base_currency_code || "", userSettings?.currencies?.symbol) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-amber-700/70">Tanggal Harga</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-900 italic">
                        {goldData?.actual_date ? format(parseISO(goldData.actual_date), "dd MMM yyyy", { locale: id }) : "-"}
                      </span>
                      {isGoldPriceOld && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
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
                  <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                    <span className="text-amber-800 font-bold">Total Nisab</span>
                    <span className="text-lg font-black text-amber-900">
                      {goldData ? formatAmountCurrency(goldData.nisab_value, userSettings?.base_currency_code || "", userSettings?.currencies?.symbol) : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  <h3>Informasi</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nisab zakat mal setara dengan 85 gram emas murni. Jika total kekayaan (saldo) Anda pada tanggal ini melebihi nilai nisab di samping, maka Anda diwajibkan menunaikan zakat sebesar 2,5%.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="bg-background">XAU / {userSettings?.base_currency_code}</Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="px-6">Aset</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead>Tgl Harga</TableHead>
                  <TableHead>Mata Uang</TableHead>
                  <TableHead className="text-right">Kurs Mata Uang</TableHead>
                  <TableHead>Tgl Mata Uang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : details?.map((detail) => (
                  <TableRow key={detail.asset_id + detail.original_currency_code}>
                    <TableCell className="font-medium min-w-[200px] px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{detail.asset_name}</span>
                        <span className="text-xs text-muted-foreground">{detail.instrument_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{detail.units.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {editingPrice?.asset_id === detail.asset_id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Input
                            type="number"
                            className="w-24 h-8 text-right"
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
                        detail.price ? formatAmountCurrency(detail.price, "", "") : "-"
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {detail.price_date ? format(parseISO(detail.price_date), "dd MMM yyyy", { locale: id }) : "-"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {detail.original_currency_code}
                    </TableCell>
                    <TableCell className="text-right">
                      {detail.fx_rate ? detail.fx_rate.toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {detail.fx_date ? format(parseISO(detail.fx_date), "dd MMM yyyy", { locale: id }) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(detail.status)}
                        {getStatusBadge(detail.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {detail.is_trackable && (
                          editingPrice?.asset_id === detail.asset_id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700"
                                onClick={() => handleUpdatePrice(Number(detail.asset_id))}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/80"
                                onClick={() => setEditingPrice(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : detail.price_date !== date ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingPrice({ asset_id: detail.asset_id, price: detail.price?.toString() || "" })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : (
                            <></>
                          )
                        )}
                        {(detail.status === 'Old FX' || detail.status === 'Missing' || detail.status === 'Old Price & FX') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <RefreshCw className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ValuationDetailModal;
