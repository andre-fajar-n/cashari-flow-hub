import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  addYears,
  subYears,
  isAfter,
  isBefore,
  isSameMonth,
  isSameYear
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  mode?: "daily" | "monthly" | "yearly";
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  mode = "daily",
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  const [viewDate, setViewDate] = React.useState<Date>(value?.from || new Date());

  React.useEffect(() => {
    setDate(value);
    if (value?.from) setViewDate(value.from);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      setDate(undefined);
      onChange?.(undefined);
      return;
    }

    let newRange = range;

    if (mode === "monthly") {
      if (range.from && range.to) {
        newRange = {
          from: startOfMonth(range.from),
          to: endOfMonth(range.to),
        };
      } else if (range.from) {
        newRange = {
          from: startOfMonth(range.from),
          to: endOfMonth(range.from),
        };
      }
    } else if (mode === "yearly") {
      if (range.from && range.to) {
        newRange = {
          from: startOfYear(range.from),
          to: endOfYear(range.to),
        };
      } else if (range.from) {
        newRange = {
          from: startOfYear(range.from),
          to: endOfYear(range.from),
        };
      }
    }

    setDate(newRange);
    onChange?.(newRange);
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  const handleMonthClick = (monthIndex: number) => {
    const selectedMonth = new Date(viewDate.getFullYear(), monthIndex, 1);

    // Logic: 
    // - If no selection or range is already completed (from != to), start new selection
    // - If we have a single selected month (from == to), set as range
    const isRangeAlreadySelected = date?.from && date?.to && !isSameMonth(date.from, date.to);

    if (!date?.from || isRangeAlreadySelected) {
      handleSelect({ from: selectedMonth, to: selectedMonth });
    } else {
      const from = date.from;
      const to = selectedMonth;
      if (isBefore(to, from)) {
        handleSelect({ from: to, to: from });
      } else {
        handleSelect({ from, to });
      }
    }
  };

  const handleYearClick = (year: number) => {
    const selectedYear = new Date(year, 0, 1);

    const isRangeAlreadySelected = date?.from && date?.to && !isSameYear(date.from, date.to);

    if (!date?.from || isRangeAlreadySelected) {
      handleSelect({ from: selectedYear, to: selectedYear });
    } else {
      const from = date.from;
      const to = selectedYear;
      if (isBefore(to, from)) {
        handleSelect({ from: to, to: from });
      } else {
        handleSelect({ from, to });
      }
    }
  };

  const renderMonthPicker = () => {
    return (
      <div className="p-3 w-[280px]">
        <div className="flex items-center justify-between mb-4 px-1">
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => setViewDate(subYears(viewDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{viewDate.getFullYear()}</div>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => setViewDate(addYears(viewDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const currentMonth = new Date(viewDate.getFullYear(), index, 1);
            const isSelected = date?.from && date?.to && (
              (isAfter(currentMonth, startOfMonth(date.from)) || isSameMonth(currentMonth, date.from)) &&
              (isBefore(currentMonth, endOfMonth(date.to)) || isSameMonth(currentMonth, date.to))
            );
            const isStart = date?.from && isSameMonth(currentMonth, date.from);
            const isEnd = date?.to && isSameMonth(currentMonth, date.to);

            return (
              <Button
                key={month}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "h-9 w-full text-sm font-normal",
                  isSelected && !isStart && !isEnd && "bg-accent text-accent-foreground hover:bg-accent",
                  isStart && "rounded-r-none",
                  isEnd && "rounded-l-none",
                  isSelected && isStart && isEnd && "rounded-md"
                )}
                onClick={() => handleMonthClick(index)}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearPicker = () => {
    const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div className="p-3 w-[280px]">
        <div className="flex items-center justify-between mb-4 px-1">
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => setViewDate(subYears(viewDate, 12))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {years[0]} - {years[years.length - 1]}
          </div>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => setViewDate(addYears(viewDate, 12))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => {
            const currentYear = new Date(year, 0, 1);
            const isSelected = date?.from && date?.to && (
              (isAfter(currentYear, startOfYear(date.from)) || isSameYear(currentYear, date.from)) &&
              (isBefore(currentYear, endOfYear(date.to)) || isSameYear(currentYear, date.to))
            );
            const isStart = date?.from && isSameYear(currentYear, date.from);
            const isEnd = date?.to && isSameYear(currentYear, date.to);

            return (
              <Button
                key={year}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "h-9 w-full text-sm font-normal",
                  isSelected && !isStart && !isEnd && "bg-accent text-accent-foreground hover:bg-accent",
                  isStart && "rounded-r-none",
                  isEnd && "rounded-l-none",
                  isSelected && isStart && isEnd && "rounded-md"
                )}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start items-center font-normal min-h-9 h-auto py-2 px-3 w-full",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          {date?.from ? (
            date.to && !isSameDay(date.from, date.to) ? (
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-snug min-w-0">
                <span className="whitespace-nowrap">
                  {mode === 'yearly' ? format(date.from, "yyyy") :
                    mode === 'monthly' ? format(date.from, "MMM yyyy", { locale: id }) :
                      format(date.from, "dd MMM yyyy", { locale: id })}
                </span>
                <span className="text-muted-foreground">—</span>
                <span className="whitespace-nowrap">
                  {mode === 'yearly' ? format(date.to, "yyyy") :
                    mode === 'monthly' ? format(date.to, "MMM yyyy", { locale: id }) :
                      format(date.to, "dd MMM yyyy", { locale: id })}
                </span>
              </span>
            ) : (
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-snug min-w-0">
                <span className="whitespace-nowrap">
                  {mode === 'yearly' ? format(date.from, "yyyy") :
                    mode === 'monthly' ? format(date.from, "MMM yyyy", { locale: id }) :
                      format(date.from, "dd MMM yyyy", { locale: id })}
                </span>
                {mode === 'daily' && (
                  <>
                    <span className="text-muted-foreground">—</span>
                    <span className="whitespace-nowrap">Sekarang</span>
                  </>
                )}
              </span>
            )
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === 'daily' ? (
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={id}
          />
        ) : mode === 'monthly' ? (
          renderMonthPicker()
        ) : (
          renderYearPicker()
        )}
      </PopoverContent>
    </Popover>
  );
}

