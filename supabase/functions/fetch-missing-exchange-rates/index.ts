import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateConversion } from "../_shared/rate-conversion.ts";
import { sleep } from "../_shared/utils.ts";

/**
 * ⚠️ DEPRECATION WARNING ⚠️
 * 
 * This function has scalability issues and may timeout for large datasets.
 * 
 * Please use the new queue-based system instead:
 * 1. create-exchange-rate-jobs - Creates batch jobs
 * 2. process-exchange-rate-job - Processes jobs individually
 * 
 * This function is kept for backward compatibility only.
 */

// Supabase client
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

// API base URL
const API_BASE = "https://api.twelvedata.com/exchange_rate";

// Retry configuration
const MAX_RETRIES = 10000;
const RETRY_DELAY_MS = 61000; // 1 minute + 1 second

/**
 * Fetch exchange rates with retry logic for 429 rate limit errors
 */
async function fetchExchangeRatesWithRetry(url: string, symbols: string[], keyDate: string): Promise<any> {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`Attempt ${attempt}/${MAX_RETRIES} for date: ${keyDate}`);

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
    lastError = json;

    // Retry on 429 if we haven't reached max retries
    if (json.code === 429 && attempt < MAX_RETRIES) {
      const delayMs = RETRY_DELAY_MS * attempt; // Exponential backoff
      console.log(`Rate limit hit (429). Waiting ${delayMs / 1000}s before retry...`);
      await sleep(delayMs);
      continue;
    }

    // For other errors or last retry attempt, throw the error
    throw lastError;
  }

  throw lastError;
}

/**
 * Process exchange rate data and prepare for database upsert
 */
function processExchangeRateData(json: any, symbols: string[], keyDate: string): Array<any> {
  const dataToUpsert = [];
  console.log("Processing currency pair");

  if (symbols.length === 1) {
    const splitedSymbol = json.symbol.split("/");
    console.log("Single currency pair:", splitedSymbol);

    dataToUpsert.push({
      from_currency: splitedSymbol[0],
      to_currency: splitedSymbol[1],
      rate: rateConversion(splitedSymbol[0], json.rate),
      date: keyDate
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
        date: keyDate
      });
    }
  }

  return dataToUpsert;
}

// Serve function
serve(async (req: any) => {
  try {
    // Get date from request body
    const { date } = await req.json().catch(() => ({
      date: null
    }));

    // Get missing exchange rates
    let query = supabase.from("missing_exchange_rate")
      .select("base_currency_code, currency_code, date")
      .order("date", { ascending: true });

    // Filter by date if provided
    if (date) {
      query = query.eq("date", date);
    }

    // Fetch missing exchange rates
    const { data: tasks, error: error } = await query;
    if (error) {
      console.error("Failed to fetch missing_exchange_rate", error);
      throw new Error(error);
    }

    // Group tasks by date
    const groupedByDate: Record<string, Array<{ base_currency_code: string, currency_code: string, date: string }>> = {};
    for (const row of tasks ?? []) {
      if (!groupedByDate[row.date]) {
        groupedByDate[row.date] = [];
      }
      groupedByDate[row.date].push(row);
    }

    // Return if no tasks found
    if (tasks.length === 0) {
      return new Response(JSON.stringify({
        message: "No tasks found"
      }), {
        status: 200
      });
    }

    // Loop tasks → fetch rates
    const errors = [];
    for (const keyDate in groupedByDate) {
      console.log("Processing per date:", keyDate);

      const symbols = [];
      for (const missingRate of groupedByDate[keyDate]) {
        symbols.push(`${missingRate.currency_code}/${missingRate.base_currency_code}`);
      }

      console.log("Symbols", symbols);

      try {
        // Build API URL
        const url = `${API_BASE}?symbol=${symbols.join(",")}&date=${keyDate}&apikey=${Deno.env.get("TWELVE_API_KEY")}`;

        // Fetch with retry logic
        const json = await fetchExchangeRatesWithRetry(url, symbols, keyDate);
        console.log("Response from twelve", json);

        // Process and prepare data
        const dataToUpsert = processExchangeRateData(json, symbols, keyDate);

        // Upsert to database
        const { error } = await supabase.from("exchange_rates").upsert(dataToUpsert, {
          onConflict: "from_currency,to_currency,date"
        });
        if (error) {
          console.error("Insert error", error);
          errors.push(error);
        }
      } catch (err) {
        console.error("Failed to process date:", keyDate, err);
        errors.push(err);
        // Continue to next date even if this one failed
        continue;
      }
    }

    if (errors.length > 0) {
      throw errors;
    }

    return new Response(JSON.stringify({
      message: "Exchange rates updated"
    }), {
      status: 200
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      error: err
    }), {
      status: 500
    });
  }
});
