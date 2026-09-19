# 개발 진행 메모

> 2026-09-19 7-2부터 git 추적 대상이다(공유 저장소 — 개인 정보·절대경로·키를 적지 않는다). 2026-09-19 7-1 압축 — 해결된 항목은 한 줄로, 미해결만 상세히 남겼다(압축 전 원문은 커밋 `9fb481d`).

---

## 1. 해결됨 (코드 확인)

- [해결] 스플래시 화면 `isLoading` 초기값 버그 — `RootNavigator.tsx`가 `useState(true)`로 `<SplashScreen />` 분기를 탄다 (PR #10, 2026-07)
- [해결] 앱 아이콘 교체 — `Billage_simbol_big.png` 기반 런처 아이콘(mdpi~xxxhdpi) (PR #6, 2026-07)
- [해결] 카카오/네이버/구글 소셜 로그인 프론트 구현·커밋 — `src/services/socialAuthService.ts`, `src/types/social.ts`, `authService.socialLogin/socialSignup`, `react-native-config`, `.env.example` 전부 git 추적 중 (2026-07-27)
- [해결] 소셜 엔드포인트 `POST /auth/social/login`·`/auth/social/signup` 존재 — Swagger 대조로 "구현" 확인(`docs/api-wiring.md`, 2026-09-11)
- [해결] 목(mock) 로그인 개발용 버튼 — `LoginScreen.tsx`에 `__DEV__`에서만 노출
- [해결] 로그인 성공 후 홈 화면 연결 — 대시보드 구현, `LoginScreen`의 옛 TODO 없음 (2026-09)
- [해결] 소셜 로그인 변경사항 커밋 — 이 메모의 옛 "git 상태(2026-07-27)" 절은 낡아 삭제

---

## 2. 콘솔 등록 시 입력할 값 (재사용 가능, 운영 값)

`android/app/debug.keystore`에서 추출한 값 (팀 전원 동일한 파일이라 값도 동일):

```
SHA-1(콜론 형식):  5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
카카오 키 해시:    Xo8WBi6jzSxKDVR4drqm84yr9iU=
패키지명:          com.billage
```

| 콘솔 | 필요한 값 |
|---|---|
| 카카오 디벨로퍼스 | 패키지명 + 키 해시 (Redirect URI 불필요) |
| 네이버 API 센터 | 패키지명만 (SHA-1 불필요) |
| 구글 클라우드 콘솔 | Android용 클라이언트: 패키지명 + SHA-1 / Web용 클라이언트: ID를 `.env`의 `GOOGLE_WEB_CLIENT_ID`로 사용 |

`.env`에 채워야 할 키: `KAKAO_NATIVE_APP_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `GOOGLE_WEB_CLIENT_ID`

(같은 값이 `docs/lessons.md` §2에도 있다.)

---

## 3. 남은 일 (미해결 — 원문 유지)

- [ ] 카카오 디벨로퍼스 / 네이버 API 센터 / 구글 클라우드 콘솔에 앱 등록하고 `.env`에 실제 키 채우기 (본인 진행)
- [ ] 백엔드 팀과 `/api/v1/auth/social/login`, `/api/v1/auth/social/signup` 엔드포인트 및 `SOCIAL_MEMBER_NOT_FOUND` 에러 코드 확정 — ⏳ 2026-09-19 코드 확인: 엔드포인트 존재는 Swagger로 확인됐지만 `SOCIAL_MEMBER_NOT_FOUND`는 서버가 내려주는 코드가 아니라 `authService.ts:390`이 클라이언트에서 합성해 던지는 값이다 — 서버의 실제 "가입되지 않은 소셜 계정" 응답 코드는 미확정
- [ ] 실제 키 발급 후 카카오톡/네이버 앱 연동까지 실기기 테스트 (현재는 에뮬레이터 웹 로그인 폴백까지만 확인)
- [x] (2026-09-19) `authService.socialLogin`/`socialSignup`의 디버그용 `console.warn(...)` 제거 완료 (7-2). `SOCIAL_MEMBER_NOT_FOUND`가 클라이언트 합성 값이라는 주석도 코드에 달았다.
- [ ] **테스트 러너가 안 돈다 → 회귀 안전망 없음 (2026-09-19 기록, 지금 고치는 게 아니라 기록)**: `npm test`(= `jest`)가 `Validation Error: Preset @react-native/jest-preset not found`로 시작도 못 한다. 원인: `jest.config.js`가 `preset: '@react-native/jest-preset'`를 쓰는데 이 패키지가 `package.json`(dependencies/devDependencies)에도 `node_modules`에도 없다(RN 0.86에서 별도 패키지로 분리된 것으로 보이나 미확인 — `@react-native/*` 다른 패키지만 0.86.0으로 설치돼 있다). `jest`/`@types/jest`는 설치돼 있다. 실제 테스트 파일은 `__tests__/` 아래 **2개뿐**(`App.test.tsx` 1케이스 = RN 템플릿 기본 테스트, `folderTree.test.ts` 6케이스)이라 러너가 살아나도 커버리지는 `utils/folderTree`가 전부고, 화면·서비스·컴포넌트는 자동 검증이 전혀 없다. 지금 코드 변경의 유일한 자동 검증은 `tsc --noEmit`과 `eslint`(타입·린트)다.

- [ ] **`paddingTop` 하드코딩 화면 — 상단 인셋이 아니라 매직넘버를 쓴다 (2026-09-19 기록, 보류)**: 기기별 상단 인셋(상태바 높이)이 60dp가 아니면 위쪽이 어긋난다. `ScreenContainer edges`에 `top`을 넣고 `paddingTop`을 제거하는 게 정석이나, 레이아웃 검증 없이는 위험해 보류. 8-7에서 이 화면들을 `ScreenContainer edges={['bottom']}`로 옮겨 하단 인셋만 처리했고 `paddingTop: 60`은 그대로 뒀다.
  - `paddingTop: 60`(전수 `grep` 결과 10개): `Signup/TermsAgreementScreen`, `PasswordReset/PasswordResetScreen`, `PasswordReset/PasswordResetSentScreen`(← 처음 목록에 없던 것, 아직 `ScreenContainer` 미사용·배경 미판정), `Signup/SocialSignupInfoScreen`, `Signup/SignupInfoScreen`, `Signup/SignupCompleteScreen`, `Signup/EmailVerificationScreen`(슬롯 대기), `Folder/LedgerSearchScreen`, `Folder/LedgerCreateScreen`(슬롯 대기), `GroupManager/GroupCreateScreen`.
  - `paddingTop: 80`을 루트 컨테이너에 쓰는 화면: `LoginScreen`(슬롯 대기). 나머지 `paddingTop: 80`은 빈 상태 안내 영역의 값이라 인셋과 무관.
  - 예외: `Transactions/ReceiptScanFailedView`는 60이 아니라 `useSafeAreaInsets`로 직접 더한다(`insets.top + 12`) — 이미 정석이라 `edges={[]}`로 옮겼다.
