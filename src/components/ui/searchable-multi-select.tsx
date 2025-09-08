import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface SearchableMultiSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SearchableMultiSelectProps {
  options: SearchableMultiSelectOption[];
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxSelected?: number;
  showSelectedCount?: boolean;
  className?: string;
}

export const SearchableMultiSelect = React.forwardRef<
  React.ElementRef<typeof Button>,
  SearchableMultiSelectProps
>(({
  options = [],
  value = [],
  onValueChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ditemukan",
  disabled = false,
  searchable = true,
  maxSelected,
  showSelectedCount = true,
  className,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOptions = React.useMemo(() => 
    options.filter(option => value.includes(option.value)),
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
    const newValue = value.includes(selectedValue)
      ? value.filter(v => v !== selectedValue)
      : [...value, selectedValue];
    onValueChange?.(newValue);
  };

  const handleRemove = (valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newValue = value.filter(v => v !== valueToRemove);
    onValueChange?.(newValue);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const displayText = React.useMemo(() => {
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    if (showSelectedCount && selectedOptions.length > 2) {
      return `${selectedOptions.length} dipilih`;
    }
    return selectedOptions.map(opt => opt.label).join(", ");
  }, [selectedOptions, placeholder, showSelectedCount]);

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
            "w-full justify-between h-auto min-h-10 px-3 py-2 text-sm",
            selectedOptions.length === 0 && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="truncate">{placeholder}</span>
            ) : selectedOptions.length <= 2 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs h-6 px-2 py-0 gap-1"
                >
                  <span className="truncate max-w-24">{option.label}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemove(option.value, e)}
                  />
                </Badge>
              ))
            ) : (
              <>
                <Badge
                  key={selectedOptions[0].value}
                  variant="secondary"
                  className="text-xs h-6 px-2 py-0 gap-1"
                >
                  <span className="truncate max-w-24">{selectedOptions[0].label}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemove(selectedOptions[0].value, e)}
                  />
                </Badge>
                {selectedOptions.length > 1 && (
                  <Badge variant="outline" className="text-xs h-6 px-2 py-0">
                    +{selectedOptions.length - 1} lainnya
                  </Badge>
                )}
              </>
            )}
          </div>
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
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  const isDisabled = option.disabled || (maxSelected && !isSelected && value.length >= maxSelected);
                  
                  return (
                    <div
                      key={option.value}
                      onClick={() => !isDisabled && handleSelect(option.value)}
                      className={cn(
                        "flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer transition-colors",
                        isDisabled 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

SearchableMultiSelect.displayName = "SearchableMultiSelect";
