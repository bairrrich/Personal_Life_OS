// Finance categories - using i18n keys

export type TransactionType = "income" | "expense" | "transfer";

export interface Category {
  id: string;
  nameKey: string; // i18n key
  type: TransactionType;
  icon: string;
  color: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  nameKey: string; // i18n key
}

export const incomeCategories: Category[] = [
  {
    id: "salary",
    nameKey: "finance.categories.income.salary",
    type: "income",
    icon: "💰",
    color: "green",
    subcategories: [
      { id: "salary_main", nameKey: "finance.categories.income.salary_main" },
      { id: "salary_bonus", nameKey: "finance.categories.income.salary_bonus" },
      {
        id: "salary_overtime",
        nameKey: "finance.categories.income.salary_overtime",
      },
    ],
  },
  {
    id: "freelance",
    nameKey: "finance.categories.income.freelance",
    type: "income",
    icon: "💻",
    color: "blue",
    subcategories: [
      {
        id: "freelance_project",
        nameKey: "finance.categories.income.freelance_project",
      },
      {
        id: "freelance_consulting",
        nameKey: "finance.categories.income.freelance_consulting",
      },
    ],
  },
  {
    id: "investments",
    nameKey: "finance.categories.income.investments",
    type: "income",
    icon: "📈",
    color: "purple",
    subcategories: [
      {
        id: "invest_dividends",
        nameKey: "finance.categories.income.investments_dividends",
      },
      {
        id: "invest_interest",
        nameKey: "finance.categories.income.investments_interest",
      },
      {
        id: "invest_capital_gains",
        nameKey: "finance.categories.income.investments_capitalGains",
      },
    ],
  },
  {
    id: "gifts",
    nameKey: "finance.categories.income.gifts",
    type: "income",
    icon: "🎁",
    color: "pink",
  },
  {
    id: "other_income",
    nameKey: "finance.categories.income.other",
    type: "income",
    icon: "💵",
    color: "gray",
  },
];

export const expenseCategories: Category[] = [
  {
    id: "food",
    nameKey: "finance.categories.expense.food",
    type: "expense",
    icon: "🍔",
    color: "orange",
    subcategories: [
      {
        id: "food_groceries",
        nameKey: "finance.categories.expense.food_groceries",
      },
      {
        id: "food_restaurants",
        nameKey: "finance.categories.expense.food_restaurants",
      },
      {
        id: "food_delivery",
        nameKey: "finance.categories.expense.food_delivery",
      },
      { id: "food_coffee", nameKey: "finance.categories.expense.food_coffee" },
    ],
  },
  {
    id: "transport",
    nameKey: "finance.categories.expense.transport",
    type: "expense",
    icon: "🚗",
    color: "blue",
    subcategories: [
      {
        id: "transport_fuel",
        nameKey: "finance.categories.expense.transport_fuel",
      },
      {
        id: "transport_public",
        nameKey: "finance.categories.expense.transport_public",
      },
      {
        id: "transport_taxi",
        nameKey: "finance.categories.expense.transport_taxi",
      },
      {
        id: "transport_parking",
        nameKey: "finance.categories.expense.transport_parking",
      },
      {
        id: "transport_maintenance",
        nameKey: "finance.categories.expense.transport_maintenance",
      },
    ],
  },
  {
    id: "utilities",
    nameKey: "finance.categories.expense.utilities",
    type: "expense",
    icon: "💡",
    color: "yellow",
    subcategories: [
      {
        id: "utilities_electricity",
        nameKey: "finance.categories.expense.utilities_electricity",
      },
      {
        id: "utilities_water",
        nameKey: "finance.categories.expense.utilities_water",
      },
      {
        id: "utilities_gas",
        nameKey: "finance.categories.expense.utilities_gas",
      },
      {
        id: "utilities_internet",
        nameKey: "finance.categories.expense.utilities_internet",
      },
      {
        id: "utilities_phone",
        nameKey: "finance.categories.expense.utilities_phone",
      },
    ],
  },
  {
    id: "entertainment",
    nameKey: "finance.categories.expense.entertainment",
    type: "expense",
    icon: "🎬",
    color: "purple",
    subcategories: [
      {
        id: "entertainment_movies",
        nameKey: "finance.categories.expense.entertainment_movies",
      },
      {
        id: "entertainment_games",
        nameKey: "finance.categories.expense.entertainment_games",
      },
      {
        id: "entertainment_events",
        nameKey: "finance.categories.expense.entertainment_events",
      },
    ],
  },
  {
    id: "shopping",
    nameKey: "finance.categories.expense.shopping",
    type: "expense",
    icon: "🛍️",
    color: "pink",
    subcategories: [
      {
        id: "shopping_clothes",
        nameKey: "finance.categories.expense.shopping_clothes",
      },
      {
        id: "shopping_electronics",
        nameKey: "finance.categories.expense.shopping_electronics",
      },
      {
        id: "shopping_home",
        nameKey: "finance.categories.expense.shopping_home",
      },
    ],
  },
  {
    id: "health",
    nameKey: "finance.categories.expense.health",
    type: "expense",
    icon: "🏥",
    color: "red",
    subcategories: [
      {
        id: "health_doctor",
        nameKey: "finance.categories.expense.health_doctor",
      },
      {
        id: "health_medicine",
        nameKey: "finance.categories.expense.health_medicine",
      },
      {
        id: "health_sports",
        nameKey: "finance.categories.expense.health_sports",
      },
    ],
  },
  {
    id: "education",
    nameKey: "finance.categories.expense.education",
    type: "expense",
    icon: "📚",
    color: "indigo",
    subcategories: [
      {
        id: "education_courses",
        nameKey: "finance.categories.expense.education_courses",
      },
      {
        id: "education_books",
        nameKey: "finance.categories.expense.education_books",
      },
      {
        id: "education_tuition",
        nameKey: "finance.categories.expense.education_tuition",
      },
    ],
  },
  {
    id: "subscriptions",
    nameKey: "finance.categories.expense.subscriptions",
    type: "expense",
    icon: "📱",
    color: "cyan",
    subcategories: [
      {
        id: "subscriptions_streaming",
        nameKey: "finance.categories.expense.subscriptions_streaming",
      },
      {
        id: "subscriptions_software",
        nameKey: "finance.categories.expense.subscriptions_software",
      },
      {
        id: "subscriptions_gym",
        nameKey: "finance.categories.expense.subscriptions_gym",
      },
    ],
  },
  {
    id: "other_expense",
    nameKey: "finance.categories.expense.other",
    type: "expense",
    icon: "📝",
    color: "gray",
  },
];

export function getCategoriesByType(type: TransactionType): Category[] {
  if (type === "income") return incomeCategories;
  if (type === "expense") return expenseCategories;
  return [];
}

export function getCategoryById(id: string): Category | undefined {
  return [...incomeCategories, ...expenseCategories].find((c) => c.id === id);
}

export function getSubcategories(
  categoryId: string,
): { id: string; nameKey: string }[] {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
}
