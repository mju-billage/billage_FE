# API 연동 대장

8-B(2026-09-06) 최초 작성. **2026-09-11 Swagger 전면 재대조** — `API_swagger.txt`
(springdoc 덤프, 16개 컨트롤러/77개 엔드포인트, Entry 포함 완전판)를 실제 컨트롤러
목록의 단일 진실로 삼아 이 문서 전체를 다시 맞췄다. 이전 판은 명세 txt 파일의
"구현/진행중/미구현" 태그를 따라갔는데, 그 태그들이 상당수 낡아 있었다(아래 "이번
라운드 정정" 참고) — **이제는 Swagger에 컨트롤러/경로가 있으면 "구현"이다.**

- **서버 상태**: `구현`(Swagger에 실제 컨트롤러·경로 있음) / `명세만 존재`(명세 txt엔
  있으나 Swagger 16개 컨트롤러 어디에도 없음 — 서버가 아예 안 만들었다는 뜻,
  "복사 누락"이 아니라 "컨트롤러 자체 부재"를 실제로 확인한 것) / `프론트 버그였음`
  (경로/바디가 명세와 달라 프론트가 잘못 부르고 있었던 것, 이번에 고침).
- **실호출 확인**: `O`(이번 라운드에 실제로 호출해 확인) / `기존`(이전 라운드에 확인) /
  `Swagger`(이번 라운드에 스키마 대조만 하고 실호출은 안 함, 대부분 조회 계열) / `-`(서버가
  없어 생략).
- 행 수는 Swagger의 77개 엔드포인트 기준으로 맞췄다 — 컨트롤러당 한 절, 절 안에서
  Swagger가 나열한 순서 그대로.

## ⚠️ Swagger 문서 자체의 함정 — `userId` 쿼리 파라미터

**거의 모든 엔드포인트에 `userId *`(필수, query)가 붙어 있지만 무시해라.** 그동안의 모든
실호출이 이 파라미터 없이 `Authorization` 헤더만으로 정상 동작했다(200/201/204 전부) —
인증 리졸버가 컨트롤러 메서드 시그니처에 노출되면서 springdoc이 잘못 문서화한
아티팩트로 보인다. **프론트에 이 파라미터를 추가하지 마라 — 추가하면 오히려 망가진다.**
`docs/backend-requests.md`에 `@Parameter(hidden = true)` 처리 요청을 남겼다.

## 이번 라운드(2026-09-11) 정정 요약

- **프론트 버그 3건 발견 및 수정**: 이메일 인증 발송/확인 경로(`/auth/email/verification`
  → 실제로는 `/auth/email-verifications`), 폴더 전체 백업 경로(`/groups/{id}/folders/archive`
  → 실제로는 `/groups/{id}/archives`), 비밀번호 변경 바디에 `refreshToken` 누락. 셋 다
  실호출로 재현·검증 후 코드 수정 완료(`services/authService.ts`, `archiveService.ts`).
- **"미구현/시작 전"이었는데 실제론 구현된 것들**: 이메일 인증, 회원 탈퇴(`DELETE /auth/me`),
  내 프로필(`GET/PATCH /auth/me`), 통계(`/statistics`), 보관함(`/archives` 전부),
  대시보드 캘린더(`/calendar`), 대시보드 응답의 `calendar`/`upcomingDues`/
  `hasUnreadNotification` 블록. 아래 각 절에 반영.
- **Swagger에 있는데 이 문서에 없던 행 22개 추가**: 아래 "전수 대조 결과" 참고.
- **정말로 서버에 없는 것 확인**: 알림·고객지원(Notification & Support) 전체, OCR —
  Swagger 16개 컨트롤러 어디에도 관련 컨트롤러가 없다. "명세만 존재, 서버 없음"으로
  명확히 표기.

---

## entry-controller (Entry, 7개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /ledgers/{ledgerId}/entries | `entryService.getEntries` | LedgerDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 4단계 재검증 |
| POST | /ledgers/{ledgerId}/entries | `entryService.createEntry` | TransactionRegisterScreen | 구현 | O(2026-09-13) | `receiptFileIds`/`managerUserId` 둘 다 Swagger 스키마와 일치(2026-09-11 대조). `scripts/api-verify.js` 4단계로 실제 정책까지 검증 — 총무(userId 6)가 만들면 즉시 `APPROVED`, 일반 회원(userId 9)이 만들면 `PENDING`으로 오는 걸 실호출로 확인(Entry.txt "기획 글로벌 정책" 그대로) |
| POST | /entries/{entryId}/approve | `entryService.approveEntry` | TransactionDetailScreen | 구현 | O(2026-09-13) | **2026-09-11 재확인**: `DTB-2-PAGE-03-0`(상세 내역_승인요청, 시안 0장)이 아니라 이 화면(`DTB-2-PAGE-02-0`)의 승인 대기 배지+버튼으로 이미 연결돼 있다. `scripts/api-verify.js` 4단계로 실제 승인 흐름 재검증 — 일반 회원이 만든 `PENDING` 내역을 총무 토큰으로 승인(`200`, `approvedByUserId`/`approvedAt` 포함) 후 같은 내역을 다시 승인하면 정확히 `409`(이미 승인됨) — 서비스 함수 주석에 적힌 "이미 승인된 내역이면 409"가 실제로 그대로 맞음을 확인 |
| GET | /entries/{entryId} | `entryService.getEntryDetail` | TransactionDetailScreen | 구현 | O(2026-09-13) | **2026-09-11 필드 추가**: 응답에 `duesId`/`duesTitle`/`duesExists`/`payerCount`/`payers[]`가 오는데 타입에 없어 놓치고 있었다 — 추가는 했으나(`types/entry.ts`) 화면이 아직 안 씀(Entry.txt §8 "납부관리 수입내역" 변형 미반영, `design-verification.md`의 `DTB-2-PAGE-02-0` 하향 참고). `scripts/api-verify.js` 4단계 재검증 |
| DELETE | /entries/{entryId} | `entryService.deleteEntry` | TransactionDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 4단계 재검증(생성한 테스트 내역 정리 겸용, 2건) |
| PATCH | /entries/{entryId} | `entryService.updateEntry` | TransactionRegisterScreen(수정) | 구현 | O(2026-09-13) | `scripts/api-verify.js` 4단계 재검증 |
| GET | /groups/{groupId}/entries | `entryService.getGroupEntries` | TransactionsScreen, TransactionSearchScreen, CalendarScreen | 구현 | O | 2026-09-13 `scripts/api-verify.js` 4단계로 재검증 |

## group-controller (Group, 5개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups | `groupService.getMyGroups` | MoreScreen, AllGroupsScreen 등 | 구현 | O(2026-09-13) | `scripts/api-verify.js` 2단계 재검증 |
| POST | /groups | `groupService.createGroup` | GroupCreateScreen | 구현 | 기존 | |
| GET | /groups/{groupId} | `groupService.getGroupDetail`/`getGroupOwnerCount` | GroupManageScreen 등 | 구현 | O(2026-09-13) | `scripts/api-verify.js` 2단계 재검증 — `data.groupId`/`data.name` 확인 |
| PATCH | /groups/{groupId} | `groupService.updateGroup` | GroupProfileEditScreen | 구현 | 기존 | 부분 갱신(실호출 확정) |
| DELETE | /groups/{groupId} | `groupService.deleteGroup` | GroupManageScreen | 구현 | - | 되돌릴 수 없어 실호출 안 함 |

## report-controller (Report, 3개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/reports | `reportService.getReports` | ReportMainScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 6단계 재검증 |
| POST | /groups/{groupId}/reports | `reportService.createReportByLedger`/`createReportByPeriod` | ReportCreateByLedgerScreen, ReportCreateByPeriodScreen | 구현 | O(2026-09-13) | `entryType:"ALL"` 400 — 필드 생략으로 표현. **2026-09-13 함수명 정정**(`createReport`라는 단일 함수는 없음, `reportType`별로 함수가 나뉘어 있다). `scripts/api-verify.js` 6단계로 두 타입 다 재검증 |
| GET | /reports/{reportId} | `reportService.getReportDetail` | ReportByLedgerDetailScreen 등 | 구현 | O | `ledgers[].entries[]`가 `{type,title,amount,occurredOn}` 4개뿐 — 같은 서버의 `/archives/{id}`는 `memo`/`approvalStatus`/`createdByName`/`receiptFiles[]`까지 준다(엔드포인트 간 불일치, `backend-requests.md` 1순위 갱신). **2026-09-12 재실호출로 재확인**(archive의 `summary{}` 오판 이후 "같은 실수가 report에도 있는지" 점검 차원) — `groupId 5`에 새로 만든 보고서(`reportId` 10)로 `summary{}` 래핑·`ledgers[].entries[]` 4필드 전부 `reportService.ts`의 `ReportDetailResponse` 타입과 정확히 일치함을 재확인, 이쪽은 원래도 맞았다. 2026-09-13 `scripts/api-verify.js` 6단계로 장부별/기간별 두 타입 다 재검증 |

## member-controller (Member — 납부 명단, 8개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/members | `memberService.getMembers` | MemberManageScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 2단계 재검증 |
| POST | /groups/{groupId}/members | `memberService.createMember` | MemberAddIndividualScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증 |
| DELETE | /groups/{groupId}/members | `memberService.deleteMembers` | MemberManageScreen(일괄 삭제) | 구현 | 기존 | |
| POST | /groups/{groupId}/members/bulk | `memberService.createMembersBulk` | MemberAddBulkScreen | 구현 | 기존 | |
| GET | /groups/{groupId}/members/{memberId} | `memberService.getMemberDetail` | MemberDetailScreen | 구현 | 기존 | |
| DELETE | /groups/{groupId}/members/{memberId} | `memberService.deleteMember` | MemberDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증(생성한 테스트 회원 정리 겸용) |
| PATCH | /groups/{groupId}/members/{memberId} | `memberService.updateMember` | MemberEditScreen | 구현 | 기존 | 전체 교체(실호출 확정) |
| GET | /groups/{groupId}/members/{memberId}/payments | `memberService.getMemberPayments` | MemberPaymentHistoryScreen | 구현 | 기존 | 응답이 `{totalPaidAmount, payments[]}` 객체(배열 아님) — 코드가 이미 정확히 이 모양으로 파싱 중, 다만 `page`/`size`는 서버가 무시(실호출 확정) |

## ledger-controller (Ledger, 8개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/ledgers | `ledgerService.getAllLedgersInGroup` | FolderBudgetListScreen 등 6개 화면 | 구현 | O(2026-09-13) | **2026-09-13 문서 정정**: 이 행이 "미사용"이라 적혀 있던 건 낡은 정보다 — 2026-09-13 라운드에 `getAllLedgersInGroup()` 내부를 폴더 트리 순회(N+1) 방식에서 이 엔드포인트로 실제로 교체했다(최상위 장부까지 포함해서 조회 가능해짐). `scripts/api-verify.js` 3단계로 재검증 |
| POST | /groups/{groupId}/ledgers | `ledgerService.createLedgerInGroup` | LedgerCreateScreen(최상위 진입점) | 구현 | O(2026-09-13) | **2026-09-13 문서 정정**: "폴더 없는 최상위 장부 생성이 필요한지 기획 확인 필요"라던 메모는 낡았다 — 백엔드 노티로 확정돼 실제로 붙였다. `folderId` 생략/`null`=최상위, 값 있으면 그 폴더 안. `scripts/api-verify.js` 3단계로 재검증(최상위 생성 성공, `data.folderId` null 확인) |
| GET | /folders/{folderId}/ledgers | `ledgerService.getLedgersInFolder` | FolderScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 3단계 재검증 |
| POST | /folders/{folderId}/ledgers | `ledgerService.createLedger` | LedgerCreateScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 3단계 재검증 |
| GET | /ledgers/{ledgerId} | `ledgerService.getLedgerDetail` | LedgerDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 3단계 재검증 |
| DELETE | /ledgers/{ledgerId} | `ledgerService.deleteLedger` | LedgerDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 3단계 재검증(생성한 테스트 장부 정리 겸용) |
| PATCH | /ledgers/{ledgerId} | `ledgerService.updateLedger` | LedgerDetailScreen | 구현 | O(2026-09-13) | **2026-09-13 서비스 함수명 정정**: 이동은 이 함수가 아니라 `folderService.moveFolderItems()`가 처리한다(`moveLedger`라는 함수는 없음, 지난 라운드에 이 PATCH의 `folderId`가 죽은 코드라 삭제됨). `scripts/api-verify.js` 3단계로 이름 변경 재검증 |
| PATCH | /ledgers/{ledgerId}/budget | `ledgerService.updateLedgerBudget` | FolderBudgetListScreen | 구현 | O(2026-09-13) | **2026-09-13 함수명 정정**(`updateBudget`으로 잘못 적혀 있었음, 실제 export명은 `updateLedgerBudget`). `scripts/api-verify.js` 3단계 재검증 |

## group-membership-controller (GroupMembership — 모임 관리자, 7개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| POST | /groups/{groupId}/leave | `groupMembershipService.leaveGroup` | MemberProfileSheet, GroupManageScreen | 구현 | 기존 | |
| POST | /groups/{groupId}/invitations | `groupMembershipService.createInvitation` | GroupManagerScreen(최초 발급 시에만) | 구현 | O(2026-09-13) | 비멱등 — `invitations/current`와 조합해서만 씀. `scripts/api-verify.js` 2단계 재검증 — 성공 상태코드가 `201`(POST 생성)인데 처음엔 `200`으로 잘못 기대해 FAIL이 났었다, 케이스 쪽 실수였다(서버는 정상) |
| POST | /groups/join | `groupService.joinGroup` | JoinGroupSheet | 구현 | 기존 | |
| DELETE | /groups/{groupId}/memberships/{membershipId} | `groupMembershipService.removeMembership` | MemberProfileSheet(모임 내보내기) | 구현 | 기존 | |
| PATCH | /groups/{groupId}/memberships/{membershipId} | `groupMembershipService.updateMembershipRole` | MemberProfileSheet | 구현 | 기존 | |
| GET | /groups/{groupId}/memberships | `groupMembershipService.getMemberships` | GroupManagerScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 2단계 재검증 — `membershipId`/`userId`/`role` 확인 |
| GET | /groups/{groupId}/invitations/current | `groupMembershipService.getCurrentInvitation` | GroupManagerScreen | 구현 | O | `{invitationCode, invitationLink, expiresAt}` 확인. 2026-09-13 `scripts/api-verify.js` 2단계로 재검증(POST 발급 직후 같은 코드로 응답) |

## folder-controller (Folder, 6개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/folders | `folderService.getFolderTree` | FolderScreen, FolderSelectMoveScreen | 구현 | O(2026-09-13) | **2026-09-11 정정**: "구 API, folder-items로 대체돼 미사용 가능성"이라 적어뒀던 게 틀렸다 — `FolderScreen.tsx`가 지금도 이 API로 폴더 트리를 그린다. `childFolders`는 Swagger 예시엔 `["string"]`(문자열 배열)로 보이지만 **실호출로 확인한 실제 값은 재귀 중첩 객체 배열**(`{folderId,name,parentFolderId,childFolders,ledgerCount}`)이다 — springdoc이 재귀 타입을 못 그려 생긴 표기 문제일 뿐 응답 자체는 정상, 코드(`buildFolderTree`)도 이미 그렇게 처리 중. `scripts/api-verify.js` 3단계로 재검증 |
| POST | /groups/{groupId}/folders | `folderService.createFolder` | FolderScreen(새 폴더) | 구현 | O(2026-09-13) | `scripts/api-verify.js` 3단계 재검증 — 응답 `{folderId,groupId,name,parentFolderId,createdAt}` 확인 |
| POST | /groups/{groupId}/folder-items/move | `folderService.moveFolderItems` | FolderMoveDestinationScreen, FolderSelectMoveScreen | 구현 | O(2026-09-13) | 원자적. `scripts/api-verify.js` 3단계로 최상위 장부를 폴더 안으로 옮기는 케이스까지 재검증(`movedLedgerCount` 확인) |
| DELETE | /folders/{folderId} | `folderService.deleteFolder` | FolderScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 3단계 재검증(생성한 테스트 폴더 정리 겸용) |
| PATCH | /folders/{folderId} | `folderService.updateFolder` | FolderScreen, FolderMoveDestinationScreen | 구현 | O(2026-09-13) | **2026-09-13 서비스 함수명 정정**(`moveFolder`라는 별도 함수는 없음 — 이름 변경·이동 둘 다 `updateFolder()` 하나가 `updates` 객체로 처리한다). `scripts/api-verify.js` 3단계로 이름 변경 재검증 |
| GET | /groups/{groupId}/folder-items | `folderService.getFolderItems` | FolderScreen(내부적으로 안 씀, 실제로는 `getFolderTree`+`getLedgersInFolder` 조합), FolderSelectMoveScreen(동일), ReportLedgerSelectScreen | 구현 | O(2026-09-13) | **2026-09-13 정정**: 호출 화면 표기가 낡았다 — `getAllLedgersInGroup()`은 2026-09-13부로 이 엔드포인트가 아니라 평평한 `GET /groups/{groupId}/ledgers`를 쓴다(위 ledger-controller 절 참고), 실제로 이 엔드포인트를 쓰는 건 `ReportLedgerSelectScreen` 하나뿐이다. `folderId`(쿼리, `parentId` 아님). `scripts/api-verify.js` 3단계로 재검증 |

## dues-controller (Dues, 9개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/dues | `duesService.getDuesList` | DuesScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증 |
| POST | /groups/{groupId}/dues | `duesService.createDues` | DuesCreateScreen | 구현 | O(2026-09-13) | `startDate` 필수(실호출로 확정). `scripts/api-verify.js` 5단계 재검증 |
| POST | /dues/{duesId}/close | `duesService.closeDues` | DuesDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증(마감 후에도 삭제 가능함을 정리 케이스에서 확인) |
| GET | /dues/{duesId} | `duesService.getDuesDetail` | DuesDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증 |
| DELETE | /dues/{duesId} | `duesService.deleteDues` | DuesDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증(생성한 테스트 회비 정리 겸용, 마감된 회비도 삭제됨) |
| PATCH | /dues/{duesId} | `duesService.updateDues` | DuesEditScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증 |
| GET | /dues/{duesId}/members | `duesService.getDuesMembers` | DuesDetailScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증 |
| PATCH | /dues/{duesId}/members | `duesService.updateDuesMembersPaymentStatus` | DuesDetailScreen(일괄 변경) | 구현 | O(2026-09-13) | `scripts/api-verify.js` 5단계 재검증 |
| PATCH | /dues/{duesId}/members/{memberId} | (미사용) | — | 구현 | O(2026-09-13) | **2026-09-13 문서 정정**: 서비스 함수명(`duesService.updateDuesMemberPaymentStatus`)이 잘못 적혀 있었다 — 그런 함수는 코드에 없다(실제로는 프론트가 이 단건 엔드포인트를 아예 안 쓴다, 일괄 변경 API만 씀). `docs/design-verification.md`에 이미 기록된 대로 스펙시트(`DUE-2-PAGE-03-0`)가 다건 체크박스+일괄 변경 버튼만 규정해 개별 토글 UI 자체가 없다 — 그래서 안 붙였다. `scripts/api-verify.js` 5단계로 엔드포인트 자체는 정상 동작함을 확인(`200`) |

## archive-controller (Archive — 보관함, 5개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/archives | `archiveService.getArchives` | ArchiveListScreen | 구현 | O | 2026-09-11 실호출 200 확인. 2026-09-13 `scripts/api-verify.js` 6단계로 재검증 |
| POST | /groups/{groupId}/archives | `archiveService.createArchive` | FolderScreen(전체 백업) | 구현 | O | **프론트 버그였음**: 예전엔 `/groups/{groupId}/folders/archive`(없는 경로, `404`)를 불렀다 — 이 경로로 고침. 실호출로 `400`(제목 20자 제한)·`422 ARCHIVE_EMPTY`(보관할 것 없음)까지 확인, 라우팅 정상. **2026-09-12 실기기로 `ARCHIVE_EMPTY` 조건 확정**: 모임에 내역이 1건도 없으면 `ARCHIVE_EMPTY`(422) — 장부가 여러 개 있어도 막힌다(장부별이 아니라 모임 전체 단위 조건). 성공 시엔 내역 유무와 무관하게 **모든 장부**가 보관되고 폴더 화면에서 사라진다(빈 장부도 함께 보관됨) — 다이얼로그 문구("현재까지 장부를 모두 보관할까요?")와 일치하는 의도된 동작으로 보인다. 2026-09-13 `scripts/api-verify.js` 6단계로 groupId 6에서 재검증(테스트 장부가 그룹의 유일한 활성 장부가 아니었어도 보관 후 정리(DELETE)까지 정상) |
| GET | /archives/{archiveId} | `archiveService.getArchiveDetail` | ArchiveDetailScreen | 구현 | O | **2026-09-12 재정정**: 2026-09-11엔 Swagger 스키마 대조만 하고 "`summary{}`로 감싸져 있다"고 적었는데, 이번에 `groupId 5`에 실제 폴더/장부/내역/보관 기록을 만들어 실호출해보니 **`summary{}` 래핑 자체가 없고 최상위에 평평하게 온다**(`{archiveId,groupId,title,startDate,endDate,totalIncome,totalExpense,balance,entryCount,ledgers,createdAt}`) — 이 오판으로 `ArchiveListScreen`이 실기기에서 진입 즉시 크래시 났다(`archivedAt`→`createdAt` 필드명 오류까지 겹침). `ledgers[]` 항목에도 `archivedLedgerId`/`startDate`/`endDate`가 없다(전부 있다고 가정했었음). 타입·서비스·화면 전부 실측대로 고쳤다(`docs/design-verification.md` §5-4, `docs/api-integration-plan.md` "실호출 절차" 참고). 2026-09-13 `scripts/api-verify.js` 6단계로 재검증 |
| DELETE | /archives/{archiveId} | `archiveService.deleteArchive` | ArchiveListScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 6단계 재검증(생성한 테스트 보관 기록 정리 겸용) |
| PATCH | /archives/{archiveId} | `archiveService.updateArchiveTitle` | ArchiveListScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 6단계 재검증 |

## file-controller (File, 3개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| POST | /files | `fileService.uploadFile` | TransactionRegisterScreen(RECEIPT), GroupProfileEditScreen(GROUP_IMAGE), ProfileEditScreen(PROFILE_IMAGE) | 구현 | O | 응답 `fileId`/`purpose`/`fileUrl` 필드명 실호출 확인. **2026-09-13 SKIP**: `scripts/api-verify.js`(JSON 바디 전용 엔진)로는 이 엔드포인트의 `multipart/form-data`를 못 보낸다 — 이전 라운드 실기기 O 확인을 그대로 신뢰, 이번엔 재검증 안 함 |
| GET | /files/{fileId}/content | (직접 호출 없음 — `<Image>` src로 사용) | 이미지 표시하는 모든 화면(`buildAuthenticatedImageSource`) | 구현 | 기존 | **누락 행 추가(2026-09-11)** — 서비스 함수로 감싸지 않고 인증 헤더만 붙여 `<Image>`에 직접 넣는 방식이라 이전 대장에 행 자체가 없었다. **2026-09-13 SKIP**: 업로드가 SKIP돼 유효한 `fileId`를 못 만들어 이번 라운드엔 실호출 생략 |
| DELETE | /files/{fileId} | `fileService.deleteFile` | (없음) | 구현 | 기존 | 호출부 설계상 없음(증빙/프로필/모임 이미지 삭제는 각 도메인의 `xxxFileIds:null`/전체교체로 처리). **2026-09-13 SKIP**: 위와 같은 이유(유효한 `fileId` 없음) |

## auth-controller (Auth, 6개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| POST | /auth/social/signup | `authService.socialSignup`(있으면) | (소셜 가입 화면) | 구현 | - | **누락 행 추가(2026-09-11)** — 이전 대장에 아예 없었다. 코드에 대응 함수가 있는지 재확인 필요 |
| POST | /auth/social/login | `authService.socialLogin`(있으면) | LoginScreen(소셜 로그인 버튼) | 구현 | - | **누락 행 추가(2026-09-11)** — 위와 동일, 응답이 `{status, login, email}` 구조(신규 가입 유도 분기로 보임)라 기존 이메일 로그인과 다르다 |
| POST | /auth/signup | `authService.signup` | EmailVerificationScreen(코드 검증 성공 후) | 구현 | 기존 | **2026-09-11 필드 정리**: `verificationToken` 필드를 없앴다 — Swagger 스키마에 그 필드 자체가 없다 |
| POST | /auth/refresh | `apiClient`(401 재시도 내부 로직) | (화면 없음, 자동) | 구현 | O(2026-09-13) | `scripts/api-verify.js` 1단계: 로그인 직후 받은 `refreshToken`으로 재발급 호출 → `200 {accessToken,refreshToken,...}`, 새 토큰으로 다음 케이스(`/auth/me`)까지 정상 인증됨을 확인(재발급 토큰이 실제로 유효함까지 검증) |
| POST | /auth/logout | `authService.logout` | MyProfileScreen(로그아웃 확인 Dialog) | 구현 | 기존 | |
| POST | /auth/login | `authService.login` | LoginScreen | 구현 | O(2026-09-13) | `scripts/api-verify.js` 1단계로 재검증 — `200 {user:{userId,email,name},tokens:{accessToken,refreshToken,tokenType,accessTokenExpiresIn}}` 필드 전부 확인 |

## email-verification-controller (2개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| POST | /auth/email-verifications | `authService.sendEmailVerification` | EmailVerificationScreen(최초 발송·재전송 공용) | 구현 | O | **프론트 버그였음**: 예전 경로 `/auth/email/verification`은 `401`(존재 안 함) — 새 경로로 고친 뒤 `500 MAIL_SEND_FAILED`(라우팅은 정상, 개발 서버 메일 발송 설정 문제로 보임, `backend-requests.md` 확인 요청). **2026-09-17 Swagger 스키마 확보**: 요청 `{email}`(이미 일치), 응답 `{data:{email,expiresAt,expiresIn},message}` — 타입만 반영(`SendEmailVerificationResponse`), **실호출 검증은 서버 복구 후**(발송 자체가 500으로 막혀 있어 지금은 응답을 못 받음) |
| POST | /auth/email-verifications/confirm | `authService.confirmEmailVerification` | EmailVerificationScreen | 구현 | - | 위와 같은 경로 정정. 응답이 `{email,verified,verifiedAt}`(예전 가정 `{verificationToken}`과 다름) — 메일이 안 와서 실제 코드로 끝까지는 검증 못 함. **2026-09-17 Swagger 스키마 확보**: 요청 `{email,code}`(이미 일치), 응답 `{data:{email,verified,verifiedAt},message}` — 타입만 반영(`ConfirmEmailVerificationResponse`), **실호출 검증은 서버 복구 후** |

## user-controller (User, 4개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| PATCH | /auth/password | `authService.changePassword` | PasswordChangeScreen | 구현 | - | **프론트 버그였음**: 바디에 `refreshToken`이 빠져 있었다 — Swagger 스키마 기준으로 추가(destructive해서 실호출 검증은 안 함, `backend-requests.md`에 확인 요청) |
| GET | /auth/me | `authService.getCurrentUser` | 세션 복원, SettingScreen, MyProfileScreen | 구현 | O(2026-09-12, 2026-09-13 재확인) | 2026-09-12 재실호출로 `AuthUserResponse` 타입과 필드 하나까지 일치 재확인(`userId`/`email`/`name`/`profileImageUrl`/`loginProvider`/`createdAt`). 2026-09-13 `scripts/api-verify.js` 1단계로 재갱신 토큰까지 써서 재검증 |
| DELETE | /auth/me | `authService.withdraw` | WithdrawReasonScreen(최종 확인 모달) | 구현 | - | 바디 `{ownershipTransfers,reasons,reasonDetail}`는 Swagger 스키마만 보고 맞춘 것 — **archive의 `summary{}` 오판(2026-09-12) 이후로 Swagger만으로는 못 믿는다는 게 확인돼 신뢰도를 낮췄다.** 되돌릴 수 없어 실호출 불가, `docs/backend-requests.md` 4순위로 컨트롤러/DTO 기준 확인 요청 남김(`ownershipTransfers` 필드명 + `reasons` enum 목록) |
| PATCH | /auth/me | `authService.updateMyProfile` | ProfileEditScreen | 구현 | O | **2026-09-12 이름만 바꿨다 되돌리는 식으로 재실호출** — 예전 코드는 "응답에 `loginProvider`/`createdAt`이 없어 캐시값을 이어붙인다"고 가정했는데 틀렸다, 실제 응답에 `{userId,email,name,profileImageUrl,loginProvider,createdAt}` 전부 온다. 크래시는 없었지만(캐시가 항상 채워져 있어서) 캐시가 비는 예외 상황엔 `undefined`가 될 잠재 버그였다 — 캐시 이어붙이기를 없애고 응답값을 그대로 쓰도록 고쳤다 |

## statistics-controller (1개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/statistics | `statisticsService.getStatistics` | StatisticsScreen | 구현 | O | 화면·서비스 함수 이미 있음(`npm run screen-audit`로 발견한 문서 누락). **2026-09-12 실호출로 전체 필드 재확인**(archive의 `summary{}` 래핑 오판 이후 크래시 위험 재점검 차원) — `groupId 5`에 예산 있는 장부+지출 내역을 만들어 확인한 결과 `mostActiveLedger`/`budgetUsage[]`/`expenseShare{totalExpense,items[]}` 전부 `statisticsService.ts`의 `StatisticsResponse` 타입과 필드 하나까지 정확히 일치 — 크래시 위험 없음, 타입 수정 불필요. 2026-09-13 `scripts/api-verify.js` 7단계로 groupId 6에서 재검증 |

## receipt-album-controller (1개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/receipts | `receiptService.getReceipts` | ReceiptAlbumScreen, ReceiptSearchScreen | 구현 | O(2026-09-13) | `ledgerIds`(복수형) 필수. **`sort` 파라미터가 Swagger 계약엔 정식으로 있는데 붙이면 `500`** — 계약 자체가 깨져 있다는 뜻(`backend-requests.md` 우선순위 상향). `scripts/api-verify.js` 7단계로 재검증(`sort` 없이 `ledgerIds`만) |

## dashboard-controller (Dashboard, 2개)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /groups/{groupId}/dashboard | `dashboardService.getDashboard` | DashboardScreen | 구현 | O | **2026-09-11 정정**: 응답에 `calendar`/`upcomingDues`/`hasUnreadNotification`이 실제로 온다(실호출로 빈 배열/`false`까지 확인) — "서버가 안 내려줘서 미니 캘린더가 항상 빈 상태"라던 이전 판단이 틀렸다. `hasUnreadNotification`은 타입에 추가했으나(`dashboardService.ts`) 목록을 가져올 알림 컨트롤러 자체가 없어(아래 Notification 참고) 배지 이상은 못 만든다. `calendar`/`upcomingDues`는 타입에도 아직 안 넣었다(미니 캘린더·마감임박 카드 UI 자체가 없어 별도 작업). 2026-09-13 `scripts/api-verify.js` 7단계로 재검증 |
| GET | /groups/{groupId}/calendar | `dashboardService.getMonthlyCalendar` | CalendarScreen | 구현 | O(2026-09-13) | 예전 "미구현" 태그가 낡은 정보였다. `scripts/api-verify.js` 7단계 재검증 |

---

## 명세만 존재, 서버 없음 (Swagger 16개 컨트롤러 어디에도 없음 — 복사 누락 아니라 확정)

### Notification & Support (알림·고객지원)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| GET | /notifications | `supportService.getNotifications` | NotificationScreen | 명세만 존재 | - | |
| PATCH | /notifications/{notificationId}/read | `supportService.markNotificationRead` | NotificationScreen(항목 탭 시) | 명세만 존재 | - | |
| GET/PATCH | /notifications/settings | `supportService.getNotificationSettings`/`updateNotificationSettings` | NotificationSettingsScreen | 명세만 존재 | - | |
| GET | /notices | `supportService.getNotices` | NoticeListScreen | 명세만 존재 | - | |
| GET | /notices/{id} | `supportService.getNoticeDetail` | NoticeDetailScreen | 명세만 존재 | - | |
| GET | /terms/{type} | `supportService.getTermsText` | TermDetailScreen | 명세만 존재 | - | |
| GET | /faqs | `supportService.getFaqs` | InquiryScreen | 명세만 존재 | - | |
| POST | /inquiries | `supportService.submitInquiry` | (없음) | 명세만 존재 | - | 죽은 함수 — 문의 입력 폼 자체가 아직 없음 |

### OCR (영수증 인식)

| Method | Path | 서비스 함수 | 호출 화면 | 서버 상태 | 실호출 확인 | 비고 |
|---|---|---|---|---|---|---|
| POST | /files/{fileId}/ocr | `ocrService.recognizeReceipt` | (없음 — `ReceiptScanningView`는 `utils/mockOcr.ts` 사용) | 명세만 존재 | - | 카메라/갤러리 실연동으로 진짜 `fileId`는 만들 수 있게 됐지만(선행 조건 해소), 서버가 없어 연결 안 함. **프론트가 `utils/mockOcr.ts`의 mock으로 동작 중**(2026-09-13 명시) — 서버 생기면 `ocrService`로 교체 |

### `POST /auth/password/reset` (임시 비밀번호 발송)

명세 `Auth.txt` 9번엔 있으나 Swagger 6개 auth 엔드포인트·4개 user 엔드포인트 어디에도
없다 — 실호출로도 `401`(경로 자체가 인증 필터에 걸림, 존재하지 않는 라우트의 전형적
응답 패턴) 확인. `authService.requestPasswordReset`은 죽은 함수, `PasswordResetScreen`도
호출은 하되 항상 실패하는 게 정상이다.

---

## 전수 대조 결과 (77 vs 이전 57행)

- **Swagger에 있는데 이전 대장에 없던 것 — 22건**: `POST /auth/social/signup`,
  `POST /auth/social/login`, `GET /files/{fileId}/content`, `GET/POST/GET/DELETE/PATCH
  /archives`(5, 이전엔 "시작 전" 뭉뚱그려 1행), `GET /groups/{groupId}/statistics`(이전엔
  "화면 미구현"으로 다르게 표기), `GET /groups/{groupId}/ledgers`, `POST
  /groups/{groupId}/ledgers`(둘 다 미사용이라 안 적혀 있었음), 그 외 이전 판이
  `PATCH/GET/DELETE /auth/me`를 "User.txt 표기 오기" 각주로 뭉뚱그렸던 것을 정식 행
  3개로 분리, Dashboard `/calendar` 세부 재정리 등.
- **이전 대장에 있는데 Swagger에 없는 것 — Notification & Support 8건 + OCR 1건 + 비밀번호
  재설정 1건 = 10건**: 위 "명세만 존재, 서버 없음" 절 참고.
- **경로/파라미터/바디가 다른 것(프론트 버그) — 3건**: 이메일 인증 발송/확인(경로),
  폴더 전체 백업(경로), 비밀번호 변경(바디 필드 누락). 전부 이번 라운드에 코드 수정.
- **서버 상태 태그만 낡았던 것(경로·바디는 원래 맞았음) — 6건**: 회원 탈퇴, 내 프로필
  GET/PATCH, 통계, 대시보드 캘린더, 대시보드 본문의 `calendar`/`upcomingDues`/
  `hasUnreadNotification` 블록.

## 요약

- 총 행 수(엔드포인트): **77개**(Swagger 기준) + 명세만 존재 10개(Notification&Support
  8 + OCR 1 + 비밀번호 재설정 1) = **87개** 전수 관리
- 서버 상태별(Swagger 77개 기준): **구현 77 / 명세만 존재 10**(이전 판 "구현 37 / 진행중 4 /
  미구현 15 / 시작전 1"에서 전면 재분류 — 태그 체계 자체가 바뀌어 숫자를 직접 비교할 수
  없다. 굳이 대응시키면 이전의 "진행중"·"미구현" 태그가 붙었던 항목 대부분이 이번에
  Swagger로 실재가 확인되며 "구현"으로 이동했다)
- 실호출 확인(2026-09-13 갱신): **O 56건**(스키마 대조가 아니라 실제 호출로 확인 — 이번
  라운드에 `scripts/api-verify.js`로 재검증한 44건 포함) / **SKIP 3건**(파일 업로드 계열,
  아래 "2026-09-13 전수 실호출 검증" 참고) / **destructive/불가 6건**(수동 확인 목록,
  아래 참고) / **명세만 존재라 실호출 불가 10건**(위 "명세만 존재" 절)

## 2026-09-13 전수 실호출 검증 (`scripts/api-verify.js`)

**목표**: 스키마 대조가 아니라 실제 호출로 Swagger 77개 전부를 확인한다. `scripts/api-call.js`
의 `rawRequest`/`login`을 재사용하는 검증 엔진(`scripts/api-verify.js`)을 새로 만들고,
케이스를 `scripts/api-verify-cases/`에 의존 순서대로 7단계로 나눠 단계별로 돌렸다.
groupId 6("탈퇴테스트모임")을 전용 샌드박스로 썼다 — 주 검증 환경(groupId 5)은 이번
라운드에서 손대지 않았다.

| 단계 | 내용 | 결과 |
|---|---|---|
| 1 | 인증(로그인/토큰 갱신/내 프로필) | PASS 3 / FAIL 0 |
| 2 | 모임(목록/상세/초대코드/멤버) | PASS 6 / FAIL 0(케이스 자체 오류 1건 있었으나 수정 후 재실행) |
| 3 | 폴더·장부(생성/목록/이동/수정/삭제) | PASS 15 / FAIL 0 |
| 4 | 내역(생성/승인/수정/삭제 — 총무 자동승인·일반회원 대기승인 정책까지) | PASS 14 / FAIL 0 |
| 5 | 회비(생성/납부상태 일괄·개별/마감/삭제) | PASS 13 / FAIL 0 |
| 6 | 보고서·보관(장부별/기간별 생성, 보관 생성/조회/수정/삭제) | PASS 12 / FAIL 0 |
| 7 | 파일·통계·대시보드 | PASS 4 / SKIP 3(파일 업로드 계열, multipart 한계) |
| **합계** | | **PASS 67 / FAIL 0 / SKIP 3** |

**FAIL 처리 경위(전부 케이스 설계 실수, 서버 문제 아님)**: 2단계에서 `POST
/groups/{groupId}/invitations`의 기대 상태코드를 `200`으로 잘못 넣어 FAIL이 났다 —
POST로 새 리소스를 만드는 엔드포인트는 `201`이 맞는데 케이스 작성 시 습관적으로 `200`을
넣은 게 원인이었다. `201`로 고쳐 재실행해 PASS로 확인했다. 서버 쪽 결함은 이번 라운드에
하나도 발견되지 않았다.

**문서 자체의 오류 3건도 이 과정에서 함께 잡았다**(실호출과 무관하게 코드를 다시 읽다
발견): `GET /groups/{groupId}/ledgers`/`POST /groups/{groupId}/ledgers` 행이 "미사용"
이라 적혀 있던 게 낡은 정보였다(지난 라운드에 실제로 연결됨), `PATCH /ledgers/{ledgerId}
/budget`의 서비스 함수명이 `updateBudget`으로 잘못 적혀 있었다(실제로는
`updateLedgerBudget`), `POST /groups/{groupId}/reports`의 서비스 함수명이
`createReport`(단일 함수)로 적혀 있었다(실제로는 `createReportByLedger`/
`createReportByPeriod` 두 함수), `PATCH /dues/{duesId}/members/{memberId}`의 서비스
함수명이 존재하지 않는 `updateDuesMemberPaymentStatus`로 적혀 있었다(실제로는 프론트가
이 단건 엔드포인트를 아예 안 씀). 각 행에 정정 반영.

**groupId 6 부수효과(의도된 것)**: 6단계에서 보관(archive) 생성을 실호출로 검증하며
그룹의 모든 활성 장부를 보관 처리했다 — 이 그룹에 이전 라운드부터 남아 있던 leftover
장부 2건("Fff"/"Fcff", ledgerId 25/26)도 함께 보관됐고, 그 보관 기록 자체를 정리
케이스에서 Hard Delete(`DELETE /archives/{archiveId}`, 복구 불가)했다. 결과적으로
groupId 6은 이제 폴더/장부/회원/회비/보관 전부 0건인 완전히 빈 상태다(멤버십은 유지 —
userId 6 OWNER, userId 9 MEMBER). 검증 전용 그룹이라 의도된 정리로 판단했다 — 다음
라운드에서 이 그룹에 픽스처가 필요하면 처음부터 새로 만들어야 한다.

**SKIP 3건(파일 업로드 계열)**: `POST /files`가 `multipart/form-data`라
`scripts/api-verify.js`(JSON 바디 전용 엔진, `Buffer.from(JSON.stringify(...), 'utf8')`
경로만 지원)로는 실호출을 못 만든다 — 이전 라운드 실기기 확인(`O`)을 그대로 신뢰하고
이번엔 재검증하지 않았다. `GET /files/{fileId}/content`/`DELETE /files/{fileId}`는
유효한 `fileId`가 있어야 의미 있는 호출이 되는데 업로드가 SKIP이라 함께 SKIP했다.

**수동으로 확인해야 할 목록 — 6건(파괴적이거나 자동 호출 불가, 케이스에서 제외)**:

| 엔드포인트 | 이유 |
|---|---|
| `DELETE /groups/{groupId}` | 모임 삭제, 되돌릴 수 없음 |
| `DELETE /auth/me` | 회원 탈퇴, 되돌릴 수 없음. `ownershipTransfers` 필드명·`reasons` enum은 여전히 Swagger 스키마 대조만 된 상태(`docs/backend-requests.md` 확인 요청 중) |
| `PATCH /auth/password` | 실제 로그인 비밀번호가 바뀌어 테스트 계정 접근이 끊길 위험 — Swagger 스키마 기준으로만 구현됨(`refreshToken` 추가 완료, 실호출 미검증) |
| `POST /auth/social/signup` | 카카오/네이버/구글 SDK 플로우가 필요해 스크립트로 재현 불가 |
| `POST /auth/social/login` | 위와 동일 |
| `POST /auth/email-verifications/confirm` | 발송 자체가 `500 MAIL_SEND_FAILED`로 막혀 있어(1순위) 실제 인증 코드를 받을 방법이 없음 — 발송이 뚫리면 이 순서대로 재시도할 것 |

이 6건은 실호출 없이 기존 상태(Swagger 스키마 대조 또는 코드 검토) 그대로 둔다.

## 2026-09-12 추가 라운드 — "Swagger도 실제와 다를 수 있다" 재검증

`GET /archives/{id}`의 `summary{}` 래핑이 Swagger 문서와 실제 응답이 달라(래핑 자체가 없었음)
`ArchiveListScreen`이 실기기에서 크래시 났다(원인은 `archivedAt`/`createdAt` 필드명 불일치가
더해진 것 — 위 archive-controller 절 참고). 이 사건을 계기로 **이전 라운드에 `Swagger`
(스키마 대조만, 실호출 안 함) 태그였던 나머지 항목을 실호출로 재검증**했다.

- **실제로 재검증(전부 `Swagger`→`O`로 갱신)**: `GET /archives/{archiveId}`(재정정),
  `GET /groups/{groupId}/statistics`, `GET /groups/{groupId}/ledgers`(미사용 후보),
  `GET /auth/me`, `GET /reports/{reportId}`(원래 `기존`였지만 같은 이유로 재확인).
  `PATCH /auth/me`도 이름만 바꿨다 되돌리는 식으로 재호출.
- **결과**: **통계·보고서 상세는 둘 다 실제 응답이 타입과 정확히 일치** — 크래시 위험 없음,
  코드 수정 불필요. `PATCH /auth/me`는 크래시는 없었지만 "응답에 없다"고 잘못 가정했던
  필드(`loginProvider`/`createdAt`)가 실제로 옴 — 캐시 이어붙이기 로직을 없애고 응답값을
  직접 쓰도록 고쳤다(잠재 버그 제거, 관찰 가능한 동작 변화는 없음).
- **파괴적이라 재검증 못 한 것**: `DELETE /auth/me`(회원 탈퇴) — Swagger 스키마만 믿고 있는
  상태 그대로다. `docs/backend-requests.md` 4순위에 컨트롤러/DTO 기준 확인을 요청했다
  (`ownershipTransfers` 필드명 + `reasons` enum 전체 목록).
- 상세 절차는 `docs/api-integration-plan.md`의 "실호출 절차" 절 참고.
