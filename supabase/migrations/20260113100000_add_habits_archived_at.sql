-- Add archived_at column for soft versioning of habits
-- When a habit with logs is renamed, the original habit is archived
-- and a new habit is created with the new name

ALTER TABLE public.habits
ADD COLUMN archived_at TIMESTAMPTZ;

-- Add index for efficient filtering of active vs archived habits
CREATE INDEX IF NOT EXISTS idx_habits_archived_at ON public.habits(archived_at);

COMMENT ON COLUMN public.habits.archived_at IS 'Timestamp when the habit was archived. NULL means the habit is active.';
