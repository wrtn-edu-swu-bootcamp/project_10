'use client';

import { useState } from 'react';
import TaskDump from '@/components/TaskDump';
import TaskList from '@/components/TaskList';
import { useTaskStore } from '@/store/useTaskStore';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);

  const { addTasks } = useTaskStore();

  const handleProcess = async (jsonString: string) => {
    setIsProcessing(true);
    try {
      // JSON 파싱 시도 (markdown 코드 블록 제거 등 전처리)
      let cleanJson = jsonString.trim();
      if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```json|```/g, '').trim();
      }

      const data = JSON.parse(cleanJson);
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('올바른 형식의 AI 답변이 아닙니다. "tasks" 배열이 포함되어야 합니다.');
      }

      const newTasks = data.tasks.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));

      addTasks(newTasks);
    } catch (error: any) {
      console.error(error);
      alert(`할 일 목록을 생성하는 중 오류가 발생했습니다: ${error.message}\nAI의 답변이 JSON 형식인지 확인해주세요.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Smart <span className="text-blue-600">Todo</span>
          </h1>
          <p className="text-slate-500 text-lg">
            AI와 함께 할 일을 분석하고 최적의 실행 순서를 찾아보세요.
          </p>
        </header>

        {/* Task Dump Section */}
        <section>
          <TaskDump onProcess={handleProcess} isProcessing={isProcessing} />
        </section>

        {/* Task List Section */}
        <section>
          <TaskList />
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>© 2026 Smart Todo. 모든 데이터는 브라우저에만 저장됩니다.</p>
        </footer>
      </div>
    </main>
  );
}
