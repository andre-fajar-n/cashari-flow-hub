import { useMemo, useState } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { BudgetModel } from "@/models/budgets";
import { BusinessProjectModel } from "@/models/business-projects";

interface TransactionAssociationFieldsProps {
  control: Control<any>;
  budgets?: BudgetModel[];
  businessProjects?: BusinessProjectModel[];
}

type Option = { label: string; value: number };

function MultiSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: Option[];
  value: number[];
  onChange: (vals: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = useMemo(() => options.filter(o => value?.includes(o.value)), [options, value]);
  const filtered = useMemo(
    () => options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );
  const toggle = (val: number) => {
    const set = new Set(value || []);
    set.has(val) ? set.delete(val) : set.add(val);
    onChange(Array.from(set));
  };
  const clear = () => onChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-9">
          {selected.length > 0 ? `${selected.length} dipilih` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] sm:w-[420px]">
        <Command>
          <CommandInput placeholder="Cari..." value={search} onValueChange={setSearch} />
          <CommandEmpty>Tidak ditemukan</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {filtered.map((opt) => {
                const isSelected = value?.includes(opt.value) || false;
                return (
                  <CommandItem key={opt.value} onSelect={() => toggle(opt.value)} className="justify-between">
                    <div className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{opt.label}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between border-t px-2 py-2">
            <Button type="button" variant="ghost" size="sm" onClick={clear} className="gap-1">
              <X className="h-3 w-3" /> Bersihkan
            </Button>
            <Button type="button" size="sm" onClick={() => setOpen(false)}>Selesai</Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const TransactionAssociationFields = ({ control, budgets, businessProjects }: TransactionAssociationFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="budget_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kaitkan dengan Budget (Opsional)</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <MultiSelect
                  placeholder="Pilih budget"
                  options={(budgets || []).map((b) => ({ label: b.name, value: b.id }))}
                  value={field.value || []}
                  onChange={field.onChange}
                />
                {field.value?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(budgets || [])
                      .filter((b) => (field.value || []).includes(b.id))
                      .map((b) => (
                        <Badge key={b.id} variant="secondary" className="text-xs">
                          {b.name}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="business_project_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kaitkan dengan Proyek Bisnis (Opsional)</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <MultiSelect
                  placeholder="Pilih proyek bisnis"
                  options={(businessProjects || []).map((p) => ({ label: p.name, value: p.id }))}
                  value={field.value || []}
                  onChange={field.onChange}
                />
                {field.value?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(businessProjects || [])
                      .filter((p) => (field.value || []).includes(p.id))
                      .map((p) => (
                        <Badge key={p.id} variant="secondary" className="text-xs">
                          {p.name}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default TransactionAssociationFields;
