import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Zap, Target, ArrowRight, CheckCircle2, 
  Search, ShieldCheck, CreditCard, ChevronRight,
  ChevronLeft, AlertCircle, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useAuth } from '../components/auth/AuthProvider';
import { usePageTitle } from '../hooks/usePageTitle';
import EmptyState from '../components/ui/EmptyState';
import type { Charity } from '../types';

const Onboarding: React.FC = () => {
  usePageTitle('Protocol Initialization | Onboarding');
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [percentage, setPercentage] = useState(10);
  const [plan, setPlan] = useState<'monthly' | 'yearly' | 'free'>('free');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoadingCharities(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('name');
      if (error) throw error;
      setCharities(data || []);
    } catch (err: any) {
      console.error('Error fetching charities:', err);
      setFetchError(err.message || 'Failed to load charities.');
    } finally {
      setLoadingCharities(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedCharity) {
      setError('Please select a mission partner to proceed.');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const onSubmit = async () => {
    if (!user || !selectedCharity) return;
    setLoading(true);
    setError(null);
    
    try {
      // 1. Check if a subscription row already exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // 10000 days for free to keep it active, otherwise normal cycle
      const renewalDays = plan === 'monthly' ? 30 : (plan === 'yearly' ? 365 : 10000); 
      const subData = {
        user_id: user.id,
        charity_id: selectedCharity.id,
        charity_percentage: percentage,
        plan_type: plan,
        amount: plan === 'monthly' ? 25.00 : (plan === 'yearly' ? 250.00 : 0.00),
        status: 'active', // Immediate activation per user request
        start_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (existingSub) {
        // Update existing row
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(subData)
          .eq('id', existingSub.id);
        if (updateError) throw updateError;
      } else {
        // Insert new row
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert([subData]);
        if (insertError) throw insertError;
      }

      // 2. Mark Onboarding as Complete & Update Membership Identity
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true, 
          selected_charity_id: selectedCharity.id,
          subscription_status: 'active',
          subscription_tier: plan === 'free' ? 'free' : plan
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Refresh and Redirect
      await refreshProfile();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Onboarding finalization error:', err);
      setError(err.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden pt-20">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 py-12 relative z-10 flex-grow flex flex-col">
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-16">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1.5 rounded-full bg-white/5 relative overflow-hidden">
               <motion.div 
                initial={false}
                animate={{ width: step >= s ? '100%' : '0%' }}
                className="absolute inset-0 bg-primary"
               />
            </div>
          ))}
        </div>

        <div className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4 leading-none">
                    Select your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Mission.</span>
                  </h1>
                  <p className="text-on-surface-variant font-sans text-lg max-w-xl">
                    Every member joins the matrix with a primary purpose. Choose a partner that aligns with your values.
                  </p>
                </div>

                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="Search mission partners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm outline-none focus:border-primary transition-all font-sans"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {loadingCharities ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Loading mission partners...</p>
                  </div>
                ) : fetchError ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <p className="text-sm font-bold uppercase tracking-widest text-red-500">{fetchError}</p>
                    <button onClick={fetchCharities} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                      Retry
                    </button>
                  </div>
                ) : charities.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="No Partners Available"
                    description="No charity partners have been added yet. Please contact support or check back later."
                  />
                ) : filteredCharities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <Heart className="w-10 h-10 text-on-surface-variant opacity-30" />
                    <p className="font-display font-bold uppercase tracking-tight text-xl">No matches</p>
                    <p className="text-sm text-on-surface-variant">No partners matched your search.</p>
                    <button onClick={() => setSearchTerm('')} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2">
                    {filteredCharities.map(charity => (
                      <button
                        key={charity.id}
                        onClick={() => setSelectedCharity(charity)}
                        className={cn(
                          "glass-card p-8 text-left transition-all relative group overflow-hidden",
                          selectedCharity?.id === charity.id ? "border-primary bg-primary/5" : "hover:border-primary/20",
                        )}
                      >
                        {selectedCharity?.id === charity.id && (
                          <div className="absolute top-4 right-4 text-primary">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-display font-black text-primary overflow-hidden">
                             {charity.logo_url ? <img src={charity.logo_url} alt="" className="w-full h-full object-cover" /> : charity.name[0]}
                           </div>
                           <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{charity.category}</p>
                              <h3 className="font-display font-bold uppercase tracking-tight text-lg leading-tight">{charity.name}</h3>
                           </div>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed opacity-70">
                          {charity.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4 leading-none text-center">
                    Define your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary italic">Impact.</span>
                  </h1>
                  <p className="text-on-surface-variant font-sans text-lg max-w-xl mx-auto text-center">
                    Set the baseline contribution from your subscription. 100% of these funds go directly to <span className="text-primary font-bold">{selectedCharity?.name}</span>.
                  </p>
                </div>

                <div className="glass-card p-12 text-center max-w-xl mx-auto">
                   <div className="mb-12">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant block mb-4">Contribution Strength</span>
                      <span className="text-7xl md:text-9xl font-display font-black text-primary leading-none">
                        {percentage}<span className="text-4xl font-sans">%</span>
                      </span>
                   </div>

                   <div className="space-y-8">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">
                        <span>Minimum</span>
                        <span>Tactical</span>
                        <span>Sovereign</span>
                     </div>
                     <input 
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={percentage}
                      onChange={(e) => setPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                     />
                     <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-primary/5 border border-primary/20 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                          Verified contribution toward your Global Impact score.
                        </span>
                     </div>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4 leading-none">
                    Select your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Access.</span>
                  </h1>
                  <p className="text-on-surface-variant font-sans text-lg max-w-xl mx-auto">
                    Choose your membership tier. You can always upgrade later.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                   {[
                    { 
                      type: 'free', 
                      price: '£0', 
                      name: 'Spectator', 
                      icon: Target,
                      features: ['Watch Live Draws', 'Community Access', 'Basic Dashboard'],
                      desc: 'Watch from the bench'
                    },
                    { 
                      type: 'monthly', 
                      price: '£25', 
                      name: 'Elite', 
                      icon: Zap,
                      features: ['Full Prize Access', 'Verified Impact', 'Instant Ingestion'],
                      desc: 'Standard protocol'
                    },
                    { 
                      type: 'yearly', 
                      price: '£250', 
                      name: 'Sovereign', 
                      icon: ShieldCheck, 
                      savings: 'Save £50',
                      features: ['All Elite Benefits', 'Priority Verification', 'Sovereign Badge'],
                      desc: 'Yearly network core'
                    }
                   ].map((p) => (
                    <button
                      key={p.type}
                      onClick={() => setPlan(p.type as any)}
                      className={cn(
                        "glass-card p-6 md:p-8 text-left relative transition-all group overflow-hidden flex flex-col",
                        plan === p.type ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(78,222,163,0.1)]" : "hover:border-primary/20"
                      )}
                    >
                      {plan === p.type && (
                         <div className="absolute top-4 right-4 text-primary">
                            <CheckCircle2 className="w-5 h-5" />
                         </div>
                      )}
                      {p.savings && (
                        <div className="absolute -top-4 -right-12 bg-secondary text-background py-6 px-16 -rotate-12 transform origin-bottom-right font-display font-black text-[7px] uppercase tracking-widest pointer-events-none">
                          {p.savings}
                        </div>
                      )}
                      
                      <div className="p-3 bg-white/5 rounded-xl inline-flex mb-6 group-hover:scale-110 transition-transform w-fit">
                        <p.icon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-2">{p.name}</h3>
                      <p className="text-[9px] text-on-surface-variant font-sans uppercase tracking-widest mb-6 opacity-60">{p.desc}</p>
                      
                      <div className="space-y-3 mb-8 flex-grow">
                         {p.features.map((f, i) => (
                           <div key={i} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/80">
                              <div className="w-1 h-1 rounded-full bg-primary/50" />
                              {f}
                           </div>
                         ))}
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/5">
                         <p className="text-3xl font-display font-black text-on-surface">{p.price}</p>
                         <p className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">/ {p.type === 'yearly' ? 'Year' : (p.type === 'monthly' ? 'Month' : 'Forever')}</p>
                      </div>
                    </button>
                   ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 max-w-3xl mx-auto">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center font-display font-bold text-primary">
                        {selectedCharity?.name[0]}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-1 underline">Selected Partner</span>
                        <p className="font-display font-bold text-xl uppercase tracking-tight">{selectedCharity?.name}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between py-6 border-t border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Base Contribution</span>
                      <span className="font-display font-bold text-lg">{percentage}%</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
          <button 
             onClick={handleBack}
             disabled={step === 1 || loading}
             className={cn(
              "flex items-center gap-3 font-display font-bold text-[10px] uppercase tracking-widest transition-opacity disabled:opacity-0",
             )}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {error && (
             <div className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest animate-shake">
                <AlertCircle className="w-4 h-4" />
                {error}
             </div>
          )}

          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hidden sm:block">Step {step} of 3</span>
            {step < 3 ? (
              <button 
                onClick={handleNext}
                className="bg-primary text-background px-10 py-5 rounded-full font-display font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={onSubmit}
                disabled={loading}
                className="bg-primary text-background px-12 py-5 rounded-full font-display font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Finalize Initialization
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
