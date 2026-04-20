import { getNotificationSettings } from "@/hooks/use-notification-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

interface CheckParams {
  userId: string;
  categoryId: number;
  categoryName?: string;
  amount: number; // positive value (expense)
}

/**
 * Checks if a transaction is unusual compared to the user's historical average for that category.
 * Fires a sonner toast if unusual. Call this after saving an expense transaction.
 */
export const checkUnusualSpending = async ({
  userId,
  categoryId,
  categoryName: _categoryName,
  amount,
}: CheckParams) => {
  const settings = getNotificationSettings();

  // Resolve category name if not provided
  let categoryName = _categoryName;
  if (!categoryName) {
    const { data: cat } = await supabase
      .from("categories")
      .select("name")
      .eq("id", categoryId)
      .single();
    categoryName = cat?.name ?? String(categoryId);
  }

  // Manual threshold check
  if (settings.unusual_spending_manual_enabled) {
    const rule = settings.manual_threshold_rules.find(
      (r) => r.category_id === categoryId
    );
    if (rule && amount > rule.threshold) {
      toast.warning(`Transaksi besar terdeteksi: ${amount.toLocaleString("id-ID")} di ${categoryName}`, {
        description: `Melebihi batas manual yang ditentukan (${rule.threshold.toLocaleString("id-ID")})`,
        duration: 6000,
      });
    }
  }

  // Auto-detect statistical check
  if (!settings.unusual_spending_auto_enabled) return;

  const lookbackDays = settings.unusual_spending_lookback_days;
  const startDate = format(subDays(new Date(), lookbackDays), "yyyy-MM-dd");

  // Get historical transactions for this category
  const { data } = await supabase
    .from("transactions")
    .select("amount, date, created_at")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .gte("date", startDate)
    .order("date", { ascending: true });

  if (!data || data.length === 0) return;

  // Check 30-day cold start: we need user to have data spanning at least 30 days
  const firstDate = data[0].date;
  const daySpan = Math.ceil(
    (new Date().getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daySpan < 30) return; // cold start guard

  const amounts = data.map((t) => Math.abs(t.amount));
  const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  const variance =
    amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length;
  const stddev = Math.sqrt(variance);

  const threshold = mean + 2 * stddev;
  if (amount > threshold) {
    toast.warning(
      `Pengeluaran tidak biasa terdeteksi: ${amount.toLocaleString("id-ID")} di ${categoryName}`,
      {
        description: `Rata-rata: ${Math.round(mean).toLocaleString("id-ID")}`,
        duration: 7000,
      }
    );
  }
};
