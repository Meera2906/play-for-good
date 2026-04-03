import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit3, Trash2, Calendar, Hash, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn, formatDate } from '../../lib/utils';
import EmptyState from '../ui/EmptyState';

interface Score {
  id: string;
  user_id: string;
  course_name: string;
  date: string;
  stableford_points: number;
  created_at: string;
}

interface ManageScoresModalProps {
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  onClose: () => void;
}

const ManageScoresModal: React.FC<ManageScoresModalProps> = ({ user, onClose }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Buffer State
  const [editPoints, setEditPoints] = useState<number | string>('');
  const [editDate, setEditDate] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchScores();
  }, [user.id]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setScores(data || []);
    } catch (err: any) {
      console.error('Error fetching scores:', err);
      setErrorMsg('Failed to load user scores.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (score: Score) => {
    setEditingId(score.id);
    setEditPoints(score.stableford_points);
    setEditDate(score.date);
    setErrorMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorMsg(null);
  };

  const handleSave = async (scoreId: string) => {
    setErrorMsg(null);
    const parsedPoints = parseInt(editPoints as string, 10);
    
    if (isNaN(parsedPoints) || parsedPoints < 1 || parsedPoints > 45) {
      setErrorMsg('Stableford points must be between 1 and 45.');
      return;
    }
    
    if (!editDate) {
      setErrorMsg('Date is required.');
      return;
    }

    setActionLoading(scoreId);
    try {
      const { error } = await supabase
        .from('scores')
        .update({
          stableford_points: parsedPoints,
          date: editDate
        })
        .eq('id', scoreId);

      if (error) throw error;
      
      setEditingId(null);
      await fetchScores();
    } catch (err: any) {
      console.error('Error saving score:', err);
      setErrorMsg(`Failed to save score: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (scoreId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this score? This action cannot be reversed.');
    if (!confirmDelete) return;

    setActionLoading(`delete-${scoreId}`);
    try {
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', scoreId);

      if (error) throw error;
      await fetchScores();
    } catch (err: any) {
      console.error('Error deleting score:', err);
      setErrorMsg(`Failed to delete score: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-surface-container border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-surface-container-low">
          <div>
            <h2 className="text-3xl font-display font-black uppercase tracking-tight mb-2">Score Matrix</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Entity: {user.full_name || 'Anonymous'} <span className="text-on-surface-variant ml-2 tracking-normal lowercase">{user.email}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-5 h-5 text-on-surface-variant hover:text-on-surface" />
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-b border-red-500/20 px-8 py-4 flex items-center gap-3 text-red-500 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : scores.length === 0 ? (
            <EmptyState 
              icon={Hash}
              title="No Score Data Found"
              description="This specific entity has not synced any official scorecard metrics with the main matrix protocol."
              className="border-dashed border-white/10"
            />
          ) : (
            <div className="bg-background/50 rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-white/5">
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Course Name</th>
                    <th className="px-6 py-4">Stableford Points</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scores.map((score) => (
                    <tr key={score.id} className="group hover:bg-white/[0.02] transition-colors">
                      {/* DATE */}
                      <td className="px-6 py-4 w-1/4">
                        {editingId === score.id ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <input 
                              type="date" 
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full max-w-[150px] bg-background border border-white/20 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-primary text-on-surface"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-medium">{formatDate(score.date)}</span>
                        )}
                      </td>

                      {/* COURSE */}
                      <td className="px-6 py-4 w-1/3">
                         <span className="text-sm text-on-surface-variant font-medium">
                            {score.course_name}
                         </span>
                      </td>

                      {/* POINTS */}
                      <td className="px-6 py-4">
                         {editingId === score.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="1"
                              max="45"
                              value={editPoints}
                              onChange={(e) => setEditPoints(e.target.value)}
                              className="w-20 bg-background border border-white/20 rounded-lg px-3 py-2 text-sm font-display focus:outline-none focus:border-primary text-on-surface font-bold text-center"
                            />
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">PTS</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                             <Hash className="w-3 h-3" />
                             <span className="font-display font-bold text-sm">{score.stableford_points}</span>
                          </div>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        {editingId === score.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={cancelEdit}
                              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-white/10 flex items-center justify-center transition-colors text-on-surface-variant"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleSave(score.id)}
                              disabled={actionLoading === score.id}
                              className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors text-background"
                            >
                              {actionLoading === score.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEdit(score)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-on-surface hover:text-primary"
                              title="Edit Score"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(score.id)}
                              disabled={actionLoading === `delete-${score.id}`}
                              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors text-red-500 hover:text-red-400"
                              title="Delete Score"
                            >
                               {actionLoading === `delete-${score.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ManageScoresModal;
