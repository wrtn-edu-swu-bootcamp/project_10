import { create } from 'zustand';
import { Task } from '@/types/task';

interface TaskState {
  tasks: Task[];
  originalText: string;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearTasks: () => void;
  setOriginalText: (text: string) => void;
}

export const useTaskStore = create<TaskState>()(
  (set) => ({
    tasks: [],
    originalText: '',
    addTask: (task) =>
      set((state) => ({ tasks: [...state.tasks, task] })),
    addTasks: (newTasks) =>
      set((state) => ({ tasks: [...state.tasks, ...newTasks] })),
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
    clearTasks: () => set({ tasks: [], originalText: '' }),
    setOriginalText: (text) => set({ originalText: text }),
  })
);
