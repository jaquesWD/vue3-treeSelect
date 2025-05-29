import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './src/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      createVitePlugins(env, command === 'build'),
    ],
  }
})
