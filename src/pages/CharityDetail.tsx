import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Globe, ArrowLeft, Calendar, MapPin, 
  ExternalLink, CheckCircle2, ShieldCheck, 
  Zap, Share2, Info, Loader2, Trophy 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import { usePageTitle } from '../hooks/usePageTitle';
import { cn, formatCurrency } from '../lib/utils';
import type { Charity } from '../types';
import DonationModal from '../components/charity/DonationModal';

const CharityDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCharity();
    }
  }, [slug]);

  const fetchCharity = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('charities')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError || !data) {
        setError(true);
      } else {
        setCharity(data);
      }
    } catch (err) {
      console.error('Error fetching charity:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  usePageTitle(charity ? charity.name : 'Charity Profile');

  const handleSupport = async () => {
    if (!user) {
      // Pass the current charity context to signup
      navigate('/signup', { state: { preferredCharityId: charity?.id } });
      return;
    }

    if (!charity) return;

    setSelecting(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ selected_charity_id: charity.id })
        .eq('id', user.id);

      if (updateError) throw updateError;
      await refreshProfile();
      
      // Navigate to subscription flow to finalize support
      navigate('/dashboard/subscription');
    } catch (err) {
      console.error('Error selecting charity:', err);
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Accessing Impact Node...</p>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <div className="min-h-screen pt-40 px-6 bg-background flex flex-col items-center">
        <div className="glass-card p-20 text-center max-w-2xl border-dashed">
          <Info className="w-16 h-16 text-on-surface-variant mx-auto mb-8 opacity-20" />
          <h1 className="text-4xl font-display font-black uppercase mb-4 tracking-tighter">Node Not Found</h1>
          <p className="text-on-surface-variant mb-12">The charity profile you are looking for has been moved or does not exist in the matrix.</p>
          <Link to="/charities" className="inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-all">
            <ArrowLeft className="w-5 h-5" /> Back to Network
          </Link>
        </div>
      </div>
    );
  }

  const isSelected = profile?.selected_charity_id === charity.id;
  const events = charity.upcoming_events || [];

  return (
    <>
      <DonationModal 
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        charity={charity}
      />

      <div className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={charity.image_url || charity.logo_url} 
            alt={charity.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-12"
            >
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                  <span className="px-5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest">
                    {charity.category}
                  </span>
                  {charity.featured && (
                    <span className="px-5 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Trophy className="w-3 h-3" /> Featured Partner
                    </span>
                  )}
                </div>
                <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none">
                  {charity.name}
                </h1>
                <div className="flex flex-wrap items-center gap-8 text-on-surface-variant">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-secondary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Vetted Organization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">100% Impact Score</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-6">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-2">Total Generated Impact</p>
                  <p className="text-5xl font-display font-black text-on-surface tracking-tighter">
                    {formatCurrency(charity.total_raised)}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={() => setIsDonationModalOpen(true)}
                    className="px-8 py-6 rounded-full border border-white/10 hover:bg-white/5 font-bold uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20"
                  >
                    <Heart className="w-4 h-4 text-primary" /> One-time Donation
                  </button>
                  <button 
                    onClick={handleSupport}
                    disabled={isSelected || selecting}
                    className={cn(
                      "px-12 py-6 rounded-full flex items-center gap-4 font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-2xl",
                      isSelected 
                        ? "bg-secondary/20 border border-secondary/40 text-secondary cursor-default shadow-secondary/10" 
                        : "bg-primary text-background hover:scale-105 active:scale-95 shadow-primary/20"
                    )}
                  >
                    {selecting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing</>
                    ) : isSelected ? (
                      <><CheckCircle2 className="w-5 h-5" /> Currently Supporting</>
                    ) : (
                      <><Zap className="w-5 h-5" /> {user ? 'Commit Support' : 'Join to Support'}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Narrative */}
          <div className="lg:col-span-2 space-y-16">
            <div className="glass-card p-12 md:p-16 space-y-12 bg-surface-container-low/50">
              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold uppercase tracking-tight flex items-center gap-4">
                  <Info className="w-6 h-6 text-primary" /> The Mission
                </h2>
                <div className="prose prose-invert max-w-none prose-p:text-on-surface-variant prose-p:text-lg prose-p:leading-relaxed prose-p:font-sans">
                  <p className="text-on-surface font-semibold italic text-xl mb-8 leading-relaxed">
                    {charity.description}
                  </p>
                  {charity.long_description ? (
                    <div dangerouslySetInnerHTML={{ __html: charity.long_description.replace(/\n/g, '<br />') }} />
                  ) : (
                    <p>
                      This organization's complete operational matrix is currently being synchronized. 
                      Supporting {charity.name} directly impacts critical local initiatives within the {charity.category} sector.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Strategic Focus</h4>
                  <ul className="space-y-3">
                    {['Resource Optimization', 'Direct Community Action', 'Sustainable Infrastructure'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-on-surface-variant font-sans">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">External Linkages</h4>
                  <a 
                    href={charity.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-on-surface hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
                  >
                    Official Portal <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <AnimatePresence>
              {events.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl font-display font-bold uppercase tracking-tight pl-2">
                    Impact <span className="text-primary italic">Events.</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event, idx) => (
                      <div key={idx} className="glass-card p-10 group hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5 text-secondary" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant bg-white/5 px-3 py-1 rounded-full">
                            Protocol Event
                          </span>
                        </div>
                        <h4 className="text-xl font-display font-bold uppercase mb-2 tracking-tight">{event.title}</h4>
                        <div className="space-y-2 mb-8">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{event.location}</span>
                          </div>
                        </div>
                        <button className="w-full py-4 rounded-xl border border-white/5 text-[9px] font-bold uppercase tracking-widest hover:bg-primary hover:text-background transition-all">
                          RSVP Protocol
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="glass-card p-10 bg-surface-container-high/30">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                <Share2 className="w-4 h-4 text-primary" /> Matrix Sync
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-10 font-sans">
                By supporting {charity.name}, 100% of your allocated monthly pledge is transferred via the Sovereign Distributed Ledger to their verified accounts.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <span>Transparency Rating</span>
                  <span className="text-primary">AA+</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-primary shadow-[0_0_10px_#4EDE7B]" />
                </div>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full py-4 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <><CheckCircle2 className="w-3 h-3 text-primary" /><span className="text-primary">Link Copied</span></>
                ) : (
                  'Share Profile'
                )}
              </button>
            </div>

            <Link 
              to="/signup" 
              className="block glass-card p-10 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 group hover:border-primary/40 transition-all"
            >
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">New Protocol Member?</h4>
              <p className="text-xl font-display font-bold uppercase mb-8 leading-tight">Join the Elite Circle to Start Supporting Causes.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary group-hover:translate-x-2 transition-transform">
                Initialize Signup <ArrowLeft className="w-4 h-4 rotate-180" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default CharityDetail;
