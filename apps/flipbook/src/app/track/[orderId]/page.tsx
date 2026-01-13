import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageProps {
  params: { orderId: string };
}

// Status configuration
const statusConfig = {
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
};

export default function TrackDetailPage({ params }: PageProps) {
  const { orderId } = params;

  // TODO: Fetch order data from API
  // For now, use mock data
  const mockOrder = {
    orderNumber: orderId,
    status: 'pending_payment' as keyof typeof statusConfig,
    customerName: '홍길동',
    createdAt: new Date().toISOString(),
    totalPrice: 25000,
    trackingNumber: null as string | null,
  };

  const currentStatus = statusConfig[mockOrder.status];

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
                  <p className="font-mono font-bold text-lg">{mockOrder.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-70">주문일시</p>
                  <p className="text-sm">
                    {new Date(mockOrder.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">진행 상태</h2>

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

              <div className="alert mt-4">
                <div>
                  <div className="font-bold">{currentStatus.label}</div>
                  <div className="text-sm">{currentStatus.description}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {mockOrder.trackingNumber && (
            <div className="card bg-base-100 shadow-sm mb-6">
              <div className="card-body">
                <h2 className="card-title text-lg">배송 정보</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-70">운송장 번호</p>
                    <p className="font-mono">{mockOrder.trackingNumber}</p>
                  </div>
                  <a
                    href={`https://tracker.delivery/#/${mockOrder.trackingNumber}`}
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
                  <span>{mockOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">결제 금액</span>
                  <span>{mockOrder.totalPrice.toLocaleString()}원</span>
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
