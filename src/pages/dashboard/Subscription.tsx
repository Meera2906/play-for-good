import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Zap, CreditCard, ArrowRight, Loader2, Star, Calendar, Heart, Award } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';
import { cn, formatCurrency } from '../../lib/utils';
import CheckoutConfirmation from '../../components/subscription/CheckoutConfirmation';
import type { Charity } from '../../types';

const Subscription: React.FC = () => {
  const { profile } = useAuth();
  usePageTitle('Membership Control');
  const { 
    subscription, 
    loading, 
    createCheckoutSession, 
    createPortalSession,
    activateMembership,
    isActive 
  } = useSubscription();

  const [processing, setProcessing] = React.useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState<{type: 'monthly' | 'yearly', price: number} | null>(null);
  const [charities, setCharities] = React.useState<Charity[]>([]);

  React.useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*');
      if (data) setCharities(data);
    };
    fetchCharities();
  }, []);

  const handleActivate = async () => {
    if (!selectedPlan) return;
    await activateMembership(selectedPlan.type, selectedPlan.price);
  };

  const handleManage = async () => {
    setProcessing('portal');
    try {
      if (subscription?.stripe_customer_id) {
        await createPortalSession();
      } else {
        // Fallback for simulation mode
        alert('Billing portal is only available for Stripe-managed subscriptions.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const activeCharity = charities.find(c => c.id === (subscription?.charity_id || profile?.selected_charity_id));

  // Only show a full-page loader if we have NO subscription data yet and are initially loading
  // This prevents the CheckoutConfirmation modal from unmounting/reappearing during refreshes
  if (loading && !subscription && !selectedPlan) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlanName = subscription?.plan_type === 'yearly' ? 'Sovereign Yearly' : 'Elite Monthly';

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 lg:p-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
        <div>
          <div className="flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-primary font-sans text-[10px] font-bold uppercase tracking-[0.2em]">Secure Membership Node</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85]">
            Membership <span className="text-primary italic">Control.</span>
          </h1>
          <p className="mt-8 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Manage your standing in the elite circle. Your membership fuels global change while providing absolute precision in your performance rewards.
          </p>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-6 p-6 bg-surface-container-high rounded-[2rem] border border-white/5">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Status</span>
              <span className={cn(
                "font-display font-bold uppercase tracking-tight text-xl flex items-center justify-end gap-3",
                subscription?.status === 'active' ? "text-primary" : (subscription?.status === 'cancelled' ? "text-red-500" : "text-amber-500")
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  subscription?.status === 'active' ? "bg-primary" : (subscription?.status === 'cancelled' ? "bg-red-500" : "bg-amber-500")
                )} />
                {subscription?.status || 'Inactive'}
              </span>
            </div>
            <div className="w-px h-10 bg-white/5" />
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Tier</span>
              <span className="font-display font-bold uppercase tracking-tight text-xl">{currentPlanName}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Plans Section */}
        <div className="lg:col-span-2 space-y-12">
          {isActive ? (
            <div className="glass-card p-1 rounded-[2.5rem] overflow-hidden">
              <div className="bg-surface-container-low/50 p-12">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-display font-black uppercase tracking-tight">Current Subscription</h2>
                  <div className="flex items-center gap-2 px-6 py-2 bg-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">
                    <Award className="w-4 h-4" />
                    Premium Access
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Billing Cycle</span>
                      <p className="text-2xl font-display font-bold uppercase">{subscription?.plan_type === 'yearly' ? 'Yearly Billing' : 'Monthly Billing'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Next Payment Date</span>
                      <div className="flex items-center gap-4 text-2xl font-display font-bold uppercase">
                        <Calendar className="w-6 h-6 text-primary" />
                        {new Date(subscription?.renewal_date || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Amount</span>
                      <p className="text-2xl font-display font-bold uppercase">{subscription?.amount ? formatCurrency(subscription.amount) : 'N/A'}</p>
                    </div>
                    <button 
                      onClick={handleManage}
                      disabled={!!processing}
                      className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-on-surface font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group"
                    >
                      {processing === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} 
                      Manage Billing Nodes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { 
                  type: 'monthly' as const, 
                  name: 'Elite Monthly', 
                  price: 25, 
                  icon: Zap, 
                  color: 'primary',
                  desc: 'Perfect for consistent monthly engagement.'
                },
                { 
                  type: 'yearly' as const, 
                  name: 'Sovereign Yearly', 
                  price: 240, 
                  icon: Star, 
                  color: 'secondary',
                  desc: 'The gold standard for dedicated catalysts.'
                },
              ].map((plan) => (
                <div key={plan.type} className="glass-card p-1 rounded-[2.5rem] group cursor-pointer hover:scale-[1.02] transition-all duration-500 shadow-2xl shadow-black/20" onClick={() => setSelectedPlan({type: plan.type, price: plan.price})}>
                  <div className="bg-surface-container-low/50 p-10 h-full flex flex-col">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 shadow-lg",
                      plan.color === 'primary' ? "bg-primary/20 text-primary shadow-primary/20" : "bg-secondary/20 text-secondary shadow-secondary/20"
                    )}>
                      <plan.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4">{plan.name}</h3>
                    <p className="text-on-surface-variant text-sm mb-10 leading-relaxed font-sans">{plan.desc}</p>
                    
                    <div className="mt-auto pt-10 border-t border-white/5 flex items-baseline gap-2">
                      <span className="text-4xl font-display font-black">{formatCurrency(plan.price)}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">/ {plan.type === 'monthly' ? 'Month' : 'Year'}</span>
                    </div>

                    <div className="mt-6 flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      Select Plan <ArrowRight className="w-4 h-4 ml-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Zap, title: 'Instant Ingestion', desc: 'Real-time verified score ingestion from club global nodes.' },
              { icon: ShieldCheck, title: 'Verified Impact', desc: '1-for-1 Charity impact matching protocol on every performance.' },
              { icon: Award, title: 'Elite Rewards', desc: 'Exclusive access to the $245,000 monthly prize pool.' },
              { icon: CreditCard, title: 'Secure Billing', desc: 'Premium end-to-end encrypted subscription management.' }
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-6 p-6 rounded-3xl bg-white/20 border border-white/5 group hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-2">{benefit.title}</h4>
                  <p className="text-xs text-on-surface-variant font-sans leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Mini Status / Charity */}
        <div className="space-y-10">
          <div className="glass-card p-1 rounded-[2.5rem]">
            <div className="bg-surface-container-low p-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-surface-container-high rounded-3xl border border-white/5 flex items-center justify-center mb-8 relative">
                 {activeCharity ? (
                   <img src={activeCharity.logo_url} alt={activeCharity.name} className="w-16 h-16 object-contain" />
                 ) : (
                   <Heart className="w-12 h-12 text-on-surface-variant opacity-20" />
                 )}
                 {isActive && (
                   <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center border-4 border-surface-container-low shadow-xl">
                      <ShieldCheck className="w-5 h-5 text-background" />
                   </div>
                 )}
              </div>
              <h3 className="text-xl font-display font-black uppercase mb-3 tracking-tight">Active Partner</h3>
              <p className="text-xs text-on-surface-variant mb-10 font-sans leading-relaxed">
                {activeCharity 
                  ? `Your performance currently supports ${activeCharity.name}.` 
                  : 'Please select a charity partner in your profile settings.'}
              </p>
              
              <div className="w-full h-px bg-white/5 mb-8" />
              
              <div className="grid grid-cols-2 gap-8 w-full">
                <div className="text-left">
                   <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Impact</span>
                   <p className="text-xl font-display font-bold text-primary">{formatCurrency(profile?.total_impact || 0)}</p>
                </div>
                <div className="text-left">
                   <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Status</span>
                   <p className="text-xl font-display font-bold text-white uppercase">{isActive ? 'Live' : 'Off'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-surface-container-high border border-white/5 flex items-center gap-6 group hover:bg-white/5 transition-all cursor-pointer">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-secondary" />
             </div>
             <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-1">Rewards Nodes</span>
                <p className="text-sm font-bold text-white uppercase">Historical Analytics</p>
             </div>
          </div>
        </div>
      </div>

      <CheckoutConfirmation 
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onConfirm={handleActivate}
        planType={selectedPlan?.type || 'monthly'}
        amount={selectedPlan?.price || 0}
        selectedCharity={activeCharity}
      />
    </div>
  );
};

export default Subscription;
