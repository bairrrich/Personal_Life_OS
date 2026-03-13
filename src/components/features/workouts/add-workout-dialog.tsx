"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import {
  createWorkout,
  updateWorkout,
  getExercises,
  WORKOUT_TYPES,
  type Workout,
  type WorkoutType,
  type WorkoutExercise,
} from "@/features/workouts";

interface AddWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editWorkout?: Workout | null;
}

interface FormData {
  name: string;
  date: string;
  duration: number;
  type: WorkoutType;
  notes: string;
}

export function AddWorkoutDialog({
  open,
  onOpenChange,
  onSuccess,
  editWorkout,
}: AddWorkoutDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(
    [],
  );

  // Load exercises on mount
  useEffect(() => {
    const loadExercises = async () => {
      const allExercises = await getExercises();
      setExercises(allExercises.map((e) => ({ id: e.id, name: e.name })));
    };
    loadExercises();
  }, [open]);

  // Initialize form when editing
  useEffect(() => {
    if (editWorkout) {
      const date = new Date(editWorkout.date);
      const dateStr = date.toISOString().split("T")[0];

      setSelectedExercises(editWorkout.exercises);
      form.setValue("name", editWorkout.name);
      form.setValue("date", dateStr);
      form.setValue("duration", editWorkout.duration || 0);
      form.setValue("type", editWorkout.type);
      form.setValue("notes", editWorkout.notes || "");
    } else {
      setSelectedExercises([]);
      form.reset();
    }
  }, [editWorkout, open]);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      date: new Date().toISOString().split("T")[0],
      duration: 0,
      type: "strength",
      notes: "",
    },
  });

  const addExercise = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (
      !exercise ||
      selectedExercises.find((e) => e.exerciseId === exerciseId)
    ) {
      return;
    }

    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId,
        exerciseName: exercise.name,
        targetSets: 3,
        targetReps: 10,
        targetWeight: 0,
        sets: [],
        notes: "",
        order: selectedExercises.length,
      },
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(
      selectedExercises.filter((e) => e.exerciseId !== exerciseId),
    );
  };

  const updateExerciseTarget = (
    exerciseId: string,
    field: "targetSets" | "targetReps" | "targetWeight",
    value: number,
  ) => {
    setSelectedExercises(
      selectedExercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, [field]: value } : e,
      ),
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = editWorkout
      ? await updateWorkout({
          id: editWorkout.id,
          name: data.name,
          duration: data.duration || undefined,
          type: data.type,
          notes: data.notes || undefined,
          exercises: selectedExercises,
        })
      : await createWorkout({
          name: data.name,
          date: data.date,
          duration: data.duration || undefined,
          type: data.type,
          exercises: selectedExercises.map((e) => ({
            exerciseId: e.exerciseId,
            targetSets: e.targetSets,
            targetReps: e.targetReps,
            targetWeight: e.targetWeight,
            notes: e.notes,
            order: e.order,
          })),
          notes: data.notes || undefined,
        });

    setLoading(false);

    if (result.success) {
      form.reset();
      setSelectedExercises([]);
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to save workout");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editWorkout ? t("workouts.editWorkout") : t("workouts.addWorkout")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("workouts.workoutName")} *</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("workouts.workoutName")}
              {...form.register("name", { required: true })}
            />
          </div>

          {/* Date and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t("workouts.date")} *</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{t("workouts.type")} *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) =>
                  form.setValue("type", value as WorkoutType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workouts.type")} />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {t(`workouts.${type.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">{t("workouts.duration")}</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              {...form.register("duration", { valueAsNumber: true })}
            />
          </div>

          {/* Add Exercises */}
          <div className="space-y-2">
            <Label>{t("workouts.exercises")}</Label>
            <Select onValueChange={addExercise}>
              <SelectTrigger>
                <SelectValue placeholder={t("workouts.addExercise")} />
              </SelectTrigger>
              <SelectContent>
                {exercises
                  .filter(
                    (e) =>
                      !selectedExercises.find((s) => s.exerciseId === e.id),
                  )
                  .map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Exercises */}
          {selectedExercises.length > 0 && (
            <div className="space-y-2">
              <Label>
                {t("workouts.exercises")} ({selectedExercises.length})
              </Label>
              <div className="space-y-3 border rounded-md p-3 max-h-[300px] overflow-y-auto">
                {selectedExercises.map((ex) => (
                  <div
                    key={ex.exerciseId}
                    className="flex flex-col gap-2 p-3 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{ex.exerciseName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(ex.exerciseId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">{t("workouts.sets")}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ex.targetSets}
                          onChange={(e) =>
                            updateExerciseTarget(
                              ex.exerciseId,
                              "targetSets",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("workouts.reps")}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ex.targetReps || 0}
                          onChange={(e) =>
                            updateExerciseTarget(
                              ex.exerciseId,
                              "targetReps",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">
                          {t("workouts.targetWeight")} ({t("workouts.kg")})
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={ex.targetWeight || 0}
                          onChange={(e) =>
                            updateExerciseTarget(
                              ex.exerciseId,
                              "targetWeight",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("workouts.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("workouts.notes")}
              className="min-h-[60px]"
              {...form.register("notes")}
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("common.saving")
                : editWorkout
                  ? t("common.save")
                  : t("workouts.addWorkout")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
