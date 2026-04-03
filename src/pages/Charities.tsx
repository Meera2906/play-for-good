import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Heart, Globe, ArrowRight, ExternalLink, Info, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn, formatCurrency } from '../lib/utils';
import { useAuth } from '../components/auth/AuthProvider';
import type { Charity } from '../types';

const Charities: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('total_raised', { ascending: false });
      
      if (error) throw error;
      setCharities(data || []);
    } catch (error) {
      console.error('Error fetching charities:', error);
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
      await refreshProfile();
    } catch (error) {
      console.error('Error selecting charity:', error);
    } finally {
      setSelectingId(null);
    }
  };

  const categories = ['All', ...new Set(charities.map(c => c.category))];

  const filteredCharities = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Mapping Impact Network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1 rounded-full mb-8"
          >
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Your Game, Their Future.</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-none">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Impact</span> Network
          </h1>
          <p className="text-on-surface-variant text-xl max-w-2xl mx-auto leading-relaxed font-sans">
            Every round you play contributes to a global force for good. Explore the charities supported by the Play for Good community.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search charities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-surface-container-low border border-white/5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-sans"
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-4 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap border",
                  selectedCategory === cat 
                    ? "bg-primary text-background border-primary" 
                    : "bg-surface-container-low text-on-surface-variant border-white/5 hover:bg-surface-container-high hover:border-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCharities.map((charity, idx) => {
            const isSelected = profile?.selected_charity_id === charity.id;
            
            return (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10 }}
                className="glass-card p-1 rounded-[2.5rem] group"
              >
                <div className="bg-background rounded-[2.4rem] overflow-hidden flex flex-col h-full">
                  <div className="h-56 relative overflow-hidden">
                    <img 
                      src={charity.logo_url} 
                      alt={charity.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute top-6 right-6 bg-background/60 backdrop-blur-md border border-white/10 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-primary">
                      {charity.category}
                    </div>
                  </div>
                  
                  <div className="p-10 flex flex-col flex-grow">
                    <h3 className="text-2xl font-display font-bold uppercase mb-4 tracking-tight group-hover:text-primary transition-colors">
                      {charity.name}
                    </h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-10 flex-grow line-clamp-3 font-sans">
                      {charity.description}
                    </p>
                    
                    <div className="space-y-8">
                      <div className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-secondary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Impact</span>
                        </div>
                        <span className="font-display font-bold text-xl text-on-surface">{formatCurrency(charity.total_raised)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <a 
                          href={charity.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-4 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all active:scale-95"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                        {user ? (
                          <button 
                            onClick={() => handleSelectCharity(charity.id)}
                            disabled={isSelected || selectingId === charity.id}
                            className={cn(
                              "flex-1 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
                              isSelected 
                                ? "bg-secondary text-background cursor-default" 
                                : "bg-gradient-to-br from-primary to-primary-container text-background hover:scale-105 disabled:opacity-50"
                            )}
                          >
                            {selectingId === charity.id ? (
                              <div className="w-3 h-3 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                            ) : isSelected ? (
                              <><Check className="w-3 h-3" /> Active</>
                            ) : (
                              <><ArrowRight className="w-3 h-3" /> Select</>
                            )}
                          </button>
                        ) : (
                          <button className="flex-1 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-background text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95 opacity-50 cursor-not-allowed">
                            Login to Select
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCharities.length === 0 && (
          <div className="text-center py-32 glass-card border-dashed">
            <Info className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-display font-bold uppercase mb-2">No charities found</h3>
            <p className="text-on-surface-variant">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charities;
