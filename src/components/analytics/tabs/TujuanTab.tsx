import { Target } from "lucide-react";

const TujuanTab = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 border mb-4">
        <Target className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">Tujuan</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Grafik progres tabungan per tujuan dengan proyeksi pencapaian. Tersedia di Sprint 4.
      </p>
    </div>
  );
};

export default TujuanTab;
