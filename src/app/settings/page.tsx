"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Moon,
  Sun,
  Globe,
  DollarSign,
  Calendar,
  Save,
  RotateCcw,
} from "lucide-react";

type Theme = "light" | "dark" | "system";
type Language = "ru" | "en";
type Currency = "RUB" | "USD" | "EUR" | "KZT" | "BYN";
type WeekStart = "monday" | "sunday" | "saturday";

interface Settings {
  theme: Theme;
  language: Language;
  currency: Currency;
  weekStart: WeekStart;
}

const defaultSettings: Settings = {
  theme: "system",
  language: "ru",
  currency: "RUB",
  weekStart: "monday",
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  const themes = [
    {
      value: "light" as Theme,
      label: t("light"),
      icon: <Sun className="h-4 w-4" />,
    },
    {
      value: "dark" as Theme,
      label: t("dark"),
      icon: <Moon className="h-4 w-4" />,
    },
    {
      value: "system" as Theme,
      label: t("system"),
      icon: <RotateCcw className="h-4 w-4" />,
    },
  ];

  const languages = [
    { value: "ru" as Language, label: t("russian") },
    { value: "en" as Language, label: t("english") },
  ];

  const currencies = [
    { value: "RUB" as Currency, label: "Российский рубль", symbol: "₽" },
    { value: "USD" as Currency, label: "US Dollar", symbol: "$" },
    { value: "EUR" as Currency, label: "Euro", symbol: "€" },
    { value: "KZT" as Currency, label: "Kazakhstani Tenge", symbol: "₸" },
    { value: "BYN" as Currency, label: "Belarusian Ruble", symbol: "Br" },
  ];

  const weekStarts = [
    { value: "monday" as WeekStart, label: t("monday") },
    { value: "sunday" as WeekStart, label: t("sunday") },
    { value: "saturday" as WeekStart, label: t("saturday") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sun className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("theme")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("themeDescription")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => setSettings({ ...settings, theme: theme.value })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  settings.theme === theme.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {theme.icon}
                <span className="text-sm font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("language")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("languageDescription")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() =>
                  setSettings({ ...settings, language: lang.value })
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.language === lang.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("currency")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("currencyDescription")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currencies.map((currency) => (
              <button
                key={currency.value}
                onClick={() =>
                  setSettings({ ...settings, currency: currency.value })
                }
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  settings.currency === currency.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-lg font-bold">{currency.symbol}</span>
                <div className="text-left">
                  <div className="font-medium">{currency.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {currency.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("weekStart")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("weekStartDescription")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {weekStarts.map((weekStart) => (
              <button
                key={weekStart.value}
                onClick={() =>
                  setSettings({ ...settings, weekStart: weekStart.value })
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.weekStart === weekStart.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium">{weekStart.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t("reset")}
          </Button>
          <Button onClick={handleSave} className="gap-2" disabled={saved}>
            <Save className="h-4 w-4" />
            {saved ? t("saved") : t("save")}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
