-- Add a trigger to force types regeneration
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure triggers exist on tables with updated_at
DROP TRIGGER IF EXISTS set_timestamp ON public.profiles;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON public.user_preferences;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();