import { TrendingUp } from "lucide-react";

const PortofolioTab = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 border mb-4">
        <TrendingUp className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">Portofolio</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Distribusi investasi, timeline performa, dan dividen. Tersedia di Sprint 2.
      </p>
    </div>
  );
};

export default PortofolioTab;
