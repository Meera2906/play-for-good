import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function resetAdmin() {
  const email = 'admin@playforgood.com';
  const password = 'adminPassword123'; // Standard admin password for this project

  console.log(`Resetting admin user: ${email}`);

  // 1. Find the user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return console.error('Error listing users:', listError);

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    console.log(`Deleting existing user ${existingUser.id}...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
    if (deleteError) console.error('Error deleting user:', deleteError);
    
    // Also delete profile just in case cascade didn't catch it
    await supabase.from('profiles').delete().eq('id', existingUser.id);
  }

  // 2. Create new user
  console.log('Creating new admin user...');
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'System Admin' }
  });

  if (createError) return console.error('Error creating user:', createError);

  if (newUser.user) {
    console.log(`New user created: ${newUser.user.id}`);
    
    // 3. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: email,
        full_name: 'System Admin',
        role: 'admin',
        onboarding_completed: true
      });

    if (profileError) console.error('Error creating profile:', profileError);
    else console.log('Successfully created new Admin profile.');
  }
}

resetAdmin();
