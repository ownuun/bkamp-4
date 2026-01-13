'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-xl">
          Flipbook
        </Link>
      </div>
      <div className="navbar-end gap-2">
        <Link href="/track" className="btn btn-ghost btn-sm">
          주문조회
        </Link>
        <Link href="/order" className="btn btn-primary btn-sm">
          주문하기
        </Link>
      </div>
    </header>
  );
}
