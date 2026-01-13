# JobHunt Supabase Specification

## Overview
- **Service**: JobHunt (Freelancer Job Alarm & Quick Apply)
- **Target**: US / Global Market
- **Port**: 3004

---

## Tables

### 1. profiles
사용자 프로필 정보

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. resumes
이력서 파일 및 AI 분석 결과

```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  parsed_data JSONB,          -- AI 파싱 결과 (skills, experience, strengths 등)
  skills TEXT[],
  experience_years INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**parsed_data JSONB 구조:**
```json
{
  "skills": ["React", "TypeScript", "Node.js"],
  "experienceYears": 5,
  "strengths": ["Strong problem-solving skills", "..."],
  "suggestions": ["Consider adding certifications", "..."],
  "summary": "Senior full-stack developer with 5 years..."
}
```

### 3. job_preferences
구직 선호도 설정

```sql
CREATE TABLE job_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  desired_roles TEXT[],
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  salary_type TEXT,           -- 'hourly', 'monthly', 'yearly'
  work_types TEXT[],          -- 'remote', 'hybrid', 'onsite'
  contract_types TEXT[],      -- 'fulltime', 'contract', 'freelance'
  preferred_locations TEXT[],
  platforms TEXT[],           -- 'upwork', 'indeed', 'linkedin'
  min_fit_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. job_postings
채용 공고 (Upwork 등에서 수집)

```sql
CREATE TABLE job_postings (
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
```

### 5. job_matches
사용자-공고 적합도 매칭 결과

```sql
CREATE TABLE job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  fit_score INTEGER NOT NULL,  -- 0-100
  fit_reasons JSONB,
  fit_explanation TEXT,
  status TEXT DEFAULT 'new',   -- 'new', 'viewed', 'saved', 'applied', 'dismissed'
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);
```

**fit_reasons JSONB 구조:**
```json
{
  "skills": 85,
  "experience": 70,
  "salary": 90
}
```

### 6. applications
지원 내역

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  match_id UUID REFERENCES job_matches(id),
  resume_id UUID REFERENCES resumes(id),
  cover_letter TEXT,
  status TEXT DEFAULT 'submitted',  -- 'draft', 'submitted', 'viewed', 'interview', 'offer', 'rejected'
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
```

### 7. notification_settings
알림 설정

```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  frequency TEXT DEFAULT 'realtime',  -- 'realtime', 'daily', 'weekly'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Storage Buckets

| Bucket | 용도 | 공개 여부 | 허용 MIME |
|--------|------|----------|-----------|
| `resumes` | 이력서 파일 | Private | application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document |

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- profiles: 본인만 조회/수정
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- resumes: 본인만 조회/수정/삭제
CREATE POLICY "Users can manage own resumes" ON resumes FOR ALL USING (auth.uid() = user_id);

-- job_preferences: 본인만 조회/수정
CREATE POLICY "Users can manage own preferences" ON job_preferences FOR ALL USING (auth.uid() = user_id);

-- job_postings: 모든 인증 사용자 조회 가능
CREATE POLICY "Authenticated users can view jobs" ON job_postings FOR SELECT USING (auth.role() = 'authenticated');

-- job_matches: 본인만 조회/수정
CREATE POLICY "Users can manage own matches" ON job_matches FOR ALL USING (auth.uid() = user_id);

-- applications: 본인만 조회/수정
CREATE POLICY "Users can manage own applications" ON applications FOR ALL USING (auth.uid() = user_id);

-- notification_settings: 본인만 조회/수정
CREATE POLICY "Users can manage own notification settings" ON notification_settings FOR ALL USING (auth.uid() = user_id);
```

---

## Indexes (성능 최적화)

```sql
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_job_postings_platform ON job_postings(platform);
CREATE INDEX idx_job_postings_created_at ON job_postings(created_at DESC);
CREATE INDEX idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX idx_job_matches_fit_score ON job_matches(fit_score DESC);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (Resume analysis, Fit scoring, Cover letter)
OPENAI_API_KEY=

# Resend (Email alerts)
RESEND_API_KEY=

# Cron Security (optional)
CRON_SECRET=

# App URL (for email links)
NEXT_PUBLIC_APP_URL=
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | 이력서 업로드 |
| POST | `/api/resumes/[id]/analyze` | AI 이력서 분석 |
| GET | `/api/jobs` | 공고 목록 조회 |
| GET | `/api/jobs/matched` | 매칭된 공고 조회 |
| POST | `/api/jobs/sync` | Upwork 공고 동기화 (Cron) |
| POST | `/api/jobs/match-all` | 전체 사용자 매칭 (Cron) |
| POST | `/api/jobs/[id]/match` | 개별 공고 매칭 |
| GET | `/api/applications` | 지원 내역 조회 |
| POST | `/api/applications` | 지원하기 (Quick Apply) |
| POST | `/api/applications/cover-letter` | AI 커버레터 생성 |

---

## Cron Jobs (Vercel)

```json
{
  "crons": [
    {
      "path": "/api/jobs/sync",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/jobs/match-all",
      "schedule": "30 */2 * * *"
    }
  ]
}
```

- `/api/jobs/sync`: 2시간마다 Upwork에서 새 공고 수집
- `/api/jobs/match-all`: 2시간마다 30분에 전체 사용자 매칭 및 알림 발송

---

*Last Updated: 2026-01-13*
