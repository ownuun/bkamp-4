# Marathon Alert - Supabase Database Specification

## Overview
- **App**: Marathon Alert (마라톤 광클 방지기)
- **Port**: 3001
- **Purpose**: 마라톤 대회 신청 알림 서비스

---

## Tables

### 1. `marathons`
마라톤 대회 정보

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | VARCHAR(255) | NO | - | 대회명 (한글) |
| name_en | VARCHAR(255) | YES | - | 대회명 (영문) |
| slug | VARCHAR(100) | NO | - | URL 슬러그 (UNIQUE) |
| date | DATE | NO | - | 대회 개최일 |
| registration_opens_at | TIMESTAMPTZ | NO | - | 신청 오픈 일시 |
| registration_closes_at | TIMESTAMPTZ | YES | - | 신청 마감 일시 |
| location | VARCHAR(255) | YES | - | 개최 장소 |
| distance_options | TEXT[] | YES | ['Full','Half','10K'] | 코스 종류 |
| official_url | TEXT | YES | - | 공식 홈페이지 URL |
| registration_url | TEXT | YES | - | 신청 페이지 URL |
| image_url | TEXT | YES | - | 대회 이미지 URL |
| description | TEXT | YES | - | 대회 설명 |
| is_featured | BOOLEAN | YES | false | 인기 대회 여부 |
| created_at | TIMESTAMPTZ | YES | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | YES | NOW() | 수정일 |

**Indexes:**
- `idx_marathons_registration` ON registration_opens_at
- `idx_marathons_date` ON date
- `idx_marathons_featured` ON is_featured WHERE is_featured = true

**RLS Policy:**
- SELECT: Anyone (public read)

---

### 2. `profiles`
사용자 프로필 (auth.users 확장)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | PK, FK -> auth.users(id) |
| email | VARCHAR(255) | NO | - | 이메일 |
| name | VARCHAR(255) | YES | - | 이름 |
| avatar_url | TEXT | YES | - | 프로필 이미지 URL |
| push_subscription | JSONB | YES | - | 웹 푸시 구독 정보 |
| email_notifications_enabled | BOOLEAN | YES | true | 이메일 알림 활성화 |
| push_notifications_enabled | BOOLEAN | YES | true | 푸시 알림 활성화 |
| created_at | TIMESTAMPTZ | YES | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | YES | NOW() | 수정일 |

**RLS Policy:**
- SELECT: auth.uid() = id
- UPDATE: auth.uid() = id
- INSERT: auth.uid() = id

**Trigger:**
- `on_auth_user_created`: 새 사용자 가입 시 자동 프로필 생성

---

### 3. `user_favorites`
관심 대회 (즐겨찾기)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | - | FK -> profiles(id) |
| marathon_id | UUID | NO | - | FK -> marathons(id) |
| created_at | TIMESTAMPTZ | YES | NOW() | 생성일 |

**Constraints:**
- UNIQUE(user_id, marathon_id)

**Indexes:**
- `idx_user_favorites_user` ON user_id

**RLS Policy:**
- SELECT/INSERT/DELETE: auth.uid() = user_id

---

### 4. `alert_settings`
알림 설정

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | - | FK -> profiles(id) |
| marathon_id | UUID | NO | - | FK -> marathons(id) |
| alert_10min | BOOLEAN | YES | true | 10분 전 알림 |
| alert_5min | BOOLEAN | YES | true | 5분 전 알림 |
| alert_1min | BOOLEAN | YES | true | 1분 전 알림 |
| created_at | TIMESTAMPTZ | YES | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | YES | NOW() | 수정일 |

**Constraints:**
- UNIQUE(user_id, marathon_id)

**Indexes:**
- `idx_alert_settings_user` ON user_id

**RLS Policy:**
- SELECT/INSERT/UPDATE/DELETE: auth.uid() = user_id

---

### 5. `scheduled_alerts`
예약된 알림 큐 (Edge Function에서 처리)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | - | FK -> profiles(id) |
| marathon_id | UUID | NO | - | FK -> marathons(id) |
| alert_type | VARCHAR(10) | NO | - | '10min', '5min', '1min' |
| scheduled_for | TIMESTAMPTZ | NO | - | 발송 예정 시간 |
| sent_at | TIMESTAMPTZ | YES | - | 실제 발송 시간 |
| status | VARCHAR(20) | YES | 'pending' | 'pending', 'sent', 'failed' |
| error_message | TEXT | YES | - | 실패 시 에러 메시지 |
| created_at | TIMESTAMPTZ | YES | NOW() | 생성일 |

**Indexes:**
- `idx_scheduled_alerts_pending` ON scheduled_for WHERE status = 'pending'

**RLS Policy:**
- SELECT: auth.uid() = user_id

---

## Edge Functions

### 1. `send-alerts`
- **Trigger**: Cron (매 1분)
- **Purpose**: pending 상태의 알림 발송 (웹 푸시 + 이메일)
- **Required Env Vars**:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - VAPID_PUBLIC_KEY
  - VAPID_PRIVATE_KEY
  - VAPID_SUBJECT
  - RESEND_API_KEY

### 2. `schedule-alerts`
- **Trigger**: API call (사용자가 알림 설정 시)
- **Purpose**: scheduled_alerts 테이블에 알림 예약 레코드 생성
- **Required Env Vars**:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY

---

## Auth Providers

| Provider | Required |
|----------|----------|
| Google | Yes |
| Kakao | Yes |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:your@email.com

# Email
RESEND_API_KEY=
```

---

## Seed Data

2026년 주요 마라톤 대회 (6개):
- 서울마라톤
- JTBC 마라톤
- 경주 벚꽃마라톤
- 춘천마라톤
- 대구국제마라톤
- 부산마라톤

SQL 파일: `supabase/seed.sql`
