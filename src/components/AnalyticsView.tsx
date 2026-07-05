import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactions } from '../hooks/useTransactions';
import { X, ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, ComposedChart, Line, LineChart
} from 'recharts';

export function AnalyticsView() {
  const { transactions, loading } = useTransactions();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [comparePeriod, setComparePeriod] = useState(false);

  const { ytdData, topCategories, monthlyCategoryData, expenseCategories } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentYearTxs = transactions.filter(t => new Date(t.date).getFullYear() === currentYear);
    const prevYearTxs = transactions.filter(t => new Date(t.date).getFullYear() === currentYear - 1);

    // YTD Data
    const monthMap: Record<string, { month: string, sortKey: string, income: number, expense: number, prevIncome: number, prevExpense: number }> = {};
    
    // Monthly categories (expenses)
    const monthlyCatMap: Record<string, any> = {};
    
    // Top Categories overall (expenses)
    const categoryTotalMap: Record<string, { current: number, previous: number }> = {};
    
    const allExpCatsSet = new Set<string>();

    currentYearTxs.forEach(t => {
      const date = new Date(t.date);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
      const monthIndex = date.getMonth();
      const sortKey = `${monthIndex.toString().padStart(2, '0')}`;

      if (!monthMap[sortKey]) monthMap[sortKey] = { month: monthStr, sortKey, income: 0, expense: 0, prevIncome: 0, prevExpense: 0 };
      if (!monthlyCatMap[sortKey]) monthlyCatMap[sortKey] = { month: monthStr, sortKey, prevExpense: 0 };

      if (t.type === 'income') {
        monthMap[sortKey].income += t.amount;
      } else {
        monthMap[sortKey].expense += t.amount;
        
        if (!categoryTotalMap[t.category]) categoryTotalMap[t.category] = { current: 0, previous: 0 };
        categoryTotalMap[t.category].current += t.amount;
        monthlyCatMap[sortKey][t.category] = (monthlyCatMap[sortKey][t.category] || 0) + t.amount;
        allExpCatsSet.add(t.category);
      }
    });
    
    prevYearTxs.forEach(t => {
      const date = new Date(t.date);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' }); 
      const monthIndex = date.getMonth();
      const sortKey = `${monthIndex.toString().padStart(2, '0')}`;
      
      if (!monthMap[sortKey]) monthMap[sortKey] = { month: monthStr, sortKey, income: 0, expense: 0, prevIncome: 0, prevExpense: 0 };
      if (!monthlyCatMap[sortKey]) monthlyCatMap[sortKey] = { month: monthStr, sortKey, prevExpense: 0 };
      
      if (t.type === 'income') {
        monthMap[sortKey].prevIncome += t.amount;
      } else {
        monthMap[sortKey].prevExpense += t.amount;
        if (!categoryTotalMap[t.category]) {
          categoryTotalMap[t.category] = { current: 0, previous: 0 };
        }
        categoryTotalMap[t.category].previous += t.amount;
        monthlyCatMap[sortKey].prevExpense = (monthlyCatMap[sortKey].prevExpense || 0) + t.amount;
      }
    });

    const sortedYtd = Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    let cumInc = 0, cumExp = 0, prevCumInc = 0, prevCumExp = 0;
    const ytdCumulative = sortedYtd.map(d => {
      cumInc += d.income;
      cumExp += d.expense;
      prevCumInc += d.prevIncome;
      prevCumExp += d.prevExpense;
      return {
        ...d,
        cumIncome: cumInc,
        cumExpense: cumExp,
        prevCumIncome: prevCumInc,
        prevCumExpense: prevCumExp,
      };
    });

    const topCats = Object.entries(categoryTotalMap)
      .map(([name, val]) => {
         let change = 0;
         if (val.previous > 0) {
            change = ((val.current - val.previous) / val.previous) * 100;
         }
         return { 
           name, 
           value: val.current, 
           previous: val.previous, 
           changeStr: val.previous > 0 ? `${Math.abs(change).toFixed(0)}%` : 'N/A',
           isUp: change > 0,
           isDown: change < 0
         };
      })
      .filter(item => item.value > 0) // only show categories with expenses in current year
      .sort((a, b) => b.value - a.value);

    const sortedMonthlyCat = Object.values(monthlyCatMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const allExpCats = Array.from(allExpCatsSet);

    return { 
      ytdData: ytdCumulative, 
      topCategories: topCats, 
      monthlyCategoryData: sortedMonthlyCat,
      expenseCategories: allExpCats
    };
  }, [transactions]);

  const last6MonthsData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Create the last 6 months list (chronological order)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const yearShort = d.toLocaleDateString('en-US', { year: '2-digit' });
      data.push({
        label: `${monthLabel} '${yearShort}`,
        month: d.getMonth(),
        year: d.getFullYear(),
        expense: 0,
        income: 0,
      });
    }

    // Populate actual income & expense values from transactions
    transactions.forEach(t => {
      const txDate = new Date(t.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();
      
      const matched = data.find(item => item.year === txYear && item.month === txMonth);
      if (matched) {
        if (t.type === 'expense') {
          matched.expense += t.amount;
        } else if (t.type === 'income') {
          matched.income += t.amount;
        }
      }
    });

    return data;
  }, [transactions]);

  const spendingByCategoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalSpending > 0 ? ((value / totalSpending) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#3b82f6', '#14b8a6', '#facc15', '#64748b'];

  const formatCurrency = (val: number) => `৳${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const filteredTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return transactions.filter(t => t.category === selectedCategory).sort((a, b) => b.date - a.date);
  }, [transactions, selectedCategory]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-20 md:pb-0">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Deep dive into your financial metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">Compare vs Prev Year</span>
          <button 
             onClick={() => setComparePeriod(!comparePeriod)} 
             className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${comparePeriod ? 'bg-primary' : 'bg-slate-700'}`}
          >
             <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${comparePeriod ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 6-Month Spending Trend Line Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="col-span-1 xl:col-span-2 bg-[#0a0a14] border border-white/5 rounded-[32px] p-6 lg:p-10 flex flex-col min-h-[350px]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-rose-500"></span>
               6-Month Spending & Income Trend
            </h3>
            <span className="text-xs text-slate-500 font-mono">Last 6 Months Breakdown</span>
          </div>
          <div className="flex-1 h-[250px] min-h-[250px]">
            {last6MonthsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last6MonthsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis width={65} stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value.toLocaleString('en-IN')}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a14', color: '#f1f5f9' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5 }}
                    formatter={(value: number) => [formatCurrency(value), undefined]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="expense" name="Spending (Expense)" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 3 }} />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#34d399" strokeWidth={2.5} activeDot={{ r: 5 }} dot={{ strokeWidth: 1.5, r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">No transaction data available for the last 6 months.</div>
            )}
          </div>
        </motion.div>

        {/* YTD Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#0a0a14] border border-white/5 rounded-[32px] p-6 lg:p-10 flex flex-col min-h-[350px]"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             Year-to-Date Performance
          </h3>
          <div className="flex-1">
            {ytdData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ytdData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis width={65} stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a14', color: '#f1f5f9' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    formatter={(value: number) => [formatCurrency(value), undefined]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="cumIncome" name="YTD Income" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="cumExpense" name="YTD Expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                  {comparePeriod && <Line type="monotone" dataKey="prevCumIncome" name="Prev YTD Income" stroke="rgba(52, 211, 153, 0.4)" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />}
                  {comparePeriod && <Line type="monotone" dataKey="prevCumExpense" name="Prev YTD Expense" stroke="rgba(244, 63, 94, 0.4)" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">No data this year.</div>
            )}
          </div>
        </motion.div>

        {/* Top Spending Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0a0a14] border border-white/5 rounded-[32px] p-6 lg:p-10 flex flex-col min-h-[350px]"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-rose-500"></span>
             Top Spending Categories
          </h3>
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-between">
            {topCategories.length > 0 ? (
              <>
                <div className="w-full lg:w-1/2 h-48 lg:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {topCategories.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            onClick={() => setSelectedCategory(entry.name)}
                            className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a14', color: '#f1f5f9' }}
                        itemStyle={{ fontSize: '13px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 mt-6 lg:mt-0 lg:pl-8 space-y-4">
                  {topCategories.slice(0, 5).map((category, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <div className="flex flex-col">
                          <span className="text-slate-300 font-medium">{category.name}</span>
                          {comparePeriod && category.previous > 0 && (
                            <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${category.isUp ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {category.isUp ? <TrendingUp className="w-3 h-3" /> : (category.isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />)}
                                {category.changeStr}
                                <span className="text-slate-500 ml-1">vs {formatCurrency(category.previous)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-slate-100">{formatCurrency(category.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex w-full h-full items-center justify-center text-slate-500 text-sm">No expenses yet.</div>
            )}
          </div>
        </motion.div>

        {/* Monthly Spending Across Categories (Stacked Bar) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-1 xl:col-span-2 bg-[#0a0a14] border border-white/5 rounded-[32px] p-6 lg:p-10 flex flex-col min-h-[400px]"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-primary"></span>
             Monthly Spending Timeline
          </h3>
          <div className="flex-1">
            {monthlyCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyCategoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis width={65} stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a14', color: '#f1f5f9' }}
                    itemStyle={{ fontSize: '13px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(value: number) => [formatCurrency(value), undefined]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  {expenseCategories.map((cat, idx) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[idx % COLORS.length]} radius={[0, 0, 0, 0]} />
                  ))}
                  {comparePeriod && (
                    <Line type="monotone" dataKey="prevExpense" name="Prev Year Total Exps" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={{ r: 4 }} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">No monthly data yet.</div>
            )}
          </div>
        </motion.div>

        {/* Spending Categorized by Expense Type Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="col-span-1 xl:col-span-2 bg-[#0a0a14] border border-white/5 rounded-[32px] p-6 lg:p-10 flex flex-col min-h-[400px]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-primary"></span>
                 Spending by Expense Type (All-Time)
              </h3>
              <p className="text-xs text-slate-500 mt-1">Detailed breakdown of expenses by category</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Distribution Percentage</span>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-8">
            {spendingByCategoryData.length > 0 ? (
              <>
                <div className="w-full lg:w-1/2 h-[250px] min-h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingByCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={90}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={true}
                        dataKey="value"
                        stroke="rgba(10,10,20,0.8)"
                        strokeWidth={2}
                      >
                        {spendingByCategoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-spending-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            onClick={() => setSelectedCategory(entry.name)}
                            className="cursor-pointer hover:opacity-85 transition-opacity outline-none"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a14', color: '#f1f5f9' }}
                        itemStyle={{ fontSize: '13px' }}
                        formatter={(value: number, name: string, props: any) => [
                          `${formatCurrency(value)} (${props.payload.percentage}%)`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                  {spendingByCategoryData.map((category, idx) => (
                    <div 
                      key={category.name} 
                      onClick={() => setSelectedCategory(category.name)}
                      className={`flex flex-col p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${selectedCategory === category.name ? 'border-primary/50 bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="text-slate-200 text-xs font-semibold truncate max-w-[120px]">{category.name}</span>
                        </div>
                        <span className="text-primary text-xs font-bold">{category.percentage}%</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">Amount</span>
                        <span className="text-xs text-slate-300 font-mono font-semibold">{formatCurrency(category.value)}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${category.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex w-full h-[250px] items-center justify-center text-slate-500 text-sm">No expense transactions recorded yet.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Filtered Transactions List */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0a0a14] border border-white/5 rounded-[32px] p-6 lg:p-10 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Transactions: {selectedCategory}
                </h3>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center py-4">No transactions found for this category.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTransactions.map((tx, i) => (
                      <motion.div 
                        key={tx.id} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: Math.min(i * 0.05, 0.5) }} 
                        className="flex justify-between items-center p-4 bg-[#05050f] rounded-2xl border border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{tx.category}</p>
                            <p className="text-xs text-slate-500 text-opacity-80 mt-0.5">{new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                          </div>
                        </div>
                        <p className={`font-bold tracking-tight text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
