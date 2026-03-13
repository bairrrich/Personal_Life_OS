// Workouts Categories and Constants

import type {
  MuscleGroup,
  EquipmentType,
  WorkoutType,
  DifficultyLevel,
} from "./types";

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string; icon: string }[] =
  [
    { id: "chest", label: "Chest", icon: "💪" },
    { id: "back", label: "Back", icon: "🔙" },
    { id: "shoulders", label: "Shoulders", icon: "🤷" },
    { id: "biceps", label: "Biceps", icon: "💪" },
    { id: "triceps", label: "Triceps", icon: "💪" },
    { id: "legs", label: "Legs", icon: "🦵" },
    { id: "quads", label: "Quads", icon: "🦵" },
    { id: "hamstrings", label: "Hamstrings", icon: "🦵" },
    { id: "calves", label: "Calves", icon: "🦵" },
    { id: "abs", label: "Abs", icon: "🏋️" },
    { id: "forearms", label: "Forearms", icon: "💪" },
    { id: "traps", label: "Traps", icon: "🔙" },
    { id: "lats", label: "Lats", icon: "🔙" },
    { id: "full_body", label: "Full Body", icon: "🏃" },
  ];

export const EQUIPMENT_TYPES: {
  id: EquipmentType;
  label: string;
  icon: string;
}[] = [
  { id: "bodyweight", label: "Bodyweight", icon: "🧍" },
  { id: "barbell", label: "Barbell", icon: "🏋️" },
  { id: "dumbbell", label: "Dumbbell", icon: "🏋️" },
  { id: "kettlebell", label: "Kettlebell", icon: "🏋️" },
  { id: "machine", label: "Machine", icon: "🏢" },
  { id: "cable", label: "Cable", icon: "🔗" },
  { id: "resistance_band", label: "Resistance Band", icon: "🎗️" },
  { id: "pull_up_bar", label: "Pull-up Bar", icon: "🚪" },
  { id: "bench", label: "Bench", icon: "🪑" },
  { id: "other", label: "Other", icon: "🔧" },
];

export const WORKOUT_TYPES: {
  id: WorkoutType;
  label: string;
  description: string;
}[] = [
  {
    id: "strength",
    label: "Strength",
    description: "Focus on building maximum strength",
  },
  {
    id: "hypertrophy",
    label: "Hypertrophy",
    description: "Focus on muscle growth",
  },
  {
    id: "endurance",
    label: "Endurance",
    description: "Focus on muscular endurance",
  },
  { id: "power", label: "Power", description: "Focus on explosive power" },
  {
    id: "hiit",
    label: "HIIT",
    description: "High-intensity interval training",
  },
  { id: "cardio", label: "Cardio", description: "Cardiovascular exercise" },
];

export const DIFFICULTY_LEVELS: {
  id: DifficultyLevel;
  label: string;
  color: string;
}[] = [
  { id: "beginner", label: "Beginner", color: "green" },
  { id: "intermediate", label: "Intermediate", color: "yellow" },
  { id: "advanced", label: "Advanced", color: "red" },
];

// Default exercises database
export interface DefaultExercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  description?: string;
}

export const DEFAULT_EXERCISES: DefaultExercise[] = [
  // Chest
  {
    id: "bench_press",
    name: "Barbell Bench Press",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["barbell", "bench"],
    difficulty: "intermediate",
    description: "Classic compound exercise for chest development",
  },
  {
    id: "push_up",
    name: "Push-up",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    description: "Bodyweight exercise for upper body",
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    muscleGroups: ["chest", "shoulders"],
    equipment: ["dumbbell", "bench"],
    difficulty: "intermediate",
  },
  // Back
  {
    id: "pull_up",
    name: "Pull-up",
    muscleGroups: ["back", "lats", "biceps"],
    equipment: ["pull_up_bar", "bodyweight"],
    difficulty: "intermediate",
    description: "Classic bodyweight exercise for back",
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    muscleGroups: ["back", "lats"],
    equipment: ["barbell"],
    difficulty: "intermediate",
  },
  {
    id: "lat_pull_down",
    name: "Lat Pulldown",
    muscleGroups: ["back", "lats"],
    equipment: ["machine", "cable"],
    difficulty: "beginner",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    muscleGroups: ["back", "legs", "hamstrings"],
    equipment: ["barbell"],
    difficulty: "advanced",
    description: "King of all exercises - full body compound movement",
  },
  // Shoulders
  {
    id: "overhead_press",
    name: "Overhead Press",
    muscleGroups: ["shoulders"],
    equipment: ["barbell"],
    difficulty: "intermediate",
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise",
    muscleGroups: ["shoulders"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
  },
  {
    id: "face_pull",
    name: "Face Pull",
    muscleGroups: ["shoulders", "back"],
    equipment: ["cable"],
    difficulty: "beginner",
  },
  // Legs
  {
    id: "squat",
    name: "Barbell Squat",
    muscleGroups: ["legs", "quads", "hamstrings"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    description: "Fundamental compound exercise for lower body",
  },
  {
    id: "leg_press",
    name: "Leg Press",
    muscleGroups: ["legs", "quads"],
    equipment: ["machine"],
    difficulty: "beginner",
  },
  {
    id: "lunges",
    name: "Lunges",
    muscleGroups: ["legs", "quads", "hamstrings"],
    equipment: ["bodyweight", "dumbbell"],
    difficulty: "beginner",
  },
  {
    id: "leg_curl",
    name: "Leg Curl",
    muscleGroups: ["hamstrings"],
    equipment: ["machine"],
    difficulty: "beginner",
  },
  {
    id: "calf_raise",
    name: "Calf Raise",
    muscleGroups: ["calves"],
    equipment: ["bodyweight", "machine"],
    difficulty: "beginner",
  },
  // Arms
  {
    id: "barbell_curl",
    name: "Barbell Curl",
    muscleGroups: ["biceps"],
    equipment: ["barbell"],
    difficulty: "beginner",
  },
  {
    id: "hammer_curl",
    name: "Hammer Curl",
    muscleGroups: ["biceps", "forearms"],
    equipment: ["dumbbell"],
    difficulty: "beginner",
  },
  {
    id: "tricep_dip",
    name: "Tricep Dip",
    muscleGroups: ["triceps"],
    equipment: ["bodyweight", "bench"],
    difficulty: "intermediate",
  },
  {
    id: "tricep_extension",
    name: "Tricep Extension",
    muscleGroups: ["triceps"],
    equipment: ["dumbbell", "cable"],
    difficulty: "beginner",
  },
  // Core
  {
    id: "plank",
    name: "Plank",
    muscleGroups: ["abs"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
  },
  {
    id: "crunch",
    name: "Crunch",
    muscleGroups: ["abs"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
  },
  {
    id: "russian_twist",
    name: "Russian Twist",
    muscleGroups: ["abs"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
  },
];

export function getDefaultExerciseById(
  id: string,
): DefaultExercise | undefined {
  return DEFAULT_EXERCISES.find((ex) => ex.id === id);
}

export function getDefaultExercisesByMuscleGroup(
  muscleGroup: MuscleGroup,
): DefaultExercise[] {
  return DEFAULT_EXERCISES.filter((ex) =>
    ex.muscleGroups.includes(muscleGroup),
  );
}

export function getDefaultExercisesByEquipment(
  equipment: EquipmentType,
): DefaultExercise[] {
  return DEFAULT_EXERCISES.filter((ex) => ex.equipment.includes(equipment));
}
