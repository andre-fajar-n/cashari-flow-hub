import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Dropdown } from "@/components/ui/dropdown";
import { GoalModel } from "@/models/goals";

interface GoalDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  goals?: GoalModel[];
  label?: string;
  placeholder?: string;
  rules?: any;
  disabled?: boolean;
  className?: string;
  showCurrency?: boolean; // Show currency code suffix
  filterActive?: boolean; // Only show active and not achieved goals
  onValueChange?: (value: string) => void;
}

export function GoalDropdown<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  goals,
  label = "Target",
  placeholder = "Pilih target",
  rules,
  disabled,
  className,
  showCurrency = true,
  filterActive = false,
  onValueChange,
}: GoalDropdownProps<TFieldValues>) {
  const filteredGoals = filterActive 
    ? goals?.filter(goal => goal.is_active && !goal.is_achieved) 
    : goals;

  return (
    <Dropdown
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      rules={rules}
      disabled={disabled}
      className={className}
      onValueChange={onValueChange}
      options={filteredGoals?.map((goal) => ({
        value: goal.id.toString(),
        label: showCurrency ? `${goal.name} (${goal.currency_code})` : goal.name
      })) || []}
    />
  );
}
