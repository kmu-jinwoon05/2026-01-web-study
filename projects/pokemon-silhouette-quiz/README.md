# Pokemon Silhouette Quiz + Supabase + Vercel

이 프로젝트는 HTML, CSS, JavaScript만 사용하는 정적 웹페이지입니다.

## 폴더 구조

```text
pokemon-silhouette-quiz/
  api/
    pokemon.js
  supabase/
    setup.sql
  index.html
  script.js
  style.css
  vercel.json
  .env.example
```

## 어떻게 동작하나요?

1. 브라우저의 `script.js`가 `/api/pokemon`을 호출합니다.
2. Vercel의 `api/pokemon.js`가 Supabase에서 데이터를 읽어 옵니다.
3. 받아 온 포켓몬 데이터로 퀴즈를 시작합니다.

프론트는 Supabase 주소를 직접 호출하지 않고, 항상 `/api/pokemon`만 호출합니다.

## 1. Supabase 테이블 만들기

Supabase SQL Editor에서 [supabase/setup.sql](C:\Users\jinwo\OneDrive\문서\2026-01-web-study\projects\pokemon-silhouette-quiz\supabase\setup.sql) 파일 내용을 실행하세요.

이 SQL은 아래 작업을 해 줍니다.

- `pokemon_quiz_items` 테이블 생성
- 공개 읽기 정책 생성
- 포켓몬 퀴즈 데이터 삽입

## 2. 로컬 환경 변수 만들기

이 프로젝트 폴더에 `.env.local` 파일을 만들고 아래처럼 작성하세요.

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

실제 값은 이미 가지고 있는 Supabase URL과 publishable key를 넣으면 됩니다.

## 3. Vercel에 배포하기

Vercel에서 이 폴더를 프로젝트 루트로 잡아 배포하세요.

- Root Directory: `projects/pokemon-silhouette-quiz`
- Environment Variables:
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`

배포가 끝나면 프론트는 자동으로 같은 도메인의 `/api/pokemon`을 호출합니다.

## 4. 중요한 보안 메모

- `service_role` 키는 사용하지 않습니다.
- secret key도 사용하지 않습니다.
- 이 예제는 읽기 전용 공개 데이터만 다룹니다.
- 공개 가능한 데이터만 `anon` 정책으로 열어 주세요.
