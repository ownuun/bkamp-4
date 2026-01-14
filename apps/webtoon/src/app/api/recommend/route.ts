import { createClient } from '@bkamp/supabase/server';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `당신은 웹툰 전문가입니다. 사용자가 좋아하는 웹툰 목록을 기반으로 취향을 분석하고 새로운 웹툰을 추천해주세요.

응답은 반드시 다음 JSON 형식으로 해주세요 (JSON만 출력, 다른 텍스트 없이):
{
  "taste_analysis": "사용자의 웹툰 취향 분석 (2-3문장)",
  "recommendations": [
    {
      "title": "추천 웹툰 제목",
      "author": "작가명",
      "genre": ["장르1", "장르2"],
      "platform": "naver 또는 kakao 또는 kakaopage",
      "platform_url": "",
      "reason": "이 웹툰을 추천하는 이유 (1-2문장)",
      "similarity_point": "입력된 웹툰과의 공통점"
    }
  ]
}

추천 시 주의사항:
1. 실제로 존재하는 웹툰만 추천해주세요
2. 5-7개의 웹툰을 추천해주세요
3. 다양한 플랫폼의 웹툰을 골고루 추천해주세요
4. 사용자가 입력한 웹툰은 추천 목록에서 제외해주세요
5. 장르, 그림체, 스토리 전개 방식 등을 고려해서 추천해주세요
6. 반드시 유효한 JSON 형식으로만 응답해주세요`;

function extractJSON(text: string): string {
  // JSON 블록을 찾아 추출
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text;
}

export async function POST(request: Request) {
  try {
    // 인증 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { webtoons } = await request.json();

    if (!webtoons || !Array.isArray(webtoons) || webtoons.length === 0) {
      return NextResponse.json(
        { error: '웹툰 목록이 필요합니다' },
        { status: 400 }
      );
    }

    const userMessage = `내가 좋아하는 웹툰 목록: ${webtoons.join(', ')}

이 웹툰들을 바탕으로 내 취향을 분석하고, 비슷한 웹툰을 추천해주세요. JSON 형식으로만 응답해주세요.`;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI 응답이 비어있습니다');
    }

    // JSON 추출 및 파싱
    const jsonString = extractJSON(content);
    let result;

    try {
      result = JSON.parse(jsonString);
    } catch {
      console.error('JSON parsing failed. Raw content:', content);
      return NextResponse.json(
        { error: 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 추천 기록 저장
    await supabase.from('webtoon_recommendations').insert({
      user_id: user.id,
      input_webtoons: webtoons,
      recommendations: result,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: '추천을 생성하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
