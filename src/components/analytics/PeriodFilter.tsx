import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, BarChart2, CalendarRange } from "lucide-react";

export type PeriodType = "daily" | "monthly" | "yearly";

interface PeriodFilterProps {
  onPeriodChange: (type: PeriodType, start: Date, end: Date) => void;
  initialType?: PeriodType;
  initialStart?: Date;
  initialEnd?: Date;
}

const periodLabels: Record<PeriodType, string> = {
  daily: "Harian",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

const PeriodFilter = ({
  onPeriodChange,
  initialType = "monthly",
  initialStart = startOfMonth(new Date()),
  initialEnd = endOfMonth(new Date())
}: PeriodFilterProps) => {
  const [type, setType] = useState<PeriodType>(initialType);
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: initialStart,
    to: initialEnd,
  });

  useEffect(() => {
    onPeriodChange(type, range.from, range.to);
  }, [type, range, onPeriodChange]);

  return (
    <Card className="border bg-card shadow-none">
      <CardContent className="py-4 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Label */}
          <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
            <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filter Periode</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Period type selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <CalendarRange className="h-3 w-3" />
                Granularitas
              </label>
              <Select value={type} onValueChange={(v) => setType(v as PeriodType)}>
                <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" />
                Rentang Tanggal
              </label>
              <DateRangePicker
                value={range}
                onChange={(newRange) => {
                  if (newRange?.from && newRange?.to) {
                    setRange({ from: newRange.from, to: newRange.to });
                  }
                }}
                mode={type}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodFilter;
