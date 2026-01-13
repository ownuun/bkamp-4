'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getOrderById,
  updateOrderStatus,
  updateTrackingNumber,
} from '@/lib/actions/order';
import { ORDER_STATUS_CONFIG, type Order, type OrderStatus } from '@/lib/types';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

const COURIERS = [
  { value: 'cj', label: 'CJ대한통운' },
  { value: 'hanjin', label: '한진택배' },
  { value: 'lotte', label: '롯데택배' },
  { value: 'post', label: '우체국' },
  { value: 'gs', label: 'GS편의점택배' },
  { value: 'cu', label: 'CU편의점택배' },
];

export default function AdminDetailPage({ params }: PageProps) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [status, setStatus] = useState<OrderStatus>('pending_payment');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      const result = await getOrderById(orderId);
      if (result.success && result.order) {
        setOrder(result.order);
        setStatus(result.order.status);
        setCourier(result.order.courier || '');
        setTrackingNumber(result.order.tracking_number || '');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async () => {
    if (!order) return;
    setSaving(true);
    const result = await updateOrderStatus(order.id, status);
    if (result.success) {
      setOrder({ ...order, status });
      alert('상태가 변경되었습니다.');
    } else {
      alert(result.error || '상태 변경에 실패했습니다.');
    }
    setSaving(false);
  };

  const handleTrackingUpdate = async () => {
    if (!order || !courier || !trackingNumber) {
      alert('택배사와 운송장 번호를 입력해주세요.');
      return;
    }
    setSaving(true);
    const result = await updateTrackingNumber(order.id, courier, trackingNumber);
    if (result.success) {
      setOrder({
        ...order,
        courier,
        tracking_number: trackingNumber,
        status: 'shipping',
      });
      setStatus('shipping');
      alert('운송장이 등록되었습니다.');
    } else {
      alert(result.error || '운송장 등록에 실패했습니다.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>주문을 찾을 수 없습니다.</p>
        <Link href="/admin" className="btn btn-primary">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="btn btn-ghost btn-sm mb-2"
            >
              ← 뒤로
            </button>
            <h1 className="text-2xl font-bold">주문 상세</h1>
          </div>
          <Link
            href={`/track/${order.order_number}`}
            target="_blank"
            className="btn btn-outline btn-sm"
          >
            고객 페이지 보기
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Order Info */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg">주문 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">주문번호</span>
                  <span className="font-mono font-bold">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">주문일시</span>
                  <span>
                    {new Date(order.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">현재 상태</span>
                  <span
                    className={`badge ${
                      order.status === 'pending_payment'
                        ? 'badge-warning'
                        : order.status === 'cancelled'
                        ? 'badge-error'
                        : order.status === 'delivered'
                        ? 'badge-success'
                        : 'badge-info'
                    }`}
                  >
                    {ORDER_STATUS_CONFIG[order.status].label}
                  </span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between">
                  <span className="opacity-70">기본가</span>
                  <span>{order.base_price.toLocaleString()}원</span>
                </div>
                {order.gift_package_price > 0 && (
                  <div className="flex justify-between">
                    <span className="opacity-70">선물 포장</span>
                    <span>{order.gift_package_price.toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>총 금액</span>
                  <span>{order.total_price.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg">주문자 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">이름</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">연락처</span>
                  <span>{order.customer_phone}</span>
                </div>
                {order.customer_email && (
                  <div className="flex justify-between">
                    <span className="opacity-70">이메일</span>
                    <span>{order.customer_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg">배송 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">수령인</span>
                  <span>{order.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">연락처</span>
                  <span>{order.recipient_phone}</span>
                </div>
                <div>
                  <span className="opacity-70">주소</span>
                  <p className="mt-1">
                    ({order.address_zipcode}) {order.address_main}
                    {order.address_detail && <br />}
                    {order.address_detail}
                  </p>
                </div>
                {order.delivery_memo && (
                  <div>
                    <span className="opacity-70">배송 메모</span>
                    <p className="mt-1">{order.delivery_memo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video & Gift */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg">영상 & 선물</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">영상 파일</span>
                  <span className="truncate max-w-[200px]">
                    {order.video_filename}
                  </span>
                </div>
                {order.video_size_bytes && (
                  <div className="flex justify-between">
                    <span className="opacity-70">파일 크기</span>
                    <span>
                      {(order.video_size_bytes / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="opacity-70">선물 포장</span>
                  <span>{order.is_gift ? '예' : '아니오'}</span>
                </div>
                {order.gift_message && (
                  <div>
                    <span className="opacity-70">선물 메시지</span>
                    <p className="mt-1 p-2 bg-base-200 rounded">
                      {order.gift_message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="card bg-base-100 shadow-sm mt-4">
          <div className="card-body">
            <h2 className="card-title text-lg">관리</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Status Change */}
              <div>
                <h3 className="font-medium mb-2">상태 변경</h3>
                <div className="flex gap-2">
                  <select
                    className="select select-bordered flex-1"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  >
                    {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleStatusChange}
                    disabled={saving || status === order.status}
                  >
                    {saving ? '저장 중...' : '변경'}
                  </button>
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <h3 className="font-medium mb-2">운송장 등록</h3>
                <div className="space-y-2">
                  <select
                    className="select select-bordered w-full"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                  >
                    <option value="">택배사 선택</option>
                    {COURIERS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="운송장 번호"
                      className="input input-bordered flex-1"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleTrackingUpdate}
                      disabled={saving || !courier || !trackingNumber}
                    >
                      {saving ? '저장 중...' : '등록'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
