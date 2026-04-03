-- 1. Ensure ALL columns exist (in case the table was created very early on with a barebones structure)
ALTER TABLE public.winner_proofs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS review_note TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Ensure the UNIQUE constraint is applied
ALTER TABLE public.winner_proofs DROP CONSTRAINT IF EXISTS winner_proofs_user_id_draw_id_key;
ALTER TABLE public.winner_proofs ADD CONSTRAINT winner_proofs_user_id_draw_id_key UNIQUE (user_id, draw_id);

-- 3. Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
