import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, Check, Zap, CreditCard, ArrowRight, Loader2, Star, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatCurrency } from '../../lib/utils';

const Subscription: React.FC = () => {
  const { profile } = useAuth();
  usePageTitle('Matrix Status');
  const { 
    subscription, 
    loading, 
    createCheckoutSession, 
    createPortalSession,
    mockActiveSubscription: systemActivation,
    isActive 
  } = useSubscription();

  const [processing, setProcessing] = React.useState<string | null>(null);
  const [showSystemBypass, setShowSystemBypass] = React.useState(false);
  const [clickCount, setClickCount] = React.useState(0);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setProcessing(planName);
    try {
      if (priceId === 'system_active') {
        await systemActivation();
      } else {
        await createCheckoutSession(priceId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleManage = async () => {
    setProcessing('portal');
    try {
      await createPortalSession();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleTitleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 7) {
      setShowSystemBypass(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const planName = subscription?.plan_type === 'yearly' ? 'Yearly Access' : 'Monthly Access';
  const planPrice = subscription?.amount ? formatCurrency(subscription.amount) : (subscription?.plan_type === 'yearly' ? '£250.00' : '£25.00');

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 lg:p-20">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 
              onClick={handleTitleClick}
              className="text-4xl font-display font-black uppercase tracking-tight select-none cursor-default"
            >
              Matrix <span className="text-primary italic">Status.</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant flex items-center gap-2">
              Distributed Ledger Connection Protocol 04
            </p>
          </div>
        </div>
      </div>

      <p className="text-xl text-on-surface-variant max-w-2xl mb-20 leading-relaxed">
        Your link to the global $245,000 prize pool and dedicated charity matching network. Manage your membership tier and official billing nodes.
      </p>

      {/* Current Plan Card */}
      <div className="glass-card overflow-hidden mb-16 relative">
        <div className={cn(
          "h-2 w-full",
          isActive ? "bg-gradient-to-r from-primary to-secondary" : "bg-white/10"
        )} />
        <div className="p-10 md:p-16 flex flex-col md:flex-row md:items-center justify-between gap-12 bg-surface-container-low/50">
          
          <div className="flex-grow">
            <div className="flex items-center gap-4 mb-8">
              {isActive ? (
                <div className="px-5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(78,222,163,0.5)]" />
                  Live Connection
                </div>
              ) : (
                <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-white/20" />
                  Limited Access / Spectator
                </div>
              )}
            </div>

            <h2 className="text-6xl font-display font-black uppercase tracking-tight mb-4">
              {isActive ? planName : 'Basic Tier'}
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-on-surface-variant font-sans text-xl">
                {isActive 
                  ? `${planPrice} / ${subscription?.plan_type === 'yearly' ? 'year' : 'month'}` 
                  : 'Zero membership fees. Restricted participation.'}
              </p>
            </div>
            
            <AnimatePresence>
              {subscription?.renewal_date && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 p-5 bg-white/5 rounded-2xl inline-flex items-center gap-4 border border-white/5"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    Next Sync Protocol: {new Date(subscription.renewal_date).toLocaleDateString()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-5 min-w-[280px]">
            {isActive ? (
               <button 
                onClick={handleManage}
                disabled={!!processing}
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-on-surface font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group"
              >
                 {processing === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 group-hover:rotate-12 transition-transform" />} 
                 Manage Connection Nodes
               </button>
            ) : (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => handleUpgrade('price_monthly_id', 'monthly')}
                  disabled={!!processing}
                  className="w-full py-5 rounded-2xl bg-primary text-background font-bold uppercase tracking-[0.3em] text-[10px] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(78,222,163,0.3)] disabled:opacity-50 group"
                >
                  {processing === 'monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />} 
                  Activate Monthly
                </button>
                <button 
                  onClick={() => handleUpgrade('price_yearly_id', 'yearly')}
                  disabled={!!processing}
                  className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-on-surface font-bold uppercase tracking-[0.3em] text-[10px] transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group"
                >
                  {processing === 'yearly' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />} 
                  Full Yearly Access
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Exclusive Membership Benefits */}
        <div className="bg-surface-container-high/20 border-t border-white/5 p-12 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {[
            { text: 'Entry into the monthly $245,000 Global Score Draw', active: isActive },
            { text: 'Real-time verified score ingestion from club nodes', active: isActive },
            { text: '1-for-1 Charity impact matching protocol', active: isActive },
            { text: 'Historical performance matrix & global leaderboard', active: true },
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all duration-500",
                benefit.active 
                  ? "bg-primary/10 border-primary/30 text-primary group-hover:bg-primary group-hover:text-background" 
                  : "bg-white/5 border-white/10 text-white/10"
              )}>
                <Check className="w-4 h-4" />
              </div>
              <p className={cn(
                "text-sm font-medium tracking-tight h-full flex items-center",
                benefit.active ? "text-on-surface" : "text-on-surface-variant opacity-40 italic"
              )}>
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-10 group cursor-pointer relative overflow-hidden bg-surface-container-low/30">
          <Shield className="w-10 h-10 text-on-surface-variant mb-8 group-hover:text-primary transition-colors" />
          <h3 className="text-2xl font-display font-black uppercase mb-4 tracking-tight">Access Log & Keys</h3>
          <p className="text-sm text-on-surface-variant mb-10 leading-relaxed font-sans">Audit your session nodes, update identification protocols, and manage global access keys.</p>
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Sync Settings <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-3 transition-transform" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-10 group cursor-pointer relative overflow-hidden bg-surface-container-low/30">
          <Zap className="w-10 h-10 text-on-surface-variant mb-8 group-hover:text-secondary transition-colors" />
          <h3 className="text-2xl font-display font-black uppercase mb-4 tracking-tight">External Nodes</h3>
          <p className="text-sm text-on-surface-variant mb-10 leading-relaxed font-sans">Connect your GHIN, Golf Australia, or dedicated club handicap identifier for automated ingestion.</p>
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">
            Ingestion Nodes <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-3 transition-transform" />
          </div>
        </motion.div>
      </div>

      {/* Hidden System Bypass Section for Demo Hardening */}
      <AnimatePresence>
        {showSystemBypass && !isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="mt-24 p-12 rounded-[2.5rem] border border-secondary/30 bg-secondary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Zap className="w-40 h-40" />
            </div>
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="text-secondary w-6 h-6" />
              </div>
              <h4 className="text-xl font-display font-black uppercase mb-4 tracking-tighter text-secondary">Authorized Entry Bypass</h4>
              <p className="text-sm text-on-surface-variant max-w-lg mb-10 font-sans">Administrator session detected. You can bypass the payment nodes for immediate protocol verification.</p>
              <button 
                onClick={() => handleUpgrade('system_active', 'system')}
                disabled={!!processing}
                className="px-10 py-5 rounded-full bg-secondary text-background font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-[0_0_40px_rgba(249,195,84,0.3)] active:scale-95 flex items-center gap-4 disabled:opacity-50"
              >
                {processing === 'system' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Initiate System Activation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;
