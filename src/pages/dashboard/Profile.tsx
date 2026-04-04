import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Camera, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import { usePageTitle } from '../../hooks/usePageTitle';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import RoleBadge from '../../components/ui/RoleBadge';

const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  usePageTitle('Identity Matrix');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) throw error;
      
      await refreshProfile();
      setMessage({ type: 'success', text: 'Protocol updated: Identity sync complete.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Update failed: Signal interference detected.' });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 lg:p-20">
      <div className="flex items-center gap-6 mb-16">
        <div className="w-16 h-16 bg-primary/20 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/10">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-display font-black uppercase tracking-tight">Identity <span className="text-primary italic">Matrix.</span></h1>
            {profile.role === 'admin' ? (
              <div className="px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-secondary/20">
                System Admin
              </div>
            ) : profile.subscription_status === 'cancelled' ? (
              <div className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/20">
                Core Cancelled
              </div>
            ) : profile.subscription_status === 'lapsed' ? (
              <div className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">
                Core Lapsed
              </div>
            ) : profile.subscription_status === 'active' && (
              <div className={cn(
                "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] animate-pulse shadow-lg",
                profile.subscription_tier === 'yearly' 
                  ? "bg-secondary/10 border-secondary/30 text-secondary shadow-secondary/20" 
                  : profile.subscription_tier === 'monthly'
                    ? "bg-primary/10 border-primary/30 text-primary shadow-primary/20"
                    : "bg-surface-container border-white/5 text-on-surface-variant shadow-none"
              )}>
                {profile.subscription_tier === 'yearly' ? 'Sovereign' : profile.subscription_tier === 'monthly' ? 'Elite' : 'Spectator'}
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant flex items-center gap-3">
            Core Protocol Settings / Account 0x{profile.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 text-center relative overflow-hidden bg-surface-container-low/30">
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-surface-container-high border-2 border-white/10 flex items-center justify-center mb-6 overflow-hidden group">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-display font-bold text-on-surface-variant">{initials}</span>
                )}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-2">{profile.full_name}</h3>
              <div className="flex justify-center flex-wrap gap-3 mb-6">
                {profile.role === 'admin' ? (
                  <div className="px-3 py-1 rounded-lg border border-secondary/20 bg-secondary/10 text-secondary text-[8px] font-black uppercase tracking-widest">
                    System Admin
                  </div>
                ) : profile.subscription_status === 'cancelled' ? (
                  <div className="px-3 py-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest">
                    Subscription Cancelled
                  </div>
                ) : profile.subscription_status === 'lapsed' ? (
                  <div className="px-3 py-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                    Payment Lapsed
                  </div>
                ) : profile.subscription_status === 'active' && (
                  <div className={cn(
                    "px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest",
                    profile.subscription_tier === 'yearly' ? "bg-secondary/10 border-secondary/20 text-secondary" : "bg-primary/10 border-primary/20 text-primary"
                  )}>
                    {profile.subscription_tier === 'yearly' ? 'Sovereign' : profile.subscription_tier === 'monthly' ? 'Elite' : 'Spectator'} member
                  </div>
                )}
              </div>
              <p className="text-xs text-on-surface-variant font-sans">{profile.email}</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Shield className="w-20 h-20" />
            </div>
          </div>

          <div className="glass-card p-8 bg-surface-container-low/20">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Security Level</h4>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full bg-primary", profile.role === 'admin' ? "w-full" : "w-1/2")} />
              </div>
              <span className="text-[10px] font-bold text-primary">{profile.role === 'admin' ? 'Alpha' : 'Beta'}</span>
            </div>
            <p className="text-[8px] text-on-surface-variant uppercase tracking-widest leading-loose">Access permissions verified and synced with primary core.</p>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2">
          <div className="glass-card p-12 bg-surface-container-low/50">
            <form onSubmit={handleUpdateProfile} className="space-y-10">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-2xl flex items-center gap-4 border",
                    message.type === 'success' ? "bg-primary/10 border-primary/20 text-primary" : "bg-red-500/10 border-red-500/20 text-red-500"
                  )}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{message.text}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-on-surface-variant ml-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> Display Identity
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-colors font-sans"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-on-surface-variant ml-2 flex items-center gap-2 opacity-50">
                    <Mail className="w-3 h-3" /> Communication Node
                  </label>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-sans opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-10 border-t border-white/5 font-sans">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Connected Protocols</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      name: 'Membership Node', 
                      status: profile.role === 'admin' 
                        ? 'Administrative Overdrive' 
                        : profile.subscription_status === 'active' 
                          ? `${profile.subscription_tier === 'yearly' ? 'Sovereign' : profile.subscription_tier === 'monthly' ? 'Elite' : 'Spectator'} Active` 
                          : profile.subscription_status === 'cancelled'
                            ? 'Signal Terminated'
                            : profile.subscription_status === 'lapsed'
                              ? 'Pulse Weakening'
                              : 'Inactive', 
                      color: (profile.role === 'admin' || profile.subscription_status === 'active') ? 'text-primary' : (profile.subscription_status === 'cancelled' ? 'text-red-500' : (profile.subscription_status === 'lapsed' ? 'text-amber-500' : 'text-on-surface-variant')) 
                    },
                    { name: 'Matrix Base Identity', status: 'Verified', color: 'text-primary' },
                    { name: 'GHIN Direct Connect', status: 'Inactive', color: 'text-on-surface-variant' },
                    { name: 'Neural 2FA Encryption', status: 'Verified', color: 'text-primary' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-between group">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.name}</span>
                      <div className={cn(
                        "px-3 py-1 rounded-full bg-white/5 text-[8px] font-black uppercase tracking-widest transition-colors",
                        item.color
                      )}>{item.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-10">
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-10 py-5 rounded-2xl bg-primary text-background font-bold uppercase tracking-[0.3em] text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl shadow-primary/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
