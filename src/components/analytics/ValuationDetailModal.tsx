import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useValuationDetail } from "@/hooks/queries/use-valuation-detail";
import { formatAmountCurrency } from "@/lib/currency";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, CheckCircle2, RefreshCw, Pencil, Loader2, X, Save } from "lucide-react";
import { useFetchExchangeRates } from "@/hooks/mutations/use-fetch-exchange-rates";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateInvestmentAssetValue } from "@/hooks/queries";
import { ValuationStatus } from "@/lib/balance-trend";

interface ValuationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
}

const ValuationDetailModal = ({ isOpen, onClose, date }: ValuationDetailModalProps) => {
  const { data: details, isLoading } = useValuationDetail(isOpen ? date : null);

  const fetchFXRate = useFetchExchangeRates();
  const updatePrice = useCreateInvestmentAssetValue();

  const [editingPrice, setEditingPrice] = useState<{ asset_id: string; price: string } | null>(null);

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
      case 'Old Price':
      case 'Old FX': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Missing': return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ValuationStatus) => {
    switch (status) {
      case 'Exact': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Lengkap</Badge>;
      case 'Old Price': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Harga Lama</Badge>;
      case 'Old FX': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Kurs Lama</Badge>;
      case 'Missing': return <Badge variant="destructive">Tidak Lengkap</Badge>;
    }
  };

  const formattedDate = date && isValid(parseISO(date))
    ? format(parseISO(date), "dd MMMM yyyy", { locale: id })
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Detail Valuasi - {formattedDate}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aset</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead>Mata Uang</TableHead>
                <TableHead>Tgl Harga</TableHead>
                <TableHead className="text-right">Kurs FX</TableHead>
                <TableHead>Tgl FX</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
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
                  <TableCell className="font-medium">{detail.asset_name}</TableCell>
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
                  <TableCell className="text-center font-mono text-xs">
                    {detail.original_currency_code}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {detail.price_date ? format(parseISO(detail.price_date), "dd MMM", { locale: id }) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.fx_rate ? detail.fx_rate.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {detail.fx_date ? format(parseISO(detail.fx_date), "dd MMM", { locale: id }) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(detail.status)}
                      {getStatusBadge(detail.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(detail.status === 'Old FX' || detail.status === 'Missing') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => date && fetchFXRate.mutate(date)}
                          disabled={fetchFXRate.isPending}
                        >
                          {fetchFXRate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                      )}
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
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingPrice({ asset_id: detail.asset_id, price: detail.price?.toString() || "" })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValuationDetailModal;
