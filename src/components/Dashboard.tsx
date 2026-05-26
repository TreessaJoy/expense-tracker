import { motion } from 'motion/react';
import { Expense, CATEGORIES, CATEGORY_STYLES, Category } from '../types';
import { formatCurrency, getMonthlyTotals } from '../utils';
import { TrendingUp, ArrowUpRight, DollarSign, Calendar, Tag, ChevronRight } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
}

export default function Dashboard({ expenses }: DashboardProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-indexed
  const targetPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[today.getMonth()];

  const { total, categoryBreakdown } = getMonthlyTotals(expenses, currentYear, currentMonth);

  // Maximum single category spend to calculate percentages for the visual progress bars
  const maxCategorySpend = Math.max(...CATEGORIES.map(cat => categoryBreakdown[cat] || 0), 1);

  // Find highest spending category
  let highestCategory: Category | null = null;
  let highestAmount = 0;
  CATEGORIES.forEach((cat) => {
    const amt = categoryBreakdown[cat] || 0;
    if (amt > highestAmount) {
      highestAmount = amt;
      highestCategory = cat;
    }
  });

  // Calculate percentage of category spend relative to total monthly spend
  const getCategoryPercentage = (cat: Category) => {
    if (total === 0) return 0;
    return Math.round(((categoryBreakdown[cat] || 0) / total) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      id="monthly-dashboard"
    >
      {/* Metric Card: Total Spent */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/50 flex flex-col justify-between relative overflow-hidden lg:col-span-1 min-h-[200px]">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-200/90 text-sm font-medium tracking-wide uppercase">Total Volume Spent</span>
            <div className="p-2 bg-indigo-800/50 rounded-lg text-indigo-200 border border-indigo-700/50">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-indigo-200 text-xs font-mono mb-4">{currentMonthName} {currentYear}</p>
          <h3 className="text-4xl font-semibold tracking-tight font-sans text-white">
            {formatCurrency(total)}
          </h3>
        </div>

        <div className="relative z-10 pt-4 border-t border-indigo-800/40 flex items-center justify-between text-xs text-indigo-200/80">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Active budget cycle
          </span>
          <span className="bg-indigo-800/50 px-2 py-0.5 rounded-full text-[10px] font-mono border border-indigo-700/50 text-indigo-300">
            {expenses.filter(e => e.date.startsWith(targetPrefix)).length} transactions
          </span>
        </div>
      </div>

      {/* Visual Summary Card: Category Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-slate-900 font-semibold tracking-tight">Category Distribution</h4>
              <p className="text-slate-500 text-xs">Expense volume grouped by tags for {currentMonthName}</p>
            </div>
            
            {highestCategory && highestAmount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Peak: </span>
                <span className="font-semibold text-slate-800">{highestCategory}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {CATEGORIES.map((cat) => {
              const amount = categoryBreakdown[cat] || 0;
              const percent = getCategoryPercentage(cat);
              const styles = CATEGORY_STYLES[cat];
              // Calculate proportion of highest spend for progress bar fill length
              const barFillWidth = amount > 0 ? (amount / maxCategorySpend) * 100 : 0;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${styles.indicator}`}></span>
                      <span className="font-medium text-slate-700">{cat}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-slate-900">{formatCurrency(amount)}</span>
                      {amount > 0 && (
                        <span className="text-slate-400 text-[10px] ml-1.5 font-sans">({percent}%)</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barFillWidth}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full ${styles.indicator} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {total === 0 && (
          <div className="mt-4 p-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-mono">No data logged for {currentMonthName} {currentYear} yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
