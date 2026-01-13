# Flipbook Supabase 명세서

## 테이블

### orders
주문 정보 테이블

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | UUID | O | uuid_generate_v4() | PK |
| order_number | VARCHAR(16) | O | - | 주문번호 (UNIQUE, FB20240101XXXX) |
| video_url | TEXT | O | - | Storage 경로 |
| video_filename | TEXT | O | - | 원본 파일명 |
| video_size_bytes | BIGINT | - | - | 파일 크기 |
| customer_name | TEXT | O | - | 주문자 이름 |
| customer_phone | TEXT | O | - | 주문자 연락처 |
| customer_email | TEXT | - | - | 주문자 이메일 |
| recipient_name | TEXT | O | - | 수령인 이름 |
| recipient_phone | TEXT | O | - | 수령인 연락처 |
| address_zipcode | VARCHAR(10) | O | - | 우편번호 |
| address_main | TEXT | O | - | 기본 주소 |
| address_detail | TEXT | - | - | 상세 주소 |
| delivery_memo | TEXT | - | - | 배송 메모 |
| is_gift | BOOLEAN | - | false | 선물 여부 |
| gift_message | TEXT | - | - | 선물 메시지 |
| base_price | INTEGER | O | 25000 | 기본가 |
| gift_package_price | INTEGER | - | 0 | 선물 포장비 |
| total_price | INTEGER | O | - | 총 금액 |
| status | order_status | - | 'pending_payment' | 주문 상태 |
| tracking_number | TEXT | - | - | 운송장 번호 |
| courier | TEXT | - | - | 택배사 코드 |
| admin_note | TEXT | - | - | 관리자 메모 |
| created_at | TIMESTAMPTZ | - | NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | - | NOW() | 수정일시 |

### ENUM: order_status
```sql
CREATE TYPE order_status AS ENUM (
  'pending_payment',  -- 입금 대기
  'paid',             -- 입금 확인
  'producing',        -- 제작 중
  'ready_to_ship',    -- 배송 준비
  'shipping',         -- 배송 중
  'delivered',        -- 배송 완료
  'cancelled'         -- 취소됨
);
```

## 인덱스

| 이름 | 컬럼 | 용도 |
|------|------|------|
| idx_orders_order_number | order_number | 주문번호 조회 |
| idx_orders_status | status | 상태별 필터링 |
| idx_orders_customer_phone | customer_phone | 연락처 검색 |
| idx_orders_created_at | created_at DESC | 최신순 정렬 |

## Storage

### 버킷: flipbook-videos
- **Public**: false
- **파일 경로**: `{order_number}/{timestamp}_{filename}`
- **최대 크기**: 100MB
- **허용 MIME**: video/mp4, video/quicktime, video/webm

## RLS 정책

| 테이블 | 작업 | 정책 |
|--------|------|------|
| orders | SELECT | 누구나 가능 |
| orders | INSERT | 누구나 가능 |
| orders | UPDATE | service_role만 |

## 트리거

### update_orders_updated_at
- UPDATE 시 updated_at 자동 갱신
