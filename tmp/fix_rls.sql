-- WINNER PROOFS STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public can view proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own proofs" ON storage.objects;

CREATE POLICY "Public can view proofs" ON storage.objects
FOR SELECT USING (bucket_id = 'winner-proofs');

CREATE POLICY "Users can upload their own proofs" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'winner-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ADD UPDATE POLICY FOR DB TABLE
DROP POLICY IF EXISTS "Users can update their own proofs" ON public.winner_proofs;

CREATE POLICY "Users can update their own proofs" ON public.winner_proofs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ADD UPDATE POLICY FOR DRAW ENTRIES
DROP POLICY IF EXISTS "Users can update their own entries partially" ON public.draw_entries;

CREATE POLICY "Users can update their own entries partially" ON public.draw_entries
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
