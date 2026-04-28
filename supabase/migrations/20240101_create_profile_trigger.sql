-- Trigger: skapa profil automatiskt när en ny användare registrerar sig
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Hämta username från metadata eller generera från e-post
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- Rensa och förkorta användarnamnet
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g'));
  base_username := left(base_username, 28);

  IF length(base_username) < 3 THEN
    base_username := 'odlare' || floor(random() * 9000 + 1000)::text;
  END IF;

  final_username := base_username;

  -- Hantera dubbletter
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  INSERT INTO public.profiles (
    "userId",
    username,
    "displayName"
  ) VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', final_username)
  );

  RETURN NEW;
END;
$$;

-- Ta bort trigger om den redan finns
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Skapa trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
