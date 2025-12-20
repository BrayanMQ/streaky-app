-- ============================================================================
-- Migration: Enable Row Level Security
-- ============================================================================
-- Enables RLS on both tables to ensure users can only access their own data
-- ============================================================================

-- Enable RLS on habits table
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Enable RLS on habit_logs table
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;


