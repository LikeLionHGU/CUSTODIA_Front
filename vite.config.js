import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// GitHub Pages 프로젝트 페이지는 저장소 이름이 경로에 붙는다.
// (https://likelionhgu.github.io/CUSTODIA_Front/)
// 커스텀 도메인을 쓰면 루트가 되므로, 배포 워크플로가 actions/configure-pages 로
// 실제 경로를 받아 VITE_BASE_PATH 로 넘겨준다. 값이 없을 때만 아래 기본값을 쓴다.
const DEFAULT_BASE_PATH = '/CUSTODIA_Front/'

/** 앞뒤 슬래시를 맞춘다. configure-pages 는 '/CUSTODIA_Front' 처럼 끝 슬래시 없이 준다. */
function normalizeBasePath(value) {
  if (!value) return DEFAULT_BASE_PATH
  const withLeading = value.startsWith('/') ? value : `/${value}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

/**
 * GitHub Pages 에는 SPA 라우팅을 위한 서버 설정이 없다.
 * /my-as-list 같은 주소로 바로 들어오면 404 를 내는데, 이때 404.html 을 돌려주므로
 * index.html 을 그대로 복사해 두면 앱이 떠서 라우터가 주소를 읽는다.
 */
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = resolve(process.cwd(), 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 설정 파일에서는 .env 가 process.env 로 자동 주입되지 않으므로 직접 읽는다.
  // 세 번째 인자를 ''로 주면 VITE_ 접두사가 없는 값까지 모두 불러온다.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // 개발 서버는 루트에서 돌고, 빌드 결과만 저장소 경로 밑으로 들어간다.
    base: command === 'build' ? normalizeBasePath(env.VITE_BASE_PATH) : '/',
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      spaFallback(),
    ],
    server: {
      // 프론트에서 /api 로 호출하면 개발 서버가 백엔드로 넘긴다.
      // 주소를 바꾸려면 .env.local 의 VITE_API_PROXY_TARGET 을 수정한다.
      // 배포본에는 이 프록시가 없으므로 VITE_API_BASE_URL 에 절대주소를 넣어야 한다.
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
