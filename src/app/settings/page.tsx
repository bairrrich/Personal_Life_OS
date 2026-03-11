"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  Moon,
  Sun,
  Globe,
  DollarSign,
  Calendar,
  RotateCcw,
  Check,
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
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSettings(parsed);
      if (parsed.theme) {
        setTheme(parsed.theme);
      }
    }
    setIsInitialized(true);
  }, [setTheme]);

  // Auto-apply settings when they change
  useEffect(() => {
    if (!isInitialized) return;

    // Save to localStorage
    localStorage.setItem("settings", JSON.stringify(settings));

    // Apply theme immediately
    if (settings.theme !== theme) {
      setTheme(settings.theme);
    }

    // Apply language change
    if (settings.language) {
      const newPath =
        settings.language === "ru"
          ? pathname.replace(/^\/en/, "")
          : pathname.replace(/^\/ru/, `/${settings.language}`);

      if (newPath !== pathname) {
        router.replace(newPath);
      }
    }
  }, [settings, isInitialized, theme, setTheme, router, pathname]);

  const handleReset = () => {
    setSettings(defaultSettings);
    setTheme("system");
    localStorage.removeItem("settings");
  };

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: t("light"), icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: t("dark"), icon: <Moon className="h-4 w-4" /> },
    {
      value: "system",
      label: t("system"),
      icon: <RotateCcw className="h-4 w-4" />,
    },
  ];

  const languages: { value: Language; label: string }[] = [
    { value: "ru", label: t("russian") },
    { value: "en", label: t("english") },
  ];

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: "RUB", label: "Российский рубль", symbol: "₽" },
    { value: "USD", label: "US Dollar", symbol: "$" },
    { value: "EUR", label: "Euro", symbol: "€" },
    { value: "KZT", label: "Kazakhstani Tenge", symbol: "₸" },
    { value: "BYN", label: "Belarusian Ruble", symbol: "Br" },
  ];

  const weekStarts: { value: WeekStart; label: string }[] = [
    { value: "monday", label: t("monday") },
    { value: "sunday", label: t("sunday") },
    { value: "saturday", label: t("saturday") },
  ];

  if (!isInitialized) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full border-4 border-primary border-t-transparent w-16 h-16" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t("reset")}
          </Button>
        </div>

        {/* Theme Settings */}
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
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() =>
                  setSettings({ ...settings, theme: themeOption.value })
                }
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  settings.theme === themeOption.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {settings.theme === themeOption.value && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                {themeOption.icon}
                <span className="text-sm font-medium">{themeOption.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Language Settings */}
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
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  settings.language === lang.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {settings.language === lang.value && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                <span className="font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Currency Settings */}
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
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  settings.currency === currency.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {settings.currency === currency.value && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
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

        {/* Week Start Settings */}
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
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  settings.weekStart === weekStart.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {settings.weekStart === weekStart.value && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                <span className="font-medium">{weekStart.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Current Settings Preview */}
        <GlassCard className="p-6 bg-muted/50">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            {settings.language === "ru"
              ? "Текущие настройки:"
              : "Current settings:"}
          </h3>
          <pre className="text-xs font-mono bg-background/50 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
