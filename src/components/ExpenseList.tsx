import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, CATEGORY_STYLES } from '../types';
import { formatCurrency } from '../utils';
import { Calendar, Tag, Trash2, Edit2, Info, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isGlobalEmpty?: boolean;
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  isGlobalEmpty = false,
}: ExpenseListProps) {
  // Expense IDs for which details are expanded
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Confirm delete dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="expense-list-container">
      {/* Header Panel */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-slate-900 font-semibold tracking-tight">Record Audit Logs</h4>
          <p className="text-slate-500 text-xs">All expenses logged, sorted chronologically</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 flex items-center gap-1.5 self-start sm:self-auto text-xs text-slate-600 font-mono font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          Total matched: <span className="text-indigo-600 font-semibold">{expenses.length}</span>
        </div>
      </div>

      {/* Main List Table Desktop & Stacked Card Mobile */}
      {expenses.length === 0 ? (
        <div className="p-16 text-center" id="empty-state">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <Info className="w-5 h-5 text-slate-400" />
          </div>
          {isGlobalEmpty ? (
            <>
              <h5 className="text-slate-800 font-semibold text-sm mb-1" id="global-onboarding-message">No expenses logged yet. Start by adding one above!</h5>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                All ledger history is saved isolated on your computer via LocalStorage.
              </p>
            </>
          ) : (
            <>
              <h5 className="text-slate-800 font-semibold text-sm mb-1" id="filter-mismatch-message">No expenses match your active filters.</h5>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Try resetting or clearing your active date range filters, search queries, or selected category dropdown tags.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {/* Card list container */}
          <div className="overflow-x-auto">
            {/* Table layout for mid+ devices */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-slate-50/20 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 select-none">
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Title & Note</th>
                  <th className="py-4 px-6 font-semibold">Category</th>
                  <th className="py-4 px-6 font-semibold text-right">Amount</th>
                  <th className="py-4 px-6 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <AnimatePresence initial={false}>
                  {expenses.map((expense) => {
                    const catStyle = CATEGORY_STYLES[expense.category];
                    const hasNote = !!expense.note;
                    const isExpanded = !!expandedNotes[expense.id];

                    return (
                      <motion.tr
                        key={expense.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                        id={`expense-row-${expense.id}`}
                      >
                        {/* Column: Date */}
                        <td className="py-4.5 px-6 align-middle font-mono text-xs text-slate-500">
                          <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            <Calendar className="w-3.5 h-3.5" />
                            {expense.date}
                          </div>
                        </td>

                        {/* Column: Title & Note */}
                        <td className="py-4.5 px-6 align-middle max-w-xs xl:max-w-md">
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors">
                              {expense.title}
                            </p>
                            {hasNote && (
                              <div className="mt-1">
                                <button
                                  onClick={() => toggleNotes(expense.id)}
                                  className="text-[11px] text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-0.5"
                                >
                                  {isExpanded ? (
                                    <>
                                      Hide Note <ChevronUp className="w-3 h-3" />
                                    </>
                                  ) : (
                                    <>
                                      Show Note <ChevronDown className="w-3 h-3" />
                                    </>
                                  )}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.p
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="text-slate-500 text-xs mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 whitespace-pre-wrap font-sans"
                                    >
                                      {expense.note}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Column: Category Badge */}
                        <td className="py-4.5 px-6 align-middle">
                          <span
                            className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-semibold select-none border border-transparent ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.indicator}`} />
                            {expense.category}
                          </span>
                        </td>

                        {/* Column: Amount (INR) */}
                        <td className="py-4.5 px-6 align-middle text-right font-mono font-bold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </td>

                        {/* Column: Action Controls */}
                        <td className="py-4.5 px-6 align-middle text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEdit(expense)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                              title="Edit Expense"
                              id={`edit-btn-${expense.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(expense.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Delete Expense"
                              id={`delete-btn-${expense.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Stacked layout for mobile screens */}
            <div className="md:hidden divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {expenses.map((expense) => {
                  const catStyle = CATEGORY_STYLES[expense.category];
                  const hasNote = !!expense.note;
                  const isExpanded = !!expandedNotes[expense.id];

                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 space-y-3"
                      id={`expense-card-${expense.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 lines-clamp-2">
                            {expense.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                            >
                              {expense.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {expense.date}
                            </span>
                          </div>
                        </div>

                        <p className="font-mono font-bold text-slate-900 shrink-0 text-sm">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>

                      {hasNote && (
                        <div>
                          <button
                            onClick={() => toggleNotes(expense.id)}
                            className="text-[11px] text-indigo-500 hover:text-indigo-600 font-medium transition-colors flex items-center gap-0.5"
                          >
                            {isExpanded ? (
                              <>
                                Hide Note <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                Show Note <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="text-slate-500 text-xs mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 whitespace-pre-wrap font-sans"
                              >
                                {expense.note}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                        <button
                          onClick={() => onEdit(expense)}
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all font-medium text-xs cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-100 transition-all font-medium text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal overlay (Safer inside iframe containers) */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete-confirmation-dialog">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border border-slate-100 relative z-50"
            >
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <h5 className="font-semibold text-slate-900 tracking-tight text-lg">Remove Expense Log</h5>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Are you absolutely sure you want to delete this expense record? This operation is permanent and cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-250 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
                  id="confirm-delete-btn"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
