import { useEffect, useState } from 'react';
import { subscribeTasks } from '../services/tasks';
import { errorMessage } from '../utils/errors';
import type { Task } from '../types';
export function useTasks(uid: string) {
 const [tasks,setTasks] = useState<Task[]>([]); const [loading,setLoading] = useState(true); const [error,setError] = useState('');
 useEffect(() => { setTasks([]); setLoading(true); setError(''); return subscribeTasks(uid, items=>{setTasks(items);setLoading(false);setError('');}, e=>{setError(errorMessage(e));setLoading(false);}); },[uid]);
 return { tasks, loading, error };
}
