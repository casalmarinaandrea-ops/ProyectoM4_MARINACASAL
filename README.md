# ✳ Enfoco · Gestor estratégico de tareas

SPA para organizar tareas personales con autenticación, persistencia por usuario y envío de un resumen por email. Proyecto Integrador M4 · Full Stack.

**Estado:** código implementado y validado localmente. La conexión con cuentas reales, publicación y prueba de entrega de correo requieren la configuración que se detalla en `INICIO-RAPIDO.md`.

**Producción:** pendiente de completar con la URL real de Vercel después del deploy.  
**Repositorio:** pendiente de completar con la URL real de GitHub.

## Funcionalidades

- Registro con email y contraseña, login y logout con Firebase Authentication.
- Rutas públicas `/login`, `/register` y ruta privada `/tasks`.
- Crear, listar, editar, eliminar con confirmación y completar tareas.
- Título, descripción, prioridad y fecha de vencimiento opcional.
- Persistencia en Cloud Firestore y actualización de la interfaz mediante `onSnapshot`.
- Filtrado por usuario, reglas de autorización, estados de carga y errores.
- Filtros por estado, búsqueda por título/descripción y orden por prioridad, vencimiento o fecha de creación.
- Resumen de **todas** las tareas por email con estados y totales, independiente de los filtros activos.
- Diseño responsive, etiquetas accesibles, navegación por teclado y modal con foco administrado por `dialog`.

Extras implementados: filtros, prioridad y vencimiento. Drag & drop no implementado, ya que es opcional.

## Stack

React 19 · TypeScript · Vite · React Router · Firebase Auth y Firestore · Firebase Admin · AWS SDK SES · Vercel Functions · Vitest · React Testing Library.

Requiere Node.js 22 o posterior y npm. `package-lock.json` fija las versiones instaladas.

## Instalación y scripts

```bash
npm ci
cp .env.example .env
npm run dev
```

Completá primero las variables y configurá Firebase siguiendo **INICIO-RAPIDO.md**. Sin configuración se muestra una pantalla explicativa; no se simulan usuarios ni persistencia.

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Frontend local con Vite |
| `npm run dev:full` | Vercel CLI: frontend y función, requiere vincular proyecto |
| `npm test` | Suite de tests una sola vez |
| `npm run test:watch` | Tests en modo interactivo |
| `npm run test:coverage` | Cobertura local de unidades/componentes seleccionados |
| `npm run build` | Verifica tipos del frontend y servidor y compila el frontend |
| `npm run preview` | Sirve `dist` localmente; no ejecuta la función de email |

## Arquitectura y decisiones

| Carpeta/archivo | Responsabilidad |
| --- | --- |
| `src/pages` | Vistas de autenticación y tareas |
| `src/components` | Formulario, lista, modal y marca reutilizables |
| `src/features/auth` | Contexto de sesión compartido y suscripción Auth |
| `src/hooks` | Acceso a sesión y ciclo de vida de tareas |
| `src/routes` | Protección de rutas privadas |
| `src/services` | Adaptadores Firebase y llamada autenticada de email |
| `src/types` | Contratos de tareas y filtros |
| `src/utils` | Validación, selección, estadísticas y errores |
| `api/send-summary.ts` | Entrada HTTP de Vercel Function |
| `server` | Validación de token, lectura Admin, límite de envíos, resumen y SES |
| `tests` | Tests unitarios/componentes y mocks de dependencias externas |
| `firestore.rules` | Autorización y validación de documentos |

El estado de autenticación se comparte por Context; el estado efímero de formularios y filtros se mantiene en la vista que lo utiliza. Firestore actúa como fuente de datos y `onSnapshot` mantiene la interfaz actualizada tras cada escritura, sin duplicar el almacenamiento en localStorage.

Los documentos viven en `users/{uid}/tasks/{taskId}` y también contienen `userId`. La suscripción filtra `userId == uid`; las reglas exigen que el UID de la ruta coincida con el usuario autenticado. Esto evita que ocultar elementos en la interfaz sea la única protección. Las reglas validan campos, límites de longitud, estados, prioridades y timestamps de servidor; impiden cambiar `createdAt` o el propietario.

No se necesita un índice compuesto: la consulta usa una sola igualdad y el orden se aplica en el cliente. Las fechas de vencimiento se guardan como `YYYY-MM-DD`, sin convertirlas a un instante UTC. `createdAt` y `updatedAt` usan timestamps de servidor.

La función está en `api/`, la convención de Vercel para un proyecto Vite; `server/` contiene su implementación. Los rewrites explícitos de las rutas SPA en `vercel.json` permiten recargas sin interceptar `/api/send-summary`.

## Variables de entorno

| Variable | Dónde se usa | Valor |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Navegador | apiKey de la aplicación web |
| `VITE_FIREBASE_AUTH_DOMAIN` | Navegador | authDomain del proyecto |
| `VITE_FIREBASE_PROJECT_ID` | Navegador | projectId |
| `VITE_FIREBASE_APP_ID` | Navegador | appId |
| `FIREBASE_PROJECT_ID` | Servidor | project_id de la cuenta de servicio |
| `FIREBASE_CLIENT_EMAIL` | Servidor | client_email de la cuenta de servicio |
| `FIREBASE_PRIVATE_KEY` | Servidor | private_key de la cuenta de servicio |
| `AWS_REGION` | Servidor | Región de SES |
| `AWS_ACCESS_KEY_ID` | Servidor | Clave de acceso IAM |
| `AWS_SECRET_ACCESS_KEY` | Servidor | Secreto IAM |
| `SES_FROM_EMAIL` | Servidor | Remitente verificado en esa región |

La configuración web de Firebase es pública por diseño. La protección de los datos depende de Auth y las reglas. La clave privada Admin y las claves AWS son secretas y nunca deben llevar prefijo `VITE_`. `.env` y claves de cuentas de servicio están excluidos del repositorio; `.env.example` contiene únicamente campos vacíos y una región de ejemplo.

## Flujo de email

1. El usuario pulsa **Enviarme resumen**.
2. El cliente obtiene su Firebase ID token y hace `POST /api/send-summary` con `Authorization: Bearer …`.
3. La función valida el token y su revocación con Admin SDK, consulta el usuario actual y toma su email del servidor.
4. Una transacción en `emailLimits/{uid}` reserva un intento cada 60 segundos. El límite funciona entre instancias y el cliente no puede editarlo.
5. La función lee únicamente `users/{uid}/tasks` con `userId == uid` y construye un resumen HTML y texto con todas las tareas y totales.
6. AWS SES envía el mensaje al email del usuario. Se escapa el HTML de títulos y descripciones. No se aceptan tareas ni destinatarios del body.
7. La interfaz confirma la aceptación del envío o presenta un error. La aceptación de SES no garantiza llegada a la bandeja principal: revisá spam y las restricciones de sandbox.

El Admin SDK omite las reglas de Firestore, por eso la función resuelve el UID desde el token verificado y construye el acceso a datos en el servidor. El límite consume un intento aunque SES falle, para evitar reintentos masivos. No hay cola ni reintento automático de la interfaz: el usuario puede probar nuevamente después de un minuto. Para producción de mayor escala convendría incorporar monitoreo de rebotes, cuotas globales y una cola.

## Testing y validación

La suite cubre validación de campos y fechas, filtros/orden/estadísticas, formulario (creación, edición, errores), lista (acciones y estado vacío), redirección privada y flujo de email (token, aislamiento por UID, límite, escape HTML y error de SES). Los servicios externos se sustituyen con mocks en los tests del flujo de email; los tests de componentes usan callbacks controlados. No se mandan correos ni se requieren cuentas reales para `npm test`.

Los tests unitarios no reemplazan la prueba de integración con Firebase, reglas y SES reales. El build comprueba TypeScript, incluyendo la función. GitHub Actions ejecuta tests y build en cada push/PR.

## Git y deploy

Los archivos entregados no incluyen historial Git inventado. Creá el repositorio local y registrá commits reales por grupos:

```bash
git init
git add package.json package-lock.json tsconfig.json vite.config.ts index.html .gitignore .env.example src api server firestore.rules firebase.json vercel.json
git commit -m "feat: implementar gestor de tareas con Firebase y resumen SES"
git add tests .github
git commit -m "test: cubrir componentes y flujo de resumen autenticado"
git add README.md INICIO-RAPIDO.md docs
git commit -m "docs: documentar instalación configuración y entrega"
git branch -M main
```

Luego configurá el remote de **tu repositorio real** y hacé `git push -u origin main`. No uses `git add -f .env`. Si Git pide identidad, configurá tu nombre y email de GitHub antes de los commits.

Importá el repositorio en Vercel como Vite, con Node 22.x, build `npm run build` y salida `dist`. Agregá las variables de entorno y redesplegá. Publicá `firestore.rules` desde Firebase Console. Agregá el dominio de Vercel a los dominios autorizados de Authentication. Verificá en SES el remitente y, si seguís en sandbox, el destinatario.

Finalmente completá las URLs del encabezado, probá el flujo real y entregá el enlace de GitHub.

## Uso de IA

Se utilizó ChatGPT como apoyo para generar la estructura y la implementación inicial a partir de las diapositivas de la consigna, redactar documentación y preparar/ejecutar tests y compilación. Esta entrega fue generada con asistencia de IA; no se atribuye a la alumna una revisión o comprensión del código que aún no haya realizado.

Ejemplos de instrucciones utilizadas: construir una SPA React/TypeScript con registro y CRUD por usuario; aislar datos con reglas de Firestore; enviar el resumen con SES desde una función autenticada; validar componentes y casos de error sin credenciales reales.

La asistencia fue útil para separar vistas, servicios, tipos y lógica de servidor, además de identificar casos como tokens inválidos, fechas inexistentes y contenido HTML en tareas. Patrones presentes para estudiar y revisar: Context para sesión, hooks de suscripción, formularios controlados, dependencias sustituibles en tests y autorización por UID tanto en reglas como en servidor.

La configuración de las cuentas, prueba de las reglas en el proyecto real, verificación del correo y publicación quedan pendientes hasta realizarlas con las cuentas de la alumna. Antes de presentar, revisar especialmente `AuthProvider`, `useTasks`, `firestore.rules` y `process-summary.ts`.

## Referencias oficiales

- [Firebase: autenticación y reglas](https://firebase.google.com/docs/rules/rules-and-auth)
- [Firebase: validación de ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [AWS SES: SendEmail y restricciones de sandbox](https://docs.aws.amazon.com/ses/latest/APIReference/API_SendEmail.html)
