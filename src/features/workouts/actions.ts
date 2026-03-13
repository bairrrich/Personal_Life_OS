// Workouts Actions

"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
  queryEntities,
} from "@/entity-engine/engine";
import type {
  ExerciseEntity,
  WorkoutEntity,
  WorkoutSetData,
  WorkoutExerciseData,
} from "@/entity-engine/types";
import type {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  CreateExerciseInput,
  UpdateExerciseInput,
  CreateWorkoutInput,
  UpdateWorkoutInput,
  MuscleGroup,
  EquipmentType,
} from "./types";

// ============================================
// Exercise Actions
// ============================================

/**
 * Create a new exercise
 */
export async function createExercise(
  input: CreateExerciseInput,
): Promise<{ success: boolean; data?: Exercise; error?: string }> {
  "use server";
  try {
    const now = Date.now();

    const id = await createEntity<ExerciseEntity>({
      type: "exercise",
      name: input.name,
      data: {
        description: input.description,
        muscleGroups: input.muscleGroups,
        equipment: input.equipment,
        difficulty: input.difficulty,
        instructions: input.instructions,
        videoUrl: input.videoUrl,
      },
    });

    revalidatePath("/workouts");

    const exercise: Exercise = {
      id,
      name: input.name,
      description: input.description,
      muscleGroups: input.muscleGroups,
      equipment: input.equipment,
      difficulty: input.difficulty,
      instructions: input.instructions,
      videoUrl: input.videoUrl,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: exercise };
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing exercise
 */
export async function updateExercise(
  input: UpdateExerciseInput,
): Promise<{ success: boolean; data?: Exercise; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "exercise") {
      return { success: false, error: "Exercise not found" };
    }

    const exerciseEntity = entity as ExerciseEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.muscleGroups !== undefined)
      updateData.muscleGroups = input.muscleGroups;
    if (input.equipment !== undefined) updateData.equipment = input.equipment;
    if (input.difficulty !== undefined)
      updateData.difficulty = input.difficulty;
    if (input.instructions !== undefined)
      updateData.instructions = input.instructions;
    if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;

    await updateEntity(input.id, updateData);

    revalidatePath("/workouts");

    const updatedEntity = (await getEntityById(input.id)) as ExerciseEntity;
    const data = updatedEntity.data as any;

    const exercise: Exercise = {
      id: updatedEntity.id,
      name: updatedEntity.name,
      description: data.description as string | undefined,
      muscleGroups: (data.muscleGroups as MuscleGroup[]) || [],
      equipment: (data.equipment as EquipmentType[]) || [],
      difficulty:
        (data.difficulty as "beginner" | "intermediate" | "advanced") ||
        "beginner",
      instructions: data.instructions as string[] | undefined,
      videoUrl: data.videoUrl as string | undefined,
      isCustom: true,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    } as Exercise;

    return { success: true, data: exercise };
  } catch (error) {
    console.error("Failed to update exercise:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete an exercise (soft delete)
 */
export async function deleteExercise(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/workouts");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete exercise:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all exercises
 */
export async function getExercises(): Promise<Exercise[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "exercise",
      false,
    )) as ExerciseEntity[];
    return entities.map((entity) => {
      const data = entity.data as any;
      return {
        id: entity.id,
        name: entity.name,
        description: data.description as string | undefined,
        muscleGroups: (data.muscleGroups as MuscleGroup[]) || [],
        equipment: (data.equipment as EquipmentType[]) || [],
        difficulty:
          (data.difficulty as "beginner" | "intermediate" | "advanced") ||
          "beginner",
        instructions: data.instructions as string[] | undefined,
        videoUrl: data.videoUrl as string | undefined,
        isCustom: true,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      } as Exercise;
    });
  } catch (error) {
    console.error("Failed to get exercises:", error);
    return [];
  }
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "exercise") {
      return null;
    }

    const exerciseEntity = entity as ExerciseEntity;
    const data = exerciseEntity.data as any;
    return {
      id: exerciseEntity.id,
      name: exerciseEntity.name,
      description: data.description as string | undefined,
      muscleGroups: (data.muscleGroups as MuscleGroup[]) || [],
      equipment: (data.equipment as EquipmentType[]) || [],
      difficulty:
        (data.difficulty as "beginner" | "intermediate" | "advanced") ||
        "beginner",
      instructions: data.instructions as string[] | undefined,
      videoUrl: data.videoUrl as string | undefined,
      isCustom: true,
      createdAt: exerciseEntity.createdAt,
      updatedAt: exerciseEntity.updatedAt,
    } as Exercise;
  } catch (error) {
    console.error("Failed to get exercise by ID:", error);
    return null;
  }
}

// ============================================
// Workout Actions
// ============================================

/**
 * Create a new workout
 */
export async function createWorkout(
  input: CreateWorkoutInput,
): Promise<{ success: boolean; data?: Workout; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const dateTimestamp = new Date(input.date).getTime();

    const exercises: WorkoutExercise[] = input.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: "", // Will be populated when fetching
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      targetWeight: ex.targetWeight,
      sets: [],
      notes: ex.notes,
      order: ex.order,
    }));

    const id = await createEntity<WorkoutEntity>({
      type: "workout",
      name: input.name,
      data: {
        date: dateTimestamp,
        duration: input.duration,
        type: input.type,
        exercises,
        notes: input.notes,
        completed: false,
      },
    });

    revalidatePath("/workouts");

    const workout: Workout = {
      id,
      name: input.name,
      date: dateTimestamp,
      duration: input.duration,
      type: input.type,
      exercises,
      notes: input.notes,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: workout };
  } catch (error) {
    console.error("Failed to create workout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing workout
 */
export async function updateWorkout(
  input: UpdateWorkoutInput,
): Promise<{ success: boolean; data?: Workout; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "workout") {
      return { success: false, error: "Workout not found" };
    }

    const workoutEntity = entity as WorkoutEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.rating !== undefined) updateData.rating = input.rating;
    if (input.completed !== undefined) updateData.completed = input.completed;
    if (input.exercises !== undefined) updateData.exercises = input.exercises;

    await updateEntity(input.id, updateData);

    revalidatePath("/workouts");

    const updatedEntity = (await getEntityById(input.id)) as WorkoutEntity;

    const workout: Workout = {
      id: updatedEntity.id,
      name: updatedEntity.name,
      date: updatedEntity.data.date as number,
      duration: updatedEntity.data.duration as number | undefined,
      type: updatedEntity.data.type as Workout["type"],
      exercises: (updatedEntity.data.exercises as WorkoutExercise[]) || [],
      notes: updatedEntity.data.notes as string | undefined,
      rating: updatedEntity.data.rating as number | undefined,
      completed: updatedEntity.data.completed as boolean,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: workout };
  } catch (error) {
    console.error("Failed to update workout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a workout (soft delete)
 */
export async function deleteWorkout(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/workouts");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete workout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all workouts
 */
export async function getWorkouts(): Promise<Workout[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "workout",
      false,
    )) as WorkoutEntity[];
    return entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      date: entity.data.date as number,
      duration: entity.data.duration as number | undefined,
      type: entity.data.type as Workout["type"],
      exercises: (entity.data.exercises as WorkoutExercise[]) || [],
      notes: entity.data.notes as string | undefined,
      rating: entity.data.rating as number | undefined,
      completed: entity.data.completed as boolean,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to get workouts:", error);
    return [];
  }
}

/**
 * Get workouts by date range
 */
export async function getWorkoutsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Workout[]> {
  "use server";
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const entities = (await getEntitiesByType(
      "workout",
      false,
    )) as WorkoutEntity[];

    return entities
      .filter((entity) => {
        const workoutDate = entity.data.date as number;
        return workoutDate >= start && workoutDate <= end;
      })
      .map((entity) => ({
        id: entity.id,
        name: entity.name,
        date: entity.data.date as number,
        duration: entity.data.duration as number | undefined,
        type: entity.data.type as Workout["type"],
        exercises: (entity.data.exercises as WorkoutExercise[]) || [],
        notes: entity.data.notes as string | undefined,
        rating: entity.data.rating as number | undefined,
        completed: entity.data.completed as boolean,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }));
  } catch (error) {
    console.error("Failed to get workouts by date range:", error);
    return [];
  }
}

/**
 * Get workout by ID
 */
export async function getWorkoutById(id: string): Promise<Workout | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "workout") {
      return null;
    }

    const workoutEntity = entity as WorkoutEntity;
    return {
      id: workoutEntity.id,
      name: workoutEntity.name,
      date: workoutEntity.data.date as number,
      duration: workoutEntity.data.duration as number | undefined,
      type: workoutEntity.data.type as Workout["type"],
      exercises: (workoutEntity.data.exercises as WorkoutExercise[]) || [],
      notes: workoutEntity.data.notes as string | undefined,
      rating: workoutEntity.data.rating as number | undefined,
      completed: workoutEntity.data.completed as boolean,
      createdAt: workoutEntity.createdAt,
      updatedAt: workoutEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get workout by ID:", error);
    return null;
  }
}

/**
 * Update workout set (add/edit set)
 */
export async function updateWorkoutSet(
  workoutId: string,
  exerciseIndex: number,
  setIndex: number,
  set: WorkoutSet,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(workoutId);
    if (!entity || entity.type !== "workout") {
      return { success: false, error: "Workout not found" };
    }

    const workoutEntity = entity as WorkoutEntity;
    const exercises = (workoutEntity.data.exercises as WorkoutExercise[]) || [];

    if (!exercises[exerciseIndex]) {
      return { success: false, error: "Exercise not found" };
    }

    exercises[exerciseIndex].sets[setIndex] = set;

    await updateEntity(workoutId, { exercises });

    revalidatePath("/workouts");

    return { success: true };
  } catch (error) {
    console.error("Failed to update workout set:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Complete a workout
 */
export async function completeWorkout(
  id: string,
  rating?: number,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await updateEntity(id, { completed: true, rating });
    revalidatePath("/workouts");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete workout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
