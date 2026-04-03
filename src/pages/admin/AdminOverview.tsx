import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Users, Heart, Zap, Search, 
  Filter, MoreVertical, CheckCircle2, 
  AlertCircle, ArrowUpRight, BarChart3, 
  Settings, Plus, Trash2, Edit2, Play,
  ShieldCheck, Activity, Database
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { useAuth } from '../../components/auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import type { Profile, Charity, Draw, Score } from '../../types';

const AdminOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'draws' | 'charities'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, dRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('charities').select('*').order('total_raised', { ascending: false }),
        supabase.from('draws').select('*').order('created_at', { ascending: false })
      ]);

      setProfiles(pRes.data || []);
      setCharities(cRes.data || []);
      setDraws(dRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDraw = async () => {
    setIsDrawing(true);
    setMessage(null);
    try {
      // 1. Get all active subscribers
      const activeUsers = profiles.filter(p => p.subscription_status === 'active');
      if (activeUsers.length === 0) throw new Error('No active subscribers found');

      // 2. Get scores for each user
      const { data: allScores } = await supabase.from('scores').select('*');
      
      // 3. Simple Algorithmic Draw: Top average of latest 5 scores
      const userPerformances = activeUsers.map(u => {
        const userScores = (allScores || [])
          .filter(s => s.user_id === u.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        const avg = userScores.length > 0 
          ? userScores.reduce((acc, s) => acc + s.stableford_points, 0) / userScores.length 
          : 0;
        
        return { user: u, avg };
      }).sort((a, b) => b.avg - a.avg);

      // 4. Pick top 3 winners
      const winners = userPerformances.slice(0, 3).map((p, idx) => ({
        user_id: p.user.id,
        user_name: p.user.full_name,
        prize_amount: [100000, 50000, 25000][idx],
        rank: idx + 1
      }));

      // 5. Create draw record
      const { data: draw, error: drawError } = await supabase
        .from('draws')
        .insert([{
          month: new Date().toISOString().slice(0, 7),
          prize_pool: 175000,
          winners,
          status: 'published'
        }])
        .select()
        .single();

      if (drawError) throw drawError;

      // 6. Update user winnings and charity impact
      for (const winner of winners) {
        const userProfile = activeUsers.find(u => u.id === winner.user_id);
        if (userProfile) {
          await supabase
            .from('profiles')
            .update({ 
              lifetime_winnings: (userProfile.lifetime_winnings || 0) + winner.prize_amount,
              total_impact: (userProfile.total_impact || 0) + (winner.prize_amount * 0.1) // 10% to charity
            })
            .eq('id', winner.user_id);
          
          if (userProfile.selected_charity_id) {
            const charity = charities.find(c => c.id === userProfile.selected_charity_id);
            if (charity) {
              await supabase
                .from('charities')
                .update({ total_raised: (charity.total_raised || 0) + (winner.prize_amount * 0.1) })
                .eq('id', charity.id);
            }
          }
        }
      }

      setMessage({ type: 'success', text: `Draw completed! Winners: ${winners.map(w => w.user_name).join(', ')}` });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to run draw' });
    } finally {
      setIsDrawing(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: profiles.length, icon: <Users className="w-5 h-5" />, color: 'primary' },
    { label: 'Active Subs', value: profiles.filter(p => p.subscription_status === 'active').length, icon: <Zap className="w-5 h-5" />, color: 'secondary' },
    { label: 'Total Impact', value: formatCurrency(charities.reduce((acc, c) => acc + c.total_raised, 0)), icon: <Heart className="w-5 h-5" />, color: 'tertiary' },
    { label: 'Prize Pool', value: formatCurrency(245000), icon: <Trophy className="w-5 h-5" />, color: 'on-surface' },
  ];

  const chartData = [
    { name: 'Jan', impact: 45000, users: 1200 },
    { name: 'Feb', impact: 52000, users: 1450 },
    { name: 'Mar', impact: 48000, users: 1600 },
    { name: 'Apr', impact: 61000, users: 1900 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      {/* Admin Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
                  <ShieldCheck className="text-background w-7 h-7" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Command Center</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-9xl font-display font-extrabold uppercase tracking-tighter leading-[0.8] mb-10"
              >
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Matrix</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-on-surface-variant font-sans leading-relaxed"
              >
                Elite oversight of the Play for Good ecosystem. Orchestrate global impact through algorithmic precision.
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-3 bg-surface-container-low px-6 py-3 rounded-full border border-white/5 shadow-xl">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(78,222,163,0.5)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Operational</span>
              </div>
              <button onClick={fetchData} className="px-8 py-4 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center gap-3 active:scale-95">
                <Database className="w-4 h-4" />
                Sync Matrix
              </button>
            </motion.div>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-10 group hover:scale-[1.02] transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl", `bg-${stat.color}/10 text-${stat.color}`)}>
                  {stat.icon}
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3">{stat.label}</p>
                <p className="text-5xl font-display font-bold tracking-tighter">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-12 border-b border-white/5 mb-16 overflow-x-auto no-scrollbar">
          {['overview', 'users', 'draws', 'charities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "pb-8 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative whitespace-nowrap",
                activeTab === tab ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_20px_rgba(78,222,163,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-12">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 glass-card p-12">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight flex items-center gap-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Global Impact Analytics
                  </h3>
                  <select className="bg-surface-container-high border border-white/5 rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary transition-colors">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4edea3" stopOpacity={1} />
                          <stop offset="100%" stopColor="#4edea3" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '20px' }}
                        itemStyle={{ color: '#4edea3', fontWeight: 'bold', fontSize: '12px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      <Bar dataKey="impact" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-12 bg-primary/5 border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/20 transition-colors duration-1000" />
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-10 flex items-center gap-4 relative z-10">
                  <Play className="w-6 h-6 text-primary" />
                  Matrix Actions
                </h3>
                <div className="space-y-6 relative z-10">
                  <button 
                    onClick={handleRunDraw}
                    disabled={isDrawing}
                    className="w-full py-6 rounded-2xl bg-primary text-background font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    {isDrawing ? 'Calculating Matrix...' : 'Execute Algorithmic Draw'}
                    {!isDrawing && <Zap className="w-5 h-5" />}
                  </button>
                  <button className="w-full py-6 rounded-2xl bg-surface-container-high border border-white/5 text-on-surface font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:bg-white/5 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Onboard Charity
                  </button>
                  <button className="w-full py-6 rounded-2xl bg-surface-container-high border border-white/5 text-on-surface font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:bg-white/5 transition-all active:scale-95">
                    <Settings className="w-5 h-5" />
                    System Configuration
                  </button>
                </div>

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-10 p-6 rounded-2xl flex items-center gap-4 text-sm font-medium relative z-10",
                      message.type === 'success' ? "bg-primary/10 border border-primary/30 text-primary" : "bg-red-500/10 border border-red-500/30 text-red-500"
                    )}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    {message.text}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card overflow-hidden">
              <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="relative flex-grow max-w-xl">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder="Search the matrix by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm outline-none focus:border-primary transition-colors font-sans"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <button className="px-8 py-4 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center gap-3">
                    <Filter className="w-4 h-4" /> Filter Matrix
                  </button>
                  <button className="px-8 py-4 rounded-full bg-white text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all active:scale-95">Export Data</button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-high/30">
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">User Entity</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Status</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Access Level</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Winnings</th>
                      <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center font-display font-bold text-primary shadow-lg">
                              {p.full_name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-lg tracking-tight">{p.full_name}</p>
                              <p className="text-sm text-on-surface-variant font-sans">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full shadow-[0_0_10px_rgba(78,222,163,0.5)]",
                              p.subscription_status === 'active' ? "bg-primary" : "bg-red-500 shadow-red-500/50"
                            )} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{p.subscription_status}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={cn(
                            "text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border",
                            p.role === 'admin' ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-on-surface-variant border-white/5"
                          )}>
                            {p.role}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-lg font-display font-bold tracking-tight">{formatCurrency(p.lifetime_winnings || 0)}</p>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors">
                            <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'draws' && (
            <div className="grid grid-cols-1 gap-12">
              {draws.map((draw, idx) => (
                <motion.div 
                  key={draw.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-12 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-secondary/10 transition-colors duration-1000" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-secondary" />
                        </div>
                        <h3 className="text-3xl font-display font-bold uppercase tracking-tight">
                          Draw: <span className="text-secondary italic">{draw.month}</span>
                        </h3>
                      </div>
                      <p className="text-sm text-on-surface-variant font-sans">Finalized on {formatDate(draw.created_at)}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3">Total Prize Pool</p>
                      <p className="text-5xl font-display font-bold text-secondary tracking-tighter">{formatCurrency(draw.prize_pool)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {draw.winners.map((winner) => (
                      <div key={winner.user_id} className="bg-surface-container-high/50 p-8 rounded-[2rem] border border-white/5 flex items-center justify-between group/winner hover:bg-white/5 transition-all">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg",
                              winner.rank === 1 ? "bg-secondary text-background" : "bg-white/10 text-white"
                            )}>
                              #{winner.rank}
                            </div>
                            <h4 className="font-bold text-base uppercase tracking-tight">{winner.user_name}</h4>
                          </div>
                          <p className="text-2xl font-display font-bold text-primary tracking-tighter">{formatCurrency(winner.prize_amount)}</p>
                        </div>
                        <Trophy className={cn(
                          "w-10 h-10 transition-transform group-hover/winner:scale-110 duration-500",
                          winner.rank === 1 ? "text-secondary drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" : "text-on-surface-variant opacity-20"
                        )} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'charities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {charities.map((charity, idx) => (
                <motion.div 
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-500"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{charity.category}</span>
                    </div>
                    <h3 className="text-3xl font-display font-bold uppercase tracking-tight mb-4 leading-none">{charity.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-10 line-clamp-2 font-sans leading-relaxed">{charity.description}</p>
                    <div className="flex items-center justify-between p-6 bg-surface-container-high rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Global Impact</span>
                      <span className="text-xl font-display font-bold text-primary tracking-tighter">{formatCurrency(charity.total_raised)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-8 hover:bg-white/5 transition-all group min-h-[400px]"
              >
                <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shadow-2xl">
                  <Plus className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <span className="block text-xl font-display font-bold uppercase tracking-tight mb-2">Onboard New Entity</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Expand the Charity Matrix</span>
                </div>
              </motion.button>
            </div>
          )}
        </div>
    </div>
  );
};

export default AdminOverview;
