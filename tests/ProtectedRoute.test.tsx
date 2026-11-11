import { render,screen } from '@testing-library/react';
import { MemoryRouter,Routes,Route } from 'react-router-dom';
import { describe,it,expect } from 'vitest';
import { AuthContext,type AuthState } from '../src/features/auth/AuthProvider';
import { ProtectedRoute } from '../src/routes/ProtectedRoute';
function show(state:AuthState){render(<AuthContext.Provider value={state}><MemoryRouter initialEntries={['/tasks']}><Routes><Route path="/login" element={<p>Ingresá a tu cuenta</p>}/><Route element={<ProtectedRoute/>}><Route path="/tasks" element={<p>Tareas privadas</p>}/></Route></Routes></MemoryRouter></AuthContext.Provider>);}
describe('rutas privadas',()=>{
 it('redirige a login sin sesión',()=>{show({user:null,loading:false,error:''});expect(screen.getByText('Ingresá a tu cuenta')).toBeInTheDocument();expect(screen.queryByText('Tareas privadas')).not.toBeInTheDocument();});
 it('espera a que Firebase resuelva la sesión',()=>{show({user:null,loading:true,error:''});expect(screen.getByRole('status')).toHaveTextContent('Cargando');});
});
