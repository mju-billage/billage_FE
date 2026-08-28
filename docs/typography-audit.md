# 타이포그래피 코드 대조 (typography-audit)

파일럿 5개 화면에서 "자간(letterSpacing) 차이는 360px 다운스케일 이미지로 판별 불가능"이라는 결론이
나와, 이미지 대조 대신 `src/` 전체를 코드로 훑어 타이포그래피 토큰 적용 여부를 확인했다. 스크린샷은
안 썼다.

## 배경: `babel-plugin-default-font.js`가 주는 것

`babel-plugin-default-font.js`는 모든 `<Text>`/`<TextInput>` JSX에 컴파일 타임으로
`style={[{fontFamily: 'Pyeojin Gothic'}, 기존 style]}`을 주입한다. **주입 범위는 fontFamily
하나뿐이다** — fontSize/lineHeight/letterSpacing/fontWeight는 전혀 안 건드린다. 즉 어떤 `<Text>`가
`TYPOGRAPHY.*` 토큰을 안 쓰면, 폰트 패밀리는 기본값(Pyeojin Gothic Regular)으로 맞더라도 크기·행간·
자간은 React Native 기본값(대략 14px, letterSpacing 0)으로 떨어진다 — Typography Style.pdf 스펙과
어긋난다. 이게 이번 감사가 잡으려는 것이다.

`src/constants/typography.ts`의 `TYPOGRAPHY` 객체(h1/h2/h3/subtitle1-4/body1-3/button/chips/badge/
caption/overline, 총 14개 토큰)가 유일한 정식 출처다.

## 방법

정적 분석 스크립트(1회성, 저장소에 안 넣음)로 `src/` 전체를 훑어 다음을 확인:

1. **모든 `<Text>` 여는 태그에 `style` prop이 있는가** — 없으면 즉시 결함(폰트 패밀리 말고는 아무
   것도 안 먹음).
2. **`style`이 참조하는 `styles.XXX` 키가 해당 파일의 `StyleSheet.create({...})` 안에서
   `...TYPOGRAPHY.*`를 스프레드하는가** — 배열 스타일(`style={[styles.a, cond && styles.b]}`)이면
   배열 안 아무 항목이나 TYPOGRAPHY를 가지면 통과(부모격 스타일 + 색상/굵기만 얹는 보조 스타일 패턴이
   실제로 많이 쓰임).
3. 위에서 안 걸린 나머지는 **React Native의 `<Text>` 중첩 스타일 상속**(부모 `<Text>`의 폰트 스타일이
   자식 `<Text>`로 자동 상속됨 — 웹의 인라인 텍스트 스타일과 동일한 동작) 때문에 실제로는 문제 없는
   경우가 있어 하나씩 수동으로 확인.
4. `fontSize|fontWeight|fontFamily|lineHeight|letterSpacing`를 `StyleSheet`에 **직접(TYPOGRAPHY 안
   거치고)** 쓰는 곳을 별도로 전수 검색(정규식, 스크립트 아님).

기확인 예외 2건(`Avatar.tsx` 동적 크기, `*.stories.tsx`)은 전부 제외.

## 결과: 실질적 결함 0건

167개 `.tsx` 파일, `<Text>` 257곳(다중 줄 태그 포함)을 검사한 결과 **TYPOGRAPHY 토큰을 안 쓰는
`<Text>`는 예외 2건을 빼면 없다.**

### 1) `<Text>` + TYPOGRAPHY 없음 — 0건 (예외 제외)

정적 분석 스크립트가 처음 후보 12건을 냈으나 전부 조사해 아래처럼 정리됨:

| 파일:줄 | 스크립트가 문제 삼은 것 | 실제 판정 |
|---|---|---|
| `Avatar.tsx:62` | `styles.initial` + 동적 `fontSize` | **기확인 예외** (아바타 크기 비례 폰트, 의도된 설계) |
| `InfoCard.tsx:44,58` | `styles.required`(색만 있음) | **정상** — `styles.fieldLabel`(body3) `<Text>` 안에 중첩된 `<Text>`라 부모 타이포그래피를 상속받음 |
| `SelectionListItem.tsx:63` | `styles.required`(색만 있음) | **정상** — `styles.title`(subtitle3) `<Text>` 안에 중첩, 상속됨 |
| `AgreementCheckboxRow.tsx:38` | `styles.tag`(색만 있음) | **정상** — `styles.label`(body2) `<Text>` 안에 중첩, 상속됨 |
| `EmailVerificationScreen.tsx:104` | `styles.timerValue`(색만 있음) | **정상** — `styles.timerText`(body3) `<Text>` 안에 중첩, 상속됨 |
| `NotificationListItem.tsx:47` | `styles.highlightedText`(굵기만 있음) | **정상** — `styles.description`(body3) `<Text>` 안에 중첩, 상속됨 |
| `FolderItem.tsx:101,104` | `styles.name`/`styles.subtitle` | **스크립트 오탐** — 이 파일은 `StyleSheet.create`가 2개(`graphicStyles`, `styles`)라 스크립트가 앞 블록만 읽었음. 실제 `styles.name`은 `TYPOGRAPHY.body3`+`fontWeight:'bold'`, `styles.subtitle`은 `TYPOGRAPHY.caption` — 정상 |
| `LoginScreen.tsx:82` | `socialBadgeStyles.label` (참조 자체를 못 찾음) | **스크립트 오탐** — 스타일 객체 이름이 `styles`가 아니라 `socialBadgeStyles`라 정규식이 못 잡음. 실제로는 `TYPOGRAPHY.h3` 스프레드돼 있음 (`LoginScreen.tsx:97-99`) |
| `BottomSheet.stories.tsx:29,33` | `styles.label` | **기확인 예외** (`*.stories.tsx`) |

`StyleSheet.create`가 파일당 여러 개인 경우가 코드베이스 전체에서 `FolderItem.tsx`·`LoginScreen.tsx`
딱 2곳뿐임을 별도 확인해서, 스크립트의 "첫 블록만 읽는" 한계가 이 둘 말고 다른 파일에 숨은 오탐/누락을
안 만든다는 것도 검증함.

### 2) TYPOGRAPHY 스프레드 후 fontSize/lineHeight/letterSpacing 덮어쓰기 — 0건

`^\s*(fontSize|fontWeight|fontFamily|lineHeight|letterSpacing):` 전수 검색 결과, `typography.ts`
자체를 빼면 코드베이스 전체에 **`fontWeight: 'bold'` 덮어쓰기 21곳뿐**이고 fontSize/lineHeight/
letterSpacing을 덮어쓰는 곳은 없다.

`fontWeight: 'bold'` 21곳은 전부 확인함 — `TYPOGRAPHY.body1/body2/body3/caption`(전부
`FONT_FAMILY.regular` 사용)을 스프레드한 스타일 위에 얹혀 있다. `typography.ts` 자체 주석대로
"PyeojinGothic-Regular/-Bold는 같은 Family로 묶여 fontWeight로 골라짐" — 즉 regular 계열 위의
`fontWeight:'bold'`는 실제로 폰트 파일이 Bold로 바뀌어 렌더된다. semibold/medium 계열(h2/h3/
subtitle1-4/button/chips/badge) 위에 `fontWeight:'bold'`를 얹은 사례는 **없음** — 있었다면 그건
별도 폰트 패밀리라 무시되는 진짜 버그였을 것.

이 중 다수(`TransactionsScreen.tsx`, `TransactionSearchScreen.tsx`, `ToolsMenu.tsx`,
`TransactionFilterSheet.tsx`, `InfoCard.tsx`, `ReportCard.tsx`, `FolderItem.tsx`)는 "12px+Bold
조합은 정식 스타일에 없어 body3+bold를 예외로 채택" 주석이 이미 달려 있어 의도된 패턴임이 코드
자체로 확인됨.

### 3) StyleSheet에 raw 폰트 속성 직접 지정 — 0건 (2)와 동일 집합)

전수 검색 결과 (2)에서 찾은 `fontWeight:'bold'` 21곳(Avatar.tsx 제외 시 20곳) 말고는
fontSize/fontFamily/lineHeight/letterSpacing을 raw로 지정한 곳이 코드베이스에 없다.

## 결론

- **코드 레벨에서는 타이포그래피 토큰이 예외 없이 정확히 적용돼 있다.** `<Text>`마다 직접 또는
  부모 `<Text>` 상속을 통해 반드시 `TYPOGRAPHY.*` 값(letterSpacing 포함)을 받는다.
- **파일럿에서 제기된 의문("letterSpacing 수정이 실제로 먹었는지")에 대한 답**: 코드는 이미 전부
  정확히 적용돼 있다. 파일럿의 "360px 이미지로는 안 보인다"는 관찰은 **렌더링 실패가 아니라
  캡처/육안 해상도의 한계**였다 — letterSpacing 값 자체(0~1.5dp)가 워낙 작아서 원본 배율(1x, 즉
  1080px 폭 원본)로 확대해도 육안 판별은 어려울 수 있다. 필요하면 스냅샷 테스트(`fontSize`/
  `letterSpacing` prop을 직접 assert)로 검증하는 게 이미지 대조보다 확실하다.
- 이번 감사에서 코드 수정은 하지 않았다(요청대로 조사만). 진짜 결함이 없어 고칠 것도 없다.
- 스크립트가 낸 오탐 2건(`FolderItem.tsx`, `LoginScreen.tsx`)은 파일당 `StyleSheet.create`가
  여러 개이거나 스타일 객체 이름이 관례(`styles`)를 벗어난 경우였다 — 코드 자체의 문제는 아니고
  감사 스크립트의 한계였음을 명시해둔다.
