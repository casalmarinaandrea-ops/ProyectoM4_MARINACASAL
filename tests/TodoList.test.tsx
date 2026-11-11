import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe,it,expect,vi } from 'vitest';
import { TodoList } from '../src/components/TodoList';
import { task } from './fixtures';
describe('TodoList',()=>{
 it('muestra un estado vacío',()=>{render(<TodoList tasks={[]} busyId={null} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()}/>);expect(screen.getByText('Un espacio para tus próximos logros')).toBeInTheDocument();});
 it('ejecuta completar, editar y eliminar sobre la tarea correcta',async()=>{const toggle=vi.fn(),edit=vi.fn(),remove=vi.fn();render(<TodoList tasks={[task]} busyId={null} onToggle={toggle} onEdit={edit} onDelete={remove}/>);await userEvent.click(screen.getByRole('checkbox'));await userEvent.click(screen.getByRole('button',{name:/Editar/}));await userEvent.click(screen.getByRole('button',{name:/Eliminar/}));expect(toggle).toHaveBeenCalledWith(task);expect(edit).toHaveBeenCalledWith(task);expect(remove).toHaveBeenCalledWith(task);});
 it('marca completadas y bloquea acciones mientras guarda',()=>{render(<TodoList tasks={[{...task,completed:true}]} busyId={task.id} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()}/>);expect(screen.getByRole('checkbox')).toBeChecked();expect(screen.getByRole('checkbox')).toBeDisabled();expect(screen.getByText('Completada')).toBeInTheDocument();});
});
