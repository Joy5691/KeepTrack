import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactions } from '../hooks/useTransactions';
import { X, Calendar, Tag, CreditCard } from 'lucide-react';
import { Transaction } from '../types';

const INCOME_CATEGORIES = [
  'Salary', 'Freelance Income', 'Business Profit', 'Bonus', 'Commission',
  'Investment Returns', 'Rental Income', 'Savings', 'Gift Received', 'Refunds / Cashback', 'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Food & Groceries', 'Rent / Housing', 'Utilities (Electricity, Water, Gas, Printing)',
  'Mobile Recharge', 'Transportation', 'Shopping', 'Entertainment', 'Health & Medical', 'Education', 'Subscriptions', 'Miscellaneous'
];

export function TransactionModal({ isOpen, onClose, initialTx }: { isOpen: boolean, onClose: () => void, initialTx?: Transaction | null }) {
  const { addTransaction, editTransaction } = useTransactions();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [source, setSource] = useState('bank');

  useEffect(() => {
    if (initialTx) {
      setType(initialTx.type as 'expense' | 'income');
      setAmount(initialTx.amount.toString());
      setCategory(initialTx.category);
      setSource(initialTx.source || 'bank');
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setSource('bank');
    }
  }, [initialTx, isOpen]);

  useEffect(() => {
    if (!initialTx && isOpen) {
      setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    }
  }, [type, initialTx, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    if (initialTx && editTransaction) {
      await editTransaction(initialTx.id, {
        type,
        amount: parseFloat(amount),
        category,
        source,
      });
    } else {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        source,
        date: Date.now(),
        notes: ''
      });
    }
    
    setAmount('');
    setCategory('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel p-6 rounded-3xl w-full max-w-md relative z-10 text-slate-800 dark:text-white"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white">New Transaction</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500 dark:text-slate-300"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/40 dark:border-none">
                <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${type === 'expense' ? 'bg-white dark:bg-black/40 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}>Expense</button>
                <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${type === 'income' ? 'bg-white dark:bg-black/40 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>Income</button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 dark:text-slate-500 text-lg font-bold">৳</span>
                </div>
                <input 
                  type="number" step="0.01" required
                  value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold outline-none focus:border-primary text-slate-800 dark:text-slate-100 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="relative">
                   <div className="absolute top-3 left-3"><Tag className="w-4 h-4 text-slate-400 dark:text-slate-500"/></div>
                   <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-primary text-sm appearance-none text-slate-800 dark:text-slate-200 cursor-pointer">
                     {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                       <option key={cat} value={cat} className="bg-white dark:bg-[#0c0c16] text-slate-800 dark:text-slate-100">{cat}</option>
                     ))}
                   </select>
                 </div>
                 <div className="relative">
                  <div className="absolute top-3 left-3"><CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500"/></div>
                  <select value={source} onChange={e => setSource(e.target.value)} className="w-full bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-primary text-sm appearance-none text-slate-800 dark:text-slate-200 cursor-pointer">
                    <option value="bank" className="bg-white dark:bg-[#0c0c16] text-slate-800 dark:text-slate-100">Bank</option>
                    <option value="cash" className="bg-white dark:bg-[#0c0c16] text-slate-800 dark:text-slate-100">Cash Wallet</option>
                  </select>
                 </div>
              </div>
              
              <button type="submit" className="w-full py-4 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity mt-4 shadow-lg shadow-primary/30">
                Save {type === 'expense' ? 'Expense' : 'Income'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
