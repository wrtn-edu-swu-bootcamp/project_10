'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Task, SortType } from '@/types/task';
import { CheckCircle2, Circle, Clock, Calendar, Trash2 } from 'lucide-react';

export default function TaskList() {
  const { tasks, toggleTask, deleteTask } = useTaskStore();
  const [sortType, setSortType] = useState<SortType>('quick');

  const getSortedTasks = (): Task[] => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    let sorted = [...pendingTasks];

    if (sortType === 'quick') {
      sorted.sort((a, b) => a.duration - b.duration);
    } else if (sortType === 'urgency') {
      sorted.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else if (sortType === 'recommended') {
      sorted.sort((a, b) => b.aiPriority - a.aiPriority);
    }

    return [...sorted, ...completedTasks];
  };

  const sortedTasks = getSortedTasks();

  if (tasks.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 space-y-6">
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {(['quick', 'urgency', 'recommended'] as SortType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSortType(type)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              sortType === type
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {type === 'recommended' && '추천'}
            {type === 'quick' && '짧은 시간순'}
            {type === 'urgency' && '마감 임박순'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              task.status === 'completed'
                ? 'bg-slate-50 border-transparent opacity-60'
                : 'bg-white border-slate-100 hover:border-blue-100'
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`transition-colors ${
                task.status === 'completed' ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400'
              }`}
            >
              {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.title}
              </h3>
              <div className="flex gap-3 mt-1">
                {task.duration > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock size={12} /> {task.duration}분
                  </span>
                )}
                {task.deadline && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    new Date(task.deadline).getTime() - new Date().getTime() < 86400000 
                      ? 'text-red-500' 
                      : 'text-slate-400'
                  }`}>
                    <Calendar size={12} /> {
                      (new Date(task.deadline).getHours() === 0 && new Date(task.deadline).getMinutes() === 0
                        ? new Date(task.deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
                        : new Date(task.deadline).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })) + ' 까지'
                    }
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
