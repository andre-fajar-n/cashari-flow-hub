---
type: "always_apply"
description: "Example description"
---

# Supabase Context: Cashari

## Database Entities
Tables include:
- users, currencies, wallets, categories  
- transactions, transfers, debts, debt_histories  
- goals, goal_transfers, goal_investment_records  
- budgets, budget_items  
- business_projects, business_project_transactions  
- investment_instruments, investment_assets  
- exchange_rates  

## Important Rules
- **Currencies & Exchange Rates**  
  - Global master tables, shared across users.  
  - Users: `SELECT` only.  
  - Updates handled by service role Edge Functions.  

- **User-owned tables**  
  - Always have `user_id`.  
  - RLS enforces: `user_id = auth.uid()`.  

## Functions
- Insert/Update/Delete transactions with relation handling (budgets, projects).  
- Wrap mutations in `BEGIN … COMMIT` transactions to ensure consistency.  
- Bulk insert/update supported for transaction data.  

## Views
- `money_movements`
    - unified view for transactions, transfers, goals.
    - Useful for reports and aggregations.
- `fund_summary`:
    - Summary of balances per wallet, with optional grouping by goal, instrument, and asset.  
    - Includes initial balance + accumulated money movements.
    - Useful for showing current balance breakdowns in dashboards.

## Security
- RLS policies applied per table.  
- Edge Functions can bypass RLS with service role (cronjobs, background jobs).  
