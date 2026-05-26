import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Expense, Filters } from './types';
import { getStoredExpenses, saveStoredExpenses } from './utils';
import {
  verifyCloudConnection,
  subscribeExpenses,
  createCloudExpense,
  updateCloudExpense,
  deleteCloudExpense,
  handleGoogleSignIn,
  handleGoogleSignOut
} from './firebaseService';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import FiltersSection from './components/FiltersSection';
import ExpenseList from './components/ExpenseList';
import {
  Wallet,
  Landmark,
  ShieldCheck,
  CloudLightning,
  CloudOff,
  LogIn,
  LogOut,
  RefreshCcw,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Authentication & Service States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Central state holding active visual listing items
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeEditExpense, setActiveEditExpense] = useState<Expense | null>(null);

  // Check for lingering local expenses that could be synchronized to cloud accounts
  const localExpensesLeft = useMemo(() => {
    return getStoredExpenses().filter(e => !e.id.startsWith('mock-'));
  }, [currentUser]); // Recalculate if user logins/logouts

  // Filter conditions state
  const [filters, setFilters] = useState<Filters>({
    category: 'All',
    fromDate: '',
    toDate: '',
    searchQuery: '',
  });

  // 1. Initial connection probe and Auth listener lifecycle setup
  useEffect(() => {
    // Validate live Firestore database ping
    verifyCloudConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setLoadingAuth(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 2. Real-time Firestore streaming subscription if logged in; otherwise default local persistence
  useEffect(() => {
    if (loadingAuth) return;

    if (currentUser) {
      // Connect and stream from user collection
      const unsubscribeStream = subscribeExpenses(
        currentUser.uid,
        (syncedExpenses) => {
          setExpenses(syncedExpenses);
        },
        (error) => {
          console.error('Subscription sync exception managed:', error);
          setIsCloudConnected(false);
        }
      );

      return () => {
        unsubscribeStream();
      };
    } else {
      // Fallback to local storage persistence
      setExpenses(getStoredExpenses());
    }
  }, [currentUser, loadingAuth]);

  // Command: Sync local offline records to authenticated user profile cloud account
  const handleOfflineCloudMigration = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      const recordsToMigrate = getStoredExpenses();
      
      // Migrate non-mock items
      for (const item of recordsToMigrate) {
        // Formulate target cloud entry
        await createCloudExpense(item.id, currentUser.uid, {
          title: item.title,
          amount: item.amount,
          category: item.category,
          date: item.date,
          note: item.note
        });
      }

      // Clear local storage to prevent duplicate migration prompts next login
      saveStoredExpenses([]);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.error('Migration syncing error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Action: Save Expense (handles both Add and Edit with dynamic split cloud/offline modes)
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'> & { id?: string }) => {
    if (currentUser) {
      // Live Cloud PERSISTENCE Flow
      if (expenseData.id) {
        await updateCloudExpense(expenseData.id, {
          title: expenseData.title,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          note: expenseData.note
        });
        setActiveEditExpense(null);
      } else {
        const generatedId = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await createCloudExpense(generatedId, currentUser.uid, {
          title: expenseData.title,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          note: expenseData.note
        });
      }
    } else {
      // Standard Offline Fallback Flow
      let updatedExpenses: Expense[];

      if (expenseData.id) {
        // Edit mode
        updatedExpenses = expenses.map((exp) =>
          exp.id === expenseData.id ? (expenseData as Expense) : exp
        );
        setActiveEditExpense(null);
      } else {
        // Add mode - generate dynamic id
        const newExpense: Expense = {
          ...expenseData,
          id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        updatedExpenses = [newExpense, ...expenses];
      }

      setExpenses(updatedExpenses);
      saveStoredExpenses(updatedExpenses);
    }
  };

  // Action: Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (currentUser) {
      // Live Cloud DELETE Flow
      await deleteCloudExpense(id);
    } else {
      // Standard Offline Fallback Flow
      const updatedExpenses = expenses.filter((exp) => exp.id !== id);
      setExpenses(updatedExpenses);
      saveStoredExpenses(updatedExpenses);
    }

    // Cancel edit if deleted record was during modification
    if (activeEditExpense?.id === id) {
      setActiveEditExpense(null);
    }
  };

  // Action: Enter Edit Mode
  const handleEditExpense = (expense: Expense) => {
    setActiveEditExpense(expense);
    const formEl = document.getElementById('expense-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Action: Clear All active Filters
  const handleClearFilters = () => {
    setFilters({
      category: 'All',
      fromDate: '',
      toDate: '',
      searchQuery: '',
    });
  };

  // User Authentication buttons
  const login = async () => {
    await handleGoogleSignIn();
  };

  const logout = async () => {
    await handleGoogleSignOut();
  };

  // Filtered and Sorted Expenses (Sorted by date in descending order by default)
  const filteredSortedExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // 1. Partial Search Match on Title and Note (Case-insensitive)
        if (filters.searchQuery.trim() !== '') {
          const query = filters.searchQuery.toLowerCase();
          const titleMatch = exp.title.toLowerCase().includes(query);
          const noteMatch = exp.note?.toLowerCase().includes(query) || false;
          if (!titleMatch && !noteMatch) return false;
        }

        // 2. Exact Category Filter
        if (filters.category !== 'All') {
          if (exp.category !== filters.category) return false;
        }

        // 3. Date Range Filter (with on-the-fly chronological inversion swap handling)
        let effectiveFrom = filters.fromDate;
        let effectiveTo = filters.toDate;
        if (effectiveFrom && effectiveTo && effectiveFrom > effectiveTo) {
          effectiveFrom = filters.toDate;
          effectiveTo = filters.fromDate;
        }

        if (effectiveFrom !== '') {
          if (exp.date < effectiveFrom) return false;
        }
        if (effectiveTo !== '') {
          if (exp.date > effectiveTo) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Compare dates descending (most recent first)
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.id.localeCompare(a.id);
      });
  }, [expenses, filters]);

  // Auth readiness quiet landing loader
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans select-none">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-xs font-mono tracking-wider uppercase">Loading Secure Session Enclave...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Visual Navigation Bar */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-35 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">RupeeFlow</h1>
                <p className="text-[10px] font-mono text-slate-400 font-semibold tracking-wide uppercase leading-none">Personal ledger</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 font-sans">
              {/* Dynamic Connection Status badge icons */}
              <div className="hidden md:flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-600">
                {isCloudConnected ? (
                  <>
                    <Landmark className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-indigo-600">Secure Database Synced</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Operating Offline fallback</span>
                  </>
                )}
              </div>

              {/* Authentication interface logic split */}
              {currentUser ? (
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-100 p-1.5 pl-3 rounded-2xl">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-semibold text-slate-950 font-sans leading-none mb-0.5">
                      {currentUser.displayName || 'Authorized User'}
                    </p>
                    <p className="text-[9px] font-mono text-slate-400 font-medium leading-none">
                      {currentUser.email}
                    </p>
                  </div>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="User avatar"
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs select-none">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}

                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100/80 rounded-lg transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-sm hover:shadow-indigo-500/10 transition-all select-none cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sync alert banner for local records to migrate on login */}
        <AnimatePresence>
          {currentUser && localExpensesLeft.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 p-4.5 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              id="sync-migration-alert"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm tracking-tight">Sync Offline Transactions</h5>
                  <p className="text-slate-500 text-xs">
                    You have <strong className="text-amber-800">{localExpensesLeft.length} offline sessions</strong> saved locally on this machine. Sync them now to securely vault them inside your cloud profile.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {syncSuccess ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Migration Completed!
                  </span>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={isSyncing}
                    onClick={handleOfflineCloudMigration}
                    className="flex items-center gap-1.5 select-none text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCcw className="w-3 h-3 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-3 h-3" />
                        Sync Logs to Cloud
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Summary Dashboard */}
        <Dashboard expenses={expenses} />

        {/* Dynamic Two Column Grid Workstation layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Workstation Row Left: Log Income/Expense */}
          <div className="lg:col-span-4 space-y-6">
            <ExpenseForm
              activeEditExpense={activeEditExpense}
              onSave={handleSaveExpense}
              onCancelEdit={() => setActiveEditExpense(null)}
            />
          </div>

          {/* Workstation Row Right: Filters, Search, and Audit List */}
          <div className="lg:col-span-8 flex flex-col">
            <FiltersSection
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
            />

            <ExpenseList
              expenses={filteredSortedExpenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              isGlobalEmpty={expenses.length === 0}
            />
          </div>
        </div>
      </main>

      {/* Subtle margin-clean page footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16 border-t border-slate-200/50 text-center select-none">
        <p className="text-slate-400 text-xs font-medium tracking-tight">
          Personal Expense Tracker &bull; Cloud sync Vault with Google Firestore + OAuth Identity persistence.
        </p>
      </footer>
    </div>
  );
}
