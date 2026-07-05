import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionModal } from './components/TransactionModal';
import { TransactionSuccessAnimation } from './components/TransactionSuccessAnimation';
import { Transaction } from './types';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [txOpen, setTxOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#03030a]">
        <div className="relative flex flex-col items-center">
          {/* Logo with continuous rotation */}
          <motion.img
            src="/logo.svg"
            alt="Loading..."
            className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(0,136,255,0.3)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Glowing pulse background ring */}
          <div className="absolute -inset-6 bg-primary/10 rounded-full blur-2xl -z-10 animate-pulse" />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 tracking-tight">KeepTrack</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">Orienting financial compass...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxOpen(true);
  };

  const handleCloseTx = () => {
    setEditingTx(null);
    setTxOpen(false);
  };

  const wrapSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#03030a] flex overflow-hidden relative text-slate-800 dark:text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={wrapSetActiveTab} isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-300 w-full md:pl-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
             {activeTab === 'dashboard' && (
               <motion.div key="dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                 <Dashboard onAddTx={() => setTxOpen(true)} />
               </motion.div>
             )}
             {activeTab === 'transactions' && (
               <motion.div key="transactions" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                 <TransactionsView onAddTx={() => setTxOpen(true)} onEditTx={handleEditTx} />
               </motion.div>
             )}
             {activeTab === 'analytics' && (
               <motion.div key="analytics" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                 <AnalyticsView />
               </motion.div>
             )}
             {activeTab === 'goals' && (
               <motion.div key="goals" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center text-slate-500">
                 <h2 className="text-2xl font-bold mb-2">Goals coming soon</h2>
                 <p>Set targets and track your financial journey.</p>
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </main>

      <TransactionModal isOpen={txOpen} onClose={handleCloseTx} initialTx={editingTx} />
      <TransactionSuccessAnimation />
    </div>
  );
}
