'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, MessageSquare, TrendingDown, Gift, User, Mail, Calendar } from 'lucide-react';
import type { CreditTransaction, ChatSession } from '@/types';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [transactionsRes, sessionsRes] = await Promise.all([
        supabase
          .from('founders_credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('founders_sessions')
          .select('id')
          .eq('user_id', user.id),
      ]);

      setTransactions((transactionsRes.data as CreditTransaction[]) || []);
      setSessionCount(sessionsRes.data?.length || 0);
    };

    fetchData();
  }, [user, supabase]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'initial':
        return <Gift className="h-4 w-4 text-green-500" />;
      case 'usage':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'bonus':
        return <Coins className="h-4 w-4 text-yellow-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">프로필</h1>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            내 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{profile?.username || '사용자'}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            가입일:{' '}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('ko-KR')
              : '-'}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile?.credits ?? 0}</p>
              <p className="text-sm text-muted-foreground">남은 크레딧</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sessionCount}</p>
              <p className="text-sm text-muted-foreground">대화 수</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5" />
            크레딧 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              아직 크레딧 내역이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium ${
                      tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">로그아웃</p>
              <p className="text-sm text-muted-foreground">
                다른 계정으로 로그인하려면 로그아웃하세요
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
