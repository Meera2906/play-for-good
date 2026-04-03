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
import { cn } from '../lib/utils';
import { useAuth } from '../components/auth/AuthProvider';
import { usePageTitle } from '../hooks/usePageTitle';

const Home: React.FC = () => {
  const { user } = useAuth();
  usePageTitle('Sovereign Catalyst');

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
          <img 
            alt="Abstract movement" 
            className="w-full h-full object-cover opacity-40" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv1RidseoIOVSOyKnOOJnr0kJ6ggjvnfSxPkvE3CYkFJLrRw4gJLbwQLwVwrYo0bCrsdjfvNFjPU3f1UtiDvagvLXp8SYk-qvmTOolu1eEMPue0BuJXxFirtSASpXDYmnIy0GDYkXut4PPUliHUFplsomR2sxkiCfypBTlN0SR0HXcajT3Oh53x_QF4o1sFxAL_W7oJuC9r_zInYTuLAqn4MgxCLEryveL3GlW2djAD0EEFoI1543s49aspV2NpB_kIIXjQ_ZGyl9b"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-20 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6 px-4 py-1 rounded-full bg-primary/10 text-primary font-sans text-xs font-bold uppercase tracking-[0.2em]"
          >
            The Sovereign Catalyst
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-7xl md:text-9xl font-extrabold tracking-tight leading-[0.9] mb-8"
          >
            The Elite Game.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">The Greatest Good.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-sans text-xl text-on-surface-variant max-w-2xl mb-12 leading-relaxed"
          >
            Elevate your competitive spirit within a private digital circle dedicated to global impact. Precision gaming meets philanthropic excellence.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-6"
          >
            <Link to={user ? "/dashboard" : "/signup"} className="px-10 py-5 rounded-full bg-gradient-to-br from-primary to-primary-container text-background font-bold text-lg hover:scale-105 transition-all active:scale-95">
              {user ? "Enter Dashboard" : "Join the Elite"}
            </Link>
            <Link to="/charities" className="px-10 py-5 rounded-full bg-surface-container-highest border border-primary/20 text-primary font-bold text-lg hover:bg-primary/5 transition-all active:scale-95">
              Explore Charities
            </Link>
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
          <span className="hidden md:block font-display text-9xl font-black text-white/5 pointer-events-none uppercase">PROCESS</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: '01', title: 'Subscribe', desc: 'Choose your tier of impact. From Silver to Sovereign, every membership fuels the collective engine of change.' },
            { id: '02', title: 'Add Scores', desc: 'Log your achievements. Our precise tracking system validates your prowess against the elite global field.', delay: 0.1, mt: true },
            { id: '03', title: 'Enter Monthly Draw', desc: 'Your skill translates into participation. Monthly high-stakes draws reward the most consistent catalysts.', delay: 0.2 },
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
          <h2 className="font-display text-5xl font-extrabold mb-16 uppercase">The Impact Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                category: 'Hunger Relief',
                title: 'Vital Nourish',
                desc: 'Eradicating urban food deserts through sustainable community kitchens.',
                stat: '500k+ Meals Provided',
                icon: <Heart className="w-6 h-6 text-primary" />,
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqKjAeeakOWW3BxhnipRzx8QtINLRMGPC2AIJdUYCSvLfSUyrunpxtpcMHCR1gBr8xkPSdXv2TXqm9cHJWTvTNH88KV06nAj-g6iUr9cLk5vIWmQzNKhpnVY_qf5Th1-7yz_6eoEiUDoY4T08P0vstwC1oayfXdLIHGqJcNpsu13xZPqTD38TbvPbq7c74aN5Gq89GmHtYaKSWmM3DXw9JsZWpzEttTIr7LSYnMiSt2hv3zp1MsCqDjbj4aybh7N5-YqrSREriE--'
              },
              {
                category: 'Ecosystems',
                title: 'Emerald Canopy',
                desc: 'Direct action reforestation projects in the world\'s most critical biomes.',
                stat: '1.2M Trees Planted',
                icon: <Zap className="w-6 h-6 text-primary" />,
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZELdRGXqzgoNTRnIc5TbDnMPkZ04_NJwz0M4sOadSVk_q0RWkG8de9VjHKArjRb50yf012akFA9TFR5cPBlPoMv2kHATHSDEg-ocRiyEwd8QmY-G2F82qvX2-Zi1II1Ty5nK17-hsQvPEayPBsx1kCtv2-5crTmhY5xcoOXaZdoBdioZhpLnhnpw5n7RhnuXavzWOKte7vN31JFla6Ld8rgOlIoDwUXVF3YpIHaTf8z1PRcao8cE1rxQmrEMXvVY8y2Y0co6qXI3'
              },
              {
                category: 'Education',
                title: 'Bright Horizon',
                desc: 'Equipping underfunded schools with next-generation digital tools.',
                stat: '45k Scholarships',
                icon: <School className="w-6 h-6 text-primary" />,
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt0J6XU2vSjArjjrH8GAUtUf5djQy41bBRHrDqjm5Ku_f12AUeTZ8E60nJfbSvmK-qd6cjX-Xn_MDyo9NQOUC3FL1SUTlqXCWB0ncyqfWMBnmHspeTDP7Q8lEewKvhIs4nDh55q3T9rICvKk26ZmOpqfodDOJGpq_78qB99_ZPqJj8wTqMPLx9PPhMTALjmZHYH2DZSBymlrcQjCV9yq-ugyscv83xeD1KuEcEZ2U7lleTRo95a-uRCj95G5bT6HP1mRs08IQabnpK'
              }
            ].map((charity, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-card p-1 rounded-[2.5rem]"
              >
                <div className="bg-background rounded-[2.4rem] overflow-hidden">
                  <div className="h-64 overflow-hidden">
                    <img src={charity.img} alt={charity.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-8">
                    <span className="font-sans text-xs font-bold text-secondary uppercase tracking-widest">{charity.category}</span>
                    <h4 className="font-display text-2xl font-bold mt-4 mb-2 uppercase">{charity.title}</h4>
                    <p className="text-on-surface-variant text-sm mb-8">{charity.desc}</p>
                    <div className="flex items-center gap-4 py-4 border-t border-white/5">
                      {charity.icon}
                      <p className="font-display font-bold text-xl">{charity.stat}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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


