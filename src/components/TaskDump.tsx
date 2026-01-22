'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

interface TaskDumpProps {
  onProcess: (text: string) => void;
  isProcessing: boolean;
}

export default function TaskDump({ onProcess, isProcessing }: TaskDumpProps) {
  const [text, setText] = useState('');
  const [additionalText, setAdditionalText] = useState('');
  const { originalText } = useTaskStore();
  const MAX_LENGTH = 2000;

  const handleSubmit = () => {
    if (!text.trim() || text.length > MAX_LENGTH) return;
    onProcess(text);
    setText('');
  };

  const handleAdditionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalText.trim()) return;
    onProcess(additionalText);
    setAdditionalText('');
  };

  if (originalText) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm relative">
          <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
            {originalText}
          </div>
          <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles size={12} /> 작성한 내용
          </div>
        </div>

        <form onSubmit={handleAdditionalSubmit} className="relative group">
          <input
            type="text"
            className="w-full p-4 pl-5 pr-12 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-slate-700 placeholder:text-slate-400"
            placeholder="추가로 할 일을 입력하세요."
            value={additionalText}
            onChange={(e) => setAdditionalText(e.target.value)}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !additionalText.trim()}
            className={`absolute right-2 top-2 bottom-2 px-3 rounded-lg flex items-center justify-center transition-all ${
              additionalText.trim() && !isProcessing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            {isProcessing ? (
              <Sparkles size={18} className="animate-spin" />
            ) : (
              <Plus size={20} />
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <textarea
          className="w-full h-40 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none text-slate-700 placeholder:text-slate-400"
          placeholder="오늘 할 일들을 마음껏 적어보세요. 
예: 오후 3시 회의 준비하기, 매일 30분 운동하기, 주말에 마트 장보기..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          disabled={isProcessing}
          maxLength={MAX_LENGTH}
        />
        <div className={`absolute bottom-4 right-4 text-xs ${text.length >= MAX_LENGTH ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
          {text.length} / {MAX_LENGTH}자 (최대 {MAX_LENGTH}자)
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isProcessing || !text.trim() || text.length > MAX_LENGTH}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
          isProcessing || !text.trim() || text.length > MAX_LENGTH
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'
        }`}
      >
        <Sparkles size={20} className={isProcessing ? 'animate-spin' : ''} />
        {isProcessing ? 'AI가 분석 중...' : '정리하기'}
      </button>
    </div>
  );
}
