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
    console.log("Checking winner_proofs table...");
    const { error: proofError } = await supabase.from('winner_proofs').select('id').limit(1);
    
    if (proofError) {
        console.error("winner_proofs error:", proofError.message);
    } else {
        console.log("winner_proofs table EXISTS.");
    }
    
    console.log("Checking profiles.charity_contribution_pct...");
    const { error: profError } = await supabase.from('profiles').select('charity_contribution_pct').limit(1);
    if (profError) {
        console.error("profiles.charity_contribution_pct error:", profError.message);
    } else {
        console.log("profiles.charity_contribution_pct column EXISTS.");
    }
}

checkWinnerProofsTable().then(() => process.exit(0));
