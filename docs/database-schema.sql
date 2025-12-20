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

-- ============================================================================
-- RLS POLICIES: habit_logs
-- ============================================================================
-- Policies to ensure users can only access logs of their own habits
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

-- ============================================================================
-- EXECUTION INSTRUCTIONS
-- ============================================================================
-- Follow these steps to execute this schema in your Supabase project:
--
-- STEP 1: Access Supabase SQL Editor
--   1. Go to https://supabase.com/dashboard
--   2. Select your project
--   3. Navigate to "SQL Editor" in the left sidebar
--   4. Click "New query" to create a new SQL query
--
-- STEP 2: Execute the Schema
--   1. Copy the entire contents of this file (from line 1 to the end)
--   2. Paste it into the SQL Editor
--   3. Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
--   4. Wait for the execution to complete
--
-- STEP 3: Verify Execution
--   After execution, verify that everything was created successfully:
--   
--   Check tables exist:
--   SELECT table_name 
--   FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name IN ('habits', 'habit_logs');
--
--   Check RLS is enabled:
--   SELECT tablename, rowsecurity 
--   FROM pg_tables 
--   WHERE schemaname = 'public' 
--   AND tablename IN ('habits', 'habit_logs');
--
--   Check policies exist:
--   SELECT schemaname, tablename, policyname 
--   FROM pg_policies 
--   WHERE schemaname = 'public' 
--   AND tablename IN ('habits', 'habit_logs');
--
-- STEP 4: Regenerate TypeScript Types
--   After successfully executing the schema, regenerate your TypeScript types:
--   
--   Option A: Using npm script (recommended)
--   npm run generate:types
--
--   Option B: Manual command
--   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
--
--   Note: Replace YOUR_PROJECT_ID with your actual Supabase project ID
--   You can find it in your Supabase project settings or use the environment variable
--
-- STEP 5: Test the Schema (Optional)
--   You can test the schema by creating a test habit and log:
--   
--   -- This will only work if you're authenticated
--   INSERT INTO public.habits (user_id, title, icon, color)
--   VALUES (auth.uid(), 'Test Habit', '🏃', '#FF5733');
--
--   -- Get the habit ID from the previous insert, then:
--   INSERT INTO public.habit_logs (habit_id, date, completed)
--   VALUES ('<habit-id-from-above>', CURRENT_DATE, true);
--
-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
--
-- Issue: "relation already exists"
--   Solution: The tables already exist. You can either:
--   - Drop existing tables first (WARNING: This deletes all data):
--     DROP TABLE IF EXISTS public.habit_logs CASCADE;
--     DROP TABLE IF EXISTS public.habits CASCADE;
--   - Or modify the CREATE TABLE statements to use CREATE TABLE IF NOT EXISTS
--     (already included in this script)
--
-- Issue: "policy already exists"
--   Solution: Drop existing policies first:
--   DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
--   DROP POLICY IF EXISTS "Users can insert own habits" ON public.habits;
--   DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
--   DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;
--   DROP POLICY IF EXISTS "Users can view own habit logs" ON public.habit_logs;
--   DROP POLICY IF EXISTS "Users can insert own habit logs" ON public.habit_logs;
--   DROP POLICY IF EXISTS "Users can update own habit logs" ON public.habit_logs;
--   DROP POLICY IF EXISTS "Users can delete own habit logs" ON public.habit_logs;
--
-- Issue: "constraint already exists"
--   Solution: Drop the constraint first:
--   ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS check_title_not_empty;
--
-- Issue: RLS policies not working
--   Solution: Verify that:
--   1. RLS is enabled: Check with the verification query in STEP 3
--   2. User is authenticated: Make sure auth.uid() returns a valid UUID
--   3. Policies are correctly created: Check with the verification query in STEP 3
--
-- ============================================================================
-- SCHEMA SUMMARY
-- ============================================================================
--
-- Tables Created:
--   - habits: Stores user habits (id, user_id, title, icon, color, frequency, created_at)
--   - habit_logs: Stores daily completion logs (id, habit_id, date, completed)
--
-- Indexes Created:
--   - idx_habits_user_id: Optimizes queries filtering by user_id
--   - idx_habit_logs_habit_id: Optimizes joins with habits table
--   - idx_habit_logs_date: Optimizes date-based queries
--
-- Constraints:
--   - Primary keys on both tables (id columns)
--   - Foreign key: habits.user_id -> auth.users(id) with CASCADE
--   - Foreign key: habit_logs.habit_id -> habits(id) with CASCADE
--   - Unique constraint: (habit_id, date) on habit_logs
--   - Check constraint: habits.title cannot be empty
--
-- Security:
--   - RLS enabled on both tables
--   - 4 policies on habits table (SELECT, INSERT, UPDATE, DELETE)
--   - 4 policies on habit_logs table (SELECT, INSERT, UPDATE, DELETE)
--   - All policies enforce user ownership of data
--
-- ============================================================================

