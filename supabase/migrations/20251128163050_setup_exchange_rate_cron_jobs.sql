-- Setup cron jobs for queue-based exchange rate processing
-- This requires pg_cron extension to be enabled

-- Job 1: Orchestrator - Create jobs from missing exchange rates
-- Runs daily at midnight UTC to create new jobs
select cron.schedule(
  'fetch-missing-exchange-rate-daily',
  '0 0 * * *', -- Daily at midnight UTC
  $$
  select
    net.http_post(
      url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/fetch-missing-exchange-rate',
      headers:=jsonb_build_object(
        'Content-type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Job 2: Worker - Process pending exchange rate jobs
-- Runs every 5 minutes to process pending jobs
select cron.schedule(
  'process-exchange-rate-jobs-frequent',
  '*/5 * * * *', -- Every 5 minutes
  $$
  select
    net.http_post(
      url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/process-exchange-rate-job',
      headers:=jsonb_build_object(
        'Content-type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Optional: Unschedule old cron job if you want to replace it
-- Uncomment the line below if you want to remove the old job
-- select cron.unschedule('fetch-missing-exchange-rates-daily');
