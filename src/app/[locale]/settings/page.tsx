"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Wallet,
  Utensils,
  Dumbbell,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Theme = "light" | "dark" | "system";
type Language = "ru" | "en";
type Currency = "RUB" | "USD" | "EUR" | "KZT" | "BYN";
type WeekStart = "monday" | "sunday" | "saturday";

interface ModuleSettings {
  finance: {
    enabled: boolean;
    defaultAccountId?: string;
    showCents: boolean;
  };
  nutrition: {
    enabled: boolean;
    calorieGoal: number;
    proteinGoal: number;
    fatGoal: number;
    carbsGoal: number;
    waterGoal: number;
  };
  workouts: {
    enabled: boolean;
    defaultWorkoutType: string;
    showRestTimer: boolean;
    restTimerSeconds: number;
  };
  products: {
    enabled: boolean;
    showBarcodeScanner: boolean;
  };
}

interface Settings {
  theme: Theme;
  language: Language;
  currency: Currency;
  weekStart: WeekStart;
  modules: ModuleSettings;
}

const defaultModuleSettings: ModuleSettings = {
  finance: {
    enabled: true,
    defaultAccountId: undefined,
    showCents: true,
  },
  nutrition: {
    enabled: true,
    calorieGoal: 2000,
    proteinGoal: 150,
    fatGoal: 67,
    carbsGoal: 250,
    waterGoal: 2000,
  },
  workouts: {
    enabled: true,
    defaultWorkoutType: "strength",
    showRestTimer: true,
    restTimerSeconds: 90,
  },
  products: {
    enabled: true,
    showBarcodeScanner: false,
  },
};

const defaultSettings: Settings = {
  theme: "system",
  language: "en",
  currency: "USD",
  weekStart: "monday",
  modules: defaultModuleSettings,
};

const SETTINGS_STORAGE_KEY = "settings:v1";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({
    finance: false,
    nutrition: false,
    workouts: false,
    products: false,
  });

  // Load settings from localStorage on mount with error handling
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with default settings to ensure all fields exist
        const mergedSettings = {
          ...defaultSettings,
          ...parsed,
          modules: {
            ...defaultModuleSettings,
            ...(parsed.modules || {}),
            finance: {
              ...defaultModuleSettings.finance,
              ...(parsed.modules?.finance || {}),
            },
            nutrition: {
              ...defaultModuleSettings.nutrition,
              ...(parsed.modules?.nutrition || {}),
            },
            workouts: {
              ...defaultModuleSettings.workouts,
              ...(parsed.modules?.workouts || {}),
            },
            products: {
              ...defaultModuleSettings.products,
              ...(parsed.modules?.products || {}),
            },
          },
        };

        setSettings(() => {
          if (mergedSettings.theme) {
            setTheme(mergedSettings.theme);
          }
          return mergedSettings;
        });
      }
    } catch {
      // Ignore errors (incognito mode, quota exceeded, parse errors)
    }
    setIsInitialized(true);
  }, [setTheme]);

  // Auto-apply settings when they change
  useEffect(() => {
    if (!isInitialized) return;

    // Save to localStorage with versioning
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }

    // Apply theme immediately
    if (settings.theme !== theme) {
      setTheme(settings.theme);
    }

    // Apply language change using next-intl router
    if (settings.language) {
      // Extract the current path without locale
      const basePath = pathname.replace(/^\/ru/, "").replace(/^\/en/, "");
      // Router will automatically add the new locale
      router.replace(basePath, { locale: settings.language });
    }
  }, [settings, isInitialized, theme, setTheme, router, pathname]);

  const handleReset = () => {
    setSettings(defaultSettings);
    setTheme("system");
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
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

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
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
                        : "border-border hover:bg-accent hover:border-primary/50"
                    }`}
                  >
                    {settings.theme === themeOption.value && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                    {themeOption.icon}
                    <span className="text-sm font-medium">
                      {themeOption.label}
                    </span>
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
                        : "border-border hover:bg-accent hover:border-primary/50"
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
                        : "border-border hover:bg-accent hover:border-primary/50"
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
                        : "border-border hover:bg-accent hover:border-primary/50"
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
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{t("modules")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("modulesDescription")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Finance Module */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedModules({
                        ...expandedModules,
                        finance: !expandedModules.finance,
                      })
                    }
                    className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Wallet className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {t("finance")}
                          <Check
                            className={`h-4 w-4 ${
                              settings.modules.finance.enabled
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {settings.modules.finance.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                    </div>
                    {expandedModules.finance ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedModules.finance && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Enable Module</div>
                          <div className="text-xs text-muted-foreground">
                            Show finance section in navigation
                          </div>
                        </div>
                        <Button
                          variant={
                            settings.modules.finance.enabled
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              modules: {
                                ...settings.modules,
                                finance: {
                                  ...settings.modules.finance,
                                  enabled: !settings.modules.finance.enabled,
                                },
                              },
                            })
                          }
                        >
                          {settings.modules.finance.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Show Cents</div>
                          <div className="text-xs text-muted-foreground">
                            Display decimal places for amounts
                          </div>
                        </div>
                        <Button
                          variant={
                            settings.modules.finance.showCents
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              modules: {
                                ...settings.modules,
                                finance: {
                                  ...settings.modules.finance,
                                  showCents:
                                    !settings.modules.finance.showCents,
                                },
                              },
                            })
                          }
                        >
                          {settings.modules.finance.showCents ? "On" : "Off"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nutrition Module */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedModules({
                        ...expandedModules,
                        nutrition: !expandedModules.nutrition,
                      })
                    }
                    className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Utensils className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {t("nutrition")}
                          <Check
                            className={`h-4 w-4 ${
                              settings.modules.nutrition.enabled
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {settings.modules.nutrition.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                    </div>
                    {expandedModules.nutrition ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedModules.nutrition && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Enable Module</div>
                          <div className="text-xs text-muted-foreground">
                            Show nutrition section in navigation
                          </div>
                        </div>
                        <Button
                          variant={
                            settings.modules.nutrition.enabled
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              modules: {
                                ...settings.modules,
                                nutrition: {
                                  ...settings.modules.nutrition,
                                  enabled: !settings.modules.nutrition.enabled,
                                },
                              },
                            })
                          }
                        >
                          {settings.modules.nutrition.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Calorie Goal</Label>
                          <Input
                            type="number"
                            value={settings.modules.nutrition.calorieGoal}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                modules: {
                                  ...settings.modules,
                                  nutrition: {
                                    ...settings.modules.nutrition,
                                    calorieGoal: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Water Goal (ml)</Label>
                          <Input
                            type="number"
                            value={settings.modules.nutrition.waterGoal}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                modules: {
                                  ...settings.modules,
                                  nutrition: {
                                    ...settings.modules.nutrition,
                                    waterGoal: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Workouts Module */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedModules({
                        ...expandedModules,
                        workouts: !expandedModules.workouts,
                      })
                    }
                    className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Dumbbell className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {t("workouts")}
                          <Check
                            className={`h-4 w-4 ${
                              settings.modules.workouts.enabled
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {settings.modules.workouts.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                    </div>
                    {expandedModules.workouts ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedModules.workouts && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Enable Module</div>
                          <div className="text-xs text-muted-foreground">
                            Show workouts section in navigation
                          </div>
                        </div>
                        <Button
                          variant={
                            settings.modules.workouts.enabled
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              modules: {
                                ...settings.modules,
                                workouts: {
                                  ...settings.modules.workouts,
                                  enabled: !settings.modules.workouts.enabled,
                                },
                              },
                            })
                          }
                        >
                          {settings.modules.workouts.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Rest Timer</div>
                          <div className="text-xs text-muted-foreground">
                            Show timer between sets
                          </div>
                        </div>
                        <Button
                          variant={
                            settings.modules.workouts.showRestTimer
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              modules: {
                                ...settings.modules,
                                workouts: {
                                  ...settings.modules.workouts,
                                  showRestTimer:
                                    !settings.modules.workouts.showRestTimer,
                                },
                              },
                            })
                          }
                        >
                          {settings.modules.workouts.showRestTimer
                            ? "On"
                            : "Off"}
                        </Button>
                      </div>

                      {settings.modules.workouts.showRestTimer && (
                        <div>
                          <Label>Rest Time (seconds)</Label>
                          <Input
                            type="number"
                            value={settings.modules.workouts.restTimerSeconds}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                modules: {
                                  ...settings.modules,
                                  workouts: {
                                    ...settings.modules.workouts,
                                    restTimerSeconds:
                                      parseInt(e.target.value) || 60,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Products Module */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedModules({
                        ...expandedModules,
                        products: !expandedModules.products,
                      })
                    }
                    className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Package className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {t("products")}
                          <Check
                            className={`h-4 w-4 ${
                              settings.modules.products.enabled
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {settings.modules.products.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                    </div>
                    {expandedModules.products ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedModules.products && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Enable Module</div>
                          <div className="text-xs text-muted-foreground">
                            Show products section in navigation
                          </div>
                        </div>
                        <Button
                          variant={
                            settings.modules.products.enabled
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              modules: {
                                ...settings.modules,
                                products: {
                                  ...settings.modules.products,
                                  enabled: !settings.modules.products.enabled,
                                },
                              },
                            })
                          }
                        >
                          {settings.modules.products.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
