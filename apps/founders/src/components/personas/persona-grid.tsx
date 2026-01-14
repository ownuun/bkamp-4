'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { PersonaCard } from './persona-card';
import { personas } from '@/lib/personas';

export function PersonaGrid() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, refreshProfile } = useAuth();

  const handleSelectPersona = async (personaId: string) => {
    if (!user) return;

    if ((profile?.credits ?? 0) < 1) {
      alert('크레딧이 부족합니다.');
      return;
    }

    setIsLoading(personaId);

    try {
      // Create a new chat session
      const { data: session, error } = await supabase
        .from('founders_sessions')
        .insert({
          user_id: user.id,
          persona_id: personaId,
          title: `${personas.find((p) => p.id === personaId)?.name}와의 대화`,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/chat/${session.id}`);
    } catch (error) {
      console.error('Failed to create chat session:', error);
      alert('대화를 시작하는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {personas.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          onSelect={handleSelectPersona}
          isLoading={isLoading === persona.id}
        />
      ))}
    </div>
  );
}
