import { buildSummary, type SummaryTask } from './summary.js';
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export interface SummaryDependencies {
 verify: (token: string) => Promise<{uid:string;email:string}>;
 reserve: (uid: string) => Promise<boolean>;
 readTasks: (uid: string) => Promise<SummaryTask[]>;
 send: (email: string, summary: ReturnType<typeof buildSummary>) => Promise<void>;
}
export async function processSummary(authorization: string | undefined, deps: SummaryDependencies) {
 const match=authorization?.match(/^Bearer ([^\s]+)$/);
 if(!match) throw new HttpError(401,'Iniciá sesión para enviar el resumen.');
 let identity:{uid:string;email:string};
 try {identity=await deps.verify(match[1]);} catch(e) {if(e instanceof HttpError)throw e;throw new HttpError(401,'Tu sesión venció. Volvé a iniciar sesión.');}
 if(!identity.email) throw new HttpError(400,'Tu cuenta no tiene un email asociado.');
 if(!await deps.reserve(identity.uid)) throw new HttpError(429,'Esperá un minuto antes de enviar otro resumen.');
 const tasks=await deps.readTasks(identity.uid);
 // El destinatario y las tareas se obtienen del servidor; no se aceptan desde el body.
 await deps.send(identity.email,buildSummary(tasks));
 return {message:'Resumen enviado. Revisá tu bandeja de entrada y la carpeta de spam.'};
}
