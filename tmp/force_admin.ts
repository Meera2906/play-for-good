import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function promoteEmail(email: string) {
  console.log(`Promoting ${email} to admin...`);
  
  // 1. Get the user ID from Auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing users:', authError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found in Auth!`);
    return;
  }
  
  console.log(`Found user ID: ${user.id}`);
  
  // 2. Upsert profile with admin role
  const { data, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || 'Admin',
      role: 'admin',
      onboarding_completed: true
    })
    .select();
    
  if (profileError) {
    console.error('Error updating profile:', profileError);
  } else {
    console.log('Successfully promoted user to admin:', data);
  }
}

const targetEmail = process.argv[2] || 'meerafareena2905@gmail.com';
promoteEmail(targetEmail);
