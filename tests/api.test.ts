import { describe,it,expect,vi } from 'vitest';
import type { VercelRequest,VercelResponse } from '@vercel/node';
vi.mock('../server/admin.js',()=>({verify:vi.fn().mockResolvedValue({uid:'owner',email:'owner@example.com'}),reserve:vi.fn().mockResolvedValue(true),readTasks:vi.fn().mockResolvedValue([])}));
vi.mock('../server/ses.js',()=>({send:vi.fn().mockResolvedValue(undefined)}));
import handler from '../api/send-summary';
import { send } from '../server/ses';
function request(method:string,authorization?:string){return {method,headers:{authorization},body:{email:'attacker@example.com',tasks:[{title:'fake'}]}} as VercelRequest;}
function response(){const res={setHeader:vi.fn(),status:vi.fn(),json:vi.fn()};res.status.mockReturnValue(res);return res;}
describe('endpoint HTTP',()=>{
 it('acepta solo POST y desactiva caché',async()=>{const res=response();await handler(request('GET'),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(405);expect(res.setHeader).toHaveBeenCalledWith('Allow','POST');expect(res.setHeader).toHaveBeenCalledWith('Cache-Control','no-store');});
 it('devuelve 401 sin token',async()=>{const res=response();await handler(request('POST'),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(401);expect(send).not.toHaveBeenCalled();});
 it('ignora el destinatario del body y devuelve éxito solo después de SES',async()=>{const res=response();await handler(request('POST','Bearer valid'),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(200);expect(send).toHaveBeenCalledWith('owner@example.com',expect.objectContaining({text:expect.stringContaining('0 en total')}));});
 it('devuelve un error genérico si falla SES',async()=>{const res=response();vi.mocked(send).mockRejectedValueOnce(new Error('SECRET_INTERNAL'));const log=vi.spyOn(console,'error').mockImplementation(()=>{});await handler(request('POST','Bearer valid'),res as unknown as VercelResponse);expect(res.status).toHaveBeenCalledWith(500);expect(JSON.stringify(res.json.mock.calls)).not.toContain('SECRET_INTERNAL');log.mockRestore();});
});
