import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertCircle, Clock, Search, ExternalLink, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import type { Draw } from '../../types';
import ProofUpload from '../../components/ui/ProofUpload';

const Winnings: React.FC = () => {
  const { user, profile } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const [wonDraws, setWonDraws] = useState<(Draw & { rank: number; amount: number; proofStatus: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWinnings();
    }
  }, [user]);

  const fetchWinnings = async () => {
    try {
      // 1. Fetch all draws
      const { data: drawsData, error: drawsError } = await supabase
        .from('draws')
        .select('*')
        .order('created_at', { ascending: false });

      if (drawsError) throw drawsError;

      // Filter to draws where this user won
      let userWins = (drawsData || [])
        .filter(d => d.winners.some((w: any) => w.user_id === user!.id))
        .map(d => {
          const winData = d.winners.find((w: any) => w.user_id === user!.id);
          return {
            ...d,
            rank: winData.rank,
            amount: winData.prize_amount,
            proofStatus: null // Default null until checked
          };
        });

      // 2. Fetch proofs if any
      const { data: proofsData, error: proofsError } = await supabase
        .from('winner_proofs')
        .select('draw_id, status')
        .eq('user_id', user!.id);

      if (proofsData && proofsData.length > 0) {
        userWins = userWins.map(w => {
          const proof = proofsData.find((p: any) => p.draw_id === w.id);
          return { ...w, proofStatus: proof ? proof.status : null };
        });
      }

      setWonDraws(userWins);
    } catch (err) {
      console.error('Error fetching winnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingProofsCount = wonDraws.filter(w => w.proofStatus === null).length;

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
            <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">Winnings & Proofs</h1>
          </div>
          <p className="text-on-surface-variant max-w-2xl">
            Track your draw prize history and submit performance proofs to verify and claim your payouts.
          </p>
        </div>

        <div className="glass-card px-8 py-5 flex items-center gap-6 border-white/5 bg-background/50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Lifetime Accrual</p>
            <p className="font-display font-black text-3xl text-secondary tracking-tighter shadow-secondary/50">
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
              <h2 className="text-3xl font-display font-black uppercase mb-4 tracking-tight">Reward Vault Locked</h2>
              <p className="text-on-surface-variant mb-10 text-balance">Only active Matrix connections can view and claim draw rewards.</p>
              <Link to="/dashboard/subscription" className="px-10 py-5 bg-secondary text-background rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(233,195,73,0.3)]">
                Connect to Matrix
              </Link>
            </div>
          </div>
        )}

        {pendingProofsCount > 0 && isActive && (
          <div className="mb-10 p-6 bg-secondary/10 border border-secondary/30 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-secondary font-bold text-lg mb-1">Action Required</h4>
              <p className="text-sm text-secondary/80 font-medium">
                You have {pendingProofsCount} winning{pendingProofsCount > 1 ? 's' : ''} awaiting proof verification. Please upload a screenshot of your official golf handicap scorecard to claim the prize.
              </p>
            </div>
          </div>
        )}

        {wonDraws.length === 0 ? (
          <div className="glass-card p-16 text-center text-on-surface-variant flex flex-col items-center">
            <Search className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">No winnings recorded yet.</p>
            <p className="text-sm mt-2 max-w-md mx-auto opacity-70">Keep lodging your Stableford rounds to stay eligible for upcoming algorithmic draws.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {wonDraws.map((win, idx) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card border border-white/5 relative overflow-hidden flex flex-col lg:flex-row"
              >
                {win.proofStatus === null && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                )}
                {win.proofStatus === 'approved' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                
                <div className="p-10 flex-grow flex flex-col sm:flex-row items-center gap-8 lg:border-r border-white/5 relative z-10">
                  <div className="w-20 h-20 bg-surface-container-highest rounded-[2rem] flex flex-col items-center justify-center border border-white/5 shadow-2xl flex-shrink-0 rotate-3">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Rank</span>
                    <span className="text-3xl font-display font-black text-white leading-none">#{win.rank}</span>
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">Draw: {win.month}</h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      <span>{formatDate(win.created_at)}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span>Pool: {formatCurrency(win.prize_pool)}</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right flex-shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Prize Allocation</p>
                    <p className="text-4xl font-display font-black text-secondary tracking-tighter">
                      {formatCurrency(win.amount)}
                    </p>
                  </div>
                </div>

                {/* Status & Proof Panel */}
                <div className="bg-surface-container-high/30 p-10 w-full lg:w-[400px] flex-shrink-0 relative z-10 flex flex-col justify-center">
                  {win.proofStatus === null ? (
                    <ProofUpload drawId={win.id} onSuccess={fetchWinnings} />
                  ) : win.proofStatus === 'pending' ? (
                    <div className="text-center w-full">
                      <Clock className="w-12 h-12 text-secondary/50 mx-auto mb-4" />
                      <h4 className="font-bold text-lg mb-2">Verification Pending</h4>
                      <p className="text-xs text-on-surface-variant max-w-[250px] mx-auto text-balance">
                        Your scorecard is being reviewed by the Matrix. Check back in 24 hours.
                      </p>
                    </div>
                  ) : win.proofStatus === 'approved' ? (
                    <div className="text-center w-full">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(78,222,163,0.3)]">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg text-primary mb-2">Proof Verified</h4>
                      <p className="text-xs text-on-surface-variant max-w-[250px] mx-auto text-balance">
                        Payout processed. Funds dispatched to your registered address.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center w-full">
                      <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                      <h4 className="font-bold text-lg text-red-500 mb-2">Proof Rejected</h4>
                      <p className="text-xs text-on-surface-variant max-w-[250px] mx-auto text-balance mb-4">
                        The submitted scorecard was invalid or corrupted. Please submit a new clear image.
                      </p>
                      <ProofUpload drawId={win.id} onSuccess={fetchWinnings} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Winnings;
