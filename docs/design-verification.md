# Billage 디자인 ↔ 구현 검증 체크리스트

> 자동 생성 초안. `Billage_IA.xlsx`(V0.4, 201행/고유 Screen ID 159개)와 디자인 이미지 파일명, `src/` 코드를 대조한 결과다.

> 상태는 코드 정적 분석 기준이며, `[확인필요]`와 픽셀 단위 차이는 스크린샷 대조(§4) 후 확정한다.


## 1. 요약

| 상태 | 개수 | 의미 |
|---|---:|---|
| `[구현]` | 51 | 대응 화면이 있고 눈에 띄는 누락 없음 (픽셀 대조 미완) |
| `[부족함]` | 11 | 화면은 있으나 요소·연결·API가 빠짐 |
| `[확인필요]` | 14 | 대응 후보는 있으나 실제 일치 여부 미확정 |
| `[미구현]` | 83 | 대응 화면 없음 |
| **합계** | **159** | IA 고유 Screen ID |

### 도메인별

| 영역 | 전체 | 구현 | 부족함 | 확인필요 | 미구현 |
|---|---:|---:|---:|---:|---:|
| COM — Common — 로그인/회원가입/탈퇴 | 13 | 5 | 4 | 0 | 4 |
| DSH — 대시보드 | 4 | 0 | 2 | 1 | 1 |
| DTB — 내역(거래) | 12 | 7 | 2 | 0 | 3 |
| FDR — 폴더/장부 | 24 | 12 | 0 | 10 | 2 |
| DUE — 납부 관리(회비) | 28 | 0 | 0 | 0 | 28 |
| ETC — 더보기 — 모임/보고서/증빙앨범/설정 | 61 | 14 | 1 | 2 | 44 |
| ADD — FAB — 내역 추가 | 17 | 13 | 2 | 1 | 1 |

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
| ☐ | `DSH-2-PAGE-01-0` | 알림 목록 | Page | 전체 | 예정 | 1장 | `[부족함]` | `screens/Notification/NotificationScreen.tsx` — L27 TODO: 알림 설정(ETC-3-PAGE-08-0) 미연결. 상세: [design-diff.md#dsh-2-page-01-0-알림-목록](design-diff.md#dsh-2-page-01-0-알림-목록) (픽셀 대조는 차이 없음) |
| ☐ | `DSH-2-PAGE-03-0` | 대시보드 캘린더 | Page | 총무 | 예정 | **0장** | `[확인필요]` | `screens/Calendar/CalendarScreen.tsx` — 디자인 '예정' + 이미지 0장. L81 TODO: 일별 보기 IA 미정의 → 기획 확인 선행. 상세: [design-diff.md#dsh-2-page-03-0-대시보드-캘린더-디자인-없음](design-diff.md#dsh-2-page-03-0-대시보드-캘린더-디자인-없음) |
| ☐ | `DSH-2-PAGE-05-0` | 통계 및 분석 | Page | 총무 | 진행 | **0장** | `[미구현]` | 통계 및 분석 (이미지 0장, 디자인 진행중) |

### DTB — 내역(거래)

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `DTB-1-PAGE-01-0` | 내역 메인 | Page | 총무 | 완료 | 5장 | `[구현]` | `screens/Transactions/TransactionsScreen.tsx` — 상세: [design-diff.md#dtb-1-page-01-0-내역-메인](design-diff.md#dtb-1-page-01-0-내역-메인) |
| ☐ | `DTB-2-PAGE-01-0` | 내역 검색_전체 | Page | 전체 | 완료 | 4장 | `[구현]` | `screens/Transactions/TransactionSearchScreen.tsx` |
| ☐ | `DTB-2-PAGE-02-0` | 상세 내역_조회 | Page | 전체 | 예정 | 6장 | `[구현]` | `screens/Folder/TransactionDetailScreen.tsx` — 4-A에서 수정 아이콘 연결 완료(아래 DTB-3-PAGE-02-0 참고). 디자인 상태 '예정'인데 이미지는 6장 존재 → 어느 쪽이 최신인지 확인 필요(미해결) |
| ☐ | `DTB-2-PAGE-03-0` | 상세 내역_승인요청 | Page | 총무 | 완료 | **0장** | `[미구현]` | 상세 내역_승인요청 (승인/수정 버튼) — 탭 필터만 있고 승인 상세 화면 없음 |
| ☐ | `DTB-2-SHEET-01-0` | 내역 필터링 | Bottom Sheet | 전체 | 완료 | 6장 | `[구현]` | `screens/Transactions/TransactionFilterSheet.tsx` |
| ☐ | `DTB-3-MODAL-01-0` | 상세 내역_삭제 | Modal | 전체 | 완료 | 1장 | `[구현]` | `screens/Folder/TransactionDetailScreen.tsx L152` |
| ☐ | `DTB-3-MODAL-02-0` | 증빙자료 삭제 | Modal | - | 완료 | **0장** | `[미구현]` | 증빙자료 삭제 모달 |
| ☐ | `DTB-3-PAGE-01-0` | 증빙자료 상세 | Page | 전체 | 완료 | 1장 | `[미구현]` | 증빙자료 상세 조회 |
| ☐ | `DTB-3-PAGE-02-0` | 상세 내역_수정 | Page | 전체 | 완료 | **0장** | `[구현]` | `screens/Transactions/TransactionRegisterScreen.tsx` — **4-A(Entry API 연동)에서 연결 완료.** 막혔던 원인(`types/folder`의 `tx-N`과 `types/transaction`의 `dtb-tx-N` 두 소스가 서로 다른 id 네임스페이스라 프리필이 조용히 실패하던 문제)이 `types/folder`가 통째로 삭제되고 그 자리를 실 Entry API가 대체하며 해소됐다. 이제 `TransactionDetailScreen`/`TransactionRegisterScreen` 둘 다 id 모양(숫자=실 Entry, `dtb-tx-N`=DTB 전체 목록 목 데이터)으로 두 경로를 구분해 처리한다 — 실 Entry는 `entryService.getEntryDetail()`로 비동기 프리필, DTB 목은 기존 `getTransactionById()`로 동기 프리필. 코드로 프리필 매핑 확인함(아래 "보고" 참고), 실기기 재확인은 사용자 몫. |
| ☐ | `DTB-3-SHEET-01-0` | 기간 선택 캘린더 | Bottom Sheet | 전체/총무 | 완료 | 10장 | `[구현]` | `screens/Transactions/TransactionFilterSheet.tsx` — 내부 중첩 BottomSheet(커스텀 기간용). `TransactionDateSheet.tsx`는 `ADD-2-SHEET-07-0`(일자 선택) 전용이라 무관함을 확인 |
| ☐ | `DTB-3-SHEET-02-0` | 장부 복수 선택 | Bottom Sheet | 전체 | 완료 | 2장 | `[구현]` | `screens/Transactions/TransactionLedgerMultiSelectSheet.tsx` |
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
| ☐ | `FDR-3-MODAL-02-0` | 폴더 해제 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | `screens/Folder/FolderScreen.tsx dialogConfig` — 폴더 해제 |
| ☐ | `FDR-3-MODAL-03-0` | 장부 이름 변경 | Modal | 총무 | 완료 | 2장 | `[확인필요]` | `screens/Folder/LedgerDetailScreen.tsx L262` — 장부 이름 변경 |
| ☐ | `FDR-3-MODAL-04-0` | 장부 삭제 | Modal | 총무 | 완료 | 1장 | `[확인필요]` | `screens/Folder/LedgerDetailScreen.tsx L262` — 장부 삭제 |
| ☐ | `FDR-3-MODAL-05-0` | 새 폴더 생성 | Modal | 총무 | 완료 | **0장** | `[확인필요]` | `screens/Folder/FolderScreen.tsx` — FDR-2-MODAL-01-0과 중복 ID — 기획 확인 필요 |
| ☐ | `FDR-3-PAGE-01-0` | 이동 경로 선택 (그리드 뷰) / 이동 경로 선택 (리스트 뷰) | Page | 전체 | 완료 | 2장 | `[구현]` | `screens/Folder/FolderMoveDestinationScreen.tsx` |
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
| ☐ | `DUE-1-PAGE-01-0` | 납부 관리 메인 | Page | 전체 | 완료 | 1장(화면명세서 임베드) | `[구현]` | `screens/Dues/DuesScreen.tsx` — 6-A(조회 전용). §5-1 "이미지 없음" 표기는 부정확 — `화면명세서\DUE\납부관리_메인.png`에 시안이 임베드돼 있다(design-index.json이 스캔하는 폴더가 아니라 놓쳤던 것으로 보임) |
| ☐ | `DUE-2-PAGE-01-0` | 회비 생성 | Page | 총무 | 완료 | 1장(화면명세서 임베드) | `[구현]` | `screens/Dues/DuesCreateScreen.tsx`(step='basic') — 6-B. "기간" 필수 입력을 "마감일" 단일 입력으로 축소함(§5-4, docs/api-gaps.md (A) "회비 시작일 필드 부재" 참고) |
| ☐ | `DUE-3-PAGE-01-0` | 새 회비 생성_모임원 선택 | Page | 총무 | 완료 | 1장(화면명세서 임베드) | `[구현]` | `screens/Dues/DuesCreateScreen.tsx`(step='members') — 6-B. **IA(`billage-ia.md`) 원본 201개 화면 목록에 이 ID 자체가 없다** — 화면명세서에만 정의돼 있음(IA 누락으로 보임). 모임원 0명 빈 상태는 화면명세서 Case A에 명시돼 있어("모임원을 추가해보세요.") 그대로 구현함 |
| ☐ | `DUE-2-PAGE-02-0` | 모임원 관리 | Page | 전체 | 완료 | 6장 | `[미구현]` |  |
| ☐ | `DUE-2-PAGE-03-0` | 회비 항목 상세 / 회비 항목 상세 (미납부) | Page | 전체/총무 | 진행 | 1장(화면명세서 임베드) | `[구현]` | `screens/Dues/DuesDetailScreen.tsx` — 6-A(조회 전용). 진행 중 상태(기본 탭 '미납부'). §5-1 "이미지 없음" 표기는 부정확(위 DUE-1-PAGE-01-0과 동일 사유) |
| ☐ | `DUE-2-PAGE-03-1` | 회비 항복 상세 (납부완료) — 실제로는 "마감된 회비"/"예정된 회비" 두 상태 변형 | Page | - | 완료 | 2장(화면명세서 임베드, 상태별 1장씩) | `[구현]` | `screens/Dues/DuesDetailScreen.tsx` — 같은 파일이 `status`/`paidCount`로 세 상태(진행중=DUE-2-PAGE-03-0, 마감된 회비, 예정된 회비)를 전부 분기 처리한다. IA 페이지명 "회비 항복 상세 (납부완료)"는 오타로 보임(정확히는 "마감된 회비"/"예정된 회비" 두 변형) — 명세서 파일명·내용 모두 이 두 상태를 가리키지 "납부완료"라는 별도 상태는 없다 |
| ☐ | `DUE-3-MODAL-01-0` | 회비 삭제 | Modal | 총무 | 완료 | **0장** | `[미구현]` |  |
| ☐ | `DUE-3-MODAL-02-0` | 회비 마감 | Modal | 총무 | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-3-PAGE-02-0` | 모임원 선택 | Page | 총무 | 완료 | **0장** | `[미구현]` |  |
| ☐ | `DUE-3-PAGE-03-0` | 모임원 상세 | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `DUE-3-PAGE-04-0` | 회비 요청 작성 | Page | 총무 | 완료 | **0장** | `[미구현]` |  |
| ☐ | `DUE-3-PAGE-06-0` | 회비 수정 | Page | 총무 | 완료 | **0장** | `[미구현]` |  |
| ☐ | `DUE-3-SHEET-02-0` | 모임원 추가 선택 | Bottom Sheet | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `DUE-3-SNACKBAR-01-0` | 입금 확인 | Snackbar | - | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-3-SNACKBAR-02-0` | 입금 취소 | Snackbar | - | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-4-MODAL-01-0` | 모임원 삭제 | Modal | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `DUE-4-MODAL-02-0` | 회비수정_이탈 | Modal | 총무 | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-4-PAGE-01-0` | 모임원 추가_개별 | Page | 전체 | 완료 | 3장 | `[미구현]` |  |
| ☐ | `DUE-4-PAGE-02-0` | 모임원 추가_일괄 | Page | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `DUE-4-PAGE-03-0` | 모임원 수정 | Page | 전체 | 완료 | 3장 | `[미구현]` |  |
| ☐ | `DUE-4-PAGE-04-0` | 개인 납부 내역 | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `DUE-4-SNACKBAR-01-0` | 회비 생성 완료 | Snackbar | 총무 | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-4-SNACKBAR-02-0` | 회비 마감 완료 | Snackbar | 총무 | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-4-SNACKBAR-03-0` | 회비 삭제 완료 | Snackbar | 총무 | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-4-SNACKBAR-04-0` | 회비 수정 완료 | Snackbar | 총무 | 예정 | **0장** | `[미구현]` |  |
| ☐ | `DUE-5-PAGE-01-0` | 태그 입력 | Page | - | 완료 | 3장 | `[미구현]` |  |
| ☐ | `DUE-5-PAGE-02-0` | 개인 납부 내역_검색 | Page | 전체 | 완료 | 3장 | `[미구현]` |  |
| ☐ | `DUE-5-SNACKBAR-01-0` | 모임원 추가_일괄 완료 | Page | - | 완료 | 1장 | `[미구현]` |  |
| ☐ | `DUE-5-SNACKBAR-02-0` | 모임원 삭제 완료 | Snackbar | - | 예정 | 2장 | `[미구현]` |  |

### ETC — 더보기 — 모임/보고서/증빙앨범/설정

| ☐ | Screen ID | 화면명 | 형식 | 권한 | 디자인 | 이미지 | 상태 | 코드 위치 / 비고 |
|---|---|---|---|---|---|---:|---|---|
| ☐ | `ETC-1-PAGE-01-0` | 더보기 메인 | Page | 전체 | 완료 | 2장 | `[부족함]` | `screens/MoreScreen.tsx` — 상세: [design-diff.md#etc-1-page-01-0-더보기-메인](design-diff.md#etc-1-page-01-0-더보기-메인) (모임 관리만 연결됨, 보고서 생성/증빙자료 앨범/소비 통계·분석/보관함 4개는 L112·118·124·130 여전히 빈 핸들러 + 레이아웃/아이콘 차이) |
| ☐ | `ETC-2-PAGE-01-0` | 전체 모임 관리 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/GroupManager/AllGroupsScreen.tsx` |
| ☐ | `ETC-2-PAGE-02-0` | 모임 관리 | Page | 전체 | 완료 | 1장 | `[미구현]` | 더보기의 '모임 관리' 메뉴는 중간 화면 없이 GroupManagerScreen(`ETC-2-PAGE-03-0`)으로 직행. IA상 별개 화면인지 오기인지 기획 확인 필요 |
| ☐ | `ETC-2-PAGE-03-0` | 모임 관리자 | Page | 전체 | 완료 | 1장 | `[구현]` | `screens/GroupManager/GroupManagerScreen.tsx` |
| ☐ | `ETC-2-PAGE-04-0` | 보고서 리스트 | Page | 전체/총무 | 진행 | 4장 | `[미구현]` |  |
| ☐ | `ETC-2-PAGE-05-0` | 증빙자료 앨범 | Page | 전체/총무 | 진행 | 3장 | `[미구현]` |  |
| ☐ | `ETC-2-PAGE-06-0` | 보관함 | Page | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-2-PAGE-07-0` | 통계/분석 | Page | 전체 | 완료 | 4장 | `[미구현]` |  |
| ☐ | `ETC-2-PAGE-09-0` | 더보기_설정 | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-MODAL-01-0` | 모임 나가기(일반) | Modal | 일반 | 완료 | 2장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L223` |
| ☐ | `ETC-3-MODAL-01-1` | 모임 나가기(총무) | Modal | 일반 | 완료 | 2장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L232` |
| ☐ | `ETC-3-MODAL-02-0` | 모임 삭제하기 | Modal | 총무 | 완료 | 4장 | `[미구현]` |  |
| ☐ | `ETC-3-MODAL-03-0` | 보관함 기록 삭제 | Modal | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-MODAL-04-0` | 기록 제목 변경 | Modal | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-01-0` | 모임 프로필 변경 | Page | 전체 | 완료 | 7장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-02-0` | 장부별 보고서 상세(전체) | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-02-1` | 장부별 보고서 상세(수입/지출) | Page | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-03-0` | 기간별 보고서 상세 / 기간별 보고서 상세(전체) | Page | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-03-1` | 기간별 보고서 상세(수입/지출) | Page | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-04-0` | 증빙자료 상세 | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-05-0` | 증빙자료 검색 | Page | 전체 | 완료 | 4장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-07-0` | 내 프로필 | Page | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-08-0` | 알림 설정_일반 / 알림 설정_총무 | Page | 일반/총무 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-09-0` | 공지사항 | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-10-0` | 문의하기 | Page | 전체 | 진행 | 2장 | `[미구현]` |  |
| ☐ | `ETC-3-PAGE-11-0` | 약관 및 개인정보 처리방침 | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-SHEET-01-0` | 모임 추가 | Bottom Sheet | 전체 | 완료 | 1장 | `[구현]` | `screens/GroupManager/AddGroupSheet.tsx` |
| ☐ | `ETC-3-SHEET-03-0` | 총무 프로필 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx` — 총무 프로필 |
| ☐ | `ETC-3-SHEET-04-0` | 일반 프로필 | Bottom Sheet | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx` — 일반 프로필 |
| ☐ | `ETC-3-SHEET-05-0` | 새 보고서 생성 | Bottom Sheet | 총무 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-3-SHEET-06-0` | 증빙자료 필터링 | Bottom Sheet | 전체 | 완료 | 8장 | `[미구현]` |  |
| ☐ | `ETC-3-SNACKBAR-01-0` | 초대 코드 복사완료 | Snackbar | - | 완료 | 1장 | `[구현]` | `screens/GroupManager/GroupManagerScreen.tsx` — 초대 코드 복사 완료 |
| ☐ | `ETC-4-MODAL-01-0` | 일반 전환하기 | Modal | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L205` — 일반 전환하기 |
| ☐ | `ETC-4-MODAL-02-0` | 총무 전환하기 | Modal | 총무 | 완료 | 1장 | `[구현]` | `screens/GroupManager/MemberProfileSheet.tsx L196` — 총무 전환하기 |
| ☐ | `ETC-4-MODAL-03-0` | 모임 내보내기 | Modal | 총무 | 완료 | 1장 | `[구현→보류]` | 2단계(GroupMembership)에서 API 미제공으로 보류 — `GroupMembership` 명세에 총무가 남을 내보내는 엔드포인트가 없음(`docs/api-gaps.md` (A)). `MemberProfileSheet.tsx` 상단 주석에 남겨두고 메뉴 항목 자체를 렌더링하지 않음. 엔드포인트 생기면 되살릴 것 |
| ☐ | `ETC-4-MODAL-04-0` | 로그아웃 | Modal | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-01-0` | 새 모임 생성 | Page | 전체 | 완료 | 3장 | `[구현]` | `screens/GroupManager/GroupCreateScreen.tsx` |
| ☐ | `ETC-4-PAGE-02-0` | 이미지 선택 | Page | 전체 | 완료 | 4장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-03-0` | 장부별 보고서 생성 | Page | 총무 | 완료 | 3장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-04-0` | 기간별 보고서 생성 | Page | 총무 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-05-0` | 보고서_장부 상세 / 보고서_장부 상세(전체) | Page | 전체/총무 | 완료 | 13장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-05-1` | 보고서_장부 상세(수입/지출) | Page | 전체 | 완료 | 4장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-07-0` | 보고서_시간순 / 보고서_시간순(전체) | Page | 전체/총무 | 완료 | 4장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-07-1` | 보고서_시간순(수입/지출) | Page | 전체 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-15-0` | 프로필 변경 | Page | 전체 | 완료 | 3장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-17-0` | 비밀번호 변경 | Page | 전체 | 완료 | 6장 | `[미구현]` |  |
| ☐ | `ETC-4-PAGE-18-0` | 공지사항 상세 | Page | 전체 | 완료 | 1장 | `[미구현]` |  |
| ☐ | `ETC-4-SHEET-01-0` | 모임 참여 | Bottom Sheet | 전체 | 완료 | 3장 | `[구현]` | `screens/GroupManager/JoinGroupSheet.tsx` |
| ☐ | `ETC-4-SNACKBAR-01-0` | 보관함 기록 삭제 완료 | Snackbar | 총무 | 예정 | 1장 | `[미구현]` |  |
| ☐ | `ETC-4-SNACKBAR-02-0` | 기록 제목 변경 완료 | Snackbar | 총무 | 예정 | 1장 | `[미구현]` |  |
| ☐ | `ETC-5-MODAL-01-0` | 보고서_이탈방지 | Page | 총무 | 예정 | 1장 | `[미구현]` |  |
| ☐ | `ETC-5-PAGE-01-0` | 보고서_장부 선택 | Page | 총무 | 완료 | 2장 | `[미구현]` |  |
| ☐ | `ETC-5-PAGE-02-0` | 보고서_내역 상세 | Page | 전체/총무 | 완료 | 7장 | `[미구현]` |  |
| ☐ | `ETC-5-SNACKBAR-01-0` | 권한 변경 완료 | Snackbar | - | 예정 | 2장 | `[확인필요]` | `screens/GroupManager/GroupManagerScreen.tsx` — 권한 변경 완료 |
| ☐ | `ETC-5-SNACKBAR-02-0` | 모임 내보내기 완료 | Snackbar | - | 예정 | 1장 | `[보류]` | `ETC-4-MODAL-03-0`(모임 내보내기) 자체가 API 미제공으로 보류돼 이 스낵바도 같이 보류 |
| ☐ | `ETC-5-SNACKBAR-03-0` | 모임 참여 완료 | Snackbar | - | 예정 | 1장 | `[미구현]` |  |
| ☐ | `ETC-5-SNACKBAR-04-0` | 모임 생성 완료 | Snackbar | - | 예정 | 1장 | `[구현]` | `screens/GroupManager/GroupCreateScreen.tsx L78` — 모임 생성 완료 |
| ☐ | `ETC-5-SNACKBAR-05-0` | 모임 전환 완료 | Snackbar | - | 예정 | **0장** | `[미구현]` |  |
| ☐ | `ETC-5-SNACKBAR-06-0` | 프로필 변경 완료 | Snackbar | - | 예정 | **0장** | `[미구현]` |  |
| ☐ | `ETC-5-SNACKBAR-07-0` | 비밀번호 변경 완료 | Snackbar | - | 예정 | 1장 | `[미구현]` |  |
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
| ☐ | `ADD-2-SNACKBAR-01-0` | 내역 추가 완료 | Snackbar | - | 완료 | 1장 | `[구현]` | 4-A부터 실 등록(신규 내역은 전부 실 API로 감)은 `TransactionRegisterScreen.tsx` 자체가 완료 즉시 스낵바를 띄운다(승인 상태에 따라 문구 2종 — 0-2 참고, `SNACKBAR_TRANSACTION_ADDED`/`_PENDING`). `screens/Transactions/TransactionsScreen.tsx L237`의 `addedTransactionId` 경유 스낵바는 DTB 목 데이터 수정(`editMock`) 경로에서만 여전히 쓰인다. 상세: [design-diff.md#add-2-snackbar-01-0-내역-추가-완료](design-diff.md#add-2-snackbar-01-0-내역-추가-완료) (재캡처는 사용자 몫) |
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

`DSH-2-PAGE-03-0` `DSH-2-PAGE-05-0` `DTB-2-PAGE-03-0` `DTB-3-MODAL-02-0` `DTB-3-PAGE-02-0` `DTB-4-MODAL-01-0` `FDR-3-MODAL-05-0` `FDR-3-PAGE-03-0` ~~`DUE-1-PAGE-01-0`~~ ~~`DUE-2-PAGE-01-0`~~ ~~`DUE-2-PAGE-03-0`~~ ~~`DUE-2-PAGE-03-1`~~ `DUE-3-MODAL-01-0` `DUE-3-MODAL-02-0` `DUE-3-PAGE-02-0` `DUE-3-PAGE-04-0` `DUE-3-PAGE-06-0` `DUE-3-SNACKBAR-01-0` `DUE-3-SNACKBAR-02-0` `DUE-4-MODAL-02-0` `DUE-4-SNACKBAR-01-0` `DUE-4-SNACKBAR-02-0` `DUE-4-SNACKBAR-03-0` `DUE-4-SNACKBAR-04-0` `ETC-5-SNACKBAR-05-0` `ETC-5-SNACKBAR-06-0` `ADD-3-PAGE-02-0` `ADD-4-PAGE-02-0`

### 5-2. 이미지는 있는데 IA에 없는 Screen ID — 25개

FDR이 대부분이다. IA(V0.4)가 최신 디자인을 못 따라온 것으로 보인다.

`COM-1-SNACKBAR-01-0` `COM-1-SNACKBAR-02-0` `COM-3-PAGE-01-1` `COM-3-PAGE-01-2` `ETC-3-SHEET-07-0` `ETC-4-SHEET-02-0` `ETC-4-SHEET-02-1` `ETC-7-PAGE-01-0` `FDR-1-PAGE-01-1` `FDR-2-MODAL-01-1` `FDR-2-MODAL-02-1` `FDR-2-MODAL-03-0` `FDR-2-MODAL-03-1` `FDR-2-PAGE-02-1` `FDR-3-MODAL-01-1` `FDR-3-PAGE-02-1` `FDR-3-PAGE-02-3` `FDR-3-PAGE-04-0` `FDR-3-PAGE-05-0` `FDR-3-SHEET-01-1` `FDR-4-PAGE-03-0~03-3` `FDR-4-SNACKBAR-04-0`

### 5-3. 기타

- `DTB-2-PAGE-02-0`(상세 내역_조회): IA의 Design 상태는 `예정`인데 이미지가 6장 있다. 어느 쪽이 최신인지 확인 필요. `FDR-3-SHEET-03-0`도 같은 상황(예정 / 이미지 5장).
- `FDR-2-MODAL-01-0`과 `FDR-3-MODAL-05-0`이 둘 다 "새 폴더 생성"이다. 진입 경로만 다른 같은 모달인지 확인 필요.
- `DUE-5-SNACKBAR-01-0`의 Format이 `Snackbar`가 아니라 `Page`, `ETC-5-MODAL-01-0`은 `Page`, `ETC-5-SNACKBAR-08-0`은 `Modal`로 되어 있다. IA 입력 오류로 보인다.
- `CLAUDE.md`가 *"현재 구현된 것은 로그인·회원가입 온보딩 플로우뿐"*이라고 되어 있으나 실제로는 대시보드·내역·폴더·모임 관리까지 구현돼 있다. **문서가 낡았다.**

### 5-4. 기획팀 확인 필요 항목

스크린샷 대조를 시작하기 전에 답이 있어야 진행이 되는 것들이다.

- **`ETC-2-PAGE-02-0`(모임 관리)**: 대응 코드가 없음을 확인했다. 더보기 메인의 "모임 관리" ToolsMenu 항목은 중간 화면 없이 `GroupManagerScreen`(`ETC-2-PAGE-03-0`, 실제 페이지 타이틀은 "모임 관리자")으로 바로 이동한다. IA가 이 둘을 별개 화면으로 정의한 것인지, 아니면 같은 화면을 가리키는 오기인지 확인이 필요하다.
- **`FDR-3-SHEET-01-0`(장부 예산 입력) / `FDR-3-SHEET-02-0`(예산 설정)**: 코드상 `FolderBudgetListScreen.tsx`에 예산 입력용 BottomSheet가 하나뿐이라 두 ID를 같은 시트로 판단해 매핑했으나 확신이 낮다. 두 ID가 실제로 다른 시트(예: 최초 입력 vs 수정)로 구분되어야 하는지 기획 확인이 필요하다.
- **시안 없음 — 로딩/에러/빈 목록 상태**(`ETC-2-PAGE-01-0`, `ETC-4-PAGE-01-0`, `ETC-4-SHEET-01-0`, `ETC-1-PAGE-01-0`): API 연동 1단계(Group)에서 확인. 목 데이터 시절엔 항상 즉시 채워진 상태만 존재해 화면 시안도 그 상태만 있다. 네트워크 로딩 중/실패/모임이 아예 없는 상태의 디자인이 없어 임의로 최소 형태(중앙 정렬 텍스트 + 재시도 버튼)로 통일해 구현했다 — 표준 패턴은 `api-integration-plan.md` "표준 패턴" 절 참고. 다른 12개 도메인도 같은 패턴을 쓸 예정이라, 스피너/일러스트 사용 여부를 기획팀이 정해주면 한 번에 교체 가능하다.
- **`ADD-2-SHEET-07-0`(일자 선택 캘린더)**: 디자인 원본 파일이 더미 데이터다(요일 헤더 7칸 전부 "일", 날짜 셀 전부 "0"). 물어볼 것: **이 화면의 정상 디자인 원본 파일을 다시 받을 수 있는가** — 지금 파일로는 요일 헤더 구성이나 날짜 그리드 스타일을 대조할 수 없다.
- **`ADD-4-SNACKBAR-01-0`(이미지 첨부 제한)**: 디자인 이미지 헤더 문구가 "4 선택"인데 실제 체크된 사진은 9~10장으로 안 맞는다(실제 구현은 숫자가 정확히 일치해 정상). 물어볼 것: **디자인 쪽 "4 선택" 표기가 목업 작성 시 오기인지, 아니면 다른 상태(4장만 선택된 상태)를 의도적으로 보여준 것인지** — 오기라면 원본만 정정하면 되고 실제 구현은 손댈 필요 없다.
- **`DTB-3-MODAL-01-0`(상세 내역_삭제)**: 디자인 이미지를 열어보면 삭제 확인 다이얼로그가 아니라 "상세 내역" 타이틀에 본문이 빈 화면 + "등록하기" 버튼만 있다. 물어볼 것: **이 파일이 정말 `DTB-3-MODAL-01-0`(상세 내역 삭제 확인 모달)이 맞는지, 아니면 다른 Screen ID의 파일이 잘못 파일링된 것인지** — 파일명 자체는 맞게 붙어 있어서 대조 코드가 아니라 원본 배치 실수를 의심할 근거가 있다.
- **`ADD-4-PAGE-01-0`(영수증 스캔 성공)**: 실제 구현은 스캔 성공 즉시 금액 필드가 자동으로 채워지는데(예: "232,000원"), 디자인 이미지는 이 시점에서도 금액이 placeholder("금액을 입력해주세요")로 비어 있다. 물어볼 것: **스캔 직후 금액을 즉시 자동 반영하는 게 의도인지, 아니면 사용자가 한 번 더 확인/승인하는 별도 단계가 있어야 하는지** — 현재 구현(즉시 반영)이 기획 의도와 다르면 `TransactionRegisterScreen.tsx`의 스캔 성공 핸들러를 고쳐야 한다.
- **`DUE-2-PAGE-01-0`(회비 생성) "기간" 필드**: 화면명세서가 시작일~마감일 캘린더 범위 선택을 필수 입력으로 요구하는데, `POST /groups/{groupId}/dues`엔 마감일(`dueDate`) 하나만 받는 필드가 있다(docs/api-gaps.md (A) "회비 시작일 필드 부재"). 구현은 임의로 "마감일" 단일 입력으로 줄였다(`DuesCreateScreen.tsx`) — 물어볼 것: **회비 납부 시작일을 실제로 서버에 저장해야 하는 값인지, 아니면 화면명세서가 완료 안 된 초안이라 마감일만으로 충분한지** — 시작일이 진짜 필요하면 API에 필드 추가가 선행돼야 한다.
- **D-2에서 "상태 불명"으로 남은 16개** (`DTB-2-SHEET-01-0`, `DTB-3-SHEET-01-0`, `DTB-2-PAGE-02-0`, `DTB-3-MODAL-01-0`[위 항목과 동일], `FDR-2-SHEET-01-0`, `FDR-2-PAGE-02-0`, `FDR-4-SNACKBAR-03-0`, `FDR-4-SNACKBAR-02-0`, `ETC-3-MODAL-01-0`, `ETC-3-MODAL-01-1`, `ADD-1-PAGE-01-0`, `ADD-2-SHEET-07-0`[위 항목과 동일], `ADD-2-SHEET-01-0`, `ADD-2-SHEET-02-0`, `ADD-2-SHEET-03-0`, `ADD-2-SHEET-04-0`): 같은 Screen ID에 디자인 후보 이미지가 2~9장씩 걸려 있는데(대부분 서로 다른 폴더에 중복 배치돼 있어) 어느 게 이 ID의 "진짜" 대표 이미지인지, 혹은 정말 여러 상태(빈 값/입력중/에러 등) 변형인지 사전에 못 정했다. 물어볼 것: **각 Screen ID의 디자인 후보 파일들이 상태 변형인지 단순 중복 배치인지, 상태 변형이라면 어느 파일이 화면의 "기본" 상태를 대표하는지** — `scripts/design-index.json`의 해당 항목에서 후보 경로 전부 확인 가능.

## 6. 권장 순서

1. **`TYPOGRAPHY`에 `letterSpacing` 15개 추가** (§3-2) — 스크린샷 대조 전에 해야 전 화면 오탐을 막는다.
2. **`colors.ts` 주석 정정**, `CLAUDE.md` 현행화 (§3-1, §5-3)
3. **화면 파일에 `@screen` 주석 심기** (§4-1) — 이후 검증이 자동화된다.
4. **`[부족함]` 9건 처리** — 대부분 화면은 있고 연결만 빠진 것이라 비용 대비 효과가 크다. 특히 `COM-5-PAGE-01-0`(가입 완료 → 모임 생성/참여)은 대상 화면이 이미 있어서 연결만 하면 된다.
5. **스크린샷 캡처 & 대조** (§4) — `[구현]` 48개부터
6. **`[미구현]` 82개 백로그화** — DUE(회비) 28개가 최대 덩어리이며 디자인 이미지부터 확보해야 한다 (§5-1)
