import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableComboboxOption {
  label: string
  value: string
  disabled?: boolean
}

interface SearchableComboboxProps {
  options: SearchableComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  name?: string
}

export const SearchableCombobox = React.forwardRef<
  React.ElementRef<typeof Button>,
  SearchableComboboxProps
>(({
  options = [],
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  disabled = false,
  className,
  name,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(() => 
    options.find(option => option.value === value),
    [options, value]
  )

  const handleSelect = (selectedValue: string) => {
    const option = options.find(opt => opt.value === selectedValue)
    if (option && !option.disabled) {
      onValueChange?.(selectedValue === value ? "" : selectedValue)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={name ? `${name} combobox` : "combobox"}
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
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={handleSelect}
                  className={cn(
                    "flex items-center justify-between",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})

SearchableCombobox.displayName = "SearchableCombobox"