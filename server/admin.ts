import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { HttpError } from './process-summary.js';
import type { SummaryTask } from './summary.js';
export function adminServices() {
 const {FIREBASE_PROJECT_ID:projectId,FIREBASE_CLIENT_EMAIL:clientEmail,FIREBASE_PRIVATE_KEY:privateKey}=process.env;
 if(!projectId||!clientEmail||!privateKey) throw new HttpError(503,'Falta configurar Firebase Admin en el servidor.');
 const app=getApps().length?getApp():initializeApp({credential:cert({projectId,clientEmail,privateKey:privateKey.replace(/\\n/g,'\n')})});
 return {auth:getAuth(app),db:getFirestore(app)};
}
export async function verify(token:string){
 const {auth}=adminServices();
 const decoded=await auth.verifyIdToken(token,true);const user=await auth.getUser(decoded.uid);
 if(user.disabled)throw new HttpError(401,'La cuenta está deshabilitada.');
 return {uid:user.uid,email:user.email||''};
}
export async function reserve(uid:string){
 const {db}=adminServices();const ref=db.collection('emailLimits').doc(uid);
 return db.runTransaction(async tx=>{const snap=await tx.get(ref);const last=snap.get('reservedAt') as Timestamp|undefined;
 const now=Timestamp.now();if(last&&now.toMillis()-last.toMillis()<60_000)return false;
 tx.set(ref,{reservedAt:now});return true;});
}
export async function readTasks(uid:string):Promise<SummaryTask[]>{
 const {db}=adminServices();const snap=await db.collection('users').doc(uid).collection('tasks').where('userId','==',uid).get();
 return snap.docs.map(d=>{const t=d.data();return {title:String(t.title??''),description:String(t.description??''),completed:t.completed===true,priority:String(t.priority??'medium'),dueDate:String(t.dueDate??'')};}).sort((a,b)=>Number(a.completed)-Number(b.completed)||a.title.localeCompare(b.title));
}
