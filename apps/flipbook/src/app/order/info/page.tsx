'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';

export default function InfoPage() {
  const router = useRouter();
  const { orderData, updateOrderData } = useOrder();
  const [sameAsCustomer, setSameAsCustomer] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!orderData.customerName.trim()) {
      newErrors.customerName = '이름을 입력해주세요';
    }
    if (!orderData.customerPhone.trim()) {
      newErrors.customerPhone = '연락처를 입력해주세요';
    }
    if (!orderData.addressZipcode.trim()) {
      newErrors.addressZipcode = '우편번호를 입력해주세요';
    }
    if (!orderData.addressMain.trim()) {
      newErrors.addressMain = '주소를 입력해주세요';
    }

    if (!sameAsCustomer) {
      if (!orderData.recipientName.trim()) {
        newErrors.recipientName = '수령인 이름을 입력해주세요';
      }
      if (!orderData.recipientPhone.trim()) {
        newErrors.recipientPhone = '수령인 연락처를 입력해주세요';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSameAsCustomerChange = (checked: boolean) => {
    setSameAsCustomer(checked);
    if (checked) {
      updateOrderData({
        recipientName: orderData.customerName,
        recipientPhone: orderData.customerPhone,
      });
    }
  };

  const handleNext = () => {
    if (sameAsCustomer) {
      updateOrderData({
        recipientName: orderData.customerName,
        recipientPhone: orderData.customerPhone,
      });
    }

    if (validate()) {
      router.push('/order/confirm');
    }
  };

  return (
    <div>
      {/* Steps */}
      <ul className="steps steps-horizontal w-full mb-8">
        <li className="step step-primary">영상 업로드</li>
        <li className="step step-primary">정보 입력</li>
        <li className="step">주문 확인</li>
        <li className="step">완료</li>
      </ul>

      <h1 className="text-2xl font-bold mb-6">주문 정보 입력</h1>

      <form className="space-y-6">
        {/* Customer Info */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">주문자 정보</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">이름 *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.customerName ? 'input-error' : ''}`}
                value={orderData.customerName}
                onChange={(e) => updateOrderData({ customerName: e.target.value })}
                placeholder="홍길동"
              />
              {errors.customerName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.customerName}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">연락처 *</span>
              </label>
              <input
                type="tel"
                className={`input input-bordered ${errors.customerPhone ? 'input-error' : ''}`}
                value={orderData.customerPhone}
                onChange={(e) => updateOrderData({ customerPhone: e.target.value })}
                placeholder="010-1234-5678"
              />
              {errors.customerPhone && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.customerPhone}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">이메일</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={orderData.customerEmail}
                onChange={(e) => updateOrderData({ customerEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">배송 정보</h2>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={sameAsCustomer}
                  onChange={(e) => handleSameAsCustomerChange(e.target.checked)}
                />
                <span className="label-text">주문자 정보와 동일</span>
              </label>
            </div>

            {!sameAsCustomer && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">수령인 이름 *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${errors.recipientName ? 'input-error' : ''}`}
                    value={orderData.recipientName}
                    onChange={(e) => updateOrderData({ recipientName: e.target.value })}
                    placeholder="홍길동"
                  />
                  {errors.recipientName && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.recipientName}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">수령인 연락처 *</span>
                  </label>
                  <input
                    type="tel"
                    className={`input input-bordered ${errors.recipientPhone ? 'input-error' : ''}`}
                    value={orderData.recipientPhone}
                    onChange={(e) => updateOrderData({ recipientPhone: e.target.value })}
                    placeholder="010-1234-5678"
                  />
                  {errors.recipientPhone && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.recipientPhone}</span>
                    </label>
                  )}
                </div>
              </>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="form-control col-span-1">
                <label className="label">
                  <span className="label-text">우편번호 *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${errors.addressZipcode ? 'input-error' : ''}`}
                  value={orderData.addressZipcode}
                  onChange={(e) => updateOrderData({ addressZipcode: e.target.value })}
                  placeholder="12345"
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label">
                  <span className="label-text">주소 *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${errors.addressMain ? 'input-error' : ''}`}
                  value={orderData.addressMain}
                  onChange={(e) => updateOrderData({ addressMain: e.target.value })}
                  placeholder="서울시 강남구 테헤란로 123"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">상세주소</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={orderData.addressDetail}
                onChange={(e) => updateOrderData({ addressDetail: e.target.value })}
                placeholder="101동 1001호"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">배송 메모</span>
              </label>
              <select
                className="select select-bordered"
                value={orderData.deliveryMemo}
                onChange={(e) => updateOrderData({ deliveryMemo: e.target.value })}
              >
                <option value="">배송 메모를 선택해주세요</option>
                <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
                <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
                <option value="배송 전 연락주세요">배송 전 연락주세요</option>
                <option value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gift Options */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">선물 옵션</h2>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={orderData.isGift}
                  onChange={(e) => updateOrderData({ isGift: e.target.checked })}
                />
                <span className="label-text">선물 포장</span>
              </label>
            </div>

            {orderData.isGift && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">메시지 카드 문구</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={orderData.giftMessage}
                  onChange={(e) => updateOrderData({ giftMessage: e.target.value })}
                  placeholder="메시지를 입력해주세요 (선택)"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push('/order/upload')}
        >
          이전
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
        >
          다음
        </button>
      </div>
    </div>
  );
}
