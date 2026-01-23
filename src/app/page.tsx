'use client';

import { useState } from 'react';
import TaskDump from '@/components/TaskDump';
import TaskList from '@/components/TaskList';
import TaskStats from '@/components/TaskStats';
import FocusTask from '@/components/FocusTask';
import QuickAddTask from '@/components/QuickAddTask';
import { useTaskStore } from '@/store/useTaskStore';
import { validateTasks } from '@/utils/taskValidator';
import { generateId } from '@/utils/id';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tasks } = useTaskStore();

  const handleProcess = async (jsonString: string) => {
    setIsProcessing(true);
    try {
      // JSON 추출 로직: '{'와 '}' 사이의 내용을 찾음
      const startIdx = jsonString.indexOf('{');
      const endIdx = jsonString.lastIndexOf('}');
      
      if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        throw new Error('AI 답변에서 유효한 JSON 형식을 찾을 수 없습니다.');
      }

      const cleanJson = jsonString.substring(startIdx, endIdx + 1);
      const data = JSON.parse(cleanJson);
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('올바른 형식의 AI 답변이 아닙니다. "tasks" 배열이 포함되어야 합니다.');
      }

      // 1. 데이터 검증 및 자동 보정
      const validatedTasks = validateTasks(data.tasks);

      // 2. ID 및 상태 추가
      const newTasks = validatedTasks.map((t: any) => ({
        ...t,
        id: generateId(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));

      // 기존 할 일과 합친 후 aiPriority 순으로 정렬 (머지 로직 사용)
      const { mergeTasks } = useTaskStore.getState();
      mergeTasks(newTasks);

      // 할 일이 추가된 후 진행 상황을 바로 볼 수 있도록 화면 상단으로 스크롤
      setTimeout(() => {
        window.scrollTo({ top: 0 });
      }, 100);
    } catch (error: any) {
      console.error(error);
      alert(`할 일 목록을 생성하는 중 오류가 발생했습니다: ${error.message}\nAI의 답변이 JSON 형식인지 확인해주세요.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasTasks = tasks.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 select-none cursor-default">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Smart <span className="text-blue-600">Todo</span>
          </h1>
          <p className="text-slate-500 text-lg">
            AI와 함께 할 일을 분석하고 최적의 실행 순서를 찾아보세요.
            <br />
            <span className="text-sm text-slate-400 font-normal">페이지를 새로고침하면 모든 데이터가 초기화됩니다</span>
          </p>
        </header>

        <div className="space-y-6">
          {hasTasks && (
            <>
              {/* Stats Section */}
              <section>
                <TaskStats />
              </section>

              {/* Focus Task Section */}
              <section className="pt-2">
                <FocusTask />
              </section>

              {/* Task List Section */}
              <section className="-mt-2">
                <TaskList />
              </section>
            </>
          )}

          {/* Task Dump Section */}
          <section className={hasTasks ? "pt-4" : ""}>
            <TaskDump onProcess={handleProcess} isProcessing={isProcessing} />
          </section>

          {hasTasks && (
            /* Quick Add Section */
            <section>
              <QuickAddTask />
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-slate-400 text-sm select-none cursor-default">
          <p>© 2026 Smart Todo. 모든 데이터는 브라우저 메모리에만 일시적으로 저장됩니다.</p>
        </footer>
      </div>
    </main>
  );
}
