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
        console.log(`Fetching cryptocurrency data`);

        const results = {
            cryptocurrencies: 0,
        };

        const cryptoRes = await fetch(`https://api.twelvedata.com/cryptocurrencies?apikey=${TWELVE_API_KEY}`);
        const cryptoData = await cryptoRes.json();

        if (cryptoData.data) {
            const cryptoMap = new Map();
            cryptoData.data.forEach((item: any) => {
                const [baseSymbol] = item.symbol.split('/');
                if (baseSymbol && !cryptoMap.has(baseSymbol)) {
                    cryptoMap.set(baseSymbol, {
                        code: baseSymbol,
                        name: item.currency_base,
                        symbol: baseSymbol,
                        type: 'cryptocurrency'
                    });
                }
            });

            const { error } = await supabase.from('currencies').upsert(
                Array.from(cryptoMap.values()).map(c => ({ ...c })),
                { onConflict: 'code' }
            );
            if (error) console.error("Error upserting cryptos:", error);
            else results.cryptocurrencies = cryptoMap.size;
        }

        return new Response(
            JSON.stringify({ message: "Cryptocurrency data fetched and updated", results }),
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
