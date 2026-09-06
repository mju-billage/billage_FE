# Billage 디자인 ↔ 구현 검증 체크리스트

> 자동 생성 초안. `Billage_IA.xlsx`(V0.4, 201행/고유 Screen ID 159개)와 디자인 이미지 파일명, `src/` 코드를 대조한 결과다.

> 상태는 코드 정적 분석 기준이며, `[확인필요]`와 픽셀 단위 차이는 스크린샷 대조(§4) 후 확정한다.


## 1. 요약

**집계 기준(2026-09-06 정정)**: 이 표는 **`billage-ia.md`(IA 원본, 201행/고유
Screen ID 159개)와 대조되는 것만 센다.** 화면명세서에만 있고 IA엔 없는
발견분(§5-2, 25개 — 대부분 FDR/COM/ETC)은 여기 총계에 넣지 않고 §5-2에서만
추적한다. 2026-09-05 재집계 때 이 원칙을 안 지키고 DUE 쪽 IA-누락 발견분
4개(`DUE-3-PAGE-01-0`/`DUE-3-MODAL-03-0`/`DUE-3-PAGE-02-1`/`DUE-4-MODAL-03-0`,
§5-3 "IA 누락" 참고)만 총계에 끼워 넣어 159→163로 잘못 바꿨었다 — §5-2의
21개(25개 중 DUE 4개를 뺀 나머지)는 안 들어가 있는 반쪽짜리 상태였다.
아래는 그 4개를 다시 빼고 IA 159 기준으로 되돌린 숫자다(§2 실제 행을 다시
세어 계산, 수작업 추정 아님).

| 상태 | 개수 | 의미 |
|---|---:|---|
| `[구현]` | 93 | 대응 화면이 있고 눈에 띄는 누락 없음 (픽셀 대조 미완) |
| `[부족함]` | 12 | 화면은 있으나 요소·연결·API가 빠짐 |
| `[확인필요]` | 13 | 대응 후보는 있으나 실제 일치 여부 미확정 |
| `[미구현]` | 41 | 대응 화면 없음(`[구현→보류]`·`[보류]` 2건 포함 — 코드가 아직 없어 이 집계에선 미구현으로 묶었다, 아래 ETC 참고) |
| **합계** | **159** | IA 고유 Screen ID(`billage-ia.md` 기준). IA-누락 발견분은 §5-2에서 별도 집계 |

### 도메인별

| 영역 | 전체 | 구현 | 부족함 | 확인필요 | 미구현 |
|---|---:|---:|---:|---:|---:|
| COM — Common — 로그인/회원가입/탈퇴 | 13 | 5 | 4 | 0 | 4 |
| DSH — 대시보드 | 4 | 0 | 2 | 1 | 1 |
| DTB — 내역(거래) | 12 | 9 | 0 | 0 | 3 |
| FDR — 폴더/장부 | 24 | 12 | 0 | 10 | 2 |
| DUE — 납부 관리(회비) | 28 | 25 | 0 | 0 | 3 |
| ETC — 더보기 — 모임/보고서/증빙앨범/설정 | 61 | 29 | 4 | 1 | 27 |
| ADD — FAB — 내역 추가 | 17 | 13 | 2 | 1 | 1 |

**2026-09-06 재정정**: ETC 구현 3건(`ETC-4-PAGE-05-0`/`07-0`/`ETC-5-PAGE-02-0`)을
`[부족함]`으로 다시 내렸다 — 스냅샷에 `memo`/`receipts`가 없어 시안이 요구하는
영수증·메모 조회 기능이 빠졌다(§2 각 행 참고). ETC 32→29구현, 부족함 1→4.

DTB(9구현, 부족함 2건이 어느 라운드에선가 구현으로 넘어감)·DUE(25구현, IA
누락 4개 제외 순수 IA-158행 기준)·ETC(29구현, 이번 라운드 보고서 조회
플로우 6행 + 지난 라운드 Report·증빙자료 반영분)가 각각 표만 안 따라왔던
부분을 반영했다. DUE의 IA-누락 4개는 실제로는 구현돼 있으니(§2 각 행 참고)
"미구현"은 아니다 — 다만 이 §1 총계엔 안 잡힐 뿐이다.

## 2. 화면별 체크리스트

`디자인` 컬럼은 IA 문서의 Design 상태다. `예정`은 디자인이 아직 없으므로 **구현 대상에서 제외**한다.


### COM — Common — 로그인/회원가입/탈퇴

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `COM-1-PAGE-01-0` | 로그인 | Page | 전체 | 완료 | 3장 | `[부족함]` | `screens/LoginScreen.tsx` — 상세: [design-diff.md#com-1-page-01-0-로그인](design-diff.md#com-1-page-01-0-로그인) |
| ☐ | `COM-1-PAGE-02-0` | 탈퇴_안내사항 | Page | 전체 | 진행 | 1장 | `[미구현]` | 탈퇴 플로우 전체 없음 |
| ☐ | `COM-2-PAGE-01-0` | 약관 동의 | Page | 전체 | 완료 | 2장 | `[구현]` | `screens/Signup/TermsAgreementScreen.tsx` — 상세: [design-diff.md#com-2-page-01-0-약관-동의](design-diff.md#com-2-page-01-0-약관-동의) |
| ☐ | `COM-2-PAGE-02-0` | 비밀번호 재설정 | Page | 전체 | 완료 | 3장 | `[부족함]` | `screens/PasswordReset/PasswordResetScreen.tsx` — L29 TODO: 임시 비밀번호 발급/발송 API 미연동 |
| ☐ | `COM-2-PAGE-04-0` | 탈퇴_권한 넘기기 | Page | 전체 | 진행 | 2장 | `[미구현]` | 탈퇴_권한 넘기기 |
| ☐ | `COM-2-PAGE-05-0` | 탈퇴_사유 입력 | Page | 전체 | 진행 | 4장 | `[미구현]` | 탈퇴_사유 입력 |
| ☐ | `COM-3-MODAL-01-0` | 탈퇴_사유 입력 | Modal | 전체 | 진행 | 1장 | `[미구현]` | 탈퇴 최종 확인 모달 |
| ☐ | `COM-3-PAGE-01-0` | 약관 상세 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/Signup/{TermsOfService,PrivacyPolicy,MarketingConsent}Screen.tsx` — 약관 3종을 각각 별도 화면으로 구현. 상세: [design-diff.md#com-3-page-01-0-약관-상세](design-diff.md#com-3-page-01-0-약관-상세) |
| ☐ | `COM-3-PAGE-02-0` | 간편 가입 정보 입력 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/Signup/SocialSignupInfoScreen.tsx` — 상세: [design-diff.md#com-3-page-02-0-간편-가입-정보-입력-막힘](design-diff.md#com-3-page-02-0-간편-가입-정보-입력-막힘) (실 카카오/네이버/구글 OAuth 필요 — 픽셀 대조 불가) |
| ☐ | `COM-3-PAGE-03-0` | 가입 정보 입력 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/Signup/SignupInfoScreen.tsx` — 상세: [design-diff.md#com-3-page-03-0-가입-정보-입력](design-diff.md#com-3-page-03-0-가입-정보-입력) |
| ☐ | `COM-3-PAGE-04-0` | 비밀번호 재설정_완료 | Page | - | 완료 | 1장 | `[구현]` | `screens/PasswordReset/PasswordResetSentScreen.tsx` — 상세: [design-diff.md#com-3-page-04-0-비밀번호-재설정완료](design-diff.md#com-3-page-04-0-비밀번호-재설정완료) |
| ☐ | `COM-4-PAGE-01-0` | 이메일 인증 | Page | 전체 | 완료 | 2장 | `[부족함]` | `screens/Signup/EmailVerificationScreen.tsx` — L59·66·72 TODO: 인증코드 발송/재전송/검증 API 미연동. 상세: [design-diff.md#com-4-page-01-0-이메일-인증](design-diff.md#com-4-page-01-0-이메일-인증) |
| ☐ | `COM-5-PAGE-01-0` | 가입 완료 | Page | 전체 | 완료 | 4장 | `[부족함]` | `screens/Signup/SignupCompleteScreen.tsx` — [모임 생성하기]/[코드로 참여하기] 연결은 완료. 상세: [design-diff.md#com-5-page-01-0-가입-완료](design-diff.md#com-5-page-01-0-가입-완료) (레이아웃 간격·보조 버튼 색상 차이) |

### DSH — 대시보드

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `DSH-1-PAGE-01-0` | 대시보드 | Page | 총무 | 예정 | 1장 | `[부족함]` | `screens/Dashboard/DashboardScreen.tsx` — IA상 W/F·디자인 모두 '예정' → 기획 미확정. FAB→`TransactionRegister` 연결 완료. 보고서/통계/앨범 TODO는 대상 화면 자체가 아직 없어 그대로 둠. 상세: [design-diff.md#dsh-1-page-01-0-대시보드](design-diff.md#dsh-1-page-01-0-대시보드) |
| ☐ | `DSH-2-PAGE-01-0` | 알림 목록 | Page | 전체 | 예정 | 1장 | `[구현]` | `screens/Notification/NotificationScreen.tsx` — **2026-09-06 해결**: 알림 설정(`ETC-3-PAGE-08-0`)이 배치 B로 생겨 우측 상단 톱니 아이콘을 `NotificationSettingsScreen`으로 연결했다. 상세: [design-diff.md#dsh-2-page-01-0-알림-목록](design-diff.md#dsh-2-page-01-0-알림-목록) (픽셀 대조는 차이 없음) |
| ☐ | `DSH-2-PAGE-03-0` | 대시보드 캘린더 | Page | 총무 | 예정 | **0장** | `[확인필요]` | `screens/Calendar/CalendarScreen.tsx` — 디자인 '예정' + 이미지 0장. L81 TODO: 일별 보기 IA 미정의 → 기획 확인 선행. 상세: [design-diff.md#dsh-2-page-03-0-대시보드-캘린더-디자인-없음](design-diff.md#dsh-2-page-03-0-대시보드-캘린더-디자인-없음) |
| ☐ | `DSH-2-PAGE-05-0` | 통계 및 분석 | Page | 총무 | 진행 | **0장** | `[미구현]` | 통계 및 분석 (이미지 0장, 디자인 진행중) |

### DTB — 내역(거래)

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `DTB-1-PAGE-01-0` | 내역 메인 | Page | 총무 | 완료 | 5장 | `[구현]` | `screens/Transactions/TransactionsScreen.tsx` — **4-B(모임 전체 내역 목록 API 연동)에서 목(`types/transaction.ts`)을 걷어내고 `entryService.getGroupEntries()`로 전환.** 무한 스크롤 추가, 승인요청 탭이 실제 상세 화면(4-A `TransactionDetailScreen`)으로 이어짐. 장부 목록(`ledgerOptions`)은 필터/탭과 분리해 포커스 시에만 재조회(4-B 정리, 2026-09-05). 옛 `editMock` 완료 신호였던 `addedTransactionId` 파라미터 기반 스낵바는 발신처(`editMock`)가 삭제되며 죽은 코드가 되어 함께 제거. 상세: [design-diff.md#dtb-1-page-01-0-내역-메인](design-diff.md#dtb-1-page-01-0-내역-메인) |
| ☐ | `DTB-2-PAGE-01-0` | 내역 검색_전체 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionSearchScreen.tsx` — 4-B에서 실 API(`getGroupEntries({ keyword })`) 전환, 300ms 디바운스 |
| ☐ | `DTB-2-PAGE-02-0` | 상세 내역_조회 | Page | 전체 | 예정 | 6장 | `[구현]` | `screens/Folder/TransactionDetailScreen.tsx` — 4-A에서 수정 아이콘 연결 완료(아래 DTB-3-PAGE-02-0 참고). 디자인 상태 '예정'인데 이미지는 6장 존재 → 어느 쪽이 최신인지 확인 필요(미해결) |
| ☐ | `DTB-2-PAGE-03-0` | 상세 내역_승인요청 | Page | 총무 | 완료 | **0장** | `[미구현]` | 상세 내역_승인요청 (승인/수정 버튼) — 탭 필터만 있고 승인 상세 화면 없음 |
| ☐ | `DTB-2-SHEET-01-0` | 내역 필터링 | Bottom Sheet | 전체 | 완료 | 6장 | `[구현]` | `screens/Transactions/TransactionFilterSheet.tsx` — 4-B에서 장부 목록을 실 API(부모가 `ledgerService.getAllLedgersInGroup()`로 가져와 prop으로 내려줌)로 전환 |
| ☐ | `DTB-3-MODAL-01-0` | 상세 내역_삭제 | Modal | 전체 | 완료 | 1장 | `[구현]` | `screens/Folder/TransactionDetailScreen.tsx L152` |
| ☐ | `DTB-3-MODAL-02-0` | 증빙자료 삭제 | Modal | - | 완료 | **0장** | `[미구현]` | 증빙자료 삭제 모달 |
| ☐ | `DTB-3-PAGE-01-0` | 증빙자료 상세 | Page | 전체 | 완료 | 1장 | `[미구현]` | 증빙자료 상세 조회 |
| ☐ | `DTB-3-PAGE-02-0` | 상세 내역_수정 | Page | 전체 | 완료 | **0장** | `[구현]` | `screens/Transactions/TransactionRegisterScreen.tsx` — 4-A(Entry API 연동)에서 연결 완료. **4-B 정리(2026-09-05)**: DTB 전체 목록이 실 API로 전환되며 `dtb-tx-N` 목 id를 만들어내는 곳이 사라져(grep·라우트·딥링크·스토리북으로 확인) id 모양(숫자/`dtb-tx-N`)으로 두 경로를 나누던 `editMock` 분기와 `types/transaction.ts`를 삭제. 이제 수정 진입은 항상 `entryService.getEntryDetail()` 실 프리필 하나뿐이다. |
| ☐ | `DTB-3-SHEET-01-0` | 기간 선택 캘린더 | Bottom Sheet | 전체/총무 | 완료 | 10장 | `[구현]` | `screens/Transactions/TransactionFilterSheet.tsx` — 내부 중첩 BottomSheet(커스텀 기간용). `TransactionDateSheet.tsx`는 `ADD-2-SHEET-07-0`(일자 선택) 전용이라 무관함을 확인. **같은 ID를 `screens/Dues/DuesDateRangeSheet.tsx`(Dues 생성·수정 + Report 기간별 생성 공용)도 쓴다** — 2026-09-05 최신 확정 시안(`더보기_보고서생성하기_기간별_기간선택.png`, 05-19)과 재대조해 그 컴포넌트에 없던 시작/종료 날짜 미리보기(2자리 연도)와 좌측 보조 버튼(`cancelLabel` prop, 기본 `취소`)을 보강했다 — 자세한 내용은 그 파일 주석. `TransactionFilterSheet`의 내부 구현은 이번에 안 건드렸다(별도 컴포넌트라 회귀 위험 없음) |
| ☐ | `DTB-3-SHEET-02-0` | 장부 복수 선택 | Bottom Sheet | 전체 | 완료 | 2장 | `[구현]` | `screens/Transactions/TransactionLedgerMultiSelectSheet.tsx` — 4-B에서 장부 목록을 prop(`options`)으로 받도록 전환(실 API 출처는 부모) |
| ☐ | `DTB-4-MODAL-01-0` | 상세 내역_수정 이탈 안내 | Modal | 전체 | 완료 | **0장** | `[구현]` | `screens/Transactions/TransactionRegisterScreen.tsx L480` |

### FDR — 폴더/장부

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `FDR-1-PAGE-01-0` | 폴더 메인 (그리드 뷰) / 폴더 메인 (리스트 뷰) | Page | 전체 | 완료 | 4장 | `[확인필요]` | `screens/Folder/FolderScreen.tsx` — 상세: [design-diff.md#fdr-1-page-01-0-폴더-메인-그리드-뷰](design-diff.md#fdr-1-page-01-0-폴더-메인-그리드-뷰) (디자인 이미지가 검색 상태라 기본 목록과 상태 불일치, 재캡처 필요) |
| ☐ | `FDR-2-MODAL-01-0` | 새 폴더 생성 | Modal | - | 완료 | 1장 | `[확인필요]` | `screens/Folder/FolderScreen.tsx L344 dialogConfig` |
| ☐ | `FDR-2-MODAL-02-0` | 폴더 전체 백업 | Modal | 총무 | 완료 | 2장 | `[미구현]` | 폴더 전체 백업 |
| ☐ | `FDR-2-PAGE-01-0` | 이동 대상 선택 (그리드 뷰) / 이동 대상 선택 (리스트 뷰) | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/Folder/FolderSelectMoveScreen.tsx` |
| ☐ | `FDR-2-PAGE-02-0` | 전체 예산 설정 목록 | Page | 전체 | 완료 | 2장 | `[구현]` | `screens/Folder/FolderBudgetListScreen.tsx` |
| ☐ | `FDR-2-PAGE-04-0` | 폴더 상세 (그리드 뷰) / 폴더 상세 (리스트 뷰) | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/Folder/FolderScreen.tsx` — 폴더 진입 시 동일 화면 재사용 |
| ☐ | `FDR-2-PAGE-05-0` | 장부 상세 | Page | 전체 | 완료 | 5장 | `[구현]` | `screens/Folder/LedgerDetailScreen.tsx` |
| ☐ | `FDR-2-SHEET-01-0` | 새 장부 생성 | Bottom Sheet | 총무 | 완료 | 2장 | `[확인필요]` | `screens/Folder/NewItemSheet.tsx` |
| ☐ | `FDR-3-MODAL-01-0` | 폴더 이름 변경 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | `screens/Folder/FolderScreen.tsx dialogConfig` — 폴더 이름 변경 |
| ☐ | `FDR-3-MODAL-02-0` | 폴더 해제 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | `screens/Folder/FolderScreen.tsx dialogConfig` — 폴더 해제. **2026-09-05 갱신**: "최상위 폴더 + 직속 장부 있음" 조합의 해제를 막던 클라이언트 차단(`isUnlinkUnsafe`, 최상위 장부를 다시 조회할 API가 없다는 전제)을 없앴다 — `GET .../folder-items`(폴더ID 생략=최상위)가 최상위로 옮긴 장부도 `LEDGER` 항목으로 그대로 보여줌을 실호출로 확인해 그 전제가 깨졌다(`docs/api-gaps.md` "확정됨" 6번). 이제 모든 폴더가 항상 정상 해제 확인 모달로만 간다 |
| ☐ | `FDR-3-MODAL-03-0` | 장부 이름 변경 | Modal | 총무 | 완료 | 2장 | `[확인필요]` | `screens/Folder/LedgerDetailScreen.tsx L262` — 장부 이름 변경 |
| ☐ | `FDR-3-MODAL-04-0` | 장부 삭제 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | `screens/Folder/LedgerDetailScreen.tsx L262` — 장부 삭제 |
| ☐ | `FDR-3-MODAL-05-0` | 새 폴더 생성 | Modal | 총무 | 완료 | **0장** | `[확인필요]` | `screens/Folder/FolderScreen.tsx` — FDR-2-MODAL-01-0과 중복 ID — 기획 확인 필요 |
| ☐ | `FDR-3-PAGE-01-0` | 이동 경로 선택 (그리드 뷰) / 이동 경로 선택 (리스트 뷰) | Page | 전체 | 완료 | 2장 | `[구현]` | `screens/Folder/FolderMoveDestinationScreen.tsx`. **2026-09-05 갱신**: 확정 버튼이 `PATCH /folders`·`PATCH /ledgers` 단건 API를 선택 개수만큼 순차 호출하던 것을 `folderService.moveFolderItems()`(`POST .../folder-items/move`, 실호출로 "미구현" 태그가 낡았음을 확인) 한 번 호출로 교체 — 서버가 트랜잭션으로 처리해 "N개 성공 M개 실패" 부분 성공 문구가 필요 없어졌다. "장부는 최상위로 이동 불가" 차단도 같이 없앴다(새 API가 장부 최상위 이동을 명시적으로 지원, 실호출로 최상위 이동 후 조회까지 확인) |
| ☐ | `FDR-3-PAGE-02-0` | 내역 검색_장부 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/Folder/LedgerSearchScreen.tsx` |
| ☐ | `FDR-3-PAGE-03-0` | 새 장부 생성 | Page | 총무 | 완료 | **0장** | `[구현]` | `screens/Folder/LedgerCreateScreen.tsx` — 이미지 0장 — 대조 불가 |
| ☐ | `FDR-3-SHEET-01-0` | 장부 예산 입력 | Bottom Sheet | 총무 | 완료 | 1장 | `[확인필요]` | `screens/Folder/FolderBudgetListScreen.tsx` — `FDR-3-SHEET-02-0`과 같은 BottomSheet로 판단(낮은 확신). 두 ID가 같은 시트인지 기획 확인 필요 |
| ☐ | `FDR-3-SHEET-02-0` | 예산 설정 | Bottom Sheet | 총무 | 완료 | 2장 | `[확인필요]` | `screens/Folder/FolderBudgetListScreen.tsx` — `FDR-3-SHEET-01-0`과 같은 BottomSheet로 판단(낮은 확신). 두 ID가 같은 시트인지 기획 확인 필요 |
| ☐ | `FDR-3-SHEET-03-0` | 장부상세_필터링 | Bottom Sheet | 전체 | 예정 | 5장 | `[구현]` | `screens/Folder/LedgerFilterSheet.tsx` — 디자인 '예정'인데 이미지 5장 존재 |
| ☐ | `FDR-3-SNACKBAR-01-0` | 새 폴더 생성_완료 | SnackBar | 총무 | 완료 | 1장 | `[구현]` | `screens/Folder/FolderScreen.tsx` — `SNACKBAR_FOLDER_CREATED_SUFFIX` (기존 `LedgerCreateScreen.tsx L114` 표기는 장부 생성 스낵바를 잘못 지목한 것이었음) |
| ☐ | `FDR-3-SNACKBAR-02-0` | 폴더 백업 완료 | Snackbar | 총무 | 완료 | 1장 | `[미구현]` | 폴더 백업 완료 |
| ☐ | `FDR-4-SNACKBAR-01-0` | 이동 완료 / 폴더 해제_완료 | SnackBar | 전체/총무 | 예정 | 1장 | `[구현]` | "폴더 해제_완료"는 `screens/Folder/FolderScreen.tsx`(`SNACKBAR_FOLDER_UNLINKED_SUFFIX`), "이동 완료"는 `screens/Folder/FolderMoveDestinationScreen.tsx`(`SNACKBAR_FOLDER_MOVED`) — 두 파일에 분산 |
| ☐ | `FDR-4-SNACKBAR-02-0` | 장부 삭제_완료 | SnackBar | 총무 | 예정 | 2장 | `[구현]` | `screens/Folder/LedgerDetailScreen.tsx` — `SNACKBAR_LEDGER_DELETED_SUFFIX` (`FolderScreen.tsx`에는 장부 삭제 기능이 없음, 폴더 unlink만 함) |
| ☐ | `FDR-4-SNACKBAR-03-0` | 이름 변경_완료 | SnackBar | 총무 | 예정 | 2장 | `[구현]` | `screens/Folder/FolderScreen.tsx` — `activeDialog==='rename'` 확인 시 `SNACKBAR_FOLDER_RENAMED` (@screen 작업 때 확인해놓고 이 표 상태 갱신을 빠뜨렸었음) |

### DUE — 납부 관리(회비)

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `DUE-1-PAGE-01-0` | 납부 관리 메인 | Page | 전체 | 완료 | 3장 | `[구현]` | `screens/Dues/DuesScreen.tsx` — 6-A(조회 전용), 2026-09-05 정합성 복구로 정렬 로직 재수정(클라이언트 재정렬 제거, 서버 정렬 순서 그대로 렌더링). 2026-09-03 명세 갱신으로 이 화면 전용 이미지가 새로 반입됨(`npm run design-index` 재실행, 종전엔 화면명세서 임베드 1장만 있었음) |
| ☐ | `DUE-2-PAGE-01-0` | 회비 생성 | Page | 총무 | 완료 | 3장 | `[구현]` | `screens/Dues/DuesCreateScreen.tsx`(step='basic') — 6-B, **2026-09-05 정합성 복구로 재수정**. 화면명세대로 기간(시작일~마감일) 범위 입력을 복원해 `startDate`를 같이 보낸다(`DuesDateRangeSheet` 신설, `Calendar` 재사용). 6-B 당시 "서버 미지원"으로 마감일 단일 입력으로 줄였던 판단이 틀렸었다 — `docs/api-gaps.md` "확정됨"/"코드 반영 완료" 절 참고 |
| ☐ | `DUE-3-PAGE-01-0` | 새 회비 생성_모임원 선택 | Page | 총무 | 완료 | 1장(화면명세서 임베드) | `[구현]` | `screens/Dues/DuesCreateScreen.tsx`(step='members') — 6-B. **IA(`billage-ia.md`) 원본 201개 화면 목록에 이 ID 자체가 없다** — 화면명세서에만 정의돼 있음(IA 누락으로 보임). 모임원 0명 빈 상태는 화면명세서 Case A에 명시돼 있어("모임원을 추가해보세요.") 그대로 구현함 |
| ☐ | `DUE-2-PAGE-02-0` | 모임원 관리 | Page | 전체 | 완료 | 12장 | `[구현]` | `screens/Member/MemberManageScreen.tsx` — 7-A(조회 전용, 목록+검색) + **7-C 추가**: 행 탭이 `MemberDetail`로 연결됐고, ⋮ 메뉴에 명세 Case A의 "모임원 삭제"를 추가해 같은 화면 안 `mode`(새 라우트 아님)로 다중 선택·일괄 삭제를 구현했다 — 시안이 "백 버튼: 삭제 모드 취소 후 메인 복귀"라고 명시해 뒤로가기가 스택을 나가지 않고 모드만 되돌린다. 2026-09-05 시안 대조: 차이 없음(design-diff.md "배치 G") |
| ☐ | `DUE-2-PAGE-03-0` | 회비 항목 상세 / 회비 항목 상세 (미납부) | Page | 전체/총무 | 진행 | 5장 | `[구현]` | `screens/Dues/DuesDetailScreen.tsx` — 6-A(조회 전용). 진행 중 상태(기본 탭 '미납부'). 2026-09-05 화면명세서 UI 요소 표 전수 대조: 앱바 메뉴/캐러셀 카드/회비 요청하기/체크박스+CTA 4건 차이 + **미납부·납부완료 리스트가 화면에 안 보이는 치명급 렌더링 버그 신규 발견**(데이터는 정상, 원인 미확정) — 상세: `design-diff.md` "배치 G" 절 `DUE-2-PAGE-03-0 / DUE-2-PAGE-03-1` 항목. **7-B-1(같은 날) 추가**: 렌더링 버그는 `Divider.tsx` 수정으로 해결됨(별도 라운드). 앱바 ⋮ 메뉴(회비 수정/모임원 선택/회비 마감/회비 삭제, 상태별 분기 + OWNER 전용)를 연결했다. **7-B-2 추가**: 체크박스+일괄 CTA("납부 완료하기"/"납부 취소하기") 연결 — `OPEN` && `OWNER`일 때만 노출(`SCHEDULED`/`CLOSED`는 비활성이 아니라 완전히 숨김, 목업 그대로). `PATCH /dues/{id}/members`(일괄) 실호출 확인 후 그대로 사용. 회비 요청하기는 여전히 미구현(대응 API 없음) |
| ☐ | `DUE-2-PAGE-03-1` | 회비 항복 상세 (납부완료) — 실제로는 "마감된 회비"/"예정된 회비" 두 상태 변형 | Page | - | 완료 | 6장 | `[구현]` | `screens/Dues/DuesDetailScreen.tsx` — 같은 파일이 서버 `status`(`SCHEDULED`/`OPEN`/`CLOSED`)로 세 상태(예정된 회비, 진행중=DUE-2-PAGE-03-0, 마감된 회비)를 전부 분기 처리한다. 2026-09-05 정합성 복구 전엔 "예정"을 `paidCount===0`으로 잘못 추정했으나 서버 `SCHEDULED`를 그대로 신뢰하도록 고쳤다. IA 페이지명 "회비 항복 상세 (납부완료)"는 오타로 보임. 시안 대조는 위 `DUE-2-PAGE-03-0` 행 참고(같은 파일, 같은 버그) |
| ☐ | `DUE-3-MODAL-01-0` | 회비 삭제 | Modal | 총무 | 완료 | 1장 | `[구현]` | `screens/Dues/DuesDetailScreen.tsx`(확인 `Dialog`) — 7-B-1. 성공 시 `Main`/`Dues`(목록)로 라우팅하며 스낵바(`DUE-4-SNACKBAR-03-0`) 표시 |
| ☐ | `DUE-3-MODAL-02-0` | 회비 마감 | Modal | 총무 | 예정 | 1장 | `[구현]` | `screens/Dues/DuesDetailScreen.tsx`(확인 `Dialog`) — 7-B-1. `OPEN` 상태에서만 ⋮ 메뉴에 노출. 성공 시 `Main`/`Dues`(목록)로 라우팅하며 스낵바(`DUE-4-SNACKBAR-02-0`) 표시 |
| ☐ | `DUE-3-PAGE-02-0` | 모임원 선택 | Page | 총무 | 완료 | 5장 | `[구현]` | `screens/Dues/DuesMemberEditScreen.tsx` — 7-B-1, ⋮ 메뉴 "모임원 선택"에서 독립 진입. `DuesCreateScreen`(생성, `DUE-3-PAGE-01-0`)과 다른 화면 — `targetMemberIds`만 PATCH로 보낸다 |
| ☐ | `DUE-3-PAGE-03-0` | 모임원 상세 | Page | 전체 | 완료 | 2장 | `[구현]` | `screens/Member/MemberDetailScreen.tsx` — 7-C(조회 전용, MEMBER 권한). "총 납부 금액" 카드는 `MemberPaymentHistory`로 뎁스인. 수정(연필)·삭제(휴지통) 아이콘은 OWNER 전용이라 일반 관리자에겐 숨긴다 |
| ☐ | `DUE-3-PAGE-04-0` | 회비 요청 작성 | Page | 총무 | 완료 | 4장 | `[미구현]` | 7-B 대상. Dues.txt가 "서버 API 아님(클립보드+OS 공유)"으로 확정 — 구현 시 서버 호출 불필요. 이미지 신규 반입 |
| ☐ | `DUE-3-PAGE-06-0` | 회비 수정 | Page | 총무 | 완료 | 1장 | `[구현]` | `screens/Dues/DuesEditScreen.tsx` — 7-B-1. 제목/장부/기간만 수정, 금액은 `TextField disabled`로 표시만(서버가 `DUES_AMOUNT_IMMUTABLE`로 절대 금지). 목업엔 우측 X 아이콘이 안 보이는데 표 설명엔 있음 — 목업을 따라 뒤로가기(`<`) 하나에 이탈 확인을 붙였다(§5-4 참고) |
| ☐ | `DUE-3-SHEET-02-0` | 모임원 추가 선택 | Bottom Sheet | 전체 | 완료 | 2장 | `[구현]` | `screens/Member/MemberAddSheet.tsx` — 7-A |
| ☐ | `DUE-3-SNACKBAR-01-0` | 입금 확인 | Snackbar | - | 예정 | 1장 | `[구현]` | `DuesDetailScreen.tsx` — 7-B-2. "납부 완료하기" 성공 시 "{changedCount}명의 납부가 확인되었어요." |
| ☐ | `DUE-3-SNACKBAR-02-0` | 입금 취소 | Snackbar | - | 예정 | 1장 | `[구현]` | `DuesDetailScreen.tsx` — 7-B-2. "납부 취소하기" 성공 시 "{changedCount}명의 납부가 취소되었어요." |
| ☐ | `DUE-4-MODAL-01-0` | 모임원 삭제 | Modal | 전체 | 완료 | 3장 | `[구현]` | `MemberDetailScreen.tsx`(단건)·`MemberManageScreen.tsx`(일괄) 공유 `Dialog` — 7-C, OWNER 전용. 시안 문구("기존 납부 내역은 그대로 유지돼요")는 인원수와 무관하게 동일해 그대로 재사용했다. 이 문구가 실제 삭제 범위(진행 중 회비 참여 데이터는 Hard Delete)를 오해하게 만들 수 있어 §5-4에 기획 확인 항목으로 올렸다 |
| ☐ | `DUE-4-MODAL-02-0` | 회비수정_이탈 | Modal | 총무 | 예정 | 1장 | `[구현]` | `DuesEditScreen.tsx`/`DuesMemberEditScreen.tsx` 공유 `Dialog` — 7-B-1. 입력값이 하나라도 바뀐 상태로 뒤로가기 시 노출 |
| ☐ | `DUE-4-PAGE-01-0` | 모임원 추가_개별 | Page | 전체 | 완료 | 6장 | `[구현]` | `screens/Member/MemberAddIndividualScreen.tsx` — 7-A. 2026-09-05 시안 대조: "이름" 필수(`*`) 표시 누락, 태그 입력 진입점이 시안의 "+ 추가하기" 필 버튼+인라인 칩이 아니라 `SelectionListItem` 로우로 대체됨 — 상세: `design-diff.md` "배치 G" 절 |
| ☐ | `DUE-4-PAGE-02-0` | 모임원 추가_일괄 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/Member/MemberAddBulkScreen.tsx` — 7-A |
| ☐ | `DUE-4-PAGE-03-0` | 모임원 수정 | Page | 전체 | 완료 | 6장 | `[구현]` | `screens/Member/MemberEditScreen.tsx` — 7-C, OWNER 전용. `MemberAddIndividualScreen`(7-A)과 필드는 같지만 명세가 별도 화면으로 분리해 독립 파일로 구현(`DuesCreateScreen`/`DuesEditScreen` 선례와 동일 판단). PATCH가 부분 수정이 아니라 통째 교체라(Member.txt §4 aside, 2026-09-05 실호출로 재확인 — 이름만 보내면 나머지가 비워짐) 저장 시 항상 폼 전체 값을 보낸다 |
| ☐ | `DUE-4-PAGE-04-0` | 개인 납부 내역 | Page | 전체 | 완료 | 2장 | `[구현]` | `screens/Member/MemberPaymentHistoryScreen.tsx` — 7-C, 조회 전용(리스트 항목 탭 액션 없음). 명세는 이 API가 페이지네이션(`page`/`size`)을 지원한다고 적었지만 2026-09-05 실호출로 확인한 실제 응답은 `payments`가 배열 그대로라 무한 스크롤 없이 전체를 한 번에 받는다(`docs/backend-requests.md` 정정 요청). 시안이 언급한 필터/검색 툴바는 API가 `from`/`to` 기간만 지원해 만들지 않았다 — §5-4 참고 |
| ☐ | `DUE-4-SNACKBAR-01-0` | 회비 생성 완료 | Snackbar | 총무 | 예정 | 1장 | `[미구현]` | 이미지 신규 반입 |
| ☐ | `DUE-4-SNACKBAR-02-0` | 회비 마감 완료 | Snackbar | 총무 | 예정 | 1장 | `[구현]` | `DuesScreen.tsx` — 7-B-1. `DuesDetailScreen`이 마감 성공 후 `navigation.navigate('Main',{screen:'Dues',params:{snackbarMessage}})`로 넘겨 이 화면에서 표시(기본 스타일, 시안 '예정') |
| ☐ | `DUE-4-SNACKBAR-03-0` | 회비 삭제 완료 | Snackbar | 총무 | 예정 | 1장 | `[구현]` | `DuesScreen.tsx` — 7-B-1. 삭제는 상세 화면이 사라지므로 마감과 같은 방식으로 목록 화면에서 표시(기본 스타일, 시안 '예정') |
| ☐ | `DUE-4-SNACKBAR-04-0` | 회비 수정 완료 | Snackbar | 총무 | 예정 | **0장** | `[구현]` | `DuesEditScreen.tsx`/`DuesMemberEditScreen.tsx` — 7-B-1. 각 화면 자체에서 표시 후 1.6초 뒤 회비 상세로 복귀(`DuesCreateScreen` 완료 스낵바와 같은 패턴, 시안 이미지 자체가 없어 기본 스타일) |
| ☐ | `DUE-5-PAGE-01-0` | 태그 입력 | Page | - | 완료 | 6장 | `[구현]` | `screens/Member/MemberAddIndividualScreen.tsx`(step='tags') — 7-A. 별도 라우트가 아니라 개별 추가 화면 내부 스텝으로 구현(회비 생성 화면의 step 패턴과 동일). 명세의 상단 완료(✓) 아이콘 대신 기존 앱 관례(뒤로가기+하단 CTA)를 따름 |
| ☐ | `DUE-5-PAGE-02-0` | 개인 납부 내역_검색 | Page | 전체 | 완료 | 6장 | `[미구현]` | 7-C에서 `MemberPaymentHistoryScreen`을 만들며 함께 검토했으나, 대응 API(`GET .../payments`)가 `keyword` 파라미터를 지원하지 않아(`from`/`to` 기간만 가능) 만들면 서버에 반영 안 되는 죽은 UI가 된다 — §5-4 참고 |
| ☐ | `DUE-5-SNACKBAR-01-0` | 모임원 추가_일괄 완료 | Page | - | 완료 | 2장 | `[구현]` | `screens/Member/MemberAddBulkScreen.tsx` — 7-A |
| ☐ | `DUE-5-SNACKBAR-02-0` | 모임원 삭제 완료 | Snackbar | - | 예정 | 4장 | `[구현]` | `MemberDetailScreen.tsx`(단건, `Main`/`MemberManage`로 navigate해 스낵바 전달)·`MemberManageScreen.tsx`(일괄, 같은 화면에서 바로 표시) — 7-C. "{N}명의 모임원이 삭제되었어요." 3초 후 자동 소멸(시안 명시) |
| ☐ | `DUE-3-MODAL-03-0` | (IA 목록에 없음) | Modal | - | - | 2장 | `[확인필요]` | `npm run design-index` 재실행으로 새로 발견된 ID — `billage-ia.md` 201개 목록에 없음. `DUE-3-PAGE-01-0`·`DUE-5-SNACKBAR-03-0`과 같은 패턴(화면명세서에만 정의)으로 추정, 내용 미확인 |
| ☐ | `DUE-3-PAGE-02-1` | (IA 목록에 없음) | Page | - | - | 2장 | `[확인필요]` | 위와 동일 — 신규 발견, 내용 미확인. `DUE-3-PAGE-02-0`(모임원 선택)의 상태 변형으로 추정 |
| ☐ | `DUE-4-MODAL-03-0` | (IA 목록에 없음) | Modal | - | - | 1장 | `[확인필요]` | 위와 동일 — 신규 발견, 내용 미확인 |

### ETC — 더보기 — 모임/보고서/증빙앨범/설정

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `ETC-1-PAGE-01-0` | 더보기 메인 | Page | 전체 | 완료 | 2장 | `[부족함]` | `screens/MoreScreen.tsx` — 상세: [design-diff.md#etc-1-page-01-0-더보기-메인](design-diff.md#etc-1-page-01-0-더보기-메인) (모임 관리만 연결됨, 보고서 생성/증빙자료 앨범/소비 통계·분석/보관함 4개는 L112·118·124·130 여전히 빈 핸들러 + 레이아웃/아이콘 차이) |
| ☐ | `ETC-2-PAGE-01-0` | 전체 모임 관리 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/GroupManager/AllGroupsScreen.tsx` |
| ☐ | `ETC-2-PAGE-02-0` | 모임 관리 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/GroupManager/GroupManageScreen.tsx` — **2026-09-06 §5-4 해결**: `design-index.json`에 `ETC-2-PAGE-02-0.png`가 `ETC-2-PAGE-03-0.png`와 별개 파일로 존재하고, 삭제 시안(`ETC-3-MODAL-02-0`)의 배경 화면도 "< 모임 관리"라는 독립 페이지 경로/제목으로 등장해 — 오기가 아니라 실제로 빠져 있던 화면이었다. 더보기 → 모임 관리를 이 화면으로 새로 연결하고, 그 아래 모임 프로필 변경/모임원 관리(→ `GroupManagerScreen`)/모임 나가기/모임 삭제하기 4개 진입 행을 붙였다 |
| ☐ | `ETC-2-PAGE-03-0` | 모임 관리자 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/GroupManager/GroupManagerScreen.tsx` |
| ☐ | `ETC-2-PAGE-04-0` | 보고서 리스트 | Page | 전체/총무 | 진행 | 4장 | `[구현]` | `screens/Report/ReportMainScreen.tsx` — 7-E(생성 플로우, 조회 플로우는 다음 단계). 장부별/기간별 탭, 무한 스크롤(2026-09-05 갱신 — 최초엔 `size=50` 단일 조회였다가, 보고서는 삭제 API가 없어 계속 누적된다는 지적으로 `TransactionsScreen`류 `onEndReached` 페이지네이션으로 교체). 카드 탭은 "보고서 상세 조회"(조회 플로우 대상)로 가야 하나 그 화면이 아직 없어 no-op |
| ☐ | `ETC-2-PAGE-05-0` | 증빙자료 앨범 | Page | 전체/총무 | 진행 | 3장 | `[구현]` | `screens/Receipt/ReceiptAlbumScreen.tsx`. `GET /groups/{groupId}/receipts` MEMBER 권한이라 전체 관리자가 조회 가능(권한 표기 "전체/총무"는 File.txt에 없는 표기 — 조회 자체는 총무 제한 없음). 필터는 `TransactionFilterSheet`를 그대로 안 쓰고 정렬 섹션만 뺀 `ReceiptFilterSheet`로 새로 만들었다 — `sort` 쿼리 파라미터가 값과 무관하게 서버 `500`을 낸다(2026-09-05 실호출 확인, `services/receiptService.ts` 주석). 그리드 썸네일은 별도 축소본이 없어 원본 이미지를 그대로 쓴다(성능 우려, §5-4 참고). File.txt 본문이 이 화면을 `ETC-2-PAGE-06-0`으로 잘못 지칭하고 있음도 확인했다 — 그 ID는 실제로는 "보관함"(§2 다음 행)이라 오기로 보인다 |
| ☐ | `ETC-2-PAGE-06-0` | 보관함 | Page | 전체 | 완료 | 2장 | `[미구현]` | 서버 상태 "시작 전"(Folder.txt 8번)이라 착수 안 함. **2026-09-06 메모**: `billage-ia.md` 184~188행 확인 결과 "기록 보기"(보관함 항목 하나를 열어보는 화면 4개)가 `ETC-3-PAGE-03-0`/`ETC-4-PAGE-07-0`/`ETC-5-PAGE-02-0`/`ETC-4-PAGE-05-0`을 **그대로 재사용**한다 — 전부 이번 라운드(7-G, 보고서 조회 플로우)에서 이미 만들었다(`screens/Report/`). 서버가 보관함 API를 열면 목록(`ETC-2-PAGE-06-0`)과 항목→기존 화면 진입 연결만 하면 되고, "기록 보기" 4화면은 다시 안 만들어도 된다 — 단, `ETC-4-PAGE-05-0`/`07-0`/`ETC-5-PAGE-02-0`은 지금 영수증·메모 스냅샷 필드가 없어 `[부족함]`이니(위 §2 해당 행, `docs/backend-requests.md` 1순위) 보관함 쪽도 같은 제약을 그대로 물려받는다 |
| ☐ | `ETC-2-PAGE-07-0` | 통계/분석 | Page | 전체 | 완료 | 4장 | `[미구현]` |  |
| ☐ | `ETC-2-PAGE-09-0` | 더보기_설정 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/More/SettingScreen.tsx` — 계정 카드(→내 프로필)/알림 설정(→`NotificationSettingsScreen`)/고객 지원 및 정보(공지사항→`NoticeListScreen`, 문의하기→`InquiryScreen`, 약관 및 정책→`TermsScreen`, 앱 버전 정보는 이동 없이 `ToolsMenu` tag로 버전 표시) — **2026-09-06 배치 B로 4개 행 모두 연결 완료** |
| ☐ | `ETC-3-MODAL-01-0` | 모임 나가기(일반) | Modal | 일반 | 완료 | 2장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L223` |
| ☐ | `ETC-3-MODAL-01-1` | 모임 나가기(총무) | Modal | 일반 | 완료 | 2장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L232` |
| ☐ | `ETC-3-MODAL-02-0` | 모임 삭제하기 | Modal | 총무 | 완료 | 4장 | `[구현]` | `screens/GroupManager/GroupManageScreen.tsx` — 모임명 재입력 확인(시안 UI 요소 3번, 실시간 대조). **서버 `confirmName` 검사는 아직 `미구현`**(Group.txt §5, 2026-08-30 감사에서 명세만 추가됨)이라 클라이언트에서만 이름 일치를 막고 `DELETE /groups/{groupId}` 자체엔 body를 안 보낸다(`groupService.deleteGroup` 주석 참고) — 서버가 구현하면 body 추가할 것. **되돌릴 수 없는 삭제라 실호출로 검증하지 않았다** — 사용자 검증 필요. 성공 시 `AllGroupsScreen`(전체 모임 관리)으로 리셋 이동 + 스낵바(`ETC-4-SNACKBAR-04-0`, 신규 발견, 아래 §5-4 참고) |
| ☐ | `ETC-3-MODAL-03-0` | 보관함 기록 삭제 | Modal | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-MODAL-04-0` | 기록 제목 변경 | Modal | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-01-0` | 모임 프로필 변경 | Page | 전체 | 완료 | 7장 | `[부족함]` | `screens/GroupManager/GroupProfileEditScreen.tsx`. 모임명은 `PATCH /groups/{groupId}`(부분 갱신, 2026-09-06 실호출 확인 — `groupService.updateGroup` 주석 참고)로 저장된다. **이미지는 mock**: 갤러리/카메라가 전부 mock이라(`ReceiptGalleryPickerScreen`류와 같은 제약) 실제 fileId가 없어 `groupImageFileId`를 서버로 보내지 못한다 — 실제 업로드가 붙기 전까진 이미지 저장이 안 된다 |
| ☐ | `ETC-3-PAGE-02-0` | 장부별 보고서 상세(전체) | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/Report/ReportByLedgerDetailScreen.tsx` — 7-G(조회 플로우). `ReportMainScreen`의 장부별 탭 카드에서 진입. `GET /reports/{reportId}`를 다시 불러 조회(생성 응답 재사용 안 함). 장부 카드 탭 → `ETC-4-PAGE-05-0`(장부 상세) |
| ☐ | `ETC-3-PAGE-02-1` | 장부별 보고서 상세(수입/지출) | Page | 전체 | 완료 | 2장 | `[구현]` | **별도 화면 아님** — `ETC-3-PAGE-02-0`(장부별 보고서 상세)의 수입/지출 탭 상태(IA 165~172행 기준). 라우트를 따로 안 만들었다 — `ReportByLedgerDetailScreen.tsx` 참고 |
| ☐ | `ETC-3-PAGE-03-0` | 기간별 보고서 상세 / 기간별 보고서 상세(전체) | Page | 전체 | 완료 | 2장 | `[구현]` | `screens/Report/ReportByPeriodDetailScreen.tsx` — 7-G. 헤더 카드 탭 → `ETC-4-PAGE-07-0`(전체 통합 시간순), 장부 리스트 행(금액 없이 이름만) 탭 → `ETC-4-PAGE-05-0`(그 장부만 필터링). 시안 파일명 함정 주의: `더보기_보고서생성_기간보고서조회-1.png`가 이 화면이고, `-1` 없는 파일이 `ETC-4-PAGE-07-0`이다(§5-4 참고) |
| ☐ | `ETC-3-PAGE-03-1` | 기간별 보고서 상세(수입/지출) | Page | 전체 | 완료 | 2장 | `[구현]` | **별도 화면 아님** — `ETC-3-PAGE-03-0`(기간별 보고서 상세)의 탭 상태. `ReportByPeriodDetailScreen.tsx` 참고 |
| ☐ | `ETC-3-PAGE-04-0` | 증빙자료 상세 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/Receipt/ReceiptDetailScreen.tsx`. 단건 조회 API가 없어(목록 응답에만 필드가 있음) 앨범/검색 화면이 들고 있던 항목을 route params로 그대로 넘긴다. 핀치줌·더블탭·팬은 새 제스처 라이브러리 없이 `PanResponder`(RN 코어)로 직접 구현 — 이 프로젝트에 `react-native-gesture-handler` 등이 아직 없어서다. 공용 `AppBar`는 밝은 배경 전제라 이 화면(어두운 배경)만 커스텀 헤더를 그린다 |
| ☐ | `ETC-3-PAGE-05-0` | 증빙자료 검색 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/Receipt/ReceiptSearchScreen.tsx`. `keyword`(내역명·메모, Entry 7번과 같은 규칙) 검색, 7-A(모임원 검색)와 같은 이유로 300ms 디바운스를 얹었다. 빈 검색어 상태에선 조회하지 않는다(시안에 그 상태가 없고, 앨범 메인과 같은 목록을 또 부르는 낭비라 판단) |
| ☐ | `ETC-3-PAGE-07-0` | 내 프로필 | Page | 전체 | 완료 | 2장 | `[부족함]` | `screens/More/MyProfileScreen.tsx`. `loginProvider`가 `EMAIL`이 아니면 "비밀번호 변경" 행을 숨긴다(User.txt 정책). 로그아웃/회원탈퇴 버튼도 여기(시안 UI 요소 5번) — 로그아웃은 `MoreScreen.tsx`에서 옮겨왔고, 회원탈퇴는 대상 화면·API 둘 다 없어(COM 도메인, `미구현`) 버튼만 그리고 no-op. **시안엔 계정 정보 카드에 "전화번호"도 있지만 `GET /auth/me` 응답 스키마에 그 필드 자체가 없어(User.txt 1번) 표시 못 함** — `docs/backend-requests.md`에 기록 |
| ☐ | `ETC-3-PAGE-08-0` | 알림 설정_일반 / 알림 설정_총무 | Page | 일반/총무 | 완료 | 2장 | `[구현]` | `screens/More/NotificationSettingsScreen.tsx` — `GET/PATCH /notifications/settings`(서버 `미구현`) 그대로 호출. 시안은 별도 화면 2장이지만 API·데이터가 동일해 새 라우트를 만들지 않고 한 화면의 권한 분기(`viewerIsOwner`)로 구현 — 승인 요청/납부 관리 토글만 총무 화면에서 추가로 보인다. 역할 판정은 `getActiveGroup()?.myRole`(다른 화면들과 동일 캐시) 재사용 — **판단 필요**: 이 API는 명세상 모임과 무관한 사용자 단위 설정인데, 화면은 모임별로 다른 권한(총무/일반)을 전제한다. 사용자가 여러 모임에 속하고 그중 총무인 모임과 아닌 모임이 섞여 있으면 "지금 보고 있는 모임" 기준으로만 판정되므로, 모임을 바꿔서 다시 들어오면 같은 토글값인데 보이는 항목 수가 달라질 수 있다 — 기획 확인 필요(§5-4) |
| ☐ | `ETC-3-PAGE-09-0` | 공지사항 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/More/NoticeListScreen.tsx` — `GET /notices`(서버 `미구현`) 그대로 호출, 로딩/에러(재시도)/빈 상태 모두 구현 |
| ☐ | `ETC-3-PAGE-10-0` | 문의하기 | Page | 전체 | 진행 | 2장 | `[구현]` | `screens/More/InquiryScreen.tsx` — `GET /faqs`(서버 `미구현`)로 FAQ 아코디언(`components/Data Display/Accordion/Accordion.tsx` 재사용) + 읽기 전용 문의 메일 표시. **디자인 '진행' 중**이라 시안에 문의 작성 폼이 없다 — `POST /inquiries`(문의 접수)는 명세대로 `services/supportService.ts`에 만들어뒀지만 이 화면에서는 호출하지 않는다(폼이 나중에 추가되면 그대로 쓰면 됨), §5-4 기록 |
| ☐ | `ETC-3-PAGE-11-0` | 약관 및 개인정보 처리방침 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/More/TermsScreen.tsx`(목록) + `screens/More/TermDetailScreen.tsx`(상세, `GET /terms/{termType}` 서버 `미구현`). 명세의 "화면명세 내부 불일치"(가입 시 3종 vs 설정 목록 3종이 다름)를 시안대로 해결 — 서비스 이용 약관/개인정보 처리방침/**자동 기록 서비스 이용 약관** 3종(마케팅 제외). **Screen ID 미확인**: 이 시안 표의 Screen ID 칸이 빈 플레이스홀더("스크린아이디")였다 — 배치 지시서 매핑(`ETC-3-PAGE-11-0`)을 그대로 썼다, §5-4 확인 필요 |
| ☐ | `ETC-3-SHEET-01-0` | 모임 추가 | Bottom Sheet | 전체 | 완료 | 1장 | `[구현]` | `screens/GroupManager/AddGroupSheet.tsx` |
| ☐ | `ETC-3-SHEET-03-0` | 총무 프로필 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx` — 총무 프로필 |
| ☐ | `ETC-3-SHEET-04-0` | 일반 프로필 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx` — 일반 프로필 |
| ☐ | `ETC-3-SHEET-05-0` | 새 보고서 생성 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | `screens/Report/ReportCreateSheet.tsx` — 7-E. `MemberAddSheet` 패턴 그대로(아이콘+텍스트 2행, 각각 장부별/기간별 생성 폼으로 이동) |
| ☐ | `ETC-3-SHEET-06-0` | 증빙자료 필터링 | Bottom Sheet | 전체 | 완료 | 8장 | `[구현]` | `screens/Receipt/ReceiptFilterSheet.tsx` — 증빙자료 앨범 구현 라운드(7-C 후속)에서 만들었으나 이 표 갱신이 누락돼 있었다(2026-09-05 뒤늦게 반영). `TransactionFilterSheet`를 거의 그대로 옮기되 정렬 섹션만 뺐다(그 파일 주석 참고 — receipts API가 `sort` 파라미터에 `500`을 낸다) |
| ☐ | `ETC-3-SNACKBAR-01-0` | 초대 코드 복사완료 | Snackbar | - | 완료 | 1장 | `[구현]` | `screens/GroupManager/GroupManagerScreen.tsx` — 초대 코드 복사 완료 |
| ☐ | `ETC-4-MODAL-01-0` | 일반 전환하기 | Modal | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L205` — 일반 전환하기 |
| ☐ | `ETC-4-MODAL-02-0` | 총무 전환하기 | Modal | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L196` — 총무 전환하기 |
| ☐ | `ETC-4-MODAL-03-0` | 모임 내보내기 | Modal | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx`(confirmKind='kick') — **2026-09-06 실호출로 API 실재 확인**(`DELETE /groups/{groupId}/memberships/{membershipId}`, 204). 그동안 API 없음으로 보류해뒀던 메뉴 항목을 되살렸다 |
| ☐ | `ETC-4-MODAL-04-0` | 로그아웃 | Modal | 전체 | 완료 | 1장 | `[구현]` | `screens/More/MyProfileScreen.tsx` — 로그아웃 확인 Dialog. **2026-09-06 §5-4 해결**: 시안으로 확인된 실제 위치(내 프로필)로 옮겼다. `MoreScreen.tsx`엔 더 이상 없음 |
| ☐ | `ETC-4-PAGE-01-0` | 새 모임 생성 | Page | 전체 | 완료 | 3장 | `[구현]` | `screens/GroupManager/GroupCreateScreen.tsx` |
| ☐ | `ETC-4-PAGE-02-0` | 이미지 선택 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/GroupManager/GroupImagePickerScreen.tsx`. **Screen ID 충돌 주의**: ADD 도메인에 같은 ID의 다른 시안(다중 선택, 체크박스+"선택" 확인 버튼, `ReceiptGalleryPickerScreen.tsx`로 이미 구현됨)이 있다 — 이 화면은 그거와 달리 ETC/모임 관리 쪽 시안(단일 선택, 탭하면 즉시 선택, 확인 버튼 없음)이다. `design-index.json` 역검색으로 후보 4장 중 실제 파일(`ETC\모임 관리\`·`ETC\설정\` 두 경로, 바이트 동일)을 특정했다 — "글로벌 프로필 설정과 로직 100% 동일"이라는 시안 문구대로 모임 프로필/내 프로필(미구현) 공용으로 설계 |
| ☐ | `ETC-4-PAGE-03-0` | 장부별 보고서 생성 | Page | 총무 | 완료 | 3장 | `[구현]` | `screens/Report/ReportCreateByLedgerScreen.tsx` — 7-E. 제목/장부(다중 선택, `ReportLedgerSelectScreen` 왕복)/구분(`OutlinePill` 신설, 시안이 파란 테두리형이라 채워지는 `FilterPill`을 그대로 못 씀). 이탈 확인 Dialog + 안드로이드 `BackHandler` 둘 다 적용(`DuesCreateScreen` 패턴). `entryType:"ALL"` 금지(2026-09-05 실호출 확인) — "전체"는 필드 생략으로 표현 |
| ☐ | `ETC-4-PAGE-04-0` | 기간별 보고서 생성 | Page | 총무 | 완료 | 2장 | `[구현]` | `screens/Report/ReportCreateByPeriodScreen.tsx` — 7-E. 제목/기간(`DuesDateRangeSheet` 재사용, `DTB-3-SHEET-01-0`)/구분(`OutlinePill`). 이탈 확인 Dialog + `BackHandler` 동일 적용. 폼 필드 기간 표기는 시안 예시("YY.MM.DD ~", 2자리)가 아니라 `DuesCreateScreen`과 같은 "YYYY.MM.DD -"(4자리)로 통일 — 의도적 판단, 시트 안 미리보기만 2자리(design-diff.md 기록) |
| ☐ | `ETC-4-PAGE-05-0` | 보고서_장부 상세 / 보고서_장부 상세(전체) | Page | 전체/총무 | 완료 | 13장 | `[부족함]` | `screens/Report/ReportLedgerEntriesScreen.tsx` — 7-G. **2026-09-06 등급 하향**: 시안 UI 요소 6번이 리스트 행에 "영수증 첨부 아이콘"을 명시하는데(`[데이터] 개별 내역 데이터: 내역명, 금액, 영수증 첨부 아이콘`) `GET /reports/{reportId}` 응답의 `entries`(스냅샷)엔 `receiptCount`/`receipts` 자체가 없어(실호출 확인) 아이콘을 못 그린다 — `docs/backend-requests.md` 1순위 항목 참고. 그 외(장부별·기간별 공용, 탭+일자별 리스트)는 구현됨. **장부별·기간별 양쪽에서 재사용되는 단일 컴포넌트**(사용자 지시대로 하나만 만듦). 단건 조회 API가 없어 부모 화면이 이미 받은 데이터를 route params로 그대로 전달. `-1`로 끝나는 시안 변형(수입/지출 탭 상태)은 별도 화면이 아니라 이 화면의 탭 상태라 라우트를 안 만들었다 |
| ☐ | `ETC-4-PAGE-05-1` | 보고서_장부 상세(수입/지출) | Page | 전체 | 완료 | 4장 | `[구현]` | **별도 화면 아님** — `ETC-4-PAGE-05-0`(보고서_장부 상세)의 수입/지출 탭 상태. `ReportEntryList.tsx`의 탭으로 구현됨 |
| ☐ | `ETC-4-PAGE-07-0` | 보고서_시간순 / 보고서_시간순(전체) | Page | 전체/총무 | 완료 | 4장 | `[부족함]` | `screens/Report/ReportPeriodEntriesScreen.tsx` — 7-G. **2026-09-06 등급 하향**: `ETC-4-PAGE-05-0`과 같은 UI 요소(6번, 리스트 행 영수증 아이콘)를 공유하는 화면이라 같은 이유로 미완이다 — 스냅샷에 `receiptCount` 없음, `docs/backend-requests.md` 1순위 참고. 캐러셀(Card1 수입/지출, Card2 시작/최종잔액)은 새 라이브러리 없이 `ScrollView horizontal pagingEnabled` + `CarouselIndicator`(`LedgerDetailScreen` 패턴 재사용). 이 화면의 시안 파일(`더보기_보고서생성_기간보고서조회.png`)이 표 헤더에 `ETC-4-PAGE-05-0`으로 잘못 적혀 있다 — 실제 내용(캐러셀+장부명 태그된 통합 리스트)은 IA 171행 기준 07-0이라 그대로 구현, §5-4에 기획 확인 항목으로 남김 |
| ☐ | `ETC-4-PAGE-07-1` | 보고서_시간순(수입/지출) | Page | 전체 | 완료 | 2장 | `[구현]` | **별도 화면 아님** — `ETC-4-PAGE-07-0`(보고서_시간순)의 수입/지출 탭 상태. `ReportEntryList.tsx`의 탭으로 구현됨 |
| ☐ | `ETC-4-PAGE-15-0` | 프로필 변경 | Page | 전체 | 완료 | 3장 | `[부족함]` | `screens/More/ProfileEditScreen.tsx`. 닉네임은 `PATCH /auth/me`(서버 "진행 중", `authService.updateMyProfile` 참고)로 저장. 이미지: 갤러리/카메라가 mock이라(`GroupProfileEditScreen.tsx`와 동일 제약) 촬영/앨범선택은 저장에 반영 안 됨 — "기본 프로필로 변경하기"만 `profileImageFileId: null`로 실제 동작. 사진 변경 진입은 아바타 탭 → 바텀시트(`ETC-4-SHEET-02-0`, 아래 행) → 그리드(`ETC-4-PAGE-02-0`, `GroupImagePickerScreen` 재사용) |
| ☐ | `ETC-4-SHEET-02-0` | 프로필 변경_사진 변경 | Bottom Sheet | 전체 | 완료 | 2장 | `[구현]` | `screens/More/ProfileEditScreen.tsx`(imageMenuVisible). **Screen ID 주의**: 시안 파일명은 `글로벌설정_내프로필_프로필변경-1.png`(마치 `ETC-4-PAGE-15-0`의 변형처럼 보임)이지만 표 헤더를 직접 확인하니 별개 ID `ETC-4-SHEET-02-0`였다 — §5-2에 이미 "IA엔 없는 ID"로 걸려 있던 것을 이번에 실제로 매핑했다. "기본 프로필로 변경하기" 항목은 커스텀 이미지가 있을 때만 조건부 노출 |
| ☐ | `ETC-4-PAGE-17-0` | 비밀번호 변경 | Page | 전체 | 완료 | 6장 | `[부족함]` | `screens/More/PasswordChangeScreen.tsx`. `PATCH /auth/password` 서버 `미구현`(Auth.txt 10번) — 명세대로 실제 호출만 만들어뒀다. 현재/새/새 확인 3필드, 새 비밀번호 형식(`utils/validators.isValidPassword` 재사용)·확인 일치 실시간 검사, `INVALID_CREDENTIALS`는 시안 문구("현재 비밀번호와 일치하지 않아요...") 그대로 현재 비밀번호 필드에 표시 |
| ☐ | `ETC-4-PAGE-18-0` | 공지사항 상세 | Page | 전체 | 완료 | 1장 | `[부족함]` | `screens/More/NoticeDetailScreen.tsx` — `GET /notices/{noticeId}`(서버 `미구현`) 그대로 호출. **시안 UI 요소 3번(본문 내 URL/이메일 자동 하이퍼링크)은 미구현** — RN 기본 `Text`는 Android에서 부분 텍스트 자동 링크화 수단이 없어(iOS `dataDetectorType`만 존재) 이번 배치에서 새 라이브러리를 들이지 않고 평문으로 뒀다, §5-4 기록 |
| ☐ | `ETC-4-SHEET-01-0` | 모임 참여 | Bottom Sheet | 전체 | 완료 | 3장 | `[구현]` | `screens/GroupManager/JoinGroupSheet.tsx` |
| ☐ | `ETC-4-SNACKBAR-01-0` | 보관함 기록 삭제 완료 | Snackbar | 총무 | 예정 | 1장 | `[미구현]` |  |
| ☐ | `ETC-4-SNACKBAR-02-0` | 기록 제목 변경 완료 | Snackbar | 총무 | 예정 | 1장 | `[미구현]` |  |
| ☐ | `ETC-4-SNACKBAR-04-0` | 모임 삭제 완료 | Snackbar | 총무 | 완료 | 1장 | `[구현]` | **2026-09-06 신규 발견** — `billage-ia.md`엔 이 ID가 없다(모임 삭제하기 시안 파일 안에 "Case A" 스낵바로 임베드돼 있었음). `screens/GroupManager/AllGroupsScreen.tsx`가 `route.params.snackbarMessage`로 받아 렌더링(발신은 `GroupManageScreen.tsx`) |
| ☐ | `ETC-5-MODAL-01-0` | 보고서_이탈방지 | Page | 총무 | 예정 | 1장 | `[미구현]` |  |
| ☐ | `ETC-5-PAGE-01-0` | 보고서_장부 선택 | Page | 총무 | 완료 | 2장 | `[구현]` | `screens/Report/ReportLedgerSelectScreen.tsx` — 7-E. `folderService.getFolderItems()`(`GET .../folder-items`, `folderId` 파라미터로 뎁스인)로 폴더+장부 혼합 3열 그리드 조회, 폴더 탭=뎁스인/장부 탭=다중 선택 토글. 하위 폴더 안에서 뒤로가기는 명세에 없는 동작이라(시안에 하위 진입 캡처 없음) 표준 폴더탐색기처럼 한 단계만 올라가게 판단(design-diff.md 기록), 최상위에서만 화면 이탈 |
| ☐ | `ETC-5-PAGE-02-0` | 보고서_내역 상세 | Page | 전체/총무 | 완료 | 7장 | `[부족함]` | `screens/Report/ReportEntryDetailScreen.tsx` — 7-G. **2026-09-06 등급 하향**: 시안 UI 요소 6번 액션이 이 화면의 존재 이유를 "유저는 개별 거래 건의 **영수증 원본과 상세 메모까지 끝까지 추적 및 조회**할 수 있음"이라고 명시하는데, `GET /reports/{reportId}` 스냅샷엔 `memo`도 `receipts`도 없어(실호출 확인) 그 핵심 기능이 통째로 빠졌다 — 지금은 구분/금액/발생일/내역명/장부명만 보여주는 반쪽 화면이다. `docs/backend-requests.md` 1순위 항목 참고. **`TransactionDetailScreen`을 재사용하지 않은 이유는 별개**(entryId가 없어 그 화면 구조 자체를 못 붙임, 스냅샷 정책과도 안 맞음) |
| ☐ | `ETC-5-SNACKBAR-01-0` | 권한 변경 완료 | Snackbar | - | 예정 | 2장 | `[확인필요]` | `screens/GroupManager/GroupManagerScreen.tsx` — 권한 변경 완료 |
| ☐ | `ETC-5-SNACKBAR-02-0` | 모임 내보내기 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | `screens/GroupManager/GroupManagerScreen.tsx` — 렌더링은 여기, 메시지 조합은 `MemberProfileSheet.tsx`(kick). `ETC-4-MODAL-03-0`과 같이 재개 |
| ☐ | `ETC-5-SNACKBAR-03-0` | 모임 참여 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | `screens/GroupManager/AllGroupsScreen.tsx` — 코드 참여 성공 후(`JoinGroupSheet.onJoined`) 표시, 1.6초 뒤 이전 화면으로 복귀 |
| ☐ | `ETC-5-SNACKBAR-04-0` | 모임 생성 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | `screens/GroupManager/GroupCreateScreen.tsx L78` — 모임 생성 완료 |
| ☐ | `ETC-5-SNACKBAR-05-0` | 모임 전환 완료 | Snackbar | - | 예정 | **0장** | `[구현]` | `screens/More/MoreScreen.tsx`(`GroupSwitcherMenu.onSelectGroup`) — **시안 이미지 0장**, 다른 완료 스낵바(모임 삭제 완료 등)의 "'{이름}' 모임을 OO했어요." 패턴을 따라 문구를 만들었다(§5-4 기록) |
| ☐ | `ETC-5-SNACKBAR-06-0` | 프로필 변경 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | `screens/More/MyProfileScreen.tsx` — route.params.snackbarMessage로 전달받아 렌더링(발신은 `ProfileEditScreen.tsx`). **시안 이미지 0장 아니었음**: `ETC-4-PAGE-15-0` 스펙 시트 안에 "Case A"로 임베드돼 있었는데 Screen ID가 `COM-1-SNACKBAR-02-0`으로 잘못 적혀 있어(§5-1/§5-2 참고) 이전 조사에서 0장으로 집계됐다. 문구("변경 사항이 저장되었어요.") 확인 반영 |
| ☐ | `ETC-5-SNACKBAR-07-0` | 비밀번호 변경 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | `screens/More/MyProfileScreen.tsx` — route.params.snackbarMessage로 전달받아 렌더링(발신은 `PasswordChangeScreen.tsx`) |
| ☐ | `ETC-5-SNACKBAR-08-0` | 보고서_생성완료 | Modal | 총무 | 예정 | 1장 | `[미구현]` |  |

### ADD — FAB — 내역 추가

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `ADD-1-PAGE-01-0` | 내역 추가 | Page | - | 완료 | 5장 | `[구현]` | `screens/Transactions/TransactionRegisterScreen.tsx` — 상세: [design-diff.md#add-1-page-01-0-내역-추가](design-diff.md#add-1-page-01-0-내역-추가) |
| ☐ | `ADD-2-MODAL-01-0` | 이탈 방지 모달 | Modal | - | 완료 | 1장 | `[부족함]` | `screens/Transactions/TransactionRegisterScreen.tsx L480` — 시각적으로는 디자인과 일치하나, `BackHandler` 미등록으로 안드로이드 하드웨어/시스템 back 버튼으로는 이 모달이 아예 안 뜨고 확인 없이 나가짐. 상세: [design-diff.md#add-2-modal-01-0-이탈-방지-모달](design-diff.md#add-2-modal-01-0-이탈-방지-모달) |
| ☐ | `ADD-2-SHEET-01-0` | 내역명 입력 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionTextInputSheet.tsx` — 내역명 입력. 상세: [design-diff.md#add-2-sheet-01-0-내역명-입력](design-diff.md#add-2-sheet-01-0-내역명-입력) |
| ☐ | `ADD-2-SHEET-02-0` | 담당자 선택 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionSingleSelectSheet.tsx` — 담당자 선택. 상세: [design-diff.md#add-2-sheet-02-0-담당자-선택](design-diff.md#add-2-sheet-02-0-담당자-선택) |
| ☐ | `ADD-2-SHEET-03-0` | 장부 단일 선택 | Bottom Sheet | 총무 | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionSingleSelectSheet.tsx` — 장부 단일 선택. 상세: [design-diff.md#add-2-sheet-03-0-장부-단일-선택](design-diff.md#add-2-sheet-03-0-장부-단일-선택) |
| ☐ | `ADD-2-SHEET-04-0` | 메모 입력 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionTextInputSheet.tsx` — 메모 입력. 상세: [design-diff.md#add-2-sheet-04-0-메모-입력](design-diff.md#add-2-sheet-04-0-메모-입력) (캡처 상태 불일치로 레이아웃 재확인 필요) |
| ☐ | `ADD-2-SHEET-05-0` | 증빙자료 등록 | Bottom Sheet | - | 완료 | 2장 | `[구현]` | `screens/Transactions/TransactionAttachMenuSheet.tsx` — 상세: [design-diff.md#add-2-sheet-05-0-증빙자료-등록](design-diff.md#add-2-sheet-05-0-증빙자료-등록) |
| ☐ | `ADD-2-SHEET-06-0` | 금액 입력 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionAmountSheet.tsx` — 상세: [design-diff.md#add-2-sheet-06-0-금액-입력](design-diff.md#add-2-sheet-06-0-금액-입력) |
| ☐ | `ADD-2-SHEET-07-0` | 일자 선택 캘린더 | Bottom Sheet | - | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionDateSheet.tsx` — 실제 구현 정상, 디자인 원본 파일이 더미 데이터(요일 헤더 전부 "일", 날짜 셀 전부 "0")라 원본 재확보 필요. 상세: [design-diff.md#add-2-sheet-07-0-일자-선택-캘린더](design-diff.md#add-2-sheet-07-0-일자-선택-캘린더) |
| ☐ | `ADD-2-SNACKBAR-01-0` | 내역 추가 완료 | Snackbar | - | 완료 | 1장 | `[구현]` | 4-A부터 실 등록(신규 내역은 전부 실 API로 감)은 `TransactionRegisterScreen.tsx` 자체가 완료 즉시 스낵바를 띄운다(승인 상태에 따라 문구 2종 — 0-2 참고, `SNACKBAR_TRANSACTION_ADDED`/`_PENDING`). **4-B 정리(2026-09-05)**: `TransactionsScreen.tsx`의 `addedTransactionId` 경유 스낵바는 그걸 만들던 `editMock` 경로가 삭제되며 죽은 코드가 되어 같이 제거됨 — 이제 이 스낵바는 `TransactionRegisterScreen.tsx` 하나뿐이다. 상세: [design-diff.md#add-2-snackbar-01-0-내역-추가-완료](design-diff.md#add-2-snackbar-01-0-내역-추가-완료) (재캡처는 사용자 몫) |
| ☐ | `ADD-3-PAGE-01-0` | 영수증 스캔 | Page | - | 완료 | 2장 | `[구현]` | `screens/Transactions/ReceiptScanningView.tsx` — 상세: [design-diff.md#add-3-page-01-0-영수증-스캔](design-diff.md#add-3-page-01-0-영수증-스캔) (Mock이라 실제 카메라 프리뷰 없음, 기존에 알려진 제약) |
| ☐ | `ADD-3-PAGE-02-0` | 사진 촬영 | Page | - | 완료 | **0장** | `[부족함]` | `screens/Transactions/MockCameraView.tsx` — Mock 구현. 이미지 0장 — 디자인 확보 필요. 상세: [design-diff.md#add-3-page-02-0-사진-촬영-디자인-없음](design-diff.md#add-3-page-02-0-사진-촬영-디자인-없음) |
| ☐ | `ADD-4-PAGE-01-0` | 영수증 스캔 성공 | Page | - | 완료 | 1장 | `[확인필요]` | `screens/Transactions/TransactionRegisterScreen.tsx` — 스캔 성공 → 필드 반영 (utils/mockOcr.ts 사용중). 상세: [design-diff.md#add-4-page-01-0-영수증-스캔-성공](design-diff.md#add-4-page-01-0-영수증-스캔-성공) (금액 자동 반영 타이밍이 디자인과 달라 기획 확인 필요) |
| ☐ | `ADD-4-PAGE-01-1` | 영수증 스캔 실패 | Page | - | 진행 | 1장 | `[구현]` | `screens/Transactions/ReceiptScanFailedView.tsx` — 디자인 '진행' 중. 상세: [design-diff.md#add-4-page-01-1-영수증-스캔-실패](design-diff.md#add-4-page-01-1-영수증-스캔-실패) |
| ☐ | `ADD-4-PAGE-02-0` | 사진 촬영 결과 | Page | - | 검토 | **0장** | `[미구현]` | 사진 촬영 결과 (디자인 '검토', 이미지 0장) |
| ☐ | `ADD-4-SNACKBAR-01-0` | 이미지 첨부 제한 | Snackbar | - | 완료 | 1장 | `[구현]` | `screens/Transactions/ReceiptGalleryPickerScreen.tsx` — 이미지 첨부 10장 제한 안내. 상세: [design-diff.md#add-4-snackbar-01-0-이미지-첨부-제한](design-diff.md#add-4-snackbar-01-0-이미지-첨부-제한) (픽셀 대조로 확인필요 해소, 차이 없음) |
| ☐ | `ADD-5-MODAL-01-0` | 스캔 내용 반영 확인 모달 | Modal | - | 완료 | 1장 | `[구현]` | `screens/Transactions/TransactionRegisterScreen.tsx L498` — 상세: [design-diff.md#add-5-modal-01-0-스캔-내용-반영-확인-모달](design-diff.md#add-5-modal-01-0-스캔-내용-반영-확인-모달) |

## 3. 디자인 토큰 대조

### 3-1. 색상 — `Color_Definition.pdf` vs `src/constants/colors.ts`

**전부 일치.** 코드에 정의된 팔레트 22개 값이 PDF의 Primitive Color와 100% 같다.

- `src/constants/colors.ts` L1-2 주석이 *"color.pdf 기준 … 스와치 눈대중 근사치"*라고 되어 있으나, 최신 `Color_Definition.pdf` 기준으로 재검증한 결과 근사치가 아니라 **정확한 값**이다. 이 주석은 오해를 부르므로 지우거나 `Color_Definition.pdf 기준 확정값`으로 고칠 것.
- `GREY_700`과 `GREY_800`이 둘 다 `#374151`인 것은 **코드 실수가 아니라 PDF 원본이 그렇다**. 디자이너에게 오탈자인지 확인 필요.
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

DUE(회비) 14개가 대부분이다. 회비 도메인은 IA 28개 중 절반이 이미지 없이 정의만 있는 상태.

**정정(6-A, 2026-09-01)**: 아래 목록 중 `DUE-1-PAGE-01-0`/`DUE-2-PAGE-03-0`/`DUE-2-PAGE-03-1` 3개는 실제로는 이미지가 있다 — `design-index.json`이 스캔하는 폴더가 아니라 `화면명세서\DUE\` 안의 스펙 시트에 시안이 임베드돼 있어서 이 조사 때 놓쳤다. 나머지 DUE 화면(6-B/6-C 대상)도 같은 폴더를 다시 확인하면 이미지가 있을 가능성이 있다 — 이번엔 이 3개만 실제로 열어봤다.

**정정(8-A, 2026-09-06)**: `ETC-5-SNACKBAR-06-0`(프로필 변경 완료)도 같은 이유로 실제로는 이미지가 있다 — `글로벌설정_내프로필_프로필변경.png`(ETC-4-PAGE-15-0) 스펙 시트 안에 "Case A" 스낵바로 임베드돼 있는데, **정작 그 안에서 Screen ID가 `COM-1-SNACKBAR-02-0`으로 잘못 적혀 있다**(§5-2 참고 — 이 ID가 완전히 다른 도메인 3곳에 더 재사용되고 있어 스펙 문서 전반에 퍼진 복붙 실수로 보인다). 문구("변경 사항이 저장되었어요.")는 확인해 반영했다.

`DSH-2-PAGE-03-0` `DSH-2-PAGE-05-0` `DTB-2-PAGE-03-0` `DTB-3-MODAL-02-0` `DTB-3-PAGE-02-0` `DTB-4-MODAL-01-0` `FDR-3-MODAL-05-0` `FDR-3-PAGE-03-0` ~~`DUE-1-PAGE-01-0`~~ ~~`DUE-2-PAGE-01-0`~~ ~~`DUE-2-PAGE-03-0`~~ ~~`DUE-2-PAGE-03-1`~~ `DUE-3-MODAL-01-0` `DUE-3-MODAL-02-0` `DUE-3-PAGE-02-0` `DUE-3-PAGE-04-0` `DUE-3-PAGE-06-0` `DUE-3-SNACKBAR-01-0` `DUE-3-SNACKBAR-02-0` `DUE-4-MODAL-02-0` `DUE-4-SNACKBAR-01-0` `DUE-4-SNACKBAR-02-0` `DUE-4-SNACKBAR-03-0` `DUE-4-SNACKBAR-04-0` `ETC-5-SNACKBAR-05-0` ~~`ETC-5-SNACKBAR-06-0`~~ `ADD-3-PAGE-02-0` `ADD-4-PAGE-02-0`

### 5-2. 이미지는 있는데 IA에 없는 Screen ID — 25개

FDR이 대부분이다. IA(V0.4)가 최신 디자인을 못 따라온 것으로 보인다.

**정정(8-A, 2026-09-06)**: `ETC-4-SHEET-02-0`은 이제 매핑됐다 — "프로필 변경_사진 변경"(촬영/앨범선택/기본프로필 3항목 바텀시트), `ProfileEditScreen.tsx`에서 구현. `COM-1-SNACKBAR-02-0`은 여전히 IA에 없는 채로 남아 있다 — 위 §5-1 정정에서 확인했듯 실제로는 "프로필 변경 완료"(`ETC-5-SNACKBAR-06-0`)의 오기라 이 ID 자체로는 화면을 만들지 않았다. 같은 ID가 `DUE\모임원관리\`·`DUE\회비상세정보\`(2곳)·`ETC\모임 관리\`에도 붙어 있어(design-index.json 확인) 스펙 문서 전반에서 재사용된 복붙 실수로 보인다 — 그 각 위치의 실제 스낵바 문구를 다시 볼 때 이 오기를 감안할 것.

`COM-1-SNACKBAR-01-0` `COM-1-SNACKBAR-02-0` `COM-3-PAGE-01-1` `COM-3-PAGE-01-2` `ETC-3-SHEET-07-0` ~~`ETC-4-SHEET-02-0`~~ `ETC-4-SHEET-02-1` `ETC-7-PAGE-01-0` `FDR-1-PAGE-01-1` `FDR-2-MODAL-01-1` `FDR-2-MODAL-02-1` `FDR-2-MODAL-03-0` `FDR-2-MODAL-03-1` `FDR-2-PAGE-02-1` `FDR-3-MODAL-01-1` `FDR-3-PAGE-02-1` `FDR-3-PAGE-02-3` `FDR-3-PAGE-04-0` `FDR-3-PAGE-05-0` `FDR-3-SHEET-01-1` `FDR-4-PAGE-03-0~03-3` `FDR-4-SNACKBAR-04-0`

### 5-3. 기타

- `DTB-2-PAGE-02-0`(상세 내역_조회): IA의 Design 상태는 `예정`인데 이미지가 6장 있다. 어느 쪽이 최신인지 확인 필요. `FDR-3-SHEET-03-0`도 같은 상황(예정 / 이미지 5장).
- `FDR-2-MODAL-01-0`과 `FDR-3-MODAL-05-0`이 둘 다 "새 폴더 생성"이다. 진입 경로만 다른 같은 모달인지 확인 필요.
- `DUE-5-SNACKBAR-01-0`의 Format이 `Snackbar`가 아니라 `Page`, `ETC-5-MODAL-01-0`은 `Page`, `ETC-5-SNACKBAR-08-0`은 `Modal`로 되어 있다. IA 입력 오류로 보인다.
- **`DUE-5-SNACKBAR-03-0`(모임원 개별 추가 완료)**: `DUE-3-PAGE-01-0`(6-B에서 발견)과 같은 패턴 — 화면명세서(`모임원추가_개별추가.png` Case C)엔 이 ID로 정의돼 있지만 `billage-ia.md` 201개 화면 목록엔 아예 없다. IA 누락으로 보인다. 구현은 `MemberAddIndividualScreen.tsx`에 포함(7-A).
- `CLAUDE.md`가 *"현재 구현된 것은 로그인·회원가입 온보딩 플로우뿐"*이라고 되어 있으나 실제로는 대시보드·내역·폴더·모임 관리까지 구현돼 있다. **문서가 낡았다.**

### 5-4. 기획팀 확인 필요 항목

스크린샷 대조를 시작하기 전에 답이 있어야 진행이 되는 것들이다.

- **`더보기_보고서생성_기간보고서조회.png`(파일명에 `-1` 없음) 표 헤더의 Screen ID가 `ETC-4-PAGE-05-0`으로 적혀 있음 — 오기로 추정(2026-09-06, 7-G)**: 이 파일 내용(캐러셀 2장 + 장부명 태그가 붙은 통합 내역 리스트)은 `ETC-4-PAGE-05-0`(장부 하나만 보여주는 단일 카드 화면, `-1.png` 없는 `더보기_보고서생성_장부보고서조회.png`가 이 ID)과 명백히 다르고, IA 171행이 정의하는 "보고서_시간순"(캐러셀 + "조회 기간 전체 내역")과 정확히 일치한다. 파일명 자체(`-1` 유무)도 함정이다 — 기간별 조회 두 파일 중 **`-1`이 붙은 쪽이 목록(`ETC-3-PAGE-03-0`), 안 붙은 쪽이 통합 상세(`ETC-4-PAGE-07-0`)**로 시안 내용과 반대다. 코드는 IA 정의(07-0)를 기준으로 구현했다(`ReportPeriodEntriesScreen.tsx`). 물어볼 것: **표 헤더의 ID 표기를 07-0으로 정정할지, 아니면 실제로 05-0의 상태 변형을 의도한 것인지**(후자라면 07-0 화면 자체가 시안 없이 구현된 것이 됨).
- **`ETC-3-PAGE-02-1`/`03-1`/`ETC-4-PAGE-05-1`/`07-1`(보고서 조회 4화면의 "-1" 변형) — 별도 화면 아님으로 판단(2026-09-06, 7-G)**: IA 165~172행 기준 이 넷은 각각 `-0` 화면의 "수입/지출 탭이 선택된 상태" 캡처로 보여 별도 라우트를 만들지 않고 `ReportEntryList.tsx`의 탭 상태로 흡수했다(§2 각 행 [구현] 처리). 다만 `ETC-3-PAGE-02-0`(장부별 보고서 상세, 장부 카드 리스트) 자체엔 탭이 없어서 `02-1`이 정말 그 화면 얘기가 맞는지 확신이 낮다 — 물어볼 것: **`ETC-3-PAGE-02-1`이 `02-0`의 탭 상태가 맞는지, 아니면 `ETC-4-PAGE-05-0`(탭이 실제로 있는 화면)의 오기인지.**
- ~~**`ETC-2-PAGE-02-0`(모임 관리)**: 대응 코드가 없음을 확인했다...~~ **2026-09-06 해결됨** — 오기가 아니라 실제로 빠져 있던 화면이었다. `design-index.json`에 `ETC-2-PAGE-02-0.png`가 `ETC-2-PAGE-03-0.png`와 별개 파일로 존재하고, 삭제 시안의 배경 화면도 "< 모임 관리"라는 독립 페이지 경로로 등장해 실재를 확인했다 — `screens/GroupManager/GroupManageScreen.tsx`로 채웠다(§2 `ETC-2-PAGE-02-0` 행 참고). 단, `DUE-2-PAGE-02-0`(모임원 **명단** 관리 — 납부 로스터, `Member` 엔티티)은 이 화면과는 별개 기능이라 그대로 `GroupManagerScreen`의 기존 "모임원 관리" 행(`MemberManage` 라우트)에 남아 있다 — 두 "모임원 관리" 라벨이 다른 엔티티(GroupMembership 권한 로스터 vs Member 납부 로스터)를 가리키는 이름 중복은 미해결로 남겨둔다(이번 라운드 범위 밖, `feat/member-management` 브랜치 소관으로 보임).
- ~~**`ETC-4-MODAL-04-0`(로그아웃)**: 시안상 원래 위치는...~~ **2026-09-06 해결됨(8-A)** — 설정 허브(`ETC-2-PAGE-09-0`)와 내 프로필(`ETC-3-PAGE-07-0`)을 만들면서 시안으로 실제 위치(내 프로필 하단)를 확인해 `MoreScreen.tsx`에서 `MyProfileScreen.tsx`로 옮겼다.
- **`FDR-3-SHEET-01-0`(장부 예산 입력) / `FDR-3-SHEET-02-0`(예산 설정)**: 코드상 `FolderBudgetListScreen.tsx`에 예산 입력용 BottomSheet가 하나뿐이라 두 ID를 같은 시트로 판단해 매핑했으나 확신이 낮다. 두 ID가 실제로 다른 시트(예: 최초 입력 vs 수정)로 구분되어야 하는지 기획 확인이 필요하다.
- **시안 없음 — 로딩/에러/빈 목록 상태**(`ETC-2-PAGE-01-0`, `ETC-4-PAGE-01-0`, `ETC-4-SHEET-01-0`, `ETC-1-PAGE-01-0`): API 연동 1단계(Group)에서 확인. 목 데이터 시절엔 항상 즉시 채워진 상태만 존재해 화면 시안도 그 상태만 있다. 네트워크 로딩 중/실패/모임이 아예 없는 상태의 디자인이 없어 임의로 최소 형태(중앙 정렬 텍스트 + 재시도 버튼)로 통일해 구현했다 — 표준 패턴은 `api-integration-plan.md` "표준 패턴" 절 참고. 다른 12개 도메인도 같은 패턴을 쓸 예정이라, 스피너/일러스트 사용 여부를 기획팀이 정해주면 한 번에 교체 가능하다.
- **`ADD-2-SHEET-07-0`(일자 선택 캘린더)**: 디자인 원본 파일이 더미 데이터다(요일 헤더 7칸 전부 "일", 날짜 셀 전부 "0"). 물어볼 것: **이 화면의 정상 디자인 원본 파일을 다시 받을 수 있는가** — 지금 파일로는 요일 헤더 구성이나 날짜 그리드 스타일을 대조할 수 없다.
- **`ADD-4-SNACKBAR-01-0`(이미지 첨부 제한)**: 디자인 이미지 헤더 문구가 "4 선택"인데 실제 체크된 사진은 9~10장으로 안 맞는다(실제 구현은 숫자가 정확히 일치해 정상). 물어볼 것: **디자인 쪽 "4 선택" 표기가 목업 작성 시 오기인지, 아니면 다른 상태(4장만 선택된 상태)를 의도적으로 보여준 것인지** — 오기라면 원본만 정정하면 되고 실제 구현은 손댈 필요 없다.
- **`DTB-3-MODAL-01-0`(상세 내역_삭제)**: 디자인 이미지를 열어보면 삭제 확인 다이얼로그가 아니라 "상세 내역" 타이틀에 본문이 빈 화면 + "등록하기" 버튼만 있다. 물어볼 것: **이 파일이 정말 `DTB-3-MODAL-01-0`(상세 내역 삭제 확인 모달)이 맞는지, 아니면 다른 Screen ID의 파일이 잘못 파일링된 것인지** — 파일명 자체는 맞게 붙어 있어서 대조 코드가 아니라 원본 배치 실수를 의심할 근거가 있다.
- **`ADD-4-PAGE-01-0`(영수증 스캔 성공)**: 실제 구현은 스캔 성공 즉시 금액 필드가 자동으로 채워지는데(예: "232,000원"), 디자인 이미지는 이 시점에서도 금액이 placeholder("금액을 입력해주세요")로 비어 있다. 물어볼 것: **스캔 직후 금액을 즉시 자동 반영하는 게 의도인지, 아니면 사용자가 한 번 더 확인/승인하는 별도 단계가 있어야 하는지** — 현재 구현(즉시 반영)이 기획 의도와 다르면 `TransactionRegisterScreen.tsx`의 스캔 성공 핸들러를 고쳐야 한다.
- **`DUE-2-PAGE-01-0`(회비 생성) "기간" 필드 — 2026-09-04 실호출로 확정, 기획 확인 불필요해짐**: 화면명세서가 요구하던 시작일이 `POST /groups/{groupId}/dues`의 `startDate` 필수 필드로 명세에 추가됐고, 실호출로 서버가 실제로 이를 강제함을 확인했다(없으면 `400`, `fieldErrors:[{field:"startDate",reason:"시작일은 필수입니다."}]`). "필요 없는 값"이 아니라 "이제 정말 만들어야 하는 값"으로 최종 판명 — `DuesCreateScreen.tsx`에 기간 범위 입력을 복원하고 `startDate`를 같이 보내야 한다(`docs/api-gaps.md` "확정됨" 절, `docs/api-integration-plan.md` (a) 1순위).
- **`납부관리_회비상세_수정_기간선택.png`(회비 수정의 기간 선택 시트) — Screen ID `DTB-3-SHEET-02-0`로 표기됨, 오기로 추정(2026-09-05, 7-B-1)**: IA상 `DTB-3-SHEET-02-0`은 "장부 복수 선택"(`TransactionLedgerMultiSelectSheet.tsx`, 위 §2 행 참고)이라 이 회비 수정 기간 선택 시트와 전혀 다른 화면이다. 같은 명세서 안에서 회비 **생성**의 기간 선택(`납부관리_메인_새회비생성_기간선택.png`)은 `DTB-3-SHEET-01-0`(기간 선택 캘린더)로 올바르게 붙어 있어 — 수정 쪽 파일만 복사하며 01을 02로 잘못 고친 것으로 보인다. 코드는 생성과 동일하게 `DuesDateRangeSheet`(기존 컴포넌트 재사용, `DTB-3-SHEET-01-0`과 같은 기능)로 구현했다. 물어볼 것: **회비 수정의 기간 선택 시트도 `DTB-3-SHEET-01-0`(생성과 동일 ID)로 통일할지, 아니면 정말 별도 ID를 새로 배정할지** — 후자라면 `DTB-3-SHEET-02-0`(장부 복수 선택)과 겹치니 새 번호가 필요하다.
- **`DUE-4-MODAL-01-0`(모임원 삭제) 안내 문구가 삭제 범위를 오해하게 만들 수 있음(2026-09-05, 7-C)**: 시안 문구는 "기존 납부 내역은 그대로 유지돼요."인데, 이는 Member.txt §8 정책 메모("이미 마감된 회비로 생성된 **장부 수입 내역**은 지우지 않는다")에 한정된 이야기다. 실제로는 삭제 시 그 모임원의 **진행 중인 회비 참여 데이터가 Hard Delete**된다(§5·§8 본문). 문구만 보면 "삭제해도 납부 기록이 안전하다"로 읽혀 실제 동작과 반대 인상을 줄 수 있다. 물어볼 것: **이 문구를 의도적으로 단순화한 것인지, 아니면 진행 중인 회비 데이터도 함께 삭제된다는 경고를 추가해야 하는지** — 프론트는 일단 시안 문구를 그대로 구현했다(`MemberDetailScreen.tsx`/`MemberManageScreen.tsx`).
- **`DUE-4-PAGE-04-0`(개인 납부 내역)의 필터/검색 툴바, `DUE-5-PAGE-02-0`(같은 화면의 검색)(2026-09-05, 7-C)**: 시안은 장부 상세와 "완전히 동일하게 동작"하는 필터/검색 UI가 있다고 적었지만, 실제 API(`GET .../members/{memberId}/payments`)는 `from`/`to` 기간 파라미터만 받고 `keyword`나 장부 필터는 받지 않는다(2026-09-05 실호출로 확인). 물어볼 것: **이 화면에 기간 필터 UI가 실제로 필요한지, 필요하다면 키워드·장부 필터도 서버에 추가해야 하는지** — 현재는 필터/검색 UI 자체를 만들지 않고 전체 목록만 보여준다.
- **`ETC-2-PAGE-05-0`(증빙자료 앨범) 그리드 썸네일이 원본 이미지 그대로임(2026-09-05, 7-C 후속)**: `GET .../receipts` 응답엔 축소본 URL이 따로 없다 — File.txt "이미지 압축은 하지 않습니다" 정책대로 업로드 시점에 리사이즈를 안 해서다. 그리드 한 화면에 최대 20장(페이지당)씩 원본 화질 이미지를 그대로 내려받아 렌더링하므로, 증빙 사진이 고화질일수록(특히 카메라 직촬영) 스크롤 시 느려지거나 데이터를 많이 쓸 수 있다. 물어볼 것: **업로드 시점에 썸네일용 축소본을 별도로 생성해 `receipts` 응답에 같이 내려줄 수 있는지** — 서버 작업이 필요해 기획보다는 백엔드 판단이 먼저 필요한 항목이라 `docs/backend-requests.md`에도 남겼다.
- **`ETC-5-SNACKBAR-05-0`(모임 전환 완료) — 시안 이미지 0장(2026-09-06, 7-H)**: `billage-ia.md`엔 있으나 디자인 원본이 아예 없다. 다른 완료 스낵바("'{이름}' 모임을 삭제했어요." 등)의 프리픽스+서픽스 패턴을 따라 "'{모임명}' 모임으로 전환했어요."로 임의 구현했다(`MoreScreen.tsx`, `GroupSwitcherMenu.onSelectGroup`). 물어볼 것: **이 문구/디자인이 실제 기획 의도와 맞는지** — 원본이 생기면 교체.
- **알림·고객지원(Notification & Support) 도메인 자체가 범위 미확정(2026-09-06, 배치 B)**: `Notification & Support (알림·고객지원).txt` 첫 줄부터 "범위 판단이 먼저 필요합니다" — `docs/infra.md`는 푸시 서버를 런칭 범위 밖으로 뒀는데 이 화면들(알림 목록·알림 설정)은 전부 푸시 전제다. 물어볼 것: **알림 도메인(푸시 포함)을 런칭 범위에 넣을지** — 빠지면 `NotificationSettingsScreen`/`NotificationScreen` 자체가 필요 없어진다.
- **공지사항·FAQ·약관을 백오피스 없이 어떻게 채울지(2026-09-06, 배치 B)**: 명세가 "공지사항/FAQ/약관 등록은 백오피스에서 한다"고 전제하는데 백오피스가 없다. 명세 자체가 제안한 대안(약관·공지는 정적 파일, 문의하기는 메일 링크)을 채택할지 기획 확인 필요 — 채택 시 `supportService.ts`의 `getNotices`/`getFaqs`/`getTermsText`를 서버 호출 대신 정적 리소스로 바꿔야 한다.
- **알림 설정 화면의 "일반/총무 2종"이 사용자 단위 API와 안 맞음(2026-09-06, `ETC-3-PAGE-08-0`)**: 위 §2 해당 행 참고 — 토글은 모임과 무관한 사용자 단위 설정인데 화면은 모임별 권한(총무/일반)으로 나뉜다. 지금은 "현재 보고 있는 모임"(`getActiveGroup()?.myRole`) 기준으로 임시 판정했다. 물어볼 것: **여러 모임에 걸쳐 총무/일반이 섞인 사용자에게 어느 기준으로 보여줄지**(예: "하나라도 총무면 총무 화면" 등 전역 규칙이 필요한지).
- **문의하기(`ETC-3-PAGE-10-0`) 디자인 미확정 + 명세와 화면 불일치(2026-09-06)**: 디자인 현황이 '진행' 중이라 시안엔 문의 작성 폼이 아예 없고 FAQ + 읽기 전용 메일 표시만 있다. 그런데 API 명세엔 `POST /inquiries`(email/title/content 폼 제출)가 정의돼 있다. 물어볼 것: **최종 디자인에 입력 폼이 추가될 예정인지, 아니면 문의는 정말 메일로만 받을지** — 폼이 생기면 `supportService.submitInquiry`를 그대로 연결하면 된다.
- **약관 목록(`ETC-3-PAGE-11-0`) 시안의 Screen ID 칸이 비어 있음(2026-09-06)**: `글로벌설정_고객및지원정보_이용약관.png` 표 헤더의 Screen ID가 "스크린아이디" 플레이스홀더 그대로였다(다른 4개 시안은 정상 기입돼 있었음). 배치 지시서가 준 매핑(`ETC-3-PAGE-11-0`)을 그대로 썼다 — 물어볼 것: **이 ID가 맞는지, 혹은 다른 화면과 충돌하는 실제 ID가 따로 있는지.**
- **공지사항 상세(`ETC-4-PAGE-18-0`) 본문 자동 하이퍼링크 미구현(2026-09-06)**: 시안은 본문 내 URL/이메일을 터치 가능한 링크로 활성화하라고 하지만, RN 기본 `Text`는 Android에서 부분 텍스트만 자동 링크화하는 표준 수단이 없다(iOS `dataDetectorType`만 존재하고 Android 대응 prop이 없음). 이번 배치에서 새 라이브러리(예: 정규식 파싱 후 `Linking.openURL` 수동 연결, 또는 서드파티 링크 파서)를 들이지 않고 평문으로 뒀다 — 실제로 필요해지면 별도 작업으로 붙여야 한다.
- **D-2에서 "상태 불명"으로 남은 16개** (`DTB-2-SHEET-01-0`, `DTB-3-SHEET-01-0`, `DTB-2-PAGE-02-0`, `DTB-3-MODAL-01-0`[위 항목과 동일], `FDR-2-SHEET-01-0`, `FDR-2-PAGE-02-0`, `FDR-4-SNACKBAR-03-0`, `FDR-4-SNACKBAR-02-0`, `ETC-3-MODAL-01-0`, `ETC-3-MODAL-01-1`, `ADD-1-PAGE-01-0`, `ADD-2-SHEET-07-0`[위 항목과 동일], `ADD-2-SHEET-01-0`, `ADD-2-SHEET-02-0`, `ADD-2-SHEET-03-0`, `ADD-2-SHEET-04-0`): 같은 Screen ID에 디자인 후보 이미지가 2~9장씩 걸려 있는데(대부분 서로 다른 폴더에 중복 배치돼 있어) 어느 게 이 ID의 "진짜" 대표 이미지인지, 혹은 정말 여러 상태(빈 값/입력중/에러 등) 변형인지 사전에 못 정했다. 물어볼 것: **각 Screen ID의 디자인 후보 파일들이 상태 변형인지 단순 중복 배치인지, 상태 변형이라면 어느 파일이 화면의 "기본" 상태를 대표하는지** — `scripts/design-index.json`의 해당 항목에서 후보 경로 전부 확인 가능.

## 6. 권장 순서

1. **`TYPOGRAPHY`에 `letterSpacing` 15개 추가** (§3-2) — 스크린샷 대조 전에 해야 전 화면 오탐을 막는다.
2. **`colors.ts` 주석 정정**, `CLAUDE.md` 현행화 (§3-1, §5-3)
3. **화면 파일에 `@screen` 주석 심기** (§4-1) — 이후 검증이 자동화된다.
4. **`[부족함]` 12건 처리** — 대부분 화면은 있고 연결만 빠진 것이라 비용 대비 효과가 크다. 특히 `COM-5-PAGE-01-0`(가입 완료 → 모임 생성/참여)은 대상 화면이 이미 있어서 연결만 하면 된다. 보고서 조회 3건(`ETC-4-PAGE-05-0`/`07-0`/`ETC-5-PAGE-02-0`)은 서버가 스냅샷에 영수증·메모를 추가해줘야 풀린다(`docs/backend-requests.md` 1순위) — 화면 쪽에서 더 할 게 없다.
5. **스크린샷 캡처 & 대조** (§4) — `[구현]` 93개부터
6. **`[미구현]` 41건 백로그화** — 2026-09-06 재집계 기준 ETC(더보기 — 알림/고객지원/통계/설정/탈퇴 등) 27개가 최대 덩어리다. DUE(회비)는 6-A~7-C에서 대부분 구현돼 더 이상 최대 덩어리가 아니다(§1 참고) — 남은 3건만 남았다.
