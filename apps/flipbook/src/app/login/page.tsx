'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@bkamp/supabase/client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google') => {
    if (isLoading) return;
    setIsLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('Google 로그인에 실패했습니다.');
      setIsLoading(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError(null);
    const supabase = createClient();

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
    <main className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <div className="text-center mb-4">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Flipbook" className="h-16 w-16 mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Flipbook</h1>
            </Link>
            <p className="text-base-content/60 mt-1">로그인하고 시작하세요</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading !== null || isEmailLoading}
              className="btn btn-outline w-full gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isLoading === 'google' ? '로그인 중...' : 'Google로 계속하기'}
            </button>

          </div>

          <div className="divider">또는</div>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignupMode && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">닉네임</span>
                </label>
                <input
                  type="text"
                  placeholder="닉네임을 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered w-full"
                  required={isSignupMode}
                />
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text">이메일</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">비밀번호</span>
              </label>
              <input
                type="password"
                placeholder={isSignupMode ? '최소 6자 이상' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading !== null || isEmailLoading}
              className="btn btn-primary w-full"
            >
              {isEmailLoading
                ? (isSignupMode ? '가입 중...' : '로그인 중...')
                : (isSignupMode ? '회원가입' : '로그인')}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-4">
            {isSignupMode ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
            <button
              type="button"
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setError(null);
              }}
              className="link link-primary"
            >
              {isSignupMode ? '로그인' : '회원가입'}
            </button>
          </p>

          <div className="text-center mt-4">
            <Link href="/" className="link link-hover text-sm">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
