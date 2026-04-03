import { supabase } from './supabase';
import type { Draw, DrawEntry, Winner } from '../types';

/**
 * Core Draw Engine Logic
 * Handles 5-number matching, prize splitting, and jackpot rollover.
 */

const DEFAULT_PRIZE_POOL = 175000;
const TIER_SPLITS = {
  5: 0.40, // 40% of pool
  4: 0.35, // 35% of pool
  3: 0.25  // 25% of pool
};

/**
 * Generate 5 unique winning numbers.
 * @param mode 'random' | 'algorithmic'
 * @param allScores Optional scores for weighting in algorithmic mode
 */
export function generateWinningNumbers(mode: 'random' | 'algorithmic', allScores: any[] = []): number[] {
  if (mode === 'random') {
    const numbers: number[] = [];
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 51); // 0-50 range (Stableford points)
      if (!numbers.includes(num)) numbers.push(num);
    }
    return numbers.sort((a, b) => b - a); // Sort descending (standard for top scores)
  }

  // Algorithmic Mode: Weighted based on common high scores
  // For now, take frequent top scores and add variance
  const historicalAverages = allScores.map(s => s.stableford_points);
  const avg = historicalAverages.length > 0 
    ? historicalAverages.reduce((a, b) => a + b, 0) / historicalAverages.length
    : 36; // Default to 36 (typical good score)
  
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const variance = (Math.random() - 0.5) * 20; 
    const num = Math.max(0, Math.min(50, Math.round(avg + variance)));
    if (!numbers.includes(num)) numbers.push(num);
  }
  return numbers.sort((a, b) => b - a);
}

/**
 * Calculate matching numbers between entry and winning numbers.
 */
export function countMatches(entry: number[], winning: number[]): number {
  return entry.filter(num => winning.includes(num)).length;
}

/**
 * Get the current rollover amount from the latest published draw.
 */
export async function getLatestRollover(): Promise<number> {
  const { data, error } = await supabase
    .from('draws')
    .select('jackpot_rollover_amount')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching rollover:', error);
    return 0;
  }
  return data?.jackpot_rollover_amount || 0;
}

/**
 * Core Algorithm: Calculates simulation or final results.
 */
export async function calculateDrawResults(
  mode: 'random' | 'algorithmic',
  customWinningNumbers?: number[]
) {
  // 1. Setup base data
  const currentPool = DEFAULT_PRIZE_POOL;
  const rollover = await getLatestRollover();
  const totalPool = currentPool + rollover;

  // 2. Fetch active subscribers
  const { data: subs, error: sErr } = await supabase
    .from('subscriptions')
    .select('user_id, profiles(full_name)')
    .eq('status', 'active');
    
  if (sErr) throw sErr;
  if (!subs || subs.length === 0) throw new Error('No active subscribers found');

  // 3. Fetch scores for all subs
  const { data: allScores, error: scErr } = await supabase
    .from('scores')
    .select('user_id, stableford_points, date')
    .order('date', { ascending: false });
  if (scErr) throw scErr;

  // 4. Generate winning numbers if not provided
  const winningNumbers = customWinningNumbers || generateWinningNumbers(mode, allScores || []);

  // 5. Build user entries
  const entries = subs.map(sub => {
    const userScores = (allScores || [])
      .filter(s => s.user_id === sub.user_id)
      .slice(0, 5)
      .map(s => s.stableford_points);
    
    // Eligibility: Must have exactly 5 scores to enter the "Matrix"
    const isValid = userScores.length === 5;
    const matchCount = isValid ? countMatches(userScores, winningNumbers) : 0;

    return {
      user_id: sub.user_id,
      user_name: (sub as any).profiles?.full_name || 'Anonymous',
      entry_numbers: userScores,
      match_count: matchCount,
      is_eligible: isValid
    };
  });

  // 6. Split prize pool into tiers
  const tierWinners = {
    5: entries.filter(e => e.match_count === 5),
    4: entries.filter(e => e.match_count === 4),
    3: entries.filter(e => e.match_count === 3)
  };

  const prizeAllocations = {
    5: TIER_SPLITS[5] * totalPool,
    4: TIER_SPLITS[4] * totalPool,
    3: TIER_SPLITS[3] * totalPool
  };

  // 7. Calculate new rollover
  const newRollover = tierWinners[5].length === 0 ? prizeAllocations[5] : 0;

  // 8. Format winners
  const winners: Winner[] = [];
  [5, 4, 3].forEach(tier => {
    const tierW = tierWinners[tier as 5 | 4 | 3];
    if (tierW.length > 0) {
      const prizePerWinner = prizeAllocations[tier as 5 | 4 | 3] / tierW.length;
      tierW.forEach(w => {
        winners.push({
          user_id: w.user_id,
          user_name: w.user_name,
          prize_amount: Math.round(prizePerWinner * 100) / 100,
          match_count: tier
        });
      });
    }
  });

  return {
    winningNumbers,
    totalPool,
    currentPool,
    rollover,
    newRollover,
    participantsCount: entries.length,
    eligibleCount: entries.filter(e => e.is_eligible).length,
    tierBreakdown: {
      5: tierWinners[5].length,
      4: tierWinners[4].length,
      3: tierWinners[3].length
    },
    winners,
    allEntries: entries
  };
}

/**
 * Officially persistent a draw result.
 */
export async function finalizeAndPublishDraw(
  results: Awaited<ReturnType<typeof calculateDrawResults>>,
  mode: 'random' | 'algorithmic'
) {
  const drawMonth = new Date().toISOString().slice(0, 7);
  const drawYear = new Date().getFullYear().toString();

  console.log('[Matrix Engine] Initiating publish for:', drawMonth);

  // 1. Check for existing draw to prevent duplicates/hangs
  const { data: existing } = await supabase
    .from('draws')
    .select('id')
    .eq('draw_month', drawMonth)
    .eq('status', 'published')
    .maybeSingle();

  if (existing) {
    throw new Error(`A protocol for ${drawMonth} has already been officially published and archived.`);
  }

  // 2. Create the Draw record
  console.log('[Matrix Engine] Creating draw record...');
  const { data: draw, error: dErr } = await supabase
    .from('draws')
    .insert([{
      draw_month: drawMonth,
      draw_year: drawYear,
      draw_mode: mode,
      winning_numbers: results.winningNumbers,
      prize_pool: results.totalPool,
      jackpot_rollover_amount: results.newRollover,
      status: 'published',
      winners: results.winners,
      published_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (dErr) {
    console.error('[Matrix Engine] Draw creation error:', dErr);
    throw dErr;
  }

  console.log('[Matrix Engine] Draw created with ID:', draw.id);

  // 3. Create Draw Entries for all participants
  const entryRecords = results.allEntries.map(e => {
    const winnerData = results.winners.find(w => w.user_id === e.user_id);
    return {
      draw_id: draw.id,
      user_id: e.user_id,
      entry_numbers: e.entry_numbers,
      match_count: e.match_count,
      prize_amount: winnerData?.prize_amount || 0,
      winner_status: winnerData ? 'pending' : 'none'
    };
  });

  if (entryRecords.length > 0) {
    console.log(`[Matrix Engine] Archiving ${entryRecords.length} member entries...`);
    const { error: eErr } = await supabase
      .from('draw_entries')
      .insert(entryRecords);

    if (eErr) {
      console.error('[Matrix Engine] Entry archival error:', eErr);
      throw eErr;
    }
  }

  console.log('[Matrix Engine] Protocol successfully archived.');
  return draw;
}
