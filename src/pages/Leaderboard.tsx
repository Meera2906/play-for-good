import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, Heart, Search, Filter, ArrowUpRight, Award, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn, formatCurrency } from '../lib/utils';
import type { Profile, Score } from '../types';

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: scores } = await supabase.from('scores').select('*');

      const leaderboardData = (profiles || []).map(p => {
        const userScores = (scores || [])
          .filter(s => s.user_id === p.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        const avg = userScores.length > 0 
          ? userScores.reduce((acc, s) => acc + s.stableford_points, 0) / userScores.length 
          : 0;
        
        return { ...p, avgPoints: avg, roundsCount: userScores.length };
      })
      .filter(p => p.roundsCount > 0)
      .sort((a, b) => b.avgPoints - a.avgPoints);

      setLeaders(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaders = leaders.filter(l => 
    l.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant">Sovereign Performance Protocol</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-[0.8] mb-12">
            The <br />
            <span className="text-secondary italic">Leaderboard.</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <Trophy className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Elite Performance Rankings</span>
            </div>
            <p className="text-on-surface-variant text-xl font-sans max-w-2xl leading-relaxed">
              The top performers in the Play for Good community. Rankings are based on the average of your <span className="text-on-surface font-bold italic">latest 5 Stableford scores</span>.
            </p>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24 items-end">
          {filteredLeaders.slice(0, 3).map((leader, idx) => {
            const order = [1, 0, 2]; // 2nd, 1st, 3rd
            const l = filteredLeaders[order[idx]];
            if (!l) return null;
            
            const isFirst = order[idx] === 0;
            
            return (
              <div
                key={l.id}
                className={cn(
                  "glass-card p-10 text-center relative overflow-hidden group transition-all duration-500",
                  isFirst ? "md:scale-110 z-10 border-secondary/30" : "opacity-80 hover:opacity-100"
                )}
              >
                {isFirst && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary" />
                )}
                
                <div className="relative z-10">
                  <div className="w-32 h-32 bg-white/5 rounded-2xl mx-auto mb-8 border border-white/5 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                    <span className="text-6xl font-display font-black text-primary">{l.full_name[0]}</span>
                    <div className={cn(
                      "absolute -bottom-3 -right-3 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl",
                      isFirst ? "bg-secondary text-background" : "bg-white/5 text-on-surface"
                    )}>
                      {isFirst ? <Trophy className="w-7 h-7" /> : <span className="font-black text-xl">{order[idx] + 1}</span>}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-display font-bold uppercase mb-2 tracking-tight">{l.full_name}</h3>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.3em] mb-10">
                    {l.avgPoints.toFixed(1)} Avg Points
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Impact</p>
                      <p className="font-display font-bold text-xl text-primary">{formatCurrency(l.total_impact)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Rounds</p>
                      <p className="font-display font-bold text-xl text-on-surface">{l.roundsCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* List View */}
        <div className="glass-card overflow-hidden">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="relative flex-grow max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search the matrix by player name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:border-primary transition-all text-sm font-sans"
              />
            </div>
            <button className="px-10 py-5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4 text-primary" /> Filter Matrix
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Rank</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Player Entity</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Avg Points</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Rounds</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Impact</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeaders.slice(3).map((leader, idx) => (
                  <tr key={leader.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <span className="font-display font-black text-2xl text-on-surface-variant group-hover:text-primary transition-colors">
                        #{idx + 4}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-display font-bold text-primary border border-white/5 shadow-xl">
                          {leader.full_name[0]}
                        </div>
                        <p className="font-display font-bold text-lg uppercase tracking-tight">{leader.full_name}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-display font-black text-3xl text-secondary">{leader.avgPoints.toFixed(1)}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-sans text-base text-on-surface-variant">{leader.roundsCount}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-display font-bold text-xl text-primary">{formatCurrency(leader.total_impact)}</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="w-12 h-12 bg-white/5 hover:bg-primary/10 hover:text-primary rounded-xl flex items-center justify-center transition-all border border-white/5">
                        <ArrowUpRight className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
