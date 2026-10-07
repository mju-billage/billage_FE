# Billage

React Native 0.86 + TypeScript. 동아리·소모임 회비와 지출을 관리하는 앱.

## 스택
- React Native 0.86 / TypeScript
- React Navigation v7
- Android 우선 (iOS 미착수)

## 구조
- `src/screens/` 화면
- `src/components/` 공용 컴포넌트
- `src/navigation/` 네비게이터·라우트 타입
- `src/services/` API 클라이언트
- `src/constants/` 색상·타이포그래피·문구 상수
- `src/types/`, `src/utils/` 공유 타입·순수 함수
- `scripts/` 개발용 스크립트

## 검증
- `npx tsc --noEmit`
- `npx eslint src App.tsx`

## 빌드
`README.md` 참조.
