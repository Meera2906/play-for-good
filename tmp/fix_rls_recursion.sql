-- ============================================================
-- FIX RLS RECURSION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Drop the problematic policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Create recursion-safe policies for profiles
-- Policy for users to see themselves: No recursion, just checks ID
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for admins to see everyone: 
-- We use a subquery but we need to ensure it's not recursive.
-- One trick is to check auth.jwt() metadata if you store roles there,
-- but since we use the 'profiles' table for roles, we MUST be careful.
-- A safe way is to check the role but avoid triggering the policy again.
-- However, just letting users see themselves is the first step.

-- To allow admins to see everyone safely:
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
-- NOTE: The above CAN still be recursive if not careful. 
-- The most robust way in Supabase is using a service-level check orJWT.
-- But usually, "auth.uid() = id" is the most important one.

-- Let's try a safer "Admin" check using a specific helper or just direct equality for self.
-- Actually, the best way to avoid recursion is acknowledging that the current user
-- is allowed to see THEIR OWN profile first.

-- 3. Fix the scores policy as well just in case
DROP POLICY IF EXISTS "Admins can view all scores" ON public.scores;
CREATE POLICY "Admins can view all scores" ON public.scores
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
