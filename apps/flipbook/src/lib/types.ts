export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'producing'
  | 'ready_to_ship'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  video_url: string;
  video_filename: string;
  video_size_bytes: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  recipient_name: string;
  recipient_phone: string;
  address_zipcode: string;
  address_main: string;
  address_detail: string | null;
  delivery_memo: string | null;
  is_gift: boolean;
  gift_message: string | null;
  base_price: number;
  gift_package_price: number;
  total_price: number;
  status: OrderStatus;
  tracking_number: string | null;
  courier: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  videoFile: File;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  recipientName: string;
  recipientPhone: string;
  addressZipcode: string;
  addressMain: string;
  addressDetail?: string;
  deliveryMemo?: string;
  isGift: boolean;
  giftMessage?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; description: string; step: number }
> = {
  pending_payment: {
    label: '입금 대기',
    description: '주문이 접수되었습니다. 입금 안내를 확인해주세요.',
    step: 1,
  },
  paid: {
    label: '입금 확인',
    description: '입금이 확인되었습니다. 곧 제작을 시작합니다.',
    step: 2,
  },
  producing: {
    label: '제작 중',
    description: '플립북을 정성껏 제작하고 있습니다.',
    step: 3,
  },
  ready_to_ship: {
    label: '배송 준비',
    description: '제작이 완료되어 배송 준비 중입니다.',
    step: 4,
  },
  shipping: {
    label: '배송 중',
    description: '플립북이 배송 중입니다.',
    step: 5,
  },
  delivered: {
    label: '배송 완료',
    description: '배송이 완료되었습니다. 소중한 추억을 간직하세요!',
    step: 6,
  },
  cancelled: {
    label: '취소됨',
    description: '주문이 취소되었습니다.',
    step: 0,
  },
};
