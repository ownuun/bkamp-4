'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Header() {
  return (
    <header className="py-4 px-6 border-b-2 border-primary-dark/20">
      <nav className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl text-primary-dark">
          <span>Bluetree</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/stories">
            <Button>사연 게시판</Button>
          </Link>
          <Link href="/walks">
            <Button>걷기 모임</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
