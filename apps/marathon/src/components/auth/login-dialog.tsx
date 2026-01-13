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
import { signInWithOAuth, type OAuthProvider } from "@/lib/auth";
import { LogIn, Loader2 } from "lucide-react";

interface LoginDialogProps {
  children?: React.ReactNode;
}

export function LoginDialog({ children }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  const handleLogin = async (provider: OAuthProvider) => {
    setLoading(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      console.error("Login error:", error);
      setLoading(null);
    }
    // Redirect happens automatically on success
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

          <Button
            className="w-full h-12 text-base bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919]"
            onClick={() => handleLogin("kakao")}
            disabled={loading !== null}
          >
            {loading === "kakao" ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.042 5.895l-.99 3.675c-.07.26.2.47.435.34l4.326-2.867c.706.095 1.432.157 2.187.157 5.523 0 10-3.477 10-7.7S17.523 3 12 3z"
                />
              </svg>
            )}
            카카오로 계속하기
          </Button>
        </div>

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
