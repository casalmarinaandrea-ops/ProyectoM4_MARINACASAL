import { useContext } from 'react';
import { AuthContext } from '../features/auth/AuthProvider';
export const useAuth = () => useContext(AuthContext);
