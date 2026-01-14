import Groq from 'groq-sdk';
import { ToneType } from '@/types';
import { buildPrompt } from './prompts';

// Lazy initialization to avoid build-time errors
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export async function generateNagging(
  tone: ToneType,
  goalTitle: string,
  goalDescription: string | null,
  userName: string,
  situation?: string | null
): Promise<string> {
  const prompt = buildPrompt(tone, goalTitle, goalDescription, userName, situation);

  try {
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // 빠르고 무료
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: '잔소리 생성' },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content?.trim() || '오늘도 화이팅!';
  } catch (error) {
    console.error('Groq API error:', error);
    // 폴백 메시지
    const fallbacks: Record<ToneType, string> = {
      friend: '야~ 오늘도 파이팅해! ㅋㅋ',
      mom: '우리 아들~ 오늘도 힘내!',
      teacher: '오늘도 최선을 다해봅시다.',
      coach: '당신은 할 수 있습니다! 지금 시작하세요!',
      tsundere: '별로 신경 안 쓰는데... 그래도 해.',
      cold: '핑계 대지 마. 그냥 해.',
    };
    return fallbacks[tone];
  }
}

export { getGroqClient as openai };
