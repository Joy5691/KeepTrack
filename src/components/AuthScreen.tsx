import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { CompassLogo } from './CompassLogo';

export function AuthScreen() {
  const { login } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setErrorMsg(null);
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed before completing. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setErrorMsg('Your browser blocked the sign-in popup. Please allow popups for this site, or click "Open in New Tab" in the top right to try again.');
      } else if (error.message.includes('auth/unauthorized-domain')) {
         setErrorMsg('This temporary preview domain is not authorized. Open Firebase Console > Authentication > Settings > Authorized Domains, and add the domain of this preview window.');
      } else {
        setErrorMsg(`Sign-in failed: ${error.message}. Make sure Google sign-in is enabled in your Firebase console.`);
      }
    }
  };

  return (
    <div className="min-h-screen galaxy-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse mix-blend-screen mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000 mix-blend-screen mix-blend-multiply" />
      
      <button onClick={toggleTheme} className="absolute top-8 right-8 z-20 text-foreground/50 hover:text-foreground">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full z-10 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        <div className="w-16 h-16 mb-6 flex items-center justify-center">
          <CompassLogo size={64} animateContinuous={true} />
        </div>
        
        <h1 className="text-4xl font-display font-bold tracking-tight mb-2">KeepTrack</h1>
        <p className="text-muted-foreground mb-8 text-lg">Your intelligent financial companion.</p>
        
        <div className="space-y-4 w-full mb-8">
          <Feature icon={<Wallet className="w-5 h-5 text-primary" />} text="Track spending instantly" />
          <Feature icon={<TrendingUp className="w-5 h-5 text-purple-500" />} text="Actionable saving insights" />
          <Feature icon={<ShieldAlert className="w-5 h-5 text-emerald-500" />} text="Bank-grade encryption" />
        </div>
        
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-6 text-sm text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 flex items-start text-left"
            >
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogin}
          className="w-full bg-foreground text-background py-4 rounded-xl font-medium tracking-wide hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>
      </motion.div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10"
    >
      <div className="p-2 bg-white/10 dark:bg-black/30 rounded-lg">{icon}</div>
      <span className="font-medium">{text}</span>
    </motion.div>
  )
}
