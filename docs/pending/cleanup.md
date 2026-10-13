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
