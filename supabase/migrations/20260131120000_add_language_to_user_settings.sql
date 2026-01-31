-- ============================================================================
-- Migration: Add language column to user_settings table
-- ============================================================================
-- Adds language preference column to store user's selected language
-- Includes check constraint for valid language codes
-- ============================================================================

-- Add language column with default value
ALTER TABLE public.user_settings 
ADD COLUMN language TEXT NOT NULL DEFAULT 'en';

-- Add check constraint to validate language codes
ALTER TABLE public.user_settings
ADD CONSTRAINT user_settings_language_check 
CHECK (language IN ('en', 'es', 'pt', 'fr', 'de'));

-- Backfill existing records with default language (already done by DEFAULT, but explicit for clarity)
UPDATE public.user_settings 
SET language = 'en' 
WHERE language IS NULL;
