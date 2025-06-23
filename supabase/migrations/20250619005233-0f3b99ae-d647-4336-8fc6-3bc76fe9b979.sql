
-- Create profiles table to extend auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enum types
CREATE TYPE public.category_application AS ENUM ('transaction', 'investment');
CREATE TYPE public.debt_type AS ENUM ('loan', 'borrowed');

-- Create currencies table
CREATE TABLE public.currencies (
  code VARCHAR(10) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table
CREATE TABLE public.wallets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency_code VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  initial_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_income BOOLEAN DEFAULT FALSE,
  parent_id INTEGER REFERENCES public.categories(id),
  application category_application DEFAULT 'transaction',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE public.goals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  target_date DATE,
  is_achieved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investment_instruments table
CREATE TABLE public.investment_instruments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit_label VARCHAR(255),
  is_trackable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investment_assets table
CREATE TABLE public.investment_assets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instrument_id INTEGER REFERENCES public.investment_instruments(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id INTEGER REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  category_id INTEGER REFERENCES public.categories(id) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  exchange_rate DECIMAL(10,4) DEFAULT 1,
  date DATE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transfers table
CREATE TABLE public.transfers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_wallet_id INTEGER REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  to_wallet_id INTEGER REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  amount_from DECIMAL(15,2) NOT NULL,
  amount_to DECIMAL(15,2) NOT NULL,
  currency_from VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  currency_to VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debts table
CREATE TABLE public.debts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency_code VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  due_date DATE,
  type debt_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debt_histories table
CREATE TABLE public.debt_histories (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id INTEGER REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  exchange_rate DECIMAL(10,4) DEFAULT 1,
  date DATE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goal_transfers table
CREATE TABLE public.goal_transfers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_goal_id INTEGER REFERENCES public.goals(id),
  to_goal_id INTEGER REFERENCES public.goals(id),
  from_wallet_id INTEGER REFERENCES public.wallets(id),
  to_wallet_id INTEGER REFERENCES public.wallets(id),
  amount_from DECIMAL(15,2),
  amount_to DECIMAL(15,2),
  currency_from VARCHAR(10) REFERENCES public.currencies(code),
  currency_to VARCHAR(10) REFERENCES public.currencies(code),
  from_instrument_id INTEGER REFERENCES public.investment_instruments(id),
  to_instrument_id INTEGER REFERENCES public.investment_instruments(id),
  from_asset_id INTEGER REFERENCES public.investment_assets(id),
  to_asset_id INTEGER REFERENCES public.investment_assets(id),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goal_investment_records table
CREATE TABLE public.goal_investment_records (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id INTEGER REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  instrument_id INTEGER REFERENCES public.investment_instruments(id),
  asset_id INTEGER REFERENCES public.investment_assets(id),
  wallet_id INTEGER REFERENCES public.wallets(id),
  category_id INTEGER REFERENCES public.categories(id),
  amount DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  date DATE NOT NULL,
  is_valuation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(10) REFERENCES public.currencies(code) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_items table
CREATE TABLE public.budget_items (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
  transaction_id INTEGER REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_projects table
CREATE TABLE public.business_projects (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_project_transactions table
CREATE TABLE public.business_project_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id INTEGER REFERENCES public.business_projects(id) ON DELETE CASCADE NOT NULL,
  transaction_id INTEGER REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_investment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_project_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for currencies
CREATE POLICY "Users can view their own currencies" ON public.currencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own currencies" ON public.currencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own currencies" ON public.currencies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own currencies" ON public.currencies FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for wallets
CREATE POLICY "Users can view their own wallets" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallets" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallets" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wallets" ON public.wallets FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for categories
CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for investment_instruments
CREATE POLICY "Users can view their own investment instruments" ON public.investment_instruments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investment instruments" ON public.investment_instruments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investment instruments" ON public.investment_instruments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investment instruments" ON public.investment_instruments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for investment_assets
CREATE POLICY "Users can view their own investment assets" ON public.investment_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investment assets" ON public.investment_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investment assets" ON public.investment_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investment assets" ON public.investment_assets FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transfers
CREATE POLICY "Users can view their own transfers" ON public.transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transfers" ON public.transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transfers" ON public.transfers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transfers" ON public.transfers FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for debts
CREATE POLICY "Users can view their own debts" ON public.debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own debts" ON public.debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.debts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for debt_histories
CREATE POLICY "Users can view their own debt histories" ON public.debt_histories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own debt histories" ON public.debt_histories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debt histories" ON public.debt_histories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debt histories" ON public.debt_histories FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for goal_transfers
CREATE POLICY "Users can view their own goal transfers" ON public.goal_transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goal transfers" ON public.goal_transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goal transfers" ON public.goal_transfers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goal transfers" ON public.goal_transfers FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for goal_investment_records
CREATE POLICY "Users can view their own goal investment records" ON public.goal_investment_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goal investment records" ON public.goal_investment_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goal investment records" ON public.goal_investment_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goal investment records" ON public.goal_investment_records FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for budgets
CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for budget_items
CREATE POLICY "Users can view their own budget items" ON public.budget_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.budgets WHERE id = budget_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert their own budget items" ON public.budget_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.budgets WHERE id = budget_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own budget items" ON public.budget_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.budgets WHERE id = budget_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their own budget items" ON public.budget_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.budgets WHERE id = budget_id AND user_id = auth.uid())
);

-- Create RLS policies for business_projects
CREATE POLICY "Users can view their own business projects" ON public.business_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business projects" ON public.business_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business projects" ON public.business_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own business projects" ON public.business_projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for business_project_transactions
CREATE POLICY "Users can view their own business project transactions" ON public.business_project_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business project transactions" ON public.business_project_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own business project transactions" ON public.business_project_transactions FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_currencies_user_id ON public.currencies(user_id);
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
