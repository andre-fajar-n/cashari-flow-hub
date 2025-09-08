# Dropdown Standardization Guide

## Overview

This guide standardizes dropdown/select components across the application to ensure consistent UI/UX with searchable and scrollable functionality.

## Standard Components

### 1. **SearchableSelect** - Single Selection
Use for single-value selection with search capability and scrollable options.

```tsx
import { SearchableSelect } from "@/components/ui/searchable-select";

<SearchableSelect
  options={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ]}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Pilih opsi..."
  searchPlaceholder="Cari..."
  emptyMessage="Tidak ditemukan"
  searchable={true}
/>
```

### 2. **SearchableMultiSelect** - Multiple Selection
Use for multi-value selection with search capability and scrollable options.

```tsx
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";

<SearchableMultiSelect
  options={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ]}
  value={selectedValues}
  onValueChange={setSelectedValues}
  placeholder="Pilih opsi..."
  searchPlaceholder="Cari..."
  maxSelected={5}
  showSelectedCount={true}
/>
```

## Key Features

### ✅ **Searchable**
- Real-time filtering as user types
- Case-insensitive search
- Search both label and value fields
- Clean search input with proper focus states

### ✅ **Scrollable**
- Maximum height of 240px (max-h-60) for dropdown content
- Smooth scrolling with mouse wheel and touchpad
- Works on both web and mobile views
- Proper overflow handling

### ✅ **Responsive Design**
- Adapts to trigger width automatically
- Mobile-friendly touch targets
- Proper spacing and typography

## Form Integration

### With React Hook Form

```tsx
<FormField
  control={control}
  name="fieldName"
  rules={{ required: "Field is required" }}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <SearchableSelect
          options={options}
          value={field.value}
          onValueChange={field.onChange}
          placeholder="Pilih..."
          searchPlaceholder="Cari..."
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Usage Examples

### 1. **Wallet Selection**
```tsx
<SearchableSelect
  options={wallets?.map((wallet) => ({
    label: `${wallet.name} (${wallet.currency_code})`,
    value: wallet.id.toString()
  })) || []}
  value={field.value}
  onValueChange={field.onChange}
  placeholder="Pilih dompet"
  searchPlaceholder="Cari dompet..."
/>
```

### 2. **Currency Selection**
```tsx
<SearchableSelect
  options={currencies?.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: currency.code
  })) || []}
  value={field.value}
  onValueChange={field.onChange}
  placeholder="Pilih mata uang"
  searchPlaceholder="Cari mata uang..."
/>
```

### 3. **Multi-Selection (Budget/Projects)**
```tsx
<SearchableMultiSelect
  placeholder="Pilih budget"
  searchPlaceholder="Cari budget..."
  options={budgets?.map((budget) => ({ 
    label: budget.name, 
    value: budget.id.toString() 
  })) || []}
  value={selectedBudgets.map(id => id.toString())}
  onValueChange={(values) => setSelectedBudgets(values.map(v => parseInt(v)))}
/>
```

## Design Specifications

### Visual Design
- **Height**: 40px (h-10) for single select, auto height for multi-select
- **Max Dropdown Height**: 240px (max-h-60) with scrolling
- **Search Input**: Proper border, focus ring, and padding
- **Typography**: text-sm for options, placeholder text-muted-foreground
- **Icons**: ChevronDown for trigger, Check for selected items, X for remove

### Scrolling Behavior
- **Mouse Wheel**: Smooth scrolling support
- **Touchpad**: Gesture scrolling support
- **Mobile**: Touch scrolling support
- **Keyboard**: Arrow key navigation

### Accessibility
- **Keyboard navigation**: Arrow keys, Enter, Escape support
- **Screen reader**: Proper ARIA labels and roles
- **Focus management**: Proper focus handling on open/close

## Component Properties

### SearchableSelect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SearchableSelectOption[]` | `[]` | Array of options |
| `value` | `string` | `undefined` | Selected value |
| `onValueChange` | `(value: string) => void` | `undefined` | Value change handler |
| `placeholder` | `string` | `"Pilih opsi..."` | Placeholder text |
| `searchPlaceholder` | `string` | `"Cari..."` | Search input placeholder |
| `emptyMessage` | `string` | `"Tidak ditemukan"` | Empty state message |
| `disabled` | `boolean` | `false` | Disable the component |
| `searchable` | `boolean` | `true` | Enable/disable search |

### SearchableMultiSelect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SearchableMultiSelectOption[]` | `[]` | Array of options |
| `value` | `string[]` | `[]` | Selected values |
| `onValueChange` | `(values: string[]) => void` | `undefined` | Values change handler |
| `maxSelected` | `number` | `undefined` | Maximum selections allowed |
| `showSelectedCount` | `boolean` | `true` | Show count when > 2 selected |

## Benefits

1. **Consistent UX**: Uniform dropdown experience across all forms
2. **Searchable**: All dropdowns support search functionality
3. **Scrollable**: Proper scrolling for long lists of options
4. **Accessible**: Better keyboard navigation and screen reader support
5. **Responsive**: Works well on both mobile and desktop
6. **Maintainable**: Centralized dropdown logic and styling

## Migration Guide

Replace all existing dropdown implementations with these standardized components for consistent behavior and better user experience.
