import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Zap, 
  Trophy, 
  Target, 
  Heart, 
  CheckCircle2, 
  Verified, 
  Leaf, 
  School, 
  Activity
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Charity } from '../types';

const Home: React.FC = () => {
  const { user } = useAuth();
  usePageTitle('Sovereign Catalyst');
  const [featuredCharities, setFeaturedCharities] = React.useState<Charity[]>([]);
  const [loadingCharities, setLoadingCharities] = React.useState(true);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('charities')
          .select('*')
          .eq('featured', true)
          .limit(3);
        
        if (error) throw error;
        setFeaturedCharities(data || []);
      } catch (err) {
        console.error('Error fetching featured charities:', err);
      } finally {
        setLoadingCharities(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary blur-[160px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary blur-[160px] rounded-full translate-y-1/3 -translate-x-1/4" />
        </div>
        
        <div className="relative z-10 max-w-[1920px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-10"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md w-fit">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">The Matrix is Synchronized</span>
            </div>
            
            <h1 className="font-display text-7xl md:text-[160px] leading-[0.85] font-black uppercase tracking-tighter max-w-6xl">
              Sovereign <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-on-surface to-secondary-container italic">Catalyst.</span>
            </h1>
            
            <p className="font-sans text-lg md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed">
              Achieve absolute precision. Your performance metrics translated into immediate, verifiable global impact. 
              Join the elite circle of change.
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mt-4">
              <Link to="/signup" className="group relative px-12 py-6 rounded-full bg-white text-background font-bold text-lg uppercase tracking-widest overflow-hidden hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-white/10">
                <span className="relative z-10">Initialize Flow</span>
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <Link to="/charities" className="text-on-surface-variant hover:text-white font-bold uppercase tracking-[0.3em] text-xs transition-colors flex items-center gap-4 group">
                Explore Charities
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-24 px-6 md:px-12 border-y border-white/5 bg-surface-container-lowest">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-2">
            <p className="font-display text-5xl font-black text-secondary tracking-tighter">£2.4M</p>
            <p className="font-sans text-sm uppercase tracking-widest text-on-surface-variant">Donated to Global Causes</p>
          </div>
          <div className="space-y-2">
            <p className="font-display text-5xl font-black text-primary tracking-tighter">15k+</p>
            <p className="font-sans text-sm uppercase tracking-widest text-on-surface-variant">Active Elite Members</p>
          </div>
          <div className="space-y-2">
            <p className="font-display text-5xl font-black text-on-surface tracking-tighter">250+</p>
            <p className="font-sans text-sm uppercase tracking-widest text-on-surface-variant">Vetted Charity Partners</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-6 uppercase">Master the Circle</h2>
            <p className="font-sans text-on-surface-variant text-lg">A seamless orchestration of skill and generosity, designed for those who demand excellence in every action.</p>
          </div>
          <span className="hidden md:block font-display text-9xl font-black text-white/5 pointer-events-none uppercase tracking-tighter">PROCESS</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: '01', title: 'Subscribe', desc: 'Choose your tier of impact. From Monthly to Sovereign Yearly, every membership fuels the engine of change.' },
            { id: '02', title: 'Add Scores', desc: 'Log your achievements. Our precise tracking system validates your prowess against the elite global field.', delay: 0.1, mt: true },
            { id: '03', title: 'Enter Monthly Draw', desc: 'Your skill translates into participation. Monthly draws reward the most consistent catalysts.', delay: 0.2 },
            { id: '04', title: 'Support & Win', desc: 'Experience the dual thrill of personal victory and tangible global contribution. Elevate yourself by elevating others.', delay: 0.3, mt: true, highlight: true }
          ].map((step) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.delay }}
              className={cn(
                "p-10 rounded-[2rem] transition-colors group",
                step.highlight ? "bg-surface-container-high border-t-2 border-primary/20" : "bg-surface-container-low hover:bg-surface-container",
                step.mt && "md:mt-12"
              )}
            >
              <span className={cn(
                "font-display text-4xl font-black transition-colors",
                step.highlight ? "text-secondary" : "text-primary/30 group-hover:text-primary"
              )}>
                {step.id}
              </span>
              <h3 className="font-display text-2xl font-bold mt-12 mb-4 uppercase">{step.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Matrix */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-lowest relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
        <div className="max-w-[1920px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="font-display text-5xl font-extrabold uppercase">The Impact Matrix</h2>
            <Link to="/charities" className="text-primary font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-4 transition-all">
              View All Partners <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingCharities ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="glass-card h-96 animate-pulse bg-white/5 rounded-[2.5rem]" />
              ))
            ) : featuredCharities.length > 0 ? (
              featuredCharities.map((charity, idx) => (
                <motion.div 
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="glass-card p-1 rounded-[2.5rem]"
                >
                  <Link to={`/charities/${charity.slug}`} className="bg-background rounded-[2.4rem] overflow-hidden block h-full">
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src={charity.image_url || charity.logo_url} 
                        alt={charity.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="p-8">
                      <span className="font-sans text-xs font-bold text-secondary uppercase tracking-widest">{charity.category}</span>
                      <h4 className="font-display text-2xl font-bold mt-4 mb-2 uppercase">{charity.name}</h4>
                      <p className="text-on-surface-variant text-sm mb-8 line-clamp-2">{charity.description}</p>
                      <div className="flex items-center gap-4 py-4 border-t border-white/5">
                        <Heart className="w-6 h-6 text-primary" />
                        <p className="font-display font-bold text-xl">{formatCurrency(charity.total_raised)} RAISED</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-card border-dashed">
                <p className="text-on-surface-variant uppercase tracking-widest text-sm font-bold">Network nodes initializing...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rewards Hierarchy */}
      <section className="py-32 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="text-center mb-24">
          <h2 className="font-display text-5xl font-extrabold mb-6 uppercase tracking-tighter">The Rewards Hierarchy</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">Precision is rewarded. Every tier of excellence unlocks a new dimension of potential.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="relative p-10 bg-surface-container rounded-full aspect-square flex flex-col items-center justify-center text-center border border-white/5">
            <span className="font-display text-xs font-bold text-primary mb-4 tracking-[0.3em] uppercase">Platinum Match</span>
            <h5 className="font-display text-6xl font-black mb-4">5/5</h5>
            <p className="font-sans text-on-surface-variant text-sm">Access to the Sovereign Vault.<br/>£1M+ Prize Pool Entry.</p>
          </div>
          
          <div className="relative p-10 bg-surface-container-high rounded-full aspect-square flex flex-col items-center justify-center text-center border-2 border-primary/20 md:scale-110 shadow-[0_0_80px_rgba(78,222,163,0.1)]">
            <span className="font-display text-xs font-bold text-secondary mb-4 tracking-[0.3em] uppercase">Gold Match</span>
            <h5 className="font-display text-6xl font-black mb-4">4/5</h5>
            <p className="font-sans text-on-surface-variant text-sm">Exclusive Luxury Rewards.<br/>£250k Prize Distribution.</p>
            <div className="absolute -top-4 bg-primary text-background px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest">MOST FREQUENT</div>
          </div>
          
          <div className="relative p-10 bg-surface-container rounded-full aspect-square flex flex-col items-center justify-center text-center border border-white/5">
            <span className="font-display text-xs font-bold text-tertiary mb-4 tracking-[0.3em] uppercase">Silver Match</span>
            <h5 className="font-display text-6xl font-black mb-4">3/5</h5>
            <p className="font-sans text-on-surface-variant text-sm">Impact Multipliers.<br/>Instant Digital Rewards.</p>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Monthly */}
            <div className="p-12 bg-surface-container rounded-[3rem] border border-white/5">
              <h3 className="font-display text-3xl font-bold mb-2 uppercase">Elite Monthly</h3>
              <p className="text-on-surface-variant mb-8">Maintain your edge month-by-month.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black">£25</span>
                <span className="text-on-surface-variant font-sans text-sm uppercase tracking-widest">/ Month</span>
              </div>
              <ul className="space-y-6 mb-12">
                <li className="flex items-center gap-4 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  1x Monthly Draw Entry
                </li>
                <li className="flex items-center gap-4 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Direct Impact Dashboard
                </li>
                <li className="flex items-center gap-4 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Basic Scoring Analytics
                </li>
              </ul>
              <Link to={user ? "/dashboard" : "/signup"} className="block w-full py-5 rounded-full border border-primary text-primary text-center font-bold hover:bg-primary/5 transition-all">
                {user ? "View Dashboard" : "Begin Journey"}
              </Link>
            </div>
            
            {/* Yearly */}
            <div className="relative p-12 bg-gradient-to-br from-surface-container-highest to-background rounded-[3rem] border-2 border-secondary/30 overflow-hidden shadow-2xl shadow-secondary/10">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/10 blur-[60px] rounded-full"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-3xl font-bold uppercase">Sovereign Yearly</h3>
                  <span className="bg-secondary text-background px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Best Value</span>
                </div>
                <p className="text-on-surface-variant mb-8">A legacy commitment to excellence.</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-secondary">£240</span>
                  <span className="text-on-surface-variant font-sans text-sm uppercase tracking-widest">/ Year</span>
                </div>
                <ul className="space-y-6 mb-12">
                  <li className="flex items-center gap-4">
                    <Verified className="w-5 h-5 text-secondary" />
                    Unlimited Draw Entries
                  </li>
                  <li className="flex items-center gap-4">
                    <Verified className="w-5 h-5 text-secondary" />
                    Concierge Charity Pairing
                  </li>
                  <li className="flex items-center gap-4">
                    <Verified className="w-5 h-5 text-secondary" />
                    Advanced Performance Metrics
                  </li>
                  <li className="flex items-center gap-4">
                    <Verified className="w-5 h-5 text-secondary" />
                    Exclusive Elite Member Events
                  </li>
                </ul>
                <Link to={user ? "/dashboard" : "/signup"} className="block w-full py-5 rounded-full bg-gradient-to-r from-secondary to-secondary-container text-background text-center font-bold hover:scale-105 transition-all">
                  {user ? "View Dashboard" : "Select Sovereign Tier"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Abstract light" 
            className="w-full h-full object-cover opacity-10" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCChrstWqBKftHByB15-_sSCv98zZFgQv6O54foF0v7-QhHsEoeVrSHBxkcymgJvtRDSK1qPMXlTXnOaOd5TURIn0TG6Mjn3ncBm4QVfZ5FGCmeAKIY3nwnYtLjxDsW_2uYW0kQYK7afjwMxpoT21pZpw_esGm73aiIXSqLgW_j8n8FC7b1Ygo0awTuakFXz84OAiIsZbk1l6n3_OZTxkkDIT3g_O4il4WNK6iub3za05179aJaB_pWeF_1hp_EupLYNBtrvBXbxiZP"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-display text-6xl md:text-8xl font-extrabold mb-10 tracking-tight uppercase">
            Elevate your game.<br/>
            <span className="text-primary">Change the world.</span>
          </h2>
          <Link to={user ? "/dashboard" : "/signup"} className="inline-block px-16 py-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-background font-bold text-xl hover:scale-105 transition-all active:scale-95 shadow-xl shadow-primary/20">
            {user ? "Return to Dashboard" : "Get Started Today"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;


