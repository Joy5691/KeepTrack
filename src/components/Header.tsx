import React from 'react';
import { Menu, Search, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="px-4 md:px-8 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-[#03030a]/80 backdrop-blur-xl z-20">
      <div className="flex flex-col">
        <h2 className="text-xl font-display font-bold tracking-tight text-slate-800 dark:text-white">Overview</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">{currentDate}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button onClick={onMenuClick} className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
