-- Bluetree: 사연에 비밀번호 컬럼 추가 (수정/삭제용)
ALTER TABLE bluetree_stories ADD COLUMN IF NOT EXISTS password TEXT;

-- UPDATE/DELETE RLS 정책 추가 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bluetree_stories' AND policyname = 'Anyone can update stories'
  ) THEN
    CREATE POLICY "Anyone can update stories" ON bluetree_stories FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bluetree_stories' AND policyname = 'Anyone can delete stories'
  ) THEN
    CREATE POLICY "Anyone can delete stories" ON bluetree_stories FOR DELETE USING (true);
  END IF;
END $$;

-- Bluetree: 참여자에 비밀번호 컬럼 추가 (수정/취소용)
ALTER TABLE bluetree_participants ADD COLUMN IF NOT EXISTS password TEXT;

-- Bluetree: 참여자에 이메일 컬럼 추가
ALTER TABLE bluetree_participants ADD COLUMN IF NOT EXISTS email TEXT;

-- UPDATE/DELETE RLS 정책 추가 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bluetree_participants' AND policyname = 'Anyone can update participants'
  ) THEN
    CREATE POLICY "Anyone can update participants" ON bluetree_participants FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bluetree_participants' AND policyname = 'Anyone can delete participants'
  ) THEN
    CREATE POLICY "Anyone can delete participants" ON bluetree_participants FOR DELETE USING (true);
  END IF;
END $$;

-- Bluetree: 댓글에 비밀번호 컬럼 추가 (수정/삭제용)
ALTER TABLE bluetree_comments ADD COLUMN IF NOT EXISTS password TEXT;

-- UPDATE/DELETE RLS 정책 추가 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bluetree_comments' AND policyname = 'Anyone can update comments'
  ) THEN
    CREATE POLICY "Anyone can update comments" ON bluetree_comments FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bluetree_comments' AND policyname = 'Anyone can delete comments'
  ) THEN
    CREATE POLICY "Anyone can delete comments" ON bluetree_comments FOR DELETE USING (true);
  END IF;
END $$;
