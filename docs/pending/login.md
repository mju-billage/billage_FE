# 로그인 화면 QA — `COM-1-PAGE-01-0`

파일: `src/screens/LoginScreen.tsx`
라우트: `Login`
관련 공용 컴포넌트: `TextField`, `Button`, `TextButton`

---

## 해결

| 항목 | 내용 | 범위 | 커밋 |
|---|---|---|---|
| TextField 좌우 마진 | `paddingLeft: 16` / `paddingRight: 10` | 전역 | `774840c` |
| Clear 버튼 레이아웃 | 조건부 렌더 → 항상 렌더 + opacity (값 있을 때만 노출) | 전역 | `774840c` |
| caption 폰트 크기 | 8 → 10 (명세는 `Font Size/250` = 10) | 전역 | `774840c` |
| 눈 아이콘 표시 조건 | 포커스 또는 값이 있을 때만 노출 | 전역 | `b976ae3` |
| TextButton tertiary 색 | `#9B9B9B` → `#4B5563` | 전역 (14곳) | `b976ae3` |
| Button 자간 | 1.25 → 0 (피그마 실제 값) | 전역 | `fdc7e8b` |
| Badge 자간 | 1.5 → 0 (피그마 실제 값) | 전역 | `fdc7e8b` |
| 소셜 로그인 버튼 | 이니셜 글자 → 브랜드 로고 이미지, 지름 40dp | 화면 | `33f627d` |
| 입력 텍스트 색 | `#070A23` → `#4B5563` | 전역 (21개 화면) | `045a7e5` |
| Clear 버튼 연결 | 이메일·비밀번호 칸에 `onClear` 전달 | 화면 | `045a7e5` |

### 처리 중 알게 된 것

- `Other/Button` 은 피그마 실제 값이 자간 0 인데 `Typography Style.pdf` 에는
  `3xl`(1.25) 로 적혀 있다. `Other/Badge` 도 같은 식으로 어긋나 있었다.
  **자간은 PDF 보다 피그마가 맞다.** 나머지 13개 스타일은 둘이 일치함을 확인했다.
- `Font Weight` 표의 100~500 은 피그마 변수 순번이지 CSS 굵기가 아니다.
  코드가 이름 기준으로 Light 300 / Regular 400 / Medium 500 /
  SemiBold 600 / Bold 700 을 쓰는 게 맞다.
- 눈 아이콘을 `isFocused` 조건부 렌더로 만들면 탭하는 순간 blur 로
  언마운트되어 `onPress` 가 씹힌다. clear 버튼과 같은 opacity 방식이어야 한다.

---

## 보류

### 아이디/비밀번호 오류 개별 안내 (★★)

시트는 틀린 칸 아래에 각각 다른 문구를 띄우라고 한다. 서버가 실패 원인을
구분해주지 않아서 프론트 단독으로는 불가능하다. → `backend.md` 1번

프론트에서 같이 해야 할 것:
- `LoginScreen` 에 `emailError` state 추가
- 이메일 `TextField` 에 `error` prop 연결 (현재 비밀번호 칸에만 있다)
- 이메일 형식 검증은 서버에 묻지 않고도 가능하므로 함께 넣을 수 있다

---

## 확인 안 한 것

- 소셜 로그인 실제 동작. 에뮬레이터에서는 카카오·네이버 앱이 없어 웹뷰로
  넘어가고 구글은 계정 로그인이 필요하다. 실기기로 봐야 한다.
- 빈 비밀번호 칸에서 눈 아이콘을 누르면 blur 로 아이콘이 바로 사라진다.
  가릴 내용이 없어 실해는 없지만 깜빡임이 거슬릴 수 있다.

---

## 검증 환경

에뮬레이터 AVD `1` — 1080×2340 / 480dpi → 논리 폭 360dp.
시안 프레임과 1:1 이라 간격을 눈으로 재도 된다.

```
emulator -avd 1 -no-snapshot-load
adb shell wm size      # 1080x2340
adb shell wm density   # 480
```
