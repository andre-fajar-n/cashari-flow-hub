import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase client
const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * Orchestrator function that creates batch jobs for exchange rate fetching.
 * 
 * This function:
 * 1. Reads from missing_exchange_rate table
 * 2. Groups currency pairs by date
 * 3. Creates one job per currency pair in exchange_rate_jobs table
 * 4. Returns summary of jobs created
 * 
 * Runtime: ~5 seconds (just database operations)
 */
serve(async (req: Request) => {
    try {
        // Get optional date filter from request body
        const { date } = await req.json().catch(() => ({ date: null }));

        console.log("Starting job creation...", date ? `for date: ${date}` : "for all dates");

        // Get missing exchange rates
        let query = supabase
            .from("missing_exchange_rate")
            .select("base_currency_code, currency_code, date")
            .order("date", { ascending: true });

        // Filter by date if provided
        if (date) {
            query = query.eq("date", date);
        }

        const { data: missingRates, error: fetchError } = await query;

        if (fetchError) {
            console.error("Failed to fetch missing_exchange_rate", fetchError);
            throw fetchError;
        }

        if (!missingRates || missingRates.length === 0) {
            return new Response(
                JSON.stringify({
                    message: "No missing exchange rates found",
                    jobs_created: 0,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        console.log(`Found ${missingRates.length} missing exchange rates`);

        // Get existing pending jobs to avoid duplicates
        const { data: existingJobs, error: existingJobsError } = await supabase
            .from("exchange_rate_jobs")
            .select("date, currency_pairs")
            .eq("status", "pending");

        if (existingJobsError) {
            console.error("Failed to fetch existing pending jobs", existingJobsError);
            throw existingJobsError;
        }

        // Create a set of existing pending job signatures (pair:start_date)
        const pendingSignatures = new Set<string>();
        if (existingJobs) {
            for (const job of existingJobs) {
                const pairs = job.currency_pairs as string[];
                if (pairs && pairs.length > 0) {
                    pendingSignatures.add(`${pairs[0]}:${job.date}`);
                }
            }
        }

        console.log(`Found ${pendingSignatures.size} existing pending job signatures`);

        // Group missing rates by currency pair
        const groups: Record<string, { currencyPair: string, dates: string[] }> = {};
        for (const rate of missingRates) {
            const pair = `${rate.currency_code}/${rate.base_currency_code}`;
            if (!groups[pair]) {
                groups[pair] = { currencyPair: pair, dates: [] };
            }
            if (!groups[pair].dates.includes(rate.date)) {
                groups[pair].dates.push(rate.date);
            }
        }

        // Helper to get day difference between two YYYY-MM-DD strings
        const getDiffDays = (d1: string, d2: string) => {
            const start = new Date(d1);
            const end = new Date(d2);
            return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        };

        // Create jobs for each currency pair group, splitting into chunks if necessary
        const jobs = [];
        let skippedCount = 0;

        for (const pair in groups) {
            const group = groups[pair];
            group.dates.sort();

            // Split dates into chunks of max 5000 days range
            const chunks: string[][] = [];
            let currentChunk: string[] = [];

            for (const dateStr of group.dates) {
                if (currentChunk.length === 0) {
                    currentChunk.push(dateStr);
                } else {
                    const diff = getDiffDays(currentChunk[0], dateStr);
                    if (diff < 5000) {
                        currentChunk.push(dateStr);
                    } else {
                        chunks.push(currentChunk);
                        currentChunk = [dateStr];
                    }
                }
            }
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }

            for (const chunk of chunks) {
                const minDate = chunk[0];
                const maxDate = chunk[chunk.length - 1];
                const signature = `${group.currencyPair}:${minDate}`;

                if (pendingSignatures.has(signature)) {
                    console.log(`Skipping duplicate job for ${group.currencyPair} starting ${minDate} (already pending)`);
                    skippedCount++;
                    continue;
                }

                jobs.push({
                    date: minDate,
                    end_date: maxDate,
                    missing_dates: chunk,
                    currency_pairs: [group.currencyPair],
                    status: "pending",
                    retry_count: 0,
                    max_retries: 5,
                });
            }
        }

        console.log(`Jobs to create: ${jobs.length}, Skipped (pending): ${skippedCount}`);

        if (jobs.length === 0) {
            console.log("No new jobs to create");
            return new Response(
                JSON.stringify({
                    message: skippedCount > 0
                        ? `No new jobs created. ${skippedCount} job chunks already pending.`
                        : "No missing exchange rates found",
                    stats: {
                        jobsCreated: 0,
                        jobsSkipped: skippedCount,
                    }
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Insert jobs into database
        const { data: _createdJobs, error: insertError } = await supabase
            .from("exchange_rate_jobs")
            .insert(jobs)
            .select();

        if (insertError) {
            console.error("Failed to create jobs", insertError);
            throw insertError;
        }

        console.log(`Successfully created ${jobs.length} job chunks, skipped ${skippedCount} already pending`);

        return new Response(
            JSON.stringify({
                message: "Jobs created successfully",
                stats: {
                    jobsCreated: jobs.length,
                    jobsSkipped: skippedCount,
                    totalProcessed: jobs.length + skippedCount,
                }
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err) {
        console.error("Unexpected error:", err);
        return new Response(
            JSON.stringify({
                error: err instanceof Error ? err.message : String(err),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
});
