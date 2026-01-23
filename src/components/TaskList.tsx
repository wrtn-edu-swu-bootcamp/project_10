'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Task, SortType } from '@/types/task';
import { CheckCircle2, Circle, Clock, Calendar, Trash2, GripVertical, Search, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';

export default function TaskList() {
  const { tasks, toggleTask, deleteTask, setTasks, updateTask } = useTaskStore();
  const [sortType, setSortType] = useState<SortType>('quick');
  const [enabled, setEnabled] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && task.status === 'pending') {
      // 좀 더 풍성한 축하 효과
      const scalar = 2;
      const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });

      confetti({
        shapes: [triangle],
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
        ticks: 200,
        gravity: 1.2,
        scalar
      });
      
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2563eb', '#3b82f6']
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2563eb', '#3b82f6']
      });
    }
    toggleTask(id);
  };

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const getFilteredAndSortedTasks = (): Task[] => {
    // 1. 검색 필터링
    const filtered = searchQuery.trim() === '' 
      ? tasks 
      : tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const pendingTasks = filtered.filter(t => t.status === 'pending');
    const completedTasks = filtered.filter(t => t.status === 'completed');

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
    }

    return [...sorted, ...completedTasks];
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || sortType !== 'recommended' || searchQuery !== '') return;

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    const newPendingTasks = Array.from(pendingTasks);
    const [reorderedItem] = newPendingTasks.splice(result.source.index, 1);
    newPendingTasks.splice(result.destination.index, 0, reorderedItem);

    setTasks([...newPendingTasks, ...completedTasks]);
  };

  const sortedTasks = getFilteredAndSortedTasks();

  if (tasks.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="할 일 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-11 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl select-none">
        {(['quick', 'urgency', 'recommended'] as SortType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSortType(type)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg ${
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
      {enabled ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks" isDropDisabled={sortType !== 'recommended'}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {sortedTasks.length === 0 && searchQuery && (
                  <div className="text-center py-12 text-slate-400">
                    <Search className="mx-auto mb-3 opacity-20" size={48} />
                    <p>검색 결과가 없습니다.</p>
                  </div>
                )}
                {sortedTasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                    isDragDisabled={sortType !== 'recommended' || task.status === 'completed' || searchQuery !== ''}
                  >
                    {(provided, snapshot) => {
                      // 드래그 중일 때 수평 이동을 제한하고 수직(Y축)으로만 움직이도록 스타일 조정
                      const transform = provided.draggableProps.style?.transform;
                      const style = {
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging && transform 
                          ? transform.replace(/\(.+?,/, '(0px,') 
                          : transform,
                      };

                      return (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={style}
                          className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                            task.status === 'completed'
                              ? 'bg-slate-50 border-transparent opacity-60 scale-[0.98]'
                              : snapshot.isDragging
                              ? 'bg-blue-50 border-blue-200 shadow-xl z-50 scale-105'
                              : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                          }`}
                        >
                          {sortType === 'recommended' && task.status === 'pending' && (
                            <div
                              {...provided.dragHandleProps}
                              className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={20} />
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleToggle(task.id)}
                            className={`${
                              task.status === 'completed' ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400'
                            }`}
                          >
                            {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            {editingId === task.id ? (
                              <input
                                autoFocus
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => {
                                  updateTask(task.id, { title: editValue });
                                  setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateTask(task.id, { title: editValue });
                                    setEditingId(null);
                                  }
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                className="w-full font-semibold text-slate-700 bg-blue-50 border-none rounded px-1 outline-none"
                              />
                            ) : (
                              <h3 
                                onClick={() => {
                                  if (task.status === 'pending') {
                                    setEditingId(task.id);
                                    setEditValue(task.title);
                                  }
                                }}
                                className={`font-semibold truncate cursor-pointer hover:text-blue-600 ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}
                              >
                                {task.title}
                              </h3>
                            )}
                            <div className="flex flex-wrap gap-3 mt-1">
                              {task.duration > 0 && (
                                <span 
                                  onClick={() => {
                                    if (task.status === 'pending') {
                                      const newDuration = prompt('예상 소요 시간(분)을 입력하세요:', task.duration.toString());
                                      if (newDuration !== null) {
                                        const mins = parseInt(newDuration);
                                        if (!isNaN(mins)) updateTask(task.id, { duration: mins });
                                      }
                                    }
                                  }}
                                  className="flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap cursor-pointer hover:text-blue-500"
                                >
                                  <Clock size={12} /> {task.duration}분
                                </span>
                              )}
                              {sortType === 'urgency' && task.status === 'pending' ? (
                                <div className="flex items-center gap-2">
                                  <Calendar size={12} className="text-slate-400" />
                                  <input
                                    type="datetime-local"
                                    value={(() => {
                                      try {
                                        if (!task.deadline) return '';
                                        const date = new Date(task.deadline);
                                        if (isNaN(date.getTime())) return '';
                                        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                      } catch (e) {
                                        return '';
                                      }
                                    })()}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateTask(task.id, { deadline: val ? new Date(val).toISOString() : null });
                                    }}
                                    className="text-xs border border-slate-200 rounded px-1 py-0.5 focus:border-blue-500 outline-none text-slate-600"
                                  />
                                </div>
                              ) : task.deadline && (
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
                            className="p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="space-y-3">
          {sortedTasks.length === 0 && searchQuery && (
            <div className="text-center py-12 text-slate-400">
              <Search className="mx-auto mb-3 opacity-20" size={48} />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                task.status === 'completed'
                  ? 'bg-slate-50 border-transparent opacity-60 scale-[0.98]'
                  : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`${
                  task.status === 'completed' ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400'
                }`}
              >
                {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => {
                      updateTask(task.id, { title: editValue });
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateTask(task.id, { title: editValue });
                        setEditingId(null);
                      }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full font-semibold text-slate-700 bg-blue-50 border-none rounded px-1 outline-none"
                  />
                ) : (
                  <h3 
                    onClick={() => {
                      if (task.status === 'pending') {
                        setEditingId(task.id);
                        setEditValue(task.title);
                      }
                    }}
                    className={`font-semibold truncate cursor-pointer hover:text-blue-600 ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}
                  >
                    {task.title}
                  </h3>
                )}
                <div className="flex flex-wrap gap-3 mt-1">
                  {task.duration > 0 && (
                    <span 
                      onClick={() => {
                        if (task.status === 'pending') {
                          const newDuration = prompt('예상 소요 시간(분)을 입력하세요:', task.duration.toString());
                          if (newDuration !== null) {
                            const mins = parseInt(newDuration);
                            if (!isNaN(mins)) updateTask(task.id, { duration: mins });
                          }
                        }
                      }}
                      className="flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap cursor-pointer hover:text-blue-500"
                    >
                      <Clock size={12} /> {task.duration}분
                    </span>
                  )}
                  {sortType === 'urgency' && task.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-slate-400" />
                      <input
                        type="datetime-local"
                        value={task.deadline ? new Date(new Date(task.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateTask(task.id, { deadline: val ? new Date(val).toISOString() : null });
                        }}
                        className="text-xs border border-slate-200 rounded px-1 py-0.5 focus:border-blue-500 outline-none text-slate-600"
                      />
                    </div>
                  ) : task.deadline && (
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
                className="p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
