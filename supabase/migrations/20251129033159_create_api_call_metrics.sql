-- Create table to track daily API call metrics
CREATE TABLE IF NOT EXISTS api_call_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  twelve_data_calls INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient date lookup
CREATE INDEX IF NOT EXISTS idx_api_call_metrics_date ON api_call_metrics(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_call_metrics_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_api_call_metrics_updated_at
  BEFORE UPDATE ON api_call_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_api_call_metrics_updated_at();

-- Function to increment Twelve Data API call count for today
CREATE OR REPLACE FUNCTION increment_twelve_data_calls()
RETURNS INTEGER
SET search_path = ''
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Insert or update today's count
  INSERT INTO public.api_call_metrics (date, twelve_data_calls)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date)
  DO UPDATE SET twelve_data_calls = api_call_metrics.twelve_data_calls + 1
  RETURNING twelve_data_calls INTO current_count;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get today's Twelve Data API call count
CREATE OR REPLACE FUNCTION get_twelve_data_calls_today()
RETURNS INTEGER
SET search_path = ''
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT twelve_data_calls INTO current_count
  FROM public.api_call_metrics
  WHERE date = CURRENT_DATE;
  
  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE api_call_metrics ENABLE ROW LEVEL SECURITY;

-- Note: No RLS policies are added because this table is only accessed
-- by Edge Functions using the service role key, which bypasses RLS.
