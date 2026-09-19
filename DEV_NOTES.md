# 개발 진행 메모 (로컬 전용, git에 올리지 않음)

> 이 문서는 다음 작업을 이어갈 때 참고하기 위한 개인 메모입니다. `.gitignore`에 등록되어 있어 커밋되지 않습니다.

---

## 1. 완료된 작업

### 스플래시 화면 수정 — 완료, 병합됨
- 원인: `RootNavigator.tsx`의 `isLoading`이 `useState(false)`로 고정되어 `<SplashScreen />` 분기가 한 번도 실행되지 않던 버그.
- 수정: 초기값 `true` + `useEffect`로 1.5초 후 `setIsLoading(false)`.
- PR #10 (`fix/splash-loading-state` → `develop`), **머지 완료**.

### 앱 아이콘 교체 — 완료, 병합됨 (참고)
- `src/assets/images/Billage_simbol_big.png` 심볼로 Android 런처 아이콘(mdpi~xxxhdpi) 교체.
- PR #6 (`feature/app-icon` → `develop`), **이미 머지되어 있던 작업** (이번 세션 이전에 완료됨).

### 카카오/네이버/구글 소셜 로그인 프론트 구현 — ⚠️ 아직 커밋 안 됨 (로컬에만 존재)
- 라이브러리 설치: `@react-native-seoul/kakao-login`, `@react-native-seoul/naver-login`, `@react-native-google-signin/google-signin`, `react-native-config`
- Android 네이티브: `build.gradle`에 `react-native-config` 적용 + 카카오 매니페스트 placeholder, `AndroidManifest.xml`에 카카오 리다이렉트 액티비티 추가
- `App.tsx`: 네이버/구글 SDK 초기화 코드
- 신규 `src/services/socialAuthService.ts`: 카카오/네이버/구글 SDK 호출 → `SocialProfile`로 정규화, 사용자 취소 시 `null` 반환
- `src/services/authService.ts`: `socialLogin`/`socialSignup` 함수 추가 (엔드포인트 `/api/v1/auth/social/login`, `/api/v1/auth/social/signup`은 **가정치**, 백엔드 확정 필요)
- `src/types/social.ts`: `SocialProfile` 타입 추가
- `src/navigation/RootNavigator.tsx`: `SocialSignupInfo` 파라미터를 `{ provider }` → `{ profile }`로 변경
- `src/screens/LoginScreen.tsx`, `src/screens/SocialSignupInfoScreen.tsx`: 실제 로직 배선 완료
- 에뮬레이터 실기기 테스트 완료: 카카오(웹뷰 폴백)/네이버(브라우저)/구글(Play Services 다이얼로그) 버튼 모두 크래시 없이 정상 동작 확인. 단, `.env`가 플레이스홀더라 실제 로그인 성공까지는 미검증.

### 목(mock) 로그인 — 완료, 로컬에만 존재
- `LoginScreen.tsx`에 개발 모드(`__DEV__`)에서만 보이는 "목 계정으로 로그인 (개발용)" 버튼 추가.
- 실제 네트워크 호출 없이 이메일/비밀번호 입력창을 목 데이터로 채우고 `isMockLoggedIn` 상태만 표시 — 백엔드 없이 프론트 화면 흐름만 확인하기 위한 용도.

---

## 2. 현재 git 상태 (2026-07-27 기준)

- 현재 브랜치: `fix/splash-loading-state` — **이미 PR #10로 머지된 브랜치라 여기에 커밋하면 안 됨.** 소셜 로그인/목 로그인 커밋은 `develop`에서 새 브랜치를 파서 진행할 것.
- 미커밋 수정 파일: `.gitignore`, `App.tsx`, `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`, `package.json`/`package-lock.json`, `src/navigation/RootNavigator.tsx`, `src/screens/LoginScreen.tsx`, `src/screens/SocialSignupInfoScreen.tsx`, `src/services/authService.ts`, `src/types/social.ts`
- 신규 미추적 파일: `.env.example`, `react-native-config.d.ts`, `src/services/socialAuthService.ts`
- `.env`는 실제 값이 아니라 플레이스홀더 상태이며 `.gitignore`에 등록되어 커밋 대상 아님.
- `metro2.log`는 무관한 로그 파일, 커밋 대상 아님.

---

## 3. 콘솔 등록 시 입력할 값 (재사용 가능)

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

---

## 4. 남은 일 (TODO)

- [ ] 카카오 디벨로퍼스 / 네이버 API 센터 / 구글 클라우드 콘솔에 앱 등록하고 `.env`에 실제 키 채우기 (본인 진행)
- [ ] 백엔드 팀과 `/api/v1/auth/social/login`, `/api/v1/auth/social/signup` 엔드포인트 및 `SOCIAL_MEMBER_NOT_FOUND` 에러 코드 확정
- [ ] 로그인 성공 후 이동할 홈 화면 구현 — 완성되면 `LoginScreen.tsx`의 `performLogin`, `handleSocialLogin` 안의 TODO 주석 두 군데 연결
- [ ] 실제 키 발급 후 카카오톡/네이버 앱 연동까지 실기기 테스트 (현재는 에뮬레이터 웹 로그인 폴백까지만 확인)
- [ ] 위 변경사항들을 `develop` 기준 새 브랜치로 커밋 + PR
