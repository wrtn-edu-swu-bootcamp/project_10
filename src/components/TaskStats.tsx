'use client';

import { useTaskStore } from '@/store/useTaskStore';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function TaskStats() {
  const { tasks } = useTaskStore();
  
  if (tasks.length === 0) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalDuration = tasks
    .filter((t) => t.status === 'pending')
    .reduce((acc, t) => acc + (t.duration || 0), 0);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Progress Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm select-none cursor-default">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <TrendingUp size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">진행률</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Pending Count Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm select-none cursor-default">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <ListTodo size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">남은 일</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-700">{pendingTasks}</span>
            <span className="text-[10px] text-slate-400 font-medium">개</span>
          </div>
        </div>

        {/* Total Duration Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm select-none cursor-default">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">소요 시간</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-700">{formatDuration(totalDuration)}</span>
          </div>
        </div>

        {/* Completed Count Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm select-none cursor-default">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">완료됨</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-green-600">{completedTasks}</span>
            <span className="text-[10px] text-slate-400 font-medium">개</span>
          </div>
        </div>
      </div>
    </div>
  );
}
