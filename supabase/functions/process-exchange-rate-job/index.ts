import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateConversion } from "../_shared/rate-conversion.ts";
import { sleep } from "../_shared/utils.ts";

// Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// API base URL
const API_BASE = "https://api.twelvedata.com/time_series/cross";

// Batch processing configuration
const MAX_EXECUTION_TIME_MS = 149000; // 149 seconds (1s buffer before 150s Edge Function limit)
const RATE_LIMIT_WAIT_MS = 60100; // Wait 60.1 seconds when hitting rate limit (Twelve Data API has 60s rate limit)
const TWELVE_DATA_DAILY_LIMIT = 800; // Twelve Data API daily limit

interface Job {
  id: string;
  date: string;
  end_date: string | null;
  missing_dates: string[] | null;
  currency_pairs: string[];
  status: string;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
}

/**
 * Fetch exchange rate for a single currency pair from Twelve Data API.
 * Supports both single date and date range fetching.
 */
async function fetchExchangeRate(
  base: string,
  quote: string,
  startDate?: string | null,
  endDate?: string | null
): Promise<any> {
  const isRange = !!startDate && !!endDate && endDate !== startDate;
  console.log(`Fetching exchange rate for ${base}/${quote}: ${startDate || "best-effort"}${endDate ? ` up to ${endDate}` : " latest"}`);

  const apiKey = Deno.env.get("TWELVE_API_KEY");
  const queryParams = new URLSearchParams({
    base,
    quote,
    interval: "1day",
    timezone: "Asia/Jakarta",
    apikey: apiKey ?? "",
  });

  if (startDate && endDate && isRange) {
    // Range mode
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const outputSize = Math.min(diffDays, 5000).toString();

    const safeEnd = new Date(end);
    safeEnd.setDate(safeEnd.getDate() + 1);

    queryParams.set("start_date", startDate);
    queryParams.set("end_date", safeEnd.toISOString().split("T")[0]);
    queryParams.set("outputsize", outputSize);
  } else if (startDate) {
    // Single date mode (with start_date)
    const start = new Date(startDate);
    const safeEnd = new Date(start);
    safeEnd.setDate(safeEnd.getDate() + 1);

    queryParams.set("start_date", startDate);
    queryParams.set("end_date", safeEnd.toISOString().split("T")[0]);
    queryParams.set("outputsize", "1");
  } else if (endDate) {
    // Fallback mode: remove start_date, keep end_date (gets data up to end_date)
    queryParams.set("end_date", endDate);
    queryParams.set("outputsize", "1");
  } else {
    // Absolute latest
    queryParams.set("outputsize", "1");
  }

  const url = `${API_BASE}?${queryParams.toString()}`;
  const res = await fetch(url);
  const json = await res.json();

  console.log(`Status code for ${base}/${quote}:`, res.status);
  if (json.code) console.log(`Response code for ${base}/${quote}:`, json.code);

  // Success case
  if (res.status === 200 && !json.code) {
    return json;
  }

  // Handle errors
  console.error(`API error for ${base}/${quote}`, json);
  console.log(`URL: ${url}`);

  // Throw error with code for caller to handle
  const error: any = new Error(json.message || "API request failed");
  error.code = json.code;
  error.status = res.status;
  throw error;
}

/**
 * Check if we've reached the daily API call limit
 */
async function checkDailyLimit(): Promise<{ withinLimit: boolean; currentCount: number }> {
  const { data, error } = await supabase.rpc("get_twelve_data_calls_today");

  if (error) {
    console.error("Failed to get daily API call count", error);
    // If we can't check, assume we're within limit to avoid blocking
    return { withinLimit: true, currentCount: 0 };
  }

  const currentCount = data || 0;
  const withinLimit = currentCount < TWELVE_DATA_DAILY_LIMIT;

  console.log(`Daily API calls: ${currentCount}/${TWELVE_DATA_DAILY_LIMIT}`);

  return { withinLimit, currentCount };
}

/**
 * Increment the daily API call counter
 */
async function incrementDailyCounter(): Promise<number> {
  const { data, error } = await supabase.rpc("increment_twelve_data_calls");

  if (error) {
    console.error("Failed to increment daily API call count", error);
    return 0;
  }

  return data || 0;
}


/**
 * Get the next pending job from the queue
 */
async function getJob(): Promise<Job | null> {
  // Get oldest pending job
  const { data, error } = await supabase
    .from("exchange_rate_jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found
      return null;
    }
    console.error("Failed to fetch pending job", error);
    return null;
  }

  return data as Job;
}

/**
 * Update job status in database
 */
async function updateJobStatus(
  jobId: string,
  status: string,
  errorMessage?: string,
  incrementRetry: boolean = false
): Promise<void> {
  const updates: any = {
    status,
  };

  if (status === "completed" || status === "failed") {
    updates.processed_at = new Date().toISOString();
  }

  if (errorMessage) {
    updates.error_message = errorMessage;
  }

  if (incrementRetry) {
    // Increment retry_count using a raw query to avoid race conditions
    const { error } = await supabase.rpc("increment_job_retry", {
      job_id: jobId,
    });

    if (error) {
      console.warn("Failed to increment retry count, updating directly", error);
      // Fallback: fetch current retry_count and increment
      const { data: job } = await supabase
        .from("exchange_rate_jobs")
        .select("retry_count")
        .eq("id", jobId)
        .single();

      if (job) {
        updates.retry_count = job.retry_count + 1;
      }
    }
  }

  const { error } = await supabase
    .from("exchange_rate_jobs")
    .update(updates)
    .eq("id", jobId);

  if (error) {
    console.error("Failed to update job status", error);
    throw error;
  }
}

/**
 * Process a single job and return the result
 */
async function processJob(job: Job, startTime: number): Promise<{
  success: boolean;
  rateLimitHit: boolean;
  shouldWait: boolean;
  dailyLimitReached: boolean;
  errorMessage?: string;
}> {
  console.log(`Processing job ${job.id} for date range ${job.date} to ${job.end_date ?? job.date}`);

  if (!job.currency_pairs || job.currency_pairs.length === 0) {
    console.error(`Job ${job.id} has no currency pairs`);
    await updateJobStatus(job.id, "failed", "No currency pairs in job");
    return { success: false, rateLimitHit: false, shouldWait: false, dailyLimitReached: false, errorMessage: "No currency pairs" };
  }

  const currencyPair = job.currency_pairs[0];
  console.log(`Currency pair: ${currencyPair}`);

  // Check if job can be retried
  if (job.retry_count >= job.max_retries) {
    console.error(`Job ${job.id} has exceeded max retries`);
    await updateJobStatus(job.id, "failed", "Max retries exceeded");
    return { success: false, rateLimitHit: false, shouldWait: false, dailyLimitReached: false, errorMessage: "Max retries exceeded" };
  }

  // Update status to processing
  await updateJobStatus(job.id, "processing");

  const dataToUpsert = [];

  try {
    // Check daily API limit before making the call
    const { withinLimit, currentCount } = await checkDailyLimit();

    if (!withinLimit) {
      console.warn(`Daily API limit reached: ${currentCount}/${TWELVE_DATA_DAILY_LIMIT}`);
      // Mark job as pending so it can be retried tomorrow
      await updateJobStatus(job.id, "pending", `Daily API limit reached (${currentCount}/${TWELVE_DATA_DAILY_LIMIT})`);
      return { success: false, rateLimitHit: false, shouldWait: false, dailyLimitReached: true, errorMessage: "Daily API limit reached" };
    }

    const [base, quote] = currencyPair.split("/");

    // Determine if we should use fallback mode based on previous error
    const isRetryWithMissingBase = job.retry_count > 0 &&
      job.error_message &&
      (job.error_message.toLowerCase().includes("**base** parameter is missing") ||
        job.error_message.includes("404"));

    let currentStartDate: string | null = job.date;
    let currentEndDate: string | null = job.end_date;

    if (isRetryWithMissingBase) {
      console.log(`Job ${job.id} is a retry after 404. Using fallback (no start_date for best-effort).`);
      currentStartDate = null;
      currentEndDate = job.end_date || job.date;
    }

    // Fetch exchange rate once and let error bubble to outer catch
    const json = await fetchExchangeRate(base, quote, currentStartDate, currentEndDate);

    // Increment the daily counter after successful API call
    await incrementDailyCounter();

    // Specific dates we want to insert
    const missingDatesSet = new Set(job.missing_dates || [job.date]);

    if (json.values && json.values.length > 0) {
      // Determine if this was a fallback result (only 1 value usually, and datetime might not match requested range)
      const isFallbackResult = json.values.length === 1 && !missingDatesSet.has(json.values[0].datetime);

      if (isFallbackResult) {
        const fallbackRate = parseFloat(json.values[0].close);
        console.log(`Applying fallback rate ${fallbackRate} to all ${missingDatesSet.size} requested dates for ${currencyPair}`);

        if (!isNaN(fallbackRate)) {
          const fallbackOriginDate = json.values[0].datetime;
          for (const reqDate of missingDatesSet) {
            dataToUpsert.push({
              from_currency: base,
              to_currency: quote,
              rate: rateConversion(base, fallbackRate),
              date: reqDate,
              origin_date: fallbackOriginDate,
            });
          }
        }
      } else {
        console.log(`API returned ${json.values.length} historical values. Finding best matches for ${missingDatesSet.size} requested dates.`);

        // Sort API values by date ascending for easier searching
        const sortedValues = [...json.values].sort((a, b) => a.datetime.localeCompare(b.datetime));

        for (const reqDate of Array.from(missingDatesSet).sort()) {
          // Find the best match: the latest datetime in sortedValues that is <= reqDate
          let bestMatch = null;
          for (let i = sortedValues.length - 1; i >= 0; i--) {
            if (sortedValues[i].datetime <= reqDate) {
              bestMatch = sortedValues[i];
              break;
            }
          }

          if (bestMatch) {
            const rate = parseFloat(bestMatch.close);
            if (!isNaN(rate)) {
              dataToUpsert.push({
                from_currency: base,
                to_currency: quote,
                rate: rateConversion(base, rate),
                date: reqDate,
                origin_date: bestMatch.datetime,
              });
            } else {
              console.warn(`Invalid rate (NaN) for ${currencyPair} from ${bestMatch.datetime} for requested date ${reqDate}. Skipping.`);
            }
          } else {
            // Special case: if the requested date is BEFORE all API returned data, 
            // we use the earliest possible rate as a last resort.
            const earliestMatch = sortedValues[0];
            const rate = parseFloat(earliestMatch.close);
            if (!isNaN(rate)) {
              console.log(`No historical data <= ${reqDate} for ${currencyPair}. Using earliest available rate from ${earliestMatch.datetime}.`);
              dataToUpsert.push({
                from_currency: base,
                to_currency: quote,
                rate: rateConversion(base, rate),
                date: reqDate,
                origin_date: earliestMatch.datetime,
              });
            } else {
              console.warn(`No values returned for ${currencyPair} even as fallback. Skipping ${reqDate}.`);
            }
          }
        }
      }
    } else {
      console.warn(`No values returned for ${currencyPair}. Skipping.`);
    }

    // Upsert collected data
    if (dataToUpsert.length > 0) {
      console.log(`Upserting ${dataToUpsert.length} exchange rates for ${currencyPair}`);
      const { error: upsertError } = await supabase
        .from("exchange_rates")
        .upsert(dataToUpsert, {
          onConflict: "from_currency,to_currency,date",
        });

      if (upsertError) {
        console.error("Insert error", upsertError);
        throw upsertError;
      }
    }

    // Mark job as completed
    await updateJobStatus(job.id, "completed");
    console.log(`Job ${job.id} completed successfully for ${currencyPair}. Processed ${dataToUpsert.length} dates.`);

    return { success: true, rateLimitHit: false, shouldWait: false, dailyLimitReached: false };
  } catch (err: any) {
    console.error("Failed to process job:", err);

    const errorMessage = err instanceof Error ? err.message : String(err);

    // Check if it's a rate limit error
    const isMinuteLimit = errorMessage.includes("run out of API credits for the current minute");
    const isDailyLimit = errorMessage.includes("run out of API credits for the day");
    const is429 = err.code === 429 || errorMessage.includes("429") || isMinuteLimit || isDailyLimit;
    const is404 = err.code === 404 || err.status === 404;
    const isMissingBase = is404 || errorMessage.toLowerCase().includes("**base** parameter is missing");

    if (isDailyLimit) {
      console.warn(`Daily API limit reached for job ${job.id}: ${errorMessage}`);
      // Mark job as pending so it can be retried tomorrow
      await updateJobStatus(job.id, "pending", errorMessage);
      return { success: false, rateLimitHit: true, shouldWait: false, dailyLimitReached: true, errorMessage };
    }

    if ((is429 || isMissingBase) && job.retry_count < job.max_retries - 1) {
      // Check if we have enough time to wait for rate limit (usually for minute limits)
      // For 404, we don't necessarily need the RATE_LIMIT_WAIT_MS, but we'll follow the pattern
      const elapsedTime = Date.now() - startTime;
      const waitTime = is429 ? RATE_LIMIT_WAIT_MS : 1000; // Small wait for 404
      const timeAfterWait = elapsedTime + waitTime;

      if (timeAfterWait < MAX_EXECUTION_TIME_MS) {
        // We have time to wait - signal caller to wait and retry
        console.log(`${isMissingBase ? '404' : '429'} hit for job ${job.id}. Will wait ${waitTime}ms before retrying.`);
        await updateJobStatus(job.id, "pending", errorMessage, true);
        return { success: false, rateLimitHit: is429, shouldWait: true, dailyLimitReached: false, errorMessage };
      } else {
        // Not enough time to wait - mark for next run
        console.log(`${isMissingBase ? '404' : '429'} hit but not enough time to wait. Stopping for next cron run.`);
        await updateJobStatus(job.id, "pending", errorMessage, true);
        return { success: false, rateLimitHit: is429, shouldWait: false, dailyLimitReached: false, errorMessage };
      }
    } else {
      // Mark as failed if not retryable or exceeded retries
      await updateJobStatus(job.id, "failed", errorMessage, true);
      return { success: false, rateLimitHit: is429, shouldWait: false, dailyLimitReached: false, errorMessage };
    }
  }
}

/**
 * Batch worker that processes multiple exchange rate jobs until timeout or no more jobs.
 * 
 * This function:
 * 1. Processes jobs in a loop
 * 2. Stops when: no more jobs, timeout approaching, or rate limit hit
 * 3. Returns statistics on processing
 * 
 * Expected runtime: Up to 120 seconds (stops before 150s Edge Function limit)
 */
serve(async (_req: Request) => {
  const START_TIME = Date.now();
  let jobsProcessed = 0;
  let jobsCompleted = 0;
  let jobsFailed = 0;
  let rateLimitHit = false;
  let dailyLimitReached = false;
  let stopReason = "unknown";

  try {
    console.log("Starting batch job processing...");
    console.log(`Max execution time: ${MAX_EXECUTION_TIME_MS}ms`);

    while (true) {
      // Check timeout
      const elapsedTime = Date.now() - START_TIME;
      if (elapsedTime >= MAX_EXECUTION_TIME_MS) {
        console.log(`Approaching timeout limit (${elapsedTime}ms). Stopping gracefully.`);
        stopReason = "timeout";
        break;
      }

      // Get next pending job
      const job = await getJob();
      if (!job) {
        console.log("No more pending jobs");
        stopReason = "no_more_jobs";
        break;
      }

      // Process the job
      const result = await processJob(job, START_TIME);
      jobsProcessed++;

      if (result.success) {
        jobsCompleted++;
      } else {
        jobsFailed++;
      }

      // Check if daily limit reached
      if (result.dailyLimitReached) {
        console.log("Daily API limit reached. Stopping processing.");
        dailyLimitReached = true;
        stopReason = "daily_limit_reached";
        break;
      }

      if (result.shouldWait) {
        // Wait for rate limit to expire, then continue processing
        console.log(`Waiting ${RATE_LIMIT_WAIT_MS}ms for rate limit to expire...`);
        await sleep(RATE_LIMIT_WAIT_MS);
        console.log("Rate limit wait complete. Continuing job processing...");
        // Continue to next job in the loop
      }

      // If rate limit hit, handle based on whether we should wait
      if (result.rateLimitHit) {
        rateLimitHit = true;

        // Not enough time to wait - stop processing
        console.log("Rate limit hit. Not enough time to wait. Stopping for next cron run.");
        stopReason = "rate_limit";
        break;
      }

      // Log progress every 10 jobs
      if (jobsProcessed % 10 === 0) {
        const elapsed = Date.now() - START_TIME;
        console.log(`Progress: ${jobsProcessed} jobs processed (${jobsCompleted} completed, ${jobsFailed} failed) in ${elapsed}ms`);
      }
    }

    const totalElapsedTime = Date.now() - START_TIME;
    console.log(`Batch processing finished. Reason: ${stopReason}`);
    console.log(`Total: ${jobsProcessed} jobs processed (${jobsCompleted} completed, ${jobsFailed} failed) in ${totalElapsedTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Batch processing completed",
        stats: {
          jobsProcessed,
          jobsCompleted,
          jobsFailed,
          elapsedTimeMs: totalElapsedTime,
          stopReason,
          rateLimitHit,
          dailyLimitReached,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error in batch processing:", err);
    const totalElapsedTime = Date.now() - START_TIME;

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        stats: {
          jobsProcessed,
          jobsCompleted,
          jobsFailed,
          elapsedTimeMs: totalElapsedTime,
          stopReason: "error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
