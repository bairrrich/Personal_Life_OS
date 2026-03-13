"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Search, Dumbbell, Calendar, TrendingUp } from "lucide-react";
import {
  getExercises,
  getWorkouts,
  deleteExercise,
  deleteWorkout,
  type Exercise,
  type Workout,
} from "@/features/workouts";
import { ExerciseCard, WorkoutCard } from "@/components/features/workouts";
import {
  AddExerciseDialog,
  AddWorkoutDialog,
} from "@/components/features/workouts";

export default function WorkoutsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"workouts" | "exercises">(
    "workouts",
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allExercises, allWorkouts] = await Promise.all([
      getExercises(),
      getWorkouts(),
    ]);
    setExercises(allExercises);
    setWorkouts(allWorkouts);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (confirm(t("workouts.confirmDeleteExercise"))) {
      await deleteExercise(exerciseId);
      loadData();
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (confirm(t("workouts.confirmDeleteWorkout"))) {
      await deleteWorkout(workoutId);
      loadData();
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setAddExerciseOpen(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setAddWorkoutOpen(true);
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("workouts.title")}</h1>
            <p className="text-muted-foreground">{t("workouts.description")}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="workouts"
              className="flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium transition-all data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted"
            >
              <Dumbbell className="h-4 w-4" />
              <span className="hidden lg:inline">{t("workouts.workouts")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="exercises"
              className="flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium transition-all data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">
                {t("workouts.exercises")}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl font-semibold">
                {t("workouts.yourWorkouts")}
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("workouts.searchWorkouts")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[200px]"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingWorkout(null);
                    setAddWorkoutOpen(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("workouts.addWorkout")}
                  </span>
                </Button>
              </div>
            </div>

            {filteredWorkouts.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {t("workouts.noWorkouts")}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t("workouts.startTracking")}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setAddWorkoutOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("workouts.addWorkout")}
                </Button>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onEdit={() => handleEditWorkout(workout)}
                    onDelete={() => handleDeleteWorkout(workout.id)}
                    showActions
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl font-semibold">
                {t("workouts.exercises")}
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("workouts.searchExercises")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[200px]"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingExercise(null);
                    setAddExerciseOpen(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("workouts.addExercise")}
                  </span>
                </Button>
              </div>
            </div>

            {filteredExercises.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {t("workouts.noExercises")}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t("workouts.addExercises")}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setAddExerciseOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("workouts.addExercise")}
                </Button>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={() => handleEditExercise(exercise)}
                    onDelete={() => handleDeleteExercise(exercise.id)}
                    showActions
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddExerciseDialog
        open={addExerciseOpen}
        onOpenChange={setAddExerciseOpen}
        onSuccess={loadData}
        editExercise={editingExercise}
      />
      <AddWorkoutDialog
        open={addWorkoutOpen}
        onOpenChange={setAddWorkoutOpen}
        onSuccess={loadData}
        editWorkout={editingWorkout}
      />
    </AppLayout>
  );
}
