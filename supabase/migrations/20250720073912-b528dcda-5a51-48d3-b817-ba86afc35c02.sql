-- Fix the handle_new_user function to use correct role values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'instructor', 'student') 
      THEN NEW.raw_user_meta_data->>'role'
      ELSE 'student'
    END
  );
  RETURN NEW;
END;
$function$;