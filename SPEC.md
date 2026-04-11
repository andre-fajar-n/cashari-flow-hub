# Cashari — Feature Specification

**Last updated:** 2026-04-09  
**Status:** Approved via design interview  
**Scope:** Improvements + new features across Dashboard, Analytics, Budget, Investment, Debt, and Notifications

---

## Table of Contents

1. [Dashboard Redesign](#1-dashboard-redesign)
2. [Analytics Page (New — replaces Balance Trend in nav)](#2-analytics-page)
3. [Budget Improvements](#3-budget-improvements)
4. [In-App Notifications (Toasts)](#4-in-app-notifications)
5. [Debt Management Improvements](#5-debt-management-improvements)
6. [Investment Analytics Improvements](#6-investment-analytics-improvements)
7. [Implementation Priority](#7-implementation-priority)

---

## 1. Dashboard Redesign

### Layout

**Supporting cards pattern.**

- **Supporting cards row:** Cash Flow this month, Budget health, Total wallet balance.
- Existing dashboard content (quick actions, recent transactions, etc.) remains below.

### Supporting Cards

| Card | Metric | Notes |
|------|--------|-------|
| Arus Kas Bulan Ini | Income − Expense for current calendar month | Exclude investment buy/sell transactions |
| Kesehatan Anggaran | % of total active budget limits consumed this month | Aggregate across all active budgets; color: emerald <80%, amber 80–99%, rose ≥100% |
| Total Saldo Dompet | Sum of all wallet balances in base currency | Same as current behavior — keep as reference anchor |

---

## 2. Analytics Page

### Navigation

- **Remove** the existing "Tren Saldo" from the main nav.
- **Add** "Analitik" as the single entry point in its place.
- The Balance Trend content moves into a tab inside the Analytics page.

### Tab Structure

```
Analitik
├── Ikhtisar       (Overview)
├── Arus Kas       (Cash Flow)
├── Portofolio     (Portfolio / Investment)
├── Tujuan         (Goals)
└── Tren Saldo     (Balance Trend — existing)
```

### Global Time Range Selector

A single time range control at the top of the page applies to all tabs:

- Bulan ini / Bulan lalu
- 3 bulan terakhir / 6 bulan terakhir
- Tahun ini / Tahun lalu
- Rentang kustom (date picker: start & end date)

---

### 2a. Tab: Ikhtisar (Overview)

Mini-card versions of key metrics from every tab on one scrollable page. Acts as an executive summary. Each mini-card links to its full tab.

---

### 2b. Tab: Arus Kas (Cash Flow)

#### Income vs Expense Trend

- **Chart type:** Grouped bar chart (monthly bars)
- **Series:** Pemasukan (income) and Pengeluaran (expense)
- **Scope:** Exclude investment buy/sell/growth transactions — only regular income and expense
- **X-axis:** Month label; **Y-axis:** Amount in base currency
- Months with no data show zero bars (not omitted)

#### Category Spending Breakdown

- **Chart type:** Donut or bar chart showing spend per category for the selected period
- **Drill-down:** Full 3-level drill-down
  1. Click a category segment → **Modal dialog** opens
  2. Modal shows sub-categories or individual transactions for that category
  3. Individual transactions are listed with date, description, amount
- Modal title: `Pengeluaran: {nama kategori}` with a close (X) button
- No navigation away from the page — all drill-down is in-modal

---

### 2c. Tab: Portofolio (Portfolio)

#### Investment Distribution — Two Views (tabbed within the section)

**View 1: Alokasi per Tujuan**  
- Pie/donut chart: each slice = one goal, sized by % of total invested capital  
- Click a goal slice → expand accordion or inner ring showing instruments/assets within that goal

**View 2: Distribusi Kelas Aset**  
- Pie/donut chart: each slice = instrument type (Saham, Kripto, Reksa Dana, Emas, dll.)  
- Sized by current value in base currency

Toggle between views with two tabs/buttons above the chart.

#### Performance Timeline

- **Chart type:** Line chart (`ReusableLineChart`)
- **Total mode:** Dual series — "Nilai Saat Ini" (current value) and "Modal Aktif" (invested capital), both in base currency
- **Per Aset mode:** Multi-select up to 5 assets; one series per asset showing current value
- **Date range:** Preset buttons (1 Bln, 3 Bln, 6 Bln, 1 Thn) + custom date range picker
- **Granularity:** ≤ 45 days → daily; > 45 days → monthly (auto-derived from range)
- **Monthly forward-fill:** If no new movements in a month, carry forward last known value to ensure continuous monthly chart
- **Zero-value filter:** Data points with current value = 0 are excluded from the chart
- Data source: `daily_cumulative` view (backed by `portfolio_valuation_mv` materialized view)

#### Transaction History per Asset

- **In asset detail page:** Show last 5 investment transactions (buy/sell/dividend/growth) as a compact table
- **"Lihat semua" link** → navigates to a dedicated full transaction history page for that asset
- Full history page supports: filter by type (beli/jual/dividen/pertumbuhan), date range, sortable columns

---

### 2d. Tab: Tujuan (Goals)

#### Goal Progress Chart (per goal)

- **Chart type:** Area or line chart showing accumulated savings toward the goal over time
- **Actual line:** Historical balance allocated to the goal
- **Target line:** Horizontal dashed line at the goal's target amount
- **Projection toggle:** Optional — when enabled, extends the actual line forward as a dashed projection based on average savings velocity (last 90 days). Shows estimated completion date in tooltip.
- If target date is set on the goal, show a vertical dashed line at the target date.

Each goal gets its own chart card. If there are many goals, use an accordion or select dropdown.

---

### 2e. Tab: Tren Saldo (Balance Trend)

- **Existing functionality preserved** (daily/monthly toggle, FX/price data transparency, manual correction UX)

---

## 3. Budget Improvements

### Budget Types (Extended)

The existing "custom" budget (date-range based, multi-category envelope) remains. Two new types are added:

| Type | Description |
|------|-------------|
| **Kustom** (existing) | Fixed date range, one or more categories |
| **Bulanan** (new) | Repeats every calendar month, per-category OR envelope |
| **Tahunan** (new) | Repeats every calendar year, per-category OR envelope |

For Bulanan/Tahunan budgets, the user selects:
- **Model:** Kategori tunggal (one budget per category) OR Amplop (named pool, multiple categories)
- **Rollover behavior** (user-configurable per budget):
  - _Tidak ada rollover_ — each period starts fresh at full limit
  - _Sisa ditambahkan_ — unspent amount carries forward (overspent does NOT reduce next period)
  - _Rollover penuh_ — unspent adds; overspent reduces next period's limit

### Overlap Warning

If a category is assigned to more than one **active** budget in the same period, show an amber warning badge on both budgets:
_"Kategori ini sudah ada di anggaran lain yang aktif"_

Overlap is allowed but must be visible. Transactions are counted independently in each budget.

### Progress Visualization (all budget types)

- Progress bar in budget card (existing: improve visual clarity)
- Color: emerald <80%, amber 80–99%, rose ≥100%
- Show: spent / limit + remaining amount as caption
- Add a **mini spend-rate bar** chart inside the budget detail page (daily spend within the current period on X-axis, cumulative spend on Y-axis vs a projected "on-track" line)

### Budget vs Actual Chart (in budget detail page)

- Bar chart: each bar = one day (for current period) or one week/month (for yearly)
- Shows cumulative spend vs budget limit over the period
- "On track" reference line = budget_limit × (days_elapsed / total_days)

---

## 4. In-App Notifications

### Delivery

- In-app **toast notifications only** (no email, no push, no external channels)
- Client-side computation — no persistent notification records in the DB
- Triggered after each transaction save or on app load (check thresholds at startup)

### Trigger Events

#### A. Budget Threshold Alert

- **When:** Every time a new transaction is added to a budget AND the budget's cumulative spend crosses 80% or 100% of the limit
- **Toast content:** _"Anggaran '{nama}' telah mencapai {X}% dari limit"_
- **Color:** Amber (80%) or Rose (100%)
- Re-fires on every qualifying transaction (not debounced per session)

#### B. Debt Due Date Reminder

- **When:** App load, if any debt has a due date within N days (default: 7 days; user-configurable in settings)
- **Toast content:** _"Jatuh tempo hutang '{nama}' dalam {N} hari"_

#### C. Goal Milestone

- **When:** After any transaction that increases goal allocation crosses 25%, 50%, 75%, or 100% of the goal target
- **Toast content:** _"Tujuan '{nama}' sudah mencapai {X}% dari target!"_
- **Color:** Emerald

#### D. Unusual Spending Detection

Two layers, both configurable in a **Notification Settings** screen:

**Layer 1 — Manual threshold per category:**
- User sets: _"Tandai jika transaksi > Rp {X} di kategori {Y}"_
- Fires immediately when a transaction over the threshold is saved
- Toast: _"Transaksi besar terdeteksi: {amount} di {kategori}"_

**Layer 2 — Auto-detect (statistical):**
- Compares transaction amount against user's personal average for that category over a user-configured lookback window (default: 90 hari)
- Flag if transaction > mean + 2× standard deviation
- **Cold start rule:** Auto-detect is fully disabled if user has < 30 days of transaction history. Show in settings: _"Deteksi otomatis aktif setelah 30 hari data tersedia ({N} hari lagi)"_
- Toast: _"Pengeluaran tidak biasa terdeteksi: {amount} di {kategori} (rata-rata: {avg})"_

### Notification Settings Screen

Accessible from user settings. Controls:
- Toggle each trigger type on/off
- Manual threshold rules (CRUD)
- Lookback window for auto-detect (dropdown: 30 / 60 / 90 / 180 hari)
- Debt reminder lead time (N days)

---

## 5. Debt Management Improvements

### Debt Summary / Overview Section

Add a summary section at the top of the Debt Management page (above the debt list):

| Metric | Definition | Notes |
|--------|-----------|-------|
| **Total Hutang** | Sum of all outstanding debt in base currency | FX-converted with amber warning if stale |
| **Kewajiban Bulanan** | Sum of all monthly minimum payments across active debts | Only debts with a defined installment schedule |
| **Estimasi Lunas** | Estimated payoff date per debt at current payment velocity | Per-debt, shown as a badge on each debt card |
| **Rasio Utang/Pendapatan (DTI)** | Monthly obligations ÷ average monthly income (last 30 days) | If no income data in last 30 days, show "—" with tooltip explanation |

### Estimated Payoff Date Calculation

- Based on: (remaining balance) ÷ (average payment per period over last 3 payments)
- If < 3 payments recorded, show "—"
- Shown as a small label on each debt card: _"Est. lunas: {bulan tahun}"_

### DTI Display

- Show as a percentage with a progress-bar-style indicator
- Color: emerald <30%, amber 30–50%, rose >50%
- Tooltip: _"Rasio utang/pendapatan dihitung dari total kewajiban bulanan dibagi rata-rata pemasukan 30 hari terakhir"_

---

## 6. Investment Analytics Improvements

All improvements described in §2c (Analytics → Portofolio tab). Summary:

1. **Distribution charts:** Goal allocation + instrument + asset distribution (three views, tab toggle)
2. **Performance timeline:** Dual series (Nilai Saat Ini + Modal Aktif) for total mode; per-asset mode with up to 5 assets; custom date range; monthly forward-fill
3. **Transaction history per asset:** Summary (last 5) in asset detail + "Lihat semua" → full history page

---

## 7. Implementation Priority

### Sprint 1 (Highest Priority)

1. **Dashboard Redesign** — Supporting cards layout (Cash Flow, Budget health, Total wallet balance)
2. **Analytics Page shell** — Tab structure, global time range, migrate Balance Trend into it

### Sprint 2

3. **Cash Flow tab** — Income vs expense trend chart + category spending breakdown with modal drill-down
4. **Portofolio tab** — Investment distribution (both views) + performance timeline chart

### Sprint 3

5. **Budget recurring types** — Monthly/yearly, category + envelope, rollover config, overlap warning
6. **Budget alerts** — Toast on threshold crossing (client-side)
7. **Debt summary section** — Total, monthly obligations, DTI, estimated payoff per debt

### Sprint 4

8. **Goals tab** — Goal progress chart with projection toggle
9. **Notification settings screen** — All triggers + unusual spending config
10. **Auto-detect unusual spending** — Statistical baseline with 30-day cold start gate
11. **Asset transaction history** — Summary in detail + full history page

---

## Appendix: Edge Cases & Constraints

| Scenario | Resolution |
|----------|-----------|
| Budget with category overlap | Warn with amber badge, allow independently |
| Goal with no target amount | Hide projection line, show progress bar only |
| Goal with no target date | Projection shown but "target date" marker omitted |
| < 30 days transaction history | Auto-detect unusual spending disabled; show countdown in settings |
| Performance timeline for new asset | Chart starts from first buy transaction date |
| DTI with no income in last 30 days | Show "—" with tooltip; do not show 0% (misleading) |
| Estimated payoff with < 3 payments | Show "—" |
| Monthly budget created mid-month | First period is partial (from creation date to end of month) |
