import React from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Check, Zap, CreditCard, ArrowRight, Loader2, Star } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatCurrency } from '../../lib/utils';

const Subscription: React.FC = () => {
  const { profile } = useAuth();
  const { 
    subscription, 
    loading, 
    createCheckoutSession, 
    createPortalSession,
    mockActiveSubscription,
    isActive 
  } = useSubscription();

  const [processing, setProcessing] = React.useState<string | null>(null);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setProcessing(planName);
    try {
      if (priceId === 'mock_active') {
        await mockActiveSubscription();
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
    <div className="max-w-5xl mx-auto p-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Access Management</h1>
      </div>
      <p className="text-on-surface-variant max-w-2xl mb-12">
        Manage your Matrix connection, billing details, and play tier.
      </p>

      {/* Current Plan Card */}
      <div className="glass-card overflow-hidden mb-12">
        <div className={cn(
          "h-2 w-full",
          isActive ? "bg-gradient-to-r from-primary to-secondary" : "bg-white/10"
        )} />
        <div className="p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-12">
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              {isActive ? (
                <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Active Access
                </div>
              ) : (
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  Basic Tier / Spectator
                </div>
              )}
            </div>

            <h2 className="text-5xl font-display font-black uppercase tracking-tight mb-2">
              {isActive ? planName : 'Spectator'}
            </h2>
            <p className="text-on-surface-variant font-sans text-lg">
              {isActive 
                ? `${planPrice} / ${subscription?.plan_type === 'yearly' ? 'year' : 'month'}` 
                : 'Free account - no draw entry.'}
            </p>
            {subscription?.renewal_date && (
              <p className="text-xs text-on-surface-variant mt-4 uppercase tracking-widest font-bold">
                Next Billing: {new Date(subscription.renewal_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 min-w-[240px]">
            {isActive ? (
               <button 
                onClick={handleManage}
                disabled={!!processing}
                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-on-surface font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                 {processing === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} 
                 Manage Billing
               </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleUpgrade('price_monthly_id', 'monthly')}
                  disabled={!!processing}
                  className="w-full py-4 rounded-xl bg-primary text-background font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(78,222,163,0.3)] disabled:opacity-50"
                >
                  {processing === 'monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} 
                  Monthly (£25/mo)
                </button>
                <button 
                  onClick={() => handleUpgrade('price_yearly_id', 'yearly')}
                  disabled={!!processing}
                  className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-on-surface font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {processing === 'yearly' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />} 
                  Yearly (£250/yr)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Benefits specific to plan */}
        <div className="bg-surface-container-high/30 border-t border-white/5 p-10 md:px-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { text: 'Entry into monthly $245,000 prize pool', active: isActive },
            { text: 'Automated verified score ingestion', active: isActive },
            { text: 'Charitable impact allocation matching', active: isActive },
            { text: 'Leaderboard tracking & history', active: true },
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                benefit.active ? "bg-primary/20 text-primary" : "bg-white/5 text-white/20"
              )}>
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className={cn(
                "text-sm font-medium",
                benefit.active ? "text-on-surface" : "text-on-surface-variant opacity-50"
              )}>
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-8 group cursor-pointer">
          <Shield className="w-8 h-8 text-on-surface-variant mb-6 group-hover:text-primary transition-colors" />
          <h3 className="text-xl font-display font-bold uppercase mb-2">Privacy & Protocol</h3>
          <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Update your login credentials, 2FA settings, and review active sessions.</p>
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Settings <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-8 group cursor-pointer">
          <Zap className="w-8 h-8 text-on-surface-variant mb-6 group-hover:text-secondary transition-colors" />
          <h3 className="text-xl font-display font-bold uppercase mb-2">Connected Accounts</h3>
          <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Manage links to official handicap systems like Golf Australia or GHIN.</p>
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
            Integrations <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.div>
      </div>

      {/* Developer Testing Section */}
      {!isActive && (
        <div className="mt-20 pt-10 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-6 text-center">Protocol Simulation (Dev Mode)</h4>
          <div className="flex justify-center">
            <button 
              onClick={() => handleUpgrade('mock_active', 'mock')}
              disabled={!!processing}
              className="px-6 py-3 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-bold uppercase tracking-widest text-[9px] hover:bg-secondary/20 transition-all active:scale-95 flex items-center gap-3"
            >
              {processing === 'mock' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              Bypass Stripe (Simulate Active Status)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
