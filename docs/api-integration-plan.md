# API 연동 순서 설계 (api-integration-plan)

`docs/api-mapping.md`(엔드포인트 목록)·`docs/api-gaps.md`(공백)·`docs/api-type-design.md`(타입 변경)를 전제로 한다. 서버는 Auth만 `진행 중/예정`이고 나머지 12개 도메인은 대부분 `구현 완료`다 — 그래서 순서를 가르는 기준은 "서버가 됐냐"가 아니라 **화면 간 의존성**(대부분 `groupId` 컨텍스트)과 **타입 리팩터가 선행돼야 하는지**다.

각 단계는 그 자체로 리뷰 가능한 크기로 쪼갰다. "목을 한 번에 다 걷어낸다" 같은 단계는 없다.

---

## 현황 (2026-09-01, 5단계 Dashboard 완료 시점)

### 도메인별 상태표

| 도메인 | 서버 상태 | 프론트 연동 상태 | 막힌 이유 |
|---|---|---|---|
| Auth | 이메일 로그인/가입/재발급 완료, 이메일인증·비번재설정 없음 | 이메일 로그인/가입/재발급 연동 완료(0단계) | 이메일인증·비번재설정: API 없음(7단계 블록). 소셜로그인: 화면은 SDK 연동까지 됐으나 서버 엔드포인트 없음 |
| Group | 구현 완료 | 연동 완료(1단계) | — |
| GroupMembership | 구현 완료(강제 내보내기 제외) | 연동 완료(2단계) | 강제 내보내기: 화면·API 둘 다 없음(7단계 블록) |
| Folder | 1~4 구현 완료, 5(archive) 시작 전 | 1~4 연동 완료(3-A/3-B) | archive: 서버 시작 전이라 스텁 유지 |
| Ledger | 구현 완료 | 연동 완료(3-A/3-B) | — |
| Entry | 구현 완료 | 부분 연동(4-A) — 장부 단위(등록/조회/수정/삭제/승인) 완료 | 모임 전체 목록(DTB-1 등): API 자체가 없어 목 유지(4-B 대기) |
| File | 구현 완료 | 서비스 계층만 존재, 실호출 없음 | 카메라·갤러리 네이티브 라이브러리가 없어 올릴 실제 파일이 없음 |
| Dashboard | 구현 완료 | 연동 완료(5단계) | 미니 캘린더·회비 세부는 API 구조 한계로 축소 구현(아래 참고) |
| Dues | 구현 완료(8개) | 화면 자체 없음 | 화면 신규 개발 대상(6단계) |
| Member | 구현 완료(5개, 1건 에러 응답 섹션 없음) | 화면 자체 없음 | DUE 화면과 함께 개발 예정 |
| OCR | 시작 전 | `utils/mockOcr.ts`로 완전 대체(스텁) | 서버 자체가 없음 — 생기면 별도 단계 |
| Report | 구현 완료(3개) | 화면 자체 없음 | 화면 신규 개발 대상(6단계) — API·디자인 둘 다 준비됨(아래 3-3 참고) |
| User | `GET/PATCH /users/me` 진행 중(완료 임박) | 화면 자체 없음 | 화면은 만들 수 있으나 서버가 아직 진행 중 |

### 남은 작업 세 갈래

**(a) API 대기 — 백엔드가 줘야 진행 가능**
- 모임 전체 내역 목록(Entry) — DTB-1 등 한 뿌리, 영향 범위 가장 큼(대시보드 미니 캘린더도 같은 이유로 막힘)
- Entry 등록/수정에 "담당자" 필드 없음 — CLAUDE.md/화면엔 있는데 명세엔 없음
- 최상위 영역 장부 조회(Folder) — 폴더 해제 시 일부 케이스를 막는 원인
- receiptFileIds(내역 등록) 명세 자기모순 — File 도메인 활성화 배너 vs Validation절 "미적용" 문구, 정정 필요
- 초대코드 발급 멱등성/조회 API(GroupMembership) — 정책 결함으로 이미 승격됨
- 알림 도메인(Notification) — 계획 자체에 없음, 가장 불확실
- 소셜로그인·이메일인증·비번재설정·강제내보내기(Auth/GroupMembership) — 엔드포인트 신설 필요
- 승인 대기 건수를 일반 관리자에게도 보여줄지(Dashboard) — 서버는 이미 구분 안 함, 디자인 시안이 없어 확인 필요

**(b) 네이티브 의존성 필요 — 이미지 라이브러리 없이는 불가**
- 증빙 촬영·갤러리 선택 실접근(현재 전부 mock 문자열 토큰)
- File 업로드 실연결(`fileService.uploadFile`은 준비됐으나 호출부 없음)
- OCR 스캔(서버도 시작 전이라 이중으로 막혀 있음)

**(c) 화면 신규 구현 — 서버 준비 + 화면만 없음** (docs/api-gaps.md (B), 아래 3-3에 크기순 정리)

### 지금 착수 가능한 덩어리 (크기순, 작은 것부터)

| 순서 | 항목 | 화면 수 | 디자인 시안 | 의존 도메인 |
|---|---|---:|---|---|
| 1 | `ETC-4-MODAL-04-0` 로그아웃 | 1 | 1장, 완료 | Auth(`authService.logout()` 이미 완성 — 화면만 만들면 즉시 연결) |
| 2 | `ETC-3-MODAL-02-0` 모임 삭제하기 | 1 | 4장, 완료 | Group(구현 완료) |
| 3 | `ETC-3-PAGE-01-0` 모임 프로필 변경 | 1 | 7장, 완료 | Group + File(GROUP_IMAGE, 둘 다 구현 완료) |
| 4 | `ETC-3-PAGE-07-0`/`ETC-4-PAGE-15-0` 내 프로필·프로필 변경 | 2 | 2장/3장, 완료 | User(`GET/PATCH /users/me`, **진행 중** — 완료돼야 착수) |
| 5 | Report 전체(`ETC-2-PAGE-04-0` ~ `ETC-5-PAGE-02-0`) | 13 | 전 화면 이미지 있음(1~13장), 2건만 진행/예정(리스트·이탈방지 모달) | Report API 3개(전부 완료) + Folder/Ledger 읽기(이미 있음) — 이 규모에서 가장 준비도가 높다 |
| 6 | DUE 전체(`DUE-1-PAGE-01-0` ~ `DUE-5-SNACKBAR-02-0`) | 28 | **12/28만 이미지 있음**(나머지 16개는 상태값은 "완료/진행"인데 실제 이미지 파일이 없음) | Dues API 8개 + Member API 5개(전부 완료) — API는 가장 크고 완비됐지만 디자인 자산이 실제로는 43%만 확보돼 있어 겉보기보다 착수 난이도가 높다 |

1~3은 묶어서 "더보기 > 모임 관리 마무리"로 한 번에 처리할 만하다(전부 화면 1개+API 완비). 4는 User API 완료를 기다려야 한다. 5(Report)가 사실상 **지금 서버·디자인 둘 다 완비된 가장 큰 단일 덩어리**다 — DUE보다 화면 수는 적은데 이미지 커버리지는 훨씬 높다. 6(DUE)은 제일 크고 API도 다 됐지만, 절반 가까운 화면이 이미지 없이 시작해야 해서 순서상 뒤로 미룰 근거가 된다.

---

## 이미 끝난 것 (0단계, 참고용)

`services/authService.ts`가 이미 `POST /auth/signup`·`POST /auth/login`·`GET /auth/me`·`POST /auth/refresh`(401 재시도)를 직접 호출한다. `tokenStorage.ts`도 Keychain 기반으로 완성돼 있다. 이 문서의 1단계부터가 **새로 붙이는 작업**이다.

---

## 1단계 — Group (모임 목록·상세·생성·참여)

- **붙일 엔드포인트**: `GET /groups`, `POST /groups`, `GET /groups/{groupId}`, `POST /groups/join`
- **영향 화면**: `ETC-2-PAGE-01-0`(전체 모임 관리), `ETC-4-PAGE-01-0`(새 모임 생성), `ETC-4-SHEET-01-0`(모임 참여), `MoreScreen` 헤더
- **제거되는 목 함수**: `getMyGroups()`, `getGroupById()`, `createGroup()`, `joinGroupByCode()`. `getActiveGroup()`/`setActiveGroup()`은 안 없어짐 — "지금 보고 있는 모임"은 서버 개념이 아니라 클라이언트 전역 상태이므로 그대로 남고, 값의 출처만 목 배열에서 API 응답으로 바뀐다.
- **선행 의존성**: 없음(Auth 위에 바로 얹힘)
- **되돌리기 가능 단위**: 그 자체로 독립. 이 4개 함수만 API 호출로 바꾸면 되고 다른 도메인 화면을 안 건드린다.
- **왜 이것부터인가**: `Folder`·`Ledger`·`Entry`·`Dues`·`GroupMembership`·`Report`·`Dashboard` 전부 `groupId`가 있어야 호출되는 API다. 이 1단계가 없으면 다른 어떤 도메인도 실제 데이터로 못 붙인다 — 의존성 그래프의 뿌리. 화면도 4개뿐이라 범위가 작고, 실패해도 영향이 "모임 목록/생성/참여"로 국한돼 롤백이 쉽다.

---

## 2단계 — GroupMembership (모임 관리자) — 완료(2026-08-30)

- **붙인 엔드포인트**: `GET /groups/{groupId}/memberships`, `PATCH /groups/{groupId}/memberships/{membershipId}`, `POST /groups/{groupId}/invitations`, `POST /groups/{groupId}/leave`
- **영향 화면**: `ETC-2-PAGE-03-0`(모임 관리자), `ETC-4-MODAL-01-0/02-0`(권한 전환), `ETC-3-MODAL-01-0/01-1`(모임 나가기), `ETC-3-SHEET-03-0/04-0`(프로필 시트)
- **`services/groupMembershipService.ts`**: 1단계 `groupService.ts`와 같은 구조(`request<T>`, 타입 명시, JSDoc 한 줄). `types/groupMembership.ts`는 `types/group.ts`와 동일하게 **순수 캐시**로 바꿨다 — 실제 변경(함수 호출=상태 변경)은 서비스 계층으로 옮기고, 타입 파일은 `setGroupMemberships`/`upsertMembershipInCache`/`clearGroupMembershipsCache`/조회만 남겼다.
- **`POST /groups/join`은 옮기지 않음**: 1단계에서 이미 `groupService.joinGroup()`에 구현·검증돼 있다. URL은 `/groups/join`이라 리소스상 Group에 가깝고, 화면(`JoinGroupSheet`)이 기대하는 결과도 `GroupMembership`이 아니라 `GroupSummary`(참여 직후 상세 조회까지 묶음)라서 그대로 뒀다 — 코드 이동은 동작을 바꾸지 않는 리스크 없는 리팩터라도 이번엔 "패턴 재사용" 검증이 목적이라 손대지 않음.
- **현재 로그인 사용자 캐시(`types/session.ts`) 신규 도입**: `GroupMembership.isMe` 계산에 "내 userId"가 필요해서 만들었다. `authService.login()`/`getCurrentUser()`가 채우고 `logout()`이 비운다 — 매 화면에서 `/auth/me`를 다시 호출하지 않는다.
- **권한 분기**: `GroupSummary.myRole`(1단계에서 이미 Group 응답으로 캐시됨)을 그대로 재사용 — 멤버 목록을 훑어 "내 role"을 다시 계산하지 않는다. UI에서 먼저 막는다: `MemberProfileSheet`는 `viewerIsOwner`(`getActiveGroup()?.myRole === 'OWNER'`)가 아니면 권한 설정 섹션 자체를 렌더링하지 않고, `GroupManagerScreen`도 초대코드 발급 시도를 총무일 때로만 제한한다. 서버 403은 2차 방어로만 남아 있다(`handleApiError`가 처리는 하지만 정상 경로에선 도달 안 함) — 근거: UI 우선 차단이 사용자 경험상 더 낫고(눌러보고 나서 실패 문구를 보는 것보다), 나머지 61개 총무 전용 화면도 이미 캐시된 `myRole`이 있으니 추가 조회 없이 그대로 복제 가능.
- **초대코드 발급 정책**: 화면(`GroupManagerScreen`) 진입 시(`useFocusEffect`) 총무이고 캐시에 코드가 없으면 자동 발급, 있으면 재사용(세션 캐시라 재진입해도 재요청 안 함). 명세에 만료/재발급 절차가 문서화돼 있지 않아(`docs/api-gaps.md` 신규 항목) 클라이언트에서 만료를 추적하지 않는다 — 발급 실패 시에만 행을 다시 눌러 재시도할 수 있게 했다.
- **연동 안 한 것**: `ETC-4-MODAL-03-0`(모임 내보내기)은 대응 API가 없다(`api-gaps.md` (A), 기존 항목). 메뉴 자체를 렌더링하지 않는다 — 코드 주석과 `design-verification.md`에 남김.
- **선행 의존성**: 1단계(`groupId`·`myRole` 확보)
- **되돌리기 가능 단위**: 독립.

---

## 3단계 — Folder + Ledger

두 도메인을 한 단계로 묶었다 — 화면(`FDR-*`)이 폴더와 장부를 한 트리로 섞어 보여주는 구조라 어차피 같이 움직인다. 다만 커밋은 두 소단계로 쪼갠다.

### 3a. 조회·생성·수정·삭제·예산 (단건)

- **붙일 엔드포인트**: `GET /groups/{groupId}/folders`, `GET /folders/{folderId}/ledgers`, `POST /groups/{groupId}/folders`, `POST /folders/{folderId}/ledgers`, `GET /ledgers/{ledgerId}`, `PATCH /folders/{folderId}`, `PATCH /ledgers/{ledgerId}`, `PATCH /ledgers/{ledgerId}/budget`, `DELETE /folders/{folderId}`, `DELETE /ledgers/{ledgerId}`
- **영향 화면**: `FDR-1-PAGE-01-0`, `FDR-2-MODAL-01-0`, `FDR-2-PAGE-04-0/05-0`, `FDR-3-MODAL-01-0/02-0/03-0/04-0/05-0`, `FDR-3-PAGE-03-0`, `FDR-3-SHEET-01-0/02-0`, `FDR-3-SNACKBAR-01-0`, `FDR-4-SNACKBAR-02-0/03-0`
- **제거되는 목 함수**: `getChildNodes()`, `getNodeById()`, `addFolderNode()`, `addLedgerNode()`, `renameNode()`, `setLedgerBudget()`, `unlinkFolder()`, `deleteLedgerNode()`
- **설계 주의**: 목의 `getChildNodes()`는 폴더+장부를 한 번에 섞어 반환하지만, 서버는 `GET /folders`(폴더만, `ledgerCount`만 숫자로)와 `GET /folders/{folderId}/ledgers`(장부만) **두 API로 분리**돼 있다. 화면단에서 두 응답을 합쳐 트리를 구성하는 로직을 새로 짜야 한다(단순 함수 교체가 아님).
- **선행 의존성**: 1단계
- **되돌리기 가능 단위**: 가능. 이동(`moveNodes`)은 3b로 뺐으므로 3a만으로도 조회·생성·수정·삭제·예산은 완결된 기능 단위다.

### 3b. 이동 (다건 → 순차 단건 호출로 재구성)

- **붙일 엔드포인트**: `PATCH /folders/{folderId}`(이동 대상 각각에 순차 호출)
- **영향 화면**: `FDR-2-PAGE-01-0`(이동 대상 선택), `FDR-3-PAGE-01-0`(이동 경로 선택), `FDR-4-SNACKBAR-01-0`
- **제거되는 목 함수**: `moveNodes()`
- **설계 주의**: 서버는 다건 이동 API가 없다(`api-gaps.md` (C)). 체크박스로 여러 개 선택한 뒤 한 번에 옮기는 지금 UI를 유지하려면 선택된 개수만큼 `PATCH`를 순차 호출해야 하고, **일부만 성공했을 때** 사용자에게 뭐라고 보여줄지 새로 설계해야 한다(전부 롤백? 성공한 것만 반영하고 실패 목록 표시?).
- **선행 의존성**: 3a(트리 조회가 먼저 API 기반이어야 이동 후 화면 갱신이 자연스럽다)
- **되돌리기 가능 단위**: 3a와 분리돼 있어 3b만 되돌려도 3a는 안 깨진다 — 부분 실패 UX가 리뷰에서 막히면 이 단계만 보류 가능.

---

## 4단계 — Entry (내역), 단 모임 전체 목록은 제외

### 4a. 타입 통합 (API 연동 없는 순수 리팩터)

- **작업**: `docs/api-type-design.md` §2의 `LedgerTransaction`(folder.ts) + `Transaction`(transaction.ts) → `EntrySummary`/`EntryDetail` 통합. **이 단계는 API를 안 붙인다** — 목 데이터를 유지한 채로 타입과 ID 공간만 먼저 하나로 합친다.
- **왜 따로 떼나**: `amount` 부호 관례 폐지(§type-design 경고 참고)처럼 화면 곳곳의 표시 로직을 건드리는 변경이 API 연동과 섞이면 무엇 때문에 깨졌는지 구분이 안 된다. 리팩터만 먼저 끝내고 화면이 여전히 잘 동작하는지 확인한 뒤 4b로 넘어간다.
- **선행 의존성**: 없음(3단계와 병행 가능)
- **되돌리기 가능 단위**: 독립. API 연동 실패와 무관하게 이 리팩터 자체만으로 커밋/리뷰 가능.

### 4b. 장부 단위 API 연동

- **붙일 엔드포인트**: `GET /ledgers/{ledgerId}/entries`, `POST /ledgers/{ledgerId}/entries`, `GET /entries/{entryId}`, `PATCH /entries/{entryId}`, `DELETE /entries/{entryId}`, `POST /entries/{entryId}/approve`
- **영향 화면**: `FDR-2-PAGE-05-0`(장부 상세 내역), `ADD-1-PAGE-01-0`(내역 추가), `DTB-2-PAGE-02-0`(상세 조회), `DTB-3-MODAL-01-0`(삭제), `DTB-3-PAGE-02-0`(상세 수정 — **4a에서 ID 공간이 합쳐지면서 이 단계 진입 경로 문제가 같이 풀린다**), `DTB-2-PAGE-03-0`(승인, 현재 [미구현]이니 최소 버튼만 추가하는 형태로 같이 고려)
- **제외**: `DTB-1-PAGE-01-0`(내역 메인, 모임 전체 목록)은 대응 API가 없어 이 단계에서 못 붙인다(`api-gaps.md` (A) 최우선 항목). 백엔드에 엔드포인트 추가를 요청하고, 생기면 **5단계로 별도 진행**한다. 그때까지 `getAllTransactions()`/`searchTransactions()`/`applyTransactionFilter()`는 목 데이터로 남는다 — 4a로 타입은 통일됐어도 이 세 함수는 여전히 로컬 배열을 본다.
- **선행 의존성**: 3a(ledgerId), 4a(타입 통합)
- **되돌리기 가능 단위**: 가능. 장부 상세 쪽만 실 API로 바뀌고 내역 탭(DTB-1)은 그대로 목이라, 문제가 생겨도 영향 범위가 장부 상세로 국한된다.

### 4c. 증빙 파일 업로드

- **붙일 엔드포인트**: `POST /files`(purpose=RECEIPT), `DELETE /files/{fileId}`
- **영향 화면**: `ADD-2-SHEET-05-0`(증빙자료 등록), `ADD-1-PAGE-01-0`의 첨부 X 버튼
- **제거되는 것**: 로컬 이미지 URI를 그대로 `receiptImages: string[]`에 넣던 로직 → 업로드 후 받은 `fileId`를 내역 등록 요청에 실어 보내는 흐름으로 교체
- **선행 의존성**: 4b(`receiptFileIds`를 실을 Entry 등록 API가 먼저 붙어 있어야 함)
- **되돌리기 가능 단위**: 가능. 4b가 끝난 상태에서 이 단계만 실패해도 텍스트 필드 중심의 내역 등록/조회는 정상 동작한다(첨부만 빠짐).

> 영수증 스캔(OCR)은 서버 상태가 `시작 전`이라 이 계획에 안 넣는다. `POST /files/{fileId}/ocr`가 준비되면 그때 별도 단계로 붙이고, 그전까지 `utils/mockOcr.ts`는 유지한다.

---

## 5단계 — Dashboard

- **붙일 엔드포인트**: `GET /groups/{groupId}/dashboard`
- **영향 화면**: `DSH-1-PAGE-01-0`
- **제거되는 목 함수**: `MOCK_DASHBOARD_SUMMARY`(단, `quickServices`는 서버에 없는 순수 UI 데이터라 계속 클라이언트에 남는다)
- **선행 의존성**: 1단계뿐. **Dues 도메인이 화면 미구현이어도 이 API는 호출 가능**하다 — 명세에 "`dues`는 회비 도메인 구현 전까지 모두 0"이라고 명시돼 있다. 즉 이 단계는 순서상 여기 안 두고 1단계 직후로 앞당겨도 무방하다(화면이 1개뿐이라 리스크도 작음) — 팀 상황에 따라 2·3·4단계보다 먼저 처리해도 된다.
- **되돌리기 가능 단위**: 독립.

---

## 6단계 — Report / DUE(회비): 화면 신규 개발이 선행돼야 하는 항목

`Report`(3개) API와 `Dues`+`Member`(13개) API는 전부 `구현 완료`지만, **대응 화면 자체가 없다**(`api-gaps.md` (B)). 이건 "붙이는" 단계가 아니라 "화면을 새로 만들고 그 김에 처음부터 API로 짠다"에 가까워서 이 연동 계획의 성격과 다르다.

- Report: 화면 6~7개(보고서 리스트/생성/상세류) 새로 개발 — 개발 즉시 3개 API에 바로 연동 가능한 상태(서버는 이미 준비됨).
- DUE: 화면 28개 새로 개발 — 마찬가지로 개발과 동시에 Dues 8개 + Member 5개 API 연동 가능.

우선순위는 `api-gaps.md` (B) "최우선" 표를 그대로 따르되, 화면 개발 리소스 배정은 이 문서 범위 밖이다.

---

## 7단계(블록) — 백엔드 엔드포인트가 먼저 생겨야 하는 것

`api-gaps.md` (A)의 나머지 항목. 지금은 붙일 API가 없어 착수 불가 — 백엔드팀 확인 후 순서를 다시 잡는다.

- 소셜 로그인·회원가입 (`/api/v1/auth/social/*` 신설 필요)
- 이메일 인증 (Auth 도메인에 엔드포인트 신설 필요)
- 비밀번호 재설정 (Auth 또는 User 도메인에 엔드포인트 신설 필요)
- 모임원(관리자) 강제 내보내기 (GroupMembership에 엔드포인트 신설 필요)
- 알림 목록 (Notification 도메인 자체가 계획에 없음 — 가장 불확실)

---

## 표준 패턴 (1단계 Group에서 확정, 이후 12개 도메인이 따름)

디자인 시안(BILLIGE ETC-2-PAGE-01-0, ETC-4-PAGE-01-0, ETC-4-SHEET-01-0)과
`design-verification.md` §2를 먼저 확인했다 — 로딩/에러/빈 목록 상태를 보여주는
이미지가 하나도 없다(입력/목록 채워진 상태만 있음). 시안이 없으므로 임의로 만들지
않고 최소한의 일관된 형태로 통일했다. 아래 패턴을 다음 도메인에도 그대로 쓴다.

### 로딩

- **목록 전체 조회**(화면 진입 시 1회, 예: `AllGroupsScreen`, `MoreScreen`): 화면
  전체를 중앙 정렬된 안내 텍스트로 대체한다(`TYPOGRAPHY.body2` + `FOREGROUND_DISABLED`,
  `PlaceholderNotice`와 같은 톤). 스피너 컴포넌트가 아직 없고 시안도 없어 텍스트로
  통일 — 스피너가 필요하다고 판단되면 그때 공용 컴포넌트로 뽑는다.
- **제출 액션**(생성/참여 버튼): 기존 `LoginScreen`(Auth, 0단계) 패턴을 그대로 따른다
  — 버튼을 `disabled`로만 바꾸고 라벨/스피너는 바꾸지 않는다. 새 시각 요소를
  추가하지 않아 두 단계가 같은 관례를 공유한다.

### 에러

- **목록 전체 조회 실패**: 로딩과 같은 위치(화면 중앙)에 에러 문구 + "다시 시도"
  버튼(`hierarchy="secondary"`)을 보여준다. 문구는 `constants/apiErrorMessages.ts`의
  `getApiErrorMessage(code)` — 네트워크 자체 실패(`isNetworkError`)면 별도로
  `API_NETWORK_ERROR_MESSAGE`.
- **제출 액션 실패(입력 필드가 있는 화면)**: 화면을 갈아엎지 않고 해당 입력 필드의
  `TextField.error`(또는 기존 필드 에러 슬롯)에 문구를 인라인으로 띄운다.
  `ApiError.fieldErrors`에 그 필드 이름이 있으면 서버가 준 `reason`을 그대로 쓰고,
  없으면 `getApiErrorMessage(code)`로 대체한다(`GroupCreateScreen`의 모임 이름 10자
  제한이 실사용 예). 코드가 애초에 정의 안 된 케이스(`JoinGroupSheet`의 잘못된 초대
  코드 — GroupMembership 명세 §3에 에러 응답 자체가 없음)는 화면이 원래 갖고 있던
  필드 특화 문구로 대체한다.
- **확인 다이얼로그류 액션 실패(입력 필드가 없는 화면) — 2단계에서 패턴 확장**: 권한
  전환·모임 나가기처럼 `Dialog`로 확인만 받는 액션은 인라인으로 띄울 필드가 없다.
  이 경우 그 화면이 이미 갖고 있는 `Snackbar`를 재사용해 에러 문구를 띄운다(성공
  스낵바와 같은 자리, 다른 문구). `MemberProfileSheet`는 `onChanged`(성공)와 별도로
  `onError`(실패) 콜백을 추가로 받아 부모(`GroupManagerScreen`)의 같은
  `showSnackbar`로 흘려보낸다 — 1단계 화면 중엔 이 케이스(입력 필드 없는 확인
  다이얼로그)가 없어서 소급 적용할 화면은 없지만, 다음 도메인부터는 이 갈래를
  기본으로 쓴다.

### 빈 목록

- `PlaceholderNotice`는 문구가 "OO 화면은 준비 중이에요"로 고정돼 있어 **빈 목록에는
  안 맞는다**(기능은 구현됐는데 "준비 중"이라고 하면 거짓말이 된다) — 표준으로
  채택하지 않는다.
- `AllGroupsScreen`은 목록이 비어도 "새로운 모임 추가하기" 카드가 항상 같이 나오므로
  화면이 시각적으로 비지 않는다 — 별도 빈 상태 UI가 필요 없다.
- `MoreScreen`처럼 화면 전체가 "활성 모임"을 전제하는 경우, 목록 조회가 성공했는데도
  활성 모임이 없으면(신규 가입 직후 등) 중앙 정렬 안내 문구 + "모임 만들기/참여하기"
  버튼(`AllGroups`로 이동)을 보여준다.

### 권한 분기 (2단계에서 추가)

- **어디서 들고 있는가**: 화면마다 멤버 목록을 훑어 "내 role"을 다시 계산하지 않는다.
  1단계에서 이미 `GroupSummary.myRole`이 모임 캐시(`types/group.ts`)에 있으므로
  그대로 재사용한다 — `getActiveGroup()?.myRole === 'OWNER'`. 추가 캐시나 추가
  네트워크 호출이 필요 없었다.
- **UI 우선 차단, 서버 응답은 2차 방어**: 총무 전용 액션은 서버 403을 받기 전에
  화면에서 먼저 숨긴다(`MemberProfileSheet`의 권한 설정 섹션, `GroupManagerScreen`의
  초대코드 자동 발급 시도 모두 `viewerIsOwner`로 게이팅). 근거: (1) 버튼을 눌러서
  실패를 보게 하는 것보다 애초에 안 보이는 쪽이 낫다, (2) 서버가 403을 안전망으로
  이미 갖고 있어(§21 "생성·수정 권한 세부") 두 겹으로 막아도 낭비가 아니다. 서버
  403이 오면(캐시가 낡았거나 동시성 문제 등) `handleApiError`가 표준 에러 패턴대로
  스낵바에 문구를 띄운다 — 화면이 깨지진 않는다.
- **나머지 61개 총무 전용 화면에 그대로 복제 가능한 이유**: 모든 도메인 화면이
  `groupId` 컨텍스트 안에서 동작하고, 그 모임의 `myRole`은 이미 1단계 캐시에 있다.
  즉 "이 액션은 총무만" 판단이 필요한 화면은 새 조회 없이
  `getActiveGroup()?.myRole === 'OWNER'` 한 줄이면 된다.

### 페이지네이션 (4단계 Entry에서 확정)

Entry 목록(`GET /ledgers/{ledgerId}/entries`)이 `page`/`size`/`sort`가 있는
첫 도메인이다. Dues·Report도 같은 `page/size` 구조를 쓸 예정이라 여기서
패턴을 정하고 그대로 복제한다.

- **무한 스크롤(FlatList `onEndReached`)로 확정** — "더보기" 버튼 방식은
  채택하지 않았다. 이 프로젝트의 어떤 목록 화면도 "더보기" 버튼을 쓴 적이
  없고(전부 그냥 끝까지 스크롤되는 `FlatList`), 디자인 시안 어디에도 "더보기"
  버튼이 없다 — 새 UI 패턴을 도입할 근거가 없어 기존 관례를 그대로 이었다.
- **구현**: 화면이 `page`/`hasMore`(서버 `last`의 반대)/`isLoadingMore` 세
  상태를 직접 들고 있는다. `onEndReachedThreshold={0.4}` + `onEndReached`에서
  `hasMore && !isLoadingMore`일 때만 다음 페이지를 이어 붙인다. 실패한 다음
  페이지 요청은 조용히 무시한다(전체 화면 에러로 안 띄움 — 이미 보이는 목록은
  그대로 두고, 다시 스크롤하면 재시도된다). 최초 로드(0페이지) 실패만 화면
  전체 에러 상태로 취급한다(로딩/에러 표준 패턴과 동일).
- **캐시 없음**: 페이지네이션 목록은 `types/*.ts`에 캐시를 두지 않는다(3단계까지의
  "그 모임의 전체 목록" 캐시와 성격이 다르다 — 필터·키워드·정렬 조합마다 "0페이지"의
  의미가 달라져서 하나로 캐시할 수 없다). 화면이 자기 조회 조건에 맞는 페이지
  배열을 직접 들고 있고, `entryService`는 매번 서버를 그대로 불러 반환만 한다
  (`types/entry.ts`에 캐시 함수가 없는 이유).
- **필터 변경 시**: 검색어/타입/상태/정렬이 바뀌면 페이지를 0으로 리셋하고
  통째로 다시 부른다(`LedgerSearchScreen`) — 이어 붙이지 않는다.

### 테스트 데이터 정책 (2단계에서 확정)

공유 dev 서버(`52-78-148-114.nip.io`)에 12단계 내내 데이터가 쌓인다. 계정 삭제
API 자체가 없어서(`docs/api-gaps.md` (A) "회원 탈퇴" 참고) 애초에 계정 수를
최소로 유지하는 쪽으로 정했다.

- **계정**: 1단계에서 만든 `billage.group.step1.test@example.com`을 전체 연동
  기간의 **주 계정**으로 고정한다(더 이상 새로 만들지 않음). 다단계 권한
  검증처럼 계정이 2개 이상 필요할 때만 `billage.group.step{N}.{역할}@example.com`
  형태(예: 2단계 `billage.group.step2.member@example.com`)로 보조 계정을 추가한다
  — 도메인마다 새 계정을 만들지 않는다.
- **생성물 이름 규칙**: `Step{단계번호}{PascalCase 이름}` — 1단계의 `Step1Group`이
  선례. 이후 장부·폴더·내역 등도 같은 규칙(`Step3Ledger` 등)을 따른다. 이름만 보고
  어느 단계 검증에서 만든 데이터인지, 지워도 되는지 바로 알 수 있게 하기 위함.
  `Step1Group`은 2단계 권한 검증(초대→가입→권한 전환)에도 그대로 재사용한다 — 새
  모임을 만들지 않는다.
- **정리 시점**: 단계마다 지우지 않는다. 계정을 못 지우는 이상 모임을 지워도 서버에
  더미 유저는 남으므로, 정리는 **전체 12단계 연동이 끝난 뒤 한 번에** 한다(그때
  `DELETE /groups/{groupId}`로 테스트 모임들을 정리 — 계정 자체는 여전히 못 지움).
  진행 중에는 단계별로 만든 모임/장부가 다음 단계의 실데이터 검증에 재사용될 수도
  있으니 오히려 남겨두는 편이 낫다.

### 아직 답이 없는 것 — `design-verification.md` §5-4에 반영 필요

- 위 로딩/에러/빈 상태 전부 "시안 없음 — 기획 확인 필요" 상태다. 스피너 사용 여부,
  에러 화면에 일러스트를 넣을지, 재시도 버튼의 정확한 톤 등은 기획 확인 후 교체한다.

## 요약 순서

```
0. (완료) Auth 이메일 로그인/가입/토큰 재발급
1. (완료) Group (모임 목록·상세·생성·참여)
2. (완료) GroupMembership (모임 관리자, 강제 내보내기 제외)   ← 실기기 2계정 권한 검증 완료
3a. (완료) Folder + Ledger 조회 — 계획 대비 범위를 더 쪼갬: 생성·수정·삭제·예산
    없이 읽기 전용으로 먼저 붙였다(3-A). 목 트리(평평한 배열+parentId)와 서버
    응답(폴더=재귀 트리 1콜, 장부=폴더별 별도 목록)이 완전히 달라 변환 유틸
    (`utils/folderTree.ts`)이 새로 필요했던 게 이유 — 그 변환 로직만 먼저
    검증하고 쓰기를 얹는 순서로 나눴다.
3b. (완료) Folder + Ledger 생성·수정·삭제·예산·다건 이동 — 3-A에서 비활성화해둔
    진입점을 API로 복원(3-B). 폴더 해제는 조건부 구현(최상위+직속 장부 조합만
    차단, docs/api-gaps.md (C) 참고), 다건 이동은 순차 호출+부분 실패 보고로
    구현. 장부 최상위 이동은 명세 미확인이라 UI에서 막음.
4a+4b. (완료) Entry 장부 단위 API 연동 — 계획은 "4a 타입 통합(API 없음) → 4b API
    연동" 2단계였는데 실제로는 한 번에 끝났다: `types/folder.ts`(장부 상세 목
    데이터, `tx-N`)를 실 Entry API로 완전히 대체하고 파일 자체를 지웠더니 그걸로
    이미 "두 소스 통합"이 끝났다(별도 리팩터 커밋이 필요 없었음) — DTB 전체
    목록의 목 데이터(`types/transaction.ts`, `dtb-tx-N`)는 그대로 남는다(모임
    전체 내역 목록 API 자체가 없어서, 아래 4d 참고). `TransactionDetailScreen`/
    `TransactionRegisterScreen`은 id 모양(숫자=실 Entry, `dtb-tx-N`=DTB 목)으로
    두 경로를 구분해 같이 처리한다. 페이지네이션은 무한 스크롤로 확정(표준 패턴
    문서 갱신, Dues·Report도 이 패턴 사용).
4c. (부분 완료) 증빙 파일 업로드 — `services/fileService.ts`(업로드/삭제)는
    만들었지만 실제로 호출하는 화면이 없다: 이 프로젝트에 실 카메라·갤러리
    접근이 없어(전부 mock) 업로드할 진짜 파일 자체가 없다(docs/api-gaps.md
    Entry+File 도메인 공백 참고). 기존에 서버에 있던 증빙(조회·수정 시 전체
    교체로 제외)은 정상 동작 — 새로 첨부하는 것만 막혀 있다.
4d. (남음) Entry 모임 전체 목록 — `DTB-1-PAGE-01-0` 등 "모임 전체 내역" 화면은
    대응 API가 없어(docs/api-gaps.md (A)) 그대로 목 데이터로 남는다. 그 API가
    생기면 별도 단계로 진행한다.
5. Dashboard (1단계 직후로 앞당겨도 무방)
6. Report / DUE 신규 화면 개발 + 연동
7. (블록) 소셜 로그인 / 이메일 인증 / 비밀번호 재설정 / 강제 내보내기 / 알림 — 백엔드 대기
```
