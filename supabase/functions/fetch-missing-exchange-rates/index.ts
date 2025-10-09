import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateConversion } from "../_shared/rate-conversion.ts";

// Supabase client
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

// API base URL
const API_BASE = "https://api.twelvedata.com/exchange_rate";

serve(async (req: any)=>{
  try {
    const { date } = await req.json().catch(()=>({
      date: null
    }));

    let query = supabase.from("missing_exchange_rate").select("base_currency_code, currency_code, date").order("date", {
      ascending: true
    });

    if (date) {
      query.eq("date", date);
    }

    const { data: tasks, error: error } = await query;
    if (error) {
      console.error("Failed to fetch missing_exchange_rate", error);
      throw new Error(error);
    }

    const groupedByDate: Record<string, Array<{base_currency_code: string, currency_code: string, date: string}>> = {};
    for (const row of tasks ?? []){
      if (!groupedByDate[row.date]) {
        groupedByDate[row.date] = [];
      }
      groupedByDate[row.date].push(row);
    }

    if (tasks.length === 0) {
      return new Response(JSON.stringify({
        message: "No tasks found"
      }), {
        status: 200
      });
    }

    // Loop tasks → fetch rates
    const errors = [];
    for(const keyDate in groupedByDate){
      console.log("Processing per date:", keyDate);
      const symbols = [];
      for (const missingRate of groupedByDate[keyDate]){
        symbols.push(`${missingRate.currency_code}/${missingRate.base_currency_code}`);
      }

      const url = `${API_BASE}?symbol=${symbols.join(",")}&date=${keyDate}&apikey=${Deno.env.get("TWELVE_API_KEY")}`;
      const res = await fetch(url);
      const json = await res.json();
      console.log("Status code", res.status);
      console.log("Response code", json.code);

      if (res.status !== 200 || json.code) {
        console.error("API error", json);
        console.error(`Query params: {symbol: ${symbols}, date: ${keyDate}}`);
        errors.push(json);
        if (json.code === 429) {
          break;
        }
        continue;
      }
      console.log("Response from twelve", json);

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
        for (const currencyPair of symbols){
          const splitedSymbol = currencyPair.split("/");
          console.log("Multiple currency pair:", splitedSymbol);
          const exchangeRate = json[currencyPair];
          // Upsert ke exchange_rates
          if (!exchangeRate) {
            console.log("EXCHANGE RATE undefined:");
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

      const { error } = await supabase.from("exchange_rates").upsert(dataToUpsert, {
        onConflict: "from_currency,to_currency,date"
      });
      if (error) {
        console.error("Insert error", error);
        errors.push(error);
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
