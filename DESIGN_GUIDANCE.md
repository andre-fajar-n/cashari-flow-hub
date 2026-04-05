# Cashari Design Guidance

**Version:** 2.0 — Authoritative, production-grade design reference for all engineers.
**Stack:** React 18 + Vite, shadcn/ui, Tailwind CSS v3, Recharts, react-hook-form, TanStack Table, Lucide icons.
**Language:** Indonesian (Bahasa Indonesia) throughout all UI copy.

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [Page Layout Patterns](#2-page-layout-patterns)
3. [Chart Design Patterns](#3-chart-design-patterns)
4. [Card Patterns](#4-card-patterns)
5. [Table Patterns](#5-table-patterns)
6. [Form and Dialog Patterns](#6-form-and-dialog-patterns)
7. [Financial Color Coding](#7-financial-color-coding)
8. [Badge and Status Patterns](#8-badge-and-status-patterns)
9. [Data Transparency UX](#9-data-transparency-ux)
10. [Empty States and Loading](#10-empty-states-and-loading)
11. [Progressive Complexity (Beginner vs Advanced)](#11-progressive-complexity-beginner-vs-advanced)
12. [Consistency Rules](#12-consistency-rules)
13. [Anti-patterns](#13-anti-patterns)

---

## 1. Design System Foundation

### Color Tokens

All colors are driven by CSS custom properties defined in `src/index.css`. Never hardcode HSL values — always use the Tailwind token.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | white | near-black | Page background |
| `--foreground` | near-black | near-white | Primary text |
| `--card` | white | near-black | Card surfaces |
| `--muted` | light gray | dark gray | Section backgrounds, secondary fills |
| `--muted-foreground` | medium gray | light gray | Labels, secondary text |
| `--primary` | dark navy | near-white | Buttons, active states, accent icons |
| `--border` | light gray | dark gray | Borders, dividers |
| `--destructive` | red | dark red | Errors, delete actions |

**Financial semantic colors** (hardcoded, intentional — these must stay consistent):

```
Profit / Positive:   text-emerald-600   bg-emerald-50   border-emerald-100
Loss / Negative:     text-rose-600      bg-rose-50      border-rose-100
Neutral / Zero:      text-muted-foreground  bg-muted/30
Warning / Stale:     text-amber-600     bg-amber-50     border-amber-200
Info / Missing:      text-blue-600      bg-blue-50      border-blue-100
```

These semantic colors must be applied identically across all pages (Dashboard, AssetDetail, BalanceTrend, InvestmentAsset, etc.).

### Typography

- **Font:** System default via Tailwind (no custom font loaded yet). Any engineer adding a font must use a numerically-tabular serif or neutral sans — candidates: `DM Sans`, `Outfit`, or `Plus Jakarta Sans`. Avoid Inter, Roboto, Arial.
- **Financial figures** always use `tabular-nums` (`font-variant-numeric: tabular-nums`) to keep columns aligned. Apply `className="tabular-nums"` on any monetary display.
- **Scale in use:**

```
Page title:         text-2xl sm:text-3xl font-bold
Card title:         text-base font-semibold  OR  text-lg font-semibold
Section label:      text-[11px] font-semibold uppercase tracking-wide text-muted-foreground
Body:               text-sm
Caption / meta:     text-xs text-muted-foreground
Metric value:       text-lg font-bold  (metric card)  OR  text-3xl font-bold  (hero)
```

### Spacing

- Page-level content: `space-y-6` between major sections, `space-y-4` between related items.
- Card internal: `p-6` outer, `space-y-4` or `space-y-3` between field rows.
- Form fields: `space-y-4` between form items, `gap-2` between label and input.
- Grid gutters: `gap-3` or `gap-4` depending on card density.

### Border Radius

Defined via `--radius: 0.5rem` (8px). Tailwind tokens:
- `rounded-lg` → 8px (cards, inputs, buttons)
- `rounded-xl` → 12px (hero metric cards, chart wrappers, colored summary sections)
- `rounded-full` → pill shape (icon containers on some pages — **inconsistent, see rules below**)
- `rounded-2xl` → 16px (gradient page header banners)

### Shadows

The project deliberately uses minimal shadows:
- Default cards: `shadow-none` or omitted — rely on `border` for definition.
- Interactive wallet cards: `shadow-sm` on hover via `hover:shadow-sm transition-shadow`.
- Page header banners: no shadow — visual weight comes from gradient background.
- Dialogs: shadcn default (Radix-managed).

---

## 2. Page Layout Patterns

### Shell Structure

```
AppSidebar (collapsible) → SidebarInset
  └── header (h-16 sm:h-14, border-b, bg-white, shadow-sm mobile)
       └── SidebarTrigger + app title "Financial Management" + FetchExchangeRatesButton
  └── main (p-3 sm:p-4, bg-gray-50 sm:bg-background)
       └── max-w-7xl mx-auto
            └── page content (space-y-4 or space-y-6)
```

The `Layout` component handles all of this. Pages only render content inside `<Layout>`.

### Page Header — Canonical Pattern (Gradient Banner)

All list, management, analytics, and goal-tracking pages use the Gradient Banner pattern. It provides a consistent premium feel across the app and uses `rounded-xl` for the icon container.

```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 px-6 py-5">
  <div className="relative flex items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-sm shrink-0">
        <Target className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Short description.</p>
      </div>
    </div>
    <Button className="shrink-0">
      <Plus className="w-4 h-4 mr-2" />
      Action
    </Button>
  </div>
</div>
```

**Rule:** All pages must use this header pattern. No custom one-off headers. Icon container always uses `rounded-xl`.

### Detail Page Header (Drill-down pages)

Pages: AssetDetail, GoalDetail, DebtDetail, BudgetDetail, BusinessProjectDetail

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
    <Button variant="outline" onClick={() => navigate('/parent-route')}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Kembali
    </Button>
    <div>
      <h1 className="text-3xl font-bold">{item.name}</h1>
      <p className="text-muted-foreground">Subtitle / breadcrumb context</p>
    </div>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" onClick={handleEdit}>
      <Edit className="w-4 h-4 mr-2" />
      Ubah
    </Button>
    <Button variant="outline" onClick={handleDelete}>
      <Trash2 className="w-4 h-4 mr-2" />
      Hapus
    </Button>
  </div>
</div>
```

### Dashboard Header (Special case — no title, greeting pattern)

```tsx
<div className="mb-8">
  <p className="text-sm font-medium text-primary mb-0.5">{greeting}</p>
  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
  <p className="text-gray-500 text-sm mt-1">{today}</p>
</div>
```

### Content Area Grid Patterns

```tsx
// Two-column (metric cards)
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">

// Three-column (KPI cards)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

// Single prominent card
<div className="grid grid-cols-1 gap-4">
```

---

## 3. Chart Design Patterns

### Technology

All charts use `recharts` via the `ReusableLineChart` wrapper in `src/components/ui/charts/ReusableLineChart.tsx`. Do not use Recharts directly in feature components — always go through the wrapper.

### Line Chart Configuration

```tsx
const lines: ChartLineConfig[] = [
  {
    dataKey: "value",
    name: "Total Saldo",
    stroke: "hsl(var(--primary))",
    strokeWidth: 2.5,
    dot: { fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 },
  },
  // Secondary overlay line (e.g. gold/zakat reference)
  {
    dataKey: "goldValue",
    name: "Nisab Zakat (85g Emas)",
    stroke: "#f59e0b",   // amber-500
    strokeWidth: 2,
    dot: { r: 3, strokeWidth: 1 },
  },
];
```

### Chart Layout Rules

- **Height:** `380` for full-width primary charts. `256` for inline/compact charts.
- **Grid:** Horizontal only (`vertical={false}` in `CartesianGrid`). `strokeDasharray="3 3"`.
- **Axes:** No axis lines (`axisLine={false}`), no tick lines (`tickLine={false}`).
- **Y-axis width:** `60` default. Increase to `80` if values exceed 9 digits.
- **Y-axis formatter:** Always abbreviate large numbers:
  ```
  >= 1_000_000_000 → X.Xrb   (billion — "ribu" local shorthand not appropriate here, use M)
  >= 1_000_000     → Xjt     (juta)
  >= 1_000         → Xrb     (ribu)
  ```
  Exact code from existing implementation:
  ```ts
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
  if (val >= 1000000)    return `${(val / 1000000).toFixed(0)}jt`;
  if (val >= 1000)       return `${(val / 1000).toFixed(0)}rb`;
  return val.toString();
  ```
- **Y-axis domain:** Always set `[0, maxValue * 1.1]` — never let Recharts auto-scale starting below zero for balance trends (negative is a separate concern).

### Tooltip Design

Tooltips must be custom-rendered for financial context:

```tsx
const customTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3.5 shadow-xl">
      {/* Date header */}
      <p className="font-semibold mb-2.5 text-sm border-b pb-2">
        {formatDateForGranularity(item.fullDate, granularity)}
      </p>
      {/* Metric rows */}
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.stroke }} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-sm font-bold tabular-nums">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
      {/* Always include data transparency footer */}
      <p className="mt-2.5 text-[10px] text-muted-foreground italic border-t pt-2">
        Klik titik untuk detail valuasi
      </p>
    </div>
  );
};
```

**Tooltip rules:**
- Always show date formatted for the selected granularity (day = `eeee, dd MMMM yyyy`, month = `MMMM yyyy`, year = `yyyy`).
- Color dot before each metric label.
- Amounts are `tabular-nums font-bold`.
- Use `backdrop-blur-sm` and `bg-background/95` for a polished glass effect.
- Always include a footer hint if click-through is available.

### Data Quality Dot Colors (Status-based)

Chart dots change color based on data quality status. This is a critical transparency feature:

```
status === "Exact"    → fill: #22c55e  (green-500)   — exact price/rate on this date
status === "Old"      → fill: #eab308  (yellow-500)  — forward-filled from older date
status === "Warning"  → fill: #eab308  (yellow-500)  — data gap, using fallback
status === "Missing"  → fill: #ef4444  (red-500)     — no data available
default / undefined   → fill: hsl(var(--primary))    — standard, no status concern
```

This logic lives in `ReusableLineChart.tsx` and must not be changed without updating this guide.

### Chart Legend

- Show legend only when multiple lines are active (`showLegend={showGoldLine}`).
- Use custom `legendFormatter` if Recharts default formatting is insufficient.

### Chart Controls

Period/granularity selectors belong in a `PeriodFilter` component above the chart, inside a `Card`:

```tsx
<Card className="border bg-card shadow-none">
  <CardContent className="py-4 px-4">
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <Select>...</Select>     {/* Granularitas */}
      <DateRangePicker />      {/* Rentang Tanggal */}
    </div>
  </CardContent>
</Card>
```

Secondary toggles (e.g., "Show Nisab Zakat" gold line) go in the chart's own header row, aligned right, using a pill-shaped toggle container:

```tsx
<div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all ${
  isActive
    ? "bg-amber-50 border-amber-200"
    : "bg-muted/40 border-border"
}`}>
  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-500" : "text-muted-foreground"}`} />
  <Label htmlFor="toggle-id" className="text-xs font-medium cursor-pointer">
    Toggle Label
  </Label>
  <Switch id="toggle-id" checked={isActive} onCheckedChange={setIsActive} />
</div>
```

---

## 4. Card Patterns

### Metric Card (KPI display)

Used in: AssetSummaryHeader, TrendSummaryCards, MoneySummaryCard total section.

```tsx
// MetricCard — financial KPI with tooltip
<div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
      <BarChart3 className="w-3.5 h-3.5 text-primary" />
    </div>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help font-medium">
            Metric Label
            <HelpCircle className="w-3 h-3 shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">Explanation of this metric.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <div className="space-y-0.5">
    <p className="text-lg font-bold tabular-nums">{formattedValue}</p>
    {/* Base currency approximation — only for multi-currency */}
    <p className="text-xs text-muted-foreground">
      ≈ {formattedBaseValue}
    </p>
  </div>
</div>
```

**Rules:**
- Every financial metric card **must** have a `Tooltip` with an explanation. Users are not expected to understand "Unrealized Profit" without context.
- Show the `≈ base currency` line only when the asset's original currency differs from the user's base currency.
- Use `text-green-600` / `text-rose-600` on the value when `showSign={true}`.
- Icon background color follows profit state: `bg-green-500/10`, `bg-red-500/10`, or `bg-primary/10`.

### Summary Metric Cards Row (TrendSummaryCards pattern)

Grid of 2×2 on mobile, 4-column on desktop. Each card is color-coded by semantic type:

```tsx
// Blue — neutral starting value
className="border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 shadow-none"

// Violet — neutral ending value  
className="border border-violet-100 bg-violet-50/50 shadow-none"

// Emerald — positive growth
className="border border-emerald-100 bg-emerald-50 dark:bg-emerald-950/30 shadow-none"

// Rose — negative growth
className="border border-rose-100 bg-rose-50 dark:bg-rose-950/30 shadow-none"
```

Icon containers: `h-8 w-8 rounded-lg` (not `rounded-full`).
Label: `text-[11px] font-semibold text-muted-foreground uppercase tracking-wide`.
Value: `text-base font-bold leading-tight`.

### Hero Total Card (Dashboard "Total Keseluruhan" section)

Prominent green gradient card showing total portfolio value in base currency:

```tsx
<div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white shadow-sm">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-green-100 text-xs font-medium uppercase tracking-wide">
        Total dalam {baseCurrency}
      </p>
      <p className="text-3xl font-bold mt-1 tracking-tight tabular-nums">
        {formattedTotal}
      </p>
    </div>
    <TrendingUp className="w-8 h-8 text-green-200 opacity-80 mt-1" />
  </div>

  <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-sm">
    <div>
      <p className="text-green-100 text-xs">Nilai Awal</p>
      <p className="font-semibold mt-0.5 tabular-nums">{formattedActiveCapital}</p>
    </div>
    <div>
      <p className="text-green-100 text-xs">Belum Terealisasi</p>
      <p className={`font-semibold mt-0.5 tabular-nums ${isProfit ? 'text-white' : 'text-red-200'}`}>
        {isProfit ? '+' : ''}{formattedUnrealized}
      </p>
    </div>
  </div>
</div>
```

**Rule:** This green hero card is reserved exclusively for the total portfolio value on the Dashboard. Do not reuse this exact pattern for other metrics — it carries visual weight that implies "the most important number on this page."

### Missing Data Warning Card

When FX rate or asset price is unavailable for conversion:

```tsx
<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
  <div className="flex items-start gap-3">
    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-amber-800">Total tidak dapat dihitung</p>
      <p className="text-xs text-amber-600 mt-0.5">
        Kurs tidak tersedia untuk mata uang: {missingCurrencies.join(', ')}
      </p>
    </div>
  </div>
</div>
```

### Collapsible Wallet/Instrument Cards (Dashboard hierarchy)

Wallet → Instrument → Asset three-level hierarchy:

```tsx
// Level 1 — Wallet (purple accent border)
<Card className="border border-purple-100 shadow-sm overflow-hidden">
  <Collapsible>
    <CollapsibleTrigger asChild>
      <div className="px-4 py-3 cursor-pointer hover:bg-purple-50/60 transition-colors border-l-4 border-l-purple-500">
        <WalletRow wallet={wallet} isExpanded={isExpanded} />
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div className="px-4 pb-4 border-t bg-gray-50/70">
        {/* Level 2 — Instrument */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Level 3 — Asset (nested, bg-gray-50/50) */}
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>
</Card>
```

**Rule:** Each depth level must be visually distinct: wallet has colored left border, instrument has white background with gray border, asset has slightly lighter background. Never go beyond 3 levels of nesting.

### Section Sub-header (inside cards)

```tsx
<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
  <Icon className="w-4 h-4 text-blue-600" />
  <h4 className="font-medium text-gray-700 text-sm">Section Title</h4>
</div>
```

---

## 5. Table Patterns

### Table Wrapper Component

Always use `AdvancedDataTableToolbar` + `@tanstack/react-table` pattern. The toolbar handles:
- Debounced search (300ms)
- Select filters (up to `MAXIMUM_PRIMARY_FILTERS = 5` shown inline, rest in a Sheet)
- Date range filter
- Column visibility toggle
- Reset button

### Filter Layout

Filters are grouped in a labeled column layout with a fixed `h-[52px]` height and `w-[200px]` width per filter trigger. Labels use `text-sm font-medium text-gray-700` above each input. This ensures vertical alignment when multiple filters appear side-by-side.

```tsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-gray-700">Filter Label</label>
  <Select className="w-[200px] h-[52px]">...</Select>
</div>
```

The "Reset Filter" button is always visible at the right end of the filter row, `disabled` when no filters are active. This follows the principle of affordance — users can see they can reset, even before they have set filters.

### Column Types

| Type | Implementation |
|---|---|
| Text | Plain `cell: ({ row }) => row.getValue("field")` |
| Financial amount | `AmountText` with `showSign` for profit columns |
| Currency badge | `<Badge variant="outline">{currencyCode}</Badge>` |
| Date | `format(new Date(value), "dd MMM yyyy", { locale: id })` |
| Status badge | See Badge Patterns section |
| Progress | `<Progress value={pct} className="h-2" />` |
| Actions | `DropdownMenu` with Edit / Delete / View options |
| Percentage | `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` with color class |

### Action Column

```tsx
// Always the last column
{
  id: "actions",
  enableSorting: false,
  enableHiding: false,
  cell: ({ row }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          <Edit className="w-4 h-4 mr-2" />
          Ubah
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(row.original.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
```

### Profit/Loss Column

```tsx
cell: ({ row }) => {
  const profit = row.getValue("profit") as number;
  return (
    <AmountText amount={profit} showSign className="text-sm font-semibold tabular-nums">
      {formatAmountCurrency(Math.abs(profit), currencyCode, symbol)}
    </AmountText>
  );
}
```

### Pagination

Use `DataTablePagination` from the advanced data table package. Always show:
- Items per page selector (options: 10, 25, 50)
- Page navigation (previous / page indicator / next)
- Record count: `1–10 dari 47 item`

---

## 6. Form and Dialog Patterns

### Dialog Structure

All dialogs follow the same internal structure: a styled header section + a form body with footer actions. Never render a bare `<DialogContent>` with just a `<form>` inside.

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto p-0">

    {/* Header — always present */}
    <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <PiggyBank className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "Edit Item" : "Tambah Item Baru"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEditing ? "Perbarui item yang ada" : "Tambahkan item baru"}
          </p>
        </div>
      </div>
    </div>

    {/* Form body */}
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="px-6 py-4 space-y-4">
          {/* Fields */}
          <FormField ... />

          {/* Footer — always inside the form, at the bottom */}
          <div className="flex justify-end gap-2 pt-4 border-t mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </div>
      </form>
    </Form>

  </DialogContent>
</Dialog>
```

### Dialog Width

| Content complexity | Width |
|---|---|
| Simple (1–4 fields) | `sm:max-w-[460px]` |
| Medium (5–8 fields) | `sm:max-w-[560px]` |
| Complex (multi-section) | `sm:max-w-[680px]` |

Always set `max-h-[90vh] overflow-y-auto` to handle tall content on small screens.

### Form Fields

```tsx
<FormField
  control={form.control}
  name="fieldName"
  rules={{ required: "Field ini harus diisi" }}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input placeholder="Placeholder text" {...field} />
      </FormControl>
      <FormMessage />   {/* validation error */}
    </FormItem>
  )}
/>
```

**Number inputs:** Use `InputNumber` (custom component) instead of `<Input type="number">`. This provides proper Indonesian formatting and avoids browser number input quirks.

**Date inputs:** Use `<Input type="date" {...field} />`. The native date picker is acceptable. For date-range selection, use `DateRangePicker`.

**Currency selector:** Use `Select` populated from the `useCurrencies()` hook. Show `{code} ({name})` in options.

### Validation Copy

All error messages in Indonesian. Examples:
- Required: `"Nama harus diisi"`
- Min value: `"Jumlah tidak boleh negatif"`
- Pattern: `"Format tanggal tidak valid"`

### Delete Confirmation

Always use `DeleteConfirmationModal` with `useDeleteConfirmation` hook. Never inline a delete action without confirmation.

```tsx
const deleteConfirmation = useDeleteConfirmation<IdType>({
  title: "Hapus [Entity]",
  description: "Apakah Anda yakin ingin menghapus [entity] ini? Tindakan ini tidak dapat dibatalkan.",
});
```

The modal must include the word "tidak dapat dibatalkan" (irreversible) in the description.

### Confirmation Modal (for reversible state changes)

Use `ConfirmationModal` (not `DeleteConfirmationModal`) for toggling active/inactive status:

```tsx
<ConfirmationModal
  title={isActive ? "Nonaktifkan [Entity]" : "Aktifkan [Entity]"}
  description={`Apakah Anda yakin ingin ${isActive ? 'menonaktifkan' : 'mengaktifkan'} "${name}"?`}
  confirmText={isActive ? "Nonaktifkan" : "Aktifkan"}
  variant={isActive ? "destructive" : "default"}
/>
```

---

## 7. Financial Color Coding

This is the most critical section for data correctness. These rules must be applied identically everywhere.

### Core Rule

**Positive financial values (profit, growth, return):** `text-emerald-600`
**Negative financial values (loss, decline, cost):** `text-rose-600`
**Zero / neutral:** `text-muted-foreground` (no color emphasis)

Do not use `text-green-600` and `text-red-600` — those are the `AmountText` component's hardcoded values and exist for backward compatibility. For new components, use `emerald-600` / `rose-600` to match the `TrendSummaryCards` pattern.

**Exception:** The Dashboard hero card uses `text-white` and `text-red-200` because it appears on a colored background.

### AmountText Component

The project's `AmountText` component (`src/components/ui/amount-text.tsx`) handles sign and color:

```tsx
<AmountText amount={profit} showSign className="text-sm font-semibold tabular-nums">
  {formatAmountCurrency(Math.abs(profit), currencyCode, symbol)}
</AmountText>
```

- Positive → `text-green-600` + `+` prefix
- Negative → `text-red-600` + `-` prefix (via `Math.abs` in children + negative prefix from component)
- Zero → no color class

**Rule:** Always pass `showSign` when displaying profit/loss. Always use `tabular-nums` on monetary values.

### Metric Card Icon Color

```tsx
const isPositive = showSign && value > 0;
const isNegative = showSign && value < 0;

// Icon background
const iconBg = isPositive ? 'bg-green-500/10' : isNegative ? 'bg-red-500/10' : 'bg-primary/10';
const iconColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-primary';
```

### ROI Display

ROI (Return on Investment) uses `RoiCard` component. Key rules:
- ROI is displayed as a percentage with 2 decimal places.
- Positive ROI: emerald text with upward arrow.
- Negative ROI: rose text with downward arrow.
- ROI tooltip must explain the formula: "Total keuntungan / seluruh modal yang pernah diinvestasikan."

### Unrealized vs Realized Profit

These are distinct concepts and must never be displayed as the same metric:

| Metric | Indonesian label | When visible |
|---|---|---|
| Realized Profit | Keuntungan Terealisasi | After withdrawal/dividend/sale |
| Unrealized Profit | Keuntungan Belum Terealisasi | While asset is held |
| Total Profit | Total Keuntungan | Sum of both |
| Unrealized Return | Estimasi Keuntungan (%) | Unrealized / active capital |

The ProfitBreakdown component correctly separates these and allows drill-down into asset profit vs. currency profit sub-components.

### Investment Status Labels

```
Trackable    → <Badge variant="secondary">Trackable</Badge>
Non-trackable → <Badge variant="outline">Non-trackable</Badge>
```

---

## 8. Badge and Status Patterns

### Currency Badges

```tsx
// Inline currency indicator
<Badge variant="outline">{currencyCode}</Badge>

// In tables, next to amounts
<span className="text-xs text-muted-foreground ml-1">{currencyCode}</span>
```

### Status Badges

```tsx
// Active / Inactive
<Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Aktif</Badge>
<Badge variant="outline" className="text-muted-foreground">Tidak Aktif</Badge>

// Paid off (debt)
<Badge className="bg-blue-100 text-blue-700 border-blue-200">Lunas</Badge>

// Overdue
<Badge className="bg-rose-100 text-rose-700 border-rose-200">Jatuh Tempo</Badge>

// Trackable / Non-trackable (investment instruments)
<Badge variant="secondary">Trackable</Badge>
<Badge variant="outline">Non-trackable</Badge>
```

**Rule:** Never use Tailwind color classes directly on `<Badge>` without also providing the appropriate border color. Always specify `bg-*`, `text-*`, and `border-*` together so dark mode is not broken. For proper dark mode support, prefer shadcn variants (`default`, `secondary`, `outline`, `destructive`) over manual color overrides.

### Transaction Type Badges (Riwayat Transaksi)

Each movement type has a distinct icon color used in dropdown menus and potentially in badges:

```
Transaksi       → text-blue-600
Transfer        → text-purple-600
Transfer Target → text-green-600
Progres Investasi → text-orange-500
Hutang/Piutang  → text-red-600
```

These colors should be consistent across: dropdown items, table row type indicators, and any badge used for filtering.

### Data Quality Status (Balance Trend dots)

```
Exact   → text-green-600 / bg-green-500
Old     → text-yellow-600 / bg-yellow--500
Warning → text-yellow-600 / bg-yellow-500
Missing → text-red-600 / bg-red-500
```

Used in chart dot coloring (see Chart Patterns) and should be used in any valuation detail modal that references data staleness.

---

## 9. Data Transparency UX

This section addresses one of the core product philosophy requirements: showing users when data is approximate, stale, or missing.

### FX Rate Date Display

Whenever a cross-currency value is shown, display the rate date via a tooltip on the amount. This works consistently in all contexts — tables, cards, and collapsible sections.

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
        {formattedAmount}
        <Info className="w-3 h-3" />
      </span>
    </TooltipTrigger>
    <TooltipContent>
      Kurs {baseCurrency}/{originalCurrency}: {rate}<br />
      Data per: {format(new Date(rateDate), "dd MMM yyyy", { locale: id })}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Asset Price Date Display

For investment assets with `latest_asset_value` and `latest_asset_value_date`:

```tsx
// In dashboard asset rows
{asset.latest_asset_value_date && (
  <p className="text-[10px] text-muted-foreground italic">
    Harga per {format(new Date(asset.latest_asset_value_date), "dd MMM yyyy", { locale: id })}
  </p>
)}
```

### Stale Data Warning

When data is older than a defined threshold (suggested: 7 days for crypto/stocks, 30 days for gold/property):

```tsx
<div className="flex items-center gap-1.5 text-amber-600 text-xs">
  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
  <span>Data belum diperbarui ({daysSinceUpdate} hari lalu)</span>
</div>
```

### Missing Data (Cannot Calculate)

When a required rate/price is absent and a total cannot be computed:

```tsx
<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
  <div className="flex items-start gap-3">
    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-amber-800">
        [Metric name] tidak dapat dihitung
      </p>
      <p className="text-xs text-amber-600 mt-0.5">
        Kurs tidak tersedia untuk: {missingCurrencies.join(', ')}
      </p>
    </div>
  </div>
</div>
```

**Never display `NaN`, `Infinity`, `undefined`, or `0` silently as if it were the correct value.** If computation is impossible, show the amber warning block instead.

### TrackableWarningBanner

For investment assets in non-trackable instruments (market price not tracked):

```tsx
// Uses TrackableWarningBanner component
// type="not-trackable" → explains no price history will be recorded
// type="legacy-data"   → explains historical data exists but instrument is now non-trackable
<TrackableWarningBanner type="not-trackable" />
```

This banner should appear immediately below the page header (before action buttons and tabs) so it is seen before the user interacts with any data.

### Chart Valuation Detail Modal

Clicking a chart dot opens a `ValuationDetailModal` that shows:
- Exact date of the data point
- Whether the FX rate / asset price was exact or forward-filled
- Which sources were used for that date's calculation
- Option to manually override a missing value

This modal is the primary mechanism for data transparency. It must always be accessible from balance trend charts.

### Forward-fill Indicator Pattern (Summary sections)

In the `FourColumnLayout` (Dashboard), show the FX rate date via a tooltip on the converted amount (same tooltip pattern as the FX Rate Date Display section above).

When `hasNullRate` is true, show a "kurs tidak tersedia" indicator instead of a value.

---

## 10. Empty States and Loading

### Loading States

**Skeleton loading** (avoids layout shift — use for all component-level loading states):

```tsx
// For metric card grids
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {[1, 2, 3, 4].map((i) => (
    <Skeleton key={i} className="h-28 w-full rounded-xl" />
  ))}
</div>

// For card with internal structure
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-48" />
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  </CardContent>
</Card>
```

**PageLoading** (full-page, for pages that must fully load before rendering):

```tsx
<PageLoading message="Memuat data budget..." />
```

Use `PageLoading` sparingly — it blocks all content and should only be used when the page has no meaningful partial state to show. Prefer skeleton loading so the user sees the layout immediately.

**Rule:** Pages should not use `if (isLoading) return <PageLoading />` as the only pattern. Prefer skeleton states inside the Layout with the header still visible.

### Empty States

**Table empty state** (handled by TanStack Table + AdvancedDataTable):
The table automatically shows "Tidak ada hasil" when data is empty. Do not add custom empty states around the table.

**Inline empty state** (for sections within a card):

```tsx
<div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
  <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
  <p className="text-sm text-muted-foreground">
    Belum ada data [entity]
  </p>
  {/* Optional CTA */}
  <Button variant="outline" size="sm" className="mt-3" onClick={onCreate}>
    <Plus className="w-4 h-4 mr-1" />
    Tambah [Entity]
  </Button>
</div>
```

**Not-found state** (for detail pages with invalid ID):

```tsx
<div className="flex flex-col items-center justify-center py-16">
  <p className="text-muted-foreground mb-4">[Entity] tidak ditemukan</p>
  <Button onClick={() => navigate('/list-route')} variant="outline">
    <ArrowLeft className="w-4 h-4 mr-2" />
    Kembali ke Daftar
  </Button>
</div>
```

---

## 11. Progressive Complexity (Beginner vs Advanced)

Cashari serves both casual users (who just want to see balances) and advanced users (who want ROI, FX breakdown, and historical analysis). The UI must support both without overwhelming beginners.

### Principle: Progressive Disclosure

1. **Always visible:** Core balance, wallet total, basic amounts.
2. **One click away:** Wallet breakdown (expandable), instrument/asset detail (tab or expand).
3. **On-demand:** Profit breakdown detail (collapsible `ProfitBreakdown` card), FX rate details (tooltip), valuation detail (modal on chart dot click), column visibility in tables.
4. **Never auto-shown:** Raw SQL metrics, internal IDs, technical calculation traces.

### Collapsible Advanced Sections

Advanced metrics (like `ProfitBreakdown`) must be wrapped in a `Collapsible` card that is **closed by default**:

```tsx
<Card>
  <Collapsible open={isOpen} onOpenChange={setIsOpen}>
    <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base">Rincian Keuntungan</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CollapsibleTrigger>
    </CardHeader>
    <CollapsibleContent>
      <CardContent className="pt-0">
        {/* Advanced detail content */}
      </CardContent>
    </CollapsibleContent>
  </Collapsible>
</Card>
```

### Tooltip-gated Information

Information that is technically complex but important for advanced users goes behind a `?` (HelpCircle) tooltip:

```tsx
<span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help font-medium">
  ROI
  <HelpCircle className="w-3 h-3 shrink-0" />
</span>
// Tooltip content: "Return on Investment berdasarkan total keuntungan dibandingkan dengan seluruh modal yang pernah diinvestasikan."
```

**Rule:** Every financial metric that a casual user might not understand must have a `HelpCircle` tooltip. This includes: ROI, Unrealized Profit, Active Capital, Invested Capital, Realized Profit.

### Column Visibility

The `DataTableViewOptions` component allows users to hide columns. Default visible columns should be the "beginner" set. Advanced columns (e.g., average price, cost basis) can be hidden by default and discoverable via the column toggle.

### Currency Conversion Clarity

Beginner users see local currency. Advanced users see both original and base currency. The pattern:

```tsx
// Primary: always show in original currency
<p className="text-lg font-bold tabular-nums">
  {formatAmountCurrency(value, originalCurrency, originalSymbol)}
</p>

// Secondary: show base currency conversion as a subdued caption
// Only when original !== base
{!isSameCurrency && (
  <p className="text-xs text-muted-foreground">
    ≈ {formatAmountCurrency(baseValue, baseCurrency, baseSymbol)}
  </p>
)}
```

---

## 12. Consistency Rules

These are hard requirements. Any page that deviates must be updated during the next touch.

### Header Consistency

1. Every list/management page must use the canonical Gradient Banner header pattern. No custom headers.
2. All page `h1` elements use `text-2xl font-bold` minimum. Detail pages can use `text-3xl`.
3. Page subtitle text always uses `text-sm text-muted-foreground mt-1` (or `mt-0.5` for the Banner variant).
4. Primary CTA button is always at the far right of the header row on desktop. On mobile it stacks below the title.

### Color Consistency

5. Profit/positive: `text-emerald-600`. Loss/negative: `text-rose-600`. Applied to: metric cards, table cells, chart labels, badge text.
6. Transaction type icon colors (blue/purple/green/orange/red) must match across dropdown menus, table cells, and any badges.
7. The amber warning color (`bg-amber-50 border-amber-200 text-amber-600`) is reserved exclusively for data quality warnings (missing FX rate, stale prices). Do not use amber for other warning types.

### Icon Consistency

8. Use `lucide-react` exclusively. Do not import from `@radix-ui/react-icons` directly in feature components.
9. Action icons: Edit → `Edit`, Delete → `Trash2`, View → `Eye`, Back → `ArrowLeft`, Add → `Plus`.
10. Financial concept icons: Wallet → `Wallet`, Goal → `Target`, Investment → `TrendingUp`, Budget → `PiggyBank` or `Calendar`, Debt → `CreditCard` or `Landmark`, Analytics → `BarChart3` or `TrendingUp`.
11. Icon sizes: `w-4 h-4` for action buttons and menu items, `w-5 h-5` for page header icons in Variant B, `h-6 w-6` for the icon inside a Variant A banner container.

### Component Consistency

12. All data tables use `AdvancedDataTableToolbar`. No raw `<Input>` search boxes inline in page bodies.
13. All mutations use `useMutationCallbacks` hook. No inline `toast.success(...)` in page handlers.
14. All dialogs use the header + form body + footer structure. No bare `DialogContent`.
15. All delete operations use `DeleteConfirmationModal` with `useDeleteConfirmation`.
16. All financial values use `tabular-nums`. Never display monetary amounts without this class.

### Spacing Consistency

17. Space between major page sections: `space-y-6`.
18. Space between cards in a grid: `gap-3` (dense) or `gap-4` (comfortable).
19. Card internal padding: `p-6` outer, `pt-4 pb-4 px-4` for compact cards.
20. Form field spacing: `space-y-4` between fields.

---

## 13. Anti-patterns

These are patterns that have appeared or could appear in the codebase and must be avoided.

### Data Display Anti-patterns

**DO NOT** display `NaN` or `undefined` as a value. Always guard:
```tsx
// Bad
<p>{someValue}</p>

// Good
<p>{someValue != null ? formatAmountCurrency(someValue, ...) : '—'}</p>
```

**DO NOT** silently fall back to `0` when a rate/price is missing without indicating it to the user. The amber warning block must appear.

**DO NOT** display total portfolio value without showing which FX rates were used.

**DO NOT** truncate currency codes. Always show the full ISO code (IDR, USD, BTC, etc.). Never abbreviate.

**DO NOT** show both realized and unrealized profit as a single "profit" number without at least a tooltip explaining the composition. These are distinct metrics.

### Layout Anti-patterns

**DO NOT** create custom page header patterns outside the two canonical variants. This includes: centered headers, headerless pages with tables starting at the top, inline action rows that mix with content.

**DO NOT** nest more than three visual levels (e.g., card → section → row → sub-row). The wallet → instrument → asset hierarchy is the maximum.

**DO NOT** use `PageLoading` when skeleton states can be used. Full-page blocking loaders are disruptive.

**DO NOT** mix Variant A (gradient banner) and Variant B (plain row) headers on detail pages that belong to the same feature area. If the list page uses Variant B, the detail page should use the Detail Header pattern, not Variant A.

### Color Anti-patterns

**DO NOT** use `text-green-*` and `text-red-*` in new components for profit/loss. Use `text-emerald-*` and `text-rose-*` to match the established pattern in `TrendSummaryCards` and `MetricCard`.

**DO NOT** use purple gradient backgrounds. The `from-primary/10 via-primary/5` gradient is the only approved gradient background — and only in Variant A page headers.

**DO NOT** use `bg-gray-*` for semantic purposes. `bg-gray-50` is only for alternating background fills in collapsed sections. Use semantic colors (`bg-emerald-50`, `bg-rose-50`) for financial states.

**DO NOT** create colored text without a paired background color in alert/warning blocks. The amber block always needs both `bg-amber-50` and `text-amber-800` — the text alone is not sufficient contrast.

### Typography Anti-patterns

**DO NOT** mix `font-bold` and `font-semibold` arbitrarily. Page titles are `font-bold`, card titles are `font-semibold`, metric labels are `font-medium`.

**DO NOT** use different font sizes for the same concept across pages. `text-2xl font-bold` for page `h1` is fixed.

**DO NOT** display monetary amounts without `tabular-nums`. Column alignment breaks otherwise.

**DO NOT** use fully capitalized text (`uppercase`) except for short section labels (`text-[11px] font-semibold uppercase tracking-wide text-muted-foreground`). Never uppercase page titles or metric values.

### Interaction Anti-patterns

**DO NOT** trigger a heavy backend query directly from a UI action without optimistic UI or loading state. Balance trend charts hit materialized views — always show loading state while fetching.

**DO NOT** have a delete action without `DeleteConfirmationModal`. No exceptions, even for "low-value" entities.

**DO NOT** use `window.confirm()` or browser native dialogs. Always use the project's `ConfirmationModal` or `DeleteConfirmationModal`.

**DO NOT** auto-close a success dialog before the user has seen confirmation. Let the dialog close happen via the `useMutationCallbacks.handleSuccess` hook, which manages both toast and close timing.

**DO NOT** disable the submit button without showing why. If `isLoading`, show `"Menyimpan..."` as button text.

### Component Anti-patterns

**DO NOT** use Recharts components directly in feature components. Always use `ReusableLineChart`.

**DO NOT** use `<Input type="number">` for monetary amounts. Use `InputNumber`.

**DO NOT** import icons from `@radix-ui/react-icons` in feature components. Use `lucide-react` exclusively.

**DO NOT** put dialog state (`useState`) inside the dialog component itself. Dialog open/close state and form state live at the page level, managed by `useDialogState`.

**DO NOT** hardcode HSL values. Every color reference should be a Tailwind class backed by a CSS variable, except for the financial semantic colors (emerald, rose, amber, blue) which are intentionally hardcoded for consistency across light/dark mode.

---

*This document is the single source of truth for design decisions. When in doubt, match the pattern from an established page (BalanceTrend for analytics, Goal for goal-style pages, Budget for management pages). Propose changes to this document via pull request review before implementing new patterns.*
