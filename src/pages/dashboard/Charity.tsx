import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Globe, Target, ShieldCheck, Zap, AlertCircle, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatCurrency } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import type { Charity } from '../../types';
import DonationModal from '../../components/charity/DonationModal';

const CharitySelection: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscription, updateCharityDetails, isActive, loading: subLoading } = useSubscription();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // States for user selection
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [contributionPct, setContributionPct] = useState<number>(10);

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    if (subscription) {
      setSelectedCharityId(subscription.charity_id || null);
      setContributionPct(subscription.charity_percentage || 10);
    } else if (profile) {
      setSelectedCharityId(profile.selected_charity_id || null);
    }
  }, [subscription, profile]);

  const fetchCharities = async () => {
    try {
      const { data, error } = await supabase.from('charities').select('*').order('name');
      if (error) throw error;
      setCharities(data || []);
    } catch (err) {
      console.error('Error fetching charities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!subscription) {
      setMessage({ type: 'error', text: 'Active subscription required to set persistent impact preferences.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (!selectedCharityId) throw new Error('Please select a charity first.');
      await updateCharityDetails(selectedCharityId, contributionPct);
      setMessage({ type: 'success', text: 'Impact preferences updated successfully.' });
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedCharity = charities.find(c => c.id === selectedCharityId);

  return (
    <>
      {selectedCharity && (
        <DonationModal 
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          charity={selectedCharity}
        />
      )}

      <div className="max-w-[1600px] mx-auto p-12">
      {!isActive && (
        <div className="mb-12 p-6 bg-secondary/10 border border-secondary/30 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h4 className="text-xl font-display font-black uppercase tracking-tight">Observer Mode</h4>
              <p className="text-sm text-on-surface-variant">You can explore charities, but a subscription is required to save preferences and enter draws.</p>
            </div>
          </div>
          <Link to="/dashboard/subscription" className="px-8 py-4 bg-secondary text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all active:scale-95 whitespace-nowrap">
            Connect to Matrix
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Col: Charities Grid */}
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Impact Selector</h1>
          </div>
          <p className="text-on-surface-variant max-w-2xl mb-12">
            Select the organization that will receive your impact allocation when you win. You can change your selection at any time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charities.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center">
                <EmptyState 
                  icon={Heart}
                  title="No Impact Partners Found"
                  description="The global impact matrix is currently initializing. Our strategic charity partners will appear here as soon as the protocol synchronization is complete."
                  className="py-20 border-none bg-transparent"
                />
                {!isActive && (
                  <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant animate-pulse">
                    Identity Verified: Awaiting Protocol Subscription
                  </p>
                )}
              </div>
            ) : (
              charities.map((charity) => (
                <motion.div
                  key={charity.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCharityId(charity.id)}
                  className={cn(
                    "glass-card cursor-pointer transition-all duration-300 relative overflow-hidden group border-2",
                    selectedCharityId === charity.id 
                      ? "border-primary shadow-[0_0_30px_rgba(78,222,163,0.15)]" 
                      : "border-transparent hover:border-white/10"
                  )}
                >
                  {selectedCharityId === charity.id && (
                    <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-5 h-5 text-background" />
                    </div>
                  )}
                  
                  <div className="h-40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-background/50 z-10 group-hover:bg-background/20 transition-colors" />
                    <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
                    {selectedCharityId === charity.id && (
                      <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-overlay" />
                    )}
                  </div>
                  
                  <div className="p-8 relative z-20">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-3 block">{charity.category}</span>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-3 leading-none">{charity.name}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2">{charity.description}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Preferences Panel */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="sticky top-12 space-y-8">
            <div className="glass-card p-8">
              <h3 className="text-lg font-display font-bold uppercase tracking-tight flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-primary" /> Active Allocation
              </h3>

              {selectedCharity ? (
                <div className="mb-8">
                  <div className="flex items-center gap-4 p-4 bg-surface-container-high rounded-2xl border border-white/5 mb-6">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={selectedCharity.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Beneficiary</p>
                      <p className="font-bold truncate">{selectedCharity.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        Contribution Match
                      </label>
                      <span className="font-display font-bold text-xl text-primary">{contributionPct}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      value={contributionPct}
                      onChange={(e) => setContributionPct(parseInt(e.target.value))}
                      disabled={!isActive}
                      className="w-full accent-primary h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer disabled:opacity-30"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant">
                      <span>10% (Min)</span>
                      <span>100%</span>
                    </div>
                    
                    <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        If you win the monthly draw, <strong className="text-on-surface">{contributionPct}%</strong> of your prize will be donated directly to {selectedCharity.name}.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 border border-dashed border-white/10 rounded-2xl flex flex-col items-center text-center text-on-surface-variant">
                  <Globe className="w-8 h-8 mb-3 opacity-50" />
                  <p className="text-sm">No beneficiary selected. Please select a charity from the matrix.</p>
                </div>
              )}

              {message && (
                <div className={cn(
                  "p-4 rounded-xl flex items-start gap-3 text-sm mb-6",
                  message.type === 'success' ? "bg-primary/10 border border-primary/30 text-primary" : "bg-red-500/10 border border-red-500/30 text-red-500"
                )}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <p>{message.text}</p>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !selectedCharityId || !isActive}
                className="w-full py-4 rounded-xl bg-white text-background font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Preferences'}
              </button>
            </div>
            
            <div className="glass-card p-8 bg-surface-container-high/20 border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Lifetime Impact</p>
                  <p className="text-xl font-display font-black text-primary">{formatCurrency(profile?.total_impact || 0)}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsDonationModalOpen(true)}
                disabled={!selectedCharityId}
                className="w-full py-4 rounded-xl border border-white/5 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-30"
              >
                <Heart className="w-4 h-4 text-primary" /> One-time Contribution
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CharitySelection;
