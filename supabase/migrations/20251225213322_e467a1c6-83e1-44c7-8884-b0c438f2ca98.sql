-- Drop existing RESTRICTIVE policies on dev_submissions
DROP POLICY IF EXISTS "Admins can update all submissions" ON public.dev_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.dev_submissions;
DROP POLICY IF EXISTS "Users can delete own pending submissions" ON public.dev_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.dev_submissions;
DROP POLICY IF EXISTS "Users can update own pending submissions" ON public.dev_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.dev_submissions;

-- Recreate policies as PERMISSIVE (default, uses OR logic)
-- Admin SELECT policy
CREATE POLICY "Admins can view all submissions" 
ON public.dev_submissions 
FOR SELECT 
TO authenticated
USING (is_admin_by_domain());

-- User SELECT policy
CREATE POLICY "Users can view own submissions" 
ON public.dev_submissions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- User INSERT policy
CREATE POLICY "Users can insert own submissions" 
ON public.dev_submissions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admin UPDATE policy
CREATE POLICY "Admins can update all submissions" 
ON public.dev_submissions 
FOR UPDATE 
TO authenticated
USING (is_admin_by_domain());

-- User UPDATE policy (only pending submissions)
CREATE POLICY "Users can update own pending submissions" 
ON public.dev_submissions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id AND status = 'submitted');

-- User DELETE policy (only pending submissions)
CREATE POLICY "Users can delete own pending submissions" 
ON public.dev_submissions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id AND status = 'submitted');