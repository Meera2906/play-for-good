import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Trophy, Target, Heart, Zap, Plus, History, 
  TrendingUp, Award, Calendar, ChevronRight, 
  AlertCircle, CheckCircle2, Info, Settings, Star, ArrowRight, Lock
} from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { usePageTitle } from '../../hooks/usePageTitle';
import EmptyState from '../../components/ui/EmptyState';
import type { Score, Charity } from '../../types';

const DashboardOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscription, isActive, loading: subLoading } = useSubscription();
  usePageTitle('Control Hub');
  const [scores, setScores] = useState<Score[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [latestDraw, setLatestDraw] = useState<any>(null);
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const [featuredCharities, setFeaturedCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [newScore, setNewScore] = useState({ points: '', course: '' });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch scores
      const { data: scoreData } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(5);
      
      setScores(scoreData || []);

      // 2. Fetch charities
      const { data: charityData } = await supabase
        .from('charities')
        .select('*');
      
      setCharities(charityData || []);

      // 3. Fetch latest published draw
      const { data: drawData } = await supabase
        .from('draws')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setLatestDraw(drawData);

      // 4. Fetch user's entry for this draw
      if (drawData) {
        const { data: entryData } = await supabase
          .from('draw_entries')
          .select('*')
          .eq('draw_id', drawData.id)
          .eq('user_id', user?.id)
          .maybeSingle();
        setLatestEntry(entryData);
      }

      // 5. Fetch featured charities for discovery
      const { data: featuredData } = await supabase
        .from('charities')
        .select('*')
        .eq('featured', true)
        .limit(3);
      setFeaturedCharities(featuredData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!isActive) {
      setMessage({ type: 'error', text: 'Active subscription required to submit scores.' });
      return;
    }

    const points = parseInt(newScore.points);
    if (isNaN(points) || points < 1 || points > 50) {
      setMessage({ type: 'error', text: 'Points must be between 1 and 50' });
      return;
    }

    if (!newScore.course.trim()) {
      setMessage({ type: 'error', text: 'Course name is required' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('scores')
        .insert([
          {
            user_id: user.id,
            stableford_points: points,
            course_name: newScore.course,
            date: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Score submitted successfully!' });
      setNewScore({ points: '', course: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit score' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeCharity = charities.find(c => c.id === (subscription?.charity_id || profile?.selected_charity_id));

  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto p-12">
      {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(78,222,163,0.5)]" />
                <span className="text-primary font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                  {isActive ? 'Elite Matrix Active' : 'Matrix Connection Pending'}
                </span>
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-[0.85]">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">{profile?.full_name?.split(' ')[0]}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4 bg-surface-container-low px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Active Draw</span>
                    <span className="text-xs font-display font-bold uppercase">{latestDraw?.draw_month || 'TBA'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-surface-container-low px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Prize Pool</span>
                    <span className="text-xs font-display font-bold uppercase text-secondary">{latestDraw ? formatCurrency(latestDraw.prize_pool) : '£---,---'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right hidden xl:block">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Protocol Status</p>
                <div className="flex items-center gap-3 justify-end">
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isActive ? "bg-primary shadow-[0_0_15px_rgba(78,222,163,0.5)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  )} />
                  <span className="font-display font-black uppercase tracking-tight text-lg">{subscription?.status || 'inactive'}</span>
                </div>
              </div>
              <button className="w-14 h-14 rounded-2xl bg-surface-container-high border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all active:scale-95 group">
                <Settings className="w-6 h-6 text-on-surface-variant group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
          </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Participation & Stats */}
          <div className="lg:col-span-2 space-y-10">
            {/* Participation Card */}
            <div className="glass-card p-1 rounded-[2.5rem] relative overflow-hidden group">
              <div className="bg-background rounded-[2.4rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-32 h-32 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <Star className="text-background w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Current Participation</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Your Matrix Numbers</p>
                      <div className="flex gap-3">
                        {latestEntry ? (
                          latestEntry.entry_numbers.map((n: number, i: number) => (
                            <div key={i} className="w-12 h-12 bg-surface-container-low border border-white/5 rounded-xl flex items-center justify-center font-display font-bold text-lg hover:border-primary/30 transition-colors">
                              {n}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest px-4 py-3 bg-white/5 rounded-xl border border-dashed border-white/10">
                            {isActive ? 'Entry Pending Next Draw' : <><Lock className="w-3 h-3" /> Subscription Required</>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Latest Result</p>
                      {latestEntry ? (
                        <div className="flex items-center gap-3">
                           <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            latestEntry.match_count > 0 ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-on-surface-variant"
                          )}>
                            {latestEntry.match_count} Match
                          </span>
                          {latestEntry.prize_amount > 0 && (
                            <span className="text-xl font-display font-bold text-secondary">+{formatCurrency(latestEntry.prize_amount)}</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs opacity-40 italic">Waiting for official protocol...</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Charity Impact</p>
                      <p className="text-4xl font-display font-black text-primary tracking-tighter">{formatCurrency(profile?.total_impact || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scores Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-display font-bold uppercase flex items-center gap-4">
                  <History className="w-8 h-8 text-primary" />
                  Latest Performance
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Top 5 Scores Count</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Score List */}
                <div className="space-y-5">
                  {scores.length > 0 ? (
                    scores.map((score) => (
                      <div key={score.id} className="glass-card p-1 rounded-3xl group">
                        <div className="bg-background rounded-[1.4rem] p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center font-display font-black text-2xl text-primary border border-white/5">
                              {score.stableford_points}
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-sm uppercase tracking-tight">{score.course_name}</h4>
                              <p className="text-xs text-on-surface-variant font-sans">{formatDate(score.date)}</p>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <ChevronRight className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <EmptyState 
                        icon={Target}
                        title="No Scores Yet"
                        description="Your performance matrix is empty. Log your first round to start calculating your entry average for the next monthly draw."
                        className="py-12 border-none bg-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Score Form */}
                <div className="glass-card p-1 rounded-[2.5rem] relative overflow-hidden">
                  {!isActive && (
                    <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-10 text-center">
                      <div className="max-w-xs">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-xl font-display font-black uppercase mb-4 tracking-tight">Access Locked</h4>
                        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">Join the Elite Matrix to start posting scores and enter monthly draws.</p>
                        <Link to="/dashboard/subscription" className="inline-block px-8 py-3 bg-primary text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all active:scale-95">
                          Upgrade Now
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="bg-surface-container-low/50 rounded-[2.4rem] p-10">
                    <h3 className="text-2xl font-display font-bold uppercase mb-8 flex items-center gap-3">
                      <Plus className="w-6 h-6 text-primary" />
                      Post New Entry
                    </h3>

                    {message && (
                      <div className={cn(
                        "p-5 rounded-2xl mb-8 flex items-center gap-4 text-sm animate-in fade-in slide-in-from-top-2",
                        message.type === 'success' ? "bg-primary/10 border border-primary/30 text-primary" : "bg-red-500/10 border border-red-500/30 text-red-500"
                      )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        <span className="font-sans">{message.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleScoreSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Stableford Points (1-50)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="50"
                          value={newScore.points}
                          onChange={(e) => setNewScore({...newScore, points: e.target.value})}
                          placeholder="e.g. 38"
                          disabled={!isActive}
                          className="w-full px-6 py-4 bg-background border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-sans disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Course Name</label>
                        <input 
                          type="text" 
                          value={newScore.course}
                          onChange={(e) => setNewScore({...newScore, course: e.target.value})}
                          placeholder="e.g. St Andrews Old Course"
                          disabled={!isActive}
                          className="w-full px-6 py-4 bg-background border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-sans disabled:opacity-50"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={submitting || !isActive}
                        className="w-full py-5 rounded-full bg-gradient-to-br from-primary to-primary-container text-background font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Score'}
                        {!submitting && <ArrowRight className="w-5 h-5" />}
                      </button>
                    </form>

                    <div className="mt-10 p-5 bg-background/30 rounded-2xl border border-white/5 flex gap-4">
                      <Info className="w-6 h-6 text-secondary flex-shrink-0" />
                      <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                        Your entry will be verified against official club records. Fraudulent submissions result in immediate account termination.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Charity & Subscription */}
          <div className="space-y-10">
            {/* Charity Card */}
            <div className="glass-card p-1 rounded-[2.5rem] overflow-hidden group">
              <div className="bg-background rounded-[2.4rem] overflow-hidden flex flex-col">
                <div className="h-40 relative overflow-hidden">
                  <img 
                    src={activeCharity?.logo_url || "https://picsum.photos/seed/charity/800/400"} 
                    alt="Charity Banner" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
                <div className="p-10 -mt-16 relative z-10">
                  <div className="w-20 h-20 bg-surface-container-low rounded-3xl border border-white/10 p-3 mb-6 shadow-xl">
                    <img src={activeCharity?.logo_url || "https://picsum.photos/seed/logo/100/100"} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase mb-3 tracking-tight">
                    {activeCharity?.name || "Select a Charity"}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-8 line-clamp-2 font-sans leading-relaxed">
                    {activeCharity?.description || "Choose the cause your performance will support in the next draw."}
                  </p>
                  <div className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl mb-8 border border-white/5">
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Your Impact</p>
                      <p className="font-display font-bold text-xl text-primary">{formatCurrency(profile?.total_impact || 0)}</p>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Global Total</p>
                      <p className="font-display font-bold text-xl text-on-surface">{formatCurrency(activeCharity?.total_raised || 0)}</p>
                    </div>
                  </div>
                  <Link to="/dashboard/charity" className="w-full py-4 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95">
                    <Heart className="w-4 h-4 text-red-500" />
                    Change Charity
                  </Link>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="glass-card p-1 rounded-[2.5rem]">
              <div className="bg-surface-container-low rounded-[2.4rem] p-10 border border-secondary/20">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Subscription</h3>
                  <span className="bg-secondary text-background text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-secondary/20">
                    {subscription?.plan_type || 'None'}
                  </span>
                </div>
                
                <div className="space-y-5 mb-10">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</span>
                    <span className={cn(
                      "text-sm font-display font-bold capitalize",
                      isActive ? "text-primary" : "text-red-500"
                    )}>{subscription?.status || 'inactive'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Next Billing</span>
                    <span className="text-sm font-display font-bold">
                      {subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Plan Amount</span>
                    <span className="text-sm font-display font-bold">
                      {subscription?.amount ? formatCurrency(subscription.amount) : 'N/A'}
                    </span>
                  </div>
                </div>

                <Link to="/dashboard/subscription" className="w-full py-4 rounded-full border border-secondary text-secondary text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/5 transition-all active:scale-95 flex items-center justify-center mb-6">
                  Manage Plan
                </Link>
                <p className="text-[9px] text-center text-on-surface-variant font-sans uppercase tracking-widest">
                  Cancel anytime. Rewards are only eligible for active subscribers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Discover New Impact Section */}
        <section className="mt-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 px-2">
            <div>
              <h2 className="text-4xl font-display font-black uppercase tracking-tight mb-4">Discover New Impact</h2>
              <p className="text-on-surface-variant text-sm font-sans max-w-xl">
                Explore these hand-selected partners pushing the boundaries of global change. Your next performance could be their breakthrough.
              </p>
            </div>
            <Link to="/charities" className="text-primary font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 hover:gap-5 transition-all">
              View All Partners <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCharities.map((charity, idx) => (
              <motion.div 
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass-card p-1 rounded-[2.5rem]"
              >
                <Link to={`/charities/${charity.slug}`} className="bg-background rounded-[2.4rem] overflow-hidden block h-full group">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={charity.image_url || charity.logo_url} 
                      alt={charity.name} 
                      className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-8">
                    <span className="font-sans text-[10px] font-bold text-secondary uppercase tracking-widest">{charity.category}</span>
                    <h4 className="font-display text-xl font-bold mt-3 mb-2 uppercase tracking-tight">{charity.name}</h4>
                    <p className="text-on-surface-variant text-xs mb-6 line-clamp-2 leading-relaxed">{charity.description}</p>
                    <div className="flex items-center gap-3 py-4 border-t border-white/5">
                      <Heart className="w-5 h-5 text-primary" />
                      <p className="font-display font-bold text-lg">{formatCurrency(charity.total_raised)} RAISED</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default DashboardOverview;
