import { useMemo, useState } from 'react';
import { Brand } from '../components/Brand';
import { Modal } from '../components/Modal';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { logout } from '../services/auth';
import { createTask, editTask, removeTask, toggleTask } from '../services/tasks';
import { sendSummary } from '../services/email';
import { errorMessage } from '../utils/errors';
import { selectTasks, taskStats } from '../utils/tasks';
import type { Task, TaskFilter, TaskInput, TaskSort } from '../types';
export function TasksPage() {
 const {user}=useAuth(); const uid=user!.uid; const {tasks,loading,error}=useTasks(uid);
 const [filter,setFilter]=useState<TaskFilter>('all');const [sort,setSort]=useState<TaskSort>('newest');const [search,setSearch]=useState('');
 const [editing,setEditing]=useState<Task|null>(null);const [formOpen,setFormOpen]=useState(false);const [deleting,setDeleting]=useState<Task|null>(null);const [busyId,setBusyId]=useState<string|null>(null);const [sending,setSending]=useState(false);
 const [notice,setNotice]=useState<{text:string;error:boolean}|null>(null);
 const stats=taskStats(tasks);const visible=useMemo(()=>selectTasks(tasks,filter,search,sort),[tasks,filter,search,sort]);
 const today=new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'});
 async function save(input:TaskInput){if(editing)await editTask(uid,editing.id,input);else await createTask(uid,input);setFormOpen(false);setEditing(null);setNotice({text:editing?'Cambios guardados.':'¡Una nueva tarea para avanzar!',error:false});}
 async function toggle(task:Task){setBusyId(task.id);setNotice(null);try{await toggleTask(uid,task.id,!task.completed);}catch(e){setNotice({text:errorMessage(e),error:true});}finally{setBusyId(null);}}
 async function destroy(){if(!deleting)return;setBusyId(deleting.id);try{await removeTask(uid,deleting.id);setDeleting(null);setNotice({text:'Tarea eliminada.',error:false});}catch(e){setNotice({text:errorMessage(e),error:true});}finally{setBusyId(null);}}
 async function email(){setSending(true);setNotice(null);try{setNotice({text:await sendSummary(),error:false});}catch(e){setNotice({text:e instanceof Error?e.message:'No se pudo enviar el correo.',error:true});}finally{setSending(false);}}
 return <div className="app-shell"><aside className="sidebar"><Brand/><span className="sidebar-label">MI ESPACIO</span><a href="/tasks" className="nav-active" aria-current="page"><span>▦</span> Mis tareas <span className="nav-count">{stats.total}</span></a><div className="sidebar-note"><span>✦</span><h3>El progreso empieza con algo pequeño.</h3><p>Elegí una tarea. Dale tu foco.</p></div><div className="account"><div className="avatar">{user!.email?.[0].toUpperCase()||'U'}</div><div><strong>Mi cuenta</strong><small title={user!.email||''}>{user!.email}</small></div><button aria-label="Cerrar sesión" className="icon-btn" onClick={()=>logout().catch(e=>setNotice({text:errorMessage(e),error:true}))}>Salir</button></div></aside>
 <main className="workspace"><header className="topbar"><span>Tu día, con intención</span><span className="cloud-status">● Sincronización en la nube</span><button className="icon-btn mobile-logout" onClick={()=>logout().catch(e=>setNotice({text:errorMessage(e),error:true}))}>Cerrar sesión</button></header><div className="page-body"><div className="page-heading"><div><p className="date-line">{today}</p><h1>Un poco de foco.<br className="mobile-break"/> Mucho por lograr<span>.</span></h1><p>Todo lo que necesitás hacer, en un solo lugar.</p></div><button className="btn primary" disabled={loading||!!error} onClick={()=>{setEditing(null);setFormOpen(true);}}>＋ Nueva tarea</button></div>
 <section className="stats" aria-label="Resumen de tareas"><div className="stat"><span className="stat-icon violet">▦</span><div><span>Total de tareas</span><strong>{stats.total}</strong></div></div><div className="stat"><span className="stat-icon amber">◷</span><div><span>Pendientes</span><strong>{stats.pending}</strong></div></div><div className="stat"><span className="stat-icon green">✓</span><div><span>Completadas</span><strong>{stats.completed}</strong></div></div></section>
 <section className="tasks-section"><div className="section-heading"><h2>Mis tareas <span>{stats.total}</span></h2><button className="btn secondary" disabled={sending||loading||!!error} onClick={email}>{sending?'Enviando…':'↗ Enviarme resumen'}</button></div>
 <div className="toolbar"><div className="tabs" role="group" aria-label="Filtrar tareas">{([['all','Todas'],['pending','Pendientes'],['completed','Completadas']] as const).map(([value,label])=><button key={value} className={filter===value?'active':''} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div><div className="search-sort"><input aria-label="Buscar tareas" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar una tarea…"/><select aria-label="Ordenar tareas" value={sort} onChange={e=>setSort(e.target.value as TaskSort)}><option value="newest">Más recientes</option><option value="priority">Por prioridad</option><option value="dueDate">Por vencimiento</option></select></div></div>
 {notice&&<div className={`alert ${notice.error?'error':'success'}`} role={notice.error?'alert':'status'}>{notice.text}<button className="icon-btn" aria-label="Cerrar aviso" onClick={()=>setNotice(null)}>×</button></div>}
 {error?<p className="alert error" role="alert">{error}</p>:loading?<p className="loading" role="status">Cargando tus tareas…</p>:<TodoList tasks={visible} busyId={busyId} onToggle={toggle} onEdit={t=>{setEditing(t);setFormOpen(true);}} onDelete={setDeleting}/>}
 </section><footer className="page-footer">Hecho para avanzar, a tu ritmo. <span>enfoco.</span></footer></div></main>
 {formOpen&&<Modal title={editing?'Editar tarea':'Una nueva tarea'} onClose={()=>setFormOpen(false)}><TodoForm initial={editing||undefined} onSubmit={save} onCancel={()=>setFormOpen(false)}/></Modal>}
 {deleting&&<Modal title="¿Eliminar esta tarea?" onClose={()=>{if(!busyId)setDeleting(null);}}><p>Vas a eliminar “{deleting.title}”. Esta acción no se puede deshacer.</p><div className="form-actions"><button className="btn secondary" disabled={!!busyId} onClick={()=>setDeleting(null)}>Cancelar</button><button className="btn delete" disabled={!!busyId} onClick={destroy}>{busyId?'Eliminando…':'Eliminar tarea'}</button></div></Modal>}
 </div>;
}
