# 타입 설계 이슈 (api-type-design)

명세와 현재 `src/types/*.ts`가 구조적으로 어긋나는 지점 정리. 조사만 하고 코드는 안 고쳤다.

---

## 1. `GroupMembership`(권한) ↔ `Member`(납부 명단) 분리

### 서버 모델 (명세 확정)

두 엔티티는 완전히 별개이고 **자동 연결하지 않는다** (`GroupMembership.txt`, `Member.txt`, 공통규칙 §17 전부 동일하게 명시):

- **`GroupMembership`**: 가입 사용자(`User`)와 모임의 관리자 관계. `membershipId`, `userId`, `name`, `role`(`OWNER`/`MEMBER`), `joinedAt`. 초대 코드로 참여하면 이것만 생긴다.
- **`Member`**: 납부 관리·모임원 명단용 사람 데이터. `memberId`, `name`, `phoneNumber`, `tags`, `memo`. 권한 컬럼이 아예 없다. 총무가 `[모임원 추가]`로 **별도로** 등록해야 생긴다.

같은 사람이 둘 다에 존재해도(가입도 하고 총무가 명단에도 등록) 서버가 매칭해 주지 않는다 — 이름이 같아도 별개의 레코드다.

### 현재 코드

`types/group.ts`의 `GroupMember`:

```ts
export type GroupMember = {
  id: string;
  groupId: string;
  name: string;
  email: string;
  role: GroupRole; // 'treasurer' | 'member'
  isMe: boolean;
};
```

이 타입은 사실상 **`GroupMembership`만** 모델링한 것이다(`role`·`email`이 있고 `phoneNumber`·`tags`·`memo`가 없음). `Member`(납부 명단)에 해당하는 타입은 코드에 **아직 없다** — DUE 도메인 화면이 전부 미구현이라 지금까지 필요가 없었다.

### 분리 설계

```ts
// 모임 관리자 권한 관계 — ETC-2-PAGE-03-0(모임 관리자) 등에서 사용
export type GroupMembership = {
  membershipId: string;
  groupId: string;
  userId: string;
  name: string;
  role: 'OWNER' | 'MEMBER'; // 서버 enum 그대로 받고, 화면 표시에서만 한글로 변환
  joinedAt: string;
  /** 서버 필드 아님 — userId === 내 userId를 클라이언트가 계산해서 채운다. */
  isMe: boolean;
};

// 납부 관리용 모임원 명단 — DUE-2-PAGE-02-0(모임원 관리) 등 신규 화면에서 사용
export type Member = {
  memberId: string;
  groupId: string;
  name: string;
  phoneNumber: string | null;
  tags: string[];
  memo: string | null;
  createdAt: string;
};
```

**주의할 점**: 화면을 새로 만들 때 "모임원"이라는 한글 단어가 두 화면(모임 관리자 vs 모임원 관리)에 다 등장해서 헷갈리기 쉽다(이 프로젝트 이전 세션의 구현 계획 문서에도 "화면-기능 이름 주의" 섹션으로 따로 적혀 있었을 만큼). 타입명부터 `GroupMembership`/`Member`로 명확히 나누면 실수로 한쪽 API 응답을 다른 쪽 화면에 흘려보내는 걸 컴파일 타임에 막을 수 있다. `GroupMember`라는 이름은 폐기하는 걸 권한다 — 새 `Member` 타입과 이름이 헷갈린다.

기존 `updateMemberRole()`/`removeMember()`/`leaveGroup()`(전부 `GroupMembership` 대상)과, 앞으로 만들 `Member` CRUD 함수(`addMember()`/`updateMember()`/`removeMember()` 등 — 이름이 겹치므로 모듈을 `types/groupMembership.ts`/`types/member.ts`로 물리적으로도 나누는 걸 권한다)를 섞어 쓰지 않도록 파일 단위 분리가 타입 분리보다 더 실효성 있을 수 있다.

---

## 2. `LedgerTransaction`(folder.ts) + `Transaction`(transaction.ts) → 서버 `Entry` 통합

### 현재 코드: 같은 개념이 두 벌

| | `types/folder.ts` `LedgerTransaction` | `types/transaction.ts` `Transaction` |
|---|---|---|
| id 프리픽스 | `tx-N` | `dtb-tx-N` |
| 용도 | 장부 상세(`FDR-2-PAGE-05-0`) | 내역 탭(`DTB-1-PAGE-01-0`) |
| 저장소 | `SEED_TRANSACTIONS` (folder.ts, 11건) | `SEED_TRANSACTIONS` (transaction.ts, 24건, 이름 겹침) |
| 승인 상태 | 필드 없음 | `isPendingApproval: boolean` |
| 증빙 | `receiptImages: string[]` + `receiptLineItems?` | `receiptImages: string[]` + `hasReceipt: boolean` |

**이게 `DTB-3-PAGE-02-0`(상세 내역_수정)의 진입 경로가 막혀 있는 실제 원인이다.** `DTB-2-PAGE-02-0`(상세 조회)는 `folder.ts`의 `getTransactionById()`로 `tx-N` id를 받는데, 수정 화면(`TransactionRegisterScreen.tsx`)은 기존 데이터를 찾을 때 어느 저장소를 봐야 할지 애매해진다 — 두 저장소가 서로 다른 ID 공간이라 하나로 조회가 안 된다. `docs/shot-routes.md`에도 "상세 내역_조회 화면의 수정 아이콘이 `onPress: () => {}`"로 이미 기록돼 있는 증상과 정확히 같은 원인이다.

### 서버 모델 (Entry, 명세 확정)

```json
{
  "entryId": 1,
  "ledgerId": 1,
  "ledgerName": "여름 정기공연 장부",
  "type": "EXPENSE",
  "title": "공연장 대관료",
  "amount": 500000,
  "occurredOn": "2026-07-20",
  "memo": "여름 정기공연",
  "approvalStatus": "APPROVED",
  "createdBy": { "userId": 1, "name": "홍길동" },
  "approvedBy": { "userId": 2, "name": "김총무" },
  "approvedAt": "2026-07-22T18:10:00+09:00",
  "receiptFiles": [{ "fileId": 21, "fileName": "receipt.jpg", "fileUrl": "https://.../receipt-21.jpg" }]
}
```

목록 응답(`GET /ledgers/{ledgerId}/entries`)은 `ledgerName`이 없고 `receiptCount`(개수만) + `createdByUserId`/`createdByName`(평평한 필드)를 쓴다 — 상세와 목록의 응답 shape가 다르다.

### 통합 설계

```ts
// 목록 응답 shape
export type EntrySummary = {
  entryId: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number; // 항상 양수 — 부호로 수입/지출을 구분하지 않는다
  occurredOn: string;
  approvalStatus: 'PENDING' | 'APPROVED';
  createdByUserId: string;
  createdByName: string;
  receiptCount: number;
};

// 상세 응답 shape (EntrySummary와 필드가 겹치지만 별도 타입으로 관리)
export type EntryDetail = {
  entryId: string;
  ledgerId: string;
  ledgerName: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: 'PENDING' | 'APPROVED';
  createdBy: { userId: string; name: string };
  approvedBy: { userId: string; name: string } | null;
  approvedAt: string | null;
  receiptFiles: { fileId: string; fileName: string; fileUrl: string }[];
};
```

### 반드시 짚어야 할 변경점 — 부호 관례 폐지

지금 코드 전역이 **"지출은 음수, 수입은 양수"** 라는 `amount` 부호 관례에 의존한다(두 타입 정의에 나란히 주석으로 박혀 있다). 화면 쪽에서 `amount > 0`으로 수입/지출을 분기하는 코드가 여러 군데 있을 것이다(`TransactionListItem.tsx`의 `isIncome && styles.amountIncome`류). 서버는 `amount`를 **항상 양수**로 내려주고 `type: 'INCOME' | 'EXPENSE'` **명시적 enum**으로 구분한다.

이건 단순 리네이밍이 아니라 **조용한 부호 버그**를 만들 수 있는 지점이다 — `amount > 0` 체크를 `type === 'INCOME'`로 안 바꾸고 그대로 두면, 서버가 준 양수 지출 금액이 전부 "수입"으로 잘못 표시된다. 연동 체크리스트에 반드시 "amount 부호 분기 전부 type 분기로 교체" 항목으로 남겨야 한다.

### 그 외 필드 매핑

| 현재 필드 | 서버 필드 | 비고 |
|---|---|---|
| `itemName` | `title` | 이름만 다름 |
| `date` (`'YYYY.MM.DD'`) | `occurredOn` (`'YYYY-MM-DD'`) | 구분자도 `.`→`-`로 바뀜 — 화면 표시용 포맷 함수가 이 형식 변경을 흡수해야 함 |
| `isPendingApproval: boolean` | `approvalStatus: 'PENDING'\|'APPROVED'` | MVP는 반려(`REJECTED`) 없다지만 boolean보다 enum으로 받는 게 미래에 안전 |
| `hasReceipt: boolean` | 없음(파생) | `receiptCount > 0` 또는 `receiptFiles.length > 0`으로 클라이언트가 계산 |
| `receiptImages: string[]`(로컬 URI 문자열) | `receiptFiles: {fileId, fileUrl}[]` | 타입 자체가 바뀐다 — 첨부 업로드 흐름 전체를 다시 짜야 함(§api-gaps.md (C)의 파일 분리 이슈와 연결) |
| `receiptLineItems?`(folder.ts에만 있음) | 없음(OCR 응답의 `items[]`가 이 역할) | OCR 결과를 Entry에 영구 저장할지는 명세도 미확정(OCR.txt 정책 메모) |
| id 두 벌(`tx-N`/`dtb-tx-N`) | `entryId` 하나 | 통합되면 상세→수정 연결 문제가 자동으로 해소된다 |

---

## 3. Enum 대조

공통규칙 §13: 서버는 영문 대문자+언더스코어 enum을 쓰고, **프론트는 원문을 그대로 노출하지 않고 한글로 변환**해야 한다. 지금 코드에 이런 변환을 전담하는 공용 유틸(`constants/enumLabels.ts` 같은 것)은 없다 — 있는 곳(`role`)도 화면마다 개별적으로 처리하는 것으로 보인다. Enum이 늘어나는 시점(Entry/Dues 연동)에 공용 매핑 테이블을 하나 두는 걸 권한다.

| 서버 Enum | 서버 값 | 현재 코드 표현 | 변환 필요 여부 |
|---|---|---|---|
| `GroupMembership.role` | `OWNER` / `MEMBER` | `GroupRole = 'treasurer' \| 'member'` | **필요.** 매핑은 1:1로 명확(`treasurer↔OWNER`, `member↔MEMBER`)하지만 문자열 자체가 다르므로 API 응답을 그대로 못 씀 |
| `Entry.type` | `INCOME` / `EXPENSE` | 없음 — `amount` 부호로 암시 | **신규 도입.** 단순 이름 매핑이 아니라 위 §2의 구조 변경이 필요 |
| `Entry.approvalStatus` | `PENDING` / `APPROVED` | `isPendingApproval: boolean` | **필요.** boolean → enum 전환 |
| `Dues.status` | `OPEN` / `CLOSED` | 없음(DUE 미구현) | 신규 타입 작성 시 서버 값 그대로 받고 표시만 한글화 |
| `Dues 대상자.status`(PaymentStatus) | `UNPAID` / `PAID` | 없음(DUE 미구현) | 위와 동일 |

`GroupRole`을 언제 `OWNER`/`MEMBER` 그대로 갈아탈지가 관건이다 — 지금처럼 코드 내부용 값(`treasurer`/`member`)을 유지하고 API 경계에서만 변환할지, 아예 서버 값을 코드 전역에 쓸지는 §api-integration-plan.md의 GroupMembership 연동 단계에서 같이 결정해야 한다.
