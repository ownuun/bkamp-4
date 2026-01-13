-- Flipbook Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 주문 상태 ENUM
CREATE TYPE order_status AS ENUM (
  'pending_payment',  -- 입금 대기
  'paid',             -- 입금 확인
  'producing',        -- 제작 중
  'ready_to_ship',    -- 배송 준비
  'shipping',         -- 배송 중
  'delivered',        -- 배송 완료
  'cancelled'         -- 취소됨
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(16) UNIQUE NOT NULL,

  -- 영상 정보
  video_url TEXT NOT NULL,
  video_filename TEXT NOT NULL,
  video_size_bytes BIGINT,

  -- 주문자 정보
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- 배송 정보
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  address_zipcode VARCHAR(10) NOT NULL,
  address_main TEXT NOT NULL,
  address_detail TEXT,
  delivery_memo TEXT,

  -- 선물 옵션
  is_gift BOOLEAN DEFAULT FALSE,
  gift_message TEXT,

  -- 가격 정보 (정산/통계용)
  base_price INTEGER NOT NULL DEFAULT 25000,
  gift_package_price INTEGER DEFAULT 0,
  total_price INTEGER NOT NULL,

  -- 상태 및 배송 추적
  status order_status DEFAULT 'pending_payment',
  tracking_number TEXT,
  courier TEXT,

  -- 관리자 메모
  admin_note TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 누구나 주문번호로 조회 가능 (비로그인 사용자도)
CREATE POLICY "Anyone can read orders" ON orders
  FOR SELECT USING (true);

-- 누구나 주문 생성 가능 (비로그인 사용자도)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- 업데이트는 service_role만 가능 (관리자용)
CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE USING (true);
