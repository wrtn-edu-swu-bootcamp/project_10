'use client';

import { useState } from 'react';
import TaskDump from '@/components/TaskDump';
import TaskList from '@/components/TaskList';
import { useTaskStore } from '@/store/useTaskStore';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);

  const { addTasks, originalText, setOriginalText } = useTaskStore();

  const handleProcess = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to analyze');

      const data = await response.json();
      
      const newTasks = data.tasks.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));

      // 원본 텍스트 저장 또는 추가
      if (!originalText) {
        setOriginalText(text);
      } else {
        setOriginalText(`${originalText}\n추가: ${text}`);
      }

      addTasks(newTasks);
    } catch (error) {
      console.error(error);
      alert('분석 중 오류가 발생했습니다.');
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
            생각나는 모든 할 일을 쏟아내세요. AI가 최적의 실행 순서를 찾아줍니다.
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
