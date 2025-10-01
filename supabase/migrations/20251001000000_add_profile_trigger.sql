/*
  # Add automatic profile creation trigger

  1. Changes
    - Add trigger function to automatically create profile on user signup
    - This ensures profiles are created even with email confirmation flow
    - Handles role and display_name from user metadata
*/

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Validate role: only allow 'client' or 'merchant', default to 'client'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  IF user_role NOT IN ('client', 'merchant') THEN
    user_role := 'client';
  END IF;
  
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    user_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
