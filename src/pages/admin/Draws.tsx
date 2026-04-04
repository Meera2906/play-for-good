import React, { useState, useEffect } from 'react';
import {
  Trophy, Zap, Play, CheckCircle2,
  AlertCircle, History, Calculator,
  Users, Layers, ArrowRight, Loader2,
  RefreshCw, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  calculateDrawResults,
  finalizeAndPublishDraw,
  getLatestRollover
} from '../../lib/draw';
import { cn, formatCurrency } from '../../lib/utils';
import type { Draw, Winner } from '../../types';
import { supabase } from '../../lib/supabase';

const AdminDraws: React.FC = () => {
  const [mode, setMode] = useState<'random' | 'algorithmic'>('random');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [rollover, setRollover] = useState(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [drawHistory, setDrawHistory] = useState<Draw[]>([]);
  const [manualOverride, setManualOverride] = useState(false);
  const [customNumbers, setCustomNumbers] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    loadMetaData();
  }, []);

  const loadMetaData = async () => {
    const roll = await getLatestRollover();
    setRollover(roll);

    // Load history
    const { data } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setDrawHistory(data || []);
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setMessage(null);
    try {
      const numericCustom = customNumbers.map(n => parseInt(n)).filter(n => !isNaN(n));
      const finalCustom = (manualOverride && numericCustom.length === 5) ? numericCustom : undefined;

      const results = await calculateDrawResults(mode, finalCustom);
      setSimulationResult(results);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Simulation failed' });
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (!simulationResult) return;
    setIsPublishing(true);
    setMessage(null);
    try {
      await finalizeAndPublishDraw(simulationResult, mode);
      setMessage({ type: 'success', text: 'Draw successfully published to the Matrix!' });
      setSimulationResult(null);
      loadMetaData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Publishing failed' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Protocol 08: Draw Matrix</span>
          </div>
          <h1 className="text-6xl font-display font-extrabold uppercase tracking-tighter mb-8 leading-none">
            Matrix <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Engine</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-sans max-w-2xl">
            Orchestrate the algorithmic selection process. Manage prize pools, matching logic, and official draw publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="glass-card px-8 py-5 flex items-center gap-4 border-white/5 bg-background/50">
            <Database className="w-4 h-4 text-on-surface-variant" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Pot Rollover</p>
              <p className="font-display font-bold text-xl text-secondary">{formatCurrency(rollover)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 bg-surface-container-high/30">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <Zap className="w-4 h-4 text-primary" /> Configuration
            </h2>

            <div className="space-y-10">
              {/* Mode Selection */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-6">Draw Mode</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('random')}
                    className={cn(
                      "py-6 rounded-2xl border transition-all flex flex-col items-center gap-3",
                      mode === 'random'
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-surface-container-high border-white/5 text-on-surface-variant hover:bg-white/5"
                    )}
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Random</span>
                  </button>
                  <button
                    onClick={() => setMode('algorithmic')}
                    className={cn(
                      "py-6 rounded-2xl border transition-all flex flex-col items-center gap-3",
                      mode === 'algorithmic'
                        ? "bg-secondary/20 border-secondary text-secondary"
                        : "bg-surface-container-high border-white/5 text-on-surface-variant hover:bg-white/5"
                    )}
                  >
                    <Layers className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Algorithmic</span>
                  </button>
                </div>
              </div>

              {/* Manual Override Option */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Manual Matrix Override</p>
                  <button
                    onClick={() => setManualOverride(!manualOverride)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md transition-all",
                      manualOverride ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-on-surface-variant border border-white/5"
                    )}
                  >
                    {manualOverride ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {manualOverride && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-5 gap-3">
                      {customNumbers.map((num, i) => (
                        <input
                          key={i}
                          type="number"
                          value={num}
                          onChange={(e) => {
                            const newNums = [...customNumbers];
                            newNums[i] = e.target.value;
                            setCustomNumbers(newNums);
                          }}
                          className="bg-background/50 border border-white/10 rounded-lg py-3 text-center text-lg font-display font-bold focus:border-primary outline-none transition-all"
                          placeholder="0"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Stats Preview */}
              <div className="p-8 bg-background/50 rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Default Pool</span>
                  <span className="font-bold">{formatCurrency(175000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Jackpot Rollover</span>
                  <span className="font-bold text-secondary">{formatCurrency(rollover)}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Est. Total Pool</span>
                  <span className="text-xl font-display font-bold text-primary">{formatCurrency(175000 + rollover)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="w-full py-6 rounded-2xl bg-white text-background font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                  {isSimulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                  Simulate Matrix
                </button>
                {simulationResult && (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full py-6 rounded-2xl bg-primary text-background font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50"
                  >
                    {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    Publish Official Draw
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="glass-card p-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-on-surface-variant">
              <History className="w-4 h-4" /> Recent Protocols
            </h2>
            <div className="space-y-6">
              {drawHistory.map(draw => (
                <div key={draw.id} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{draw.draw_month}</p>
                    <p className="font-display font-bold text-lg">{formatCurrency(draw.prize_pool)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{draw.draw_mode}</p>
                    <div className="flex gap-1 justify-end">
                      {draw.winning_numbers.slice(0, 3).map((n, i) => (
                        <div key={i} className="w-4 h-4 bg-primary/20 rounded-sm flex items-center justify-center text-[8px] text-primary">{n}</div>
                      ))}
                      <div className="text-[8px] opacity-40">...</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results / Simulation Panel */}
        <div className="lg:col-span-2">
          {!simulationResult && !message && (
            <div className="glass-card h-full flex flex-col items-center justify-center p-20 text-center space-y-8 border-dashed border-2 border-white/5 opacity-50">
              <Calculator className="w-20 h-20 opacity-20" />
              <div>
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4">No Active Simulation</h3>
                <p className="text-on-surface-variant max-w-sm">Run a Matrix simulation to preview winning numbers, matching metrics, and prize allocations.</p>
              </div>
            </div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-8 rounded-[2.5rem] flex items-center gap-6 mb-12",
                message.type === 'success' ? "bg-primary/10 border border-primary/30 text-primary" : "bg-red-500/10 border border-red-500/30 text-red-500"
              )}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              <div>
                <p className="font-bold uppercase tracking-widest text-xs mb-1">System Message</p>
                <p className="text-lg font-medium">{message.text}</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {simulationResult && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                {/* Winning Numbers Header */}
                <div className="glass-card p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                  <div className="text-center space-y-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary">Simulation: Winning Sequence</p>
                    <div className="flex justify-center gap-6">
                      {simulationResult.winningNumbers.map((num: number, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: i * 0.1, type: 'spring' }}
                          className="w-24 h-24 bg-surface-container-highest rounded-3xl border border-white/5 flex items-center justify-center text-4xl font-display font-black text-white shadow-2xl relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {num}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass-card p-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Total Impact Pool</p>
                    <p className="text-4xl font-display font-bold tracking-tighter">{formatCurrency(simulationResult.totalPool)}</p>
                  </div>
                  <div className="glass-card p-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Eligible Entities</p>
                    <p className="text-4xl font-display font-bold tracking-tighter">{simulationResult.eligibleCount} <span className="text-lg text-on-surface-variant font-sans">/ {simulationResult.participantsCount}</span></p>
                  </div>
                  <div className="glass-card p-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Projected Rollover</p>
                    <p className={cn("text-4xl font-display font-bold tracking-tighter", simulationResult.newRollover > 0 ? "text-secondary" : "text-primary")}>
                      {formatCurrency(simulationResult.newRollover)}
                    </p>
                  </div>
                </div>

                {/* Tier Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[5, 4, 3].map(tier => {
                    const count = simulationResult.tierBreakdown[tier];
                    const prizePerPerson = count > 0
                      ? (simulationResult.totalPool * (tier === 5 ? 0.4 : tier === 4 ? 0.35 : 0.25)) / count
                      : 0;

                    return (
                      <div key={tier} className={cn(
                        "glass-card p-10 border transition-all hover:scale-[1.02]",
                        tier === 5 ? "bg-secondary/10 border-secondary/30" : "bg-primary/10 border-primary/30"
                      )}>
                        <h4 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center justify-between">
                          {tier}-Match Matrix
                          <span className="text-xs opacity-50">{tier === 5 ? '40%' : tier === 4 ? '35%' : '25%'}</span>
                        </h4>
                        <div className="space-y-2">
                          <p className="text-3xl font-display font-black tracking-tight">{count} <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Winners</span></p>
                          {count > 0 && (
                            <p className="text-sm font-bold text-on-surface tracking-widest">
                              Each: {formatCurrency(prizePerPerson)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* High-Impact Winners Table */}
                <div className="glass-card overflow-hidden">
                  <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-secondary" /> Simulation Entities
                    </h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                          <th className="px-10 py-6">Entity</th>
                          <th className="px-10 py-6 text-center">Match Logic</th>
                          <th className="px-10 py-6 text-right">Prize Allocation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {simulationResult.winners.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-10 py-20 text-center text-on-surface-variant opacity-50 italic">No winning entities in this simulation sequence.</td>
                          </tr>
                        ) : (
                          simulationResult.winners.map((winner: Winner, idx: number) => (
                            <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center font-display font-bold text-on-surface">
                                    {winner.user_name[0]}
                                  </div>
                                  <span className="font-bold text-lg tracking-tight">{winner.user_name}</span>
                                </div>
                              </td>
                              <td className="px-10 py-8 text-center">
                                <span className={cn(
                                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                  winner.match_count === 5 ? "bg-secondary text-background" : "bg-primary/20 text-primary"
                                )}>
                                  {winner.match_count} Numbers Match
                                </span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <span className="text-xl font-display font-bold text-primary tracking-tighter">
                                  {formatCurrency(winner.prize_amount)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDraws;
