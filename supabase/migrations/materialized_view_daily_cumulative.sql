-- reference: https://github.com/orgs/supabase/discussions/17790#discussioncomment-11763669

CREATE SCHEMA analytics;
CREATE MATERIALIZED VIEW analytics.portfolio_valuation_mv
AS
WITH date_bounds AS (
  SELECT
    MIN(date)::date AS min_date,
    MAX(date)::date AS max_date
  FROM money_movements
),

date_spine AS (
  SELECT
    generate_series(
      (SELECT min_date FROM date_bounds),
      (SELECT max_date FROM date_bounds),
      INTERVAL '1 day'
    )::date AS movement_date
),

base_movements AS (
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
    mm.date::date AS movement_date,
    SUM(mm.amount) AS daily_amount,
    SUM(mm.amount_unit) AS daily_amount_unit,
    MAX(mm.currency_code) AS original_currency_code,
    MAX(mm.base_currency_code) AS base_currency_code
  FROM money_movements mm
  GROUP BY
    mm.user_id,
    mm.wallet_id,
    mm.goal_id,
    mm.instrument_id,
    mm.asset_id,
    mm.date::date
),

cumulative AS (
  SELECT
    b.*,
    SUM(b.daily_amount) OVER (
      PARTITION BY b.user_id, b.wallet_id, b.goal_id,
                   b.instrument_id, b.asset_id
      ORDER BY b.movement_date
    ) AS cumulative_amount,
    SUM(b.daily_amount_unit) OVER (
      PARTITION BY b.user_id, b.wallet_id, b.goal_id,
                   b.instrument_id, b.asset_id
      ORDER BY b.movement_date
    ) AS cumulative_unit
  FROM base_movements b
),

entity_spine AS (
  SELECT DISTINCT
    user_id,
    wallet_id,
    wallet_name,
    goal_id,
    goal_name,
    instrument_id,
    instrument_name,
    asset_id,
    asset_name,
    original_currency_code,
    base_currency_code
  FROM cumulative
),

grid AS (
  SELECT
    e.*,
    d.movement_date
  FROM entity_spine e
  CROSS JOIN date_spine d
),

grid_with_raw AS (
  SELECT
    g.*,
    c.cumulative_amount,
    c.cumulative_unit
  FROM grid g
  LEFT JOIN cumulative c
    ON c.user_id = g.user_id
   AND c.wallet_id = g.wallet_id
   AND c.goal_id IS NOT DISTINCT FROM g.goal_id
   AND c.instrument_id IS NOT DISTINCT FROM g.instrument_id
   AND c.asset_id IS NOT DISTINCT FROM g.asset_id
   AND c.movement_date = g.movement_date
),

-- forward fill cumulative (NO lateral)
grid_with_cumulative AS (
  SELECT *,
    FIRST_VALUE(cumulative_amount) OVER (
      PARTITION BY user_id, wallet_id, goal_id,
                   instrument_id, asset_id, grp_amt
      ORDER BY movement_date
    ) AS cumulative_amount_filled,
    FIRST_VALUE(cumulative_unit) OVER (
      PARTITION BY user_id, wallet_id, goal_id,
                   instrument_id, asset_id, grp_unit
      ORDER BY movement_date
    ) AS cumulative_unit_filled
  FROM (
    SELECT *,
      COUNT(cumulative_amount) OVER (
        PARTITION BY user_id, wallet_id, goal_id,
                     instrument_id, asset_id
        ORDER BY movement_date
      ) AS grp_amt,
      COUNT(cumulative_unit) OVER (
        PARTITION BY user_id, wallet_id, goal_id,
                     instrument_id, asset_id
        ORDER BY movement_date
      ) AS grp_unit
    FROM grid_with_raw
  ) t
),

-- asset price forward fill
asset_price_join AS (
  SELECT
    g.*,
    iav.value AS asset_price_raw,
    iav.date  AS asset_price_date_raw
  FROM grid_with_cumulative g
  LEFT JOIN investment_asset_values iav
    ON iav.user_id = g.user_id
   AND iav.asset_id = g.asset_id
   AND iav.date = g.movement_date
),

asset_price_filled AS (
  SELECT *,
    FIRST_VALUE(asset_price_raw) OVER (
      PARTITION BY user_id, asset_id, grp_price
      ORDER BY movement_date
    ) AS historical_asset_price,
    FIRST_VALUE(asset_price_date_raw) OVER (
      PARTITION BY user_id, asset_id, grp_price
      ORDER BY movement_date
    ) AS asset_price_date_used
  FROM (
    SELECT *,
      COUNT(asset_price_raw) OVER (
        PARTITION BY user_id, asset_id
        ORDER BY movement_date
      ) AS grp_price
    FROM asset_price_join
  ) x
),

-- fx forward fill
fx_join AS (
  SELECT
    a.*,
    er.rate AS fx_raw,
    er.date AS fx_date_raw
  FROM asset_price_filled a
  LEFT JOIN exchange_rates er
    ON er.from_currency = a.original_currency_code
   AND er.to_currency = a.base_currency_code
   AND er.date = a.movement_date
),

fx_filled AS (
  SELECT *,
    FIRST_VALUE(fx_raw) OVER (
      PARTITION BY original_currency_code,
                   base_currency_code, grp_fx
      ORDER BY movement_date
    ) AS historical_fx_rate,
    FIRST_VALUE(fx_date_raw) OVER (
      PARTITION BY original_currency_code,
                   base_currency_code, grp_fx
      ORDER BY movement_date
    ) AS fx_rate_date_used
  FROM (
    SELECT *,
      COUNT(fx_raw) OVER (
        PARTITION BY original_currency_code,
                     base_currency_code
        ORDER BY movement_date
      ) AS grp_fx
    FROM fx_join
  ) y
)

SELECT
  f.user_id,
  f.wallet_id,
  f.wallet_name,
  f.goal_id,
  f.goal_name,
  f.instrument_id,
  f.instrument_name,
  f.asset_id,
  f.asset_name,
  f.movement_date,
  COALESCE(f.cumulative_amount_filled, 0) AS cumulative_amount,
  COALESCE(f.cumulative_unit_filled, 0) AS cumulative_unit,
  f.historical_asset_price,
  f.asset_price_date_used,
  CASE
    WHEN f.original_currency_code = f.base_currency_code
    THEN 1
    ELSE f.historical_fx_rate
  END AS historical_fx_rate,
  CASE
    WHEN f.original_currency_code = f.base_currency_code
    THEN f.movement_date
    ELSE f.fx_rate_date_used
  END AS fx_rate_date_used,

  ii.is_trackable,
  
  -- current value
  CASE
    WHEN ii.is_trackable = TRUE
    THEN COALESCE(f.cumulative_unit_filled, 0) * f.historical_asset_price
    ELSE COALESCE(f.cumulative_amount_filled, 0)
  END AS historical_current_value,

  CASE
    WHEN ii.is_trackable = TRUE
    THEN COALESCE(f.cumulative_unit_filled, 0) * f.historical_asset_price *
         CASE
           WHEN f.original_currency_code = f.base_currency_code
           THEN 1
           ELSE f.historical_fx_rate
         END
    ELSE COALESCE(f.cumulative_amount_filled, 0) *
         CASE
           WHEN f.original_currency_code = f.base_currency_code
           THEN 1
           ELSE f.historical_fx_rate
         END
  END AS historical_current_value_base_currency,

  f.original_currency_code,
  f.base_currency_code
FROM fx_filled f
LEFT JOIN investment_instruments ii ON ii.id = f.instrument_id
-- WHERE f.wallet_id in (41, 43)
-- and f.movement_date = '2026-03-01'
ORDER BY
  f.wallet_name,
  f.goal_name,
  f.instrument_name,
  f.asset_name,
  f.movement_date DESC;

CREATE INDEX idx_portfolio_mv_user_date
ON analytics.portfolio_valuation_mv (user_id, movement_date);

CREATE INDEX idx_portfolio_mv_user_entity_date
ON analytics.portfolio_valuation_mv
(user_id, wallet_id, goal_id, instrument_id, asset_id, movement_date);

-- unique
CREATE UNIQUE INDEX idx_portfolio_mv_unique
ON analytics.portfolio_valuation_mv
(user_id, wallet_id, goal_id, instrument_id, asset_id, movement_date);

-- revoke
REVOKE ALL ON analytics.portfolio_valuation_mv FROM PUBLIC, ANON, AUTHENTICATED;
GRANT SELECT ON analytics.portfolio_valuation_mv TO postgres;

-- function
CREATE OR REPLACE FUNCTION analytics.get_portfolio_valuation_mv()
RETURNS SETOF analytics.portfolio_valuation_mv AS $$
BEGIN
    RETURN QUERY SELECT * FROM analytics.portfolio_valuation_mv 
    -- RLS-like behavior
    WHERE user_id = auth.uid() AND auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION analytics.get_portfolio_valuation_mv() TO authenticated;

-- view
CREATE VIEW public.daily_cumulative WITH (security_invoker=on) AS
SELECT * FROM analytics.get_portfolio_valuation_mv();