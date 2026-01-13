'use client';

import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';

export default function CompletePage() {
  const { orderData } = useOrder();

  return (
    <div className="text-center">
      {/* Steps */}
      <ul className="steps steps-horizontal w-full mb-8">
        <li className="step step-primary">영상 업로드</li>
        <li className="step step-primary">정보 입력</li>
        <li className="step step-primary">주문 확인</li>
        <li className="step step-primary">완료</li>
      </ul>

      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-4">주문이 완료되었습니다!</h1>
      <p className="text-lg opacity-70 mb-8">
        소중한 주문 감사합니다.<br />
        결제 안내를 곧 보내드릴게요.
      </p>

      {/* Order Number */}
      <div className="card bg-base-100 shadow-sm mb-8">
        <div className="card-body">
          <h2 className="text-sm opacity-70">주문번호</h2>
          <p className="text-2xl font-mono font-bold text-primary">
            {orderData.orderNumber || 'FB20240101XXXX'}
          </p>
          <p className="text-sm opacity-70 mt-2">
            주문 조회 시 이 번호를 사용해주세요
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card bg-base-200 mb-8">
        <div className="card-body text-left">
          <h2 className="card-title text-base">다음 단계 안내</h2>
          <ul className="text-sm space-y-2">
            <li className="flex gap-2">
              <span>1.</span>
              <span>입금 안내 메시지를 확인해주세요</span>
            </li>
            <li className="flex gap-2">
              <span>2.</span>
              <span>입금 확인 후 제작이 시작됩니다 (3~5 영업일)</span>
            </li>
            <li className="flex gap-2">
              <span>3.</span>
              <span>제작 완료 후 배송해드립니다 (1~2 영업일)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link href={`/track/${orderData.orderNumber || ''}`} className="btn btn-primary w-full">
          주문 현황 확인
        </Link>
        <Link href="/" className="btn btn-ghost w-full">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
