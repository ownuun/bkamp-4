-- =====================================================
-- BKAMP 통합 스키마 - RLS 정책
-- =====================================================

-- =====================================================
-- MARATHON RLS
-- =====================================================

ALTER TABLE marathon_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marathon_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE marathon_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marathon_scheduled_alerts ENABLE ROW LEVEL SECURITY;

-- Marathon Events: 누구나 조회, 관리자만 수정
CREATE POLICY "Anyone can view marathon events" ON marathon_events
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage marathon events" ON marathon_events
  FOR ALL USING (is_service_admin('marathon'));

-- Marathon Favorites
CREATE POLICY "Users can view own favorites" ON marathon_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON marathon_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON marathon_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Marathon Alert Settings
CREATE POLICY "Users can view own alert settings" ON marathon_alert_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert settings" ON marathon_alert_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert settings" ON marathon_alert_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert settings" ON marathon_alert_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Marathon Scheduled Alerts
CREATE POLICY "Users can view own scheduled alerts" ON marathon_scheduled_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FLIPBOOK RLS (비회원 - 게스트 주문)
-- =====================================================

ALTER TABLE flipbook_orders ENABLE ROW LEVEL SECURITY;

-- 누구나 주문 생성 가능
CREATE POLICY "Anyone can create orders" ON flipbook_orders
  FOR INSERT WITH CHECK (true);

-- 주문번호로 조회 가능 (별도 API에서 처리)
-- 관리자만 전체 조회/수정 가능
CREATE POLICY "Admins can manage flipbook orders" ON flipbook_orders
  FOR ALL USING (is_service_admin('flipbook'));

-- =====================================================
-- JANSORI RLS
-- =====================================================

ALTER TABLE jansori_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jansori_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jansori_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jansori_history ENABLE ROW LEVEL SECURITY;

-- Jansori Profiles
CREATE POLICY "Users can view own jansori profile" ON jansori_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own jansori profile" ON jansori_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own jansori profile" ON jansori_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Jansori Goals
CREATE POLICY "Users can view own goals" ON jansori_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON jansori_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON jansori_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON jansori_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Jansori Settings
CREATE POLICY "Users can view own jansori settings" ON jansori_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jansori settings" ON jansori_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jansori settings" ON jansori_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jansori settings" ON jansori_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Jansori History
CREATE POLICY "Users can view own jansori history" ON jansori_history
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- JOBHUNT RLS
-- =====================================================

ALTER TABLE jobhunt_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobhunt_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobhunt_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobhunt_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobhunt_applications ENABLE ROW LEVEL SECURITY;

-- Resumes
CREATE POLICY "Users can view own resumes" ON jobhunt_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON jobhunt_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON jobhunt_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON jobhunt_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Preferences
CREATE POLICY "Users can view own preferences" ON jobhunt_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON jobhunt_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON jobhunt_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Job Postings: 인증된 사용자 누구나 조회
CREATE POLICY "Authenticated users can view job postings" ON jobhunt_postings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Matches
CREATE POLICY "Users can view own matches" ON jobhunt_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own matches" ON jobhunt_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- Applications
CREATE POLICY "Users can view own applications" ON jobhunt_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON jobhunt_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON jobhunt_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- BLUETREE RLS (익명 - 완전 공개)
-- =====================================================

ALTER TABLE bluetree_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bluetree_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bluetree_walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bluetree_participants ENABLE ROW LEVEL SECURITY;

-- Stories: 완전 공개
CREATE POLICY "Anyone can view stories" ON bluetree_stories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create stories" ON bluetree_stories
  FOR INSERT WITH CHECK (true);

-- Comments: 완전 공개
CREATE POLICY "Anyone can view comments" ON bluetree_comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create comments" ON bluetree_comments
  FOR INSERT WITH CHECK (true);

-- Walks: 완전 공개
CREATE POLICY "Anyone can view walks" ON bluetree_walks
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create walks" ON bluetree_walks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage walks" ON bluetree_walks
  FOR ALL USING (is_service_admin('bluetree'));

-- Participants: 완전 공개
CREATE POLICY "Anyone can view participants" ON bluetree_participants
  FOR SELECT USING (true);

CREATE POLICY "Anyone can join walks" ON bluetree_participants
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FOUNDERS RLS
-- =====================================================

ALTER TABLE founders_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Founders Profiles
CREATE POLICY "Users can view own founders profile" ON founders_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own founders profile" ON founders_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own founders profile" ON founders_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Personas: 누구나 조회
CREATE POLICY "Anyone can view personas" ON founders_personas
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage personas" ON founders_personas
  FOR ALL USING (is_service_admin('founders'));

-- Sessions
CREATE POLICY "Users can view own sessions" ON founders_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON founders_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON founders_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON founders_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can view messages in own sessions" ON founders_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM founders_sessions
      WHERE founders_sessions.id = founders_messages.session_id
      AND founders_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own sessions" ON founders_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM founders_sessions
      WHERE founders_sessions.id = founders_messages.session_id
      AND founders_sessions.user_id = auth.uid()
    )
  );

-- Quotes: 누구나 조회
CREATE POLICY "Anyone can view quotes" ON founders_quotes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage quotes" ON founders_quotes
  FOR ALL USING (is_service_admin('founders'));

-- Credit Transactions
CREATE POLICY "Users can view own credit transactions" ON founders_credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- WEBTOON RLS
-- =====================================================

ALTER TABLE webtoon_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON webtoon_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON webtoon_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
