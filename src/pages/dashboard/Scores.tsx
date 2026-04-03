import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Calendar, MapPin, Plus, Trash2, Trophy, Loader2, AlertCircle, Lock, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';
import { cn, formatDate } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import type { Score } from '../../types';

const scoreSchema = z.object({
  course_name: z.string().min(2, 'Course name must be at least 2 characters'),
  date: z.string().min(1, 'Date is required'),
  stableford_points: z.coerce.number().min(1, 'Points must be at least 1').max(45, 'Max Stableford points is 45'),
});

type ScoreFormValues = z.infer<typeof scoreSchema>;

const Scores: React.FC = () => {
  const { user } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      course_name: '',
      stableford_points: 0
    } as any
  });

  useEffect(() => {
    if (user) {
      fetchScores();
    }
  }, [user]);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setScores(data || []);
    } catch (err: any) {
      console.error('Error fetching scores:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: ScoreFormValues) => {
    if (!isActive) {
      setError('Active subscription required to submit scores.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // 1. Get current scores to enforce the 5-score limit
      const { data: currentScores, error: fetchError } = await supabase
        .from('scores')
        .select('id, date')
        .eq('user_id', user!.id)
        .order('date', { ascending: true }); // Oldest first

      if (fetchError) throw fetchError;

      // 2. If we already have 5 or more scores, delete the oldest
      if (currentScores && currentScores.length >= 5) {
        const scoresToDelete = currentScores.length - 4; // We want to leave room for 1
        const idsToDelete = currentScores.slice(0, scoresToDelete).map(s => s.id);
        
        const { error: deleteError } = await supabase
          .from('scores')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) throw deleteError;
      }

      // 3. Insert the new score
      const { error: insertError } = await supabase
        .from('scores')
        .insert([{
          user_id: user!.id,
          course_name: formData.course_name,
          date: formData.date,
          stableford_points: formData.stableford_points
        }]);

      if (insertError) throw insertError;

      reset();
      fetchScores();
    } catch (err: any) {
      setError(err.message || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scoreId: string) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return;
    
    try {
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', scoreId);

      if (error) throw error;
      fetchScores();
    } catch (err: any) {
      console.error('Failed to delete score:', err);
      alert('Failed to delete score');
    }
  };

  const avgScore = scores.length > 0 
    ? (scores.reduce((acc, s) => acc + s.stableford_points, 0) / scores.length).toFixed(1)
    : '0';

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Performance Log</h1>
      </div>
      <p className="text-on-surface-variant mb-12">
        Track your latest 5 rounds. Your draw entry capability is calculated based on the average of your maximum 5 active scores.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Score Entry Form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 bg-surface-container-high/30 relative overflow-hidden">
            {!isActive && (
              <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-8 text-center border border-dashed border-primary/20">
                <div className="flex flex-col items-center">
                  <Lock className="w-10 h-10 text-primary mb-4" />
                  <h4 className="text-sm font-display font-black uppercase mb-2 tracking-tight">Locked</h4>
                  <Link to="/dashboard/subscription" className="text-[9px] font-bold uppercase text-primary border-b border-primary/30">Connect to Matrix</Link>
                </div>
              </div>
            )}
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Plus className="w-4 h-4 text-primary" /> Log New Score
            </h3>
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Course Name
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    {...register('course_name')}
                    type="text"
                    disabled={!isActive}
                    className="w-full bg-surface-container-low border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-primary transition-colors outline-none disabled:opacity-30"
                    placeholder="E.g. St Andrews"
                  />
                </div>
                {errors.course_name && <p className="text-red-500 text-[10px] mt-1">{errors.course_name.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Round Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    {...register('date')}
                    type="date"
                    disabled={!isActive}
                    className="w-full bg-surface-container-low border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-primary transition-colors outline-none [color-scheme:dark] disabled:opacity-30"
                  />
                </div>
                {errors.date && <p className="text-red-500 text-[10px] mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Stableford Points
                </label>
                <div className="relative">
                  <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    {...register('stableford_points')}
                    type="number"
                    min="1"
                    max="45"
                    disabled={!isActive}
                    className="w-full bg-surface-container-low border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-primary transition-colors outline-none disabled:opacity-30"
                    placeholder="Points (1-45)"
                  />
                </div>
                {errors.stableford_points && <p className="text-red-500 text-[10px] mt-1">{errors.stableford_points.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting || !isActive}
                className="w-full py-4 rounded-xl bg-primary text-background font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 flex items-center justify-center mt-4"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Score'}
              </button>
            </form>
          </div>

          <div className="glass-card p-8 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 relative z-10">
              Current Entry Average
            </h3>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-5xl font-display font-black text-primary leading-none tracking-tighter">
                {avgScore}
              </span>
              <span className="text-sm font-bold text-on-surface-variant mb-1">pts</span>
            </div>
            <p className="text-[10px] uppercase text-on-surface-variant mt-4 opacity-70">
              Based on {scores.length}/5 max scores
            </p>
          </div>
        </div>

        {/* Existing Scores List */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold uppercase tracking-tight">Recent Rounds</h3>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div 
                      key={step} 
                      className={cn(
                        "w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-black transition-all",
                        step <= scores.length ? "bg-primary text-background" : "bg-white/5 text-on-surface-variant opacity-30"
                      )}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {scores.length}/5 Points Logged
                </span>
              </div>
            </div>
            
            {scores.length === 0 ? (
              <div className="p-16 text-center">
                <EmptyState 
                  icon={Target}
                  title="No Protocol Data"
                  description="Your performance matrix is empty. Log your first round to start calculating your entry average for the next monthly draw."
                  className="py-12 border-none bg-transparent"
                />
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {scores.map((score, idx) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-10">
                      <div className="relative">
                        <div className="w-16 h-16 bg-surface-container-highest rounded-[1.5rem] flex items-center justify-center font-display font-black text-2xl text-primary shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                          {score.stableford_points}
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-background border border-white/5 rounded-lg flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                          #{scores.length - idx}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xl uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">{score.course_name}</h4>
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant font-sans">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            {formatDate(score.date)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="uppercase tracking-widest font-bold text-[9px]">Verified Protocol</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(score.id)}
                      className="w-12 h-12 rounded-2xl bg-white/5 text-on-surface-variant hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                      title="Delete Score"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
            
            {scores.length > 0 && scores.length < 5 && (
              <div className="p-8 bg-primary/5 border-t border-white/5 flex items-center justify-center gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Log <span className="text-primary">{5 - scores.length} more rounds</span> to achieve maximum entry weight for the next draw.
                </span>
              </div>
            )}
            
            {scores.length === 5 && (
              <div className="p-8 bg-secondary/10 border-t border-secondary/20 flex items-center justify-center gap-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Maximum protocol capacity reached. New entries will cycle existing nodes.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scores;
