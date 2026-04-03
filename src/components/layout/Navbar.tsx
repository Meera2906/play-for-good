import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../auth/AuthProvider';
import { cn } from '../../lib/utils';

import ProfileChip from '../ui/ProfileChip';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  // Hide navbar on dashboard and admin routes as they have sidebars
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isDashboard) return null;

  const navLinks = [
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'Charities', path: '/charities' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-12 py-8",
      scrolled ? "bg-background/80 backdrop-blur-2xl border-b border-white/5 py-5" : "bg-transparent"
    )}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
            <Trophy className="w-6 h-6 text-background" />
          </div>
          <span className="text-2xl font-display font-black tracking-tighter uppercase group-hover:text-primary transition-colors">
            Play <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">for</span> Good
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:text-primary relative group",
                isActive(link.path) ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-2 left-0 h-0.5 bg-primary transition-all duration-500",
                isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <div className="flex items-center gap-8">
              <ProfileChip showDetails={false} className="hover:scale-105 transition-transform" />
              <Link 
                to={profile?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-3 group"
              >
                <LayoutDashboard className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Dashboard
              </Link>
              <button 
                onClick={signOut} 
                className="px-8 py-3 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all active:scale-95"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-10">
              <Link to="/login" className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="bg-gradient-to-br from-primary to-primary-container text-background font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95">
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center border border-white/5" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-3xl border-b border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-10 flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-2xl font-display font-bold uppercase tracking-tight",
                    isActive(link.path) ? "text-primary" : "text-on-surface"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/5" />
              {user ? (
                <div className="flex flex-col gap-6">
                  <Link 
                    to={profile?.role === 'admin' ? '/admin' : '/dashboard'} 
                    className="text-xl font-display font-bold uppercase text-primary flex items-center gap-3" 
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { signOut(); setIsOpen(false); }} 
                    className="text-on-surface-variant flex items-center gap-4 text-sm font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 text-center">
                  <Link to="/login" className="text-xl font-display font-bold uppercase border border-white/10 py-4 rounded-full" onClick={() => setIsOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/signup" className="w-full py-5 rounded-full bg-primary text-background text-center font-bold uppercase tracking-widest shadow-lg shadow-primary/20" onClick={() => setIsOpen(false)}>
                    Apply for Entry
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
