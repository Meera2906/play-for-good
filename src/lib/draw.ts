import { supabase } from './supabase';

export async function runAlgorithmicDraw(prizePool: number = 175000) {
  // 1. Get all active subscribers from the new subscriptions table
  const { data: subs, error: sErr } = await supabase
    .from('subscriptions')
    .select('*, profiles(*)')
    .eq('status', 'active');
    
  if (sErr) throw sErr;
  if (!subs || subs.length === 0) throw new Error('No active subscribers found');

  // 2. Get scores for each user
  const { data: allScores, error: scErr } = await supabase.from('scores').select('*');
  if (scErr) throw scErr;

  // 3. Simple Algorithmic Draw: Top average of latest 5 scores
  const userPerformances = subs.map(sub => {
    const userScores = (allScores || [])
      .filter(s => s.user_id === sub.user_id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    // Must have at least 1 score to qualify
    if (userScores.length === 0) return { sub, avg: -1 };

    const avg = userScores.reduce((acc, s) => acc + s.stableford_points, 0) / userScores.length;
    return { sub, avg };
  })
  .filter(p => p.avg >= 0)
  .sort((a, b) => b.avg - a.avg);

  if (userPerformances.length < 3) throw new Error('Not enough qualified players (need at least 3)');

  // 4. Calculate prize tiers (approx 60%, 30%, 10% or similar custom splits)
  const prizeSplits = [
    Math.round(prizePool * 0.57), 
    Math.round(prizePool * 0.28), 
    Math.round(prizePool * 0.15)
  ];

  // Pick top 3
  const winners = userPerformances.slice(0, 3).map((p, idx) => ({
    user_id: p.sub.user_id,
    user_name: (p.sub as any).profiles?.full_name || 'Anonymous User',
    prize_amount: prizeSplits[idx],
    rank: idx + 1,
    charity_id: p.sub.charity_id,
    charity_percentage: p.sub.charity_percentage
  }));

  // 5. Create draw record
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .insert([{
      month: new Date().toISOString().slice(0, 7),
      prize_pool: prizePool,
      winners,
      status: 'pending' // pending until admin publishes it
    }])
    .select()
    .single();

  if (drawError) throw drawError;

  return { draw, winners };
}

export async function publishDraw(drawId: string) {
    const { data: draw, error: fetchErr } = await supabase
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId)
      .select()
      .single();
      
    if (fetchErr) throw fetchErr;
    return draw;
}
