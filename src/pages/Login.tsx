import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Trophy, Mail, Lock, ArrowRight, Github, Chrome, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useAuth } from '../components/auth/AuthProvider';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, profile, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        // Fetch profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

         if (profileError && profileError.code !== 'PGRST116') {
           console.error('Error fetching profile:', profileError);
         }

        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pt-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10"
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
            Access the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Matrix</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-md mx-auto">
            Enter your credentials to re-engage with the elite community.
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
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant ml-2">Entity Identity</label>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Security Key</label>
                <Link to="/forgot-password" title="Forgot password?" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-secondary transition-colors">Forgot Key?</Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-[10px] bg-primary text-background font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Authenticating...' : 'Initiate Access'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="bg-surface-container px-6 text-on-surface-variant font-bold">Alternative Protocols</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-4 py-5 rounded-2xl bg-surface-container-high border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all active:scale-95">
              <Chrome className="w-5 h-5" /> Google
            </button>
            <button onClick={() => handleSocialLogin('github')} className="flex items-center justify-center gap-4 py-5 rounded-2xl bg-surface-container-high border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all active:scale-95">
              <Github className="w-5 h-5" /> GitHub
            </button>
          </div>
        </div>

        <p className="text-center mt-12 text-on-surface-variant text-sm font-sans">
          New to the ecosystem? <Link to="/signup" className="text-primary font-bold hover:text-secondary transition-colors">Apply for Entry</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
