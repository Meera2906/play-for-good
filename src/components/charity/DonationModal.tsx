import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Heart, CreditCard, ShieldCheck, 
  CheckCircle2, Loader2, AlertCircle, 
  Zap, ArrowRight 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { cn, formatCurrency } from '../../lib/utils';
import type { Charity } from '../../types';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  charity: Charity;
  onSuccess?: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, charity, onSuccess }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [amount, setAmount] = useState<string>('25');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = ['10', '25', '50', '100'];

  const handleDonate = async () => {
    if (!user) {
      setError('Identity activation required. Please sign in to finalize your contribution.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          user_id: user.id,
          charity_id: charity.id,
          amount: numAmount,
          donation_type: 'independent'
        });

      if (donationError) throw donationError;

      // The trigger handles total_raised and total_impact, but we should refresh the local profile
      await refreshProfile();
      
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'The protocol failed to record your donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-card overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-surface-container-high/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight">Direct Contribution</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Independent Impact Node</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {!success ? (
                <div className="space-y-8">
                  {/* Charity Preview */}
                  <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-white/5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                      <img src={charity.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Beneficiary</p>
                      <p className="font-bold">{charity.name}</p>
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant ml-2">
                       Set Contribution Tier
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {presets.map((p) => (
                        <button
                          key={p}
                          onClick={() => setAmount(p)}
                          className={cn(
                            "py-3 rounded-xl text-xs font-bold transition-all border",
                            amount === p 
                              ? "bg-primary text-background border-primary" 
                              : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-white/10"
                          )}
                        >
                          £{p}
                        </button>
                      ))}
                    </div>
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors font-bold">£</span>
                      <input 
                        type="number"
                        placeholder="Custom amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-6 py-4 bg-background border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase tracking-widest font-bold">
                      Direct Ledger Transfer: 100% of this contribution is allocated to the partner organization.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-500 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleDonate}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="w-full py-5 rounded-2xl bg-primary text-background font-bold uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Execute Contribution</>}
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8 relative">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 rounded-full"
                    />
                  </div>
                  <h3 className="text-3xl font-display font-black uppercase tracking-tight mb-4">Contribution Recorded</h3>
                  <p className="text-on-surface-variant mb-10 max-w-xs uppercase text-[10px] font-bold tracking-widest leading-loose">
                    Your impact of <span className="text-on-surface">£{amount}</span> has been synchronized with the {charity.name} distribution node.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-10 py-4 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3"
                  >
                    Return to Matrix <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;
