-- Fix authorization vulnerability in update_profile_points_and_level function
-- Add check to ensure users can only update their own points

CREATE OR REPLACE FUNCTION public.update_profile_points_and_level(
  user_id uuid,
  points_to_add integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_total_points INTEGER;
  new_level INTEGER;
BEGIN
  -- CRITICAL: Verify caller owns the profile
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update another user''s points';
  END IF;
  
  -- Update total points
  UPDATE public.profiles
  SET total_points = total_points + points_to_add,
      updated_at = now()
  WHERE id = user_id
  RETURNING total_points INTO new_total_points;
  
  -- Calculate new level (every 100 points = 1 level)
  new_level := FLOOR(new_total_points / 100) + 1;
  
  -- Update level
  UPDATE public.profiles
  SET level = new_level,
      updated_at = now()
  WHERE id = user_id;
END;
$function$;