# Billage 디자인 ↔ 구현 검증 체크리스트

> 자동 생성 초안. `Billage_IA.xlsx`(V0.4, 201행/고유 Screen ID 159개)와 디자인 이미지 파일명, `src/` 코드를 대조한 결과다.

> 상태는 코드 정적 분석 기준이며, `[확인필요]`와 픽셀 단위 차이는 스크린샷 대조(§4) 후 확정한다.


## 1. 요약

> **배경 열 의미(2026-09-19 8-4 확정)** — §2 "배경" 열은 행 유형별로 뜻이 다르다.
> - **`PAGE` 행**: 화면 배경색(블루 `#F0F5FE` / 흰색).
> - **`MODAL` / `SHEET` / `SNACKBAR` 행**: **그 요소 자체의 표면색**(다이얼로그·바텀시트 = 흰색, 스낵바 = 어두움 `#374151`). 뒤에 깔린 부모 화면 색은 비고에 `부모 <ID> 배경: 블루/흰색`으로 적는다.
> - `스크림`으로 측정된 명세 프레임은 그 요소의 표면색이 아니라 **뒤에 깔린 화면**을 잰 것이라 표면색 근거로 쓰지 않는다 — 표면색은 명세서를 직접 열어 확인하거나 컴포넌트(`Dialog`/`BottomSheet`/`Snackbar`)의 표면색을 쓰고 그렇게 표시한다.

**§2 기준: 데이터 166행 = 고유 Screen ID 165개 + `(ID 없음)` 1행(`SplashScreen`), 중복 행 0건 (2026-09-19 확정).** `☐` 줄 173개는 표 헤더 7줄 포함 수치이고, 고유 ID 167개는 비고 칸에만 언급된 `DUE-5-SNACKBAR-03-0`·`COM-1-SNACKBAR-02-0`까지 센 수치라 둘 다 행 수가 아니다.

> ⚠️ **갱신 규칙**: 등급을 바꿀 때는 세 곳을 함께 고친다 — **§2 해당 행 / 아래
> 요약표 / 아래 도메인별 표.** 한 곳만 고치면 반드시 드리프트가 난다
> (2026-09-05, 09-06 두 번 실제로 발생 — 아래 집계 기준 문단·2026-09-11 재계산
> 문단 참고).

**집계 기준(2026-09-06 정정)**: 이 표는 **`billage-ia.md`(IA 원본, 201행/고유
Screen ID 159개)와 대조되는 것만 센다.** 화면명세서에만 있고 IA엔 없는
발견분(§5-2, 25개 — 대부분 FDR/COM/ETC)은 여기 총계에 넣지 않고 §5-2에서만
추적한다. 2026-09-05 재집계 때 이 원칙을 안 지키고 DUE 쪽 IA-누락 발견분
4개(`DUE-3-PAGE-01-0`/`DUE-3-MODAL-03-0`/`DUE-3-PAGE-02-1`/`DUE-4-MODAL-03-0`,
§5-3 "IA 누락" 참고)만 총계에 끼워 넣어 159→163로 잘못 바꿨었다.

**재계산(2026-09-11)**: 위 갱신 규칙을 어긴 두 번째 사례를 발견해 바로잡았다
— 8-B/8-C 라운드에서 §2의 개별 행 20여 개를 고치면서(설정/내프로필/모임관리
신규 구현, 보고서 스냅샷 재하향, 카메라 인텐트 전환 등) 아래 요약표·도메인별
표를 안 따라갔다. 이번엔 손으로 더하지 않고 **§2의 실제 행 172개를 스크립트로
스캔**해 다시 셌다 — `(IA 목록에 없음)`으로 명시됐거나 본문에 "billage-ia.md엔
이 ID가 없다/누락"이 적힌 6행(`DUE-3-PAGE-01-0`·`DUE-3-MODAL-03-0`·
`DUE-3-PAGE-02-1`·`DUE-4-MODAL-03-0`·`ETC-4-SHEET-02-0`·`ETC-4-SNACKBAR-04-0`)을
제외하니 정확히 172-6=**159**로 IA 총계와 맞아떨어졌다 — 제외 기준이 맞다는
교차검증이다.

| 상태 | 개수 | 의미 |
|---|---:|---|
| `[구현]` | 122 | 대응 화면이 있고 눈에 띄는 누락 없음 (픽셀 대조 미완) |
| `[부족함]` | 18 | 화면은 있으나 요소·연결·API가 빠짐 |
| `[확인필요]` | 14 | 대응 후보는 있으나 실제 일치 여부 미확정 |
| `[미구현]` | 4 | 대응 화면 없음(`[구현→보류]`·`[보류]` 2건 포함 — 코드가 아직 없어 이 집계에선 미구현으로 묶었다) |
| `[해당없음]` | 1 | 시스템 인텐트 방식으로 결정돼 대응 화면이 의도적으로 없음(`ADD-3-PAGE-02-0`) — "아직 안 만듦"(`[미구현]`)과 달리 "이 형태로는 안 만든다"는 확정 |
| **합계** | **159** | IA 고유 Screen ID(`billage-ia.md` 기준). IA-누락 발견분(6건)은 총계에서 제외, §5-2/§5-3에서 별도 집계 (2026-09-11: `DSH-1-PAGE-01-0` 부족함→구현 재상향했으나, 2026-09-12 `billage-ia.md` W/F·Design이 여전히 '예정'임을 재확인해 구현→부족함으로 되돌림 — 122/18로 원복. 같은 날 `ETC-1-PAGE-01-0` 사유 6개를 전부 재검토해 3개 해소 확인 + 나머지는 실기기 캡처 필요로 판정 불가 확정, 부족함→확인필요로 이동 — 122/17/14. 스펙시트 매핑 표(`spec-sheet-map.tsv`) 확장 후 `DTB-2-PAGE-03-0`의 "시안 0장"이 오류로 드러나 미구현→부족함 — 최종 122/18/14/4) |

> ⚠️ **`[구현]`은 코드가 존재한다는 뜻이지 동작한다는 뜻이 아니다.** 배치 C에서
> 보관함 7화면을 "전부 이미 구현돼 있었다"고 판정해 `[구현]`으로 올렸는데,
> 2026-09-12 실기기에서 **첫 화면(`ArchiveListScreen`)이 진입 즉시 Render Error로
> 죽는 것**이 발견됐다(`formatArchivedAt`이 존재하지 않는 서버 필드 `archivedAt`을
> 읽음 — 실제 필드명은 `createdAt`, `docs/backend-requests.md`에도 없던 새 크래시).
> 코드 존재 여부·타입 정합성만으로는 실행 가능 여부를 보장하지 못한다 — 이
> 표의 `[구현]`은 **실행 검증을 거치지 않은 등급**이며, 특히 이번 라운드처럼
> 실호출 없이 Swagger 예시값만 보고 타입을 맞춘 경우 필드명이 실제와 다를 수
> 있다는 걸 계속 염두에 둘 것.

### 도메인별

| 영역 | 전체 | 구현 | 부족함 | 확인필요 | 미구현 | 해당없음 |
|---|---:|---:|---:|---:|---:|---:|
| COM — Common — 로그인/회원가입/탈퇴 | 13 | 9 | 4 | 0 | 0 | 0 |
| DSH — 대시보드 | 4 | 1 | 1 | 1 | 1 | 0 |
| DTB — 내역(거래) | 12 | 10 | 1 | 0 | 1 | 0 |
| FDR — 폴더/장부 | 24 | 14 | 0 | 10 | 0 | 0 |
| DUE — 납부 관리(회비) | 28 | 27 | 0 | 0 | 1 | 0 |
| ETC — 더보기 — 모임/보고서/증빙앨범/설정 | 61 | 50 | 9 | 2 | 0 | 0 |
| ADD — FAB — 내역 추가 | 17 | 11 | 3 | 1 | 1 | 1 |
| **합계** | **159** | **122** | **18** | **14** | **4** | **1** |

DSH·ETC·ADD가 이전 표(구 값: DSH 0/2/1/1, ETC 29/4/1/27, ADD 13/2/1/1)와
크게 다른 건 8-A~8-C 라운드에서 실제로 화면이 많이 생겼기 때문이다 — 예:
DSH-2-PAGE-01-0(알림 목록)이 실 API 연동으로 미구현→구현, ETC 쪽 설정
허브·내 프로필·프로필 변경·비밀번호 변경·모임 관리 허브·모임 삭제·모임
내보내기 등이 전부 신규 [구현], ADD-3-PAGE-01-0(영수증 스캔)은 반대로
카메라 인텐트 전환 때문에 구현→부족함으로 내려갔다. DTB·FDR·DUE·COM은
이번에 안 건드려서 구 값과 그대로 일치한다(교차검증 겸함).

### 배경 판정 현황 (2026-09-12 신설)

§2에 "배경" 열을 추가했다 — §5 "화면 배경색 판정 규칙" 참고. 상태등급 집계와는
별개 축이라 위 요약표/도메인별 표의 숫자에는 안 섞는다(그 표는 IA 기준 159개만
세지만, 아래는 §2의 실제 행 165개 — IA-누락 발견분 포함 — 전부를 센다).

| 배경 판정 | 개수 | 의미 |
|---|---:|---|
| 블루(#F0F5FE) — `PAGE` | 32 | `BACKGROUND_PRIMARY` 적용 확정(목록/조회형 화면 배경) |
| 흰색 — `PAGE` | 42 | `BACKGROUND_SECONDARY` 적용 확정(폼/입력형 화면 배경) |
| 흰색 — `MODAL`/`SHEET` 표면 | 51 | 다이얼로그·바텀시트 요소 자체의 표면색(부모 화면 색은 §2 비고) |
| 어두움(#374151) — `SNACKBAR` 표면 | 27 | 스낵바 요소 자체의 표면색(부모 화면 색은 §2 비고) |
| 미판정 | 14 | `PAGE` 행 중 화면 배경을 아직 확정하지 못한 것(스플래시 포함) — §5-7 "배경 미판정 목록" 참고 |
| **합계** | **166** | |

**2026-09-19 갱신**: 이 표의 숫자가 2026-09-12 이후 여러 라운드(DUE 묶음 4·5, 폴더 예산 설정 등)에서 개별 행만 고치고 표는 안 고쳐 낡아 있었다 — 이번에 §2 실제 행(165개, 도메인별 표 헤더 제외)의 배경 열을 직접 세어 다시 맞췄다(블루 18 / 흰색 11 / 미판정 136). **2026-09-19 6-10에서 스플래시 행(`(ID 없음)`) 1개를 추가해 합계 166 / 미판정 137**이다(§5-7 미판정 목록 136개는 Screen ID가 없어 이 행을 넣지 않았다). §5-7 "미판정 목록"은 처음 137개로 이 표의 136과 1 차이가 났으나, 2026-09-19 스크립트 집합 차로 원인을 특정해 정정했다 — 목록 쪽에만 있던 ID는 `FDR-2-PAGE-02-0`(§2 행은 이미 블루, 목록에서 안 뺀 우리 쪽 누락)이고 §2에만 있는 ID는 없다. 지금은 두 목록 모두 136개(§5-18 5번).

**2026-09-19 8-5**: 8-1(v1)·8-3(v3) 명세 측정 판정은 철회했다 — v1은 파일 단위 오염, v3는 프레임 좌표 오검출(번호 마커 ①②③까지 바운딩 박스에 포함돼 여백 스트립이 프레임 밖 흰 종이를 잼, `docs/lessons.md` 1-12). 이어서 프레임 x범위를 격자(50..410 / 430..790)에 고정한 **v5**(`docs/spec-background-v5.tsv`)로 `PAGE` 행 46개를 다시 반영했다(근거는 §2 배경 칸: `명세 프레임 실측 v5 (<파일>#<idx>, 상단 <HEX>, 점유율 N%)`). 기준점 6개 검증 통과, 점유율 60% 미만은 판정에 쓰지 않고 `수동 확인 필요`. 배경 열 의미 통일(8-4)은 유지. 현재 블루 26(PAGE) / 흰색 40(PAGE) + 51(모달·시트 표면) / 어두움 27(스낵바 표면) / 미판정 22(전부 PAGE, 스플래시 포함). **8-6**: 육안 확인으로 `DSH-1-PAGE-01-0`·`ETC-2-PAGE-02-0`(블루)·`ETC-3-PAGE-04-0`(흰색)을 확정하고 `-1` 변형 4개는 부모 `-0` 판정을 상속했다 → 블루 32 / 흰색 41(PAGE) / 미판정 15(전부 PAGE, 스플래시 포함). `ETC-3-PAGE-04-0`은 구현이 어두운 배경이라 시안↔구현 불일치 #12(§5-4)로 기록하고 안 고쳤다. **8-7**: 루트 `View`+`paddingTop: 60` 화면 등 레이아웃 우려 8개를 `edges={['bottom']}`(1개는 `[]`)로 마이그레이션해 남은 코드 불일치는 22건(슬롯 대기 21 + 기획 확인 1)이다. 미판정 15(변동 없음). **9-3**: 스낵바 슬롯 검증 통과로 대기 19개 파일을 `ScreenContainer`로 마이그레이션(슬롯 12개 파일 + `bottom: 88` 래퍼 유지 7개 파일)해 코드 불일치는 22 → 1건(`ETC-3-PAGE-04-0`, 기획 확인 대기)이다. 미판정·§1 배경 표 값은 변동 없음. **9-4**: `ScreenContainer`에 `snackbarOffset`을 추가해 `bottom: 88` 래퍼 7개 파일도 슬롯으로 옮겼다(CTA 높이를 화면별로 확인 — 값은 §5-18 9-3 블록). 코드 불일치·배경 표 값은 변동 없음. **9-5**: 남은 `absolute` 스낵바 래퍼 10개 파일을 전부 슬롯으로 옮김(A 4개 슬롯만, B 6개 `ScreenContainer` 마이그레이션 + 슬롯). `src/`에 `snackbarWrapper` 0건. **9-6 ※ 정정**: 위 "코드 불일치 1건"은 공유 Screen ID의 Report 쪽 파일만 보고 센 값이었다. 파일 단위로 다시 세면 확정 판정 ID 기준 **2건**(`ETC-3-PAGE-04-0` + `ETC-4-PAGE-05-0`의 `ArchiveLedgerEntriesScreen`), 확정 PAGE 69개 중 일치 **67**이다. 판정 미확정 ID(`ETC-5-PAGE-02-0`)에서 파일끼리 처리가 다른 것이 1건 더 있다(§5-18 9-6 블록). 배경 표 값은 변동 없음. **9-9**: `ArchiveLedgerEntriesScreen`(`ETC-4-PAGE-05-0`)·`ArchiveEntryDetailScreen`(`ETC-5-PAGE-02-0`)을 `ScreenContainer primary`로 마이그레이션해 같은 ID 파일끼리 처리를 통일했다. **최종: 확정 판정 ID 기준 코드 불일치 1건(`ETC-3-PAGE-04-0`, 기획 대기), 확정 PAGE 69개 중 일치 68, 미확정 ID 내 파일 간 불일치 0건**(9-6 "2건"에서 갱신, §5-18 9-9 블록). `ETC-5-PAGE-02-0`의 §2 배경 판정은 미판정 유지. **9-10 ※ 정정**: 위 9-9의 `primary` 통일은 **틀린 방향**이었다 — 명세 실측(v5 4프레임 #FFFFFF + 이 ID 크롭 2장 픽셀 #FFFFFF)이 흰색이라 `ETC-5-PAGE-02-0`을 **흰색으로 확정**하고 두 파일 모두 `secondary`로 고쳤다. 배경 표: 흰색 PAGE 41 → **42**, 미판정 15 → **14**(합계 166 불변). 확정 판정 PAGE 70개 중 일치 69, 코드 불일치 **1건**(`ETC-3-PAGE-04-0`, 기획 대기), 미확정 ID 내 파일 간 불일치 0건.

## 2. 화면별 체크리스트

`디자인` 컬럼은 IA 문서의 Design 상태다. `예정`은 디자인이 아직 없으므로 **구현 대상에서 제외**한다.


### COM — Common — 로그인/회원가입/탈퇴

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 배경 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|---|
| ☐ | `COM-1-PAGE-01-0` | 로그인 | Page | 전체 | 완료 | 3장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (회원가입&로그인/회원가입/로그인_메인화면.png#0, 상단 #FFFFFF, 점유율 88%)) | `screens/LoginScreen.tsx` — 상세: [design-diff.md#com-1-page-01-0-로그인](design-diff.md#com-1-page-01-0-로그인) |
| ☐ | `COM-1-PAGE-02-0` | 탈퇴_안내사항 | Page | 전체 | 진행 | 1장 | `[구현]` | 블루 | `screens/More/WithdrawGuideScreen.tsx` — 탈퇴 플로우 1단계. 제목·본문 불릿 6개·CTA 문구까지 시안과 정확히 일치(2026-09-11 확인). 화면 진입 시 유일 총무 모임을 미리 조회해 CTA 클릭 시 [Case A](권한 이전 필요)/[Case B](바로 사유 선택) 분기 — 위임 후보가 아예 없는 모임은 Auth.txt 11번 정책대로 목록에서 제외(그런 모임은 탈퇴와 함께 삭제). **2026-09-13 결함 수정**: 안내 불릿 목록이 배경 위에 평면으로 얹혀 있었다(시안은 카드 하나 안) — `CardBase`로 감쌈. 배경도 `ScreenContainer background="primary"`(블루)로 확정. **재캡처 확인 완료(2026-09-13)** |
| ☐ | `COM-2-PAGE-01-0` | 약관 동의 | Page | 전체 | 완료 | 2장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (회원가입&로그인/회원가입/회원가입_약관동의.png#0, 상단 #FFFFFF, 점유율 90% 외 1프레임 일치)) | `screens/Signup/TermsAgreementScreen.tsx` — 상세: [design-diff.md#com-2-page-01-0-약관-동의](design-diff.md#com-2-page-01-0-약관-동의) |
| ☐ | `COM-2-PAGE-02-0` | 비밀번호 재설정 | Page | 전체 | 완료 | 3장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (회원가입&로그인/회원가입/로그인_비밀번호_재설정.png#0, 상단 #FFFFFF, 점유율 90%)) | `screens/PasswordReset/PasswordResetScreen.tsx` — L29 TODO: 임시 비밀번호 발급/발송 API 미연동 |
| ☐ | `COM-2-PAGE-04-0` | 탈퇴_권한 넘기기 | Page | 전체 | 진행 | 2장 | `[구현]` | 블루 | `screens/More/WithdrawOwnershipTransferScreen.tsx`(2026-09-11 확인) — [Case A] 전용, 유일 총무인 모임마다 새 총무 1명을 단일 선택(다른 멤버 선택 시 같은 모임 안 기존 선택 자동 해제, 시안 UI 요소 3번 그대로. 선택 시 우측 체크 아이콘이 포인트 컬러(`FOREGROUND_SECONDARY`=`BLUE_500`)로 활성화되는 것도 시안과 일치, 2026-09-13 재확인). 실제 권한 이전 API는 여기서 안 부르고 선택 결과를 `WithdrawReason`으로 들고 가 최종 확인 모달에서 탈퇴 요청과 한 트랜잭션으로 처리(Auth.txt 11번). **2026-09-13 결함 수정**: 모임명은 카드 밖 라벨인데 그 아래 멤버 리스트가 평면으로 얹혀 있었다(시안은 모임마다 카드 하나) — `CardBase`로 감쌈. 배경도 `ScreenContainer background="primary"`(블루)로 확정. **재캡처 확인 완료(2026-09-13)**. **2026-09-13 컴포넌트 연결 누락 감사로 추가 발견**: 멤버 아바타가 `<Avatar type="icon" size="sm" />`로 기본(`style="default"`, 파란 배경+파란 테두리)이었는데 시안은 회색 아바타다 — `Avatar`에 이미 있던 `style="neutral"`(회색, 그동안 앱 전체 어디서도 안 쓰임)을 지정해 고쳤다 |
| ☐ | `COM-2-PAGE-05-0` | 탈퇴_사유 입력 | Page | 전체 | 진행 | 4장 | `[구현]` | 블루 | `screens/More/WithdrawReasonScreen.tsx`(2026-09-11 확인) — 사유 다중 선택(체크박스) + "직접 입력할게요" 선택 시 텍스트 필드 노출(placeholder "탈퇴 사유를 입력해주세요", 최대 30자, 시안 No.3와 정확히 일치, 2026-09-13 재확인). CTA 문구는 표/Case A는 "선택 완료"라 적었지만 메인 프레임 2장 + 다음 화면 배경 프레임까지 3곳이 "탈퇴하기"라 시각적 다수를 따라 "탈퇴하기"로 확정(`WITHDRAW_REASON_SUBMIT_LABEL` 주석 참고). **2026-09-13 결함 수정**: 사유 체크박스 목록이 평면으로 얹혀 있었다(시안은 카드 하나 안, "직접 입력할게요" 텍스트 필드도 같은 카드 안에서 확장) — `CardBase`로 감쌈. 배경도 `ScreenContainer background="primary"`(블루)로 확정. 명세 내부 모순 2건은 [design-diff.md](design-diff.md) 참고. **재캡처 확인 완료(2026-09-13)** |
| ☐ | `COM-3-MODAL-01-0` | 탈퇴_사유 입력 | Modal | 전체 | 진행 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/More/WithdrawReasonScreen.tsx`(confirmDialogVisible) — 최종 확인 Dialog, 제목·설명·버튼 문구 전부 시안과 일치(2026-09-11 확인). 확인 시 `authService.withdraw()`가 `DELETE /auth/me`를 호출(서버 미구현, Auth.txt 11번 기준 실제 명세대로 작성 — 서버 열리면 코드 수정 없이 동작), 성공 시 로컬 세션 정리 후 로그인 화면으로 리셋 이동 + 스낵바 · **부모 COM-2-PAGE-05-0 배경: 블루** |
| ☐ | `COM-3-PAGE-01-0` | 약관 상세 | Page | 전체 | 완료 | 1장 | `[구현]` | 미판정 | `screens/Signup/{TermsOfService,PrivacyPolicy,MarketingConsent}Screen.tsx` — 약관 3종을 각각 별도 화면으로 구현. 상세: [design-diff.md#com-3-page-01-0-약관-상세](design-diff.md#com-3-page-01-0-약관-상세) |
| ☐ | `COM-3-PAGE-02-0` | 간편 가입 정보 입력 | Page | 전체 | 완료 | 4장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (회원가입&로그인/회원가입/SNS 간편 회원가입_가입 정보 입력.png#0, 상단 #FFFFFF, 점유율 91%)) | `screens/Signup/SocialSignupInfoScreen.tsx` — 상세: [design-diff.md#com-3-page-02-0-간편-가입-정보-입력-막힘](design-diff.md#com-3-page-02-0-간편-가입-정보-입력-막힘) (실 카카오/네이버/구글 OAuth 필요 — 픽셀 대조 불가) |
| ☐ | `COM-3-PAGE-03-0` | 가입 정보 입력 | Page | 전체 | 완료 | 4장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (회원가입&로그인/회원가입/일반 회원가입_가입 정보 입력.png#0, 상단 #FFFFFF, 점유율 87%)) | `screens/Signup/SignupInfoScreen.tsx` — 상세: [design-diff.md#com-3-page-03-0-가입-정보-입력](design-diff.md#com-3-page-03-0-가입-정보-입력) |
| ☐ | `COM-3-PAGE-04-0` | 비밀번호 재설정_완료 | Page | - | 완료 | 1장 | `[구현]` | 미판정 | `screens/PasswordReset/PasswordResetSentScreen.tsx` — 상세: [design-diff.md#com-3-page-04-0-비밀번호-재설정완료](design-diff.md#com-3-page-04-0-비밀번호-재설정완료) |
| ☐ | `COM-4-PAGE-01-0` | 이메일 인증 | Page | 전체 | 완료 | 2장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (회원가입&로그인/회원가입/일반 회원가입_이메일 인증.png#0, 상단 #FFFFFF, 점유율 96%)) | `screens/Signup/EmailVerificationScreen.tsx` — L59·66·72 TODO: 인증코드 발송/재전송/검증 API 미연동. 상세: [design-diff.md#com-4-page-01-0-이메일-인증](design-diff.md#com-4-page-01-0-이메일-인증) |
| ☐ | `COM-5-PAGE-01-0` | 가입 완료 | Page | 전체 | 완료 | 4장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (회원가입&로그인/회원가입/회원가입_완료.png#0, 상단 #FFFFFF, 점유율 94%)) | `screens/Signup/SignupCompleteScreen.tsx` — [모임 생성하기]/[코드로 참여하기] 연결은 완료. 상세: [design-diff.md#com-5-page-01-0-가입-완료](design-diff.md#com-5-page-01-0-가입-완료) (레이아웃 간격·보조 버튼 색상 차이) |
| ☐ | `(ID 없음)` | 스플래시(`SplashScreen`) | Page | - | 시안 없음 | 0장 | `[구현]` | 미판정(코드 기존값 흰색 `BASIC_0` — 시안 없음) | `screens/SplashScreen.tsx` — 라우트 화면이 아니라 `RootNavigator`가 인증 상태 로딩 동안 통째로 렌더하는 로고 화면. IA/시안에 Screen ID가 없어 ID 칸은 자리표시. 2026-09-19 §5-19 감사에서 추가(사용자 판단: 실제 화면). **상태 요약표·도메인별 표(IA 159개 기준)에는 안 넣었다** — IA 총계 교차검증(159)이 깨지고 IA-누락 발견분과 같은 취급(총계 제외)이라서. 배경 판정 현황 표(§2 실제 행 기준)만 갱신 |

### DSH — 대시보드

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 배경 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|---|
| ☐ | `DSH-1-PAGE-01-0` | 대시보드 | Page | 총무 | 예정 | 1장 | `[부족함]` | 블루 (육안 확인 2026-09-19, 원본 크롭 — v5 22%는 수동 확인 필요였고 이 육안 확인으로 확정) | `screens/Dashboard/DashboardScreen.tsx` — **2026-09-12 재하향**: 지난 라운드에 캘린더를 붙이고 `[구현]`으로 올렸는데, 원래 `[부족함]` 사유("IA상 W/F·디자인 모두 '예정' → 기획 미확정")를 다시 확인하니 `billage-ia.md`(30행)가 여전히 W/F `예정` · Design `예정`이다 — 바뀐 게 없다. 시안 이미지(`C:\Users\jotmd\Downloads\BILLIGE\DSH\DSH-1-PAGE-01-0.png`)가 한 장 존재한다고 해서 "확정 시안과 일치"로 판정할 근거는 안 된다 — IA가 이 화면 자체를 기획 미확정으로 못박고 있다. `[구현]`으로 올린 게 잘못이었다. 캘린더(`dashboardService.getMonthlyCalendar()`로 이번 달 그리드 채움)·회비 현황 카드(`upcomingDues[]` → `DuesProgressCard` 캐러셀)는 그대로 남겨뒀다 — 코드 되돌리라는 지시는 없었고, 이미 있는 화면을 없앨 이유도 없다. 다만 등급은 "시안 미확정 상태에서 화면을 만들어 뒀다"는 사실을 반영해 `[부족함]`으로 되돌린다. 잔액/최근내역/승인대기 블록 제거 근거는 아래(§5-4) 별도 기록. 픽셀 단위 차이는 [design-diff.md#dsh-1-page-01-0-대시보드](design-diff.md#dsh-1-page-01-0-대시보드) 참고 |
| ☐ | `DSH-2-PAGE-01-0` | 알림 목록 | Page | 전체 | 예정 | 1장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (대시보드/대시보드_알림내역.png#0, 상단 #FFFFFF, 점유율 96%)) | `screens/Notification/NotificationScreen.tsx` — **2026-09-06 해결**: 알림 설정(`ETC-3-PAGE-08-0`)이 배치 B로 생겨 우측 상단 톱니 아이콘을 `NotificationSettingsScreen`으로 연결했다. 상세: [design-diff.md#dsh-2-page-01-0-알림-목록](design-diff.md#dsh-2-page-01-0-알림-목록) (픽셀 대조는 차이 없음) |
| ☐ | `DSH-2-PAGE-03-0` | 대시보드 캘린더 | Page | 총무 | 예정 | 1장 | `[확인필요]` | 흰색 (명세 프레임 실측 v5 (대시보드/대시보드_캘린더.png#0, 상단 #FFFFFF, 점유율 96%)) | `screens/Calendar/CalendarScreen.tsx` — **2026-09-12 정정: "이미지 0장"은 오류였다.** 원본 스펙시트(`화면명세서\대시보드\대시보드_캘린더.png`, 헤더 확인)가 실제로 존재한다 — IA의 디자인 '예정' 표기와 달리 시트 자체는 "디자인 중" 상태로 이미 나와 있다. UI 요소 표까지 확인: 3번 "월간 캘린더 뷰"는 일자별로 수입(+, 블루)/지출(-, 그레이) **두 줄을 따로** 표기하는데, 지금 `Calendar` 컴포넌트는 `income - expense` 합산값 하나만 표시한다(픽셀 대조 필요). 4번 "일별 상세 내역 리스트"는 날짜 선택 시 하단에 장부명/내역명/증빙아이콘/상태뱃지/금액을 보여주고 항목 탭 시 "내역 상세 보기"로 이동 — 현재 구현이 이 인터랙션을 다 갖췄는지 재확인 필요. 시안 확보로 "판별 불가"는 풀렸지만 위 두 가지가 새로 드러나 `[확인필요]` 등급은 유지, 사유만 교체. 상세: [design-diff.md#dsh-2-page-03-0-대시보드-캘린더](design-diff.md#dsh-2-page-03-0-대시보드-캘린더) |
| ☐ | `DSH-2-PAGE-05-0` | 통계 및 분석 | Page | 총무 | 진행 | **0장** | `[미구현]` | 미판정 | 통계 및 분석 (이미지 0장, 디자인 진행중) |

### DTB — 내역(거래)

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 배경 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|---|
| ☐ | `DTB-1-PAGE-01-0` | 내역 메인 | Page | 총무 | 완료 | 5장 | `[구현]` | 블루 (명세 프레임 실측 v5 (내역/내역_메인화면.png#0, 상단 #F0F5FE, 점유율 100%)) | `screens/Transactions/TransactionsScreen.tsx` — **4-B(모임 전체 내역 목록 API 연동)에서 목(삭제된 파일 types/transaction.ts)을 걷어내고 `entryService.getGroupEntries()`로 전환.** 무한 스크롤 추가, 승인요청 탭이 실제 상세 화면(4-A `TransactionDetailScreen`)으로 이어짐. 장부 목록(`ledgerOptions`)은 필터/탭과 분리해 포커스 시에만 재조회(4-B 정리, 2026-09-05). 옛 `editMock` 완료 신호였던 `addedTransactionId` 파라미터 기반 스낵바는 발신처(`editMock`)가 삭제되며 죽은 코드가 되어 함께 제거. 상세: [design-diff.md#dtb-1-page-01-0-내역-메인](design-diff.md#dtb-1-page-01-0-내역-메인) · **2026-09-21**: 배경 상하 다름을 반영 — 루트는 블루(`primary`) 그대로, `Tabs` 이하(탭·필터/검색 아이콘·칩·건수·목록·상태/빈 화면)를 `BACKGROUND_SECONDARY`(흰색) `listSection` 하나로 묶고 가로 전체를 채운다(좌우 24 패딩은 안쪽에만). `AmountCard`는 별도 `summarySection`(패딩 24)에 남는다. 요약 카드와 흰 영역 사이 16 파란 간격. **접히는 헤더(2026-09-21)**: 스크롤하면 카드가 사라지고 Tabs~건수가 AppBar 아래 고정, 목록만 스크롤(`Animated` translateY, 상세 design-diff.md). **탭**: `Tabs fullWidth`로 좌우 여백 없이 절반씩, 밑줄도 절반(2026-09-21). 실기기 확인 대기 · 배경 상하 다름 — 상단 #F0F5FE / 하단 #FFFFFF(v5, 구현 시 유의) |
| ☐ | `DTB-2-PAGE-01-0` | 내역 검색_전체 | Page | 전체 | 완료 | 4장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (내역/내역_검색.png#0, 상단 #FFFFFF, 점유율 81%)) | `screens/Transactions/TransactionSearchScreen.tsx` — 4-B에서 실 API(`getGroupEntries({ keyword })`) 전환, 300ms 디바운스 |
| ☐ | `DTB-2-PAGE-02-0` | 상세 내역_조회 | Page | 전체 | 예정 | 6장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (내역/내역_상세내역조회.png#0, 상단 #FFFFFF, 점유율 89%)) | `screens/Folder/TransactionDetailScreen.tsx` — 4-A에서 수정 아이콘 연결 완료(아래 DTB-3-PAGE-02-0 참고). 디자인 상태 '예정'인데 이미지는 6장 존재 → 어느 쪽이 최신인지 확인 필요(미해결). **2026-09-11 재상향**: 지난 라운드에 `duesId`/`payerCount`/`payers[]` 미사용으로 하향했었는데, 시안(`내역_상세내역조회_납부관리수입내역.png`)을 직접 읽고 반영 완료 — `entry.duesExists`일 때 납부자 명수·명단 + "회비 상세보기" CTA 노출, 앱바 수정 아이콘은 숨김(시안엔 휴지통만 있음). `duesExists === false`(회비 삭제 후 잔존) 표현은 시안에 없어 일반 내역과 동일하게 둠(§5-4) |
| ☐ | `DTB-2-PAGE-03-0` | 상세 내역_승인요청 | Page | 총무 | 완료 | 1장 | `[부족함]` | 미판정 | **2026-09-12 정정: "이미지 0장"은 오류였다.** 원본 스펙시트(`화면명세서\내역\내역_상세내역조회_승인요청내역.png`)가 존재한다 — 다만 그 표의 Screen ID 셀 자체가 `--`(공백)라 이 ID로 확정된 문서상 근거는 아니다. 그래도 페이지명("상세 내역_승인 요청 내역")과 페이지 경로("내역 > 상세 내역 > 승인 요청 내역")가 이 ID와 정확히 일치해 이 화면으로 판단한다. **내용 대조 결과 기존 판정이 틀렸다**: 승인 API(`POST /entries/{entryId}/approve`)가 `screens/Folder/TransactionDetailScreen.tsx`에 승인 버튼으로 붙어 있는 건 맞지만, 시안 UI 요소 3번은 지출일/내역명/담당자/장부/메모 **각 항목을 탭하면 개별 바텀시트로 그 자리에서 수정**하는 인라인 편집 화면을 요구한다("각 항목 터치 시 해당 정보를 수정할 수 있는 개별 바텀시트 호출") — 지금 구현은 이 필드들을 읽기 전용으로만 보여주고, 수정하려면 별도 편집 화면(연필 아이콘)으로 나가야 한다. 승인 자체는 되지만 시안이 요구하는 "승인 대기 중 바로 고쳐서 승인" 흐름은 없다 — `[미구현]`(시안 없어 착수 불가)이 아니라 `[부족함]`(화면은 있으나 인라인 편집 인터랙션이 빠짐)으로 재분류 |
| ☐ | `DTB-2-SHEET-01-0` | 내역 필터링 | Bottom Sheet | 전체 | 완료 | 6장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionFilterSheet.tsx` — 4-B에서 장부 목록을 실 API(부모가 `ledgerService.getAllLedgersInGroup()`로 가져와 prop으로 내려줌)로 전환 |
| ☐ | `DTB-3-MODAL-01-0` | 상세 내역_삭제 | Modal | 전체 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | `screens/Folder/TransactionDetailScreen.tsx L152` |
| ☐ | `DTB-3-MODAL-02-0` | 증빙자료 삭제 | Modal | - | 완료 | **0장** | `[미구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | 증빙자료 삭제 모달 |
| ☐ | `DTB-3-PAGE-01-0` | 증빙자료 상세 | Page | 전체 | 완료 | 1장 | `[구현]` | 미판정 | `screens/Folder/TransactionReceiptDetailScreen.tsx`(파일 상단 이미 `@screen DTB-3-PAGE-01-0` 주석 있음, 문서만 미갱신 상태였다) — `TransactionDetailScreen`의 증빙 썸네일 탭 → `ZoomableImage` 원본 뷰어. **2026-09-11 재확인**: 이 ID의 시안 파일(`DUE\`... 아니라 `DTB\DTB-3-PAGE-01-0.png`)은 실제로는 "상세 내역" 빈 화면 + "등록하기" 버튼인데, 이는 `DTB-3-MODAL-01-0`(상세 내역_삭제) 행에 이미 기록된 오배치 이미지와 완전히 동일한 내용이다(§5-4 참고) — 두 ID에 같은 잘못된 파일이 겹쳐 있어 이 화면 자체의 진짜 시안으로 쓸 수 없다. `ETC-3-PAGE-04-0`(증빙자료 앨범 상세)과 화면명(둘 다 "증빙자료 상세")·기능이 같지만, 진입 맥락이 달라(이미 상세 내역 화면 안 vs 앨범에서 진입) "상세 내역 바로가기" CTA 유무·헤더 구성이 다르므로 별도 화면으로 유지하는 게 맞다(파일 상단 주석에 이미 근거 있음) — 재사용 대신 새로 만든 게 아니라 애초에 의도적으로 분리된 것 |
| ☐ | `DTB-3-PAGE-02-0` | 상세 내역_수정 | Page | 전체 | 완료 | **0장** | `[구현]` | 흰색 (명세 프레임 실측 v5 (내역/내역_상세내역수정.png#0, 상단 #FFFFFF, 점유율 81%)) | `screens/Transactions/TransactionRegisterScreen.tsx` — 4-A(Entry API 연동)에서 연결 완료. **4-B 정리(2026-09-05)**: DTB 전체 목록이 실 API로 전환되며 `dtb-tx-N` 목 id를 만들어내는 곳이 사라져(grep·라우트·딥링크·스토리북으로 확인) id 모양(숫자/`dtb-tx-N`)으로 두 경로를 나누던 `editMock` 분기와 types/transaction.ts(파일)를 삭제. 이제 수정 진입은 항상 `entryService.getEntryDetail()` 실 프리필 하나뿐이다. |
| ☐ | `DTB-3-SHEET-01-0` | 기간 선택 캘린더 | Bottom Sheet | 전체/총무 | 완료 | 10장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionFilterSheet.tsx` — 내부 중첩 BottomSheet(커스텀 기간용). `TransactionDateSheet.tsx`는 `ADD-2-SHEET-07-0`(일자 선택) 전용이라 무관함을 확인. **같은 ID를 `screens/Dues/DuesDateRangeSheet.tsx`(Dues 생성·수정 + Report 기간별 생성 공용)도 쓴다** — 2026-09-05 최신 확정 시안(`더보기_보고서생성하기_기간별_기간선택.png`, 05-19)과 재대조해 그 컴포넌트에 없던 시작/종료 날짜 미리보기(2자리 연도)와 좌측 보조 버튼(`cancelLabel` prop, 기본 `취소`)을 보강했다 — 자세한 내용은 그 파일 주석. `TransactionFilterSheet`의 내부 구현은 이번에 안 건드렸다(별도 컴포넌트라 회귀 위험 없음). **2026-09-12 재대조로 `DuesDateRangeSheet` 5건 반영**: (1) 공용 `Calendar` 컴포넌트의 내장 `DateField`(4자리 연도, 기본색)가 이 시트 자체의 미리보기(2자리 연도)와 중복 렌더되고 있었다 — `Calendar`에 `showDateFields={false}` 전달해 제거, (2) 시트 하단 취소/선택하기 버튼이 겹쳐 보이는 문제와 시트가 시스템 네비게이션 바에 잘리는 문제를 함께 고쳤다 — 공용 `BottomSheet.tsx`에 `useSafeAreaInsets().bottom`을 더해 하단 잘림을 없앴고(이 시트만이 아니라 `BottomSheet`를 쓰는 모든 시트에 공통 적용, 순수 여백 추가라 회귀 위험 낮음), 취소 버튼을 `TextButton`(배경 없음)에서 `Button hierarchy="tertiary"`(회색 pill, 시안 No.5)로 교체해 확정 버튼과 시각적으로 분리, (3) 시작일~종료일 사이 구간에 옅은 배경 띠 추가(`Calendar.tsx`, 명세 No.3 [액션]) — 양 끝(시작일/종료일)만 둥글게, 안쪽 경계는 각지게, (4) 미리보기 값 색상이 기본색이었다 — `FOREGROUND_SECONDARY`(포인트 컬러)로 수정(명세 No.4), (5) 시트 타이틀이 호출부의 폼 필드 라벨("기간")을 그대로 재사용해 "기간"으로 뜨고 있었다 — 명세 No.2 "기간 선택" 고정 노출로 분리(`DATE_RANGE_SHEET_TITLE` 신설, `title` prop 제거하고 시트 내부 고정값으로 전환, 3개 호출부 모두 수정). 등급은 `[구현]` 유지(세부 결함 수정, 화면 자체는 기존부터 존재). **2026-09-12 재캡처로 위 5건 전부 해결 확인**(`docs/design-diff.md` 기록 갱신). **2026-09-12 보고서 도메인 묶음 2 추가 수정**: 명세 No.4는 시작 날짜를 좌측 끝, 종료 날짜를 우측 끝에 배치하라는데 `previewRow`가 `marginLeft: 32`로 살짝만 띄우고 있어 둘 다 왼쪽에 붙어 보였다 — `justifyContent: 'space-between'`으로 교체해 양 끝으로 벌렸다. 등급 변동 없음 |
| ☐ | `DTB-3-SHEET-02-0` | 장부 복수 선택 | Bottom Sheet | 전체 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionLedgerMultiSelectSheet.tsx` — 4-B에서 장부 목록을 prop(`options`)으로 받도록 전환(실 API 출처는 부모) |
| ☐ | `DTB-4-MODAL-01-0` | 상세 내역_수정 이탈 안내 | Modal | 전체 | 완료 | **0장** | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionRegisterScreen.tsx L480` |

### FDR — 폴더/장부

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 배경 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|---|
| ☐ | `FDR-1-PAGE-01-0` | 폴더 메인 (그리드 뷰) / 폴더 메인 (리스트 뷰) | Page | 전체 | 완료 | 4장 | `[확인필요]` | 블루 (명세 프레임 실측 v5 (폴더/폴더_메인화면.png#0, 상단 #F0F5FE, 점유율 66%)) | `screens/Folder/FolderScreen.tsx` — 상세: [design-diff.md#fdr-1-page-01-0-폴더-메인-그리드-뷰](design-diff.md#fdr-1-page-01-0-폴더-메인-그리드-뷰) (디자인 이미지가 검색 상태라 기본 목록과 상태 불일치, 재캡처 필요). **2026-09-13 치명 회귀 수정**: 최상위(folderId null)에서 장부 조회를 빈 배열로 하드코딩해뒀던 게 신설 엔드포인트(`POST /groups/{groupId}/ledgers`) 도입 후에도 안 고쳐져, 최상위에 장부를 만들어도 폴더 화면에 전혀 안 보였다 — 모임 전체 장부를 받아 `folderId === null`만 걸러 쓰도록 수정, 실호출로 확인(`docs/api-mapping-notes.md`류 상세는 커밋 메시지 참고). 시안(`폴더_메인화면.png` Case A/C)은 폴더와 장부를 아이콘만 다르게(폴더 아이콘 vs 문서 아이콘) 이름순으로 한 그리드에 섞어 보여줄 뿐 최상위 장부 전용 UI 규정이 없다 — 기존 `FolderItem kind='folder'/'ledger'` 혼합 렌더링이 이미 이 규정과 일치해 추가 UI 변경 없음. **재캡처 확인 완료(2026-09-13)**: 최상위에 만든 장부가 폴더 화면에 정상 노출됨을 재캡처로 재확인. **2026-09-18 헤더 메뉴·앱바 대조(Case A)**: 결함 2건 수정 — (1) 앱바에 통계/분석 아이콘이 빠져 있었다(⋮만 있었음), 시안 No.1은 통계/분석+⋮ 두 개다 → `Statistics` 라우트로 이동하는 막대그래프 아이콘(`assets/icons/content/Graph.png`, `MoreScreen`이 이미 쓰는 것과 동일 자산) 추가(루트 화면에만, 하위 폴더 화면은 이번 라운드 대상 아님). (2) 헤더 ⋮ 메뉴가 "선택 이동/그리드·리스트/전체 예산 설정/전체 백업" 4항목에 그리드·리스트가 2차 메뉴로 열리는 구조였는데, 시안 Case A는 "선택 이동, 예산 설정 / 그리드, 리스트 / 전체 백업" 평면 5항목·구분선 2개짜리 3그룹이다 → `Menu` 컴포넌트가 이미 지원하는 `sections`(그룹 배열) 방식으로 재구성, 2차 메뉴(`menuMode` 상태) 제거, 그리드/리스트에 아이콘 추가(`assets/icons/system/Grid.png`/`List.png`, 기존 자산). 문구도 "전체 예산 설정"→"예산 설정"(시안 그대로). 현재 보기 방식 체크 표시는 시안에 없어 안 넣음. 하위 폴더 메뉴는 그룹 구분 없이 기존 순서 유지, "그리드·리스트" 진입점만 같은 방식으로 평면화(2차 메뉴 제거가 공용 메커니즘이라 같이 반영됨, 그 화면 자체 재검토는 아님) — 상세: `design-diff.md` §"폴더 메인 헤더 메뉴·앱바" 참고 — **2026-09-19 시안 확인 완료(6-11, 명세서 원본 실측)**: 헤더 메뉴 `그리드`·`리스트` 둘 다 아이콘(Case A)으로 `LIST_ICON` 연결 그대로 유지 확인 / 그리드 열 간격 16dp(폭 93.33dp) 반영(`FOLDER_GRID_COLUMN_GAP` 8→16) / 목록 개수 단위 `건`→`개`(불일치 #11) / 빈 화면·검색 무결과 문구는 목업과 이미 일치(불일치 #10) / 검색 필드 X(clear) 버튼(Case C)은 `SearchField`가 미지원이라 미반영(보고, 미수정) |
| ☐ | `FDR-2-MODAL-01-0` | 새 폴더 생성 | Modal | - | 완료 | 1장 | `[확인필요]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | `screens/Folder/FolderScreen.tsx L344 dialogConfig` |
| ☐ | `FDR-2-MODAL-02-0` | 폴더 전체 백업 | Modal | 총무 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Folder/FolderScreen.tsx`(activeDialog='backup', 2026-09-11 확인) — 제목·설명·placeholder·"보관" 버튼까지 일치. **주의**: `design-index.json`에 등록된 후보(`FDR\폴더\FDR-2-MODAL-02-0.png`)는 실제로는 "새 폴더 생성" 다이얼로그라 오배치이고, 진짜 시안은 `FDR\폴더\백업\` 하위에 같은 이름으로 따로 있다(§5-4 참고) · **부모 FDR-1-PAGE-01-0 배경: 블루** |
| ☐ | `FDR-2-PAGE-01-0` | 이동 대상 선택 (그리드 뷰) / 이동 대상 선택 (리스트 뷰) | Page | 전체 | 완료 | 1장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (폴더/폴더_메뉴_폴더/장부선택이동.png#0, 상단 #FFFFFF, 점유율 79%)) | `screens/Folder/FolderSelectMoveScreen.tsx` — **2026-09-13 회귀 수정**: 최상위(folderId null)에서 장부 조회를 빈 배열로 하드코딩해뒀던 게 남아 있어, `POST /groups/{groupId}/ledgers`로 만든 최상위 장부를 이동 대상으로 선택할 수 없었다(`FolderScreen.tsx`와 동일 패턴의 회귀). `ledgerService.getAllLedgersInGroup()`으로 모임 전체 장부를 받아 `folderId === null`인 것만 걸러 쓰도록 수정, 실호출로 확인 |
| ☐ | `FDR-2-PAGE-02-0` | 전체 예산 설정 목록 | Page | 전체 | 완료 | 2장 | `[구현]` | 블루(#F0F5FE) | `screens/Folder/FolderBudgetListScreen.tsx` — **2026-09-18 결함 → 수정**: 리스트 행이 `FolderItem`(아이콘+장부명, 아래줄에 "예산 N원" 2줄)이었는데 시안 No.2는 아이콘 없이 좌측 장부명·우측 예산 금액·꺾쇠 한 줄이다 → `SelectionListItem type="picker"`로 교체(같은 종류 행 전용 기존 컴포넌트 재사용, 새로 안 만듦). 예산 미설정 시 "0원" 노출(전엔 "예산 미설정" 문구 — 공유 상수 `LEDGER_ITEM_BUDGET_UNSET`은 다른 화면도 쓰고 있어 그대로 두고 이 화면만 로컬 처리로 분리). 정렬은 서버 응답 순서를 그대로 믿고 있었는데 시안 No.2 [상태]가 "최신 생성된 장부순"을 명시해 `createdAt` 내림차순 클라이언트 정렬을 추가(`getAllLedgersInGroup` 응답에서 버려지고 있던 `createdAt`을 `LedgerSummary`에 옵셔널로 살림). 배경도 시안이 옅은 블루라 `BACKGROUND_PRIMARY` 명시 적용. 빈 화면 문구는 이미 시안과 일치("'폴더'에서 장부를 생성해주세요.") — §5-16 참고 · 8-5 수동 재확인(v5 프레임 미검출): 프레임 x=50..410·430..790 안쪽 스트립 모두 #F0F5FE(빈 상태 프레임 포함) — 기존 블루와 일치 |
| ☐ | `FDR-2-PAGE-04-0` | 폴더 상세 (그리드 뷰) / 폴더 상세 (리스트 뷰) | Page | 전체 | 완료 | 1장 | `[구현]` | 블루 (명세 프레임 실측 v5 (폴더/폴더_폴더상세.png#0, 상단 #F0F5FE, 점유율 76%)) | `screens/Folder/FolderScreen.tsx` — 폴더 진입 시 동일 화면 재사용. 위 `FDR-1-PAGE-01-0` 2026-09-13 회귀 수정과 같은 화면(같은 파일) — 이 화면(하위 폴더 안)은 애초에 `folderId` 값이 있어 영향 없었음 **앱바 우측(2026-09-20 10-2)**: Case A 목업이 통계 아이콘 + ⋮ 둘 다이므로 폴더 상세에서도 둘 다 표시한다(`FolderScreen`의 `isRoot` 조건 제거). 통계 아이콘을 누르면 폴더 메인과 같은 `Statistics`(모임 전체 통계, `ETC-2-PAGE-07-0`, route params 없음)로 간다 — 폴더 범위 통계는 명세에 없어 **폴더 메인과 같은 동작**으로 둠. ⋮ 메뉴는 5항목(`선택 이동`/`폴더 이름 변경`/구분선/`그리드`·`리스트`/구분선/`폴더 해제`)이 시안 Case A와 일치. |
| ☐ | `FDR-2-PAGE-05-0` | 장부 상세 | Page | 전체 | 완료 | 5장 | `[구현]` | 블루 (명세 프레임 실측 v5 (폴더/폴더_장부상세.png#0, 상단 #F0F5FE, 점유율 87%)) | `screens/Folder/LedgerDetailScreen.tsx`. **2026-09-18 결함 → 수정**: 캐러셀(수입/지출 카드, 예산 카드) 1면→2면 스냅이 어긋나 2면부터 1면 잔재가 좌측에 잘려 남고 2면 카드 우측이 화면 밖으로 잘렸다 — 원인은 `snapToInterval`이 스크롤뷰 `style`의 `paddingLeft:24`(우측엔 없음)를 계산에 안 넣은 것(1페이지는 이 인셋이 그냥 여백처럼 보여 정상으로 착각하기 쉬웠음). 슬라이드를 `useWindowDimensions` 기준 화면 폭 그대로 채우고 카드 여백을 슬라이드 안쪽 padding으로 옮겨 `snapToInterval` 자체를 없앴다(`pagingEnabled` 기본 동작만으로 항상 정확). 2026-09-13 이 화면 캡처 때 구조(2면+dots)만 보고 이 잘림을 놓쳤다 — `design-diff.md` 참고 · 배경 상하 다름 — 상단 #F0F5FE / 하단 #FFFFFF(v5, 구현 시 유의) **2026-09-20 10-3 시안 대조 반영**: 앱바 우측을 ⋮ 하나로(검색 아이콘 제거), 카드 아래에 필터(좌)·검색(우) 줄 신설(`LedgerFilterSheet` 재사용, 서버 조회 조건으로 반영), 개수 `{N} 건`, 날짜 그룹 헤더(`M월 D일 요일`)·행에서 날짜 캡션 제거. **판단 보류**: 카드 scroll-away 미구현, ⋮ 라벨 `장부 삭제` vs 설명표 `삭제`, 승인 요청 건 노출, 필터 시트에 `기간` 없음(서버 미지원) — `design-diff.md` 1-1. 실기기 확인 대기. |
| ☐ | `FDR-2-SHEET-01-0` | 새 장부 생성 | Bottom Sheet | 총무 | 완료 | 2장 | `[확인필요]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Folder/NewItemSheet.tsx` |
| ☐ | `FDR-3-MODAL-01-0` | 폴더 이름 변경 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Folder/FolderScreen.tsx dialogConfig` — 폴더 이름 변경 · **부모 FDR-1-PAGE-01-0 배경: 블루** |
| ☐ | `FDR-3-MODAL-02-0` | 폴더 해제 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Folder/FolderScreen.tsx dialogConfig` — 폴더 해제. **2026-09-05 갱신**: "최상위 폴더 + 직속 장부 있음" 조합의 해제를 막던 클라이언트 차단(`isUnlinkUnsafe`, 최상위 장부를 다시 조회할 API가 없다는 전제)을 없앴다 — `GET .../folder-items`(폴더ID 생략=최상위)가 최상위로 옮긴 장부도 `LEDGER` 항목으로 그대로 보여줌을 실호출로 확인해 그 전제가 깨졌다(`docs/api-gaps.md` "확정됨" 6번). 이제 모든 폴더가 항상 정상 해제 확인 모달로만 간다 · **부모 FDR-2-PAGE-04-0 배경: 블루** |
| ☐ | `FDR-3-MODAL-03-0` | 장부 이름 변경 | Modal | 총무 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Folder/LedgerDetailScreen.tsx` — **2026-09-18 결함 → 수정**: 타이틀 아래 안내 문구가 아예 없었다(시안엔 한 줄 있음) → `Dialog`의 `description` prop에 연결(`LEDGER_RENAME_DIALOG_DESCRIPTION` 신설). 자동 포커스도 `autoFocusTextField`를 아예 안 넘기고 있어 미구현이었다 → `activeDialog==='rename'`일 때 켬. 덧붙여 발견: placeholder가 원래 "최대 20자 이내로 입력해주세요."(길이 제한 문구)로 잘못 들어가 있었는데 시안 No.3 Placeholder 규정은 "변경할 이름을 입력해주세요."다 — 그 문구는 새로 추가한 `description`으로 옮기고 placeholder는 시안 규정으로 정정. 기존 이름 프리필·X 전체삭제 아이콘·취소/변경 버튼은 이미 일치해 안 건드림. **글자수 숫자 불일치(시안 목업 10자 vs 설명표/서버 확정값 20자) — 판단 보류**: §5-16 참고, 코드는 현재 `LEDGER_NAME_MAX_LENGTH`(20, 실제 제한과 동일하게 유지)를 그대로 문구에 반영 · **부모 FDR-2-PAGE-05-0 배경: 블루** |
| ☐ | `FDR-3-MODAL-04-0` | 장부 삭제 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Folder/LedgerDetailScreen.tsx L262` — 장부 삭제. **2026-09-19 실기기 확인**(`shots/Screenshot_20260919_132315_BILLAGE.jpg`): `Dialog destructive`, 제목 "장부를 삭제하시겠습니까?", 설명 "삭제 이후에는 데이터 복구가 어렵습니다.", 버튼 `취소`/`삭제`(빨강)가 캡처와 일치(사용자 확인 — 삭제 글자색 정확한 값은 안티앨리어싱 때문에 이 캡처로 확정 안 함). 등급 변경 없음 · **부모 FDR-2-PAGE-05-0 배경: 블루** |
| ☐ | `FDR-3-MODAL-05-0` | 새 폴더 생성 | Modal | 총무 | 완료 | **0장** | `[확인필요]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Folder/FolderScreen.tsx` — FDR-2-MODAL-01-0과 중복 ID — 기획 확인 필요 · **부모 FDR-2-PAGE-01-0 배경: 흰색** |
| ☐ | `FDR-3-PAGE-01-0` | 이동 경로 선택 (그리드 뷰) / 이동 경로 선택 (리스트 뷰) | Page | 전체 | 완료 | 2장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (폴더/폴더_메뉴_폴더/장부선택이동_폴더선택.png#0, 상단 #FFFFFF, 점유율 73%)) | `screens/Folder/FolderMoveDestinationScreen.tsx`. **2026-09-05 갱신**: 확정 버튼이 `PATCH /folders`·`PATCH /ledgers` 단건 API를 선택 개수만큼 순차 호출하던 것을 `folderService.moveFolderItems()`(`POST .../folder-items/move`, 실호출로 "미구현" 태그가 낡았음을 확인) 한 번 호출로 교체 — 서버가 트랜잭션으로 처리해 "N개 성공 M개 실패" 부분 성공 문구가 필요 없어졌다. "장부는 최상위로 이동 불가" 차단도 같이 없앴다(새 API가 장부 최상위 이동을 명시적으로 지원, 실호출로 최상위 이동 후 조회까지 확인) |
| ☐ | `FDR-3-PAGE-02-0` | 내역 검색_장부 | Page | 전체 | 완료 | 4장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (폴더/폴더_장부상세_검색.png#0, 상단 #FFFFFF, 점유율 84%)) | `screens/Folder/LedgerSearchScreen.tsx` |
| ☐ | `FDR-3-PAGE-03-0` | 새 장부 생성 | Page | 총무 | 완료 | **0장** | `[구현]` | 흰색 (명세 프레임 실측 v5 (폴더/폴더_장부생성.png#0, 상단 #FFFFFF, 점유율 90%)) | `screens/Folder/LedgerCreateScreen.tsx` — 이미지 0장 — 대조 불가 |
| ☐ | `FDR-3-SHEET-01-0` | 장부 예산 입력 | Bottom Sheet | 총무 | 완료 | 1장 | `[확인필요]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Folder/FolderBudgetListScreen.tsx` — `FDR-3-SHEET-02-0`과 같은 BottomSheet로 판단(낮은 확신). 두 ID가 같은 시트인지 기획 확인 필요 |
| ☐ | `FDR-3-SHEET-02-0` | 예산 설정 | Bottom Sheet | 총무 | 완료 | 2장(크롭 기준) | `[확인필요]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Folder/FolderBudgetListScreen.tsx` — `FDR-3-SHEET-01-0`과 같은 BottomSheet로 판단. **2026-09-12**: 원본 스펙시트 130장 헤더를 전수 확인한 결과 이 ID로 헤더가 찍힌 파일이 하나도 없다 — 예산 입력 관련 시안 2장은 전부 `FDR-3-SHEET-01-0`으로 표기돼 있다(§5-4 참고). "2장"은 크롭 인덱스 기준일 뿐 원본 스펙시트 근거는 아니다 |
| ☐ | `FDR-3-SHEET-03-0` | 장부상세_필터링 | Bottom Sheet | 전체 | 예정 | 5장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Folder/LedgerFilterSheet.tsx` — 디자인 '예정'인데 이미지 5장 존재 |
| ☐ | `FDR-3-SNACKBAR-01-0` | 새 폴더 생성_완료 | SnackBar | 총무 | 완료 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/Folder/FolderScreen.tsx` — `SNACKBAR_FOLDER_CREATED_SUFFIX` (기존 `LedgerCreateScreen.tsx L114` 표기는 장부 생성 스낵바를 잘못 지목한 것이었음) · **부모 FDR-1-PAGE-01-0 배경: 블루** |
| ☐ | `FDR-3-SNACKBAR-02-0` | 폴더 백업 완료 | Snackbar | 총무 | 완료 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/Folder/FolderScreen.tsx`(`SNACKBAR_BACKUP_DONE_TITLE`/`DESCRIPTION`, 2026-09-11 확인) — "모든 장부가 보관되었어요." + 부제까지 시안과 일치 · **부모 FDR-1-PAGE-01-0 배경: 블루** |
| ☐ | `FDR-4-SNACKBAR-01-0` | 이동 완료 / 폴더 해제_완료 | SnackBar | 전체/총무 | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | "폴더 해제_완료"는 `screens/Folder/FolderScreen.tsx`(`SNACKBAR_FOLDER_UNLINKED_SUFFIX`), "이동 완료"는 `screens/Folder/FolderMoveDestinationScreen.tsx`(`SNACKBAR_FOLDER_MOVED`) — 두 파일에 분산 · **부모 FDR-1-PAGE-01-0 배경: 블루** |
| ☐ | `FDR-4-SNACKBAR-02-0` | 장부 삭제_완료 | SnackBar | 총무 | 예정 | 2장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/Folder/LedgerDetailScreen.tsx` — `SNACKBAR_LEDGER_DELETED_SUFFIX` (`FolderScreen.tsx`에는 장부 삭제 기능이 없음, 폴더 unlink만 함) · **부모 FDR-1-PAGE-01-0 배경: 블루** |
| ☐ | `FDR-4-SNACKBAR-03-0` | 이름 변경_완료 | SnackBar | 총무 | 예정 | 2장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/Folder/FolderScreen.tsx` — `activeDialog==='rename'` 확인 시 `SNACKBAR_FOLDER_RENAMED` (@screen 작업 때 확인해놓고 이 표 상태 갱신을 빠뜨렸었음) |

### DUE — 납부 관리(회비)

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 배경 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|---|
| ☐ | `DUE-1-PAGE-01-0` | 납부 관리 메인 | Page | 전체 | 완료 | 3장 | `[구현]` | 블루(#F0F5FE) | `screens/Dues/DuesScreen.tsx` — 6-A(조회 전용), 2026-09-05 정합성 복구로 정렬 로직 재수정(클라이언트 재정렬 제거, 서버 정렬 순서 그대로 렌더링). 2026-09-03 명세 갱신으로 이 화면 전용 이미지가 새로 반입됨(`npm run design-index` 재실행, 종전엔 화면명세서 임베드 1장만 있었음). **2026-09-13 DUE 묶음 4 배경 판정**: `납부관리_메인.png` 리스트 영역이 옅은 블루 — 코드가 이미 `BLUE_50`(=`BACKGROUND_PRIMARY`) 하드코딩 중이라 일치, 변경 없음 |
| ☐ | `DUE-2-PAGE-01-0` | 회비 생성 | Page | 총무 | 완료 | 3장 | `[구현]` | 흰색 | `screens/Dues/DuesCreateScreen.tsx`(step='basic') — 6-B, **2026-09-05 정합성 복구로 재수정**. 화면명세대로 기간(시작일~마감일) 범위 입력을 복원해 `startDate`를 같이 보낸다(`DuesDateRangeSheet` 신설, `Calendar` 재사용). 6-B 당시 "서버 미지원"으로 마감일 단일 입력으로 줄였던 판단이 틀렸었다 — `docs/api-gaps.md` "확정됨"/"코드 반영 완료" 절 참고. **2026-09-13 DUE 묶음 4 결함 수정**: 장부/기간 필드가 "라벨+값+꺾쇠" 한 줄 행(`SelectionListItem`)이었는데 시안 No.4/No.5는 라벨 아래 테두리 박스 형태다 — 오늘 `ReportCreateByPeriodScreen`(ETC-4-PAGE-04-0)에서 만든 박스 스타일을 그대로 재사용(새로 안 만듦). 기간 구분자 " - "→" ~ "로 수정, 장부 placeholder "장부를 선택해주세요."→"+ 선택하기", 기간 placeholder "기간을 선택해주세요."→"YY.MM.DD ~ YY.MM.DD"(시안 문구 그대로, §5-13 참고 — 값 자체는 4자리 연도 유지, 보고서 쪽 2자리 표기와 다른 시트라 공용화 안 함). 배경은 시안이 흰색이라 `BACKGROUND_SECONDARY` 명시 적용(이전엔 미지정) |
| ☐ | `DUE-3-PAGE-01-0` | 새 회비 생성_모임원 선택 | Page | 총무 | 완료 | 1장(화면명세서 임베드) | `[구현]` | 흰색 | `screens/Dues/DuesCreateScreen.tsx`(step='members') — 6-B. **IA(`billage-ia.md`) 원본 201개 화면 목록에 이 ID 자체가 없다** — 화면명세서에만 정의돼 있음(IA 누락으로 보임). 모임원 0명 빈 상태는 화면명세서 Case A에 명시돼 있어("모임원을 추가해보세요.") 그대로 구현함. **2026-09-13 DUE 묶음 4 배경 판정**: `납부관리_메인_새회비생성_모임원선택.png` 흰 배경 — `DUE-2-PAGE-01-0`과 같은 컨테이너(`container` 스타일)라 함께 `BACKGROUND_SECONDARY` 적용됨 |
| ☐ | `DUE-2-PAGE-02-0` | 모임원 관리 | Page | 전체 | 완료 | 12장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/모임관리/더보기_모임관리_모임원관리.png#0, 상단 #FFFFFF, 점유율 91% 외 1프레임 일치)) | `screens/Member/MemberManageScreen.tsx` — 7-A(조회 전용, 목록+검색) + **7-C 추가**: 행 탭이 `MemberDetail`로 연결됐고, ⋮ 메뉴에 명세 Case A의 "모임원 삭제"를 추가해 같은 화면 안 `mode`(새 라우트 아님)로 다중 선택·일괄 삭제를 구현했다 — 시안이 "백 버튼: 삭제 모드 취소 후 메인 복귀"라고 명시해 뒤로가기가 스택을 나가지 않고 모드만 되돌린다. 2026-09-05 시안 대조: 차이 없음(design-diff.md "배치 G") |
| ☐ | `DUE-2-PAGE-03-0` | 회비 항목 상세 / 회비 항목 상세 (미납부) | Page | 전체/총무 | 진행 | 5장 | `[구현]` | 블루(#F0F5FE) | `screens/Dues/DuesDetailScreen.tsx` — 6-A(조회 전용). 진행 중 상태(기본 탭 '미납부'). 2026-09-05 화면명세서 UI 요소 표 전수 대조: 앱바 메뉴/캐러셀 카드/회비 요청하기/체크박스+CTA 4건 차이 + **미납부·납부완료 리스트가 화면에 안 보이는 치명급 렌더링 버그 신규 발견**(데이터는 정상, 원인 미확정) — 상세: `design-diff.md` "배치 G" 절 `DUE-2-PAGE-03-0 / DUE-2-PAGE-03-1` 항목. **7-B-1(같은 날) 추가**: 렌더링 버그는 `Divider.tsx` 수정으로 해결됨(별도 라운드). 앱바 ⋮ 메뉴(회비 수정/모임원 선택/회비 마감/회비 삭제, 상태별 분기 + OWNER 전용)를 연결했다. **7-B-2 추가**: 체크박스+일괄 CTA("납부 완료하기"/"납부 취소하기") 연결 — `OPEN` && `OWNER`일 때만 노출(`SCHEDULED`/`CLOSED`는 비활성이 아니라 완전히 숨김, 목업 그대로). `PATCH /dues/{id}/members`(일괄) 실호출 확인 후 그대로 사용. 회비 요청하기는 여전히 미구현(대응 API 없음). **2026-09-17 DUE 묶음 5 반영**: 5개 상태 캡처(진행중/예정/마감확인모달/마감됨/삭제확인모달) 전부 시안과 대조 완료 — 문구·CTA·모달 전부 일치, 배경만 미지정이었다 → `BACKGROUND_PRIMARY` 적용. **결함 발견·수정**: CLOSED 상태 메뉴가 `status!=='CLOSED'` 조건 하나로 "회비 수정"까지 같이 숨기고 있었는데, 시안 Case A(마감된 회비)는 "회비 수정 / 회비 삭제" 두 개를 보여준다 — "회비 수정"은 항상 노출, "모임원 선택"/"회비 마감"만 CLOSED에서 숨기도록 조건 분리. 예정된 회비 배지는 D-배지가 아니라 날짜 표기(예: `07.28`)가 맞다 — 코드(`formatDateDot(detail.startDate)`)가 이미 일치, 결함 아님 · 배경 상하 다름 — 상단 #F0F5FE / 하단 #FFFFFF(v5, 구현 시 유의) |
| ☐ | `DUE-2-PAGE-03-1` | 회비 항복 상세 (납부완료) — 실제로는 "마감된 회비"/"예정된 회비" 두 상태 변형 | Page | - | 완료 | 6장 | `[구현]` | 블루(#F0F5FE) | `screens/Dues/DuesDetailScreen.tsx` — 같은 파일이 서버 `status`(`SCHEDULED`/`OPEN`/`CLOSED`)로 세 상태(예정된 회비, 진행중=DUE-2-PAGE-03-0, 마감된 회비)를 전부 분기 처리한다. 2026-09-05 정합성 복구 전엔 "예정"을 `paidCount===0`으로 잘못 추정했으나 서버 `SCHEDULED`를 그대로 신뢰하도록 고쳤다. IA 페이지명 "회비 항복 상세 (납부완료)"는 오타로 보임. 시안 대조는 위 `DUE-2-PAGE-03-0` 행 참고(같은 파일, 같은 결함·같은 수정) · 배경 상하 다름 — 상단 #F0F5FE / 하단 #FFFFFF(v5, 구현 시 유의) |
| ☐ | `DUE-3-MODAL-01-0` | 회비 삭제 | Modal | 총무 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Dues/DuesDetailScreen.tsx`(확인 `Dialog`) — 7-B-1. 성공 시 `Main`/`Dues`(목록)로 라우팅하며 스낵바(`DUE-4-SNACKBAR-03-0`) 표시 · **부모 DUE-2-PAGE-03-0 배경: 블루** |
| ☐ | `DUE-3-MODAL-02-0` | 회비 마감 | Modal | 총무 | 예정 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Dues/DuesDetailScreen.tsx`(확인 `Dialog`) — 7-B-1. `OPEN` 상태에서만 ⋮ 메뉴에 노출. 성공 시 `Main`/`Dues`(목록)로 라우팅하며 스낵바(`DUE-4-SNACKBAR-02-0`) 표시 · **부모 DUE-2-PAGE-03-0 배경: 블루** |
| ☐ | `DUE-3-PAGE-02-0` | 모임원 선택 | Page | 총무 | 완료 | 5장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (DUE/납부관리_회비상세_수정_모임원선택.png#0, 상단 #FFFFFF, 점유율 81%)) | `screens/Dues/DuesMemberEditScreen.tsx` — 7-B-1, ⋮ 메뉴 "모임원 선택"에서 독립 진입. `DuesCreateScreen`(생성, `DUE-3-PAGE-01-0`)과 다른 화면 — `targetMemberIds`만 PATCH로 보낸다. **2026-09-17 재확인**: 사용자 보고("모임원 수정이 안 된다") 조사 결과 진입 경로(메뉴 항목→`navigate('DuesMemberEdit')`→등록된 라우트→화면 컴포넌트)가 코드상 전부 정상 연결돼 있음을 확인 — 결함 없음. 검색·전체선택·체크박스·이탈모달(DUE-4-MODAL-02-0) 전부 시안과 일치. 코드 변경 없음. 페이지 경로 표기 불일치는 §5-13 참고 |
| ☐ | `DUE-3-PAGE-03-0` | 모임원 상세 | Page | 전체 | 완료 | 2장 | `[구현]` | 블루 (명세 프레임 실측 v5 (더보기/모임관리/더보기_모임관리_모임원관리_모임원상세.png#0, 상단 #F0F5FE, 점유율 79%)) | `screens/Member/MemberDetailScreen.tsx` — 7-C(조회 전용, MEMBER 권한). "총 납부 금액" 카드는 `MemberPaymentHistory`로 뎁스인. 수정(연필)·삭제(휴지통) 아이콘은 OWNER 전용이라 일반 관리자에겐 숨긴다 |
| ☐ | `DUE-3-PAGE-04-0` | 회비 요청 작성 | Page | 총무 | 완료 | 4장 | `[구현]` | 블루(#F0F5FE) | `screens/Dues/DuesRequestScreen.tsx`(문서만 미갱신 상태였다 — 코드는 이미 완성돼 있었음). Dues.txt "서버 API 아님(클립보드+OS 공유)" 그대로 `Share.share({message})`만 호출, 서버 호출 없음. 텍스트 placeholder·버튼 비활성 조건·이탈 확인 모두 시안 4장과 일치. `DuesDetailScreen`의 "회비 요청" 버튼 → `navigation.navigate('DuesRequest')`로 연결 확인. **2026-09-13 DUE 묶음 4 반영**: 배경이 시안(`납부관리_납부요청.png`)상 옅은 블루인데 미지정이었다 — `BACKGROUND_PRIMARY` 적용. 명세 No.2 "화면 진입 시 자동 포커스+키보드 노출"이 코드에 없었다(`TextArea`에 `autoFocus` prop 자체가 없었음) — `TextArea`에 `autoFocus` prop 추가하고 이 화면에서 켬(실기기 캡처엔 키보드가 없었는데, 캡처 직전 내렸을 가능성이 있어 코드 확인이 먼저였다 — 실제로 미구현으로 확인됨). 앱바 문구는 시안 목업 "회비 요청" 그대로 유지(설명표 No.1 "납부 요청"과 불일치 — §5-13 누적 관찰) |
| ☐ | `DUE-3-PAGE-06-0` | 회비 수정 | Page | 총무 | 완료 | 1장 | `[구현]` | 흰색 | `screens/Dues/DuesEditScreen.tsx` — 7-B-1. 제목/장부/기간만 수정, 금액은 `TextField disabled`로 표시만(서버가 `DUES_AMOUNT_IMMUTABLE`로 절대 금지). 목업엔 우측 X 아이콘이 안 보이는데 표 설명엔 있음 — 목업을 따라 뒤로가기(`<`) 하나에 이탈 확인을 붙였다(§5-4 참고). **2026-09-13 DUE 묶음 4 반영**: `납부관리_회비상세_수정.png` 기준 장부/기간 필드를 `DUE-2-PAGE-01-0`과 같은 박스 스타일로 통일(같은 결함, 같은 재사용 컴포넌트). 배경은 시안이 흰색이라 `BACKGROUND_SECONDARY` 명시 적용 |
| ☐ | `DUE-3-SHEET-02-0` | 모임원 추가 선택 | Bottom Sheet | 전체 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Member/MemberAddSheet.tsx` — 7-A |
| ☐ | `DUE-3-SNACKBAR-01-0` | 입금 확인 | Snackbar | - | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `DuesDetailScreen.tsx` — 7-B-2. "납부 완료하기" 성공 시 "{changedCount}명의 납부가 확인되었어요." |
| ☐ | `DUE-3-SNACKBAR-02-0` | 입금 취소 | Snackbar | - | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `DuesDetailScreen.tsx` — 7-B-2. "납부 취소하기" 성공 시 "{changedCount}명의 납부가 취소되었어요." |
| ☐ | `DUE-4-MODAL-01-0` | 모임원 삭제 | Modal | 전체 | 완료 | 3장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `MemberDetailScreen.tsx`(단건)·`MemberManageScreen.tsx`(일괄) 공유 `Dialog` — 7-C, OWNER 전용. 시안 문구("기존 납부 내역은 그대로 유지돼요")는 인원수와 무관하게 동일해 그대로 재사용했다. 이 문구가 실제 삭제 범위(진행 중 회비 참여 데이터는 Hard Delete)를 오해하게 만들 수 있어 §5-4에 기획 확인 항목으로 올렸다 · **부모 DUE-3-PAGE-03-0 배경: 블루** |
| ☐ | `DUE-4-MODAL-02-0` | 회비수정_이탈 | Modal | 총무 | 예정 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `DuesEditScreen.tsx`/`DuesMemberEditScreen.tsx` 공유 `Dialog` — 7-B-1. 입력값이 하나라도 바뀐 상태로 뒤로가기 시 노출 · **부모 DUE-3-PAGE-06-0 배경: 흰색** |
| ☐ | `DUE-4-PAGE-01-0` | 모임원 추가_개별 | Page | 전체 | 완료 | 6장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/모임관리/모임원추가_개별추가.png#0, 상단 #FFFFFF, 점유율 98%)) | `screens/Member/MemberAddIndividualScreen.tsx` — 7-A. 2026-09-05 시안 대조: "이름" 필수(`*`) 표시 누락, 태그 입력 진입점이 시안의 "+ 추가하기" 필 버튼+인라인 칩이 아니라 `SelectionListItem` 로우로 대체됨 — 상세: `design-diff.md` "배치 G" 절 |
| ☐ | `DUE-4-PAGE-02-0` | 모임원 추가_일괄 | Page | 전체 | 완료 | 4장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/모임관리/모임원추가_일괄추가.png#0, 상단 #FFFFFF, 점유율 90%)) | `screens/Member/MemberAddBulkScreen.tsx` — 7-A |
| ☐ | `DUE-4-PAGE-03-0` | 모임원 수정 | Page | 전체 | 완료 | 6장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/모임관리/모임원조회_모임원수정.png#0, 상단 #FFFFFF, 점유율 83%)) | `screens/Member/MemberEditScreen.tsx` — 7-C, OWNER 전용. `MemberAddIndividualScreen`(7-A)과 필드는 같지만 명세가 별도 화면으로 분리해 독립 파일로 구현(`DuesCreateScreen`/`DuesEditScreen` 선례와 동일 판단). PATCH가 부분 수정이 아니라 통째 교체라(Member.txt §4 aside, 2026-09-05 실호출로 재확인 — 이름만 보내면 나머지가 비워짐) 저장 시 항상 폼 전체 값을 보낸다 |
| ☐ | `DUE-4-PAGE-04-0` | 개인 납부 내역 | Page | 전체 | 완료 | 2장 | `[구현]` | 블루 (명세 프레임 실측 v5 (더보기/모임관리/모임원조회_모임원_납부내역.png#0, 상단 #F0F5FE, 점유율 75%)) | `screens/Member/MemberPaymentHistoryScreen.tsx` — 7-C, 조회 전용(리스트 항목 탭 액션 없음). 명세는 이 API가 페이지네이션(`page`/`size`)을 지원한다고 적었지만 2026-09-05 실호출로 확인한 실제 응답은 `payments`가 배열 그대로라 무한 스크롤 없이 전체를 한 번에 받는다(`docs/backend-requests.md` 정정 요청). 시안이 언급한 필터/검색 툴바는 API가 `from`/`to` 기간만 지원해 만들지 않았다 — §5-4 참고. **2026-09-21**: `TransactionListItem`이 상태 슬롯에 기본으로 납부관리 아이콘(`Bill.png`)을 그려 모든 행에 붙는다(사용자 결정; 시안 원본이 이 환경에 없어 시안 대조는 못 함 — 판단 보류). 같은 날 행이 두 줄 구조(윗줄 라벨·아이콘, 아랫줄 내역명·금액 볼드)로 바뀌었다 — 이 화면 행 모양도 함께 바뀜 · 배경 상하 다름 — 상단 #F0F5FE / 하단 #FFFFFF(v5, 구현 시 유의) |
| ☐ | `DUE-4-SNACKBAR-01-0` | 회비 생성 완료 | Snackbar | 총무 | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/Dues/DuesCreateScreen.tsx`(생성 성공 시) → `screens/Dues/DuesScreen.tsx`(렌더 위치, 문서만 미갱신 상태였다). 시안대로 생성 화면이 아니라 납부관리 메인 목록으로 이동해 스낵바를 띄운다 — 문구(`'{회비명}' 회비가 생성되었어요.`)도 일치 · **부모 DUE-1-PAGE-01-0 배경: 블루** |
| ☐ | `DUE-4-SNACKBAR-02-0` | 회비 마감 완료 | Snackbar | 총무 | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `DuesScreen.tsx` — 7-B-1. `DuesDetailScreen`이 마감 성공 후 `navigation.navigate('Main',{screen:'Dues',params:{snackbarMessage}})`로 넘겨 이 화면에서 표시(기본 스타일, 시안 '예정') · **부모 DUE-1-PAGE-01-0 배경: 블루** |
| ☐ | `DUE-4-SNACKBAR-03-0` | 회비 삭제 완료 | Snackbar | 총무 | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `DuesScreen.tsx` — 7-B-1. 삭제는 상세 화면이 사라지므로 마감과 같은 방식으로 목록 화면에서 표시(기본 스타일, 시안 '예정') · **부모 DUE-1-PAGE-01-0 배경: 블루** |
| ☐ | `DUE-4-SNACKBAR-04-0` | 회비 수정 완료 | Snackbar | 총무 | 예정 | **0장** | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `DuesEditScreen.tsx`/`DuesMemberEditScreen.tsx` — 7-B-1. 각 화면 자체에서 표시 후 1.6초 뒤 회비 상세로 복귀(`DuesCreateScreen` 완료 스낵바와 같은 패턴, 시안 이미지 자체가 없어 기본 스타일) · **부모 DUE-2-PAGE-03-0 배경: 블루** |
| ☐ | `DUE-5-PAGE-01-0` | 태그 입력 | Page | - | 완료 | 6장 | `[구현]` | 흰색 (명세 프레임 수동 실측 (더보기/모임관리/모임원추가_개별추가_태그.png, v5 프레임 미검출 — 프레임 x=50..410·430..790 안쪽 스트립 #FFFFFF 1219·1246픽셀)) | `screens/Member/MemberAddIndividualScreen.tsx`(step='tags') — 7-A. 별도 라우트가 아니라 개별 추가 화면 내부 스텝으로 구현(회비 생성 화면의 step 패턴과 동일). 명세의 상단 완료(✓) 아이콘 대신 기존 앱 관례(뒤로가기+하단 CTA)를 따름 |
| ☐ | `DUE-5-PAGE-02-0` | 개인 납부 내역_검색 | Page | 전체 | 완료 | 6장 | `[미구현]` | 미판정 | 7-C에서 `MemberPaymentHistoryScreen`을 만들며 함께 검토했으나, 대응 API(`GET .../payments`)가 `keyword` 파라미터를 지원하지 않아(`from`/`to` 기간만 가능) 만들면 서버에 반영 안 되는 죽은 UI가 된다 — §5-4 참고 |
| ☐ | `DUE-5-SNACKBAR-01-0` | 모임원 추가_일괄 완료 | Page | - | 완료 | 2장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/Member/MemberAddBulkScreen.tsx` — 7-A · ⚠️ 형식 열이 Page(IA 입력 오류 의심, §5-3) — ID 종류(SNACKBAR) 기준으로 적용 |
| ☐ | `DUE-5-SNACKBAR-02-0` | 모임원 삭제 완료 | Snackbar | - | 예정 | 4장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `MemberDetailScreen.tsx`(단건, `Main`/`MemberManage`로 navigate해 스낵바 전달)·`MemberManageScreen.tsx`(일괄, 같은 화면에서 바로 표시) — 7-C. "{N}명의 모임원이 삭제되었어요." 3초 후 자동 소멸(시안 명시) · **부모 DUE-2-PAGE-02-0 배경: 흰색** |
| ☐ | `DUE-3-MODAL-03-0` | (IA 목록에 없음) | Modal | - | - | 2장 | `[확인필요]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | `npm run design-index` 재실행으로 새로 발견된 ID — `billage-ia.md` 201개 목록에 없음. `DUE-3-PAGE-01-0`·`DUE-5-SNACKBAR-03-0`과 같은 패턴(화면명세서에만 정의)으로 추정, 내용 미확인 |
| ☐ | `DUE-3-PAGE-02-1` | (IA 목록에 없음) | Page | - | - | 2장 | `[확인필요]` | 미판정 | 위와 동일 — 신규 발견, 내용 미확인. `DUE-3-PAGE-02-0`(모임원 선택)의 상태 변형으로 추정 |
| ☐ | `DUE-4-MODAL-03-0` | (IA 목록에 없음) | Modal | - | - | 1장 | `[확인필요]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | 위와 동일 — 신규 발견, 내용 미확인 |

### ETC — 더보기 — 모임/보고서/증빙앨범/설정

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 배경 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|---|
| ☐ | `ETC-1-PAGE-01-0` | 더보기 메인 | Page | 전체 | 완료 | 2장 | `[확인필요]` | 블루 (명세 프레임 실측 v5 (더보기/메인/더보기_메인.png#0, 상단 #F0F5FE, 점유율 90%)) | `screens/More/MoreScreen.tsx` — 상세: [design-diff.md#etc-1-page-01-0-더보기-메인](design-diff.md#etc-1-page-01-0-더보기-메인). **2026-09-12 등급 확정 — `[부족함]`→`[확인필요]`**: `design-diff.md`의 `[부족함]` 사유 6개를 전부 재검토했다. 해소 확인: (1) "빈 핸들러 4개"는 지난 라운드 확인대로 여전히 전부 연결돼 있음(`ReportMain`/`ReceiptAlbum`/`Statistics`/`Archive`), (2) 아바타 미리보기 개수가 시안(4개+"+3")과 다르게 기본값(3개)으로 렌더되고 있어 `AvatarList`에 `maxVisible={4}`를 명시해 맞춤, (3) 헤더 아이콘은 재확인 결과 시안·코드 둘 다 톱니바퀴(설정)로 이미 일치 — 이전 "실제는 알림 벨" 기록이 오기였다(다만 확인 중 `accessibilityLabel`이 "알림"으로 잘못 붙어 있던 실제 버그를 발견해 "설정"으로 고침), (4) 색상·(5) 텍스트 문구는 원래도 차이 없음. **판정 불가로 남는 것 3개** — 카드-메뉴 간격의 정밀한 픽셀 차이, 타이포 스케일, 버튼 눌림 상태 — 전부 실기기 스크린샷 픽셀 비교가 있어야 확정되는데 이 세션은 앱을 직접 실행할 수 없어(세션 제약, "실행은 사용자가 함") 판정 불가. 기능적으로 알려진 누락은 더 없어 `[부족함]`("요소·연결·API가 빠짐")보다는 `[확인필요]`("대응 후보는 있으나 실제 일치 여부 미확정")가 맞는 등급이라 판단해 옮긴다 · **2026-09-21**: "모임 관리자" 카드 — 내 모임들이 아니라 현재 모임의 관리자(GroupMembership) 아바타를 가나다순으로 4명까지, 초과분은 `+N`으로 보여 주고(프로필 이미지가 있으면 이미지, 없으면 이니셜), "전체보기"는 항상 `GroupManager`(ETC-2-PAGE-03-0)로 간다("추가하기" 분기 제거, 사용자 결정). 서버 memberships 응답엔 프로필 이미지가 없어 본인만 세션 프로필 이미지로 뜬다 — `backend-requests.md` 신규 항목 · 시안 대조는 스펙시트 원본이 없어 판단 보류 · **2026-09-21 메뉴 카드**: "모임 관리"는 관리자 카드처럼 흰 카드(`CardBase`) 하나, "보고서 생성/증빙자료 앨범/소비통계 분석/보관함" 4개는 흰 카드 하나로 묶고 카드 사이 12(카드 패딩 위아래 4·좌우 12 — 항목 자체 패딩과 합쳐 내용 시작이 관리자 카드와 같은 16). `ToolsMenu`에 `flush` prop 신설(마지막 섹션 아래 여백 제거) — 이 화면만 사용. 시안 대조 판단 보류 |
| ☐ | `ETC-2-PAGE-01-0` | 전체 모임 관리 | Page | 전체 | 완료 | 1장 | `[구현]` | 블루 (명세 프레임 실측 v5 (더보기/메인/더보기_모임전환_전체모임관리.png#0, 상단 #F0F5FE, 점유율 90%)) | `screens/GroupManager/AllGroupsScreen.tsx` · **시안 확인 완료 (2026-09-19)**: 모임 추가 버튼이 우측 상단이 아니라 리스트 맨 아래 `+ 새로운 모임 추가하기` 카드 — 시안도 같고 코드(`EntityCard type="newGroup"`)가 맞다 |
| ☐ | `ETC-2-PAGE-02-0` | 모임 관리 | Page | 전체 | 완료 | 1장 | `[구현]` | 블루 (육안 확인 2026-09-19, 원본 크롭 — v5 19%는 수동 확인 필요였고 이 육안 확인으로 확정) | `screens/GroupManager/GroupManageScreen.tsx` — **2026-09-06 §5-4 해결**: `design-index.json`에 `ETC-2-PAGE-02-0.png`가 `ETC-2-PAGE-03-0.png`와 별개 파일로 존재하고, 삭제 시안(`ETC-3-MODAL-02-0`)의 배경 화면도 "< 모임 관리"라는 독립 페이지 경로/제목으로 등장해 — 오기가 아니라 실제로 빠져 있던 화면이었다. 더보기 → 모임 관리를 이 화면으로 새로 연결하고, 그 아래 모임 프로필 변경/모임원 관리(→ `GroupManagerScreen`; **2026-09-21**부터 `MemberManage`(DUE-2-PAGE-02-0) 직행)/모임 나가기/모임 삭제하기 4개 진입 행을 붙였다 |
| ☐ | `ETC-2-PAGE-03-0` | 모임 관리자 | Page | 전체 | 완료 | 1장 | `[구현]` | 블루 (명세 프레임 실측 v5 (더보기/모임관리자/더보기_모임관리자.png#0, 상단 #F0F5FE, 점유율 81%)) | `screens/GroupManager/GroupManagerScreen.tsx` — **2026-09-21**: 진입은 더보기 "모임 관리자 → 전체보기"만 남았다(모임 관리 → 모임원 관리는 `MemberManage` 직행). 화면 안의 "모임원 관리" 행(→ `MemberManage`)은 제거 · **2026-09-21**: 관리자 목록(`ToolsMenu`)을 흰 카드(`CardBase`) 하나로 묶었다(카드 패딩 위아래 4·좌우 12 + `flush`). 시안 대조 판단 보류 |
| ☐ | `ETC-2-PAGE-04-0` | 보고서 리스트 | Page | 전체/총무 | 진행 | 4장 | `[구현]` | 블루(#F0F5FE) | `screens/Report/ReportMainScreen.tsx` — 7-E(생성 플로우, 조회 플로우는 다음 단계). 장부별/기간별 탭, 무한 스크롤(2026-09-05 갱신 — 최초엔 `size=50` 단일 조회였다가, 보고서는 삭제 API가 없어 계속 누적된다는 지적으로 `TransactionsScreen`류 `onEndReached` 페이지네이션으로 교체). 카드 탭은 "보고서 상세 조회"(조회 플로우 대상)로 가야 하나 그 화면이 아직 없어 no-op. **2026-09-12 관찰(코드 변경 없음)**: 건수 표기가 "1건"인데 시안은 "2 건"(숫자·단위 사이 공백) — `docs/design-diff.md`에 [관찰]로 기록, 전 화면 공통 패턴 의심이라 일괄 판단 전까지 보류. 확인 질문 답변: `+` 버튼은 `ReportCreateSheet`(`ETC-3-SHEET-05-0`)를 정상 호출하며 장부별 화면으로 바로 가는 우회 경로 없음 |
| ☐ | `ETC-2-PAGE-05-0` | 증빙자료 앨범 | Page | 전체/총무 | 진행 | 3장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/증빙자료/더보기_증빙자료앨범.png#0, 상단 #FFFFFF, 점유율 63%)) | `screens/Receipt/ReceiptAlbumScreen.tsx`. `GET /groups/{groupId}/receipts` MEMBER 권한이라 전체 관리자가 조회 가능(권한 표기 "전체/총무"는 File.txt에 없는 표기 — 조회 자체는 총무 제한 없음). 필터는 `TransactionFilterSheet`를 그대로 안 쓰고 정렬 섹션만 뺀 `ReceiptFilterSheet`로 새로 만들었다 — `sort` 쿼리 파라미터가 값과 무관하게 서버 `500`을 낸다(2026-09-05 실호출 확인, `services/receiptService.ts` 주석). 그리드 썸네일은 별도 축소본이 없어 원본 이미지를 그대로 쓴다(성능 우려, §5-4 참고). File.txt 본문이 이 화면을 `ETC-2-PAGE-06-0`으로 잘못 지칭하고 있음도 확인했다 — 그 ID는 실제로는 "보관함"(§2 다음 행)이라 오기로 보인다 |
| ☐ | `ETC-2-PAGE-06-0` | 보관함 | Page | 전체 | 완료 | 2장 | `[구현]` | 블루(#F0F5FE) | `screens/Archive/ArchiveListScreen.tsx`(2026-09-11 확인, 문서만 미갱신 상태였다) — 서버는 여전히 `Folder.txt` 8번 기준 미구현이지만 실제 명세대로 실호출 코드를 그대로 작성했다(`archiveService.ts`, 서버 열리면 코드 수정 없이 동작). 카드 UI(제목+연필/X 아이콘, 장부 개수, "기록보기" 버튼)·빈 상태 문구까지 시안과 일치. **"기록 보기" 정정**: `billage-ia.md` 184~188행이 말한 "보고서 4화면 재사용" 계획은 실제로 채택되지 않았다 — 아래 `ETC-3-PAGE-03-0`(기록 보기) 행 참고, API 응답 구조가 달라 새 화면(`ArchiveDetailScreen.tsx`)을 만들었다. **2026-09-12 시안 대조 3건 반영**: (1) "기록보기" 버튼을 카드 하단 전체 폭(`fullWidth`)으로, (2) 연필 아이콘을 제목 바로 오른쪽(제목+연필 `flex:1` 묶음, X만 카드 우측 끝)으로, (3) 제목 말줄임을 `numberOfLines`(폭 기준) 대신 10자 초과 시 `앞 10자 + …`(글자수 기준, `truncateArchiveTitle`)로 교체 — 등급은 이미 `[구현]`이라 변동 없음, 세부 항목만 시안과 정합화 |
| ☐ | `ETC-2-PAGE-07-0` | 통계/분석 | Page | 전체 | 완료 | 4장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/통계분석.png#0, 상단 #FFFFFF, 점유율 97% 외 1프레임 일치)) | `screens/Statistics/StatisticsScreen.tsx`(2026-09-11 `npm run screen-audit`로 발견 — 문서만 미갱신 상태였다) — 대시보드·더보기 메뉴 양쪽에서 진입 연결 확인. 서버는 여전히 `Statistics (통계분석).txt` 기준 미구현이지만 실제 명세대로 실호출 코드를 그대로 작성했다(`statisticsService.ts`). 빈 상태 타이틀/서브타이틀 문구가 시안과 일치 |
| ☐ | `ETC-2-PAGE-09-0` | 더보기_설정 | Page | 전체 | 완료 | 1장 | `[구현]` | 블루 (명세 프레임 실측 v5 (더보기/설정/더보기_글로벌설정.png#0, 상단 #F0F5FE, 점유율 83%)) | `screens/More/SettingScreen.tsx` — 계정 카드(→내 프로필)/알림 설정(→`NotificationSettingsScreen`)/고객 지원 및 정보(공지사항→`NoticeListScreen`, 문의하기→`InquiryScreen`, 약관 및 정책→`TermsScreen`, 앱 버전 정보는 이동 없이 `ToolsMenu` tag로 버전 표시) — **2026-09-06 배치 B로 4개 행 모두 연결 완료** · **2026-09-21**: 알림 설정 아래 "고객 지원 및 정보" 제목+항목 4개(공지사항/문의하기/약관 및 정책/앱 버전 정보)를 흰 카드(`CardBase`) 하나로 묶었다(카드 패딩 위 16·아래 4·좌우 12, `ToolsMenu flush`). `ToolsMenu` 섹션 제목에 `paddingHorizontal: 4`를 추가해 제목을 항목 아이콘과 같은 x에 맞췄다(제목을 쓰는 곳은 이 화면뿐). 시안 대조 판단 보류 |
| ☐ | `ETC-3-MODAL-01-0` | 모임 나가기(일반) | Modal | 일반 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/GroupManager/MemberProfileSheet.tsx L223` · **부모 ETC-2-PAGE-02-0 배경: 미판정** |
| ☐ | `ETC-3-MODAL-01-1` | 모임 나가기(총무) | Modal | 일반 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/GroupManager/MemberProfileSheet.tsx L232` · **부모 ETC-2-PAGE-02-0 배경: 미판정** |
| ☐ | `ETC-3-MODAL-02-0` | 모임 삭제하기 | Modal | 총무 | 완료 | 4장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | `screens/GroupManager/GroupManageScreen.tsx` — 모임명 재입력 확인(시안 UI 요소 3번, 실시간 대조). **서버 `confirmName` 검사는 아직 `미구현`**(Group.txt §5, 2026-08-30 감사에서 명세만 추가됨)이라 클라이언트에서만 이름 일치를 막고 `DELETE /groups/{groupId}` 자체엔 body를 안 보낸다(`groupService.deleteGroup` 주석 참고) — 서버가 구현하면 body 추가할 것. **되돌릴 수 없는 삭제라 실호출로 검증하지 않았다** — 사용자 검증 필요. 성공 시 `AllGroupsScreen`(전체 모임 관리)으로 리셋 이동 + 스낵바(`ETC-4-SNACKBAR-04-0`, 신규 발견, 아래 §5-4 참고) |
| ☐ | `ETC-3-MODAL-03-0` | 보관함 기록 삭제 | Modal | 전체 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Archive/ArchiveListScreen.tsx`(activeDialog='delete', 2026-09-11 확인) — 제목·설명·삭제 버튼 문구 전부 시안과 일치. **2026-09-12 재확인**: "완전 일치"로 재확인됐다 — 다만 `[일치]`는 이 문서 등급 체계(`[구현]`/`[부족함]`/`[확인필요]`/`[미구현]`/`[해당없음]`)에 없는 새 tier라 요약표·도메인별 표 스키마 변경(열 추가) 없이는 셋째 표 동기화가 불가능해 등급은 `[구현]`으로 유지했다 — 이미 이 등급의 최상위 의미("눈에 띄는 누락 없음")를 만족한다 · **부모 ETC-2-PAGE-06-0 배경: 블루** |
| ☐ | `ETC-3-MODAL-04-0` | 기록 제목 변경 | Modal | 전체 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Archive/ArchiveListScreen.tsx`(activeDialog='rename', 2026-09-11 확인) — 제목·placeholder·글자수 제한(20자)·변경 버튼 활성 조건까지 시안과 일치. **2026-09-12 재대조로 5건 정정**: (1) 입력 필드 자동 포커스 누락 확인 — `Dialog`에 `autoFocusTextField` prop 신설, `TextField`에 `autoFocus` 전달해 적용, (2) clear(X) 아이콘 누락 확인 — `TextField`가 이미 `onClear` 지원하고 있었으나 `Dialog`가 안 넘기고 있었다, `onChangeTextField('')`로 연결, (3) `변경` 버튼 활성 조건이 실제론 `isSubmittingDialog`만 봐서 빈 값/기존 제목과 동일해도 활성화돼 있었다 — 빈 값이거나 기존 제목과 동일하면 비활성으로 수정, (4) placeholder가 "변경할 제목을 입력해주세요**.**"로 마침표가 붙어 있어 시안 문구와 미세하게 달랐다 — 마침표 제거, (5) `ARCHIVE_TITLE_MAX_LENGTH`는 이미 20으로 정확했다(변경 없음). 등급은 `[구현]` 유지(세부 결함이 있었을 뿐 화면 자체는 존재) · **부모 ETC-2-PAGE-06-0 배경: 블루** |
| ☐ | `ETC-3-PAGE-01-0` | 모임 프로필 변경 | Page | 전체 | 완료 | 7장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (더보기/모임관리/더보기_모임관리_모임프로필변경.png#0, 상단 #FFFFFF, 점유율 100%)) | `screens/GroupManager/GroupProfileEditScreen.tsx`. 모임명은 `PATCH /groups/{groupId}`(부분 갱신, 2026-09-06 실호출 확인 — `groupService.updateGroup` 주석 참고)로 저장된다. 이미지도 실제 저장(아바타 탭 → 바텀시트 → 업로드 → `groupImageFileId`). **2026-09-11 실기기 대조로 하향**: (1) "모임명" 라벨에 시안엔 있는 필수 표시(`*`)가 없음, (2) 아바타 빈 상태 배경이 시안(중립 회색)과 다르게 파란 톤(`Avatar` 기본 `style` 미지정, `FILL_SECONDARY_SUBTLER`) — 상세: [design-diff.md#etc-3-page-01-0-모임-프로필-변경](design-diff.md#etc-3-page-01-0-모임-프로필-변경) |
| ☐ | `ETC-3-PAGE-02-0` | 장부별 보고서 상세(전체) | Page | 전체 | 완료 | 1장 | `[구현]` | 블루(#F0F5FE) | `screens/Report/ReportByLedgerDetailScreen.tsx` — 7-G(조회 플로우). `ReportMainScreen`의 장부별 탭 카드에서 진입. `GET /reports/{reportId}`를 다시 불러 조회(생성 응답 재사용 안 함). 장부 카드 탭 → `ETC-4-PAGE-05-0`(장부 상세). **2026-09-12 보고서 도메인 묶음 2 반영**: 장부별 결산 카드가 라벨 없이 금액만 좌측 정렬이던 것을 "수입"/"지출" 라벨(회색)+금액(우측 정렬) 구조로 수정, 지출 금액 색상을 빨강(`FEEDBACK_NEGATIVE_BOLD`)에서 기본 전경색으로 수정(명세: 지출도 검정), 금액 뒤 '원' 누락은 없었고 수입의 `+` 접두만 제거, "생성 일시" 메타 텍스트 우측 정렬 추가. 등급 변동 없음(이미 `[구현]`) |
| ☐ | `ETC-3-PAGE-02-1` | 장부별 보고서 상세(수입/지출) | Page | 전체 | 완료 | 2장 | `[구현]` | 블루 (부모 ETC-3-PAGE-02-0 상속 — 별도 화면이 아니라 부모의 탭 상태, §5-4) | **별도 화면 아님** — `ETC-3-PAGE-02-0`(장부별 보고서 상세)의 수입/지출 탭 상태(IA 165~172행 기준). 라우트를 따로 안 만들었다 — `ReportByLedgerDetailScreen.tsx` 참고 |
| ☐ | `ETC-3-PAGE-03-0` | 기간별 보고서 상세 / 기간별 보고서 상세(전체) — **및 보관함 "기록 보기"(ID 충돌)** | Page | 전체 | 완료 | 2장(+1) | `[구현]` | 블루(#F0F5FE) | `screens/Report/ReportByPeriodDetailScreen.tsx` — 7-G. 헤더 카드 탭 → `ETC-4-PAGE-07-0`(전체 통합 시간순), 장부 리스트 행(금액 없이 이름만) 탭 → `ETC-4-PAGE-05-0`(그 장부만 필터링). 시안 파일명 함정 주의: `더보기_보고서생성_기간보고서조회-1.png`가 이 화면이고, `-1` 없는 파일이 `ETC-4-PAGE-07-0`이다(§5-4 참고). **ID 충돌 확인(2026-09-11)**: `더보기_기록보관_상세보기.png`(ver 0.25) 표 헤더도 독립적으로 같은 `ETC-3-PAGE-03-0`을 할당하고 있다 — 완전히 다른 화면(보관함 "기록 보기")이다. 그쪽은 `screens/Archive/ArchiveDetailScreen.tsx`로 별도 구현했다(위 `ETC-2-PAGE-06-0` 행 참고) — `billage-ia.md`가 이 화면을 보고서 상세와 "동일"이라 적은 것은 낡은 정보다. **2026-09-12 정정**: 보관함 쪽 비고에 "장부 카드가 탭 불가 읽기전용"이라는 낡은 서술이 코드 주석·`shot-routes.md`에 남아 있었다 — 근거("서버가 내역 단위 데이터를 안 준다")가 이미 2026-09-11에 무효화됐는데도 화면 쪽 탭 동작을 안 붙인 채였다. 이번에 시안 UI 요소 3번 [액션]대로 탭 가능하게 고치고 `ArchiveLedgerEntriesScreen`(장부 내역 목록)→`ArchiveEntryDetailScreen`(개별 내역 상세, 영수증·메모)으로 연결했다 — 등급은 재캡처 전까지 그대로 둔다. **Screen ID 정정**: 두 화면은 새 ID가 아니라 `ETC-4-PAGE-05-0`/`ETC-5-PAGE-02-0`(보고서 쪽과 공유 — `ETC\보관함\` 폴더에도 같은 ID의 크롭이 실제로 있다, 위 UI 요소 3번 [상태] "기록 보고서 공통 로직 상속"과 부합) — 처음엔 이 ID들을 확인 못 하고 임시로 `ETC-3-PAGE-03-0`을 반복해서 달았다가 바로 잡았다. **2026-09-12 "보관함 묶음 1" 대조**: `ArchiveDetailScreen.tsx`의 메타 텍스트("백업 일시 …")를 우측 정렬로 수정(진짜 archive 시트 UI 요소 2번 명시). 같은 지시의 헤더카드·심플리스트 통일·entries 필터·공유아이콘 항목은 잘못된 스펙시트(보고서 쪽 파일)를 근거로 작성돼 있어 적용하지 않았다 — 상세는 §5-3 참고. **2026-09-12 재대조(올바른 시트로)**: 요청자가 지난번 잘못된 시트를 지정했던 것으로 확인돼, `더보기_기록보관_상세보기.png`(ver 0.25)로 다시 대조했다 — 앱바 우측 닫기(X) 버튼 누락(`AppBar` 기존 `rightIcons` prop으로 해결)과 확장형 카드 수입 금액의 `+` 접두·색상 미지정(제거 + `FEEDBACK_POSITIVE_BOLD` 적용) 2건을 고쳤다. **2026-09-12 보고서 도메인 묶음 2**: 보고서 쪽(`ReportByPeriodDetailScreen.tsx`)의 헤더 카드도 라벨 없이 금액 두 줄만 나오던 것을 "수입"(회색 라벨+파란 금액)/"지출"(회색 라벨+검정 금액) 2행 구조로 고치고 수입 `+` 접두를 제거했다 — 기준 시트 `더보기_보고서생성_기간보고서조회-1.png`. 같은 ID를 공유하는 `ArchiveDetailScreen.tsx`는 이번엔 건드리지 않았다(별개 화면, 지난 라운드에 이미 반영 완료). **등급 판정 기준 명시(두 시트가 서로 다른 화면이라 분리)**: `screens/Report/ReportByPeriodDetailScreen.tsx`는 `더보기_보고서생성_기간보고서조회-1.png` 기준 `[구현]`(기존과 동일, 이번 라운드에서 안 건드림). `screens/Archive/ArchiveDetailScreen.tsx`는 `더보기_기록보관_상세보기.png` 기준으로, 위 2건 수정 후 이 시트 대비 미해결 결함이 없다 — 다만 등급 자체는 두 화면 모두 이전부터 이미 `[구현]`이었으므로 상향할 필요가 없어 세 표는 안 건드렸다(§5-3에서 언급한 관찰 2건 — 기간 표기 공백, 구분선 유무 — 은 근거 약해 결함으로 안 세었다) |
| ☐ | `ETC-3-PAGE-03-1` | 기간별 보고서 상세(수입/지출) | Page | 전체 | 완료 | 2장 | `[구현]` | 블루 (부모 ETC-3-PAGE-03-0 상속 — 별도 화면이 아니라 부모의 탭 상태, §5-4) | **별도 화면 아님** — `ETC-3-PAGE-03-0`(기간별 보고서 상세)의 탭 상태. `ReportByPeriodDetailScreen.tsx` 참고 |
| ☐ | `ETC-3-PAGE-04-0` | 증빙자료 상세 | Page | 전체 | 완료 | 1장 | `[구현]` | 흰색 (육안 확인 2026-09-19, 원본 크롭 — 앱바·하단 버튼 영역 흰색, 중앙은 사진 자리표시자) | `screens/Receipt/ReceiptDetailScreen.tsx`. 단건 조회 API가 없어(목록 응답에만 필드가 있음) 앨범/검색 화면이 들고 있던 항목을 route params로 그대로 넘긴다. 핀치줌·더블탭·팬은 새 제스처 라이브러리 없이 `PanResponder`(RN 코어)로 직접 구현 — 이 프로젝트에 `react-native-gesture-handler` 등이 아직 없어서다. 공용 `AppBar`는 밝은 배경 전제라 이 화면(어두운 배경)만 커스텀 헤더를 그린다 · ⚠️ **시안↔구현 불일치 #12**: 구현은 `FILL_INVERSE`(어두운 배경)라 명세 흰색과 다르다 — 사진 뷰어 UX상 어두운 배경이 나을 수 있어 기획 확인 필요, 이번엔 안 고침(§5-4) |
| ☐ | `ETC-3-PAGE-05-0` | 증빙자료 검색 | Page | 전체 | 완료 | 4장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/증빙자료/더보기_증빙자료앨범_검색.png#0, 상단 #FFFFFF, 점유율 72%)) | `screens/Receipt/ReceiptSearchScreen.tsx`. `keyword`(내역명·메모, Entry 7번과 같은 규칙) 검색, 7-A(모임원 검색)와 같은 이유로 300ms 디바운스를 얹었다. 빈 검색어 상태에선 조회하지 않는다(시안에 그 상태가 없고, 앨범 메인과 같은 목록을 또 부르는 낭비라 판단) |
| ☐ | `ETC-3-PAGE-07-0` | 내 프로필 | Page | 전체 | 완료 | 2장 | `[부족함]` | 블루 (명세 프레임 실측 v5 (더보기/설정/글로벌설정_내프로필.png#0, 상단 #F0F5FE, 점유율 81%)) | `screens/More/MyProfileScreen.tsx`. `loginProvider`가 `EMAIL`이 아니면 "비밀번호 변경" 행을 숨긴다(User.txt 정책). 로그아웃/회원탈퇴 버튼도 여기(시안 UI 요소 5번) — 로그아웃은 `MoreScreen.tsx`에서 옮겨왔고, 회원탈퇴는 대상 화면·API 둘 다 없어(COM 도메인, `미구현`) 버튼만 그리고 no-op. **시안엔 계정 정보 카드에 "전화번호"도 있지만 `GET /auth/me` 응답 스키마에 그 필드 자체가 없어(User.txt 1번) 표시 못 함** — `docs/backend-requests.md`에 기록 |
| ☐ | `ETC-3-PAGE-08-0` | 알림 설정_일반 / 알림 설정_총무 | Page | 일반/총무 | 완료 | 2장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/설정/글로벌설정_알림설정.png#0, 상단 #FFFFFF, 점유율 90%)) | `screens/More/NotificationSettingsScreen.tsx` — `GET/PATCH /notifications/settings`(서버 `미구현`) 그대로 호출. 시안은 별도 화면 2장이지만 API·데이터가 동일해 새 라우트를 만들지 않고 한 화면의 권한 분기(`viewerIsOwner`)로 구현 — 승인 요청/납부 관리 토글만 총무 화면에서 추가로 보인다. 역할 판정은 `getActiveGroup()?.myRole`(다른 화면들과 동일 캐시) 재사용 — **판단 필요**: 이 API는 명세상 모임과 무관한 사용자 단위 설정인데, 화면은 모임별로 다른 권한(총무/일반)을 전제한다. 사용자가 여러 모임에 속하고 그중 총무인 모임과 아닌 모임이 섞여 있으면 "지금 보고 있는 모임" 기준으로만 판정되므로, 모임을 바꿔서 다시 들어오면 같은 토글값인데 보이는 항목 수가 달라질 수 있다 — 기획 확인 필요(§5-4) |
| ☐ | `ETC-3-PAGE-09-0` | 공지사항 | Page | 전체 | 완료 | 1장 | `[구현]` | 블루 (명세 프레임 실측 v5 (더보기/설정/글로벌설정_고객및지원정보_공지사항.png#0, 상단 #F0F5FE, 점유율 90%)) | `screens/More/NoticeListScreen.tsx` — `GET /notices`(서버 `미구현`) 그대로 호출, 로딩/에러(재시도)/빈 상태 모두 구현 |
| ☐ | `ETC-3-PAGE-10-0` | 문의하기 | Page | 전체 | 진행 | 2장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/설정/글로벌설정_고객및지원정보_문의하기.png#0, 상단 #FFFFFF, 점유율 90%)) | `screens/More/InquiryScreen.tsx` — `GET /faqs`(서버 `미구현`)로 FAQ 아코디언(`components/Data Display/Accordion/Accordion.tsx` 재사용) + 읽기 전용 문의 메일 표시. **디자인 '진행' 중**이라 시안에 문의 작성 폼이 없다 — `POST /inquiries`(문의 접수)는 명세대로 `services/supportService.ts`에 만들어뒀지만 이 화면에서는 호출하지 않는다(폼이 나중에 추가되면 그대로 쓰면 됨), §5-4 기록 |
| ☐ | `ETC-3-PAGE-11-0` | 약관 및 개인정보 처리방침 | Page | 전체 | 완료 | 1장 | `[구현]` | 미판정 | `screens/More/TermsScreen.tsx`(목록) + `screens/More/TermDetailScreen.tsx`(상세, `GET /terms/{termType}` 서버 `미구현` — **ID 미확정**: 파일의 `@screen ETC-4-PAGE-XX-0`은 자리표시 — 실제 ID 대기). 명세의 "화면명세 내부 불일치"(가입 시 3종 vs 설정 목록 3종이 다름)를 시안대로 해결 — 서비스 이용 약관/개인정보 처리방침/**자동 기록 서비스 이용 약관** 3종(마케팅 제외). **Screen ID 미확인**: 이 시안 표의 Screen ID 칸이 빈 플레이스홀더("스크린아이디")였다 — 배치 지시서 매핑(`ETC-3-PAGE-11-0`)을 그대로 썼다, §5-4 확인 필요 |
| ☐ | `ETC-3-SHEET-01-0` | 모임 추가 | Bottom Sheet | 전체 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/GroupManager/AddGroupSheet.tsx` |
| ☐ | `ETC-3-SHEET-03-0` | 총무 프로필 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/GroupManager/MemberProfileSheet.tsx` — 총무 프로필 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-3-SHEET-04-0` | 일반 프로필 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/GroupManager/MemberProfileSheet.tsx` — 일반 프로필 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-3-SHEET-05-0` | 새 보고서 생성 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Report/ReportCreateSheet.tsx` — 7-E. `MemberAddSheet` 패턴 그대로(아이콘+텍스트 2행, 각각 장부별/기간별 생성 폼으로 이동) |
| ☐ | `ETC-3-SHEET-06-0` | 증빙자료 필터링 | Bottom Sheet | 전체 | 완료 | 8장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Receipt/ReceiptFilterSheet.tsx` — 증빙자료 앨범 구현 라운드(7-C 후속)에서 만들었으나 이 표 갱신이 누락돼 있었다(2026-09-05 뒤늦게 반영). `TransactionFilterSheet`를 거의 그대로 옮기되 정렬 섹션만 뺐다(그 파일 주석 참고 — receipts API가 `sort` 파라미터에 `500`을 낸다) |
| ☐ | `ETC-3-SNACKBAR-01-0` | 초대 코드 복사완료 | Snackbar | - | 완료 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/GroupManager/GroupManagerScreen.tsx` — 초대 코드 복사 완료 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-4-MODAL-01-0` | 일반 전환하기 | Modal | 총무 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/GroupManager/MemberProfileSheet.tsx L205` — 일반 전환하기 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-4-MODAL-02-0` | 총무 전환하기 | Modal | 총무 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/GroupManager/MemberProfileSheet.tsx L196` — 총무 전환하기 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-4-MODAL-03-0` | 모임 내보내기 | Modal | 총무 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/GroupManager/MemberProfileSheet.tsx`(confirmKind='kick') — **2026-09-06 실호출로 API 실재 확인**(`DELETE /groups/{groupId}/memberships/{membershipId}`, 204). 그동안 API 없음으로 보류해뒀던 메뉴 항목을 되살렸다 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-4-MODAL-04-0` | 로그아웃 | Modal | 전체 | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | `screens/More/MyProfileScreen.tsx` — 로그아웃 확인 Dialog. **2026-09-06 §5-4 해결**: 시안으로 확인된 실제 위치(내 프로필)로 옮겼다. `MoreScreen.tsx`엔 더 이상 없음 |
| ☐ | `ETC-4-PAGE-01-0` | 새 모임 생성 | Page | 전체 | 완료 | 3장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (더보기/메인/전체모임관리_모임추가_새모임생성하기.png#0, 상단 #FFFFFF, 점유율 90%)) | `screens/GroupManager/GroupCreateScreen.tsx` |
| ☐ | `ETC-4-PAGE-02-0` | 이미지 선택 | Page | 전체 | 완료 | 4장 | `[부족함]` | 미판정 | `screens/GroupManager/GroupImagePickerScreen.tsx`. **Screen ID 충돌 주의**: ADD 도메인에 같은 ID의 다른 시안(다중 선택, 체크박스+"선택" 확인 버튼, `ReceiptGalleryPickerScreen.tsx`로 이미 구현됨)이 있다 — 이 화면은 그거와 달리 ETC/모임 관리 쪽 시안(단일 선택, 탭하면 즉시 선택, 확인 버튼 없음)이다. **2026-09-11 재판정(하향)**: 시안 4장(`ADD\ETC-4-PAGE-02-0(-1).png`, `ETC\모임 관리\`·`ETC\설정\`) 전부 앱이 상태바 바로 아래부터 자체 그리기로 "카메라" 타일 + 실제 최근 사진 12장을 3열 그리드로 보여주는 **인앱 화면**이다 — OS 시스템 포토 피커 스크린샷이 아니다. `launchImageLibrary`로 시스템 피커를 바로 여는 지금 구현은 이 그리드 자체가 없어 시안과 다르다(`ADD-3-PAGE-01-0`과 같은 논리: 실제 사진을 그릴 방법이 없어 시스템 흐름으로 대체했지만, 시안이 요구하는 인앱 UI 자체는 사라짐) — `[구현]`→`[부족함]`. 모임 프로필/내 프로필 공용 구조는 그대로 유지 |
| ☐ | `ETC-4-PAGE-03-0` | 장부별 보고서 생성 | Page | 총무 | 완료 | 3장 | `[구현]` | 흰색 | `screens/Report/ReportCreateByLedgerScreen.tsx` — 7-E. 제목/장부(다중 선택, `ReportLedgerSelectScreen` 왕복)/구분(`OutlinePill` 신설, 시안이 파란 테두리형이라 채워지는 `FilterPill`을 그대로 못 씀). 이탈 확인 Dialog + 안드로이드 `BackHandler` 둘 다 적용(`DuesCreateScreen` 패턴). `entryType:"ALL"` 금지(2026-09-05 실호출 확인) — "전체"는 필드 생략으로 표현. **2026-09-13 진단(정정)**: 최초엔 "한글 제목이면 서버가 400"으로 오판했다(curl 셸 리터럴 인코딩 오염이 원인) — UTF-8 파일 기반 재검증으로 서버가 한글을 문제없이 받는 것을 확인해 철회. 실제로는 사용자가 내역 0건인 장부를 선택해 서버가 `REPORT_RANGE_EMPTY`를 정상 반환한 것(데이터 조건, 버그 아님)이었는데, `apiErrorMessages.ts`에 Report 도메인 에러 매핑이 없어 fallback 문구로 덮여 원인을 알 수 없었던 게 진짜 버그였다 — `REPORT_ERROR_MESSAGES` 신설로 고쳤다. `docs/backend-requests.md`의 "0순위" 항목은 철회했다. **2026-09-13 시안 재대조 5건 반영**: (1) `ScreenContainer background="secondary"`로 배경 흰색 적용, (2) "보고서 제목" 라벨에 필수 표시(`TextField`에 `required` prop 신설) 추가, (3) "+ 선택하기" 버튼을 `Button`의 새 `outlined` hierarchy(흰 배경+회색 테두리+회색 텍스트)로 교체(기존 `secondary`는 파란 채움이라 시안과 다름), (4) `OutlinePill`(구분 세그먼트) 좌측 정렬·내용 폭으로 수정(`flex:1` 제거) + 미선택 상태를 회색 채움/회색 텍스트로 수정(이 컴포넌트는 `ReportCreateByPeriodScreen`과 공유 — 그 화면 스펙시트(`더보기_보고서생성하기_기간별.png`)도 직접 확인해 동일 요구사항임을 확인한 뒤 적용), (5) 이탈 방지 모달(`ETC-5-MODAL-01-0`)은 이미 구현돼 있고 문구도 시안과 일치 확인(코드 변경 없음). **재캡처 확인 완료(2026-09-13)**: 위 5건 전부 실기기 재캡처로 시안과 일치 재확인됨 |
| ☐ | `ETC-4-PAGE-04-0` | 기간별 보고서 생성 | Page | 총무 | 완료 | 2장 | `[구현]` | 흰색 | `screens/Report/ReportCreateByPeriodScreen.tsx` — 7-E. 제목/기간(`DuesDateRangeSheet` 재사용, `DTB-3-SHEET-01-0`)/구분(`OutlinePill`). 이탈 확인 Dialog + `BackHandler` 동일 적용. **2026-09-13 결함 3건 수정**: (1) 필수 별표가 반대로 붙어 있었다 — "보고서 제목"엔 없고 "기간"엔 있었는데 시안은 정반대("보고서 제목\*"만); `TextField required`를 제목으로 옮기고 `SelectionListItem`의 `required`를 뗐다. (2) "지난 라운드에 4자리로 통일하기로 했다"던 판단을 철회 — 시안 No.3을 다시 보니 예시가 명확히 "26.01.01 ~ 26.06.30"(2자리)이고, 필드 자체가 `SelectionListItem`(라벨-좌/값+꺾쇠-우 한 줄 행)이었던 것도 시안(회색 테두리 박스+우측 캘린더 아이콘)과 형태부터 달랐다 — 박스형 커스텀 필드로 교체하고 표기도 `YY.MM.DD ~ YY.MM.DD`로 변경(`toShortDate`, API 전송용 상태값은 4자리 그대로 유지). (3) 배경을 `ScreenContainer background="secondary"`(흰색)로 확정. |
| ☐ | `ETC-4-PAGE-05-0` | 보고서_장부 상세 / 보고서_장부 상세(전체) — **및 보관함_장부 상세(공유 ID, 2026-09-12)** | Page | 전체/총무 | 완료 | 13장 | `[부족함]` | 블루(#F0F5FE) | `screens/Report/ReportLedgerEntriesScreen.tsx` — 7-G. **2026-09-06 등급 하향**: 시안 UI 요소 6번이 리스트 행에 "영수증 첨부 아이콘"을 명시하는데(`[데이터] 개별 내역 데이터: 내역명, 금액, 영수증 첨부 아이콘`) `GET /reports/{reportId}` 응답의 `entries`(스냅샷)엔 `receiptCount`/`receipts` 자체가 없어(실호출 확인) 아이콘을 못 그린다 — `docs/backend-requests.md` 1순위 항목 참고. 그 외(장부별·기간별 공용, 탭+일자별 리스트)는 구현됨. **장부별·기간별 양쪽에서 재사용되는 단일 컴포넌트**(사용자 지시대로 하나만 만듦). 단건 조회 API가 없어 부모 화면이 이미 받은 데이터를 route params로 그대로 전달. `-1`로 끝나는 시안 변형(수입/지출 탭 상태)은 별도 화면이 아니라 이 화면의 탭 상태라 라우트를 안 만들었다. **2026-09-12 추가**: `ETC\보관함\ETC-4-PAGE-05-0.png` 크롭도 같은 ID를 쓴다 — `더보기_기록보관_상세보기.png`(`ETC-3-PAGE-03-0`) UI 요소 3번 [상태]가 "기록 보고서 공통 로직 상속"을 명시해 의도된 ID 공유다(우연한 충돌 아님). 보관함 쪽 구현은 `screens/Archive/ArchiveLedgerEntriesScreen.tsx`(같은 `ReportEntryList` 컴포넌트 재사용, 코드는 별도 파일; **2026-09-21**: 보관함 스냅샷은 `approvalStatus`/`receiptFiles[]`가 있어 `ReportEntryList` 항목 타입에 선택 필드로 추가해 승인요청 배지·영수증 아이콘을 그린다 — 보고서 쪽 두 화면은 필드가 없어 그대로, 위 `[부족함]` 사유 유지, 등급 변동 없음) — 이 행의 등급·비고는 보고서 쪽 기준 그대로 두고, 보관함 쪽 등급은 위 `ETC-3-PAGE-03-0` 행에서 별도 추적한다(재캡처 대기). **2026-09-12 보고서 도메인 묶음 2**: 공용 `AmountCard.tsx` 요약 카드의 모든 금액 행·합계에 '원'이 아예 없고 수입에 `+` 접두가 있었다 — '원' 추가, `+` 제거(이 화면의 합계 행은 명세대로 그대로 유지, `showTotal` 기본값). 리스트 금액도 `TransactionListItem`에 '원'이 없어 새 `amountSuffix` prop으로 보강. 등급 변동 없음(영수증 아이콘 미구현 사유로 `[부족함]` 유지, 이번 수정과 무관) · 배경 상하 다름 — 상단 #F0F5FE / 하단 #FFFFFF(v5, 구현 시 유의) |
| ☐ | `ETC-4-PAGE-05-1` | 보고서_장부 상세(수입/지출) | Page | 전체 | 완료 | 4장 | `[구현]` | 블루 (부모 ETC-4-PAGE-05-0 상속 — 별도 화면이 아니라 부모의 탭 상태, §5-4) | **별도 화면 아님** — `ETC-4-PAGE-05-0`(보고서_장부 상세)의 수입/지출 탭 상태. `ReportEntryList.tsx`의 탭으로 구현됨 |
| ☐ | `ETC-4-PAGE-07-0` | 보고서_시간순 / 보고서_시간순(전체) | Page | 전체/총무 | 완료 | 4장 | `[부족함]` | 블루(#F0F5FE) | `screens/Report/ReportPeriodEntriesScreen.tsx` — 7-G. **2026-09-06 등급 하향**: `ETC-4-PAGE-05-0`과 같은 UI 요소(6번, 리스트 행 영수증 아이콘)를 공유하는 화면이라 같은 이유로 미완이다 — 스냅샷에 `receiptCount` 없음, `docs/backend-requests.md` 1순위 참고. 캐러셀(Card1 수입/지출, Card2 시작/최종잔액)은 새 라이브러리 없이 `ScrollView horizontal pagingEnabled` + `CarouselIndicator`(`LedgerDetailScreen` 패턴 재사용). 이 화면의 시안 파일(`더보기_보고서생성_기간보고서조회.png`)이 표 헤더에 `ETC-4-PAGE-05-0`으로 잘못 적혀 있다 — 실제 내용(캐러셀+장부명 태그된 통합 리스트)은 IA 171행 기준 07-0이라 그대로 구현, §5-4에 기획 확인 항목으로 남김. **2026-09-12 보고서 도메인 묶음 2**: 명세 No.3은 Card 1(수입/지출)에 합계 행이 없다고 명시하는데(합계 행은 `ETC-4-PAGE-05-0` 전용) 공용 `AmountCard`가 항상 합계+구분선을 그려 Card 1에도 잘못 붙어 있었다 — `AmountCard`에 `showTotal?: boolean`(기본 `true`) prop을 추가해 이 화면의 Card 1에만 `showTotal={false}` 전달, 공유 컴포넌트 자체는 기본 동작 유지. Card 2 라벨 "시작잔액"/"최종잔액"(붙여쓰기)을 "시작 잔액"/"최종 잔액"(명세 표기)로 수정. '원' 누락·수입 `+` 접두는 `ETC-4-PAGE-05-0`과 동일 원인(`AmountCard`/`TransactionListItem`)이라 같이 고쳐졌다. 등급 변동 없음(영수증 아이콘 미구현 사유로 `[부족함]` 유지). **2026-09-18 결함 → 수정**: `FDR-2-PAGE-05-0`(장부 상세)과 같은 원인·같은 증상의 캐러셀 스냅 결함 — 2면 스크롤 시 1면 잔재가 좌측에 잘려 남고 2면이 우측에서 잘렸다. 같은 코드가 아니라 화면마다 독립적으로 복붙된 패턴이라(공용 컴포넌트 아님) 이 파일도 따로 고쳤다 — `useWindowDimensions` 기준 전체 폭 슬라이드로 교체, `snapToInterval` 제거. 2026-09-13 이 화면 캡처 때도 놓쳤던 결함이다(§5-15 참고) · v5 재측정 블루 점유율 53% — 기준(60%) 미달이라 참고만, 기존 판정 유지 |
| ☐ | `ETC-4-PAGE-07-1` | 보고서_시간순(수입/지출) | Page | 전체 | 완료 | 2장 | `[구현]` | 블루 (부모 ETC-4-PAGE-07-0 상속 — 별도 화면이 아니라 부모의 탭 상태, §5-4) | **별도 화면 아님** — `ETC-4-PAGE-07-0`(보고서_시간순)의 수입/지출 탭 상태. `ReportEntryList.tsx`의 탭으로 구현됨 |
| ☐ | `ETC-4-PAGE-15-0` | 프로필 변경 | Page | 전체 | 완료 | 3장 | `[부족함]` | 흰색 (육안 확인 (2026-09-19) — 하단 회색은 키보드) | `screens/More/ProfileEditScreen.tsx`. 닉네임은 `PATCH /auth/me`(서버 "진행 중", `authService.updateMyProfile` 참고)로 저장. 이미지도 실제 저장(촬영/앨범선택 → 업로드 → `profileImageFileId`, "기본 프로필로 변경하기"는 `null`). 사진 변경 진입은 아바타 탭 → 바텀시트(`ETC-4-SHEET-02-0`) → 갤러리(`ETC-4-PAGE-02-0`). **2026-09-11 실기기 대조로 하향, 2026-09-12 사유 재검토**: (1) ~~닉네임 필드 라벨이 시안은 "이름"인데 실제는 "닉네임"~~ 원본 스펙시트 UI 요소 표를 확인해 해소됨 — 표는 "닉네임"을 요구하고 있어(§5-4) 지금 구현이 맞다, 목업 그림 쪽이 스펙 문서 내부에서 잘못 그려진 것. (2) 아바타 빈 상태 배경이 시안과 다른 파란 톤(위 `ETC-3-PAGE-01-0`과 동일 원인)은 여전히 미해결이라 등급은 `[부족함]` 유지 — 상세: [design-diff.md#etc-4-page-15-0-프로필-변경](design-diff.md#etc-4-page-15-0-프로필-변경) · **2026-09-21 사용자 결정으로 번복**: 필드 라벨·placeholder를 "닉네임" → "이름"으로 바꿨고(`PROFILE_EDIT_NAME_LABEL`) 프로필 사진을 가운데 정렬로 옮겼다(`avatarRow alignSelf: center`). 위 "표는 닉네임을 요구" 판단(§5-4)과 어긋난다 — 스펙 표 원문은 이 환경에 없어 다시 대조하지 못함, 판단 보류 |
| ☐ | `ETC-4-SHEET-02-0` | 프로필 변경_사진 변경 | Bottom Sheet | 전체 | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/More/ProfileEditScreen.tsx`(imageMenuVisible). **Screen ID 주의**: 시안 파일명은 `글로벌설정_내프로필_프로필변경-1.png`(마치 `ETC-4-PAGE-15-0`의 변형처럼 보임)이지만 표 헤더를 직접 확인하니 별개 ID `ETC-4-SHEET-02-0`였다 — §5-2에 이미 "IA엔 없는 ID"로 걸려 있던 것을 이번에 실제로 매핑했다. "기본 프로필로 변경하기" 항목은 커스텀 이미지가 있을 때만 조건부 노출 |
| ☐ | `ETC-4-PAGE-17-0` | 비밀번호 변경 | Page | 전체 | 완료 | 6장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (더보기/설정/글로벌설정_내프로필_프로필변경_비밀번호변경.png#0, 상단 #FFFFFF, 점유율 86%)) | `screens/More/PasswordChangeScreen.tsx`. `PATCH /auth/password` 서버 `미구현`(Auth.txt 10번) — 명세대로 실제 호출만 만들어뒀다. 현재/새/새 확인 3필드, 새 비밀번호 형식(`utils/validators.isValidPassword` 재사용)·확인 일치 실시간 검사, `INVALID_CREDENTIALS`는 시안 문구("현재 비밀번호와 일치하지 않아요...") 그대로 현재 비밀번호 필드에 표시 |
| ☐ | `ETC-4-PAGE-18-0` | 공지사항 상세 | Page | 전체 | 완료 | 1장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (더보기/설정/고객및지원정보_공지사항_상세.png#0, 상단 #FFFFFF, 점유율 86%)) | `screens/More/NoticeDetailScreen.tsx` — `GET /notices/{noticeId}`(서버 `미구현`) 그대로 호출. **시안 UI 요소 3번(본문 내 URL/이메일 자동 하이퍼링크)은 미구현** — RN 기본 `Text`는 Android에서 부분 텍스트 자동 링크화 수단이 없어(iOS `dataDetectorType`만 존재) 이번 배치에서 새 라이브러리를 들이지 않고 평문으로 뒀다, §5-4 기록 |
| ☐ | `ETC-4-SHEET-01-0` | 모임 참여 | Bottom Sheet | 전체 | 완료 | 3장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/GroupManager/JoinGroupSheet.tsx` |
| ☐ | `ETC-4-SNACKBAR-01-0` | 보관함 기록 삭제 완료 | Snackbar | 총무 | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/Archive/ArchiveListScreen.tsx`(`SNACKBAR_ARCHIVE_DELETED`, 2026-09-11 확인) — "보관 기록이 삭제되었어요." 문구 시안과 일치. **2026-09-12 재대조로 3건 정정**: (1) 자동 소멸 시간이 1600ms였는데 시안엔 "3초 후 자동 소멸" 명시 — 3000ms로 수정(이 화면 전용 로컬 상수라 다른 화면엔 영향 없음), (2) `Snackbar`가 이미 `onClose`를 지원하는데 호출부가 안 넘기고 있어 X 닫기 버튼이 안 뜨고 있었다 — 연결, X 누르면 즉시 닫히고 예약된 자동 소멸 타이머도 `clearTimeout`, (3) `setTimeout` 핸들을 변수에 안 담아 컴포넌트 언마운트/재호출 시 취소가 안 되는 누수가 있었다 — `useRef`로 핸들 보관해 정리 · **부모 ETC-2-PAGE-06-0 배경: 블루** |
| ☐ | `ETC-4-SNACKBAR-02-0` | 기록 제목 변경 완료 | Snackbar | 총무 | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/Archive/ArchiveListScreen.tsx`(`SNACKBAR_ARCHIVE_RENAMED`, 2026-09-11 확인) — 시안 내 이 스낵바는 `COM-1-SNACKBAR-02-0`으로 잘못 표기돼 있다(§5-2에 이미 기록된 반복 복붙 오기 패턴과 동일). "변경 사항이 저장되었어요." 문구는 시안과 일치. **2026-09-12**: `ETC-4-SNACKBAR-01-0`과 같은 `showSnackbar`/`snackbarWrapper`를 공유하는 화면이라 위 3건(3초 지속시간, X 닫기, 타이머 누수)이 이 스낵바에도 동일하게 적용됐다. 또한 스낵바가 시스템 네비게이션 바 위로 겹치는 문제도 있어 `snackbarWrapper`의 `bottom`을 고정 `24`에서 `useSafeAreaInsets().bottom + 24`로 수정 · **부모 ETC-2-PAGE-06-0 배경: 블루** |
| ☐ | `ETC-4-SNACKBAR-04-0` | 모임 삭제 완료 | Snackbar | 총무 | 완료 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | **2026-09-06 신규 발견** — `billage-ia.md`엔 이 ID가 없다(모임 삭제하기 시안 파일 안에 "Case A" 스낵바로 임베드돼 있었음). `screens/GroupManager/AllGroupsScreen.tsx`가 `route.params.snackbarMessage`로 받아 렌더링(발신은 `GroupManageScreen.tsx`) |
| ☐ | `ETC-5-MODAL-01-0` | 보고서_이탈방지 | Page | 총무 | 예정 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Report/ReportCreateByLedgerScreen.tsx`·`ReportCreateByPeriodScreen.tsx` 둘 다 `leaveDialogVisible` + `Dialog`로 이탈 확인(뒤로가기·하드웨어 back 모두 경유) — 문서만 미구현으로 남아 있었다. Format이 IA엔 `Page`로 잘못 적혀 있다(§5-2 참고, 실제는 Modal/Dialog) · **부모 ETC-4-PAGE-03-0 배경: 흰색** |
| ☐ | `ETC-5-PAGE-01-0` | 보고서_장부 선택 | Page | 총무 | 완료 | 2장 | `[구현]` | 흰색 | `screens/Report/ReportLedgerSelectScreen.tsx` — 7-E. `folderService.getFolderItems()`(`GET .../folder-items`, `folderId` 파라미터로 뎁스인)로 폴더+장부 혼합 3열 그리드 조회, 폴더 탭=뎁스인/장부 탭=다중 선택 토글. 하위 폴더 안에서 뒤로가기는 명세에 없는 동작이라(시안에 하위 진입 캡처 없음) 표준 폴더탐색기처럼 한 단계만 올라가게 판단(design-diff.md 기록), 최상위에서만 화면 이탈. **2026-09-13 결함 수정**: 검색 필드가 회색 채움 박스였는데 시안 No.2는 흰 배경+테두리 pill이다 — `SearchField`를 쓰는 다른 7개 화면(`FolderScreen` 등) 스펙시트부터 먼저 확인해보니 전부 이 화면과 달리 회색 채움이 맞았다(`FDR-1-PAGE-01-0` 등, 공용 컴포넌트 기본값 정상). 컴포넌트에 이미 있던 `variant="outline"`(흰 배경+테두리, 그동안 아무 화면도 안 쓰고 있었음)을 이 화면에만 적용 — 컴포넌트 자체는 안 고침. 배경도 `ScreenContainer background="secondary"`(흰색)로 확정. **재캡처 확인 완료(2026-09-13)**: 2026-09-12에 진단했던 "목록 0건"(§5-3, 데이터 유실 아니라 전부 백업된 상태였음)도 새 폴더/장부로 재현해 정상 노출 재확인 |
| ☐ | `ETC-5-PAGE-02-0` | 보고서_내역 상세 — **및 보관함_내역 상세(공유 ID, 2026-09-12)** | Page | 전체/총무 | 완료 | 7장 | `[부족함]` | 흰색 (명세 프레임 실측 v5 (내역_상세내역조회.png#0, #FFFFFF, 점유율 89%) + 4개 프레임 일치. 프레임은 `DTB-2-PAGE-02-0`/`03-0` 시트이고 이 ID 전용 시트는 spec-sheet-map에 없다 — 같은 "상세 내역" 레이아웃이며 이 ID의 크롭 2장(보고서 생성/보관함)도 7점 픽셀 샘플링이 전부 #FFFFFF. 두 파일 처리 통일 (2026-09-19) — 9-9의 primary는 정정, 9-10) | `screens/Report/ReportEntryDetailScreen.tsx` — 7-G. **2026-09-06 등급 하향**: 시안 UI 요소 6번 액션이 이 화면의 존재 이유를 "유저는 개별 거래 건의 **영수증 원본과 상세 메모까지 끝까지 추적 및 조회**할 수 있음"이라고 명시하는데, `GET /reports/{reportId}` 스냅샷엔 `memo`도 `receipts`도 없어(실호출 확인) 그 핵심 기능이 통째로 빠졌다 — 지금은 구분/금액/발생일/내역명/장부명만 보여주는 반쪽 화면이다. `docs/backend-requests.md` 1순위 항목 참고. **`TransactionDetailScreen`을 재사용하지 않은 이유는 별개**(entryId가 없어 그 화면 구조 자체를 못 붙임, 스냅샷 정책과도 안 맞음). **2026-09-12 추가**: `ETC\보관함\ETC-5-PAGE-02-0.png` 크롭도 같은 ID를 쓴다(공유 ID, `ETC-4-PAGE-05-0` 행 참고). 다만 이쪽은 보고서와 달리 **원래 요구된 영수증·메모가 실제로 있다** — 보관 스냅샷(`ArchivedEntry`)엔 `memo`/`receiptFiles[]`가 실제로 온다(2026-09-12 실호출 확인). 그래서 이 화면(보고서용)을 재사용하지 않고 `screens/Archive/ArchiveEntryDetailScreen.tsx`를 새로 만들어 영수증·메모까지 전부 보여준다 — 보관함 쪽은 이 행이 하향된 이유(스냅샷에 영수증·메모 없음)가 애초에 해당하지 않는다. 보관함 쪽 등급은 위 `ETC-3-PAGE-03-0` 행에서 별도 추적(재캡처 대기), 이 행의 등급·비고는 보고서 쪽 기준 그대로 |
| ☐ | `ETC-5-SNACKBAR-01-0` | 권한 변경 완료 | Snackbar | - | 예정 | 2장 | `[확인필요]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/GroupManager/GroupManagerScreen.tsx` — 권한 변경 완료 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-5-SNACKBAR-02-0` | 모임 내보내기 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/GroupManager/GroupManagerScreen.tsx` — 렌더링은 여기, 메시지 조합은 `MemberProfileSheet.tsx`(kick). `ETC-4-MODAL-03-0`과 같이 재개 · **부모 ETC-2-PAGE-03-0 배경: 블루** |
| ☐ | `ETC-5-SNACKBAR-03-0` | 모임 참여 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/GroupManager/AllGroupsScreen.tsx` — 코드 참여 성공 후(`JoinGroupSheet.onJoined`) 표시, 1.6초 뒤 이전 화면으로 복귀 · **부모 ETC-1-PAGE-01-0 배경: 블루** |
| ☐ | `ETC-5-SNACKBAR-04-0` | 모임 생성 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/GroupManager/GroupCreateScreen.tsx L78` — 모임 생성 완료 |
| ☐ | `ETC-5-SNACKBAR-05-0` | 모임 전환 완료 | Snackbar | - | 예정 | **0장** | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/More/MoreScreen.tsx`(`GroupSwitcherMenu.onSelectGroup`) — **시안 이미지 0장**, 다른 완료 스낵바(모임 삭제 완료 등)의 "'{이름}' 모임을 OO했어요." 패턴을 따라 문구를 만들었다(§5-4 기록) |
| ☐ | `ETC-5-SNACKBAR-06-0` | 프로필 변경 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/More/MyProfileScreen.tsx` — route.params.snackbarMessage로 전달받아 렌더링(발신은 `ProfileEditScreen.tsx`). **시안 이미지 0장 아니었음**: `ETC-4-PAGE-15-0` 스펙 시트 안에 "Case A"로 임베드돼 있었는데 Screen ID가 `COM-1-SNACKBAR-02-0`으로 잘못 적혀 있어(§5-1/§5-2 참고) 이전 조사에서 0장으로 집계됐다. 문구("변경 사항이 저장되었어요.") 확인 반영 |
| ☐ | `ETC-5-SNACKBAR-07-0` | 비밀번호 변경 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/More/MyProfileScreen.tsx` — route.params.snackbarMessage로 전달받아 렌더링(발신은 `PasswordChangeScreen.tsx`) |
| ☐ | `ETC-5-SNACKBAR-08-0` | 보고서_생성완료 | Modal | 총무 | 예정 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | `screens/Report/ReportCreateByLedgerScreen.tsx`·`ReportCreateByPeriodScreen.tsx`가 생성 성공 시 `navigation.navigate('ReportMain', {snackbarMessage: SNACKBAR_REPORT_CREATED})`로 이동 → `ReportMainScreen.tsx`가 렌더(문서만 미구현으로 남아 있었다). Format이 IA엔 `Modal`로 잘못 적혀 있다(§5-2 참고, 실제는 Snackbar) · **부모 ETC-2-PAGE-04-0 배경: 블루** |

### ADD — FAB — 내역 추가

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 배경 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|---|
| ☐ | `ADD-1-PAGE-01-0` | 내역 추가 | Page | - | 완료 | 5장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (FAB_내역추가/내역_내역추가.png#0, 상단 #FFFFFF, 점유율 77% 외 1프레임 일치)) | `screens/Transactions/TransactionRegisterScreen.tsx` — 상세: [design-diff.md#add-1-page-01-0-내역-추가](design-diff.md#add-1-page-01-0-내역-추가) |
| ☐ | `ADD-2-MODAL-01-0` | 이탈 방지 모달 | Modal | - | 완료 | 1장 | `[부족함]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionRegisterScreen.tsx L480` — 시각적으로는 디자인과 일치하나, `BackHandler` 미등록으로 안드로이드 하드웨어/시스템 back 버튼으로는 이 모달이 아예 안 뜨고 확인 없이 나가짐. 상세: [design-diff.md#add-2-modal-01-0-이탈-방지-모달](design-diff.md#add-2-modal-01-0-이탈-방지-모달) |
| ☐ | `ADD-2-SHEET-01-0` | 내역명 입력 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionTextInputSheet.tsx` — 내역명 입력. 상세: [design-diff.md#add-2-sheet-01-0-내역명-입력](design-diff.md#add-2-sheet-01-0-내역명-입력) |
| ☐ | `ADD-2-SHEET-02-0` | 담당자 선택 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionSingleSelectSheet.tsx` — 담당자 선택. 상세: [design-diff.md#add-2-sheet-02-0-담당자-선택](design-diff.md#add-2-sheet-02-0-담당자-선택) |
| ☐ | `ADD-2-SHEET-03-0` | 장부 단일 선택 | Bottom Sheet | 총무 | 완료 | 4장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionSingleSelectSheet.tsx` — 장부 단일 선택. 상세: [design-diff.md#add-2-sheet-03-0-장부-단일-선택](design-diff.md#add-2-sheet-03-0-장부-단일-선택) |
| ☐ | `ADD-2-SHEET-04-0` | 메모 입력 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionTextInputSheet.tsx` — 메모 입력. 상세: [design-diff.md#add-2-sheet-04-0-메모-입력](design-diff.md#add-2-sheet-04-0-메모-입력) (캡처 상태 불일치로 레이아웃 재확인 필요) |
| ☐ | `ADD-2-SHEET-05-0` | 증빙자료 등록 | Bottom Sheet | - | 완료 | 2장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionAttachMenuSheet.tsx` + `screens/Transactions/ReceiptGalleryPickerScreen.tsx`(같은 ID의 `@screen` 주석 — 2026-09-19 감사에서 §2 코드 열에 빠져 있던 것을 병기; 행 자체는 이미 있어 누락 아님, 등급 변경 없음) — 메뉴 자체는 그대로지만 2026-09-11부터 "사진 촬영하기"/"사진 선택하기" 둘 다 실제 촬영·선택 직후 자동 업로드로 이어진다(`TransactionRegisterScreen`의 `addPickedImages`). 상세: [design-diff.md#add-2-sheet-05-0-증빙자료-등록](design-diff.md#add-2-sheet-05-0-증빙자료-등록) |
| ☐ | `ADD-2-SHEET-06-0` | 금액 입력 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionAmountSheet.tsx` — **2026-09-21**: 시안의 커스텀 숫자패드(`NumericKeypad`)를 없애고 안드로이드 기본 숫자 키보드(`TextField keyboardType="number-pad"`, 접미 `원`, `autoFocus`, 상한 999,999,999)로 교체(사용자 결정; 시안 원본이 이 환경에 없어 시안 대조는 못 함 — 판단 보류). `NumericKeypad` 컴포넌트·스토리 파일은 사용처가 없어졌지만 삭제하지 않았다. 상세: [design-diff.md#add-2-sheet-06-0-금액-입력](design-diff.md#add-2-sheet-06-0-금액-입력) |
| ☐ | `ADD-2-SHEET-07-0` | 일자 선택 캘린더 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | 흰색 (요소 표면색 — `BottomSheet` 컴포넌트 #FFFFFF) | `screens/Transactions/TransactionDateSheet.tsx` — 실제 구현 정상, 디자인 원본 파일이 더미 데이터(요일 헤더 전부 "일", 날짜 셀 전부 "0")라 원본 재확보 필요. 상세: [design-diff.md#add-2-sheet-07-0-일자-선택-캘린더](design-diff.md#add-2-sheet-07-0-일자-선택-캘린더) |
| ☐ | `ADD-2-SNACKBAR-01-0` | 내역 추가 완료 | Snackbar | - | 완료 | 1장 | `[구현]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700, 명세서 프레임 육안 확인) | 4-A부터 실 등록(신규 내역은 전부 실 API로 감)은 `TransactionRegisterScreen.tsx` 자체가 완료 즉시 스낵바를 띄운다(승인 상태에 따라 문구 2종 — 0-2 참고, `SNACKBAR_TRANSACTION_ADDED`/`_PENDING`). **4-B 정리(2026-09-05)**: `TransactionsScreen.tsx`의 `addedTransactionId` 경유 스낵바는 그걸 만들던 `editMock` 경로가 삭제되며 죽은 코드가 되어 같이 제거됨 — 이제 이 스낵바는 `TransactionRegisterScreen.tsx` 하나뿐이다. 상세: [design-diff.md#add-2-snackbar-01-0-내역-추가-완료](design-diff.md#add-2-snackbar-01-0-내역-추가-완료) (재캡처는 사용자 몫) · **부모 DTB-1-PAGE-01-0 배경: 블루** |
| ☐ | `ADD-3-PAGE-01-0` | 영수증 스캔 | Page | - | 완료 | 2장 | `[부족함]` | 미판정 (v5 판정 기타 9% — 카메라 프리뷰 화면이라 배경 판정 대상 아님) | **2026-09-06 등급 하향**: 시안 UI 요소 2번 "카메라 촬영 & 컨트롤러"(라이브 프리뷰 + 뒤로/X 앱바 + 좌하단 갤러리 아이콘 + 하단 원형 셔터)에 대응하는 화면이 사라졌다 — 이번 라운드에 인앱 카메라 화면(삭제된 파일 MockCameraView.tsx→CameraCaptureView.tsx)을 통째로 삭제하고 시스템 카메라 인텐트(`launchCamera()`)로 바꿨기 때문이다(`ADD-3-PAGE-02-0` 참고). `screens/Transactions/ReceiptScanningView.tsx`가 덮는 건 UI 요소 3번 "인식 중" 뿐이고, 2번(촬영 단계) 자체엔 대응 화면이 없다 — 시스템 카메라 인텐트가 그 자리를 대신하지만 시안이 요구하는 라이브 프리뷰·인앱 셔터는 아니다. **`react-native-vision-camera` 도입 여부는 §5-5(도입 결정 대기)로 옮김** — 2026-09-12 원본 스펙시트(`화면명세서\FAB_내역추가\내역_내역추가_증빙자료_영수증스캔.png`)로 라이브 프리뷰 요구를 재확인했고, 이건 기획 확인 사안이 아니라 우리 우선순위 결정 사안이라 §5-4가 아니라 §5-5에 정리했다. `ADD-3-PAGE-02-0`(`[해당없음]`, 시안 0장이라 "안 만드는 게 확정")과 구분할 것 — 01-0은 시안이 있는데 대응이 못 미치는 상태다. 상세: [design-diff.md#add-3-page-01-0-영수증-스캔](design-diff.md#add-3-page-01-0-영수증-스캔) |
| ☐ | `ADD-3-PAGE-02-0` | 사진 촬영 | Page | - | 완료 | **0장** | `[해당없음]` | 미판정 | **2026-09-06 결정**: 시스템 카메라 인텐트 방식으로 결정 — 앱 내 촬영 화면 없음. `react-native-image-picker`의 `launchCamera()`가 OS 카메라 앱을 그대로 띄우고 돌아온다(`utils/imagePicker.ts`, 런타임 CAMERA 권한 요청 포함, 거부/실패는 호출한 화면이 스낵바로 알림). 이전엔 그 앞에 프리뷰 없는 인앱 중간 화면(삭제된 파일 MockCameraView.tsx→CameraCaptureView.tsx)이 있었으나 "카메라가 두 번 열리는" 것처럼 보여 완전히 제거했다 — 이 Screen ID에 대응하는 화면 자체가 이제 없는 게 정상이다(§5-4에 기획 확인 항목 있음, 시안이 나오면 `react-native-vision-camera` 재검토). 이미지 0장은 그대로. 상세: [design-diff.md#add-3-page-02-0-사진-촬영-디자인-없음](design-diff.md#add-3-page-02-0-사진-촬영-디자인-없음) |
| ☐ | `ADD-4-PAGE-01-0` | 영수증 스캔 성공 | Page | - | 완료 | 1장 | `[확인필요]` | 미판정 | `screens/Transactions/TransactionRegisterScreen.tsx` — 스캔 성공 → 필드 반영 (utils/mockOcr.ts 사용중). 상세: [design-diff.md#add-4-page-01-0-영수증-스캔-성공](design-diff.md#add-4-page-01-0-영수증-스캔-성공) (금액 자동 반영 타이밍이 디자인과 달라 기획 확인 필요) |
| ☐ | `ADD-4-PAGE-01-1` | 영수증 스캔 실패 | Page | - | 진행 | 1장 | `[구현]` | 흰색 (명세 프레임 실측 v5 (FAB_내역추가/내역_내역추가_증빙자료_영수증스캔.png#3, 상단 #FFFFFF, 점유율 100%)) | `screens/Transactions/ReceiptScanFailedView.tsx` — 디자인 '진행' 중. 상세: [design-diff.md#add-4-page-01-1-영수증-스캔-실패](design-diff.md#add-4-page-01-1-영수증-스캔-실패) |
| ☐ | `ADD-4-PAGE-02-0` | 사진 촬영 결과 | Page | - | 검토 | **0장** | `[미구현]` | 미판정 | 사진 촬영 결과 (디자인 '검토', 이미지 0장) |
| ☐ | `ADD-4-SNACKBAR-01-0` | 이미지 첨부 제한 | Snackbar | - | 완료 | 1장 | `[부족함]` | 어두움 #374151 (요소 표면색 — `Snackbar` 컴포넌트 GREY_700) | `screens/Transactions/TransactionRegisterScreen.tsx`(Snackbar 렌더 위치). **2026-09-11 재판정(하향)**: 시안(`ADD\ADD-4-SNACKBAR-01-0.png`)은 `ETC-4-PAGE-02-0`과 같은 인앱 사진 그리드(카메라 타일 + 실제 사진 12장, 다중 선택 체크) 위에 "사진은 최대 10장까지 첨부할 수 있어요." 스낵바가 얹힌 화면이다. `ReceiptGalleryPickerScreen`이 그리드 없이 시스템 갤러리를 바로 여는 다리로 바뀌면서 배경 그리드 자체가 사라졌다 — 스낵바 문구·발생 조건(남은 자리 초과)은 그대로 부모 화면(`onMessage` 콜백)에서 재현하지만, 시안이 보여주는 전체 화면 구성(그리드+스낵바)과는 다르다 — `[구현]`→`[부족함]`. 상세: [design-diff.md#add-4-snackbar-01-0-이미지-첨부-제한](design-diff.md#add-4-snackbar-01-0-이미지-첨부-제한) |
| ☐ | `ADD-5-MODAL-01-0` | 스캔 내용 반영 확인 모달 | Modal | - | 완료 | 1장 | `[구현]` | 흰색 (요소 표면색 — `Dialog` 컴포넌트 #FFFFFF, 명세서 프레임 육안 확인) | `screens/Transactions/TransactionRegisterScreen.tsx L498` — 상세: [design-diff.md#add-5-modal-01-0-스캔-내용-반영-확인-모달](design-diff.md#add-5-modal-01-0-스캔-내용-반영-확인-모달) · **부모 ADD-1-PAGE-01-0 배경: 흰색** |

## 3. 디자인 토큰 대조

### 3-1. 색상 — `Color_Definition.pdf` vs `src/constants/colors.ts`

**전부 일치.** 코드에 정의된 팔레트 22개 값이 PDF의 Primitive Color와 100% 같다.

- `src/constants/colors.ts` L1-2 주석이 *"color.pdf 기준 … 스와치 눈대중 근사치"*라고 되어 있으나, 최신 `Color_Definition.pdf` 기준으로 재검증한 결과 근사치가 아니라 **정확한 값**이다. 이 주석은 오해를 부르므로 지우거나 `Color_Definition.pdf 기준 확정값`으로 고칠 것.
- `GREY_700`과 `GREY_800`이 둘 다 `#374151`인 것은 **코드 실수가 아니라 PDF 원본이 그렇다**. 디자이너에게 오탈자인지 확인 필요(→ `docs/design-questions.md` #1).
- 아직 코드에 없는 팔레트 값: Grey 50/500/900, Navy 50/100/300/400/600/700/900, Blue 200/600~900, Yellow·Red 대부분. 실제 사용처가 생길 때 추가하면 된다.

### 3-2. 타이포그래피 — `Typography Style.pdf` vs `src/constants/typography.ts`

**fontSize·lineHeight는 15개 스타일 전부 일치. 그런데 `letterSpacing`이 통째로 빠져 있다.**

| 스타일 | 스펙 letterSpacing | 코드 | |
|---|---:|---|---|
| H1 | 0 | 없음 (=0) | OK |
| H2 | 0.15 | 없음 | 누락 |
| H3 | 0.15 | 없음 | 누락 |
| Subtitle1 | 0.15 | 없음 | 누락 |
| Subtitle2 | 0.15 | 없음 | 누락 |
| Subtitle3 | 0.1 | 없음 | 누락 |
| Subtitle4 | 0.1 | 없음 | 누락 |
| Body1 | 0.5 | 없음 | 누락 |
| Body2 | 0.25 | 없음 | 누락 |
| Body3 | 0.25 | 없음 | 누락 |
| Button | 1.25 | 없음 | 누락 |
| Chips | 0.4 | 없음 | 누락 |
| Badge | 1.5 | 없음 | 누락 |
| Caption | 0.4 | 없음 | 누락 |
| Overline | 0.4 | 없음 | 누락 |

`TYPOGRAPHY` 한 파일만 고치면 앱 전체 텍스트에 반영되므로, **스크린샷 대조를 시작하기 전에 먼저 처리하는 것을 권장한다.** 지금 캡처하면 모든 화면이 자간 차이로 "불일치"로 잡힌다.

> 참고: 스펙의 Font Weight는 500/400/300/200이라는 자체 토큰 번호(Bold/SemiBold/Medium/Regular)이지 CSS 수치가 아니다. 코드는 `fontFamily`로 굵기를 고르는 방식이라 이 부분은 맞다.

## 4. 스크린샷 대조 절차

### 4-0. ⚠️ `design-index.json`은 크롭 목업만 가리킨다 — [기능]/[상태]/[액션] 판단엔 원본 스펙시트를 봐라

`scripts/design-index.json`(및 그 기반 `make-pair.js`)이 가리키는 파일은 전부
`ADD\`/`COM\`/`DSH\`/`DTB\`/`DUE\`/`ETC\`/`FDR\`/`login\` 밑의 **크롭 목업**(휴대폰 화면만
있고 UI 요소 표는 없음)이다. **[기능]/[데이터]/[상태]/[액션]이 있는 원본 스펙시트는
`화면명세서\<도메인>\` 밑에 별도로 있고, 이 인덱스엔 절대 안 잡힌다** — 파일명이 한글
기능명(`더보기_기록보관_상세보기.png`)이라 `SCREEN_ID_PATTERN` 정규식이 못 잡아서다
(`scripts/build-design-index.js` 상단 주석·`_meta.warning` 참고, 2026-09-12에 `ETC-3-PAGE-03-0`
작업 중 이걸 놓쳐서 [액션](탭 시 이동)을 못 보고 "탭 불가"로 잘못 판정했던 적이 있다).

**크롭 목업만 보고 [상태]/[액션]을 판별 불가로 닫지 마라.** `화면명세서\` 안에서 관련
도메인 폴더(대시보드/내역/DUE/더보기/폴더/FAB_내역추가/회원가입&로그인)를 먼저 찾아
같은 화면의 원본 스펙시트가 있는지 확인하고, 있으면 표를 읽고 인용해라 — 표에 답이 있으면
그건 기획 질문이 아니라 우리가 못 찾은 것이다(§5-4에 여러 건 있었다).

### 4-1. 준비: Screen ID 주석 심기 (선행 작업)

현재 `src/screens/**` 53개 파일 중 Screen ID가 적힌 곳은 `Dashboard/DashboardScreen.tsx` L52 한 줄뿐이다. `CLAUDE.md`가 권장하는 규칙이 실제로는 지켜지지 않고 있다.

각 화면 파일 상단에 아래 한 줄을 넣으면, 이후의 매핑·검증·미구현 추적이 전부 `grep` 한 번으로 끝난다.

```tsx
/** @screen DTB-1-PAGE-01-0 내역 메인 */
```

§2 표의 "코드 위치" 컬럼이 곧 이 주석을 심을 위치다.

### 4-2. 캡처 규약

디자인 이미지 파일명과 **똑같은 Screen ID**로 저장한다. 상태 변형이 있으면 접미사도 그대로 맞춘다.

```
shots/DTB-1-PAGE-01-0.png      ← BILLIGE/DTB/DTB-1-PAGE-01-0.png 와 대조
shots/DTB-1-PAGE-01-0-1.png    ← 변형 상태
```

안드로이드 에뮬레이터 기준:

```bash
adb exec-out screencap -p > shots/DTB-1-PAGE-01-0.png
```

### 4-3. 캡처 대상 우선순위

1. `[구현]` 48개 — 실제로 맞는지 확인 (여기서 대부분의 스타일 차이가 나온다)
2. `[확인필요]` 20개 — 어떤 화면에 대응되는지 확정
3. `[부족함]` 9개 — 차이 항목 구체화

`[미구현]` 82개는 캡처 대상이 아니다.

### 4-4. 권한 분기

IA상 총무 전용 61개 / 일반 전용 3개다. **총무 계정과 일반 계정으로 각각 한 번씩** 돌아야 검증이 끝난다.

### 4-5. 대조 항목

정상 상태만 보면 안 된다. 화면마다 아래를 본다.

- 레이아웃 / 여백·간격
- 타이포 (크기·굵기·행간·자간)
- 색상 (토큰을 썼는지, 하드코딩했는지)
- 아이콘·이미지 에셋
- 텍스트 문구 (`constants/*Text.ts`와 디자인 문구 일치)
- 인터랙션·상태 (기본/눌림/비활성/포커스)
- 빈 목록 / 로딩 / 에러 / 긴 텍스트 케이스

## 5. 문서 정합성 이슈 (기획팀 확인 필요)

검증을 시작하기 전에 정리하면 좋은 것들이다.

### 5-1. IA에는 있는데 디자인 이미지가 없는 Screen ID — 28개

§5-1: IA에만 있고 시안 이미지가 없다던 28개 목록은 낡은 스캔 결과였다(다수가 `화면명세서\` 스펙시트에 실제로 있음 — 정정 4건 전문은 lessons.md §4) → 현재 대조 상태는 §5-6·§5-19, 매핑은 `scripts/spec-sheet-map.tsv` 참조. 이 목록 자체는 재검증하지 않았다(§5-19 집합 비교로 대체).

### 5-2. 이미지는 있는데 IA에 없는 Screen ID — 25개

§5-2: IA에 없는 시안 ID 25개 — `ETC-4-SHEET-02-0`은 매핑됨(8-A), `COM-1-SNACKBAR-02-0`은 `ETC-5-SNACKBAR-06-0`의 오기(같은 ID가 다른 도메인 3곳에도 복붙됨), `ETC-7-PAGE-01-0`(사진 편집·크롭)은 구현 없음 → §5-5 도입 결정 대기. 나머지 ID 목록은 §5-6 C와 같은 집합 → §5-6 참조.

### 5-3. 기타

- `DTB-2-PAGE-02-0`(상세 내역_조회): IA의 Design 상태는 `예정`인데 이미지가 6장 있다. 어느 쪽이 최신인지 확인 필요. `FDR-3-SHEET-03-0`도 같은 상황(예정 / 이미지 5장).
- `FDR-2-MODAL-01-0`과 `FDR-3-MODAL-05-0`이 둘 다 "새 폴더 생성"이다. 진입 경로만 다른 같은 모달인지 확인 필요.
- `DUE-5-SNACKBAR-01-0`의 Format이 `Snackbar`가 아니라 `Page`, `ETC-5-MODAL-01-0`은 `Page`, `ETC-5-SNACKBAR-08-0`은 `Modal`로 되어 있다. IA 입력 오류로 보인다.
- **`DUE-5-SNACKBAR-03-0`(모임원 개별 추가 완료)**: `DUE-3-PAGE-01-0`(6-B에서 발견)과 같은 패턴 — 화면명세서(`모임원추가_개별추가.png` Case C)엔 이 ID로 정의돼 있지만 `billage-ia.md` 201개 화면 목록엔 아예 없다. IA 누락으로 보인다. 구현은 `MemberAddIndividualScreen.tsx`에 포함(7-A).
- [해결] `CLAUDE.md`가 낡았다던 지적 — 이후 갱신됨(현재 화면 전체 구현 기준).
- [해결] `ETC-3-PAGE-03-0` 요청자 시트 오지정(2026-09-12) — 올바른 시트(`더보기_기록보관_상세보기.png`)로 재대조 완료 → design-diff.md §3.
- `ETC-2-PAGE-06-0` 날짜 표기 표/그림 모순(2026-09-12) → 아래 불일치 #1 (기획 확인 대기).
- [해결] `ETC-4-PAGE-03-0` 보고서 생성 실패 진단(2026-09-13) — 서버 버그 아님(빈 장부의 `REPORT_RANGE_EMPTY` + 프론트 에러 매핑 누락 → `REPORT_ERROR_MESSAGES` 추가) → lessons.md 1-1 / 1-3.
- [해결] 회원가입 400 `INVALID_REQUEST` 재진단(2026-09-13) — curl 셸 인코딩 오염(서버·프론트 무관). 이메일 발송 `500 MAIL_SEND_FAILED`는 서버 설정 문제로 유효 → lessons.md 1-1 / backend-requests.md 1순위.
- [해결] 인코딩 함정 재발 방지(2026-09-13) — `scripts/api-call.js` 도입, 두 번째 테스트 계정(`userId 9`) 확정 → lessons.md 1-1 / 2.
- `COM-2-PAGE-05-0` 사유·CTA 문구 표/목업 모순(2026-09-13) → 아래 불일치 #2, #3 (기획 확인 대기).
- [해결] `FolderScreen`/`FolderSelectMoveScreen` 최상위 장부 미노출 회귀(2026-09-13) — `getAllLedgersInGroup()` 후 `folderId === null` 필터로 수정 → lessons.md 1-9 / design-diff.md §3.
- [해결] 필수(`*`) 표시 전수 점검(2026-09-13) — Report/Dues 3화면 결함 10건 수정, `TransactionRegisterScreen`은 일치. 장부·기간 필드 형태 불일치는 §5-13에서 수정.
- **날짜 표기 2자리(YY) vs 4자리(YYYY) 혼재 — 2026-09-13 전수 조사**: `ETC-5-PAGE-01-0` 그리드
  하위 날짜가 "2026.09.12"(4자리)인데 이 화면 스펙시트 자체엔 명시적 규정이 없어(관찰만,
  `docs/design-diff.md` 기록) 이 김에 앱 전체를 훑었다. **4자리(`YYYY.MM.DD`, `utils/dueDate.ts`
  의 `formatDateDot()` 경유)**: `ArchiveDetailScreen`/`ArchiveEntryDetailScreen`/
  `ArchiveLedgerEntriesScreen`/`DuesDetailScreen`/`DuesScreen`/`MyProfileScreen`/
  `ReportByLedgerDetailScreen`/`ReportByPeriodDetailScreen`/`ReportEntryDetailScreen`/
  `ReportLedgerEntriesScreen`/`ReportLedgerSelectScreen`/`ReportMainScreen`/
  `ReportPeriodEntriesScreen` — 13개 화면. **2자리(`YY.MM.DD`, 화면별 로컬 `toShortDate()`
  헬퍼)**: `DuesDateRangeSheet`(시트 내부 미리보기), `ReceiptDetailScreen`,
  `ReportCreateByPeriodScreen`(이번 라운드에 4→2자리로 전환). 13:3으로 4자리가 압도적
  다수이고, 2자리 3곳은 전부 "입력 폼의 짧은 미리보기/값 표시" 맥락(시트 미리보기, 상세
  화면의 컴팩트 라벨, 폼 필드)인 반면 4자리 13곳은 전부 "목록/상세의 일반 텍스트 표기"
  맥락이라 — 우연한 혼재라기보다 "짧게 보여줄 자리는 2자리, 일반 텍스트는 4자리"라는
  암묵적 구분이 이미 어느 정도 있어 보인다. 다만 명문화된 규칙은 없어 새 화면을 만들 때마다
  개발자 판단에 맡겨지고 있다 — 일괄 규칙(예: "카드/리스트 요약 텍스트는 전부 YY 2자리")이
  필요한지는 기획팀 확인이 필요하다.

### 5-4. 기획팀 확인 필요 항목

재검증(2026-09-18 전수 대조): 확인 33 / 정정 2 / 검증 불가 2 — 정정은 해당 항목 아래 `※ 정정` 줄로 남겼다(전문은 lessons.md §4).

스크린샷 대조를 시작하기 전에 답이 있어야 진행이 되는 것들이다.

#### 시안 목업↔설명표 불일치 누적 목록 (2026-09-18 최초 정리)

각 라운드마다 "몇 번째"로만 언급되고 흩어져 있던 것들을 처음으로 한 목록에 모았다. 전부
같은 패턴 — 같은 스펙시트 안에서 목업 그림과 UI 요소 설명표가 서로 다른 문구/숫자를 쓰고
있고, 코드는 매번 둘 중 하나를 판단해 따랐다.

1. `ETC-2-PAGE-06-0`(보관함 목록) — 날짜 표기: 표 "기간 {YYYY.MM.DD} - {YYYY.MM.DD}" vs
   목업 "단일 일시(2026.01.20 · 14:15)". 구현은 목업(그림) 따름, 기획 확인 필요.
2. `COM-2-PAGE-05-0`(탈퇴 사유) — 사유 문구: 목업 "다시 가입 예정이에요" vs 표(+같은 시트
   Case A) "다시 가입할 거예요". 구현은 표 따름.
3. `COM-2-PAGE-05-0`(탈퇴 사유) — CTA 문구: 목업 3곳 "탈퇴하기" vs 표(+Case A) "선택 완료".
   구현은 시각적 다수인 목업 따름(2026-09-11 결정).
4. `DUE-3-PAGE-04-0`(회비 요청) — 앱바: 목업 "회비 요청" vs 표 No.1 "납부 요청". 구현은
   목업 따름.
5. `DUE-3-PAGE-06-0`(회비 수정) — 앱바: 표 "우측 X(닫기)" vs 목업 좌측 백버튼만, 우측
   아이콘 없음. 구현은 목업 따름.
6. `DUE-3-PAGE-02-0`(회비 수정_모임원 선택) — 페이지 경로: 표 "납부관리 > 회비 상세 >
   회비 수정하기 > 모임원 선택" vs 실제 진입은 "납부관리 > 회비 상세 > 모임원 선택"(회비
   상세 ⋮ 메뉴에서 바로, 한 단계 얕음). 실제 구현(상세→바로 진입)이 시안 Case A 메뉴와
   일치한다고 판단, 표 쪽이 낡은 경로 표기로 보임.
7. `FDR-2-PAGE-02-0`(예산 설정) — 빈 화면 문구: 목업 "'폴더'에서 장부를 생성해주세요." vs
   표 "장부를 먼저 생성해주세요". 구현은 목업 따름.
8. `FDR-3-MODAL-03-0`(장부 이름 변경) — 글자수 제한: 목업 "최대 10자 이내로 입력해주세요."
   vs 표 No.2/No.3 "최대 20자"(두 번 명시). **결론: 20자 확정(2026-09-18)** — 앱 내
   이름/제목 필드 4/4(`FOLDER_NAME_MAX_LENGTH`/`LEDGER_NAME_MAX_LENGTH`/
   `DUES_TITLE_MAX_LENGTH`/장부 이름 변경)가 20이고, 그중 3개는 서버 도메인 문서 근거
   (`Folder.txt`/`Ledger.txt`—2026-08-30 서버 확인/`Dues.txt`), 같은 명세서 설명표 자체가
   20을 두 번 명시한다. 시안 목업의 "10"만 유일하게 다르다 — 불일치는 이 목록에 #8로
   분리 기록, 기획 확인 필요.
9. **수입 금액 부호 표기가 화면마다 다름**(2026-09-19 6-8, 코드 조사만 — 시안 대조 필요). 요청서 문구는
   "부호 없음 6곳(AmountCard, 보고서 상세 2, ArchiveDetailScreen, 내역 상세 2) vs '+' 접두 2곳(ReportCard,
   StatisticsScreen)"이었으나 코드로 다시 세니 **6/2가 재현되지 않는다** — 내역 상세 2곳
   (`ReportEntryDetailScreen`/`ArchiveEntryDetailScreen`)은 INCOME이면 `+`를 붙인다. 실제 현황:
   - **부호 없음(`N원`)**: `AmountCard`, `ReportByLedgerDetailScreen`, `ReportByPeriodDetailScreen`,
     `ArchiveDetailScreen`(4곳). `TransactionListItem`은 값 자체의 부호만(수입 양수는 `+` 없음, 지출은 `-N원`) — 호출 6곳.
   - **`+` 접두(수입만)**: `ReportCard`(`+N`, '원' 없음), `StatisticsScreen`(`+N원`),
     `ReportEntryDetailScreen`, `ArchiveEntryDetailScreen`, `TransactionDetailScreen`, `Calendar`
     셀(`amount > 0`일 때만)(6곳).
   - 0일 때 `+0`이 나오던 `ReportCard`·`StatisticsScreen`은 0이면 부호를 안 붙이게만 고쳤다(6-8). `+`를 쓸지는
     결정하지 않았다 — 어느 쪽이 맞는지는 시안(보고서 조회·통계·내역 상세) 대조 필요.
10. `FDR-1-PAGE-01-0`(폴더 메인) — 빈 화면(Case B) 문구: 설명표 No.5-1 "생성한 폴더/장부가 없어요" vs 시안 목업 제목 "아직 폴더 및 장부가 존재하지 않아요." + 부제 "새로운 장부를 생성하여 내역을 관리해보세요.". **구현은 목업을 따른다**(2026-09-19 확인 — 앱 문구는 이미 목업과 일치, 코드 변경 없음). 검색 무결과(Case D) 문구는 표에 별도 서술이 없고 목업 "해당 검색어에 대한 내역이 없어요." / "검색어를 다시 입력해주세요."와 앱이 일치. 표 쪽이 낡은 문구로 보이나 기획 확인 필요.
11. `FDR-1-PAGE-01-0`(폴더 메인) — 목록 개수 표기: 목업 "6 개"(숫자와 단위 사이 공백 있음) vs 설명표 No.3 "{N}개"(형식 `(N)개`, 예 `6개`, 공백 없음). 앱은 그동안 "1 건"(단위도 다름)이었고 2026-09-19 목업을 따라 **"N 개"(공백 있음)** 로 고쳤다 — 표기 자체(공백 유무)는 목업·표 불일치라 기획 확인 필요.
12. `ETC-3-PAGE-04-0`(증빙자료 상세) — 배경: 시안(원본 크롭 육안 확인, 2026-09-19) 흰색 — 앱바·하단 버튼 영역이 흰색이고 중앙은 사진 자리표시자 vs 구현 `FILL_INVERSE`(어두운 배경, `ReceiptDetailScreen`). 사진 뷰어 UX상 어두운 배경이 나을 수 있어 **기획 확인 필요**. 이번엔 고치지 않는다.
13. **[기획 확인 불필요 — 시안 내부 오기로 확정, 2026-09-20]** `FDR-2-PAGE-04-0` 메인 프레임 목업만 '2 건', 같은 시트 Case A 목업은 '2 개', 설명표는 '{N}개'. 시안 내부 오기로 판단. '개'로 구현 확정. 기획 확인 불필요.
14. `FDR-1-PAGE-01-0`·`FDR-2-PAGE-04-0` — 검색 동작: 폴더 메인·상세가 같은 화면(`FolderScreen` `isRoot` 분기)인데 설명표가 모순. 메인 No.2 = 실시간 필터링(`하단 그리드 리스트가 검색어에 맞춰 실시간으로 필터링 및 갱신됨`), 상세 No.2 = 화면 전환(`터치 시, 통합 검색 모드로 화면이 전환되며 시스템 키보드 호출`). 구현은 둘 다 인라인 필터. 기획 확인 필요. 화면 전환이 맞다면 `LedgerSearchScreen`(`FDR-3-PAGE-02-0`)과의 관계 정리가 필요한 구조 작업이라 고치지 않음.
15. `FDR-3-PAGE-02-0` 검색 placeholder — 목업 '내역명, 장부명을 입력해주세요.', 설명표 '검색어를 입력해주세요.', 구현 '내역명을 입력해주세요.' 셋 다 다름. 기획 확인 필요. **근거 보강(추정)**: 전체 내역 검색(`TransactionSearchScreen`, `DTB-2-PAGE-01-0`)의 placeholder가 `내역명, 장부명을 입력해주세요.`라서, 장부 내 검색 목업이 전체 검색 시안 문구를 복사했을 가능성이 있다 — **추정이며 확인된 사실이 아니다**.
16. `FDR-3-PAGE-02-0` 시안에 필터 버튼이 없으나 구현에는 있음. 제거하면 검색 결과 필터링 수단이 사라져 유지. 시안 누락인지 의도된 제외인지 기획 확인 필요.
17. `COM-1-PAGE-01-0` 설명표 No.3은 실패 시 하단 토스트(2~3초 자동 페이드아웃)라고 하나, 같은 시트 Case A/B 목업은 필드별 빨간 밑줄 + 하단 빨간 문구(인라인 에러)다. 목업을 따라 인라인 에러 유지. 기획 확인 필요.
18. **로그인 실패 문구** 시안 Case A는 '아이디가 올바르지 않습니다.', Case B는 '비밀번호가 올바르지 않습니다.'로 구분한다. 그러나 (1) 서버가 INVALID_CREDENTIALS 하나만 반환해 구분 불가, (2) 아이디 존재 여부가 드러나 계정 열거 공격에 취약. 보안상 통합 문구 유지. 기획·보안 확인 필요.
19. 설명표 No.5는 안내 텍스트 '간편 로그인'을 명시하나 목업 프레임에는 없다. 아이콘 3개만 존재. 목업을 따라 추가하지 않음. 기획 확인 필요.
20. `COM-2-PAGE-01-0` 약관동의 시안(디자인 완료)에는 '마케팅 정보 수신 동의 (선택)'이 있으나, 신규 소셜 가입 스키마(`POST /auth/social/signup`: provider/token/name/termsAgreed)에 해당 필드가 없어 소셜 가입 때는 마케팅 수신 동의가 서버에 저장되지 않는다(일반 가입은 `agreements.marketing`으로 전송). 백엔드 확인 필요.
21. `COM-3-PAGE-03-0` 설명표 No.3은 10자 초과 시 '입력 차단'이나 Case A 목업은 11자가 입력된 상태로 에러를 표시한다. 목업을 따라 에러 표시로 구현. 기획 확인 필요.
22. 시안 No.4는 '이미 사용 중인 이메일이에요.' 중복 에러를 명시하나, Auth.txt §6이 계정 열거 방지로 중복 이메일에도 동일한 204를 반환한다. 중복 확인 전용 API를 만들면 #18과 같은 열거 취약점이 생긴다. 구현하지 않음. 기획·보안 확인 필요.
23. `COM-3-PAGE-03-0` Case A의 에러 라인/문구 색이 `#FA564D`인데 팔레트 `FEEDBACK_NEGATIVE_BOLD`는 `#FB6E67`(채널당 24~26 차이). 시트 쪽 편차로 판단해 팔레트 유지. 디자인 시스템 색 정의(`FONT/Typography Style.pdf` 또는 컴포넌트 명세)에 어느 값이 있는지 확인 필요.

- **`더보기_보고서생성_기간보고서조회.png`(파일명에 `-1` 없음) 표 헤더의 Screen ID가 `ETC-4-PAGE-05-0`으로 적혀 있음 — 오기로 추정(2026-09-06, 7-G)**: 이 파일 내용(캐러셀 2장 + 장부명 태그가 붙은 통합 내역 리스트)은 `ETC-4-PAGE-05-0`(장부 하나만 보여주는 단일 카드 화면, `-1.png` 없는 `더보기_보고서생성_장부보고서조회.png`가 이 ID)과 명백히 다르고, IA 171행이 정의하는 "보고서_시간순"(캐러셀 + "조회 기간 전체 내역")과 정확히 일치한다. 파일명 자체(`-1` 유무)도 함정이다 — 기간별 조회 두 파일 중 **`-1`이 붙은 쪽이 목록(`ETC-3-PAGE-03-0`), 안 붙은 쪽이 통합 상세(`ETC-4-PAGE-07-0`)**로 시안 내용과 반대다. 코드는 IA 정의(07-0)를 기준으로 구현했다(`ReportPeriodEntriesScreen.tsx`). 물어볼 것: **표 헤더의 ID 표기를 07-0으로 정정할지, 아니면 실제로 05-0의 상태 변형을 의도한 것인지**(후자라면 07-0 화면 자체가 시안 없이 구현된 것이 됨).
- **`ETC-3-PAGE-02-1`/`03-1`/`ETC-4-PAGE-05-1`/`07-1`(보고서 조회 4화면의 "-1" 변형) — 별도 화면 아님으로 판단(2026-09-06, 7-G)**: IA 165~172행 기준 이 넷은 각각 `-0` 화면의 "수입/지출 탭이 선택된 상태" 캡처로 보여 별도 라우트를 만들지 않고 `ReportEntryList.tsx`의 탭 상태로 흡수했다(§2 각 행 [구현] 처리). 다만 `ETC-3-PAGE-02-0`(장부별 보고서 상세, 장부 카드 리스트) 자체엔 탭이 없어서 `02-1`이 정말 그 화면 얘기가 맞는지 확신이 낮다 — 물어볼 것: **`ETC-3-PAGE-02-1`이 `02-0`의 탭 상태가 맞는지, 아니면 `ETC-4-PAGE-05-0`(탭이 실제로 있는 화면)의 오기인지.**
- [해결] `ETC-2-PAGE-02-0`(모임 관리) — 2026-09-06 실제로 빠져 있던 화면이었음, `GroupManageScreen.tsx`로 구현. **미해결**: 두 "모임원 관리" 라벨이 서로 다른 엔티티(GroupMembership 권한 로스터 vs Member 납부 로스터)를 가리키는 이름 중복(`feat/member-management` 소관).
- [해결] `ETC-4-MODAL-04-0`(로그아웃) — 2026-09-06 내 프로필 하단(`MyProfileScreen.tsx`)으로 이동(8-A).
- **`ADD-3-PAGE-02-0`(사진 촬영, 디자인 '완료'인데 0장) / `ADD-4-PAGE-02-0`(사진 촬영 결과, 디자인 '검토'인데 0장) — 2026-09-06(8-C)**: 두 화면 다 시안 이미지가 없어 실제로 "인앱 카메라 프리뷰 화면"을 그리는 시안이 있는지 확인이 안 된다. 이번 라운드에서 인앱 중간 화면(`MockCameraView.tsx`)을 완전히 없애고 시스템 카메라 인텐트(`launchCamera()`)로 결정했다 — 되돌릴 이유가 없다면 이대로 가지만, 만약 프리뷰가 있는 인앱 카메라 화면이 원래 의도였다면 `react-native-vision-camera` 도입을 재검토해야 한다. **물어볼 것: 앱 내 카메라 프리뷰를 그리는 화면이 실제로 있는가, 아니면 시스템 카메라를 쓰는 것으로 봐도 되는가.** 디자인 '완료'/'검토' 상태인데 이미지가 0장인 것도 그 자체로 함께 확인 필요.
- [해결] `ETC-4-PAGE-15-0` 필드 라벨 "이름" vs "닉네임"(2026-09-12) — 설명표가 "닉네임"을 명시하고 코드(`PROFILE_EDIT_NAME_LABEL`)와 일치, 기획 질문 아님(스펙시트 목업 그림이 오기). **※ 2026-09-21 번복**: 사용자 지시로 라벨을 "이름"으로 바꿨다(사진도 가운데). 위 결론(닉네임이 맞다)은 더 이상 코드와 일치하지 않는다.
- **`Avatar` 컴포넌트 빈 상태 기본 배경색(파란 톤) — 2026-09-11 실기기 대조, 2026-09-12 재확인**:
  `ETC-3-PAGE-01-0`(모임 프로필 변경)·`ETC-4-PAGE-15-0`(프로필 변경) 둘 다 아바타가 비어 있을 때
  시안은 중립 회색(`FILL_NEUTRAL_NORMAL`/`GREY_100`)인데 실제로는 파란 톤(`Avatar` 기본값
  `FILL_SECONDARY_SUBTLER`/`BLUE_50`)이 뜬다. 원본 스펙시트(`화면명세서\더보기\설정\
  글로벌설정_내프로필_프로필변경.png`)의 UI 요소 표까지 확인했지만 "기본 상태: 디폴트 아바타
  아이콘" 문구만 있고 **배경색을 특정하는 텍스트나 색상 코드가 표에 없다** — 목업 그림의 회색이
  유일한 근거이고, 표로 새로 밝혀지는 건 없었다. `Avatar` 컴포넌트를 쓰는 다른 화면(모임원 리스트
  등)은 파란 톤이 의도된 것인지 먼저 확인 필요 — **이 두 화면만 예외적으로 `style="neutral"`을
  넘길지, `Avatar` 기본값 자체를 바꿀지(호출부 전체에 영향)** 결정해야 한다.
- [해결] 보관함 목록 진입 즉시 크래시(2026-09-12) — 실제 응답은 `createdAt`/`totalIncome`/`totalExpense`/`balance`, 상세는 평평한 모양이라 타입·서비스 정정 + 날짜 가드. **남음**: 관련 6개 행(`ETC-2-PAGE-06-0`/`ETC-3-PAGE-03-0`/`ETC-3-MODAL-03-0`/`04-0`/`ETC-4-SNACKBAR-01-0`/`02-0`)의 `[구현]` 등급은 실기기 재확인 후 사용자가 결정 → lessons.md 1-6.
- [해결] `FDR-2-MODAL-02-0` `ARCHIVE_EMPTY` 조건 확정(2026-09-12) — 모임 전체에 내역이 0건이면 발생(장부 유무 무관), 에러 문구 수정 → lessons.md §3. **물어볼 것**: 이 에러 상태의 디자인 문구가 나오면 교체(현재 자체 작성 문구).
- [해결] `ETC-3-PAGE-03-0` 빈 장부 표시(2026-09-12) — 확장형 카드/심플 리스트는 의도된 상태 변형(원본 스펙시트 표 No.3 [상태]), 코드 반영 → design-diff.md §3.
- **`FDR-2-MODAL-02-0`(폴더 전체 백업) 실행 시 서버 에러 — 2026-09-11, 2026-09-12 추가 확인**:
  다이얼로그 UI 자체는 시안과 일치하지만, "보관" 확정 시 폴더가 완전히 빈 계정(장부 0건)에서
  "일시적인 문제가 발생했어요." 일반 에러가 떴다(당시엔 `ARCHIVE_EMPTY`의 전용 문구 대신 기본
  문구가 뜬 것으로 보인다). 위 항목(2026-09-12)에서 "장부는 있으나 내역 0건"인 경우
  `ARCHIVE_EMPTY`가 전용 문구로 정상 표시됨을 확인했다 — 장부 자체가 0건인 이 케이스도 서버
  코드가 같은 `ARCHIVE_EMPTY`일 가능성이 높지만, "장부 0건"만 따로 재현 테스트는 안 해봤다
  (그룹에 장부가 아예 없는 상태를 다시 만들어야 해서 이번엔 안 함) — 재현되면 알려달라.
  ※ 검증 불가(2026-09-18 재검증): 이 항목은 "당시 서버가 낸 응답"에 대한 서술이라 코드로 대조할 대상이 없다. 코드 쪽에서 확인 가능한 부분(`ARCHIVE_EMPTY` 문구 매핑, `apiErrorMessages.ts`)은 위 2026-09-12 항목에서 이미 확인됨. "장부 0건"도 같은 코드인지는 여전히 재현 필요 — 판단 보류.
- **`DTB-2-PAGE-02-0`(상세 내역_납부관리_수입내역 변형)의 `duesExists === false` 표현 — 2026-09-11**:
  회비가 마감 후 삭제돼 `duesId`는 있어도 `duesExists`가 `false`인 경우(Entry.txt §8: "회비가
  이미 삭제되었을 수 있다") 시안엔 해당 상태의 별도 표현이 없다. 지금은 이 경우를 일반 내역과
  동일하게 보여준다(납부자 정보·CTA 없음). 물어볼 것: **회비가 삭제된 뒤에도 "한때 회비였다"는
  안내를 보여줄지, 완전히 일반 내역처럼 취급해도 되는지.**
- [해결] `DSH-1-PAGE-01-0` 미니 캘린더(2026-09-11) — 월간 캘린더 API(`getMonthlyCalendar()`)로 해결. 화면 자체가 IA상 W/F·Design 모두 '예정'이라 등급은 `[부족함]` 유지.
- **`DSH-1-PAGE-01-0`(대시보드) 잔액·최근내역·승인대기 블록 제거 — 2026-09-12 사유 정정**: 지난
  기록엔 "시안에 해당 섹션이 없어 죽은 코드로 판단해 제거"라고만 적었는데 부정확하다. 정확한
  사정: `GET /groups/{groupId}/dashboard`는 이 셋을 **명시적으로 내려준다**(`summary{totalIncome,
  totalExpense, balance}`, `approval{pendingEntryCount}`, `recentEntries[{entryId, ledgerId,
  ledgerName, type, title, amount, occurredOn, approvalStatus}]`) — 백엔드가 이 필드를 만든 데는
  기획 근거가 있었을 가능성이 높다. 제거한 이유는 "이 필드가 쓸모없어서"가 아니라 **"현재 시안
  ('예정' 상태, 확정 아님)에 이 세 데이터가 들어갈 대응 영역이 없어서 지금 단계에서는 화면에
  그릴 근거가 없다"**는 것이다 — 시안이 확정되면 재검토가 필요하다. 복원 방법: 이 블록이 마지막으로
  살아 있던(주석 처리되기 전) 커밋은 `a7a5a18`(`6de0cbf`가 그 다음 커밋에서 주석 처리, 이번 라운드
  작업은 아직 커밋 전 워킹 트리 상태라 자체 해시는 없다) — `git show a7a5a18:"src/screens/Dashboard/DashboardScreen.tsx"`
  로 그 시점 원본을 볼 수 있다. **물어볼 것(기획 확인 필요)**: 대시보드 응답의 `summary`/`approval`/
  `recentEntries`를 서버가 이미 주는데 현 시안엔 대응 영역이 없다 — 시안이 아직 미완성이라 빠진
  것인지, 아니면 이 화면에서 이 필드들을 애초에 안 쓰는 게 맞는지 확정해달라.
- ~~`ETC-4-PAGE-02-0`(이미지 선택) / `ADD-3-PAGE-01-0`(영수증 스캔) 인앱 그리드·라이브 프리뷰 도입 여부~~ **2026-09-12 §5-5로 이동** — 표가 요구사항을 명확히 말하고 있어 기획에 물을 게 없다, 도입할지는 우리 우선순위 결정이라 "도입 결정 대기" 절로 분류를 바꿨다. 아래 §5-5 참고.
- **시안 0장 재확인(2026-09-11) — `DSH-2-PAGE-05-0`(통계 및 분석) / `DTB-3-MODAL-02-0`(증빙자료 삭제)**: `scripts/design-index.json`(크롭 인덱스)에 두 ID 모두 키 자체가 없다 — `spec-sheet-map.tsv` 확장(2026-09-12) 후에도 화면명세서 130장 중 이 두 ID로 확인되는 파일은 안 나왔다, 시안 원본이 없다는 기존 판정이 맞다. 착수하지 않았다. (`ADD-3-PAGE-02-0`/`ADD-4-PAGE-02-0`도 같은 상태로 위 항목에 이미 기록돼 있다.) **`DTB-2-PAGE-03-0`(상세 내역_승인요청)은 2026-09-12에 이 목록에서 뺐다** — `spec-sheet-map.tsv`로 원본 스펙시트(`내역_상세내역조회_승인요청내역.png`)를 찾아 "시안 0장"이 오류였음을 확인했다, 위 §2 해당 행 참고(등급도 `[미구현]`→`[부족함]`으로 정정).
- **`FDR-3-SHEET-01-0`(장부 예산 입력) / `FDR-3-SHEET-02-0`(예산 설정) — 2026-09-12 질문 재구성**:
  `scripts/spec-sheet-map.tsv`로 화면명세서 130장 전체를 헤더 확인했는데 **`FDR-3-SHEET-02-0`은
  어디에도 없다** — 예산 입력 관련 시안은 `폴더_메뉴_장부예산설정_금액기입.png`·
  `폴더_장부예산설정_금액기입.png` 2장뿐이고 **둘 다 헤더가 `FDR-3-SHEET-01-0`**이다(같은 ID,
  경로만 "폴더 메뉴에서 진입" vs "장부 상세에서 진입"으로 다름). 코드(`FolderBudgetListScreen.tsx`에
  BottomSheet 하나뿐, 두 ID를 같은 시트로 매핑한 상태)는 그대로 둔다 — 이 매핑 자체가 결과적으로
  맞았을 가능성이 높아졌다. 질문을 바꾼다: ~~"두 ID가 같은 시트인지"~~ → **"`FDR-3-SHEET-02-0`은
  시안이 존재하지 않는 ID다. `billage-ia.md`에만 있는 것인지, 아니면 `01-0`으로 통합된 것인지
  확인 필요."**
- **시안 없음 — 로딩/에러/빈 목록 상태**(`ETC-2-PAGE-01-0`, `ETC-4-PAGE-01-0`, `ETC-4-SHEET-01-0`, `ETC-1-PAGE-01-0`): API 연동 1단계(Group)에서 확인. 목 데이터 시절엔 항상 즉시 채워진 상태만 존재해 화면 시안도 그 상태만 있다. 네트워크 로딩 중/실패/모임이 아예 없는 상태의 디자인이 없어 임의로 최소 형태(중앙 정렬 텍스트 + 재시도 버튼)로 통일해 구현했다 — 표준 패턴은 `api-integration-plan.md` "표준 패턴" 절 참고. 다른 12개 도메인도 같은 패턴을 쓸 예정이라, 스피너/일러스트 사용 여부를 기획팀이 정해주면 한 번에 교체 가능하다.
  ※ 검증 불가(대상 불명확, 2026-09-18 재검증): 나열된 4개 ID의 화면은 성격이 섞여 있다 — `ETC-2-PAGE-01-0`(`AllGroupsScreen`)·`ETC-1-PAGE-01-0`(`MoreScreen`)은 재시도 버튼(`ALL_GROUPS_RETRY_LABEL`/`MORE_RETRY_LABEL`)이 실제로 있어 서술과 일치하지만, `ETC-4-PAGE-01-0`(`GroupCreateScreen`, 생성 폼)과 `ETC-4-SHEET-01-0`(`JoinGroupSheet`, 입력 시트)은 목록/로딩 상태 자체가 없는 폼이라 "중앙 정렬 텍스트+재시도 버튼" 서술이 무엇을 가리키는지 특정할 수 없다. 4개 중 2개만 확인 — 나머지 2개는 판단 보류.
- **`ADD-2-SHEET-07-0`(일자 선택 캘린더)**: 디자인 원본 파일이 더미 데이터다(요일 헤더 7칸 전부 "일", 날짜 셀 전부 "0"). 물어볼 것: **이 화면의 정상 디자인 원본 파일을 다시 받을 수 있는가** — 지금 파일로는 요일 헤더 구성이나 날짜 그리드 스타일을 대조할 수 없다.
- **`ADD-4-SNACKBAR-01-0`(이미지 첨부 제한)**: 디자인 이미지 헤더 문구가 "4 선택"인데 실제 체크된 사진은 9~10장으로 안 맞는다(실제 구현은 숫자가 정확히 일치해 정상). 물어볼 것: **디자인 쪽 "4 선택" 표기가 목업 작성 시 오기인지, 아니면 다른 상태(4장만 선택된 상태)를 의도적으로 보여준 것인지** — 오기라면 원본만 정정하면 되고 실제 구현은 손댈 필요 없다.
  ※ 정정(2026-09-18 재검증): **사실과 다름(낡은 서술)** — "실제 구현은 숫자가 정확히 일치"라는 문장이 가리키던 인앱 사진 그리드 화면은 2026-09-11 이후 존재하지 않는다. `ReceiptGalleryPickerScreen.tsx:1-10`(주석)·`:26`에 적힌 대로 지금은 그리드를 그리지 않고 마운트 즉시 시스템 포토 피커(`launchImageLibrary`)를 띄우는 다리 역할뿐이라 "N 선택" 헤더 자체가 없다. 남은 개수 제한은 `TRANSACTION_REGISTER_RECEIPT_MAX = 10`(`transactionScreenText.ts:43`)과 `remainingSlots`(`TransactionRegisterScreen.tsx:588`)로만 걸린다. "시안 4 선택 오기 여부" 질문은 유효하나, 대조할 우리 쪽 화면이 없다.
- **`DTB-3-MODAL-01-0`(상세 내역_삭제) / `DTB-3-PAGE-01-0`(증빙자료 상세)**: 디자인 이미지를 열어보면 삭제 확인 다이얼로그가 아니라 "상세 내역" 타이틀에 본문이 빈 화면 + "등록하기" 버튼만 있다(두 ID의 크롭 파일이 완전히 동일한 내용). **2026-09-12 재확인**: 이건 "다른 화면 크롭이 잘못 파일링된 것"이 아니라 **디자인 원본 자체가 빈 프레임(본문 레이어가 아예 없음)** 으로 보인다 — 원본 스펙시트(`화면명세서\`)에서 이 두 ID에 해당하는 UI 요소 표를 찾아봤지만 못 찾았다(내역/DTB 관련 스펙시트 중 "상세 내역_삭제" 확인 모달이나 "증빙자료 상세" 전용 표가 안 보인다 — 둘 다 부모 화면인 `내역_상세내역조회.png`/`내역_상세내역조회_삭제.png` 표 안에 하위 UI 요소로만 언급됐을 가능성). 크롭도 스펙시트도 이 두 ID의 진짜 내용을 확인할 방법이 없어 물어볼 것 그대로 둔다: **이 파일이 정말 두 ID의 시안이 맞는지, 아니면 원본 자체가 깨진 내보내기인지, 원본을 다시 받을 수 있는지.**
- **`ADD-4-PAGE-01-0`(영수증 스캔 성공)**: 실제 구현은 스캔 성공 즉시 금액 필드가 자동으로 채워지는데(예: "232,000원"), 디자인 이미지는 이 시점에서도 금액이 placeholder("금액을 입력해주세요")로 비어 있다. 물어볼 것: **스캔 직후 금액을 즉시 자동 반영하는 게 의도인지, 아니면 사용자가 한 번 더 확인/승인하는 별도 단계가 있어야 하는지** — 현재 구현(즉시 반영)이 기획 의도와 다르면 `TransactionRegisterScreen.tsx`의 스캔 성공 핸들러를 고쳐야 한다.
  ※ 정정(2026-09-18 재검증): **부분적으로 사실과 다름** — "스캔 성공 즉시 금액이 자동으로 채워진다"는 서술은 충돌이 없을 때만 맞다. `TransactionRegisterScreen.tsx:540-554`(`handleScanComplete`)는 이미 입력된 금액이 0이 아니고 스캔값과 다르거나(`amountConflict`) 날짜가 오늘도 스캔값도 아니면(`dateConflict`) 즉시 반영하지 않고 `scanApply` 확인 다이얼로그(`:543-547`, `@screen ADD-5-MODAL-01-0`)를 띄워 `handleApplyScanResult`/`handleDiscardScanResult`(`:556-570`)로 사용자가 반영/취소를 고르게 한다. 충돌이 없을 때만(`:550-553`) 즉시 `setAmount`. 질문("별도 확인 단계가 있어야 하나")의 전제가 반쯤 이미 구현돼 있다 — 기획 확인 시 이 조건부 구조를 같이 전달할 것.
- [해결] `DUE-2-PAGE-01-0` "기간" 필드(2026-09-04) — 서버가 `startDate`를 필수로 강제함을 실호출로 확정, 기획 확인 불필요(`docs/api-gaps.md` "확정됨").
- **`납부관리_회비상세_수정_기간선택.png`(회비 수정의 기간 선택 시트) — Screen ID `DTB-3-SHEET-02-0`로 표기됨, 오기 확인됨(2026-09-05 최초 발견 "추정" → 2026-09-12 헤더 직접 확인으로 확정, `scripts/spec-sheet-map.tsv` 13행)**: IA상 `DTB-3-SHEET-02-0`은 "장부 복수 선택"(`TransactionLedgerMultiSelectSheet.tsx`, 위 §2 행 참고)이라 이 회비 수정 기간 선택 시트와 전혀 다른 화면이다. 같은 명세서 안에서 회비 **생성**의 기간 선택(`납부관리_메인_새회비생성_기간선택.png`)은 `DTB-3-SHEET-01-0`(기간 선택 캘린더)로 올바르게 붙어 있어 — 수정 쪽 파일만 복사하며 01을 02로 잘못 고친 것으로 보인다. 코드는 생성과 동일하게 `DuesDateRangeSheet`(기존 컴포넌트 재사용, `DTB-3-SHEET-01-0`과 같은 기능)로 구현했다 — **코드는 그대로 둔다.** 물어볼 것: **회비 수정의 기간 선택 시트도 `DTB-3-SHEET-01-0`(생성과 동일 ID)로 통일할지, 아니면 정말 별도 ID를 새로 배정할지** — 후자라면 `DTB-3-SHEET-02-0`(장부 복수 선택)과 겹치니 새 번호가 필요하다.
- **`DUE-4-MODAL-01-0`(모임원 삭제) 안내 문구가 삭제 범위를 오해하게 만들 수 있음(2026-09-05, 7-C)**: 시안 문구는 "기존 납부 내역은 그대로 유지돼요."인데, 이는 Member.txt §8 정책 메모("이미 마감된 회비로 생성된 **장부 수입 내역**은 지우지 않는다")에 한정된 이야기다. 실제로는 삭제 시 그 모임원의 **진행 중인 회비 참여 데이터가 Hard Delete**된다(§5·§8 본문). 문구만 보면 "삭제해도 납부 기록이 안전하다"로 읽혀 실제 동작과 반대 인상을 줄 수 있다. 물어볼 것: **이 문구를 의도적으로 단순화한 것인지, 아니면 진행 중인 회비 데이터도 함께 삭제된다는 경고를 추가해야 하는지** — 프론트는 일단 시안 문구를 그대로 구현했다(`MemberDetailScreen.tsx`/`MemberManageScreen.tsx`).
- **`DUE-4-PAGE-04-0`(개인 납부 내역)의 필터/검색 툴바, `DUE-5-PAGE-02-0`(같은 화면의 검색)(2026-09-05, 7-C)**: 시안은 장부 상세와 "완전히 동일하게 동작"하는 필터/검색 UI가 있다고 적었지만, 실제 API(`GET .../members/{memberId}/payments`)는 `from`/`to` 기간 파라미터만 받고 `keyword`나 장부 필터는 받지 않는다(2026-09-05 실호출로 확인). 물어볼 것: **이 화면에 기간 필터 UI가 실제로 필요한지, 필요하다면 키워드·장부 필터도 서버에 추가해야 하는지** — 현재는 필터/검색 UI 자체를 만들지 않고 전체 목록만 보여준다.
- **`ETC-2-PAGE-05-0`(증빙자료 앨범) 그리드 썸네일이 원본 이미지 그대로임(2026-09-05, 7-C 후속)**: `GET .../receipts` 응답엔 축소본 URL이 따로 없다 — File.txt "이미지 압축은 하지 않습니다" 정책대로 업로드 시점에 리사이즈를 안 해서다. 그리드 한 화면에 최대 20장(페이지당)씩 원본 화질 이미지를 그대로 내려받아 렌더링하므로, 증빙 사진이 고화질일수록(특히 카메라 직촬영) 스크롤 시 느려지거나 데이터를 많이 쓸 수 있다. 물어볼 것: **업로드 시점에 썸네일용 축소본을 별도로 생성해 `receipts` 응답에 같이 내려줄 수 있는지** — 서버 작업이 필요해 기획보다는 백엔드 판단이 먼저 필요한 항목이라 `docs/backend-requests.md`에도 남겼다.
- **`ETC-5-SNACKBAR-05-0`(모임 전환 완료) — 시안 이미지 0장(2026-09-06, 7-H), 2026-09-12 재확인**: `billage-ia.md`엔 있으나 디자인 원본이 아예 없다. 원본 스펙시트(`화면명세서\더보기\메인\더보기_모임전환_전체모임관리.png`, `ETC-2-PAGE-01-0` "전체 모임 관리")의 UI 요소 표까지 확인했는데, 카드 탭 [액션]에 "데이터 스위칭... 화면 이동: ... 해당 모임의 '대시보드 메인' 화면으로 즉시 복귀"만 있고 **완료 스낵바 자체가 표에 언급이 없다** — `ETC-3-PAGE-03-0`/`ETC-5-SNACKBAR-06-0`처럼 다른 화면 표 안에 숨어 있는 경우가 아니라 정말로 이 전환 흐름엔 스낵바 디자인이 아예 배정되지 않은 것으로 보인다. 다른 완료 스낵바("'{이름}' 모임을 삭제했어요." 등)의 프리픽스+서픽스 패턴을 따라 "'{모임명}' 모임으로 전환했어요."로 임의 구현했다(`MoreScreen.tsx`, `GroupSwitcherMenu.onSelectGroup`). 물어볼 것: **이 문구/디자인이 실제 기획 의도와 맞는지** — 원본이 생기면 교체.
- **알림·고객지원(Notification & Support) 도메인 자체가 범위 미확정(2026-09-06, 배치 B)**: `Notification & Support (알림·고객지원).txt` 첫 줄부터 "범위 판단이 먼저 필요합니다" — `docs/infra.md`는 푸시 서버를 런칭 범위 밖으로 뒀는데 이 화면들(알림 목록·알림 설정)은 전부 푸시 전제다. 물어볼 것: **알림 도메인(푸시 포함)을 런칭 범위에 넣을지** — 빠지면 `NotificationSettingsScreen`/`NotificationScreen` 자체가 필요 없어진다.
- **공지사항·FAQ·약관을 백오피스 없이 어떻게 채울지(2026-09-06, 배치 B)**: 명세가 "공지사항/FAQ/약관 등록은 백오피스에서 한다"고 전제하는데 백오피스가 없다. 명세 자체가 제안한 대안(약관·공지는 정적 파일, 문의하기는 메일 링크)을 채택할지 기획 확인 필요 — 채택 시 `supportService.ts`의 `getNotices`/`getFaqs`/`getTermsText`를 서버 호출 대신 정적 리소스로 바꿔야 한다.
- **알림 설정 화면의 "일반/총무 2종"이 사용자 단위 API와 안 맞음(2026-09-06, `ETC-3-PAGE-08-0`)**: 위 §2 해당 행 참고 — 토글은 모임과 무관한 사용자 단위 설정인데 화면은 모임별 권한(총무/일반)으로 나뉜다. 지금은 "현재 보고 있는 모임"(`getActiveGroup()?.myRole`) 기준으로 임시 판정했다. 물어볼 것: **여러 모임에 걸쳐 총무/일반이 섞인 사용자에게 어느 기준으로 보여줄지**(예: "하나라도 총무면 총무 화면" 등 전역 규칙이 필요한지).
- **문의하기(`ETC-3-PAGE-10-0`) 디자인 미확정 + 명세와 화면 불일치(2026-09-06)**: 디자인 현황이 '진행' 중이라 시안엔 문의 작성 폼이 아예 없고 FAQ + 읽기 전용 메일 표시만 있다. 그런데 API 명세엔 `POST /inquiries`(email/title/content 폼 제출)가 정의돼 있다. 물어볼 것: **최종 디자인에 입력 폼이 추가될 예정인지, 아니면 문의는 정말 메일로만 받을지** — 폼이 생기면 `supportService.submitInquiry`를 그대로 연결하면 된다.
- **약관 목록(`ETC-3-PAGE-11-0`) 시안의 Screen ID 칸이 비어 있음(2026-09-06)**: `글로벌설정_고객및지원정보_이용약관.png` 표 헤더의 Screen ID가 "스크린아이디" 플레이스홀더 그대로였다(다른 4개 시안은 정상 기입돼 있었음). 배치 지시서가 준 매핑(`ETC-3-PAGE-11-0`)을 그대로 썼다 — 물어볼 것: **이 ID가 맞는지, 혹은 다른 화면과 충돌하는 실제 ID가 따로 있는지.**
- **공지사항 상세(`ETC-4-PAGE-18-0`) 본문 자동 하이퍼링크 미구현(2026-09-06)**: 시안은 본문 내 URL/이메일을 터치 가능한 링크로 활성화하라고 하지만, RN 기본 `Text`는 Android에서 부분 텍스트만 자동 링크화하는 표준 수단이 없다(iOS `dataDetectorType`만 존재하고 Android 대응 prop이 없음). 이번 배치에서 새 라이브러리(예: 정규식 파싱 후 `Linking.openURL` 수동 연결, 또는 서드파티 링크 파서)를 들이지 않고 평문으로 뒀다 — 실제로 필요해지면 별도 작업으로 붙여야 한다.
- **D-2에서 "상태 불명"으로 남은 16개** (`DTB-2-SHEET-01-0`, `DTB-3-SHEET-01-0`, `DTB-2-PAGE-02-0`, `DTB-3-MODAL-01-0`[위 항목과 동일], `FDR-2-SHEET-01-0`, `FDR-2-PAGE-02-0`, `FDR-4-SNACKBAR-03-0`, `FDR-4-SNACKBAR-02-0`, `ETC-3-MODAL-01-0`, `ETC-3-MODAL-01-1`, `ADD-1-PAGE-01-0`, `ADD-2-SHEET-07-0`[위 항목과 동일], `ADD-2-SHEET-01-0`, `ADD-2-SHEET-02-0`, `ADD-2-SHEET-03-0`, `ADD-2-SHEET-04-0`): 같은 Screen ID에 디자인 후보 이미지가 2~9장씩 걸려 있는데(대부분 서로 다른 폴더에 중복 배치돼 있어) 어느 게 이 ID의 "진짜" 대표 이미지인지, 혹은 정말 여러 상태(빈 값/입력중/에러 등) 변형인지 사전에 못 정했다. 물어볼 것: **각 Screen ID의 디자인 후보 파일들이 상태 변형인지 단순 중복 배치인지, 상태 변형이라면 어느 파일이 화면의 "기본" 상태를 대표하는지** — `scripts/design-index.json`의 해당 항목에서 후보 경로 전부 확인 가능.

### 5-5. 도입 결정 대기 (기획 확인 아님 — 우리 우선순위 결정)

§5-4는 "기획팀 확인 필요"인데, 아래 둘은 성격이 다르다 — **시안 UI 요소 표가 요구사항을
명확히 말하고 있어 기획에 물을 게 없다.** 필요한 네이티브 모듈을 도입할지는 일정·리소스
문제라 우리(프론트) 우선순위 결정 사안이다. §5-4에 두면 "기획 답변 대기" 상태로 영원히
안 풀리므로 이 절로 분리했다(2026-09-12).

- **`ADD-3-PAGE-01-0`(영수증 스캔) — 라이브 카메라 프리뷰**
  - **시안이 요구하는 것**(`화면명세서\FAB_내역추가\내역_내역추가_증빙자료_영수증스캔.png`
    UI 요소 2번): [기능] "기기 카메라를 활성화하여 영수증을 비추고 캡처하는 영역", [상태]
    "카메라 뷰포트 위에 오버레이(Overlay) 형태로 상시 노출", "하단 중앙에 원형 촬영(Shutter)
    버튼, 좌측 하단에 갤러리 진입 아이콘 노출".
  - **현재 구현**: 시스템 카메라 인텐트(`launchCamera()`, `react-native-image-picker`) —
    OS 카메라 앱을 열고 결과 사진만 돌려받는다. 인앱 라이브 뷰파인더·상시 오버레이 셔터는
    없다(`screens/Transactions/TransactionRegisterScreen.tsx`).
  - **필요한 것**: `react-native-vision-camera`(또는 동급 카메라 프리뷰 라이브러리) 도입 —
    네이티브 모듈 추가, 권한 처리, 프리뷰 화면 신규 제작(`MockCameraView.tsx`가 예전에
    이 역할이었으나 삭제됨). 작업 범위는 화면 하나(카메라 프리뷰 + 셔터) 정도로, 이미 있던
    `CameraCaptureView.tsx` 구조를 되살리는 수준.
  - **막는 것**: OCR API(`POST /files/{fileId}/ocr`)가 서버에 아직 없다(`시작 전`) — 실제
    인식 대상이 없는 상태에서 프리뷰만 먼저 만들 실익이 낮아 이번 라운드엔 보류했다. OCR이
    열리는 시점에 같이 재검토하는 게 합리적.

- **`ETC-4-PAGE-02-0`(이미지 선택) / `ADD-4-SNACKBAR-01-0`(이미지 첨부 제한) — 인앱 사진 그리드**
  - **시안이 요구하는 것**(`화면명세서\더보기\설정\글로벌설정_내프로필_프로필변경_앨범선택.png`
    UI 요소 2번, 관련 화면): [기능] "기기 내 저장된 사진 목록을 불러와 한 장의 사진을 선택하는
    영역", [상태] "기기 로컬 사진들을 최신순으로 정렬한 그리드 뷰 노출". 크롭 목업(카메라 타일 +
    실제 최근 사진 12장, 3열 그리드, 다중 선택 체크)도 동일하게 요구.
  - **현재 구현**: 시스템 포토 피커(`launchImageLibrary`, `react-native-image-picker`) —
    OS의 갤러리 앱/피커 UI를 그대로 띄운다. 인앱 3열 그리드, 카메라 타일과의 통합 UI는 없다
    (`ReceiptGalleryPickerScreen.tsx`, `GroupImagePickerScreen.tsx`).
  - **필요한 것**: `@react-native-camera-roll/camera-roll`(또는 동급) 도입 — 기기 로컬
    사진 목록을 직접 가져와 3열 그리드로 그리는 화면 신규 제작, 다중 선택 상태 관리,
    "완료" 버튼 활성화 로직(0장 비활성/1장 이상 활성). 이미지 압축 등 서버 정책은 변경 불필요.
  - **막는 것**: 없음(순수 신규 UI 작업) — OCR처럼 서버 의존이 없어 원하면 바로 시작 가능한
    항목이다. 다만 두 곳(모임 이미지/프로필 이미지)에서 공유하는 컴포넌트로 만들지 판단 필요.

- **`ETC-7-PAGE-01-0`(사진 편집) — 프로필/모임 사진 크롭 UI** (2026-09-12, §5-2에 IA-누락 ID로도 기록)
  - **시안이 요구하는 것**(`화면명세서\더보기\설정\글로벌설정_내프로필_프로필변경_사진촬영-1.png`
    /`-2.png`, 페이지 경로 "...프로필 변경 > 사진 변경 > 사진 촬영하기 > 사진 편집하기"): 촬영/
    갤러리 선택 직후 원형 크롭 가이드를 오버레이하고, [액션] "드래그: 이미지를 상하좌우로 패닝",
    "핀치 줌: 두 손가락으로 확대/축소"로 노출 영역·크기를 조절한 뒤 [액션] "우측(선택): 원형
    가이드라인 영역에 맞춰 이미지를 크롭하여 프로필 사진으로 최종 서버 저장".
  - **현재 구현**: 크롭 단계 없음 — `ProfileEditScreen.tsx`/`GroupProfileEditScreen.tsx` 둘 다
    촬영·갤러리 선택 결과를 그대로 `fileService.uploadFile()`로 업로드한다.
  - **필요한 것**: 이미지 크롭 라이브러리(예: `react-native-image-crop-picker`— 카메라/갤러리
    선택과 크롭 UI를 한 번에 제공, 또는 `react-native-image-editor` + 커스텀 제스처 UI) 도입.
    작업 범위는 화면 하나(원형 크롭 오버레이 + 확인 버튼) + 두 호출부(프로필/모임 이미지) 연결.
  - **기획 확인 필요 여부**: 이건 순수 UI 갭이 아니라 **IA에 아예 없는 신규 화면**이라
    "만들어도 되는지" 자체는 기획 확인이 맞다 — depth 7까지 내려가는 화면을 실제로 런칭
    범위에 넣을지부터 결정 필요. 확인되면 위 라이브러리 도입은 우리 우선순위 결정.

- **`ETC-4-MODAL-05-0`(코드로 참여) vs IA `ETC-4-SHEET-01-0`(모임 참여) — 2026-09-12 헤더 확인**:
  `화면명세서\더보기\메인\전체모임관리_모임추가_코드로참여하기.png`의 Screen ID 셀은
  `ETC-4-MODAL-05-0`인데, `billage-ia.md`는 같은 기능(초대 코드 입력)을 `ETC-4-SHEET-01-0`
  "모임 참여"로 정의한다 — 포맷도 다르다(시안은 Modal, IA는 Sheet). 코드(`JoinGroupSheet.tsx`)는
  건드리지 않았다. 물어볼 것: **어느 ID·포맷이 맞는지, 시안이 최신이라면 IA를 정정할지.**
- **`ETC-3-SHEET-03-0`(모임 관리자 프로필) 총무/일반 미분리 — 2026-09-12 헤더 확인**: `billage-ia.md`는
  모임 관리자 프로필을 권한별로 `ETC-3-SHEET-03-0`(총무)/`ETC-3-SHEET-04-0`(일반) 2개 ID로
  나누는데, 실제 시안 파일은 `더보기_모임관리자_모임관리자_내프로필.png`·
  `더보기_모임관리자_모임관리자프로필.png` 2장 모두 헤더가 `ETC-3-SHEET-03-0` 하나뿐이다 —
  `04-0` 시안 자체가 안 보인다(권한별로 분리된 디자인이 없을 수 있음). 코드는 건드리지 않았다.
  물어볼 것: **권한별로 실제 화면이 다른지(다르다면 04-0 시안을 받아야 함), 아니면 한 화면을
  공유하고 IA의 2-ID 분리가 낡은 것인지.**

- **Screen ID 칸이 비어 있는 시안 5장 — 2026-09-12, ID 부여 요청**: `scripts/spec-sheet-map.tsv`로
  130장을 헤더 확인하는 과정에서 Screen ID 셀 자체가 비어 있는(플레이스홀더 그대로거나 `--`)
  파일이 5장 나왔다 — 페이지명·경로·인접 화면으로 후보는 추릴 수 있지만 표에 직접 적힌 근거가
  없어 확정하지 않았다. **이 5장에 Screen ID를 부여해달라. 후보는 각각:**
  1. `내역_상세내역조회_납부관리수입내역.png`(Screen ID 셀 `--`, 작성일 2026.07.30, 페이지명
     "상세 내역_납부관리_수입내역") — 후보 **`DTB-2-PAGE-02-0`의 변형**. 근거: 페이지 경로가
     "내역 > 상세 내역"으로 기본 상세 내역과 동일하고, UI 구성(금액+상세정보 리스트)도 거의 같으며
     회비 마감 시 생성된 수입 내역 전용 필드(납부자 명수·명단·"회비 상세보기" CTA)만 추가된
     형태다 — 실제로 이 판단으로 이미 `TransactionDetailScreen.tsx`에 구현해뒀다(`entry.duesExists`
     분기, 위 §2 `DTB-2-PAGE-02-0` 행 참고).
  2. `내역_상세내역조회_승인요청내역.png`(Screen ID 셀 `--`, 작성일 2026.07.30, 페이지명
     "상세 내역_승인 요청 내역") — 후보 **`DTB-2-PAGE-03-0`**. 근거: 페이지 경로 "내역 > 상세
     내역 > 승인 요청 내역"이 IA의 `DTB-2-PAGE-03-0`(상세 내역_승인요청) 이름과 정확히 일치한다
     (위 §2 해당 행 참고, 이미 이 판단으로 등급을 `[미구현]`→`[부족함]`으로 정정했다).
  3. `글로벌설정_고객및지원정보_이용약관.png`(Screen ID 셀 "스크린아이디" 플레이스홀더, 페이지명
     "이용 약관") — 후보 **`ETC-3-PAGE-11-0`**. 근거: 배치 지시서가 이 매핑을 지정했었고 다른
     후보 ID와 충돌이 없다(위 §2 해당 행 참고).
  4. `글로벌설정_내프로필_프로필변경_사진촬영.png`(Screen ID 셀 플레이스홀더, 페이지명 "사진
     변경_사진 촬영") — 후보 없음(같은 폴더의 "-1"/"-2" 파일은 `ETC-7-PAGE-01-0`으로 확인됐지만
     이 파일은 그 이전 단계인 "사진 촬영" 자체로 보여 별개 ID일 가능성이 있다) — **미확인 상태로
     둔다, 헤더가 없어 후보를 추정할 근거가 부족하다.**
  5. `글로벌설정_내프로필_프로필변경_앨범선택.png`(Screen ID 셀 플레이스홀더, 페이지명 "사진
     변경_앨범 선택") — 후보 **`ETC-4-PAGE-02-0`**. 근거: 페이지 경로 "...프로필 변경 > 사진
     변경 > 앨범에서 선택하기"가 이미지 선택 플로우의 갤러리 단계와 일치하고, UI 요소 표(로컬
     사진 그리드 뷰)도 `ETC-4-PAGE-02-0`의 요구사항(§5-5)과 정확히 부합한다.

**§5-4에는 정말 기획에 물어야 답이 나오는 것만 남는다** — Avatar 빈 상태 배경색(시안에
색상 코드 자체가 없음), `ETC-5-SNACKBAR-05-0`(관련 스펙시트에도 스낵바 언급이 아예 없음),
`DTB-3-PAGE-01-0`/`DTB-3-MODAL-01-0`(스펙시트를 못 찾음, 원본이 깨진 것으로 보임) 등.

### 5-6. `spec-sheet-map.tsv` 적용 후에도 specSheet 없는 ID — 53개 (등급 불변, 목록만)

`scripts/design-index.json`의 184개 ID 중 131개가 `spec-sheet-map.tsv`로 specSheet를 얻었고,
**53개는 여전히 없다**(2026-09-12 3건 재분류로 56→53, 아래 A' 참고). 아래는 그 목록을 §2
등급별로 분류한 것이다 — **등급은 하나도 바꾸지 않았다**, 대조 가능 여부만 표시한다.

#### A. `[구현]`인데 specSheet 없음 — 19개, 픽셀 대조 불가

캡처해도 비교할 원본 스펙시트가 없다 — `scripts/shot-targets.tsv`에 `[대조 상대 없음]` 표시를
붙였다(행 삭제는 안 함, 캡처 자체는 유효하고 회귀 확인용으로 남겨둘 가치가 있다).

| Screen ID | 화면명 |
|---|---|
| `ADD-2-SNACKBAR-01-0` | 내역 추가 완료 |
| `COM-3-PAGE-01-0` | 약관 상세 |
| `COM-3-PAGE-04-0` | 비밀번호 재설정_완료 |
| `DTB-3-PAGE-01-0` | 증빙자료 상세 |
| `DUE-3-SNACKBAR-01-0` | 입금 확인 |
| `DUE-3-SNACKBAR-02-0` | 입금 취소 |
| `DUE-4-SNACKBAR-01-0` | 회비 생성 완료 |
| `DUE-5-SNACKBAR-01-0` | 모임원 추가_일괄 완료 |
| `ETC-3-PAGE-02-1` | 장부별 보고서 상세(수입/지출) |
| `ETC-3-PAGE-03-1` | 기간별 보고서 상세(수입/지출) |
| `ETC-3-SHEET-06-0` | 증빙자료 필터링 |
| `ETC-4-PAGE-05-1` | 보고서_장부 상세(수입/지출) |
| `ETC-4-PAGE-07-1` | 보고서_시간순(수입/지출) |
| `ETC-4-SNACKBAR-02-0` | 기록 제목 변경 완료 |
| `ETC-5-MODAL-01-0` | 보고서_이탈방지 |
| `ETC-5-SNACKBAR-04-0` | 모임 생성 완료 |
| `ETC-5-SNACKBAR-07-0` | 비밀번호 변경 완료 |
| `ETC-5-SNACKBAR-08-0` | 보고서_생성완료 |
| `FDR-4-SNACKBAR-03-0` | 이름 변경_완료 |

참고: `DTB-3-PAGE-01-0`은 §5-4에 이미 "스펙시트를 못 찾음"으로 기록돼 있다 — 이번 목록화
과정에서 `내역_상세내역조회_승인요청내역.png`(현재 `(ID없음)`으로만 등록된 파일) 하단에
이 ID를 가리키는 Case 섹션이 있는 걸 발견했는데, 그 안 이미지 자체가 빈 체커보드
placeholder라 실질적인 대조 자료는 못 된다 — `spec-sheet-map.tsv`엔 추가하지 않았다
(내용 없는 매핑은 있으나 마나라 판단), §5-4 항목에 이 사실만 덧붙인다.

#### A'. 2026-09-12 재분류 — "대조 상대 없음" → "ID 확정 후 대조 가능" (3건)

아래 3개는 처음엔 스펙시트가 아예 없다고 판단해 위 A 목록에 넣었는데, 다시 보니 **스펙시트
자체는 있고 그 안에 다른 ID가 적혀 있는 것**이었다 — "대조 상대 없음"이 아니라 "이 파일이
맞는 시안인지 ID 확인이 먼저 필요"한 경우로, §5-4의 기존 ID 불일치 항목과 정확히 같은
사안이다. `spec-sheet-map.tsv`에 **잠정 매핑**으로 추가했다(`확인방법=추정-기획확인대기`,
헤더확인 항목과 구분). `shot-targets.tsv`도 `[대조 상대 없음]` → `[ID 확정 후 대조 가능 —
§5-4]`로 갱신 — 기획 답변이 오면 바로 캡처 대상이 된다.

| Screen ID | 실제 시안 | 근거 | §5-4 상호 참조 |
|---|---|---|---|
| `ETC-3-PAGE-11-0` | `더보기\설정\글로벌설정_고객및지원정보_이용약관.png` | ID 칸이 "스크린아이디" 플레이스홀더, 페이지명 "이용 약관" | 아래 §5-4 "약관 목록(`ETC-3-PAGE-11-0`) 시안의 Screen ID 칸이 비어 있음" 항목과 동일 건 |
| `ETC-3-SHEET-04-0` | `더보기\모임관리자\더보기_모임관리자_모임관리자프로필.png` | 2장 모두 `ETC-3-SHEET-03-0`으로 표기됨(04-0 시안 자체가 안 보임) | 아래 §5-4 "`ETC-3-SHEET-03-0`(모임 관리자 프로필) 총무/일반 미분리" 항목과 동일 건 |
| `ETC-4-SHEET-01-0` | `더보기\메인\전체모임관리_모임추가_코드로참여하기.png` | 헤더는 `ETC-4-MODAL-05-0`로 표기(IA만 `ETC-4-SHEET-01-0`) | 아래 §5-4 "`ETC-4-MODAL-05-0`(코드로 참여) vs IA `ETC-4-SHEET-01-0`" 항목과 동일 건 |

#### B. `[부족함]`/`[미구현]`/`[확인필요]`인데 specSheet 없음 — §5-4 반영 여부 확인

**2026-09-12 정정**: 처음 이 표를 만들 때 `[부족함]` 4건을 통째로 빠뜨렸다(등급별 집계에는
넣었으면서 표에는 안 옮겼다) — 뒤늦게 표와 집계 숫자를 대조하다 발견해 채운다.

| Screen ID | 화면명 | 등급 | §5-4/§5-5에 이미 있음? |
|---|---|---|---|
| `ADD-2-MODAL-01-0` | 이탈 방지 모달 | `[부족함]` | **아니오** — §5-4에 없음(사유 자체는 §2 행에 있음: `BackHandler` 미등록, 단 이후 라운드에 실제로 고쳐져 있어 이 §2 행 설명이 낡았을 수 있다 — 재확인 필요) |
| `ADD-4-SNACKBAR-01-0` | 이미지 첨부 제한 | `[부족함]` | 예 — §5-5(도입 결정 대기)에서 `ETC-4-PAGE-02-0`과 같이 다룸(인앱 그리드 부재) |
| `ETC-4-PAGE-02-0` | 이미지 선택 | `[부족함]` | 예 — §5-5(도입 결정 대기)에 항목 있음 |
| `ETC-5-PAGE-02-0` | 보고서_내역 상세 (보관함_내역 상세 공유 ID) | `[부족함]` | 예 — §2 해당 행 + `docs/backend-requests.md` 1순위(스냅샷에 영수증·메모 없음)에서 이미 다룸, §5-4 신규 질문은 아님 |
| `ADD-4-PAGE-01-0` | 영수증 스캔 성공 | `[확인필요]` | 예 (금액 자동반영 타이밍) |
| `DUE-5-PAGE-02-0` | 개인 납부 내역_검색 | `[미구현]` | 예 (서버 keyword 미지원) |
| `FDR-3-SHEET-02-0` | 예산 설정 | `[확인필요]` | 예 (이번 라운드에 재작성, 시안 자체가 없는 ID로 확정) |
| `FDR-2-MODAL-01-0` | 새 폴더 생성 | `[확인필요]` | **아니오** — §5-4에 없음, 새로 확인 필요 |
| `DUE-3-MODAL-03-0` | (IA 목록에 없음) | `[확인필요]` | **아니오** — §5-1/5-3 목록에만 있음 |
| `DUE-3-PAGE-02-1` | (IA 목록에 없음) | `[확인필요]` | **아니오** — §5-1/5-3 목록에만 있음 |
| `DUE-4-MODAL-03-0` | (IA 목록에 없음) | `[확인필요]` | **아니오** — §5-1/5-3 목록에만 있음 |

`§5-4/§5-5에 없음`으로 표시된 건(`ADD-2-MODAL-01-0`·`FDR-2-MODAL-01-0`·IA 목록에 없는 3개) —
다음 라운드에 시안 유무부터 확인해 §5-4에 올릴지 판단할 것.

#### C. 부속 ID(스낵바·모달)로 보이는데 확인한 범위 내에선 부모 시안에도 없음 — 23개

전부 `billage-ia.md`엔 없고 크롭 이미지는 있는(§5-2 "이미지는 있는데 IA에 없는 ID" 목록과
동일 집합) ID다. **"어디에도 없다"는 확정이 아니다** — 이번 라운드는 비고에 `(+ID)` 표기가
있던 20개 부모 파일만 재확인했고, 130장 전체를 이 23개 기준으로 다시 훑진 않았다. 스낵바/모달
포맷(`-SNACKBAR-`/`-MODAL-`) ID는 정의상 어딘가의 부모 시안 안에 있어야 정상이라, 아직 못
찾은 것뿐일 가능성이 있다.

`COM-1-SNACKBAR-01-0` `COM-3-PAGE-01-1` `COM-3-PAGE-01-2` `DTB-2-PAGE-04-0` `ETC-3-SHEET-07-0`
`ETC-4-SHEET-02-1` `FDR-1-PAGE-01-1` `FDR-2-MODAL-01-1` `FDR-2-MODAL-02-1` `FDR-2-MODAL-03-0`
`FDR-2-MODAL-03-1` `FDR-2-PAGE-02-1` `FDR-3-MODAL-01-1` `FDR-3-PAGE-02-1` `FDR-3-PAGE-02-3`
`FDR-3-PAGE-04-0` `FDR-3-PAGE-05-0` `FDR-3-SHEET-01-1` `FDR-4-PAGE-03-0` `FDR-4-PAGE-03-1`
`FDR-4-PAGE-03-2` `FDR-4-PAGE-03-3` `FDR-4-SNACKBAR-04-0`

기획에 물을 것: **이 23개 ID는 어느 시안 파일에도 안 보인다(현재까지 확인한 범위 내) — 원본이
따로 있는지, 아니면 IA 초안 단계에서만 존재했던 계획이 취소된 것인지.**

### 5-7. 화면 배경색 판정 규칙 및 현황 (2026-09-13)

**규칙(2026-09-13 확정)**:
- 시안에 회색(#F2F2F2) 배경 화면은 존재하지 않는다. 배경을 지정하지 않은 화면에서 실기기에
  보이는 회색은 안드로이드 시스템 기본 윈도우 배경이며, 이는 미구현 상태로 취급한다.
- 화면 배경은 두 종류뿐이다: **목록/조회형** → `BACKGROUND_PRIMARY`(#F0F5FE, 옅은 블루),
  **폼/입력형·바텀시트·다이얼로그 표면** → `BACKGROUND_SECONDARY`(흰색).
- 배경은 반드시 그 화면의 스펙시트를 직접 열어 판정한 뒤에만 적용한다. 스펙시트를 안 읽은
  화면에 추정으로 배경을 지정하지 않는다(2026-09-12 라운드에서 전 화면 일괄 적용을
  시도했다가 로그인·폼 화면들이 흰색이라는 걸 놓칠 뻔했다 — 아래 "취소된 접근" 참고).
- 공통 컨테이너(`ScreenContainer`, `components/Layout/ScreenContainer.tsx`)가 배경 종류를
  `background: 'primary' | 'secondary'` prop으로 받는다 — 화면마다 `SafeAreaView`에
  `backgroundColor`를 직접 흩뿌리지 않는다. 새로 배경을 판정하는 화면은 이 컨테이너로
  바꾸면서 반영한다(기존 `SafeAreaView` 직접 사용처를 전부 갈아엎지는 않는다 — 배경을
  다루는 김에 자연스럽게 바꾸는 것만).

**취소된 접근(2026-09-12)**: 처음엔 `BACKGROUND_PRIMARY`를 전 화면에 일괄 적용하려 했으나,
시안 표본 확인 결과 로그인·회원가입·각종 생성/수정 폼 화면은 흰색이라 일괄 적용이 틀렸다.
목록형/폼형을 대조 라운드마다 스펙시트로 직접 나누는 것으로 방침을 바꿨다(상세:
`docs/design-diff.md` 2026-09-12 배경색 조사 항목).

**2026-09-13 적용 확정 — 6개 Screen ID, 블루(#F0F5FE)**(모두 스펙시트 직접 확인, 3-2 검증 결과
전부 일치, 판정 틀린 화면 없음):

| Screen ID | 화면명 | 스펙시트 |
|---|---|---|
| `ETC-2-PAGE-06-0` | 보관함 | `더보기_기록보관.png` |
| `ETC-3-PAGE-03-0` | 보관함 기록 보기 / 기간별 보고서 조회(ID 공유) | `더보기_기록보관_상세보기.png` / `더보기_보고서생성_기간보고서조회-1.png` |
| `ETC-2-PAGE-04-0` | 보고서 생성 메인 | `더보기_보고서생성.png` |
| `ETC-3-PAGE-02-0` | 장부별 보고서 조회 | `더보기_보고서생성_장부보고서조회.png` |
| `ETC-4-PAGE-05-0` | 장부 상세 | `더보기_보고서생성_장부보고서조회-1.png` |
| `ETC-4-PAGE-07-0` | 기간 보고서 상세 | `더보기_보고서생성_기간보고서조회.png` |

**2026-09-13 적용 확정 — 4개 Screen ID, 흰색**(바텀시트/다이얼로그 표면, 부모 화면 딤 처리는
안 건드림):

| Screen ID | 화면명 |
|---|---|
| `ETC-3-SHEET-05-0` | 새 보고서 생성 바텀시트 |
| `DTB-3-SHEET-01-0` | 기간 선택 캘린더 바텀시트 |
| `ETC-3-MODAL-03-0` | 보관함 기록 삭제 다이얼로그 |
| `ETC-3-MODAL-04-0` | 기록 제목 변경 다이얼로그 |

**2026-09-13 적용 확정 — 1개 Screen ID 추가, 흰색(폼형 화면)**:

| Screen ID | 화면명 | 스펙시트 |
|---|---|---|
| `ETC-4-PAGE-03-0` | 장부별 보고서 생성 | `더보기_보고서생성하기_장부별.png` |

**2026-09-13 두 번째 라운드 적용 확정 — 2개 Screen ID 추가, 흰색(폼형 화면)**:

| Screen ID | 화면명 | 스펙시트 |
|---|---|---|
| `ETC-4-PAGE-04-0` | 기간별 보고서 생성 | `더보기_보고서생성하기_기간별.png` |
| `ETC-5-PAGE-01-0` | 장부별 보고서 생성_장부 선택 | `더보기_보고서생성하기_장부별_장부선택.png` |

**2026-09-13 적용 확정 — 3개 Screen ID 추가, 블루(탈퇴 플로우)**:

| Screen ID | 화면명 | 스펙시트 |
|---|---|---|
| `COM-1-PAGE-02-0` | 탈퇴_안내사항 | `더보기\로그아웃&탈퇴하기\글로벌설정_내프로필_탈퇴하기.png` |
| `COM-2-PAGE-04-0` | 탈퇴_권한 넘기기 | `더보기\로그아웃&탈퇴하기\내프로필_탈퇴하기_권한이전.png` |
| `COM-2-PAGE-05-0` | 탈퇴_사유 입력 | `더보기\로그아웃&탈퇴하기\내프로필_탈퇴하기_권한이전_사유선택.png` |

**2026-09-13 DUE 묶음 4 적용 확정 — 5개 Screen ID**(블루 2, 흰색 3):

| Screen ID | 화면명 | 배경 | 스펙시트 |
|---|---|---|---|
| `DUE-1-PAGE-01-0` | 납부 관리 메인 | 블루(#F0F5FE) | `납부관리_메인.png` |
| `DUE-2-PAGE-01-0` | 회비 생성 | 흰색 | `납부관리_메인_새회비생성.png` |
| `DUE-3-PAGE-01-0` | 새 회비 생성_모임원 선택 | 흰색 | `납부관리_메인_새회비생성_모임원선택.png` |
| `DUE-3-PAGE-04-0` | 회비 요청 작성 | 블루(#F0F5FE) | `납부관리_납부요청.png` |
| `DUE-3-PAGE-06-0` | 회비 수정 | 흰색 | `납부관리_회비상세_수정.png` |

**2026-09-17 DUE 묶음 5 적용 확정 — 2개 Screen ID**(블루):

| Screen ID | 화면명 | 배경 | 스펙시트 |
|---|---|---|---|
| `DUE-2-PAGE-03-0` | 회비 항목 상세 (진행중/미납부) | 블루(#F0F5FE) | `납부관리_회비상세.png` |
| `DUE-2-PAGE-03-1` | 회비 항목 상세 (예정/마감) | 블루(#F0F5FE) | `납부관리_회비상세_예정된회비.png`/`_마감된회비.png` |

**2026-09-19 코드 조사로 판정 — 6개 Screen ID**(마지막 `FDR-2-PAGE-02-0` 1건 외 5개는 모달/스낵바 ID라 값은 그 UI가 뜨는 부모 화면의 **8-4 정정**: 이 표의 모달/스낵바 값은 "부모 상속"이었으나 배경 열 의미를 요소 표면색으로 통일해, 아래 4개 행은 표면색으로 바꾸고 부모 값은 §2 비고로 옮겼다(`COM-3-MODAL-01-0` 흰색, `ETC-4-SNACKBAR-01-0`/`02-0`/`ETC-5-SNACKBAR-08-0` 어두움).
`ScreenContainer background` 명시값을 상속한 것 — 화면 자체의 시안 대조는 별도):

| Screen ID | 화면명 | 배경 | 근거(코드) |
|---|---|---|---|
| `COM-3-MODAL-01-0` | 탈퇴_사유 입력 | 흰색(다이얼로그 표면, 부모 `COM-2-PAGE-05-0` 배경 블루) | screens/More/WithdrawReasonScreen.tsx — `ScreenContainer background` 명시 전달값 상속 |
| `ETC-4-SNACKBAR-01-0` | 보관함 기록 삭제 완료 | 어두움(스낵바 표면, 부모 `ETC-2-PAGE-06-0` 배경 블루) | screens/Archive/ArchiveListScreen.tsx — `ScreenContainer background` 명시 전달값 상속 |
| `ETC-4-SNACKBAR-02-0` | 기록 제목 변경 완료 | 어두움(스낵바 표면, 부모 `ETC-2-PAGE-06-0` 배경 블루) | screens/Archive/ArchiveListScreen.tsx — `ScreenContainer background` 명시 전달값 상속 |
| `ETC-5-MODAL-01-0` | 보고서_이탈방지 | 흰색 | screens/Report/ReportCreateByLedgerScreen.tsx — `ScreenContainer background` 명시 전달값 상속 |
| `ETC-5-SNACKBAR-08-0` | 보고서_생성완료 | 어두움(스낵바 표면, 부모 `ETC-2-PAGE-04-0` 배경 블루) | 이 표의 "코드 파일" 매핑(`ReportCreateByLedgerScreen.tsx`, 흰색)은 **낡은 정보** — 2026-09-13 §5-11 네비게이션 정책 변경으로 이 스낵바는 이제 생성 폼이 아니라 이동해 간 `ReportByLedgerDetailScreen.tsx`/`ReportByPeriodDetailScreen.tsx`(둘 다 `ScreenContainer background="primary"`, `:142`/`:140`)에서 뜬다 — 그 값을 상속 |
| `FDR-2-PAGE-02-0` | 전체 예산 설정 목록 | 블루(#F0F5FE) | `FolderBudgetListScreen.tsx` 루트가 `BACKGROUND_PRIMARY` 상수 참조(2026-09-18 §5-16 시안 대조로 확정). §2 행은 그때 고쳤으나 이 목록에서 빼지 않아 2026-09-19 집합 차 검사(§5-18 5번)로 발견 |

**2026-09-19 8-5 — v1/v3 명세 측정 판정 전면 철회**: 위 8-1(v1)·8-3(v3) 블록의 판정은 철회했다. v1은 파일 단위(한 파일 안의 다른 화면 목업까지 셈), v3는 프레임 좌표 오검출 때문이다. `docs/spec-background-v1~v4.tsv`와 `docs/spec-frame-map.tsv`는 근거 이력으로만 남기고 판정에 쓰지 않는다. 모달·시트·스낵바의 표면색(8-4)은 컴포넌트 근거라 유지.
- **v5 기준점 검증(통과)**: 블루 기대 3개 `FDR-1-PAGE-01-0`(v5 블루 66%)·`DSH-1-PAGE-01-0`(블루, 점유율 22%)·`ETC-4-PAGE-05-0`(블루 81%, 상단 블루/하단 흰색) 일치. 직접 확인 흰색 3개 `DUE-3-PAGE-01-0`(v5 흰색 79%)·`ETC-4-PAGE-03-0`(83%)·`ETC-4-PAGE-04-0`(83%)는 프레임 x=50..410 안쪽 스트립을 다시 찍은 값(상·중·하단 모두 #FFFFFF, 마커 #FF4040만 섞임)과 일치 — 이전 직접 확인도 옳았다.
- **반영**: `PAGE` 46개(블루/흰색). 기존 직접 확인 판정 20개 중 v5로 재측정된 18개는 전부 일치(충돌 0), `ETC-4-PAGE-07-0`은 점유율 53%라 참고만, `FDR-2-PAGE-02-0`은 v5 프레임 미검출이라 안쪽 스트립을 직접 재확인해 블루 일치.
- **`수동 확인 필요`(점유율 < 60%) 5개**: `DSH-1-PAGE-01-0`(v5 블루 22%, 안쪽 재확인은 블루 계열 그라데이션 + 흰 카드 혼재) `ETC-2-PAGE-02-0`(블루 19%) `ETC-3-PAGE-04-0`(기타 35%) `ADD-3-PAGE-01-0`(카메라, 기타 9% — 판정 대상 아님) `ETC-4-PAGE-07-0`(기존 판정 유지). v5 전체로는 점유율 < 60% 프레임 25개(스크림 88·기타 9는 표면색 규칙으로 처리해 PAGE 판정에 안 씀).
- **`상하 다름` 비고**: 상단/하단 색이 다른 PAGE는 §2 비고에 `배경 상하 다름 — 상단 <색> / 하단 <색>`을 적었다(파란 헤더 + 흰 리스트 구조 — 구현 시 헤더 영역과 본문의 배경을 따로 줘야 한다).

**조사 결과 요약(142개 → A/B/C/D/E)**: 블루 A **4** / 흰색 B **1** / 기본값 의존 C **0** /
구조 불일치 D **101** / 캡처(또는 코드 매핑) 필요 E **31** / 별도 화면 아님 **4** (합 141 — 142에서 `FDR-2-PAGE-02-0`이 블루로 확정돼 D에서 빠짐).
- C=0인 이유: `ScreenContainer`의 `background`는 필수 prop(옵셔널 아님, 기본값 없음)이라 "쓰면서 미지정"이
  타입상 불가능하다 — 기본값 의존 케이스가 구조적으로 존재하지 않는다.
- D 101 = 화면(PAGE) 58 + 시트/모달/스낵바 43. (`FDR-2-PAGE-02-0`은 블루로 확정돼 목록에서 빠졌지만 코드는 여전히 `ScreenContainer`를 안 쓴다 — §5-18은 그 화면까지 포함한 59개 ID 기준.) 시트/모달/스낵바 43개는 "부모 화면이 `ScreenContainer`를 안
  쓴다"는 뜻이라 그 행 자체의 배경 문제는 아니다(부모 화면 행에서 다룸). PAGE 59개가 실질적 구조 불일치.
- E 31 = 대응 코드 파일이 "(미확인)"인 모달/스낵바 26 + 화면 5(시안 없음/대응 화면 미구현 포함).

**"배경 미판정" 목록 — 14개**(2026-09-19 8-6: 육안 확인 3개 + `-1` 변형 4개 상속으로 7개를 뺌. 모달·시트·스낵바는 8-4 표면색 규칙으로 채워 목록에 없음 — 남은 것은 전부 `PAGE`)(2026-09-19 8-3: 프레임 단위 v3로 31개를 빼고, v1 판정을 되돌린 19개를 다시 넣음, 원래 136개)(2026-09-19 코드 조사 후 6개 뺌. 스펙시트로 아직 확인 안 함, 대조
라운드마다 처리하며 이 표에서 제거할 것):

| Screen ID | 화면명 | 코드 파일 | 코드 조사(2026-09-19) |
|---|---|---|---|
| `COM-3-PAGE-01-0` | 약관 상세 | `screens/Signup/{TermsOfService,PrivacyPolicy,MarketingConsent}Screen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `COM-3-PAGE-04-0` | 비밀번호 재설정_완료 | `screens/PasswordReset/PasswordResetSentScreen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `DSH-2-PAGE-05-0` | 통계 및 분석 | (미확인) | 대응 코드 미확인 — 캡처/매핑 필요 |
| `DTB-2-PAGE-03-0` | 상세 내역_승인요청 | `screens/Folder/TransactionDetailScreen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `DTB-3-PAGE-01-0` | 증빙자료 상세 | `screens/Folder/TransactionReceiptDetailScreen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `DUE-5-PAGE-02-0` | 개인 납부 내역_검색 | (미확인) | 대응 코드 미확인 — 캡처/매핑 필요 |
| `DUE-3-PAGE-02-1` | (IA 목록에 없음) | (미확인) | 대응 코드 미확인 — 캡처/매핑 필요 |
| `ETC-3-PAGE-11-0` | 약관 및 개인정보 처리방침 | `screens/More/TermsScreen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `ETC-4-PAGE-02-0` | 이미지 선택 | `screens/GroupManager/GroupImagePickerScreen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `ETC-5-PAGE-02-0` | 보고서_내역 상세 — **및 보관함_내역 상세(공유 ID, 2026-09-12)** | `screens/Report/ReportEntryDetailScreen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `ADD-3-PAGE-01-0` | 영수증 스캔 | `screens/Transactions/ReceiptScanningView.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `ADD-3-PAGE-02-0` | 사진 촬영 | (미확인) | 대응 코드 미확인 — 캡처/매핑 필요 |
| `ADD-4-PAGE-01-0` | 영수증 스캔 성공 | `screens/Transactions/TransactionRegisterScreen.tsx` | 구조 불일치 — `ScreenContainer` 미사용(SafeAreaView 직접 구성) |
| `ADD-4-PAGE-02-0` | 사진 촬영 결과 | (미확인) | 대응 코드 미확인 — 캡처/매핑 필요 |

**육안 확인 필요 후보 18장(2026-09-12 사용자 지정, 참고용 — 지금 판정하지 않음)**: 경계가
애매해 각 대조 라운드에서 다뤄야 할 것으로 지목된 화면들 — `DUE-3-PAGE-01-0`,
`DUE-3-PAGE-06-0`, `DUE-3-PAGE-02-0`, `DUE-4-PAGE-04-0`, `DTB-3-MODAL-01-0`,
`FDR-3-SHEET-01-0`, `FDR-3-MODAL-03-0`, `FDR-3-PAGE-03-0`, `ETC-4-PAGE-01-0`,
`ETC-4-MODAL-05-0`, `ETC-3-MODAL-01-0`, `ETC-3-MODAL-02-0`, `ETC-4-PAGE-17-0`,
`ETC-4-PAGE-03-0`, `ETC-4-PAGE-04-0`, `ETC-4-PAGE-05-0`(주: `ETC-4-PAGE-05-0`는 2026-09-13
블루 확정, `ETC-4-PAGE-03-0`는 2026-09-13 흰색 확정 — 둘 다 사용자가 지정한 18장 원본
목록에 포함돼 있었으나 각각 확정 목록에 이미 포함돼 먼저 판정이 끝났다. 나머지는 여전히
"애매한" 상태로 남아 있다).


### 5-8. 에러 코드 매핑 전수 점검 (2026-09-13, 완료)

Report 도메인 에러 블록이 통째로 빠져 있던 것을 계기로, 서버 명세(도메인별 `.txt`)에
적힌 에러 코드 전부와 `constants/apiErrorMessages.ts`의 매핑을 대조했다. Swagger
(`API_swagger.txt`)는 에러 코드를 전혀 문서화하지 않는다(응답 예시에 `code` 필드 예시
자체가 없음) — 그래서 도메인별 `.txt` 파일과 `docs/api-wiring.md`(실호출로 확인된 것)만
출처로 썼다. **1차 점검(대조 라운드 완료 여부와 무관하게 우선순위대로 진행)에서 발견한
26개 중 25개를 채웠다** — 나머지 1개(`UNPAID_MEMBER_EXISTS`)는 아래 이유로 의도적으로
제외했다.

#### (a) 서버 명세엔 있었는데 매핑이 없던 코드 — 전부 채움

| 코드 | 상태코드 | 출처 도메인 | 문구 출처 |
|---|---|---|---|
| `INVALID_QUERY_PARAMETER` | 400 | 목록 조회 공통 | 2-2 자체 작성 |
| `INVALID_CREDENTIALS` | 401 | Auth | 2-2(로그인 화면은 로컬 문구로 별도 처리, 이 값은 비밀번호 변경 맥락 기준) |
| `INVALID_TOKEN` / `REFRESH_TOKEN_EXPIRED` / `REFRESH_TOKEN_REVOKED` | 401 | Auth | 2-2, `apiClient.ts`가 삼키는 코드 — §5-8 하단 "토큰 갱신" 참고 |
| `ACCESS_TOKEN_EXPIRED` | 401 | Auth | 2-2, 갱신 실패 시 실제로 화면까지 올라오는 코드 |
| `INVALID_VERIFICATION_CODE` / `VERIFICATION_CODE_EXPIRED` | 400 | Auth(이메일 인증) | 2-1, Auth.txt 7번에 화면 문구가 그대로 적혀 있음(기존 로컬 상수와 통일) |
| `PASSWORD_CHANGE_NOT_ALLOWED` | 400 | Auth | 2-1, Auth.txt 10번 맥락 설명 기준 |
| `EMAIL_ALREADY_EXISTS` | 409 | Auth(회원가입) | 2-2(기존 로컬 상수 문구에 다음 행동 추가) |
| `INVALID_PAYMENT_STATUS` | 400 | Dues | 2-2 자체 작성 |
| `ENTRY_NOT_FOUND` / `ENTRY_ALREADY_APPROVED` | 404/409 | Entry | 2-2 자체 작성 |
| `INVALID_FILE` / `UNSUPPORTED_FILE_TYPE` / `FILE_SIZE_EXCEEDED` / `FILE_UPLOAD_FAILED` / `FILE_DELETE_FAILED` | 400/415/413/500/500 | File | 2-2, File.txt 정책 메모의 구체값(10MB, jpeg/png/webp) 반영 |
| `GROUP_NAME_MISMATCH` | 400 | Group(삭제 확인) | 2-1, Group.txt 5번 화면 문구 그대로(기존 로컬 상수와 통일). 서버 검증 자체는 아직 `미구현` — 실호출 확인 불가, 붙으면 바로 맞는 문구가 나가도록 선반영 |
| `INVALID_INVITATION_CODE` / `INVITATION_EXPIRED` / `ALREADY_GROUP_MEMBER` | 400/410/409 | GroupMembership | 2-1, 시안이 세 실패 사유를 한 문구로 통합 설계(기존 로컬 상수와 통일) |
| `INVALID_OCR_FILE` / `OCR_RESULT_EMPTY` / `OCR_PROCESSING_FAILED` | 400/422/502 | OCR | 2-2 자체 작성. OCR 자체가 서버 상태 `시작 전`이라 실호출 검증은 못 함 |
| `VERIFICATION_NOT_FOUND`(신규 발견) | 404 | Auth(이메일 인증) | 명세에 없던 코드 — 2026-09-13 실호출(존재하지 않는 이메일로 인증 코드 검증 시도)로 발견, 매핑에 추가 |

**의도적으로 안 채운 것 — `UNPAID_MEMBER_EXISTS`(409, Dues)**: Dues.txt 8번(회비 마감)
정책 메모가 "미납자가 남아 있어도 마감합니다(2026-08-30 화면명세 감사로 정정) ... 기존
`UNPAID_MEMBER_EXISTS(409)` 제약은 **제거**합니다"라고 명시한다 — 폐기 예정으로 문서화된
제약이라 현재 유효한 에러가 아니다.

보관함(Archive)·보고서(Report) 도메인은 지난 라운드(2026-09-13 이전)에 이미 채워둬서
이번 점검 대상에서 제외했다 — `ARCHIVE_NOT_FOUND`/`ARCHIVE_IN_PROGRESS`/`ARCHIVE_EMPTY`,
`REPORT_NOT_FOUND`/`REPORT_RANGE_EMPTY` 전부 매핑돼 있다.

**2-4. 토큰 갱신 코드 처리**: `apiClient.ts`의 `request()`가 `ACCESS_TOKEN_EXPIRED`/
`UNAUTHORIZED`로 실패하면 `refreshSession()`을 먼저 시도한다. 그 안에서
`/auth/refresh`가 `INVALID_TOKEN`/`REFRESH_TOKEN_EXPIRED`/`REFRESH_TOKEN_REVOKED`
중 무엇으로 실패하든 그 에러는 버려지고 **원래 요청의 코드**가 다시 던져진다 — 이 세
코드는 구조상 화면까지 못 올라온다(방어용으로만 매핑). `ACCESS_TOKEN_EXPIRED`는
갱신까지 실패했을 때 원래 요청 코드로 화면까지 실제로 올라오는 경로라 `UNAUTHORIZED`와
같은 문구(다시 로그인)로 맞췄다.

#### (b) 매핑은 있는데 서버 명세 어디에도 없던 코드 — 실호출로 확인 완료

| 코드 | 매핑 위치 | 결론 |
|---|---|---|
| `ARCHIVE_NOT_FOUND` | `ARCHIVE_ERROR_MESSAGES` | **2026-09-13 실호출로 확인 — 진짜 코드다.** `GET /api/v1/archives/999999`(존재하지 않는 ID) → `404 {"code":"ARCHIVE_NOT_FOUND","message":"보관 기록을 찾을 수 없습니다."}`. 오타·폐기 코드가 아니라 `Folder.txt`에 이 코드만 명세 누락된 것 — `docs/backend-requests.md`에 "명세 누락"으로 올렸다. 매핑은 그대로 둔다(이미 맞는 문구). |

#### (c) 매핑은 있는데 문구가 상황을 설명 못 하는 것 — 코드 공유로 인한 오배치

| 코드 | 현재 문구 | 문제 |
|---|---|---|
| `GROUP_MISMATCH` | "다른 모임의 폴더로는 옮길 수 없어요." (`LEDGER_ERROR_MESSAGES`) | 이 코드가 Ledger(폴더 이동)/Dues/Report 세 도메인에서 각각 다른 의미로 쓰인다 — Report.txt는 "다른 모임의 장부를 포함한 경우"라고 정의한다. 지금 문구는 폴더 이동 상황에만 맞고 Report/Dues 쪽에서 뜨면 맥락이 안 맞는다. |

그 외 공유 코드(`LEDGER_NOT_FOUND`, `FILE_NOT_FOUND` 등)는 여러 도메인에서 쓰이지만
문구가 범용적으로 읽혀 당장 문제로 보이지 않는다 — 목록에서 뺐다.

**`GROUP_MISMATCH` 구조 개선 검토 결과(2026-09-13, 설계만 — 구현 안 함)**:
`getApiErrorMessage(code, context?: { domain: string })` 형태로 선택적 컨텍스트
인자를 받아, 도메인별 override 맵을 먼저 찾고 없으면 기존 평면 맵으로 폴백하는 방식을
검토했다.
- **비용**: 시그니처 자체는 하위 호환된다(2번째 인자가 optional이라 기존 `getApiErrorMessage(error.code)` 호출 63곳 전부 그대로 동작). 실제로 override가 필요한 호출부는
  `GROUP_MISMATCH`가 실제로 뜰 수 있는 화면(Report 생성 폼) 단 1곳뿐이라 점진 적용이
  가능하다 — "몇 곳을 한번에 고쳐야 하는" 구조가 아니다.
- **실익 판단**: `GROUP_MISMATCH`는 `ledgerIds`에 다른 모임의 장부 ID가 섞였을 때만
  뜨는데, 장부 선택 화면(`ReportLedgerSelectScreen`)이 애초에 현재 모임의 장부만
  보여주므로 **정상 UI 경로로는 사실상 도달 불가능한 에러**다. 지금 당장 override를
  추가해도 실사용자 체감 효과가 거의 없다.
- **결론**: 메커니즘 자체는 비용이 낮고 나중에 비슷한 사례(다른 공유 코드)가 늘어나면
  도입할 가치가 있다 — 하지만 `GROUP_MISMATCH` 하나만 놓고 보면 지금 만들 실익이
  낮아 **이번엔 만들지 않는다.** 실제로 도달 가능한 공유-코드 충돌 사례가 하나 더
  나오면 그때 함께 만드는 쪽을 권장한다.

#### 5-1 실제 확인 결과 (2026-09-13, 실서버 curl 기준 — 앱 UI 확인은 사용자 몫)

- ✅ **잘못된 비밀번호로 로그인** → `INVALID_CREDENTIALS` 그대로 확인(`LoginScreen`은
  이미 로컬 처리라 화면 문구엔 영향 없음, 맵 자체가 정상 작동함을 재확인).
- ✅ **잘못된 초대 코드로 참여** → `INVALID_INVITATION_CODE` 그대로 확인. 이제
  `JoinGroupSheet`가 `getApiErrorMessage`를 타서 "코드가 일치하지 않아요. 다시
  입력해주세요."(시안 문구)가 뜬다 — 이전엔 하드코딩된 비슷한 문구였는데 이번에
  실제 매핑 경로로 교체됐다.
- ✅ **이미 가입된 이메일로 가입 시도** → `EMAIL_ALREADY_EXISTS` 확인.
  **2026-09-13 정정**: 직전 라운드에 "확인 못 함 — 회원가입 엔드포인트 자체가
  스키마와 안 맞는 별도 문제로 보임"이라고 적었던 건 **오진이었다** — 그 테스트도
  이름 필드에 한글("중복테스트")을 셸 리터럴(`-d '...'`)로 보내서 인코딩이 깨진
  것이었다(오늘 보고서 생성 오진과 완전히 같은 함정). UTF-8 파일 +
  `--data-binary`로 재검증하니 `POST /auth/signup`은 신규 이메일 `201`, 중복
  이메일 `409 EMAIL_ALREADY_EXISTS` 둘 다 정확히 응답한다 — **회원가입
  엔드포인트 자체는 멀쩡하다.**
- ✅ **틀린 인증번호 입력** → 직접 재현은 여전히 안 됨(메일 발송이
  `MAIL_SEND_FAILED`로 막혀 있어 유효한 인증 세션을 못 만듦 — 예상된 결과).
  대신 존재하지 않는 이메일로 코드 검증을 시도해 `VERIFICATION_NOT_FOUND`(명세에
  없던 신규 발견 코드)를 확인, 매핑에 추가했다.
- fallback 문구가 여전히 뜨는 케이스: 없음.

**"MAIL_SEND_FAILED로 이메일 가입 전체 차단" 기록 재검증 결론(2026-09-13)**:
`docs/backend-requests.md` 1순위 기록은 **정정할 필요 없음 — 그대로 맞다.** 다만
정확히 어느 지점이 막히는지 이번에 재확인했다:
- \`POST /auth/signup\`(회원가입 자체) — **정상 동작**(위 확인).
- \`POST /auth/email-verifications\`(인증 코드 발송, 실제 앱 플로우의 1단계) —
  아직도 \`500 MAIL_SEND_FAILED\`(신규 이메일로 재확인).
- 앱의 실제 가입 순서는 **발송 → 코드 확인 → 가입** 3단계 직렬이라, 1단계가
  막히면 사용자는 3단계(정상 동작하는 가입 자체)에 절차상 도달할 수 없다 — "이메일
  가입 전체가 막혀 있다"는 원래 서술은 **엔드포인트 단위가 아니라 사용자 흐름
  단위로 보면 정확하다.** 정정 대신 이 구분만 §5-3 진단 기록에 덧붙인다.

**2026-09-17 재확인 — 상태 변화 없음.** `scripts/api-call.js`로 신규 미가입 이메일에
`POST /auth/email-verifications` 재호출, 응답 동일: `500 MAIL_SEND_FAILED`. "신규 이메일
가입 전면 차단" 서술 그대로 유지 — 코드/문서 정정 없음, 확인 날짜만 갱신. 상세는
`docs/backend-requests.md` 1순위 절 참고.


### 5-9. 화면 자체 fallback/에러 처리 전수 점검 (2026-09-13, 조사 완료)

§5-9: 전 화면 API 에러 `catch` 약 116곳 전수 점검 결과 — 유형 1(`PasswordChangeScreen` 하드코딩 fallback)은 발견 즉시 수정, 유형 2(`error.message` 원문 노출)는 0건, 유형 3(`LoginScreen`/`EmailVerificationScreen`/`SocialSignupInfoScreen`/`GroupManagerScreen`이 알려진 코드만 분기)은 의도된 패턴(낮음), 유형 4(조용히 삼키는 `catch` 12곳)는 10곳이 주석으로 근거를 명시한 의도된 설계(다음 페이지·보조 데이터)이고 사용자 검색 무반응 2곳(`LedgerSearchScreen`, `ReceiptSearchScreen`)은 이후 "결과 없음/요청 실패"를 구분하는 에러 표시가 추가됨(2026-09-19 코드 확인). **남음**: 화면 전용 "일반 실패" 문구가 스펙시트 지정 문구인지는 각 화면 대조 라운드에서 확인. 12곳 표 전문은 커밋 `9b967ee`의 이 절.


### 5-10. 컴포넌트 연결 누락 전수 점검 (2026-09-13)

오늘 두 건("Snackbar의 `onClose`", "SearchField의 `variant='outline'`")이 같은 패턴이었다 —
컴포넌트엔 구현돼 있는데 화면이 그 prop을 안 넘겨 시안과 달라 보이는 경우. "미구현"이
아니라 "연결 누락"이라 코드만 봐서는 정상으로 보인다. `src/components`(스토리 제외, 60개
파일)의 모든 prop을 뽑아 `src/screens` 전체에서 실제로 넘겨지는지 전수 대조했다(조사는
Explore 서브에이전트에 위임, 스프레드 전달 케이스는 원본 함수까지 직접 확인해 오탐 제거).
**총 56개 미연결 prop, 29개 컴포넌트에 분포**(그중 5개는 컴포넌트 전체가 어디서도 안 쓰이는
완전 고아: `BackupCard`/`ReportCard`/`Receipt`/`Tooltip`/`PlaceholderNotice`).

**이번 턴 처리 범위**: 이미 대조를 마친 화면(보관함/보고서/탈퇴 흐름)에 해당하는 것만
스펙시트로 실제 확인해 고쳤다. 나머지는 판정만 하고 목록으로 남긴다 — 각 화면의 대조
라운드에서 처리.

#### (a) 결함으로 확인·수정 완료 — 1건

| 컴포넌트 | prop | 화면 | 근거 |
|---|---|---|---|
| `Avatar` | `style="neutral"` | `WithdrawOwnershipTransferScreen`(`COM-2-PAGE-04-0`) | 시안(`내프로필_탈퇴하기_권한이전.png`)의 멤버 아바타가 회색인데 코드가 기본값(`style="default"`, 파란 배경+파란 테두리)을 그대로 써 파랗게 나오고 있었다. `style="neutral"`(회색, 컴포넌트엔 있었지만 앱 전체 어디서도 안 쓰이던 값)을 지정 — `docs/design-verification.md` `COM-2-PAGE-04-0` 행에 기록. |

같은 세 도메인(보관함/보고서/탈퇴)에 걸린 다른 미연결 prop도 대조했으나 결함이 아니었다:
- `AmountCard`의 `incomeCount`/`expenseCount`(type='income'/'expense' 전용) — 보관함·보고서
  장부내역 화면(`ArchiveLedgerEntriesScreen`/`ReportLedgerEntriesScreen`/
  `ReportPeriodEntriesScreen`) 전부 `type="incomeExpense"`만 쓰고 있고, 이 화면들 스펙상
  수입/지출을 각각 단독 카드로 쪼개 보여줄 요구가 없다 — 정상(다른 화면을 위해 미리 만든
  분기로 추정, (b)에 가까움).
- `ReportCard`(고아 컴포넌트) — 이름은 "보고서 카드"지만 `ReportMainScreen`(`ETC-2-PAGE-04-0`,
  이미 시안 대조 완료·`[구현]`)은 `CardBase` 기반 커스텀 레이아웃으로 이미 시안과 일치한다 —
  `ReportCard`는 그 이전에 만들어졌다가 대체된 것으로 보인다. (c) 죽은 코드 후보로 아래에 남김.
- `BackupCard`(고아 컴포넌트) — 이름은 "백업 카드"라 보관함(`ETC-2-PAGE-06-0`)용으로 보이지만,
  `ArchiveListScreen`은 이미 `CardBase` 기반 커스텀 레이아웃으로 시안과 일치 확인됨(여러
  라운드에 걸쳐 대조 완료) — 마찬가지로 대체된 것으로 보인다. (c)로 남김.
- `CheckBox`의 `shape="circle"` — `WithdrawReasonScreen`(`COM-2-PAGE-05-0`)이 체크박스를 쓰는
  유일한 탈퇴 화면인데, 시안(`내프로필_탈퇴하기_권한이전_사유선택.png`)이 정사각형(☐)이라
  기본값(`shape="square"`)이 이미 맞다 — 정상.

#### (b) 아직 안 만든 화면을 위해 미리 만든 것으로 보이는 컴포넌트/prop

| 컴포넌트 | 대상 prop | 어느 화면용으로 보이는지 |
|---|---|---|
| `AppBar` | `type="detailDownload"`(+ `subtitle`) | 상세 화면 + 다운로드 액션 조합 — 증빙자료 관련 화면(영수증 원본 다운로드) 후보. 실제 사용처 미확인 |
| `AppBar` | `type="imageSelect"`(+ `selectedCount`/`showSelectionCount`) | 이미지 다중 선택 화면(앨범에서 여러 장 골라 삭제/다운로드) 후보. 증빙자료 앨범 도메인이 유력하나 미확인 |
| `SelectionListItem` | `type="switch"`(+ `subtitle`/`onValueChange`) | 알림 설정(`NotificationSettingsScreen`류) — 알림 7개 API는 §5-5 "결정 대기" 상태라 아직 못 붙임. 결정되면 바로 쓸 수 있게 미리 만든 것으로 추정 |
| `AttachmentAddButton` | `type="gallery"` | ADD 플로우(내역 추가) 증빙자료 첨부 중 "사진 촬영"(카메라, 진한 배경) 변형 — 현재 화면이 `type` 자체를 안 넘겨 첫 변형(아웃라인)만 나오는데, 시안엔 사진/스캔/카메라 3버튼이 각각 다른 스타일일 가능성 — ADD 도메인 대조 라운드에서 확인 필요 |
| `FAB` | `extended`/`label` | 라벨이 붙는 확장형 FAB — 현재 유일한 FAB 호출부는 원형만 씀, 다른 화면에 확장형이 쓰일 가능성 |
| `IconButton` | `overlay` | 이미지 뷰어 위에 놓이는 반투명 아이콘 버튼 — 정확히 아래 Task B의 `TransactionReceiptDetailScreen`/`ReceiptDetailScreen`이 이 용도로 직접 그렸다. 다음 라운드에서 이 prop으로 교체 가능 |
| `PlaceholderNotice`(고아) | 전체 | "준비 중이에요" 안내 — §5-5 "결정 대기" 화면들(고객지원/알림)의 향후 에러·빈 상태용으로 추정 |

#### (c) 죽은 코드 후보 — 지우지 않고 목록만 남김

| 컴포넌트 | prop/범위 |
|---|---|
| `Accordion` | `defaultOpen` |
| `AvatarList` | `showIndicator` |
| `Badge` | `icon` |
| `Calendar` | `disabledDates` |
| `AmountCard` | `type='income'`/`type='expense'` 분기 전체(`incomeCount`/`expenseCount`) |
| `BackupCard` | 컴포넌트 전체(고아) |
| `BudgetCard` | `emptyMessage` |
| `EntityCard` | `roleLabel`/`email`/`avatarUri` |
| `InfoCard` | `onRemoveTag`/`onAddTag`/`memoPlaceholder` |
| `ReportCard` | 컴포넌트 전체(고아) |
| `CheckListItem` | `disabled` |
| `MemberListItem` | `disabled` |
| `Receipt` | 컴포넌트 전체(고아) |
| `Tooltip` | 컴포넌트 전체(고아) |
| `ProgressBar` | `style='square'` |
| `Button` | `negative` |
| `IconButton` | `disabled`/`showPushBadge` |
| `CheckBox` | `shape='circle'` (Withdraw 화면은 위에서 확인 완료 — 그 외 잠재 사용처는 미확인) |
| `DateField` | `placeholder` |
| `TextField` | `success` |
| `ScreenContainer` | `edges`/`style` |
| `AppBar` | `showDropdown`/`onPressDropdown` |
| `Menu` | `selectedKey` |
| `ToolsMenu` | `selectedKey` |

#### 판정 불가 — 스펙시트 미확인

위 (b)/(c) 항목 중 "어느 화면용인지"를 코드 문맥(이름·타입)으로만 추정했을 뿐 실제 스펙시트를
열어 확인하지 않은 것들이 대부분이다 — 특히 `AppBar`의 두 죽은 레이아웃(`detailDownload`/
`imageSelect`), `SelectionListItem`의 `switch` 타입, `AttachmentAddButton`의 `gallery`는
해당 도메인(증빙자료/ADD/알림) 대조 라운드가 오면 스펙시트와 함께 다시 판정해야 한다.

#### Task 반대 방향 — 화면이 공용 컴포넌트 대신 직접 그린 곳 (7건, 이번 턴 미수정)

| 화면 | 직접 그린 것 | 겹치는 기존 컴포넌트 |
|---|---|---|
| `Dashboard/QuickServiceCard.tsx` | 카드(배경/radius/padding 수동) | `CardBase`(variant='filled') |
| `Member/MemberPaymentHistoryScreen.tsx` | 요약 카드 | `CardBase` |
| `Member/MemberDetailScreen.tsx` | 탭 가능 요약 카드 | `CardBase`(onPress) |
| `Member/MemberAddSheet.tsx` | 아이콘+라벨 행 | `ToolsMenu` |
| `Report/ReportCreateSheet.tsx` | 아이콘+라벨 행 | `ToolsMenu` |
| `Folder/TransactionReceiptDetailScreen.tsx` | 이미지 위 닫기 버튼 | `IconButton`(`overlay`) |
| `Receipt/ReceiptDetailScreen.tsx` | 이미지 위 뒤로가기 버튼 | `IconButton`(`overlay`) |

화면 수가 많아 이번 턴엔 우선순위만 남긴다 — `IconButton overlay` 2건은 위 (b)와 정확히
맞물리는 가장 손쉬운 교체 후보, `CardBase` 3건은 각 화면 대조 라운드에서, `ToolsMenu` 2건은
레이아웃 차이가 있을 수 있어 재사용 전에 시안부터 확인 필요.

### 5-11. 네비게이션 스택 정책 (2026-09-13)

사용자 보고(2026-09-13): 탭을 떠났다 돌아오면 안쪽 화면이 그대로 남아 있고, 생성 흐름
완료 후에도 뒤로가기로 폼을 되짚을 수 있다. 조사 결과와 적용한 정책을 남긴다.

**구조 판단 — 네비게이터 구조는 바꾸지 않는다.** `RootNavigator`(native-stack) 아래
`Main`(bottom-tabs, 진짜 탭)과 ~80개 상세/생성 화면이 형제로 나열돼 있어, 탭에서 상세로
들어가면 하단 탭바가 사라진다(폴더 탭의 서브폴더 드릴다운만 `FolderTabNavigator`
자체 스택 안에서 일어나 탭바가 유지된다). **시안 확인 결과 탭 루트 목업엔 탭바가 있고
상세 목업(예: 폴더_장부상세, 납부관리_회비상세)엔 탭바가 없다** — 지금 동작이 시안과
일치한다. 그래서 상세 화면을 탭 내부 스택으로 옮기는 구조 변경은 하지 않고, 아래
호출 패턴 문제만 고친다.

**규칙 1 — 선택 화면은 `popTo`로 부모 폼에 돌아간다.** React Navigation v7이라 `popTo(name, params)`
사용 가능. 부모 폼이 이미 스택에 있는데 `navigate`로 새 인스턴스를 또 쌓지 않는다. 부모
폼은 `route.params` 변화를 `useFocusEffect`로 반영하고 즉시 `setParams({ ...: undefined })`로
지워 재포커스 시 값이 중복 반영되지 않게 한다(`ReportCreateByLedgerScreen` 기존 패턴).

**규칙 2 — 완료 후에는 그 흐름의 화면들을 스택에서 전부 걷어낸다.** 폼 하나만 걷어내면
되는 경우(`LedgerCreateScreen`, `MemberAddIndividual/BulkScreen`, `FolderMoveDestinationScreen`
패턴)는 스낵바 노출 후 `setTimeout`으로 `goBack()`/`popToTop()`. 탭 루트나 여러 단계를
한번에 정리해야 하면 `navigation.reset({ index, routes: [...] })` — 이때 `index`는 뒤로가기가
가야 할 목적지까지 포함해서 쌓는다(`GroupManageScreen` 모임삭제가 `[Main, AllGroups]`를
남기는 것과 같은 방식). 스펙시트가 도착 화면을 명시하지 않으면 "목록 화면으로, 뒤로가기는
그 위 단계로"를 기본값으로 쓴다.

**규칙 3 — 탭 재진입은 화면 위치만 초기화, 목록 상태는 유지.** 자체 스택을 가진 탭은
`Folder` 하나뿐이다. `MainTabNavigator`의 커스텀 탭바 `onChange`에서 `tabPress` 이벤트를
그대로 쓰되, 같은 탭을 다시 눌렀거나 다른 탭에서 `Folder` 탭으로 돌아왔을 때
`FolderTabNavigator`가 `FolderList`(루트) 하나만 남도록 정리한다. `unmountOnBlur`는 쓰지
않는다 — 화면 전체가 매번 언마운트되면 폴더 목록 API를 매번 재요청하게 된다. 초기화 범위는
폴더 깊이(스택)까지이고, 목록의 스크롤 위치·정렬/보기 방식(그리드·리스트)은 컴포넌트
state라 스택 초기화와 무관하게 유지된다 — 시안에 별도 규정이 없어 유지 쪽으로 판단했다.

**흐름별 도착지 / 뒤로가기 목적지**

| 흐름 | 이전 | 이후 | 뒤로가기 목적지 |
|---|---|---|---|
| 보고서(장부별) 장부 선택 확인 | `navigate('ReportCreateByLedger', {...})`로 중복 스택 | `popTo('ReportCreateByLedger', {...})` | 기존 폼 인스턴스(변경 없음) |
| 회비 생성 성공 | `navigate('Main',{screen:'Dues',...})` | `reset({index:0, routes:[{name:'Main',params:{screen:'Dues',params:{snackbarMessage}}}]})` | 앱 종료(탭 루트) — 폼 재접근 불가 |
| 회비 삭제 성공 | 위와 동일 패턴 | 위와 동일하게 `reset` | 삭제된 상세로 못 돌아감 |
| 회비 마감 성공 | 위와 동일 패턴 | 위와 동일하게 `reset` (스펙시트에 마감 후 화면 명시 없음 — 기존 코드 주석이 "생성/삭제와 같은 패턴"으로 이미 시안 확인해 목록행을 택했다는 근거가 있어 유지, 스택 정리만 추가) | 목록으로 |
| 보고서(장부별) 생성 성공 | `navigate('ReportMain', {...})` | `reset({index:2, routes:[{name:'Main',params:{screen:'More'}}, {name:'ReportMain'}, {name:'ReportByLedgerDetail',params:{reportId}}]})` — ETC-4-PAGE-03-0 명세 No.5 "생성 완료된 보고서 상세 조회로 이동" | `ReportMain`(목록) — 폼으로 못 돌아감 |
| 보고서(기간별) 생성 성공 | `navigate('ReportMain', {...})` | 위와 동일하되 `ReportByPeriodDetail` | `ReportMain`(목록) |
| 모임 생성 성공 | `navigate('Main',{screen:'More'})` (`SignupComplete`도 `navigate('GroupCreate')`라 이중 스택) | `reset({index:1, routes:[{name:'Main',params:{screen:'More'}}, {name:'AllGroups',params:{snackbarMessage}}]})` — 스펙시트에 도착 화면 명시 없어 기본값(목록) 적용, `GroupManageScreen` 삭제와 동일 패턴 재사용 | `Main`(더보기) — 생성 폼·가입완료 화면 둘 다 재접근 불가 |

로그인→Main, 로그아웃, 탈퇴는 이미 `reset`으로 처리돼 있어 손대지 않았다(확인만 함).
딥링크/푸시 진입 경로는 이 코드베이스에 아예 없다(linking 설정, `Linking` 리스너, 푸시
라이브러리 전부 없음) — 4-3 해당 없음.

### 5-12. 키보드 대응 (2026-09-13)

사용자 보고: 키보드가 입력 화면을 가린다. 진단 결과와 적용한 방식을 남긴다.

**진단.** `AndroidManifest.xml`엔 `windowSoftInputMode="adjustResize"`가 이미 설정돼
있었지만 효과가 없었다 — `compileSdk`/`targetSdk`가 36(Android 16 기준)이라 edge-to-edge가
OS 레벨에서 강제 적용된다. `windowOptOutEdgeToEdgeEnforcement`는 API35까지만 유효한
옵트아웃이고 API36에선 그 속성 자체가 OS에서 제거돼 끌 수 없다. `android/gradle.properties`의
`edgeToEdgeEnabled=false`는 RN 자체 헬퍼(`enableEdgeToEdge()` 호출 여부)만 제어하는
별개 스위치라 OS 강제 적용을 못 막는다. edge-to-edge를 끄는 것도 답이 아니다 — 상태바
영역까지 배경이 올라가는 현재 디자인이 edge-to-edge를 전제로 한다. 코드 전수 조사 결과
`KeyboardAvoidingView`/`Keyboard.*`/`keyboardShouldPersistTaps` 등 키보드 대응 코드가
전혀 없었다 — `adjustResize` 하나에만 의존하고 있었고 그게 무력화된 상태였다.

**선택 — 방식 B: `react-native-keyboard-controller` 도입.** edge-to-edge를 유지해야
하므로 방식 A(수동 `adjustResize`+`KeyboardAvoidingView`)는 애초에 불가능하다(위 진단).
`react-native-keyboard-controller`(1.22.5)는 Android 네이티브 레벨에서 `WindowInsetsAnimationCompat`로
키보드 인셋을 직접 추적해 edge-to-edge와 무관하게 동작한다 — 소스(`EdgeToEdgeReactViewGroup.kt`)를
직접 열어 확인: `KeyboardProvider`가 마운트되면 `windowSoftInputMode==adjustResize`인
동안 앱 콘텐츠 뷰에 키보드 높이만큼 자동으로 하단 마진을 주는 패시브 동작을 기본 제공하고
(이게 기존 `adjustResize`가 하던 일을 edge-to-edge 위에서 대신 재현한다), 화면이 이
라이브러리의 `KeyboardAvoidingView`/`KeyboardStickyView` 같은 컴포넌트를 쓰면 그 화면에
한해 패시브 마진이 꺼지고 해당 컴포넌트의 애니메이션 기반 처리로 넘어간다(이중 보정 없음,
소스로 확인) — 그래서 화면별로 필요한 곳에만 정밀 제어를 얹는 구조가 안전하게 성립한다.
iOS는 원래부터 OS 자동 리사이즈가 없어 `KeyboardAvoidingView` 자체가 필수였다는 점도
방식 B를 더 확실하게 만든다(방식 A로는애초에 iOS를 못 고친다).

**도입 비용.** 네이티브 의존성 추가 — `react-native-keyboard-controller`(1.22.5) +
`react-native-reanimated`(4.6.0, peer dep — 처음엔 3.19.5로 설치했으나 RN 0.86의
New Architecture UIManager API 제거분과 충돌해 컴파일 실패, RN 0.83-0.87을 명시 지원하는
4.6.0 + `react-native-worklets`(0.12.1, reanimated 4가 워클릿 엔진을 분리한 별도 peer dep)로
교체해 해결) — Android debug 빌드로 실제 컴파일 확인 완료. **네이티브 모듈이라 사용자는
앱을 다시 설치해야 적용된다.** iOS는 Windows 환경이라 여기서 `pod install`을 못 돌렸다 —
Mac 개발 환경에서 한 번 실행 필요.

**시안 근거 (사용자 확인, 2026-09-13).**
- (a) 전체 화면 폼 — `폴더_메인화면.png` Case C(폴더 메인 검색): 키보드가 뜨면 콘텐츠
  영역이 키보드 높이만큼 줄고, 하단 탭바는 키보드에 가려짐 → 표준 `adjustResize` 동작.
- (b) 모달 — `더보기_기록보관_보관제목변경.png`: 다이얼로그가 중앙이 아니라 키보드
  상단에 접해서 올라옴, 딤 영역도 키보드 위까지만, 취소/변경 버튼 전부 보임 → 하단이
  키보드 상단에 붙는다(중앙정렬 유지한 채 밀어올리는 게 아니다).
- (c) 바텀시트 — 목업 없음. (b)와 같은 원칙 적용은 사용자 판단(시안 근거 아님).
- `내프로필_탈퇴하기_권한이전_사유선택.png` Case A는 키보드가 안 그려져 있어 기준으로
  안 씀(입력 필드 확장만 보여주는 목업).

**공용 처리 3곳.**

1. `ScreenContainer.tsx` — (a). `SafeAreaView` 안쪽을 라이브러리의 `KeyboardAvoidingView`
   (`behavior="height"`)로 감쌌다. 'height'를 고른 이유: 콘텐츠를 아래로 미는 'padding'과
   달리 컨테이너 자체 높이를 줄여, flex 레이아웃 맨 아래 있는 CTA 버튼이 자연히 줄어든
   영역 끝(키보드 바로 위)으로 따라온다 — Case C가 요구하는 "콘텐츠 영역이 줄어든다"와
   정확히 같은 모양. `avoidKeyboard` prop(기본 `true`)으로 화면별로 끌 수 있게 뒀다.
   키보드가 없을 때는 `KeyboardAvoidingView`가 아무 효과 없는 빈 래퍼라 기존 23개 화면
   렌더가 그대로다.
2. `Dialog.tsx` — (b). RN `Modal`은 별도 윈도우지만 라이브러리가 `ModalAttachedWatcher`로
   RN `Modal`을 명시적으로 지원한다(소스 확인) — 별도 처리 불필요. `useKeyboardState`로
   키보드 표시 여부를 구독해 그 동안만 오버레이를 `justifyContent:'center'`→`'flex-end'`로
   바꾸고(평소엔 기존과 동일), 카드를 `KeyboardStickyView`로 감쌌다 — 카드의 그 순간
   위치(화면 맨 아래, 패딩 0)에서 정확히 키보드 높이만큼 위로 붙어 시안대로 키보드
   상단에 딱 붙는다. 레이아웃 전환 시점(키보드 높이가 막 0을 벗어나거나 거의 0으로
   돌아오는 순간)엔 `translateY`도 0에 가까워 전환이 튀지 않게 했다.
3. `BottomSheet.tsx` — (c). `sheet`는 `backdrop`(flex:1)과 형제로 배치돼 별도 포지셔닝
   없이도 항상 화면 맨 아래에 붙는 구조였다(기존 flex 트릭) — 그래서 `KeyboardStickyView`로
   감싸기만 하면 그 위치에서 바로 키보드 높이만큼 올라간다. 사용자 판단(시안 근거 없음)을
   그대로 반영.

**화면별 CTA/스크롤 예외, 탭-바깥-닫힘 동작**은 실기기 확인 후 판단 — 이번 라운드는
코드 적용까지만 하고 실기기 검증은 사용자가 직접 진행한다(요청).

**확인 경로(참고용, 실기기 검증은 사용자가 진행).**
- 전체 화면 폼: 폴더 탭(하단 탭바) 검색창 탭 — Case C와 직접 대조 가능.
- 모달: 더보기 → 보관함 → 카드 제목 옆 연필 아이콘 → "보관 제목 변경하기" 다이얼로그.
- 전체 화면 폼(예산 필드): 폴더 탭 → "+" → 새 장부 생성하기 → 이름 입력.
- 바텀시트: 더보기 → 전체 모임 관리 → "코드로 참여하기"(초대코드 입력 시트) 또는
  내역 추가 흐름의 메모 입력 시트.
- 스크롤 폼: 납부 관리 탭 → "+"(회비 생성) — 필드 여러 개.
- §5-11 네비게이션 시나리오(5-1~5-9)도 같은 라운드에 앱 경로로 재확인 가능:
  폴더 탭 진입/전환, 보고서 생성 플로우, 회비 생성/삭제/마감, 모임 생성 완료 후 뒤로가기.

**명세 근거(2026-09-19 확인)**: 키보드 회피는 명세 동작이다 — `ETC-4-PAGE-15-0`(`글로벌설정_내프로필_프로필변경.png#0`) 목업에 키보드가 뜬 상태로 `저장하기` 버튼이 키보드 위에 그려져 있음(하단 `#E6E6E6`이 키보드). 다른 시안의 키보드 목업은 미조사(사용자가 별도 확인).

**탭 화면은 `avoidKeyboard={false}`가 맞다 — 실기기 확인 (2026-09-19)**: 폴더 탭(`FolderScreen`, 검색창)에서 키보드가 떠도 하단 탭바가 밀리지 않았다. 탭 화면(`FolderScreen`·`DuesScreen`·`MoreScreen`)을 `ScreenContainer`로 옮길 때 `avoidKeyboard={false}`로 종전 구조를 유지한 9-5 판단이 실기기에서 맞는 것으로 확인됐다.

### 5-13. DUE 도메인 묶음 4 대조 — 필드 형태·배경·관찰 (2026-09-13)

§5-13: 장부·기간 필드를 라벨 아래 박스형으로 수정(`DuesCreate`/`DuesEdit`), `TextArea.autoFocus` 추가(`DuesRequestScreen`), 배경 5건 확정(§5-7), **기간 자릿수는 시트별로 따른다(DUE 4자리 / 보고서 2자리) — 임의로 통일하면 결함**, 앱바 문구 불일치는 §5-4 #4 → §2 / design-diff.md §3.

### 5-14. DUE 도메인 묶음 5 — 회비 상세 5상태 대조 (2026-09-17)

§5-14: 모임원 선택 진입 경로·수정 제목 활성은 결함 아님 / CLOSED에서 "회비 수정" 메뉴 노출로 수정 / CLOSED 수정 화면은 필드 잠금 규정 없어 현재 동작 유지(서버가 409로 차단) / 배경 지정 / 나머지 5상태 일치 → §2 / design-diff.md §3. 불일치 #5·#6은 §5-4 목록.

### 5-15. 캐러셀 페이지 스냅 결함 (2026-09-18)

- [해결] 장부 상세(`FDR-2-PAGE-05-0`)·기간 보고서 상세(`ETC-4-PAGE-07-0`) 캐러셀 2면 스냅 어긋남 — 슬라이드 폭 = 화면 폭 + 카드 여백은 슬라이드 안쪽 padding으로 옮겨 `pagingEnabled`만으로 스냅 (2026-09-18) — 함정 기록: `docs/lessons.md` 1-8

### 5-16. 폴더 예산 설정 / 장부 이름 변경 모달 (2026-09-18)

§5-16: 이름 변경 글자수 **20자 확정**(2026-09-18, 앱 내 4/4 필드 20 + 서버 도메인 문서 3곳 + 설명표 2회 명시) — 목업 "10자"는 불일치 #8(기획 확인 대기), 예산 설정 빈 화면 문구는 #7. 예산 설정 리스트 행(`SelectionListItem`, 최신 생성순)·이름 변경 모달 안내 문구/자동 포커스/placeholder 수정, 배경은 `BACKGROUND_PRIMARY` → §2 / lessons.md §3.

### 5-17. 컴포넌트 미사용 기능 감사 (2026-09-18)

`src/components/` 전체(61개 파일, `.stories.tsx` 제외)를 스크립트로 훑어 Props 타입에는
있는데 어떤 화면도 JSX에서 실제로 넘기지 않는 prop을 찾았다. 방법: 각 컴포넌트의
default export 이름으로 다른 파일에서의 JSX 사용처를 전부 찾고, 그 여닫는 태그의 속성
구간(`<Comp ...>`) 안에 각 prop 이름이 등장하는지 확인 — 등장하는 화면이 0곳이면 후보로
잡았다(불리언 shorthand(`<X foo />`)도 잡히게 처리, `children`은 JSX 중첩으로 전달되는
경우가 대부분이라 이 방식으로 못 잡아 제외). **고치지 않았다 — 목록만.**

#### 컴포넌트 자체가 어디서도 렌더되지 않음 (5개)

이 5개는 JSX로 인스턴스화되는 곳이 전무하다 — 모든 prop이 자동으로 "0곳 사용"이다. 개별
prop 표에 넣는 대신 따로 뺐다.

| 컴포넌트 | 파일 |
|---|---|
| `BackupCard` | `components/Data Display/Card/BackupCard.tsx` |
| `ReportCard` | `components/Data Display/Card/ReportCard.tsx` |
| `Receipt` | `components/Data Display/Receipt/Receipt.tsx` |
| `Tooltip` | `components/Data Display/Tooltip/Tooltip.tsx` |
| `PlaceholderNotice` | `components/Feedback/Placeholder/PlaceholderNotice.tsx` |

(`Receipt`는 이름이 흔해 `types/receipt.ts`의 `Receipt` 타입과 섞여 잡힐 뻔했다 — `<Receipt`
JSX 태그로 직접 확인해 실제 렌더 0곳임을 재확인함.)

#### 렌더는 되지만 특정 prop만 안 쓰임

| 컴포넌트 | prop | 타입 | 사용 화면 수 | 판단 필요 여부 |
|---|---|---|---|---|
| `Accordion` | `defaultOpen` | `boolean` | 0 | 필요 |
| `AvatarList` | `showIndicator` | `boolean` | 0 | 필요 |
| `Badge` | `icon` | `ImageSourcePropType` | 0 | 필요 |
| `Calendar` | `disabledDates` | `string[]` | 0 | 필요 |
| `InfoCard` | `tags` | `string[]` | 0 | 필요 |
| `InfoCard` | `onRemoveTag` | `(index: number) => void` | 0 | 필요 |
| `InfoCard` | `onAddTag` | `() => void` | 0 | 필요 |
| `InfoCard` | `memoPlaceholder` | `string` | 0 | 필요 |
| `CheckListItem` | `disabled` | `boolean` | 0 | 필요 |
| `MemberListItem` | `disabled` | `boolean` | 0 | 필요 |
| `ProgressBar` | `style` | `ProgressBarStyle` | 0 | 필요 |
| `Snackbar` | `actionLabel` | `string` | 0 | 필요(사용자 기존 발견 3건 중 하나) |
| `Snackbar` | `onActionPress` | `() => void` | 0 | 필요(위와 짝) |
| `AttachmentAddButton` | `type` | `AttachmentAddButtonType` | 0 | 필요 |
| `Button` | `negative` | `boolean` | 0 | 필요 — `hierarchy="negative"`류 다른 경로로 파괴적 액션을 이미 표현 중일 수 있음, 중복 API 가능성 |
| `FAB` | `extended` | `boolean` | 0 | 필요 |
| `FAB` | `label` | `string` | 0 | 필요(`extended`와 짝일 가능성) |
| `IconButton` | `disabled` | `boolean` | 0 | 필요 |
| `IconButton` | `showPushBadge` | `boolean` | 0 | 필요 |
| `IconButton` | `overlay` | `boolean` | 0 | 필요 |
| `CheckBox` | `shape` | `CheckBoxShape` | 0 | 필요 — `shape="circle"` 변형은 어떤 화면도 안 씀(기본값 `square`만 사용). ※ 정정(2026-09-19): 이 칸에 원래 "§5-4 기존 기록이 틀렸다"고 적었는데 **오독이었다** — 해당 서술은 §5-4가 아니라 §5-10(1352행)에 있고, 그 내용("시안이 정사각형이라 기본값 `square`가 이미 맞다 — 정상")은 `shape`를 넘긴다고 주장한 게 아니라 안 넘겨도 맞다는 뜻이라 사실과 일치한다. 기록은 틀리지 않았다 |
| `DateField` | `placeholder` | `string` | 0 | 필요 |
| `SearchField` | `size` | `SearchFieldSize` | 0 | 필요 |
| `SearchField` | `onSubmit` | `() => void` | 0 | 필요 |
| `TextField` | `success` | `boolean` | 0 | 필요 |
| `ScreenContainer` | `edges` | `readonly Edge[]` | 0 | 낮음 — 기본값(`['top','bottom']`)으로 대부분 충분해 보임 |
| `ScreenContainer` | `style` | `StyleProp<ViewStyle>` | 0 | 낮음 — 탈출구용 prop으로 보임 |
| `ScreenContainer` | `avoidKeyboard` | `boolean` | 0 | 낮음 — 이번 세션(§5-12)에 키보드 대응 도입하며 추가한 opt-out 스위치, 지금까지 끌 필요가 있던 화면이 없었을 뿐 |
| `AppBar` | `subtitle` | `string` | 0 | 필요 |
| `AppBar` | `showDropdown` | `boolean` | 0 | 필요 |
| `AppBar` | `onPressDropdown` | `() => void` | 0 | 필요 — 위 `showDropdown`과 짝, 모임 전환 드롭다운류 화면에 의도된 것일 수 있음 |
| `AppBar` | `selectedCount` | `number` | 0 | 필요 |
| `AppBar` | `showSelectionCount` | `boolean` | 0 | 필요 — 위 `selectedCount`와 짝, 다중 선택 모드 앱바용으로 보임 |
| `Menu` | `selectedKey` | `string` | 0 | 낮음 — 오늘(§5-16) 폴더 헤더 메뉴에서 그리드/리스트 체크 표시를 시안에 없다는 이유로 일부러 안 씀. 다른 메뉴 화면엔 필요할 수 있음 |
| `ToolsMenu` | `selectedKey` | `string` | 0 | 낮음 — 위와 같은 이유로 추정, 미확인 |

**판단 보류(스크립트 한계로 확신 낮은 것)**: 없음 — 위 목록은 전부 소스에서 직접 확인한
결과다. 다만 정적 텍스트 매칭이라 `{...spreadProps}`로 prop을 통째로 넘기는 호출부가 있다면
그 화면은 "사용"으로 못 잡았을 수 있다 — 이번 조사에서 그런 패턴은 못 봤지만 완전히
배제하지는 않는다.

**§5-10과의 중복**: 같은 종류의 조사를 2026-09-13 §5-10 "컴포넌트 연결 누락 전수 점검"이 이미
한 번 했다((b) 미리 만든 prop / (c) 죽은 코드 후보 표). 이번 표의 상당수(`Accordion.defaultOpen`,
`AvatarList.showIndicator`, `Badge.icon`, `Calendar.disabledDates`, `InfoCard.*`, `Button.negative`,
`IconButton.overlay` 등)는 그 표와 겹친다. 이번에 새로 잡힌 건 `Snackbar.actionLabel/onActionPress`,
`SearchField.size/onSubmit`, `TextField.success`, `DateField.placeholder`, `AppBar.subtitle/
showDropdown/onPressDropdown/selectedCount/showSelectionCount`, `IconButton.disabled/showPushBadge`,
`Menu.selectedKey`/`ToolsMenu.selectedKey`, `ScreenContainer.edges/style/avoidKeyboard` 등이다.

**※ 갱신(2026-09-20 10-6)**: `SearchField`에 `autoFocus`·`onClear`를 추가했고 지금은 `LedgerSearchScreen`만 쓴다(나머지 사용처 7곳은 기본값 = 기존 동작). `variant="outline"`은 이 표의 미사용 목록에 없다 — 이미 구현돼 있었고 `MemberManageScreen`·`ReportLedgerSelectScreen`이 쓰고 있었으며 이번에 `LedgerSearchScreen`이 추가로 쓴다. `size`·`onSubmit`은 여전히 미사용.

#### 미사용 컴포넌트 5종 — 처리 판단 자료 (2026-09-19, 삭제하지 않음)

| 컴포넌트 | 파일(줄 수) | 추가 / 마지막으로 만져진 커밋 | props 시그니처 | 명세·`@screen` 흔적 | 고아화 시점(2026-09-19, `git log -S` 추적) |
|---|---|---|---|---|---|
| `BackupCard` | `components/Data Display/Card/BackupCard.tsx` (88줄) | 추가 `ae095bd` 2026-08-15 "refactor: 컴포넌트 폴더 재구성 및 디자인 시스템 정합성 개선" / 마지막 `cc35ec3` 2026-09-01 "feat: 컴포넌트 라이브러리 API 연동 대응 업데이트" (총 2커밋) | `{ title: string; dateTimeLabel: string; capacityLabel: string; onEditTitle?(); onDelete?(); onViewRecords() }` — 제목 수정/삭제 아이콘 + 백업 정보 + 기록보기 버튼 카드 | `spec-sheet-map.tsv`/`billage-ia.md`에 컴포넌트명·"백업 카드" 흔적 없음, 코드 `@screen` 주석 없음. §5-10(1349행)이 "이름상 보관함(`ETC-2-PAGE-06-0`)용으로 보이나 `ArchiveListScreen`이 `CardBase` 커스텀 레이아웃으로 이미 시안 일치 — 대체된 것으로 추정"이라 적음(추정) | **화면이 import한 적 없음** — `git log -S BackupCard -- src/screens src/navigation App.tsx` 0건. `import BackupCard ` 문자열이 나오는 커밋은 `ae095bd`(2026-08-15)의 `BackupCard.stories.tsx` 하나뿐. 최초 생성은 `609b114`(2026-08-05, `git log --follow --diff-filter=A`)이고 위 "추가" 열의 `ae095bd`는 폴더 이동 커밋. 태어날 때부터 화면 연결 없음(고아화 시점 없음) |
| `ReportCard` | `components/Data Display/Card/ReportCard.tsx` (106줄) | 추가 `ae095bd` 2026-08-15 / 마지막 `cc35ec3` 2026-09-01 (총 2커밋) | `{ title: string; dateRangeLabel?: string; income: number; expense: number; variant?: 'folder'\|'card'; onPress?() }` — 좌상단 폴더탭 SVG + 수입/지출 요약 카드 | 명세 흔적 없음. §5-10(1346행)이 "`ReportMainScreen`이 `CardBase` 커스텀 레이아웃으로 이미 시안 일치 — 그 이전에 만들어졌다 대체된 것으로 보임"이라 적음(추정) | **화면이 import한 적 없음** — 같은 조사 결과(화면/네비게이션 0건, import 문자열은 `ae095bd`의 `ReportCard.stories.tsx`뿐). 최초 생성 `609b114`(2026-08-05) |
| `Receipt` | `components/Data Display/Receipt/Receipt.tsx` (115줄) | 추가 `ae095bd` 2026-08-15 / 마지막 `cc35ec3` 2026-09-01 (총 2커밋) | `{ items: { name: string; quantity: number; amount: number }[]; total: number }` — 상품명/수량/금액 표 + 합계 영수증 카드 | 명세 흔적 없음(이름이 흔해 `types/receipt.ts`의 `Receipt` 타입과 혼동됨 — JSX `<Receipt` 직접 확인으로 렌더 0곳 재확인). 후보 화면 추정: 영수증 스캔 결과/영수증 상세(`ADD-3-*`, `DTB-3-PAGE-*`) — 미확인 | **2026-09-01 `a7a5a18`**("폴더/장부/내역/회비/모임관리 화면 실 API 연동") — 이 커밋에서 `screens/Folder/TransactionDetailScreen.tsx`의 `import Receipt from '../../components/Data Display/Receipt/Receipt'`가 삭제됨(`a7a5a18^`엔 그 import가 있었고 `ae095bd`가 경로만 갱신). 최초 생성 `609b114`. **"2026-09-11 인앱 영수증 그리드 제거 때"가 아니다** — `ReceiptGalleryPickerScreen.tsx`는 같은 `a7a5a18`에서 **신규 추가**된 파일이고, 09-11의 "실제 갤러리로 교체"는 아직 커밋 전 워킹 트리 변경이다. Receipt 고아화와 갤러리 화면 신설이 같은 커밋이긴 하나 09-11 그리드 제거가 원인은 아님 |
| `Tooltip` | `components/Data Display/Tooltip/Tooltip.tsx` (149줄) | 추가 `ae095bd` 2026-08-15 / 마지막 `cc35ec3` 2026-09-01 (총 2커밋) | `{ content: string; position?: 'top'\|'bottom'\|'left'\|'right'; visible: boolean; children }` — 꼬리 방향 SVG가 붙은 말풍선 | 명세 흔적 없음. `docs/design-verification.md` §5-10 (c) 표에 "컴포넌트 전체(고아)"로만 기록, 대응 화면 언급 없음 | **화면이 import한 적 없음** — 같은 조사 결과(import 문자열은 `ae095bd`의 `Tooltip.stories.tsx`뿐). 이 컴포넌트는 `ae095bd`(2026-08-15)에서 처음 추가됨 |
| `PlaceholderNotice` | `components/Feedback/Placeholder/PlaceholderNotice.tsx` (30줄) | 추가 `ae095bd` 2026-08-15 / 마지막 `cc35ec3` 2026-09-01 (총 2커밋) | `{ title: string }` — "{title} 화면은 준비 중이에요." 고정 문구 | 명세 흔적 없음. `api-integration-plan.md:231,261`이 로딩/에러 표시 톤 참고로 언급, 빈 목록에는 문구가 고정돼 못 쓴다고 판단. §5-10(1401행)은 "고객지원/알림 화면의 향후 에러·빈 상태용으로 추정" | **2026-09-01 `a7a5a18`** — 마지막 사용처였던 `screens/DuesScreen.tsx`·`TransactionsScreen.tsx`(삭제)와 `MoreScreen.tsx`(수정)의 자리표시자 import가 빠진 시점. 사용처는 `8bc30fd`(2026-07-30 대시보드 구현, 원래 경로 `components/PlaceholderNotice.tsx`)에서 생긴 탭 자리표시자 4개(`DuesScreen`/`FolderScreen`/`MoreScreen`/`TransactionsScreen`)였고 `FolderScreen`은 `53b6a80`(2026-08-05 "폴더 탭 구현")에서 먼저 빠졌다 |

5개 모두 `.stories.tsx`(Storybook)가 있고 같은 두 커밋(`ae095bd` 폴더 재구성, `cc35ec3` 라이브러리 정비)에서만 만져졌다 — 화면 개발 중에 손댄 이력이 없다.

**2026-09-19 `git log -S` 추적 결과(위 표 마지막 열)**: 5개가 두 갈래로 갈린다.
- **처음부터 화면에 안 붙은 3개** — `BackupCard`/`ReportCard`/`Tooltip`: 화면·네비게이션·`App.tsx`에서 import된 커밋이 0건(import 문자열은 스토리 파일에만 있음). "디자인 시스템 라이브러리에 미리 넣어둔 것"과 "화면이 다른 컴포넌트로 만들어지며 안 쓰게 된 것"(§5-10이 `ReportCard`에 적은 추정) 중 어느 쪽인지 이력만으로는 가릴 수 없다 — **판단 보류**.
- **한때 쓰이다 빠진 2개** — `Receipt`(`TransactionDetailScreen`이 쓰다 2026-09-01 `a7a5a18`에서 제거), `PlaceholderNotice`(탭 자리표시자가 쓰다 `53b6a80`·`a7a5a18`에서 실화면으로 교체되며 제거). 화면이 실제 구현으로 대체되며 고아가 된 것이라 "미리 만든 것"은 아니다. 삭제 여부는 이번에도 사용자 판단(삭제 안 함).
- 위 "추가" 열 정정: `ae095bd`는 폴더 이동 커밋이다. 최초 생성은 `BackupCard`·`ReportCard`·`Receipt` `609b114`(2026-08-05), `Tooltip` `ae095bd`, `PlaceholderNotice` `8bc30fd`(2026-07-30) — `git log --follow --diff-filter=A` 기준.

#### 이미지 에셋 미사용 (2026-09-19 9-2, 삭제·연결 안 함)

`src/assets/images/`의 그래픽 4종 중 `receipt-graphic.png`는 **어디에서도 참조되지 않는다**(`grep` 0건). `album-graphic.png`·`report-graphic.png`·`statistics-graphic.png`는 `src/types/dashboard.ts`(대시보드 간편 서비스 카드)에서만 쓰인다. `ReceiptScanFailedView`(ADD-4-PAGE-01-1)는 이 에셋 대신 회색 `previewBox`를 그린다 — 어느 화면 어디에 넣을지는 명세서를 보고 사용자가 정한다(`docs/design-diff.md` 1-1).

### 5-18. ScreenContainer 미적용 화면 실태 (2026-09-19, 조사만 — 소스 수정 없음)

§5-7이 "구조 불일치"(D)로 분류한 화면(PAGE) 59개 Screen ID의 실제 JSX/스타일을 읽어 정리했다. 시트·모달·스낵바 43개는 부모 화면 종속이라 이번 대상이 아니다. 59개 ID는 **파일 기준 56개**다(한 파일이 여러 ID를 그리는 `FolderScreen`·`TransactionDetailScreen`·`TransactionRegisterScreen`·`MemberAddIndividualScreen` 등, 그리고 약관 3개 파일이 `COM-3-PAGE-01-0` 1개를 공유) — 표는 파일 행 단위다.

**조사 방법·한계**: 소스 텍스트를 정규식으로 읽은 정적 조사다. (1) 최상위 래퍼 = 컴포넌트 함수의 `return` 첫 JSX 태그(로딩/에러 분기 return이 따로 있어도 본 화면 기준). (2) 배경 = 루트 `SafeAreaView`의 `style`이 가리키는 스타일 키(없으면 `container`)의 `backgroundColor`만 본다 — 자식 요소가 배경을 채우는 경우는 못 잡는다("미지정"은 "배경 없음"이 아니라 "루트에서는 안 줌"). (3) 키보드 = 파일 JSX에 `TextField/TextInput/SearchField/TextArea/VerificationField`가 직접 있는지 + `KeyboardAvoidingView`/`react-native-keyboard-controller` import 여부. 하위 컴포넌트 안에만 있는 입력은 안 잡히고, `BottomSheet`/`Dialog` 안 입력은 잡히지만 그 컴포넌트가 자체 처리한다(아래 (a) 정정). (4) 스크롤 = 그 파일에 `ScrollView/FlatList/SectionList`가 직접 있는지. 참고: 앱 루트에 `KeyboardProvider`(§5-12)가 있어 안드로이드 패시브 리사이즈가 전 화면에 깔려 있다 — "키보드 처리 없음"은 "화면/컨테이너 차원의 명시 처리 없음"이지 "키보드가 반드시 가린다"는 뜻이 아니며, 실기기 확인은 하지 않았다(사용자 담당).

| Screen ID | 파일(`src/screens/` 기준) | 최상위 래퍼 | SafeArea edges | 배경색 지정 방식(루트) | 키보드 처리 | 스크롤 컨테이너 | 난이도 | 마이그레이션 완료(6-5) |
|---|---|---|---|---|---|---|---|---|
| `COM-1-PAGE-01-0` | `LoginScreen.tsx` | Pressable | 해당없음(SafeAreaView 없음) | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거), `edges={['bottom']}`(루트가 `View`+`paddingTop: 80`), **스크롤 추가**) |
| `COM-2-PAGE-01-0` | `Signup/TermsAgreementScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 입력없음 | 없음 | B | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `ScreenContainer background="secondary" edges={['bottom']}` — 상단 인셋을 안 줘 기존 `paddingTop: 60` 배치 유지, 루트 `style`(padding)은 그대로 전달, **키보드 회피(기본 true) 새로 적용**) |
| `COM-2-PAGE-02-0` | `PasswordReset/PasswordResetScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `ScreenContainer background="secondary" edges={['bottom']}` — 상단 인셋을 안 줘 기존 `paddingTop: 60` 배치 유지, 루트 `style`(padding)은 그대로 전달, **키보드 회피(기본 true) 새로 적용**) |
| `COM-3-PAGE-01-0` | `Signup/TermsOfServiceScreen.tsx` | LegalDocumentView → SafeAreaView | top, bottom (LegalDocumentView 내부) | 미지정 | 입력없음 | ScrollView(LegalDocumentView 내부) | A | ✅ 2026-09-19(6-6, `LegalDocumentView` 1곳 — primary, 미판정-추정 적용) |
| `COM-3-PAGE-01-0` | `Signup/PrivacyPolicyScreen.tsx` | LegalDocumentView → SafeAreaView | top, bottom (LegalDocumentView 내부) | 미지정 | 입력없음 | ScrollView(LegalDocumentView 내부) | A | ✅ 2026-09-19(6-6, 위와 같음) |
| `COM-3-PAGE-01-0` | `Signup/MarketingConsentScreen.tsx` | LegalDocumentView → SafeAreaView | top, bottom (LegalDocumentView 내부) | 미지정 | 입력없음 | ScrollView(LegalDocumentView 내부) | A | ✅ 2026-09-19(6-6, 위와 같음) |
| `COM-3-PAGE-02-0` | `Signup/SocialSignupInfoScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `ScreenContainer background="secondary" edges={['bottom']}` — 상단 인셋을 안 줘 기존 `paddingTop: 60` 배치 유지, 루트 `style`(padding)은 그대로 전달, **키보드 회피(기본 true) 새로 적용**) · 9-3 **스크롤 추가**(`ScrollView`+`keyboardShouldPersistTaps="handled"`, CTA 고정) |
| `COM-3-PAGE-03-0` | `Signup/SignupInfoScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `ScreenContainer background="secondary" edges={['bottom']}` — 상단 인셋을 안 줘 기존 `paddingTop: 60` 배치 유지, 루트 `style`(padding)은 그대로 전달, **키보드 회피(기본 true) 새로 적용**) · 9-2 **스크롤 추가**(`ScrollView`+`keyboardShouldPersistTaps="handled"`, CTA 고정) |
| `COM-3-PAGE-04-0` | `PasswordReset/PasswordResetSentScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 입력없음 | 없음 | B | |
| `COM-4-PAGE-01-0` | `Signup/EmailVerificationScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 없음(VerificationField) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer`로 이동 — 스낵바 래퍼는 `bottom: 88`(하단 CTA 위)이라 슬롯(bottom 24)을 못 써 **absolute 래퍼 유지**, `edges={['bottom']}`(루트가 `View`+`paddingTop: 60`, 스타일 그대로)) |
| `COM-5-PAGE-01-0` | `Signup/SignupCompleteScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 입력없음 | 없음 | B | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `ScreenContainer background="secondary" edges={['bottom']}` — 상단 인셋을 안 줘 기존 `paddingTop: 60` 배치 유지, 루트 `style`(padding)은 그대로 전달, **키보드 회피(기본 true) 새로 적용**) |
| `DSH-1-PAGE-01-0` | `Dashboard/DashboardScreen.tsx` | SafeAreaView | top | 상수 BACKGROUND_PRIMARY = #F0F5FE | 입력없음 | ScrollView | B | |
| `DSH-2-PAGE-01-0` | `Notification/NotificationScreen.tsx` | SafeAreaView | top, bottom | 상수 BACKGROUND_SECONDARY = #FFFFFF | 입력없음 | FlatList | A | ✅ 2026-09-19(6-6, secondary — 코드 기존값 유지) |
| `DSH-2-PAGE-03-0` | `Calendar/CalendarScreen.tsx` | SafeAreaView | top, bottom | 상수 BACKGROUND_SECONDARY = #FFFFFF | 입력없음 | ScrollView | A | ✅ 2026-09-19(6-6, secondary — 코드 기존값 유지) |
| `DTB-1-PAGE-01-0` | `Transactions/TransactionsScreen.tsx` | SafeAreaView | top (2026-09-21: bottom 제거 — 탭바 위 파란 띠; 탭바가 화면 위에 겹쳐 리스트 하단 패딩 = 78 + 96) | 상수 BLUE_50 = #F0F5FE | 입력없음 | SectionList | A | ✅ 2026-09-19(6-6, primary — 코드 기존값 유지) |
| `DTB-2-PAGE-01-0` | `Transactions/TransactionSearchScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(SearchField) | SectionList | B | ✅ 2026-09-19(8-6, secondary — 명세 실측 v5 확정, edges 기본값과 동일, 루트 `container{flex:1}` 제거, **키보드 회피(기본 true) 새로 적용**) |
| `DTB-2-PAGE-02-0`<br>`DTB-2-PAGE-03-0` | `Folder/TransactionDetailScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView | B(6-5 재분류) | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `DTB-3-PAGE-01-0` | `Folder/TransactionReceiptDetailScreen.tsx` | SafeAreaView | top, bottom | 상수 FILL_INVERSE = #374151 | 입력없음 | 없음 | C | |
| `DTB-3-PAGE-02-0`<br>`ADD-1-PAGE-01-0`<br>`ADD-4-PAGE-01-0` | `Transactions/TransactionRegisterScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView | C | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer`로 이동 — 스낵바 래퍼는 `bottom: 88`(하단 CTA 위)이라 슬롯(bottom 24)을 못 써 **absolute 래퍼 유지**) |
| `FDR-1-PAGE-01-0`<br>`FDR-2-PAGE-04-0` | `Folder/FolderScreen.tsx` | SafeAreaView | top, bottom | 상수 BLUE_50 = #F0F5FE | 없음(SearchField) | FlatList | B |  ✅ 2026-09-19(9-5, primary — §2 명세 배경 일치, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거), **탭 화면 + `SearchField`라 `avoidKeyboard={false}`로 키보드 동작은 종전 그대로 둠**(Case C 키보드 동작은 §5-12, 실기기 확인 대상)) |
| `FDR-2-PAGE-01-0` | `Folder/FolderSelectMoveScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | FlatList | A | ✅ 2026-09-19(8-6, `primary`→`secondary` — 명세 실측 v5 확정, 이전 `primary`는 미판정-추정이었음) |
| `FDR-2-PAGE-02-0` | `Folder/FolderBudgetListScreen.tsx` | SafeAreaView | top, bottom | 상수 BACKGROUND_PRIMARY = #F0F5FE | 없음(TextField) | FlatList | B |  ✅ 2026-09-19(9-5, primary — §2 명세 배경 일치, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `FDR-2-PAGE-05-0` | `Folder/LedgerDetailScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView+FlatList | B | ✅ 2026-09-19(항목 1, 원래 B) |
| `FDR-3-PAGE-01-0` | `Folder/FolderMoveDestinationScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | FlatList | B(6-5 재분류) | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer`로 이동 — 스낵바 래퍼는 `bottom: 88`(하단 CTA 위)이라 슬롯(bottom 24)을 못 써 **absolute 래퍼 유지**) |
| `FDR-3-PAGE-02-0` | `Folder/LedgerSearchScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 없음(SearchField) | FlatList | B | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `ScreenContainer background="secondary" edges={['bottom']}` — 상단 인셋을 안 줘 기존 `paddingTop: 60` 배치 유지, 루트 `style`(padding)은 그대로 전달, **키보드 회피(기본 true) 새로 적용**) |
| `FDR-3-PAGE-03-0` | `Folder/LedgerCreateScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer`로 이동 — 스낵바 래퍼는 `bottom: 88`(하단 CTA 위)이라 슬롯(bottom 24)을 못 써 **absolute 래퍼 유지**, `edges={['bottom']}`(루트가 `View`+`paddingTop: 60`), **스크롤 추가**) |
| `DUE-1-PAGE-01-0` | `Dues/DuesScreen.tsx` | SafeAreaView | top, bottom | 상수 BLUE_50 = #F0F5FE | 입력없음 | FlatList | B | ✅ 2026-09-19(9-5, primary — §2 명세 배경 일치, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거), 탭 화면이라 `avoidKeyboard={false}`(입력 없음). 9-5에서 표에 빠져 있던 행을 추가) |
| `DUE-2-PAGE-01-0`<br>`DUE-3-PAGE-01-0` | `Dues/DuesCreateScreen.tsx` | SafeAreaView(return 2개) | top, bottom | 상수 BACKGROUND_SECONDARY = #FFFFFF | 없음(TextField,SearchField) | ScrollView | B | ✅ 2026-09-19(9-5, secondary — §2 명세 배경 일치, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거), 두 return 모두 하단 CTA(`footer`) 위로 `snackbarOffset={68}`(52+16). 9-5에서 표에 빠져 있던 행을 추가) |
| `DUE-2-PAGE-03-0`<br>`DUE-2-PAGE-03-1` | `Dues/DuesDetailScreen.tsx` | SafeAreaView(return 2개) | top, bottom | 상수 BACKGROUND_PRIMARY = #F0F5FE | 입력없음 | ScrollView | B | ✅ 2026-09-19(9-5, primary — §2 명세 배경 일치, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거), 하단 CTA(`ctaWrapper`)는 `canChangeStatus`일 때만 있어 `snackbarOffset={canChangeStatus ? 68 : 0}`. "상하 다름" 구조는 이번에도 안 고침. 9-5에서 표에 빠져 있던 행을 추가) |
| `DUE-2-PAGE-02-0` | `Member/MemberManageScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(SearchField) | FlatList | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `DUE-3-PAGE-02-0` | `Dues/DuesMemberEditScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(SearchField) | ScrollView | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `DUE-3-PAGE-03-0` | `Member/MemberDetailScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView | B(6-5 재분류) | ✅ 2026-09-19(9-3, primary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `DUE-3-PAGE-06-0` | `Dues/DuesEditScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(TextField) | ScrollView | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거). 9-4에서 표에 빠져 있던 행을 추가) |
| `DUE-4-PAGE-01-0`<br>`DUE-5-PAGE-01-0` | `Member/MemberAddIndividualScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(TextField,TextArea) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer`로 이동 — 스낵바 래퍼는 `bottom: 88`(하단 CTA 위)이라 슬롯(bottom 24)을 못 써 **absolute 래퍼 유지**, **스크롤 추가**) |
| `DUE-4-PAGE-02-0` | `Member/MemberAddBulkScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(TextArea) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer`로 이동 — 스낵바 래퍼는 `bottom: 88`(하단 CTA 위)이라 슬롯(bottom 24)을 못 써 **absolute 래퍼 유지**) |
| `DUE-4-PAGE-03-0` | `Member/MemberEditScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(TextField,TextArea) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer`로 이동 — 스낵바 래퍼는 `bottom: 88`(하단 CTA 위)이라 슬롯(bottom 24)을 못 써 **absolute 래퍼 유지**, **스크롤 추가**) |
| `DUE-4-PAGE-04-0` | `Member/MemberPaymentHistoryScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | SectionList | A | ✅ 2026-09-19(6-6, primary — 명세 실측 v5 확정(블루 75%, 상단/하단 다름), 이전 미판정-추정) |
| `ETC-1-PAGE-01-0` | `More/MoreScreen.tsx` | SafeAreaView | top | 상수 BLUE_50 = #F0F5FE | 입력없음 | ScrollView | B |  ✅ 2026-09-19(9-5, primary — §2 명세 배경 일치, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거), 탭 화면이라 `edges={['top']}` 유지 + `avoidKeyboard={false}`(입력 없음)) |
| `ETC-2-PAGE-01-0` | `GroupManager/AllGroupsScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView | B(6-5 재분류) | ✅ 2026-09-19(9-3, primary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `ETC-2-PAGE-02-0` | `GroupManager/GroupManageScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | B(6-5 재분류) | ✅ 2026-09-19(9-3, primary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `ETC-2-PAGE-03-0` | `GroupManager/GroupManagerScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | B(6-5 재분류) | ✅ 2026-09-19(9-3, primary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `ETC-2-PAGE-05-0` | `Receipt/ReceiptAlbumScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | A | ✅ 2026-09-19(8-6, `primary`→`secondary` — 명세 실측 v5 확정, 이전 `primary`는 미판정-추정이었음) |
| `ETC-2-PAGE-07-0` | `Statistics/StatisticsScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | A | ✅ 2026-09-19(8-6, `primary`→`secondary` — 명세 실측 v5 확정, 이전 `primary`는 미판정-추정이었음) |
| `ETC-2-PAGE-09-0` | `More/SettingScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | A | ✅ 2026-09-19 |
| `ETC-3-PAGE-01-0` | `GroupManager/GroupProfileEditScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `ETC-3-PAGE-04-0` | `Receipt/ReceiptDetailScreen.tsx` | SafeAreaView | top, bottom | 상수 FILL_INVERSE = #374151 | 입력없음 | 없음 | C | |
| `ETC-3-PAGE-05-0` | `Receipt/ReceiptSearchScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(SearchField) | 없음 | B | ✅ 2026-09-19(8-6, secondary — 명세 실측 v5 확정, edges 기본값과 동일, 루트 `container{flex:1}` 제거, **키보드 회피(기본 true) 새로 적용**) |
| `ETC-3-PAGE-07-0` | `More/MyProfileScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | B(6-5 재분류) | ✅ 2026-09-19(9-3, primary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `ETC-3-PAGE-08-0` | `More/NotificationSettingsScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView | A | ✅ 2026-09-19(8-6, `primary`→`secondary` — 명세 실측 v5 확정, 이전 `primary`는 미판정-추정이었음) |
| `ETC-3-PAGE-09-0` | `More/NoticeListScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | FlatList | A | ✅ 2026-09-19 |
| `ETC-3-PAGE-10-0` | `More/InquiryScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView | A | ✅ 2026-09-19(8-6, `primary`→`secondary` — 명세 실측 v5 확정, 이전 `primary`는 미판정-추정이었음) |
| `ETC-3-PAGE-11-0` | `More/TermsScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | A | ✅ 2026-09-19 |
| `ETC-4-PAGE-01-0` | `GroupManager/GroupCreateScreen.tsx` | View | 해당없음(SafeAreaView 없음) | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `ScreenContainer background="secondary" edges={['bottom']}` — 상단 인셋을 안 줘 기존 `paddingTop: 60` 배치 유지, 루트 `style`(padding)은 그대로 전달, **키보드 회피(기본 true) 새로 적용**) |
| `ETC-4-PAGE-02-0` | `GroupManager/GroupImagePickerScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | C | |
| `ETC-4-PAGE-15-0` | `More/ProfileEditScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(9-3, secondary — 명세 실측 v5 확정, `ScreenContainer` + **스낵바 슬롯**(absolute 래퍼 제거)) |
| `ETC-4-PAGE-17-0` | `More/PasswordChangeScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 없음(TextField) | 없음 | B | ✅ 2026-09-19(8-6, secondary — 명세 실측 v5 확정, edges 기본값과 동일, 루트 `container{flex:1}` 제거, **키보드 회피(기본 true) 새로 적용**) · 9-3 **스크롤 추가**(`ScrollView`+`keyboardShouldPersistTaps="handled"`, CTA 고정) |
| `ETC-4-PAGE-18-0` | `More/NoticeDetailScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | ScrollView | A | ✅ 2026-09-19(8-6, `primary`→`secondary` — 명세 실측 v5 확정, 이전 `primary`는 미판정-추정이었음) |
| `ETC-5-PAGE-02-0` | `Report/ReportEntryDetailScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | A | ✅ 2026-09-19(9-10에서 `ScreenContainer secondary`로 정정 — 명세 실측 흰색, 9-9의 primary는 오류) |
| `ETC-4-PAGE-05-0`(보관함 공유 ID) | `Archive/ArchiveLedgerEntriesScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | A | ✅ 2026-09-19(9-9, primary — §2 블루, 같은 ID·같은 화면인 `ReportLedgerEntriesScreen`(`ScreenContainer primary`)과 처리 통일, 스낵바 없음) |
| `ETC-5-PAGE-02-0`(보관함 공유 ID) | `Archive/ArchiveEntryDetailScreen.tsx` | SafeAreaView | top, bottom | 미지정 | 입력없음 | 없음 | A | ✅ 2026-09-19(9-10, secondary — 명세 실측 흰색, `ReportEntryDetailScreen`과 함께 `secondary`로 정정. 9-9의 primary 통일은 오류, 스낵바 없음) |
| `ADD-3-PAGE-01-0` | `Transactions/ReceiptScanningView.tsx` | View | 해당없음(SafeAreaView 없음) | 상수 GREY_800 = #374151 | 입력없음 | 없음 | C | |
| `ADD-4-PAGE-01-1` | `Transactions/ReceiptScanFailedView.tsx` | View | 해당없음(useSafeAreaInsets 수동) | 미지정 | 입력없음 | 없음 | C | ✅ 2026-09-19(8-7, secondary — 명세 실측 v5 확정, `edges={[]}` — 기존 `useSafeAreaInsets`로 직접 더하는 상하 패딩(`insets.top+12`/`insets.bottom+16`)을 그대로 두어 이중 적용 방지) |

**도출 (a) 입력 필드가 있는데 키보드 처리가 없는 화면**: **20개 파일 / 22개 ID** — `COM-1-PAGE-01-0`, `COM-2-PAGE-02-0`, `COM-3-PAGE-02-0`, `COM-3-PAGE-03-0`, `COM-4-PAGE-01-0`, `DTB-2-PAGE-01-0`, `FDR-1-PAGE-01-0`, `FDR-2-PAGE-04-0`, `FDR-2-PAGE-02-0`, `FDR-3-PAGE-02-0`, `FDR-3-PAGE-03-0`, `DUE-2-PAGE-02-0`, `DUE-3-PAGE-02-0`, `DUE-4-PAGE-01-0`, `DUE-5-PAGE-01-0`, `DUE-4-PAGE-02-0`, `DUE-4-PAGE-03-0`, `ETC-3-PAGE-01-0`, `ETC-3-PAGE-05-0`, `ETC-4-PAGE-01-0`, `ETC-4-PAGE-15-0`, `ETC-4-PAGE-17-0`.
- 정정: 이 중 `FDR-2-PAGE-02-0`(`FolderBudgetListScreen`)은 입력 `TextField`가 `BottomSheet` 안(`:210-231`)에만 있어 시트가 자체로 키보드를 처리하므로, 제외하면 **19개 파일 / 21개 ID**다. 나머지 19개 파일은 검색창·폼이 화면 본문에 있다.
- `ScreenContainer`로 옮기면 `avoidKeyboard` 기본값(`KeyboardAvoidingView behavior="height"`)이 자동으로 붙으므로 이 19개가 마이그레이션 B 등급의 큰 축이다(레이아웃이 변할 수 있어 실기기 확인 필요).

**도출 (b) 배경색을 루트에 직접 지정한 화면**: **10개 파일 / 11개 ID**, 전부 **색상 상수 참조**이고 리터럴 hex를 박은 곳은 **0개**. 값은 **3종**:
- `#F0F5FE` 5개 파일 — `DashboardScreen`·`FolderBudgetListScreen`(`BACKGROUND_PRIMARY`), `TransactionsScreen`·`FolderScreen`(2 ID)·`MoreScreen`(`BLUE_50`). 같은 값을 상수 이름 두 개로 쓰고 있다(`ScreenContainer`가 쓰는 건 `BACKGROUND_PRIMARY`).
- `#FFFFFF` 2개 파일 — `NotificationScreen`·`CalendarScreen`(`BACKGROUND_SECONDARY`).
- `#374151` 3개 파일 — `TransactionReceiptDetailScreen`·`ReceiptDetailScreen`(`FILL_INVERSE`), `ReceiptScanningView`(`GREY_800`). 같은 값을 상수 이름 두 개로 쓰는 다크 뷰어/스캔 화면이며 `ScreenContainer`의 primary/secondary 어느 쪽도 아니다.
- 나머지 46개 파일은 루트 배경 미지정. 실제로 배경이 없는지(네비게이터 배경이 비치는지) 자식이 채우는지는 이 조사로 판단 못 함 — §5-7 미판정 136개와 겹치므로 시안 대조 때 함께 확인.

**도출 (c) edges에 bottom이 빠진 화면**(edge-to-edge 하단 침범 위험): 두 층.
- **`edges={['top']}`만 명시한 2개 ID** — `DSH-1-PAGE-01-0`(`DashboardScreen`), `ETC-1-PAGE-01-0`(`MoreScreen`). 둘 다 하단 탭바가 붙는 탭 루트 화면이라 의도로 보이나, 탭바가 하단 인셋을 스스로 처리하는지는 이번에 확인하지 않았다 — **판단 보류**.
- **`SafeAreaView` 자체가 없는 12개 ID(12개 파일)** — 수동 `paddingTop` 60/80으로 상태바를 어림잡고 하단 인셋은 처리하지 않는다(일부는 `paddingBottom: 24` 고정): `COM-1-PAGE-01-0`, `COM-2-PAGE-01-0`, `COM-2-PAGE-02-0`, `COM-3-PAGE-02-0`, `COM-3-PAGE-03-0`, `COM-3-PAGE-04-0`, `COM-4-PAGE-01-0`, `COM-5-PAGE-01-0`, `FDR-3-PAGE-02-0`, `FDR-3-PAGE-03-0`, `ETC-4-PAGE-01-0`, `ADD-3-PAGE-01-0`. 온보딩(COM) 화면이 몰려 있어 하단 CTA가 시스템 내비게이션 바에 가려질 위험이 가장 큰 층으로 보이나 기기별 재현은 미확인. `ReceiptScanFailedView`는 `useSafeAreaInsets` 수동 사용, 약관 3개 파일은 `LegalDocumentView`가 내부에서 `top,bottom`을 처리해 제외.

**마이그레이션 난이도**(실제 치환은 안 함) — 기준: **A** = 루트가 `SafeAreaView`(top+bottom), 입력 필드 없음 / **B** = 입력 필드가 있거나(컨테이너가 `KeyboardAvoidingView`를 얹어 레이아웃이 변동), `SafeAreaView` 없이 수동 padding, `edges`가 기본값이 아니거나 캐러셀이 얽힘 / **C** = `ScreenContainer` 전제(라우트 화면 + primary/secondary 두 배경)가 안 맞는 것.

| 등급 | 파일 수 | Screen ID 수 | 비고 |
|---|---:|---:|---|
| A(기계적) | 24→**17** | 23→**15** | (6-6에서 6-5 8개 + 잔여 9개 = 17개 전부 완료)  약관 3개 화면은 `LegalDocumentView` 1곳 수정으로 끝남. 배경이 "루트 미지정"인 화면은 치환 시 primary/secondary 중 **하나를 골라야** 하는데, 그 판정이 아직 대기(§5-7 미판정)인 화면은 배경 판정이 선행 조건 |
| B(주의) | 26→**33** | 28→**36** | 사유(중복 가능): 입력 필드 20개 파일(`FolderBudgetListScreen`은 BottomSheet 안 입력이라 실제 영향은 없을 수 있음) / `SafeAreaView` 없이 수동 `paddingTop` 11개 / `edges`에 bottom 없음 2개(탭 화면) / 가로 캐러셀 + FlatList 1개(`LedgerDetailScreen`) |
| C(불가/특수) | 6 | 8 | 아래 개별 사유 |

C 등급 개별 사유:

| 파일 | Screen ID | 사유 |
|---|---|---|
| `Folder/TransactionReceiptDetailScreen.tsx` | `DTB-3-PAGE-01-0` | 다크(`FILL_INVERSE` #374151) 전체화면 이미지 뷰어 — `ScreenContainer`는 primary/secondary 두 배경뿐 |
| `Receipt/ReceiptDetailScreen.tsx` | `ETC-3-PAGE-04-0` | 다크(`FILL_INVERSE` #374151) 전체화면 이미지 뷰어 — 위와 같은 이유 |
| `Transactions/ReceiptScanningView.tsx` | `ADD-3-PAGE-01-0` | 라우트 화면이 아니라 `TransactionRegisterScreen`이 `stage.kind==="scanning"`일 때 통째로 갈아 끼우는 전체화면 스캔 뷰(`GREY_800` #374151, 안전영역 처리 없음) |
| `Transactions/ReceiptScanFailedView.tsx` | `ADD-4-PAGE-01-1` | 라우트 화면이 아니라 같은 `stage` 호스트의 스캔 실패 뷰(`useSafeAreaInsets` 수동 사용) |
| `GroupManager/GroupImagePickerScreen.tsx` | `ETC-4-PAGE-02-0` | 라우트가 없다 — `GroupProfileEditScreen`/`ProfileEditScreen`이 컴포넌트로 직접 렌더하는 이미지 선택 스테이지 |
| `Transactions/TransactionRegisterScreen.tsx` | `DTB-3-PAGE-02-0`, `ADD-1-PAGE-01-0`, `ADD-4-PAGE-01-0` | 한 컴포넌트가 카메라 스캔/스캔 실패/갤러리/폼 스테이지를 `stage` 상태로 스위칭하는 호스트(907줄, 스테이지 뷰마다 루트가 다름) — 루트 하나를 `ScreenContainer`로 바꾸는 문제가 아님 |

**묶음 6-5 실행 결과(2026-09-19 — 소스 수정 포함)**

*재분류(A→B 7개 파일 / 8개 ID)*: `TransactionDetailScreen`(DTB-2-PAGE-02-0·03-0)·`FolderMoveDestinationScreen`(FDR-3-PAGE-01-0)·`MemberDetailScreen`(DUE-3-PAGE-03-0)·`AllGroupsScreen`(ETC-2-PAGE-01-0)·`GroupManageScreen`(ETC-2-PAGE-02-0)·`GroupManagerScreen`(ETC-2-PAGE-03-0)·`MyProfileScreen`(ETC-3-PAGE-07-0). 이유: 전부 `snackbarWrapper: { position: 'absolute', left: 24, right: 24, bottom: 24 }`(FolderMoveDestination은 `bottom: 88`)가 루트 `SafeAreaView` 바로 아래 있다. `SafeAreaView`는 인셋을 padding으로 주므로 absolute 자식의 `bottom`은 인셋을 무시하고 화면 끝 기준이다. `ScreenContainer`는 그 안에 `KeyboardAvoidingView`(flex:1)를 한 겹 더 두므로 absolute 자식이 인셋 안쪽 기준으로 바뀌어 스낵바가 하단 인셋만큼 위로 올라올 수 있다 → 지시("레이아웃이 바뀔 것 같으면 건너뛰고 B") 적용. 이 추정은 Yoga의 absolute 좌표 기준(padding box)에 기댄 것이라 **실기기 확인은 안 함 — 판단 보류**. 이미 `ScreenContainer`로 옮긴 화면(Report/Archive/Withdraw 등)에 같은 스낵바 래퍼가 있는지는 이번에 대조하지 않았다.

*A 등급 우선순위 조건이 공집합*: 지시한 "입력 필드가 있어 키보드 처리 없는 것부터" 기준은 §5-18 A의 정의(입력 필드 없음)상 24개 전부 해당 없음(표의 키보드 열이 전부 "입력없음")이라 순서를 못 가른다. 대신 (1) `§2` 배경이 "루트 미지정"이라 현재 안드로이드 기본 회색이 비치는 화면, (2) 루트 외 absolute 요소 없음, (3) 컨테이너 스타일이 `flex: 1`뿐인 화면 순으로 골랐다. `NotificationScreen`(현 흰색)·`CalendarScreen`(현 흰색)·`TransactionsScreen`(현 블루)은 §2가 미판정인데 코드가 이미 색을 줬다 — 지시대로 "미판정→primary"를 적용하면 흰색 두 화면의 색이 바뀌므로 **이번 8개에서 뺐다**(다음 턴에 색 유지 여부 결정 필요).

*마이그레이션한 8개 + 항목 1*: 전부 `background="primary"` **미판정-추정 적용**(§2 배경 열이 전부 "미판정"이라 시안 판정은 아님 — 바꾸기 전 색은 시스템 기본 회색 `#F2F2F2`였으므로 색이 바뀌는 건 의도). `edges`는 9개 전부 원래 `['top','bottom']`(기본값과 동일)라 bottom 추가는 없다. 나머지 스타일은 손대지 않았고, 제거한 건 `container: { flex: 1 }`(ScreenContainer가 flex:1을 이미 줌)뿐이다. `TermsScreen`만 `container`에 padding이 있어 `style={styles.container}`로 그대로 넘겼다.

| 파일 | 변경 전 루트 | 변경 후 루트 |
|---|---|---|
| `LedgerDetailScreen`(로딩/에러·본 화면 2곳) | `<SafeAreaView style={styles.container} edges={['top','bottom']}>` | `<ScreenContainer background="primary">` |
| `InquiryScreen`·`NoticeListScreen`·`NoticeDetailScreen`·`SettingScreen`·`NotificationSettingsScreen`·`ReceiptAlbumScreen`·`ReportEntryDetailScreen` | 위와 동일 | 위와 동일 |
| `TermsScreen` | `<SafeAreaView style={styles.container} edges={['top','bottom']}>`(container = flex+padding 24/8+gap 12) | `<ScreenContainer background="primary" style={styles.container}>` |

*같은 증상(루트 배경 미지정) 남은 화면*: 위 9개를 뺀 **37개 파일 / 39개 ID**(고치지 않음, 표의 "배경색 지정 방식 = 미지정" 행 전부): COM-1-PAGE-01-0, COM-2-PAGE-01-0, COM-2-PAGE-02-0, COM-3-PAGE-01-0(3파일), COM-3-PAGE-02-0, COM-3-PAGE-03-0, COM-3-PAGE-04-0, COM-4-PAGE-01-0, COM-5-PAGE-01-0, DTB-2-PAGE-01-0, DTB-2-PAGE-02-0, DTB-2-PAGE-03-0, DTB-3-PAGE-02-0, ADD-1-PAGE-01-0, ADD-4-PAGE-01-0(+ `-1`), FDR-2-PAGE-01-0, FDR-3-PAGE-01-0, FDR-3-PAGE-02-0, FDR-3-PAGE-03-0, DUE-2-PAGE-02-0, DUE-3-PAGE-02-0, DUE-3-PAGE-03-0, DUE-4-PAGE-01-0, DUE-5-PAGE-01-0, DUE-4-PAGE-02-0, DUE-4-PAGE-03-0, DUE-4-PAGE-04-0, ETC-2-PAGE-01-0, ETC-2-PAGE-02-0, ETC-2-PAGE-03-0, ETC-2-PAGE-07-0, ETC-3-PAGE-01-0, ETC-3-PAGE-05-0, ETC-3-PAGE-07-0, ETC-4-PAGE-01-0, ETC-4-PAGE-02-0, ETC-4-PAGE-15-0, ETC-4-PAGE-17-0. **한계**: 이 조사는 루트 `SafeAreaView` 스타일만 봤다 — 자식이 배경을 깔거나(`ScrollView`/뷰가 전체를 채움) 전체 화면 모달이라 회색이 안 보이는 화면이 섞여 있을 수 있어 "실제 증상 화면 수"는 실기기 캡처 없이는 확정 못 함. 캡처로 확인된 건 장부 상세 1건(`#F2F2F2`, 아래 원인 규명)뿐이다.

**묶음 6-6 실행 결과(2026-09-19)**

*표 열은 조사 시점(마이그레이션 전) 값이다 — "배경색 지정 방식" 열의 `상수 …`는 코드에서 제거됐고 `ScreenContainer`가 대신 준다.*

*색 유지 3개 — `코드 기존값 유지`*: `NotificationScreen`·`CalendarScreen`은 `secondary`(기존 흰색), `TransactionsScreen`은 `primary`(기존 블루). §2 배경 열은 그대로 `미판정`이고 `(코드 기존값 … 유지 — 캡처 필요)`만 덧붙였다(등급 변경 없음 → 3표 동기화 대상 없음). 근거: 코드가 명시적으로 준 색은 (시안 대조는 안 됐어도) 누군가 고른 근거 있는 값이고, 미판정 추정값(`primary`)으로 덮으면 근거 있는 값을 근거 없는 값으로 바꾸는 것이라 6-5의 `미판정-추정 적용`과 구분해 원래 색을 보존했다.

*A 잔여 9개 파일 완료*: `TermsOfServiceScreen`·`PrivacyPolicyScreen`·`MarketingConsentScreen`(`LegalDocumentView` 1곳 → 3개 + 같은 컴포넌트를 쓰는 `More/TermDetailScreen`도 함께 primary가 됨 — 이 화면은 표에 없어 별도 확인 안 함), `FolderSelectMoveScreen`, `MemberPaymentHistoryScreen`(루트 2곳), `StatisticsScreen`(루트 스타일 키가 `safeArea`) — 전부 `primary` 미판정-추정 적용, 원래 `edges`는 전부 `['top','bottom']`(기본값)이라 bottom 추가 없음, absolute 요소 없음 확인.

*스낵바 슬롯*: `ScreenContainer`에 `snackbar?: ReactNode` prop을 추가했다(콘텐츠와 같은 `KeyboardAvoidingView` 안에 `position:'absolute', left/right/bottom: 24`, `pointerEvents="box-none"`). `LedgerDetailScreen`에만 적용했고 재분류된 B 7개(TransactionDetail·FolderMoveDestination·MemberDetail·AllGroups·GroupManage·GroupManager·MyProfile)는 실기기 확인 전까지 그대로 둔다.

**5번 — §5-7(137) vs §2(136) 차이 1건 원인(2026-09-19, 스크립트 집합 차)**: 두 목록을 Screen ID 집합으로 뽑아 비교했다(둘 다 중복 ID 없음). §2 "미판정" 136개는 전부 §5-7 목록 137개에 들어 있고, **§5-7에만 있는 ID는 `FDR-2-PAGE-02-0` 1개**, §2에만 있는 ID는 0개였다. 원인은 우리 쪽 누락이다 — 2026-09-18 폴더 예산 설정 대조(§5-16)에서 `FolderBudgetListScreen`이 `BACKGROUND_PRIMARY`를 쓰게 돼 §2 행 배경 열을 "블루"로 고쳤지만 §5-7 미판정 목록에서 그 행을 지우지 않았다. §1 표 아래 "IA-누락 발견분 추정" 메모는 틀렸다(정정함). §5-7에서 그 행을 빼서 두 목록이 136개로 일치하고, §2 등급은 바뀌지 않아(원래 블루) 3표 동기화 대상은 없다 — 다만 §5-7 요약의 D 102→101(PAGE 59→58)은 위에서 고쳤다.


#### 2026-09-19 9-3 — 명세 실측(v5) 판정 vs 현재 코드 배경: 스낵바 슬롯 적용 후 남은 불일치

**수정 누적(8-6·8-7·9-3, 배치마다 `tsc` 통과 · `eslint` 에러 0)**: 색 명시 6화면 `secondary` 교체 + `SafeAreaView`/`View` 루트 화면 `ScreenContainer` 마이그레이션(8-6 3화면, 8-7 8화면) + **9-3: 스낵바 슬롯 대기 19개 파일 전부 `ScreenContainer` 마이그레이션 + §2 명세 배경색 적용**. 그 결과 **코드 불일치는 `ETC-3-PAGE-04-0`(기획 확인 대기, 불일치 #12) 1건뿐**이다(확정된 `PAGE` 69개 중 일치 68).

**스낵바 슬롯 적용 결과**(실기기 실측 — 하단 72dp = 내비 48 + 24, 좌우 24dp, 다이얼로그는 키보드 위 — 로 슬롯 검증 통과):
- **슬롯 적용 12개 파일 / 12 Screen ID**: `absolute` 스낵바 래퍼와 `snackbarWrapper` 스타일을 지우고 `ScreenContainer snackbar={…}`로 넘겼다 — `LoginScreen`, `MemberManageScreen`, `AllGroupsScreen`, `GroupManageScreen`, `GroupManagerScreen`, `MyProfileScreen`, `MemberDetailScreen`, `DuesMemberEditScreen`, `DuesEditScreen`, `TransactionDetailScreen`, `GroupProfileEditScreen`, `ProfileEditScreen`.
- **9-4에서 슬롯 적용 완료 — 7개 파일 / 9 Screen ID**(`EmailVerificationScreen`, `TransactionRegisterScreen`(DTB-3-PAGE-02-0·ADD-1-PAGE-01-0), `FolderMoveDestinationScreen`, `LedgerCreateScreen`, `MemberAddIndividualScreen`(DUE-4-PAGE-01-0·DUE-5-PAGE-01-0), `MemberAddBulkScreen`, `MemberEditScreen`). 9-3까지는 스낵바가 하단 CTA 위(`bottom: 88`)에 떠 있어 슬롯(`bottom` 24 고정)으로 옮기면 CTA와 겹쳐 `absolute` 래퍼를 남겨뒀다. 9-4에서 `ScreenContainer`에 `snackbarOffset`(dp, 기본 0 — 슬롯 위치 = 하단 인셋 + 24 + offset)을 추가해 옮겼다. **CTA 높이를 확인해 화면별로 값을 줬다(전부 64가 아니다)** — 값 = 하단 인셋 위 끝에서 CTA 버튼 윗변까지 거리 = `Button fullWidth` 높이 52 + 그 화면 footer의 하단 패딩: `EmailVerificationScreen` 76(52+`paddingBottom` 24), `TransactionRegisterScreen` 68(52+16), `FolderMoveDestinationScreen`·`LedgerCreateScreen`·`MemberAddIndividualScreen`·`MemberAddBulkScreen`·`MemberEditScreen` 각 68(52+`paddingVertical` 16의 하단 16). 예전 `bottom: 88`은 버튼 윗변 위로 12(EmailVerification)~20(나머지)dp였고, 이제는 전부 24dp라 스낵바가 4~12dp 더 높게 뜬다(실기기 확인 대상).
- **루트가 `View`+`paddingTop` 하드코딩인 3개**(`LoginScreen` 80, `EmailVerificationScreen`·`LedgerCreateScreen` 60): `edges={['bottom']}`로 처리, `paddingTop`은 그대로.
- **(9-5에서 해소) 그 밖에 `absolute` 스낵바 래퍼가 남아 있던 10개 파일**(`ArchiveListScreen`, `DuesCreateScreen`, `DuesDetailScreen`, `DuesScreen`, `FolderBudgetListScreen`, `FolderScreen`, `MoreScreen`, `ReportByLedgerDetailScreen`, `ReportByPeriodDetailScreen`, `ReportMainScreen`)을 전부 슬롯으로 옮겼다 — 아래 9-5 항목.

**폼 스크롤 추가(9-2 `SignupInfoScreen` 포함 7화면)**: `ScrollView` + `keyboardShouldPersistTaps="handled"`, 하단 CTA는 스크롤 밖 고정 — `SignupInfoScreen`, `SocialSignupInfoScreen`, `PasswordChangeScreen`, `LoginScreen`, `LedgerCreateScreen`, `MemberAddIndividualScreen`, `MemberEditScreen`.

**남은 불일치 1건**:

| Screen ID | 파일 | 명세 판정 | 코드 현재 | 미수정 사유 |
|---|---|---|---|---|
| `ETC-3-PAGE-04-0` | `Receipt/ReceiptDetailScreen.tsx` | 흰색 | 루트 어두움(`FILL_INVERSE`) | **기획 확인 대기(불일치 #12)** — 사진 뷰어 UX상 어두운 배경이 나을 수 있음, 이번에 안 고침 |

**`상하 다름` 화면 6개 — 이번엔 안 고침**(파란 헤더 + 흰 리스트라 `ScreenContainer background` 하나로는 표현이 안 됨, 구조는 별도 결정): (`ETC-4-PAGE-15-0`은 9-1에서 제외 — 하단 #E6E6E6은 배경이 아니라 시안 목업에 떠 있는 키보드)

| Screen ID | 화면명 | §2 배경(본문 기준) | 상단색 | 하단색 | 코드 |
|---|---|---|---|---|---|
| `DTB-1-PAGE-01-0` | 내역 메인 | 블루 | #F0F5FE | #FFFFFF | `screens/Transactions/TransactionsScreen.tsx` |
| `FDR-2-PAGE-05-0` | 장부 상세 | 블루 | #F0F5FE | #FFFFFF | `screens/Folder/LedgerDetailScreen.tsx` |
| `DUE-2-PAGE-03-0` | 회비 항목 상세 / 회비 항목 상세 (미납부) | 블루 | #F0F5FE | #FFFFFF | `screens/Dues/DuesDetailScreen.tsx` |
| `DUE-2-PAGE-03-1` | 회비 항복 상세 (납부완료) — 실제로는 "마감된 회비"/"예정된 회비" 두 상태 변형 | 블루 | #F0F5FE | #FFFFFF | `screens/Dues/DuesDetailScreen.tsx` |
| `DUE-4-PAGE-04-0` | 개인 납부 내역 | 블루 | #F0F5FE | #FFFFFF | `screens/Member/MemberPaymentHistoryScreen.tsx` |
| `ETC-4-PAGE-05-0` | 보고서_장부 상세 / 보고서_장부 상세(전체) — **및 보관함_장부 상세(공유 ID, 2026-09-12)** | 블루 | #F0F5FE | #FFFFFF | `screens/Report/ReportLedgerEntriesScreen.tsx` |

#### 2026-09-19 9-5 — 스낵바 `absolute` 배치 완전 제거 (`src/` 전체 `snackbarWrapper` 0건)

**A그룹(이미 `ScreenContainer`, 4개)**: `ArchiveListScreen`, `ReportMainScreen`, `ReportByLedgerDetailScreen`, `ReportByPeriodDetailScreen` — `bottom: 24`였으므로 `snackbarOffset` 없이 슬롯으로만 옮김. 단 `ArchiveListScreen`은 래퍼가 `bottom: insets.bottom + 24`(`ScreenContainer`가 이미 하단 인셋을 빼는데 또 더함)였고 슬롯은 `24`라서 **하단 인셋(예: 내비 48dp)만큼 낮아진다**(다른 화면과 같은 위치가 됨, 실기기 확인 대상). 슬롯으로 옮기며 안 쓰게 된 `useSafeAreaInsets`를 지웠다.

**B그룹(`SafeAreaView` → `ScreenContainer` + §2 명세 배경 + 슬롯, 6개)**: `DuesScreen`(primary), `DuesCreateScreen`(secondary), `DuesDetailScreen`(primary), `FolderScreen`(primary), `FolderBudgetListScreen`(primary), `MoreScreen`(primary, `edges={['top']}`). 코드가 이미 §2 명세 배경과 같은 색이라 색은 안 바뀌고 `ScreenContainer`가 배경을 대신 준다.
- CTA 높이 재기: `DuesCreateScreen`은 두 return 모두 `footer`(`paddingBottom` 16) → 52+16 = **68**. `DuesDetailScreen`은 `ctaWrapper`(`paddingBottom` 16, `canChangeStatus`일 때만) → `canChangeStatus ? 68 : 0`. 나머지 4개(`DuesScreen`, `FolderScreen`, `FolderBudgetListScreen`, `MoreScreen`)에는 화면 하단 고정 CTA가 없다(`FolderBudgetListScreen`의 `Button`은 `BottomSheet` 안) → `snackbarOffset` 생략.
- 탭 화면 3개(`DuesScreen`, `FolderScreen`, `MoreScreen`): `ScreenContainer`가 얹는 `KeyboardAvoidingView` 때문에 레이아웃이 바뀔 수 있어 **`avoidKeyboard={false}`로 종전과 같은 구조를 유지**했다(`SafeAreaView` 속성은 그대로 `edges`만 옮김). 그래서 건너뛴 화면은 없다. `FolderScreen`은 검색창이 있어 키보드 동작 변화가 없는지 실기기 확인 대상이다.
- 조건이 달랐던 곳: `MoreScreen`은 `switchSnackbarMessage`, `FolderBudgetListScreen`은 `snackbarVisible`, `FolderScreen`은 `snackbar`(제목+설명).

**검증**: `rg snackbarWrapper src` = 0건(`ScreenContainer.tsx`의 주석 1줄 제외), `position: 'absolute'` 스낵바 래퍼 0건, `<Snackbar` 사용 31곳(스토리 제외) 전부 `ScreenContainer`의 `snackbar={…}` 슬롯 안이다.

**9-5 이후 `ScreenContainer`를 아직 안 쓰는 화면(고치지 않음 — 목록만)**: `src/screens`·`src/navigation`에서 `<ScreenContainer`가 없는 `.tsx`를 훑어 화면(라우트)만 골랐다. 컴포넌트·시트·메뉴·네비게이터는 제외. 약관 3개(`TermsOfServiceScreen`, `PrivacyPolicyScreen`, `MarketingConsentScreen`)는 파일에 `ScreenContainer`가 없지만 `LegalDocumentView`가 `ScreenContainer background="primary"`로 그려서 해당 없음.

| Screen ID | 파일 | 사유 |
|---|---|---|
| `DSH-1-PAGE-01-0` | `Dashboard/DashboardScreen.tsx` | `SafeAreaView`(`edges: top`), 탭 화면. 배경 `BACKGROUND_PRIMARY`가 §2 블루와 일치. 스낵바 없어 이번 범위 밖 |
| `DUE-3-PAGE-04-0` | `Dues/DuesRequestScreen.tsx` | `SafeAreaView`. 배경 `BACKGROUND_PRIMARY`가 §2 블루와 일치. 스낵바 없어 이번 범위 밖 |
| `DTB-3-PAGE-01-0` | `Folder/TransactionReceiptDetailScreen.tsx` | `SafeAreaView`, 배경 `FILL_INVERSE`(어두움). §2 배경 미판정 |
| `ETC-3-PAGE-04-0` | `Receipt/ReceiptDetailScreen.tsx` | `SafeAreaView`, 배경 `FILL_INVERSE`(어두움) ↔ 명세 흰색 — **불일치 #12, 기획 확인 대기** |
| `ETC-4-PAGE-02-0` | `GroupManager/GroupImagePickerScreen.tsx` | `SafeAreaView`, 배경 미지정. §2 배경 미판정 |
| `ETC-4-PAGE-XX-0`(자리표시 ID) | `More/TermDetailScreen.tsx` | `SafeAreaView`, 배경 미지정. IA에 ID 없음(§2는 `ETC-3-PAGE-11-0` 약관 행, 미판정) |
| `ADD-2-SHEET-05-0` | `Transactions/ReceiptGalleryPickerScreen.tsx` | `SafeAreaView`, 배경 미지정. ID는 SHEET(증빙자료 등록)인데 전체 화면 갤러리 선택 화면 — §2 배경은 시트 표면색(흰색) |
| `COM-3-PAGE-04-0` | `PasswordReset/PasswordResetSentScreen.tsx` | 루트가 `View` + `paddingTop: 60`(`edges={['bottom']}` 방식 후보). §2 배경 미판정 |
| `ADD-3-PAGE-01-0` | `Transactions/ReceiptScanningView.tsx` | 루트 `View`, 배경 `GREY_800`(어두움) — 스캔 진행 뷰라 배경 판정 대상 아님(§2 미판정) |
| (ID 없음) | `SplashScreen.tsx` | 루트 `View`, 배경 `BASIC_0`. 라우트 화면 아님·시안 없음 |

#### 2026-09-19 9-6 — 공유 Screen ID 전수 검증 (조사만 — 코드 수정 없음)

**방법**: §2 PAGE 행의 코드 위치 열에 적힌 `.tsx` 파일 + 소스 `@screen` PAGE 태그를 합쳐, **한 Screen ID에 파일이 2개 이상 걸린 경우**를 스크립트로 뽑았다. 그 뒤 행 문구에서 우연히 잡힌 컴포넌트(`Divider`, `AmountCard`, `Accordion`, `MoreScreen`, `FolderScreen` 언급 등)는 화면 매핑이 아니라서 손으로 걸렀다. 각 파일은 `ScreenContainer` 사용 여부·`background` 값·루트 배경 미지정 여부를 소스에서 읽었다.

| Screen ID | §2 배경 | 파일 (처리) | 같은 화면인가 | 판정 |
|---|---|---|---|---|
| `ETC-4-PAGE-05-0` | 블루 | `Report/ReportLedgerEntriesScreen`(`ScreenContainer primary`) · `Archive/ArchiveLedgerEntriesScreen`(**`SafeAreaView`, 배경 미지정**) | **같은 화면** — 레이아웃 동일(앱바 장부명+기간+수입/지출 카드+`ReportEntryList`), 스펙시트 UI 요소 3번 [상태]에 "기록 보고서 공통 로직 상속" 명시, 크롭도 동일(파일 상단 주석, 2026-09-12). 다른 점은 데이터(`ArchivedEntry`)·탭 시 이동처뿐 | **불일치** — Archive 쪽이 §2 블루와 다름 |
| `ETC-5-PAGE-02-0` | 미판정 | `Report/ReportEntryDetailScreen`(`ScreenContainer primary`) · `Archive/ArchiveEntryDetailScreen`(**`SafeAreaView`, 배경 미지정**) | **같은 ID, 내용은 다름** — 보고서 쪽은 5필드, 보관함 쪽 크롭은 담당자·메모·증빙 썸네일까지(코드 주석의 2026-09-12 크롭 확인). 같은 화면 개념을 두 도메인이 공유한다는 코드 작성자의 판단은 있으나 스펙 원본 재확인은 안 함 | **ID 내 처리 불일치**(§2가 미판정이라 어느 쪽이 맞는지는 미확정) |
| `ETC-3-PAGE-03-0` | 블루 | `Report/ReportByPeriodDetailScreen`(primary) · `Archive/ArchiveDetailScreen`(primary) | **다른 화면** — UI 구성이 전혀 다름(보관함 "기록 보기"). 이미 §2·소스 주석에 "진짜 ID 충돌"로 기록됨(2026-09-11 재확인) | 배경 처리는 일치. **ID 부여 자체는 별도 이슈(기존 기록)** |
| `ETC-4-PAGE-02-0` | 미판정 | `GroupManager/GroupImagePickerScreen`(`SafeAreaView`, 미지정) · `Transactions/ReceiptGalleryPickerScreen`(`SafeAreaView`, 미지정 — 코드 태그는 `ADD-2-SHEET-05-0`) | **다른 화면** — 단일 선택(탭 즉시) vs 다중 선택(체크박스+"선택" 버튼). `§2` 행에 "Screen ID 충돌 주의"로 이미 기록됨 | 처리는 같음(둘 다 미지정). ID 부여 문제는 기존 기록 |
| `COM-3-PAGE-01-0` | 미판정 | `TermsOfServiceScreen`·`PrivacyPolicyScreen`·`MarketingConsentScreen`(전부 `LegalDocumentView` → `ScreenContainer primary`) | 같은 화면(약관 상세 3종) | 일치 |
| `ETC-3-PAGE-11-0`(행 매핑만) | 미판정 | `More/TermsScreen`(`ScreenContainer primary`) · `More/TermDetailScreen`(`SafeAreaView`, 미지정 — 코드 태그는 자리표시 `ETC-4-PAGE-XX-0`) | **다른 화면**(목록 vs 상세). 태그 ID는 서로 다름 | 처리 다름 — 상세 화면 ID가 없어서 생긴 차이. 참고 |
| `ETC-4-PAGE-05-1`·`ETC-4-PAGE-07-1`(자식) | 블루(부모 상속) | `ReportEntryList` 탭 상태. `Archive/ArchiveLedgerEntriesScreen`도 같은 컴포넌트를 씀 | 별도 화면 아님 | 부모(`ETC-4-PAGE-05-0`) 판정 따름 |

**기타 발견**: `ADD-3-PAGE-01-0`·`ADD-3-PAGE-02-0` 행이 가리키는 `MockCameraView.tsx`·`CameraCaptureView.tsx`는 `src/`에 파일이 없다(행 문구가 옛 파일명으로 남은 것으로 보임, 확인 필요). `ReceiptScanningView.tsx`만 실제 파일이다.

**※ 정정 — 불일치 집계**: 9-3·§1 문단·이 문서 §5-18 9-3 블록의 "코드 불일치 1건(`ETC-3-PAGE-04-0`)"은 **Report 쪽 파일만 보고 센 값**이었다. 공유 ID를 파일 단위로 다시 세면 **확정 판정(블루/흰색) ID 기준 2건**이다 — `ETC-3-PAGE-04-0`(기획 확인 대기, 불일치 #12) + `ETC-4-PAGE-05-0`(`ArchiveLedgerEntriesScreen`, 배경 미지정 vs 블루). 확정 판정 PAGE 69개 기준 **일치 68 → 67**. 그 밖에 §2 판정이 미확정인 ID에서 파일끼리 처리가 다른 것이 **1건 더** 있다(`ETC-5-PAGE-02-0`). 이 조사는 조사만 했고 코드는 안 고쳤다.

#### 2026-09-19 9-9 — 공유 ID 두 파일 처리 통일 + §2 코드 위치 경로 전수 확인

**`ETC-4-PAGE-05-0` 수정**: `Archive/ArchiveLedgerEntriesScreen`(`SafeAreaView`, 배경 미지정)을 `ScreenContainer background="primary"`로 마이그레이션 — 같은 ID·같은 화면인 `ReportLedgerEntriesScreen`과 같아졌다. 스낵바 없음.

**`ETC-5-PAGE-02-0` 두 파일이 같은 화면인지 확인 → 같은 화면**:
- 원본 크롭 두 장(`ETC/보고서 생성/ETC-5-PAGE-02-0.png`, `ETC/보관함/ETC-5-PAGE-02-0.png`)을 열어 비교했다 — **육안으로 동일**(앱바 "상세 내역", 금액 `-150,000원`, 지출일·내역명·담당자·장부·메모, 증빙 자료 `2/10` 썸네일 2장, "증빙 자료 세부 내역"). 파일 크기도 40,404 vs 40,406 바이트로 거의 같다.
- 두 화면 코드의 레이아웃 뼈대도 같다(앱바 `sub` + 라벨/값 `Field` 목록, 같은 `body`·`field`·`fieldLabel`·`fieldValue` 스타일). 차이는 필드 수뿐이고 그건 데이터 차이다 — 보고서 쪽은 스냅샷에 `memo`·`receipts`가 없어 5필드만 그리고(그 파일 주석의 "반쪽 화면"), 보관함 쪽은 `담당자`·`메모`·증빙 썸네일까지 그린다.
- **※ 정정**: `ArchiveEntryDetailScreen` 파일 주석은 "보고서 쪽 크롭은 5필드뿐"이라고 적었는데 **틀렸다** — 보고서 쪽 크롭도 보관함 쪽과 같은 전체 항목이다. 보고서 화면이 5필드인 것은 시안 차이가 아니라 서버 스냅샷 한계로 인한 구현 부족이다(`backend-requests.md` 2순위와 일치). 소스 주석은 이번에 안 고쳤다.
- 처리: `Archive/ArchiveEntryDetailScreen`을 `ScreenContainer background="primary"`로 마이그레이션해 `ReportEntryDetailScreen`과 같게 했다. **§2 배경 판정은 `미판정` 유지**(근거 열에 `두 파일 처리 통일 (2026-09-19) — 명세 판정은 별도`).
- 참고(판정 아님): 위 두 크롭은 육안으로 **흰색 배경**처럼 보인다. 두 파일이 쓰는 `primary`(블루)와 다를 수 있으므로 명세 판정 때 확인이 필요하다. 이번엔 판정하지 않았다.

**불일치 최종 건수** (9-6 정정 이후 갱신): 확정 판정(블루/흰색) ID 기준 코드 불일치 **2 → 1건**(`ETC-3-PAGE-04-0`, 기획 확인 대기 #12만 남음), 확정 PAGE 69개 중 일치 **68**. 판정 미확정 ID 안에서 같은 ID의 파일끼리 처리가 다른 경우는 **0건**(`ETC-5-PAGE-02-0` 통일). §1 배경 표 값(미판정 포함)은 변동 없음.

**§2 코드 위치 열 경로 전수 확인**: 백틱으로 적힌 `.ts`/`.tsx` 경로 197건(중괄호 축약 펼침 포함)을 스크립트로 `src/`에서 찾았다.
- 전체 경로가 그대로 존재: 148건.
- 파일명만 적혀 있고(경로 생략) 파일은 실제로 존재: 43건(`FolderScreen.tsx`, `DuesDetailScreen.tsx`, `ReportEntryList.tsx` 등) — 죽은 경로가 아니라 표기 생략이라 그대로 뒀다.
- 파일이 없는 것: 6건 — 전부 **삭제됐다고 서술하는 문장 안의 언급**이라 죽은 포인터가 아니다(`ADD-3-PAGE-01-0`·`ADD-3-PAGE-02-0`의 `MockCameraView.tsx`·`CameraCaptureView.tsx` 각 2건, `DTB-1-PAGE-01-0`·`DTB-3-PAGE-02-0`의 `types/transaction.ts` 각 1건). "삭제된 파일"로 읽히도록 백틱을 빼고 문구를 고쳤다.
- 두 화면의 실제 구현 파일: `ADD-3-PAGE-01-0` = `screens/Transactions/ReceiptScanningView.tsx`(`@screen` 태그 일치, 행에 이미 기재). `ADD-3-PAGE-02-0`(사진 촬영)은 **화면 파일이 없는 게 정상**이다 — 시스템 카메라 인텐트(`utils/imagePicker.ts`의 `launchCamera()`)가 대신하고 `@screen` 태그를 단 파일도 없다(행에 이미 기재).

#### 2026-09-19 9-10 — `ETC-5-PAGE-02-0` 흰색 확정 + 9-9 통일 방향 정정

**※ 정정(2026-09-19): 9-9에서 primary로 통일했으나 명세 실측 결과 흰색. 통일 방향 오류.** 9-9는 §2가 미판정이라는 이유로 명세를 보지 않고 `ReportEntryDetailScreen`(그때 `primary`)에 `ArchiveEntryDetailScreen`을 맞췄다. 그 기준 파일 자체가 명세와 달랐다.

**근거(`docs/spec-background-v5.tsv`, 프레임 4개 전부 흰색)**:

| 프레임 | 상단 | 점유율 | 중단 | 하단 |
|---|---|---|---|---|
| `내역/내역_상세내역조회.png#0` | `#FFFFFF` | 89% | `#FFFFFF` | `#FFFFFF` |
| `내역/내역_상세내역조회.png#1` | `#FFFFFF` | 100% | `#FFFFFF` | `#FFFFFF` |
| `내역/내역_상세내역조회_납부관리수입내역.png#0` | `#FFFFFF` | 80% | `#FFFFFF` | `#FFFFFF` |
| `내역/내역_상세내역조회_승인요청내역.png#0` | `#FFFFFF` | 79% | `#FFFFFF` | `#FFFFFF` |

- 주의: 이 네 프레임은 `spec-sheet-map.tsv` 기준 `DTB-2-PAGE-02-0`(상세 내역_조회)·`DTB-2-PAGE-03-0`(승인 요청 내역 등) 시트다. **`ETC-5-PAGE-02-0` 전용 명세 시트는 매핑에 없다.** 다만 같은 "상세 내역" 레이아웃이고, 이 ID 크롭 2장(`ETC/보고서 생성/`·`ETC/보관함/ETC-5-PAGE-02-0.png`, 360×740)의 7점(모서리·좌우·중단·하단) 픽셀 샘플링도 전부 `#FFFFFF`라 흰색으로 확정한다.
- 처리: §2 `ETC-5-PAGE-02-0` 배경 = 흰색, `ArchiveEntryDetailScreen`·`ReportEntryDetailScreen` 둘 다 `ScreenContainer background="secondary"`. §1 배경 표 흰색 PAGE 41 → 42, 미판정 15 → 14.
- `ArchiveEntryDetailScreen` 소스 주석의 "보고서 쪽 크롭은 5필드뿐" 오기를 정정했다(보고서 쪽 크롭도 전체 항목, 5필드는 서버 스냅샷 한계).

**9-9에서 `primary`로 통일한 건 재대조** (v5 실측 vs 코드):

| Screen ID | 코드 | v5 실측 | 일치 여부 |
|---|---|---|---|
| `ETC-4-PAGE-05-0` — `Report/ReportLedgerEntriesScreen`·`Archive/ArchiveLedgerEntriesScreen` | `primary` | `더보기_보고서생성_장부보고서조회-1.png#0` 상단 `#F0F5FE` 81% 블루(중·하 `#FFFFFF`, 상하 다름), `…장부보고서조회.png#0` 블루 80%(전 구간 `#F0F5FE`) | **일치**(상단 기준, "상하 다름" 구조 결정 6개 목록과 같은 사안) |
| `ETC-3-PAGE-03-0` — `Archive/ArchiveDetailScreen`(기록 보기) | `primary` | `더보기_기록보관_상세보기.png#0` 블루 82%, 전 구간 `#F0F5FE` | **일치** |
| `ETC-3-PAGE-03-0` — `Report/ReportByPeriodDetailScreen` | `primary` | `더보기_보고서생성_기간보고서조회-1.png#0` 블루 80%, 전 구간 `#F0F5FE`(`…기간보고서조회.png#0`은 블루 53%·상하 다름 — 점유율 60% 미만이라 판정에 안 씀) | **일치** |
| `ETC-5-PAGE-02-0` — 두 파일 | `secondary`(정정 후) | 위 표 + 크롭 픽셀 전부 `#FFFFFF` | **일치**(정정 후) |

9-9에서 실제로 바꾼 것은 `ETC-4-PAGE-05-0`(일치)과 `ETC-5-PAGE-02-0`(정정) 두 건뿐이라 다른 재점검 대상은 없다.

**최종값**: §1 배경 표 — 블루 PAGE 32 / 흰색 PAGE **42** / 흰색 모달·시트 51 / 어두움 스낵바 27 / 미판정 **14** / 합계 166(`§2` 행을 ID 포맷 기준으로 스크립트 재집계해 일치 확인). 코드 불일치 **1건**(`ETC-3-PAGE-04-0`), 확정 판정 PAGE 70개 중 일치 69.

### 5-19. 화면 목록 정합성 감사 (2026-09-19, 스크립트 집합 비교 — 목록은 안 고침, 차이만 기록)

대상 4개: **실제 파일**(`src/screens/**/*.tsx` 104개), **§2**(Screen ID 165개, 코드 파일 열의 `screens/…tsx` 경로 94개), **§5-18**(59개 ID / 56개 파일), **`scripts/spec-sheet-map.tsv`**(고유 ID 135개 — 이 파일엔 코드 경로가 없고 Screen ID뿐이라 파일 비교는 못 함), 그리고 소스의 `@screen` 주석 ID 158개. 어떤 차이가 진짜 누락이고 어떤 것이 화면이 아닌지는 판단하지 않는다.
**한계**: §2의 경로는 백틱으로 감싼 `screens/…tsx` 표기만 잡았다(파일명만 적은 언급은 제외). `@screen`은 `/** @screen ID */` 형식만 잡는다. §5-18은 처음부터 "구조 불일치 PAGE"만 다루므로 "실제 파일 − §5-18"이 크게 나오는 건 범위 차이일 수 있다.

**A. 파일 기준**

| 방향 | 개수 | 목록 |
|---|---:|---|
| 실제 파일에만 있음(§2 경로 미기재) | 11 | `Calendar/CalendarViewToggle.tsx`, `Dashboard/QuickServiceCard.tsx`, `Folder/FolderMoreMenu.tsx`, `Folder/FolderTabNavigator.tsx`, `GroupManager/GroupSwitcherMenu.tsx`, `Member/MemberMoreMenu.tsx`, `Notification/NotificationListItem.tsx`, `Receipt/ReceiptGrid.tsx`, `Report/ReportEntryList.tsx`, `SplashScreen.tsx`, `Transactions/ReceiptGalleryPickerScreen.tsx` |
| §2 경로에만 있음(실제 파일 없음) | 1 | `Signup/{TermsOfService,PrivacyPolicy,MarketingConsent}Screen.tsx` — 중괄호 축약 표기를 못 풀어서 나온 것(세 파일 실제로 존재) |
| 실제 파일에만 있음(§5-18 미기재) | 48 | `Archive/ArchiveDetailScreen.tsx`, `Archive/ArchiveEntryDetailScreen.tsx`, `Archive/ArchiveLedgerEntriesScreen.tsx`, `Archive/ArchiveListScreen.tsx`, `Calendar/CalendarViewToggle.tsx`, `Dashboard/QuickServiceCard.tsx`, `Dues/DuesCreateScreen.tsx`, `Dues/DuesDateRangeSheet.tsx`, `Dues/DuesDetailScreen.tsx`, `Dues/DuesEditScreen.tsx`, `Dues/DuesRequestScreen.tsx`, `Dues/DuesScreen.tsx`, `Folder/FolderMoreMenu.tsx`, `Folder/FolderTabNavigator.tsx`, `Folder/LedgerFilterSheet.tsx`, `Folder/NewItemSheet.tsx`, `GroupManager/AddGroupSheet.tsx`, `GroupManager/GroupSwitcherMenu.tsx`, `GroupManager/JoinGroupSheet.tsx`, `GroupManager/MemberProfileSheet.tsx`, `Member/MemberAddSheet.tsx`, `Member/MemberMoreMenu.tsx`, `More/TermDetailScreen.tsx`, `More/WithdrawGuideScreen.tsx`, `More/WithdrawOwnershipTransferScreen.tsx`, `More/WithdrawReasonScreen.tsx`, `Notification/NotificationListItem.tsx`, `Receipt/ReceiptFilterSheet.tsx`, `Receipt/ReceiptGrid.tsx`, `Report/ReportByLedgerDetailScreen.tsx`, `Report/ReportByPeriodDetailScreen.tsx`, `Report/ReportCreateByLedgerScreen.tsx`, `Report/ReportCreateByPeriodScreen.tsx`, `Report/ReportCreateSheet.tsx`, `Report/ReportEntryList.tsx`, `Report/ReportLedgerEntriesScreen.tsx`, `Report/ReportLedgerSelectScreen.tsx`, `Report/ReportMainScreen.tsx`, `Report/ReportPeriodEntriesScreen.tsx`, `SplashScreen.tsx`, `Transactions/ReceiptGalleryPickerScreen.tsx`, `Transactions/TransactionAmountSheet.tsx`, `Transactions/TransactionAttachMenuSheet.tsx`, `Transactions/TransactionDateSheet.tsx`, `Transactions/TransactionFilterSheet.tsx`, `Transactions/TransactionLedgerMultiSelectSheet.tsx`, `Transactions/TransactionSingleSelectSheet.tsx`, `Transactions/TransactionTextInputSheet.tsx` |
| §5-18에만 있음 | 0 | — |

§2 경로 미기재 11개 파일은 **§5-18에도 없다**. 그중 `Transactions/ReceiptGalleryPickerScreen.tsx`만 `@screen ADD-2-SHEET-05-0` 주석이 있고 나머지 10개는 아래 B.

**B. `@screen` 주석이 없는 파일(10개)**: `Calendar/CalendarViewToggle.tsx`, `Dashboard/QuickServiceCard.tsx`, `Folder/FolderMoreMenu.tsx`, `Folder/FolderTabNavigator.tsx`, `GroupManager/GroupSwitcherMenu.tsx`, `Member/MemberMoreMenu.tsx`, `Notification/NotificationListItem.tsx`, `Receipt/ReceiptGrid.tsx`, `Report/ReportEntryList.tsx`, `SplashScreen.tsx`. (이름상 하위 컴포넌트/메뉴/네비게이터/스플래시로 보이지만 화면 여부는 판단하지 않음.)

**C. Screen ID 기준**

| 방향 | 개수 | 목록 |
|---|---:|---|
| 소스 `@screen`에만(§2에 없음) | 3 | `COM-1-SNACKBAR-02-0`, `DUE-5-SNACKBAR-03-0`, `ETC-4-PAGE-XX-0` (앞 둘은 모달/스낵바가 호스트 화면 파일에 붙은 주석, `ETC-4-PAGE-XX-0`은 `More/TermDetailScreen.tsx`의 자리표시 ID) |
| §2에만(소스 `@screen` 없음) | 10 | `ADD-3-PAGE-02-0`, `ADD-4-PAGE-02-0`, `ADD-4-SNACKBAR-01-0`, `DSH-2-PAGE-05-0`, `DTB-2-PAGE-03-0`, `DTB-3-MODAL-02-0`, `DUE-3-MODAL-03-0`, `DUE-3-PAGE-02-1`, `DUE-4-MODAL-03-0`, `DUE-5-PAGE-02-0` |
| 소스 `@screen`에만(tsv에 없음) | 30 | `ADD-2-MODAL-01-0`, `ADD-2-SNACKBAR-01-0`, `ADD-4-PAGE-01-0`, `COM-3-PAGE-01-0`, `COM-3-PAGE-04-0`, `DTB-3-PAGE-01-0`, `DTB-4-MODAL-01-0`, `DUE-3-SNACKBAR-01-0`, `DUE-3-SNACKBAR-02-0`, `DUE-4-SNACKBAR-01-0`, `DUE-5-SNACKBAR-01-0`, `DUE-5-SNACKBAR-03-0`, `ETC-3-PAGE-02-1`, `ETC-3-PAGE-03-1`, `ETC-3-SHEET-06-0`, `ETC-4-PAGE-05-1`, `ETC-4-PAGE-07-1`, `ETC-4-PAGE-XX-0`, `ETC-4-SNACKBAR-02-0`, `ETC-4-SNACKBAR-04-0`, `ETC-5-MODAL-01-0`, `ETC-5-PAGE-02-0`, `ETC-5-SNACKBAR-04-0`, `ETC-5-SNACKBAR-05-0`, `ETC-5-SNACKBAR-06-0`, `ETC-5-SNACKBAR-07-0`, `ETC-5-SNACKBAR-08-0`, `FDR-2-MODAL-01-0`, `FDR-3-SHEET-02-0`, `FDR-4-SNACKBAR-03-0` |
| tsv에만(소스 `@screen` 없음) | 7 | `(ID없음)`, `(미확인)`, `ADD-3-PAGE-02-0`, `ADD-4-SNACKBAR-02-0`, `ETC-4-MODAL-05-0`, `ETC-4-SNACKBAR-03-0`, `ETC-7-PAGE-01-0` (`(ID없음)`/`(미확인)`은 tsv 자리표시 행) |
| §2에만(tsv에 없음) | 37 | `ADD-2-MODAL-01-0`, `ADD-2-SNACKBAR-01-0`, `ADD-4-PAGE-01-0`, `ADD-4-PAGE-02-0`, `ADD-4-SNACKBAR-01-0`, `COM-3-PAGE-01-0`, `COM-3-PAGE-04-0`, `DSH-2-PAGE-05-0`, `DTB-2-PAGE-03-0`, `DTB-3-MODAL-02-0`, `DTB-3-PAGE-01-0`, `DTB-4-MODAL-01-0`, `DUE-3-MODAL-03-0`, `DUE-3-PAGE-02-1`, `DUE-3-SNACKBAR-01-0`, `DUE-3-SNACKBAR-02-0`, `DUE-4-MODAL-03-0`, `DUE-4-SNACKBAR-01-0`, `DUE-5-PAGE-02-0`, `DUE-5-SNACKBAR-01-0`, `ETC-3-PAGE-02-1`, `ETC-3-PAGE-03-1`, `ETC-3-SHEET-06-0`, `ETC-4-PAGE-05-1`, `ETC-4-PAGE-07-1`, `ETC-4-SNACKBAR-02-0`, `ETC-4-SNACKBAR-04-0`, `ETC-5-MODAL-01-0`, `ETC-5-PAGE-02-0`, `ETC-5-SNACKBAR-04-0`, `ETC-5-SNACKBAR-05-0`, `ETC-5-SNACKBAR-06-0`, `ETC-5-SNACKBAR-07-0`, `ETC-5-SNACKBAR-08-0`, `FDR-2-MODAL-01-0`, `FDR-3-SHEET-02-0`, `FDR-4-SNACKBAR-03-0` |
| tsv에만(§2에 없음) | 7 | `(ID없음)`, `(미확인)`, `ADD-4-SNACKBAR-02-0`, `COM-1-SNACKBAR-02-0`, `ETC-4-MODAL-05-0`, `ETC-4-SNACKBAR-03-0`, `ETC-7-PAGE-01-0` |
| §5-18에만(§2에 없음) | 0 | — |
| §5-18에만(tsv에 없음) | 6 | `ADD-4-PAGE-01-0`, `COM-3-PAGE-01-0`, `COM-3-PAGE-04-0`, `DTB-2-PAGE-03-0`, `DTB-3-PAGE-01-0`, `ETC-5-PAGE-02-0` |
| §5-18에만(소스 `@screen` 없음) | 1 | `DTB-2-PAGE-03-0` (`TransactionDetailScreen.tsx` 본문 주석에만 언급, `@screen` 태그는 `DTB-2-PAGE-02-0`뿐) |
| 소스 `@screen` PAGE인데 §5-18에 없음 | 24 | `COM-1-PAGE-02-0`, `COM-2-PAGE-04-0`, `COM-2-PAGE-05-0`, `DUE-1-PAGE-01-0`, `DUE-2-PAGE-01-0`, `DUE-2-PAGE-03-0`, `DUE-2-PAGE-03-1`, `DUE-3-PAGE-01-0`, `DUE-3-PAGE-04-0`, `DUE-3-PAGE-06-0`, `ETC-2-PAGE-04-0`, `ETC-2-PAGE-06-0`, `ETC-3-PAGE-02-0`, `ETC-3-PAGE-02-1`, `ETC-3-PAGE-03-0`, `ETC-3-PAGE-03-1`, `ETC-4-PAGE-03-0`, `ETC-4-PAGE-04-0`, `ETC-4-PAGE-05-0`, `ETC-4-PAGE-05-1`, `ETC-4-PAGE-07-0`, `ETC-4-PAGE-07-1`, `ETC-4-PAGE-XX-0`, `ETC-5-PAGE-01-0` (§5-18 범위 밖이라 예상되는 차이 — 블루/흰색 확정 화면 등) |

tsv 원본 행 중복(같은 ID가 여러 행): `COM-1-SNACKBAR-02-0`(5행) 등 — 한 명세서 이미지가 여러 ID를 다루는 구조라서로 보이나 확인 안 함.

**분류 기준(한 줄)**: `src/screens` 아래 파일이라도 라우트로 등록되지 않고 다른 화면이 부품으로 쓰는 것은 "화면 아님 — src/screens 내 컴포넌트"이며 `@screen` 주석이 없는 게 정상이고, 라우트/네비게이터가 통째로 렌더하는 것만 화면으로 본다(사용자 판단 2026-09-19).

**분류 확정(6-10, 사용자 판단 반영 — 파일 이동·코드 변경 없음)**

| 대상 | 확정 분류 | 비고 |
|---|---|---|
| `CalendarViewToggle`, `QuickServiceCard`, `FolderMoreMenu`, `FolderTabNavigator`, `GroupSwitcherMenu`, `MemberMoreMenu`, `NotificationListItem`, `ReceiptGrid`, `ReportEntryList` (9개) | **화면 아님 — src/screens 내 컴포넌트** | `@screen` 없음이 정상. §5-19 B의 "`@screen` 없는 10개" 중 이 9개가 해소됨 |
| `SplashScreen` | **실제 화면** | §2 COM 구역에 `(ID 없음)`/`시안 없음` 행 추가. 배경 판정 현황 표(165→166, 미판정 136→137)만 갱신. 상태 요약표·도메인별 표는 IA 159개 기준이라 안 건드림(위 §2 행 설명) — 3표 동기화 지시와 충돌하는 부분이므로 이의 있으면 알려 주길 |
| `ReceiptGalleryPickerScreen` | 누락 아님 | `ADD-2-SHEET-05-0` 행은 §2에 이미 있었고(코드 열에 `TransactionAttachMenuSheet`만 적혀 있었음) 이 파일이 같은 ID 주석을 달고 있었다 — 코드 열에 병기함. 등급 변경 없음 |
| `More/TermDetailScreen` | **ID 미확정** | `@screen ETC-4-PAGE-XX-0`은 **자리표시 — 실제 ID 대기**(ID 그대로 둠). §2 `ETC-3-PAGE-11-0` 행에도 표시 |

**§2 ↔ tsv 차이 분류(6-10)** — 이 분류 결과가 다음 시안 대조의 작업 목록이다. 목록엔 아무것도 추가/제거하지 않았다. 전제: `spec-sheet-map.tsv`는 원본 스펙시트를 **점진적으로 채우는 표**라 "tsv 누락"은 오류가 아니라 "아직 원본 스펙시트와 매핑 안 됨"이다. "ID 오타 의심"은 Levenshtein 거리 1 후보를 뽑아 봤으나 순번이 다른 정상 인접 ID뿐이라 근거가 못 되어, 형식 열과 ID 종류가 어긋나는 것만 골랐다.

*§2에만 있는 37개*: tsv 누락 25 / 시안 없는 화면(정상) 7 / ID 오타 의심 3 / 판단 보류 2.

| Screen ID | 화면명(§2) | 분류 | 근거 |
|---|---|---|---|
| `ADD-2-MODAL-01-0` | 이탈 방지 모달 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `ADD-2-SNACKBAR-01-0` | 내역 추가 완료 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `ADD-4-PAGE-01-0` | 영수증 스캔 성공 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `ADD-4-PAGE-02-0` | 사진 촬영 결과 | 시안 없는 화면(정상) | §2 이미지 **0장**, 검토(디자인 열) — 크롭 시안 자체가 없음 |
| `ADD-4-SNACKBAR-01-0` | 이미지 첨부 제한 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `COM-3-PAGE-01-0` | 약관 상세 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `COM-3-PAGE-04-0` | 비밀번호 재설정_완료 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `DSH-2-PAGE-05-0` | 통계 및 분석 | 시안 없는 화면(정상) | §2 이미지 **0장**, 진행(디자인 열) — 크롭 시안 자체가 없음 |
| `DTB-2-PAGE-03-0` | 상세 내역_승인요청 | tsv 누락 | tsv에 같은 시트(`내역_상세내역조회_승인요청내역.png`)가 헤더 ID가 `--`라 `(ID없음)` 행으로만 들어 있음 |
| `DTB-3-MODAL-02-0` | 증빙자료 삭제 | 판단 보류 | IA 디자인 열은 완료인데 §2 이미지가 0장 — 시안이 실제로 없는 것인지 크롭 인덱스에서 빠진 것인지 근거 없음 |
| `DTB-3-PAGE-01-0` | 증빙자료 상세 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `DTB-4-MODAL-01-0` | 상세 내역_수정 이탈 안내 | 판단 보류 | IA 디자인 열은 완료인데 §2 이미지가 0장 — 시안이 실제로 없는 것인지 크롭 인덱스에서 빠진 것인지 근거 없음 |
| `DUE-3-MODAL-03-0` | (IA 목록에 없음) | tsv 누락 | IA-누락 발견분(§5-2)이고 §2 이미지 2장 — tsv 행 없음 |
| `DUE-3-PAGE-02-1` | (IA 목록에 없음) | tsv 누락 | IA-누락 발견분(§5-2)이고 §2 이미지 2장 — tsv 행 없음 |
| `DUE-3-SNACKBAR-01-0` | 입금 확인 | tsv 누락 | §2 이미지 1장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |
| `DUE-3-SNACKBAR-02-0` | 입금 취소 | tsv 누락 | §2 이미지 1장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |
| `DUE-4-MODAL-03-0` | (IA 목록에 없음) | tsv 누락 | IA-누락 발견분(§5-2)이고 §2 이미지 1장 — tsv 행 없음 |
| `DUE-4-SNACKBAR-01-0` | 회비 생성 완료 | tsv 누락 | §2 이미지 1장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |
| `DUE-5-PAGE-02-0` | 개인 납부 내역_검색 | tsv 누락 | §2 이미지 6장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `DUE-5-SNACKBAR-01-0` | 모임원 추가_일괄 완료 | ID 오타 의심 | ID는 SNACKBAR인데 §2 형식 열이 Page — IA 원본의 ID/형식 열 중 한쪽이 잘못이거나 IA가 형식을 다르게 분류한 것(어느 쪽인지는 판단 보류) |
| `ETC-3-PAGE-02-1` | 장부별 보고서 상세(수입/지출) | 시안 없는 화면(정상) | §5-7: `-1` 변형은 `-0`과 같은 시안을 공유하는 별도 화면 아님(2026-09-06 7-G) |
| `ETC-3-PAGE-03-1` | 기간별 보고서 상세(수입/지출) | 시안 없는 화면(정상) | §5-7: `-1` 변형은 `-0`과 같은 시안을 공유하는 별도 화면 아님(2026-09-06 7-G) |
| `ETC-3-SHEET-06-0` | 증빙자료 필터링 | tsv 누락 | §2 이미지 8장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `ETC-4-PAGE-05-1` | 보고서_장부 상세(수입/지출) | 시안 없는 화면(정상) | §5-7: `-1` 변형은 `-0`과 같은 시안을 공유하는 별도 화면 아님(2026-09-06 7-G) |
| `ETC-4-PAGE-07-1` | 보고서_시간순(수입/지출) | 시안 없는 화면(정상) | §5-7: `-1` 변형은 `-0`과 같은 시안을 공유하는 별도 화면 아님(2026-09-06 7-G) |
| `ETC-4-SNACKBAR-02-0` | 기록 제목 변경 완료 | tsv 누락 | §2 이미지 1장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |
| `ETC-4-SNACKBAR-04-0` | 모임 삭제 완료 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `ETC-5-MODAL-01-0` | 보고서_이탈방지 | ID 오타 의심 | ID는 MODAL인데 형식 열이 Page — IA 원본의 ID/형식 열 중 한쪽이 잘못이거나 IA가 형식을 다르게 분류한 것(어느 쪽인지는 판단 보류) |
| `ETC-5-PAGE-02-0` | 보고서_내역 상세 | tsv 누락 | §2 이미지 7장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `ETC-5-SNACKBAR-04-0` | 모임 생성 완료 | tsv 누락 | §2 이미지 1장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |
| `ETC-5-SNACKBAR-05-0` | 모임 전환 완료 | 시안 없는 화면(정상) | §2 이미지 **0장**, 예정(디자인 열) — 크롭 시안 자체가 없음 |
| `ETC-5-SNACKBAR-06-0` | 프로필 변경 완료 | tsv 누락 | §2 이미지 1장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |
| `ETC-5-SNACKBAR-07-0` | 비밀번호 변경 완료 | tsv 누락 | §2 이미지 1장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |
| `ETC-5-SNACKBAR-08-0` | 보고서_생성완료 | ID 오타 의심 | ID는 SNACKBAR인데 형식 열이 Modal — IA 원본의 ID/형식 열 중 한쪽이 잘못이거나 IA가 형식을 다르게 분류한 것(어느 쪽인지는 판단 보류) |
| `FDR-2-MODAL-01-0` | 새 폴더 생성 | tsv 누락 | §2 이미지 1장(크롭 인덱스), 완료 — tsv 행 없음(tsv는 원본 스펙시트를 점진적으로 채우는 표라 미매핑이 기본 상태) |
| `FDR-3-SHEET-02-0` | 예산 설정 | tsv 누락 | tsv의 `FDR-3-SHEET-01-0` 행과 같은 시트로 판단(IA가 두 ID를 같은 시트로 가리킴 — `FolderBudgetListScreen` 주석) |
| `FDR-4-SNACKBAR-03-0` | 이름 변경_완료 | tsv 누락 | §2 이미지 2장, 디자인 열 예정 — 크롭 시안은 있으나 tsv 행 없음(이미지가 부모 시안 속 스낵바일 가능성은 미확인) |

*tsv에만 있는 7개(자리표시 2 + 실제 ID 5)*:

| tsv ID | 분류 | 근거 |
|---|---|---|
| `(ID없음)` | 판단 보류 | 실제 ID가 아니라 시트 헤더 ID 칸이 `--`인 2개 시트의 자리표시 행(`납부관리수입내역` — tsv 비고는 `DTB-2-PAGE-02-0` 변형 추정 / `승인요청내역` — 위 §2 `DTB-2-PAGE-03-0`의 시트). 분류 3종에 안 맞음 |
| `(미확인)` | 판단 보류 | 헤더를 아직 못 읽은 시트(`폴더_장부상세_필터링_기간 선택.png`)의 자리표시 행 — ID 자체가 없음 |
| `ADD-4-SNACKBAR-02-0` | 판단 보류 | IA·§2·소스 어디에도 없고 tsv 비고는 `부모: ADD-3-PAGE-01-0`(영수증 스캔 시안 속 스낵바)뿐 — 미구현/ID 변경/오기 중 근거 없음 |
| `ETC-4-SNACKBAR-03-0` | 판단 보류 | IA·§2·소스에 없고 tsv 비고는 `부모: ETC-3-MODAL-01-0`(모임 나가기 시안 속 스낵바)뿐 — 근거 없음 |
| `COM-1-SNACKBAR-02-0` | tsv 오기 의심 | §5-2가 이미 "실제로는 `ETC-5-SNACKBAR-06-0`(프로필 변경 완료)의 오기, 스펙 문서 전반의 복붙 실수"로 기록 — tsv에는 서로 다른 부모 시트 5행이 같은 ID로 들어 있음(소스엔 `MemberEditScreen`이 이 ID로 주석) |
| `ETC-4-MODAL-05-0` | ID 변경됨 | tsv 비고가 "IA의 `ETC-4-SHEET-01-0`과 불일치 가능" — §2 `ETC-4-SHEET-01-0`(모임 참여, `JoinGroupSheet`)이 같은 "코드로 참여하기" 화면으로 보임(IA는 SHEET-01-0, 시안 헤더는 MODAL-05-0) |
| `ETC-7-PAGE-01-0` | 미구현 화면 | §5-2에 "사진 편집(원형 크롭)"로 기록된 IA-누락 신규 ID(depth 7) — 대응 코드 없음(`src`에서 사진 편집 화면 검색 0건) |

### 5-20. 장부 상세(`FDR-2-PAGE-05-0`) 코드 현황 — 다음 시안 대조용 사전 조사 (2026-09-20, 10-2, 조사만 — 소스 수정 없음)

`LedgerDetailScreen.tsx` 기준. 9-1 조사 이후 배경(`ScreenContainer background="primary"`, 9-3)·스낵바(슬롯, 9-3)가 바뀌어 다시 읽었다. **dp는 코드의 값과 그로부터 계산한 값**이고 시안 실측과 대조하기 전이다. 색은 상수명 + HEX.

**앱바** (`AppBar` `type` 미지정 → 기본 `sub`)
- 제목 소스: `ledger.name`(`ledgerService.getLedgerDetail`). 로딩·에러 상태의 앱바 제목은 `""`. 제목 `TYPOGRAPHY.h2`(20/28 semibold), `numberOfLines={1}` `ellipsizeMode="tail"`(10-1 이후 `flexShrink: 1`).
- 좌: `BackButton` size 34. 컨테이너 좌우 패딩 20, 상하 12.
- 우측 액션 순서: ① 검색 아이콘(`assets/icons/system/Search.png`, 24×24 → `LedgerSearch`) ② ⋮ 아이콘(`assets/icons/action/MenuHorizontal.png`, 24×24 → 장부 메뉴). 아이콘 간격 16.
- ⋮ 메뉴 3항목: `예산 설정`(`LEDGER_MENU_BUDGET`) / `장부 이름 변경`(`LEDGER_MENU_RENAME`) / `장부 삭제`(`LEDGER_MENU_DELETE`).

**캐러셀** (`ScrollView horizontal pagingEnabled`, `decelerationRate="fast"`)
- 슬라이드 2장, 각 슬라이드 폭 = 화면 폭(`useWindowDimensions`), 안쪽 좌우 패딩 24 → **카드 폭 = 화면 폭 − 48**. 캐러셀 위 여백 16(`carousel.marginTop`). 인접 카드 미리보기(peek) 없음, 카드 사이 간격 개념 없음(페이지 스냅).
- 슬라이드 1 = `AmountCard type="incomeExpense"`(수입/지출/합계). 슬라이드 2 = 예산이 있으면 `BudgetCard`(default), 없으면 `BudgetCard state="empty"`.
- 페이지 인디케이터 `CarouselIndicator count={2}`: 점 5×5(`FOREGROUND_DISABLED` `#C1C5CD`), 선택 점 8×8(`FOREGROUND_SECONDARY` `#4A7FE7`), 점 간격 6. 위 여백 12, 아래 여백 16(`indicatorRow`), 가운데 정렬.
- 카드 공통(`CardBase` filled): 모서리 12, 안쪽 패딩 16, 배경 `FILL_NEUTRAL_SUBTLE` `#FFFFFF`, 테두리 없음.
- `AmountCard`(수입/지출): 행 상하 패딩 6. 라벨 `TYPOGRAPHY.body3`(12/16) `FOREGROUND_NEUTRAL_SUBTLE` `#9B9B9B`, 값 `body3` + `fontWeight: bold`. 행: `수입` `{N}원`(값 색 `FEEDBACK_POSITIVE_BOLD` `#4A7FE7`), `지출` `-{N}원`(`formatExpense`, 0이면 `0원`, 기본색), 점선 구분선(`Divider dashed`, 1dp, `BORDER_NEUTRAL_NORMAL` `#E5E7EB`, 위아래 여백 8), `합계` `{수입−지출}원`(라벨 기본 색). **계산 높이 ≈ 133dp**(패딩 32 + 행 3×28 + 구분선 17).
- `BudgetCard`(default): 제목 `남은 예산 {N}원` `TYPOGRAPHY.h3`(18/24); `Divider`(full-width, 위아래 여백 12); 통계 행 = `지출`(라벨 `body3` `#9B9B9B`, 값 `subtitle3` 14/20 `formatExpense`) | 세로 `Divider`(좌우 여백 16) | `예산`(값 `{N}원`), 행 아래 여백 12, 열 내부 간격 4; `ProgressBar showLabel`(높이 8, round 모서리 4, 채움 `#4A7FE7`, 트랙 `FILL_NEUTRAL_NORMAL` `#F3F4F6`, 라벨 `body3` `#9B9B9B` 우측 정렬 아래 여백 4). `BudgetCard state="empty"`: 문구 `예산을 설정하고 장부를 체계적으로 관리해보세요!`(`body3`, `#9B9B9B`, 가운데, 상하 패딩 24). **두 카드 높이가 서로 다르다**(수입/지출 ≈133, 예산 default는 그보다 큼, empty는 더 작음) — 캐러셀 높이는 가장 큰 슬라이드에 맞춰진다.

**내역 리스트** (`FlatList`, 무한 스크롤 `onEndReached` threshold 0.4, 하단 `불러오는 중...`(`LEDGER_ENTRIES_LOADING_MORE`))
- **날짜 그룹 헤더 없음.** 각 행이 자기 날짜를 작은 라벨로 든다. 라벨 = `item.occurredOn` 서버 문자열 그대로(`YYYY-MM-DD`, 점 표기 변환 없음).
- 행 = `TransactionListItem`: 상하 패딩 12, 좌우 패딩 12(단 `marginHorizontal: -12`로 상쇄 → 콘텐츠 폭은 리스트 폭 = 화면 폭 − 48, 눌림 배경 `#F3F4F6` 모서리 8만 좌우로 12씩 번짐). **※ 갱신(2026-09-21)**: 아래 서술 중 좌/우 열 구조는 두 줄 구조로 바뀌었다 — 윗줄: 왼쪽 날짜/장부명 `TYPOGRAPHY.caption`(**fontSize 8**, lineHeight 16) `FOREGROUND_NEUTRAL_NORMAL` `#4B5563`(없으면 생략), 오른쪽 상태 슬롯(`marginLeft: auto`, 라벨이 없어도 오른쪽 끝) — **승인 대기면 `Badge`(`CALENDAR_APPROVAL_BADGE_LABEL`, warning), 아니고 증빙이 있으면 영수증 아이콘(`Report.png`), 그것도 아니면 납부관리 아이콘(`content/Bill.png`)이 기본** 18×18(`#9B9B9B`), 우선순위 승인 > 영수증 > 납부관리 하나만(사용자 결정, 시안엔 기본 아이콘이 없어 시안 대조 판단 보류 — 스펙시트 원본이 이 환경에 없음). 아랫줄: 왼쪽 내역명 · 오른쪽 금액, 둘 다 **볼드**(`subtitle3` 14/20을 Regular Family + `fontWeight: 'bold'`로 — semibold에서 변경), 줄 간격 4, 내역명은 `flex: 1`(긴 제목이 금액을 밀지 않도록), 금액과 사이 12. 금액은 항상 아랫줄이라 제목과 같은 줄이다. 행 높이는 항상 ≈ 66dp(12 + 18 + 4 + 20 + 12), 승인 배지 행은 배지 높이 20이라 ≈ 68dp. `hasDues`/`duesId` prop은 없다. 아래는 이전(2026-09-20 이전) 서술: 상하 패딩 12, 좌우 패딩 12(단 `marginHorizontal: -12`로 상쇄 → 콘텐츠 폭은 리스트 폭 = 화면 폭 − 48, 눌림 배경 `#F3F4F6` 모서리 8만 좌우로 12씩 번짐). 좌 열(간격 4): 날짜 `TYPOGRAPHY.caption`(**fontSize 8**, lineHeight 16) `FOREGROUND_NEUTRAL_NORMAL` `#4B5563`, 내역명 `subtitle3`(14/20 semibold). 우 열(오른쪽 정렬, 간격 4): 승인 대기면 `Badge`(`CALENDAR_APPROVAL_BADGE_LABEL`, warning), 아니고 증빙이 있으면 영수증 아이콘 18×18(`#9B9B9B`), 그 아래 금액 `subtitle3` — 수입 `{N}원` `#4A7FE7`, 지출 `-{N}원` 기본색. **행 높이 ≈ 64dp**(12+16+4+20+12), 우 열에 아이콘/배지가 있으면 ≈ 66dp. 행 사이 **구분선 없음**, 행 간격 없음.
- 리스트 좌우 패딩 24, 아래 24. 배경은 화면 배경 그대로(카드 흰색 아님).

**필터·검색 진입점**: 앱바 검색 아이콘 → `LedgerSearch`(`LedgerSearchScreen`, `FDR-3-PAGE-02-0`) 하나뿐. **필터 진입점은 이 화면에 없다** — `LedgerFilterSheet`(`FDR-3-SHEET-03-0`)는 `LedgerSearchScreen`에서만 쓰인다.

**빈 상태**(`entries.length === 0`, 캐러셀·인디케이터는 그대로 위에 남음): 제목 `LEDGER_LIST_EMPTY_TITLE` = `아직 내역이 존재하지 않아요.`(`subtitle3`), 부제 `LEDGER_LIST_EMPTY_SUBTITLE` = `내역을 추가하여 모임 장부를 정리해보세요.`(`body2` `#9B9B9B`, 제목과 간격 6), 위 여백 80, 가운데 정렬.

**FAB·하단 CTA**: 이 화면 파일에는 없다. 하단 고정 버튼 없음(그래서 `snackbarOffset` 없이 슬롯 기본 위치).

**기타**: 로딩 `LEDGER_DETAIL_LOADING` = `장부 정보를 불러오는 중이에요.`, 에러 시 `다시 시도`(`LEDGER_DETAIL_RETRY_LABEL`). 다이얼로그 3종(이름 변경·예산 설정·삭제)과 스낵바(이름 변경/삭제/예산 저장 완료)는 슬롯 사용. `ScreenContainer background="primary"`, `edges` 기본(top, bottom).

**시안 대조 때 눈여겨볼 것**(판단 아님): 날짜 그룹 헤더 유무, 날짜 표기(`YYYY-MM-DD` vs 점 표기), `caption` 8pt, 필터 진입점 유무, 캐러셀 카드 높이 차이, 행 구분선 유무.

**※ 갱신(2026-09-20 10-3)**: 위 서술 중 다음은 10-3 수정으로 바뀌었다 — 앱바 우측은 ⋮ 하나뿐(검색 아이콘 제거, `Search.png`는 카드 아래 줄로 이동), 카드 아래에 필터 아이콘(`Filter.png` 24×24, 좌) · 검색 아이콘(`Search.png` 24×24, 우) 줄(좌우 패딩 24, 아래 여백 8)이 생겼고 그 아래 개수 `{totalElements} 건`(`LEDGER_COUNT_SUFFIX`, `body2` `#9B9B9B`, 아래 여백 8), 리스트는 `SectionList`로 날짜 그룹 헤더(`formatDateHeader` → `4월 16일 목요일`, `body3` bold `#9B9B9B`, 위 12·아래 6)를 쓰고 행은 날짜 라벨 없이 내역명 + 금액이다(행 높이는 라벨이 빠져 약 44dp = 12 + 내역명 20 + 12였으나 **2026-09-21 이후 항상 상태 아이콘(기본 납부관리)이 윗줄에 붙어 약 66dp = 12 + 18 + 4 + 20 + 12**(윗줄은 아이콘만 오른쪽 끝) — 계산값, 시안 대조 때 실측). 필터 값은 화면 상태(`filter`, 최신값은 `filterRef`)이고 바뀌면 `getEntries`에 `type`/`status`/`sort`를 얹어 목록만 다시 받는다.

**※ 갱신(2026-09-20 10-4)**: 카드 캐러셀·인디케이터·필터/검색 줄·개수는 이제 `SectionList`의 `ListHeaderComponent`다(Scroll-away). 앱바는 리스트 밖이라 고정, 캐러셀은 리스트 콘텐츠 좌우 패딩(24) 안이라 `marginHorizontal: -24`로 화면 폭을 되찾는다. `stickySectionHeadersEnabled={false}`. 빈 상태는 `ListEmptyComponent`(위 여백 80). 위 "카드 사이 간격 개념 없음"·"인접 카드 미리보기 없음"은 그대로.

### 5-21. 장부 내 검색(`FDR-3-PAGE-02-0`) 코드 현황 — 다음 시안 대조용 사전 조사 (2026-09-20, 10-4, 조사만 — 소스 수정 없음)

`LedgerSearchScreen.tsx` 기준. **dp는 코드의 값과 계산값**, 시안 실측과 대조하기 전이다. 색은 상수명 + HEX.

**루트·앱바**: `ScreenContainer background="secondary"`(흰색) `edges={['bottom']}`, `container` = `paddingTop: 60`(하드코딩, 유지) + `paddingHorizontal: 24`. **`AppBar` 컴포넌트를 쓰지 않는다** — 헤더 행을 직접 만든다: `BackButton`(기본 size 28 → 아이콘 약 16.8) + `SearchField`(`flex: 1`), 둘 사이 간격 8, 행 아래 여백 12. 제목·우측 아이콘 없음.

**검색 필드**(`SearchField` 기본 `size="lg"`, `variant="default"`): 높이 44, 모서리 24, 좌우 패딩 16, 배경 `FILL_NEUTRAL_NORMAL` `#F3F4F6`(테두리 없음), 입력 `TYPOGRAPHY.body2`(14/20) `FOREGROUND_NEUTRAL_NORMAL` `#4B5563`, 검색 아이콘 18×18 `tintColor` `#9B9B9B`(입력 뒤 = 우측). placeholder `LEDGER_SEARCH_PLACEHOLDER` = `내역명을 입력해주세요.`(색 `FOREGROUND_DISABLED` `#C1C5CD`). 입력이 바뀔 때마다(`query` 상태) `keyword`로 서버에 다시 조회한다(디바운스 없음). 서버 `keyword`는 제목과 메모를 함께 검색(`Entry (내역).txt`).

**필터 진입점**: 헤더 행 아래 별도 행(`filterRow`, 우측 정렬, 아래 여백 8)에 `TextButton` 하나 — 라벨 `필터`(파일 안 로컬 상수 `FILTER_LABEL`, 다른 상수 파일에 없음), `hierarchy="tertiary"`(배경 `#F3F4F6`, 글자 `FOREGROUND_NEUTRAL_SUBTLE` `#9B9B9B`, `TYPOGRAPHY.button`, 상하 패딩 4). 아이콘 없이 텍스트 버튼이다(장부 상세는 `Filter.png` 아이콘). 누르면 `LedgerFilterSheet`(`FDR-3-SHEET-03-0`)가 열리고, 이 화면이 필터 값(`DEFAULT_LEDGER_FILTER`: 구분 전체/승인 상태 전체/정렬 최신)을 들고 검색과 함께 서버 조건으로 넘긴다.

**결과 리스트**: `FlatList`, 무한 스크롤(`onEndReachedThreshold` 0.4, 하단 `LEDGER_ENTRIES_LOADING_MORE` = `불러오는 중...`), 콘텐츠 아래 패딩 24. **날짜 그룹 헤더 없음 — 행마다 날짜 라벨**: `TransactionListItem label={item.occurredOn}`(서버 문자열 `YYYY-MM-DD` 그대로, `TYPOGRAPHY.caption` 8/16 `#4B5563`) + 내역명(`subtitle3` 14/20) + 우측 금액(수입 `#4A7FE7`, 지출 `-N원` 기본색) / 영수증 아이콘 18×18 또는 `승인요청` 배지. **행 높이 ≈ 64dp**(12 + 16 + 4 + 20 + 12), 아이콘/배지가 있으면 ≈ 66dp. **2026-09-21 이후**: 윗줄 = 날짜 라벨(왼) · 상태 슬롯(오른, 배지/영수증/기본 납부관리 `Bill.png`), 아랫줄 = 내역명(왼)·금액(오른) 볼드 — 항상 ≈ 66dp(배지 행 ≈ 68dp). 행 구분선·간격 없음. 행 좌우는 화면 패딩 24 안(눌림 배경만 좌우 12씩 번짐).

**개수 표기**: 없다(단위도 없음).

**결과 없음**: `LEDGER_SEARCH_EMPTY` = `해당되는 내역이 없어요.`(`TYPOGRAPHY.subtitle3` 14/20, 색 `FOREGROUND_NEUTRAL_SUBTLE` `#9B9B9B`, 위 여백 80, 가운데 정렬). 부제 없음. **요청 실패**는 별도 — 오류 문구(`getApiErrorMessage`/네트워크 문구) + `다시 시도`(`LEDGER_DETAIL_RETRY_LABEL`) `Button hierarchy="secondary"`, 문구와 버튼 간격 12.

**최근 검색어**: 없다(저장·표시 코드 없음). **자동완성·검색어 지우기 버튼**도 없음(`SearchField`에 clear 버튼 없음).

**시안 대조 때 눈여겨볼 것**(판단 아님): 앱바가 커스텀(`AppBar` 아님)이라 높이·좌우 패딩(20 vs 24)이 다른 화면과 다를 수 있음, 필터 진입점 모양(텍스트 vs 아이콘)·위치, 날짜 라벨 vs 그룹 헤더(`M월 D일 요일`), 개수 유무, 결과 없음 문구, 최근 검색어 유무, `paddingTop: 60` 하드코딩.

**※ 갱신(2026-09-20 10-5)**: 위 서술 중 다음은 10-5 수정으로 바뀌었다 — 앱바는 `AppBar type="sub"` + 장부명(`route.params.ledgerName`, 장부 상세가 넘김)이고 `paddingTop: 60` 하드코딩은 사라졌다(`ScreenContainer` 기본 `edges`). 검색 필드는 앱바 아래 별도 줄(위 8·아래 12, 좌우 24). 결과는 `SectionList` + 날짜 그룹 헤더(`formatDateHeader`, `body3` bold `#9B9B9B`, 위 12·아래 6)이고 행에서 날짜 라벨이 빠져 행 높이는 약 44dp였으나 2026-09-21부터 항상 상태 아이콘(기본 납부관리)이 붙어 약 66dp, `keyboardDismissMode="on-drag"` + `keyboardShouldPersistTaps="handled"`. placeholder `내역명, 장부명을 입력해주세요.`(불일치 #15), 결과 없음 `LEDGER_ENTRY_SEARCH_EMPTY` = `해당되는 내역이 없어요`(마침표 없음). 필터 `TextButton`·자동 포커스 없음·백버튼 동작·검색어 지우기 버튼 없음은 그대로(판단 보류, `design-diff.md`).

### 5-22. `SearchField` 사용처 8곳 현황 (2026-09-20, 10-6, 시안 대조용 — 조사 표)

`SearchField` 스타일: **채움**(`default`) = 배경 `FILL_NEUTRAL_NORMAL` `#F3F4F6`, 테두리 없음 / **테두리**(`outline`) = 배경 `#FFFFFF` + 1px `BORDER_NEUTRAL_NORMAL` `#E5E7EB`, 포커스 시 테두리와 입력 글자가 `#4A7FE7`(파랑)로 바뀐다. 공통: `size` 기본 `lg`(높이 44) — **8곳 모두 `size`를 안 넘겨 44**, 모서리 24, 좌우 패딩 16, 입력 `body2` 14/20, 우측 돋보기 18×18. 지우기(⊗)·자동 포커스는 10-6에서 추가한 prop이라 `LedgerSearchScreen` 외에는 없다.

| Screen ID | 파일 | 스타일 | placeholder(상수) | 지우기 | 자동 포커스 |
|---|---|---|---|---|---|
| `DUE-3-PAGE-01-0` | `Dues/DuesCreateScreen.tsx`(모임원 선택 단계) | 채움 | `검색어를 입력해주세요.`(`DUES_MEMBER_SELECT_SEARCH_PLACEHOLDER`) | 없음 | 없음 |
| `DUE-3-PAGE-02-0` | `Dues/DuesMemberEditScreen.tsx` | 채움 | `검색어를 입력해주세요.`(`DUES_MEMBER_SELECT_SEARCH_PLACEHOLDER`) | 없음 | 없음 |
| `FDR-1-PAGE-01-0` / `FDR-2-PAGE-04-0` | `Folder/FolderScreen.tsx`(폴더 메인·상세 공용) | 채움 | `검색어를 입력해주세요.`(`FOLDER_SEARCH_PLACEHOLDER`) | 없음 | 없음 |
| `DUE-2-PAGE-02-0` | `Member/MemberManageScreen.tsx` | **테두리** | `검색어를 입력해주세요.`(`MEMBER_MANAGE_SEARCH_PLACEHOLDER`) | 없음 | 없음 |
| `ETC-3-PAGE-05-0` | `Receipt/ReceiptSearchScreen.tsx` | 채움 | `검색어를 입력해주세요.`(`RECEIPT_SEARCH_PLACEHOLDER`) | 없음 | 없음 |
| `ETC-5-PAGE-01-0` | `Report/ReportLedgerSelectScreen.tsx` | **테두리** | `검색어를 입력해주세요.`(`REPORT_LEDGER_SELECT_SEARCH_PLACEHOLDER`) | 없음 | 없음 |
| `DTB-2-PAGE-01-0` | `Transactions/TransactionSearchScreen.tsx`(내역 검색_전체) | 채움 | `내역명, 장부명을 입력해주세요.`(`TRANSACTION_SEARCH_PLACEHOLDER`) | 없음 | 없음 |
| `FDR-3-PAGE-02-0` | `Folder/LedgerSearchScreen.tsx`(장부 내 검색) | **테두리**(10-6에서 변경, 종전 채움) | `내역명, 장부명을 입력해주세요.`(`LEDGER_SEARCH_PLACEHOLDER`) | **있음**(값이 있을 때, 돋보기 왼쪽) | **있음** |

- 지우기 아이콘은 `TextField`의 `onClear`와 같은 `assets/icons/action/Close.png`(16×16, `#9B9B9B`)다 — **동그라미 X(⊗) 에셋은 없어** 일반 X로 그렸다.
- 참고: `TransactionSearchScreen`의 placeholder가 `내역명, 장부명을 입력해주세요.`인 것이 불일치 #15에서 장부 내 검색 목업에 "장부명"이 들어간 이유로 보인다(전체 내역 검색 시안 문구를 복사했을 가능성 — 추정, 기획 확인 필요).
- 참고: 포커스 상태의 `outline`은 입력 글자가 파랑이다. 장부 내 검색 목업의 입력 글자(`MT`)는 어두운 색으로 보여 다를 수 있다 — 대조 때 확인(미수정).

**※ 갱신(2026-09-20 10-7, 시안 실측 반영 — 위 표의 "스타일" 열은 10-6 시점)**: 명세서 9개 시트 실측으로 `SearchField` 기본값을 바꿨다 — 채움색은 9곳 전부 `#FFFFFF`(회색 채움 `#F3F4F6`은 시안에 없음), 높이 48dp(종전 44), 모서리 pill, 좌우 24. 테두리는 화면 배경이 흰색이면 `#E1E3E8` 1px, 파란 배경이면 없음 → `variant`로 갈랐다. 배정: `FolderScreen`(폴더 메인·상세, 파란 배경) = **기본(테두리 없음)**, 나머지 7곳(`LedgerSearchScreen`, `TransactionSearchScreen`, `ReceiptSearchScreen`, `ReportLedgerSelectScreen`, `MemberManageScreen`, `DuesCreateScreen` 모임원 선택, `DuesMemberEditScreen`) = `outline`. 테두리색은 `#E1E3E8`이 `colors.ts`에 없어 가장 가까운 기존 상수 `BORDER_NEUTRAL_NORMAL`(`GREY_200` `#E5E7EB`, 채널당 3~4 차이)을 썼다 — 새 상수는 만들지 않았다. `SearchField`에서 `FILL_NEUTRAL_NORMAL`(`#F3F4F6`)은 완전히 사라졌다.

**조사(10-7, 수정 안 함)**: ① 입력 글자 파랑의 출처 — `SearchField`의 `inputFocused: { color: FOREGROUND_SECONDARY }`(`#4A7FE7`)가 **`variant`와 무관하게** `isFocused`일 때 `TextInput` 스타일에 붙는다(테두리 파랑 `containerOutlineFocused`만 outline 전용). 그래서 기본 variant(폴더 화면)도 포커스 중 글자가 파랑이다. ② 원형 ⊗ 에셋 — `assets/icons/`에 없다. `action/Close.png`(사각 X, 96×96)와 `action/Delete.png`(휴지통)뿐이고 지우기 아이콘은 `Close.png`를 16×16 `#9B9B9B`로 쓴다.

**※ 갱신(2026-09-20 10-8)**: 위 조사 ①(포커스 글자 파랑)은 시안 실측으로 결함 확정 → 수정했다. `inputFocused` 색 제거, 글자는 포커스와 무관하게 기본색, 파랑은 `cursorColor`/`selectionColor`(`#4A7FE7`)만. ②(원형 ⊗ 에셋 없음)는 그대로 — `docs/asset-requests.md`로 요청.

**시안 실측값(SearchField, 2026-09-20)**

```
채움 #FFFFFF / 높이 48dp / 좌우 24dp / 모서리 pill
테두리: 흰 배경 화면만 #E1E3E8 1px (구현은 GREY_200 #E5E7EB — 채널당 3~4 차이)
포커스: 글자는 기본색 유지, 커서만 #4A7FE7
지우기: 원형 ⊗ #9AA1AE, 돋보기 왼쪽
근거: 폴더_메인화면.png Case C / 내역_검색.png#0 / 더보기_모임관리_모임원관리.png#0
```

### 5-23. `COM-1-PAGE-01-0` 로그인 통합 정리 (2026-09-20, 11-1, 조사·기록만 — 코드 수정 없음)

원본 스펙시트 `화면명세서/회원가입&로그인/회원가입/로그인_메인화면.png`(`ver 0.25`, **디자인 현황 = 디자인 완료** — 다른 시트의 `디자인 중`보다 신뢰도가 높다). 이 화면의 기록이 여러 곳에 흩어져 있어 한곳에 모은다.

**A. 시안 vs 앱 현재 상태 (dp, 문구 원문, 상수명)**

| 항목 | 시안 | 앱 현재 |
|---|---|---|
| 로고 | 남색 책(큐브) 아이콘 + `Billage` 워드마크, 가로 배치 | `assets/images/Billage_logo.png`(워드마크만) `width: 140`(높이 자동, 원본 152×44), 아래 여백 48. 심볼 `Billage_simbol_big.png`(120×116)는 **미참조** — 이미지를 열어 비교한 결과 시안의 아이콘 마크와 같은 도형 → 에셋 요청 불필요, 연결만 하면 됨 |
| No.1 이메일 | placeholder `이메일`. Default 하단 가이드 라인 그레이 / Focus 라인 강조 + 커서 / Error: 이메일 형식이 아니거나 미입력 상태로 시도 시 하단 가이드 문구 | `TextField`(밑줄형). placeholder `LOGIN_EMAIL_PLACEHOLDER` = `이메일`(일치). 밑줄: 기본 `BORDER_NEUTRAL_NORMAL` `#E5E7EB`, 포커스 `FOREGROUND_SECONDARY` `#4A7FE7`(시안 "강조"와 같은 방향). `autoCapitalize="none"`, `keyboardType="email-address"`. **이메일 형식·미입력 검증 없음** — 화면에서 막지 않고 서버로 보낸다(서버 응답으로만 실패 판단). 이 필드엔 에러 표시가 없다(에러는 비밀번호 필드 아래에만) |
| No.2 비밀번호 | placeholder `비밀번호`. 마스킹 중 우측 **눈 아이콘에 사선**, 눈 아이콘 터치 시 평문 노출 + 사선 사라짐 | `TextField secureTextEntry`(마스킹만). placeholder `LOGIN_PASSWORD_PLACEHOLDER` = `비밀번호`(일치). **눈 아이콘 토글 없음** — `TextField`는 `secureToggle`을 지원하지만 로그인 화면이 켜지 않는다(§5-17 유형). 에셋은 있다(`system/Eye.png` 열린 눈, `system/Eye Closed.png` 사선 눈, 20×20 `#9B9B9B`). 단 `TextField`의 아이콘 매핑은 **마스킹 중 = 열린 눈(`EYE_ICON`), 노출 중 = 사선 눈**으로 시안과 반대다(시안: 마스킹 중 사선, 노출 시 사선 사라짐) — 토글을 켤 때 함께 봐야 함 |
| No.3 버튼 | `로그인하기` fullWidth 남색. **이메일·비밀번호 중 하나라도 비면 비활성**, 둘 다 입력되면 활성 | `LOGIN_SUBMIT_LABEL` = `로그인하기`(일치). `Button primary`(`NAVY_800` `#070A23`) fullWidth 높이 52, 모서리 8. **`disabled={isSubmitting}`뿐** — 빈 입력에도 활성이고 그대로 요청이 나간다(시안과 다름). 성공: `goToMain()`(`groupService.getMyGroups()` 후 `navigation.reset` → `Main` = 대시보드, 일치) |
| No.3 실패 | 화면 하단 **토스트** `이메일 또는 비밀번호를 다시 확인해주세요.` 약 2~3초 후 자동 페이드아웃 | **토스트가 아니다.** 비밀번호 필드 아래 인라인 에러(`TextField error`, 빨강). `INVALID_CREDENTIALS` → `LOGIN_INVALID_CREDENTIALS_ERROR` = `이메일 또는 비밀번호가 올바르지 않습니다.`, 그 밖 → `LOGIN_GENERIC_ERROR` = `로그인에 실패했습니다. 잠시 후 다시 시도해주세요.`. 자동으로 사라지지 않고 입력을 바꾸면 사라진다. 스낵바 슬롯은 다른 화면이 돌려보낸 메시지(`route.params.snackbarMessage`, 1600ms)만 띄운다 |
| No.4 텍스트 버튼 | 좌 `비밀번호를 잊으셨나요?` → 비밀번호 재설정 / 우 `회원가입하기` → 회원가입. **밑줄**, 작은 글자 | `LOGIN_FIND_PASSWORD_LABEL` / `LOGIN_GO_TO_SIGNUP_LABEL`(문구 일치). `TextButton hierarchy="tertiary"`: 글자 `FOREGROUND_NEUTRAL_SUBTLE` `#9B9B9B`, `TYPOGRAPHY.button`, 패딩 좌우 8·상하 4, 모서리 6, **밑줄 없음**. 가운데 정렬, 둘 사이 간격 16, 위 여백 4. 이동: `PasswordReset` / `TermsAgreement` |
| No.5 간편 로그인 | 안내 텍스트 `간편 로그인` + 아이콘 3개(카카오톡 노란 원+말풍선 / 네이버 초록 원+N / 구글 흰 원+G). 기존 가입자 → 대시보드, 신규 → 약관동의 후 간편 가입 정보 입력(`COM-3-PAGE-02-0`) | **`간편 로그인` 안내 텍스트 없음**(상수도 없음). 3종 **모두 구현**(네이버 포함, 순서 Kakao·Naver·Google = 시안 순서): `SocialLoginBadge` 48×48 원, 간격 16, 위 여백 40. Kakao `SOCIAL_KAKAO_YELLOW` `#FEE500` + 글자 `K`(`SOCIAL_KAKAO_TEXT` `#3C1E1E`), Naver `SOCIAL_NAVER_GREEN` `#03C75A` + `N`(흰), Google 흰 + 1px `BORDER_NEUTRAL_NORMAL` + `G` — **아이콘이 아니라 글자 자리표시자**(에셋: `docs/asset-requests.md` 2번, 공식 에셋 다운로드). 실제 SDK 호출(`socialAuthService.ts`: `kakao-login`·`naver-login`·`google-signin`). 기존 가입자 → `goToMain()`(일치). 신규 → `SocialSignupInfo`로 곧장 이동 — **약관동의 단계 없음**(`SocialSignupInfoScreen`에 약관 UI가 없고 서버 스키마엔 `termsAgreed` 필수 → 400 가능, 그 파일 주석). `SOCIAL_MEMBER_NOT_FOUND`는 서버 코드가 아니라 `authService.ts`가 합성한 값 |
| 배치·기타 | 로고 아래 필드 → 버튼 → 텍스트 버튼 → 소셜 아이콘, 빈 하단 | `ScreenContainer secondary edges={['bottom']}`, 루트 `paddingTop: 80`(하드코딩) + 좌우 24, 본문 `ScrollView`. 필드 사이: `TextField` 자체 아래 여백 20 + 로그인 화면 스페이서 8 = 28. 폼 → 버튼 스페이서 16, 버튼 → 링크 스페이서 16. `__DEV__`에서만 `목 계정으로 로그인 (개발용)`(`LOGIN_MOCK_BUTTON_LABEL`) 버튼 |

**B. 시안 안의 불일치 후보 (번호 미부여 — 사용자 확인 후)**
- **설명표 No.3 실패 = 토스트, 그런데 목업 Case A/B = 필드별 인라인 에러**: Case A(아이디 불일치)는 이메일 필드 빨간 밑줄 + 아래 빨간 문구, Case B(비밀번호 불일치)는 비밀번호 필드 빨간 밑줄 + 문구 + 필드 안에 지우기(⊗)·사선 눈 아이콘. 문구(스크린샷 판독, 작은 글씨): `아이디가 올바르지 않습니다. 입력한 정보를 다시 확인해주세요.` / `비밀번호가 올바르지 않습니다. 입력한 정보를 다시 확인해주세요.` — 설명표 토스트 문구와 다르다. 어느 쪽이 맞는지는 기획 확인(앱은 인라인 방식이나 필드 구분 없이 비밀번호 아래에만 표시).
- **설명표 No.5는 `간편 로그인` 안내 텍스트를 명시하지만 목업 프레임 3곳에는 없다**(소셜 아이콘 3개만 보임).
- 소셜 아이콘 지름은 목업에서 약 40dp로 보인다(스크린샷 눈대중, 실측 아님) — 앱은 48.

**C. 흩어진 기록 통합**
- **배경**: 명세 흰색(v5 실측 `로그인_메인화면.png#0`, 상단 `#FFFFFF`, 점유율 88%), 코드는 배경 미지정이었다 → 9-3에서 `ScreenContainer background="secondary"`로 수정(§2 행, §5-18).
- **`paddingTop: 80` 하드코딩**: 상단 인셋이 아니라 매직넘버. 8-7·9-3에서 `edges={['bottom']}`로 옮겼고 `paddingTop`은 그대로 둔 채 보류(`DEV_NOTES.md` "`paddingTop` 하드코딩 화면", `PasswordResetSentScreen`만 `ScreenContainer` 미사용으로 남음).
- **폼 스크롤**: 9-3에서 `ScrollView` + `keyboardShouldPersistTaps="handled"` 추가(`design-diff.md` 2026-09-19 해결 기록).
- **스낵바 슬롯**: 9-3에서 `ScreenContainer snackbar` 슬롯 적용(`absolute` 래퍼 제거).
- **소셜 로그인 키 미등록**: 카카오 디벨로퍼스 / 네이버 API 센터 / 구글 클라우드 콘솔 앱 등록과 `.env`(`KAKAO_NATIVE_APP_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `GOOGLE_WEB_CLIENT_ID`) 실제 키 채우기는 본인 진행 미완, 카카오톡/네이버 앱 연동 실기기 테스트도 미완(`DEV_NOTES.md` §3). 등록에 쓸 값: SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, 카카오 키 해시 `Xo8WBi6jzSxKDVR4drqm84yr9iU=`, 패키지명 `com.billage`(`docs/lessons.md` §2). 그래서 신규 소셜 가입 경로(`COM-3-PAGE-02-0`)는 캡처·대조 불가로 남아 있다(`design-diff.md` 2026-08-28 배치 C).
- **2026-08-28 파일럿 기록**(`design-diff.md` "COM-1-PAGE-01-0 (로그인) — 간격·앱 로고·소셜 아이콘"): 세로 간격 재조정 필요·로고 아이콘 마크 없음·소셜 아이콘 자리표시자. 이 중 로고는 `Billage_logo.png` 도입으로 워드마크가 들어갔고 아이콘 마크(심볼)만 남았으며 이번에 에셋이 이미 있음을 확인했다.
- **에셋**: `docs/asset-requests.md`(소셜 아이콘 3종 = 공식 에셋 다운로드, 지우기 아이콘, 로고 심볼은 요청 불필요).

**D. ※ 갱신(2026-09-20 11-2) — 수정한 것**
- 로고: `Billage_simbol_big.png` + `Billage_logo.png` 가로 배치. **시안 실측(원본 1px=1dp, 픽셀 분석)**: 심볼 29×29(에셋 비율로 29×28), 간격 9, 워드마크 폭 92 × 높이 27, 전체 폭 130으로 프레임 가운데(x 165~294, 프레임 중심 230). 종전 워드마크 단독 폭 140은 시안(92)보다 컸다.
- 비밀번호 눈 아이콘 토글: 로그인 비밀번호 필드에 `secureToggle`. **`TextField` 아이콘 매핑을 시안대로 뒤집음(마스킹 중 = 사선 눈 `Eye Closed.png`, 노출 중 = 열린 눈 `Eye.png`)**. `secureToggle` 사용처는 로그인 1곳 + `SignupInfoScreen` 2필드(`COM-3-PAGE-03-0`, 시트 실측: 평문 필드는 열린 눈, 마스킹 필드는 사선 눈) + `PasswordChangeScreen` 3필드(`ETC-4-PAGE-17-0`, 시트 Case A/B: 마스킹 필드는 사선 눈) — **전부 시안 방향이 같아서 공용 수정이 맞다**(이 5곳은 종전엔 반대로 보였음).
- 로그인 버튼: `disabled={isSubmitting || !email.trim() || !password.trim()}`(제출 값은 `trim()`하지 않는다 — 비활성 판정에만 사용).
- 텍스트 버튼 밑줄: `TextButton`에 `underline`(기본 false, `textDecorationLine: underline`)을 추가하고 로그인 화면 두 버튼만 켰다.
- 그대로 둔 것: 로그인 실패 인라인 에러(불일치 #17), 통합 에러 문구(#18), `간편 로그인` 텍스트 미추가(#19), 소셜 아이콘 글자 자리표시자.

**E. 신규 소셜 가입 약관동의 누락 — 실호출 확인(2026-09-20, `scripts/api-call.js`, 더미 토큰이라 계정은 안 만들어짐)**
- `POST /auth/social/signup`에 `termsAgreed`를 안 보내면 **400 `INVALID_REQUEST`**, `termsAgreed:false`는 **400 + `fieldErrors: [{field:"termsAgreed", reason:"약관 동의가 필요합니다."}]`**, `termsAgreed:true`(더미 토큰)는 400을 넘어 **401 `SOCIAL_TOKEN_INVALID`**(토큰 검증 단계까지 감). → **앱은 `termsAgreed`를 안 보내므로 실제 토큰으로 가입하면 400이 확정**(시안 `약관동의 후 간편 가입 정보 입력` + `Auth (인증).txt` 흐름 서술 "소셜 가입은 약관 동의 → 간편 가입 정보 입력 → 가입 완료"와도 어긋남). 고치지 않음 — 플로우 변경이라 사용자 지시 대기.
- **같이 발견한 문제(확정 결함 가능성 높음)**: 서버 `provider`는 **대문자 `KAKAO`/`GOOGLE`만 통과**한다(`/auth/social/login`·`/social/signup` 모두, 더미 토큰 기준 대문자 = 401 `SOCIAL_TOKEN_INVALID`, 그 밖 표기 = 400 `INVALID_REQUEST`). **앱은 `SocialType`을 `Kakao`/`Naver`/`Google`(혼합 대소문자)로 그대로 보낸다**(`authService.ts` `provider: payload.provider`) → 실 토큰이 있어도 요청이 400으로 막힐 가능성. 콘솔 키가 미등록이라 지금까지 서버까지 못 가서 드러나지 않았다. **`NAVER`는 어떤 표기·토큰으로도 400** — 서버가 네이버를 지원하는지 확인 필요(`backend-requests.md` 후보). 고치지 않음(4번은 조사만).

**E-2. ※ 갱신(2026-09-20 11-3)**: 위 두 결함(`termsAgreed` 누락, `provider` 대소문자)은 11-3에서 고쳤다(`design-diff.md` 해결). `NAVER` 400은 서버 문제라 `backend-requests.md`에 요청하고 앱 네이버 버튼은 남겨뒀다.

**F. API 경계 표기 전수 조사 (11-3, 조사만 — 수정은 `provider` 한 건뿐)**: 앱 내부 표기를 서버로 그대로 보내는 곳을 찾았다(전송 바디·쿼리를 만드는 `services/*.ts` 전부 + 전송값이 되는 유니온 타입).
- **같은 유형 결함: `provider`(소셜 로그인·가입) 하나뿐** — 수정 완료.
- 앱 내부 표기를 쓰지만 호출부에서 서버 값으로 **이미 매핑하는 곳(문제 없음)**: 내역 등록 `income`/`expense` → `INCOME`/`EXPENSE`(`TransactionRegisterScreen`), 장부 필터(`toEntryFilterQuery`: `type`/`status`/`sort`), 내역 메인 탭 `pending` → `PENDING`(`TransactionsScreen`), 납부관리 필터 `inProgress` → `OPEN`(`DuesScreen`), 회비 상세 탭 `unpaid`/`paid` → `UNPAID`/`PAID`(`DuesDetailScreen`), 증빙 앨범 필터 → `INCOME`/`EXPENSE`(`ReceiptAlbumScreen`).
- 전송값 타입 자체가 서버 값(대문자)인 것: `DuesStatus`, `PaymentStatus`, `EntryType`, `EntryApprovalStatus`, `GroupRole`, `ReportType`(`BY_LEDGER`/`BY_PERIOD`), `FilePurpose`, `TermType`, `NotificationTargetType`.
- 응답 쪽: `LoginProvider`(`EMAIL`/`KAKAO`/`NAVER`/`GOOGLE`)는 서버 응답 값(대문자)이고 `MyProfileScreen`의 소셜 배지가 대문자 키로 조회해 일치한다. 참고 — 응답에는 `NAVER`가 있는데 요청은 `NAVER`를 400으로 거부해 서버 안에서 요청/응답 enum이 다른 것으로 보인다.
- **값 자체가 미검증(형태 문제는 아님)**: `WithdrawReasonCode`(`USAGE_UNCLEAR`/`REJOIN`/`MISSING_FEATURE`/`NO_LONGER_NEEDED`/`ETC`) — 파괴적 엔드포인트라 실호출로 확인 안 했고 코드 주석도 "서버가 다른 값을 쓰면 갈아 끼워야 할 수 있다"고 적어 둠.
- 한계: 정적 조사(유니온 타입 검색 + 호출부 확인). 쿼리의 자유 문자열 상수는 개별 검증하지 않았다.

**G. `COM-3-PAGE-02-0` 간편 가입 정보 입력 — 시안 vs 앱 (11-3)** — 시트 `화면명세서/회원가입&로그인/회원가입/SNS 간편 회원가입_가입 정보 입력.png`(디자인 완료)

| 항목 | 시안 | 수정 전 앱 | 수정 후 |
|---|---|---|---|
| 상단 | 뒤로가기 `<`만(타이틀 없음), 화면 상단 고정, 터치 시 약관동의(`COM-2-PAGE-01-0`)로 | `BackButton`이 `ScrollView` 안이라 스크롤과 함께 움직임. 이동은 `goBack()` — 앞 화면이 약관동의가 아니라 로그인이었음(약관동의 단계 없음) | 스크롤 밖 고정. 스택이 로그인 → 약관동의 → 이 화면이라 `goBack()` = 약관동의 |
| 타이틀 | `가입 정보 입력` 큰 글씨 | `SIGNUP_INFO_TITLE` = `가입 정보 입력`, `TYPOGRAPHY.h1`(일치) | 변경 없음 |
| 이름 | 라벨 `이름` + 빨간 * / placeholder `이름을 입력해주세요.` / 미입력 그레이 라인 / **8자 초과 시 라인 레드 + `최대 8자 이내로 입력할 수 있어요.`** / 입력·삭제 가능 | 라벨만(빨간 * 없음). placeholder `SIGNUP_NAME_PLACEHOLDER`(일치). **8자 제한은 있었다** — 화면 안 로컬 상수 `NAME_MAX_LENGTH = 8` + 입력을 `slice`·`maxLength`로 막아서 **에러 상태가 나올 수 없었고**, 대신 항상 `SIGNUP_NAME_HELPER`(`* 최대 8자 이내로 입력할 수 있어요.`)가 보였음 | 상수 `SOCIAL_SIGNUP_NAME_MAX_LENGTH = 8`(`signupInfoText.ts`)로 옮김. `required`(빨간 *). 입력을 막지 않고 8자 초과 시 `error` = `SOCIAL_SIGNUP_NAME_TOO_LONG_ERROR`(레드 라인 + 문구). 항상 보이던 도움말 제거(목업 프레임에 없음). 소셜 프로필 이름을 프리필할 때만 8자로 잘라 시작 |
| 이메일 | 라벨 `이메일` + 빨간 * / **Read-only**(터치·키보드 입력 불가), SNS 계정 이메일 바인딩 값 | **수정 가능했음**: `TextField`에 입력·`isValidEmail` 검증·`이메일 형식` 에러, CTA 조건에 이메일 형식이 들어 있었음(서버 스키마엔 `email` 필드가 없어 어차피 서버로 안 보냄) | `disabled`(수정·키보드 불가, 회색 표시) + `required`. 표시값은 `profile.email`. 검증·입력 핸들러 제거 |
| CTA | `다음으로` fullWidth, 이름 1~8자일 때 활성, 활성 시 가입 처리 후 `가입 완료` | 라벨 `SOCIAL_SIGNUP_SUBMIT_LABEL` = **`다음`**. 활성 조건 = 이름 1자 이상 **그리고 이메일 형식 통과** | 라벨 `다음으로`(목업 — 설명표 No.5는 `다음`이라 시트 안에서 목업/표가 다름, 목업을 따름). 활성 = 이름(`trim` 후) 1~8자만, 이메일은 조건 아님. 가입 성공 → `SignupComplete` |

- 이메일이 비어 있는 소셜 계정(제공 동의를 안 한 경우 등)은 이제 빈 Read-only 필드로 보이고 가입은 막히지 않는다(이름만 조건).
- **소셜 가입 요청 바디**(`authService.socialSignup`): `{ provider: "KAKAO"|"NAVER"|"GOOGLE", token, name, termsAgreed }`. `termsAgreed`는 약관동의 화면이 넘긴 `agreements`의 필수 3종(`termsOfService`·`privacyPolicy`·`ageOver14`) 논리곱이다. 필수 3종을 모두 체크해야 약관동의 화면의 `다음으로`가 활성이라 이 화면에선 항상 `true`. Swagger 스키마에는 `marketing` 필드가 없어 보내지 않는다.
- 실행 검증 한계: 콘솔 키·실 소셜 토큰이 없어 **가입 완료까지 실행해 보지 못했다**. 서버가 같은 형태(`provider` 대문자 + `termsAgreed:true`)를 받아 400을 넘기고 토큰 검증 단계(401)까지 가는 것만 더미 토큰으로 확인했다.

### 5-24. `COM-2-PAGE-01-0` 약관동의 시안 대조 (2026-09-20, 11-4)

시트 `화면명세서/회원가입&로그인/회원가입/회원가입_약관동의.png`(`ver 0.25`, **디자인 완료**). 페이지 경로 `로그인 > '회원가입하기' / 'SNS가입'` — **일반·소셜 가입 공용**(`TermsAgreementScreen` 하나가 둘 다 쓰고, 소셜은 `socialProfile` param으로 분기 — 11-3).

**A. 수정 전 앱 상태 vs 시안 (문구 원문, 상수명)**

| 항목 | 시안 | 앱(수정 전) | 판정 |
|---|---|---|---|
| 상단 앱바 | 뒤로가기 `<`만, 고정. 터치 → 이전 화면(로그인 메인) | `BackButton`이 `ScrollView` 밖 `backRow`(아래 여백 16)에 있어 고정. `navigation.goBack()` | 일치 (뒤로가기 동작은 D) |
| 타이틀 | `약관 동의` 큰 글씨 | `TERMS_AGREEMENT_TITLE` = `약관 동의`, `TYPOGRAPHY.h1`(24/32 bold), 아래 여백 24 | 일치 |
| 전체 동의 | 체크박스 + `전체 동의`, 아래 구분선 | `AGREE_ALL_LABEL` = `전체 동의`(`emphasized` = `subtitle1` 16/24) + `Divider`(위아래 여백 8) | 일치 |
| 항목 1 | `서비스 이용 약관 (필수)` + `>` | `AGREE_SERVICE_LABEL` = `서비스 이용 약관` + 태그 → **`서비스 이용 약관 (필수)`**, `>` 있음(→ `TermsOfService`) | 일치 |
| 항목 2 | `개인정보 수집 및 이용에 대한 동의 (필수)` + `>` | `AGREE_PRIVACY_LABEL` = `개인정보 수집 및 이용에 대한 동의` + 태그 → **`개인정보 수집 및 이용에 대한 동의 (필수)`**, `>` 있음(→ `PrivacyPolicy`) | 일치 |
| 항목 3 | `마케팅 정보 수신 동의 (선택)` + `>` | `AGREE_MARKETING_LABEL` = `마케팅 정보 수신 동의` + 태그 → **`마케팅 정보 수신 동의 (선택)`**, `>` 있음(→ `MarketingConsent`) | 일치 |
| 항목 4 | `만 14세 이상 회원입니다. (필수)`, **`>` 없음** | `AGREE_AGE_LABEL` = `만 14세 이상 회원입니다.` + 태그 → **`만 14세 이상 회원입니다. (필수)`**, `onPressDetail` 없어 `>` 없음 | 일치 |
| 항목 순서 | 전체 동의 → 서비스 → 개인정보 → 마케팅 → 만 14세 | 같은 순서 | 일치 |
| 태그 색 | (요청서: 회색 계열) **시안 픽셀 실측: `(필수)` 파랑(≈`#185DE1`, 안티앨리어싱 포함), `(선택)`은 본문과 같은 검정** — 회색 아님 | `(필수)`·`(선택)` **둘 다** 파랑(`FOREGROUND_SECONDARY` `#4A7FE7`) | **불일치 → 수정(아래 B)** |
| `>` 아이콘 | 우측 이동 아이콘 | `Chevron Right.png` 16×16, `FOREGROUND_DISABLED` `#C1C5CD`, 좌우 여백 4, `hitSlop` 8 | — |
| 체크박스 | 사각, 체크 시 파랑 | `CheckBox` 22×22 모서리 4, 체크 시 `FOREGROUND_SECONDARY` 배경, 체크박스와 라벨 사이 12, 행 상하 패딩 12 | — |
| 전체 동의 양방향 | 체크: 하위 전체 체크 / 이미 체크 상태에서 터치: 전체 해제. 하위 하나라도 해제되면 전체 동의는 해제 | `toggleAll`(`next = !allChecked`)로 4개를 한꺼번에 `next`로 설정 — 양방향 OK. `allChecked` = 4개 전부 체크(하나라도 해제되면 false) | 일치 |
| CTA | `다음으로` fullWidth, 필수 3종 체크 시 활성 | `NEXT_BUTTON_LABEL` = `다음으로`, `Button` fullWidth(높이 52), `disabled={!canProceed}` — `canProceed` = 서비스 && 개인정보 && 만 14세(마케팅 제외) | 일치 |
| 배치 | — | `ScreenContainer secondary edges={['bottom']}`, 루트 `paddingTop: 60`(하드코딩)·좌우 24, footer 아래 24 | (기존 보류 항목) |

**B. 수정 (11-4)**: `AgreementCheckboxRow`의 태그 색 — `(필수)`만 파랑, `(선택)`은 본문 색. 이 컴포넌트를 쓰는 곳은 `TermsAgreementScreen` 하나. 요청서는 "회색 계열"이라 했으나 시안 원본 픽셀이 위와 같아 픽셀을 따랐다.

**C. 상세 화면(`>`) 연결**: 3개 모두 **실제로 있고 연결돼 있다** — `TermsOfServiceScreen`/`PrivacyPolicyScreen`/`MarketingConsentScreen`(전부 `COM-3-PAGE-01-0`, `LegalDocumentView`), `RootNavigator`에 `TermsOfService`/`PrivacyPolicy`/`MarketingConsent`로 등록. 항목 1·2·3의 `>`가 각각 이 셋으로 이동. 만 14세 항목은 상세 없음(시안과 같음).

**D. 뒤로가기·소셜 인증 결과 (조사만 — 수정 없음)**
- 약관동의 뒤로가기(`BackButton` → `navigation.goBack()`, 안드로이드 하드웨어 백도 같은 pop)는 **일반·소셜 모두 로그인으로 간다** — 두 플로우 다 로그인에서 `navigate`로 들어왔으므로 스택 바로 아래가 로그인이다(시안 No.1과 일치).
- 소셜 플로우에서 뒤로 가면: 소셜 프로필(이름·이메일·**소셜 토큰**)은 약관동의 화면의 route param에만 있어 화면이 pop되면 버려진다. 앱은 **아무것도 저장하지 않았다** — `socialLogin`이 `SOCIAL_MEMBER_NOT_FOUND`(클라이언트 합성)를 던지기 전에 토큰 저장(`storeTokens`)을 하지 않고 서버에도 계정이 만들어지지 않았다(가입 API는 정보 입력 화면의 `다음으로`에서만 호출).
- **소셜 SDK 쪽 세션은 지우지 않는다** — `socialAuthService`·`authService` 어디에도 카카오/네이버/구글 `logout`·`signOut`·`unlink` 호출이 없다(`authService.logout`은 앱 토큰만 폐기). 그래서 뒤로 갔다가 소셜 버튼을 다시 누르면 SDK `login()`/`signIn()`을 **다시 호출**한다 — 재인증 화면이 뜨는지 SDK가 캐시된 계정으로 바로 통과시키는지는 SDK 동작에 달려 있고 **콘솔 키 미등록이라 실행해 보지 못했다**(미검증).
- 약관동의 체크 상태는 화면이 pop되며 사라진다(다시 들어오면 모두 해제). 반대로 정보 입력 화면(`SocialSignupInfo`)에서 뒤로 가면 약관동의가 그대로 남아 있어(스택에 유지) 체크와 `socialProfile`이 보존된다.

**E. 마케팅 수신 동의 전송 여부**: 일반 가입은 `agreements.marketing`을 서버로 보낸다(`Auth (인증).txt` §8, Swagger `SignupRequest`에 `marketing` 있음). **소셜 가입은 보내지 않는다** — Swagger `POST /auth/social/signup`이 `provider`/`token`/`name`/`termsAgreed`뿐이라 보낼 필드가 없다. 시안에는 있으므로 불일치 #20 + 백엔드 요청(`backend-requests.md` "신규 — 소셜 가입 스키마에 마케팅 수신 동의 필드가 없습니다").

### 5-25. `COM-3-PAGE-03-0` 일반 가입 정보 입력 시안 대조 — 조사 (2026-09-20, 11-5, 코드 수정 없음)

시트 `화면명세서/회원가입&로그인/회원가입/일반 회원가입_가입 정보 입력.png`(`ver 0.25`, **디자인 완료**). 소셜(`COM-3-PAGE-02-0`)은 이름 8자, 일반은 10자 — 서로 다른 게 맞아 상수를 합치지 않는다. **`login/회원가입/COM-3-PAGE-03-0-*.png`(design-index 크롭 3장)은 시트보다 오래된 개정본으로 보인다**(크롭: 이름 도움말 `최대 8자`, 라벨에 `*` 없음, 불일치 문구 `비밀번호가 동일하지 않습니다.` / 시트: `최대 10자`, `*` 있음, `비밀번호가 동일하지 않아요. 다시 입력해주세요.`) — 앱은 이 오래된 크롭을 따르고 있다.

**A. 항목별 앱 현재 상태 vs 시안**

| No | 시안(시트) | 앱 현재 (상수) | 판정 |
|---|---|---|---|
| 1 상단 | 뒤로가기 `<`만, 고정. → 약관동의 | `BackButton`이 `ScrollView` 안 `backRow`라 스크롤과 함께 움직임(시안은 고정). `goBack()` → 스택상 약관동의 | 고정만 다름 |
| 2 타이틀 | `가입 정보 입력` | `SIGNUP_INFO_TITLE` = `가입 정보 입력`, `h1`(24/32 bold), 아래 여백 24 | 일치 |
| 3 이름 | 라벨 `이름` + `*`, placeholder `이름을 입력해주세요.`, 하단 `* 최대 10자 이내로 입력할 수 있어요.` **상시**, 10자 초과 시 입력 차단·에러 컬러 | 라벨 `SIGNUP_NAME_LABEL` = `이름`(**`*` 없음**), placeholder `SIGNUP_NAME_PLACEHOLDER` = `이름을 입력해주세요.`(일치). 도움말 `SIGNUP_NAME_HELPER` = `* 최대 8자 이내로 입력할 수 있어요.` **항상 노출(상시 ✔)** 이지만 **8자**. 제한은 화면 안 로컬 상수 `NAME_MAX_LENGTH = 8`(소셜은 `SOCIAL_SIGNUP_NAME_MAX_LENGTH`, 별도), 입력은 `slice`·`maxLength`로 **차단(✔)**. 그런데 차단이라 에러 상태가 나올 수 없고 도움말은 회색 그대로 | **8 vs 10, `*` 없음, 에러 색 없음** |
| 4 이메일 | 라벨 + `*`, placeholder `이메일을 입력해주세요.`, 에러: 형식 `이메일 형식이 올바르지 않아요.` / 중복 `이미 사용 중인 이메일이에요.` | placeholder `SIGNUP_EMAIL_PLACEHOLDER` = `이메일을 입력해주세요.`(일치), `*` 없음. **형식 에러 `SIGNUP_EMAIL_FORMAT_ERROR` = `올바른 이메일 형식을 입력해주세요.`(문구 다름)**, 입력 중 실시간(`isValidEmail`). **중복 에러는 이 화면에 없다** — `EMAIL_ALREADY_EXISTS`는 이 화면이 아니라 `EmailVerificationScreen`의 코드 검증 뒤 가입 호출에서 나오고 문구는 `SIGNUP_EMAIL_ALREADY_EXISTS_ERROR` = `이미 가입된 이메일입니다.`(시안 `이미 사용 중인 이메일이에요.`와 다름) | 문구 2종 다름, 중복 미구현 |
| 5 비밀번호 | 라벨 + `*`, placeholder `비밀번호를 입력해주세요.`, 하단 `* 영문 대소문자, 숫자, 특수문자 포함 8자 이상` **상시**, 눈 아이콘, 조건 미충족 시 문구·라인 에러 | `SIGNUP_PASSWORD_PLACEHOLDER` = `비밀번호를 입력해주세요.`(일치), 도움말 `SIGNUP_PASSWORD_HELPER` = `* 영문 대소문자, 숫자, 특수문자 포함 8자 이상`(**일치, 상시 ✔**), 눈 아이콘 `secureToggle` ✔(11-2에서 방향 수정). `*` 없음. **에러 표시 없음** — 조건 미충족은 CTA만 막는다. 실제 검증 `isValidPassword`(`validators.ts`) = `/^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[^A-Za-z0-9]).{8,}$/` → 소문자·대문자·숫자·특수문자 **각각 1개 이상 + 8자 이상**. 문구의 "영문 대소문자"를 "소문자와 대문자 둘 다"로 해석한 검증이고 도움말과 일치 | `*`, 에러 상태 없음 |
| 6 비밀번호 확인 | 라벨 + `*`, placeholder `비밀번호를 입력해주세요.`, 눈 아이콘, 불일치 재확인(에러 문구 `비밀번호가 동일하지 않아요. 다시 입력해주세요.`) | 라벨 `SIGNUP_PASSWORD_CONFIRM_LABEL` = `비밀번호 확인`, placeholder는 위와 **같은 `SIGNUP_PASSWORD_PLACEHOLDER` = `비밀번호를 입력해주세요.`(`다시` 같은 말 없음, 일치)**, 눈 아이콘 **두 필드 모두 ✔**. 에러 `SIGNUP_PASSWORD_MISMATCH_ERROR` = `비밀번호가 동일하지 않습니다.`(시트 문구와 다름, 오래된 크롭과는 같음). **확인 필드 아래에도 비밀번호 도움말(`SIGNUP_PASSWORD_HELPER`)을 표시** — 시트 프레임엔 확인 필드 도움말이 없다(오래된 크롭 포커스 프레임엔 있음). 에러가 있으면 에러가 도움말을 대체 | 문구·도움말 다름, `*` 없음 |
| 7 CTA | `다음으로` fullWidth | `NEXT_BUTTON_LABEL` = `다음으로`(일치). 활성 = `name.length > 0` && `isValidEmail` && `isValidPassword` && 확인 = 비밀번호. 이름은 공백만 있어도 통과(`trim` 없음) | 일치(공백 이름 예외) |
| 배치 | — | `ScreenContainer secondary edges={['bottom']}`, 루트 `paddingTop: 60`(하드코딩)·좌우 24, `TextField` 아래 여백 20(라벨 `subtitle3` 아래 8, 입력 상하 8·밑줄 1, 도움말 `body3` 12/16 위 6 `#9B9B9B`) | — |

**B. 시트 Case A `최대 글자 수 초과 시` 프레임 (원본 확대·픽셀 실측)**
- 이름 입력값 `김둘봉이화이팅왕왕왕왕`(**11자**)이 필드에 **그대로 표시**돼 있다 — 시안 프레임은 입력이 10자를 넘겨 보이는 상태다(설명표 No.3의 "입력 차단"과 프레임이 어긋난다: 차단이면 11자가 안 들어가야 함. 프레임은 "초과했다는 걸 보여주는 상태"로 그려진 것으로 보임).
- **입력 라인**: 이름 밑줄이 **빨강 `#FA564D` 1px**(`FEEDBACK_NEGATIVE_BOLD` `#FB6E67`과 근사). 입력 글자는 어두운 회색 그대로(빨갛게 안 바뀜).
- **하단 문구**: 라인 바로 아래 **같은 자리**(기본 도움말 자리)에 빨강(`#FA544C`) `* 10자를 초과하여 입력했어요.` — 기본 도움말 `* 최대 10자 이내로 입력할 수 있어요.`가 **다른 문구로 교체**된다.
- 다음 필드 `이메일`은 라벨·placeholder(`billage0202@gmail.com`)·라인이 **옅은 회색**(비활성처럼 흐리게) — 이름 에러 상태에서 아래 필드를 흐리게 그린 것인지 키보드 프레임의 기본 상태인지는 시트에서 구분 안 됨.
- 프레임에 키보드가 올라와 있다.

**C. 시트 실측 중 요청서와 다른 점**: 라벨 `*`(`이름*` 등)의 색은 **파랑 `#3772E4`**(픽셀 실측 — 기본 프레임·Case A 동일)이다. 요청서는 "빨간 *"이라고 했으나 픽셀은 파랑이다(소셜 `COM-3-PAGE-02-0` 시트의 `*`도 같은 파랑으로 보임). 앱 `TextField`의 `required` 표시(` *`)는 `FEEDBACK_NEGATIVE_BOLD` **빨강**이라, 11-3에서 소셜 화면에 켠 `required`도 시트와 다른 색이다 — 이번엔 수정하지 않고 기록만.

**D. 이메일 중복 에러 구현 가능성(구조)**: `Auth (인증).txt` §6은 "이메일 존재 여부가 새어 나가지 않도록 이미 가입된 주소여도 같은 `204`"를 돌려준다고 명세한다(인증 코드 발송). 이 화면에서 중복을 알려면 별도 중복 확인 API가 필요한데 없고, 있으면 #18과 같은 계정 열거 문제가 생긴다. 지금 앱은 가입 호출 시점(`EmailVerificationScreen`)에만 `EMAIL_ALREADY_EXISTS`를 알 수 있다.

**※ 갱신(2026-09-20 11-6)**

**수정한 것(시트 기준)**: 이름 제한 8 → **10자**(`SIGNUP_NAME_MAX_LENGTH`, 소셜 `SOCIAL_SIGNUP_NAME_MAX_LENGTH` 8과 **별개 상수**), 도움말 `* 최대 10자 이내로 입력할 수 있어요.` 상시 유지, **입력 차단을 풀고** 초과 시 `error` = `* 10자를 초과하여 입력했어요.`(도움말 자리 교체, 라인·문구 빨강, 입력 글자색은 그대로), CTA는 초과 시 비활성 · 이메일 형식 에러 `이메일 형식이 올바르지 않아요.` · 비밀번호 조건 미충족 시 도움말 문구를 `error`로 넘겨 **색만 에러 컬러로 전환**(시트에 별도 에러 문구·Case 프레임이 없어 문구는 그대로) · 확인 필드 불일치 문구 `비밀번호가 동일하지 않아요. 다시 입력해주세요.` + 확인 필드 아래 도움말 제거 · 뒤로가기를 `ScrollView` 밖으로(고정).

**빨강 색값**: 시트 에러 라인 `#FA564D`·문구 `#FA544C`, 앱 `FEEDBACK_NEGATIVE_BOLD`(`RED_400` `#FB6E67`) — 채널 차이 R 1 · G 24 · B 26으로 앱이 **눈에 띄게 밝다**. 팔레트(Color_Definition.pdf 대조 일치)에 더 가까운 빨강이 없어 새 상수 없이 기존 값을 썼다(보고용).

**불일치·미구현 기록**: #21(10자 초과 입력 차단 vs Case A 프레임 = 에러 표시) — 목업을 따라 에러 표시로 구현. #22(이메일 중복 에러 `이미 사용 중인 이메일이에요.`) — 구현하지 않음, 계정 열거 방지와 충돌.

**크롭 개정본 조사(11-6)**: `design-index` 크롭 PNG에는 **버전 정보가 없다**(PNG 텍스트 청크가 `Software: Figma` 하나뿐, 시트의 `버전 ver 0.25` 표기에 해당하는 값 없음). 파일 수정 시각은 크롭 전체가 `2026-07-23 02:46`(일괄 내보내기), 시트는 `2026-09-05 18:56`이라 "크롭이 시트보다 이전 내보내기"라는 것만 알 수 있고 **어느 화면이 바뀌었는지는 못 가린다**. 크롭을 시트 프레임 안에서 찾아 픽셀을 비교해 봤으나(5개 Screen ID 시험) 오래된 것으로 알려진 크롭(`COM-3-PAGE-03-0`, 2.4~4.5% 불일치)과 그럴 법한 최신 크롭(`COM-1-PAGE-01-0`·`COM-2-PAGE-01-0`, 0.8~1.4%)이 문구 몇 줄 차이 수준에서 갈리지 않아 **자동 목록은 신뢰할 수 없다고 판단해 뽑지 않았다**. 대신 **크롭 기준으로 판정했던 항목 목록**(시트 재확인 후보):
- §2 배경 판정 중 크롭 육안 확인: `DSH-1-PAGE-01-0`, `ETC-2-PAGE-02-0`, `ETC-3-PAGE-04-0`(`ETC-5-PAGE-02-0`은 시트 실측이 주 근거이고 크롭 픽셀은 보강).
- `design-diff.md` 2026-08 파일럿의 앱↔크롭 비교(`shots/pairs`, 크롭 사용): `ADD-1-PAGE-01-0`, `ADD-2-SHEET-04-0`, `ADD-2-SHEET-07-0`, `ADD-2-SNACKBAR-01-0`, `ADD-3-PAGE-01-0`, `ADD-4-PAGE-01-0`, `COM-1-PAGE-01-0`, `COM-2-PAGE-01-0`, `COM-4-PAGE-01-0`, `COM-5-PAGE-01-0`, `DSH-1-PAGE-01-0`, `ETC-1-PAGE-01-0`. 그 밖에 크롭으로 대조한 `ETC-3-PAGE-01-0`(필수 `*`)·`FDR-3-PAGE-02-0`(크롭 4장 중 일부가 시트와 문구가 다름 — 예: 결과 없음 프레임의 검색어 `훈련` vs 시트 `술값`) 등.
- 이 중 로그인(`COM-1-PAGE-01-0`)·약관동의(`COM-2-PAGE-01-0`)·소셜 가입(`COM-3-PAGE-02-0`)·장부 내 검색(`FDR-3-PAGE-02-0`)은 이미 시트 기준으로 다시 대조했다(11-1~11-4, 10-5).

**라벨 `*` 색 조사(11-6, 수정 안 함)**
- `TextField required`를 쓰는 화면(전부): `DuesCreateScreen`(2필드), `DuesEditScreen`(2), `ReportCreateByLedgerScreen`(1), `ReportCreateByPeriodScreen`(1), `SocialSignupInfoScreen`(2, 11-3에서 켬) — 5개 화면 8필드. 다른 컴포넌트: `SelectionListItem.required`(`TransactionRegisterScreen` 2곳)는 **이미 파랑**(`FOREGROUND_SECONDARY` `#4A7FE7`), `InfoCard.required`는 빨강이지만 쓰는 곳이 없다. `TextField.requiredMark`는 `FEEDBACK_NEGATIVE_BOLD`(빨강).
- 시트 실측(작은 색 덩어리 검출 후 가장 진한 픽셀, 1px=1dp): `COM-3-PAGE-02-0`(소셜) 2개, `COM-3-PAGE-03-0`(일반, `required` 미적용) 9개 검출, `DUE-2-PAGE-01-0`(회비 생성) 4개, `DUE-3-PAGE-06-0`(회비 수정) 1개(2필드 중 1개만 검출 — 금액 필드는 비활성이라 옅은 색일 수 있음, 미확인), `ETC-4-PAGE-03-0`(장부별 보고서) 2개, `ETC-4-PAGE-04-0`(기간별 보고서) 2개 — **전부 파랑 `#3772E4`, 빨강은 0개**. 참고로 `ETC-3-PAGE-01-0`(모임 프로필 변경, 앱은 `required` 미사용이라 별 자체가 없음)의 시트 별은 파랑 `#3772E4`(`design-diff.md` 2026-09-11 항목은 이를 "빨간 별표"라고 적었는데 크롭 육안 판단이라 틀렸다). `ADD-1-PAGE-01-0`(내역 추가) 시트는 검출 못 함.
- 결론: 확인한 시트에서는 예외 없이 파랑이라 `TextField.requiredMark`를 파랑(시트 `#3772E4`에 가장 가까운 기존 상수 `FOREGROUND_SECONDARY` `#4A7FE7`, 채널 차이 R 19·G 13·B 3)으로 바꾸는 전역 변경이 시트와 일치한다. **지시대로 수정하지 않았다** — 결정 대기.

**※ 갱신(2026-09-20 11-7)**

**라벨 `*` 색 전역 변경(승인)**: `TextField.requiredMark`·`InfoCard.required`를 `FOREGROUND_SECONDARY`(`#4A7FE7`)로 바꿨다. `SelectionListItem.required`는 이미 같은 상수. 세 컴포넌트가 이제 전부 같은 파랑이라 `TextField required` 8필드(`DuesCreateScreen` 2, `DuesEditScreen` 2, `ReportCreateByLedgerScreen` 1, `ReportCreateByPeriodScreen` 1, `SocialSignupInfoScreen` 2)와 `SelectionListItem` 2곳(`TransactionRegisterScreen`)이 전부 파랑이다(시트 실측 `#3772E4`와 채널 차이 R 19·G 13·B 3).

**에러 빨강 — 팔레트 유지, 불일치 #23**: `FEEDBACK_NEGATIVE_BOLD`(`#FB6E67`) 유지, 새 상수 없음. **색 정의 확인 결과(2026-09-20)**: `FONT/Typography Style.pdf`(와 `Primitive Typography.pdf`)에는 **색 정의가 없다**(서체 Pyeojin Gothic·크기·행간·자간·굵기뿐 — 텍스트 추출로 확인). 색은 `Color_Definition.pdf`와 `color.pdf`에 있다: `Color_Definition.pdf` Red = 50 `#FFEDEC` · 100 `#FDC7C4` · 200 `#FDACA8` · 300 `#FC8680` · **400 `#FB6E67`** · **500 `#FA4A41`** · 600 `#E4433B`…, `color.pdf` Feedback = `negative-subtle` = `$red/50`, **`negative-bold` = `$red/400`**. 즉 앱의 `FEEDBACK_NEGATIVE_BOLD = #FB6E67`은 디자인 시스템 정의와 일치하고, 시트의 `#FA564D`는 팔레트 어디에도 없는 값이다(가장 가까운 것은 red/500 `#FA4A41`, 채널 차이 G·B 12).

**에러 타이밍 — 11-8에서 정정(이름 글자수 초과만 즉시)**: 11-7에서 전부 blur 기준으로 통일했으나 이름 글자수 초과는 즉시 표시로 되돌렸다. 나머지는 blur 뒤부터 표시하고 한 번 뜬 뒤엔 실시간 갱신. `TextField.onBlur` prop은 유지. CTA 비활성은 타이밍과 무관하게 즉시.

| 검증 | 타이밍 | 이유 |
|---|---|---|
| **이름 글자수 초과**(일반 10자 · 소셜 8자) | **즉시** | 시트 Case A 목업이 키보드가 올라온 채 에러를 표시한다. 넘긴 순간 알아야 한다 |
| 이메일 형식 | blur | 입력 중엔 항상 "형식 오류"다 |
| 비밀번호 조건 | blur | 위와 같음 |
| 비밀번호 확인 불일치 | blur + 비밀번호·확인 양쪽 입력 후 | 위와 같음 |

나머지 폼은 에러가 제출 결과·서버 응답에서만 나오고 입력 중 파생 에러를 띄우지 않아 해당 없음.

**크롭 기준 판정 재확인 우선순위(목록만, 재확인은 안 함)**

| 우선순위 | Screen ID | 크롭으로 판정한 것 (`design-diff.md` 2026-08 항목 제목 기준) |
|---|---|---|
| **높음**(문구·수치·상태) | `ETC-1-PAGE-01-0` 더보기 메인 | 카드·메뉴 여백 실측 수치(09-12 부분 해결) |
| 높음 | `COM-4-PAGE-01-0` 이메일 인증 | 문구(`메일이 오지 않았나요?`·`재전송하기` 일치 확인) · 코드 요청 후 상태 |
| 높음 | `COM-5-PAGE-01-0` 가입 완료 | CTA 하단 고정 · 보조 버튼 색 |
| 높음 | `DSH-1-PAGE-01-0` 대시보드 | 요일 헤더 · 카드 캡션 줄바꿈 · FAB 겹침(배경 판정은 아래 낮음) |
| 높음 | `ADD-1-PAGE-01-0` 내역 추가 | 수입/지출 탭 기본값 상태 |
| 높음 | `ADD-2-SHEET-04-0` 메모 입력 | 텍스트+키보드 상태 |
| 높음 | `ADD-2-SNACKBAR-01-0` 내역 추가 완료 | 자동 소멸 전 캡처 못 함 |
| 높음 | `ADD-4-PAGE-01-0` 영수증 스캔 성공 | 금액 자동 반영 타이밍 |
| 높음 | `ETC-3-PAGE-01-0` 모임 프로필 변경 | 필수 `*` 색 — **이미 오판 확인**(크롭 육안으로 "빨간 별표"라 적었으나 시트는 파랑, 11-6에서 정정) |
| 낮음(배경) | `DSH-1-PAGE-01-0` · `ETC-2-PAGE-02-0` · `ETC-3-PAGE-04-0` | §2 배경 판정 = 크롭 육안 확인 (`ETC-5-PAGE-02-0`은 시트 실측이 주 근거) |
| 낮음(대조 자체가 제한적) | `ADD-2-SHEET-07-0` · `ADD-3-PAGE-01-0` | 디자인 원본이 더미 데이터 / Mock 카메라라 프리뷰 대조 불가 |
| **완료**(시트로 재대조) | `COM-1-PAGE-01-0` · `COM-2-PAGE-01-0` · `COM-3-PAGE-02-0` · `FDR-3-PAGE-02-0` · `COM-3-PAGE-03-0` | 11-1~11-6, 10-5 — 시트 기준으로 수정·기록 완료 |

분류 기준: 크롭에서 **문구·수치·상태를 읽어 구현·판정**한 것 = 높음, **배경색**처럼 개정 사이에 바뀌기 어려운 것 = 낮음. 순서는 사용자가 정한다. 이 표는 위 목록(11-6 크롭 기준 판정 목록)을 나눈 것이고 누락이 있을 수 있다.

### 5-26. 색 팔레트 대조 — `colors.ts` vs `Color_Definition.pdf` (2026-09-20, 11-8, 조사만·수정 없음)

기준: `docs/palette.tsv` = `Color_Definition.pdf` 1페이지 Primitive Color 52색(`group | step | hex`). **이 PDF에는 시맨틱 매핑 페이지가 없다**(Primitive만) — 시맨틱(`FOREGROUND_*` 등)은 `color.pdf` 쪽이다. 비교는 대소문자 무시.

**A. 일치 — `colors.ts` 헥스 상수 24개 중 21개**

| 상수 | hex | 팔레트(group/step) |
|---|---|---|
| `NAVY_800` | `#070A23` | Navy/800 |
| `NAVY_500` | `#111957` | Navy/500 |
| `NAVY_200` | `#A0A3BC` | Navy/200 |
| `BLUE_500` | `#4A7FE7` | Blue/500 |
| `BLUE_400` | `#6CA1EE` | Blue/400 |
| `BLUE_300` | `#9BC1F5` | Blue/300 |
| `BLUE_100` | `#DCE8FB` | Blue/100 |
| `BLUE_50` | `#F0F5FE` | Blue/50 |
| `GREY_800` | `#374151` | Grey/700 **및** Grey/800 (아래 참고) |
| `GREY_700` | `#374151` | Grey/700 **및** Grey/800 (아래 참고) |
| `GREY_600` | `#4B5563` | Grey/600 |
| `GREY_400` | `#9B9B9B` | Grey/400 |
| `GREY_300` | `#C1C5CD` | Grey/300 |
| `GREY_200` | `#E5E7EB` | Grey/200 |
| `GREY_100` | `#F3F4F6` | Grey/100 |
| `BASIC_0` | `#FFFFFF` | Basic/0 |
| `BASIC_100` | `#000000` | Basic/100 |
| `YELLOW_500` | `#FFBF2A` | Yellow/500 |
| `YELLOW_50` | `#fFF9EA` | Yellow/50 (값은 일치, **표기만 `#fFF9EA`로 대소문자가 섞여 있음** — 오타로 보이나 동작 무관) |
| `RED_400` | `#FB6E67` | Red/400 |
| `RED_50` | `#FFEDEC` | Red/50 |

**B. 팔레트 밖 — 3개**(전부 `color.pdf 범위 밖 (브랜드/화면 전용 액센트)` 주석 구역, 소셜 로그인 버튼 브랜드 색)

| 상수 | hex | 가장 가까운 팔레트 색 | 채널 차이 |
|---|---|---|---|
| `SOCIAL_NAVER_GREEN` | `#03C75A` | Navy/500 `#111957`(초록 계열 없음, 사실상 무관) | R14 · G174 · B3 |
| `SOCIAL_KAKAO_YELLOW` | `#FEE500` | Yellow/500 `#FFBF2A` | R1 · G38 · B42 |
| `SOCIAL_KAKAO_TEXT` | `#3C1E1E` | Red/900 `#691F1B` | R45 · G1 · B3 |

(`OVERLAY_SCRIM` = `rgba(0, 0, 0, 0.4)`는 알파 값이라 팔레트 대조 대상 아님.)

**C. 중복 — 1쌍**: `GREY_800`과 `GREY_700`이 둘 다 `#374151`. **PDF 자체가 Grey/700·Grey/800을 둘 다 `#374151`로 적고 있다**(`palette.tsv` 11·12행)라 오기로 보이고, `colors.ts`는 PDF를 그대로 따른 것(주석에 명시). `GREY_800`은 `FILL_INVERSE`(→ `ReceiptDetailScreen`·`TransactionReceiptDetailScreen` 배경)와 `ReceiptScanningView`(배경)에서, `GREY_700`은 `Snackbar` 배경에서 쓴다 — 즉 지금 **어두운 면 3곳이 전부 같은 `#374151`**이고 어느 쪽이 실제 의도값인지는 디자이너 확인 전까지 알 수 없다. 참고로 Grey/700이 다른 값이라면 `Snackbar`와 `FILL_INVERSE` 계열이 갈릴 수 있다.

**D. 팔레트에는 있지만 `colors.ts`에 상수가 없는 스텝(31개, 사용 시 새 상수 필요)**: Grey/50·500·900, Navy/50·100·300·400·600·700·900, Blue/200·600·700·800·900, Yellow/100·200·300·400·600·700·800·900, Red/100·200·300·500·600·700·800·900. (이번 조사로 필요해진 것은 없음. 예: 11-7의 시트 빨강 `#FA564D`는 Red/500 `#FA4A41`이 가장 가깝지만 새 상수를 만들지 않기로 했다 — 불일치 #23.)

**E. `colors.ts`를 거치지 않은 하드코딩 — 17곳**(hex 3~8자리·`rgb(a)()` 전수, `src/` 전체)

코드(비주석) 11곳:
| 파일:라인 | 값 | 팔레트 대조 |
|---|---|---|
| `components/Navigation/Bottom Navigation/BottomNavigation.tsx:63` | `#000000` (`shadowColor`) | Basic/100과 같음(`BASIC_100` 상수 있음) |
| `screens/Folder/FolderMoreMenu.tsx:52` | `rgba(0, 0, 0, 0.2)` | 알파 값, 팔레트 밖 |
| `screens/GroupManager/GroupSwitcherMenu.tsx:58` | `rgba(0, 0, 0, 0.2)` | 위와 같음 |
| `screens/Member/MemberMoreMenu.tsx:35` | `rgba(0, 0, 0, 0.2)` | 위와 같음 |
| `components/Data Display/Image Placeholder/Thumbnail.tsx:106` | `rgba(0, 0, 0, 0.4)` | **`OVERLAY_SCRIM`과 값이 같음**(상수 미사용) |
| `screens/GroupManager/GroupProfileEditScreen.tsx:333` | `rgba(0, 0, 0, 0.4)` | 위와 같음 |
| `screens/More/ProfileEditScreen.tsx:420` | `rgba(0, 0, 0, 0.4)` | 위와 같음 |
| `components/Feedback/Snackbar/Snackbar.tsx:95` | `rgba(255, 255, 255, 0.15)` | 알파 값(스낵바 액션 눌림), 팔레트 밖 |
| `components/Data Display/Card/MiniCalendarCard.stories.tsx:11` | `#E4E9F2` | 팔레트 밖, 가장 가까운 것 Navy/50 `#E7E8EE`(R3 · G1 · B4) — **Storybook 배경** |
| `components/Data Display/Card/ReportCard.stories.tsx:10` · `Receipt/Receipt.stories.tsx:10` | `#E4E9F2` | 위와 같음(스토리 전용, 앱 화면 아님) |

주석 속 hex 6곳(동작 무관): `TextField.tsx:27`(`#3772E4` — 시트 별 색 실측), `SearchField.tsx:34·98`(`#E5E7EB`)·`:98`(`#E1E3E8`), `DuesProgressCard.tsx:49`(`#F3F4F6`)·`:52`(`#E5E7EB`). 참고: 주석의 `#3772E4`는 팔레트 밖이며 채널 합 기준 가장 가까운 것은 Blue/600 `#3562DB`(R2 · G16 · B9)이고 현재 쓰는 Blue/500 `#4A7FE7`은 R19 · G13 · B3(합 35 vs 27) — 11-7에서 승인받은 `FOREGROUND_SECONDARY`(Blue/500)는 그대로 둔다(보고용).

**F. 요약**: 앱 색 상수는 팔레트와 **전부 일치**(팔레트 밖은 소셜 브랜드 3개뿐). 문제는 (1) PDF의 Grey/700=800 중복, (2) `YELLOW_50` 대소문자 표기, (3) 반투명 검정 `rgba(0,0,0,0.4)`가 `OVERLAY_SCRIM`을 안 쓰는 3곳, (4) `rgba(0,0,0,0.2)`(메뉴 백드롭 3곳)·`rgba(255,255,255,0.15)` 상수 없음. 전부 **목록만, 고치지 않았다**.

### 5-27. 타이포그래피 표 추출 — `FONT/Typography Style.pdf` (2026-09-20, 11-8, 추출만·대조 안 함)

- 텍스트 레이어에는 스타일 이름과 열 이름만 있고 **값은 벡터 도형(글리프 경로)이라 텍스트로 안 읽힌다**(`pdftotext`로는 스타일명만 나옴). PyMuPDF로 렌더링해 **눈으로 읽었다**(15행 × 4열, 값이 또렷하고 토큰 이름과 px 값이 서로 검증됨).
- 결과: [docs/typography.tsv](typography.tsv) — `style | font_size_token/px | line_height_token/px | letter_spacing_token/value | font_weight_token/variable`.
- `Primitive Typography.pdf`(텍스트 레이어 있음)의 토큰 값과 교차 확인: Font Size 250=10 · 300=12 · 350=14 · 400=16 · 450=18 · 500=20 · 600=24, Line Height 400=16 · 450=18 · 500=20 · 600=24 · 700=28 · 800=32, letter spacing none=0 · xs=0.1 · sm=0.15 · md=0.2 · lg=0.25 · xl=0.4 · 2xl=0.5 · 3xl=1.25 · 4xl=1.5 → 모두 스타일 표의 값과 일치.
- **주의**: `Font Weight`의 숫자(Light 100 · Regular 200 · Medium 300 · SemiBold 400 · Bold 500)는 **Figma 변수 값이지 CSS 굵기(400/500/600/700)가 아니다.** 실제 렌더 굵기 매핑은 PDF에 없다. 또 표기가 `SemiBold`(H2~Subtitle)와 `Semibold`(Button·Badge)로 섞여 있다(같은 토큰으로 보임).
- 스타일 표의 서체는 Pyeojin Gothic 하나.
- 이 값과 `typography.ts` 대조는 **하지 않았다**(지시). 기존 `docs/typography-audit.md`(코드 대조 문서)와 별개다.


**※ 갱신(2026-09-21 11-9) — `typography.ts` 대조(조사만, 수정 없음)**

굵기는 대조하지 않는다: PDF의 굵기 값(100~500)은 Figma 변수라 CSS 굵기와 다르다(코드는 `fontFamily`로 굵기를 고르는 방식). 표에는 PDF 토큰만 적고 코드 열은 `—`로 둔다.

| 토큰명 | PDF 크기 / 행간 / 자간 | 굵기(PDF, 대조 안 함) | 코드 크기 / 행간 / 자간 | 일치 |
|---|---|---|---|---|
| H1 | 24 / 32 / 0 | Bold (500) | 24 / 32 / 0 | ✔ |
| H2 | 20 / 28 / 0.15 | SemiBold (400) | 20 / 28 / 0.15 | ✔ |
| H3 | 18 / 24 / 0.15 | SemiBold (400) | 18 / 24 / 0.15 | ✔ |
| Subtitle1 | 16 / 24 / 0.15 | SemiBold (400) | 16 / 24 / 0.15 | ✔ |
| Subtitle2 | 16 / 24 / 0.15 | Medium (300) | 16 / 24 / 0.15 | ✔ |
| Subtitle3 | 14 / 20 / 0.1 | SemiBold (400) | 14 / 20 / 0.1 | ✔ |
| Subtitle4 | 14 / 20 / 0.1 | Medium (300) | 14 / 20 / 0.1 | ✔ |
| Body1 | 16 / 24 / 0.5 | Regular (200) | 16 / 24 / 0.5 | ✔ |
| Body2 | 14 / 20 / 0.25 | Regular (200) | 14 / 20 / 0.25 | ✔ |
| Body3 | 12 / 16 / 0.25 | Regular (200) | 12 / 16 / 0.25 | ✔ |
| Button | 14 / 20 / 1.25 | Semibold (400) | 14 / 20 / 1.25 | ✔ |
| Chips | 12 / 16 / 0.4 | Medium (300) | 12 / 16 / 0.4 | ✔ |
| Badge | 10 / 16 / 1.5 | Semibold (400) | 10 / 16 / 1.5 | ✔ |
| **Caption** | **10** / 16 / 0.4 | Regular (200) | **8** / 16 / 0.4 | **✘ 크기** |
| Overline | 10 / 18 / 0.4 | Regular (200) | 10 / 18 / 0.4 | ✔ |

- **불일치는 `Caption` 크기 하나** — PDF `Font Size/250` = 10px, 코드 `fontSize: 8`. 이력: `2026-09-06` 커밋 `6de0cbf`("all about")에서 10 → 8로 바뀌었다(커밋 메시지에 이유 없음). 이 값이 의도인지 실수인지는 기록에서 알 수 없다. `TYPOGRAPHY.caption` 사용처 7곳.
- **자간(`letterSpacing`)은 코드에 있다** — 15개 스타일 전부 정의돼 있고 값이 PDF와 일치. 위 §3-2 표의 "letterSpacing 누락"은 **낡은 서술**(이후 추가됨).
- 굵기 관련 참고: PDF는 `SemiBold`/`Semibold` 표기가 섞여 있다. 코드 `FONT_FAMILY`는 `semibold` = `Pyeojin Gothic Semi-bold`, `bold` = `Pyeojin Gothic` + `fontWeight: 'bold'`. 대조 안 함.

### 5-28. 스크림·메뉴 백드롭 농도 시안 실측 (2026-09-21, 11-9)

**방법**: 원본 스펙시트(1px = 1dp, 프레임 x = 50·430·810…)에서 모달/시트가 열린 프레임의 왼쪽 가장자리(프레임 밖 여백 제외)를 세로로 훑어 스크림 회색의 최빈값을 뽑고, 뒤 화면 배경(흰색 `#FFFFFF` / 블루 `#F0F5FE`)을 가정해 채널별 알파를 역산했다. 뒤 화면이 흰색이면 세 채널의 알파가 같아지고, 블루면 블루 가정에서 같아진다 — 이 일치로 배경을 판별했다.

| 시트 | 프레임 | 스크림 | α(흰 가정) | α(블루 가정) | 판별 |
|---|---|---|---|---|---|
| `내역/내역_상세내역조회_삭제.png` | #0 | `#707070` | 0.561 | 0.533/0.543/0.559 | 흰 배경 → **0.56** |
| `DUE/납부관리_회비상세_삭제.png` | #0 | `#707070` | 0.561 | — | 흰 → **0.56** |
| `DUE/납부관리_회비상세_마감.png` | #0 | `#707070` | 0.561 | — | 흰 → **0.56** |
| `폴더/폴더_기록.png` | #0 | `#6A6C70` | 0.584/0.576/0.561 | 0.558/0.559/0.559 | 블루 배경 → **0.56** |
| `폴더/폴더_폴더생성.png` | #0 | `#707070` | 0.561 | — | 흰 → **0.56** |
| `폴더/폴더_장부상세_삭제하기.png` | #0 | `#707070` | 0.561 | — | 흰 → **0.56** |
| `내역/내역_필터링.png` | #0·#1 | `#6A6C70` | 0.584/0.576/0.561 | 0.558/0.559/0.559 | 블루 → **0.56** |
| `더보기/기록보관/더보기_기록보관_기록보관삭제.png` | #0 | `#6A6C70` | — | 0.558/0.559/0.559 | 블루 → **0.56** |
| `FAB_내역추가/내역_내역추가_상세정보.png` | #0·#1 | `#707070` | 0.561 | — | 흰 → **0.56** |
| `FAB_내역추가/내역_내역추가_증빙자료-2.png` | #0 | `#707070` | 0.561 | — | 흰 → **0.56** |
| `더보기/모임 나가기/더보기_모임관리_모임나가기.png` | #0 | `#6A6C70` | — | 0.558/0.559/0.559 | 블루 → **0.56** |
| `더보기/모임관리/모임원삭제-1.png` | #0 | `#6A6C70` | — | 0.558/0.559/0.559 | 블루 → **0.56** |
| `더보기/보고서생성/더보기_보고서생성하기_장부별.png` | #1 | `#707070` | 0.561 | — | 흰 → **0.56** |
| **`폴더/폴더_장부예산설정_금액기입.png`** | #0·#1 | **`#484A4C`** | 0.718/0.710/0.702 | 0.700/0.698/0.701 | 블루 → **0.70** |

- 14개 시트 17프레임 중 **15프레임이 α = 0.56**(흰 `#707070`, 블루 `#6A6C70` 둘 다 같은 알파). **0.56이 대표값.**
- **정정**: 요청서는 `#6A6C70`을 흰색 기준 0.58로 역산했으나 이 프레임은 뒤 화면이 블루(`#F0F5FE`)라 채널이 일치하는 값은 **0.56**이다(흰색 가정이면 채널 간 알파가 0.584/0.576/0.561로 어긋난다).
- **예외 1곳**: `폴더_장부예산설정_금액기입.png`(`FDR-3-SHEET-01-0`) 두 프레임만 α0.70이다. 같은 ID의 `폴더_메뉴_장부예산설정_금액기입.png`는 `#6A6C70`(0.56)이다 — 시트 내부 불일치 → `design-questions.md` #4.
- **적용**: `OVERLAY_SCRIM` = `rgba(0, 0, 0, 0.56)`(주석에 실측 근거). 하드코딩 `rgba(0,0,0,0.4)` 3곳(`Thumbnail` 업로드 오버레이 · `GroupProfileEditScreen`·`ProfileEditScreen` 아바타 업로드 오버레이)을 `OVERLAY_SCRIM`으로 교체했다. **주의**: 이 3곳은 모달 스크림이 아니라 **이미지 위 "업로드 중" 반투명 오버레이**라 시트 근거가 없다 — 지시대로 상수를 쓰게 했으므로 0.4 → 0.56으로 진해졌다. 별도 값이 필요하면 상수를 하나 더 두면 된다.
- **메뉴 백드롭(`rgba(0,0,0,0.2)` 3곳)**: 메뉴가 열린 프레임을 전수 확인 — 폴더 메인(Case A)·폴더 상세(Case A)·장부 상세·납부관리 회비 상세·모임원 관리·모임 전환 시트(`FolderMoreMenu`·`GroupSwitcherMenu`·`MemberMoreMenu` 사용처 5화면 대응)에서 스크림 회색 픽셀이 프레임의 **0.4~0.5%**(글자·아이콘)뿐이고, 대조군(모달 프레임 `내역_상세내역조회_삭제.png`)은 32%다. **메뉴 백드롭은 화면을 어둡게 하지 않는다(α0).** → 모달 스크림과 다르므로 별도 상수 `OVERLAY_MENU_BACKDROP` = `rgba(0, 0, 0, 0)`(근거 주석 포함)을 만들어 3곳에 적용했다. 시각적으로는 메뉴 뒤가 더 이상 어두워지지 않는다(바깥 터치로 닫히는 동작은 그대로) — 시안이 메뉴 프레임을 스크림 없이 그린 것이 의도인지 `design-questions.md` #5에서 확인 요청.

## 6. 권장 순서

1. **`TYPOGRAPHY`에 `letterSpacing` 15개 추가** (§3-2) — 스크린샷 대조 전에 해야 전 화면 오탐을 막는다.
2. **`colors.ts` 주석 정정**, `CLAUDE.md` 현행화 (§3-1, §5-3)
3. **화면 파일에 `@screen` 주석 심기** (§4-1) — 이후 검증이 자동화된다.
4. **`[부족함]` 18건 처리**(2026-09-11 세 번 재계산 — 갤러리·업로드 연동으로 `ETC-3-PAGE-01-0`/`ETC-4-PAGE-15-0` 2건이 `[구현]`으로 올라갔다가, 시안 재확인으로 `ETC-4-PAGE-02-0`/`ADD-4-SNACKBAR-01-0` 2건이 `[부족함]`로 내려가고, 이번엔 실기기 대조로 `ETC-3-PAGE-01-0`/`ETC-4-PAGE-15-0` 그 2건마저 다시 `[부족함]`로 내려가 순감 -2, 16건→18건) — 대부분 화면은 있고 연결만 빠진 것이라 비용 대비 효과가 크다. 특히 `COM-5-PAGE-01-0`(가입 완료 → 모임 생성/참여)은 대상 화면이 이미 있어서 연결만 하면 된다. 보고서 조회 3건(`ETC-4-PAGE-05-0`/`07-0`/`ETC-5-PAGE-02-0`)은 서버가 스냅샷에 영수증·메모를 추가해줘야 풀린다(`docs/backend-requests.md` 1순위). `ADD-3-PAGE-01-0`(영수증 스캔)은 카메라 인텐트 전환으로 새로 추가됨 — `react-native-vision-camera` 도입 여부는 §5-5(도입 결정 대기, 기획 확인 아님). `ETC-4-PAGE-02-0`/`ADD-4-SNACKBAR-01-0`은 시스템 갤러리 피커가 시안의 인앱 그리드를 대체해 새로 추가됨 — 인앱 그리드로 되돌릴지, 시스템 피커로 확정할지도 §5-5 참고.
5. **스크린샷 캡처 & 대조** (§4) — `[구현]` 122개부터. 2026-09-11 묶음 1(15개 중 9개 대조 완료) 결과는
   `docs/design-diff.md` 해당 절 참고 — 남은 115개도 같은 방식으로 이어갈 것.
6. **`[미구현]` 4건만 남음**(2026-09-11 여섯 번째 재집계 — 배치 C(보관함 7건)·배치 E(회원 탈퇴 4건)·`ETC-2-PAGE-07-0`(통계/분석, `npm run screen-audit`로 발견) 총 12건이 실은 이미 코드가 있어 `[구현]`으로 이동, 문서만 미갱신 상태였다. 2026-09-12 `spec-sheet-map.tsv` 확장으로 `DTB-2-PAGE-03-0`도 시안이 발견돼 `[부족함]`으로 이동, 5건→4건) — 남은 4건: `DSH-2-PAGE-05-0`(통계, 시안 0장 — `ETC-2-PAGE-07-0`과 다른 화면)·`DTB-3-MODAL-02-0`(증빙자료 삭제, 시안 0장)·`ADD-4-PAGE-02-0`(사진 촬영 결과, 시안 0장)은 시안 자체가 없고, `DUE-5-PAGE-02-0`(개인 납부 내역 검색, 시안은 있음)은 서버 `keyword` 미지원(`backend-requests.md` 2-7)이라 못 만든다(`ADD-3-PAGE-02-0`은 시스템 카메라 인텐트로 대체 확정돼 `[해당없음]`이라 이 목록엔 없다 — §1 요약표 참고). 전부 착수 불가 사유가 명확해 더 줄일 수 없다(§5-4 참고).
