import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // 프론트에서 /api 로 호출하면 개발 서버가 백엔드(Spring Boot, 기본 8080)로 넘긴다.
    // 백엔드 주소가 다르면 .env.local 에 VITE_API_PROXY_TARGET 을 지정한다.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
