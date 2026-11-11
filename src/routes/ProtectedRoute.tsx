import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export function ProtectedRoute() { const { user, loading, error } = useAuth(); if(loading) return <main className="center-screen" role="status">Cargando tu espacio…</main>; if(error) return <main className="center-screen" role="alert">{error}</main>; return user ? <Outlet/> : <Navigate to="/login" replace/>; }
