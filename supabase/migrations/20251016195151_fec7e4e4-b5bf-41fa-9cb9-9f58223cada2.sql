-- Force types regeneration by adding a comment
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.user_preferences IS 'User cooking preferences and customizations';
COMMENT ON TABLE public.saved_recipes IS 'Recipes saved by users';
COMMENT ON TABLE public.cooked_recipes IS 'Recipes that users have cooked';