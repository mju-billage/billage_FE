# 약관 동의 화면 QA — `COM-2-PAGE-01-0`

파일: `src/screens/Signup/TermsAgreementScreen.tsx`
라우트: `TermsAgreement`
관련 공용 컴포넌트: `AgreementCheckboxRow`, `CheckBox`, `BackButton`, `AppBar`

---

## 해결

| 항목 | 내용 | 범위 | 커밋 |
|---|---|---|---|
| GREY_400 색상값 | `#9B9B9B` → `#9CA3AF` (피그마 변수 기준) | 전역 | `240a7a7` |
| CheckBox 크기·테두리 | `22`→`20`, `borderRadius 4`→`2`, `borderWidth 1`→`1.5`(실측: 불투명 1px + 알파 1px), 체크마크 `14`→`16` | 전역 | `240a7a7` |
| CheckBox 비활성 상태 | 체크 전/후를 `disabledUnchecked`(테두리만)/`disabledChecked`(배경 채움)로 분리 | 전역 | `240a7a7` |
| BackButton 레이아웃 | 가로 크기 없이 늘어나던 `Pressable`에 24×24 고정 크기 부여 (화면 가운데로 밀리던 문제) | 전역 | `240a7a7` |
| BackButton 아이콘 크기 | `size * 0.6`(호출부마다 다른 크기) → `24` 고정, `size` prop 제거 | 전역 | `240a7a7` |
| 약관 동의 화면 마진 | `backRow`/`title` 하단 마진 `16`/`24` → `32`/`32` | 화면 | `240a7a7` |
| Arrow 아이콘 색 | `FOREGROUND_DISABLED` → `FOREGROUND_NEUTRAL_SUBTLE` | 전역(`AgreementCheckboxRow`) | `240a7a7` |

### 처리 중 알게 된 것

- `FOREGROUND_NEUTRAL_SUBTLE`와 `BORDER_NEUTRAL_BOLD`가 `GREY_400`을 참조해서
  GREY_400 한 줄만 바꿔도 색이 쓰이는 모든 곳(`FOREGROUND_NEUTRAL_SUBTLE`은
  수십 곳, `BORDER_NEUTRAL_BOLD`는 `BottomSheet`/`CheckBox` 2곳)에 번진다.
  범위를 좁히지 말라는 지시와 맞음.
- `BackButton`에 `size` prop 쓰던 곳은 `AppBar.tsx` 한 곳(`size={34}`)뿐이었다.
  나머지 화면들은 전부 prop 없이 기본값만 쓰고 있어서 호출부 수정이 필요 없었다.

---

## 보류

없음.

---

## 확인 안 한 것

- CheckBox `disabledUnchecked`/`disabledChecked` 실기기 렌더 — 보더 두께 1.5가
  저밀도 화면에서 어떻게 보이는지 에뮬레이터로만 확인함.

---

## 검증 환경

QA-001(`login.md`)과 동일.
