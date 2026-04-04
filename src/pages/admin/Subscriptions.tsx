import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Search, Filter, ArrowUpRight, 
  CreditCard, Calendar, Heart, ShieldCheck,
  MoreVertical, Download, CheckCircle2, AlertCircle,
  Clock, RefreshCw, Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'cancelled'>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user:profiles(full_name, email),
          charity:charities(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    mrr: subscriptions
      .filter(s => s.status === 'active')
      .reduce((acc, s) => acc + (s.amount || 0), 0)
  };

  const handleDownload = () => {
    if (subscriptions.length === 0) return;
    
    const headers = ['User', 'Email', 'Plan', 'Status', 'Amount', 'Charity', 'Renewal Date', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...subscriptions.map(sub => [
        `"${sub.user?.full_name || 'Matrix User'}"`,
        `"${sub.user?.email || 'N/A'}"`,
        `"${sub.plan_type}"`,
        `"${sub.status}"`,
        sub.amount,
        `"${sub.charity?.name || 'Unassigned'}"`,
        `"${formatDate(sub.renewal_date)}"`,
        `"${formatDate(sub.created_at)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Protocol 04: Subscription Ledger</span>
          </div>
          <h1 className="text-6xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-none">
            Matrix <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Ledger</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-2xl">
            Monitor the community's recurring contributions, manage lifecycle states, and audit charity impact allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="glass-card px-8 py-5 flex items-center gap-4 border-white/5 bg-background/50">
            <RefreshCw className="w-4 h-4 text-on-surface-variant" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Monthly Recurring</p>
              <p className="font-display font-bold text-xl text-primary">{formatCurrency(stats.mrr)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="glass-card p-10 bg-surface-container-high/30 group">
          <ShieldCheck className="w-8 h-8 text-secondary mb-6 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Active Protocols</p>
          <p className="text-4xl font-display font-black tracking-tighter text-on-surface">{stats.active}</p>
        </div>
        <div className="glass-card p-10 bg-surface-container-high/30 group">
          <Users className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Entities</p>
          <p className="text-4xl font-display font-black tracking-tighter text-on-surface">{stats.total}</p>
        </div>
        <div className="glass-card p-10 bg-surface-container-high/30 group">
          <Heart className="w-8 h-8 text-secondary mb-6 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Charity Split Avg</p>
          <p className="text-4xl font-display font-black tracking-tighter text-on-surface">15%</p>
        </div>
      </div>

      {/* Main Grid Controls */}
      <div className="glass-card overflow-hidden">
        <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-surface-container-low/50">
          <div className="relative flex-grow max-w-xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email identity..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-background border border-white/5 rounded-2xl focus:outline-none focus:border-primary transition-all text-sm font-sans"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-background border border-white/5 p-1.5 rounded-2xl">
              {(['all', 'active', 'inactive', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    statusFilter === status 
                      ? "bg-surface-container-highest text-primary shadow-xl" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
            <button 
              onClick={handleDownload}
              className="p-4 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-2xl border border-white/5 transition-all group"
              title="Download Data Matrix"
            >
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Entries Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-white/5">
                <th className="px-10 py-6">Member Entity</th>
                <th className="px-10 py-6">Status Protocol</th>
                <th className="px-10 py-6">Allocation Details</th>
                <th className="px-10 py-6 text-center">Charity Match</th>
                <th className="px-10 py-6 text-right">Renewal Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-8">
                      <div className="h-8 bg-white/5 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <EmptyState 
                      icon={Database}
                      title="Subscription Ledger Depopulated"
                      description="No recurring protocol identifiers match the current criteria. Ensure your status and search filters are correctly configured."
                      className="py-12 border-none bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center font-display font-bold text-primary group-hover:scale-110 transition-transform">
                          {sub.user?.full_name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-display font-bold text-lg uppercase tracking-tight">{sub.user?.full_name || 'Matrix User'}</p>
                          <p className="text-xs text-on-surface-variant font-sans">{sub.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest",
                        sub.status === 'active' 
                          ? "bg-primary/10 border-primary/30 text-primary" 
                          : "bg-red-500/10 border-red-500/30 text-red-500"
                      )}>
                        {sub.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {sub.status}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <p className="font-display font-bold text-lg tracking-tight">{formatCurrency(sub.amount)}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                          {sub.plan_type} • {sub.charity_percentage}% Charity
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center justify-center gap-3">
                          <Heart className={cn(
                            "w-4 h-4",
                            sub.charity?.name ? "text-secondary" : "text-on-surface-variant opacity-20"
                          )} />
                          <span className="text-xs font-bold text-on-surface-variant">
                            {sub.charity?.name || 'Unassigned'}
                          </span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 text-on-surface-variant">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-sans">{formatDate(sub.renewal_date)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
