import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Compass } from 'lucide-react';

interface SuccessDetails {
  type: string;
  amount: number;
  category: string;
}

export function TransactionSuccessAnimation() {
  const [active, setActive] = useState(false);
  const [details, setDetails] = useState<SuccessDetails | null>(null);

  useEffect(() => {
    const handleSuccess = (e: Event) => {
      const customEvent = e as CustomEvent<SuccessDetails>;
      setDetails(customEvent.detail);
      setActive(true);

      // Auto dismiss after 2.8 seconds
      const timer = setTimeout(() => {
        setActive(false);
      }, 2800);

      return () => clearTimeout(timer);
    };

    window.addEventListener('transaction-success', handleSuccess);
    return () => {
      window.removeEventListener('transaction-success', handleSuccess);
    };
  }, []);

  // Generate 20 confetti pieces with random paths
  const confettiPieces = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * 2 * Math.PI + (Math.random() - 0.5) * 0.2;
    const distance = 80 + Math.random() * 120;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const size = 6 + Math.random() * 10;
    const colors = ['#0088ff', '#ffb300', '#10b981', '#a855f7', '#f43f5e'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = 0.8 + Math.random() * 0.8;

    return {
      id: i,
      x,
      y,
      size,
      color,
      duration,
      delay: Math.random() * 0.1
    };
  });

  return (
    <AnimatePresence>
      {active && details && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(false)}
            className="absolute inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md"
          />

          {/* Celebration Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 20 } 
            }}
            exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.25 } }}
            className="bg-white dark:bg-[#0c0c16] border border-slate-200/50 dark:border-white/10 p-8 rounded-[36px] w-full max-w-sm text-center relative shadow-2xl overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 dark:bg-primary/10 rounded-full blur-[60px] pointer-events-none -z-10" />

            {/* Confetti Explosion Layer */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {confettiPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: piece.x,
                    y: piece.y,
                    scale: [0, 1.2, 0.8, 0],
                    opacity: [1, 1, 0.8, 0],
                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
                  }}
                  transition={{
                    duration: piece.duration,
                    delay: piece.delay,
                    ease: "easeOut"
                  }}
                  style={{
                    position: 'absolute',
                    width: piece.size,
                    height: piece.size,
                    borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                    backgroundColor: piece.color,
                  }}
                />
              ))}
            </div>

            {/* Rotating Compass Success Logo */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              {/* Spinning compass background circle */}
              <motion.div
                initial={{ rotate: -90, scale: 0.5 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-slate-50 dark:bg-[#111122] border border-slate-100 dark:border-white/5 flex items-center justify-center p-3 relative shadow-inner"
              >
                <img 
                  src="/logo.svg" 
                  alt="Compass" 
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,136,255,0.2)]"
                />
              </motion.div>

              {/* Floating Pulse Rings */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-2 border-2 border-primary/30 rounded-full -z-10"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                className="absolute inset-2 border border-accent/30 rounded-full -z-10"
              />

              {/* Checkmark Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.4 }}
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-2 border-white dark:border-[#0c0c16]"
              >
                <Check className="w-5 h-5 stroke-[3px]" />
              </motion.div>
            </div>

            {/* Celebration Text Details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h4 className="text-xs uppercase tracking-widest font-mono text-emerald-500 font-bold">
                {details.type === 'edit' ? 'Changes Saved' : 'Transaction Success'}
              </h4>
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                {details.type === 'income' ? '+' : '-'}৳{details.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {details.category}
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
                Your financial compass has been realigned successfully.
              </p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
