import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthProvider';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { TasksPage } from './pages/TasksPage';
import { Brand } from './components/Brand';
import { firebaseConfigured } from './services/firebase';
export default function App(){
 if(!firebaseConfigured)return <main className="center-screen"><div className="setup-card"><Brand/><h1>Tu espacio está casi listo</h1><p>Configurá las cuatro variables VITE_FIREBASE_ en el archivo .env y reiniciá el servidor.</p><p>Encontrás los pasos en INICIO-RAPIDO.md.</p></div></main>;
 return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<AuthPage key="login" mode="login"/>}/><Route path="/register" element={<AuthPage key="register" mode="register"/>}/><Route element={<ProtectedRoute/>}><Route path="/tasks" element={<TasksPage/>}/></Route><Route path="*" element={<Navigate to="/tasks" replace/>}/></Routes></AuthProvider></BrowserRouter>;
}
