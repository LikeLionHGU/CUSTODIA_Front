import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 설정 파일에서는 .env 가 process.env 로 자동 주입되지 않으므로 직접 읽는다.
  // 세 번째 인자를 ''로 주면 VITE_ 접두사가 없는 값까지 모두 불러온다.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      // 프론트에서 /api 로 호출하면 개발 서버가 백엔드로 넘긴다.
      // 주소를 바꾸려면 .env.local 의 VITE_API_PROXY_TARGET 을 수정한다.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          configure: (proxy) => {
            // 브라우저가 붙인 Origin 을 그대로 넘기면 서버 CORS 필터가
            // "Invalid CORS request" 로 403 을 낸다. 프록시는 서버 간 호출이므로
            // Origin/Referer 를 떼어 일반 요청으로 만든다.
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin')
              proxyReq.removeHeader('referer')
            })
          },
        },
      },
    },
  }
})
