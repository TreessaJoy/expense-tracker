import { Expense, Category } from './types';

// Helper to get formatted date string: YYYY-MM-DD
export function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Dynamically generate default expenses in the current month
export function getInitialExpenses(): Expense[] {
  const today = new Date();
  
  const getRelativeDateStr = (daysAgo: number): string => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return getFormattedDate(d);
  };

  return [
    {
      id: 'mock-1',
      title: 'Groceries at Supermarket',
      amount: 2450,
      category: 'Food',
      date: getRelativeDateStr(2),
      note: 'Weekly essentials, fruits, and dairy products.',
    },
    {
      id: 'mock-2',
      title: 'Monthly Broadband Connection',
      amount: 999,
      category: 'Bills',
      date: getRelativeDateStr(4),
      note: 'Airtel Fiber monthly high-speed internet plan.',
    },
    {
      id: 'mock-3',
      title: 'Petrol for Scooter',
      amount: 500,
      category: 'Transport',
      date: getRelativeDateStr(1),
      note: 'Full tank refuel.',
    },
    {
      id: 'mock-4',
      title: 'Summer Cotton Shirt',
      amount: 1499,
      category: 'Shopping',
      date: getRelativeDateStr(5),
      note: 'Bought from shopper stop during weekend sale.',
    },
    {
      id: 'mock-5',
      title: 'Movie Tickets & Popcorn',
      amount: 650,
      category: 'Entertainment',
      date: getRelativeDateStr(3),
      note: 'PVR IMAX cinematic experience with friends.',
    },
    {
      id: 'mock-6',
      title: 'Emergency Medical Kit',
      amount: 350,
      category: 'Other',
      date: getRelativeDateStr(8),
      note: 'First-aid box refills and pain relievers.',
    }
  ];
}

// LocalStorage helpers
const LOCAL_STORAGE_KEY = 'personal_expense_tracker_expenses';

export function getStoredExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      // Seed initial data
      const defaultExpenses = getInitialExpenses();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultExpenses));
      return defaultExpenses;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return getInitialExpenses();
  }
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error writing to localStorage', error);
  }
}

// Formatting helpers
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Calculate total spent for a specific calendar month (default to current month)
export function getMonthlyTotals(expenses: Expense[], year: number, month: number) {
  const targetPrefix = `${year}-${String(month).padStart(2, '0')}`;
  
  // Parse the expense's YYYY-MM boundary safely to prevent timezone offset bugs
  const targetExpenses = expenses.filter((exp) => {
    return exp.date.startsWith(targetPrefix);
  });

  const rawTotal = targetExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const total = Math.round((rawTotal + Number.EPSILON) * 100) / 100; // Round to 2 decimal places

  const categoryBreakdown = targetExpenses.reduce((acc, exp) => {
    const rawCategoryVal = (acc[exp.category] || 0) + exp.amount;
    acc[exp.category] = Math.round((rawCategoryVal + Number.EPSILON) * 100) / 100; // Round to 2 decimal places
    return acc;
  }, {} as Record<Category, number>);

  return {
    total,
    categoryBreakdown,
  };
}
