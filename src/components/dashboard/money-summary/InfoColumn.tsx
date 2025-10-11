import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/date";
import { InfoColumnData } from "@/components/dashboard/money-summary/types";

interface InfoColumnProps {
  data: InfoColumnData;
}

export const InfoColumn = ({ data }: InfoColumnProps) => (
  <div className="text-center space-y-1">
    <div className="flex justify-center items-center gap-2">
      <Badge variant="outline" className="text-xs">
        {data.name}
      </Badge>
      {data.hasNullRate && (
        <div title="Exchange rate tidak tersedia">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
      )}
    </div>
    
    {data.rate && data.rateDate && (
      <div className="text-xs text-muted-foreground">
        <div>Rate per: {formatDate(data.rateDate)}</div>
        <div>Rate: {data.rate.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</div>
      </div>
    )}

    {data.assetValueDate && (
      <div className="text-xs text-muted-foreground">
        Nilai Aset per: {formatDate(data.assetValueDate)}
      </div>
    )}

    {data.unit && (
      <div className="text-xs text-muted-foreground">
        Unit: {data.unit.toLocaleString("id-ID", { maximumFractionDigits: 4 })}
      </div>
    )}
    
    {data.hasNullRate && (
      <div className="text-xs text-amber-600">
        Rate tidak tersedia
      </div>
    )}
  </div>
);
