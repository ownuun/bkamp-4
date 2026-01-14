'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@bkamp/supabase/client';

export default function LoginPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSocialLogin = async (provider: 'google') => {
    if (isLoading) return;
    setIsLoading(provider);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('Login error:', error);
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError(null);

    if (isSignupMode) {
      if (password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        setIsEmailLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) {
        setError(error.message === 'User already registered'
          ? '이미 등록된 이메일입니다.'
          : error.message);
        setIsEmailLoading(false);
        return;
      }
      window.location.href = '/';
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : error.message);
        setIsEmailLoading(false);
        return;
      }
      window.location.href = '/';
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Jansori" className="h-20 w-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text">Jansori</h1>
          </Link>
          <p className="text-muted mt-2">로그인하고 잔소리 시작하기</p>
        </div>

        {/* Login Card */}
        <div className="border-2 border-black rounded-xl bg-surface p-8 space-y-4">
          {/* Google Login */}
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-text">
              {isLoading === 'google' ? '로그인 중...' : 'Google로 계속하기'}
            </span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted">또는</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600 mb-4">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignupMode && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">닉네임</label>
                <input
                  type="text"
                  placeholder="닉네임을 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isSignupMode}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-black"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text mb-1">이메일</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">비밀번호</label>
              <input
                type="password"
                placeholder={isSignupMode ? '최소 6자 이상' : '비밀번호'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-black"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading !== null || isEmailLoading}
              className="w-full px-4 py-3 border-2 border-black rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isEmailLoading
                ? (isSignupMode ? '가입 중...' : '로그인 중...')
                : (isSignupMode ? '회원가입' : '로그인')}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-4">
            {isSignupMode ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
            <button
              type="button"
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setError(null);
              }}
              className="text-text underline hover:text-black"
            >
              {isSignupMode ? '로그인' : '회원가입'}
            </button>
          </p>

          <div className="mt-6 text-center text-sm text-muted">
            <p>
              로그인하면{' '}
              <a href="#" className="underline">
                서비스 약관
              </a>
              과{' '}
              <a href="#" className="underline">
                개인정보처리방침
              </a>
              에 동의하게 됩니다.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-muted hover:text-text underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
