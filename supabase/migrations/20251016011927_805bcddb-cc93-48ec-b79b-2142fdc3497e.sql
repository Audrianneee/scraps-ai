-- Step 1: Clean up existing email addresses in display_name
-- Replace email addresses with username if available, otherwise use 'User' + first 4 chars of id
UPDATE public.profiles 
SET display_name = COALESCE(
  NULLIF(username, ''),
  'User' || substring(id::text, 1, 4)
)
WHERE display_name LIKE '%@%' OR display_name IS NULL;

-- Step 2: Update the handle_new_user trigger function to use username instead of email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      'User' || substring(new.id::text, 1, 4)
    ),
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$function$;