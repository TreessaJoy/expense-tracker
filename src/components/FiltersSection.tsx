import { FilterCategory, Filters, CATEGORIES } from '../types';
import { Search, SlidersHorizontal, RefreshCw, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface FiltersSectionProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  onClearFilters: () => void;
}

export default function FiltersSection({
  filters,
  onFilterChange,
  onClearFilters,
}: FiltersSectionProps) {
  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, searchQuery: val });
  };

  const handleCategoryChange = (val: FilterCategory) => {
    onFilterChange({ ...filters, category: val });
  };

  const handleFromDateChange = (val: string) => {
    onFilterChange({ ...filters, fromDate: val });
  };

  const handleToDateChange = (val: string) => {
    onFilterChange({ ...filters, toDate: val });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.category !== 'All' ||
    filters.fromDate !== '' ||
    filters.toDate !== '';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6" id="filters-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50/75 text-indigo-600 rounded-lg">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-slate-900 font-semibold tracking-tight">Search & Advanced Filters</h4>
            <p className="text-slate-500 text-[11px]">Refine list results instantly by criteria</p>
          </div>
        </div>

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClearFilters}
            className="self-start sm:self-auto text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 tracking-tight cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear Active Filters
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Title Search */}
        <div className="space-y-1.5">
          <label htmlFor="search-input" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Search keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-input"
              type="text"
              placeholder="e.g. Starbucks, Airtel..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition-all text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Category Select */}
        <div className="space-y-1.5">
          <label htmlFor="category-select" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Category
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              id="category-select"
              value={filters.category}
              onChange={(e) => handleCategoryChange(e.target.value as FilterCategory)}
              className="w-full bg-slate-50/60 border border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs outline-none transition-all text-slate-900 cursor-pointer select-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* From Date */}
        <div className="space-y-1.5">
          <label htmlFor="from-date" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            From Date
          </label>
          <div className="relative">
            <input
              id="from-date"
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs outline-none transition-all text-slate-900 cursor-pointer"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="space-y-1.5">
          <label htmlFor="to-date" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            To Date
          </label>
          <div className="relative">
            <input
              id="to-date"
              type="date"
              value={filters.toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs outline-none transition-all text-slate-900 cursor-pointer"
            />
          </div>
        </div>

        {/* Chronological Inversion Warning banner */}
        {filters.fromDate && filters.toDate && filters.fromDate > filters.toDate && (
          <div className="md:col-span-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center gap-2 select-none animate-pulse" id="chronological-warning-message">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Warning: Chronological Inversion detected.</strong> &ldquo;From Date&rdquo; is later than &ldquo;To Date&rdquo;. Active date matching calculations will treat them as auto-swapped for seamless filtering.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
