"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Plus, Minus } from "lucide-react";
import {
  getWaterIntake,
  updateWaterIntake,
  getNutritionGoal,
} from "@/features/nutrition/actions";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WaterTrackerProps {
  date?: string;
  className?: string;
}

export function WaterTracker({ date, className }: WaterTrackerProps) {
  const t = useTranslations();
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState("");

  const selectedDate = date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    const [intake, goal] = await Promise.all([
      getWaterIntake(selectedDate),
      getNutritionGoal(selectedDate),
    ]);
    setWaterIntake(intake);
    if (goal) {
      setWaterGoal(goal.water);
    }
    setLoading(false);
  };

  const updateIntake = async (amount: number) => {
    const newIntake = Math.max(0, waterIntake + amount);
    setWaterIntake(newIntake);
    await updateWaterIntake(selectedDate, newIntake);
  };

  const setCustomIntake = async () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount >= 0) {
      setWaterIntake(amount);
      await updateWaterIntake(selectedDate, amount);
      setCustomAmount("");
    }
  };

  const progress = Math.min(100, (waterIntake / waterGoal) * 100);
  const glasses = Math.round(waterIntake / 250);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-500" />
              <span className="font-semibold">
                {t("nutrition.waterIntake")}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {waterIntake} / {waterGoal} ml
            </span>
          </div>

          {/* Progress */}
          <Progress
            value={progress}
            className="h-3"
            indicatorClassName="bg-cyan-500"
          />
          <div className="text-xs text-muted-foreground text-right">
            {Math.round(progress)}%
          </div>

          {/* Glasses Counter */}
          <div className="flex justify-center gap-1 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <Droplets
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < glasses ? "text-cyan-500" : "text-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {glasses} {glasses === 1 ? "glass" : "glasses"} (250ml each)
          </div>

          {/* Quick Add Buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateIntake(-250)}
              disabled={waterIntake <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => updateIntake(250)}
              className="min-w-[80px]"
            >
              +250ml
            </Button>
            <Button
              variant="outline"
              onClick={() => updateIntake(500)}
              className="min-w-[80px]"
            >
              +500ml
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateIntake(250)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Custom Amount */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              placeholder="Custom ml"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full"
              min="0"
              step="50"
            />
            <Button
              variant="outline"
              onClick={setCustomIntake}
              disabled={!customAmount}
              className="w-full sm:w-auto"
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
