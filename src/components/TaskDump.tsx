'use client';

import { useState } from 'react';
import { Sparkles, Clipboard, Check, HelpCircle, RotateCcw } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

import { getTaskExtractionPrompt } from '@/prompts/taskExtraction';

interface TaskDumpProps {
  onProcess: (json: string) => void;
  isProcessing: boolean;
}

export default function TaskDump({ onProcess, isProcessing }: TaskDumpProps) {
  const { tasks, originalText, setOriginalText } = useTaskStore();
  const MAX_LENGTH = 1000;
  const [pastedJson, setPastedJson] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const hasTasks = tasks.length > 0;

  const handleCopyPrompt = () => {
    const prompt = getTaskExtractionPrompt(tasks);
    const textToCopy = `${originalText}\n\n---\n\n${prompt}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (json?: string) => {
    const targetJson = json || pastedJson;
    if (!targetJson.trim()) return;
    
    try {
      await onProcess(targetJson);
      setPastedJson('');
      if (json) {
        setAutoDetected(true);
        setTimeout(() => setAutoDetected(false), 3000);
      }
    } catch (error) {
      // 에러는 onProcess 내부에서 처리됨
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    // JSON 구조가 포함되어 있는지 더 유연하게 확인
    const hasJsonStructure = /["']tasks["']\s*:/i.test(pastedText) || (pastedText.includes('{') && pastedText.includes('}'));
    
    if (hasJsonStructure) {
      e.preventDefault(); // 자동 추출 시 텍스트가 남지 않도록 기본 붙여넣기 방지
      handleSubmit(pastedText);
    }
  };

  const handleClearInput = () => {
    if (confirm('입력한 내용을 모두 지우시겠습니까?')) {
      setOriginalText('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Task Input & Copy Section */}
      <section className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between select-none cursor-default">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">1</div>
            <Sparkles size={24} className="text-blue-600" />
            <h2>{hasTasks ? '할 일 이어서 적기' : '할 일 적기'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {originalText && (
              <button
                onClick={handleClearInput}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                title="내용 지우기"
              >
                <RotateCcw size={20} />
              </button>
            )}
            <button
              onClick={handleCopyPrompt}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                isCopied 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-md'
              }`}
            >
              {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
              {isCopied ? '복사 완료!' : (hasTasks ? '추가 분석용 프롬프트 복사' : '분석용 프롬프트 복사')}
            </button>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder={hasTasks 
              ? "추가로 생각난 할 일들을 여기에 적어보세요." 
              : "여기에 생각난 할 일들을 자유롭게 적어보세요.\n예) 내일 오전 10시에 치과 가기, 보고서 작성 2시간 걸릴듯, 이번주 금요일까지 기획안 제출"
            }
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value.slice(0, MAX_LENGTH))}
            rows={5}
            maxLength={MAX_LENGTH}
          />
          <div className="absolute bottom-3 right-3 text-[10px] font-medium text-slate-400 select-none cursor-default">
            {originalText.length} / {MAX_LENGTH}
          </div>
        </div>
        <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-xl text-blue-700 text-xs leading-relaxed select-none cursor-default">
          <HelpCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            {hasTasks ? (
              <>
                내용을 적고 <strong>'추가 분석용 프롬프트 복사'</strong> 버튼을 누른 후 AI(ChatGPT, 뤼튼 등)에게 물어보세요.
              </>
            ) : (
              <>
                <strong>'분석용 프롬프트 복사'</strong> 버튼을 누른 후 AI(ChatGPT, 뤼튼 등)에게 물어보세요.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Paste Section */}
      <section className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between select-none cursor-default">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">2</div>
            <Check size={24} className="text-blue-600" />
            <h2>{hasTasks ? '새로운 AI 답변 붙여넣기' : 'AI 답변 붙여넣기'}</h2>
          </div>
          {autoDetected && (
            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
              <Check size={14} />
              자동 추출 완료!
            </div>
          )}
        </div>
        <div className="relative">
          <textarea
            className={`w-full h-32 p-4 bg-slate-50 border-2 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-100 outline-none font-mono text-sm text-slate-700 placeholder:text-slate-400 ${
              autoDetected ? 'border-green-400 bg-green-50/30' : 'border-slate-100 focus:border-blue-500'
            }`}
            placeholder={hasTasks 
              ? "AI가 새로 분석해준 답변을 여기에 붙여넣으세요." 
              : "AI가 준 답변을 통째로 여기에 붙여넣으세요.\n자동으로 할 일이 추출됩니다."
            }
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
            onPaste={handlePaste}
            disabled={isProcessing}
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Sparkles size={20} />
                처리 중...
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSubmit()}
            disabled={isProcessing || !pastedJson.trim()}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
              isProcessing || !pastedJson.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
            }`}
          >
            <Sparkles size={20} />
            {pastedJson.trim() ? '할 일 목록 업데이트하기' : '답변을 기다리는 중...'}
          </button>
          
          <p className="text-center text-slate-400 text-[11px] select-none cursor-default">
            * 답변을 붙여넣으면 자동으로 분석되지만, 감지가 안 될 경우 위 버튼을 눌러주세요.
          </p>
        </div>
      </section>
    </div>
  );
}
