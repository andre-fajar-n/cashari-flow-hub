import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getNotificationSettings } from "@/hooks/use-notification-settings";

const SESSION_KEY = "cashari_startup_notifications_fired";

function getSessionFired(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markFired(key: string) {
  const fired = getSessionFired();
  fired.add(key);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify([...fired]));
}

/**
 * Fires debt due date and goal milestone toasts once per session on app load.
 */
export const useStartupNotifications = () => {
  const { user } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!user || ranRef.current) return;
    ranRef.current = true;

    const settings = getNotificationSettings();
    const fired = getSessionFired();

    // Debt due date reminders
    if (settings.debt_reminder_enabled) {
      (async () => {
        const { data: debts } = await supabase
          .from("debts")
          .select("id, name, due_date")
          .eq("user_id", user.id)
          .eq("status", "active")
          .not("due_date", "is", null);

        if (!debts) return;
        const today = new Date();
        for (const debt of debts) {
          if (!debt.due_date) continue;
          const daysLeft = differenceInDays(parseISO(debt.due_date), today);
          if (daysLeft >= 0 && daysLeft <= settings.debt_reminder_days) {
            const key = `debt_due_${debt.id}`;
            if (!fired.has(key)) {
              toast.warning(
                `Jatuh tempo hutang '${debt.name}' dalam ${daysLeft} hari`,
                { description: `Tanggal jatuh tempo: ${debt.due_date}`, duration: 7000 }
              );
              markFired(key);
            }
          }
        }
      })();
    }

    // Goal milestone reminders
    if (settings.goal_milestone_enabled) {
      (async () => {
        const { data: goals } = await supabase
          .from("goals")
          .select("id, name, target_amount")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (!goals) return;

        for (const goal of goals) {
          if (!goal.target_amount || goal.target_amount <= 0) continue;

          // Get current value from investment_summary
          const { data: summaryRows } = await supabase
            .from("investment_summary")
            .select("current_value_base_currency")
            .eq("goal_id", goal.id);

          if (!summaryRows) continue;
          const currentValue = summaryRows.reduce(
            (s, r) => s + (r.current_value_base_currency ?? 0),
            0
          );

          const pct = (currentValue / goal.target_amount) * 100;
          const milestones = [25, 50, 75, 100];

          for (const milestone of milestones) {
            if (pct >= milestone) {
              const key = `goal_milestone_${goal.id}_${milestone}`;
              if (!fired.has(key)) {
                if (milestone === 100) {
                  toast.success(
                    `Tujuan '${goal.name}' sudah mencapai ${milestone}% dari target!`,
                    { description: "Selamat! Target keuangan tercapai.", duration: 8000 }
                  );
                } else {
                  toast.success(
                    `Tujuan '${goal.name}' sudah mencapai ${milestone}% dari target!`,
                    { duration: 6000 }
                  );
                }
                markFired(key);
              }
            }
          }
        }
      })();
    }
  }, [user]);
};
