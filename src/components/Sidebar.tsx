import React from 'react';
import { LayoutDashboard, WalletCards, Target, PieChart, Info, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { CompassLogo } from './CompassLogo';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: WalletCards },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
];

export function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }: { activeTab: string, setActiveTab: (id: string) => void, isMobileOpen?: boolean, setIsMobileOpen?: (open: boolean) => void }) {
  const { logout, user } = useAuth();
  
  const content = (
    <>
      <div>
        <div className="flex items-center justify-between px-4 mb-10">
          <div className="flex items-center space-x-3">
            <CompassLogo size={36} animateContinuous={true} className="cursor-pointer" />
            <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">KeepTrack</span>
          </div>
          {setIsMobileOpen && (
             <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
               <X className="w-5 h-5" />
             </button>
          )}
        </div>
        
        <nav className="space-y-1.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer relative ${activeTab === item.id ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10 flex items-center space-x-3 shadow-sm">
          <img src={user?.photoURL || ''} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10" />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.displayName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2.5 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer text-sm font-medium">
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="w-64 hidden md:flex flex-col justify-between py-8 px-4 border-r border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-[#05050f]/50 backdrop-blur-xl z-20">
        {content}
      </aside>
      
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden" 
              onClick={() => setIsMobileOpen?.(false)} 
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 md:hidden flex flex-col justify-between py-8 px-4 border-r border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#05050f] z-50 shadow-2xl"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
