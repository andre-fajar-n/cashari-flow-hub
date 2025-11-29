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
const API_BASE = "https://api.twelvedata.com/exchange_rate";

// Batch processing configuration
const MAX_EXECUTION_TIME_MS = 149000; // 149 seconds (1s buffer before 150s Edge Function limit)
const RATE_LIMIT_WAIT_MS = 60100; // Wait 60.1 seconds when hitting rate limit (Twelve Data API has 60s rate limit)
const TWELVE_DATA_DAILY_LIMIT = 800; // Twelve Data API daily limit

interface Job {
    id: string;
    date: string;
    currency_pairs: string[];
    status: string;
    retry_count: number;
    max_retries: number;
}

/**
 * Fetch exchange rates from Twelve Data API.
 * 
 * No internal retry logic - failures are handled by marking the job
 * as pending/failed and letting the job queue retry in the next run.
 */
async function fetchExchangeRates(
    url: string,
    symbols: string[],
    keyDate: string
): Promise<any> {
    console.log(`Fetching exchange rates for date: ${keyDate}`);

    const res = await fetch(url);
    const json = await res.json();
    console.log("Status code", res.status);
    console.log("Response code", json.code);

    // Success case
    if (res.status === 200 && !json.code) {
        return json;
    }

    // Handle errors
    console.error("API error", json);
    console.error(`Query params: {symbol: ${symbols}, date: ${keyDate}}`);

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
 * Process exchange rate data and prepare for database upsert
 */
function processExchangeRateData(
    json: any,
    symbols: string[],
    keyDate: string
): Array<any> {
    const dataToUpsert = [];
    console.log("Processing currency pair");

    if (symbols.length === 1) {
        const splitedSymbol = json.symbol.split("/");
        console.log("Single currency pair:", splitedSymbol);

        dataToUpsert.push({
            from_currency: splitedSymbol[0],
            to_currency: splitedSymbol[1],
            rate: rateConversion(splitedSymbol[0], json.rate),
            date: keyDate,
        });
    } else {
        for (const currencyPair of symbols) {
            const splitedSymbol = currencyPair.split("/");
            console.log("Multiple currency pair:", splitedSymbol);

            const exchangeRate = json[currencyPair];
            if (!exchangeRate) {
                console.log("EXCHANGE RATE undefined:", currencyPair);
                continue;
            }

            dataToUpsert.push({
                from_currency: splitedSymbol[0],
                to_currency: splitedSymbol[1],
                rate: rateConversion(splitedSymbol[0], exchangeRate.rate),
                date: keyDate,
            });
        }
    }

    return dataToUpsert;
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
    console.log(`Processing job ${job.id} for date ${job.date}`);
    console.log(`Currency pairs: ${job.currency_pairs.length}`);

    // Check if job can be retried
    if (job.retry_count >= job.max_retries) {
        console.error(`Job ${job.id} has exceeded max retries`);
        await updateJobStatus(job.id, "failed", "Max retries exceeded");
        return { success: false, rateLimitHit: false, shouldWait: false, dailyLimitReached: false, errorMessage: "Max retries exceeded" };
    }

    // Update status to processing
    await updateJobStatus(job.id, "processing");

    try {
        // Check daily API limit before making the call
        const { withinLimit, currentCount } = await checkDailyLimit();

        if (!withinLimit) {
            console.warn(`Daily API limit reached: ${currentCount}/${TWELVE_DATA_DAILY_LIMIT}`);
            // Mark job as pending so it can be retried tomorrow
            await updateJobStatus(job.id, "pending", `Daily API limit reached (${currentCount}/${TWELVE_DATA_DAILY_LIMIT})`);
            return { success: false, rateLimitHit: false, shouldWait: false, dailyLimitReached: true, errorMessage: "Daily API limit reached" };
        }

        // Build API URL
        const url = `${API_BASE}?symbol=${job.currency_pairs.join(",")}&date=${job.date}&apikey=${Deno.env.get("TWELVE_API_KEY")}`;

        // Fetch exchange rates (no internal retry)
        const json = await fetchExchangeRates(url, job.currency_pairs, job.date);
        console.log("Response from Twelve Data API", json);

        // Increment the daily counter after successful API call
        const newCount = await incrementDailyCounter();
        console.log(`API call count incremented to: ${newCount}/${TWELVE_DATA_DAILY_LIMIT}`);

        // Process and prepare data
        const dataToUpsert = processExchangeRateData(json, job.currency_pairs, job.date);

        // Upsert to database
        const { error: upsertError } = await supabase
            .from("exchange_rates")
            .upsert(dataToUpsert, {
                onConflict: "from_currency,to_currency,date",
            });

        if (upsertError) {
            console.error("Insert error", upsertError);
            throw upsertError;
        }

        // Mark job as completed
        await updateJobStatus(job.id, "completed");
        console.log(`Job ${job.id} completed successfully`);

        return { success: true, rateLimitHit: false, shouldWait: false, dailyLimitReached: false };
    } catch (err: any) {
        console.error("Failed to process job:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);

        // Check if it's a 429 rate limit error
        const is429 = err.code === 429 || errorMessage.includes("429");

        if (is429 && job.retry_count < job.max_retries - 1) {
            // Check if we have enough time to wait for rate limit
            const elapsedTime = Date.now() - startTime;
            const timeAfterWait = elapsedTime + RATE_LIMIT_WAIT_MS;

            if (timeAfterWait < MAX_EXECUTION_TIME_MS) {
                // We have time to wait - signal caller to wait and retry
                console.log(`Rate limit hit for job ${job.id}. Will wait ${RATE_LIMIT_WAIT_MS}ms before retrying.`);
                await updateJobStatus(job.id, "pending", errorMessage, true);
                return { success: false, rateLimitHit: true, shouldWait: true, dailyLimitReached: false, errorMessage };
            } else {
                // Not enough time to wait - mark for next run
                console.log(`Rate limit hit but not enough time to wait. Stopping for next cron run.`);
                await updateJobStatus(job.id, "pending", errorMessage, true);
                return { success: false, rateLimitHit: true, shouldWait: false, dailyLimitReached: false, errorMessage };
            }
        } else {
            // Mark as failed
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

            // If rate limit hit, handle based on whether we should wait
            if (result.rateLimitHit) {
                rateLimitHit = true;

                if (result.shouldWait) {
                    // Wait for rate limit to expire, then continue processing
                    console.log(`Waiting ${RATE_LIMIT_WAIT_MS}ms for rate limit to expire...`);
                    await sleep(RATE_LIMIT_WAIT_MS);
                    console.log("Rate limit wait complete. Continuing job processing...");
                    // Continue to next job in the loop
                } else {
                    // Not enough time to wait - stop processing
                    console.log("Rate limit hit. Not enough time to wait. Stopping for next cron run.");
                    stopReason = "rate_limit";
                    break;
                }
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
                error: err instanceof Error ? err.message : String(err),
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
