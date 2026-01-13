"use client";

import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { Timer, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Timer className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Marathon Alert</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/favorites">
                <Heart className="h-4 w-4 mr-2" />
                관심 대회
              </Link>
            </Button>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
