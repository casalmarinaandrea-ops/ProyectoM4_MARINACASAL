import type { Task } from '../types';
import { displayDate, priorityLabels } from '../utils/tasks';
interface Props { tasks: Task[]; busyId: string | null; onToggle: (task: Task) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void }
export function TodoList({tasks,busyId,onToggle,onEdit,onDelete}:Props) {
 if(!tasks.length) return <div className="empty"><span aria-hidden="true">✧</span><h3>Un espacio para tus próximos logros</h3><p>Creá una tarea o ajustá los filtros para empezar.</p></div>;
 return <ul className="task-list">{tasks.map(t=><li className={`task-card ${t.completed?'is-completed':''}`} key={t.id}>
 <input type="checkbox" className="task-check" aria-label={`Completar ${t.title}`} checked={t.completed} disabled={busyId===t.id} onChange={()=>onToggle(t)}/>
 <div className="task-content"><h3>{t.title}</h3>{t.description&&<p>{t.description}</p>}<div className="task-meta"><span className={`badge ${t.priority}`}>● {priorityLabels[t.priority]}</span>{t.dueDate&&<span className="due">◷ {displayDate(t.dueDate)}</span>}<span className="status-text">{t.completed?'Completada':'Pendiente'}</span></div></div>
 <div className="task-actions"><button className="icon-btn" aria-label={`Editar ${t.title}`} disabled={busyId===t.id} onClick={()=>onEdit(t)}>Editar</button><button className="icon-btn danger" aria-label={`Eliminar ${t.title}`} disabled={busyId===t.id} onClick={()=>onDelete(t)}>Eliminar</button></div>
 </li>)}</ul>;
}
