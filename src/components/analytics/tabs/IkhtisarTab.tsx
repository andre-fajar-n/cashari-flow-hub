import { BarChart3 } from "lucide-react";

const IkhtisarTab = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 border mb-4">
        <BarChart3 className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">Ikhtisar</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Ringkasan metrik keuangan dari semua tab akan tampil di sini. Tersedia di Sprint 2.
      </p>
    </div>
  );
};

export default IkhtisarTab;
