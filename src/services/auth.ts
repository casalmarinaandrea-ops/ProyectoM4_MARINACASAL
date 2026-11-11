import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
function getAuth() { if (!auth) throw new Error('Firebase no configurado'); return auth; }
export const register = (email: string, password: string) => createUserWithEmailAndPassword(getAuth(), email.trim(), password);
export const login = (email: string, password: string) => signInWithEmailAndPassword(getAuth(), email.trim(), password);
export const logout = () => signOut(getAuth());
