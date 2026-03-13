"use server";

import { getEntitiesByType } from "@/entity-engine/engine";
import type {
  TransactionEntity,
  CategoryEntity,
  BudgetEntity,
  MealEntity,
  WorkoutEntity,
  BookEntity,
  ReadingGoalEntity,
} from "@/entity-engine/types";
import type {
  FinanceAnalytics,
  NutritionAnalytics,
  WorkoutsAnalytics,
  BooksAnalytics,
  AnalyticsFilters,
} from "./types";

/**
 * =====================
 * FINANCE ANALYTICS
 * =====================
 */

export async function getFinanceAnalytics(
  filters?: AnalyticsFilters,
): Promise<FinanceAnalytics> {
  "use server";

  const transactions = (await getEntitiesByType(
    "transaction",
    false,
  )) as TransactionEntity[];
  const categories = (await getEntitiesByType(
    "category",
    false,
  )) as CategoryEntity[];
  const budgets = (await getEntitiesByType("budget", false)) as BudgetEntity[];

  // Filter by date range
  let filteredTransactions = transactions;
  if (filters?.startDate || filters?.endDate) {
    const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
    const end = filters.endDate
      ? new Date(filters.endDate).getTime()
      : Date.now();
    filteredTransactions = transactions.filter((t) => {
      const date = t.data.date as number;
      return date >= start && date <= end;
    });
  }

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.data.transactionType === "income")
    .reduce((sum, t) => sum + (t.data.amount as number), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.data.transactionType === "expense")
    .reduce((sum, t) => sum + (t.data.amount as number), 0);

  const netBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const expensesByCategoryMap = new Map<string, number>();
  const incomeByCategoryMap = new Map<string, number>();

  filteredTransactions.forEach((t) => {
    const categoryId = t.data.categoryId as string | undefined;
    const amount = t.data.amount as number;
    const type = t.data.transactionType as string;

    if (categoryId) {
      if (type === "expense") {
        expensesByCategoryMap.set(
          categoryId,
          (expensesByCategoryMap.get(categoryId) || 0) + amount,
        );
      } else {
        incomeByCategoryMap.set(
          categoryId,
          (incomeByCategoryMap.get(categoryId) || 0) + amount,
        );
      }
    }
  });

  const expensesByCategory = Array.from(expensesByCategoryMap.entries())
    .map(([categoryId, amount]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        categoryName: category?.name || "Unknown",
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: category?.data.color as string | undefined,
        icon: category?.data.icon as string | undefined,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const incomeByCategory = Array.from(incomeByCategoryMap.entries())
    .map(([categoryId, amount]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        categoryName: category?.name || "Unknown",
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
        color: category?.data.color as string | undefined,
        icon: category?.data.icon as string | undefined,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Time series (last 30 days)
  const timeSeries: FinanceAnalytics["timeSeries"] = [];
  const now = Date.now();
  const daysToShow =
    filters?.period === "week" ? 7 : filters?.period === "year" ? 12 : 30;
  const dayMs = 86400000;

  for (let i = daysToShow - 1; i >= 0; i--) {
    const dayStart = now - i * dayMs;
    const dayEnd = dayStart + dayMs;

    const dayTransactions = filteredTransactions.filter((t) => {
      const date = t.data.date as number;
      return date >= dayStart && date < dayEnd;
    });

    const income = dayTransactions
      .filter((t) => t.data.transactionType === "income")
      .reduce((sum, t) => sum + (t.data.amount as number), 0);

    const expenses = dayTransactions
      .filter((t) => t.data.transactionType === "expense")
      .reduce((sum, t) => sum + (t.data.amount as number), 0);

    timeSeries.push({
      date: new Date(dayStart).toISOString().split("T")[0],
      income,
      expenses,
      balance: income - expenses,
    });
  }

  // Top expenses
  const topExpenses = filteredTransactions
    .filter((t) => t.data.transactionType === "expense")
    .sort((a, b) => (b.data.amount as number) - (a.data.amount as number))
    .slice(0, 5)
    .map((t) => ({
      description: t.name,
      amount: t.data.amount as number,
      date: t.data.date as number,
      category: categoryMap.get(t.data.categoryId as string)?.name,
    }));

  // Monthly average
  const months = new Set(
    filteredTransactions.map((t) => {
      const date = new Date(t.data.date as number);
      return `${date.getFullYear()}-${date.getMonth()}`;
    }),
  );
  const monthCount = months.size || 1;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate: Math.round(savingsRate * 100) / 100,
    timeSeries,
    incomeByCategory,
    expensesByCategory,
    topExpenses,
    monthlyAverage: {
      income: Math.round((totalIncome / monthCount) * 100) / 100,
      expenses: Math.round((totalExpenses / monthCount) * 100) / 100,
    },
    budgetProgress: budgets.map((b) => {
      const spent = expensesByCategoryMap.get(b.data.categoryId as string) || 0;
      const budget = b.data.amount as number;
      return {
        categoryId: b.data.categoryId as string,
        categoryName:
          categoryMap.get(b.data.categoryId as string)?.name || "Unknown",
        budget,
        spent,
        percentage: budget > 0 ? (spent / budget) * 100 : 0,
      };
    }),
  };
}

/**
 * =====================
 * NUTRITION ANALYTICS
 * =====================
 */

export async function getNutritionAnalytics(
  filters?: AnalyticsFilters,
): Promise<NutritionAnalytics> {
  "use server";

  const meals = (await getEntitiesByType("meal", false)) as MealEntity[];

  // Filter by date range
  let filteredMeals = meals;
  if (filters?.startDate || filters?.endDate) {
    const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
    const end = filters.endDate
      ? new Date(filters.endDate).getTime()
      : Date.now();
    filteredMeals = meals.filter((m) => {
      const date = m.data.date as number;
      return date >= start && date <= end;
    });
  }

  // Calculate daily totals
  const dailyTotals = new Map<
    string,
    {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      water: number;
      calorieGoal: number;
    }
  >();

  filteredMeals.forEach((meal) => {
    const date = new Date(meal.data.date as number).toISOString().split("T")[0];
    const totalMacros = meal.data.totalMacros as
      | {
          calories: number;
          protein: number;
          fat: number;
          carbs: number;
        }
      | undefined;

    if (!dailyTotals.has(date)) {
      dailyTotals.set(date, {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        water: 0,
        calorieGoal: 2000,
      });
    }

    const day = dailyTotals.get(date)!;
    if (totalMacros) {
      day.calories += totalMacros.calories;
      day.protein += totalMacros.protein;
      day.fat += totalMacros.fat;
      day.carbs += totalMacros.carbs;
    }
  });

  // Time series
  const timeSeries: NutritionAnalytics["timeSeries"] = [];
  const daysToShow =
    filters?.period === "week" ? 7 : filters?.period === "year" ? 12 : 30;
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = daysToShow - 1; i >= 0; i--) {
    const dayStart = now - i * dayMs;
    const date = new Date(dayStart).toISOString().split("T")[0];
    const day = dailyTotals.get(date) || {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      water: 0,
      calorieGoal: 2000,
    };

    timeSeries.push({
      date,
      calories: day.calories,
      protein: day.protein,
      fat: day.fat,
      carbs: day.carbs,
      water: day.water,
      calorieGoal: day.calorieGoal,
    });
  }

  // Averages
  const daysCount = timeSeries.length || 1;
  const totalCalories = timeSeries.reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = timeSeries.reduce((sum, d) => sum + d.protein, 0);
  const totalFat = timeSeries.reduce((sum, d) => sum + d.fat, 0);
  const totalCarbs = timeSeries.reduce((sum, d) => sum + d.carbs, 0);
  const totalWater = timeSeries.reduce((sum, d) => sum + d.water, 0);

  // Macro distribution (calories: protein=4cal/g, fat=9cal/g, carbs=4cal/g)
  const proteinCals = totalProtein * 4;
  const fatCals = totalFat * 9;
  const carbsCals = totalCarbs * 4;
  const totalMacroCals = proteinCals + fatCals + carbsCals || 1;

  // Daily compliance (days within ±10% of calorie goal)
  const compliantDays = timeSeries.filter((d) => {
    const diff = Math.abs(d.calories - d.calorieGoal) / d.calorieGoal;
    return diff <= 0.1;
  }).length;

  // Meal frequency
  const mealFrequency = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  filteredMeals.forEach((meal) => {
    const mealType = meal.data.mealType as string;
    if (mealFrequency[mealType as keyof typeof mealFrequency] !== undefined) {
      mealFrequency[mealType as keyof typeof mealFrequency]++;
    }
  });

  return {
    averageCalories: Math.round(totalCalories / daysCount),
    averageProtein: Math.round((totalProtein / daysCount) * 10) / 10,
    averageFat: Math.round((totalFat / daysCount) * 10) / 10,
    averageCarbs: Math.round((totalCarbs / daysCount) * 10) / 10,
    averageWater: Math.round(totalWater / daysCount),
    calorieGoalAverage: 2000,
    timeSeries,
    macroDistribution: {
      protein: Math.round(totalProtein / daysCount),
      fat: Math.round(totalFat / daysCount),
      carbs: Math.round(totalCarbs / daysCount),
      proteinPercentage: Math.round((proteinCals / totalMacroCals) * 100),
      fatPercentage: Math.round((fatCals / totalMacroCals) * 100),
      carbsPercentage: Math.round((carbsCals / totalMacroCals) * 100),
    },
    dailyCompliance: Math.round((compliantDays / daysCount) * 100),
    weeklyAverage: {
      calories: Math.round(totalCalories / 7),
      protein: Math.round((totalProtein / 7) * 10) / 10,
      fat: Math.round((totalFat / 7) * 10) / 10,
      carbs: Math.round((totalCarbs / 7) * 10) / 10,
    },
    mealFrequency,
  };
}

/**
 * =====================
 * WORKOUTS ANALYTICS
 * =====================
 */

export async function getWorkoutsAnalytics(
  filters?: AnalyticsFilters,
): Promise<WorkoutsAnalytics> {
  "use server";

  const workouts = (await getEntitiesByType(
    "workout",
    false,
  )) as WorkoutEntity[];

  // Filter by date range
  let filteredWorkouts = workouts;
  if (filters?.startDate || filters?.endDate) {
    const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
    const end = filters.endDate
      ? new Date(filters.endDate).getTime()
      : Date.now();
    filteredWorkouts = workouts.filter((w) => {
      const date = w.data.date as number;
      return date >= start && date <= end;
    });
  }

  // Calculate totals
  const totalWorkouts = filteredWorkouts.length;
  const totalDuration = filteredWorkouts.reduce(
    (sum, w) => sum + (w.data.duration || 0),
    0,
  );
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

  // Calculate total volume (weight × reps × sets)
  let totalVolume = 0;
  const muscleGroupMap = new Map<
    string,
    { workouts: number; volume: number; exercises: number }
  >();
  const exerciseMap = new Map<string, { count: number; volume: number }>();
  const workoutsByTypeMap = new Map<string, number>();

  filteredWorkouts.forEach((workout) => {
    const workoutType = workout.data.type as string;
    workoutsByTypeMap.set(
      workoutType,
      (workoutsByTypeMap.get(workoutType) || 0) + 1,
    );

    const exercises = workout.data.exercises as
      | Array<{
          exerciseName: string;
          sets: Array<{ weight: number; reps: number; completed: boolean }>;
        }>
      | undefined;

    if (exercises) {
      exercises.forEach((exercise) => {
        const exerciseVolume = exercise.sets
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + s.weight * s.reps, 0);

        totalVolume += exerciseVolume;

        // Track by exercise name
        const name = exercise.exerciseName;
        exerciseMap.set(name, {
          count: (exerciseMap.get(name)?.count || 0) + 1,
          volume: (exerciseMap.get(name)?.volume || 0) + exerciseVolume,
        });
      });
    }
  });

  // Time series
  const timeSeries: WorkoutsAnalytics["timeSeries"] = [];
  const daysToShow =
    filters?.period === "week" ? 7 : filters?.period === "year" ? 12 : 30;
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = daysToShow - 1; i >= 0; i--) {
    const dayStart = now - i * dayMs;
    const dayEnd = dayStart + dayMs;
    const date = new Date(dayStart).toISOString().split("T")[0];

    const dayWorkouts = filteredWorkouts.filter((w) => {
      const workoutDate = w.data.date as number;
      return workoutDate >= dayStart && workoutDate < dayEnd;
    });

    const dayVolume = dayWorkouts.reduce((sum, w) => {
      const exercises = w.data.exercises as
        | Array<{
            sets: Array<{ weight: number; reps: number; completed: boolean }>;
          }>
        | undefined;

      if (!exercises) return sum;

      return (
        sum +
        exercises.reduce((exerciseSum, ex) => {
          return (
            exerciseSum +
            ex.sets
              .filter((s) => s.completed)
              .reduce((setSum, s) => setSum + s.weight * s.reps, 0)
          );
        }, 0)
      );
    }, 0);

    const dayDuration = dayWorkouts.reduce(
      (sum, w) => sum + (w.data.duration || 0),
      0,
    );

    timeSeries.push({
      date,
      workouts: dayWorkouts.length,
      duration: dayDuration,
      volume: dayVolume,
    });
  }

  // Workouts by type
  const workoutsByType = Array.from(workoutsByTypeMap.entries()).map(
    ([type, count]) => ({
      type,
      count,
      percentage: totalWorkouts > 0 ? (count / totalWorkouts) * 100 : 0,
    }),
  );

  // Top exercises
  const topExercises = Array.from(exerciseMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      totalVolume: data.volume,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Weekly frequency
  const weeks = new Set(
    filteredWorkouts.map((w) => {
      const date = new Date(w.data.date as number);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      return weekStart.toISOString();
    }),
  );
  const weeklyFrequency = totalWorkouts / (weeks.size || 1);

  // Streak calculation
  const sortedDates = filteredWorkouts
    .map((w) => new Date(w.data.date as number).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  sortedDates.forEach((dateStr) => {
    const date = new Date(dateStr);
    if (!lastDate) {
      currentStreak = 1;
      tempStreak = 1;
    } else {
      const diffDays = Math.round(
        (lastDate.getTime() - date.getTime()) / 86400000,
      );
      if (diffDays <= 1) {
        tempStreak++;
        currentStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = date;
  });

  return {
    totalWorkouts,
    totalDuration,
    averageDuration: Math.round(averageDuration),
    totalVolume,
    workoutsByType,
    timeSeries,
    muscleGroupDistribution: Array.from(muscleGroupMap.entries()).map(
      ([group, data]) => ({
        muscleGroup: group,
        workouts: data.workouts,
        volume: data.volume,
        exercises: data.exercises,
      }),
    ),
    weeklyFrequency: Math.round(weeklyFrequency * 10) / 10,
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
    topExercises,
    personalRecords: [], // Would need more complex calculation
  };
}

/**
 * =====================
 * BOOKS ANALYTICS
 * =====================
 */

export async function getBooksAnalytics(
  filters?: AnalyticsFilters,
): Promise<BooksAnalytics> {
  "use server";

  const books = (await getEntitiesByType("book", false)) as BookEntity[];
  const readingGoals = (await getEntitiesByType(
    "readingGoal",
    false,
  )) as ReadingGoalEntity[];

  // Get current year's reading goal
  const currentYear = new Date().getFullYear();
  const currentGoal = readingGoals.find((g) => g.data.year === currentYear);

  // Calculate totals by status
  const booksRead = books.filter((b) => b.data.status === "completed").length;
  const booksReading = books.filter((b) => b.data.status === "reading").length;
  const booksWantToRead = books.filter(
    (b) => b.data.status === "want_to_read",
  ).length;

  // Average rating
  const ratedBooks = books.filter((b) => b.data.rating !== undefined);
  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.data.rating as number), 0) /
        ratedBooks.length
      : 0;

  // Total pages read
  const totalPagesRead = books
    .filter((b) => b.data.status === "completed" && b.data.pages !== undefined)
    .reduce((sum, b) => sum + (b.data.pages as number), 0);

  // Books by genre
  const genreMap = new Map<string, number>();
  books.forEach((book) => {
    const genre = book.data.genre as string;
    genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
  });

  const booksByGenre = Array.from(genreMap.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: books.length > 0 ? (count / books.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Books by format
  const formatMap = new Map<string, number>();
  books.forEach((book) => {
    const format = book.data.format as string;
    formatMap.set(format, (formatMap.get(format) || 0) + 1);
  });

  const booksByFormat = Array.from(formatMap.entries()).map(
    ([format, count]) => ({
      format,
      count,
      percentage: books.length > 0 ? (count / books.length) * 100 : 0,
    }),
  );

  // Books by status
  const statusMap = new Map<string, number>();
  books.forEach((book) => {
    const status = book.data.status as string;
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const booksByStatus = Array.from(statusMap.entries()).map(
    ([status, count]) => ({
      status,
      count,
      percentage: books.length > 0 ? (count / books.length) * 100 : 0,
    }),
  );

  // Reading goal progress
  const completedThisYear = books.filter((b) => {
    if (b.data.status !== "completed" || !b.data.dateCompleted) return false;
    return (
      new Date(b.data.dateCompleted as number).getFullYear() === currentYear
    );
  }).length;

  const readingGoalProgress = currentGoal
    ? {
        target: currentGoal.data.targetBooks as number,
        completed: completedThisYear,
        percentage: Math.round(
          (completedThisYear / currentGoal.data.targetBooks) * 100,
        ),
        onTrack:
          completedThisYear >=
          (currentGoal.data.targetBooks / 12) * (new Date().getMonth() + 1),
      }
    : {
        target: 0,
        completed: completedThisYear,
        percentage: 0,
        onTrack: true,
      };

  // Top authors
  const authorMap = new Map<
    string,
    { books: number; totalRating: number; ratedCount: number }
  >();
  books
    .filter((b) => b.data.status === "completed")
    .forEach((book) => {
      const author = book.data.author as string;
      const existing = authorMap.get(author) || {
        books: 0,
        totalRating: 0,
        ratedCount: 0,
      };
      existing.books++;
      if (book.data.rating) {
        existing.totalRating += book.data.rating as number;
        existing.ratedCount++;
      }
      authorMap.set(author, existing);
    });

  const topAuthors = Array.from(authorMap.entries())
    .map(([name, data]) => ({
      name,
      booksRead: data.books,
      averageRating:
        data.ratedCount > 0
          ? Math.round((data.totalRating / data.ratedCount) * 10) / 10
          : 0,
    }))
    .sort((a, b) => b.booksRead - a.booksRead)
    .slice(0, 10);

  // Time series (monthly)
  const timeSeries: BooksAnalytics["timeSeries"] = [];
  const monthsToShow =
    filters?.period === "week" ? 4 : filters?.period === "year" ? 12 : 6;
  const now = new Date();

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7);

    const completedBooks = books.filter((b) => {
      if (b.data.status !== "completed" || !b.data.dateCompleted) return false;
      const completedDate = new Date(b.data.dateCompleted as number);
      return (
        completedDate.getFullYear() === date.getFullYear() &&
        completedDate.getMonth() === date.getMonth()
      );
    }).length;

    const pagesRead = books
      .filter((b) => {
        if (
          b.data.status !== "completed" ||
          !b.data.dateCompleted ||
          !b.data.pages
        )
          return false;
        const completedDate = new Date(b.data.dateCompleted as number);
        return (
          completedDate.getFullYear() === date.getFullYear() &&
          completedDate.getMonth() === date.getMonth()
        );
      })
      .reduce((sum, b) => sum + (b.data.pages as number), 0);

    timeSeries.push({
      date: monthKey,
      booksCompleted: completedBooks,
      pagesRead,
    });
  }

  return {
    totalBooks: books.length,
    booksRead,
    booksReading,
    booksWantToRead,
    averageRating: Math.round(averageRating * 10) / 10,
    totalPagesRead,
    timeSeries,
    booksByGenre,
    booksByFormat,
    booksByStatus,
    readingGoalProgress,
    topAuthors,
    monthlyReading: Math.round(
      timeSeries.reduce((sum, m) => sum + m.booksCompleted, 0) / monthsToShow,
    ),
  };
}
