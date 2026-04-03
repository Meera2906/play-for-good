import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle2, XCircle, Clock, Link as LinkIcon, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate, cn } from '../../lib/utils';

type WinnerProof = {
  id: string;
  user_id: string;
  draw_id: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  actual_status?: string;
  draw?: { month: string; prize_pool: number };
  user?: { full_name: string; email: string };
};

const WinnersVerification: React.FC = () => {
  const [proofs, setProofs] = useState<WinnerProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('winner_proofs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const userIds = data?.map(d => d.user_id) || [];
      const drawIds = data?.map(d => d.draw_id) || [];
      
      let proofsWithStatus = data || [];
      
      if (userIds.length > 0 && drawIds.length > 0) {
        const [
          { data: entries },
          { data: profiles },
          { data: draws }
        ] = await Promise.all([
          supabase.from('draw_entries').select('user_id, draw_id, winner_status').in('user_id', userIds).in('draw_id', drawIds),
          supabase.from('profiles').select('id, full_name, email').in('id', userIds),
          supabase.from('draws').select('id, month, prize_pool').in('id', drawIds)
        ]);
          
        proofsWithStatus = data?.map(proof => {
          const entry = entries?.find(e => e.user_id === proof.user_id && e.draw_id === proof.draw_id && e.winner_status !== 'none' && e.winner_status !== 'pending');
          const dpProfile = profiles?.find(p => p.id === proof.user_id);
          const dwDraw = draws?.find(d => d.id === proof.draw_id);

          return {
            ...proof,
            user: dpProfile,
            draw: dwDraw,
            actual_status: entry ? entry.winner_status : proof.status
          };
        }) || [];
      }

      setProofs(proofsWithStatus);
    } catch (err: any) {
      console.error('Error fetching proofs:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProofStatus = async (proof: WinnerProof, newStatus: 'approved' | 'rejected' | 'paid') => {
    try {
      if (newStatus !== 'paid') {
        const { error } = await supabase
          .from('winner_proofs')
          .update({ status: newStatus })
          .eq('id', proof.id);
        if (error) throw error;
      }
      
      // Update draw_entries
      const updateData: any = { winner_status: newStatus };
      if (newStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }
      
      const { error: entryError } = await supabase
        .from('draw_entries')
        .update(updateData)
        .eq('user_id', proof.user_id)
        .eq('draw_id', proof.draw_id);
        
      if (entryError) throw entryError;

      fetchProofs();
    } catch (err) {
      console.error('Failed to update proof status:', err);
      alert('Failed to update proof. Check console.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingProofs = proofs.filter(p => p.status === 'pending');
  const processedProofs = proofs.filter(p => p.status !== 'pending');

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Award className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Proof Verification</h1>
      </div>
      <p className="text-on-surface-variant max-w-2xl mb-12">
        Review and verify algorithmic draw winner proofs (scorecards). Approved payouts will be automatically dispatched.
      </p>

      {/* Pending Proofs */}
      <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-6 mt-12 flex items-center gap-3">
        <Clock className="w-5 h-5 text-secondary" /> Pending Verification ({pendingProofs.length})
      </h3>
      
      {pendingProofs.length === 0 ? (
        <div className="glass-card p-12 text-center text-on-surface-variant">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>The queue is clear. No pending proofs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pendingProofs.map((proof) => (
            <div key={proof.id} className="glass-card border border-secondary/30 overflow-hidden flex flex-col">
              <div className="h-48 bg-surface-container-highest relative group">
                <img src={proof.file_url} alt="Proof" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={proof.file_url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors backdrop-blur-md text-white">
                    <LinkIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Entity</p>
                  <p className="font-bold text-lg">{proof.user?.full_name}</p>
                  <p className="text-xs text-on-surface-variant">{proof.user?.email}</p>
                </div>
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Draw Context</p>
                  <p className="text-sm font-medium">Draw: {proof.draw?.month}</p>
                  <p className="text-xs text-on-surface-variant">Submitted {formatDate(proof.created_at)}</p>
                </div>
                
                <div className="mt-auto flex gap-4">
                  <button 
                    onClick={() => updateProofStatus(proof, 'approved')}
                    className="flex-1 py-3 rounded-xl bg-primary text-background font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-primary/90 flex flex-col items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => updateProofStatus(proof, 'rejected')}
                    className="flex-1 py-3 rounded-xl bg-surface-container-highest border border-red-500/30 text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-red-500/10 flex flex-col items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processed Proofs */}
      <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-6 mt-16">
        Log History
      </h3>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high/30">
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Entity</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Draw</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right">Date</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {processedProofs.map((proof) => (
              <tr key={proof.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold">{proof.user?.full_name}</p>
                  <p className="text-xs text-on-surface-variant">{proof.user?.email}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="font-medium text-sm">{proof.draw?.month}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] border",
                    proof.actual_status === 'approved' ? "bg-primary/10 text-primary border-primary/20" : 
                    proof.actual_status === 'paid' ? "bg-secondary/10 text-secondary border-secondary/20" :
                    "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {proof.actual_status === 'pending_verification' ? 'pending' : (proof.actual_status || proof.status)}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <p className="text-sm font-sans text-on-surface-variant">{formatDate(proof.created_at)}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  {proof.actual_status === 'approved' && (
                    <button
                      onClick={() => updateProofStatus(proof, 'paid')}
                      className="px-4 py-2 rounded-lg bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-all text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-2"
                    >
                      <DollarSign className="w-3 h-3" /> Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {processedProofs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-sm text-on-surface-variant">
                  No previous verifications logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WinnersVerification;
