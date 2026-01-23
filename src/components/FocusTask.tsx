'use client';

import { useTaskStore } from '@/store/useTaskStore';
import { Sparkles, CheckCircle2, Clock, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusTask() {
  const { tasks, toggleTask } = useTaskStore();
  
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  
  if (pendingTasks.length === 0) return null;

  // AI 우선순위가 가장 높은 작업 추천 (여러 개면 생성일 기준 최신순)
  const recommendation = [...pendingTasks].sort((a, b) => {
    if (b.aiPriority !== a.aiPriority) return b.aiPriority - a.aiPriority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];

  const handleComplete = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#3b82f6', '#60a5fa', '#ffffff']
    });
    toggleTask(recommendation.id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative overflow-hidden bg-white border border-blue-100 rounded-2xl shadow-sm">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 select-none cursor-default">
                <Sparkles size={14} className="fill-blue-100" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/80">지금 바로 시작할까요?</span>
              </div>
              
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {recommendation.title}
              </h2>
              
              <div className="flex flex-wrap gap-3 select-none cursor-default">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md">
                  <Clock size={14} className="text-blue-500" />
                  <span>약 {recommendation.duration}분</span>
                </div>
                {recommendation.deadline && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-red-50 px-2 py-1 rounded-md">
                    <Calendar size={14} className="text-red-500" />
                    <span>
                      {new Date(recommendation.deadline).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 마감
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleComplete}
              className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <CheckCircle2 size={18} className="mr-1.5" />
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
