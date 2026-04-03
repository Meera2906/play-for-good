ALTER TABLE public.winner_proofs DROP CONSTRAINT IF EXISTS winner_proofs_user_id_fkey;
ALTER TABLE public.winner_proofs ADD CONSTRAINT winner_proofs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
