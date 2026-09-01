# API ↔ 화면 매핑 (api-mapping)

명세 원본: `C:\Users\jotmd\Downloads\BILLIGE\api\`(txt 14개, 공통 규칙 1 + 도메인 13). 화면 매핑은 `src/screens/**/*.tsx` 파일 상단의 `@screen` 주석을 근거로 했다(전수 `grep` 확인, 76개 중 DUE 도메인 28개는 화면 자체가 없어 매핑 대상에서 제외).

이 문서 갱신 시점: 2026-08-30. 서버 상태·엔드포인트는 위 txt 스냅샷 기준이며 이후 명세가 바뀌면 이 문서도 다시 훑어야 한다.

---

## 1. 엔드포인트 → 화면 (도메인별)

### Auth (인증) — 서버 상태: 진행 중/예정, 프론트는 이미 실제 연동됨

| 엔드포인트 | 서버 상태 | 사용 화면 (Screen ID) | 현재 대신하는 목 함수 | 권한 |
|---|---|---|---|---|
| `POST /api/v1/auth/signup` | 진행 중 | COM-3-PAGE-03-0(가입 정보 입력) | 없음 — `authService.signup()`이 이미 이 엔드포인트를 직접 호출 | Public |
| `POST /api/v1/auth/login` | 진행 중 | COM-1-PAGE-01-0(로그인) | 없음 — `authService.login()`이 이미 직접 호출 | Public |
| `POST /api/v1/auth/refresh` | 진행 예정 | (화면 없음, `apiClient.ts`의 401 재시도 로직에서 자동 호출) | 없음 — `apiClient.refreshSession()`이 이미 직접 호출 | Refresh Token |
| `GET /api/v1/auth/me` | 진행 중 | (화면 없음, 앱 시작 시 세션 복원용) | 없음 — `authService.restoreSession()`이 이미 직접 호출 | Login |
| `POST /api/v1/auth/logout` | 진행 예정 | ETC-4-MODAL-04-0(로그아웃) — **[미구현] 상태, 화면 코드 자체가 없음** | 없음 — `authService.logout()` 함수는 이미 있으나 호출할 화면이 없음 | Refresh Token |

> Auth는 이 프로젝트에서 유일하게 **목 데이터가 아니라 이미 실제 서버를 호출하는 도메인**이다(`5f50502 feat: JWT 기반 회원가입/로그인 백엔드 연동` 커밋). 소셜 로그인(`socialLogin`/`socialSignup`)만 예외 — 명세에 없는 `/api/v1/auth/social/*` 경로를 코드가 가정해서 호출한다(§api-gaps.md (A) 참고).

### User (사용자) — 서버 상태: 진행 중

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/users/me` | 진행 중 | ETC-3-PAGE-07-0(내 프로필) — **[미구현]** | 없음(화면 자체가 없음) | Login |
| `PATCH /api/v1/users/me` | 진행 중 | ETC-4-PAGE-15-0(프로필 변경) — **[미구현]** | 없음(화면 자체가 없음) | Login |

### Group (모임) — 서버 상태: 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/groups` | 구현 완료 | ETC-2-PAGE-01-0(전체 모임 관리), MoreScreen 헤더 드롭다운 | `getMyGroups()` (`types/group.ts`) | Login |
| `POST /api/v1/groups` | 구현 완료 | ETC-4-PAGE-01-0(새 모임 생성) | `createGroup()` (`types/group.ts`) | Login |
| `GET /api/v1/groups/{groupId}` | 구현 완료 | ETC-2-PAGE-03-0(모임 관리자) 등 여러 화면의 모임명 표시 | `getActiveGroup()` / `getGroupById()` (`types/group.ts`) | MEMBER |
| `PATCH /api/v1/groups/{groupId}` | 구현 완료 | ETC-3-PAGE-01-0(모임 프로필 변경) — **[미구현]** | 없음(화면 자체가 없음) | OWNER |
| `DELETE /api/v1/groups/{groupId}` | 구현 완료 | ETC-3-MODAL-02-0(모임 삭제하기) — **[미구현]** | 없음(화면 자체가 없음) | OWNER |

### GroupMembership (모임 관리자) — 서버 상태: 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/groups/{groupId}/memberships` | 구현 완료 | ETC-2-PAGE-03-0(모임 관리자) | `getGroupMembers()` (`types/group.ts`) — ⚠️ 이 함수가 반환하는 `GroupMember`는 실제로는 `GroupMembership`+`Member`가 뒤섞인 목 타입이다(§api-type-design.md) | MEMBER |
| `POST /api/v1/groups/{groupId}/invitations` | 구현 완료 | ETC-2-PAGE-03-0의 "초대코드" 카드(코드 생성 UI는 없고 이미 발급된 코드를 노출만 함) | `GroupSummary.inviteCode`를 모임 생성 시 클라이언트가 즉석 생성(`generateInviteCode()`) | OWNER |
| `POST /api/v1/groups/join` | 구현 완료 | ETC-4-SHEET-01-0(모임 참여) | `joinGroupByCode()` (`types/group.ts`) | Login |
| `PATCH /api/v1/groups/{groupId}/memberships/{membershipId}` | 구현 완료 | ETC-4-MODAL-01-0(일반 전환)/ETC-4-MODAL-02-0(총무 전환) | `updateMemberRole()` (`types/group.ts`) | OWNER |
| `POST /api/v1/groups/{groupId}/leave` | 구현 완료 | ETC-3-MODAL-01-0(모임 나가기 일반)/ETC-3-MODAL-01-1(마지막 총무 막힘) | `leaveGroup()` (`types/group.ts`) | MEMBER |

### Member (모임원 명단) — 서버 상태: 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/groups/{groupId}/members` | 구현 완료 | DUE-2-PAGE-02-0(모임원 관리) — **[미구현]** | 없음(화면 없음, 회비 도메인 전체 미구현) | MEMBER |
| `POST /api/v1/groups/{groupId}/members` | 구현 완료 | DUE-4-PAGE-01-0(모임원 추가_개별) — **[미구현]** | 없음 | OWNER |
| `POST /api/v1/groups/{groupId}/members/bulk` | 구현 완료 | DUE-4-PAGE-02-0(모임원 추가_일괄) — **[미구현]** | 없음 | OWNER |
| `PATCH /api/v1/groups/{groupId}/members/{memberId}` | 구현 완료 | DUE-4-PAGE-03-0(모임원 수정) — **[미구현]** | 없음 | OWNER |
| `DELETE /api/v1/groups/{groupId}/members/{memberId}` | 구현 완료 | DUE-4-MODAL-01-0(모임원 삭제) — **[미구현]** | 없음 | OWNER |

> `Member` 관련 5개 엔드포인트 전부 서버는 구현 완료인데 프론트 화면이 하나도 없다 — DUE 도메인이 통째로 미구현이라서다. `docs/api-gaps.md` (B)의 최우선 항목.

### Folder (폴더) — 서버 상태: 1~4 구현 완료, 5(백업) 시작 전

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/groups/{groupId}/folders` | 구현 완료 | FDR-1-PAGE-01-0(폴더 메인) | `getChildNodes(null)` 등 (`types/folder.ts`) | MEMBER |
| `POST /api/v1/groups/{groupId}/folders` | 구현 완료 | FDR-2-MODAL-01-0/FDR-3-MODAL-05-0(새 폴더 생성) | `addFolderNode()` (`types/folder.ts`) | OWNER |
| `PATCH /api/v1/folders/{folderId}` | 구현 완료 | FDR-3-MODAL-01-0(폴더 이름 변경), 이동 관련(FDR-2-PAGE-01-0/FDR-3-PAGE-01-0) | `renameNode()` / `moveNodes()` (`types/folder.ts`) | OWNER |
| `DELETE /api/v1/folders/{folderId}` | 구현 완료 | FDR-3-MODAL-02-0(폴더 해제) | `unlinkFolder()` (`types/folder.ts`) | OWNER |
| `POST /api/v1/groups/{groupId}/folders/archive` | **시작 전** | FDR-2-MODAL-02-0(폴더 전체 백업) — **[미구현]** | 없음 | OWNER |

### Ledger (장부) — 서버 상태: 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/folders/{folderId}/ledgers` | 구현 완료 | FDR-1-PAGE-01-0(장부 목록 부분), FDR-2-PAGE-04-0 | `getChildNodes()`가 폴더·장부 섞어서 반환(`types/folder.ts`) | MEMBER |
| `POST /api/v1/folders/{folderId}/ledgers` | 구현 완료 | FDR-3-PAGE-03-0(새 장부 생성) | `addLedgerNode()` (`types/folder.ts`) | OWNER |
| `GET /api/v1/ledgers/{ledgerId}` | 구현 완료 | FDR-2-PAGE-05-0(장부 상세) | `getNodeById()` (`types/folder.ts`) | MEMBER |
| `PATCH /api/v1/ledgers/{ledgerId}` | 구현 완료 | FDR-3-MODAL-03-0(장부 이름 변경) | `renameNode()` (`types/folder.ts`) | OWNER |
| `PATCH /api/v1/ledgers/{ledgerId}/budget` | 구현 완료 | FDR-3-SHEET-01-0/FDR-3-SHEET-02-0(예산 입력·설정) | `setLedgerBudget()` (`types/folder.ts`) | OWNER |
| `DELETE /api/v1/ledgers/{ledgerId}` | 구현 완료 | FDR-3-MODAL-04-0(장부 삭제) | `deleteLedgerNode()` (`types/folder.ts`) | OWNER |

### Entry (내역) — 서버 상태: 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/ledgers/{ledgerId}/entries` | 구현 완료 | FDR-2-PAGE-05-0(장부 상세의 내역 리스트), FDR-3-PAGE-02-0(장부 내 검색) | `getTransactionsByLedgerId()` (`types/folder.ts`) | MEMBER |
| `POST /api/v1/ledgers/{ledgerId}/entries` | 구현 완료 | ADD-1-PAGE-01-0(내역 추가) | `addTransaction()` (`types/transaction.ts`) | MEMBER |
| `GET /api/v1/entries/{entryId}` | 구현 완료 | DTB-2-PAGE-02-0(상세 내역_조회) | `getTransactionById()` (`types/transaction.ts` 또는 `types/folder.ts` — 두 파일에 동명 함수가 각각 있음) | MEMBER |
| `PATCH /api/v1/entries/{entryId}` | 구현 완료 | DTB-3-PAGE-02-0(상세 내역_수정) — 진입 경로 자체가 막혀 있음(§api-gaps.md (C)) | `updateTransaction()` (`types/transaction.ts`) | **OWNER** (목은 권한 구분 없음) |
| `DELETE /api/v1/entries/{entryId}` | 구현 완료 | DTB-3-MODAL-01-0(상세 내역_삭제) | `deleteTransactionById()` / `deleteTransaction()` (양쪽 파일 각각) | **OWNER** (목은 권한 구분 없음) |
| `POST /api/v1/entries/{entryId}/approve` | 구현 완료 | DTB-2-PAGE-03-0(상세 내역_승인요청) — **[미구현]**(탭 필터만 있고 승인 화면 없음) | 없음 — `isPendingApproval` 플래그만 있고 승인 액션 없음 | **OWNER** |
| **없음** — 모임 전체(여러 장부 통합) 내역 목록 API 자체가 명세에 없음 | — | DTB-1-PAGE-01-0(내역 메인), DTB-2-PAGE-01-0(검색), DTB-2-SHEET-01-0/DTB-3-SHEET-01-0(필터) | `getAllTransactions()` / `applyTransactionFilter()` / `searchTransactions()` (`types/transaction.ts`) | — |

> `types/folder.ts`와 `types/transaction.ts`에 **같은 개념(내역)이 두 벌**로 흩어져 있다. 서버 `Entry`는 하나인데 프론트만 둘로 나뉜 상태다 — §api-type-design.md에서 통합안을 다룬다.

### Dues (회비) — 서버 상태: 전체 구현 완료 · 화면 전체 미구현

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/groups/{groupId}/dues` | 구현 완료 | DUE-1-PAGE-01-0(납부 관리 메인) — **[미구현]** | 없음 | MEMBER |
| `POST /api/v1/groups/{groupId}/dues` | 구현 완료 | DUE-2-PAGE-01-0(회비 생성) — **[미구현]** | 없음 | OWNER |
| `GET /api/v1/dues/{duesId}` | 구현 완료 | DUE-2-PAGE-03-0/03-1(회비 항목 상세) — **[미구현]** | 없음 | MEMBER |
| `PATCH /api/v1/dues/{duesId}` | 구현 완료 | DUE-3-PAGE-06-0(회비 수정) — **[미구현]** | 없음 | OWNER |
| `DELETE /api/v1/dues/{duesId}` | 구현 완료 | DUE-3-MODAL-01-0(회비 삭제) — **[미구현]** | 없음 | OWNER |
| `GET /api/v1/dues/{duesId}/members` | 구현 완료 | DUE-3-PAGE-02-0(모임원 선택), DUE-2-PAGE-02-0(모임원 관리) — **[미구현]** | 없음 | MEMBER |
| `PATCH /api/v1/dues/{duesId}/members/{memberId}` | 구현 완료 | DUE-3-SNACKBAR-01/02-0(입금 확인/취소로 이어지는 상태 변경) — **[미구현]** | 없음 | OWNER |
| `POST /api/v1/dues/{duesId}/close` | 구현 완료 | DUE-3-MODAL-02-0(회비 마감) — **[미구현]** | 없음 | OWNER |

> 8개 전부 서버는 이미 되는데 화면이 하나도 없다. `docs/api-gaps.md` (B)에서 최우선으로 다룬다.

### File (파일) — 서버 상태: 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `POST /api/v1/files` (purpose=RECEIPT) | 구현 완료 | ADD-2-SHEET-05-0(증빙자료 등록), ADD-3-PAGE-01-0(영수증 스캔) | 로컬 이미지 URI를 그대로 `receiptImages: string[]`에 저장(업로드 없음) | Login |
| `POST /api/v1/files` (purpose=GROUP_IMAGE) | 구현 완료 | ETC-3-PAGE-01-0(모임 프로필 변경) — **[미구현]** | 없음 | Login |
| `POST /api/v1/files` (purpose=PROFILE_IMAGE) | 구현 완료 | ETC-4-PAGE-15-0(프로필 변경) — **[미구현]** | 없음 | Login |
| `DELETE /api/v1/files/{fileId}` | 구현 완료 | 증빙자료 삭제(DTB-3-MODAL-02-0) — **[미구현]**, 개별 이미지 X 버튼(ADD 폼 내) | ADD 폼의 X 버튼은 로컬 배열에서만 제거(`receiptImages` splice) | 업로더 본인 |
| `GET /api/v1/files/{fileId}/content` | 구현 완료 (인증 필요 경로) | 증빙자료 썸네일 표시 전반 | 로컬 URI를 `<Image>`에 직접 사용 | (열람 권한은 업로더/모임 관리자) |

### OCR (영수증 인식) — 서버 상태: 시작 전

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `POST /api/v1/files/{fileId}/ocr` | **시작 전** | ADD-3-PAGE-01-0(영수증 스캔), ADD-4-PAGE-01-0/01-1(스캔 성공/실패), ADD-5-MODAL-01-0(반영 확인) | `generateMockScanResult()` (`utils/mockOcr.ts`, `SUCCESS_RATE=0.78` 랜덤) | Login |

### Report (보고서) — 서버 상태: 구현 완료 · 화면 전체 미구현

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/groups/{groupId}/reports` | 구현 완료 | ETC-2-PAGE-04-0(보고서 리스트) — **[미구현]** | 없음 | MEMBER |
| `POST /api/v1/groups/{groupId}/reports` | 구현 완료 | ETC-4-PAGE-03-0/04-0(장부별·기간별 보고서 생성) — **[미구현]** | 없음 | OWNER |
| `GET /api/v1/reports/{reportId}` | 구현 완료 | ETC-3-PAGE-02/03-0, ETC-4-PAGE-05/07-0(보고서 상세류) — **[미구현]** | 없음 | MEMBER |

### Dashboard (대시보드) — 서버 상태: 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 현재 목 함수 | 권한 |
|---|---|---|---|---|
| `GET /api/v1/groups/{groupId}/dashboard` | 구현 완료(`dues`는 Dues 도메인 미연동 상태라 항상 0) | DSH-1-PAGE-01-0(대시보드) | `MOCK_DASHBOARD_SUMMARY` (`types/dashboard.ts`) | MEMBER |

### 명세에 도메인 자체가 없는 것

- **Notification(알림)**: 14개 spec 파일 어디에도 알림 도메인이 없다. DSH-2-PAGE-01-0(알림 목록)이 `types/notification.ts`의 `MOCK_NOTIFICATIONS`를 쓰는데 대응할 서버 엔드포인트가 아예 없다.
- **Calendar(달력)**: 별도 API 없음. DSH-2-PAGE-03-0(대시보드 캘린더)이 `types/calendar.ts`의 `MOCK_CALENDAR_MONTH`를 쓰는데, 이건 모임 전체 내역을 날짜별로 묶은 뷰라서 위 Entry 도메인의 "모임 전체 내역 목록 API 없음" 문제에 종속된다 — 그 API가 생기면 클라이언트에서 날짜별로 묶어 만들 수 있다.

---

## 2. 화면 → 엔드포인트 (역방향, 목 데이터 계층 인벤토리)

`src/types/*.ts`의 인메모리 목 저장소와 접근 함수 전체. "동기→비동기"는 현재 전부 동기 함수라 실제 API로 바꾸면 전부 `Promise`가 된다는 뜻.

### `types/group.ts` — `GroupSummary` + `GroupMember`(주의: 실제로는 GroupMembership+Member 혼합, §type-design)

| 목 함수 | 시그니처(현재) | 사용 화면 | 대체 엔드포인트 |
|---|---|---|---|
| `getMyGroups()` | `() => GroupSummary[]` | ETC-2-PAGE-01-0, MoreScreen | `GET /groups` |
| `getActiveGroup()` | `() => GroupSummary` | 거의 전 화면(현재 모임 컨텍스트) | 클라이언트 상태로 전환(전역 store), 서버 API 아님 |
| `setActiveGroup()` | `(id) => void` | GroupSwitcherMenu | 위와 동일, 클라이언트 상태 |
| `getGroupById()` | `(id) => GroupSummary \| undefined` | 여러 화면 | `GET /groups/{groupId}` |
| `getGroupMembers()` | `(groupId) => GroupMember[]` | ETC-2-PAGE-03-0 | `GET /groups/{groupId}/memberships` |
| `createGroup()` | `(name) => GroupSummary` | ETC-4-PAGE-01-0 | `POST /groups` |
| `joinGroupByCode()` | `(code) => GroupSummary \| null` | ETC-4-SHEET-01-0 | `POST /groups/join` |
| `updateMemberRole()` | `(memberId, role) => void` | ETC-4-MODAL-01/02-0 | `PATCH /groups/{groupId}/memberships/{membershipId}` |
| `removeMember()` | `(memberId) => void` | ETC-4-MODAL-03-0 | ⚠️ 명세엔 관리자를 "내보내는" API가 없다 — `leave`는 본인 탈퇴만 있음(§api-gaps.md (C)) |
| `leaveGroup()` | `(groupId) => void` | ETC-3-MODAL-01-0 | `POST /groups/{groupId}/leave` |

### `types/folder.ts` — `FolderTreeNode`(폴더+장부 통합) + `LedgerTransaction`

| 목 함수 | 사용 화면 | 대체 엔드포인트 |
|---|---|---|
| `getChildNodes(parentId)` | FDR-1-PAGE-01-0 등 | `GET /groups/{groupId}/folders` + `GET /folders/{folderId}/ledgers` (**서버는 폴더/장부가 별도 API** — 목처럼 한 번에 안 옴, §type-design) |
| `getNodeById(id)` | FDR-2-PAGE-05-0 등 | `GET /folders/{folderId}` 없음(폴더 상세 단건 조회 API 자체가 명세에 없음, 목록에서 찾아 씀) / `GET /ledgers/{ledgerId}` |
| `getAllLedgerNodes()` | FDR-2-PAGE-02-0(전체 예산 설정) | ⚠️ "모임 전체 장부 목록" API 없음 — 폴더별로만 조회 가능(§api-gaps.md (C)) |
| `searchNodes(query)` | FDR-3-PAGE-02-0 | 없음 — 장부명 검색 API 자체가 명세에 없음 |
| `getTransactionsByLedgerId(ledgerId)` | FDR-2-PAGE-05-0 | `GET /ledgers/{ledgerId}/entries` |
| `getTransactionById(id)` | DTB-2-PAGE-02-0 | `GET /entries/{entryId}` |
| `addFolderNode()` | FDR-2-MODAL-01-0 | `POST /groups/{groupId}/folders` |
| `addLedgerNode()` | FDR-3-PAGE-03-0 | `POST /folders/{folderId}/ledgers` |
| `renameNode()` | FDR-3-MODAL-01/03-0 | `PATCH /folders/{folderId}` 또는 `PATCH /ledgers/{ledgerId}`(노드 종류에 따라 분기 필요) |
| `setLedgerBudget()` | FDR-3-SHEET-01/02-0 | `PATCH /ledgers/{ledgerId}/budget` |
| `unlinkFolder()` | FDR-3-MODAL-02-0 | `DELETE /folders/{folderId}` |
| `deleteLedgerNode()` | FDR-3-MODAL-04-0 | `DELETE /ledgers/{ledgerId}` |
| `moveNodes()` | FDR-2-PAGE-01-0/FDR-3-PAGE-01-0 | `PATCH /folders/{folderId}`(하나씩, 서버는 다건 이동 API 없음 — §api-gaps.md (C)) |
| `deleteTransaction()` | (folder.ts 쪽 내역 삭제) | `DELETE /entries/{entryId}` |

### `types/transaction.ts` — `Transaction`(DTB 탭 전용 평평한 목록)

| 목 함수 | 사용 화면 | 대체 엔드포인트 |
|---|---|---|
| `getAllTransactions()` | DTB-1-PAGE-01-0 | ⚠️ 없음 — 모임 전체 내역 API 자체가 없음(핵심 공백, §api-gaps.md (A)) |
| `getPendingApprovalTransactions()` | DTB-1-PAGE-01-0의 "승인요청" 탭 | 위와 동일 API 없음 + `status=PENDING` 쿼리는 장부 단위에만 존재 |
| `getTransactionById()` | DTB-2-PAGE-02-0 | `GET /entries/{entryId}` |
| `searchTransactions()` | DTB-2-PAGE-01-0 | 위와 동일 API 없음(장부 단위 `keyword` 검색만 존재) |
| `applyTransactionFilter()` | DTB-2-SHEET-01-0/DTB-3-SHEET-01-0 | 위와 동일 API 없음 + 커스텀 기간(`customStart/customEnd`) 필터 파라미터도 명세에 없음 |
| `getTransactionLedgerOptions()` | DTB-3-SHEET-02-0(장부 복수 선택) | `GET /folders/{folderId}/ledgers`를 폴더별로 순회해서 합쳐야 함(전체 장부 API 없음) |
| `addTransaction()` | ADD-1-PAGE-01-0 | `POST /ledgers/{ledgerId}/entries` |
| `updateTransaction()` | DTB-3-PAGE-02-0(진입 경로 막힘) | `PATCH /entries/{entryId}` |
| `deleteTransactionById()` | DTB-3-MODAL-01-0 | `DELETE /entries/{entryId}` |

### `types/dashboard.ts` — `DashboardSummary`

| 목 함수 | 사용 화면 | 대체 엔드포인트 |
|---|---|---|
| `MOCK_DASHBOARD_SUMMARY`(상수, 함수 아님) | DSH-1-PAGE-01-0 | `GET /groups/{groupId}/dashboard` — 응답 구조가 상당히 다름(§type-design), `quickServices`는 서버에 없는 순수 UI 데이터라 계속 클라이언트에 남아야 함 |

### `types/notification.ts` / `types/calendar.ts` — 대응 API 없음

| 목 함수 | 사용 화면 | 대체 엔드포인트 |
|---|---|---|
| `MOCK_NOTIFICATIONS`(상수) | DSH-2-PAGE-01-0 | **없음** — Notification 도메인 자체가 명세에 없음 |
| `MOCK_CALENDAR_MONTH`(상수) | DSH-2-PAGE-03-0 | **없음(직접)** — 모임 전체 내역 API가 생기면 클라이언트에서 날짜별로 묶어 구성 가능 |

### `utils/mockOcr.ts`

| 목 함수 | 사용 화면 | 대체 엔드포인트 |
|---|---|---|
| `generateMockScanResult()` | ADD-3-PAGE-01-0 등 | `POST /files/{fileId}/ocr` — 서버 상태 `시작 전`이라 지금은 못 바꿈 |

---

## 3. 동기 → 비동기 전환 영향 범위

`types/group.ts`·`types/folder.ts`·`types/transaction.ts`·`types/dashboard.ts` 네 파일을 **직접 import**하는 화면/컴포넌트 파일 수(중복 제거):

- `types/group.ts` 사용: 7개 파일
- `types/folder.ts` 사용: 8개 파일
- `types/transaction.ts` 사용: 7개 파일 (`TransactionDetailScreen.tsx`가 `folder.ts`와 겹침)
- `types/dashboard.ts` 사용: 2개 파일

**중복 제거 합계: 23개 파일.** 이 파일들의 마운트 시점 데이터 조회(`getMyGroups()`, `getChildNodes()` 등)가 전부 동기 함수 호출 → `useState` 초기값이나 렌더 중 직접 호출로 짜여 있는데, API로 바뀌면 전부 `Promise`가 되므로 **23개 파일 전부 로딩·에러 상태를 새로 가져야 한다**(현재 로딩/에러 UI 자체가 없는 화면이 대부분).

이 23은 "목 모듈을 직접 import하는 파일" 기준이라 실측 하한선이다. 부모로부터 props로 데이터를 받기만 하는 자식 컴포넌트(예: `QuickServiceCard.tsx`는 `dashboard.ts`를 직접 안 쓰고 `DashboardScreen.tsx`가 내려주는 걸로 추정)는 안 세었으므로, 로딩 상태를 실제로 화면에 반영해야 하는 컴포넌트 수는 이보다 클 수 있다.
