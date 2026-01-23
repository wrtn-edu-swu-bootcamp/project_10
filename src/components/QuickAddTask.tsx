'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Plus } from 'lucide-react';
import { generateId } from '@/utils/id';
import { validateAndFixTaskTitle } from '@/utils/taskValidator';

export default function QuickAddTask() {
  const { addTask } = useTaskStore();
  const [quickTask, setQuickTask] = useState('');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = quickTask.trim();
    if (!trimmedTitle) return;

    // 명명 규칙 적용 및 보정
    const fixedTitle = validateAndFixTaskTitle(trimmedTitle);

    addTask({
      id: generateId(),
      title: fixedTitle,
      duration: 10,
      deadline: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      aiPriority: 5,
    });
    setQuickTask('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <section className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <input
            type="text"
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            placeholder="새로운 할 일을 직접 추가해보세요 (예: 물 마시기)"
            className="flex-1 px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <button
            type="submit"
            disabled={!quickTask.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 flex items-center gap-1 font-bold"
          >
            <Plus size={20} />
            추가
          </button>
        </form>
      </section>
    </div>
  );
}
