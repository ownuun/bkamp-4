-- Marathon Alert Database Schema
-- 마라톤 광클 방지기 데이터베이스 스키마

-- 1. Marathons (마라톤 대회)
CREATE TABLE IF NOT EXISTS marathons (
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
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (사용자 프로필 - auth.users 확장)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  push_subscription JSONB,
  email_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Favorites (관심 대회)
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  marathon_id UUID REFERENCES marathons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, marathon_id)
);

-- 4. Alert Settings (알림 설정)
CREATE TABLE IF NOT EXISTS alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  marathon_id UUID REFERENCES marathons(id) ON DELETE CASCADE,
  alert_10min BOOLEAN DEFAULT true,
  alert_5min BOOLEAN DEFAULT true,
  alert_1min BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, marathon_id)
);

-- 5. Scheduled Alerts (예약된 알림 큐)
CREATE TABLE IF NOT EXISTS scheduled_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  marathon_id UUID REFERENCES marathons(id) ON DELETE CASCADE,
  alert_type VARCHAR(10) NOT NULL, -- '10min', '5min', '1min'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marathons_registration ON marathons(registration_opens_at);
CREATE INDEX IF NOT EXISTS idx_marathons_date ON marathons(date);
CREATE INDEX IF NOT EXISTS idx_marathons_featured ON marathons(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_alerts_pending ON scheduled_alerts(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_settings_user ON alert_settings(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marathons ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Marathons: Anyone can view
CREATE POLICY "Anyone can view marathons" ON marathons
  FOR SELECT USING (true);

-- Profiles: Users can only view/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Alert Settings: Users can manage their own alert settings
CREATE POLICY "Users can view own alert settings" ON alert_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert settings" ON alert_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert settings" ON alert_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert settings" ON alert_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Scheduled Alerts: Users can view their own scheduled alerts
CREATE POLICY "Users can view own scheduled alerts" ON scheduled_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_marathons_updated_at
  BEFORE UPDATE ON marathons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_settings_updated_at
  BEFORE UPDATE ON alert_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
