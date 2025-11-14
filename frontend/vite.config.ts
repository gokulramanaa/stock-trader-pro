import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')?.pop();
const basePath =
  process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/');

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  },
  test: {
    environment: 'happy-dom',
    setupFiles: './src/setupTests.ts',
    globals: true
  }
});
