# Billage — 클로드 코드 지침

## 프로젝트
소모임/친목회 회비·지출 관리 앱. 총무가 회비를 걷고 장부(폴더 트리)로 수입/지출을 기록하며 영수증(OCR·촬영)·보고서·보관함을 다룬다. 기획 원본 `Billage_IA.xlsx`(V0.4, 201개 정의) → [docs/billage-ia.md](docs/billage-ia.md).
화면은 코드상 모두 존재한다(로그인/가입/이메일 인증/재설정, 대시보드, 내역, 폴더/장부, 납부관리, 모임 관리, 보고서, 보관함, 증빙 앨범, 통계, 설정, 탈퇴, 내역 추가 FAB). **남은 일 = [docs/design-verification.md](docs/design-verification.md) §2·§5의 미해결 항목**(시안 대조·판단 대기). 작업 이력은 이 파일에 쓰지 않는다.

## 작업 전 필수
1. **[README.md](README.md)의 규칙**(네이밍·구조·아키텍처·스타일·Git·금지·주석)을 따른다. README와 코드가 다르면 무엇이 최신인지 사용자에게 확인한다.
2. **[docs/lessons.md](docs/lessons.md)를 읽는다** — 재발성 함정(인코딩·edge-to-edge·fallback 문구·Swagger `userId`), 운영 값(BASE_URL·테스트 계정), 시안↔설명표 불일치 #1~#11, 정정 이력.
3. 화면을 만들거나 고칠 때 파일 상단에 `/** @screen <Screen ID> <이름> */` 주석을 남긴다.

## 기술 스택
React Native 0.86(새 아키텍처, `targetSdk` 36 → **edge-to-edge 강제**) · React 19 · TypeScript · React Navigation v7(native-stack, bottom-tabs) · `react-native-keyboard-controller`(키보드) · `react-native-safe-area-context` · Reanimated 4 · SVG · Keychain(토큰) · react-native-config(`.env`) · 소셜 로그인(카카오/네이버/구글) · Storybook(웹). 폴더: `src/{screens,components,constants,navigation,services,types,utils}`. Android `applicationId` = `com.billage`.

## 화면 ID 체계
`{영역}-{Depth}-{포맷}-{일련번호}-{변형}` 예: `DUE-2-PAGE-03-0`. 영역: COM(로그인/가입/탈퇴) · DSH(대시보드) · DTB(내역) · FDR(폴더/장부) · DUE(납부관리) · ETC(더보기) · ADD(내역 추가 FAB). 포맷: `PAGE`/`MODAL`/`SHEET`/`SNACKBAR`. IA에 ID가 없는 화면(예: `SplashScreen`)은 §2에 `(ID 없음)`으로 둔다.

## 문서 동기화 규칙 (3표)
화면의 상태 등급이 바뀌면 **`docs/design-verification.md`의 ① §2 해당 행 ② §1 상태 요약표 ③ §1 도메인별 표**를 함께 고친다(합계 159 = IA 고유 Screen ID와 교차검증되므로 IA에 없는 행은 상태 표에 넣지 않는다). 배경 판정은 §1 "배경 판정 현황"(§2 실제 행 기준) 별도 축. 결론을 못 내리면 등급을 바꾸지 말고 **`판단 보류 + 근거`**로 적는다.

## 명세서 위치
- 원본 스펙시트(UI 요소 표 포함): `%BILLAGE_SPEC_ROOT%\화면명세서\` (BILLIGE 폴더 경로를 환경변수 `BILLAGE_SPEC_ROOT`로 지정 — `scripts/lib/spec-root.js`, `design-index.json`의 경로도 이 루트 기준 상대경로). ID→파일 매핑은 `scripts/spec-sheet-map.tsv`.
- 크롭 목업(표 없음)은 `scripts/design-index.json`. **[기능]/[상태]/[액션] 판단은 원본 스펙시트로 한다.**
- API 명세 txt: `%BILLAGE_SPEC_ROOT%\api\`, 서버 실제 목록은 Swagger(`docs/api-wiring.md`).

## 절대 하지 말 것
- **문서 정규식 일괄 치환** — 문서 앞머리가 깨진 사고가 있었다. 고유 문자열/줄 단위로만 고친다.
- **축소 이미지로 텍스트 색·자간 판단** — 원본 픽셀 샘플링만.
- **추측 후 단정** — 근거 없으면 `판단 보류 + 근거`. 시안 목업과 설명표가 다르면 임의로 정하지 말고 불일치 목록에 기록.
- **`curl -d '한글'`로 API 진단** — 인코딩이 깨져 서버 버그로 오진한다. `scripts/api-call.js`를 쓴다.
- 화면마다 `KeyboardAvoidingView` 추가 — 전체화면 폼은 `ScreenContainer`, 모달/시트는 `Dialog`/`BottomSheet` 공용 처리를 쓴다.
- 요청받지 않은 커밋/푸시, 소스 파일·이미지 임의 삭제.

## 네비게이션 규칙
선택 화면 → 부모 폼 복귀는 `popTo`, 완료 후 스택 정리는 `reset`(상세: design-verification.md §5-11).

## 검증 명령어
```
npx tsc --noEmit          # 통과해야 함
npx eslint src App.tsx    # error 0 (warning 56개는 기존)
npm test                  # jest
```
`npm run lint`(= `eslint .`)는 `scripts/make-pair.js`의 기존 `no-undef` 에러를 함께 낸다(별건). 실기기/에뮬레이터 확인은 사용자가 한다.
