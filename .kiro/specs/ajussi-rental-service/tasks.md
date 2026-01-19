# Implementation Plan

- [x] 1. 프로젝트 초기 설정 및 기본 구조
  - Next.js 14 프로젝트 생성 및 필수 패키지 설치
  - Tailwind CSS, shadcn/ui, Supabase 클라이언트 설정
  - 기본 폴더 구조 및 TypeScript 설정
  - _Requirements: 전체 시스템 기반_

- [ ] 2. Supabase 설정 및 인증 시스템
- [x] 2.1 Supabase 프로젝트 설정 및 데이터베이스 스키마 생성
  - Supabase 프로젝트 생성 및 환경 변수 설정
  - profiles, ajussi_profiles, requests, reviews, favorites 테이블 생성
  - ~~RLS 정칽 및 인덱스 설정~~ (API 레벨 권한 검증으로 대체, RLS 비활성화 완료)
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 7.1_

- [x] 2.2 Supabase Auth 인증 시스템 구현
  - Google, Kakao OAuth 프로바이더 설정
  - Supabase 클라이언트 설정 및 세션 관리
  - 인증 미들웨어 및 보호된 라우트 설정
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 2.3 인증 시스템 단위 테스트
  - Supabase Auth 설정 테스트
  - 세션 검증 테스트
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. 기본 레이아웃 및 공통 컴포넌트
- [x] 3.1 전역 레이아웃 및 네비게이션 구현                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  - RootLayout, Header, Footer 컴포넌트 생성
  - 반응형 네비게이션 메뉴
  - 로그인/로그아웃 상태 표시
  - _Requirements: 1.1, 3.1, 4.1_

- [x] 3.2 공통 UI 컴포넌트 구현
  - Button, Input, Modal, Toast 등 기본 컴포넌트
  - Loading, Error 상태 컴포넌트
  - 폼 검증을 위한 Form 컴포넌트
  - _Requirements: 2.4, 2.5, 2.6, 5.6_

- [ ]* 3.3 레이아웃 컴포넌트 단위 테스트
  - Header, Footer 렌더링 테스트
  - 네비게이션 상태 변경 테스트
  - _Requirements: 1.1, 3.1, 4.1_

- [ ] 4. 아저씨 목록 및 검색 기능
- [x] 4.1 아저씨 목록 API 구현
  - GET /api/ajussi 엔드포인트 생성 (Supabase 클라이언트 사용)
  - 페이지네이션, 필터링, 정렬 기능
  - 지역, 태그, 요금 기준 검색 (GIN 인덱스 활용)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4.2 아저씨 카드 컴포넌트 구현
  - AjussiCard 컴포넌트 생성
  - 프로필 이미지, 이름, 요금, 태그 표시
  - 즐겨찾기 기능 추가
  - _Requirements: 1.3_

- [x] 4.3 검색 및 필터 컴포넌트 구현
  - SearchFilter 컴포넌트 생성
  - 지역, 태그, 요금 범위 필터
  - 실시간 검색 결과 업데이트
  - _Requirements: 1.2_

- [x] 4.4 랜딩페이지 구현
  - 서비스 소개 섹션
  - 아저씨 목록 표시
  - 검색/필터 통합
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 4.5 아저씨 목록 기능 단위 테스트
  - API 엔드포인트 테스트
  - 필터링 로직 테스트
  - 컴포넌트 렌더링 테스트
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. 아저씨 상세페이지 및 요청 기능
- [x] 5.1 아저씨 상세 정보 API 구현
  - GET /api/ajussi/[id] 엔드포인트 생성 (Supabase 조인 쿼리)
  - 아저씨 프로필, 리뷰 데이터 조회
  - 평균 평점 계산 (Supabase 집계 함수 활용)
  - _Requirements: 2.1, 2.2, 7.1_

- [x] 5.2 아저씨 상세페이지 구현
  - AjussiDetail 컴포넌트 생성
  - 프로그레스바, 프로필 정보 표시
  - 오픈채팅 연결 버튼
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.3 서비스 요청 모달 구현
  - RequestModal 컴포넌트 생성
  - 날짜/시간, 소요시간, 장소, 의뢰내용 입력
  - 폼 검증 및 제출 처리
  - _Requirements: 2.4, 2.5, 2.6_

- [x] 5.4 요청 생성 API 구현
  - POST /api/requests 엔드포인트 생성 (Supabase insert)
  - 요청 데이터 검증 및 저장 (RLS 정책 적용)
  - Supabase Realtime으로 실시간 알림 전송
  - _Requirements: 2.4, 2.5, 2.6_

- [ ]* 5.5 상세페이지 및 요청 기능 단위 테스트
  - API 엔드포인트 테스트
  - 모달 컴포넌트 상호작용 테스트
  - 폼 검증 테스트
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 6. 사용자 프로필 관리
- [x] 6.1 프로필 조회 및 수정 API 구현
  - GET/PUT /api/profile 엔드포인트 생성 (Supabase 클라이언트)
  - 일반 사용자와 아저씨 프로필 구분 처리
  - Supabase Storage를 활용한 프로필 이미지 업로드
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 6.2 프로필 관리 페이지 구현
  - ProfileForm 컴포넌트 생성
  - 기본 정보 수정 (닉네임, 자기소개, 프로필 이미지)
  - 아저씨 전용 필드 (활동 토글, 소개, 지역, 요금)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.3 아저씨 통계 대시보드 구현
  - AjussiStats 컴포넌트 생성
  - 월별 요청 수, 수락률, 완료 수 표시
  - 활동 상태 토글 기능
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 6.4 프로필 관리 기능 단위 테스트
  - 프로필 수정 API 테스트
  - 폼 컴포넌트 테스트
  - 통계 계산 로직 테스트
  - _Requirements: 4.1, 4.2, 4.3, 6.1, 6.2, 6.3_

- [ ] 7. 의뢰 관리 시스템
- [x] 7.1 의뢰 목록 조회 API 구현
  - GET /api/requests 엔드포인트 생성 (Supabase RLS 활용)
  - 사용자별 신청/수신 의뢰 구분 조회
  - 상태별 필터링 및 정렬
  - _Requirements: 5.1, 5.2_

- [x] 7.2 의뢰 상태 변경 API 구현
  - PUT /api/requests/[id] 엔드포인트 생성 (Supabase update)
  - 수락, 거절, 완료, 취소 상태 변경
  - RLS 정책으로 권한 검증 (아저씨만 수락/거절 가능)
  - Supabase Realtime으로 상태 변경 알림
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 7.3 의뢰 카드 컴포넌트 구현
  - RequestCard 컴포넌트 생성
  - 상태별 버튼 표시 (취소, 수락, 거절, 완료)
  - 상태 변경 확인 모달
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 7.4 의뢰 관리 페이지 구현
  - 내가 신청한 내역 / 내가 받은 내역 탭
  - 의뢰 카드 목록 표시
  - 상태별 필터링 기능
  - _Requirements: 5.1, 5.2, 5.6_

- [ ]* 7.5 의뢰 관리 시스템 단위 테스트
  - 의뢰 상태 변경 API 테스트
  - 권한 검증 테스트
  - 컴포넌트 상호작용 테스트
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8. 리뷰 시스템
- [x] 8.1 리뷰 CRUD API 구현
  - POST /api/reviews 리뷰 작성 엔드포인트
  - GET /api/reviews 리뷰 목록 조회 (내가 쓴/받은 리뷰)
  - API 레벨 권한 검증
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8.2 리뷰 작성 컴포넌트 구현
  - ReviewModal 컴포넌트 생성
  - 별점 선택 UI (1-5점)
  - 코멘트 입력 및 검증
  - RequestCard에서 완료된 의뢰 리뷰 작성 버튼
  - _Requirements: 7.2, 7.3_

- [x] 8.3 리뷰 목록 컴포넌트 구현
  - /mypage/reviews 페이지 생성
  - 리뷰 카드 표시
  - 평균 평점 계산 및 표시
  - _Requirements: 7.1, 7.4_

- [ ]* 8.4 리뷰 시스템 단위 테스트
  - 리뷰 작성 API 테스트
  - 평점 계산 로직 테스트
  - 컴포넌트 렌더링 테스트
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9. 즐겨찾기 및 부가 기능
- [x] 9.1 즐겨찾기 API 구현
  - POST/DELETE /api/favorites 엔드포인트 생성
  - API 레벨 권한 검증
  - UNIQUE 제약조건으로 중복 방지
  - _Requirements: 2.2_

- [x] 9.2 즐겨찾기 페이지 구현
  - /mypage/favorites 페이지 생성
  - 즐겨찾기한 아저씨 목록 표시
  - 즐겨찾기 제거 기능
  - _Requirements: 2.2_

- [x] 9.3 이용 가이드 페이지 구현
  - 정적 페이지로 이용 절차 안내
  - FAQ 아코디언 UI
  - 주의사항 및 안전수칙 표시
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 9.4 시스템 페이지 구현
  - 404 오류 페이지
  - 이용약관 및 개인정보처리방침 페이지
  - 리마인드 배너 컴포넌트
  - _Requirements: 9.1, 9.2, 9.4_

- [ ]* 9.5 부가 기능 단위 테스트
  - 즐겨찾기 API 테스트
  - 정적 페이지 렌더링 테스트
  - _Requirements: 2.2, 8.1, 8.2, 8.3, 9.1, 9.2, 9.4_

- [ ] 10. 통합 및 최종 검증
- [x] 10.1 전체 시스템 통합
  - 모든 기능 연결 및 데이터 흐름 검증
  - 사용자 권한 및 보안 검증
  - 반응형 디자인 최종 확인
  - _Requirements: 전체 시스템_

- [x] 10.2 성능 최적화 및 실시간 기능
  - Next.js Image 최적화 및 lazy loading
  - Supabase Realtime 채널 설정 (요청 상태 업데이트)
  - 번들 크기 최적화
  - _Requirements: 전체 시스템 성능_

- [ ]* 10.3 E2E 테스트 구현
  - 사용자 회원가입/로그인 플로우
  - 아저씨 검색 및 요청 플로우
  - 의뢰 관리 플로우
  - _Requirements: 전체 시스템_

- [x] 10.4 배포 준비
  - Supabase 환경 변수 설정 (URL, ANON_KEY, SERVICE_ROLE_KEY)
  - Supabase 프로덕션 환경 설정
  - Vercel 배포 설정 및 환경 변수 연결
  - _Requirements: 전체 시스템_