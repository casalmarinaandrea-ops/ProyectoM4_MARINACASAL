import { useId, useState, type FormEvent } from 'react';
import type { TaskInput } from '../types';
import { validateTask } from '../utils/tasks';
interface Props { initial?: TaskInput; onSubmit: (input: TaskInput) => Promise<void>; onCancel: () => void }
export function TodoForm({ initial, onSubmit, onCancel }: Props) {
 const id = useId(); const [input,setInput] = useState<TaskInput>(initial || {title:'',description:'',priority:'medium',dueDate:''});
 const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 async function submit(e: FormEvent) { e.preventDefault(); const problem=validateTask(input); if(problem) {setError(problem);return;} setBusy(true);setError(''); try {await onSubmit(input);} catch {setError('No se pudo guardar la tarea. Intentá nuevamente.');} finally {setBusy(false);} }
 return <form className="task-form" onSubmit={submit}>
 <label htmlFor={`${id}-title`}>Título <span>*</span></label><input autoFocus id={`${id}-title`} maxLength={120} value={input.title} onChange={e=>setInput({...input,title:e.target.value})} placeholder="¿Qué querés lograr?"/>
 <label htmlFor={`${id}-description`}>Descripción</label><textarea id={`${id}-description`} maxLength={2000} rows={4} value={input.description} onChange={e=>setInput({...input,description:e.target.value})} placeholder="Agregá contexto, ideas o próximos pasos…"/>
 <div className="form-grid"><div><label htmlFor={`${id}-priority`}>Prioridad</label><select id={`${id}-priority`} value={input.priority} onChange={e=>setInput({...input,priority:e.target.value as TaskInput['priority']})}><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select></div><div><label htmlFor={`${id}-due`}>Vencimiento</label><input id={`${id}-due`} type="date" value={input.dueDate} onChange={e=>setInput({...input,dueDate:e.target.value})}/></div></div>
 {error && <p className="alert error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="btn secondary" onClick={onCancel} disabled={busy}>Cancelar</button><button className="btn primary" disabled={busy}>{busy?'Guardando…':initial?'Guardar cambios':'Crear tarea'}</button></div></form>;
}
