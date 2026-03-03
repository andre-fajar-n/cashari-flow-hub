import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent } from "@/components/ui/card";

export type PeriodType = "monthly" | "yearly" | "custom";

interface PeriodFilterProps {
  onPeriodChange: (type: PeriodType, start: Date, end: Date) => void;
  initialType?: PeriodType;
  initialStart?: Date;
  initialEnd?: Date;
}

const PeriodFilter = ({
  onPeriodChange,
  initialType = "monthly",
  initialStart = startOfMonth(new Date()),
  initialEnd = endOfMonth(new Date())
}: PeriodFilterProps) => {
  const [type, setType] = useState<PeriodType>(initialType);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(initialStart, "yyyy-MM"));
  const [selectedYear, setSelectedYear] = useState<string>(format(initialStart, "yyyy"));
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>({
    from: initialStart,
    to: initialEnd,
  });

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2000, i, 1);
    return { value: (i + 1).toString().padStart(2, '0'), label: format(d, "MMMM") };
  });

  useEffect(() => {
    let start: Date;
    let end: Date;

    if (type === "monthly") {
      const [year, month] = selectedMonth.split("-");
      start = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      end = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    } else if (type === "yearly") {
      start = startOfYear(new Date(parseInt(selectedYear), 0));
      end = endOfYear(new Date(parseInt(selectedYear), 11));
    } else {
      start = customRange.from;
      end = customRange.to;
    }

    onPeriodChange(type, start, end);
  }, [type, selectedMonth, selectedYear, customRange, onPeriodChange]);

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-[200px]">
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
              Jenis Periode
            </label>
            <Select value={type} onValueChange={(v) => setType(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
                <SelectItem value="custom">Kustom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "monthly" && (
            <div className="w-full sm:w-[250px]">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
                Pilih Bulan
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedMonth.split('-')[1]}
                  onValueChange={(m) => setSelectedMonth(`${selectedMonth.split('-')[0]}-${m}`)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMonth.split('-')[0]}
                  onValueChange={(y) => setSelectedMonth(`${y}-${selectedMonth.split('-')[1]}`)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === "yearly" && (
            <div className="w-full sm:w-[150px]">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
                Pilih Tahun
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "custom" && (
            <div className="w-full sm:w-auto">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
                Rentang Tanggal
              </label>
              <DateRangePicker
                value={{ from: customRange.from, to: customRange.to }}
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    setCustomRange({ from: range.from, to: range.to });
                  }
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodFilter;
