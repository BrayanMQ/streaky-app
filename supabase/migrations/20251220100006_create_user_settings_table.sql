-- ============================================================================
-- Migration: Create user_settings table
-- ============================================================================
-- Creates the user_settings table to store user preferences (theme, etc.)
-- Includes indexes, constraints, RLS, and policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index for filtering user_settings by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own settings
CREATE POLICY "Users can view own settings"
ON public.user_settings
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can insert settings with their own user_id
CREATE POLICY "Users can insert own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update only their own settings
CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

