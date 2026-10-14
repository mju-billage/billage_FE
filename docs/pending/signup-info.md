# 가입 정보 입력 화면 QA — `COM-3-PAGE-03-0`

파일: `src/screens/Signup/SignupInfoScreen.tsx`
라우트: `SignupInfo`
관련 공용 컴포넌트: `TextField`, `Button`, `ScreenContainer`

---

## 해결

| 항목 | 내용 | 범위 | 커밋 |
|---|---|---|---|
| TextField 라벨 타이포 | `subtitle3`→`subtitle2`({Subtitle/Subtitle2} 16/500/24/0.15) | 전역 | `108945a` |
| TextField 헬퍼 텍스트 색 | `FOREGROUND_NEUTRAL_SUBTLE`→`FOREGROUND_NEUTRAL_NORMAL`(#4B5563) | 전역 | `108945a` |
| 타이틀 상하 마진 | `backRow`/`title` 하단 마진 `16`/`24` → `32`/`32` | 화면 | `108945a` |
| 필수 표시(*) | 이름·이메일·비밀번호·비밀번호 확인 네 칸에 `required` 추가(원래 안 넘겨서 `*` 자체가 안 보였음) | 화면 | `108945a` |
| Clear 버튼 연결 | 네 칸 전부 `onClear` 추가(이메일은 `setEmailServerError(undefined)`도 같이) | 화면 | `108945a` |
| 키보드 동작 | `ScreenContainer avoidKeyboard={false}`로 버튼이 키보드 뒤로 가려지게, `scrollContent: { flexGrow: 1 }`로 빈 영역도 탭 닫힘 되게 | 화면 | `108945a` |

### 처리 중 알게 된 것

- `label`/`helperText` prop을 쓰는 화면이 각각 13곳/3곳이라, TextField
  라벨·헬퍼 색 변경이 그 전체에 번진다(범위를 좁히지 말라는 지시와 일치).
- `keyboardShouldPersistTaps="handled"`를 유지해야 한다. `"never"`로 바꾸면
  키보드가 떠 있을 때 눈 아이콘·X 버튼을 눌러도 키보드만 닫히고 버튼이
  안 눌린다(동작 자체는 손 안 댐, 확인만 함).
- `Button.tsx` 배경색(`0833cec`)과 자간(`fdc7e8b`)은 이미 반영돼 있어서
  이번엔 안 건드림.

---

## 보류

없음.

---

## 확인 안 한 것

- 실기기에서 `avoidKeyboard={false}` 적용 후 하단 버튼이 키보드에 완전히
  가려지는지 — 에뮬레이터 키보드 높이로만 확인함.

---

## 검증 환경

QA-001(`login.md`)과 동일.
