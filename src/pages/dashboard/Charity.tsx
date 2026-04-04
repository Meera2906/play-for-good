import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Globe, Target, ShieldCheck, Zap, 
  AlertCircle, Loader2, CheckCircle2, Lock,
  Trophy, ExternalLink, ArrowRight, Search, Filter 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatCurrency } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import type { Charity } from '../../types';
import DonationModal from '../../components/charity/DonationModal';

const CharitySelection: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { subscription, updateCharityDetails, isPremium, loading: subLoading } = useSubscription();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'network' | 'selector'>('network');
  const [searchTerm, setSearchTerm] = useState('');

  // States for user selection
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [contributionPct, setContributionPct] = useState<number>(10);
  const [selectingId, setSelectingId] = useState<string | null>(null);

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

  const handleSelectCharity = async (charityId: string) => {
    if (!user) return;
    setSelectingId(charityId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ selected_charity_id: charityId })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // If they have a subscription, update that too
      if (subscription) {
        await updateCharityDetails(charityId, contributionPct);
      }
      
      await refreshProfile();
      setSelectedCharityId(charityId);
      setMessage({ type: 'success', text: 'Impact partner updated successfully.' });
    } catch (error: any) {
      console.error('Error selecting charity:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update partner.' });
    } finally {
      setSelectingId(null);
    }
  };

  const handleSave = async () => {
    if (!isPremium) {
      setMessage({ type: 'error', text: 'Premium membership required to set persistent impact preferences.' });
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
  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Header & Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Protocol 05: Impact Distribution Matrix</span>
            </div>
            <h1 className="text-6xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-none">
              Impact <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Matrix</span>
            </h1>
            <p className="text-xl text-on-surface-variant font-sans">
              Explore the global partner network and define your contribution weight within the Sovereign Ledger.
            </p>
          </div>

          <div className="flex p-1.5 bg-surface-container-low border border-white/5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('network')}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'network' ? "bg-primary text-background shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Impact Network
            </button>
            <button 
              onClick={() => setActiveTab('selector')}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'selector' ? "bg-primary text-background shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Impact Selector
            </button>
          </div>
        </div>

        {!isPremium && (
          <div className="mb-12 p-8 bg-secondary/10 border border-secondary/30 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h4 className="text-2xl font-display font-black uppercase tracking-tight mb-1">Spectator Protocol Active</h4>
                <p className="text-on-surface-variant max-w-xl">Identity verified, but a premium subscription is required to persist impact preferences and initialize draw participation.</p>
              </div>
            </div>
            <Link to="/dashboard/subscription" className="px-10 py-5 bg-secondary text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-secondary/20 whitespace-nowrap text-center">
              Upgrade Access
            </Link>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'network' ? (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-4">
                <div className="relative w-full md:max-w-md group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Filter partner network..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-surface-container-low border border-white/5 rounded-2xl focus:outline-none focus:border-primary transition-all text-sm font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCharities.map((charity, idx) => {
                  const isSelected = selectedCharityId === charity.id;
                  
                  return (
                    <motion.div
                      key={charity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -10 }}
                      className="glass-card p-1 rounded-[3rem] group"
                    >
                      <div className="bg-background rounded-[2.9rem] overflow-hidden flex flex-col h-full">
                        <Link to={`/charities/${charity.slug}`} className="h-64 relative overflow-hidden block">
                          <img 
                            src={charity.logo_url} 
                            alt={charity.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                          <div className="absolute top-8 left-8 flex flex-col gap-3">
                             <div className="bg-background/60 backdrop-blur-md border border-white/10 px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary w-fit">
                              {charity.category}
                            </div>
                            {charity.featured && (
                              <div className="bg-secondary/20 backdrop-blur-md border border-secondary/30 px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2 w-fit">
                                <Trophy className="w-3.5 h-3.5" /> Featured
                              </div>
                            )}
                          </div>
                          {isSelected && (
                             <div className="absolute top-8 right-8 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                               <CheckCircle2 className="w-6 h-6 text-background" />
                             </div>
                          )}
                        </Link>
                        
                        <div className="p-12 flex flex-col flex-grow">
                          <Link to={`/charities/${charity.slug}`}>
                            <h3 className="text-3xl font-display font-bold uppercase mb-4 tracking-tight group-hover:text-primary transition-colors">
                              {charity.name}
                            </h3>
                          </Link>
                          <p className="text-on-surface-variant leading-relaxed mb-10 flex-grow line-clamp-3 font-sans">
                            {charity.description}
                          </p>
                          
                          <div className="space-y-10">
                            <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-[2rem] border border-white/5">
                              <div className="flex items-center gap-4">
                                <Globe className="w-5 h-5 text-secondary" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Protocol Impact</span>
                              </div>
                              <span className="font-display font-bold text-2xl text-on-surface">{formatCurrency(charity.total_raised)}</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <a 
                                href={charity.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 py-5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all active:scale-95"
                              >
                                Portal <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button 
                                onClick={() => handleSelectCharity(charity.id)}
                                disabled={isSelected || selectingId === charity.id || !isPremium}
                                className={cn(
                                  "flex-1 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
                                  isSelected 
                                    ? "bg-secondary text-background cursor-default" 
                                    : "bg-primary text-background hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                                )}
                              >
                                {selectingId === charity.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isSelected ? (
                                  <><ShieldCheck className="w-4 h-4" /> Selected</>
                                ) : (
                                  <><Zap className="w-4 h-4" /> Select Partner</>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row gap-12"
            >
              {/* Left Col: Charities Selection Mini-Grid */}
              <div className="flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {charities.map((charity) => (
                    <motion.div
                      key={charity.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedCharityId(charity.id)}
                      className={cn(
                        "glass-card p-1 cursor-pointer transition-all duration-300 relative overflow-hidden group border-2 rounded-[2.5rem]",
                        selectedCharityId === charity.id 
                          ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(78,222,163,0.1)]" 
                          : "border-transparent hover:border-white/10"
                      )}
                    >
                      <div className="p-8">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-surface-container-highest">
                              <img src={charity.logo_url} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-grow">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1 block">{charity.category}</span>
                              <Link 
                                to={`/charities/${charity.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block"
                              >
                                <h3 className="text-xl font-display font-bold uppercase tracking-tight leading-tight mb-2 hover:text-primary transition-colors">{charity.name}</h3>
                              </Link>
                              <div className="flex items-center justify-between">
                                 <span className="text-[10px] text-on-surface-variant font-sans line-clamp-1">{charity.website_url.replace(/^https?:\/\//, '')}</span>
                                 {selectedCharityId === charity.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                              </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Col: Preferences Panel */}
              <div className="w-full lg:w-[450px] flex-shrink-0">
                <div className="sticky top-12 space-y-8">
                  <div className="glass-card p-10 bg-surface-container-high/30">
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight flex items-center gap-4 mb-10">
                      <Target className="w-6 h-6 text-primary" /> Active Allocation
                    </h3>

                    {selectedCharity ? (
                      <div className="space-y-10">
                        <div className="p-8 bg-background/50 rounded-[2rem] border border-white/5">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                              <img src={selectedCharity.logo_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-1">Active Beneficiary</p>
                              <p className="font-display font-bold text-xl uppercase tracking-tight">{selectedCharity.name}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
                              Contribution Yield
                            </label>
                            <span className="font-display font-bold text-4xl text-primary">{contributionPct}<span className="text-lg font-sans ml-1 text-on-surface-variant">%</span></span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            step="5"
                            value={contributionPct}
                            onChange={(e) => setContributionPct(parseInt(e.target.value))}
                            disabled={!isPremium}
                            className="w-full accent-primary h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer disabled:opacity-30 mb-2"
                          />
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            <span>10% Minimum</span>
                            <span>100% Impact</span>
                          </div>
                          
                          <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                            <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
                              Verification protocol: <strong className="text-on-surface font-bold">{contributionPct}%</strong> of your prize matrix will be automatically allocated to {selectedCharity.name} upon win confirmation.
                            </p>
                          </div>
                        </div>

                        {message && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "p-5 rounded-2xl flex items-start gap-4 text-sm font-sans",
                              message.type === 'success' ? "bg-primary/10 border border-primary/30 text-primary" : "bg-red-500/10 border border-red-500/30 text-red-500"
                            )}
                          >
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                            <p>{message.text}</p>
                          </motion.div>
                        )}

                        <button
                          onClick={handleSave}
                          disabled={saving || !selectedCharityId || !isPremium}
                          className="w-full py-6 rounded-2xl bg-white text-background font-bold uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 shadow-2xl shadow-black/20"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 invisible" />}
                          Archive Preferences
                        </button>
                      </div>
                    ) : (
                      <div className="py-20 flex flex-col items-center text-center">
                        <Globe className="w-12 h-12 mb-6 text-on-surface-variant opacity-20" />
                        <p className="text-sm text-on-surface-variant font-sans px-8">No designated impact beneficiary located. Search the partner network to initialize.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="glass-card p-10 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 group mb-8">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Global Impact Score</p>
                        <p className="text-3xl font-display font-black text-primary tracking-tighter">{formatCurrency(profile?.total_impact || 0)}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsDonationModalOpen(true)}
                      disabled={!selectedCharityId}
                      className="w-full py-5 rounded-2xl border border-white/10 hover:bg-primary hover:text-background hover:border-transparent text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95 mb-4"
                    >
                      <Heart className="w-4 h-4" /> One-time Contribution
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// Simple Save icon since it wasn't imported
const Save = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);

export default CharitySelection;
