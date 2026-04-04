🧠 Cashari — Project Description (for Claude Designer Context)
🧾 Overview

Cashari is a personal finance and investment tracking application designed to help users manage:
- Daily transactions
- Multi-wallet balances
- Investment portfolios
- Financial goals
- Analytics & reporting

The system supports multi-currency, investment assets, and historical valuation tracking, including FX rates and asset prices over time.

🎯 Core Objectives
- Provide accurate financial tracking across wallets and assets
- Support historical portfolio valuation
- Enable insightful analytics (trend, ROI, allocation, etc.)
- Maintain data correctness (FX + asset price at specific dates)
- Keep UX simple for casual users, but powerful for advanced users

🧱 Core Domain Model
1. Wallet
- Represents a container of funds
- Has:
  - currency_code
  - initial_amount
  - initial_exchange_rate_date (for base currency conversion)

2. Money Movements
Main transaction table:
- income / expense
- transfers
- investment actions
- growth (realized profit)
Supports:
- amount
- amount_unit (for assets)
- exchange_rate

3. Investment Structure
Hierarchy:
`Wallet → Goal → Instrument → Asset`
- Goal → purpose (e.g., retirement, emergency fund)
- Instrument → type (stock, crypto, mutual fund)
- Asset → specific item (AAPL, BTC, etc.)

4. Market Data
Asset Prices
- investment_asset_values
- Historical price per asset per date
FX Rates
- exchange_rates
- Historical currency conversion rates

📊 Analytics Engine (Important Context)
Cashari implements a portfolio valuation engine that calculates:
Key Metrics
- Active Capital
- Invested Capital
- Current Value
- Realized Profit
- Unrealized Profit
- Unrealized Return (profit / active capital)

Historical Valuation
The system supports:
- Daily / Monthly trend
- Forward-filled data:
  - asset price
  - FX rate
  - cumulative balance

Current Architecture
- Heavy computation handled via:
  - Materialized View (portfolio_valuation_mv)
- Indexed for:
  - user_id
  - movement_date
  - entity keys
- Access pattern:
`Client → RPC → MV → UI`

🖥️ Current UI (Important for Designer)
Asset List Page
Each row shows:
- Asset Name
- Instrument Name
- Active Capital
- Average Price
- Market Price
- Current Value
- Profit / Loss

Balance Trend Page
- Time-series chart
- Daily / Monthly filter
- show FX rate + asset price per point
- allow manual correction if data mismatch

⚖️ Key Product Philosophy
1. Accuracy First
- Historical values must reflect:
  - correct FX rate
  - correct asset price
- Users can override missing data

2. Progressive Complexity
- Beginner users:
  - simple balances
- Advanced users:
  - full analytics (returns, breakdowns, etc.)

3. Transparency
- Show:
  - data source date (FX / price)
- Avoid “black box” calculations

4. Performance-Aware UX
- Heavy queries handled via:
  - materialized view
  - background refresh
- UI should not trigger expensive operations directly

🚧 Current Challenges (Important for Designer AI)
Claude should be aware of these:
1. Complex Data Model
- Multi-level hierarchy
- Multi-currency + assets

2. Performance Constraints
- Large dataset (time-series + forward fill)
- Avoid heavy queries on UI

3. Data Gaps
- Missing FX / price on certain dates
- Needs fallback + manual correction UX

4. UX Trade-offs
- Too much detail → overwhelming
- Too little detail → misleading

🎨 Design Expectations for Claude (Designer Role)
When Claude analyzes the codebase and proposes design:

MUST DO
1. Align with existing data model
  - Do NOT simplify away:
    - wallet / goal / instrument / asset
2. Respect analytics complexity
  - Avoid fake/simple metrics
  - Keep:
    - realized vs unrealized
    - FX vs asset return
3. Compare alternatives
  - If proposing new design:
    - explain trade-offs
    - justify why better
4. Handle data correctness UX
  - Missing FX / price → must be visible
  - Allow correction flows

SHOULD DO
Improve:
- readability
- hierarchy clarity
- visual grouping
Suggest:
- better naming
- better layout
- better interaction patterns

SHOULD NOT DO
- Remove important financial concepts
- Oversimplify calculations
- Ignore multi-currency behavior
- Trigger heavy backend operations from UI

🧪 Example UX Direction (Reference for Claude)
Good patterns to encourage:
- Expandable asset rows
  - summary → detail view
- Tooltips / info icon
  - show:
    - FX rate date
    - asset price date
- Status indicator
  - “data outdated”
  - “using fallback value”