-- Marathon Alert Seed Data
-- 2026년 주요 마라톤 대회 데이터

INSERT INTO marathons (name, name_en, slug, date, registration_opens_at, registration_closes_at, location, distance_options, official_url, registration_url, is_featured, description) VALUES

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
