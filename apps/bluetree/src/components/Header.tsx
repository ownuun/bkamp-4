'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@bkamp/supabase/client';
import type { User } from '@bkamp/supabase';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="py-4 px-6 border-b-2 border-primary-dark/20">
      <nav className="container flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl text-primary-dark"
        >
          <img src="/logo.png" alt="Bluetree" className="h-8 w-8" />
          <span>Bluetree</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/stories">
            <button className="sketch-btn">사연 게시판</button>
          </Link>
          <Link href="/walks">
            <button className="sketch-btn">걷기 모임</button>
          </Link>
          {!loading && (
            <>
              {user ? (
                <button className="sketch-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              ) : (
                <Link href="/login">
                  <button className="sketch-btn">로그인</button>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
