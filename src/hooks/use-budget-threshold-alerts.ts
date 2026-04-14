import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { BudgetModel } from "@/models/budgets";

/**
 * Fires a sonner toast when a budget's spend crosses 80% or 100% of its limit.
 * Call this after adding/removing transactions from a budget.
 *
 * @param budget  The budget record
 * @param spentPercentage  Current spend as a percentage of the limit (0–100+)
 */
export const useBudgetThresholdAlerts = (
  budget: BudgetModel | undefined,
  spentPercentage: number
) => {
  // Track the last threshold we fired so we don't re-fire on every render
  const lastFiredRef = useRef<number | null>(null);

  useEffect(() => {
    if (!budget) return;

    const threshold = spentPercentage >= 100 ? 100 : spentPercentage >= 80 ? 80 : null;
    if (threshold === null) {
      // Reset so we can fire again if it crosses back up
      lastFiredRef.current = null;
      return;
    }

    // Fire only when crossing a new threshold
    if (lastFiredRef.current === threshold) return;
    lastFiredRef.current = threshold;

    if (threshold === 100) {
      toast.error(`Anggaran '${budget.name}' telah mencapai 100% dari limit`, {
        description: "Limit anggaran telah habis.",
        duration: 6000,
      });
    } else {
      toast.warning(`Anggaran '${budget.name}' telah mencapai ${Math.round(spentPercentage)}% dari limit`, {
        description: "Pertimbangkan untuk meninjau pengeluaran Anda.",
        duration: 5000,
      });
    }
  }, [budget, spentPercentage]);
};
