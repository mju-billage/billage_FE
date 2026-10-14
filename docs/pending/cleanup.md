# 코드 정리 백로그

막힌 건 없고, QA 커밋을 깨끗하게 유지하려고 뒤로 미뤄둔 것들.
화면 QA가 한 바퀴 돌면 한 번에 묶어서 처리한다.

---

## 1. `src/` 에 남은 주석 37줄 (18개 파일)

2026-09-25 에 `src/` 주석을 전면 제거했는데(커밋 `b4155f4`) 일부가 남아 있다.
그때 "오탐 1건 외에 남은 주석 없음"으로 보고됐지만 실제로는 아니었다.
`src/constants/typography.ts` 1~3행이 대표적이다. Report·Receipt·GroupManager·Member
쪽 화면 파일에 분산돼 있다.

처리할 때 남길 것은 `eslint-disable` 계열 22개와 `@ts-ignore` 계열뿐이다.
단순 문자열 치환 말고 TypeScript Compiler API 로 처리한다.

## 2. 죽은 상수 2개

- `GREY_700` (`src/constants/colors.ts`) — `GREY_800` 과 값이 같고(`#374151`)
  어디서도 참조되지 않는다. 둘 중 하나가 오타일 가능성이 있으니
  지우기 전에 팔레트 명세와 대조할 것.
- `SOCIAL_KAKAO_TEXT` — QA-003 에서 소셜 버튼을 브랜드 로고 이미지로
  바꾸면서 참조가 사라졌다.

## 3. `LoginScreen.tsx` 의 스페이서 3개

```tsx
<View id="hv" style={{ height: 8 }} />
```

`id` 는 RN `View` 에 없는 속성이고, 인라인 스타일이라 lint 경고의 원인이다.
부모에 `gap` 을 주는 방식으로 바꾸는 게 맞다.

## 4. `docs/screen-map.tsv` 의 빈 `screen_id` 78건

주석을 지우면서 `@screen` 태그가 사라져 코드에서 화면 ID를 알 수 없다.
추측으로 채우지 말고, QA 시트를 받을 때마다 그 화면 행만 채워나간다.

## 5. eslint 경고 50건

전부 error 가 아니라 warning 이다. 대부분
`react-native/no-inline-styles` 다. 레이아웃 작업이 끝난 뒤에 보는 게
효율적이다.

## 6. `npm test` 커버리지

현재 `__tests__/folderTree.test.ts` 하나뿐이다(6 테스트).
`App.test.tsx` 는 네이티브 모듈 모킹 부담이 커서 2026-09-25 에 제거했다
(커밋 `bc00ea5`). 필요해지면 그때 jest 모킹 세팅을 갖춰 되살린다.

## 7. NAVY_800 을 배경색으로 직접 쓰는 컴포넌트

Button.tsx 는 `0833cec` 에서 FILL_PRIMARY 로 고쳤고, FAB.tsx 는
QA-018 에서 같은 방식으로 해결했다. 아래 두 곳은 아직 원시 상수
NAVY_800 을 배경색으로 직접 쓴다. 같은 유형일 수 있다.
- `src/components/Input/Button/AttachmentAddButton.tsx:84`
- `src/components/Navigation/Bottom Navigation/BottomNavigation.tsx:81, 88`
시안이 이 셋을 지적한 적은 없다. 해당 컴포넌트가 나오는 화면의
QA 시트가 오면 그때 함께 확인한다. 글자색으로 쓰는 곳은
FOREGROUND_PRIMARY 와 값이 같아 문제가 아니다.

## 8. 스낵바 close 버튼 미연결 화면

Snackbar 는 onClose 를 받을 때만 close 버튼을 그린다.
QA-013 에서 EmailVerificationScreen 만 연결했다.
나머지 스낵바 사용 화면은 각 화면 QA 시트가 올 때 함께 연결한다.
연결 방법은 onClose={() => setSnackbarMessage(null)} 한 줄이다.

## 9. MOCK_DASHBOARD_SUMMARY 정리

버그가 아니라 이름과 죽은 필드의 문제다.
대시보드는 이미 실제 API 를 쓴다.
GET /api/v1/groups/{groupId}/dashboard 와
GET /api/v1/groups/{groupId}/calendar 를 화면 진입 시 함께 호출하고,
미니 캘린더와 '다가오는 회비' 카드를 그 응답으로 그린다.
로딩·오류·재시도 처리도 되어 있다.

DashboardScreen 이 MOCK_DASHBOARD_SUMMARY 에서 실제로 쓰는 것은
quickServices 하나뿐이다. 보고서 생성 / 통계·분석 / 증빙자료 앨범
바로가기 3개의 아이콘·문구·이동 대상이고, 원래 고정값이라
API 로 받을 데이터가 아니다.

같은 객체의 나머지 필드(miniCalendar 의 금액, duesProgressList,
userNickname)와 MINI_CALENDAR_AMOUNTS 는 어디에서도 쓰이지 않는다.

할 일:
- quickServices 를 상수 파일로 옮기고 이름에서 MOCK 을 뺀다
- 쓰이지 않는 더미 필드와 MINI_CALENDAR_AMOUNTS 를 삭제한다
- 관련 파일: src/screens/Dashboard/DashboardScreen.tsx,
  src/types/dashboard.ts

백엔드 대기 항목이 아니다.
