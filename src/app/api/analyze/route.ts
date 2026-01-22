import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let inputText = '';
  try {
    const body = await req.json();
    inputText = body.text;

    if (!inputText || inputText.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (inputText.length > 2000) {
      return NextResponse.json({ error: 'Text is too long (max 2000 characters)' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `당신은 지능형 할 일 관리 전문 AI입니다. 사용자의 입력 문장에서 할 일들을 추출하고, 각 할 일의 특성에 맞춰 예상 소요 시간과 마감 기한을 분석하여 JSON 형식으로 반환하세요.

추출 및 분석 규칙:
1. title: 할 일 제목 (명명 규칙 준수 필수)
   - **명확한 행동 중심**: 무엇을 해야 하는지 즉각적으로 알 수 있도록 명확한 행동 위주로 작성하세요.
   - **명사형 어미 또는 동사 기본형**: 제목의 끝은 반드시 '명사형 어미(~기, ~함)'나 '동사 기본형'을 사용하세요. (예: 마시기, 하기, 정리하기, 쓸기, 분류하기)
   - **간결함**: 불필요한 수식어나 문장 성분(조사, 수식어 등)은 생략하고 핵심 행동 위주로 간결하게 작성하세요.
   - **정보 분리**: 한 문장에 여러 행동이 포함된 경우(예: "물 마시고 스트레칭 하기") 각각 독립된 할 일로 분리하세요.

2. duration: 예상 소요 시간 (분 단위 숫자)
   - 문장에 명시된 시간(예: "5분만", "10분 동안")이 있다면 해당 시간을 숫자로 추출하세요.
   - 명시된 시간이 없다면 작업의 성격에 따라 현실적인 시간을 예측하세요. (예: 물 마시기 5분, 환기 10분 등)
   - 여러 할 일이 묶여 있고 시간이 하나만 명시된 경우, 해당 시간 내에 모든 작업이 포함되는지 혹은 각 작업에 적용되는지 판단하여 배분하세요.

3. deadline: 마감 기한 (ISO 8601 형식)
   - 사용자가 명확하게 마감 기한이나 특정 시간(예: "저녁 전", "3시까지")을 언급한 경우에만 계산하여 입력하세요.
   - **언급이 없는 경우 반드시 null로 설정하세요.**
   - 기준 시간: ${new Date().toLocaleString('ko-KR')}

4. aiPriority: 1~10 사이의 중요도

출력 형식 (반드시 JSON으로만 응답):
{
  "tasks": [
    { 
      "title": "물 한 컵 마시기", 
      "duration": 5, 
      "deadline": null, 
      "aiPriority": 5 
    },
    { 
      "title": "스트레칭 하기", 
      "duration": 5, 
      "deadline": null, 
      "aiPriority": 5 
    }
  ]
}

입력 문장: ${inputText}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    if (responseText.includes('```')) {
      responseText = responseText.replace(/```json|```/g, '').trim();
    }
    return NextResponse.json(JSON.parse(responseText || '{"tasks": []}'));

  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze text',
      details: error.message 
    }, { status: 500 });
  }
}
