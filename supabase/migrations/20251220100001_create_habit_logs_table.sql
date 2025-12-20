-- ============================================================================
-- Migration: Create habit_logs table
-- ============================================================================
-- Creates the habit_logs table to store daily completion records
-- Includes indexes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

-- Index for joining habit_logs with habits and filtering by habit_id
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);

-- Index for filtering logs by date (useful for date range queries)
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(date);

