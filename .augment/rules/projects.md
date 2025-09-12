---
type: "always_apply"
---

# Project Context: Cashari

## Overview
Cashari is a **multi-currency money tracker** with investment support.  
The app helps users manage personal finance, track cash flow, monitor debts, and evaluate investment performance.

## Goals
- Track daily income/expenses across multiple wallets and currencies.  
- Manage goals (e.g., emergency fund, umrah saving, etc.) and investment transfers.  
- Record business projects with related transactions.  
- Provide financial insights (cash flow, net worth, profit/loss, etc.).  
- Support exchange rates for currencies and commodities (gold, silver, crypto).  

## Features
- **Authentication** (Supabase Auth)  
- **Wallets** (cash, bank accounts, RDN, investment platforms)  
- **Transactions** (income/expense with categories)  
- **Transfers** (wallet to wallet, goal to goal)  
- **Budgets** (plan and track spending)  
- **Debts** (loan & borrowed, with histories)  
- **Goals** (with investment support)  
- **Business Projects** (track income/expenses per project)  
- **Investments** (track units of shares, gold, crypto, etc., with valuation)  
- **Exchange Rates** (multi-currency base conversion)  

## Tech Stack
- **Frontend:** React + TypeScript + Vite  
- **Backend:** Supabase (Postgres + RLS + Functions)  
- **Styling:** TailwindCSS + Lucide React icons  
- **State/Data:** TanStack Query + Supabase client  
- **APIs:** Exchange Rate APIs, Crypto APIs, Gold APIs  

## Design Considerations
- Multi-currency support with base currency defined per user.  
- Exchange rate cronjob via Supabase Edge Functions (service role).  
- Normalized database design for flexibility and scalability.  
- Maintainable folder structure (`lib`, `hooks`, `features`, `components`).  
