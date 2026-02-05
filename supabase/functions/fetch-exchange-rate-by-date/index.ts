import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateConversion } from "../_shared/rate-conversion.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { date } = await req.json().catch(() => ({
      date: null
    }));

    if (!date) {
      date = new Date(Date.now()).toISOString().split("T")[0];
    }

    const { data: currencyPairs, error: errorCurrencyPairs } = await supabase
      .from("currency_pairs")
      .select("base_currency_code, currency_code");

    if (errorCurrencyPairs) {
      console.error("Failed to fetch currency_pairs", errorCurrencyPairs);
      throw new Error(errorCurrencyPairs.message);
    }

    if (!currencyPairs || currencyPairs.length === 0) {
      return new Response(JSON.stringify({
        message: "No currency pairs found"
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get existing pending jobs for this date to avoid duplicates
    const { data: existingJobs, error: existingJobsError } = await supabase
      .from("exchange_rate_jobs")
      .select("currency_pairs")
      .eq("date", date)
      .eq("status", "pending");

    if (existingJobsError) {
      console.error("Failed to fetch existing pending jobs", existingJobsError);
      throw new Error(existingJobsError.message);
    }

    const existingPairs = new Set(
      existingJobs?.map((j: any) => (j.currency_pairs as string[])[0]) || []
    );

    const jobsToCreate = currencyPairs
      .map((p: any) => `${p.currency_code}/${p.base_currency_code}`)
      .filter((pair: string) => !existingPairs.has(pair))
      .map((pair: string) => ({
        date,
        currency_pairs: [pair],
        status: "pending",
        retry_count: 0,
        max_retries: 5,
      }));

    if (jobsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("exchange_rate_jobs")
        .insert(jobsToCreate);

      if (insertError) {
        console.error("Failed to create jobs", insertError);
        throw new Error(insertError.message);
      }
    }

    return new Response(JSON.stringify({
      message: `Created ${jobsToCreate.length} exchange rate jobs for ${date}. ${currencyPairs.length - jobsToCreate.length} were already pending.`,
      date,
      jobs_created: jobsToCreate.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
