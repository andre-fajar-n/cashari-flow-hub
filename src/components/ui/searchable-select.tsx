import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
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
  HTMLDivElement,
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
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

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
    setHighlightedIndex(-1);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
      setHighlightedIndex(-1);
    } else {
      // Focus input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const option = filteredOptions[highlightedIndex];
          if (!option.disabled) {
            handleSelect(option.value);
          }
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            return nextIndex;
          });
        }
        break;
      case "Tab":
        if (open) {
          setOpen(false);
        }
        break;
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setHighlightedIndex(-1);

    // Open dropdown when typing
    if (!open) {
      setOpen(true);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!open) {
      setOpen(true);
    }
  };

  // Reset highlighted index when filtered options change
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Scroll highlighted option into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? "searchable-select-listbox" : undefined}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
            onClick={() => !disabled && !open && setOpen(true)}
          >
            <input
              ref={inputRef}
              type="text"
              value={searchable ? searchValue : (selectedOption?.label || "")}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={selectedOption ? selectedOption.label : placeholder}
              disabled={disabled}
              readOnly={!searchable}
              className={cn(
                "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                !selectedOption && "text-muted-foreground",
                !searchable && "cursor-pointer"
              )}
              aria-autocomplete={searchable ? "list" : "none"}
              aria-activedescendant={
                highlightedIndex >= 0 ? `option-${filteredOptions[highlightedIndex]?.value}` : undefined
              }
            />
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <div
            ref={listRef}
            role="listbox"
            id="searchable-select-listbox"
            className="flex flex-col max-h-80 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    id={`option-${option.value}`}
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer transition-colors",
                      option.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent text-accent-foreground",
                      highlightedIndex === index && "bg-accent text-accent-foreground"
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
        </PopoverContent>
      </Popover>
    </div>
  );
});

SearchableSelect.displayName = "SearchableSelect";
