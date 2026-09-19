# API 연동 순서 설계 (api-integration-plan)

`docs/api-mapping.md`(엔드포인트 목록)·`docs/api-gaps.md`(공백)·`docs/api-type-design.md`(타입 변경)를 전제로 한다. 서버는 Auth·User 일부와 신설 2개 도메인(Notification·Statistics)만 `진행 중/미구현`이고 나머지는 대부분 `구현 완료`다 — 그래서 순서를 가르는 기준은 "서버가 됐냐"가 아니라 **화면 간 의존성**(대부분 `groupId` 컨텍스트), **타입 리팩터 선행 여부**, 그리고 2026-09-03 갱신부터는 **명세-대조표 상충 확인(실호출) 선행 여부**다.

각 단계는 그 자체로 리뷰 가능한 크기로 쪼갰다. "목을 한 번에 다 걷어낸다" 같은 단계는 없다.

---

## 실호출 절차 — Swagger도 실제와 다를 수 있다

**명세 txt도 Swagger도 실제 응답과 다를 수 있다. 실호출이 유일한 근거다.**

2026-09-11 Swagger 전수 대조 라운드에서 명세 txt의 "미구현"·"진행 중" 태그가 다수 낡아 있음을
확인하고 Swagger를 새 기준으로 삼았는데, **바로 다음 라운드(2026-09-12)에 Swagger 자체도
틀릴 수 있음이 드러났다** — `GET /archives/{id}`의 실제 응답은 Swagger 문서가 보여준 `summary{}`
래핑 없이 평평한 구조였다(`{archiveId, groupId, title, startDate, endDate, totalIncome,
totalExpense, balance, entryCount, ledgers, createdAt}`). 이걸 Swagger만 보고 타입을 맞춰
`ArchiveDetailScreen`이 실기기에서 진입 즉시 크래시 났다(`docs/design-verification.md` §5-4
"보관함 목록 진입 즉시 크래시" 참고).

그래서 이 프로젝트에서 API 응답 스키마를 확정하는 우선순위는:

1. **실호출(가장 신뢰도 높음)** — 읽기 전용(`GET`)이거나 되돌릴 수 있는 호출은 직접 불러
   응답을 필드 하나까지 대조한다. `api-wiring.md`의 "실호출 확인" 열에 `O`(이번 라운드)
   또는 `기존`(이전 라운드 확인)으로 표시된 것만 이 등급이다.
2. **Swagger 스키마 대조(차선, 완전히 못 믿음)** — 파괴적이라 실호출이 불가능한 것만
   이 등급으로 남긴다(`api-wiring.md`에 `Swagger` 또는 `-`로 표시). 화면을 그 타입에
   맞춰 만들 순 있지만, 서버 응답 구조에 조금이라도 의문이 들면(중첩 래핑, 선택적 필드
   등) 안전한 다른 호출로 우회 확인할 방법이 있는지부터 찾는다.
3. **명세 txt(가장 신뢰도 낮음)** — 이번 두 라운드 모두 명세 txt의 상태 태그가 낡아
   있었다는 게 반복 확인됐다. 화면 존재 여부·문구 판단엔 쓰되, API 응답 스키마의
   최종 근거로는 쓰지 않는다.

**파괴적이라 실호출을 못 하는 것**(`DELETE /auth/me` 등 계정·데이터를 실제로 지우는 호출)은
Swagger 스키마만 믿고 코드를 맞춰둔 뒤, `docs/backend-requests.md`에 "컨트롤러/DTO 기준으로
확인해달라"고 명시적으로 요청해 남겨둔다 — 실호출로 검증했다고 스스로도, 다음 세션에게도
착각하게 두지 않는다.

---

## 현황 (2026-09-03, 명세 전면 갱신 + 7-A 완료 시점)

`API 공통 규칙.txt`만 미갱신, 나머지 15개 도메인 전면 갱신 + `Notification & Support`·`Statistics` 2개 신설. 대부분의 도메인이 서버 준비 완료 상태로 바뀌어, 이제 순서를 가르는 기준은 "코드 수정이 필요한가 / 화면부터 새로 만들어야 하는가 / 여전히 막혀 있는가" 세 갈래다. 상세 근거는 `docs/api-gaps.md`(해결됨/유효/판단 불가 3단 구조).

### 도메인별 상태표

| 도메인 | 서버 상태 | 프론트 연동 상태 | 남은 일 |
|---|---|---|---|
| Auth | 이메일 로그인/가입/재발급 완료. 이메일인증·비번재설정·탈퇴 **명세는 신설**됐으나 서버 `미구현` | 이메일 로그인/가입/재발급 연동 완료(0단계). 소셜로그인은 대조표 확인상 **이미 정상 연결**(주석만 낡음) | (a) 소셜로그인 주석 정정. 나머지는 (c) 서버 대기 |
| User | `GET/PATCH /auth/me`(경로 정정) `진행 중` | 화면 자체 없음 | (b) 화면 신규(내 프로필/변경) |
| Group | 구현 완료 | 연동 완료(1단계) | (b) 화면 신규(프로필변경/삭제) |
| GroupMembership | 구현 완료. 강제 내보내기·초대코드 조회 **신규로 전부 채워짐** | 연동 완료(2단계)이나 **정렬·email·응답형태·초대코드 조회 미반영** | **(a) 최우선** — 코드가 낡은 가정 위에 있음 |
| Folder | 1~4 구현 완료, `folder-items`/`move` **상태 상충**(명세 미구현 vs 대조표 완료), 5(archive) 시작 전 | 1~4 연동 완료(3-A/3-B) | 판단 불가(실호출 후 (a) 여부 결정) |
| Ledger | 구현 완료, 전체 목록·`createdAt` 신규 반영 | 연동 완료(3-A/3-B, 전체 목록은 6-B에서 이미 사용 중) | (a) `createdAt` 미반영 |
| Entry | 구현 완료. **모임 전체 목록 신규**(핵심 공백 해소), 담당자 필드 신규 | 부분 연동(4-A) — 장부 단위 완료, 담당자 미전송 **→ 담당자 전송은 2026-09-05, 모임 전체 목록 전환은 4-B(2026-09-05)에서 코드 반영 완료** | ~~**(a) 최우선** — 전체 목록 전환 + 담당자 전송~~ 완료 |
| File | 구현 완료. 증빙 앨범 **상태 상충** | 서비스 계층만 존재, 실호출 없음 | (c) 네이티브 의존성 블록 |
| OCR | 시작 전 | `utils/mockOcr.ts` 스텁 | (c) 서버 대기 |
| Dashboard | 구현 완료. 캘린더·마감임박회비·알림뱃지 3블록 **신규**(미구현 태그) | 연동 완료(5단계), 신규 3블록 미반영 | (a)/(b) 혼합 — 필드 반영은 (a), 캘린더 전체보기 화면은 (b) |
| Dues | 구현 완료(8개) + 일괄변경 신규 1건. **`startDate` 등 4개 필드가 상태 상충** | 부분 연동(6-A/6-B/7-A/7-B-1) — 목록/상세/생성/수정/삭제/마감 완료, 일괄 납부변경(체크박스+CTA)만 남음(7-B-2) | ~~**판단 불가 최우선** — 회비 생성이 지금 깨져 있을 수 있음~~ **2026-09-05 재확인 결과 재현 안 됨(아래 backend-requests.md 1-1 참고)** — (b) 7-B-2 화면 신규만 남음 |
| Member | 구현 완료(5개, tags 모순 미해소) | 부분 연동(7-A) | (b) 수정·삭제 화면(7-B) |
| Report | 구현 완료(3개), `reportType` 분기 **상태 상충** | 화면 자체 없음 | (b) 화면 신규 + 판단 불가(분기 방식) |
| Notification & Support | **신설, 전체 미구현** + 런칭 범위 기획 판단 대기 | 화면은 있으나(알림 목록) 스텁, 나머지 화면 없음 | (c) 서버 대기 + 기획 결정 |
| Statistics | **신설, 전체 미구현** | 화면 자체 없음 | (c) 서버 대기 |

### (a) 코드 수정 필요 — 낡은 가정 위에 짠 것 (우선순위순, 사용자에게 실제로 깨져 보이는 것이 위)

1. **회비 생성이 지금 100% 400으로 실패한다(2026-09-04 실호출로 확정)** — `POST /groups/{groupId}/dues`는 `startDate` 없이 부르면 `INVALID_REQUEST(400)`을 그대로 준다(`fieldErrors: [{field:"startDate", reason:"시작일은 필수입니다."}]`). `DuesCreateScreen.tsx`(6-B)는 `startDate`를 안 보내므로 지금 이 화면으로 회비를 하나도 못 만든다 — 이 프로젝트에서 사용자에게 가장 직접적으로 보이는 파손. `SCHEDULED` 상태도 같이 확정(미래 `startDate` 회비가 정확히 그렇게 옴) — 명세 "미구현" 태그가 낡은 것이었다. 요청/응답 전문은 `docs/api-gaps.md` "확정됨" 절. (대상자 목록의 `amount` 필드, 일괄 납부변경 API는 이번 실호출 3건 예산 밖이라 여전히 미확인.)
2. ~~**Entry 담당자 미전송**~~ — **코드 반영 완료(2026-09-05)**: `managerUserId` 등록·수정·상세 표시 전부 연결. `entryService.ts`/`types/entry.ts`/`TransactionRegisterScreen.tsx`/`TransactionDetailScreen.tsx` 참고.
3. ~~**Entry 모임 전체 목록 미전환**~~ — **코드 반영 완료(2026-09-05, 4-B)**: `GET /groups/{groupId}/entries`로 DTB 전체 계열(메인/검색/필터/장부 다중선택)을 전부 옮겼다. 4-B 정리(같은 날) 때 옛 목 데이터(`types/transaction.ts`)와 `TransactionRegisterScreen`/`TransactionDetailScreen`의 `editMock`/DTB-목 분기도 도달 불가능함을 확인 후 함께 삭제했다.
4. **초대코드 발급→조회 전환** — `GET .../invitations/current` 생겼으니 "진입 시 발급 시도" 로직을 "조회, 없으면(총무만) 발급"으로 교체.
5. **GroupMembership 정렬·email·응답형태** — 목록 정렬(총무 우선)과 `email` 노출, `PATCH` 응답 캐시 갱신 3건을 한 번에 정리할 만하다.
6. **Ledger `createdAt` 반영** — 카드 서브타이틀을 예산 상태 대신 생성일로.
7. **Folder 해제 차단 UI 재검토** — `folder-items` 상태 상충 확정 후, 되면 최상위+직속장부 차단 분기를 걷어낼 수 있다.

### (b) 화면 신규 구현 — 서버·디자인 준비 상태 (`design-verification.md` 기준, 크기순)

| 순서 | 항목 | 화면 수 | 디자인 시안 | 비고 |
|---|---|---:|---|---|
| 1 | `ETC-4-MODAL-04-0` 로그아웃 | 1 | 1장, 완료 | `authService.logout()` 이미 완성 |
| 2 | `ETC-3-MODAL-02-0` 모임 삭제하기 | 1 | 4장, 완료 | — |
| 3 | `ETC-3-PAGE-01-0` 모임 프로필 변경 | 1 | 7장, 완료 | Group + File(GROUP_IMAGE) |
| 4 | `ETC-4-MODAL-03-0` 모임 내보내기 | 1 | 1장, 완료 | **이번에 API 신설로 재개 가능** — `MemberProfileSheet.tsx`에서 2단계 때 보류해 둔 메뉴, `docs/design-verification.md`의 `[구현→보류]` 표기를 되돌릴 것 |
| 5 | `ETC-3-PAGE-07-0`/`ETC-4-PAGE-15-0` 내 프로필·프로필 변경 | 2 | 2장/3장, 완료 | User API `진행 중` — 완료돼야 착수 |
| 6 | DUE 나머지(7-B) — `DUE-3-PAGE-03-0`(모임원 상세) 등 | 약 12 | **거의 전 화면 이미지 확보**(`npm run design-index` 재실행 결과 12/28 → 30개 Screen ID 인덱싱, 사실상 100%에 근접) | 6-A/6-B/7-A/**7-B-1(회비 수정·삭제·마감, 2026-09-05 완료)**로 4개 추가 완료, 남은 것은 모임원 상세/수정/삭제·개인 납부내역·**일괄 납부변경(7-B-2)** |
| 7 | Report 전체 | 약 13~15행(변형 포함) | 전 화면 이미지 있음(1~13장), 2건만 진행/예정 | `reportType` 분기 상태 상충(판단 불가) 확인 후 생성 화면 착수, 목록·상세는 바로 가능 |

7-A 이전 "6(DUE)이 디자인 자산 43%만 확보돼 있어 겉보기보다 어렵다"던 평가는 **더 이상 유효하지 않다** — 이번 명세 갱신과 함께 DUE 이미지가 대거 반입됐다(`scripts/build-design-index.js` 재실행으로 확인).

### (c) 여전히 막힌 것

- **네이티브 의존성**: 증빙 촬영·갤러리 선택 실접근, File 업로드 실연결, OCR 스캔 — 이미지 라이브러리가 없는 한 불가. 서버는 이미 다 준비돼 있어 프론트 단독 과제.
- **서버 미구현(명세는 있음)**: 이메일 인증, 비밀번호 재설정/변경, 회원 탈퇴, 알림(Notification), 통계(Statistics), 고객지원(공지/약관/FAQ/문의). 이번 갱신으로 전부 **명세는 구체화**됐으나 구현은 아직 — 백엔드 착수를 기다리는 것 외에 프론트가 할 일 없음.
- **기획 판단 대기**: 알림 도메인 런칭 범위 포함 여부, 고객지원 백오피스 부재 시 대체 방안(정적 파일/메일 링크), 마감된 회비 "회비 수정" 메뉴 처리(서버 열지 메뉴 뺄지).

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
  **→ API 신설 확인 후 4-B(2026-09-05)에서 별도 단계로 진행 완료.** `getAllTransactions()`/`searchTransactions()`/`applyTransactionFilter()`는 실 API(`entryService.getGroupEntries()`)로 대체하며 제거했고, `types/transaction.ts` 자체도 이어진 정리 라운드에서 삭제했다(아래 4d 참고).
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

`Report`(3개) API와 `Dues`+`Member`(13개) API는 전부 `구현 완료`지만, 이 문서 작성 시점엔 **대응 화면 자체가 없었다**(`api-gaps.md` (B)). 이후 화면을 실제로 새로 만들면서 처음부터 API로 짜는 방식으로 진행 중이다(아래 6-A/6-B/7-A).

- Report: 화면 6~7개(보고서 리스트/생성/상세류) 아직 미착수 — 개발 즉시 3개 API에 바로 연동 가능한 상태(서버는 이미 준비됨).
- DUE: 화면 28개 중 진행 상황:
  - **6-A(완료)**: `DUE-1-PAGE-01-0`(납부관리 메인), `DUE-2-PAGE-03-0/1`(회비 상세, 3개 상태 변형) — 조회 전용.
  - **6-B(완료)**: `DUE-2-PAGE-01-0`(회비 생성), `DUE-3-PAGE-01-0`(모임원 선택) — 쓰기.
  - **7-A(완료)**: `DUE-2-PAGE-02-0`(모임원 관리 목록), `DUE-3-SHEET-02-0`(모임원 추가 선택), `DUE-4-PAGE-01-0`(개별 추가, 태그 입력 `DUE-5-PAGE-01-0` 내부 스텝 포함), `DUE-4-PAGE-02-0`(일괄 추가).
  - **미착수(7-B 예정)**: `DUE-3-PAGE-03-0`(모임원 상세), `DUE-4-MODAL-01-0`(모임원 삭제 확인) 및 목록 화면의 삭제 모드, `DUE-4-PAGE-03-0`(모임원 수정), `DUE-4-PAGE-04-0`/`DUE-5-PAGE-02-0`(개인 납부 내역), 회비 마감/미납자 요청 공유 등.

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

### `Step1Group` 계정 사용 불가 판명, 대체 계정 생성 (2026-09-04)

`billage.group.step1.test@example.com`으로 로그인 시도한 결과 서버에 **이메일은 이미 존재**하지만
(`POST /auth/signup` → `409 EMAIL_ALREADY_EXISTS`) 비밀번호를 아무도 갖고 있지 않다 — 사용자
확인 결과 "회원가입이 안 돼서 못 만들었다"(가입 자체가 처음부터 실패했다고 알고 있었으나, 실제로는
그 시도 중 계정만 만들어지고 그 사실이 공유되지 않은 것으로 보인다). 이 프로젝트엔 비밀번호 재설정
API가 없어(`docs/api-gaps.md` — 이메일 인증·비번재설정 전부 서버 `미구현`) 복구 불가능하다.
**`Step1Group`은 죽은 계정으로 취급하고 더 쓰지 않는다** — 이 문서 위쪽의 "1단계에서 만든 계정을
주 계정으로 고정" 서술은 실제로는 한 번도 성립한 적이 없었다(문서만 그렇게 믿고 있었음).

2026-09-04 실호출 검증(§api-gaps.md "확정됨" 절, Dues `startDate`/`SCHEDULED`, Entry 전체 목록
3건)에 새 계정을 만들어 썼다:

| 항목 | 값 |
|---|---|
| 계정(총무) | `billage.verify.dues.test@example.com` / `userId: 6` |
| 모임 | `VerifyDues` / `groupId: 2` |
| 폴더 | `VerifyFolder` / `folderId: 1` |
| 장부 | `VerifyLedger` / `ledgerId: 1`, 예산 1,000,000원 |
| 모임원 | `Verify1` / `memberId: 1` |
| 내역 | `VerifyEntry`(지출 25,000원) / `entryId: 1` — **정리 안 함**(정책상 유지) |
| 회비(검증용, 정리 완료) | `duesId 1·2·3` — 확인 직후 `DELETE`로 전부 제거, 목록 재조회로 빈 상태 확인함 |

비밀번호는 이 문서에 기록하지 않았다(세션 내에서만 사용) — 그런데 바로 이 판단 때문에
`Step1Group`처럼 **다음 세션에서 못 쓰는 계정이 또 나올 뻔했다**. 아래부터는 예외적으로 비밀번호를
그대로 적는다(비번 재설정 API가 없어 유실 시 복구 불가 — 기록 안 하는 쪽의 리스크가 더 크다고
판단 변경).

| 계정 | 값 |
|---|---|
| 총무 | `billage.verify.dues.test@example.com` / 비밀번호 `Billage1!Verify` / `userId: 6` |
| 일반(MEMBER) | `billage.verify.member.test@example.com` / 비밀번호 `Billage1!Member` / `userId: 7` — 2026-09-05 생성, `VerifyDues`에 `membershipId: 5`로 참여(`role: MEMBER`, `GET /groups/2/memberships` 확인) |
| 두 번째 계정(2026-09-13) | `billage.verify.newcheck9999@example.com` / 비밀번호 `Password123!` / `userId: 9`, 이름 `새계정확인` — **`POST /auth/signup` 직접 호출로 생성, 이메일 인증(발송이 `MAIL_SEND_FAILED`로 막혀 있어 인증 자체가 불가)을 거치지 않은 상태.** 로그인은 인증 여부와 무관하게 정상 동작함을 확인(`scripts/api-call.js`로 검증). `groupId 6`("탈퇴테스트모임", `VerifyDues`가 단독 총무)에 `membershipId 11`로 참여(`role: MEMBER`) — `COM-2-PAGE-04-0`(탈퇴하기 > 권한 넘기기) 캡처용으로 이 조합을 만들었다. 계정 두 개가 필요한 다른 검증에도 재사용할 것. |

**이 두 계정이 새 주 계정이다** — 다음 라운드부터 `billage.group.step{N}...` 대신 이 계정들과
`VerifyDues` 모임을 재사용할 것. `Step1Group` 이름 규칙 자체는 유효하니, 앞으로 새 계정이
필요하면 `billage.verify.{용도}.test@example.com` 형태를 따른다.

### 초대코드 신설 엔드포인트 실호출 검증 (2026-09-05)

MEMBER 계정을 참여시키며 `GET /groups/{groupId}/invitations/current`(2026-09-01 신설, 그때까지
미검증)와 초대코드 발급 멱등성을 같이 확인했다.

1. `GET /groups/2/invitations/current` (그룹 생성 후 최초 호출, 발급 이력 없음) → `200`,
   `invitationCode: "VGBRT9NVKD"` — **코드가 없어도 총무면 자동 발급하고 즉시 반환**함을 확인
   (`INVITATION_NOT_FOUND`가 아니었다 — 명세의 "코드가 없을 때 새로 만드는 것은 총무만" 조항대로).
2. 같은 API를 곧바로 재호출 → 같은 코드(`VGBRT9NVKD`)를 그대로 반환.
3. `POST /groups/2/invitations`(발급 API)를 이어서 호출 → 이 역시 **같은 코드**를 반환(`201`이지만
   메시지만 "생성" 취급, 실제로는 새로 안 만듦).

**→ 3번 다 같은 코드.** 발급 멱등성(2026-09-01)과 조회 API 신설(2026-09-01) 둘 다 명세대로
동작함을 실호출로 확정 — `docs/api-gaps.md` "해결됨" 절의 초대코드 항목을 "실호출로 확인 완료"로
갱신했다. 코드 반영(진입 시 발급 시도 → 조회로 교체)은 아직 안 함, 다음 라운드 대상.

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
    **→ 4-B(아래) 이후 이 id-모양 분기 자체가 사라졌다.**
4c. (부분 완료) 증빙 파일 업로드 — `services/fileService.ts`(업로드/삭제)는
    만들었지만 실제로 호출하는 화면이 없다: 이 프로젝트에 실 카메라·갤러리
    접근이 없어(전부 mock) 업로드할 진짜 파일 자체가 없다(docs/api-gaps.md
    Entry+File 도메인 공백 참고). 기존에 서버에 있던 증빙(조회·수정 시 전체
    교체로 제외)은 정상 동작 — 새로 첨부하는 것만 막혀 있다.
4d. (완료, 2026-09-05) Entry 모임 전체 목록 — `GET /groups/{groupId}/entries`
    API가 신설되면서 `DTB-1-PAGE-01-0`(내역 메인)/`DTB-2-PAGE-01-0`(검색)/
    `DTB-2-SHEET-01-0`(필터)/`DTB-3-SHEET-02-0`(장부 다중선택)을 전부 실 API로
    옮겼다(4-B). 응답이 `{summary, entries}` 한 번에 오는 걸 그대로 살려 잔액
    카드·목록을 같은 호출에서 채운다(중복 호출 없음). 장부 목록도
    `getTransactionLedgerOptions()`(목) 대신 `ledgerService.getAllLedgersInGroup()`
    실 API로 교체.
4e. (완료, 2026-09-05) 4-B 정리 — 4-B 직후 확인 라운드에서 `dtb-tx-N` 목 id를
    만들어내는 곳이 더는 없음을 grep·라우트·딥링크(`NavigationContainer`에
    `linking` 설정 자체가 없음)·스토리북까지 확인하고, `TransactionRegisterScreen`/
    `TransactionDetailScreen`의 `editMock`/DTB-목 분기와 `types/transaction.ts`
    파일 자체를 삭제했다. 그중 여전히 쓰이던 `TransactionFilterValue`류는
    `types/entry.ts`로(`EntryListFilterValue`로 개명), `todayKey()`는
    `utils/calendarGrid.ts`로 옮겼다(둘 다 mock 전용이 아니라 실 코드 여러
    곳 — Dues 화면 포함 — 이 쓰고 있어서 그대로 지우면 빌드가 깨졌을 것).
5. Dashboard (1단계 직후로 앞당겨도 무방)
6. Report / DUE 신규 화면 개발 + 연동
7. (블록) 소셜 로그인 / 이메일 인증 / 비밀번호 재설정 / 강제 내보내기 / 알림 — 백엔드 대기
```
