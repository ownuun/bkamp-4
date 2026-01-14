'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@bkamp/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-xl gap-2">
          <img src="/logo.png" alt="Flipbook" className="h-8 w-8" />
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
        {!loading && (
          user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-neutral text-neutral-content w-8 rounded-full">
                  <span className="text-xs">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li className="menu-title">
                  <span className="truncate">{user.email}</span>
                </li>
                <li><button onClick={handleLogout}>로그아웃</button></li>
              </ul>
            </div>
          ) : (
            <Link href="/login" className="btn btn-ghost btn-sm">
              로그인
            </Link>
          )
        )}
      </div>
    </header>
  );
}
