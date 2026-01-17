-- ==============================================
-- Security Fixes Migration
-- ==============================================

-- 1. Fix handle_new_user() function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    LEFT(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 255)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 2. Fix exchange_rates table - restrict to authenticated users only
DROP POLICY IF EXISTS "Enable read access for all users" ON public.exchange_rates;

CREATE POLICY "Authenticated users can read exchange rates"
ON public.exchange_rates
FOR SELECT
TO authenticated
USING (true);

-- 3. Drop dependent views first (in correct order), then recreate with security_invoker
DROP VIEW IF EXISTS public.missing_exchange_rate CASCADE;
DROP VIEW IF EXISTS public.budget_summary CASCADE;
DROP VIEW IF EXISTS public.money_summary CASCADE;
DROP VIEW IF EXISTS public.budget_item_with_transactions CASCADE;
DROP VIEW IF EXISTS public.money_movements CASCADE;
DROP VIEW IF EXISTS public.business_project_summary CASCADE;
DROP VIEW IF EXISTS public.debt_summary CASCADE;
DROP VIEW IF EXISTS public.transaction_associations CASCADE;
DROP VIEW IF EXISTS public.currency_pairs CASCADE;

-- Recreate money_movements view with security_invoker
CREATE OR REPLACE VIEW public.money_movements
WITH (security_invoker = on)
AS
WITH recap AS (
  SELECT 
    t.id AS resource_id,
    'transactions'::text AS resource_type,
    t.user_id,
    t.wallet_id,
    t.category_id,
    t.amount,
    t.date,
    NULL::integer AS goal_id,
    NULL::integer AS instrument_id,
    NULL::integer AS asset_id,
    t.description,
    t.created_at,
    NULL::numeric AS amount_unit,
    NULL::integer AS opposite_wallet_id,
    NULL::numeric AS opposite_amount,
    NULL::integer AS opposite_goal_id,
    NULL::integer AS opposite_instrument_id,
    NULL::integer AS opposite_asset_id,
    NULL::integer AS debt_id
  FROM public.transactions t
  UNION ALL
  SELECT 
    tr.id AS resource_id,
    'transfers'::text AS resource_type,
    tr.user_id,
    tr.from_wallet_id AS wallet_id,
    NULL::integer AS category_id,
    -tr.from_amount AS amount,
    tr.date,
    NULL::integer AS goal_id,
    NULL::integer AS instrument_id,
    NULL::integer AS asset_id,
    NULL::text AS description,
    tr.created_at,
    NULL::numeric AS amount_unit,
    tr.to_wallet_id AS opposite_wallet_id,
    tr.to_amount AS opposite_amount,
    NULL::integer AS opposite_goal_id,
    NULL::integer AS opposite_instrument_id,
    NULL::integer AS opposite_asset_id,
    NULL::integer AS debt_id
  FROM public.transfers tr
  UNION ALL
  SELECT 
    gt.id AS resource_id,
    'goal_transfers'::text AS resource_type,
    gt.user_id,
    gt.from_wallet_id AS wallet_id,
    NULL::integer AS category_id,
    -gt.from_amount AS amount,
    gt.date,
    gt.from_goal_id AS goal_id,
    gt.from_instrument_id AS instrument_id,
    gt.from_asset_id AS asset_id,
    NULL::text AS description,
    gt.created_at,
    -gt.from_amount_unit AS amount_unit,
    gt.to_wallet_id AS opposite_wallet_id,
    gt.to_amount AS opposite_amount,
    gt.to_goal_id AS opposite_goal_id,
    gt.to_instrument_id AS opposite_instrument_id,
    gt.to_asset_id AS opposite_asset_id,
    NULL::integer AS debt_id
  FROM public.goal_transfers gt
  WHERE gt.from_wallet_id IS NOT NULL OR gt.from_goal_id IS NOT NULL
  UNION ALL
  SELECT 
    gt.id AS resource_id,
    'goal_transfers'::text AS resource_type,
    gt.user_id,
    gt.to_wallet_id AS wallet_id,
    NULL::integer AS category_id,
    gt.to_amount AS amount,
    gt.date,
    gt.to_goal_id AS goal_id,
    gt.to_instrument_id AS instrument_id,
    gt.to_asset_id AS asset_id,
    NULL::text AS description,
    gt.created_at,
    gt.to_amount_unit AS amount_unit,
    gt.from_wallet_id AS opposite_wallet_id,
    -gt.from_amount AS opposite_amount,
    gt.from_goal_id AS opposite_goal_id,
    gt.from_instrument_id AS opposite_instrument_id,
    gt.from_asset_id AS opposite_asset_id,
    NULL::integer AS debt_id
  FROM public.goal_transfers gt
  WHERE gt.to_wallet_id IS NOT NULL OR gt.to_goal_id IS NOT NULL
  UNION ALL
  SELECT 
    gir.id AS resource_id,
    'goal_investment_records'::text AS resource_type,
    gir.user_id,
    gir.wallet_id,
    gir.category_id,
    gir.amount,
    gir.date,
    gir.goal_id,
    gir.instrument_id,
    gir.asset_id,
    gir.description,
    gir.created_at,
    gir.amount_unit,
    NULL::integer AS opposite_wallet_id,
    NULL::numeric AS opposite_amount,
    NULL::integer AS opposite_goal_id,
    NULL::integer AS opposite_instrument_id,
    NULL::integer AS opposite_asset_id,
    NULL::integer AS debt_id
  FROM public.goal_investment_records gir
  WHERE gir.is_valuation = false
  UNION ALL
  SELECT 
    dh.id AS resource_id,
    'debt_histories'::text AS resource_type,
    dh.user_id,
    dh.wallet_id,
    dh.category_id,
    dh.amount,
    dh.date,
    NULL::integer AS goal_id,
    NULL::integer AS instrument_id,
    NULL::integer AS asset_id,
    dh.description,
    dh.created_at,
    NULL::numeric AS amount_unit,
    NULL::integer AS opposite_wallet_id,
    NULL::numeric AS opposite_amount,
    NULL::integer AS opposite_goal_id,
    NULL::integer AS opposite_instrument_id,
    NULL::integer AS opposite_asset_id,
    dh.debt_id
  FROM public.debt_histories dh
)
SELECT 
  recap.resource_id * 10 + 
    CASE recap.resource_type
      WHEN 'transactions' THEN 1
      WHEN 'transfers' THEN 2
      WHEN 'goal_transfers' THEN 3
      WHEN 'goal_investment_records' THEN 4
      WHEN 'debt_histories' THEN 5
      ELSE 0
    END AS id,
  recap.resource_id,
  recap.resource_type,
  recap.user_id,
  recap.wallet_id,
  w.name AS wallet_name,
  recap.category_id,
  c.name AS category_name,
  recap.description,
  recap.amount,
  cur.code AS currency_code,
  cur.symbol AS currency_symbol,
  recap.date,
  recap.created_at,
  recap.goal_id,
  g.name AS goal_name,
  recap.instrument_id,
  i.name AS instrument_name,
  recap.asset_id,
  a.name AS asset_name,
  a.symbol AS asset_symbol,
  i.unit_label,
  recap.amount_unit,
  recap.opposite_wallet_id,
  ow.name AS opposite_wallet_name,
  recap.opposite_goal_id,
  og.name AS opposite_goal_name,
  recap.opposite_instrument_id,
  oi.name AS opposite_instrument_name,
  recap.opposite_asset_id,
  oa.name AS opposite_asset_name,
  oa.symbol AS opposite_asset_symbol,
  recap.debt_id,
  d.name AS debt_name,
  def_cur.code AS base_currency_code,
  def_cur.symbol AS base_currency_symbol,
  CASE
    WHEN cur.code = def_cur.code THEN 1
    ELSE er.rate
  END AS exchange_rate,
  ARRAY_AGG(DISTINCT bi.budget_id) FILTER (WHERE bi.budget_id IS NOT NULL) AS budget_ids,
  STRING_AGG(DISTINCT b.name, ', ') AS budget_names_text,
  ARRAY_AGG(DISTINCT bpt.project_id) FILTER (WHERE bpt.project_id IS NOT NULL) AS project_ids,
  STRING_AGG(DISTINCT bp.name, ', ') AS business_project_names_text
FROM recap
LEFT JOIN public.wallets w ON w.id = recap.wallet_id
LEFT JOIN public.currencies cur ON cur.code = w.currency_code AND cur.user_id = recap.user_id
LEFT JOIN public.currencies def_cur ON def_cur.user_id = recap.user_id AND def_cur.is_default = true
LEFT JOIN public.exchange_rates er ON er.from_currency = cur.code AND er.to_currency = def_cur.code AND er.date = recap.date
LEFT JOIN public.categories c ON c.id = recap.category_id
LEFT JOIN public.goals g ON g.id = recap.goal_id
LEFT JOIN public.investment_instruments i ON i.id = recap.instrument_id
LEFT JOIN public.investment_assets a ON a.id = recap.asset_id
LEFT JOIN public.wallets ow ON ow.id = recap.opposite_wallet_id
LEFT JOIN public.goals og ON og.id = recap.opposite_goal_id
LEFT JOIN public.investment_instruments oi ON oi.id = recap.opposite_instrument_id
LEFT JOIN public.investment_assets oa ON oa.id = recap.opposite_asset_id
LEFT JOIN public.debts d ON d.id = recap.debt_id
LEFT JOIN public.budget_items bi ON bi.transaction_id = recap.resource_id AND recap.resource_type = 'transactions'
LEFT JOIN public.budgets b ON b.id = bi.budget_id
LEFT JOIN public.business_project_transactions bpt ON bpt.transaction_id = recap.resource_id AND recap.resource_type = 'transactions'
LEFT JOIN public.business_projects bp ON bp.id = bpt.project_id
GROUP BY 
  recap.resource_id, recap.resource_type, recap.user_id, recap.wallet_id, w.name,
  recap.category_id, c.name, recap.description, recap.amount, cur.code, cur.symbol,
  recap.date, recap.created_at, recap.goal_id, g.name, recap.instrument_id, i.name,
  recap.asset_id, a.name, a.symbol, i.unit_label, recap.amount_unit,
  recap.opposite_wallet_id, ow.name, recap.opposite_goal_id, og.name,
  recap.opposite_instrument_id, oi.name, recap.opposite_asset_id, oa.name, oa.symbol,
  recap.debt_id, d.name, def_cur.code, def_cur.symbol, er.rate;

-- Recreate budget_item_with_transactions view with security_invoker
CREATE OR REPLACE VIEW public.budget_item_with_transactions
WITH (security_invoker = on)
AS
SELECT 
  mm.user_id,
  bi.id,
  bi.budget_id,
  bi.transaction_id,
  mm.wallet_id,
  mm.wallet_name,
  mm.category_id,
  mm.category_name,
  mm.description,
  mm.amount,
  mm.currency_code AS original_currency_code,
  mm.currency_symbol AS original_currency_symbol,
  mm.date,
  b.currency_code AS base_currency_code,
  c.symbol AS base_currency_symbol,
  CASE
    WHEN mm.currency_code = b.currency_code THEN 1
    ELSE er.rate
  END AS exchange_rate,
  mm.budget_ids,
  mm.budget_names_text,
  mm.created_at
FROM public.budget_items bi
JOIN public.money_movements mm ON mm.resource_id = bi.transaction_id AND mm.resource_type = 'transactions'
JOIN public.budgets b ON b.id = bi.budget_id
LEFT JOIN public.currencies c ON c.code = b.currency_code AND c.user_id = mm.user_id
LEFT JOIN public.exchange_rates er ON er.from_currency = mm.currency_code 
  AND er.to_currency = b.currency_code 
  AND er.date = mm.date;

-- Recreate budget_summary view with security_invoker
CREATE OR REPLACE VIEW public.budget_summary
WITH (security_invoker = on)
AS
WITH summary AS (
  SELECT 
    biwt.user_id,
    biwt.budget_id,
    SUM(biwt.amount) AS amount,
    biwt.original_currency_code,
    MAX(biwt.original_currency_symbol) AS original_currency_symbol,
    CASE
      WHEN bool_or(biwt.exchange_rate IS NULL) THEN NULL
      ELSE SUM(biwt.amount * biwt.exchange_rate)
    END AS amount_in_base_currency,
    MAX(biwt.base_currency_code) AS base_currency_code,
    MAX(biwt.base_currency_symbol) AS base_currency_symbol
  FROM public.budget_item_with_transactions biwt
  GROUP BY biwt.user_id, biwt.budget_id, biwt.original_currency_code
)
SELECT 
  b.id AS budget_id,
  b.user_id,
  b.name,
  b.amount AS budget_amount,
  b.start_date,
  b.end_date,
  s.original_currency_code,
  s.original_currency_symbol,
  s.base_currency_code,
  s.base_currency_symbol,
  COALESCE(s.amount, 0) AS amount,
  COALESCE(s.amount_in_base_currency, 0) AS amount_in_base_currency
FROM public.budgets b
LEFT JOIN summary s ON s.budget_id = b.id;

-- Recreate money_summary view with security_invoker
CREATE OR REPLACE VIEW public.money_summary
WITH (security_invoker = on)
AS
WITH movement AS (
  SELECT 
    mm.user_id,
    mm.wallet_id,
    MAX(mm.wallet_name) AS wallet_name,
    mm.goal_id,
    MAX(mm.goal_name) AS goal_name,
    mm.instrument_id,
    MAX(mm.instrument_name) AS instrument_name,
    mm.asset_id,
    MAX(mm.asset_name) AS asset_name,
    MAX(mm.asset_symbol) AS asset_symbol,
    SUM(mm.amount) AS amount,
    SUM(mm.amount_unit) AS amount_unit,
    MAX(mm.currency_code) AS original_currency_code,
    MAX(mm.currency_symbol) AS original_currency_symbol,
    MAX(mm.base_currency_code) AS base_currency_code,
    MAX(mm.base_currency_symbol) AS base_currency_symbol,
    MAX(mm.unit_label) AS unit_label
  FROM public.money_movements mm
  GROUP BY mm.user_id, mm.wallet_id, mm.goal_id, mm.instrument_id, mm.asset_id
)
SELECT 
  mv.user_id,
  mv.wallet_id,
  mv.wallet_name,
  mv.goal_id,
  mv.goal_name,
  mv.instrument_id,
  mv.instrument_name,
  mv.asset_id,
  mv.asset_name,
  mv.asset_symbol,
  mv.unit_label,
  mv.original_currency_code,
  mv.original_currency_symbol,
  mv.base_currency_code,
  mv.base_currency_symbol,
  COALESCE(mv.amount, 0) + COALESCE(w.initial_amount, 0) AS amount,
  mv.amount_unit,
  er.rate AS latest_rate,
  er.date AS latest_rate_date,
  iav.value AS latest_asset_value,
  iav.date AS latest_asset_value_date
FROM movement mv
LEFT JOIN public.wallets w ON w.id = mv.wallet_id
LEFT JOIN LATERAL (
  SELECT rate, date 
  FROM public.exchange_rates 
  WHERE from_currency = mv.original_currency_code 
    AND to_currency = mv.base_currency_code
  ORDER BY date DESC 
  LIMIT 1
) er ON true
LEFT JOIN LATERAL (
  SELECT value, date 
  FROM public.investment_asset_values 
  WHERE asset_id = mv.asset_id
  ORDER BY date DESC 
  LIMIT 1
) iav ON mv.asset_id IS NOT NULL;

-- Recreate business_project_summary view with security_invoker
CREATE OR REPLACE VIEW public.business_project_summary
WITH (security_invoker = on)
AS
SELECT
  bp.id,
  bp.user_id,
  def_cur.code AS currency_code,
  def_cur.symbol AS currency_symbol,
  def_cur.code AS base_currency_code,
  def_cur.symbol AS base_currency_symbol,
  COALESCE(SUM(CASE WHEN c.is_income = true THEN t.amount ELSE 0 END), 0) AS income_amount,
  COALESCE(SUM(CASE WHEN c.is_income = false THEN t.amount ELSE 0 END), 0) AS expense_amount,
  COALESCE(SUM(CASE WHEN c.is_income = true THEN t.amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN c.is_income = false THEN t.amount ELSE 0 END), 0) AS net_amount,
  COALESCE(SUM(CASE WHEN c.is_income = true THEN t.amount * COALESCE(er.rate, 1) ELSE 0 END), 0) AS income_amount_in_base_currency,
  COALESCE(SUM(CASE WHEN c.is_income = false THEN t.amount * COALESCE(er.rate, 1) ELSE 0 END), 0) AS expense_amount_in_base_currency,
  COALESCE(SUM(CASE WHEN c.is_income = true THEN t.amount * COALESCE(er.rate, 1) ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN c.is_income = false THEN t.amount * COALESCE(er.rate, 1) ELSE 0 END), 0) AS net_amount_in_base_currency
FROM public.business_projects bp
LEFT JOIN public.currencies def_cur ON def_cur.user_id = bp.user_id AND def_cur.is_default = true
LEFT JOIN public.business_project_transactions bpt ON bpt.project_id = bp.id
LEFT JOIN public.transactions t ON t.id = bpt.transaction_id
LEFT JOIN public.categories c ON c.id = t.category_id
LEFT JOIN public.wallets w ON w.id = t.wallet_id
LEFT JOIN public.exchange_rates er ON er.from_currency = w.currency_code
  AND er.to_currency = def_cur.code
  AND er.date = t.date
GROUP BY bp.id, bp.user_id, def_cur.code, def_cur.symbol;

-- Recreate debt_summary view with security_invoker
CREATE OR REPLACE VIEW public.debt_summary
WITH (security_invoker = on)
AS
SELECT
  d.id AS debt_id,
  d.user_id,
  d.name AS debt_name,
  def_cur.code AS currency_code,
  def_cur.symbol AS currency_symbol,
  def_cur.code AS base_currency_code,
  def_cur.symbol AS base_currency_symbol,
  COALESCE(SUM(CASE WHEN c.is_income = true THEN dh.amount ELSE 0 END), 0) AS income_amount,
  COALESCE(SUM(CASE WHEN c.is_income = false THEN dh.amount ELSE 0 END), 0) AS outcome_amount,
  COALESCE(SUM(CASE WHEN c.is_income = true THEN dh.amount * COALESCE(er.rate, 1) ELSE 0 END), 0) AS income_amount_in_base_currency,
  COALESCE(SUM(CASE WHEN c.is_income = false THEN dh.amount * COALESCE(er.rate, 1) ELSE 0 END), 0) AS outcome_amount_in_base_currency
FROM public.debts d
LEFT JOIN public.currencies def_cur ON def_cur.user_id = d.user_id AND def_cur.is_default = true
LEFT JOIN public.debt_histories dh ON dh.debt_id = d.id
LEFT JOIN public.categories c ON c.id = dh.category_id
LEFT JOIN public.wallets w ON w.id = dh.wallet_id
LEFT JOIN public.exchange_rates er ON er.from_currency = w.currency_code
  AND er.to_currency = def_cur.code
  AND er.date = dh.date
GROUP BY d.id, d.user_id, d.name, def_cur.code, def_cur.symbol;

-- Recreate transaction_associations view with security_invoker
CREATE OR REPLACE VIEW public.transaction_associations
WITH (security_invoker = on)
AS
SELECT 
  t.id AS transaction_id,
  t.user_id,
  (
    SELECT json_agg(json_build_object('id', b.id, 'name', b.name))
    FROM public.budget_items bi
    JOIN public.budgets b ON b.id = bi.budget_id
    WHERE bi.transaction_id = t.id
  ) AS budgets,
  (
    SELECT json_agg(json_build_object('id', bp.id, 'name', bp.name))
    FROM public.business_project_transactions bpt
    JOIN public.business_projects bp ON bp.id = bpt.project_id
    WHERE bpt.transaction_id = t.id
  ) AS business_projects
FROM public.transactions t;

-- Recreate currency_pairs view with security_invoker
CREATE OR REPLACE VIEW public.currency_pairs
WITH (security_invoker = on)
AS
SELECT DISTINCT 
  c.code AS currency_code,
  def_c.code AS base_currency_code
FROM public.currencies c
JOIN public.currencies def_c ON def_c.user_id = c.user_id AND def_c.is_default = true
WHERE c.code != def_c.code;

-- Recreate missing_exchange_rate view with security_invoker
CREATE OR REPLACE VIEW public.missing_exchange_rate
WITH (security_invoker = on)
AS
SELECT DISTINCT 
  mm.currency_code,
  mm.base_currency_code,
  mm.date
FROM public.money_movements mm
WHERE mm.exchange_rate IS NULL AND mm.currency_code != mm.base_currency_code
UNION
SELECT DISTINCT 
  biwt.original_currency_code AS currency_code,
  biwt.base_currency_code,
  biwt.date
FROM public.budget_item_with_transactions biwt
WHERE biwt.exchange_rate IS NULL AND biwt.original_currency_code != biwt.base_currency_code;