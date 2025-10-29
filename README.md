# 아저씨 렌탈 서비스

다양한 활동(산책, 대화, 조언 등)을 제공하는 아저씨들과 이러한 서비스를 필요로 하는 사용자들을 연결하는 플랫폼입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **State Management**: Zustand, React Query
- **Form Handling**: React Hook Form + Zod

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

#### 로컬 개발 환경 (권장)

Supabase CLI를 설치하고 로컬 개발 환경을 시작하세요:

```bash
# Supabase CLI 설치 (macOS)
brew install supabase/tap/supabase

# 로컬 Supabase 시작
npm run supabase:start
```

#### 프로덕션 환경

`.env.local.example` 파일을 `.env.local`로 복사하고 Supabase 프로젝트 정보를 입력하세요.

```bash
cp .env.local.example .env.local
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
├── components/          # 재사용 가능한 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── ui/             # 기본 UI 컴포넌트
├── lib/                # 유틸리티 함수 및 설정
└── types/              # TypeScript 타입 정의
```

## 주요 기능

- 🔍 아저씨 검색 및 필터링
- 👤 사용자 프로필 관리
- 📝 서비스 요청 및 관리
- ⭐ 리뷰 시스템
- 💬 실시간 알림
- 📱 반응형 디자인

## 개발 가이드

이 프로젝트는 spec-driven development 방식으로 개발됩니다. 
구현 태스크는 `.kiro/specs/ajussi-rental-service/tasks.md` 파일을 참조하세요.

## 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
   - `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`

3. 자동 배포 완료

### Supabase 설정

1. Supabase 프로젝트 생성
2. 데이터베이스 마이그레이션 실행:
   ```sql
   -- supabase/migrations/001_initial_schema.sql 내용 실행
   ```
3. OAuth 프로바이더 설정 (Google)
4. RLS 정책 활성화 확인

## 개발 가이드

### 코드 구조
- `/src/app` - Next.js App Router 페이지
- `/src/components` - 재사용 가능한 컴포넌트
- `/src/lib` - 유틸리티 함수 및 설정
- `/src/types` - TypeScript 타입 정의
- `/supabase` - 데이터베이스 스키마 및 마이그레이션

### 주요 기능
- ✅ 사용자 인증 (Google OAuth)
- ✅ 아저씨 프로필 관리
- ✅ 서비스 검색 및 필터링
- ✅ 서비스 요청 및 관리
- ✅ 리뷰 시스템
- ✅ 즐겨찾기 기능
- ✅ 반응형 디자인
- ✅ SEO 최적화

## 라이선스

MIT License