import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase client with service role key to bypass RLS for insertion
const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const TWELVE_API_KEY = Deno.env.get("TWELVE_API_KEY");

serve(async (_req: Request) => {
    try {
        console.log(`Fetching currency data`);

        const results = {
            currencies: 0,
        };

        const forexRes = await fetch(`https://api.twelvedata.com/forex_pairs?apikey=${TWELVE_API_KEY}`);
        const forexData = await forexRes.json();

        if (forexData.data) {
            const currencyMap = new Map();
            forexData.data.forEach((item: any) => {
                const [baseCode, quoteCode] = item.symbol.split('/');
                if (baseCode && !currencyMap.has(baseCode)) {
                    currencyMap.set(baseCode, {
                        code: baseCode,
                        name: item.currency_base,
                        symbol: baseCode,
                        type: 'currency'
                    });
                }
                if (quoteCode && !currencyMap.has(quoteCode)) {
                    currencyMap.set(quoteCode, {
                        code: quoteCode,
                        name: item.currency_quote,
                        symbol: quoteCode,
                        type: 'currency'
                    });
                }
            });

            const { error } = await supabase.from('currencies').upsert(
                Array.from(currencyMap.values()).map(c => ({ ...c })),
                { onConflict: 'code' }
            );
            if (error) console.error("Error upserting currencies:", error);
            else results.currencies = currencyMap.size;
        }

        return new Response(
            JSON.stringify({ message: "Currency data fetched and updated", results }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err) {
        console.error("Unexpected error:", err);
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
});
