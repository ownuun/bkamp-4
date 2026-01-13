-- Bluetree Foundation Database Schema

-- 익명 사연
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  title text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 댓글 (응원 메시지)
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  nickname text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 걷기 모임
create table if not exists walks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text not null,
  scheduled_at timestamptz not null,
  max_participants int default 10,
  created_at timestamptz default now()
);

-- 모임 참여자
create table if not exists walk_participants (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid references walks(id) on delete cascade,
  nickname text not null,
  contact text,
  created_at timestamptz default now()
);

-- RLS 정책 (모든 테이블에 대해 읽기/쓰기 허용)
alter table stories enable row level security;
alter table comments enable row level security;
alter table walks enable row level security;
alter table walk_participants enable row level security;

create policy "Anyone can read stories" on stories for select using (true);
create policy "Anyone can insert stories" on stories for insert with check (true);

create policy "Anyone can read comments" on comments for select using (true);
create policy "Anyone can insert comments" on comments for insert with check (true);

create policy "Anyone can read walks" on walks for select using (true);
create policy "Anyone can insert walks" on walks for insert with check (true);

create policy "Anyone can read walk_participants" on walk_participants for select using (true);
create policy "Anyone can insert walk_participants" on walk_participants for insert with check (true);
