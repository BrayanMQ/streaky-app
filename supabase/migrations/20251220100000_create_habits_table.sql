-- ============================================================================
-- Migration: Create habits table
-- ============================================================================
-- Creates the habits table to store user habits with metadata
-- Includes indexes and constraints
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

-- Index for filtering habits by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

-- Ensure habit title is not empty or just whitespace
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_title_not_empty'
    ) THEN
        ALTER TABLE public.habits 
        ADD CONSTRAINT check_title_not_empty 
        CHECK (trim(title) != '');
    END IF;
END $$;

