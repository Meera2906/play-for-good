import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, ShieldCheck, CreditCard, ArrowRight, X, Star, Zap } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import type { Charity } from '../../types';

interface CheckoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  planType: 'monthly' | 'yearly';
  amount: number;
  selectedCharity?: Charity;
}

const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  planType,
  amount,
  selectedCharity
}) => {
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    setStatus('processing');
    setError(null);
    try {
      // Add a small artificial delay for "premium processing" feel
      await new Promise(resolve => setTimeout(resolve, 2000));
      await onConfirm();
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Activation failed. Please try again.');
      setStatus('idle');
    }
  };

  const planName = planType === 'yearly' ? 'Sovereign Yearly' : 'Elite Monthly';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status === 'processing' ? undefined : onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface-container border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {status === 'success' ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                  >
                    <Check className="w-10 h-10 text-primary" />
                  </motion.div>
                </div>
                <h2 className="text-4xl font-display font-black uppercase tracking-tight mb-4">Membership Active</h2>
                <p className="text-on-surface-variant mb-10 font-sans leading-relaxed">
                  Welcome to the elite circle. Your participation in the next monthly draw is now officially registered.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-5 rounded-full bg-primary text-background font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  Enter Control Hub
                </button>
              </div>
            ) : (
              <>
                {/* Close Button */}
                <button
                  onClick={onClose}
                  disabled={status === 'processing'}
                  className="absolute top-8 right-8 text-on-surface-variant hover:text-white transition-colors disabled:opacity-0"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="p-10 md:p-12">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-black uppercase tracking-tight">Confirm Membership</h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Secure Activation Node</p>
                    </div>
                  </div>

                  {/* Plan Summary */}
                  <div className="bg-surface-container-low rounded-3xl p-8 mb-8 border border-white/5">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Selected Plan</span>
                        <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-white flex items-center gap-3">
                          {planType === 'yearly' ? <Star className="w-5 h-5 text-secondary" /> : <Zap className="w-5 h-5 text-primary" />}
                          {planName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-display font-black text-white">{formatCurrency(amount)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mt-1">
                          / {planType === 'monthly' ? 'Month' : 'Year'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-on-surface-variant">Charity Partner Impact</span>
                        <span className="text-white">100% Tax Deductible</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-primary">
                        <span className="text-primary/70 italic">Draw Entry Activation</span>
                        <span>Included</span>
                      </div>
                    </div>
                  </div>

                  {selectedCharity && (
                    <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/5 mb-10">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                        <img src={selectedCharity.logo_url} alt={selectedCharity.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant block mb-0.5">Supporting</span>
                        <p className="text-xs font-bold truncate text-white uppercase">{selectedCharity.name}</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center mb-8">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={status === 'processing'}
                    className="w-full py-6 rounded-full bg-primary text-background font-bold uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 group"
                  >
                    {status === 'processing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Syncing Account Node...
                      </>
                    ) : (
                      <>
                        Confirm & Activate
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="mt-8 text-[9px] text-center text-on-surface-variant font-sans uppercase tracking-[0.2em] leading-relaxed">
                    By activating, you agree to the Membership Terms. <br />
                    No recurring billing in simulation mode.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutConfirmation;
