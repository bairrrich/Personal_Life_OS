// Workouts Module Types

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "quads"
  | "hamstrings"
  | "calves"
  | "abs"
  | "forearms"
  | "traps"
  | "lats"
  | "full_body";

export type EquipmentType =
  | "bodyweight"
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "cable"
  | "resistance_band"
  | "pull_up_bar"
  | "bench"
  | "other";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type WorkoutType =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "power"
  | "hiit"
  | "cardio";

// ============================================
// Exercise
// ============================================

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  instructions?: string[];
  videoUrl?: string;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateExerciseInput {
  name: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  instructions?: string[];
  videoUrl?: string;
}

export interface UpdateExerciseInput {
  id: string;
  name?: string;
  description?: string;
  muscleGroups?: MuscleGroup[];
  equipment?: EquipmentType[];
  difficulty?: DifficultyLevel;
  instructions?: string[];
  videoUrl?: string;
}

// ============================================
// Workout Set
// ============================================

export interface WorkoutSet {
  setNumber: number;
  weight: number; // in kg
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
  restTime?: number; // in seconds
}

// ============================================
// Workout Exercise (instance in a workout)
// ============================================

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps?: number;
  targetWeight?: number;
  sets: WorkoutSet[];
  notes?: string;
  order: number;
}

// ============================================
// Workout Session
// ============================================

export interface Workout {
  id: string;
  name: string;
  date: number; // timestamp
  duration?: number; // in minutes
  type: WorkoutType;
  exercises: WorkoutExercise[];
  notes?: string;
  rating?: number; // 1-10
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWorkoutInput {
  name: string;
  date: string; // ISO date string
  duration?: number;
  type: WorkoutType;
  exercises: Array<{
    exerciseId: string;
    targetSets: number;
    targetReps?: number;
    targetWeight?: number;
    notes?: string;
    order: number;
  }>;
  notes?: string;
}

export interface UpdateWorkoutInput {
  id: string;
  name?: string;
  duration?: number;
  type?: WorkoutType;
  exercises?: Array<{
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps?: number;
    targetWeight?: number;
    sets: WorkoutSet[];
    notes?: string;
    order: number;
  }>;
  notes?: string;
  rating?: number;
  completed?: boolean;
}

// ============================================
// Workout Program / Template
// ============================================

export interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  durationWeeks?: number;
  daysPerWeek: number;
  workouts: ProgramWorkout[];
  createdAt: number;
  updatedAt: number;
}

export interface ProgramWorkout {
  day: number; // 1-7 (day of week)
  name: string;
  focus: MuscleGroup[];
  exercises: ProgramExercise[];
}

export interface ProgramExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string; // e.g., "8-12", "5", "AMRAP"
  restSeconds?: number;
  notes?: string;
  order: number;
}

export interface CreateProgramInput {
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  durationWeeks?: number;
  daysPerWeek: number;
  workouts: ProgramWorkout[];
}

// ============================================
// Statistics & Analytics
// ============================================

export interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number; // total weight lifted
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  averageDuration: number;
  favoriteExercises: Array<{
    exerciseId: string;
    exerciseName: string;
    count: number;
  }>;
  muscleGroupDistribution: Record<MuscleGroup, number>;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  history: Array<{
    date: string;
    weight: number;
    reps: number;
    sets: number;
  }>;
  pr: {
    oneRepMax?: number;
    maxWeight?: number;
    maxReps?: number;
  };
}

// ============================================
// Helper Types
// ============================================

export interface WorkoutSummary {
  id: string;
  name: string;
  date: string;
  duration?: number;
  type: WorkoutType;
  exercisesCount: number;
  completed: boolean;
  rating?: number;
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "quads",
  "hamstrings",
  "calves",
  "abs",
  "forearms",
  "traps",
  "lats",
  "full_body",
];

export const EQUIPMENT_TYPES: EquipmentType[] = [
  "bodyweight",
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "cable",
  "resistance_band",
  "pull_up_bar",
  "bench",
  "other",
];

export const WORKOUT_TYPES: WorkoutType[] = [
  "strength",
  "hypertrophy",
  "endurance",
  "power",
  "hiit",
  "cardio",
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];
