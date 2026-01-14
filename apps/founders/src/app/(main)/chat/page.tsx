'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPersonaById } from '@/lib/personas';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import type { ChatSession } from '@/types';

export default function ChatListPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchSessions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('founders_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    setSessions((data as ChatSession[]) || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('이 대화를 삭제하시겠습니까?')) return;

    await supabase.from('founders_sessions').delete().eq('id', sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대화 내역</h1>
          <p className="text-muted-foreground">이전 대화를 이어가세요</p>
        </div>
        <Link href="/personas">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 대화
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">아직 대화 내역이 없습니다</p>
          <Link href="/personas">
            <Button>첫 대화 시작하기</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const persona = getPersonaById(session.persona_id as any);
            return (
              <Link key={session.id} href={`/chat/${session.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: persona ? `${persona.color}20` : undefined }}
                      >
                        {persona?.emoji || '💬'}
                      </div>
                      <div>
                        <p className="font-medium">
                          {session.title || persona?.name || '대화'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.updated_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(session.id, e)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
