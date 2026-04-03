import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Heart, 
  TrendingUp, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../auth/AuthProvider';
import { cn } from '../../lib/utils';
import ProfileChip from '../ui/ProfileChip';

const UserSidebar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { icon: <Activity className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
    { icon: <Target className="w-5 h-5" />, label: 'Log Score', path: '/dashboard/scores' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Draws', path: '/dashboard/draws' },
    { icon: <Award className="w-5 h-5" />, label: 'Winnings', path: '/dashboard/winnings' },
    { icon: <Heart className="w-5 h-5" />, label: 'Charity', path: '/dashboard/charity' },
    { icon: <Settings className="w-5 h-5" />, label: 'Subscription', path: '/dashboard/subscription' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-80 h-screen sticky top-0 bg-surface-container-lowest border-r border-white/5 flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-10 mb-8">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
            <Trophy className="w-7 h-7 text-background" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-black tracking-tighter uppercase leading-none">
              Play <span className="text-primary italic">for</span> Good
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-on-surface-variant mt-1">
              Member Matrix
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-grow px-6 space-y-2">
        <div className="mb-6 px-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/50">Main Protocol</span>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
              isActive(item.path) 
                ? "bg-primary/10 text-primary" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-4 relative z-10">
              {React.cloneElement(item.icon, {
                className: cn(
                  item.icon.props.className, 
                  "transition-transform duration-500 group-hover:scale-110",
                  isActive(item.path) ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                )
              })}
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
            </div>
            {isActive(item.path) && (
              <motion.div 
                layoutId="activeIndicator"
                className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(78,222,163,0.5)]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 mt-auto space-y-6">
        <div className="h-px bg-white/5 mx-4" />
        
        <div className="space-y-2">
          <Link 
            to="/settings" 
            className="flex items-center gap-4 px-6 py-3 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Settings</span>
          </Link>
          <Link 
            to="/help" 
            className="flex items-center gap-4 px-6 py-3 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Support</span>
          </Link>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-4 px-6 py-3 text-on-surface-variant hover:text-red-500 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Terminate Session</span>
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-2 rounded-[2rem] bg-surface-container-low border border-white/5 hover:border-primary/30 transition-colors group cursor-pointer">
          <ProfileChip showDetails={true} className="p-2" />
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
