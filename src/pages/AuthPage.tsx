import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../hooks/useAuth';
import { login, register } from '../services/auth';
import { errorMessage } from '../utils/errors';
export function AuthPage({ mode }: { mode: 'login'|'register' }) {
 const {user,loading,error:authError}=useAuth();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const isRegister=mode==='register';
 async function submit(e: FormEvent) {e.preventDefault();setError('');if(isRegister&&password!==confirm){setError('Las contraseñas no coinciden.');return;}setBusy(true);try {await (isRegister?register:login)(email,password);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 if(loading) return <main className="center-screen" role="status">Cargando…</main>;
 if(user) return <Navigate to="/tasks" replace/>;
 return <main className="auth-layout"><section className="auth-story"><Brand/><div><span className="eyebrow">MENOS RUIDO. MÁS FOCO.</span><h1>Tus ideas merecen<br/>un buen plan<span>.</span></h1><p>Organizá lo importante, avanzá a tu ritmo y hacé espacio para lo que viene.</p><div className="story-card"><span className="mini-check">✓</span><div><strong>Un paso a la vez</strong><p>Cada tarea completada cuenta.</p></div><span className="sparkle">✦</span></div></div><small>Tu espacio personal para pasar a la acción.</small></section>
 <section className="auth-panel"><div className="auth-box"><span className="eyebrow">TU PRÓXIMO PASO EMPIEZA ACÁ</span><h2>{isRegister?'Creá tu cuenta':'Qué bueno verte de nuevo'}</h2><p>{isRegister?'Un lugar para organizar tus objetivos.':'Ingresá para continuar con tus tareas.'}</p><form onSubmit={submit}>
 <label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="vos@ejemplo.com"/>
 <label htmlFor="password">Contraseña</label><input id="password" type="password" autoComplete={isRegister?'new-password':'current-password'} required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Al menos 6 caracteres"/>
 {isRegister&&<><label htmlFor="confirm">Repetí tu contraseña</label><input id="confirm" type="password" autoComplete="new-password" required minLength={6} value={confirm} onChange={e=>setConfirm(e.target.value)}/></>}
 {(error||authError)&&<p className="alert error" role="alert">{error||authError}</p>}
 <button className="btn primary full" disabled={busy}>{busy?'Un momento…':isRegister?'Crear cuenta →':'Ingresar →'}</button></form>
 <p className="auth-switch">{isRegister?'¿Ya tenés cuenta?':'¿Todavía no tenés cuenta?'} <Link to={isRegister?'/login':'/register'}>{isRegister?'Iniciá sesión':'Registrate'}</Link></p></div></section></main>;
}
