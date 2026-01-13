-- =====================================================
-- BKAMP 통합 스키마 - 서비스별 테이블
-- =====================================================

-- =====================================================
-- MARATHON (마라톤 광클 방지기)
-- =====================================================

CREATE TABLE IF NOT EXISTS marathon_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  slug VARCHAR(100) UNIQUE NOT NULL,
  date DATE NOT NULL,
  registration_opens_at TIMESTAMPTZ NOT NULL,
  registration_closes_at TIMESTAMPTZ,
  location VARCHAR(255),
  distance_options TEXT[] DEFAULT ARRAY['Full', 'Half', '10K'],
  official_url TEXT,
  registration_url TEXT,
  image_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marathon_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  marathon_id UUID REFERENCES marathon_events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, marathon_id)
);

CREATE TABLE IF NOT EXISTS marathon_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  marathon_id UUID REFERENCES marathon_events(id) ON DELETE CASCADE,
  alert_10min BOOLEAN DEFAULT TRUE,
  alert_5min BOOLEAN DEFAULT TRUE,
  alert_1min BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, marathon_id)
);

CREATE TABLE IF NOT EXISTS marathon_scheduled_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  marathon_id UUID REFERENCES marathon_events(id) ON DELETE CASCADE,
  alert_type VARCHAR(10) NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marathon Indexes
CREATE INDEX IF NOT EXISTS idx_marathon_events_registration ON marathon_events(registration_opens_at);
CREATE INDEX IF NOT EXISTS idx_marathon_events_date ON marathon_events(date);
CREATE INDEX IF NOT EXISTS idx_marathon_events_featured ON marathon_events(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_marathon_favorites_user ON marathon_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_marathon_scheduled_alerts_pending ON marathon_scheduled_alerts(scheduled_for) WHERE status = 'pending';

-- =====================================================
-- FLIPBOOK (플립북 주문제작)
-- =====================================================

DO $$ BEGIN
  CREATE TYPE flipbook_order_status AS ENUM (
    'pending_payment',
    'paid',
    'producing',
    'ready_to_ship',
    'shipping',
    'delivered',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS flipbook_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(16) UNIQUE NOT NULL,
  video_url TEXT NOT NULL,
  video_filename TEXT NOT NULL,
  video_size_bytes BIGINT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  address_zipcode VARCHAR(10) NOT NULL,
  address_main TEXT NOT NULL,
  address_detail TEXT,
  delivery_memo TEXT,
  is_gift BOOLEAN DEFAULT FALSE,
  gift_message TEXT,
  base_price INTEGER DEFAULT 25000,
  gift_package_price INTEGER DEFAULT 0,
  total_price INTEGER NOT NULL,
  status flipbook_order_status DEFAULT 'pending_payment',
  tracking_number TEXT,
  courier TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flipbook Indexes
CREATE INDEX IF NOT EXISTS idx_flipbook_orders_status ON flipbook_orders(status);
CREATE INDEX IF NOT EXISTS idx_flipbook_orders_created ON flipbook_orders(created_at DESC);

-- =====================================================
-- JANSORI (잔소리 AI)
-- =====================================================

CREATE TABLE IF NOT EXISTS jansori_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  timezone TEXT DEFAULT 'Asia/Seoul',
  onboarding_completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS jansori_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  category TEXT DEFAULT 'etc',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jansori_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID UNIQUE REFERENCES jansori_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tone TEXT DEFAULT 'friend',
  frequency TEXT DEFAULT 'daily',
  custom_days INTEGER[],
  time_slots JSONB DEFAULT '["09:00"]',
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jansori_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES jansori_goals(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  tone TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'sent',
  user_response TEXT,
  responded_at TIMESTAMPTZ
);

-- Jansori Indexes
CREATE INDEX IF NOT EXISTS idx_jansori_goals_user ON jansori_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_jansori_goals_active ON jansori_goals(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_jansori_settings_goal ON jansori_settings(goal_id);
CREATE INDEX IF NOT EXISTS idx_jansori_history_user ON jansori_history(user_id);

-- =====================================================
-- JOBHUNT (Freelancer Job Alarm)
-- =====================================================

CREATE TABLE IF NOT EXISTS jobhunt_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  parsed_data JSONB,
  skills TEXT[],
  experience_years INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobhunt_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  desired_roles TEXT[],
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  salary_type TEXT,
  work_types TEXT[],
  contract_types TEXT[],
  preferred_locations TEXT[],
  platforms TEXT[],
  min_fit_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobhunt_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  description TEXT,
  requirements TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_type TEXT,
  work_type TEXT,
  contract_type TEXT,
  location TEXT,
  skills_required TEXT[],
  experience_required INTEGER,
  deadline_at TIMESTAMPTZ,
  external_url TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, external_id)
);

CREATE TABLE IF NOT EXISTS jobhunt_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobhunt_postings(id) ON DELETE CASCADE,
  fit_score INTEGER NOT NULL,
  fit_reasons JSONB,
  fit_explanation TEXT,
  status TEXT DEFAULT 'new',
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE TABLE IF NOT EXISTS jobhunt_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobhunt_postings(id) ON DELETE CASCADE,
  match_id UUID REFERENCES jobhunt_matches(id),
  resume_id UUID REFERENCES jobhunt_resumes(id),
  cover_letter TEXT,
  status TEXT DEFAULT 'submitted',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- JobHunt Indexes
CREATE INDEX IF NOT EXISTS idx_jobhunt_resumes_user ON jobhunt_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_jobhunt_postings_platform ON jobhunt_postings(platform);
CREATE INDEX IF NOT EXISTS idx_jobhunt_matches_user ON jobhunt_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_jobhunt_matches_score ON jobhunt_matches(fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobhunt_applications_user ON jobhunt_applications(user_id);

-- =====================================================
-- BLUETREE (힐링 커뮤니티 - 익명)
-- =====================================================

CREATE TABLE IF NOT EXISTS bluetree_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bluetree_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES bluetree_stories(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bluetree_walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  max_participants INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bluetree_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walk_id UUID REFERENCES bluetree_walks(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bluetree Indexes
CREATE INDEX IF NOT EXISTS idx_bluetree_stories_created ON bluetree_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bluetree_comments_story ON bluetree_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_bluetree_walks_scheduled ON bluetree_walks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bluetree_participants_walk ON bluetree_participants(walk_id);

-- =====================================================
-- FOUNDERS (창업가 가상 대담)
-- =====================================================

CREATE TABLE IF NOT EXISTS founders_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 50 NOT NULL
);

CREATE TABLE IF NOT EXISTS founders_personas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  philosophy TEXT NOT NULL,
  color TEXT NOT NULL,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founders_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  persona_id TEXT REFERENCES founders_personas(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founders_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES founders_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  is_highlighted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founders_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id TEXT REFERENCES founders_personas(id),
  content TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founders_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('initial', 'usage', 'bonus')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Founders Indexes
CREATE INDEX IF NOT EXISTS idx_founders_sessions_user ON founders_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_founders_messages_session ON founders_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_founders_quotes_persona ON founders_quotes(persona_id);
CREATE INDEX IF NOT EXISTS idx_founders_credit_transactions_user ON founders_credit_transactions(user_id);

-- =====================================================
-- WEBTOON (웹툰 추천)
-- =====================================================

CREATE TABLE IF NOT EXISTS webtoon_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input_webtoons TEXT[] NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webtoon Indexes
CREATE INDEX IF NOT EXISTS idx_webtoon_recommendations_user ON webtoon_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_webtoon_recommendations_created ON webtoon_recommendations(created_at DESC);

-- =====================================================
-- Updated At Triggers
-- =====================================================

CREATE TRIGGER update_marathon_events_updated_at
  BEFORE UPDATE ON marathon_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flipbook_orders_updated_at
  BEFORE UPDATE ON flipbook_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jansori_goals_updated_at
  BEFORE UPDATE ON jansori_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jansori_settings_updated_at
  BEFORE UPDATE ON jansori_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobhunt_preferences_updated_at
  BEFORE UPDATE ON jobhunt_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founders_sessions_updated_at
  BEFORE UPDATE ON founders_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
