import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const userId = 'edccf445-85f0-45cc-b377-0a4a68f1d634';

  // 1. Create a dummy draw
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .insert({
      month: 'April 2026',
      draw_month: '2026-04-01',
      status: 'completed',
      draw_mode: 'algorithmic',
      jackpot_drawn: true,
      jackpot_winner_found: true,
      winning_numbers: [1, 2, 3, 4, 5]
    })
    .select('*')
    .single();

  if (drawError && !drawError.message.includes('duplicate')) {
    console.error('Draw Error', drawError);
  }

  const activeDraw = draw || (await supabase.from('draws').select('*').limit(1).single()).data;

  if (!activeDraw) {
    console.log('No draw found');
    return;
  }

  // 2. Assure user has a profile
  await supabase.from('profiles').upsert({
    id: userId,
    email: 'test_user_play4good@example.com',
    full_name: 'Test Winner',
    role: 'user'
  });

  // 3. Create a winning draw entry
  const { error: entryError } = await supabase
    .from('draw_entries')
    .insert({
      user_id: userId,
      draw_id: activeDraw.id,
      entry_numbers: [1, 2, 3, 4, 5],
      match_count: 5,
      prize_amount: 50000,
      winner_status: 'pending'
    });
    
  if (entryError) {
     console.error('Entry issue:', entryError.message);
  } else {
     console.log('Test win created successfully for user!');
  }
}

main();
