import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Category, CATEGORIES, CATEGORY_STYLES } from '../types';
import { getFormattedDate } from '../utils';
import { Check, Plus, AlertCircle, Edit3, X } from 'lucide-react';

interface ExpenseFormProps {
  activeEditExpense: Expense | null;
  onSave: (expenseData: Omit<Expense, 'id'> & { id?: string }) => void;
  onCancelEdit: () => void;
}

export default function ExpenseForm({
  activeEditExpense,
  onSave,
  onCancelEdit,
}: ExpenseFormProps) {
  // Local form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  // Form error state
  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    category?: string;
    date?: string;
  }>({});

  // Reset form to defaults
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDate(getFormattedDate(new Date()));
    setNote('');
    setErrors({});
  };

  // Synchronize state when edit expense changes
  useEffect(() => {
    if (activeEditExpense) {
      setTitle(activeEditExpense.title);
      setAmount(activeEditExpense.amount.toString());
      setCategory(activeEditExpense.category);
      setDate(activeEditExpense.date);
      setNote(activeEditExpense.note || '');
      setErrors({});
    } else {
      resetForm();
    }
  }, [activeEditExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger validation
    const newErrors: typeof errors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 80) {
      newErrors.title = 'Title must be under 80 characters';
    }

    const parsedAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Enter a valid positive number';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Pass valid data to parent
    onSave({
      id: activeEditExpense?.id, // include if editing
      title: title.trim(),
      amount: parsedAmount,
      category,
      date,
      note: note.trim() || undefined,
    });

    // Reset if in Add mode
    if (!activeEditExpense) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100" id="expense-form-container">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          {activeEditExpense ? (
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Edit3 className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
          )}
          <h4 className="text-slate-900 font-semibold tracking-tight">
            {activeEditExpense ? 'Modify Expense' : 'Log Expense'}
          </h4>
        </div>

        {activeEditExpense && (
          <button
            onClick={onCancelEdit}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-50 border border-slate-100"
          >
            <X className="w-3.5 h-3.5" />
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="form-title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Title / Store Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="form-title"
            type="text"
            placeholder="e.g., Starbucks Coffee"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            className={`w-full bg-slate-50/60 border ${
              errors.title ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
            } rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-slate-900 placeholder-slate-400`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium select-none">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Row for Amount and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount Field */}
          <div>
            <label htmlFor="form-amount" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Amount (Rupees ₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold select-none">
                ₹
              </span>
              <input
                id="form-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className={`w-full bg-slate-50/60 border ${
                  errors.amount ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                } rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none transition-all text-slate-900 font-mono placeholder-slate-400`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium select-none">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label htmlFor="form-category" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="form-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
              className="w-full bg-slate-50/60 border border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-slate-900 select-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Field */}
        <div>
          <label htmlFor="form-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Transaction Date <span className="text-rose-500">*</span>
          </label>
          <input
            id="form-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            className={`w-full bg-slate-50/60 border ${
              errors.date ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
            } rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-slate-900 font-sans cursor-pointer`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium select-none">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.date}
            </p>
          )}
        </div>

        {/* Note Field */}
        <div>
          <label htmlFor="form-note" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Add Note <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="form-note"
            rows={3}
            placeholder="Provide context, invoice ID, item list, etc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-50/60 border border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-slate-900 placeholder-slate-400 resize-none font-sans"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`w-full flex items-center justify-center gap-2 select-none font-medium text-sm py-3 px-4 rounded-xl shadow-sm text-white transition-all cursor-pointer ${
              activeEditExpense
                ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:ring-2 focus:ring-indigo-500/30'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:ring-2 focus:ring-emerald-500/30'
            }`}
          >
            {activeEditExpense ? (
              <>
                <Check className="w-4 h-4" />
                Update Logged Expense
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Confirm & Log Expense
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
