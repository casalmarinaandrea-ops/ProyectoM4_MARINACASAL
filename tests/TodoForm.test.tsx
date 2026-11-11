import { render,screen,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe,it,expect,vi } from 'vitest';
import { TodoForm } from '../src/components/TodoForm';
import { task } from './fixtures';
describe('TodoForm',()=>{
 it('no envía un título vacío y muestra el error',async()=>{const submit=vi.fn();render(<TodoForm onSubmit={submit} onCancel={vi.fn()}/>);await userEvent.click(screen.getByRole('button',{name:'Crear tarea'}));expect(screen.getByRole('alert')).toHaveTextContent('Escribí un título');expect(submit).not.toHaveBeenCalled();});
 it('envía los campos ingresados',async()=>{const submit=vi.fn().mockResolvedValue(undefined);render(<TodoForm onSubmit={submit} onCancel={vi.fn()}/>);await userEvent.type(screen.getByLabelText(/Título/),'Leer documentación');await userEvent.click(screen.getByRole('button',{name:'Crear tarea'}));await waitFor(()=>expect(submit).toHaveBeenCalledWith({title:'Leer documentación',description:'',priority:'medium',dueDate:''}));});
 it('permite editar una tarea existente',async()=>{const submit=vi.fn().mockResolvedValue(undefined);render(<TodoForm initial={task} onSubmit={submit} onCancel={vi.fn()}/>);expect(screen.getByLabelText(/Título/)).toHaveValue(task.title);await userEvent.click(screen.getByRole('button',{name:'Guardar cambios'}));expect(submit).toHaveBeenCalled();});
 it('muestra fallas de persistencia sin ocultar el formulario',async()=>{render(<TodoForm initial={task} onSubmit={vi.fn().mockRejectedValue(new Error('offline'))} onCancel={vi.fn()}/>);await userEvent.click(screen.getByRole('button',{name:'Guardar cambios'}));expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar');expect(screen.getByRole('button',{name:'Guardar cambios'})).toBeEnabled();});
});
