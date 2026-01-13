import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getOrderByNumber } from '@/lib/actions/order';
import { ORDER_STATUS_CONFIG } from '@/lib/types';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function TrackDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  // 주문 조회
  const result = await getOrderByNumber(orderId);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;
  const currentStatus = ORDER_STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">주문 현황</h1>

          {/* Order Number */}
          <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-70">주문번호</p>
                  <p className="font-mono font-bold text-lg">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-70">주문일시</p>
                  <p className="text-sm">
                    {new Date(order.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">진행 상태</h2>

              {order.status === 'cancelled' ? (
                <div className="alert alert-error">
                  <span>주문이 취소되었습니다.</span>
                </div>
              ) : (
                <ul className="steps steps-vertical w-full">
                  <li className={`step ${currentStatus.step >= 1 ? 'step-primary' : ''}`}>
                    입금 대기
                  </li>
                  <li className={`step ${currentStatus.step >= 2 ? 'step-primary' : ''}`}>
                    입금 확인
                  </li>
                  <li className={`step ${currentStatus.step >= 3 ? 'step-primary' : ''}`}>
                    제작 중
                  </li>
                  <li className={`step ${currentStatus.step >= 4 ? 'step-primary' : ''}`}>
                    배송 준비
                  </li>
                  <li className={`step ${currentStatus.step >= 5 ? 'step-primary' : ''}`}>
                    배송 중
                  </li>
                  <li className={`step ${currentStatus.step >= 6 ? 'step-primary' : ''}`}>
                    배송 완료
                  </li>
                </ul>
              )}

              {order.status !== 'cancelled' && (
                <div className="alert mt-4">
                  <div>
                    <div className="font-bold">{currentStatus.label}</div>
                    <div className="text-sm">{currentStatus.description}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="card bg-base-100 shadow-sm mb-6">
              <div className="card-body">
                <h2 className="card-title text-lg">배송 정보</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-70">
                      {order.courier === 'cj' && 'CJ대한통운'}
                      {order.courier === 'hanjin' && '한진택배'}
                      {order.courier === 'lotte' && '롯데택배'}
                      {order.courier === 'post' && '우체국'}
                      {!['cj', 'hanjin', 'lotte', 'post'].includes(order.courier || '') && (order.courier || '택배')}
                    </p>
                    <p className="font-mono">{order.tracking_number}</p>
                  </div>
                  <a
                    href={`https://tracker.delivery/#/${order.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    배송 추적
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body">
              <h2 className="card-title text-lg">주문 정보</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-70">주문자</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">수령인</span>
                  <span>{order.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">배송지</span>
                  <span className="text-right">
                    ({order.address_zipcode}) {order.address_main}
                    {order.address_detail && ` ${order.address_detail}`}
                  </span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between font-bold">
                  <span>결제 금액</span>
                  <span>{order.total_price.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/track" className="btn btn-outline flex-1">
              다른 주문 조회
            </Link>
            <Link href="/" className="btn btn-ghost flex-1">
              홈으로
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
