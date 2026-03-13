"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Wallet, Utensils, Dumbbell, BookOpen } from "lucide-react";
import { FinanceAnalyticsView } from "@/components/features/analytics/finance-analytics";
import { NutritionAnalyticsView } from "@/components/features/analytics/nutrition-analytics";
import { WorkoutsAnalyticsView } from "@/components/features/analytics/workouts-analytics";
import { BooksAnalyticsView } from "@/components/features/analytics/books-analytics";
import type {
  AnalyticsFilters,
  AnalyticsPeriod,
} from "@/features/analytics/types";

export default function AnalyticsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("finance");
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");

  const filters: AnalyticsFilters = { period };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
            <p className="text-muted-foreground">
              {t("analytics.description")}
            </p>
          </div>

          {/* Period Selector */}
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Books
            </TabsTrigger>
          </TabsList>

          {/* Finance Tab */}
          <TabsContent value="finance">
            <FinanceAnalyticsView filters={filters} />
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition">
            <NutritionAnalyticsView filters={filters} />
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts">
            <WorkoutsAnalyticsView filters={filters} />
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books">
            <BooksAnalyticsView filters={filters} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
