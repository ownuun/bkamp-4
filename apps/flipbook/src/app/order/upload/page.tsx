'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';

export default function UploadPage() {
  const router = useRouter();
  const { orderData, updateOrderData } = useOrder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file: File) => {
    setError('');

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('MP4, MOV, WebM 형식만 지원합니다.');
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('파일 크기는 100MB 이하여야 합니다.');
      return;
    }

    // Create preview URL
    const videoUrl = URL.createObjectURL(file);
    updateOrderData({ videoFile: file, videoUrl });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleNext = () => {
    if (!orderData.videoFile) {
      setError('영상을 업로드해주세요.');
      return;
    }
    router.push('/order/info');
  };

  return (
    <div>
      {/* Steps */}
      <ul className="steps steps-horizontal w-full mb-8">
        <li className="step step-primary">영상 업로드</li>
        <li className="step">정보 입력</li>
        <li className="step">주문 확인</li>
        <li className="step">완료</li>
      </ul>

      <h1 className="text-2xl font-bold mb-6">영상 업로드</h1>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleFileChange}
          className="hidden"
        />

        {orderData.videoUrl ? (
          <div>
            <video
              src={orderData.videoUrl}
              className="max-h-64 mx-auto rounded-lg mb-4"
              controls
            />
            <p className="text-sm opacity-70">
              {orderData.videoFile?.name}
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-2"
              onClick={(e) => {
                e.stopPropagation();
                updateOrderData({ videoFile: null, videoUrl: '' });
              }}
            >
              다른 영상 선택
            </button>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-4">🎬</div>
            <p className="font-medium mb-2">
              영상을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-sm opacity-70">
              MP4, MOV, WebM / 최대 100MB / 3~10초
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push('/order')}
        >
          이전
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!orderData.videoFile}
        >
          다음
        </button>
      </div>
    </div>
  );
}
