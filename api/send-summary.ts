import type { VercelRequest,VercelResponse } from '@vercel/node';
import { verify,reserve,readTasks } from '../server/admin.js';
import { send } from '../server/ses.js';
import { HttpError,processSummary } from '../server/process-summary.js';
export default async function handler(req:VercelRequest,res:VercelResponse){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método no permitido.'});}
 try {const result=await processSummary(typeof req.headers.authorization==='string'?req.headers.authorization:undefined,{verify,reserve,readTasks,send});return res.status(200).json(result);}
 catch(error){
  if(error instanceof HttpError)return res.status(error.status).json({error:error.message});
  // Registrar solo el nombre del error evita exponer claves, tokens o datos del usuario.
  console.error('send-summary failed:',error instanceof Error?error.name:'UnknownError');
  return res.status(500).json({error:'No se pudo enviar el resumen. Revisá la configuración de SES y las identidades verificadas e intentá nuevamente.'});
 }
}
