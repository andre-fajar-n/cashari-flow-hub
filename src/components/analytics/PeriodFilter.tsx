import { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  addDays,
  addYears,
  differenceInDays
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, BarChart2, CalendarRange, Info } from "lucide-react";

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

const MAX_MONTHS = 24;
const MAX_DAYS = 31;
const MAX_YEARS = 10;

function clampRange(type: PeriodType, from: Date, to: Date): { from: Date; to: Date } {
  if (type === "monthly") {
    const calendarMonthDiff =
      (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (calendarMonthDiff >= MAX_MONTHS) {
      return { from, to: endOfMonth(addMonths(from, MAX_MONTHS - 1)) };
    }
  } else if (type === "daily") {
    const dayDiff = differenceInDays(to, from);
    if (dayDiff >= MAX_DAYS) {
      return { from, to: addDays(from, MAX_DAYS - 1) };
    }
  } else if (type === "yearly") {
    const yearDiff = to.getFullYear() - from.getFullYear();
    if (yearDiff >= MAX_YEARS) {
      return { from, to: endOfYear(addYears(from, MAX_YEARS - 1)) };
    }
  }
  return { from, to };
}

function getDefaultRange(type: PeriodType): { from: Date; to: Date } {
  const now = new Date();
  if (type === "daily") {
    return { from: startOfMonth(now), to: now };
  } else if (type === "yearly") {
    return { from: startOfYear(addYears(now, -2)), to: endOfYear(now) };
  }
  return { from: startOfYear(now), to: endOfMonth(now) };
}

const PeriodFilter = ({
  onPeriodChange,
  initialType = "monthly",
  initialStart = startOfMonth(new Date()),
  initialEnd = endOfMonth(new Date())
}: PeriodFilterProps) => {
  const [type, setType] = useState<PeriodType>(initialType);
  const [range, setRange] = useState<{ from: Date; to: Date }>(() =>
    clampRange(initialType, initialStart, initialEnd)
  );
  const [isClamped, setIsClamped] = useState<boolean>(() => {
    const clamped = clampRange(initialType, initialStart, initialEnd);
    return clamped.to.getTime() !== initialEnd.getTime();
  });

  useEffect(() => {
    onPeriodChange(type, range.from, range.to);
  }, [type, range, onPeriodChange]);

  const handleTypeChange = (v: string) => {
    const newType = v as PeriodType;
    setType(newType);
    const defaultRange = getDefaultRange(newType);
    setIsClamped(false);
    setRange(defaultRange);
  };

  const handleRangeChange = (newRange: { from: Date; to: Date } | undefined) => {
    if (newRange?.from && newRange?.to) {
      const clamped = clampRange(type, newRange.from, newRange.to);
      const wasClamped = clamped.to.getTime() !== newRange.to.getTime();
      setIsClamped(wasClamped);
      setRange(clamped);
    }
  };

  const limitLabel =
    type === "monthly"
      ? `Maksimal ${MAX_MONTHS} bulan`
      : type === "daily"
        ? `Maksimal ${MAX_DAYS} hari`
        : `Maksimal ${MAX_YEARS} tahun`;

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
              <Select value={type} onValueChange={handleTypeChange}>
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
                {limitLabel && (
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground/70 normal-case tracking-normal">
                    ({limitLabel})
                  </span>
                )}
              </label>
              <DateRangePicker
                value={range}
                onChange={handleRangeChange}
                mode={type}
              />
              {isClamped && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                  <Info className="h-3 w-3 shrink-0" />
                  <span>Rentang dipotong otomatis — {limitLabel?.toLowerCase()} per tampilan grafik.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodFilter;
