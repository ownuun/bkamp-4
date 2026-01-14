'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatHeader } from '@/components/chat/chat-header';
import { getPersonaById, type PersonaData } from '@/lib/personas';
import type { Message, ChatSession } from '@/types';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user) return;

      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from('founders_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !sessionData) {
        router.push('/personas');
        return;
      }

      setSession(sessionData as ChatSession);

      // Get persona data
      const personaData = getPersonaById(sessionData.persona_id);
      if (personaData) {
        setPersona(personaData);
      }

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('founders_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      setMessages((messagesData as Message[]) || []);
      setIsLoading(false);
    };

    fetchSessionData();
  }, [sessionId, user, router, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !persona) {
    return null;
  }

  return (
    <div>
      <ChatHeader persona={persona} />
      <div className="mt-4">
        <ChatContainer
          sessionId={sessionId}
          persona={persona}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
