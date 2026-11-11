import { auth } from './firebase';
export async function sendSummary(): Promise<string> {
 const user = auth?.currentUser;
 if (!user) throw new Error('Iniciá sesión para enviar el resumen.');
 const token = await user.getIdToken();
 const response = await fetch('/api/send-summary', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
 let result: { message?: string; error?: string };
 try { result = await response.json(); } catch { throw new Error('La función de email no está disponible. Usá el deploy en Vercel o npm run dev:full.'); }
 if (!response.ok) throw new Error(result.error || 'No se pudo enviar el resumen.');
 return result.message || 'Resumen enviado. Revisá tu correo.';
}
