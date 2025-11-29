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
 * 3. Creates one job per date in exchange_rate_jobs table
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

        // Group missing rates by date
        const ratesByDate = new Map<string, Set<string>>();

        for (const rate of missingRates) {
            // Assuming currency_pair is a new field or derived from base_currency_code and currency_code
            // If not, it needs to be constructed: `${rate.currency_code}/${rate.base_currency_code}`
            const currencyPair = `${rate.currency_code}/${rate.base_currency_code}`;
            if (!ratesByDate.has(rate.date)) {
                ratesByDate.set(rate.date, new Set<string>());
            }
            ratesByDate.get(rate.date)!.add(currencyPair);
        }

        console.log(`Found ${ratesByDate.size} dates with missing exchange rates`);

        // Get existing pending jobs to avoid duplicates
        const { data: existingJobs, error: existingJobsError } = await supabase
            .from("exchange_rate_jobs")
            .select("date, currency_pairs")
            .eq("status", "pending");

        if (existingJobsError) {
            console.error("Failed to fetch existing pending jobs", existingJobsError);
            throw existingJobsError;
        }

        // Create a set of existing job signatures for quick lookup
        const existingJobSignatures = new Set<string>();
        if (existingJobs) {
            for (const job of existingJobs) {
                // Ensure currency_pairs are sorted for consistent signature
                const signature = `${job.date}:${(job.currency_pairs as string[]).sort().join(",")}`;
                existingJobSignatures.add(signature);
            }
        }

        console.log(`Found ${existingJobSignatures.size} existing pending jobs`);

        // Create jobs for each date, skipping duplicates
        const jobs = [];
        let skippedCount = 0;

        for (const [jobDate, pairs] of ratesByDate.entries()) {
            const currencyPairs = Array.from(pairs).sort();
            const signature = `${jobDate}:${currencyPairs.join(",")}`;

            // Skip if job already exists with pending status
            if (existingJobSignatures.has(signature)) {
                console.log(`Skipping duplicate job for date ${jobDate} (already pending)`);
                skippedCount++;
                continue;
            }

            jobs.push({
                date: jobDate,
                currency_pairs: currencyPairs,
                status: "pending",
                retry_count: 0,
                max_retries: 5,
            });
        }

        console.log(`Jobs to create: ${jobs.length}, Skipped (duplicates): ${skippedCount}`);

        if (jobs.length === 0) {
            console.log("No new jobs to create");
            return new Response(
                JSON.stringify({
                    message: skippedCount > 0
                        ? `No new jobs created. ${skippedCount} jobs already pending.`
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
        const { data: createdJobs, error: insertError } = await supabase
            .from("exchange_rate_jobs")
            .insert(jobs) // Use 'jobs' array here
            .select();

        if (insertError) {
            console.error("Failed to create jobs", insertError);
            throw insertError;
        }

        console.log(`Successfully created ${jobs.length} jobs, skipped ${skippedCount} duplicates`);

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
