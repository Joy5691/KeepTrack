import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, Target, CreditCard, Plus, 
  Calendar, Table, Settings, AlertTriangle, Trash2, Check, X, Bell,
  Percent, Trash, RefreshCw, Zap, Utensils, Car, Smartphone, ShoppingBag, Gamepad2, Lightbulb
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const EXPENSE_CATEGORIES = [
  'Food & Groceries', 'Rent / Housing', 'Utilities (Electricity, Water, Gas, Printing)',
  'Mobile Recharge', 'Transportation', 'Shopping', 'Entertainment', 'Health & Medical', 'Education', 'Subscriptions', 'Miscellaneous'
];

const QUICK_EXPENSE_PRESETS = [
  { category: 'Food & Groceries', label: 'Food & Groceries', icon: Utensils, iconColor: 'text-amber-500 dark:text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20' },
  { category: 'Transportation', label: 'Transportation', icon: Car, iconColor: 'text-sky-500 dark:text-sky-400', bgColor: 'bg-sky-500/10 border-sky-500/25 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20' },
  { category: 'Mobile Recharge', label: 'Mobile Recharge', icon: Smartphone, iconColor: 'text-teal-500 dark:text-teal-400', bgColor: 'bg-teal-500/10 border-teal-500/25 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20' },
  { category: 'Shopping', label: 'Shopping', icon: ShoppingBag, iconColor: 'text-pink-500 dark:text-pink-400', bgColor: 'bg-pink-500/10 border-pink-500/25 text-pink-700 dark:text-pink-300 hover:bg-pink-500/20' },
  { category: 'Entertainment', label: 'Entertainment', icon: Gamepad2, iconColor: 'text-purple-500 dark:text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/25 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20' },
  { category: 'Utilities (Electricity, Water, Gas, Printing)', label: 'Utilities', icon: Lightbulb, iconColor: 'text-yellow-500 dark:text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/25 text-amber-700 dark:text-yellow-300 hover:bg-yellow-500/20' }
];

export function Dashboard({ onAddTx }: { onAddTx: () => void }) {
  const { theme } = useTheme();
  const { transactions, loading: txLoading, addTransaction, clearAllTransactions } = useTransactions();
  const { budgets, loading: budgetLoading, setBudgetLimit, deleteBudget, clearAllBudgets } = useBudgets();

  const loading = txLoading || budgetLoading;

  // Quick Add FAB states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string | null>(null);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickSource, setQuickSource] = useState('cash');
  const [isSavingQuickTx, setIsSavingQuickTx] = useState(false);
  
  const quickInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input field when category is selected
  useEffect(() => {
    if (selectedQuickCategory && quickInputRef.current) {
      setTimeout(() => {
        quickInputRef.current?.focus();
      }, 100);
    }
  }, [selectedQuickCategory]);

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmount || isNaN(parseFloat(quickAmount)) || !selectedQuickCategory) return;
    setIsSavingQuickTx(true);
    try {
      await addTransaction({
        type: 'expense',
        amount: parseFloat(quickAmount),
        category: selectedQuickCategory,
        source: quickSource,
        date: Date.now(),
        notes: 'Logged via Quick Add'
      });
      setQuickAmount('');
      setSelectedQuickCategory(null);
      setIsQuickAddOpen(false);
    } catch (err) {
      console.error("Error with quick add:", err);
    } finally {
      setIsSavingQuickTx(false);
    }
  };

  // Local state for budget configurations modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Total');
  const [limitAmount, setLimitAmount] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);

  // Danger zone state
  const [showConfirmErase, setShowConfirmErase] = useState(false);
  const [erasingAll, setErasingAll] = useState(false);

  const { balance, income, expense } = useMemo(() => {
    let bal = 0;
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        bal += t.amount;
        inc += t.amount;
      } else {
        bal -= t.amount;
        exp += t.amount;
      }
    });
    return { balance: bal, income: inc, expense: exp };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const incomeByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'income') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Overall Monthly Budget (defaults to 50000 if not configured yet)
  const overallBudget = useMemo(() => {
    const totalBudgetDoc = budgets.find(b => b.category === 'Total');
    return totalBudgetDoc ? totalBudgetDoc.limit : 50000;
  }, [budgets]);

  const currentMonthGoal = overallBudget;
  
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // For Goals
    const expensesThisMonth = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    // For Calendar
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getDate() === i + 1 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const earned = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expended = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { day: i + 1, earned, expended };
    });

    const maxExpended = Math.max(...dailyData.map(d => d.expended), 1);
    const maxEarned = Math.max(...dailyData.map(d => d.earned), 1);

    return { expensesThisMonth, daysInMonth, firstDayOfWeek, dailyData, maxExpended, maxEarned, monthName: now.toLocaleString('default', { month: 'long' }) };
  }, [transactions]);

  // Category specific spending in the current month
  const currentMonthCategorySpending = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const spending: Record<string, number> = {};
    
    EXPENSE_CATEGORIES.forEach(cat => {
      spending[cat] = 0;
    });
    
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });
    
    return spending;
  }, [transactions]);

  // Compare current month vs previous month spending
  const monthlySpendingComparison = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentSpent = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const prevSpent = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const difference = currentSpent - prevSpent;
    const percentChange = prevSpent > 0 ? (difference / prevSpent) * 100 : 0;

    return {
      currentSpent,
      prevSpent,
      difference,
      percentChange,
      prevMonthName: new Date(prevYear, prevMonth, 1).toLocaleString('default', { month: 'short' }),
      currentMonthName: now.toLocaleString('default', { month: 'short' })
    };
  }, [transactions]);

  // Daily average spending for the current month compared to the previous month
  const dailyAverageSpending = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentSpent = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const prevSpent = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    // Compute active days elapsed in current month (always at least 1)
    const currentDaysElapsed = Math.max(1, now.getDate());
    const currentDailyAvg = currentSpent / currentDaysElapsed;

    // Compute total days in previous month
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    const prevDailyAvg = prevSpent / prevMonthDays;

    const dailyAvgDifference = currentDailyAvg - prevDailyAvg;
    const dailyAvgPercentChange = prevDailyAvg > 0 ? (dailyAvgDifference / prevDailyAvg) * 100 : 0;

    return {
      currentDailyAvg,
      prevDailyAvg,
      dailyAvgDifference,
      dailyAvgPercentChange,
      currentDaysElapsed,
      prevMonthDays
    };
  }, [transactions]);

  // Visual Budget Alerts (spent >= 80% of limit)
  const budgetAlerts = useMemo(() => {
    const alerts: { category: string; limit: number; spent: number; percent: number; status: 'nearing' | 'exceeded' }[] = [];
    
    budgets.forEach(b => {
      let spent = 0;
      if (b.category === 'Total') {
        spent = currentMonthData.expensesThisMonth;
      } else {
        spent = currentMonthCategorySpending[b.category] || 0;
      }
      
      if (b.limit > 0) {
        const percent = (spent / b.limit) * 100;
        if (percent >= 100) {
          alerts.push({ category: b.category, limit: b.limit, spent, percent, status: 'exceeded' });
        } else if (percent >= 80) {
          alerts.push({ category: b.category, limit: b.limit, spent, percent, status: 'nearing' });
        }
      }
    });
    
    return alerts;
  }, [budgets, currentMonthCategorySpending, currentMonthData.expensesThisMonth]);

  const monthlyReport = useMemo(() => {
    const report: Record<string, { month: string, sortKey: string, income: number, expense: number }> = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!report[monthKey]) {
        report[monthKey] = { month: monthLabel, sortKey: monthKey, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        report[monthKey].income += t.amount;
      } else {
        report[monthKey].expense += t.amount;
      }
    });
    
    return Object.values(report).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions]);

  const formatCurrency = (val: number) => `৳${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#22c55e'];

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount || isNaN(parseFloat(limitAmount))) return;
    setSavingBudget(true);
    await setBudgetLimit(selectedCategory, parseFloat(limitAmount));
    setLimitAmount('');
    setSavingBudget(false);
  };

  const handleEraseAllData = async () => {
    setErasingAll(true);
    try {
      await clearAllTransactions();
      await clearAllBudgets();
      setShowConfirmErase(false);
      setIsBudgetModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setErasingAll(false);
    }
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12">
         <div className="relative w-24 h-24 mb-6">
           {/* Outer spinning dash ring */}
           <motion.svg
             className="absolute inset-0 w-full h-full text-primary"
             viewBox="0 0 100 100"
             animate={{ rotate: 360 }}
             transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
           >
             <circle
               cx="50"
               cy="50"
               r="40"
               fill="none"
               stroke="currentColor"
               strokeWidth="3"
               strokeDasharray="12 6"
               className="opacity-70"
             />
           </motion.svg>
           
           {/* Inner reverse-spinning ring */}
           <motion.svg
             className="absolute inset-2 w-20 h-20 text-indigo-400"
             viewBox="0 0 80 80"
             animate={{ rotate: -360 }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           >
             <circle
               cx="40"
               cy="40"
               r="30"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeDasharray="6 4"
               className="opacity-50"
             />
           </motion.svg>

           {/* Central floating compass needle */}
           <motion.div
             className="absolute inset-0 flex items-center justify-center"
             animate={{ 
               rotate: [0, 15, -10, 0],
               scale: [1, 1.05, 0.95, 1]
             }}
             transition={{
               duration: 3,
               repeat: Infinity,
               ease: "easeInOut"
             }}
           >
             <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <polygon points="12,2 15,12 12,22 9,12" fill="currentColor" />
             </svg>
           </motion.div>
         </div>
         <p className="text-sm font-semibold tracking-wider text-slate-400 dark:text-slate-500 animate-pulse uppercase">Syncing financial compass...</p>
       </div>
     );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-12 gap-4 pb-20 md:pb-0"
    >
      {/* Visual Budget Alerts Banners */}
      {budgetAlerts.length > 0 && (
        <div className="col-span-12 space-y-2.5 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Budget Alerts ({budgetAlerts.length})</span>
          </div>
          <AnimatePresence>
            {budgetAlerts.map((alert) => (
              <motion.div
                key={`${alert.category}-${alert.status}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden transition-all duration-300 ${
                  alert.status === 'exceeded' 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 relative z-10">
                  <div className={`p-2 rounded-xl shrink-0 ${alert.status === 'exceeded' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {alert.category === 'Total' ? 'Total Monthly Budget Limit' : `${alert.category} Budget`}{' '}
                      {alert.status === 'exceeded' ? 'Exceeded!' : 'Nearing Limit'}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      You have expended <span className="font-semibold">{formatCurrency(alert.spent)}</span> of your{' '}
                      <span className="font-semibold">{formatCurrency(alert.limit)}</span> limit ({Math.round(alert.percent)}%).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(alert.category);
                    setLimitAmount(alert.limit.toString());
                    setIsBudgetModalOpen(true);
                  }}
                  className={`self-end sm:self-center px-4 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all duration-200 ${
                    alert.status === 'exceeded'
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 text-amber-300'
                  }`}
                >
                  Adjust Budget
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Row 1: Available Balance, Spending Contrast, and Budget Control */}
      
      {/* Premium Balance Card */}
      <div id="premium-balance-card" className="col-span-12 xl:col-span-3 relative overflow-hidden rounded-[32px] p-6 lg:p-8 text-white flex flex-col justify-between min-h-[260px] bg-gradient-to-br from-primary via-primary-dark to-[#03030a] shadow-2xl shadow-primary/20 border border-white/10">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 blur-[80px] rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-purple-400/20 blur-[60px] rounded-full z-0 pointer-events-none" />
        
        {/* Animated Cash Flow Waves SVG */}
        <div className="absolute inset-x-0 bottom-0 h-24 opacity-20 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z"
              fill="rgba(59,130,246,0.2)"
              animate={{
                d: [
                  "M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z",
                  "M0,50 Q100,80 200,40 T400,50 L400,100 L0,100 Z",
                  "M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.path
              d="M0,60 Q120,30 240,70 T400,60 L400,100 L0,100 Z"
              fill="rgba(168,85,247,0.15)"
              animate={{
                d: [
                  "M0,60 Q120,30 240,70 T400,60 L400,100 L0,100 Z",
                  "M0,70 Q100,45 220,55 T400,70 L400,100 L0,100 Z",
                  "M0,60 Q120,30 240,70 T400,60 L400,100 L0,100 Z"
                ]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-blue-100/70 text-xs font-medium uppercase tracking-widest mb-1">Available Balance</p>
            <h1 className="text-4xl font-display font-bold tracking-tighter">{balance < 0 ? '-' : ''}{formatCurrency(balance)}</h1>
          </div>
          <div className="w-12 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
            <div className="w-6 h-4 bg-yellow-400/80 rounded-[2px]"></div>
          </div>
        </div>
        
        <div className="relative z-10 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100/50 text-[10px] uppercase tracking-wider mb-0.5">Monthly Income</p>
              <p className="text-lg font-semibold">+{formatCurrency(income)}</p>
            </div>
            <div>
              <p className="text-blue-100/50 text-[10px] uppercase tracking-wider mb-0.5">Monthly Spending</p>
              <p className="text-lg font-semibold">-{formatCurrency(expense)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <p className="text-xs font-mono tracking-[0.2em] text-white/80">**** **** **** 8241</p>
            <div className="h-3 w-[1px] bg-white/20"></div>
            <p className="text-[10px] text-white/60 uppercase">Exp 12/28</p>
          </div>
        </div>
      </div>

      {/* Spend Comparison Card */}
      <div id="spend-comparison-card" className="col-span-12 md:col-span-6 xl:col-span-3 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 flex flex-col justify-between min-h-[260px] relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full z-0 pointer-events-none" />
        
        {/* Animated ECG Pulse Cardiogram SVG */}
        <div className="absolute inset-x-0 bottom-12 h-14 opacity-[0.08] dark:opacity-15 pointer-events-none z-0">
          <svg className="w-full h-full text-primary" viewBox="0 0 300 60" preserveAspectRatio="none">
            <motion.path
              d="M 0 30 L 70 30 L 80 15 L 90 45 L 100 30 L 150 30 L 160 10 L 170 50 L 180 30 L 220 30 L 230 20 L 240 40 L 250 30 L 300 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ strokeDasharray: "300", strokeDashoffset: "300" }}
              animate={{ strokeDashoffset: [300, 0, -300] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Spending Pulse</h3>
          <span className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Percent className="w-4 h-4" />
          </span>
        </div>

        <div className="relative z-10 space-y-2 my-4">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Spent This Month ({monthlySpendingComparison.currentMonthName})</p>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h2 className="text-4xl font-bold tracking-tighter text-slate-800 dark:text-white">
              {formatCurrency(monthlySpendingComparison.currentSpent)}
            </h2>
            {monthlySpendingComparison.prevSpent > 0 && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                monthlySpendingComparison.difference <= 0 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {monthlySpendingComparison.difference <= 0 ? '↓' : '↑'} {Math.abs(Math.round(monthlySpendingComparison.percentChange))}%
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 border-t border-slate-100 dark:border-white/5 pt-4 flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Last Month ({monthlySpendingComparison.prevMonthName}):</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{formatCurrency(monthlySpendingComparison.prevSpent)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-500">Contrast Trend:</span>
            <span className={`font-semibold ${monthlySpendingComparison.difference <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              {monthlySpendingComparison.difference <= 0 ? 'Saved' : 'Spent'}{' '}
              {formatCurrency(Math.abs(monthlySpendingComparison.difference))}{' '}
              {monthlySpendingComparison.difference <= 0 ? '🎉' : '⚠️'}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Average Indicator Card */}
      <div id="daily-average-card" className="col-span-12 md:col-span-6 xl:col-span-3 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 flex flex-col justify-between min-h-[260px] relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full z-0 pointer-events-none" />
        
        {/* Animated Charging Energy Bolt Background */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.05] dark:opacity-[0.12] pointer-events-none z-0">
          <svg className="w-28 h-28 text-emerald-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M40 10 L60 10 L50 45 L70 45 L35 90 L45 55 L30 55 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{
                strokeDasharray: ["0 300", "300 0", "0 300"],
                strokeDashoffset: [0, -300, -600]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.path
              d="M40 10 L60 10 L50 45 L70 45 L35 90 L45 55 L30 55 Z"
              fill="currentColor"
              animate={{
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Daily Average</h3>
          <span className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Zap className="w-4 h-4" />
          </span>
        </div>

        <div className="relative z-10 space-y-2 my-4">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg Spent / Day ({monthlySpendingComparison.currentMonthName})</p>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h2 className="text-4xl font-bold tracking-tighter text-slate-800 dark:text-white">
              {formatCurrency(dailyAverageSpending.currentDailyAvg)}
            </h2>
            {dailyAverageSpending.prevDailyAvg > 0 && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                dailyAverageSpending.dailyAvgDifference <= 0 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {dailyAverageSpending.dailyAvgDifference <= 0 ? '↓' : '↑'} {Math.abs(Math.round(dailyAverageSpending.dailyAvgPercentChange))}%
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 border-t border-slate-100 dark:border-white/5 pt-4 flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Prev. Avg ({monthlySpendingComparison.prevMonthName}):</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{formatCurrency(dailyAverageSpending.prevDailyAvg)}/day</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-500">Daily Trend:</span>
            <span className={`font-semibold ${dailyAverageSpending.dailyAvgDifference <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              {dailyAverageSpending.dailyAvgDifference <= 0 ? 'Saved' : 'Spent'}{' '}
              {formatCurrency(Math.abs(dailyAverageSpending.dailyAvgDifference))}/day{' '}
              {dailyAverageSpending.dailyAvgDifference <= 0 ? '🎉' : '⚠️'}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Budget Summary & Config Trigger */}
      <div id="monthly-budget-card" className="col-span-12 md:col-span-6 xl:col-span-3 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 flex flex-col justify-between min-h-[260px] relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300">
        
        {/* Concentric Animated Target Radar Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] dark:opacity-[0.07] pointer-events-none z-0">
          <svg className="w-full h-full text-primary" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <motion.circle
              cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1"
              animate={{
                scale: [0.8, 1.25, 0.8],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.circle
              cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="1"
              strokeDasharray="4 3"
              animate={{
                scale: [1.15, 0.85, 1.15],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Monthly Budget</h3>
          <button 
            onClick={() => setIsBudgetModalOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-primary hover:text-primary-hover transition-colors cursor-pointer relative z-20"
            title="Configure Budgets"
          >
            <Settings className="w-5 h-5 animate-spin-slow" />
          </button>
        </div>
        <div className="space-y-3 my-auto relative z-10">
          <div className="flex justify-between items-end">
            <span className={`text-3xl font-bold tracking-tighter ${currentMonthData.expensesThisMonth > currentMonthGoal ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
              {Math.min(100, Math.round((currentMonthData.expensesThisMonth / currentMonthGoal) * 100))}%
            </span>
            <span className="text-xs text-slate-500 mb-1">
               {formatCurrency(currentMonthData.expensesThisMonth)} / {formatCurrency(currentMonthGoal)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (currentMonthData.expensesThisMonth / currentMonthGoal) * 100)}%` }}
              className={`h-full rounded-full shadow-[0_0_10px_rgba(0,136,255,0.4)] ${currentMonthData.expensesThisMonth > currentMonthGoal ? 'bg-rose-500' : 'bg-primary'}`}
            />
          </div>
        </div>
        <button onClick={onAddTx} className="w-full py-3 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors rounded-2xl font-bold flex items-center justify-center text-sm cursor-pointer relative z-10">
           <Plus className="w-4 h-4 mr-2 stroke-[2.5px]" /> Add Transaction
        </button>
      </div>

      {/* Row 2: Expenses Pie, Category Breakdown, and Daily Pulse (Calendar) */}

      {/* Expenses Pie */}
      <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 flex flex-col min-h-[280px]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Expenses by Category</h3>
        <div className="flex-1 relative">
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No expenses yet.</div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 flex flex-col min-h-[280px]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
           Category Ledger
        </h3>
        
        <div className="bg-slate-50 dark:bg-[#05050f] rounded-2xl p-4 font-mono text-xs border border-slate-100 dark:border-white/5 overflow-y-auto selection:bg-primary/30 flex-1 scrollbar-hide max-h-[190px]">
          <div className="text-primary font-bold mb-2"># Income Channels</div>
          {incomeByCategory.length > 0 ? (
            <ul className="mb-4 space-y-1 text-slate-600 dark:text-slate-300">
              {incomeByCategory.map(cat => (
                <li key={cat.name}>- {cat.name}: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(cat.value)}</span></li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-400 mb-4 italic">- No income channels recorded.</div>
          )}

          <div className="text-primary font-bold mb-2"># Expenses ledger</div>
          {expenseByCategory.length > 0 ? (
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              {expenseByCategory.map(cat => (
                <li key={cat.name}>- {cat.name}: <span className="text-rose-600 dark:text-rose-400 font-semibold">{formatCurrency(cat.value)}</span></li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-400 italic">- No expenses tracked.</div>
          )}
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="col-span-12 xl:col-span-4 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 flex flex-col min-h-[280px]">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> {currentMonthData.monthName} Daily Pulse
           </h3>
        </div>
        <div className="flex-1 flex flex-col justify-center">
           <div className="grid grid-cols-7 gap-1.5 mb-2">
             {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">{day}</div>
             ))}
           </div>
           <div className="grid grid-cols-7 gap-1.5">
             {Array.from({ length: currentMonthData.firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded bg-transparent" />
             ))}
             {currentMonthData.dailyData.map((d) => {
                let bgClass = "bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10";
                if (d.expended > 0 || d.earned > 0) {
                   if (d.expended > d.earned) {
                      const intensity = d.expended / currentMonthData.maxExpended;
                      bgClass = intensity > 0.5 ? "bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)] text-white" : "bg-rose-500/40 text-rose-800 dark:text-rose-200";
                   } else {
                      const intensity = d.earned / currentMonthData.maxEarned;
                      bgClass = intensity > 0.5 ? "bg-emerald-500/80 shadow-[0_0_8px_rgba(52,211,153,0.4)] text-white" : "bg-emerald-500/40 text-emerald-800 dark:text-emerald-200";
                   }
                }
                
                return (
                   <motion.div 
                     whileHover={{ scale: 1.1 }}
                     key={d.day} 
                     className={`aspect-square rounded flex items-center justify-center text-[10px] font-mono cursor-default transition-all ${bgClass} text-slate-700 dark:text-white/80`}
                     title={`Date: ${d.day}\nEarned: ${formatCurrency(d.earned)}\nExpended: ${formatCurrency(d.expended)}`}
                   >
                     {d.day}
                   </motion.div>
                );
             })}
           </div>
           <div className="flex items-center justify-center gap-4 mt-4 text-[9px] text-slate-400 dark:text-slate-500">
             <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500/80"></div> Outflow</div>
             <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></div> Inflow</div>
           </div>
        </div>
      </div>

      {/* Row 3: Bar Chart & Monthly Table Book */}

      {/* Monthly Report Chart */}
      <div className="col-span-12 xl:col-span-8 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 lg:p-8 flex flex-col min-h-[300px]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
           Earnings & Expense Flow
        </h3>
        
        <div className="flex-1">
           {monthlyReport.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={monthlyReport} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                 <XAxis dataKey="month" stroke={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)'} fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis width={65} stroke={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                 <RechartsTooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                   cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                 />
                 <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                 <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="flex h-full items-center justify-center text-slate-500 text-sm">No data yet.</div>
           )}
        </div>
      </div>

      {/* Animated Data Table */}
      <div className="col-span-12 xl:col-span-4 bg-white dark:bg-[#0a0a14] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none rounded-[32px] p-6 flex flex-col min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Table className="w-4 h-4 text-primary" /> Book of Months
          </h3>
        </div>
        <div className="flex-1 overflow-x-auto rounded-2xl border border-slate-100 dark:border-white/5 scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[300px]">
             <thead>
               <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-[#05050f]">
                 <th className="p-3 font-bold rounded-tl-2xl">Month</th>
                 <th className="p-3 font-bold">Earned</th>
                 <th className="p-3 font-bold">Expended</th>
                 <th className="p-3 font-bold text-right rounded-tr-2xl">Net</th>
               </tr>
             </thead>
             <tbody>
               <AnimatePresence>
                 {monthlyReport.length > 0 ? monthlyReport.map((row, i) => (
                   <motion.tr
                     key={row.sortKey}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                   >
                     <td className="p-3 text-xs font-medium text-slate-600 dark:text-slate-300">{row.month}</td>
                     <td className="p-3 text-xs text-emerald-600 dark:text-emerald-400">+{formatCurrency(row.income)}</td>
                     <td className="p-3 text-xs text-rose-600 dark:text-rose-400">-{formatCurrency(row.expense)}</td>
                     <td className="p-3 text-xs text-right font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{row.income - row.expense > 0 ? '+' : ''}{formatCurrency(row.income - row.expense)}</td>
                   </motion.tr>
                 )) : (
                   <tr><td colSpan={4} className="p-8 text-center text-slate-500 text-sm">No data yet.</td></tr>
                 )}
               </AnimatePresence>
             </tbody>
          </table>
        </div>
      </div>

      {/* Budget Configuration Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0c0c16] border border-white/10 p-6 rounded-3xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full z-0 pointer-events-none" />
              
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Control Center</h2>
                    <p className="text-xs text-slate-400">Configure thresholds & manage transaction history</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBudgetModalOpen(false)} 
                  className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-6 relative z-10 scrollbar-hide">
                
                {/* Form to set budget */}
                <form onSubmit={handleSaveBudget} className="bg-[#05050d] border border-white/5 p-4 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Set Limit</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1.5">Category</label>
                      <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-[#0d0d16] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="Total">Total Overall Budget</option>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1.5">Limit (Amount)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">৳</span>
                        <input 
                          type="number" 
                          placeholder="e.g. 15000"
                          value={limitAmount}
                          onChange={(e) => setLimitAmount(e.target.value)}
                          className="w-full bg-[#0d0d16] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={savingBudget || !limitAmount}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {savingBudget ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Save Budget Limit
                      </>
                    )}
                  </button>
                </form>

                {/* Active Budgets List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Budget Limits ({budgets.length})</h3>
                  
                  {budgets.length > 0 ? (
                    <div className="space-y-3">
                      {budgets.map((b) => {
                        const spent = b.category === 'Total' 
                          ? currentMonthData.expensesThisMonth 
                          : (currentMonthCategorySpending[b.category] || 0);
                        const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                        
                        let progressColor = "bg-primary shadow-[0_0_8px_rgba(0,136,255,0.3)]";
                        let textColor = "text-primary";
                        if (percent >= 100) {
                          progressColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]";
                          textColor = "text-rose-400";
                        } else if (percent >= 80) {
                          progressColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
                          textColor = "text-amber-400";
                        }

                        return (
                          <div key={b.id} className="bg-[#05050d] border border-white/5 rounded-2xl p-4 space-y-2.5 relative group">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-slate-200">
                                  {b.category === 'Total' ? 'Total Overall Budget' : b.category}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] text-slate-500">Spent:</span>
                                  <span className="text-[11px] font-semibold text-slate-300">{formatCurrency(spent)}</span>
                                  <span className="text-[11px] text-slate-500">/</span>
                                  <span className="text-[11px] font-semibold text-slate-300">{formatCurrency(b.limit)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${textColor}`}>
                                  {Math.round(percent)}%
                                </span>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteBudget(b.id);
                                  }}
                                  className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                                  title="Delete limit"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, percent)}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl text-slate-500 text-xs">
                      No limits configured yet. Set an overall or category-specific budget to monitor your wallet.
                    </div>
                  )}
                </div>

                {/* Danger Zone: Erase All Data */}
                <div className="border-t border-white/10 pt-5 mt-4">
                  <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-rose-300">Danger Zone</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Erase all recorded transactions and custom budgets. This operation is permanent and cannot be undone.
                        </p>
                      </div>
                    </div>

                    {!showConfirmErase ? (
                      <button
                        type="button"
                        onClick={() => setShowConfirmErase(true)}
                        className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Trash className="w-3.5 h-3.5" /> Erase All Previous Data
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300 text-center font-semibold">
                          Are you absolutely sure? All data will be wiped immediately.
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setShowConfirmErase(false)}
                            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleEraseAllData}
                            disabled={erasingAll}
                            className="py-2 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            {erasingAll ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Yes, Erase All Data'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Add Floating Button Group */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end">
        <AnimatePresence>
          {isQuickAddOpen && (
            <>
              {/* Overlay Backdrop to dismiss */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsQuickAddOpen(false);
                  setSelectedQuickCategory(null);
                  setQuickAmount('');
                }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
              />
              
              {/* Quick Add Panel Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#0c0c16]/95 border border-white/10 backdrop-blur-md shadow-2xl rounded-3xl p-5 w-80 mb-4 relative z-40 overflow-hidden flex flex-col"
              >
                {/* Glowing subtle background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full z-0 pointer-events-none" />
                
                {!selectedQuickCategory ? (
                  // Step 1: Select Category List
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-primary fill-primary" /> Quick Add Expense
                        </h4>
                        <p className="text-[10px] text-slate-400">Single-tap to select category</p>
                      </div>
                      <button 
                        onClick={() => setIsQuickAddOpen(false)}
                        className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {QUICK_EXPENSE_PRESETS.map((preset) => (
                        <button
                          key={preset.category}
                          onClick={() => setSelectedQuickCategory(preset.category)}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${preset.bgColor}`}
                        >
                          <preset.icon className={`w-5 h-5 mb-1.5 ${preset.iconColor}`} />
                          <span className="text-[10px] font-semibold tracking-tight truncate max-w-full leading-tight">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Step 2: Enter Amount Form
                  <form onSubmit={handleQuickAddSubmit} className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const preset = QUICK_EXPENSE_PRESETS.find(p => p.category === selectedQuickCategory);
                          if (!preset) return null;
                          return (
                            <div className="p-2 rounded-xl bg-white/5 text-slate-200">
                              <preset.icon className="w-4 h-4" />
                            </div>
                          );
                        })()}
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Quick Log</p>
                          <h4 className="text-xs font-bold text-white max-w-[150px] truncate">
                            {selectedQuickCategory === 'Utilities (Electricity, Water, Gas, Printing)' ? 'Utilities' : selectedQuickCategory}
                          </h4>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedQuickCategory(null);
                          setQuickAmount('');
                        }}
                        className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-lg">৳</span>
                      <input 
                        ref={quickInputRef}
                        type="number" 
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-3.5 text-xl font-bold text-white outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 p-1 bg-black/25 rounded-xl border border-white/5">
                      <button 
                        type="button" 
                        onClick={() => setQuickSource('cash')}
                        className={`py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${quickSource === 'cash' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Cash
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setQuickSource('bank')}
                        className={`py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${quickSource === 'bank' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Bank
                      </button>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingQuickTx || !quickAmount}
                      className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingQuickTx ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Logging...
                        </>
                      ) : (
                        'Save Quick Expense'
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative z-40 border transition-all duration-300 cursor-pointer ${
            isQuickAddOpen 
              ? 'bg-[#0c0c16] border-rose-500/30 text-rose-400 shadow-rose-500/10' 
              : 'bg-gradient-to-tr from-primary to-primary-dark border-white/10 text-white shadow-primary/20 hover:shadow-primary/30 hover:shadow-[0_0_15px_rgba(0,136,255,0.4)]'
          }`}
          title={isQuickAddOpen ? "Close Quick Add" : "Quick Add Expense"}
        >
          <AnimatePresence mode="wait">
            {isQuickAddOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center relative"
              >
                <Zap className="w-6 h-6 fill-white text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#03030a] animate-pulse"></span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

    </motion.div>
  );
}
