import { createContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { errorMessage } from '../../utils/errors';
export interface AuthState { user: User | null; loading: boolean; error: string }
export const AuthContext = createContext<AuthState>({ user: null, loading: true, error: '' });
export function AuthProvider({ children }: { children: ReactNode }) {
 const [state,setState] = useState<AuthState>({ user: null, loading: !!auth, error: '' });
 useEffect(() => { if (!auth) return; return onAuthStateChanged(auth, user => setState({ user, loading: false, error: '' }), e => setState({user:null,loading:false,error:errorMessage(e)})); },[]);
 return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
