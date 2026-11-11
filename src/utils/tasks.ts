import type { Task, TaskFilter, TaskSort, TaskInput } from '../types';
export const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
export function validateTask(input: TaskInput): string | null {
 if (!input.title.trim()) return 'Escribí un título para la tarea.';
 if (input.title.trim().length > 120) return 'El título admite hasta 120 caracteres.';
 if (input.description.length > 2000) return 'La descripción admite hasta 2000 caracteres.';
 if (!['low','medium','high'].includes(input.priority)) return 'Elegí una prioridad válida.';
 if (input.dueDate && (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate) || !Number.isFinite(Date.parse(input.dueDate)) || new Date(input.dueDate).toISOString().slice(0,10) !== input.dueDate)) return 'Elegí una fecha válida.';
 return null;
}
export function selectTasks(tasks: Task[], filter: TaskFilter, search: string, sort: TaskSort): Task[] {
 const rank = { high: 0, medium: 1, low: 2 };
 return tasks.filter(t => (filter === 'all' || (filter === 'completed' ? t.completed : !t.completed)) && `${t.title} ${t.description}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
 .sort((a,b) => sort === 'priority' ? rank[a.priority] - rank[b.priority] || b.createdAt-a.createdAt : sort === 'dueDate' ? (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || b.createdAt-a.createdAt : b.createdAt-a.createdAt);
}
export function taskStats(tasks: Task[]) { const completed = tasks.filter(t=>t.completed).length; return { total: tasks.length, completed, pending: tasks.length-completed }; }
export function displayDate(date: string): string { return date ? new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : ''; }
