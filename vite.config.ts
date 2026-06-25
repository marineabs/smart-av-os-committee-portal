import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const githubPagesBase = '/smart-av-os-committee-portal/'
const base = process.env.DEPLOY_BASE_PATH || (process.env.VERCEL ? '/' : githubPagesBase)

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4174',
        changeOrigin: true,
      },
    },
  },
})
