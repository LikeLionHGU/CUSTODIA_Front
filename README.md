# MCM 케어 (CUSTODIA Care)

MCM 애프터서비스(A/S) 프론트엔드. 제품 등록 → AI 손상 분석·예상 견적 → 픽업 예약 → 수선 진행 조회까지의 흐름을 다룬다.
React 19 + Vite + styled-components 로 만들었고, 한국어·영어·독일어를 지원한다.

## 개발

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run lint     # oxlint
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

백엔드 주소는 `.env.local` 에서 설정한다. 개발 서버가 `/api` 요청을 `VITE_API_PROXY_TARGET` 으로 넘겨 주므로
브라우저 기준으로는 동일 출처가 되어 CORS 문제가 없다.

## 배포 (GitHub Pages)

`main` 에 푸시하면 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 이 빌드해서 Pages 로 올린다.
배포 주소는 `https://likelionhgu.github.io/MCMcare_Front/` 이다.

처음 한 번은 저장소에서 아래를 설정해야 한다.

1. **Settings → Pages → Source** 를 `GitHub Actions` 로 바꾼다.
2. **Settings → Secrets and variables → Actions → Variables** 에 `VITE_API_BASE_URL` 을 백엔드 절대주소로 추가한다.
   (예: `https://api.example.com/api`)
3. 백엔드의 CORS 허용 출처에 `https://likelionhgu.github.io` 를 추가한다.
4. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 에서 해당 OAuth 클라이언트의
   **승인된 자바스크립트 원본**에 `https://likelionhgu.github.io` 를 추가한다. (구글 로그인용)

### 배포 시 주의할 점

- **API 주소는 절대주소여야 한다.** 정적 호스팅에는 개발 서버 프록시가 없어서 `/api` 로 나가면 404 가 난다.
- **백엔드도 HTTPS 여야 한다.** Pages 는 HTTPS 라서 `http://` 주소를 부르면 브라우저가 혼합 콘텐츠로 차단한다.
- `VITE_API_BASE_URL` 을 지정하지 않아도 화면은 정상적으로 뜬다. API 를 쓰는 영역만 에러 문구로 대체된다.
- 저장소 이름이 경로에 붙으므로 빌드 시 `base` 가 `/MCMcare_Front/` 로 설정된다.
  커스텀 도메인을 쓰면 저장소 변수에 `VITE_BASE_PATH=/` 를 추가한다.
- `/my-as-list` 처럼 하위 주소로 바로 들어와도 되도록 빌드 시 `dist/404.html` 을 함께 만든다.
  (Pages 가 없는 경로에 404.html 을 돌려주면 앱이 떠서 라우터가 주소를 읽는다)
