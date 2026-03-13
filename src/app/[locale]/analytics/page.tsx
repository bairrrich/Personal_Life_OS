"use client";

import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  TrendingUp,
  PieChart,
  Dumbbell,
  Utensils,
  Wallet,
  BarChart3,
} from "lucide-react";

const analyticsSections = [
  {
    id: "finance",
    title: "Finance Analytics",
    description: "Track income, expenses, and budgets",
    icon: Wallet,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    href: "/analytics/finance",
    features: [
      "Spending by Category",
      "Income vs Expenses",
      "Monthly Overview",
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition Analytics",
    description: "Analyze calories and macronutrients",
    icon: Utensils,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    href: "/analytics/nutrition",
    features: ["Calories Trend", "Macros Distribution", "Weekly/Monthly Stats"],
  },
  {
    id: "workouts",
    title: "Workout Analytics",
    description: "Track your fitness progress",
    icon: Dumbbell,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/workouts",
    features: ["Workout Frequency", "Exercise Progress", "Muscle Groups"],
    comingSoon: true,
  },
];

export default function AnalyticsPage() {
  const t = useTranslations();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
          <p className="text-muted-foreground">{t("analytics.description")}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {analyticsSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  section.comingSoon ? "opacity-60" : "cursor-pointer"
                }`}
              >
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-3`}
                  >
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {section.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${section.color.replace("text-", "bg-")}`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!section.comingSoon && (
                    <Button asChild className="w-full mt-4">
                      <Link href={section.href}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                  )}
                  {section.comingSoon && (
                    <Button disabled className="w-full mt-4">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Overview
            </CardTitle>
            <CardDescription>Quick summary across all areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Finance</div>
                <div className="text-2xl font-bold">Track your spending</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Nutrition</div>
                <div className="text-2xl font-bold">Monitor your diet</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Workouts</div>
                <div className="text-2xl font-bold">Build strength</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
