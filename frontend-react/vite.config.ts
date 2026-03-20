import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 从 .env 文件加载配置，只需在 .env 文件中修改端口号
  const env = loadEnv(mode, process.cwd(), '')
  const API_PORT = env.VITE_API_PORT || '8001'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': `http://localhost:${API_PORT}`
      }
    }
  }
})
