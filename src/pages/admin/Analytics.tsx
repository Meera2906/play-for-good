import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, Heart, Users, 
  ArrowUpRight, ArrowDownRight, Globe, 
  ShieldCheck, Zap, Activity, Download,
  Filter, Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    revenueHistory: [],
    charityImpact: [],
    userSegments: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Fetch Revenue Trajectory (Mocked for Demo UI)
      const revenueHistory = [
        { month: 'Jan', revenue: 12400, growth: 12 },
        { month: 'Feb', revenue: 15800, growth: 27 },
        { month: 'Mar', revenue: 14200, growth: -10 },
        { month: 'Apr', revenue: 18900, growth: 33 },
        { month: 'May', revenue: 22400, growth: 18 },
        { month: 'Jun', revenue: 25600, growth: 14 }
      ];

      // 2. Fetch Charity Impact Breakdowns
      const { data: charities } = await supabase
        .from('charities')
        .select('name, total_raised')
        .order('total_raised', { ascending: false });

      // 3. Fetch User Segments
      const { data: activeSubs } = await supabase.from('subscriptions').select('id').eq('status', 'active');
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      const subCount = activeSubs?.length || 0;
      const totalCount = totalUsers || 0;

      setData({
        revenueHistory,
        charityImpact: charities || [],
        userSegments: [
          { name: 'Active Matrix', value: subCount, color: '#4EDE7B' },
          { name: 'Observing', value: totalCount - subCount, color: '#ffffff20' }
        ]
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant">Strategic Intelligence Page</span>
          </div>
          <h1 className="text-7xl font-display font-black uppercase tracking-tighter mb-8 leading-none">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Analytics.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans leading-relaxed">
             Diving deep into the distributed impact ledger. Visualizing revenue trajectories, member health, and global charity distribution.
          </p>
        </div>

        <div className="flex gap-4">
           <button className="px-8 py-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all">
              <Download className="w-4 h-4 text-primary" /> Export Matrix Data
           </button>
           <button className="px-8 py-4 bg-primary text-background rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20">
              <Calendar className="w-4 h-4" /> Filter Protocol Period
           </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-10 flex flex-col h-[550px]">
          <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="text-xl font-display font-bold uppercase tracking-tight">Revenue Trajectory</h3>
               <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Consolidated Protocol Intake</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Current MRR</p>
               <p className="text-3xl font-display font-black text-primary tracking-tighter">$25,600</p>
            </div>
          </div>

          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueHistory}>
                <defs>
                   <linearGradient id="navColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4EDE7B" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4EDE7B" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                   cursor={{ stroke: '#4EDE7B', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4EDE7B" strokeWidth={3} fill="url(#navColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Segment Distribution */}
        <div className="glass-card p-10 flex flex-col h-[550px]">
           <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-12 flex items-center gap-3">
              <Users className="w-4 h-4 text-primary" /> Member Health
           </h3>
           
           <div className="flex-grow relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={data.userSegments}
                       innerRadius={80}
                       outerRadius={110}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {data.userSegments.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-4xl font-display font-black text-on-surface">{data.userSegments[0]?.value + data.userSegments[1]?.value}</p>
                 <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Total Entities</p>
              </div>
           </div>

           <div className="space-y-6 mt-12 pb-4">
              {data.userSegments.map((seg: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{seg.name}</span>
                   </div>
                   <span className="font-display font-bold text-lg">{seg.value}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Charity Impact Breakdown */}
        <div className="lg:col-span-3 glass-card p-10">
           <div className="flex items-center justify-between mb-12">
              <div>
                 <h3 className="text-xl font-display font-bold uppercase tracking-tight">Impact Distribution</h3>
                 <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Allocation by Strategic Partner</p>
              </div>
              <Activity className="w-6 h-6 text-primary opacity-20" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {data.charityImpact.slice(0, 4).map((charity: any, idx: number) => (
                <div key={idx} className="space-y-6">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-on-surface-variant">{charity.name}</span>
                      <span className="text-primary">{formatCurrency(charity.total_raised)}</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(charity.total_raised / 50000) * 100}%` }}
                        className="h-full bg-primary"
                      />
                   </div>
                   <div className="flex items-center gap-2">
                       <TrendingUp className="w-3 h-3 text-primary" />
                       <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">+12.4% vs prev period</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Mini Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
         {[
          { label: 'Avg User Life-cycle', value: '4.2 Months', color: 'text-on-surface' },
          { label: 'Conversion Delta', value: '+18.5%', color: 'text-secondary' },
          { label: 'Platform Reliability', value: '99.98%', color: 'text-primary' },
          { label: 'Matrix Executions', value: '12 Total', color: 'text-on-surface' }
         ].map((m, i) => (
           <div key={i} className="glass-card p-8 bg-surface-container-high/20 border-white/5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{m.label}</p>
              <p className={cn("text-2xl font-display font-black uppercase tracking-tight", m.color)}>{m.value}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Analytics;
