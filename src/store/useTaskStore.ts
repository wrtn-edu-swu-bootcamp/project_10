import { create } from 'zustand';
import { Task } from '@/types/task';

interface TaskState {
  tasks: Task[];
  originalText: string;
  addTask: (task: Task) => void;
  mergeTasks: (newTasks: Task[]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setOriginalText: (text: string) => void;
}

export const useTaskStore = create<TaskState>()(
  (set) => ({
    tasks: [],
    originalText: '',
    addTask: (task) =>
      set((state) => ({ tasks: [...state.tasks, task] })),
    mergeTasks: (newTasks) =>
      set((state) => {
        const normalize = (title: string) => title.replace(/\s+/g, '').trim();
        const existingNormalizedTitles = new Set(state.tasks.map((t) => normalize(t.title)));
        const filteredNewTasks = newTasks.filter((t) => !existingNormalizedTitles.has(normalize(t.title)));
        const combinedTasks = [...state.tasks, ...filteredNewTasks];
        
        // 추천 순서(aiPriority)로 전체 정렬하여 "끼워넣기" 구현
        // 완료된 항목은 뒤로 보낼지 여부는 TaskList의 getSortedTasks에서 처리하므로 여기선 우선순위만 고려
        const sortedTasks = combinedTasks.sort((a, b) => b.aiPriority - a.aiPriority);
        
        return { tasks: [...sortedTasks] };
      }),
    toggleTask: (id) =>
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
            : task
        ),
      })),
    deleteTask: (id) =>
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
    setTasks: (tasks) => set({ tasks }),
    updateTask: (id, updates) =>
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      })),
    setOriginalText: (text) => set({ originalText: text }),
  })
);
