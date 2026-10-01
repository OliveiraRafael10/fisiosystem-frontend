import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error('Configure VITE_API_URL com a URL pública do backend antes do build.')
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/backend': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ''),
        },
      },
    },
  }
})
