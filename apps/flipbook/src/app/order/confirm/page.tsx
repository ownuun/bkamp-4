'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { createOrder } from '@/lib/actions/order';

export default function ConfirmPage() {
  const router = useRouter();
  const { orderData, updateOrderData } = useOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      alert('주문 내용을 확인하고 동의해주세요.');
      return;
    }

    if (!orderData.videoFile) {
      alert('영상 파일이 없습니다. 처음부터 다시 시도해주세요.');
      router.push('/order/upload');
      return;
    }

    setIsSubmitting(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('videoFile', orderData.videoFile);
      formData.append('customerName', orderData.customerName);
      formData.append('customerPhone', orderData.customerPhone);
      if (orderData.customerEmail) {
        formData.append('customerEmail', orderData.customerEmail);
      }
      formData.append('recipientName', orderData.recipientName || orderData.customerName);
      formData.append('recipientPhone', orderData.recipientPhone || orderData.customerPhone);
      formData.append('addressZipcode', orderData.addressZipcode);
      formData.append('addressMain', orderData.addressMain);
      if (orderData.addressDetail) {
        formData.append('addressDetail', orderData.addressDetail);
      }
      if (orderData.deliveryMemo) {
        formData.append('deliveryMemo', orderData.deliveryMemo);
      }
      formData.append('isGift', orderData.isGift ? 'true' : 'false');
      if (orderData.giftMessage) {
        formData.append('giftMessage', orderData.giftMessage);
      }

      // 주문 생성 API 호출
      const result = await createOrder(formData);

      if (result.success && result.orderNumber) {
        updateOrderData({ orderNumber: result.orderNumber });
        router.push('/order/complete');
      } else {
        throw new Error(result.error || '주문 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      alert(error instanceof Error ? error.message : '주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Price calculation (placeholder)
  const basePrice = 25000;
  const giftPackagePrice = orderData.isGift ? 3000 : 0;
  const totalPrice = basePrice + giftPackagePrice;

  return (
    <div>
      {/* Steps */}
      <ul className="steps steps-horizontal w-full mb-8">
        <li className="step step-primary">영상 업로드</li>
        <li className="step step-primary">정보 입력</li>
        <li className="step step-primary">주문 확인</li>
        <li className="step">완료</li>
      </ul>

      <h1 className="text-2xl font-bold mb-6">주문 확인</h1>

      {/* Video Preview */}
      <div className="card bg-base-100 shadow-sm mb-4">
        <div className="card-body">
          <h2 className="card-title text-lg">업로드한 영상</h2>
          {orderData.videoUrl && (
            <video
              src={orderData.videoUrl}
              className="max-h-48 rounded-lg"
              controls
            />
          )}
          <p className="text-sm opacity-70">{orderData.videoFile?.name}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="card bg-base-100 shadow-sm mb-4">
        <div className="card-body">
          <h2 className="card-title text-lg">주문자 정보</h2>
          <div className="text-sm space-y-1">
            <p><span className="opacity-70">이름:</span> {orderData.customerName}</p>
            <p><span className="opacity-70">연락처:</span> {orderData.customerPhone}</p>
            {orderData.customerEmail && (
              <p><span className="opacity-70">이메일:</span> {orderData.customerEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="card bg-base-100 shadow-sm mb-4">
        <div className="card-body">
          <h2 className="card-title text-lg">배송 정보</h2>
          <div className="text-sm space-y-1">
            <p><span className="opacity-70">수령인:</span> {orderData.recipientName || orderData.customerName}</p>
            <p><span className="opacity-70">연락처:</span> {orderData.recipientPhone || orderData.customerPhone}</p>
            <p>
              <span className="opacity-70">주소:</span>{' '}
              ({orderData.addressZipcode}) {orderData.addressMain} {orderData.addressDetail}
            </p>
            {orderData.deliveryMemo && (
              <p><span className="opacity-70">배송 메모:</span> {orderData.deliveryMemo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Gift Options */}
      {orderData.isGift && (
        <div className="card bg-base-100 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="card-title text-lg">선물 옵션</h2>
            <div className="text-sm space-y-1">
              <p><span className="opacity-70">선물 포장:</span> 예</p>
              {orderData.giftMessage && (
                <p><span className="opacity-70">메시지:</span> {orderData.giftMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg">결제 금액</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="opacity-70">플립북 기본가</span>
              <span>{basePrice.toLocaleString()}원</span>
            </div>
            {orderData.isGift && (
              <div className="flex justify-between">
                <span className="opacity-70">선물 포장</span>
                <span>{giftPackagePrice.toLocaleString()}원</span>
              </div>
            )}
            <div className="divider my-2"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>총 금액</span>
              <span className="text-primary">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          <div className="alert alert-info mt-4">
            <span className="text-sm">결제는 주문 확인 후 별도 안내드립니다.</span>
          </div>
        </div>
      </div>

      {/* Agreement */}
      <div className="form-control mb-6">
        <label className="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="label-text">
            위 주문 내용을 확인했으며, 결제 진행에 동의합니다.
          </span>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push('/order/info')}
          disabled={isSubmitting}
        >
          이전
        </button>
        <button
          type="button"
          className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={!agreed || isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '주문하기'}
        </button>
      </div>
    </div>
  );
}
