import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { WifiOff, AlertTriangle, ArrowLeft, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-2xl"
      >
        <div className="flex justify-center mb-12">
          <div className="w-24 h-24 bg-surface-container-high rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl">
            <WifiOff className="w-10 h-10 text-primary animate-bounce" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-500 mb-6 inline-block">Error Code: 404 / Protocol Interruption</span>
          <h1 className="text-7xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-8">
            Signal <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-primary italic">Lost.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans mb-12 leading-relaxed">
            The strategic node you are attempting to reach has detached from the primary matrix. Return to local control or re-authenticate your session.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link 
            to="/" 
            className="px-10 py-5 rounded-full bg-primary text-background font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center gap-3"
          >
            <Home className="w-4 h-4" />
            Return to Core
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-10 py-5 rounded-full bg-white/5 border border-white/10 text-on-surface font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all active:scale-95 flex items-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Node
          </button>
        </motion.div>
      </motion.div>

      {/* Decorative Matrix Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12" />
    </div>
  );
};

export default NotFound;
