# 개발 진행 메모 (로컬 전용, git에 올리지 않음)

> 개인 메모. `.gitignore`에 등록돼 커밋되지 않는다. 2026-09-19 7-1 압축 — 해결된 항목은 한 줄로, 미해결만 상세히 남겼다(압축 전 원문은 세션 스크래치패드 백업이 유일했다 — 이 파일은 git 추적 대상이 아니다).

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
- [ ] (2026-09-19 발견) `authService.socialLogin`/`socialSignup`에 디버그용 `console.warn(...)`이 남아 있다 — README §6 "커밋에 console.log 남기지 않기" 위반 소지, 확인 후 정리
