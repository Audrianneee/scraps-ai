-- Add columns to persist custom and removed items for preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS custom_seasonings TEXT[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS custom_equipment TEXT[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS custom_cuisines TEXT[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS removed_seasonings TEXT[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS removed_equipment TEXT[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS removed_cuisines TEXT[] NOT NULL DEFAULT '{}'::text[];

-- Keep existing RLS policies; no changes needed