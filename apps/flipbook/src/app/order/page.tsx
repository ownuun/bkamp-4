import Link from 'next/link';

export default function OrderStart() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">플립북 주문하기</h1>
      <p className="text-lg opacity-70 mb-8">
        아래 단계를 따라 주문을 완료해주세요
      </p>

      {/* Steps */}
      <ul className="steps steps-vertical lg:steps-horizontal w-full mb-12">
        <li className="step step-primary">영상 업로드</li>
        <li className="step">정보 입력</li>
        <li className="step">주문 확인</li>
        <li className="step">완료</li>
      </ul>

      {/* Info cards */}
      <div className="grid gap-4 mb-8 text-left">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">준비물</h3>
            <ul className="text-sm opacity-70 list-disc list-inside">
              <li>포토부스 영상 파일 (MP4, MOV, WebM)</li>
              <li>영상 길이: 3~10초</li>
              <li>최대 파일 크기: 100MB</li>
            </ul>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">배송 안내</h3>
            <ul className="text-sm opacity-70 list-disc list-inside">
              <li>제작 기간: 영업일 기준 3~5일</li>
              <li>배송 기간: 영업일 기준 1~2일</li>
              <li>전국 택배 배송</li>
            </ul>
          </div>
        </div>
      </div>

      <Link href="/order/upload" className="btn btn-primary btn-lg w-full">
        시작하기
      </Link>
    </div>
  );
}
