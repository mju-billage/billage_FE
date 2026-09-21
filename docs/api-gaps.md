# API 공백 목록 (api-gaps)

백엔드팀 공유용. `docs/api-mapping.md`와 함께 본다. **명세 스냅샷 기준일 2026-09-03**(`API 공통 규칙.txt`만 미갱신, 나머지 15개 도메인 전면 갱신 + 2개 신설). 참고 자료로 `명세대조표.zip`(대조 2026-09-01, BE 컨트롤러·DTO 직접 확인)를 같이 쓴다.

이 문서는 3단으로 나뉜다 — **해결됨**(이번 갱신으로 풀림, 지우지 않고 내려서 보관), **아직 유효**(여전히 열려 있음), **판단 불가**(명세 "미구현" 태그와 대조표 "구현 완료" 주장이 갈려서 실호출 없이는 못 정함).

**2026-09-04 실호출 확인 완료(3건) + 2026-09-05 추가 확인(3건)** — 개발 서버(`52-78-148-114.nip.io`)에 신규 테스트 계정(`billage.verify.dues.test@example.com`)으로 직접 검증했다. 상세 요청/응답 전문은 §확정됨 절, 계정·데이터 기록은 `docs/api-integration-plan.md` "테스트 데이터 정책" 참고.

## 우선순위 요약 (2026-09-04 갱신 — 실호출 반영)

**✅ 코드 반영 완료 (2026-09-05, 회비 도메인 정합성 복구)**
1. ~~회비 생성이 지금 100% 400으로 실패한다~~ — **고쳤다.** `DuesCreateScreen.tsx`가 화면명세 그대로 기간(시작일~마감일) 범위 입력을 복원해 `startDate`를 같이 보낸다(새 컴포넌트 `DuesDateRangeSheet` 추가, `Calendar` 재사용). `startDate`·`dueDate` 필드 fieldErrors는 인라인으로 표시.
2. ~~회비 상태 3종을 `paidCount===0` 추정으로 오판했다~~ — **고쳤다.** `types/dues.ts`의 `DuesStatus`에 `SCHEDULED` 추가, 목록·상세 전부 서버 `status`를 그대로 신뢰(`utils/duesSort.ts`의 `isUpcomingDues` 삭제).
3. ~~"납부 기간" 표시가 `createdAt`으로 대체돼 있었다~~ — **고쳤다.** `startDate`가 실존하므로 그 값을 그대로 씀.
4. ~~회비 목록을 클라이언트에서 재정렬했다~~ — **고쳤다.** 서버가 명세 순서로 고정 정렬해 내려주므로 `sortDuesForList`(파일째 삭제)를 제거하고 응답 순서를 그대로 렌더링.

**✅ 코드 반영 완료 (2026-09-05, Entry 담당자 필드)**
5. ~~Entry 등록/수정에 "담당자" 값을 전송하지 않음~~ — **고쳤다.** `entryService.ts`의 `createEntry`/`updateEntry`에 `managerUserId` 추가, 상세 조회 응답의 `manager` 객체도 `EntryDetail.manager`로 반영해 `TransactionDetailScreen.tsx`(실 Entry 경로)와 `TransactionRegisterScreen.tsx`(수정 폼) 양쪽에 표시. 담당자 후보 목록은 `GroupMembership`(이 모임의 관리자)에서 가져오도록 고쳤다 — 기존엔 이름 문자열 하드코딩 목록(`MANAGER_OPTIONS`)을 실 API 모드에도 잘못 쓰고 있었다(명세는 `managerUserId`가 `GroupMembership.userId`여야 한다고 명시, 납부 명단 `Member`는 담당자가 될 수 없음).

**✅ 코드 반영 완료 (2026-09-05, Entry 모임 전체 내역 목록)**
6. ~~Entry 모임 전체 목록 미전환~~ — **고쳤다.** `entryService.getGroupEntries()`(`GET /groups/{groupId}/entries`) 추가, `TransactionsScreen`/`TransactionSearchScreen`/`TransactionFilterSheet`/`TransactionLedgerMultiSelectSheet` 4개 화면이 목(`types/transaction.ts`)에서 전부 옮겨갔다. 잔액 카드·건수·목록을 한 응답으로 묶어 받아 필터 변경 시에도 호출 1번만 함(명세가 경고한 "세 번 호출" 방지). 무한 스크롤은 4-A 패턴(`onEndReached`) 그대로. 상세: `docs/design-verification.md` §2 DTB-1/2-01/2-SHEET-01/3-SHEET-02 행.

이번 라운드까지 Dues·Entry(담당자·모임 전체 목록) 도메인을 다뤘다 — 아래 나머지는 여전히 미반영.

**1순위 — 지금 실제로 잘못된 동작을 일으키는 중 (코드 수정 필요)**
1. GroupMembership 목록 정렬(총무 우선)·`email` 응답을 반영 안 함
2. `PATCH .../memberships/{id}` 응답이 목록과 같은 형태로 확정됐는데 캐시 갱신 로직이 옛 좁은 응답을 가정
3. 초대코드: 이제 멱등 발급 + 조회 API(`GET .../invitations/current`)가 다 생겼는데 프론트는 여전히 "발급 시도" 방식 — 조회로 바꿔야 함
4. `GET /folders/{folderId}/ledgers`에 `createdAt`이 추가됐는데 카드 서브타이틀이 여전히 예산 상태로 대체돼 있음

**2순위 — 화면 신규 개발 시 반영해야 할 것(아직 화면 자체가 없어 급하지 않음)**
- Dashboard 캘린더/마감임박회비/알림뱃지 3블록 — 대시보드 미니 캘린더가 계속 빈 이유가 이제 명세로 확정됨

**3순위 — 화면 신규 개발 대기(API 100% 확정, 상충 없음)**
- Member 수정·삭제(7-C에서 완료), Dues 나머지(수정/삭제/마감/단건·일괄 납부변경, 7-B — 회비 생성은 이제 정상 동작하니 착수 가능), Report 13개 중 남은 조회 플로우(§확정됨 8번 — 생성 5화면은 7-D/7-E에서 완료, `entryType:"ALL"` 은 400이니 생략 or `INCOME`/`EXPENSE`만 쓸 것), 모임 관리 마무리 3종(로그아웃/모임삭제/프로필변경) — `docs/api-integration-plan.md` "현황" 절 참고. 증빙자료 앨범(§확정됨 7번)은 2026-09-05에 이미 화면까지 만들어, Folder `folder-items`/`move`(§확정됨 6번, 기존 순차 이동·최상위 차단 UI 걷어냄)도 같은 날 코드 반영까지 끝나 이 목록에서 뺐다

**backend 조치 불가 — 참고만**
- ~~File 업로드 실연결(카메라·갤러리 라이브러리 부재), OCR 실연동 — 프론트 네이티브 의존성 문제, 서버와 무관~~
  **둘 다 해결됨.** 업로드는 2026-09-11(카메라·갤러리 실연결), OCR은 2026-09-21에 붙였다.
  OCR은 "서버와 무관"이 아니라 **서버 API가 없던 것**이었다 — `POST /api/v1/files/{fileId}/ocr`이
  2026-09-21 dev에 배포되면서 연결했다.
  - 서버는 `totalAmount`만 항상 채운다. `merchantName`·`purchasedOn`은 `null`일 수 있고
    `items`는 **서버가 범용 OCR 모델을 쓰는 동안 항상 빈 배열**이다(영수증 특화 모델 승인 대기).
  - `OCR_RATE_LIMITED(429)`는 **자동 재시도 금지** — 서버가 외부 OCR을 건당 과금으로 부른다.

---

## 해결됨 (2026-09-03 명세 갱신으로 풀림)

이전에 이 문서가 (A)/정책결함/필드공백으로 올렸던 항목 중 이번 갱신으로 명세상 해소된 것들이다. **삭제하지 않고 여기로 내린다** — 다음 작업자가 코드에 실제로 반영했는지 확인하는 체크리스트로 쓴다.

| 항목 | 무엇으로 풀렸는가 | 코드 반영 상태 |
|---|---|---|
| 모임원(관리자) 강제 내보내기 API 없음 (구 (A)) | `DELETE /groups/{groupId}/memberships/{membershipId}` 구현 완료(2026-08-30 명세 보강 — 원래도 구현돼 있었으나 문서 누락) | 미반영 — 화면(`ETC-4-MODAL-03-0`) 자체가 없음, 신규 개발 시 반영 |
| 초대코드 발급 비멱등 + 조회 API 없음 (정책 결함) | ① 발급 멱등화(2026-09-01) ② `GET .../invitations/current` 신설(2026-09-01) — 둘 중 하나만 있으면 됐는데 **둘 다** 생김. **2026-09-05 실호출로 검증 완료**(`docs/api-integration-plan.md` "초대코드 신설 엔드포인트 실호출 검증" 절): 발급 이력 없는 상태에서 `GET .../current` 호출 시 총무는 자동 발급+즉시 반환(404 아님), 이후 `GET`·`POST` 재호출 전부 같은 코드 반환 — 멱등성·조회 둘 다 명세대로 동작 확인 | **미반영** — 프론트는 여전히 "화면 진입 시 발급 시도"(2단계 우회 로직) 그대로. 조회 API로 교체 필요(1순위) |
| `GroupMembership` 응답에 `email` 없음 (필드 공백) | `GET .../memberships` 응답에 `email` 추가(2026-08-30) | 미반영 — `MemberProfileSheet` 등이 여전히 이름+역할만 표시 |
| `GET /folders/{folderId}/ledgers`에 `createdAt` 없음 (필드 공백) | 2026-09-01 추가 | 미반영 — 카드 서브타이틀이 예산 상태로 대체된 채 그대로 |
| `PATCH .../memberships/{id}` 성공 응답 형태 없음 (필드 공백) | 1번(목록)과 동일 형태로 확정(2026-09-01) | 미반영 — 캐시 갱신 로직 재점검 필요 |
| 에러 응답 섹션 없음 — `POST /groups/join` | 에러 응답 섹션 추가(`INVALID_INVITATION_CODE`·`INVITATION_EXPIRED`·`ALREADY_GROUP_MEMBER`) | 미반영 — 여전히 화면이 자체 문구로 뭉뚱그림, 코드별 문구로 세분화 가능 |
| `PATCH /ledgers/{id}`의 `folderId: null` 허용 여부 불명 (필드 공백) | "`null`은 변경 없음 — 최상위 이동 아님"으로 명확화(2026-09-01). 최상위 이동은 `POST /groups/{groupId}/folder-items/move`(`targetFolderId: null`) 사용 | **2026-09-05 판단 번복**: 당시엔 이 조합을 UI에서 막아뒀지만(`MOVE_DESTINATION_LEDGER_TO_ROOT_BLOCKED`), `FolderMoveDestinationScreen`을 `/folder-items/move`로 전환하면서 그 차단을 없앴다 — 새 API가 장부의 최상위 이동을 명시적으로 지원하고(Folder.txt §7), 실호출로 장부를 최상위로 옮긴 뒤 `GET .../folder-items`(폴더ID 생략)에 `LEDGER` 항목으로 그대로 나타남까지 확인했다. 옛 단건 PATCH API 얘기라 지금은 무관해졌다 |

- [해결] 모임 전체 내역 목록 API 없음 (구 (A) 최우선) (2026-09-01)
- [해결] 모임 전체 장부 목록 API 없음, N+1 우회 중 (구 (A)) (2026-09-01)
- [해결] Entry 등록/수정에 "담당자" 필드 없음 (필드 공백) (2026-09-01)
- [해결] `receiptFileIds`(내역 등록) 명세 자기모순 (2026-09-03)
- [해결] 에러 응답 섹션 없음 — `GET .../memberships` (2026-09-03)
- [해결] 에러 응답 섹션 없음 — `POST .../invitations` (2026-09-03)
- [해결] 에러 응답 섹션 없음 — `POST .../leave` (2026-09-03)
- [해결] "회비 요청하기"(미납부자 알림) API 없음 (Dues 도메인 공백) (2026-09-03)
- [해결] 파일 허용 확장자·용량·개수 "추후 확정" (C) (2026-09-01)

---

## 아직 유효

### (A) 화면은 있는데 API가 없거나, 있어도 서버가 아직 안 만든 것

| 항목 | 상태 |
|---|---|
| **소셜 로그인·회원가입 API 문서화 공백** | 대조표는 "서버에 실제로 있고 경로도 일치한다"고 확인(BE 코드 대조) — 즉 **엔드포인트 부재가 아니라 Auth.txt의 문서화 누락**으로 재분류. 코드(`services/authService.ts`)는 이미 해당 경로를 호출 중이라 **조치 불필요**, 주석("명세에 없는 추측 경로")만 낡았다 — 다음에 손댈 때 정정 |
| **이메일 인증** | 전보다 진전 있음 — 이번에 전체 플로우(발송/검증/토큰)가 **명세로 구체화**됐다(`POST /auth/email/verification`·`.../confirm`, 6자리 코드·3분 유효). 다만 서버 상태는 여전히 `미구현`(설계만 있고 구현 안 됨) |
| **비밀번호 재설정 + 로그인 상태 비밀번호 변경** | 마찬가지로 명세 구체화(`POST /auth/password/reset`=임시비밀번호 발송, `PATCH /auth/password`=변경) 됐으나 서버 `미구현` |
| **회원 탈퇴** | 명세 완전히 신설(`DELETE /auth/me`, 권한이전+탈퇴 트랜잭션, 소프트삭제 없음)됐으나 서버 `미구현`, 화면도 없음("확인 요청" 항목에서 (A)/(B) 회색지대라 판정했던 것이 이제 (A)로 명확해짐 — API는 설계됐고 화면만 없음) |
| **알림 목록·설정 (Notification 신설)** | 전엔 "도메인 자체가 없음"이었는데 이제 **도메인은 생겼고 API 7개 전부 명세화**됨. 서버 상태는 `미구현`이며 **런칭 범위 포함 여부부터 기획 결정 필요**(명세가 직접 요청 — 푸시 서버가 인프라 제외 범위인데 이 화면들은 푸시를 전제로 함) |
| **고객지원(공지·약관·FAQ·문의)** | 마찬가지로 신설·명세화됐으나 서버 `미구현`. 백오피스가 없어 "정적 파일/메일 링크 대체" 여부 기획 판단 필요(명세가 직접 제안) |

### 정책·명세 자기모순 (해소 안 됨)

| 항목 | 내용 |
|---|---|
| **마감된 회비도 "회비 수정" 메뉴가 보임 — 재확인, 미해소** | 화면명세 마감된 회비 상세 "⋮" 메뉴에 "회비 수정"이 여전히 있는데 서버는 `DUES_ALREADY_CLOSED(409)`로 막는다. 대조표도 "기획에 돌려줄 것" 표에 그대로 올려 둠 — **기획 판단 대기**(메뉴를 뺄지, 서버를 열지) |
| **Member tags 최대 개수 (10개 vs 3개) — 미해소** | 필드표 "최대 10개" vs Validation "최대 3개(화면명세 근거)" 모순이 이번 갱신에서도 그대로 남음. 프론트는 3개로 막은 채 유지(§api-mapping.md Member 절) |
| **DUE-1/ETC-2-PAGE-04 검색 버튼 — 명세서 미정리** | 2026-08-31 기획 회의로 삭제 확정됐다고 대조표가 밝히지만 화면명세서 ver 0.25엔 두 화면 모두 검색 항목(No.4)이 여전히 있음. 프론트는 애초에 안 만든 상태 그대로 두면 됨(조치 불필요, 명세만 안 고쳐진 상태) |

### (C) 명세가 "추후 확정"으로 남긴 것 중 여전히 미확정

| 항목 | 상태 |
|---|---|
| 페이지네이션 적용 범위 (§20) | Entry/Dues/Report/File(앨범)/Notification까지 `page/size` 구조가 퍼졌으나 전면 정책 문서는 여전히 없음 — 도메인별로 개별 확인해야 함 |
| 파일 업로드를 별도 API로 분리할지 (§20) | 미확정 그대로. ADD 폼의 "먼저 업로드→fileId 사용" 흐름은 서버 제안과 일치하지만 공식 합의는 아직 없음 |
| 생성·수정 권한 세부 (§21) | 대부분 도메인에서 OWNER/MEMBER 구분이 이번 갱신으로 명확해졌으나(Dues/Entry/Folder/Ledger 전부 명시), User/Auth 신규 엔드포인트(탈퇴·비번변경 등)의 세부 정책은 서버 미구현 상태라 실측 불가 |
| 회비 마감 취소(재오픈) 미제공 | Dues.txt가 "제공하지 않는 것으로 확정"이라 못박음(2026-08-30) — 갭이 아니라 확정된 사양. 7-B에서 버튼을 넣지 않으면 됨(조치 불필요, 참고용으로만 유지) |

---

## 확정됨 — 2026-09-04·09-05 실호출 검증 (구 판단 불가 1·2·5·6·7·8번)

개발 서버(`https://52-78-148-114.nip.io`)에 신규 테스트 계정으로 직접 호출해 확정했다. 계정/생성물 기록은 `docs/api-integration-plan.md` "테스트 데이터 정책" 참고. 검증용 회비 3건은 확인 직후 `DELETE`로 정리했다(entries/ledger/folder/group/계정은 정책상 유지). **1·2번(Dues)은 2026-09-05에 코드 반영도 완료했다** — `DuesCreateScreen.tsx`/`DuesScreen.tsx`/`DuesDetailScreen.tsx`/`types/dues.ts`/`services/duesService.ts` 갱신, 위 우선순위 요약 "코드 반영 완료" 참고. **6·7·8번 전부 코드 반영까지 끝났다** — 검증 당일(7-C 후속)엔 6·8번(folder-items/report)만 코드를 안 건드렸었지만, 8번(Report)은 그 다음 라운드(7-D)에서 생성 플로우 5화면(`screens/Report/`)으로, 6번(folder-items)은 이번 라운드(7-E)에서 `FolderScreen.tsx`(폴더 해제 차단 제거)·`FolderMoveDestinationScreen.tsx`(순차 PATCH → `folderService.moveFolderItems()` 일괄 호출)로 반영됐다. **7번(receipts)**은 검증 당일 바로 화면까지 만들어 코드 반영도 완료했다 — `screens/Receipt/`(`ReceiptAlbumScreen`/`ReceiptSearchScreen`/`ReceiptDetailScreen`/`ReceiptFilterSheet`/`ReceiptGrid`), `services/receiptService.ts`, `types/receipt.ts` 신설, `MoreScreen.tsx`의 "증빙자료 앨범" 진입점 연결. 검증용 폴더·장부·파일은 전부 지웠으나 **보고서(reportId 1~7, groupId 2)는 삭제 API 자체가 없어 남아 있다**(`docs/backend-requests.md` "부탁" 절 참고, 7-E에서 6·7번 추가).

### 1. `POST /groups/{groupId}/dues` — `startDate` 없이 요청

**요청**
```
POST /api/v1/groups/2/dues
Authorization: Bearer {accessToken}
Content-Type: application/json

{"title":"VerifyNoStart","amount":10000,"dueDate":"2026-12-31","targetMemberIds":[1],"ledgerId":1}
```

**응답** `400`
```json
{"code":"INVALID_REQUEST","message":"요청 값이 올바르지 않습니다.","fieldErrors":[{"field":"startDate","reason":"시작일은 필수입니다."}]}
```

**→ 대조표가 맞고 명세 "미구현" 태그가 낡은 것이었다.** `startDate` 없이 호출하면 100% 400. `docs/api-mapping.md`·`docs/api-integration-plan.md`의 "상충"·"상태 상충" 표기를 이 항목에 대해 전부 제거했다.

`startDate`를 넣어 재시도하면 `201`로 정상 생성된다(응답에 `startDate` 그대로 echo). `dueDate`는 `startDate` 이후여야 한다는 명세 그대로.

### 2. `GET /groups/{groupId}/dues` — `startDate`·`status: "SCHEDULED"` 실존 여부

미래 `startDate`(`2026-10-01`, 서버 기준 오늘은 `2026-09-04`)로 회비를 하나 만든 뒤 목록을 조회했다.

**요청**
```
GET /api/v1/groups/2/dues
Authorization: Bearer {accessToken}
```

**응답** `200`
```json
{
  "data": {
    "content": [
      {"duesId":3,"title":"VerifyFuture","amount":10000,"startDate":"2026-10-01","dueDate":"2026-12-31","status":"SCHEDULED","paidCount":0,"unpaidCount":1,"targetCount":1,"ledgerId":1,"ledgerName":"VerifyLedger"},
      {"duesId":2,"title":"검증회비E","amount":10000,"startDate":"2026-09-01","dueDate":"2026-12-31","status":"OPEN","paidCount":0,"unpaidCount":1,"targetCount":1,"ledgerId":1,"ledgerName":"VerifyLedger"},
      {"duesId":1,"title":"VerifyDues1","amount":10000,"startDate":"2026-09-01","dueDate":"2026-12-31","status":"OPEN","paidCount":0,"unpaidCount":1,"targetCount":1,"ledgerId":1,"ledgerName":"VerifyLedger"}
    ],
    "page":0,"size":20,"totalElements":3,"totalPages":1,"first":true,"last":true
  },
  "message":"회비 목록 조회에 성공했습니다."
}
```

**→ 대조표가 맞다.** 미래 시작일 회비는 정확히 `status: "SCHEDULED"`로, 시작일이 지난 회비는 `status: "OPEN"`으로 온다. `startDate`도 목록 응답에 그대로 포함된다. 명세 "미구현" 태그는 낡은 것이었다.

### 5(구). `GET /groups/{groupId}/entries` — 응답 구조(잔액 요약 동봉 여부)

테스트 장부에 지출 내역 1건(25,000원) 등록 후 조회.

**요청**
```
GET /api/v1/groups/2/entries
Authorization: Bearer {accessToken}
```

**응답** `200`
```json
{
  "data": {
    "summary": {"totalIncome":0,"totalExpense":25000,"balance":-25000},
    "entries": {
      "content": [
        {"entryId":1,"ledgerId":1,"ledgerName":"VerifyLedger","type":"EXPENSE","title":"VerifyEntry","amount":25000,"occurredOn":"2026-09-04","approvalStatus":"APPROVED","createdByUserId":6,"createdByName":"VerifyDues","receiptCount":0}
      ],
      "page":0,"size":20,"totalElements":1,"totalPages":1,"first":true,"last":true
    }
  },
  "message":"내역 목록 조회에 성공했습니다."
}
```

**→ 명세와 정확히 일치.** `summary`(수입/지출/잔액)와 `entries`(페이지네이션 목록)가 한 응답에 묶여 온다. 상충이 아니었던 항목이라 예상대로지만, 필드 구조까지 문서와 100% 일치함을 확인했다.

### 6. `GET/POST /groups/{groupId}/folder-items`(-`/move`) — 실존 여부(구 판단 불가 6번)

`VerifyDues`(groupId 2)에 테스트 폴더 트리(루트 `ZZTest7CRoot` → 자식 폴더 `ZZTest7CChild` + 장부 `ZZTest7CLedger`)를 만들어 뎁스인·검색·이동·순환 방지까지 전부 확인했다.

**요청**
```
GET /api/v1/groups/2/folder-items?folderId=5
Authorization: Bearer {accessToken}
```

**응답** `200`
```json
{"data":{"totalCount":2,"items":[
  {"itemType":"FOLDER","id":6,"name":"ZZTest7CChild","childCount":0,"createdAt":"..."},
  {"itemType":"LEDGER","id":4,"name":"ZZTest7CLedger","childCount":null,"createdAt":"..."}
]},"message":"폴더 항목 조회에 성공했습니다."}
```

**→ 대조표가 맞고, 명세 문서의 요청/응답 예시도 필드 하나까지 정확하다.** 처음 `parentId`라는 이름으로 찔러봤을 때는(문서를 안 보고 추측) 쿼리가 조용히 무시돼 항상 루트 목록만 왔다 — **파라미터 이름은 `folderId`**다(Folder.txt에 정확히 이렇게 적혀 있음, 문서 잘못이 아니라 확인할 때 문서를 먼저 안 본 우리 실수). `folderId` 생략 시 최상위(`parentFolderId: null`), 지정 시 그 폴더 바로 아래(폴더+장부 혼합, 폴더 먼저·이름순)만 온다.

`keyword`는 **현재 스코프(`folderId` 유무로 정해지는 그 레벨)에서만** 부분일치 검색한다 — 하위 폴더 안의 항목까지 재귀 검색하지 않는다(예: 루트에서 `keyword=ZZTest7CLedger`는 0건, `folderId=5&keyword=ZZTest7CLedger`는 1건). 문서엔 이 스코프 범위가 명시돼 있지 않아 실호출로 확인한 사실로 기록해 둔다.

`POST /folder-items/move`도 정상 동작한다 — 장부 이동(`{"ledgerIds":[4],"targetFolderId":6}`) 성공 시 `{"movedFolderCount":0,"movedLedgerCount":1,"targetFolderId":6,"targetFolderName":"ZZTest7CChild"}`(`200`), 순환 구조 시도(`{"folderIds":[5],"targetFolderId":6}`, 5의 자식인 6으로 5 자신을 옮기려 함)는 정확히 `409 INVALID_PARENT_FOLDER`로 막힌다. 둘 다 명세 그대로다.

**원자성 검증(2026-09-05, 7-F)** — 7-E에서 "N개 성공 M개 실패" 부분 성공 집계 로직을 지운 근거가 "서버가 트랜잭션이라"는 명세 서술뿐이라 실호출로 재확인했다.

```
POST /api/v1/groups/2/folder-items/move
{"folderIds":[9,99999],"ledgerIds":[],"targetFolderId":8}
→ 404 {"code":"FOLDER_NOT_FOUND","message":"폴더를 찾을 수 없습니다.","fieldErrors":[]}

GET /api/v1/groups/2/folder-items (루트 재조회)
→ 200 folderId 9가 그대로 루트에 남아 있음(폴더 8 안으로 옮겨지지 않았다 — GET folderId=8도 0건)
```

**→ 진짜 트랜잭션이 맞다.** 유효한 폴더(9)와 존재하지 않는 폴더(99999)를 같이 보내니 요청 전체가 `404`로 실패했고, 유효했던 쪽도 이동되지 않은 채 원위치에 남았다 — 부분 이동이 없다. 7-E의 삭제 판단이 옳았다. `services/folderService.ts`의 `moveFolderItems()` 주석에도 이 실호출 근거를 남겼다.

**결론: `folder-items` GET·POST 둘 다 100% 구현 완료, 명세와 완전히 일치.** ✅ **코드 반영 완료(2026-09-05, 7-E)** — 기존 우회 코드를 이 API로 교체했다: `FolderScreen.tsx`의 "최상위 폴더+직속 장부 있음 해제 차단"(`isUnlinkUnsafe`/`unlinkBlocked`)을 없애고 항상 정상 해제 확인으로 가게 했고, `FolderMoveDestinationScreen.tsx`의 다건 순차 `PATCH` 이동을 `folderService.moveFolderItems()`(`POST .../folder-items/move`) 한 번 호출로 바꿨다("N개 성공 M개 실패" 부분 성공 집계도 같이 걷어냄 — 서버가 트랜잭션으로 처리해 필요 없어짐). "장부 최상위 이동 차단"도 같은 이유로 제거.

### 7. `GET /groups/{groupId}/receipts`(증빙자료 앨범) — 실존 여부(구 판단 불가 7번)

`VerifyDues`의 내역(entryId 2)에 실제 이미지 파일(`POST /files`, `purpose=RECEIPT`)을 업로드해 `receiptFileIds`로 연결한 뒤 조회했다.

**요청**
```
GET /api/v1/groups/2/receipts?ledgerIds=1&keyword=Verify&from=2026-09-01&to=2026-09-30
Authorization: Bearer {accessToken}
```

**응답** `200`
```json
{"data":{"content":[
  {"fileId":1,"fileUrl":"https://.../api/v1/files/1/content","entryId":2,"entryTitle":"VerifyPay","occurredOn":"2026-09-05","ledgerId":1,"ledgerName":"VerifyLedger"}
],"page":0,"size":20,"totalElements":1,"totalPages":1,"first":true,"last":true},"message":"증빙자료 조회에 성공했습니다."}
```

**→ 대조표가 맞다.** 진짜 페이지네이션 객체(`content`/`page`/`size`/`totalElements`/`totalPages`)로 오고, `page`/`size`도 실제로 적용된다(7-C에서 발견한 Member 납부내역 API의 "페이지네이션 있다더니 배열"과 다르게 여긴 정상). 필터도 전부 동작: `keyword`(내역 제목 부분일치), `from`/`to`(발생일 기간) 확인함. 단 **`ledgerId`(단수)는 조용히 무시된다 — 장부 필터는 `ledgerIds`(복수, `groupEntries`와 같은 파라미터명)로 보내야 먹는다.**

**결론: `receipts` 100% 구현 완료, 페이지네이션·필터 전부 정상.** ✅ **코드 반영 완료(2026-09-05, 같은 날)** — `screens/Receipt/ReceiptAlbumScreen.tsx`(그리드+필터+무한스크롤)/`ReceiptSearchScreen.tsx`(keyword 검색)/`ReceiptDetailScreen.tsx`(원본 뷰어+핀치줌), `services/receiptService.ts`. 이미지는 `utils/authenticatedImage.ts`(Authorization 헤더 첨부, 401 확인됨)로 불러온다. 썸네일=원본이라 성능 우려는 `design-verification.md` §5-4에 남겼다.

### 8. `POST /groups/{groupId}/reports` — `reportType` 분기(구 판단 불가 8번)

`reportType: "BY_LEDGER"`/`"BY_PERIOD"` 둘 다, `GET .../reports?reportType=`도 실호출로 확인했다.

**요청/응답 — 정상 케이스**
```
POST /api/v1/groups/2/reports
{"reportType":"BY_LEDGER","title":"ZZT3","ledgerIds":[1],"entryType":"INCOME"}
→ 201 {"reportId":2,"title":"ZZT3","reportType":"BY_LEDGER","startDate":"2026-09-05","endDate":"2026-09-05",
       "summary":{"totalIncome":10000,"totalExpense":0,"balance":10000,"entryCount":1,"openingBalance":null,"closingBalance":null},
       "ledgers":[{"ledgerId":1,"ledgerName":"VerifyLedger","totalIncome":10000,"totalExpense":0,"balance":10000}], ...}

POST /api/v1/groups/2/reports
{"reportType":"BY_PERIOD","title":"ZZT7Period","startDate":"2026-01-01","endDate":"2026-12-31"}
→ 201, summary에 openingBalance:0·closingBalance:-15000까지 명세 그대로 채워짐
```

**→ 대조표가 맞다(명세는 중립이었지만 서버는 이미 새 스키마).** `POST`가 **`reportType` 없이 옛 4필드(`title`/`ledgerIds`/`startDate`/`endDate`)로 보내면 이제 `400`에 `fieldErrors:[{"field":"reportType","reason":"보고서 유형은 필수입니다."}]`가 온다** — 옛 스키마는 이미 폐기됐고 새 스키마가 필수다. `BY_LEDGER`는 기간 없이 장부 전체 기간을 담고, `BY_PERIOD`는 장부 없이 기간 내 내역 있는 장부를 자동으로 담는다 — 둘 다 명세 그대로. `GET .../reports?reportType=BY_PERIOD` 목록 필터도 정상 동작.

⚠️ **명세와 다른 지점 하나 발견**: `entryType`은 명세상 `ALL | INCOME | EXPENSE`(선택, 기본값 `ALL`)인데, **`entryType:"INCOME"`/`"EXPENSE"`/필드 생략/`null`은 전부 `201`로 정상 동작하지만 `entryType:"ALL"`을 그대로 보내면 `400`(`fieldErrors: []`, 빈 배열이라 원인이 응답에 안 드러남)이다.** 서버 enum이 `ALL`을 값으로 안 받는 것으로 보인다 — "전체"를 원하면 필드 자체를 생략해야 한다. 화면 구현 시 "구분: 전체" 선택지는 `entryType` 필드를 아예 안 보내는 것으로 매핑해야 한다(`"ALL"` 문자열을 보내면 안 됨).

**결론: `reportType` 분기 100% 구현 완료(옛 스키마는 이미 막힘). `entryType:"ALL"` 리터럴만 피하면 화면 착수 가능.**

---

### 9. `PATCH /groups/{groupId}` — 부분 갱신 여부 + `description: null` 동작(2026-09-06, 7-H)

`PATCH /members`가 전체 교체라 필드가 날아갔던 전례가 있어, 모임 프로필 변경 화면
착수 전에 실호출로 확인했다.

```
PATCH /api/v1/groups/2 {"name":"..."}           → description·groupImageUrl 그대로 유지됨
PATCH /api/v1/groups/2 {"groupImageFileId":12}  → groupImageUrl만 바뀜, name·description 그대로
PATCH /api/v1/groups/2 {"groupImageFileId":null}→ groupImageUrl이 기본값(null)으로 초기화됨
                                                    (파일도 서버가 같이 지움 — 이후 DELETE /files/12가 404)
```

**→ 대조표가 맞다. `PATCH /groups/{groupId}`는 진짜 부분 갱신이다** — Member.txt의 함정과
달리 이름만 보내도 이미지가 안 지워진다. `groupImageFileId`의 3단계(생략=유지/`null`=초기화/
값=교체) 문서화도 실제 동작과 일치.

⚠️ **명세에 없는 동작 하나 발견**: `{"description": null}`만 단독으로 보내면 **204/200은
오지만 `description` 값이 그대로 유지된다 — 초기화되지 않는다.** `groupImageFileId`는 문서에
3단계 의미가 명시돼 있는데 `description`엔 그런 서술이 없다(Group.txt §4는 `groupImageFileId`만
예시로 든다) — 서버가 `description: null`을 "필드 생략"과 같게 취급하는 것으로 보인다. **모임
프로필 변경 화면에서 설명을 지우는 UI를 나중에 추가한다면, `null`로는 안 지워지니 빈 문자열
`""`로 보내지는지 먼저 실호출로 재확인해야 한다** — 이번 라운드는 화면에 설명 필드 자체가
없어(시안에 모임명만 있음) 급하지 않아 재확인은 다음으로 미룬다.

---

## 서버 버그 제보 — `POST /groups/{groupId}/dues` 최초 1건 이후 계속 500 (2026-09-05)

**요약**: 개발 서버(`52-78-148-114.nip.io`)에서 `VerifyDues` 그룹(groupId 2)에 회비를 생성하는
`POST /api/v1/groups/2/dues`가 **딱 한 번 성공한 뒤로는 페이로드를 어떻게 바꿔도 계속
`500 INTERNAL_ERROR`**를 낸다. 클라이언트 코드 문제가 아니다 — 앱 UI로 만든 것과 동일한
계정·토큰·엔드포인트로 curl 직접 호출해도 재현되고, 같은 세션 동안 `GET`류(목록/상세 조회)는
전부 정상 응답했다(토큰 유효성은 문제없음).

**재현 조건**:
- **몇 번째 요청부터**: 2번째 생성 요청부터. 1번째(앱 UI로 생성, 아래 "성공한 요청" 참고)는
  `201`로 성공했고, 그 직후부터 시도한 curl 요청은 전부(같은 세션에서 최소 5회, 수 분에 걸쳐
  재시도 간격을 두고도) `500`이었다.
- **날짜를 바꿔도 재현되는지**: 그렇다. `startDate`를 과거(2026-08-01, 2026-09-01)/오늘 근처
  (2026-09-05)/미래(2026-09-07)로 전부 바꿔봤고, **성공했던 요청과 완전히 동일한 날짜 조합
  (`startDate:2026-09-06, dueDate:2026-09-20`)으로 재시도해도 500**이었다 — 날짜 값 자체는
  원인이 아니다.
- 다른 변수(제목, 금액, `targetMemberIds` 인원 수/구성)도 바꿔봤지만 전부 500 — 페이로드
  형태와 무관하게 이 그룹에 대한 회비 생성 자체가 막힌 것으로 보인다.

**성공한 요청** (앱 UI로 생성, 최초 1건):
```json
POST /api/v1/groups/2/dues
{"title":"MT_2026","amount":30000,"startDate":"2026-09-06","dueDate":"2026-09-20","targetMemberIds":[1,2],"ledgerId":1}
```
→ `201`, `{"data":{"duesId":9,"status":"SCHEDULED",...}}`

**실패한 요청 예시** (curl, 성공 요청 직후):
```json
POST /api/v1/groups/2/dues
{"title":"TestD","amount":10000,"startDate":"2026-09-06","dueDate":"2026-09-20","targetMemberIds":[1],"ledgerId":1}
```
→ `500`
```json
{"code":"INTERNAL_ERROR","message":"서버 오류가 발생했습니다.","fieldErrors":[]}
```
(다른 시도들 — `startDate:2026-09-01/09-05/09-07`, `targetMemberIds:[1,2]` 등 — 전부 같은
`500`/같은 응답 본문.)

**성공 요청과 실패 요청의 차이**: 페이로드 구조·필드는 사실상 동일하다(제목 문자열, 금액,
날짜 형식, `targetMemberIds` 배열, `ledgerId` 전부 같은 그룹·같은 장부·같은 대상자 후보 안에서
값만 바뀜). 유일하게 확실한 차이는 **호출 순서(최초 1번째 vs 그 이후)** 뿐이다 — 클라이언트
쪽에서 뭘 다르게 보낸 게 아니라, 서버 쪽에 뭔가 상태가 남아서 후속 요청을 막는 것으로 보인다
(그룹당 생성 횟수 제한, 특정 리소스 잠금, 혹은 첫 성공 이후 서버 프로세스 자체에 발생한
문제일 가능성 — 로그 확인은 서버팀 쪽에서 필요).

**영향**: 이 버그 때문에 `docs/design-diff.md` "배치 G"에서 회비 상세(DUE-2-PAGE-03-0/03-1)의
OPEN(진행 중)/CLOSED(마감) 상태를 새 데이터로 라이브 캡처하지 못했다 — SCHEDULED(예정) 1건만
확보 가능했다.

---

## 판단 불가 — 여전히 미확인 (명세 "미구현" 태그 vs 대조표 "구현 완료" 주장 상충)

6·7·8번은 2026-09-05 실호출로 확정돼 §확정됨 절로 옮겼다. 아래 2건만 남는다.

| # | 항목 | 명세 태그 | 대조표 주장 | 확인 방법 |
|---|---|---|---|---|
| 3 | 회비 대상 `amount` 필드 | `미구현`(2026-08-30 추가) | "이미 구현됨" | `GET /dues/{duesId}/members` 응답에 `amount` 실존 확인. **참고**: 같은 Dues 도메인의 항목 1·2가 둘 다 대조표 쪽이 맞았다 — 패턴상 이것도 이미 구현됐을 가능성이 높지만 미확인은 미확인 |
| 4 | 납부 상태 일괄 변경 `PATCH /dues/{duesId}/members` | `미구현`(2026-08-30 신설) | "구현돼 있음"(단건 대신 이걸 쓰라고 안내) | 실호출 필요 — 7-B 착수 시 재확인 |

⚠️ 이 문서엔 아직 "판단 불가"로 남아 있지만, `docs/backend-requests.md` "확정됨(9/6, 실호출)" 절을 보면 3·4번 둘 다 7-B-2 착수 전에 이미 실호출로 확정된 것으로 보인다(`amount` 필드 존재 확인, 일괄 PATCH 정상 동작 확인, 코드도 이미 그 API로 갈아 끼움). 이번 라운드(7-C 후속, 2026-09-05)엔 재검증하지 않았고 이 문서에 반영하는 것도 이번 작업 범위 밖이라 표만 남겨둔다 — 다음에 이 문서를 만지는 사람이 `docs/backend-requests.md`를 대조해 이 표에서 마저 지워야 한다.

---

## (B) API는 있는데 대응 화면이 아직 없는 것

`docs/design-verification.md`의 `[미구현]`과 대조한 목록. **DUE는 이번에 대부분 화면이 생겨(6-A/6-B/7-A) 이 표에서 뺐다** — 남은 DUE 항목은 `docs/api-integration-plan.md` "현황" 절에서 7-B로 추적한다.

### 최우선 — 서버 100% 준비됨(상충 없음), 화면만 만들면 붙는다

| 화면 | 필요 엔드포인트 |
|---|---|
| `ETC-4-MODAL-04-0`(로그아웃) | `POST /auth/logout` — `authService.logout()` 이미 완성, 화면(확인 모달)만 필요 |
| `ETC-3-PAGE-07-0`/`ETC-4-PAGE-15-0`(내 프로필/변경) | `GET/PATCH /auth/me`(User.txt 경로 정정) — 서버 `진행 중` |
| Report 나머지(조회 플로우 8개, "보고서 상세 조회" 등) | Report API 3개 전부 확정됨(§확정됨 8번) — `entryType:"ALL"`은 400이니 생략하거나 `INCOME`/`EXPENSE`만 사용. 생성 플로우 5개(`ETC-2-PAGE-04-0`/`ETC-3-SHEET-05-0`/`ETC-4-PAGE-03-0`/`ETC-4-PAGE-04-0`/`ETC-5-PAGE-01-0`)는 7-D/7-E에서 이미 완료돼 이 목록에서 뺐다 |

**2026-09-06(7-H) 이 표에서 뺀 것 — 모두 화면까지 완성**: `ETC-3-MODAL-02-0`(모임 삭제하기, `DELETE /groups/{groupId}`), `ETC-3-PAGE-01-0`(모임 프로필 변경, `PATCH /groups/{groupId}` — 실호출로 부분 갱신 확인, 아래 §확정됨 9번), `ETC-4-MODAL-03-0`(모임 내보내기, `DELETE /groups/{groupId}/memberships/{membershipId}` — 실호출로 204 확인, 이 문서가 API 없음으로 보류시켰던 항목이 실은 있었다).

**`ETC-2-PAGE-05-0`(증빙자료 앨범)은 2026-09-05에 화면까지 만들어 이 표에서 뺐다** — §확정됨 7번 참고. **`FDR-1-PAGE-01-0`/`FDR-2-PAGE-01-0`(folder-items 전환)도 같은 날(7-E) 코드 반영까지 끝나 뺐다** — 새 화면이 아니라 기존 화면의 우회 코드 교체였다.

### 미준비 — 서버도 전체 미구현

| 화면 | 사유 |
|---|---|
| `DSH-2-PAGE-05-0`, `ETC-2-PAGE-07-0`(통계/분석) | Statistics 신설 도메인, 전체 `미구현` |
| `DSH-2-PAGE-01-0`(알림 목록), `ETC-3-PAGE-08-0`(알림 설정) | Notification 신설 도메인, 전체 `미구현` + 런칭 범위 기획 판단 대기 |
| `ETC-3-PAGE-09-0`/`ETC-4-PAGE-18-0`(공지사항), 약관 상세, FAQ, `ETC-3-PAGE-10-0`(문의하기) | Support 신설, 전체 `미구현` + 백오피스 부재로 대체 방안 기획 판단 대기 |
| `FDR-2-MODAL-02-0`, 보관함 4종 | Folder 5·8번, 서버 상태 `시작 전` |
| `ETC-4-PAGE-17-0`(비밀번호 변경, 로그인 상태) | `PATCH /auth/password` 명세는 생겼으나 서버 `미구현` |
| `COM-1-PAGE-02-0` 등(회원 탈퇴) | `DELETE /auth/me` 명세는 생겼으나 서버 `미구현` |
