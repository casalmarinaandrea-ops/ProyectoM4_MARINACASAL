export type Priority = 'low' | 'medium' | 'high';
export interface TaskInput { title: string; description: string; priority: Priority; dueDate: string }
export interface Task extends TaskInput { id: string; userId: string; completed: boolean; createdAt: number; updatedAt: number }
export type TaskFilter = 'all' | 'pending' | 'completed';
export type TaskSort = 'newest' | 'priority' | 'dueDate';
