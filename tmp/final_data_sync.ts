import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function updateCharityData() {
  console.log('Synchronizing Charity Nodes with real impact data...');
  
  // 1. Fetch all charity names to avoid "Skipping... not found" errors
  const { data: currentChars, error: fetchErr } = await supabase.from('charities').select('id, name');
  if (fetchErr) throw fetchErr;

  const names = currentChars?.map(c => c.name) || [];
  console.log('Available Charities:', names);

  // 2. Perform updates for known charities
  const updates = [
    {
      name: 'Green Earth Initiative',
      featured: true,
      long_description: 'The Green Earth Initiative (GEI) is a global non-profit dedicated to reforestation and climate action. By restoring degraded landscapes and protecting existing biodiversity hotspots, we work to secure a sustainable future for our planet.',
      upcoming_events: [
        { title: 'Global Reforestation Summit', date: 'Oct 12, 2026', location: 'Virtual / Amazon Basin' },
        { title: 'Tree Planting Drive', date: 'Nov 05, 2026', location: 'London, UK' }
      ]
    },
    {
      name: 'Clean Water Foundation',
      featured: true,
      long_description: 'Pure flowing water for every community. The Clean Water Foundation focuses on high-impact sustainable filtration systems in rural areas where access to safe drinking water is a critical health barrier.',
      upcoming_events: [
        { title: 'Safe Water Gala 2026', date: 'Dec 15, 2026', location: 'Geneva, Switzerland' }
      ]
    }
  ];

  for (const item of updates) {
    if (names.includes(item.name)) {
      console.log(`Upgrading ${item.name} to featured status...`);
      const { error } = await supabase
        .from('charities')
        .update({
          featured: item.featured,
          long_description: item.long_description,
          upcoming_events: item.upcoming_events
        })
        .eq('name', item.name);
      
      if (error) console.error(`Error updating ${item.name}:`, error);
      else console.log(`${item.name} successfully updated.`);
    } else {
      console.log(`Skipping update for ${item.name} (not found in current list).`);
    }
  }
  
  console.log('Database Synchronization complete.');
}

updateCharityData();
