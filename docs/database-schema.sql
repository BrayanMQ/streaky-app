-- ============================================================================
-- Database Schema for Streaky App
-- ============================================================================
-- This file contains the complete database schema for the habit tracking app.
-- Execute this script in the Supabase SQL Editor to create all necessary
-- tables, indexes, constraints, and RLS policies.
--
-- Execution Instructions:
-- 1. Open your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste the entire contents of this file
-- 5. Click "Run" to execute
-- 6. After execution, regenerate TypeScript types using: npm run generate:types
-- ============================================================================

-- ============================================================================
-- TABLE: habits
-- ============================================================================
-- Stores user habits with metadata like title, icon, color, and frequency
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    frequency JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- TABLE: habit_logs
-- ============================================================================
-- Stores daily completion logs for each habit
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Indexes to optimize query performance for common access patterns
-- ============================================================================

-- Index for filtering habits by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

-- Index for joining habit_logs with habits and filtering by habit_id
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);

-- Index for filtering logs by date (useful for date range queries)
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(date);

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================
-- Additional constraints for data validation and integrity
-- ============================================================================

-- Ensure habit title is not empty or just whitespace
ALTER TABLE public.habits 
ADD CONSTRAINT check_title_not_empty 
CHECK (trim(title) != '');

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS (already defined in table creation)
-- ============================================================================
-- The following foreign keys are already defined:
-- 
-- habits.user_id -> auth.users(id) ON DELETE CASCADE
--   - Ensures user_id references a valid user
--   - Cascades deletion: if user is deleted, their habits are deleted
--
-- habit_logs.habit_id -> habits(id) ON DELETE CASCADE
--   - Ensures habit_id references a valid habit
--   - Cascades deletion: if habit is deleted, its logs are deleted
--
-- habit_logs: UNIQUE (habit_id, date)
--   - Prevents duplicate log entries for the same habit on the same date
-- ============================================================================

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on both tables to ensure users can only access their own data
-- ============================================================================

-- Enable RLS on habits table
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Enable RLS on habit_logs table
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: habits
-- ============================================================================
-- Policies to ensure users can only access their own habits
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

