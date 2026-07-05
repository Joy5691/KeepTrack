import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, Edit3, AlertTriangle, X, Trash } from 'lucide-react';
import { Transaction } from '../types';

export function TransactionsView({ onAddTx, onEditTx }: { onAddTx: () => void, onEditTx: (tx: Transaction) => void }) {
  const { transactions, deleteTransaction, clearAllTransactions, loading: txLoading } = useTransactions();
  const { clearAllBudgets, loading: budgetLoading } = useBudgets();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const loading = txLoading || budgetLoading;
  const formatCurrency = (val: number) => `৳${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await clearAllTransactions();
      await clearAllBudgets();
      setShowConfirmPopup(false);
    } catch (error) {
      console.error("Error erasing all data:", error);
    } finally {
      setIsClearing(false);
    }
  };

  if (loading && !isClearing) {
     return <div className="animate-pulse h-full bg-white/5 rounded-[32px]" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-20 md:pb-0 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-display font-bold">Transaction History</h2>
        <div className="flex items-center gap-2.5">
          {transactions.length > 0 && (
            <button 
              onClick={() => setShowConfirmPopup(true)} 
              className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-rose-500/20 flex items-center cursor-pointer"
            >
              <Trash className="w-4 h-4 mr-2"/> Clear All Data
            </button>
          )}
          <button onClick={onAddTx} className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-primary/20 flex items-center cursor-pointer">
            <Plus className="w-4 h-4 mr-2"/> Add Transaction
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-[#0a0a14] border border-white/5 rounded-[32px] overflow-hidden flex flex-col min-h-0">
         <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
            {transactions.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500 py-12">
                 <p className="text-sm">No transactions recorded yet.</p>
                 <p className="text-xs text-slate-600 mt-1">Add a transaction to get started.</p>
              </div>
            ) : (
              transactions.map((tx, i) => (
                <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5"/> : <ArrowDownRight className="w-5 h-5"/>}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{tx.category}</p>
                      <p className="text-xs text-slate-500 text-opacity-80 mt-0.5">{new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'})} • {tx.source.charAt(0).toUpperCase() + tx.source.slice(1)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold tracking-tight ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => onEditTx(tx)} className="p-2 text-slate-500 hover:text-primary bg-white/5 hover:bg-primary/20 rounded-lg transition-colors border border-transparent hover:border-primary/20 cursor-pointer">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-slate-500 hover:text-rose-500 bg-white/5 hover:bg-rose-500/20 rounded-lg transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
         </div>
      </div>

      {/* Clear All Confirmation Popup Modal */}
      <AnimatePresence>
        {showConfirmPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isClearing && setShowConfirmPopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0c0c16] border border-rose-500/20 p-6 rounded-3xl w-full max-w-md relative z-10 overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full z-0 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Erase All Data?</h2>
                    <p className="text-xs text-rose-400/80 font-medium">This cannot be undone</p>
                  </div>
                </div>
                {!isClearing && (
                  <button 
                    onClick={() => setShowConfirmPopup(false)} 
                    className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5"/>
                  </button>
                )}
              </div>

              <div className="text-sm text-slate-300 space-y-3 mb-6 relative z-10 leading-relaxed">
                <p>
                  Are you absolutely sure you want to clear your data? This will:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  <li>Permanently delete <span className="text-white font-semibold">all {transactions.length} transactions</span> from your history.</li>
                  <li>Reset all of your custom budget thresholds and limit categories.</li>
                  <li>Wipe all related documents securely from your cloud account in Firebase.</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button
                  type="button"
                  disabled={isClearing}
                  onClick={() => setShowConfirmPopup(false)}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  disabled={isClearing}
                  className="py-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isClearing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Erasing...
                    </>
                  ) : (
                    'Yes, Clear All'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
