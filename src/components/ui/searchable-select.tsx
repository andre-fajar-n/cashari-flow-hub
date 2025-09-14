import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SearchableSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

export const SearchableSelect = React.forwardRef<
  React.ElementRef<typeof Button>,
  SearchableSelectProps
>(({
  options = [],
  value,
  onValueChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ditemukan",
  disabled = false,
  searchable = true,
  className,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOption = React.useMemo(() => 
    options.find(option => option.value === value),
    [options, value]
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.value.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setOpen(false);
    setSearchValue("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-10 px-3 py-2 text-sm",
            !selectedOption && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="flex flex-col max-h-80">
          {searchable && (
            <div className="border-b p-3">
              <input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-9 px-3 py-2 text-sm bg-transparent border border-input rounded-md outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          )}
          <div className="flex-1 overflow-y-auto max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    className={cn(
                      "flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer transition-colors",
                      option.disabled 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

SearchableSelect.displayName = "SearchableSelect";
