import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Award, ArrowUpRight, Search, Loader2, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import type { Draw } from '../../types';

const DrawsHistory: React.FC = () => {
  const { user } = useAuth();
  const { isActive, isPremium, loading: subLoading } = useSubscription();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDraws(data || []);
    } catch (err) {
      console.error('Error fetching draws:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is a winner in a draw
  const isWinner = (draw: Draw) => {
    return draw.winners.some(w => w.user_id === user?.id);
  };

  const getWinnerData = (draw: Draw) => {
    return draw.winners.find(w => w.user_id === user?.id);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Draw Matrix</h1>
          </div>
          <p className="text-on-surface-variant max-w-2xl">
            Historical outcomes of the Play for Good algorithmic draws. Only active subscribers with minimum 1 valid score are entered.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        {!isPremium && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex items-center justify-center rounded-[2.5rem] border border-dashed border-primary/20">
            <div className="text-center max-w-sm px-10">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(78,222,163,0.2)]">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-black uppercase mb-4 tracking-tight">Draw Matrix Locked</h2>
              <p className="text-on-surface-variant mb-10 text-balance">Historical draw data and eligibility require a premium Matrix connection.</p>
              <Link to="/dashboard/subscription" className="px-10 py-5 bg-primary text-background rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(78,222,163,0.3)]">
                Connect to Matrix
              </Link>
            </div>
          </div>
        )}

        <div className="lg:col-span-2 space-y-6">
          {draws.map((draw, idx) => {
            const won = isWinner(draw);
            const winData = getWinnerData(draw);

            return (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "glass-card p-8 group transition-all duration-300 relative overflow-hidden",
                  won ? "border-secondary/30 bg-secondary/5" : "hover:bg-white/[0.02]"
                )}
              >
                {won && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[60px] -mr-32 -mt-32" />
                )}
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-white/5",
                      won ? "bg-secondary text-background" : "bg-surface-container-highest text-primary"
                    )}>
                      {won ? <Award className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-1">
                        Draw: <span className={won ? "text-secondary italic" : "text-primary italic"}>{draw.draw_month || draw.draw_year}</span>
                      </h3>
                      <p className="text-sm text-on-surface-variant font-sans">
                        Finalized: {formatDate(draw.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Total Pool</p>
                      <p className="font-display font-bold text-xl">{formatCurrency(draw.prize_pool)}</p>
                    </div>

                    <div className="w-px h-12 bg-white/10 hidden md:block" />

                    <div className="text-right min-w-[120px]">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Your Result</p>
                      {won && winData ? (
                        <div>
                          <p className="font-display font-black text-2xl text-secondary tracking-tighter shadow-secondary/50">
                            {formatCurrency(winData.prize_amount)}
                          </p>
                          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">
                            Rank #{winData.rank}
                          </p>
                        </div>
                      ) : (
                        <p className="font-sans text-sm text-on-surface-variant opacity-50 py-1">
                          Not Selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {draws.length === 0 && (
            <div className="py-20 flex flex-col items-center">
              <EmptyState 
                icon={Trophy}
                title="No Draw History Logged"
                description="The monthly algorithmic draw has not been processed for the current cycle. Your results and prize eligibility will be logged here as soon as the protocol verification cycle completes."
                className="py-20 border-none bg-transparent"
              />
              {!isPremium && (
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant animate-pulse">
                  System Sync: Waiting for Protocol Authorization
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-12 space-y-6">
            <div className="glass-card p-8 bg-surface-container-high/30">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <Trophy className="w-4 h-4 text-primary" /> Matrix Eligibility
              </h3>
              
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Must have an active Play for Good subscription tier.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>Must have played and logged at least 1 valid 18-hole Stableford round in the current month.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Winners must upload algorithmic proof (verified scorecard or app screenshot) within 48 hours to claim.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawsHistory;
