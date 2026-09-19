# API ↔ 화면 매핑 (api-mapping)

명세 원본: `%BILLAGE_SPEC_ROOT%\api\`(txt 16개 — 공통 규칙 1 + 도메인 15, `Notification & Support`·`Statistics` 2개 신설). 화면 매핑은 `src/screens/**/*.tsx` 상단 `@screen` 주석 전수 `grep` 기준.

참고 자료: `명세대조표.zip`(대조 2026-09-01, FE `04b6c50`/BE `245eeb4` 기준 — Figma 원문 + BE 컨트롤러·DTO를 직접 대조해 만든 문서). 이 문서 곳곳에서 "대조표"로 인용한다.

이 문서 갱신 시점: **2026-09-04(실호출 검증 반영)**. `API 공통 규칙.txt`만 이번 명세 갱신에서 안 바뀌었다(mtime 08-29 그대로).

⚠️ **명세 자체의 상태 태그(`구현 완료`/`미구현`)와 대조표의 실측 결과가 다른 경우가 여럿이다** — 대조표는 BE 컨트롤러·DTO를 직접 열어 확인했다고 밝힌다. 2026-09-04에 개발 서버 실호출 3건으로 그중 Dues `startDate`·상태 3종·Entry 모임 전체 목록 응답 구조를 확정했다(전부 **대조표가 맞고 명세 "미구현" 태그가 낡은 것**이었다 — 상세 요청/응답 전문은 `docs/api-gaps.md` "확정됨" 절). 아래 표에서 이 3건은 더 이상 "상충"으로 표기하지 않는다. 나머지(Folder `folder-items`류, File 앨범, Report `reportType`, Dues `amount`·일괄변경 5건)는 여전히 미확인 — "대조표:"로 병기해 뒀다.

---

## 1. 엔드포인트 → 화면 (도메인별)

### Auth (인증) — 이메일 로그인/가입/재발급 `진행 중`, 소셜 가입 감사로 6개 신규(전부 `미구현`)

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `POST /auth/signup` | 진행 중 | COM-3-PAGE-03-0 | 연동 완료 | Public |
| `POST /auth/login` | 진행 중 | COM-1-PAGE-01-0 | 연동 완료 | Public |
| `POST /auth/refresh` | 진행 예정 | (화면 없음, 401 재시도) | 연동 완료 | Refresh Token |
| `GET /auth/me` | 진행 중 | (세션 복원용) + ETC-3-PAGE-07-0(내 프로필)·ETC-2-PAGE-09-0(설정 허브) | 연동 완료 — **2026-09-06 해결(8-A)**: User.txt(6필드: +profileImageUrl/loginProvider/createdAt)가 최신 확장판으로 확인돼(같은 경로, Auth.txt 3필드는 구버전 서술) `authService.AuthUserResponse`/`CurrentUser`에 3필드 추가 반영 | Login |
| `POST /auth/logout` | 진행 예정 | ETC-4-MODAL-04-0(로그아웃) | `authService.logout()` — **2026-09-06 연결 완료**, `screens/More/MyProfileScreen.tsx`(로그아웃 확인 Dialog) | Refresh Token |
| `POST /auth/email/verification` | 미구현 | COM-4-PAGE-01-0(이메일 인증) | 화면·타이머는 있으나 동작 없음 | Public |
| `POST /auth/email/verification/confirm` | 미구현 | COM-4-PAGE-01-0 | 위와 동일 | Public |
| 회원가입 Body 확장(`verificationToken`/`agreements`) | 미구현 | COM-3-PAGE-03-0 | 미반영 | Public |
| `POST /auth/password/reset` | 미구현 | COM-2-PAGE-02-0(비밀번호 재설정) | 화면은 있으나 TODO | Public |
| `PATCH /auth/password` | 미구현 | ETC-4-PAGE-17-0(비밀번호 변경) | **2026-09-06 화면 완성**(`screens/More/PasswordChangeScreen.tsx`, `authService.changePassword`) — 서버 미구현이라 호출하면 에러 상태, 명세대로 작성해둠 | Login |
| `DELETE /auth/me` | 미구현 | COM-1-PAGE-02-0(탈퇴)~COM-2-PAGE-04/05-0(권한이전/사유) — **[미구현]**, 화면 자체가 없음 | 없음 | Login |

> 소셜 로그인(`/auth/social/login`·`/auth/social/signup`): 이 16개 spec 파일 어디에도 문서화돼 있지 않다. **대조표는 "서버에 실제로 있고 경로도 일치한다, FE 주석(추측 경로 표기)만 지우고 연결하면 된다"고 확인했다** — BE 컨트롤러를 직접 봤다는 뜻이다. Auth.txt 자체는 여전히 이 경로를 언급하지 않아 **명세 문서화 누락**으로 본다(엔드포인트 부재가 아니라 문서 공백). `services/authService.ts`는 이미 이 경로를 호출하고 있다(코드 수정 불필요 — 주석만 낡음).

### User (사용자) — 경로 정정: `/users/me`가 아니라 `/auth/me`

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /auth/me`(User.txt 표기 `/users/me`는 오기 — 실제 경로는 Auth와 동일) | 진행 중 | ETC-3-PAGE-07-0(내 프로필) | **2026-09-06 화면 완성**(`screens/More/MyProfileScreen.tsx`) | Login |
| `PATCH /auth/me`(User.txt 표기 `/users/me`는 오기) | 진행 중 | ETC-4-PAGE-15-0(프로필 변경) | **2026-09-06 화면 완성**(`screens/More/ProfileEditScreen.tsx`, `authService.updateMyProfile`) — 이미지는 mock 제약으로 "기본 프로필로 변경"(`null`)만 실제 전송됨 | Login |

> `GET /auth/me` 응답 필드 수 불일치는 해결됨 — User.txt(6필드)가 최신 확장판, Auth.txt(3필드)는 로그인/세션 복원용 구버전 서술로 판단하고 화면을 만들었다(위 Auth 표 참고). **실호출 재확인은 아직 못 함** — 서버가 이 두 엔드포인트를 "진행 중"에서 완료로 올리면 실제 응답이 이 판단과 맞는지 다시 확인할 것.
> `profileImageFileId`는 Group의 `groupImageFileId`와 같은 3-state 규칙(생략=유지/`null`=기본값/값=교체)이다 — 단, 실제 파일 업로드가 없어 값 지정 케이스는 이번에 코드로 안 붙였다(위 design-verification.md 참고).

### Group (모임) — 전체 구현 완료

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups` | 구현 완료 | ETC-2-PAGE-01-0, MoreScreen 헤더 | 연동 완료 | Login |
| `POST /groups` | 구현 완료 | ETC-4-PAGE-01-0 | 연동 완료 | Login |
| `GET /groups/{groupId}` | 구현 완료 | 여러 화면 | 연동 완료 | MEMBER |
| `PATCH /groups/{groupId}` | 구현 완료 | ETC-3-PAGE-01-0(모임 프로필 변경) — **[미구현]** | 없음(화면 없음) | OWNER |
| `DELETE /groups/{groupId}` | 구현 완료, **Body(`confirmName`) 검증은 미구현**(모임명 오타 방지, 2026-08-30 추가) | ETC-3-MODAL-02-0(모임 삭제) — **[미구현]** | 없음(화면 없음) | OWNER |

> **명세 자기모순(2026-08-30 감사, 명세 자체가 지적)**: 새 모임 생성 화면은 "최대 20자", 모임 프로필 변경 화면은 "최대 10자"로 서로 다르다. 글로벌 정책·현재 구현 모두 10자 — 화면 만들 때 10자로.
> 모임 생성은 이름만 받는다 — `description` 입력 화면이 어디에도 없다(필드 자체는 무해하니 안 보내도 됨).

### GroupMembership (모임 관리자) — 신규 2건 + 응답 확장 다수

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups/{groupId}/memberships` | 구현 완료. **정렬 변경**(총무 먼저→이름순, 2026-09-03) + **응답에 `email` 추가**(2026-08-30, 기존 필드 공백 해소) | ETC-2-PAGE-03-0 | 연동 완료이나 **정렬·email 미반영**(a) | MEMBER |
| `POST /groups/{groupId}/invitations` | 구현 완료. **2026-09-01부터 멱등 발급**으로 변경(유효 코드 있으면 재사용) | ETC-2-PAGE-03-0 | 연동 완료(자동발급 제거 로직 유지 중이나, 이제 **7번 조회 API로 교체 가능**)(a) | OWNER |
| `POST /groups/join` | 구현 완료 | ETC-4-SHEET-01-0 | 연동 완료 | Login |
| `PATCH /groups/{groupId}/memberships/{membershipId}` | 구현 완료. **성공 응답이 1번(목록)과 동일 형태로 확정**(2026-09-01, `email`·`joinedAt` 포함) | ETC-4-MODAL-01/02-0 | 연동 완료이나 **캐시 갱신 로직이 옛 좁은 응답을 가정**(a) | OWNER |
| `POST /groups/{groupId}/leave` | 구현 완료 | ETC-3-MODAL-01-0/01-1 | 연동 완료 | MEMBER |
| `DELETE /groups/{groupId}/memberships/{membershipId}` (강제 내보내기) | **구현 완료**(2026-08-30 명세 보강 — 원래도 구현돼 있었으나 문서에 없었음) | ETC-4-MODAL-03-0(모임 내보내기) — **[미구현]** | 없음(화면 없음). `removeMember()`는 6-B 이전 목 함수, 정리 대상 | OWNER |
| `GET /groups/{groupId}/invitations/current` (초대 코드 조회) | **구현 완료**(2026-09-01 신설) | ETC-2-PAGE-03-0 | 미연동(b) — 이게 생기면서 진입 시 "발급 대신 조회"로 바꿀 수 있음 | MEMBER(코드 없을 때 신규 발급은 OWNER만) |

> 정렬·`email`·응답 형태 3건은 전부 **기존 코드가 낡은 가정으로 짠 부분**이라 (a)로 분류(§api-integration-plan.md 참고). 조회 API 신설은 초대코드 정책 결함을 **완전히 해소**한다 — `docs/api-gaps.md`에서 해결 처리.

### Member (모임원 명단) — 필드 공백 정리, 신규 없음

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups/{groupId}/members` | 구현 완료 | DUE-2-PAGE-02-0 | 연동 완료(7-A) | MEMBER |
| `POST /groups/{groupId}/members` | 구현 완료(에러 응답 섹션 여전히 없음) | DUE-4-PAGE-01-0 | 연동 완료(7-A) | OWNER |
| `POST /groups/{groupId}/members/bulk` | 구현 완료 | DUE-4-PAGE-02-0 | 연동 완료(7-A) | OWNER |
| `PATCH /groups/{groupId}/members/{memberId}` | 구현 완료 | DUE-4-PAGE-03-0(모임원 수정) — **[미구현]** | 없음(7-B 대상) | OWNER |
| `DELETE /groups/{groupId}/members/{memberId}` | 구현 완료 | DUE-4-MODAL-01-0(모임원 삭제) — **[미구현]** | 없음(7-B 대상) | OWNER |

> tags 최대 개수(필드표 10개 vs Validation 3개) 모순은 이번 명세에서도 **그대로 남아 있다** — 정리 안 됨(§3-2 참고).

### Folder (폴더) — 신규 2건(둘 다 기존 우회 코드를 대체)

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups/{groupId}/folders` | 구현 완료 | FDR-1-PAGE-01-0 | 연동 완료 | MEMBER |
| `POST /groups/{groupId}/folders` | 구현 완료 | FDR-2-MODAL-01-0/FDR-3-MODAL-05-0 | 연동 완료 | OWNER |
| `PATCH /folders/{folderId}` | 구현 완료 | FDR-3-MODAL-01-0 등 | 연동 완료(단건). 3b 다건 이동에도 순차 재사용 중 | OWNER |
| `DELETE /folders/{folderId}` | 구현 완료. 정책 메모에 "6번(folder-items)으로 최상위 영역 장부 조회 공백 해소"가 명시됨 | FDR-3-MODAL-02-0 | 연동 완료이나 **최상위+직속장부 조합을 UI에서 여전히 차단 중**(a, 6번 생겼으니 풀 수 있음) | OWNER |
| `POST /groups/{groupId}/folders/archive` | 시작 전 | FDR-2-MODAL-02-0 — **[미구현]** | 없음(스텁 유지) | OWNER |
| `GET /groups/{groupId}/folder-items` | 명세: **미구현**(2026-08-30 추가) / 대조표: 언급 방식상 사용 가능 전제 — **상태 불일치, 실호출 미확인** | FDR-1-PAGE-01-0, FDR-2-PAGE-04-0 | 미연동(a) — 붙이면 폴더+장부 통합 그리드·최상위 조회를 한 번에 해결 | MEMBER |
| `POST /groups/{groupId}/folder-items/move` | 명세: **미구현**(2026-08-30 추가) / 대조표: 사용 가능 전제 — **상태 불일치, 실호출 미확인** | FDR-2-PAGE-01-0 → FDR-3-PAGE-01-0 | 미연동(a) — 붙이면 순차 `PATCH` 다건 이동 코드를 걷어낼 수 있음 | OWNER |
| 보관함 4종(`GET/PATCH/DELETE /archives`) | 시작 전 | 「더보기 > 보관함」 — **[미구현]** | 없음 | MEMBER/OWNER |

> **명세 확인 필요**: 6·7번이 "미구현" 태그인데 대조표는 폴더 화면을 이 API들로 바로 갈아끼우라고 안내한다 — 실제로 배포됐는지 실호출(사용자가 직접 확인 예정)로만 확정 가능.

### Ledger (장부) — 신규 1건(N+1 완전 해소), 필드 1건 추가

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /folders/{folderId}/ledgers` | 구현 완료. **`createdAt` 2026-09-01 추가**(기존 필드 공백 해소) | FDR-1-PAGE-01-0 등 | 연동 완료이나 **`createdAt` 미반영**(카드 서브타이틀이 예산 상태로 대체돼 있음, a) | MEMBER |
| `POST /folders/{folderId}/ledgers` | 구현 완료 | FDR-3-PAGE-03-0 | 연동 완료 | OWNER |
| `GET /ledgers/{ledgerId}` | 구현 완료. `budgetUsageRate` 필드는 **미구현**(2026-08-30 추가) | FDR-2-PAGE-05-0 | 연동 완료(신규 필드 미반영) | MEMBER |
| `PATCH /ledgers/{ledgerId}` | 구현 완료. **`folderId: null`은 "변경 없음"으로 명확화**(2026-09-01) — 최상위 이동 아님 | FDR-3-MODAL-03-0 | 연동 완료. UI가 이미 이 조합을 막아 둠 — 그대로 맞다, 이동은 폴더 move API 사용 | OWNER |
| `PATCH /ledgers/{ledgerId}/budget` | 구현 완료 | FDR-3-SHEET-01/02-0 | 연동 완료 | OWNER |
| `DELETE /ledgers/{ledgerId}` | 구현 완료 | FDR-3-MODAL-04-0 | 연동 완료 | OWNER |
| `GET /groups/{groupId}/ledgers` (모임 전체 장부) | **구현 완료**(2026-09-01 확인) | FDR-2-PAGE-02-0(예산 설정), ADD 장부 선택, 내역 필터, 회비 생성 장부 선택 | 연동 완료(6-B에서 이미 이 엔드포인트로 붙여 N+1 우회 코드 제거함) — 단, 정렬이 "최신 생성순"으로 확정됐는지 재확인 필요 | MEMBER |

> `GET /groups/{groupId}/ledgers`는 이미 3b 이후 프론트가 쓰고 있던 것과 같은 경로다 — 이번 갱신은 상태를 "구현 완료 확인"으로 못박은 것뿐, 코드 변경 불필요.

### Entry (내역) — 신규 1건이 **핵심 공백을 해소**(모임 전체 목록)

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /ledgers/{ledgerId}/entries` | 구현 완료 | FDR-2-PAGE-05-0 | 연동 완료 | MEMBER |
| `POST /ledgers/{ledgerId}/entries` | 구현 완료. `managerUserId`(담당자) 필드 **구현 완료**(PR #27, 대조표 확인) | ADD-1-PAGE-01-0 | 연동 완료이나 **담당자 값을 전송하지 않음**(a, 6-A/6-B 스냅샷 당시 필드가 없어서 뺐던 것 — 이제 있음) | MEMBER |
| `GET /entries/{entryId}` | 구현 완료. `manager` 객체 **구현 완료**(2026-09-01 확인), 마감 회비 수입 내역이면 `duesId`·`duesTitle`·`payerCount`·`payers` 포함(§8) | DTB-2-PAGE-02-0 | 연동 완료이나 담당자·회비 연결 필드 미반영(a) | MEMBER |
| `PATCH /entries/{entryId}` | 구현 완료. `managerUserId`로 담당자 변경 **구현 완료**(2026-09-01 확인) | DTB-3-PAGE-02-0 | 연동 완료(담당자 변경 미반영, a) | OWNER |
| `DELETE /entries/{entryId}` | 구현 완료 | DTB-3-MODAL-01-0 | 연동 완료 | OWNER |
| `POST /entries/{entryId}/approve` | 구현 완료 | DTB-2-PAGE-03-0(승인) — TransactionDetailScreen에 버튼만 추가된 상태 | 연동 완료 | OWNER |
| `GET /groups/{groupId}/entries` (모임 전체 내역 + 잔액 요약) | **구현 완료**(2026-09-01 확인, 대조표: "PR #26에서 구현됨") — **2026-09-04 실호출로 응답 구조까지 명세와 100% 일치 확정**(`docs/api-gaps.md` "확정됨" 절) | DTB-1-PAGE-01-0, DTB-2-PAGE-01-0(검색), DTB-2-SHEET-01-0(필터) | **미연동**(a, 최우선) — 지금은 여전히 장부 단위 API로 우회 중. 이걸로 갈아끼우면 DTB 전체 계열이 한꺼번에 풀린다 | MEMBER |

> `receiptFileIds` 명세 자기모순(활성화 배너 vs "미적용" 문구)은 이번 명세에서 문구가 **정리되지 않았다** — Entry.txt에 여전히 남아 있음(§3-2). 대신 10장 상한이 **서버 검증으로도 확정**됐다(2026-09-01).
> `PATCH .../entries/{entryId}`는 여전히 `ledgerId`를 받지 않는다 — 등록 후 장부 이동 불가는 사양 그대로.

### Dues (회비) — **회비 생성이 지금 100% 깨져 있음 확정**(2026-09-04 실호출)

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups/{groupId}/dues` | 구현 완료. `status` 파라미터에 **`SCHEDULED` 확정**(명세 태그는 `미구현`이었으나 2026-09-04 실호출로 실존 확인 — 미래 `startDate` 회비가 정확히 `SCHEDULED`로 옴). `keyword` 파라미터는 **제거 확정**(2026-08-31) | DUE-1-PAGE-01-0 | 연동 완료(6-A). `keyword` 애초에 안 씀(영향 없음). **`status` 3종·서버 정렬 미반영 — 착수 가능**(a, 상충 해소됨) | MEMBER |
| `POST /groups/{groupId}/dues` | 구현 완료. **`startDate` 필수 확정**(2026-09-04 실호출: 없으면 `400`+`fieldErrors:[{field:"startDate",reason:"시작일은 필수입니다."}]`, 넣으면 `201`) | DUE-2-PAGE-01-0 | 연동 완료(6-B)이나 **`startDate`를 안 보냄 — 회비 생성이 지금 100% 400으로 실패한다(확정)**(a, 최우선) | OWNER |
| `GET /dues/{duesId}` | 구현 완료 | DUE-2-PAGE-03-0/03-1 | 연동 완료(6-A). `createdAt`으로 "납부 기간" 대체 표시 중 — `startDate` 실존 확인됐으니 그 값으로 교체 가능(a) | MEMBER |
| `PATCH /dues/{duesId}` | 구현 완료 | DUE-3-PAGE-06-0(회비 수정) — **[미구현]** | 없음(7-B 대상) | OWNER |
| `DELETE /dues/{duesId}` | 구현 완료(2026-09-04 실호출로 정상 `204` 확인 — 검증용 회비 3건 정리에 사용) | DUE-3-MODAL-01-0(회비 삭제) — **[미구현]** | 없음(7-B 대상) | OWNER |
| `GET /dues/{duesId}/members` | 구현 완료. 응답에 `amount` 추가(미구현 태그, 2026-08-30) — 대조표는 구현됐다고 함(상충, **미확인** — 이번 3건 예산에 없었음) | DUE-3-PAGE-02-0(모임원 선택) | 연동 완료(6-B, 선택 용도만). 납부 완료 탭 금액 노출은 미반영(a) | MEMBER |
| `PATCH /dues/{duesId}/members/{memberId}` (단건) | 구현 완료 | DUE-3-SNACKBAR-01/02-0 — **[미구현]** | 없음(7-B 대상) | OWNER |
| `POST /dues/{duesId}/close` | 구현 완료. **미납자 있어도 마감 허용**으로 정정(2026-08-30, 기존 `UNPAID_MEMBER_EXISTS` 제약 제거 — "구현 수정 필요"라고 명세가 스스로 표시) | DUE-3-MODAL-02-0(회비 마감) — **[미구현]** | 없음(7-B 대상) | OWNER |
| `PATCH /dues/{duesId}/members` (일괄 납부 변경) | **미구현**(2026-08-30 신설) — 대조표는 구현됐다고 함(상충, **미확인**) | DUE-2-PAGE-03-0 하단 CTA "납부 완료하기"/"납부 취소하기" | 없음(7-B 대상) | OWNER |

> **2026-09-04 실호출로 확정**: `startDate` 필수 + `SCHEDULED` 3종 상태 둘 다 대조표가 맞았다 — 명세 "미구현" 태그가 낡은 것이었다. 요청/응답 전문은 `docs/api-gaps.md` "확정됨" 절. **`DuesCreateScreen.tsx`(6-B)는 지금 `startDate`를 보내지 않아 회비 생성이 항상 400으로 실패한다** — 이 프로젝트에서 현재 사용자에게 가장 직접적으로 보이는 파손이다. `amount`(대상자 목록)와 일괄 납부변경 2건은 이번 실호출 예산(3건)에 없어 여전히 미확인.
> "회비 요청하기"(DUE-3-PAGE-04-0)는 **서버 API가 아님**으로 확정 — 클립보드 복사 + OS 공유 시트, 클라이언트 전용 기능. `docs/api-gaps.md`의 관련 (A) 항목은 해결 처리(§2).
> 마감 취소(재오픈)는 **미제공 확정** — 화면에도 진입점 없음, 조치 불필요.

### File (파일) — 신규 1건

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `POST /files`(RECEIPT) | 구현 완료 | ADD-2-SHEET-05-0 등 | 서비스 계층만 존재, 실호출 없음(카메라·갤러리 라이브러리 부재) | Login |
| `POST /files`(GROUP_IMAGE) | 구현 완료(2026-08-24 적용) | ETC-3-PAGE-01-0 — **[미구현]** | 없음(화면 없음) | Login |
| `POST /files`(PROFILE_IMAGE) | 구현 완료 | ETC-4-PAGE-15-0 — **[미구현]** | 없음(화면 없음) | Login |
| `DELETE /files/{fileId}` | 구현 완료. 권한은 **업로더 본인으로 확정**(2026-08-30, "총무가 남의 파일 삭제" 여부는 미정 상태로 명시 종료) | 여러 화면 | 로컬 배열 제거만, 실호출 없음 | 업로더 본인 |
| `GET /files/{fileId}/content` | 구현 완료(인증 필요) | 증빙 썸네일 전반 | 연동 완료(`utils/authenticatedImage.ts`) | 업로더/모임 관리자 |
| `GET /groups/{groupId}/receipts` (증빙자료 앨범) | 명세: **미구현**(2026-08-30 추가) / 대조표: "PR #30에서 구현됨" — **상충, 실호출 미확인** | ETC-2-PAGE-05-0(증빙자료 앨범) — **[미구현]** | 없음(b, 화면 신규 개발 대상) | MEMBER |

### OCR (영수증 인식) — 변경 없음

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `POST /files/{fileId}/ocr` | 시작 전 | ADD-3/4/5 스캔 계열 | `utils/mockOcr.ts` 스텁 | Login |

### Report (보고서) — 요청 형식 분기 추가(미구현), 신규 엔드포인트는 없음

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups/{groupId}/reports` | 구현 완료. `keyword` **제거 확정**(2026-08-31), `reportType` 필터 추가(미구현 태그) — 대조표: "완료(PR #32)" | ETC-2-PAGE-04-0(보고서 리스트) — **[미구현]** | 없음(b) | MEMBER |
| `POST /groups/{groupId}/reports` | 구현 완료이나 **현재 Body가 화면 요구와 어긋남**(장부별/기간별 두 타입을 못 나눔) — `reportType` 분기로 수정 예정(미구현 태그) | ETC-4-PAGE-03/04-0(보고서 생성) — **[미구현]** | 없음(b) — 화면 만들 때 `reportType: BY_LEDGER|BY_PERIOD` 분기부터 반영 | OWNER |
| `GET /reports/{reportId}` | 구현 완료. `openingBalance`/`closingBalance` 추가(미구현 태그, 기간별 보고서 전용) | ETC-3-PAGE-02/03-0 등(보고서 상세) — **[미구현]** | 없음(b) | MEMBER |

> Report 13개 화면 전부 여전히 미착수(b) — API·디자인 다 준비된 이 프로젝트 최대 단일 덩어리라는 평가는 유지된다. 다만 생성 API의 `reportType` 분기가 아직 "미구현" 태그라 **화면 개발과 백엔드 작업이 동시에 필요**할 수 있다(실호출 미확인).

### Dashboard (대시보드) — 신규 1건 + 응답 보강(둘 다 미구현)

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups/{groupId}/dashboard` | 구현 완료. `calendar`/`upcomingDues`/`hasUnreadNotification` 블록 추가는 **미구현**(2026-08-30 화면명세 감사) | DSH-1-PAGE-01-0 | 연동 완료(5단계)이나 신규 3블록 미반영 — 미니 캘린더가 계속 빈 상태인 이유가 이제 명확해짐(a) | MEMBER |
| `GET /groups/{groupId}/calendar` (월간 캘린더) | **미구현** — 화면 「캘린더 전체보기」(DSH-2-PAGE-03-0) | CalendarScreen.tsx(현재 빈 껍데기) | 없음(a) | MEMBER |

> 일별 상세 리스트는 별도 API 없이 `GET /groups/{groupId}/entries?from=X&to=X`(Entry 7번)를 재사용 — 캘린더 화면 자체보다 Entry 7번 연동이 선행돼야 한다.

### Notification & Support (알림·고객지원) — **신설 도메인, 전체 미구현**

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /notifications` | 미구현 | DSH-2-PAGE-01-0(알림 목록) | `MOCK_NOTIFICATIONS` 스텁 | Login |
| `PATCH /notifications/{id}/read` | 미구현 | 위와 동일 | 없음 | Login |
| `GET`/`PATCH /notifications/settings` | 미구현 | ETC-3-PAGE-08-0(알림 설정) — **[미구현]** | 없음 | Login |
| `GET /notices`, `GET /notices/{id}` | 미구현 | ETC-3-PAGE-09-0/ETC-4-PAGE-18-0(공지사항) — **[미구현]** | 없음 | Public |
| `GET /terms/{termType}` | 미구현 | 약관 상세 | 없음 | Public |
| `GET /faqs` | 미구현 | 문의하기 아코디언 | 없음 | Public |
| `POST /inquiries` | 미구현 | ETC-3-PAGE-10-0(문의하기) — **[미구현]** | 없음 | Login |

> **런칭 범위 판단이 먼저 필요**하다고 명세가 명시(푸시 서버가 인프라 제외 범위인데 알림 화면은 푸시를 전제). 고객지원 쪽(공지·약관·FAQ)은 백오피스가 없어 "정적 파일/메일 링크로 대체"를 명세가 직접 제안 — 기획 판단 대기.

### Statistics (통계/분석) — **신설 도메인, 전체 미구현**

| 엔드포인트 | 서버 상태 | 사용 화면 | 프론트 연동 상태 | 권한 |
|---|---|---|---|---|
| `GET /groups/{groupId}/statistics` | 미구현 | 「폴더 메인 > 통계/분석」, ETC-2-PAGE-07-0(더보기 > 소비 통계/분석) — **[미구현]** | 없음 | MEMBER |

> 화면 두 곳이 같은 데이터를 쓰므로 API 하나로 충분(명세가 이미 명시). 응답이 활성 장부 카드·예산 대비 소비·지출 비율 세 블록을 한 번에 묶어 준다.

---

## 2. 이번 갱신에서 바뀐 것 요약 (도메인×변경유형)

| 유형 | 건수 | 도메인 |
|---|---:|---|
| 완전 신규 엔드포인트 | 약 20건 | Auth 6, GroupMembership 2, Folder 2, Ledger 1(전체목록 확정), Entry 1(전체목록), Dues 1(일괄변경), File 1(앨범), Dashboard 1(캘린더), Notification 7, Statistics 1 |
| 기존 엔드포인트 필드/정책 보강 | 약 12건 | GroupMembership(정렬·email·응답형태), Ledger(createdAt·budgetUsageRate), Entry(manager 필드), Dues(startDate·amount·close 정책), Group(confirmName) |
| 상태·파라미터 제거 | 2건 | Dues 목록 `keyword` 제거, Report 목록 `keyword` 제거(둘 다 2026-08-31, 어차피 FE 미사용이라 영향 없음) |
| 명세 자기모순(명세가 스스로 지적) | 4건 | Auth 이름 10자/8자, Group 이름 10자/20자, Report Body 항목, Notification 약관 3종 목록 불일치 |

새로 생긴 것 중 **"미구현" 태그와 대조표 실측이 갈리는 항목**(Dues startDate·status 3종·amount·bulk PATCH, Folder folder-items·move, File receipts, Report reportType)은 이 문서에서 전부 "상충"으로 표시해 뒀다 — `docs/api-gaps.md` §판단 불가 절에서 같은 목록을 관리한다.

---

## 3. 사라진 목 데이터 계층 (참고용, 더 이상 갱신 안 함)

이전 버전 이 문서의 §2·§3(`types/group.ts`·`types/folder.ts`·`types/transaction.ts`·`types/dashboard.ts`의 목 함수 인벤토리, 동기→비동기 전환 영향 범위 23개 파일 집계)는 1~7-A단계를 거치며 **대상 목 함수와 파일 자체가 대부분 삭제됐다**(`types/folder.ts`는 4-A에서 파일째 삭제, `getChildNodes`/`addFolderNode`/`moveNodes` 등도 함께 삭제). 남아 있는 목은 DTB 전체 목록(`types/transaction.ts`, Entry 7번이 아직 미연동이라 유지) 하나뿐이다 — 이제 §1의 도메인별 표가 유일한 참조다.
