-- =====================================================
-- BKAMP 통합 시드 데이터
-- =====================================================

-- =====================================================
-- MARATHON: 2026년 주요 마라톤 대회
-- =====================================================

INSERT INTO marathon_events (name, name_en, slug, date, registration_opens_at, registration_closes_at, location, distance_options, official_url, registration_url, is_featured, description) VALUES

-- 서울마라톤 (동아마라톤)
(
  '서울마라톤',
  'Seoul Marathon',
  'seoul-marathon',
  '2026-03-15',
  '2025-11-01 10:00:00+09',
  '2025-12-15 23:59:59+09',
  '서울 광화문',
  ARRAY['Full', 'Half', '10K'],
  'https://www.seoul-marathon.com',
  'https://www.seoul-marathon.com/register',
  true,
  '대한민국 대표 마라톤 대회. 광화문에서 출발하여 서울 도심을 달리는 코스.'
),

-- JTBC 마라톤
(
  'JTBC 마라톤',
  'JTBC Marathon',
  'jtbc-marathon',
  '2026-04-05',
  '2026-01-15 10:00:00+09',
  '2026-02-28 23:59:59+09',
  '서울 상암',
  ARRAY['Full', 'Half', '10K', '5K'],
  'https://www.jtbcmarathon.com',
  'https://www.jtbcmarathon.com/register',
  true,
  '상암월드컵경기장을 중심으로 한강변을 달리는 봄 마라톤.'
),

-- 경주 벚꽃마라톤
(
  '경주 벚꽃마라톤',
  'Gyeongju Cherry Blossom Marathon',
  'gyeongju-marathon',
  '2026-04-04',
  '2026-01-10 10:00:00+09',
  '2026-03-01 23:59:59+09',
  '경주 보문호',
  ARRAY['Full', 'Half', '10K'],
  'https://www.gyeongjumarathon.com',
  'https://www.gyeongjumarathon.com/register',
  true,
  '벚꽃이 만개한 경주에서 달리는 아름다운 봄 마라톤.'
),

-- 대구마라톤
(
  '대구국제마라톤',
  'Daegu International Marathon',
  'daegu-marathon',
  '2026-04-12',
  '2026-01-20 10:00:00+09',
  '2026-03-15 23:59:59+09',
  '대구 두류공원',
  ARRAY['Full', 'Half', '10K'],
  'https://www.daegumarathon.com',
  'https://www.daegumarathon.com/register',
  true,
  '대구를 대표하는 국제 마라톤 대회.'
),

-- 부산마라톤
(
  '부산마라톤',
  'Busan Marathon',
  'busan-marathon',
  '2026-05-03',
  '2026-02-01 10:00:00+09',
  '2026-04-01 23:59:59+09',
  '부산 광안리',
  ARRAY['Full', 'Half', '10K', '5K'],
  'https://www.busanmarathon.com',
  'https://www.busanmarathon.com/register',
  true,
  '광안대교와 해운대 해변을 달리는 부산의 대표 마라톤.'
),

-- 춘천마라톤
(
  '춘천마라톤',
  'Chuncheon Marathon',
  'chuncheon-marathon',
  '2026-10-25',
  '2026-07-01 10:00:00+09',
  '2026-09-30 23:59:59+09',
  '춘천 의암호',
  ARRAY['Full', 'Half', '10K'],
  'https://www.chuncheonmarathon.com',
  'https://www.chuncheonmarathon.com/register',
  true,
  '아름다운 의암호를 따라 달리는 가을 마라톤의 대명사.'
),

-- 전주마라톤
(
  '전주마라톤',
  'Jeonju Marathon',
  'jeonju-marathon',
  '2026-04-19',
  '2026-01-25 10:00:00+09',
  '2026-03-31 23:59:59+09',
  '전주 한옥마을',
  ARRAY['Full', 'Half', '10K'],
  'https://www.jeonjumarathon.com',
  'https://www.jeonjumarathon.com/register',
  false,
  '전통과 현대가 어우러진 전주에서 달리는 마라톤.'
),

-- 제주마라톤
(
  '제주국제마라톤',
  'Jeju International Marathon',
  'jeju-marathon',
  '2026-06-14',
  '2026-03-01 10:00:00+09',
  '2026-05-31 23:59:59+09',
  '제주 서귀포',
  ARRAY['Full', 'Half', '10K'],
  'https://www.jejumarathon.com',
  'https://www.jejumarathon.com/register',
  false,
  '아름다운 제주 해안도로를 달리는 국제 마라톤.'
),

-- 인천마라톤
(
  '인천마라톤',
  'Incheon Marathon',
  'incheon-marathon',
  '2026-05-17',
  '2026-02-15 10:00:00+09',
  '2026-04-30 23:59:59+09',
  '인천 송도',
  ARRAY['Full', 'Half', '10K', '5K'],
  'https://www.incheonmarathon.com',
  'https://www.incheonmarathon.com/register',
  false,
  '송도 국제도시를 달리는 인천의 대표 마라톤.'
),

-- 충주마라톤
(
  '충주마라톤',
  'Chungju Marathon',
  'chungju-marathon',
  '2026-09-20',
  '2026-06-01 10:00:00+09',
  '2026-08-31 23:59:59+09',
  '충주 탄금호',
  ARRAY['Full', 'Half', '10K'],
  'https://www.chungjumarathon.com',
  'https://www.chungjumarathon.com/register',
  false,
  '탄금호의 아름다운 풍경과 함께하는 마라톤.'
);

-- =====================================================
-- FOUNDERS: 창업가 페르소나
-- =====================================================

INSERT INTO founders_personas (id, name, title, philosophy, color, system_prompt) VALUES

('elon', '일론 머스크 스타일 멘토', 'Tesla & SpaceX 창업자에서 영감',
'불가능해 보이는 목표를 향해 끊임없이 도전하고, 첫 원칙(First Principles)으로 사고합니다.',
'#1DA1F2',
'당신은 일론 머스크의 사고방식과 철학에서 영감을 받은 AI 멘토입니다. 첫 원칙 사고(First Principles Thinking)를 강조하고, 대담한 목표 설정, 빠른 실행, 실패를 통한 학습을 중시합니다. 사용자의 아이디어에 대해 근본적인 질문을 던지고, 기존의 가정에 도전하도록 유도하세요. 응답은 직설적이고 간결하게, 때로는 도발적으로 하세요. 한국어로 응답하세요.'),

('steve', '스티브 잡스 스타일 멘토', 'Apple 공동창업자에서 영감',
'단순함의 극치를 추구하고, 기술과 인문학의 교차점에서 혁신을 만듭니다.',
'#A3AAAE',
'당신은 스티브 잡스의 철학과 미학에서 영감을 받은 AI 멘토입니다. 제품의 단순함과 우아함, 사용자 경험의 완벽함을 강조합니다. "좋은 것"이 아닌 "최고"를 추구하도록 독려하세요. 디자인과 기능의 조화, 그리고 "왜"에 대한 깊은 이해를 중시합니다. 열정적이면서도 까다롭게 피드백하세요. 한국어로 응답하세요.'),

('jeff', '제프 베조스 스타일 멘토', 'Amazon 창업자에서 영감',
'고객에 대한 집착, 장기적 사고, Day 1 정신으로 끊임없이 혁신합니다.',
'#FF9900',
'당신은 제프 베조스의 경영 철학에서 영감을 받은 AI 멘토입니다. 고객 집착(Customer Obsession), 장기적 사고, 실험과 실패의 중요성을 강조합니다. "Day 1" 정신을 유지하고, 역행 작업(Working Backwards)으로 고객의 필요에서 시작하도록 안내하세요. 데이터 기반 의사결정과 운영 탁월성을 중시합니다. 한국어로 응답하세요.'),

('bill', '빌 게이츠 스타일 멘토', 'Microsoft 공동창업자에서 영감',
'기술로 세상을 바꾸고, 지식과 학습에 끊임없이 투자합니다.',
'#00A4EF',
'당신은 빌 게이츠의 사고방식에서 영감을 받은 AI 멘토입니다. 기술의 민주화, 지속적인 학습, 복잡한 문제의 체계적 분석을 강조합니다. 깊은 독서와 전문가 의견 청취의 중요성을 말하고, 큰 문제를 작은 단위로 나누어 해결하도록 안내하세요. 분석적이면서도 실용적인 조언을 제공합니다. 한국어로 응답하세요.'),

('mark', '마크 저커버그 스타일 멘토', 'Meta 창업자에서 영감',
'빠르게 움직이고, 대담한 미션으로 세상을 연결합니다.',
'#1877F2',
'당신은 마크 저커버그의 접근 방식에서 영감을 받은 AI 멘토입니다. "Move Fast and Break Things"의 정신, 대담한 미션 설정, 그리고 빠른 반복(iteration)을 강조합니다. 완벽보다 빠른 출시와 피드백을, 작은 시작에서 큰 비전으로의 성장을 독려하세요. 젊고 에너지 넘치는 톤으로, 한국어로 응답하세요.');

-- =====================================================
-- FOUNDERS: 명언
-- =====================================================

INSERT INTO founders_quotes (persona_id, content, source) VALUES

-- 일론 머스크
('elon', '실패는 여기서 선택지 중 하나입니다. 만약 실패하지 않는다면, 충분히 혁신하지 않는 것입니다.', 'SpaceX Interview'),
('elon', '첫 번째 단계는 무언가가 가능하다는 것을 확립하는 것입니다. 그러면 확률이 발생합니다.', 'TED Talk'),
('elon', '어떤 것이든 충분히 중요하다면, 성공 확률이 낮더라도 해야 합니다.', 'Interview'),
('elon', '끈기는 매우 중요합니다. 포기해야 할 때가 아니라면 포기하지 마세요.', 'USC Commencement'),

-- 스티브 잡스
('steve', '단순함이 궁극의 정교함이다.', 'Apple Marketing'),
('steve', '점들을 미리 연결할 수는 없습니다. 뒤를 돌아봐야만 연결할 수 있습니다.', 'Stanford Commencement'),
('steve', '디자인은 어떻게 보이는가가 아닙니다. 어떻게 작동하는가입니다.', 'New York Times Interview'),
('steve', '혁신은 1000가지에 아니오라고 말하는 것입니다.', 'Apple WWDC'),

-- 제프 베조스
('jeff', '고객 집착으로 시작하고 거꾸로 일하세요.', 'Amazon Leadership Principles'),
('jeff', '장기적으로 생각하면 고객과 주주의 이익은 일치합니다.', 'Shareholder Letter'),
('jeff', '매일이 Day 1입니다. Day 2는 정체이고, 그 다음은 죽음입니다.', 'Annual Letter'),
('jeff', '실험하지 않으면 발명할 수 없습니다.', 'Re:Invent Keynote'),

-- 빌 게이츠
('bill', '성공은 형편없는 선생님입니다. 똑똑한 사람들이 절대 질 수 없다고 생각하게 만듭니다.', 'The Road Ahead'),
('bill', '우리는 항상 앞으로 2년의 변화를 과대평가하고 10년의 변화를 과소평가합니다.', 'The Road Ahead'),
('bill', '불만족한 고객은 가장 큰 배움의 원천입니다.', 'Business @ the Speed of Thought'),
('bill', '기술은 도구일 뿐입니다. 아이들이 함께 일하고 동기부여를 받는 것은 선생님이 가장 중요합니다.', 'Gates Foundation'),

-- 마크 저커버그
('mark', '가장 큰 리스크는 리스크를 감수하지 않는 것입니다.', 'Y Combinator Interview'),
('mark', '빠르게 움직이고 깨뜨려라. 무언가를 깨뜨리지 않는다면 충분히 빠르게 움직이지 않는 것입니다.', 'Facebook Internal'),
('mark', '완벽보다 완료가 낫습니다.', 'Facebook HQ'),
('mark', '사람들이 생각하는 것보다 한 사람이 만들 수 있는 영향력은 훨씬 큽니다.', 'Harvard Commencement');
