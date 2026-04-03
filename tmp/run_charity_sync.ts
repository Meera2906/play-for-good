import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function runMigration() {
  const sql = fs.readFileSync('update_charities_schema.sql', 'utf8');
  console.log('Executing Migration...');
  
  // Supabase JS doesn't have a direct 'run sql' method.
  // However, I can try to run it via an RPC if a 'exec_sql' function exists, 
  // OR I can just assume the user runs it in the SQL editor as per the instruction.
  
  console.log('Migration SQL prepared. Please run "update_charities_schema.sql" in your Supabase SQL Editor.');
  console.log('I will proceed with the data updates assuming the schema is ready.');
}

async function populateSampleData() {
  console.log('Populating Featured Charity Data...');
  
  // Let's update "Green Earth Initiative" specifically since it exists
  const { error } = await supabase
    .from('charities')
    .update({
      featured: true,
      long_description: 'The Green Earth Initiative (GEI) is a global non-profit dedicated to reforestation and climate action. By restoring degraded landscapes and protecting existing biodiversity hotspots, we work to secure a sustainable future for our planet.\n\nOur mission is to plant 1 billion trees by 2030, while simultaneously empowering local communities through sustainable agroforestry practices and environmental education programs.',
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      upcoming_events: [
        { title: 'Global Reforestation Summit', date: 'Oct 12, 2026', location: 'Virtual / Amazon Basin' },
        { title: 'Tree Planting Drive: London', date: 'Nov 05, 2026', location: 'Richmond Park, London' }
      ]
    })
    .eq('name', 'Green Earth Initiative');

  if (error) console.error('Error updating GEI:', error);
  else console.log('Green Earth Initiative synchronized.');
}

populateSampleData();
