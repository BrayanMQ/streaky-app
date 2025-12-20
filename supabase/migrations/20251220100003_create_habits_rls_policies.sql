-- ============================================================================
-- Migration: Create RLS policies for habits table
-- ============================================================================
-- Creates policies to ensure users can only access their own habits
-- ============================================================================

-- Policy: Users can view only their own habits
CREATE POLICY "Users can view own habits"
ON public.habits
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can insert habits with their own user_id
CREATE POLICY "Users can insert own habits"
ON public.habits
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update only their own habits
CREATE POLICY "Users can update own habits"
ON public.habits
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete only their own habits
CREATE POLICY "Users can delete own habits"
ON public.habits
FOR DELETE
USING (user_id = auth.uid());


