-- Add budget_type enum
DO $$ BEGIN
  CREATE TYPE budget_type AS ENUM ('kustom', 'bulanan', 'tahunan');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add rollover_type enum
DO $$ BEGIN
  CREATE TYPE rollover_type AS ENUM ('none', 'add_remaining', 'full');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add budget_type and rollover_type columns to budgets table
ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS budget_type budget_type NOT NULL DEFAULT 'kustom',
  ADD COLUMN IF NOT EXISTS rollover_type rollover_type NOT NULL DEFAULT 'none';

-- Make end_date nullable so bulanan/tahunan budgets don't require a fixed end date
ALTER TABLE budgets
  ALTER COLUMN end_date DROP NOT NULL;

-- Create budget_categories join table for category-level budget associations
CREATE TABLE IF NOT EXISTS budget_categories (
  id BIGSERIAL PRIMARY KEY,
  budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(budget_id, category_id)
);

-- Enable RLS
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget categories"
  ON budget_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget categories"
  ON budget_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories"
  ON budget_categories FOR DELETE
  USING (auth.uid() = user_id);
