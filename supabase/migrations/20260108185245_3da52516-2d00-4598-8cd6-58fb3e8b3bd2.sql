
-- Remove old permissive policies
DROP POLICY IF EXISTS "Allow all delete access" ON public.transactions;
DROP POLICY IF EXISTS "Allow all insert access" ON public.transactions;
DROP POLICY IF EXISTS "Allow all read access" ON public.transactions;
DROP POLICY IF EXISTS "Allow all update access" ON public.transactions;

-- Make user_id NOT NULL for new transactions (existing ones will be migrated)
-- We'll handle existing NULL user_ids by updating them after user creation
