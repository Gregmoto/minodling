-- Row Level Security (RLS) för Supabase

-- Aktivera RLS på alla tabeller
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiler: alla kan läsa, bara ägaren kan uppdatera
CREATE POLICY "Profiler är publikt läsbara"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Användare uppdaterar sin egen profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = "userId");

-- Inlägg: publicerade är synliga för alla
CREATE POLICY "Publicerade inlägg är synliga"
  ON public.posts FOR SELECT
  USING (status IN ('PUBLISHED', 'PINNED'));

CREATE POLICY "Inloggade kan skapa inlägg"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE "userId" = auth.uid()::text
        AND "isBanned" = false
    )
  );

CREATE POLICY "Författare kan uppdatera sina inlägg"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE "userId" = auth.uid()::text
        AND id = "authorId"
    )
  );

-- Kommentarer: synliga för alla
CREATE POLICY "Kommentarer är publikt synliga"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Inloggade kan kommentera"
  ON public.comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE "userId" = auth.uid()::text
        AND "isBanned" = false
    )
  );

-- Gillandens: inloggade kan gilla
CREATE POLICY "Alla kan se gillanden"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Inloggade kan gilla"
  ON public.likes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE "userId" = auth.uid()::text
    )
  );

-- Odlingar: publika syns för alla, privata bara ägaren
CREATE POLICY "Publika odlingar syns för alla"
  ON public.gardens FOR SELECT
  USING (
    "isPublic" = true
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE "userId" = auth.uid()::text AND id = "profileId"
    )
  );

CREATE POLICY "Användare hanterar sina odlingar"
  ON public.gardens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE "userId" = auth.uid()::text AND id = "profileId"
    )
  );

-- Notifikationer: bara ägaren ser sina
CREATE POLICY "Egna notifikationer"
  ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE "userId" = auth.uid()::text AND id = "profileId"
    )
  );
