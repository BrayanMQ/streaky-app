-- ============================================================================
-- Migration: Add composite index for habit_logs
-- ============================================================================
-- Creates a composite index on (habit_id, date) for optimal query performance
-- This index is especially useful for queries that filter by both habit_id and date
-- ============================================================================

-- Composite index for habit_id + date queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id_date 
ON public.habit_logs(habit_id, date DESC);

-- This index optimizes:
-- - Queries filtering by habit_id and date range
-- - Queries filtering by habit_id and specific date
-- - Sorting by date for a specific habit

