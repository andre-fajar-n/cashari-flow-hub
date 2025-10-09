import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateConversion } from "../_shared/rate-conversion.ts";

// Supabase client
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

// API base URL
const API_BASE = "https://api.twelvedata.com/exchange_rate";

serve(async (req: any)=>{
  try {
    let { date } = await req.json().catch(()=>({
      date: null
    }));

    if (!date) {
      date = new Date(Date.now()).toISOString().split("T")[0];
    }

    const { data: tasks, error: errorCurrencyPairs } = await supabase.from("currency_pairs").select("base_currency_code, currency_code");
    if (errorCurrencyPairs) {
      console.error("Failed to fetch currency_pairs", errorCurrencyPairs);
      throw new Error(errorCurrencyPairs);
    }

    if (tasks.length === 0) {
      return new Response(JSON.stringify({
        message: "No tasks found"
      }), {
        status: 200
      });
    }

    const symbols = [];
    for (const task of tasks){
      symbols.push(`${task.currency_code}/${task.base_currency_code}`);
    }

    const url = `${API_BASE}?symbol=${symbols.join(",")}&date=${date}&apikey=${Deno.env.get("TWELVE_API_KEY")}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log("Status code", res.status);
    console.log("Response code", json.code);

    if (res.status !== 200 || json.code) {
      console.error("API error", json);
      console.error(`Query params: {symbol: ${symbols}, date: ${date}}`);
      if (json.code === 429) {
        // Rate limit exceeded, throw error to stop execution
        throw new Error(`Rate limit exceeded with response: ${json}`);
      }
      // API error occurred, throw error to stop execution
      throw new Error(`API error: ${json}`);
    }

    console.log("Response from twelve", json);

    const dataToUpsert = [];
    console.log("Processing currency pair");
    if (symbols.length === 1) {
      const splitSymbol = json.symbol.split("/");
      console.log("Single currency pair:", splitSymbol);
      dataToUpsert.push({
        from_currency: splitSymbol[0],
        to_currency: splitSymbol[1],
        rate: rateConversion(splitSymbol[0], json.rate),
        date: date
      });
    } else {
      for (const currencyPair of symbols){
        const splitSymbol = currencyPair.split("/");
        console.log("Multiple currency pair:", splitSymbol);
        const exchangeRate = json[currencyPair];
        // Upsert ke exchange_rates
        if (!exchangeRate) {
          console.log("EXCHANGE RATE undefined:");
          continue;
        }
        dataToUpsert.push({
          from_currency: splitSymbol[0],
          to_currency: splitSymbol[1],
          rate: rateConversion(splitSymbol[0], exchangeRate.rate),
          date: date
        });
      }
    }

    const { errorUpsert } = await supabase.from("exchange_rates").upsert(dataToUpsert, {
      onConflict: "from_currency,to_currency,date"
    });
    if (errorUpsert) {
      console.error("Insert error", errorUpsert);
      throw new Error(errorUpsert);
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
