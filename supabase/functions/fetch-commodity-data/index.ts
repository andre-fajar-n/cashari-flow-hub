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
        console.log(`Fetching commodity data`);

        const results = {
            commodities: 0,
        };

        const commodityRes = await fetch(`https://api.twelvedata.com/commodities?apikey=${TWELVE_API_KEY}`);
        const commodityData = await commodityRes.json();

        if (commodityData.data) {
            const commodityMap = new Map();
            commodityData.data.forEach((item: any) => {
                // "if symbol only contain 1 symbol, like CC1, insert as is. If symbol contain two symbols like GAU/IDR, choose first symbol"
                const code = item.symbol.includes('/') ? item.symbol.split('/')[0] : item.symbol;
                if (code && !commodityMap.has(code)) {
                    commodityMap.set(code, {
                        code: code,
                        name: item.name,
                        symbol: code,
                        type: 'commodity'
                    });
                }
            });

            const { error } = await supabase.from('currencies').upsert(
                Array.from(commodityMap.values()).map(c => ({ ...c })),
                { onConflict: 'code' }
            );
            if (error) console.error("Error upserting commodities:", error);
            else results.commodities = commodityMap.size;
        }

        return new Response(
            JSON.stringify({ message: "Commodity data fetched and updated", results }),
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
