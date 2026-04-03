import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertCircle, Clock, Search, ExternalLink, Lock, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import type { DrawEntry } from '../../types';
import ProofUpload from '../../components/ui/ProofUpload';

const Winnings: React.FC = () => {
  const { user, profile } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const [entries, setEntries] = useState<DrawEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      // Fetch all entries for this user that have a prize or are recent
      const { data, error } = await supabase
        .from('draw_entries')
        .select('*, draw:draws(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching winnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const wonEntries = entries.filter(e => e.prize_amount > 0);
  const pendingProofsCount = wonEntries.filter(e => e.winner_status === 'pending').length;

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(233,195,73,0.3)]">
              <Award className="w-5 h-5 text-secondary" />
            </div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">Winnings Vault</h1>
          </div>
          <p className="text-on-surface-variant max-w-2xl">
            Track your draw participation history and verify your payouts through scorecard submission.
          </p>
        </div>

        <div className="glass-card px-8 py-5 flex items-center gap-6 border-white/5 bg-background/50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Lifetime Accrual</p>
            <p className="font-display font-black text-3xl text-secondary tracking-tighter">
              {formatCurrency(profile?.lifetime_winnings || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        {!isActive && (
          <div className="absolute inset-x-0 top-0 z-50 bg-background/60 backdrop-blur-md flex items-center justify-center rounded-[2.5rem] border border-dashed border-secondary/20 min-h-[400px]">
            <div className="text-center max-w-sm px-10">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(233,195,73,0.2)]">
                <Lock className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-3xl font-display font-black uppercase mb-4 tracking-tight">Vault Locked</h2>
              <p className="text-on-surface-variant mb-10 text-balance">Only active Matrix members can view participation and claim rewards.</p>
              <Link to="/dashboard/subscription" className="px-10 py-5 bg-secondary text-background rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(233,195,73,0.3)]">
                Upgrade Access
              </Link>
            </div>
          </div>
        )}

        {pendingProofsCount > 0 && isActive && (
          <div className="mb-10 p-6 bg-secondary/10 border border-secondary/30 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-secondary font-bold text-lg mb-1">Winning Verification Required</h4>
              <p className="text-sm text-secondary/80 font-medium">
                You have {pendingProofsCount} winning entry awaiting proof. Upload your official scorecard to finalize the payout protocol.
              </p>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="glass-card p-16 text-center text-on-surface-variant flex flex-col items-center">
            <Search className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">No participation history found.</p>
            <p className="text-sm mt-2 max-w-md mx-auto opacity-70">Once the monthly protocol executes, your results will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "glass-card border border-white/5 relative overflow-hidden flex flex-col lg:flex-row transition-all",
                  entry.prize_amount > 0 ? "border-secondary/20 shadow-xl shadow-secondary/5" : "opacity-70 grayscale-[0.5]"
                )}
              >
                {entry.winner_status === 'pending' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                )}
                {entry.winner_status === 'approved' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                
                <div className="p-10 flex-grow flex flex-col sm:flex-row items-center gap-10 lg:border-r border-white/5 relative z-10">
                  <div className="flex flex-col items-center gap-4 flex-shrink-0">
                    <div className={cn(
                      "w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center border border-white/5 shadow-2xl transition-transform",
                      entry.match_count > 0 ? "bg-surface-container-highest rotate-3" : "bg-surface-container-low grayscale"
                    )}>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">Match</span>
                      <span className={cn(
                        "text-3xl font-display font-black text-white leading-none",
                        entry.match_count > 0 && "text-primary"
                      )}>{entry.match_count}</span>
                    </div>
                    <div className="flex gap-1">
                       {entry.entry_numbers.map((n, i) => (
                         <div key={i} className="w-5 h-5 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-bold">{n}</div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">
                       Protocol Month: <span className="text-white italic">{entry.draw?.draw_month || 'Unknown'}</span>
                    </h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      <span>Draw ID: {entry.draw_id.slice(0, 8)}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span>{entry.draw?.draw_mode || 'random'} execution</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right flex-shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Result</p>
                    {entry.prize_amount > 0 ? (
                      <p className="text-4xl font-display font-black text-secondary tracking-tighter">
                        {formatCurrency(entry.prize_amount)}
                      </p>
                    ) : (
                      <p className="text-2xl font-display font-bold text-on-surface-variant tracking-tighter opacity-30">
                         NO MATCH
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Proof Panel */}
                {entry.prize_amount > 0 && (
                  <div className="bg-surface-container-high/30 p-10 w-full lg:w-[400px] flex-shrink-0 relative z-10 flex flex-col justify-center">
                    {entry.winner_status === 'pending' ? (
                      <ProofUpload drawId={entry.draw_id} onSuccess={fetchEntries} />
                    ) : entry.winner_status === 'approved' ? (
                      <div className="text-center w-full">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(78,222,163,0.3)]">
                          <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="font-bold text-lg text-primary mb-2">Claim Verified</h4>
                        <p className="text-xs text-on-surface-variant max-w-[250px] mx-auto text-balance">
                          Payout sequence initiated. Funds credited to your entity profile.
                        </p>
                      </div>
                    ) : entry.winner_status === 'rejected' ? (
                      <div className="text-center w-full">
                        <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                        <h4 className="font-bold text-lg text-red-500 mb-2">Claim Rejected</h4>
                        <p className="text-xs text-on-surface-variant max-w-[250px] mx-auto text-balance mb-4">
                          Scorecard verification failed. Please upload a clear image of your official club record.
                        </p>
                        <ProofUpload drawId={entry.draw_id} onSuccess={fetchEntries} />
                      </div>
                    ) : null}
                  </div>
                )}
                
                {entry.prize_amount === 0 && (
                  <div className="bg-surface-container-high/10 p-10 w-full lg:w-[400px] flex-shrink-0 flex items-center justify-center opacity-30">
                     <Target className="w-10 h-10" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Winnings;
