"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithOAuth, signInWithPassword, signUp, type OAuthProvider } from "@/lib/auth";
import { LogIn, Loader2, Mail, Lock, User } from "lucide-react";

interface LoginDialogProps {
  children?: React.ReactNode;
}

export function LoginDialog({ children }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (provider: OAuthProvider) => {
    setLoading(provider);
    setError(null);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      console.error("Login error:", error);
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
      setLoading(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError(null);

    if (isSignupMode) {
      if (password.length < 6) {
        setError("비밀번호는 최소 6자 이상이어야 합니다.");
        setIsEmailLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username);
      if (error) {
        setError(error.message === "User already registered"
          ? "이미 등록된 이메일입니다."
          : error.message);
        setIsEmailLoading(false);
        return;
      }
      setOpen(false);
      window.location.reload();
    } else {
      const { error } = await signInWithPassword(email, password);
      if (error) {
        setError(error.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : error.message);
        setIsEmailLoading(false);
        return;
      }
      setOpen(false);
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            로그인
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            소셜 계정으로 간편하게 로그인하세요.
            <br />
            관심 대회 저장과 알림 설정이 가능해집니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleLogin("google")}
            disabled={loading !== null}
          >
            {loading === "google" ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google로 계속하기
          </Button>

        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {isSignupMode && (
            <div className="space-y-2">
              <Label htmlFor="username">닉네임</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="닉네임을 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required={isSignupMode}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={isSignupMode ? "최소 6자 이상" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={isSignupMode ? 6 : undefined}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading !== null || isEmailLoading}
          >
            {isEmailLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignupMode ? "가입 중..." : "로그인 중..."}
              </>
            ) : (
              isSignupMode ? "회원가입" : "로그인"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isSignupMode ? "이미 계정이 있으신가요? " : "계정이 없으신가요? "}
          <button
            type="button"
            onClick={() => {
              setIsSignupMode(!isSignupMode);
              setError(null);
            }}
            className="text-primary hover:underline"
          >
            {isSignupMode ? "로그인" : "회원가입"}
          </button>
        </p>

        <p className="text-xs text-muted-foreground text-center mt-4">
          로그인 시{" "}
          <a href="#" className="underline">
            이용약관
          </a>{" "}
          및{" "}
          <a href="#" className="underline">
            개인정보처리방침
          </a>
          에 동의하게 됩니다.
        </p>
      </DialogContent>
    </Dialog>
  );
}
