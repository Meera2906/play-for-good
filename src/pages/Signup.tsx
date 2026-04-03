import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Trophy, Mail, Lock, User, ArrowRight, Github, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useAuth } from '../components/auth/AuthProvider';
import { usePageTitle } from '../hooks/usePageTitle';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  usePageTitle('Protocol Initialization');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, profile, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile
        // We use upsert to ensure the profile exists even if a trigger failed
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name: data.fullName,
            email: data.email,
            role: 'user',
            subscription_status: 'inactive',
            subscription_tier: 'none',
            onboarding_completed: false,
            lifetime_winnings: 0,
            total_impact: 0,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here, instead log it and maybe show a notice
          // If auth succeeded but profile failed, they can still try to log in
          setError('Account created, but profile setup failed. Please contact support.');
          return;
        }

        // If session exists (auto-login enabled in Supabase), redirect to onboarding
        if (authData.session) {
          navigate('/onboarding');
        } else {
          setSuccess(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 pt-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl text-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-primary/20"
          >
            <CheckCircle2 className="text-background w-16 h-16" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter leading-none mb-8">
            Application <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Submitted</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-md mx-auto mb-12 leading-relaxed">
            Your entry into the Play for Good matrix is being processed. Please check your email to verify your account.
          </p>
          <Link to="/login" className="inline-block w-full py-6 text-[10px] bg-primary text-background font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 active:scale-95 text-center">Return to Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pt-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-4 mb-10 group"
          >
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
              <Trophy className="text-background w-8 h-8" />
            </div>
            <span className="font-display font-black text-3xl tracking-tighter uppercase">Play for Good</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter leading-none mb-6">
            Apply for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Entry</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-md mx-auto">
            Join the elite community of mission-driven golfers.
          </p>
        </div>

        <div className="glass-card p-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-2xl mb-10 flex items-center gap-4 text-sm font-medium"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant ml-2">Full Name</label>
                <div className="relative group/input">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within/input:text-primary transition-colors" />
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="John Doe"
                    className={cn(
                      "w-full bg-surface-container-low border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm outline-none focus:border-primary transition-all font-sans",
                      errors.fullName && "border-red-500/50 focus:border-red-500"
                    )}
                  />
                </div>
                {errors.fullName && <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2 ml-2">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant ml-2">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within/input:text-primary transition-colors" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@example.com"
                    className={cn(
                      "w-full bg-surface-container-low border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm outline-none focus:border-primary transition-all font-sans",
                      errors.email && "border-red-500/50 focus:border-red-500"
                    )}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2 ml-2">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant ml-2">Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within/input:text-primary transition-colors" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className={cn(
                      "w-full bg-surface-container-low border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm outline-none focus:border-primary transition-all font-sans",
                      errors.password && "border-red-500/50 focus:border-red-500"
                    )}
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2 ml-2">{errors.password.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant ml-2">Confirm Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within/input:text-primary transition-colors" />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className={cn(
                      "w-full bg-surface-container-low border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm outline-none focus:border-primary transition-all font-sans",
                      errors.confirmPassword && "border-red-500/50 focus:border-red-500"
                    )}
                  />
                </div>
                {errors.confirmPassword && <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2 ml-2">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-[10px] bg-primary text-background font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Processing...' : 'Create Account'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>
        </div>

        <p className="text-center mt-12 text-on-surface-variant text-sm font-sans">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:text-secondary transition-colors">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
