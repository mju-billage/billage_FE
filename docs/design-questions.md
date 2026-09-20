# 디자이너 확인 요청 목록

**값·원본·표기를 디자이너에게 물어야 하는 것**만 모은다. 에셋(아이콘·이미지) 요청은 [asset-requests.md](asset-requests.md), 서버 요청은 [backend-requests.md](backend-requests.md), 기획 결정(범위·정책·동작 의도)은 [design-verification.md](design-verification.md) §5-4에 그대로 둔다. 원문 근거는 각 행의 출처에 있다 — 여기는 질문만 옮겼다(출처 원문은 지우지 않았다). 답을 받으면 행을 지우지 말고 `[해결]`로 바꾼다.

## 1. 값·정의 (디자인 시스템)

| # | 질문 | 근거 · 출처 |
|---|---|---|
| 1 | `Color_Definition.pdf`에 grey/700과 grey/800이 둘 다 `#374151`로 적혀 있다. 오기로 보인다. **grey/800의 정확한 값 확인 요청.** | `docs/palette.tsv` 11·12행, `colors.ts`(`GREY_700`·`GREY_800`, 주석에 이미 표기), `design-verification.md` §3-1 · §5-26-C. 지금 어두운 면 3곳(`Snackbar`, `FILL_INVERSE` 두 화면, `ReceiptScanningView`)이 같은 `#374151`을 씀 |
| 2 | 시트 `COM-3-PAGE-03-0` Case A의 에러 라인/문구 색이 `#FA564D`/`#FA544C`인데 디자인 시스템 red/400(`negative-bold`)은 `#FB6E67`, red/500은 `#FA4A41`이다. **시트 값이 팔레트 어디에도 없다 — 어느 값이 맞는지.** 앱은 팔레트(`#FB6E67`)를 쓴다 | 불일치 #23, `design-diff.md` "에러 빨강 시트 값과 팔레트 편차" |
| 3 | 필수 표시 `*`가 시트 6곳에서 전부 `#3772E4`인데 팔레트에는 없다(가장 가까운 것: blue/600 `#3562DB`, blue/500 `#4A7FE7`). 앱은 blue/500(`FOREGROUND_SECONDARY`). **어느 팔레트 색이 의도인지.** | `design-verification.md` §5-25 라벨 `*` 색 조사, §5-26-E |
| 4 | 모달/시트 스크림은 대부분 α0.56인데(흰 배경 `#707070`, 블루 배경 `#6A6C70`) **`폴더_장부예산설정_금액기입.png`(`FDR-3-SHEET-01-0`)만 `#484A4C`(α0.70)** 이다. 같은 ID의 `폴더_메뉴_장부예산설정_금액기입.png`는 `#6A6C70`(α0.56)이다. **이 시트만 진한 게 의도인지.** | `design-verification.md` §5-28 |
| 5 | ⋮ 메뉴(팝오버)가 열린 프레임 6종(폴더 메인·폴더 상세·장부 상세·회비 상세·모임원 관리·모임 전환)에서 **백드롭이 전혀 어둡지 않다(α0).** 모달 스크림과 달리 투명 백드롭이 맞는지. 앱은 이 실측대로 `OVERLAY_MENU_BACKDROP`(α0)로 바꿨다 | `design-verification.md` §5-28 |
| 6 | 타이포그래피 표의 `Font Weight` 값(Light 100 · Regular 200 · Medium 300 · SemiBold 400 · Bold 500)은 Figma 변수 값이다. **실제 굵기(CSS 100~900) 매핑**과, `SemiBold`/`Semibold` 표기 통일 여부. | `docs/typography.tsv`, `design-verification.md` §5-27 |

## 2. 원본 파일·표기 오류

| # | 질문 | 출처 |
|---|---|---|
| 7 | **`ADD-2-SHEET-07-0`(일자 선택 캘린더)** 원본이 더미 데이터(요일 헤더 7칸 전부 "일", 날짜 셀 전부 "0")다. **정상 디자인 원본 파일을 다시 받을 수 있는가.** | `design-verification.md` §5-4, `design-diff.md` `ADD-2-SHEET-07-0` |
| 8 | **`ADD-4-SNACKBAR-01-0`(이미지 첨부 제한)** 헤더 문구가 "4 선택"인데 체크된 사진은 9~10장이다. **표기 오기인지, 4장만 선택된 상태를 의도한 것인지.** (구현 쪽 서술은 2026-09-18 정정됨 — 인앱 그리드가 없어짐) | `design-verification.md` §5-4 |
| 9 | **`DTB-3-MODAL-01-0`(상세 내역_삭제)·`DTB-3-PAGE-01-0`(증빙자료 상세)** 디자인 원본이 빈 프레임(본문 레이어 없음, "상세 내역" 타이틀 + "등록하기" 버튼뿐)이다. **실제 삭제 확인 다이얼로그·증빙자료 상세의 원본이 있는지.** | `design-verification.md` §5-4 |
| 10 | **`FDR-3-SHEET-02-0`** 은 시안이 없다(`FDR-3-SHEET-01-0` 헤더 시안 2장뿐). **`billage-ia.md`에만 있는 ID인지, `01-0`으로 통합된 것인지.** | `design-verification.md` §5-4 |
| 11 | **`ETC-5-SNACKBAR-05-0`(모임 전환 완료)** 시안 이미지가 0장이다. **원본이 있는지.** | `design-verification.md` §5-4 |
| 12 | **`ETC-3-PAGE-11-0`(약관 목록)** 시트 헤더 Screen ID가 "스크린아이디" 플레이스홀더 그대로다. **이 ID가 맞는지.** | `design-verification.md` §5-4 |
| 13 | **`납부관리_회비상세_수정_기간선택.png`** 시트 헤더가 `DTB-3-SHEET-02-0`인데 IA상 이 ID는 "장부 복수 선택"이다(오기 확인됨). **올바른 ID 정정 요청.** | `design-verification.md` §5-4, `scripts/spec-sheet-map.tsv` 13행 |
| 14 | **`ETC-3-PAGE-10-0`(문의하기)** 디자인이 '진행' 중이고 문의 작성 폼이 없다(API는 `POST /inquiries` 폼 제출). **최종 디자인에 입력 폼이 추가되는지.** | `design-verification.md` §5-4 |
| 15 | 로딩/에러/빈 목록 상태 시안 없음(`ETC-2-PAGE-01-0`, `ETC-1-PAGE-01-0` 등). 지금은 최소 형태(중앙 텍스트 + 재시도 버튼)로 통일 구현. **해당 상태의 디자인 요청.** | `design-verification.md` §5-4 "시안 없음 — 로딩/에러/빈 목록 상태" |
| 16 | 가입 정보 입력 프레임: 시트 Case A는 이름 초과 에러가 **키보드가 올라온 채** 이미 표시돼 있다. 에러가 뜨는 타이밍(즉시/blur)은 시안에 명시가 없다 — **이름 글자수는 즉시, 나머지 형식·조건은 blur로 구현했다. 의도 확인.** | `design-diff.md` 에러 타이밍 표(11-8) |

## 3. 관련 요청 (다른 문서에 있음)

- 원형 ⊗ 검색 지우기 아이콘, 소셜 로그인 아이콘 등 **에셋** → [asset-requests.md](asset-requests.md) (`design-diff.md` "검색 필드 지우기 아이콘").
- 시안 ↔ 설명표 불일치 #1~#23 중 **기획이 정할 것**(정책·동작 의도) → `lessons.md` §3, `design-verification.md` §5-4.
