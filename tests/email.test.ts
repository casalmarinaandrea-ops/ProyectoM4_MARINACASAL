import { describe,it,expect,vi } from 'vitest';
import { buildSummary,escapeHtml } from '../server/summary';
import { processSummary,type SummaryDependencies } from '../server/process-summary';
import { task } from './fixtures';
function deps():SummaryDependencies{return {verify:vi.fn().mockResolvedValue({uid:'owner',email:'owner@example.com'}),reserve:vi.fn().mockResolvedValue(true),readTasks:vi.fn().mockResolvedValue([task]),send:vi.fn().mockResolvedValue(undefined)};}
describe('resumen seguro por email',()=>{
 it('escapa contenido HTML',()=>{expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe('&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;');expect(buildSummary([{...task,title:'<img src=x onerror=alert(1)>'}]).html).not.toContain('<img');});
 it('incluye estados y todas las tareas',()=>{const summary=buildSummary([task,{...task,completed:true}]);expect(summary.text).toContain('2 en total, 1 pendientes y 1 completadas');expect(summary.html).toContain('Pendiente');expect(summary.html).toContain('Completada');});
 it('admite resúmenes sin tareas',()=>expect(buildSummary([]).text).toContain('Todavía no tenés tareas'));
 it('rechaza solicitudes sin token antes de leer o enviar',async()=>{const d=deps();await expect(processSummary(undefined,d)).rejects.toMatchObject({status:401});expect(d.readTasks).not.toHaveBeenCalled();expect(d.send).not.toHaveBeenCalled();});
 it('rechaza tokens inválidos',async()=>{const d=deps();vi.mocked(d.verify).mockRejectedValue(new Error('invalid'));await expect(processSummary('Bearer invalid',d)).rejects.toMatchObject({status:401});expect(d.reserve).not.toHaveBeenCalled();});
 it('limita envíos repetidos',async()=>{const d=deps();vi.mocked(d.reserve).mockResolvedValue(false);await expect(processSummary('Bearer valid',d)).rejects.toMatchObject({status:429});expect(d.send).not.toHaveBeenCalled();});
 it('lee solo las tareas del usuario autenticado y le envía el resumen',async()=>{const d=deps();await processSummary('Bearer token',d);expect(d.verify).toHaveBeenCalledWith('token');expect(d.readTasks).toHaveBeenCalledWith('owner');expect(d.send).toHaveBeenCalledWith('owner@example.com',expect.objectContaining({text:expect.stringContaining(task.title)}));});
 it('propaga fallos de SES sin devolver un éxito falso',async()=>{const d=deps();vi.mocked(d.send).mockRejectedValue(new Error('SES unavailable'));await expect(processSummary('Bearer valid',d)).rejects.toThrow('SES unavailable');});
});
