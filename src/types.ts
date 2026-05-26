export type Category = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Other';

export interface Expense {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type FilterCategory = 'All' | Category;

export interface Filters {
  category: FilterCategory;
  fromDate: string;
  toDate: string;
  searchQuery: string;
}

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other'
];

export const CATEGORY_STYLES: Record<
  Category,
  {
    bg: string;
    text: string;
    border: string;
    indicator: string;
    iconColor: string;
  }
> = {
  Food: {
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    indicator: 'bg-emerald-500',
    iconColor: 'stroke-emerald-600',
  },
  Transport: {
    bg: 'bg-blue-50/70',
    text: 'text-blue-700',
    border: 'border-blue-100',
    indicator: 'bg-blue-500',
    iconColor: 'stroke-blue-600',
  },
  Shopping: {
    bg: 'bg-purple-50/70',
    text: 'text-purple-700',
    border: 'border-purple-100',
    indicator: 'bg-purple-500',
    iconColor: 'stroke-purple-600',
  },
  Bills: {
    bg: 'bg-rose-50/70',
    text: 'text-rose-700',
    border: 'border-rose-100',
    indicator: 'bg-rose-500',
    iconColor: 'stroke-rose-600',
  },
  Entertainment: {
    bg: 'bg-amber-50/70',
    text: 'text-amber-700',
    border: 'border-amber-100',
    indicator: 'bg-amber-500',
    iconColor: 'stroke-amber-600',
  },
  Other: {
    bg: 'bg-slate-100/70',
    text: 'text-slate-700',
    border: 'border-slate-200',
    indicator: 'bg-slate-500',
    iconColor: 'stroke-slate-600',
  },
};
