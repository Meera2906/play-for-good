import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Search, Filter, Plus, 
  MoreVertical, Edit3, Trash2, 
  ExternalLink, Globe, Award,
  CheckCircle2, AlertCircle, X,
  Save, Loader2, Image as ImageIcon,
  Check, Power
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn, formatCurrency } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';

interface CharityEntry {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  category: string;
  total_raised: number;
  is_active: boolean;
  is_featured: boolean;
}

const AdminCharities: React.FC = () => {
  const [charities, setCharities] = useState<CharityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<CharityEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Healthcare',
    logo_url: '',
    website_url: '',
    is_active: true,
    is_featured: false
  });

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

  const openEditModal = (charity: CharityEntry) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name,
      description: charity.description,
      category: charity.category,
      logo_url: charity.logo_url,
      website_url: charity.website_url,
      is_active: charity.is_active,
      is_featured: charity.is_featured
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCharity(null);
    setFormData({
      name: '',
      description: '',
      category: 'Healthcare',
      logo_url: '',
      website_url: '',
      is_active: true,
      is_featured: false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCharity) {
        const { error } = await supabase
          .from('charities')
          .update(formData)
          .eq('id', editingCharity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('charities')
          .insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      await fetchCharities();
    } catch (error) {
      console.error('Error saving charity:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean, field: 'is_active' | 'is_featured') => {
    try {
      const { error } = await supabase
        .from('charities')
        .update({ [field]: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      await fetchCharities();
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}? This action is irreversible and may affect existing subscriptions.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('charities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchCharities();
    } catch (error) {
      console.error('Error deleting charity:', error);
      alert('Failed to delete charity. It may be referenced by existing subscriptions or donations.');
    }
  };

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Protocol 03: Charity Matrix Control</span>
          </div>
          <h1 className="text-6xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-none">
            Charity <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Matrix</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-2xl">
            Onboard new impact entities, manage global featuring priority, and audit total contributions across the distributed network.
          </p>
        </div>

        <button 
          onClick={openCreateModal}
          className="flex items-center gap-3 px-8 py-5 bg-primary text-background rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Onboard Entity
        </button>
      </div>

      {/* Main Grid */}
      <div className="glass-card overflow-hidden">
        <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-surface-container-low/50">
          <div className="relative flex-grow max-w-xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by charity name ident..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-background border border-white/5 rounded-2xl focus:outline-none focus:border-primary transition-all text-sm font-sans"
            />
          </div>
          
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-on-surface-variant">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-white/5">
                <th className="px-10 py-6">Entity Protocol</th>
                <th className="px-10 py-6">Operational Status</th>
                <th className="px-10 py-6">Category Index</th>
                <th className="px-10 py-6 text-center">Impact priority</th>
                <th className="px-10 py-6 text-right">Total Contributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-8">
                       <div className="h-10 bg-white/5 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredCharities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                     <EmptyState 
                      icon={Heart}
                      title="Charity Matrix Depopulated"
                      description="The impact matrix currently lacks any operational entities matching your search criteria. Adjust your filters or onboard a new strategic partner."
                      action={{ label: "Onboard Strategic Partner", onClick: openCreateModal }}
                      className="py-12 border-none bg-transparent"
                     />
                  </td>
                </tr>
              ) : (
                filteredCharities.map((charity) => (
                  <tr key={charity.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-surface-container-highest rounded-2xl flex items-center justify-center p-2 border border-white/5 shadow-xl group-hover:scale-110 transition-all">
                          <img src={charity.logo_url} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-lg uppercase tracking-tight">{charity.name}</p>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant font-sans">
                            <Globe className="w-3 h-3" />
                            {charity.website_url.replace(/^https?:\/\//, '')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <button 
                        onClick={() => toggleStatus(charity.id, charity.is_active, 'is_active')}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                          charity.is_active 
                            ? "bg-primary/10 border-primary/30 text-primary" 
                            : "bg-on-surface-variant/10 border-white/10 text-on-surface-variant opacity-50"
                        )}
                       >
                         {charity.is_active ? <CheckCircle2 className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                         {charity.is_active ? 'Active' : 'Offline'}
                       </button>
                    </td>
                    <td className="px-10 py-8 text-on-surface-variant font-sans text-sm">
                      {charity.category}
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex justify-center">
                          <button 
                            onClick={() => toggleStatus(charity.id, charity.is_featured, 'is_featured')}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                              charity.is_featured 
                                ? "bg-secondary/20 border-secondary text-secondary" 
                                : "bg-white/5 border-white/5 text-on-surface-variant opacity-20"
                            )}
                          >
                            <Award className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex flex-col items-end gap-1">
                          <p className="font-display font-bold text-2xl text-primary tracking-tighter">{formatCurrency(charity.total_raised)}</p>
                          <button 
                            onClick={() => openEditModal(charity)}
                            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mt-2"
                          >
                            <Edit3 className="w-3 h-3" /> Edit Profile
                          </button>
                          <button 
                            onClick={() => handleDelete(charity.id, charity.name)}
                            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-red-500 transition-colors mt-1"
                          >
                            <Trash2 className="w-3 h-3" /> Terminate Node
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

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-high rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-3xl font-display font-bold uppercase tracking-tight">
                    {editingCharity ? 'Edit Protocol' : 'Onboard Entity'}
                  </h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Entity Name</label>
                       <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Category</label>
                       <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm appearance-none"
                       >
                          <option>Healthcare</option>
                          <option>Environment</option>
                          <option>Education</option>
                          <option>Animal Welfare</option>
                          <option>Social Justice</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Description Matrix</label>
                     <textarea 
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm resize-none"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Logo URL identifier</label>
                       <div className="flex items-center gap-4">
                          <input 
                            required
                            type="text" 
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            className="flex-grow bg-background border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm font-mono"
                          />
                          <div className="w-14 h-14 bg-background border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
                             {formData.logo_url ? <img src={formData.logo_url} alt="" className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-5 h-5 opacity-20" />}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Hub URL</label>
                       <input 
                        required
                        type="url" 
                        value={formData.website_url}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm font-mono"
                       />
                    </div>
                  </div>

                  <div className="flex items-center gap-12 pt-6">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div 
                        onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all p-1",
                          formData.is_featured ? "bg-secondary" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full transition-all",
                          formData.is_featured ? "ml-6" : "ml-0"
                        )} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Elite Featuring</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                       <div 
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all p-1",
                          formData.is_active ? "bg-primary" : "bg-white/10"
                        )}
                      >
                         <div className={cn(
                          "w-4 h-4 bg-white rounded-full transition-all",
                          formData.is_active ? "ml-6" : "ml-0"
                        )} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Operational Status</span>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full py-6 bg-white text-background rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Archive Entity Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCharities;
