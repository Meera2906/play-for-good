const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWinnerProofsTable() {
    const { error: proofError } = await supabase.from('winner_proofs').select('id').limit(1);
    
    if (proofError && proofError.code === '42P01') {
        console.error("The 'winner_proofs' table does NOT exist in the database.");
        console.error("Please run the SQL schema migrations to create this table.");
        return false;
    }
    
    // Also check profiles charity_contribution_pct
    const { error: profError } = await supabase.from('profiles').select('charity_contribution_pct').limit(1);
    if (profError && profError.code === '42703') {
        console.error("The 'charity_contribution_pct' column does NOT exist on the 'profiles' table.");
        return false;
    }
    
    return true;
}

async function simulateDraw() {
  console.log("Checking database schema...");
  const schemaOk = await checkWinnerProofsTable();
  if (!schemaOk) {
      console.log("Skipping draw simulation due to missing schema.");
      return;
  }

  console.log("Running algorithmic draw...");
  // 1. Get all active subscribers
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    // .eq('subscription_status', 'active'); // Assuming everyone is active for testing
    
  if (pErr) { console.error('Profiles fetch error', pErr); return; }
  if (!profiles || profiles.length === 0) { console.error('No profiles found'); return; }

  // 2. Get scores for each user
  const { data: allScores, error: sErr } = await supabase.from('scores').select('*');
  if (sErr) { console.error('Scores fetch error', sErr); return; }

  // 3. Pick top 3 (or just any user that has a score)
  const userPerformances = profiles.map(u => {
    const userScores = (allScores || []).filter(s => s.user_id === u.id);
    if (userScores.length === 0) return { user: u, avg: -1 };
    const avg = userScores.reduce((acc, s) => acc + s.stableford_points, 0) / userScores.length;
    return { user: u, avg };
  }).filter(p => p.avg >= 0).sort((a, b) => b.avg - a.avg);

  if (userPerformances.length === 0) {
      console.error('No players with scores found. Please add scores first.');
      return;
  }

  const winners = userPerformances.slice(0, 3).map((p, idx) => ({
    user_id: p.user.id,
    user_name: p.user.full_name,
    prize_amount: [100000, 50000, 25000][idx] || 10000,
    rank: idx + 1
  }));

  console.log("Winners selected:", winners.map(w => w.user_name));

  // Insert draw
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .insert([{
      month: new Date().toISOString().slice(0, 7),
      prize_pool: 175000,
      winners,
      status: 'published' // Auto publish for testing
    }])
    .select()
    .single();

  if (drawError) { console.error('Draw insert error', drawError); return; }
  
  console.log("Draw created and published! ID:", draw.id);
}

simulateDraw();
