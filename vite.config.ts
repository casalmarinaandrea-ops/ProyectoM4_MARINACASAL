import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
 plugins: [react()],
 build: { rollupOptions: { output: { manualChunks: { firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'], react: ['react', 'react-dom', 'react-router-dom'] } } } },
 test: { environment: 'jsdom', setupFiles: './tests/setup.ts', clearMocks: true, coverage: { provider: 'v8', include: ['src/utils/**', 'src/components/**', 'server/**'] } }
});
