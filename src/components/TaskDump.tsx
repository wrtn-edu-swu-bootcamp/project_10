'use client';

import { useState } from 'react';
import { Sparkles, Clipboard, Check, HelpCircle } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

interface TaskDumpProps {
  onProcess: (json: string) => void;
  isProcessing: boolean;
}

export default function TaskDump({ onProcess, isProcessing }: TaskDumpProps) {
  const [userInput, setUserInput] = useState('');
  const [pastedJson, setPastedJson] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { tasks, clearTasks } = useTaskStore();

  const PROMPT = `당신은 지능형 할 일 관리 전문 AI입니다. 사용자의 입력 문장에서 할 일들을 추출하고, 각 할 일의 특성에 맞춰 예상 소요 시간과 마감 기한을 분석하여 JSON 형식으로 반환하세요.

추출 및 분석 규칙:
1. title: 할 일 제목 (명명 규칙 준수 필수)
   - **명확한 행동 중심**: 무엇을 해야 하는지 즉각적으로 알 수 있도록 명확한 행동 위주로 작성하세요.
   - **명사형 어미 또는 동사 기본형**: 제목의 끝은 반드시 '명사형 어미(~기, ~함)'나 '동사 기본형'을 사용하세요.
   - **간결함**: 불필요한 수식어나 문장 성분은 생략하고 핵심 행동 위주로 간결하게 작성하세요.
   - **정보 분리**: 한 문장에 여러 행동이 포함된 경우 각각 독립된 할 일로 분리하세요.

2. duration: 예상 소요 시간 (분 단위 숫자)
   - 명시된 시간이 없다면 현실적인 시간을 예측하세요. (예: 물 마시기 5분, 환기 10분 등)

3. deadline: 마감 기한 (ISO 8601 형식)
   - 명확한 마감 기한이나 특정 시간 언급이 있는 경우에만 계산하여 입력하세요. 언급이 없는 경우 null로 설정하세요.
   - 기준 시간: ${new Date().toLocaleString('ko-KR')}

4. aiPriority: 1~10 사이의 중요도

출력 형식 (반드시 JSON으로만 응답):
{
  "tasks": [
    { "title": "할 일 제목", "duration": 10, "deadline": "ISO8601", "aiPriority": 5 }
  ]
}`;

  const handleCopyPrompt = () => {
    const textToCopy = `${userInput}\n\n---\n\n${PROMPT}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (!pastedJson.trim()) return;
    onProcess(pastedJson);
    setPastedJson('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {tasks.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={clearTasks}
            className="text-slate-400 hover:text-red-500 text-sm flex items-center gap-1 transition-colors"
          >
            목록 초기화
          </button>
        </div>
      )}

      {/* Manual Section */}
      <section className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <HelpCircle size={24} />
          <h2>사용 방법</h2>
        </div>
        
        <ol className="space-y-4 text-slate-600 text-sm sm:text-base">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">할 일을 입력하세요.</p>
              <textarea
                className="w-full mt-2 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                placeholder="예: 오늘 오후 3시에 회의하고, 저녁에 운동 가기"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={3}
              />
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</span>
            <div>
              <p className="font-semibold text-slate-900">복사하기를 누르세요.</p>
              <p className="text-slate-500 text-xs mt-1">입력한 내용과 분석 프롬프트가 함께 복사됩니다.</p>
              <button
                onClick={handleCopyPrompt}
                className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg transition-all border-2 ${
                  isCopied 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
                {isCopied ? '복사 완료!' : '복사하기'}
              </button>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</span>
            <div>
              <p className="font-semibold text-slate-900">사용하시는 AI에 붙여넣으세요.</p>
              <p className="text-slate-500 text-xs mt-1">ChatGPT, Claude, 뤼튼 등 AI에게 복사한 내용을 전달하세요.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">4</span>
            <div>
              <p className="font-semibold text-slate-900">아래에 붙여넣으세요.</p>
              <p className="text-slate-500 text-xs mt-1">AI의 JSON 답변을 아래 입력창에 붙여넣으세요.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* Paste Section */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            className="w-full h-48 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-mono text-sm text-slate-700 placeholder:text-slate-400"
            placeholder={`AI의 JSON 답변을 여기에 붙여넣으세요.
예:
{
  "tasks": [
    { "title": "회의 준비하기", ... }
  ]
}`}
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !pastedJson.trim()}
          className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
            isProcessing || !pastedJson.trim()
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'
          }`}
        >
          <Sparkles size={20} className={isProcessing ? 'animate-spin' : ''} />
          {'할 일 목록 생성하기'}
        </button>
      </div>
    </div>
  );
}
