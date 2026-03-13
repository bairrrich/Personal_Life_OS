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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  createExercise,
  updateExercise,
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  DIFFICULTY_LEVELS,
  type Exercise,
  type MuscleGroup,
  type EquipmentType,
  type DifficultyLevel,
} from "@/features/workouts";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editExercise?: Exercise | null;
}

interface FormData {
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: DifficultyLevel;
  instructions: string;
  videoUrl: string;
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  onSuccess,
  editExercise,
}: AddExerciseDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<
    MuscleGroup[]
  >([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>(
    [],
  );

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      muscleGroups: [],
      equipment: [],
      difficulty: "beginner",
      instructions: "",
      videoUrl: "",
    },
  });

  // Initialize form when editing
  useEffect(() => {
    if (editExercise) {
      setSelectedMuscleGroups(editExercise.muscleGroups);
      setSelectedEquipment(editExercise.equipment);
      form.setValue("name", editExercise.name);
      form.setValue("description", editExercise.description || "");
      form.setValue("difficulty", editExercise.difficulty);
      form.setValue(
        "instructions",
        editExercise.instructions?.join("\n") || "",
      );
      form.setValue("videoUrl", editExercise.videoUrl || "");
    } else {
      setSelectedMuscleGroups([]);
      setSelectedEquipment([]);
      form.reset();
    }
  }, [editExercise, open]);

  const toggleMuscleGroup = (mg: MuscleGroup) => {
    if (selectedMuscleGroups.includes(mg)) {
      setSelectedMuscleGroups(selectedMuscleGroups.filter((g) => g !== mg));
    } else {
      setSelectedMuscleGroups([...selectedMuscleGroups, mg]);
    }
  };

  const toggleEquipment = (eq: EquipmentType) => {
    if (selectedEquipment.includes(eq)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== eq));
    } else {
      setSelectedEquipment([...selectedEquipment, eq]);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (selectedMuscleGroups.length === 0) {
      setError("Please select at least one muscle group");
      return;
    }

    setLoading(true);
    setError(null);

    const instructionsArray = data.instructions
      .split("\n")
      .filter((line) => line.trim().length > 0);

    const result = editExercise
      ? await updateExercise({
          id: editExercise.id,
          name: data.name,
          description: data.description || undefined,
          muscleGroups: selectedMuscleGroups,
          equipment: selectedEquipment,
          difficulty: data.difficulty,
          instructions:
            instructionsArray.length > 0 ? instructionsArray : undefined,
          videoUrl: data.videoUrl || undefined,
        })
      : await createExercise({
          name: data.name,
          description: data.description || undefined,
          muscleGroups: selectedMuscleGroups,
          equipment: selectedEquipment,
          difficulty: data.difficulty,
          instructions:
            instructionsArray.length > 0 ? instructionsArray : undefined,
          videoUrl: data.videoUrl || undefined,
        });

    setLoading(false);

    if (result.success) {
      form.reset();
      setSelectedMuscleGroups([]);
      setSelectedEquipment([]);
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to save exercise");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editExercise
              ? t("workouts.editExercise")
              : t("workouts.addExercise")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("workouts.exerciseName")} *</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("workouts.chest")}
              {...form.register("name", { required: true })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("workouts.exerciseDescription")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("workouts.exerciseDescription")}
              className="min-h-[60px]"
              {...form.register("description")}
            />
          </div>

          {/* Muscle Groups */}
          <div className="space-y-2">
            <Label>{t("workouts.muscleGroups")} *</Label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((mg) => (
                <Badge
                  key={mg.id}
                  variant={
                    selectedMuscleGroups.includes(mg.id) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleMuscleGroup(mg.id)}
                >
                  {mg.icon} {t(`workouts.${mg.id}`)}
                </Badge>
              ))}
            </div>
            {selectedMuscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {selectedMuscleGroups.map((mg) => {
                  const group = MUSCLE_GROUPS.find((g) => g.id === mg);
                  return (
                    <Badge key={mg} variant="secondary" className="text-xs">
                      {group && t(`workouts.${group.id}`)}
                      <button
                        type="button"
                        onClick={() => toggleMuscleGroup(mg)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label>{t("workouts.equipment")}</Label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_TYPES.map((eq) => (
                <Badge
                  key={eq.id}
                  variant={
                    selectedEquipment.includes(eq.id) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleEquipment(eq.id)}
                >
                  {eq.icon} {t(`workouts.${eq.id}`)}
                </Badge>
              ))}
            </div>
            {selectedEquipment.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {selectedEquipment.map((eq) => {
                  const equipment = EQUIPMENT_TYPES.find((e) => e.id === eq);
                  return (
                    <Badge key={eq} variant="secondary" className="text-xs">
                      {equipment?.label}
                      <button
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">{t("workouts.difficulty")} *</Label>
            <Select
              value={form.watch("difficulty")}
              onValueChange={(value) =>
                form.setValue("difficulty", value as DifficultyLevel)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("workouts.difficulty")} />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {t(`workouts.${level.id}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">{t("workouts.instructions")}</Label>
            <Textarea
              id="instructions"
              placeholder={t("workouts.instructions")}
              className="min-h-[100px]"
              {...form.register("instructions")}
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">
              {t("workouts.videoUrl")} ({t("common.optional")})
            </Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/..."
              {...form.register("videoUrl")}
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
                : editExercise
                  ? t("common.save")
                  : t("workouts.addExercise")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
