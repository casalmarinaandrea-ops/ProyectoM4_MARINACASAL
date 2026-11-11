export function errorMessage(error: unknown): string {
 const code = (error as { code?: string })?.code;
 const messages: Record<string,string> = {
 'auth/invalid-email': 'El email no tiene un formato válido.',
 'auth/invalid-credential': 'El email o la contraseña son incorrectos.',
 'auth/user-not-found': 'El email o la contraseña son incorrectos.',
 'auth/wrong-password': 'El email o la contraseña son incorrectos.',
 'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
 'auth/weak-password': 'Usá una contraseña de al menos 6 caracteres.',
 'auth/too-many-requests': 'Hubo demasiados intentos. Volvé a probar más tarde.',
 'auth/network-request-failed': 'No se pudo conectar. Revisá tu conexión.',
 'auth/operation-not-allowed': 'Habilitá Email/Password en Firebase Authentication.',
 'permission-denied': 'No tenés permisos. Revisá las reglas de Firestore.',
 'unavailable': 'El servicio no está disponible. Intentá nuevamente.'
 };
 return (code && messages[code]) || 'No se pudo completar la operación. Intentá nuevamente.';
}
