import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Filter, Shield, 
  Mail, Calendar, Trophy, Zap,
  MoreVertical, Edit3, Trash2, ShieldCheck,
  UserCheck, UserMinus, AlertCircle, CheckCircle2,
  Lock, Unlock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import ManageScoresModal from '../../components/admin/ManageScoresModal';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUserForScores, setSelectedUserForScores] = useState<any | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their associated subscription status
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscription:subscriptions(status, plan_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Protocol 02: User Identity Matrix</span>
          </div>
          <h1 className="text-6xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-none">
            Member <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Control</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-2xl">
            Audit protocol entry permissions, verify player identities, and manage strategic administrative roles within the matrix.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="glass-card px-8 py-5 flex items-center gap-4 border-white/5 bg-background/50">
            <ShieldCheck className="w-4 h-4 text-on-surface-variant" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Authenticated Leads</p>
              <p className="font-display font-bold text-xl text-on-surface">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Controls */}
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
              {(['all', 'admin', 'user'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    roleFilter === role 
                      ? "bg-surface-container-highest text-primary shadow-xl" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-on-surface-variant">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-white/5">
                <th className="px-10 py-6">Identity Identifier</th>
                <th className="px-10 py-6">Protocol Role</th>
                <th className="px-10 py-6">Subscription Status</th>
                <th className="px-10 py-6">Performance Index</th>
                <th className="px-10 py-6 text-right">Access Controls</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <EmptyState 
                      icon={Users}
                      title="Identity Matrix Depopulated"
                      description="No strategic entities match the current filtering parameters. Adjust your protocol filters to re-populate the matrix."
                      className="py-12 border-none bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-surface-container-highest rounded-2xl flex items-center justify-center font-display font-bold text-primary border border-white/5 shadow-xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                             {u.avatar_url ? (
                               <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               u.full_name?.[0] || '?'
                             )}
                          </div>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                            u.subscription?.[0]?.status === 'active' ? "bg-primary" : "bg-on-surface-variant opacity-30"
                          )} />
                        </div>
                        <div>
                          <p className="font-display font-bold text-lg uppercase tracking-tight">{u.full_name || 'Anonymous User'}</p>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-sans">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest",
                        u.role === 'admin' 
                          ? "bg-secondary/10 border-secondary/30 text-secondary" 
                          : "bg-primary/10 border-primary/30 text-primary"
                      )}>
                        {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        {u.role}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <p className={cn(
                          "text-sm font-bold uppercase tracking-widest",
                          u.subscription?.[0]?.status === 'active' ? "text-primary" : "text-on-surface-variant opacity-50"
                        )}>
                          {u.subscription?.[0]?.status || 'No Subscription'}
                        </p>
                        {u.subscription?.[0] && (
                           <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                             {u.subscription?.[0]?.plan_type} Tier
                           </p>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Impact</p>
                          <p className="font-display font-bold text-on-surface">{formatCurrency(u.total_impact || 0)}</p>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Won</p>
                          <p className="font-display font-bold text-primary">{formatCurrency(u.lifetime_winnings || 0)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => handleUpdateRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                            title={u.role === 'admin' ? "Downgrade to User" : "Upgrade to Admin"}
                            className="w-10 h-10 bg-white/5 hover:bg-secondary/20 hover:text-secondary rounded-xl flex items-center justify-center transition-all border border-white/5"
                           >
                            {u.role === 'admin' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                           </button>
                           <button 
                             onClick={() => setSelectedUserForScores(u)}
                             className="w-10 h-10 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl flex items-center justify-center transition-all border border-white/5"
                             title="Manage Scores"
                           >
                              <Edit3 className="w-4 h-4" />
                           </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUserForScores && (
          <ManageScoresModal 
            user={selectedUserForScores} 
            onClose={() => setSelectedUserForScores(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
