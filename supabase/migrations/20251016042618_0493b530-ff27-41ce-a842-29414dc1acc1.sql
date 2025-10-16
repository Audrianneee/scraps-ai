-- Add dietary restrictions columns to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS custom_dietary_restrictions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS removed_dietary_restrictions TEXT[] DEFAULT '{}';