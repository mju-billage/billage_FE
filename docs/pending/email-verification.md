# 인증번호 화면 QA — `COM-4-PAGE-01-0`

파일: `src/screens/Signup/EmailVerificationScreen.tsx`
라우트: `EmailVerification`
관련 공용 컴포넌트: `VerificationField`, `TextButton`, `Button`, `ScreenContainer`

---

## 해결

| 항목 | 내용 | 범위 | 커밋 |
|---|---|---|---|
| 코드 입력 박스 | `borderRadius 8→12`, 활성/에러 `borderWidth 1→2`, 폰트 `h3→h1` | 전역(VerificationField) | `f360d76` |
| 타이틀·설명 마진 | `backRow` 16→32, `subtitle.marginBottom` 24→32 | 화면 | `f360d76` |
| 설명 문구 토큰·색 | `body2`→`subtitle4`, `FOREGROUND_NEUTRAL_NORMAL`→`FOREGROUND_NEUTRAL_SUBTLE` | 화면 | `f360d76` |
| 만료 30초 이하 경고색 | `timerValueUrgent`(FEEDBACK_NEGATIVE_BOLD) 추가, 0초 되면 같은 자리에 만료 문구로 교체 | 화면 | `f360d76` |
| 재전송 버튼 색 | `hierarchy` 안 넘겨 primary(검정)로 나오던 것 → `tertiary` + `underline` | 화면 | `f360d76` |
| 키보드 동작 | `avoidKeyboard={false}`로 버튼이 키보드 뒤로 가려지게, 본문을 `Pressable`로 감싸 빈 공간 탭 시 `Keyboard.dismiss()` | 화면 | `f360d76` |
| `footer.marginTop: 'auto'` 제거 | `body`가 `flex: 1`이 되면서 불필요해짐 | 화면 | `f360d76` |
| 문구 상수 추가 | `EMAIL_VERIFICATION_EXPIRED_MESSAGE` | 화면 | `f360d76` |
| 재전송 문구 세로 정렬 | `resendRow`에 `alignItems: 'center'` 추가(라벨 body3과 TextButton button+패딩의 줄 높이가 달라 어긋나던 것) | 화면 | `80a652f` |
| 스낵바 close 버튼 연결 | `Snackbar`에 `onClose` 전달 | 화면 | `a9bb88e` |

### 처리 중 알게 된 것

- `h1`(fontSize 24 / lineHeight 32)이 44dp 박스 안에 들어간다.
  44 - 32 = 12dp 여유가 있어서 세로로 안 잘린다.
- `VerificationField` 내부 `Pressable`(코드 박스 탭 → focus)이 화면
  본문을 감싸는 바깥 `Pressable`(빈 공간 탭 → `Keyboard.dismiss`) 안에
  중첩돼 있다. RN 제스처 responder는 터치 지점에서 가장 안쪽 터처블이
  선점하므로, 코드 박스를 누르면 안쪽 것만 반응하고 바깥 `onPress`는
  발생하지 않는다. 둘 다 `onStartShouldSetResponder`를 건드리지 않는
  기본 `Pressable`이라 이 동작이 그대로 성립함을 코드로 확인했다.
- 재전송 버튼 색(#9CA3AF)이 `TextButton`의 네 hierarchy 색 중 어디에도
  정확히 안 맞는다. 가장 가까운 tertiary로 임시 적용 → `design.md` 3번.

---

## 보류

### 재전송 버튼 색상 (★)

시안 요구 색(#9CA3AF)이 피그마 TextButton 컴포넌트의 variant에 없음.
디자이너 확인 필요 → `design.md` 3번.

---

## 확인 안 한 것

- 실기기에서 `Pressable` 중첩 + `avoidKeyboard={false}` 조합이 키보드
  올라오고 내려갈 때 깜빡임 없이 자연스러운지 — 에뮬레이터로만 확인함.

---

## 검증 환경

QA-001(`login.md`)과 동일.
