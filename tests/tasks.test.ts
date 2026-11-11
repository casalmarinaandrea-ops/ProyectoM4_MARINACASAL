import { describe,it,expect } from 'vitest';
import { validateTask, selectTasks,taskStats } from '../src/utils/tasks';
import { task } from './fixtures';
describe('validación y selección de tareas',()=>{
 it('rechaza títulos vacíos y extensos',()=>{expect(validateTask({...task,title:'  '})).toBeTruthy();expect(validateTask({...task,title:'a'.repeat(121)})).toBeTruthy();});
 it('rechaza fechas inexistentes',()=>{expect(validateTask({...task,dueDate:'2026-02-30'})).toBeTruthy();});
 it('acepta tareas válidas',()=>expect(validateTask(task)).toBeNull());
 it('filtra por estado y texto sin alterar el original',()=>{const tasks=[task,{...task,id:'2',title:'Comprar',completed:true}];expect(selectTasks(tasks,'pending','ENTREGA','newest')).toEqual([task]);expect(tasks).toHaveLength(2);expect(selectTasks(tasks,'completed','','newest')[0].id).toBe('2');});
 it('prioriza altas y coloca fechas ausentes al final',()=>{const tasks=[{...task,id:'2',priority:'low' as const,dueDate:''},task];expect(selectTasks(tasks,'all','','priority')[0].id).toBe(task.id);expect(selectTasks(tasks,'all','','dueDate')[1].id).toBe('2');});
 it('calcula totales y lista vacía',()=>{expect(taskStats([task,{...task,completed:true}])).toEqual({total:2,pending:1,completed:1});expect(taskStats([])).toEqual({total:0,pending:0,completed:0});});
});
