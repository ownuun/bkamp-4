'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TrackPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderNumber.trim()) {
      setError('주문번호를 입력해주세요.');
      return;
    }

    // Validate order number format (FB + date + random)
    if (!/^FB\d{8}[A-Z0-9]{4}$/.test(orderNumber.toUpperCase())) {
      setError('올바른 주문번호 형식이 아닙니다.');
      return;
    }

    router.push(`/track/${orderNumber.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-5xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold mb-4">주문 조회</h1>
          <p className="opacity-70 mb-8">
            주문번호를 입력하여 주문 현황을 확인하세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <input
                type="text"
                className={`input input-bordered input-lg w-full text-center font-mono ${
                  error ? 'input-error' : ''
                }`}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="FB20240101XXXX"
                maxLength={16}
              />
              {error && (
                <label className="label">
                  <span className="label-text-alt text-error">{error}</span>
                </label>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              조회하기
            </button>
          </form>

          <div className="mt-8 text-sm opacity-70">
            <p>주문번호는 주문 완료 시 안내받으신 번호입니다.</p>
            <p>예: FB20240101ABCD</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
