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

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    onChange?.(range);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-center items-center font-normal h-[52px] px-3",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          {date?.from ? (
            date.to ? (
              <div className="flex flex-col text-sm leading-tight text-center">
                <span className="truncate">{format(date.from, "dd MMM yyyy", { locale: id })}</span>
                <span className="truncate">-</span>
                <span className="truncate">{format(date.to, "dd MMM yyyy", { locale: id })}</span>
              </div>
            ) : (
              <div className="flex flex-col text-sm leading-tight text-center">
                <span className="truncate">{format(date.from, "dd MMM yyyy", { locale: id })}</span>
                <span className="truncate">- Sekarang</span>
              </div>
            )
          ) : (
            <span className="text-sm text-center">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={id}
        />
      </PopoverContent>
    </Popover>
  );
}

