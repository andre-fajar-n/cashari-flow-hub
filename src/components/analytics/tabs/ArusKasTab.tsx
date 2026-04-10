import { ArrowLeftRight } from "lucide-react";

const ArusKasTab = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 border mb-4">
        <ArrowLeftRight className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">Arus Kas</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Grafik tren pemasukan vs pengeluaran dan breakdown per kategori. Tersedia di Sprint 2.
      </p>
    </div>
  );
};

export default ArusKasTab;
