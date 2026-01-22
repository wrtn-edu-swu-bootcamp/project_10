import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
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

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `당신은 지능형 할 일 관리 전문 AI입니다. 사용자의 입력 문장에서 할 일들을 추출하고, 각 할 일의 특성에 맞춰 예상 소요 시간과 마감 기한을 현실적으로 측정하여 JSON 형식으로 반환하세요.

추출 및 분석 규칙:
1. title: 할 일 제목
   - 사용자의 의도를 파악하여 간결하고 명확하게 요약하여 정리하세요.
   - **중요**: 제목에 "오늘까지", "3시까지", "내일" 등 마감 기한과 관련된 정보는 포함하지 마세요. (이미 deadline 필드에 별도로 저장되므로 중복 표시할 필요가 없습니다.)
   - 예: "오후 3시까지 보고서 작성하기" -> "보고서 작성하기"
2. duration: 해당 작업을 완료하는 데 필요한 현실적인 예상 소요 시간 (분 단위 숫자)
   - 아래의 '소요 시간 가이드'를 참고하여 매우 구체적이고 현실적으로 책정하세요.
   - 단순 나열된 작업이라도 준비 시간, 마무리 시간, 이동 시간 등을 포함한 '실제 체감 시간'을 반영하세요.
   - 구체적인 시간 언급이 있다면 그 시간을 우선 적용 (예: "1시간 동안 운동" -> 60)

3. deadline: 마감 기한 (ISO 8601 형식)
   - 사용자가 "내일까지", "오늘 오후 3시", "금요일" 등 기한을 언급했다면 이를 현재 시간(${new Date().toLocaleString('ko-KR')}) 기준으로 정확히 계산하여 ISO 8601 형식(예: 2026-01-22T15:00:00Z)으로 변환하세요.
   - **중요**: 다음의 상대적 시간 표현은 "오늘"을 기준으로 특정 시각을 할당하세요:
     - "아침": 오전 9시 (09:00)
     - "점심", "낮": 오후 12시 (12:00)
     - "오후": 오후 3시 (15:00)
     - "저녁": 오후 6시 (18:00)
     - "밤": 오후 9시 (21:00)
     - "밥 먹고", "식사 후": 현재 시간에서 가장 가까운 다음 식사 시간(13:00 또는 19:00)
   - 명시적인 마감 기한이 없으면 null을 반환하세요.
   - **중요**: 사용자가 입력한 마감 기한 정보는 절대로 누락하지 마세요.
4. aiPriority: 1~10 사이의 중요도
   - 마감 기한이 임박할수록(예: 오늘 내 마감) 높은 점수(8-10)를 부여하세요.
   - 작업의 가치, 소요 시간 대비 효율 등을 종합적으로 고려하세요.
   - 마감 기한이 있는 작업은 기한이 없는 작업보다 대체로 높은 우선순위를 갖습니다.
5. filtering: 할 일이 아닌 단순한 인사, 날씨 이야기, 감상 등은 리스트에서 제외하세요. 오직 '수행해야 할 작업'만 추출합니다.

소요 시간 가이드 (참고용):
- 아주 짧은 루틴 (물 마시기, 스트레칭, 영양제, 안부 인사): 5~10분
- 간단한 정리/정돈 (스크린샷 정리, 이메일 처리, 가방 정리, 책상 닦기, 핸드폰 정리): 15~25분
- 행정/확인 작업 (자동이체 확인, 비밀번호 변경, 공과금 확인, 예약하기, 예산 짜기): 15~30분
- 외부 활동/이동 포함 (편의점 구매, 산책, 분리수거, 우체국/은행): 20~40분
- 창의적/기획 작업 (여행 계획, 일정 블록 잡기, 기획안 작성): 30~60분
- 가사 노동 (빨래 널기, 침구 정리, 냉장고 점검, 저녁 메뉴 결정): 15~30분
- 정보 습득/독서 (책 읽기, 기사 읽기, 뉴스레터): 20~40분
- 파일/데이터 정리 (파일명 규칙 통일, 백업 확인, 클라우드 저장): 30~60분

입력 문장: ${inputText}

출력 형식:
{
  "tasks": [
    { "title": "작업명", "duration": 45, "deadline": "2026-01-22T15:00:00Z", "aiPriority": 9 }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    if (responseText.includes('```')) {
      responseText = responseText.replace(/```json|```/g, '').trim();
    }

    return NextResponse.json(JSON.parse(responseText || '{"tasks": []}'));
  } catch (error: any) {
    console.error('AI Analysis Error:', error);

    // API 키가 잘못되었거나, 할당량 초과(429) 등 에러 발생 시 로컬 분석 로직으로 폴백
    try {
      const textToProcess = inputText || '';
      const lines = textToProcess.split(/[,\n.]/)
        .map((s: string) => s.trim())
        .filter((s: string) => {
          // 2글자 미만이거나 단순 인삿말, 감상 등은 제외
          if (s.length < 2) return false;
          const nonTaskKeywords = ['안녕', '하세요', '반가워', '날씨', '좋다', '나쁘다', '졸립다', '배고파'];
          if (nonTaskKeywords.some(keyword => s.includes(keyword)) && !s.includes('기') && !s.includes('함')) {
            // '하기', '사기', '정리함' 등 할 일을 나타내는 어미가 없으면 제외
            return false;
          }
          return true;
        });
      
      const fallbackTasks = lines.map((line: string) => {
        let duration = 20; // 기본값을 15에서 20으로 상향 (사용자 가이드 반영)
        let deadline: string | null = null;
        const lowerLine = line.toLowerCase();
        
        // 제공된 50개 할일 데이터를 기반으로 소요 시간 추정 개선
        if (lowerLine.includes('물') || lowerLine.includes('스트레칭') || lowerLine.includes('영양제') || lowerLine.includes('인사') || lowerLine.includes('안부')) duration = 10;
        else if (lowerLine.includes('스크린샷') || lowerLine.includes('정리') || lowerLine.includes('메일') || lowerLine.includes('닦기') || lowerLine.includes('가방')) duration = 20;
        else if (lowerLine.includes('비밀번호') || lowerLine.includes('변경') || lowerLine.includes('확인') || lowerLine.includes('예약') || lowerLine.includes('납부') || lowerLine.includes('충전')) duration = 25;
        else if (lowerLine.includes('구매') || lowerLine.includes('사기') || lowerLine.includes('산책') || lowerLine.includes('분리수거') || lowerLine.includes('마트') || lowerLine.includes('편의점')) duration = 30;
        else if (lowerLine.includes('계획') || lowerLine.includes('예산') || lowerLine.includes('블록') || lowerLine.includes('작성') || lowerLine.includes('공부')) duration = 45;
        else if (lowerLine.includes('빨래') || lowerLine.includes('침구') || lowerLine.includes('청소') || lowerLine.includes('정돈')) duration = 30;
        else if (lowerLine.includes('읽기') || lowerLine.includes('독서') || lowerLine.includes('기사')) duration = 30;
        else if (lowerLine.includes('백업') || lowerLine.includes('저장') || lowerLine.includes('파일') || lowerLine.includes('규칙')) duration = 40;
        else if (lowerLine.includes('운동') || lowerLine.includes('헬스')) duration = 60;
        else if (lowerLine.includes('미팅') || lowerLine.includes('회의')) duration = 45;

        const now = new Date();
        let cleanedTitle = line;
        
        // 제목에서 시간/마감 관련 키워드 제거 (요약 및 중복 방지)
        const timeKeywords = [
          '오늘까지', '내일까지', '오늘', '내일', '오후', '오전', '아침', '점심', '저녁', '밤', 
          '시까지', '분까지', '시', '분', '까지', '식사 후', '밥 먹고'
        ];
        
        timeKeywords.forEach(keyword => {
          // 키워드와 주변 공백 제거
          const regex = new RegExp(`\\s*${keyword}\\s*`, 'g');
          cleanedTitle = cleanedTitle.replace(regex, ' ').trim();
        });

        if (lowerLine.includes('오늘') || lowerLine.includes('아침') || lowerLine.includes('점심') || lowerLine.includes('저녁') || lowerLine.includes('밥')) {
          let hour = 23;
          let minute = 59;
          
          if (lowerLine.includes('아침')) hour = 9;
          else if (lowerLine.includes('점심')) hour = 12;
          else if (lowerLine.includes('저녁')) hour = 18;
          else if (lowerLine.includes('오후')) hour = 15;
          else if (lowerLine.includes('밤')) hour = 21;
          
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
          deadline = today.toISOString();
        } else if (lowerLine.includes('내일')) {
          const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);
          deadline = tomorrow.toISOString();
        }
        
        return {
          title: cleanedTitle || line,
          duration,
          deadline,
          aiPriority: deadline ? 8 : 5
        };
      });

      return NextResponse.json({ 
        tasks: fallbackTasks,
        isFallback: true,
        message: 'AI 분석 중 오류가 발생하여 기본 모드로 전환되었습니다.'
      });
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
    }
  }
}
