// Analytics Module Types

// ====================
// FINANCE ANALYTICS
// ====================

export interface FinanceTimeData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
}

export interface FinanceAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  timeSeries: FinanceTimeData[];
  incomeByCategory: CategoryBreakdown[];
  expensesByCategory: CategoryBreakdown[];
  topExpenses: Array<{
    description: string;
    amount: number;
    date: number;
    category?: string;
  }>;
  monthlyAverage: {
    income: number;
    expenses: number;
  };
  budgetProgress: Array<{
    categoryId: string;
    categoryName: string;
    budget: number;
    spent: number;
    percentage: number;
  }>;
}

// ====================
// NUTRITION ANALYTICS
// ====================

export interface NutritionTimeData {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number;
  calorieGoal: number;
}

export interface MacroDistribution {
  protein: number;
  fat: number;
  carbs: number;
  proteinPercentage: number;
  fatPercentage: number;
  carbsPercentage: number;
}

export interface NutritionAnalytics {
  averageCalories: number;
  averageProtein: number;
  averageFat: number;
  averageCarbs: number;
  averageWater: number;
  calorieGoalAverage: number;
  timeSeries: NutritionTimeData[];
  macroDistribution: MacroDistribution;
  dailyCompliance: number; // Percentage of days within calorie goal
  weeklyAverage: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  mealFrequency: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
}

// ====================
// WORKOUTS ANALYTICS
// ====================

export interface WorkoutTimeData {
  date: string;
  workouts: number;
  duration: number;
  volume: number;
}

export interface MuscleGroupData {
  muscleGroup: string;
  workouts: number;
  volume: number;
  exercises: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  data: Array<{
    date: number;
    weight: number;
    reps: number;
    sets: number;
  }>;
  pr: {
    weight: number;
    reps: number;
    date: number;
  };
}

export interface WorkoutsAnalytics {
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  totalVolume: number;
  workoutsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  timeSeries: WorkoutTimeData[];
  muscleGroupDistribution: MuscleGroupData[];
  weeklyFrequency: number;
  streak: {
    current: number;
    longest: number;
  };
  topExercises: Array<{
    name: string;
    count: number;
    totalVolume: number;
  }>;
  personalRecords: ExerciseProgress[];
}

// ====================
// BOOKS ANALYTICS
// ====================

export interface BooksTimeData {
  date: string;
  booksCompleted: number;
  pagesRead: number;
}

export interface BooksAnalytics {
  totalBooks: number;
  booksRead: number;
  booksReading: number;
  booksWantToRead: number;
  averageRating: number;
  totalPagesRead: number;
  timeSeries: BooksTimeData[];
  booksByGenre: Array<{
    genre: string;
    count: number;
    percentage: number;
  }>;
  booksByFormat: Array<{
    format: string;
    count: number;
    percentage: number;
  }>;
  booksByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  readingGoalProgress: {
    target: number;
    completed: number;
    percentage: number;
    onTrack: boolean;
  };
  topAuthors: Array<{
    name: string;
    booksRead: number;
    averageRating: number;
  }>;
  monthlyReading: number;
}

// ====================
// OVERALL ANALYTICS
// ====================

export interface OverallAnalytics {
  finance: FinanceAnalytics;
  nutrition: NutritionAnalytics;
  workouts: WorkoutsAnalytics;
  books: BooksAnalytics;
}

export type AnalyticsPeriod = "week" | "month" | "year" | "all";

export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

// ====================
// CHART DATA TYPES
// ====================

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  icon?: string;
}

export interface LineChartData {
  name: string;
  data: ChartDataPoint[];
  color: string;
}

export interface BarChartData {
  name: string;
  data: ChartDataPoint[];
  color: string;
}
