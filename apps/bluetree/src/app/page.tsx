'use client';

import Link from 'next/link';
import { Card, Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl text-primary-dark mb-4">Bluetree Foundation</h1>
        <p className="text-xl text-primary-dark/70">
          함께 걸으며 치유하는 커뮤니티
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-2xl text-primary-dark mb-3">사연 게시판</h2>
            <p className="text-primary-dark/70 mb-4">
              익명으로 자신의 이야기를 나눠보세요.
              당신의 이야기에 귀 기울이는 사람들이 있습니다.
            </p>
            <Link href="/stories">
              <Button>사연 보러가기</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-2xl text-primary-dark mb-3">걷기 모임</h2>
            <p className="text-primary-dark/70 mb-4">
              함께 걸으며 마음을 나눠보세요.
              걷는 것만으로도 마음이 가벼워질 수 있어요.
            </p>
            <Link href="/walks">
              <Button>모임 보러가기</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
