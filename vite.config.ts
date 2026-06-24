import { defineConfig, loadEnv } from 'vite' // 1. Import loadEnv
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 2. Load env file based on the current mode (development, production, etc.)
  // process.cwd() tells Vite to look for the .env file in your root project directory
  const env = loadEnv(mode, process.cwd(), '');

  // 3. Fallback to a default if the variable isn't defined yet
  const targetIp = env.VITE_API_URL || 'https://localhost:7077';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '^/(auth|notifications|tenants|adms|hrms)': {
          target: targetIp,  
          changeOrigin: true,
          secure: false,
        }
      }
    },
  }
})