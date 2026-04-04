import React from 'react';
import { motion } from 'motion/react';
import { 
  Star, Edit3, Layers, Globe, Award, 
  Zap, Shield, Heart, Users, Gift, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { cn } from '../lib/utils';

const HowItWorks: React.FC = () => {
  usePageTitle('The Protocol');

  const protocolSteps = [
    { 
      id: '01', 
      title: 'Join the Elite', 
      desc: "Access the platform via a premium subscription. Your membership isn't just a fee—it's your initial stake in a global ecosystem of change.",
      icon: Star,
      color: 'text-primary'
    },
    { 
      id: '02', 
      title: 'Log Your Prowess', 
      desc: "Enter your Stableford scores after every round. Every point contributes to your standing in the Sovereign Leaderboard.",
      icon: Edit3,
      color: 'text-secondary'
    },
    { 
      id: '03', 
      title: 'The Monthly Draw', 
      desc: "Our algorithmically-driven prize pools reward precision. Numbers are drawn monthly based on collective platform activity.",
      icon: Layers,
      color: 'text-tertiary'
    },
    { 
      id: '04', 
      title: 'Global Redemption', 
      desc: "A massive portion of every pool is directed to high-impact charities. Your game funds humanitarian catalysts worldwide.",
      icon: Globe,
      color: 'text-primary'
    }
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-on-primary font-body overflow-x-hidden">
      <main className="pt-24">
        
        {/* Hero Section */}
        <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden px-6 md:px-12">
          {/* Subtle Glows to match image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[160px] opacity-20"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-5xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block text-[10px] md:text-xs uppercase tracking-[0.4em] text-secondary font-black mb-10"
            >
              The Blueprint for Impact
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-headline text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-14"
            >
              The Alchemy of <br/>
              <motion.span 
                className="text-gradient italic inline-block cursor-default"
                whileHover={{ 
                  scale: 1.1, 
                  skewX: -10,
                  filter: "brightness(1.5) drop-shadow(0 0 15px rgba(78, 222, 163, 0.5))",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Impact
              </motion.span> and Rewards
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative p-8 flex flex-col md:flex-row gap-6 justify-center items-center rounded-[2.5rem] overflow-hidden"
            >
              {/* Kinetic Background Glow for Buttons */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl -z-10 animate-pulse"></div>
              
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(78, 222, 163, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-vibrant min-w-[240px] text-[#242424]"
                >
                  Join Now
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline-dark min-w-[240px] backdrop-blur-md"
              >
                View Prize Pools
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* The Protocol - Bento Style */}
        <section className="px-6 md:px-24 py-32 bg-background">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-24">
              <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase">The Protocol</h2>
              <p className="text-on-surface-variant text-xl leading-relaxed font-light max-w-2xl opacity-60">
                Transform your performance on the green into significant global change. A four-step cycle of prowess, contribution, and reward.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {protocolSteps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl glass-panel p-12 transition-all hover:bg-surface-container-high/40",
                    idx === 0 || idx === 3 ? "lg:col-span-2" : "lg:col-span-1"
                  )}
                >
                  {/* Subtle Background Number */}
                  <div className="absolute bottom-8 right-12 text-[180px] font-headline font-black text-white/[0.03] leading-none pointer-events-none group-hover:text-primary/5 transition-colors">
                    {step.id}
                  </div>
                  
                  <div className={cn("mb-10 w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5", step.color)}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-headline text-3xl font-black mb-6 uppercase tracking-tight">{step.title}</h3>
                  <p className={cn(
                    "text-on-surface-variant text-lg leading-relaxed font-light opacity-80",
                    idx === 0 || idx === 3 ? "max-w-xl" : "max-w-sm"
                  )}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Reward Tiers */}
        <section className="py-32 px-6 md:px-24 relative bg-surface-container-lowest">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-24">
              <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter uppercase mb-6">The Reward Tiers</h2>
              <p className="text-on-surface-variant text-xl opacity-60 font-light">The algorithm identifies the architects of the game.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-12">
              {/* Sovereign Jackpot */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col items-center text-center p-12 glass-panel border-white/5">
                <div className="mb-10 p-6 bg-secondary/10 rounded-full">
                  <Award className="w-10 h-10 text-secondary" />
                </div>
                <h4 className="font-headline text-[10px] font-bold tracking-[0.4em] text-secondary mb-4 uppercase">5 Numbers Match</h4>
                <h3 className="font-headline text-3xl font-black mb-8 uppercase tracking-tighter">The Sovereign Jackpot</h3>
                <div className="text-6xl font-black text-secondary mb-10 tracking-tighter">$250,000+</div>
                <p className="text-on-surface-variant text-sm font-light leading-relaxed max-w-[240px] opacity-60">
                  The ultimate manifestation of prowess. This pool scales with the collective success of the club.
                </p>
              </motion.div>

              {/* Catalyst Match - Featured */}
              <motion.div 
                whileHover={{ y: -10 }} 
                className="flex flex-col items-center text-center p-14 glass-panel border-primary/20 bg-surface-container-high relative z-10 lg:-mt-12 lg:mb-12"
              >
                <div className="mb-10 p-6 bg-primary/20 rounded-full">
                  <Zap className="w-10 h-10 text-primary fill-primary" />
                </div>
                <h4 className="font-headline text-[10px] font-bold tracking-[0.4em] text-primary mb-4 uppercase">4 Numbers Match</h4>
                <h3 className="font-headline text-3xl font-black mb-8 uppercase tracking-tighter">The Catalyst Match</h3>
                <div className="text-7xl font-black text-primary mb-10 tracking-tighter">$50,000+</div>
                <p className="text-on-surface-variant text-sm font-light leading-relaxed max-w-[240px] opacity-60">
                  Fueling the next level of your journey. High-frequency rewards for consistent excellence.
                </p>
              </motion.div>

              {/* Guardian Prize */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col items-center text-center p-12 glass-panel border-white/5">
                <div className="mb-10 p-6 bg-tertiary/10 rounded-full">
                  <Shield className="w-10 h-10 text-tertiary" />
                </div>
                <h4 className="font-headline text-[10px] font-bold tracking-[0.4em] text-tertiary mb-4 uppercase">3 Numbers Match</h4>
                <h3 className="font-headline text-3xl font-black mb-8 uppercase tracking-tighter">The Guardian Prize</h3>
                <div className="text-6xl font-black text-tertiary mb-10 tracking-tighter">$5,000+</div>
                <p className="text-on-surface-variant text-sm font-light leading-relaxed max-w-[240px] opacity-60">
                  Rewarding the foundation of our community. Frequent wins to sustain the charitable momentum.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quantifiable Impact Stats */}
        <section className="py-40 px-6 md:px-24 bg-background">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-4">
              <h2 className="font-headline text-5xl font-black tracking-tighter uppercase mb-8 leading-[0.95]">
                Quantifiable <br/><span className="text-primary italic">Impact</span>
              </h2>
              <p className="text-on-surface-variant text-xl leading-relaxed font-light opacity-60">
                We don't just promise change; we execute it. Our transparent ledger tracks every dollar from green to global need.
              </p>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { val: '$12.8M', label: 'TOTAL DONATED', color: 'border-primary' },
                { val: '42,500+', label: 'ACTIVE MEMBERS', color: 'border-secondary' },
                { val: '$1.2M', label: 'MONTHLY REWARDS', color: 'border-tertiary' }
              ].map((stat, i) => (
                <div key={i} className={cn(
                  "bg-surface-container-low p-12 rounded-2xl flex flex-col justify-between h-72 border-l-4 transition-all hover:bg-surface-container",
                  stat.color
                )}>
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-on-surface-variant/40" />
                  </div>
                  <div>
                    <div className="text-5xl font-black font-headline mb-4 tracking-tighter">{stat.val}</div>
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Big CTA */}
        <section className="py-60 px-6 md:px-24 text-center bg-background border-t border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[200px] -z-10"></div>
          
          <div className="max-w-5xl mx-auto">
            <h2 className="font-headline text-6xl md:text-[120px] font-black tracking-tighter leading-[0.8] uppercase mb-16">
              Elevate your game. <br/>
              <motion.span 
                className="text-gradient italic inline-block cursor-default"
                whileHover={{ 
                  scale: 1.05, 
                  skewX: -5,
                  filter: "brightness(1.2) drop-shadow(0 0 20px rgba(78, 222, 163, 0.4))",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                Change the world.
              </motion.span>
            </h2>
            
            <div className="flex justify-center">
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(78, 222, 163, 0.4)" }}
                  whileTap={{ scale: 0.9 }}
                  className="btn-vibrant px-20 py-8 min-w-[320px] text-xl text-[#242424]"
                >
                  Establish Membership
                </motion.button>
              </Link>
            </div>
            
            <p className="mt-20 text-on-surface-variant text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase opacity-40">
              The elite choice for charitable golf.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;
