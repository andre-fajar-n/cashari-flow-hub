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

export type PeriodType = "daily" | "monthly" | "yearly";

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
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: initialStart,
    to: initialEnd,
  });

  useEffect(() => {
    onPeriodChange(type, range.from, range.to);
  }, [type, range, onPeriodChange]);

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-[200px]">
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
              Jenis Pilihan
            </label>
            <Select value={type} onValueChange={(v) => setType(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
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
      </CardContent>
    </Card>
  );
};

export default PeriodFilter;
