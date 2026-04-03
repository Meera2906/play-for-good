import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, Target, Trophy, Heart, ArrowRight, 
  CheckCircle2, Info, ShieldCheck, Globe, 
  Award, TrendingUp, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: 'The Elite Entry',
      desc: 'Join the platform with a monthly or yearly subscription. This fuels the prize pool and charity impact.',
      icon: <Zap className="w-8 h-8 text-primary" />,
      details: [
        'Select your subscription tier',
        'Choose your primary charity',
        'Receive your unique member ID'
      ]
    },
    {
      title: 'Performance Matrix',
      desc: 'Submit your latest 5 Stableford scores. Our system tracks your peak performance across any certified course.',
      icon: <Target className="w-8 h-8 text-tertiary" />,
      details: [
        'Stableford format (1-45 points)',
        'Latest 5 scores count',
        'Verification against club records'
      ]
    },
    {
      title: 'The Monthly Draw',
      desc: 'Every month, our algorithmic engine selects winners based on performance and participation.',
      icon: <Trophy className="w-8 h-8 text-secondary" />,
      details: [
        'Performance-weighted selection',
        'Transparent prize distribution',
        'Automatic charity funding'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1 rounded-full mb-8"
          >
            <Info className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The Blueprint for Impact.</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-none">
            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Circle</span>
          </h1>
          <p className="text-on-surface-variant text-xl max-w-3xl mx-auto leading-relaxed font-sans">
            Play for Good is an algorithmic performance platform that transforms your golf game into a global force for good. Here is how we do it.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-40 mb-40">
          {steps.map((step, idx) => (
            <div key={idx} className={cn(
              "flex flex-col md:flex-row items-center gap-16 md:gap-32",
              idx % 2 === 1 ? "md:flex-row-reverse" : ""
            )}>
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center border border-white/5 shadow-xl">
                    {React.cloneElement(step.icon as React.ReactElement, { className: 'w-10 h-10 text-primary' })}
                  </div>
                  <span className="text-7xl font-display font-black text-white/5">0{idx + 1}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-tight">
                  {step.title}
                </h2>
                <p className="text-on-surface-variant text-lg leading-relaxed mb-12 font-sans">
                  {step.desc}
                </p>
                <ul className="space-y-6">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-4 group">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-display font-bold uppercase tracking-tight text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full aspect-square glass-card p-1 rounded-[3rem] relative overflow-hidden group">
                <div className="bg-background rounded-[2.9rem] h-full relative overflow-hidden flex flex-col items-center justify-center text-center p-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
                  <div className="relative z-10">
                    <div className="w-40 h-40 bg-surface-container-low rounded-full border-4 border-white/5 flex items-center justify-center mb-10 group-hover:scale-105 transition-transform duration-700 shadow-2xl">
                      {React.cloneElement(step.icon as React.ReactElement, { className: 'w-20 h-20 text-primary' })}
                    </div>
                    <div className="space-y-4">
                      <div className="h-2 w-64 bg-surface-container-high rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-primary w-2/3 animate-pulse" />
                      </div>
                      <div className="h-2 w-40 bg-surface-container-high rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-secondary w-1/2 animate-pulse delay-75" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-40">
          {[
            { title: 'Algorithmic Fairness', desc: 'Our proprietary algorithm ensures that performance is weighted against participation for maximum fairness.', icon: <ShieldCheck className="w-8 h-8" /> },
            { title: 'Global Transparency', desc: 'Every penny raised for charity is tracked and verified on our public impact ledger.', icon: <Globe className="w-8 h-8" /> },
            { title: 'Elite Community', desc: 'Connect with high-performance individuals who share your passion for golf and mission-driven impact.', icon: <Users className="w-8 h-8" /> },
            { title: 'Verified Records', desc: 'We integrate with official club records to ensure every score submitted is authentic and verified.', icon: <Award className="w-8 h-8" /> },
            { title: 'Real-time Analytics', desc: 'Track your performance trends and see your impact grow with every round you play.', icon: <TrendingUp className="w-8 h-8" /> },
            { title: 'Mission Driven', desc: 'Our primary goal is to generate £10M+ for global charities by 2030 through the power of golf.', icon: <Heart className="w-8 h-8" /> },
          ].map((feature, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -10 }}
              className="glass-card p-1 rounded-[2.5rem] group"
            >
              <div className="bg-background rounded-[2.4rem] p-10 h-full">
                <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-8 text-primary border border-white/5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold uppercase mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed font-sans">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card p-1 rounded-[3rem] overflow-hidden relative group">
          <div className="bg-surface-container-low/30 rounded-[2.9rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-1000" />
            <h2 className="text-5xl md:text-8xl font-display font-extrabold uppercase tracking-tighter mb-10 leading-none relative z-10">
              The Matrix is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Open</span>
            </h2>
            <p className="text-2xl text-on-surface-variant mb-16 max-w-2xl mx-auto relative z-10 font-sans leading-relaxed">
              Join the elite community of golfers making a global impact. Subscription spots are limited.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-12 py-5 rounded-full bg-gradient-to-br from-primary to-primary-container text-background font-bold text-xl hover:scale-105 transition-all active:scale-95"
              >
                Apply for Entry
              </Link>
              <Link 
                to="/charities" 
                className="w-full sm:w-auto px-12 py-5 rounded-full border border-white/10 text-white font-bold text-xl hover:bg-white/5 transition-all active:scale-95"
              >
                Explore Charities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
