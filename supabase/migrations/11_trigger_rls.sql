-- ── PROFIL-TRIGGER ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
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
  INSERT INTO public.profiles (user_id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', final_username)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── UPDATED_AT TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at          BEFORE UPDATE ON profiles          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated_at             BEFORE UPDATE ON posts             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_post_comments_updated_at     BEFORE UPDATE ON post_comments     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_questions_updated_at         BEFORE UPDATE ON questions         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_answers_updated_at           BEFORE UPDATE ON answers           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_garden_diary_updated_at      BEFORE UPDATE ON garden_diary      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_plants_updated_at            BEFORE UPDATE ON plants            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_groups_updated_at            BEFORE UPDATE ON groups            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_guides_updated_at            BEFORE UPDATE ON guides            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_knowledge_updated_at         BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_banners_updated_at           BEFORE UPDATE ON banners           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_seed_exchanges_updated_at    BEFORE UPDATE ON seed_exchanges    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ───────────────────────────────────────────────────
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderator_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows               ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants                ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_tips            ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_calendar       ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_diary          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups                ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_exchanges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges            ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides                ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners               ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_clicks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports               ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiler synliga för alla"    ON profiles FOR SELECT USING (true);
CREATE POLICY "Egna profilen uppdateras"     ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- POSTS
CREATE POLICY "Publicerade inlägg synliga"   ON posts FOR SELECT USING (status IN ('published','pinned'));
CREATE POLICY "Inloggade skapar inlägg"      ON posts FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id LIMIT 1));
CREATE POLICY "Egna inlägg uppdateras"       ON posts FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = posts.user_id));
CREATE POLICY "Admin hanterar inlägg"        ON posts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- POST_COMMENTS
CREATE POLICY "Kommentarer synliga"          ON post_comments FOR SELECT USING (status = 'published');
CREATE POLICY "Inloggade kommenterar"        ON post_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Egna kommentarer uppdateras"  ON post_comments FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = post_comments.user_id));

-- POST_LIKES
CREATE POLICY "Gillanden synliga"            ON post_likes FOR SELECT USING (true);
CREATE POLICY "Inloggade gillar"             ON post_likes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Egna gillanden tas bort"      ON post_likes FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = post_likes.user_id));

-- SAVED_POSTS
CREATE POLICY "Egna sparade"                 ON saved_posts FOR ALL USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = saved_posts.user_id));

-- FOLLOWS
CREATE POLICY "Follows synliga"              ON follows FOR SELECT USING (true);
CREATE POLICY "Inloggade följer"             ON follows FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Egna follows tas bort"        ON follows FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = follows.follower_id));

-- PLANTS (publika)
CREATE POLICY "Växter synliga för alla"      ON plants FOR SELECT USING (true);
CREATE POLICY "Admin hanterar växter"        ON plants FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- PLANT_TIPS
CREATE POLICY "Tips synliga"                 ON plant_tips FOR SELECT USING (status = 'published');
CREATE POLICY "Inloggade ger tips"           ON plant_tips FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- GARDEN_CALENDAR (publikt)
CREATE POLICY "Kalender synlig"              ON garden_calendar FOR SELECT USING (status = 'published');
CREATE POLICY "Admin hanterar kalender"      ON garden_calendar FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- GARDEN_DIARY
CREATE POLICY "Egna dagböcker"               ON garden_diary FOR ALL USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = garden_diary.user_id));

-- REMINDERS
CREATE POLICY "Egna påminnelser"             ON reminders FOR ALL USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = reminders.user_id));

-- QUESTIONS
CREATE POLICY "Frågor synliga"               ON questions FOR SELECT USING (status != 'removed');
CREATE POLICY "Inloggade ställer frågor"     ON questions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Egna frågor uppdateras"       ON questions FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = questions.user_id));

-- ANSWERS
CREATE POLICY "Svar synliga"                 ON answers FOR SELECT USING (status = 'published');
CREATE POLICY "Inloggade svarar"             ON answers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Egna svar uppdateras"         ON answers FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = answers.user_id));

-- GROUPS
CREATE POLICY "Publika grupper synliga"      ON groups FOR SELECT USING (group_type = 'public');
CREATE POLICY "Inloggade skapar grupper"     ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- GROUP_MEMBERS
CREATE POLICY "Gruppmedlemmar synliga"       ON group_members FOR SELECT USING (true);
CREATE POLICY "Inloggade går med i grupper"  ON group_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SEED_EXCHANGES
CREATE POLICY "Fröbyten synliga"             ON seed_exchanges FOR SELECT USING (status = 'active');
CREATE POLICY "Inloggade skapar fröbyten"    ON seed_exchanges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Egna fröbyten uppdateras"     ON seed_exchanges FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = seed_exchanges.user_id));

-- CHALLENGES
CREATE POLICY "Utmaningar synliga"           ON challenges FOR SELECT USING (true);
CREATE POLICY "Admin hanterar utmaningar"    ON challenges FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- CHALLENGE_PARTICIPANTS
CREATE POLICY "Deltagare synliga"            ON challenge_participants FOR SELECT USING (true);
CREATE POLICY "Inloggade deltar"             ON challenge_participants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- CONTENT (publikt)
CREATE POLICY "Guider synliga"               ON guides FOR SELECT USING (published = true);
CREATE POLICY "Admin hanterar guider"        ON guides FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Artiklar synliga"             ON knowledge_articles FOR SELECT USING (published = true);
CREATE POLICY "Admin hanterar artiklar"      ON knowledge_articles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Ordlista synlig"              ON glossary_terms FOR SELECT USING (true);
CREATE POLICY "Admin hanterar ordlista"      ON glossary_terms FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- BANNERS
CREATE POLICY "Aktiva banners synliga"       ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admin hanterar banners"       ON banners FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- BANNER_CLICKS
CREATE POLICY "Inloggade registrerar klick"  ON banner_clicks FOR INSERT WITH CHECK (true);

-- POINT_TRANSACTIONS
CREATE POLICY "Egna transaktioner"           ON point_transactions FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = point_transactions.user_id));

-- REPORTS
CREATE POLICY "Inloggade anmäler"            ON reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin ser anmälningar"        ON reports FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','moderator')));

-- MODERATOR_PERMISSIONS
CREATE POLICY "Admin ser behörigheter"       ON moderator_permissions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- ── SEED: ADMIN ───────────────────────────────────────────
UPDATE profiles SET role = 'admin' WHERE username = 'supergreg';
