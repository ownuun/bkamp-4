import { getGroqClient, PERSONA_PROMPTS } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const groq = getGroqClient();
    const { sessionId, message, personaId } = await request.json();

    if (!sessionId || !message || !personaId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || profile.credits < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get previous messages for context (last 10 messages)
    const { data: previousMessages } = await supabase
      .from('founders_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    const systemPrompt = PERSONA_PROMPTS[personaId] || PERSONA_PROMPTS['elon'];

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...(previousMessages?.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })) || []),
      { role: 'user', content: message },
    ];

    // Save user message
    await supabase.from('founders_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
    });

    // Create streaming response
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Stream the response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          fullResponse += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }

        // Save assistant message and deduct credit
        await Promise.all([
          supabase.from('founders_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: fullResponse,
          }),
          supabase
            .from('profiles')
            .update({ credits: profile.credits - 1 })
            .eq('id', user.id),
          supabase.from('founders_credit_transactions').insert({
            user_id: user.id,
            amount: -1,
            type: 'usage',
            description: '대화 1회 사용',
          }),
          supabase
            .from('founders_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId),
        ]);

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
