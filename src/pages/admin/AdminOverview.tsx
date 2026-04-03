import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Users, Heart, Zap, Search, 
  Filter, MoreVertical, CheckCircle2, 
  AlertCircle, ArrowUpRight, BarChart3, 
  Settings, Plus, Trash2, Edit2, Play,
  ShieldCheck, Activity, Database, TrendingUp,
  Target, Globe, ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  Cell
} from 'recharts';
import { useAuth } from '../../components/auth/AuthProvider';
import { usePageTitle } from '../../hooks/usePageTitle';
import { supabase } from '../../lib/supabase';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import type { Profile, Charity, Draw, Winner } from '../../types';

const AdminOverview: React.FC = () => {
  const { user, profile } = useAuth();
  usePageTitle('Command Protocol');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    totalRaised: 0,
    currentJackpot: 0,
    totalPrizes: 0,
    publishedDraws: 0
  });
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [charityImpact, setCharityImpact] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchAdminStats();
    }
  }, [user, profile]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Basic Totals
      const [
        { count: userCount },
        { data: activeSubs },
        { data: allCharities },
        { data: allDraws }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('amount').eq('status', 'active'),
        supabase.from('charities').select('name, total_raised'),
        supabase.from('draws').select('*').eq('status', 'published').order('created_at', { ascending: false })
      ]);

      // 2. Calculate Aggregates
      const totalRaised = allCharities?.reduce((acc, c) => acc + (c.total_raised || 0), 0) || 0;
      const totalPrizes = allDraws?.reduce((acc, d) => acc + (d.prize_pool || 0), 0) || 0;
      const currentDraw = allDraws?.[0]; // Latest published draw has the next rollover data

      setStats({
        totalUsers: userCount || 0,
        activeSubs: activeSubs?.length || 0,
        totalRaised,
        currentJackpot: currentDraw?.jackpot_rollover_amount || 0,
        totalPrizes,
        publishedDraws: allDraws?.length || 0
      });

      // 3. Extract Winners
      const winnersList: Winner[] = [];
      allDraws?.slice(0, 5).forEach(d => {
        if (d.winners) {
          winnersList.push(...(d.winners as any).slice(0, 3));
        }
      });
      setRecentWinners(winnersList);

      setCharityImpact(allCharities?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Jan', revenue: 45000, impact: 12000 },
    { name: 'Feb', revenue: 52000, impact: 15000 },
    { name: 'Mar', revenue: 48000, impact: 14000 },
    { name: 'Apr', revenue: 61000, impact: 18000 },
    { name: 'May', revenue: 55000, impact: 16000 },
    { name: 'Jun', revenue: 67000, impact: 21000 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      {/* Header */}
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-secondary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant">Sovereign Command Console</span>
        </div>
        <h1 className="text-7xl font-display font-black uppercase tracking-tighter mb-8 leading-none">
          Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Protocol.</span>
        </h1>
        <p className="text-xl text-on-surface-variant font-sans max-w-2xl leading-relaxed">
           Administrative oversight for the distributed Play for Good network. Accessing real-time Matrix metrics, member health, and charity priority.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Total Entities', value: stats.totalUsers, icon: Users, color: 'text-on-surface', sub: stats.activeSubs + ' Active' },
          { label: 'Jackpot Status', value: formatCurrency(stats.currentJackpot), icon: Zap, color: 'text-secondary', sub: 'Projected Carry-over' },
          { label: 'Global Impact', value: formatCurrency(stats.totalRaised), icon: Heart, color: 'text-primary', sub: 'Across 12 Charities' },
          { label: 'Tiered Payouts', value: formatCurrency(stats.totalPrizes), icon: Trophy, color: 'text-secondary', sub: stats.publishedDraws + ' Protocols Executed' }
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-10 group hover:border-primary/30 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <metric.icon className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                   <metric.icon className={cn("w-5 h-5", metric.color)} />
                 </div>
                 <TrendingUp className="w-4 h-4 text-primary opacity-40" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{metric.label}</p>
              <p className={cn("text-3xl font-display font-black tracking-tight mb-2", metric.color)}>{metric.value}</p>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">{metric.sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Analytics Chart */}
        <div className="lg:col-span-2 glass-card p-10 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-12">
             <div className="space-y-1">
                <h3 className="text-xl font-display font-bold uppercase tracking-tight">Growth Protocol</h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Consolidated Impact & Revenue</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-secondary" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Impact</span>
                </div>
             </div>
          </div>

          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4EDE7B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4EDE7B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'Inter'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4EDE7B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="impact" stroke="#F9C354" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Mini-Grids */}
        <div className="space-y-12">
          {/* Recent Protocol Winners */}
          <div className="glass-card p-10 bg-surface-container-high/20">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-secondary" /> Recent Winners
            </h3>
            <div className="space-y-6">
              {recentWinners.length === 0 ? (
                <p className="text-xs text-on-surface-variant opacity-50 italic py-10 text-center">No protocol winners found in the Matrix.</p>
              ) : (
                recentWinners.map((winner, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-display font-bold text-primary group-hover:scale-110 transition-transform">
                        {winner.user_name[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-tight">{winner.user_name}</p>
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">{winner.match_count}-Match Tier</p>
                      </div>
                    </div>
                    <p className="font-display font-bold text-sm text-on-surface">{formatCurrency(winner.prize_amount)}</p>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-10 py-4 rounded-xl border border-white/5 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all">
               View All Protocols
            </button>
          </div>

          {/* Charity Performance */}
          <div className="glass-card p-10 bg-surface-container-high/20">
             <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <Heart className="w-4 h-4 text-primary" /> Charity Index
            </h3>
            <div className="space-y-10">
               {charityImpact.map((charity, idx) => (
                 <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span>{charity.name}</span>
                       <span className="text-primary">{Math.round((charity.total_raised / stats.totalRaised) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(charity.total_raised / stats.totalRaised) * 100}%` }}
                        className="h-full bg-primary" 
                       />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="glass-card p-8 flex items-center gap-6 group cursor-pointer hover:bg-primary/5 transition-all">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <Users className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Users</h4>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Manage Matrix Entities</p>
             </div>
             <ArrowUpRight className="w-4 h-4 ml-auto text-on-surface-variant/30 group-hover:text-primary" />
          </div>
          <div className="glass-card p-8 flex items-center gap-6 group cursor-pointer hover:bg-secondary/5 transition-all">
             <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <Database className="w-6 h-6 text-secondary" />
             </div>
             <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-secondary transition-colors">Subscriptions</h4>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Life-cycle Oversight</p>
             </div>
             <ArrowUpRight className="w-4 h-4 ml-auto text-on-surface-variant/30 group-hover:text-secondary" />
          </div>
          <div className="glass-card p-8 flex items-center gap-6 group cursor-pointer hover:bg-primary/5 transition-all">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <Zap className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Matrix Protocol</h4>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Control Match Engine</p>
             </div>
             <ArrowUpRight className="w-4 h-4 ml-auto text-on-surface-variant/30 group-hover:text-primary" />
          </div>
      </div>
    </div>
  );
};

export default AdminOverview;
