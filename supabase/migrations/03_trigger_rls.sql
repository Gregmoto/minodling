-- Profil-trigger: skapar profil automatiskt vid registrering
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g'));
  base_username := left(base_username, 28);
  IF length(base_username) < 3 THEN
    base_username := 'odlare' || floor(random() * 9000 + 1000)::text;
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;
  INSERT INTO public.profiles (id, "userId", username, "displayName", "updatedAt")
  VALUES (gen_random_uuid()::text, NEW.id::text, final_username, COALESCE(NEW.raw_user_meta_data->>'display_name', final_username), NOW());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiler är publikt läsbara" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Egna profiler kan uppdateras" ON public.profiles FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Publicerade inlägg synliga" ON public.posts FOR SELECT USING (status IN ('PUBLISHED', 'PINNED'));
CREATE POLICY "Inloggade kan skapa inlägg" ON public.posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND "isBanned" = false));
CREATE POLICY "Forfattare uppdaterar sina inlagg" ON public.posts FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "authorId"));
CREATE POLICY "Kommentarer synliga" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Inloggade kan kommentera" ON public.comments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND "isBanned" = false));
CREATE POLICY "Gillanden synliga" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Inloggade kan gilla" ON public.likes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text));
CREATE POLICY "Odlingar synliga" ON public.gardens FOR SELECT USING ("isPublic" = true OR EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "profileId"));
CREATE POLICY "Egna odlingar" ON public.gardens FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "profileId"));
CREATE POLICY "Egna notiser" ON public.notifications FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "profileId"));
