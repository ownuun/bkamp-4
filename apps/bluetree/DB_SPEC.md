# Bluetree Foundation - Database Specification

## Project: bluetree
**Description**: 우울증이 있는 학생들이 익명으로 사연을 공유하고, 함께 걷는 치유 커뮤니티

---

## Tables

### 1. stories (익명 사연)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | 고유 ID |
| nickname | text | NOT NULL | 작성자 닉네임 (익명) |
| title | text | NOT NULL | 사연 제목 |
| content | text | NOT NULL | 사연 내용 |
| created_at | timestamptz | default now() | 작성 시간 |

### 2. comments (응원 댓글)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | 고유 ID |
| story_id | uuid | FK -> stories(id) ON DELETE CASCADE | 사연 ID |
| nickname | text | NOT NULL | 댓글 작성자 닉네임 |
| content | text | NOT NULL | 댓글 내용 |
| created_at | timestamptz | default now() | 작성 시간 |

### 3. walks (걷기 모임)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | 고유 ID |
| title | text | NOT NULL | 모임 이름 |
| description | text | | 모임 설명 |
| location | text | NOT NULL | 모임 장소 |
| scheduled_at | timestamptz | NOT NULL | 모임 일시 |
| max_participants | int | default 10 | 최대 참여 인원 |
| created_at | timestamptz | default now() | 생성 시간 |

### 4. walk_participants (모임 참여자)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | 고유 ID |
| walk_id | uuid | FK -> walks(id) ON DELETE CASCADE | 모임 ID |
| nickname | text | NOT NULL | 참여자 닉네임 |
| contact | text | | 연락처 (선택) |
| created_at | timestamptz | default now() | 신청 시간 |

---

## RLS Policies

모든 테이블에 대해 익명 사용자도 읽기/쓰기 가능 (인증 불필요)

```sql
-- stories
CREATE POLICY "Anyone can read stories" ON stories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert stories" ON stories FOR INSERT WITH CHECK (true);

-- comments
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);

-- walks
CREATE POLICY "Anyone can read walks" ON walks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert walks" ON walks FOR INSERT WITH CHECK (true);

-- walk_participants
CREATE POLICY "Anyone can read walk_participants" ON walk_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert walk_participants" ON walk_participants FOR INSERT WITH CHECK (true);
```

---

## Notes
- 모든 테이블은 인증 없이 익명으로 사용 가능
- 관리자 기능(모임 생성)은 앱 레벨에서 비밀번호로 제어 (환경변수: ADMIN_PASSWORD)
- 민감한 정보 없이 익명성 보장
