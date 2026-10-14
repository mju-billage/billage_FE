# 가입 완료 화면 QA — `COM-5-PAGE-01-0`

파일: `src/screens/Signup/SignupCompleteScreen.tsx`
라우트: `SignupComplete`, `GroupOnboarding`(동일 컴포넌트 공유)
관련 공용 컴포넌트: `Button`, `TextButton`, `BackButton`

---

## 해결

| 항목 | 내용 | 범위 | 커밋 |
|---|---|---|---|
| 타이틀 상단 마진 | `backRow.marginBottom` 16→32 | 화면(두 라우트 공통) | `a9bb88e` |
| 설명 문구 토큰·색·마진 | `body2`→`subtitle4`, `FOREGROUND_NEUTRAL_NORMAL`→`FOREGROUND_NEUTRAL_SUBTLE`, `marginBottom: 32` 추가 | 화면(두 라우트 공통) | `a9bb88e` |
| "코드로 참여하기" 버튼 | `hierarchy="secondary"`→`"tertiary"`(연파랑 배경이 아니라 연회색 배경 진회색 글씨가 시안) | 화면(두 라우트 공통) | `a9bb88e` |
| Button secondary 배경(전역) | `BACKGROUND_PRIMARY`(#F0F5FE)→`FILL_SECONDARY_SUBTLE`(#DCE8FB, 피그마 실측 #DFE8F9에 더 근접) | 전역 | `a9bb88e` |

### 처리 중 알게 된 것

- 이 파일은 `SignupComplete`/`GroupOnboarding` 두 라우트가 공유해서
  분기 없이 공통으로 적용함 — 둘 다 같이 바뀜.
- "모임 생성하기" 버튼은 `hierarchy` 안 넘겨 기본값 primary 그대로 둠.
- `title.marginBottom: 8`, `footer`, `buttonGap`, `logoutRow`는 지적 대상이
  아니라서 안 건드림.
- `Button.tsx`의 `hierarchy="outlined"`를 쓰는 곳은
  `ReportCreateByLedgerScreen.tsx:199` 한 곳뿐. 디자인 컴포넌트에
  outlined variant가 없다는 지적은 있었지만 이번엔 안 건드림.

---

## 보류

없음.

---

## 확인 안 한 것

- `GroupOnboarding`(기존 회원 모임 온보딩) 쪽 실제 진입 경로에서
  바뀐 레이아웃을 직접 눌러보지는 않음 — 코드 공유 구조상 `SignupComplete`
  확인으로 대체함.

---

## 검증 환경

QA-001(`login.md`)과 동일.
