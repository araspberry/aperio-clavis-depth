-- Profiles table (1:1 with auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  dob TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  country TEXT DEFAULT '',
  profession TEXT DEFAULT '',
  denomination TEXT DEFAULT '',
  reasons TEXT[] DEFAULT '{}',
  journey TEXT DEFAULT '',
  translation TEXT DEFAULT 'BSB',
  topics TEXT[] DEFAULT '{}',
  daily_minutes INT DEFAULT 15,
  set_daily_goal BOOLEAN DEFAULT TRUE,
  clavis_tone TEXT DEFAULT 'balanced',
  onboarded BOOLEAN DEFAULT FALSE,
  member_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_book TEXT DEFAULT 'John',
  last_read_chapter INT DEFAULT 1,
  minutes_today INT DEFAULT 0,
  streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_days INT DEFAULT 0,
  clavis_sessions INT DEFAULT 0,
  last_read_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Prayers
CREATE TABLE public.prayers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'praying',
  scripture TEXT,
  for_whom TEXT,
  answered_text TEXT,
  answered_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own prayers" ON public.prayers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prayers" ON public.prayers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prayers" ON public.prayers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own prayers" ON public.prayers FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_prayers_user ON public.prayers(user_id, created_at DESC);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reference)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);

-- Notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reference)
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_notes_user ON public.notes(user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_prayers_updated BEFORE UPDATE ON public.prayers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();