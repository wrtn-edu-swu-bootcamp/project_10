export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  duration: number; // minutes, default 0 if unknown
  deadline: string | null; // ISO string or null
  status: TaskStatus;
  createdAt: string;
  aiPriority: number; // 1-10, calculated by AI
}

export type SortType = 'quick' | 'urgency' | 'recommended';
