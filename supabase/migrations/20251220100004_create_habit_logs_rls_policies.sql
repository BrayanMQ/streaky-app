-- ============================================================================
-- Migration: Create RLS policies for habit_logs table
-- ============================================================================
-- Creates policies to ensure users can only access logs of their own habits
-- ============================================================================

-- Policy: Users can view logs of habits that belong to them
CREATE POLICY "Users can view own habit logs"
ON public.habit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.habits
        WHERE habits.id = habit_logs.habit_id
        AND habits.user_id = auth.uid()
    )
);

-- Policy: Users can insert logs for habits that belong to them
CREATE POLICY "Users can insert own habit logs"
ON public.habit_logs
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.habits
        WHERE habits.id = habit_logs.habit_id
        AND habits.user_id = auth.uid()
    )
);

-- Policy: Users can update logs of habits that belong to them
CREATE POLICY "Users can update own habit logs"
ON public.habit_logs
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.habits
        WHERE habits.id = habit_logs.habit_id
        AND habits.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.habits
        WHERE habits.id = habit_logs.habit_id
        AND habits.user_id = auth.uid()
    )
);

-- Policy: Users can delete logs of habits that belong to them
CREATE POLICY "Users can delete own habit logs"
ON public.habit_logs
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.habits
        WHERE habits.id = habit_logs.habit_id
        AND habits.user_id = auth.uid()
    )
);


