import { useState } from "react";
import { Bell, Trash2, Plus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNotificationSettings, ManualThresholdRule } from "@/hooks/use-notification-settings";
import { useCategories } from "@/hooks/queries/use-categories";

const SectionCard = ({
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
}) => (
  <Card className="overflow-hidden shadow-none">
    <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
    <div className="px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      {enabled && children && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  </Card>
);

const NotificationSettingsManagement = () => {
  const { settings, update, addManualRule, removeManualRule } =
    useNotificationSettings();
  const { data: categories } = useCategories();

  // Form state for new manual rule
  const [newRuleCategoryId, setNewRuleCategoryId] = useState<string>("");
  const [newRuleThreshold, setNewRuleThreshold] = useState<string>("");

  const expenseCategories = (categories ?? []).filter((c) => !c.is_income);

  const handleAddRule = () => {
    const catId = parseInt(newRuleCategoryId);
    const threshold = parseFloat(newRuleThreshold);
    if (!catId || isNaN(threshold) || threshold <= 0) return;
    const cat = expenseCategories.find((c) => c.id === catId);
    if (!cat) return;
    addManualRule({
      category_id: catId,
      category_name: cat.name,
      threshold,
    });
    setNewRuleCategoryId("");
    setNewRuleThreshold("");
  };

  return (
    <div className="space-y-4">
      {/* Budget Alerts */}
      <SectionCard
        title="Peringatan Anggaran"
        description="Notifikasi saat pengeluaran mencapai 80% atau 100% dari limit anggaran."
        enabled={settings.budget_alerts_enabled}
        onToggle={(v) => update({ budget_alerts_enabled: v })}
      />

      {/* Debt Reminders */}
      <SectionCard
        title="Pengingat Jatuh Tempo Hutang"
        description="Notifikasi saat hutang mendekati tanggal jatuh tempo."
        enabled={settings.debt_reminder_enabled}
        onToggle={(v) => update({ debt_reminder_enabled: v })}
      >
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground w-32 shrink-0">
            Ingatkan H-
          </Label>
          <Select
            value={String(settings.debt_reminder_days)}
            onValueChange={(v) => update({ debt_reminder_days: parseInt(v) })}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 5, 7, 14, 30].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d} hari
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {/* Goal Milestones */}
      <SectionCard
        title="Pencapaian Tujuan"
        description="Notifikasi saat tujuan mencapai 25%, 50%, 75%, atau 100% dari target."
        enabled={settings.goal_milestone_enabled}
        onToggle={(v) => update({ goal_milestone_enabled: v })}
      />

      {/* Manual Unusual Spending */}
      <SectionCard
        title="Pengeluaran Besar (Manual)"
        description="Tandai transaksi jika melebihi ambang batas yang Anda tentukan per kategori."
        enabled={settings.unusual_spending_manual_enabled}
        onToggle={(v) => update({ unusual_spending_manual_enabled: v })}
      >
        {/* Existing rules */}
        {settings.manual_threshold_rules.length > 0 && (
          <div className="space-y-2">
            {settings.manual_threshold_rules.map((rule: ManualThresholdRule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/40 border"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="text-xs shrink-0">
                    {rule.category_name}
                  </Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    &gt; {rule.threshold.toLocaleString("id-ID")}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeManualRule(rule.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new rule */}
        <div className="flex items-end gap-2 flex-wrap">
          <div className="space-y-1 flex-1 min-w-[140px]">
            <Label className="text-xs text-muted-foreground">Kategori</Label>
            <Select value={newRuleCategoryId} onValueChange={setNewRuleCategoryId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex-1 min-w-[120px]">
            <Label className="text-xs text-muted-foreground">Ambang batas</Label>
            <Input
              className="h-8 text-xs"
              type="number"
              placeholder="Nominal"
              value={newRuleThreshold}
              onChange={(e) => setNewRuleThreshold(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            className="h-8"
            onClick={handleAddRule}
            disabled={!newRuleCategoryId || !newRuleThreshold}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Tambah
          </Button>
        </div>
      </SectionCard>

      {/* Auto-detect Unusual Spending */}
      <SectionCard
        title="Pengeluaran Tidak Biasa (Otomatis)"
        description="Deteksi statistik pengeluaran yang tidak biasa dibandingkan rata-rata historis Anda."
        enabled={settings.unusual_spending_auto_enabled}
        onToggle={(v) => update({ unusual_spending_auto_enabled: v })}
      >
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground w-32 shrink-0">
            Periode lookback
          </Label>
          <Select
            value={String(settings.unusual_spending_lookback_days)}
            onValueChange={(v) =>
              update({ unusual_spending_lookback_days: parseInt(v) })
            }
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[30, 60, 90, 180].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d} hari
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/40">
          <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Deteksi otomatis aktif setelah 30 hari data transaksi tersedia. Transaksi dengan
            nilai &gt; rata-rata + 2× standar deviasi akan ditandai.
          </p>
        </div>
      </SectionCard>

      <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground">
        <Bell className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        Pengaturan disimpan secara lokal di browser ini. Notifikasi muncul sebagai toast dalam aplikasi.
      </div>
    </div>
  );
};

export default NotificationSettingsManagement;
