-- Create exchange_rate_jobs table for queue-based processing
CREATE TABLE exchange_rate_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  currency_pairs TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create indexes for efficient querying
CREATE INDEX idx_exchange_rate_jobs_status ON exchange_rate_jobs(status);
CREATE INDEX idx_exchange_rate_jobs_date ON exchange_rate_jobs(date);
CREATE INDEX idx_exchange_rate_jobs_created_at ON exchange_rate_jobs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exchange_rate_jobs_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_exchange_rate_jobs_updated_at
  BEFORE UPDATE ON exchange_rate_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_rate_jobs_updated_at();

-- Create function to safely increment retry count
CREATE OR REPLACE FUNCTION increment_job_retry(job_id UUID)
RETURNS void
SET search_path = ''
AS $$
BEGIN
  UPDATE public.exchange_rate_jobs
  SET retry_count = retry_count + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE exchange_rate_jobs ENABLE ROW LEVEL SECURITY;

-- Note: No RLS policies are added because this table is only accessed
-- by Edge Functions using the service role key, which bypasses RLS.
-- Normal users should not have direct access to this job queue table.
