import { useState, useCallback } from "react";

const STORAGE_KEY = "cashari_notification_settings";

export interface ManualThresholdRule {
  id: string;
  category_id: number;
  category_name: string;
  threshold: number;
}

export interface NotificationSettings {
  budget_alerts_enabled: boolean;
  debt_reminder_enabled: boolean;
  debt_reminder_days: number;
  goal_milestone_enabled: boolean;
  unusual_spending_manual_enabled: boolean;
  unusual_spending_auto_enabled: boolean;
  unusual_spending_lookback_days: number;
  manual_threshold_rules: ManualThresholdRule[];
}

const defaults: NotificationSettings = {
  budget_alerts_enabled: true,
  debt_reminder_enabled: true,
  debt_reminder_days: 7,
  goal_milestone_enabled: true,
  unusual_spending_manual_enabled: true,
  unusual_spending_auto_enabled: true,
  unusual_spending_lookback_days: 90,
  manual_threshold_rules: [],
};

function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);

  const update = useCallback((partial: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addManualRule = useCallback(
    (rule: Omit<ManualThresholdRule, "id">) => {
      setSettings((prev) => {
        const next: NotificationSettings = {
          ...prev,
          manual_threshold_rules: [
            ...prev.manual_threshold_rules,
            { ...rule, id: crypto.randomUUID() },
          ],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeManualRule = useCallback((id: string) => {
    setSettings((prev) => {
      const next: NotificationSettings = {
        ...prev,
        manual_threshold_rules: prev.manual_threshold_rules.filter(
          (r) => r.id !== id
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, update, addManualRule, removeManualRule };
};

export const getNotificationSettings = (): NotificationSettings => loadSettings();
