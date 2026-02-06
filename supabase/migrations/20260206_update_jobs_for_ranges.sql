-- Add end_date and missing_dates to exchange_rate_jobs to support range-based fetching
ALTER TABLE public.exchange_rate_jobs 
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS missing_dates DATE[];

COMMENT ON COLUMN public.exchange_rate_jobs.end_date IS 'Optional end date for range-based fetching. If null, only the start date is fetched.';
COMMENT ON COLUMN public.exchange_rate_jobs.missing_dates IS 'Array of specific dates within the start/end range that need to be fetched and stored.';
