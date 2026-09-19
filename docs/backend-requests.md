# 백엔드 요청 사항 — Billage FE

작성 2026-09-05 · **갱신 2026-09-11(Swagger 전수 대조 + 실호출)** · 근거 `docs/api-wiring.md`

프론트가 실제로 막혀 있거나 대기 중인 것만 추렸습니다. 우선순위는 **프론트 개발을 막고 있는 정도** 순입니다.

> **9/11 갱신 — 우선순위 전면 재정렬.** Swagger 77개 엔드포인트 전수 대조 결과, 이전에 "서버
> 미구현"으로 적어뒀던 항목 중 **회원 탈퇴(`DELETE /auth/me`), 내 프로필(`GET/PATCH /auth/me`),
> 통계(`/statistics`), 이메일 인증 발송/확인**이 실제로는 전부 구현돼 있었습니다(경로가
> 명세서와 달라 프론트가 오판했거나, 상태 태그 자체가 낡아 있었습니다) — 아래 "제거된 항목"
> 참고. 대신 **이메일 발송 설정(`MAIL_SEND_FAILED`)이 이메일 신규가입 전체를 막고 있는 게
> 이번에 드러난 가장 급한 문제**라 1순위로 올렸습니다.

---

## 확인 완료 — 백엔드 노티(2026-09-06) 01-1 · 02번

- [해결] 01-1 기록 보관 생성 경로/응답 필드 (2026-09-06)
- [해결] 02 `PATCH /auth/password`의 `refreshToken` 전달 (2026-09-06)

---

## 1순위 — 개발 서버 메일 발송 설정이 안 돼 있어 이메일 신규가입 전체가 막혀 있습니다

**2026-09-11 확인**: 이메일 인증 발송/확인 API 자체는 정상입니다 — 프론트가 예전에 잘못된 경로
(`/auth/email/verification`, 단수)로 부르고 있어 "서버 미구현"으로 오판했던 것뿐이고, 실제 경로
(`/auth/email-verifications`, 복수·하이픈)로 고쳐서 부르면 라우팅은 정상 통과합니다. 그런데 그
뒤에서 실제 메일 발송이 `500 MAIL_SEND_FAILED`로 항상 실패합니다.

```
POST /api/v1/auth/email-verifications
→ 500 {"code":"MAIL_SEND_FAILED", ...}
```

**막히는 것**: 이메일 회원가입 플로우 전체(신규 이메일 가입 전체가 이것 하나에 막혀 있습니다).
소셜 가입은 인증 단계가 없어 우회되지만, 이메일 가입 경로는 완전히 죽어 있습니다.

개발 서버의 메일 발송 설정(SMTP 자격 증명, 발신 도메인 등)을 확인해 주세요.

**2026-09-13 재검증**: 이 기록이 맞는지 다시 확인했습니다(같은 세션에서 curl 셸 리터럴
인코딩 문제로 다른 건을 두 번 오진해서, 이 기록도 혹시 틀렸는지 의심하고 다시 봤습니다).
`POST /auth/signup`(회원가입 자체)은 UTF-8 파일 기반 curl로 재확인한 결과 **정상
동작합니다**(신규 이메일 `201`, 중복 이메일 `409 EMAIL_ALREADY_EXISTS`). 막힌 지점은
여전히 정확히 `POST /auth/email-verifications`(인증 코드 발송, 신규 이메일로 재확인
결과 여전히 `500 MAIL_SEND_FAILED`) 하나뿐입니다 — 이 기록은 정정할 필요 없이 그대로
맞습니다. 앱의 가입 순서(발송 → 코드 확인 → 가입)가 직렬이라 1단계가 막히면 3단계
(정상 동작하는 가입)에 순서상 도달할 수 없다는 뜻이라 "가입 전체가 막혀 있다"는 서술이
정확합니다.

**2026-09-17 재확인 — 여전히 막혀 있습니다.** `scripts/api-call.js`(UTF-8 파일 바디,
`API_CALL_NO_AUTH=1`)로 신규 미가입 이메일에 재호출:
```
POST /api/v1/auth/email-verifications  {"email":"billage.diag.20260917.<timestamp>@example.com"}
→ 500 {"code":"MAIL_SEND_FAILED","message":"메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.","fieldErrors":[]}
```
4일 전과 동일한 응답. 상태 변화 없음 — 개발 서버 메일 발송 설정(SMTP/SES) 확인이 여전히
필요합니다.

---

## 2순위 — 보고서 스냅샷에 영수증·메모가 없어 화면 3개가 미완입니다

**갱신(2026-09-11, Swagger 전수 대조)**: 이 요청을 "동결 스냅샷 정책상 영수증을 못 넣는다"는
정책 문제로 이해하고 계셨다면 정정 부탁드립니다 — **정책이 아니라 엔드포인트 간 불일치**입니다.
같은 서버 안에 이미 훨씬 풍부한 스냅샷을 내려주는 엔드포인트가 있습니다.

- **`GET /archives/{archiveId}`(보관함 상세)의 `ledgers[].entries[]`는 `memo`·`approvalStatus`·
  `createdByName`·`receiptFiles[{fileId, fileName, fileUrl}]`를 전부 내려줍니다** — 저희가 요청드리는
  것과 정확히 같은 모양의 데이터를 이미 다른 도메인이 얼려서 주고 있다는 뜻입니다.
- **`GET /ledgers/{ledgerId}/entries`(장부별 내역 목록)에도 `receiptCount`가 이미 있습니다** —
  보고서 목록/생성 응답의 `ledgers[]`(장부 요약)엔 없지만, 훨씬 기본적인 조회 API에는 이미 있는
  필드라 "영수증 개수를 계산해서 내려주는 로직" 자체는 이미 서버 어딘가에 있다는 뜻입니다.

세 응답 스키마를 나란히 놓고 보면 차이가 명확합니다:

```json
// GET /archives/{archiveId} — entries[] 항목 (이미 이렇게 옵니다)
{
  "type": "INCOME", "title": "string", "amount": 0, "occurredOn": "2026-09-11",
  "memo": "string", "approvalStatus": "PENDING", "createdByName": "string",
  "receiptFiles": [{ "fileId": 0, "fileName": "string", "fileUrl": "string" }]
}

// GET /reports/{reportId} — entries[] 항목 (지금 이 4개뿐)
{ "type": "INCOME", "title": "string", "amount": 0, "occurredOn": "2026-09-11" }

// GET /ledgers/{ledgerId}/entries — content[] 항목 (참고: receiptCount는 여기 이미 있음)
{
  "entryId": 0, "type": "INCOME", "title": "string", "amount": 0, "occurredOn": "2026-09-11",
  "approvalStatus": "PENDING", "createdByUserId": 0, "createdByName": "string", "receiptCount": 0
}
```

**요청을 이렇게 바꿔서 다시 드립니다: "보관함(`/archives/{archiveId}`)과 완전히 동일한 모양으로
맞춰주세요."** 이미 구현된 스키마가 있으니 새로 설계할 필요 없이 보고서 쪽에도 같은 매핑을
복사해주시면 될 것으로 보입니다 — 아래는 그 근거였던 원래 현상 설명입니다.

**현상**: `GET /reports/{reportId}`의 `ledgers[].entries[]`가 `{type, title, amount, occurredOn}` 4개 필드뿐입니다. 실호출 응답 그대로:

```json
GET /api/v1/reports/6
{
  "data": {
    "reportId": 6, "groupId": 2, "title": "Step7DReportByLedger",
    "reportType": "BY_LEDGER", "startDate": "2026-09-04", "endDate": "2026-09-05",
    "summary": {"totalIncome":10000,"totalExpense":25000,"balance":-15000,"entryCount":2,"openingBalance":null,"closingBalance":null},
    "ledgers": [
      {
        "ledgerName": "VerifyLedger", "totalIncome": 10000, "totalExpense": 25000, "balance": -15000,
        "entries": [
          {"type":"EXPENSE","title":"VerifyEntry","amount":25000,"occurredOn":"2026-09-04"},
          {"type":"INCOME","title":"VerifyPay","amount":10000,"occurredOn":"2026-09-05"}
        ]
      }
    ],
    "createdAt": "2026-09-05T10:51:08.035647+09:00"
  },
  "message": "보고서 조회에 성공했습니다."
}
```

**막히는 것**: `ETC-5-PAGE-02-0`(보고서_내역 상세) 전체, `ETC-4-PAGE-05-0`(보고서_장부 상세)·`ETC-4-PAGE-07-0`(보고서_시간순)의 리스트 행 영수증 첨부 아이콘.

**시안 근거** — `ETC-4-PAGE-05-0` UI 요소 6번 원문:

> [데이터] 개별 내역 데이터: 내역명, 금액, 영수증 첨부 아이콘
> [액션] 특정 내역 터치 시: 해당 보고서 생성 시점의 데이터로 동결된 '상세 내역 조회' 화면으로 뎁스 인(ETC-5-PAGE-02-0)
> 유저는 개별 거래 건의 영수증 원본과 상세 메모까지 끝까지 추적 및 조회할 수 있음

**요청은 `entryId` 추가가 아닙니다.** entryId로 원본을 재조회하면 원본이 나중에 수정될 때 보고서도 따라 바뀌어 시안의 "생성 시점의 데이터로 동결"과 어긋납니다(정책 메모: "원본 장부·내역이 수정되거나 삭제되어도 응답의 스냅샷 데이터는 변경되지 않습니다"). 대신 **스냅샷 안에 `memo`, `receipts[]`(`fileId`·`fileUrl`), `receiptCount`를 함께 얼려서** 내려주시면 좋겠습니다 — 영수증 파일 자체는 이후 안 바뀌니(File.txt "이미지 압축은 하지 않습니다") URL을 스냅샷 시점에 동결해도 계속 유효할 것으로 봅니다.

**대안**: 스냅샷 동결이 정책상 어렵다면 `entryId`를 내려주고 화면에 "원본이 수정되었을 수 있어요" 안내를 붙이는 방식도 가능하지만, 이건 저희가 임의로 정할 일이 아니라 기획 결정이 필요합니다.

프론트 처리 현황: 위 3화면은 만들어 뒀고(`screens/Report/`) 나머지 필드(내역명/금액/발생일/장부명, 그리고 05-0·07-0의 탭·리스트)는 정상 동작합니다 — 영수증 아이콘 자리는 비워두지 않고 아예 뺐습니다(데이터 없이 빈 자리를 두면 나중에 정렬이 틀어져서요). `docs/design-verification.md`에서 이 3화면을 `[구현]`에서 `[부족함]`으로 내렸습니다.

---

## 3순위 — `GET .../receipts`에 `sort` 파라미터를 붙이면 500

**계약 자체가 깨져 있습니다.** Swagger 스키마엔 `pageable.sort`가 정식 파라미터로 문서화돼
있는데, 실제로 붙이면 값과 무관하게 `500 INTERNAL_ERROR`가 납니다 — 기본값과 같은 값
(`?sort=occurredOn,desc`)을 보내도 500이었습니다.

저희는 이 파라미터를 아예 안 보내는 걸로 화면을 만들었습니다(서버가 이미 발생일 내림차순
고정이라 없어도 동작에 지장은 없습니다). 다만 **문서화된 파라미터가 실제로 서버를 터뜨리는
상태**라 원인 확인을 부탁드립니다 — 다른 화면/로직이 이 파라미터에 의존하게 되면 같은 이유로
막힐 수 있습니다.

(참고, 같은 API의 별도 이슈) 장부 필터는 `ledgerId`(단수)가 아니라 `ledgerIds`(복수)로 보내야
합니다 — `ledgerId`는 조용히 무시됩니다(에러 없음). 급하지 않지만 문서 표기와 다르면 헷갈릴 수
있어 같이 적어둡니다.

---

## 4순위 — `DELETE /auth/me` 요청 바디를 컨트롤러/DTO 기준으로 확인해주세요

**Swagger가 실제 응답과 다를 수 있다는 게 이번에 직접 확인됐습니다** — `GET /archives/{id}`의
`summary{}` 래핑이 Swagger 문서엔 있었는데 실제 응답은 그런 래핑 없이 평평한 구조였습니다
(2026-09-12, 실호출로 발견 및 수정 — `docs/api-integration-plan.md` "실호출 절차" 참고). 그래서
Swagger 스키마만 보고 확정해뒀던 `DELETE /auth/me`의 요청 바디도 같은 방식으로 실제와 다를 수
있다고 봅니다.

`DELETE /auth/me`는 계정을 실제로 지우는 되돌릴 수 없는 호출이라 저희 쪽에서 실호출로 검증할
방법이 없습니다. 지금 보내고 있는 바디는 Swagger 스키마만 믿고 맞춰둔 상태입니다:

```json
{ "ownershipTransfers": [{ "groupId": 0, "newOwnerUserId": 0 }], "reasons": [], "reasonDetail": "" }
```

**요청 바디 구조를 컨트롤러/DTO 기준으로 확인해주세요.** 특히:

1. **`ownershipTransfers`의 필드명** — `groupId`/`newOwnerUserId`가 맞는지. archive 건처럼
   래핑이나 필드명이 다르면 **탈퇴가 그냥 실패하는 정도가 아니라, 권한 이전이 누락된 채
   실행되는 최악의 경우(유일 총무인 모임이 주인 없이 남는 상황)가 있을 수 있어** 특히
   신중하게 봐주셨으면 합니다.
2. **`reasons` enum 전체 목록** — Swagger 예시엔 `USAGE_UNCLEAR` 하나만 나와 있어 나머지
   허용값을 모릅니다. 잘못된 값을 넣어 `400`으로 유도해봤지만
   (`{"code":"INVALID_REQUEST","message":"요청 값이 올바르지 않습니다.","fieldErrors":[]}`) 서버가
   구체적으로 어떤 값이 허용되는지는 응답에 안 실어줘 이 이상은 실호출로 못 알아냅니다(계정
   삭제 위험 때문에 더 시도하지 않았습니다). 지금 화면(`WithdrawReasonScreen`)의 체크박스
   5개(`USAGE_UNCLEAR`/`REJOIN`/`MISSING_FEATURE`/`NO_LONGER_NEEDED`/`ETC`)는 Swagger
   스키마를 그대로 옮긴 추정값이라, `USAGE_UNCLEAR` 외 4개는 실제 서버 값과 이름이 다를 수
   있습니다.

두 가지 다 확인해주시면 정확히 맞추겠습니다.

**2026-09-13 2번 확인**: 백엔드 노티(2026-09-06) 05번이 "탈퇴 사유 5종이 계약대로"라고
확인해줬습니다 — 저희가 Swagger 스키마에서 추정해 화면에 넣어둔
`USAGE_UNCLEAR`/`REJOIN`/`MISSING_FEATURE`/`NO_LONGER_NEEDED`/`ETC` 5개가 실제 값과
일치한다는 뜻으로 받아들이고 확정으로 정정합니다(파괴적 호출이라 저희 쪽에서 직접
재현 검증은 안 했습니다 — 계정 삭제 위험 때문입니다). 1번(`ownershipTransfers`
필드명)은 여전히 미확인이니 답변 부탁드립니다.

---

## 신규 — `ARCHIVE_NOT_FOUND` 에러 코드가 어느 명세에도 없습니다 (2026-09-13)

이미 위 "7순위 문서 정정"에 올렸던 것과 같은 건입니다 — 중복 없이 여기 한 번만 남깁니다.
`Folder.txt`의 백업/보관함 섹션엔 `ARCHIVE_IN_PROGRESS`만 적혀 있고 `ARCHIVE_NOT_FOUND`는
어디에도 없는데, 실제로는 정상 동작하는 코드입니다.

재현:
```
GET /api/v1/archives/999999 (존재하지 않는 archiveId)
→ 404 {"code":"ARCHIVE_NOT_FOUND","message":"보관 기록을 찾을 수 없습니다.","fieldErrors":[]}
```

코드 자체는 안 고칩니다(이미 맞는 문구로 매핑해뒀습니다) — 명세 문서에 이 코드만
추가해주시면 됩니다.

## 신규 — `GET /reports/{reportId}` vs `GET /archives/{id}` 응답 필드 불일치 (2026-09-13)

위 "2순위"와 같은 건입니다 — 중복 없이 요약만 다시 남깁니다. 같은 성격의 데이터(보고서
스냅샷의 내역 목록)인데 두 엔드포인트가 내려주는 필드 개수가 다릅니다.

- `GET /archives/{id}`의 `ledgers[].entries[]`: `memo`/`approvalStatus`/`createdByName`/
  `receiptFiles[]`까지 전부 옵니다.
- `GET /reports/{reportId}`의 `ledgers[].entries[]`: `{type, title, amount, occurredOn}`
  4개뿐입니다.

두 도메인이 같은 성격의 스냅샷 데이터를 다른 상세도로 내려주는 게 의도인지, 아니면
Report 쪽이 아직 다 안 만들어진 건지 확인 부탁드립니다(상세는 위 2순위 섹션 참고).

## 신규 — 이메일 미인증 계정으로 로그인이 됩니다 (2026-09-13, 확인 요청)

`POST /auth/signup`으로 직접 가입한 계정은 이메일 인증(발송 → 코드 확인) 단계를 전혀
거치지 않았는데도 `POST /auth/login`으로 정상 로그인됩니다. 저희 쪽이 진단 중 실제로
겪었습니다 — 재현 계정 `userId 9`(`billage.verify.newcheck9999@example.com`)로 재현
가능합니다:

```
POST /auth/signup {"email":"...","password":"...","name":"..."}
→ 201 (이메일 인증 안 거침, userId 9 생성)

POST /auth/login {"email":"...","password":"..."}
→ 200 (정상 로그인, 토큰 발급됨)
```

Auth.txt 정책상 이메일 인증(6·7번)이 회원가입 플로우의 필수 단계로 설계돼 있는데,
로그인 자체는 인증 여부를 검사하지 않아 사실상 이 단계를 완전히 우회할 수 있습니다.
의도된 설계(예: 인증은 나중에 하도록 유예)인지, 아니면 로그인 시점에 이메일 인증
여부를 확인해야 하는데 빠진 것인지 확인 부탁드립니다 — 후자라면 보안 문제입니다.

## 신규 — 백업(기록 보관) 실행 시 원본 장부가 활성 폴더 트리에서 사라지는 부수효과 (2026-09-13, 확인 요청)

`POST /groups/{groupId}/archives`(전체 백업) 성공 후 `GET /groups/{groupId}/folders`로
보면 원본 폴더가 전부 사라져 있습니다(2026-09-12 실기기·실호출로 재현 확인). 시안
(`FDR-2-MODAL-02-0` 명세) 문구 "보관된 장부는 수정이 불가합니다"와는 일치하는 동작으로
보이지만, **이 노티 문서엔 이 부수효과 자체가 전혀 언급돼 있지 않습니다.** 저희는 지금
"의도된 동작"으로 보고 프론트를 그에 맞게 만들어 뒀는데(백업=원본을 읽기 전용 스냅샷으로
옮기는 것), 확인 부탁드립니다 — 만약 의도가 아니라면 데이터 유실에 준하는 문제라
우선순위를 올려야 합니다.

---

## 확정됨(2026-09-11, Swagger 전수 대조 + 실호출) — 프론트 자체 버그 3건

- **폴더 전체 백업이 항상 실패하던 원인**: `archiveService.ts`가 `POST /groups/{groupId}/folders/archive`
  (실제로는 존재하지 않는 경로)를 부르고 있었습니다 — 실호출로 `404 RESOURCE_NOT_FOUND` 확인.
  진짜 경로는 다른 archive 함수들과 같은 `POST /groups/{groupId}/archives`였고, 고친 뒤 실호출로
  `422 ARCHIVE_EMPTY`까지 확인했습니다 — 라우팅 문제였을 뿐 서버 로직은 정상입니다. **2026-09-12
  실기기로 조건도 정확히 확정**: 모임에 내역이 1건도 없으면 `ARCHIVE_EMPTY`(장부가 여러 개 있어도
  막힘), 내역이 1건이라도 있으면 성공하고 이때 빈 장부까지 전부 함께 보관됩니다 — 다이얼로그 문구
  ("현재까지 장부를 모두 보관할까요?")와 일치하는 의도된 동작으로 보여 서버 쪽 조치는 불필요합니다.
  저희 쪽 에러 문구만 조건에 맞게 고쳤습니다("아직 등록된 내역이 없어요...").
- [해결] 이메일 인증 발송/확인 경로 (2026-09-11)
- **비밀번호 변경 바디 누락 필드**: `PATCH /auth/password`가 `{currentPassword, newPassword}`만
  보내고 있었는데 Swagger 스키마엔 `refreshToken`이 포함돼 있습니다 — "현재 기기를 제외한 나머지
  Refresh Token을 폐기한다"는 기존 정책 메모와 앞뒤가 맞아, 이 기기 자체를 특정하려면 필요한
  값으로 보고 추가했습니다(공유 테스트 계정 비밀번호를 실제로 바꾸는 실호출은 하지 않았습니다 —
  destructive해서 스키마 근거만으로 고쳤습니다, 아래 요약 항목에서 확인 요청드립니다).
- **(2026-09-13, 철회) 보고서 제목에 한글이 들어가면 생성이 실패한다고 잘못 진단했던 건**:
  최초 curl 테스트(`-d '...'`, 셸 리터럴)에서 한글이 Windows 환경 인코딩 문제로 깨진 채
  나갔을 가능성을 안 걷어내고 서버 버그로 잘못 결론 내렸습니다. UTF-8 파일을 만들어
  `--data-binary @req.json`으로 다시 보내니(바이트 확인: "진단테스트" 5자 15바이트,
  정확한 UTF-8) `201 Created`로 정상 성공했습니다 — **서버는 한글 제목을 문제없이
  받습니다.** 실제 원인은 두 가지가 겹쳐 있었습니다: (1) 처음 실패를 봤던 캡처는 사용자가
  내역이 0건인 장부("B", ledgerId 22)를 선택한 상태였고, 서버는 `REPORT_RANGE_EMPTY`
  (선택한 장부·기간에 담을 내역이 없음, 명세에 이미 정의된 정상 에러 코드)를 정확히
  돌려주고 있었습니다 — 진짜 버그가 아니라 데이터 조건 문제입니다. (2) 다만
  `constants/apiErrorMessages.ts`에 Report 도메인 에러 블록 자체가 없어서
  `REPORT_RANGE_EMPTY`가 매핑에 없는 코드로 취급돼 기본 fallback 문구("일시적인 문제가
  발생했어요...")로 덮여 있었습니다 — 이건 진짜 프론트 버그였고 `REPORT_ERROR_MESSAGES`
  블록을 새로 추가해 고쳤습니다. 서버 조치 불필요합니다. 재현 과정에서 만든 `reportId`
  13/14/15(groupId 5, 전부 진단용 텍스트)는 Report `DELETE` API가 없어 못 지웠습니다 —
  아래 "부탁" 섹션 참고.

---

## 확정됨(2026-09-11, Swagger 전수 대조) — 제거된 항목(서버 미구현 태그가 낡았던 4건)

아래는 예전에 "서버 미구현"으로 요청드렸던 항목인데, 이번 Swagger 전수 대조(77개 엔드포인트)로

- **회원 탈퇴(`DELETE /auth/me`)** — Swagger에 구현돼 있고, 바디(`{ownershipTransfers, reasons,
  reasonDetail}`)도 명세와 정확히 일치합니다. `WithdrawReasonScreen`을 이 API로 연결했습니다
  (계정 삭제 위험 때문에 실호출로 끝까지 테스트하지는 않았습니다). 다만 위 4순위처럼 `reasons`
  enum 전체 목록은 아직 모릅니다.
- **내 프로필(`GET/PATCH /auth/me`)** — 둘 다 구현돼 있고 화면에도 이미 연결돼 있습니다. 다만
  화면명세(글로벌설정_내프로필.png, ETC-3-PAGE-07-0)의 계정 정보 카드에 "전화번호"가 있는데
  응답 스키마(`userId`/`email`/`name`/`profileImageUrl`/`loginProvider`/`createdAt`)엔 전화번호
  필드가 없습니다 — 화면 쪽은 없는 데이터를 표시할 수 없어 그 행을 빼고 구현했습니다. 전화번호를
  실제로 노출할 계획이면 응답에 필드 추가가 필요합니다(이 부분만 남은 요청입니다).
- [해결] 통계·분석(`GET /groups/{groupId}/statistics`) (2026-09-11)
- [해결] 비밀번호 변경(`PATCH /auth/password`) (2026-09-11)

---

## 확정됨(9/6, 실호출) — Dues 2건

- [해결] `PATCH /dues/{duesId}/members`(일괄) — 정상 동작 확인. (2026-09-06)
- [해결] `GET /dues/{duesId}/members` 응답의 `amount` — 존재 확인. (2026-09-06)

---

## 확정됨(9/5, 실호출, 7-C 후속) — folder-items / 증빙자료 앨범 / Report

`VerifyDues`(groupId 2)에 테스트 폴더·장부·파일·보고서를 직접 만들어 세 엔드포인트 전부 실호출로 확인했습니다. **셋 다 대조표가 맞았습니다 — 명세 "미구현" 태그가 낡은 것이었습니다.** 상세 요청/응답 전문은 `docs/api-gaps.md` "확정됨" 절 6·7·8번 참고. `receipts`는 검증 직후 같은 날 화면(증빙자료 앨범 3종)까지 만들었고, `folder-items`/Report는 이번 라운드에서 코드를 안 건드렸습니다(다음 라운드에서 화면/교체 작업).

- [해결] `GET/POST /groups/{groupId}/folder-items`(+`/move`) — 둘 다 정상 동작, 명세와 필드 하나까지 일치. (2026-09-05)
- **`GET /groups/{groupId}/receipts` — 정상 동작, 진짜 페이지네이션. 화면 3개(증빙자료 앨범/검색/자료 상세) 전부 붙였습니다.** `content`/`page`/`size`/`totalElements`/`totalPages` 전부 정상 작동하고 `keyword`(내역 제목)·`from`/`to`(발생일 기간)·`type`(INCOME/EXPENSE) 필터도 됩니다. `sort` 이슈는 위 3순위 참고.
  - (참고, 급하지 않음) 응답에 축소본 URL이 따로 없어 그리드가 원본 이미지를 그대로 씁니다 — 장수가 많으면 느려질 수 있습니다. 여유 되실 때 업로드 시점 썸네일 생성을 검토해 주시면 좋겠습니다.
- **Report 생성 `reportType` 분기 — 정상 동작하고, 옛 스키마는 이미 막혔습니다.** `reportType` 없이 옛 4필드(`title`/`ledgerIds`/`startDate`/`endDate`)로 보내면 이제 `400`(`fieldErrors:[{"field":"reportType","reason":"보고서 유형은 필수입니다."}]`)이 옵니다 — 화면 개발 시 새 스키마(`BY_LEDGER`/`BY_PERIOD`)로 바로 시작하면 됩니다. ⚠️ **다만 `entryType:"ALL"`을 보내면 `400`(빈 `fieldErrors`)이 납니다** — `INCOME`/`EXPENSE`는 정상 동작하니, "구분: 전체"는 `entryType` 필드 자체를 생략하는 것으로 처리해야 합니다. 이것만 확인 부탁드립니다 — 의도된 제약인지, 아니면 `ALL`도 받아야 하는데 서버 enum에서 빠진 것인지요.

---

## 5순위 — 서버 구현 요청 (명세는 있으나 Swagger에 없음, 진짜 미구현)

### 5-1. 비밀번호 재설정 — 계정 복구가 안 됩니다

`POST /auth/password/reset` (임시 비밀번호 발송) — 명세 구체화됨, Swagger 77개 엔드포인트
어디에도 없음(실호출도 `401`, 존재하지 않는 라우트의 전형적 응답). **실제로 겪은 문제입니다** —
테스트 계정의 비밀번호를 잃어버렸는데 재설정 수단이 없어 계정을 버리고 새로 만들어야 했습니다.
실사용자에게 같은 일이 생기면 복구 방법이 없습니다.

(`PATCH /auth/password`, 로그인 상태에서의 비밀번호 변경은 이미 구현돼 있습니다 — 헷갈리지
않도록 구분해서 적습니다. 위 "제거된 항목" 참고.)

**⚠️ "완료라고 했는데 실제로는 안 되는" 건이라 압축 없이 유지한다**: 백엔드 노티(2026-09-06)는 "마이페이지 3종 구현 완료"였지만 `POST /auth/password/reset`(프론트 `authService.requestPasswordReset()`)은 2026-09-13 재확인에서도 `401 UNAUTHORIZED`였고 `API_swagger.txt`에도 경로가 없다. 서버가 완료라고 해도 이 항목은 해결로 분류하지 않는다.

**2026-09-13 재확인**: 백엔드 노티(2026-09-06)가 "마이페이지 3종 구현 완료"라고 해서
이 엔드포인트도 됐는지 다시 실호출했는데 여전히 `401 UNAUTHORIZED`("인증이 필요합니다")
입니다, `API_swagger.txt`에도 여전히 이 경로가 없습니다 — 상태 변동 없음, 여전히 미구현
확인.

**2026-09-13 추가 확인 — 프론트 원인 아님**: 혹시 저희 인터셉터가 토큰을 몰래 붙여서
401이 나는 건 아닌지 의심해 토큰을 아예 붙이지 않고(`Authorization` 헤더 자체 생략)
다시 호출했는데도 동일하게 `401 UNAUTHORIZED`("인증이 필요합니다")입니다.

```
POST /api/v1/auth/password/reset  (Authorization 헤더 없음)
{"email":"billage.verify.dues.test@example.com"}
→ 401 {"code":"UNAUTHORIZED","message":"인증이 필요합니다.","fieldErrors":[]}
```

토큰 없이도 401이 온다는 건 인증 검증 로직 자체가 실행된 게 아니라(그랬다면 최소
"토큰 없음"류 메시지가 나와야 함), **라우트가 아예 매칭되지 않아 전역 인증 필터로
떨어지는** 패턴으로 보입니다 — 이전에 잡았던 `email-verifications`(단수→복수) 경로
오류와 증상이 같습니다. 혹시 실제 경로가 문서와 다르다면 알려주세요.

### 5-1-1. 이메일 발송(SES 승인 대기) — 위 1순위와 동일 건, 프론트 조치 없음

노티(2026-09-06)가 언급한 "이메일 발송(SES 승인 대기)"은 위 1순위 `MAIL_SEND_FAILED`와 같은
건으로 판단합니다(개발 서버 메일 발송 설정 미비 = AWS SES 승인/자격 증명 대기로 추정). **서버
미구현이 아니라 인프라 설정 대기이고, 프론트가 할 일은 없습니다** — 현재처럼 회원가입 실패
에러 상태를 그대로 보여주는 게 맞는 동작입니다. 다른 건이라면 알려주세요.

### 5-2. 알림 · 고객지원 — 기획 결정이 선행돼야 합니다

알림 7개 API와 고객지원(공지·약관·FAQ·문의)이 명세는 신설됐으나 Swagger에 전혀 없습니다. 다만
**구현 전에 결정할 게 있습니다.**

- **알림** — 푸시 서버가 인프라 제외 범위인데 이 화면들은 푸시를 전제로 합니다. 런칭 범위 포함 여부를 먼저 정해야 합니다
- **고객지원** — 백오피스가 없어 공지·FAQ를 어떻게 관리할지(정적 파일 / 메일 링크 대체 등) 정해야 합니다

명세 문서에서도 이 판단을 요청하고 있습니다.

### 5-3. 개인 납부 내역 검색 — `GET .../members/{memberId}/payments`에 `keyword` 없음

`DUE-5-PAGE-02-0`(개인 납부 내역_검색, 시안 6장) 화면 작업을 위해 확인했는데, 이 API는 `from`/`to`(발생일 기간)만 지원하고 `keyword`(장부명·항목명 검색) 파라미터가 없습니다. 시안은 이 화면이 "장부 상세 조회 화면과 완전히 동일하게 동작"한다고 적어 검색어 입력이 전제입니다.

`keyword`를 추가해 주시면 화면을 그대로 만들 수 있습니다 — 지금은 서버에 반영 안 되는 죽은 UI가 되어 만들지 않았습니다(`docs/design-verification.md` `DUE-5-PAGE-02-0` 행 `[미구현]`).

---

## 6순위 — 서버 로그 확인 (재현 안 됨, 참고용)

### `POST /groups/{groupId}/dues` 가 하루 동안 계속 500을 냈던 건

**9/6 현재 재현되지 않습니다.** 급하지 않으나 원인은 확인해두는 게 좋겠습니다.

**9/5 상황** — `VerifyDues`(groupId 2)에서 회비 생성이 **딱 한 번 성공한 뒤로는 페이로드를 어떻게 바꿔도 `500 INTERNAL_ERROR`** 였습니다.

- 앱 UI와 curl 직접 호출 양쪽에서 재현
- 같은 세션에서 `GET` 계열은 전부 정상 (토큰 문제 아님)
- `startDate`를 과거/오늘/미래로 바꿔도, **성공했던 요청과 완전히 동일한 페이로드로 재시도해도** 500
- 제목·금액·`targetMemberIds`·`ledgerId`를 바꿔도 동일 (최소 5회, 수 분에 걸쳐 재시도)

```json
성공 (최초 1건)
POST /api/v1/groups/2/dues
{"title":"MT_2026","amount":30000,"startDate":"2026-09-06","dueDate":"2026-09-20","targetMemberIds":[1,2],"ledgerId":1}
→ 201 {"data":{"duesId":9,"status":"SCHEDULED",...}}

실패 (직후, 반복)
POST /api/v1/groups/2/dues
{"title":"TestD","amount":10000,"startDate":"2026-09-06","dueDate":"2026-09-20","targetMemberIds":[1],"ledgerId":1}
→ 500 {"code":"INTERNAL_ERROR","message":"서버 오류가 발생했습니다.","fieldErrors":[]}
```

**9/6 재검증** — 새 모임(`VerifyDue2`, groupId 3)에서 2회 연속 성공했고, **막혀 있던 groupId 2에서도 3회 연속 성공**했습니다. 그룹 고유 문제가 아니라 일시적 서버 상태였던 것으로 보입니다.

로그가 남아 있다면 9/5 해당 시간대를 확인해주시면 좋겠습니다. 재발하면 다시 알리겠습니다.

### 요청 — Swagger에 노출된 `userId` 쿼리 파라미터를 숨겨주세요

**2026-09-11, `API_swagger.txt` 전수 대조(77개 엔드포인트)에서 발견**: 거의 모든 엔드포인트에
`userId *`(필수, query)가 Swagger 문서상 달려 있습니다. 그런데 지금까지의 모든 실호출은
이 파라미터 없이 `Authorization` 헤더만으로 200을 받아왔습니다 — 인증 리졸버(아마
`@AuthenticationPrincipal` 계열)가 컨트롤러 메서드 시그니처에 있어서 springdoc이 그걸
쿼리 파라미터로 잘못 문서화한 것으로 보입니다. **실제 동작에 필요한 파라미터가 아니라 문서화
아티팩트입니다.**

요청: 해당 파라미터에 `@Parameter(hidden = true)`(springdoc) 또는 동등한 처리를 부탁드립니다.
지금 상태로는 Swagger를 처음 보는 사람(신규 합류자, 다음 프론트 개발자)이 "이 파라미터가
필수인데 왜 프론트가 안 보내지?"로 오해하기 쉽습니다. **저희 쪽에서 이 문서를 보고 `userId`를
실제로 추가하는 일은 없을 것입니다** — 지금 인증 방식이 이미 정상 동작 중이라 그렇게 하면
오히려 망가집니다.

---

## 7순위 — 문서 정정 (구현 불필요)

| 항목 | 내용 |
|---|---|
| **소셜 로그인·회원가입 경로 누락** | 대조표 확인 결과 서버에 실제로 있고 경로도 일치하는데 `Auth.txt`에 문서화가 안 돼 있습니다. 프론트는 이미 해당 경로를 호출 중입니다 |
| **Member `tags` 개수 모순** | 필드표는 "최대 10개", Validation 절은 "최대 3개"입니다. 프론트는 화면명세 문구(`최대 3개`)를 따라 3개로 막아뒀습니다. 서버 실제 검증값이 어느 쪽인지 알려주시면 맞추겠습니다 |
| **`PATCH /dues/{duesId}` 예시 바디에 `startDate` 누락** | 정책 메모는 "마감 전까지 금액을 제외한 필드는 수정할 수 있다"고 하는데 예시 Request Body엔 `startDate`가 없습니다. 프론트는 정책 메모를 따라 포함시켰습니다 |
| **`API 공통 규칙.txt` 미갱신** | 2026-09-03 갱신에서 이 파일만 이전 판본입니다. 페이지네이션 적용 범위(§20), 파일 업로드 분리 여부(§20), 생성·수정 권한 세부(§21)가 "추후 확정"인 채로 남아 있습니다 |
| **`GET .../members/{memberId}/payments` 응답 `payments`가 페이지 객체가 아니라 배열** | `Member.txt` §7 예시는 `payments`를 `{content, page, size, totalElements, totalPages}`로 적었지만, 실호출 결과 실제로는 `payments`가 **배열 그대로**입니다(`size=1`을 보내도 전체 배열이 옴 — `page`/`size` 쿼리 파라미터가 응답에 아무 영향 없음, `from`/`to` 기간 필터는 정상 동작). 프론트는 페이지네이션이 없다고 보고 무한 스크롤 없이 전체 목록을 한 번에 받아 구현했습니다(`memberService.ts`) — 서버가 나중에 진짜 페이지네이션을 붙이면 알려주세요, 화면을 무한 스크롤로 바꾸겠습니다 |
| **`ARCHIVE_NOT_FOUND` 에러 코드가 `Folder.txt`에 명세 누락** (2026-09-13) | 에러 코드 매핑 전수 점검 중 발견 — `Folder.txt`의 백업/보관함 섹션엔 `ARCHIVE_IN_PROGRESS`만 적혀 있고 `ARCHIVE_NOT_FOUND`는 어디에도 없습니다. `GET /api/v1/archives/999999`(존재하지 않는 ID)로 실호출하니 `404 {"code":"ARCHIVE_NOT_FOUND","message":"보관 기록을 찾을 수 없습니다."}`가 정상적으로 옵니다 — **서버엔 실제로 구현돼 있고 정상 동작하는 코드**이니 코드 자체는 안 고칩니다, 명세 문서에 이 코드만 추가해주시면 됩니다 |

---

## 부탁 — 개발 서버 테스트 데이터 정리

**9/6 정리 완료**: 지난번 막혔던 `DELETE` 호출이 이번엔 통과해 `duesId` 10~15, 18(전부 검증용)을 직접 지웠습니다.

**9/5 7-C 검증 정리 완료**: 모임원 상세/수정/삭제(단건·일괄)/납부내역 API를 `VerifyDues`(groupId 2)에서 실호출로 검증하며 만든 `memberId` 23~29와 검증용 `duesId` 19(납부 내역 응답 확인용)를 전부 직접 지웠습니다 — `duesId` 9에 묶인 기존 모임원(`memberId` 1, 2)은 건드리지 않았습니다.

**9/5 7-C 후속(folder-items/receipts/report) 검증 정리**: 테스트 폴더(`ZZTest7CRoot`/`ZZTest7CChild`)·장부(`ZZTest7CLedger`)·업로드 파일(증빙 이미지 1장)은 전부 지웠습니다(`entry 2`의 `receiptFileIds`도 원상복구). **`groupId` 2에 보고서 5건(`reportId` 1~5, 제목 `ZZTest7CReport2`/`ZZT3`~`ZZT7Period`)은 못 지웠습니다 — Report 도메인에 `DELETE` API 자체가 없습니다**(`405 METHOD_NOT_ALLOWED` 확인). 실제 회계 데이터가 아닌 검증용 잔해이니 확인 부탁드립니다. DB에서 직접 지워주시거나, delete API가 생기면 저희가 지우겠습니다.

**9/12 API 재검증(Swagger 정합성 재점검) 정리**: `groupId` 5(`VerifyDues`가 접근 가능한
현재 활성 모임)에 archive/statistics/ledgers 응답 구조 확인용으로 만든 테스트 폴더 3개
(`ZZArchiveFixTest`/`ZZStatsFixTest`/`ZZLedgersFixTest`)·장부·내역·보관 기록 1건은 전부
지웠습니다. **`reportId` 10(`ZZReportFix`)은 못 지웠습니다 — 위와 같은 이유(Report `DELETE`
API 없음)입니다.**

**9/13 보고서 생성 실패 진단(및 재검증) 정리**: 위 "프론트 자체 버그" 항목 진단 중 `groupId`
5에 `reportId` 13("Test")/14("진단테스트")/15("테스트")가 새로 생겼습니다(전부 인코딩
가설·한글 성공 여부 확인용). 같은 이유(Report `DELETE` API 없음)로 못 지웠습니다.

남아 있는 것:

- `groupId` 3 (`VerifyDue2`) 자체 — 폴더 `VerifyF2`/장부 `VerifyL2`/모임원 `VerifyM2`와 함께 500 재현 테스트용으로 만든 모임입니다. 테스트 데이터 정책상("전체 단계 끝난 뒤 한 번에 정리") 그룹 자체는 지우지 않고 남겨뒀습니다 — 이후 라운드가 새 그룹이 필요할 때 재사용해도 됩니다.
- **`duesId` 16, 17** (이 그룹 안) — **저희가 만들지 않았습니다.** 제목이 `asdasda`/`aaaaaaaaaaaaaaaaaaaa`, 장부가 저희가 안 만든 `adf`라 실기기/에뮬레이터로 앱을 직접 써보며 생긴 데이터로 보입니다(사용자 본인의 수동 테스트 추정). 검증용 클러터가 아닐 수 있어 **지우지 않았습니다** — 필요 없으면 직접 지워주세요.
- **`userId` 9**(이메일 `billage.verify.newcheck9999@example.com`) — 2026-09-13 회원가입
  엔드포인트 재검증 중 실제로 계정이 생성됐습니다. 계정 삭제(`DELETE /auth/me`)는
  로그인이 필요하고 "계정이 실제로 지워질 위험이 있으면 하지 말라"는 지침에 따라
  저희 쪽에서 시도하지 않았습니다 — DB에서 직접 지워주세요.

---

## 기획팀 확인 사항 (백엔드 아님, 참고용)

| 항목 | 내용 |
|---|---|
| 마감된 회비의 "회비 수정" 메뉴 | 화면명세엔 메뉴가 있는데 서버는 `DUES_ALREADY_CLOSED(409)`로 막습니다. 메뉴를 뺄지 서버를 열지 결정 필요 |
| 검색 버튼 삭제 미반영 | `DUE-1-PAGE-01-0`·`ETC-2-PAGE-04-0`의 검색 버튼이 2026-08-31 회의에서 삭제 확정됐으나 화면명세서 ver 0.25엔 남아 있습니다. 프론트는 애초에 안 만들었습니다 |
| `DUE-1-PAGE-01-0` UI 요소 번호 중복 | No.4가 두 번(검색 버튼 · 납부 현황 카드) 나옵니다 |
| 회비 수정 화면 앱바 아이콘 | 명세 표는 X(닫기)가 있다고 하는데 목업 이미지엔 뒤로가기 "<" 하나뿐입니다. 프론트는 목업을 따랐습니다 |
| 회비 수정_기간 선택 Screen ID | `DTB-3-SHEET-02-0`으로 적혀 있는데 IA상 그 ID는 "장부 복수 선택"입니다. 생성 화면(`DTB-3-SHEET-01-0`)과 같은 기능이라 오기로 보입니다 |
| 대시보드 미니 캘린더 | 실제 API가 "오늘 기준 지난 14일" 롤링 윈도우(`calendar.from`~`to`)를 주는데, 공용 `Calendar` 컴포넌트는 달력 월 그리드 방식이라 그대로 못 씁니다 — 컴포넌트 작업 선행 필요(`docs/design-verification.md` §5-4 참고, 백엔드 조치 아님) |

---

## 요약

**지금 답이 필요한 것 (5건)**

1. **개발 서버 메일 발송(`MAIL_SEND_FAILED`) 설정 확인** — 1순위. 이메일 신규가입 전체가 이것 하나에 막혀 있습니다.
2. **보고서 스냅샷을 보관함(`/archives/{archiveId}`)과 동일하게 맞춰주세요** — 2순위. 화면 3개(`ETC-5-PAGE-02-0`/`ETC-4-PAGE-05-0`/`07-0`)가 이것만 기다리고 있습니다.
3. **`GET .../receipts`에 `sort` 파라미터를 붙이면 500** — 3순위. Swagger에 정식 문서화된 파라미터가 실제로 서버를 터뜨립니다.
4. **`DELETE /auth/me` 요청 바디를 컨트롤러/DTO 기준으로 확인** — 4순위. `ownershipTransfers` 필드명(`groupId`/`newOwnerUserId`)과 `reasons` enum 전체 목록 둘 다입니다. 파괴적 호출이라 저희가 실호출로 검증 못 하는데, 최근 `GET /archives/{id}`에서 Swagger 스키마가 실제와 다른 걸 발견해서(래핑 구조 자체가 틀렸음) 이 바디도 같은 이유로 의심스럽습니다 — 필드명이 틀리면 권한 이전 누락으로 이어질 수 있어 특히 신중하게 봐주셨으면 합니다.
5. **비밀번호 변경 바디에 추가한 `refreshToken`이 맞는지 확인** — Swagger 스키마 근거로 프론트만 고쳤고 실호출 검증은 안 했습니다(공유 테스트 계정이라 destructive해서). 의도한 필드가 맞는지만 확인 부탁드립니다.

(9/11 대조로 회원 탈퇴·내 프로필·통계·이메일 인증 경로 4건이 "서버 미구현" 요청 목록에서
빠졌습니다 — 전부 이미 구현돼 있었고, 프론트 버그 3건은 이번 라운드에 직접 고쳤습니다. 이 세
건을 뺀 뒤에도 남아 있던 Report `entryType`/`groupId 2` 보고서 정리 요청은 위 "확정됨"·"부탁"
절에 그대로 있습니다.)

**런칭 전 구현이 필요한 것**

비밀번호 재설정(`POST /auth/password/reset`, 5-1) · 알림·고객지원(기획 결정 선행, 5-2)

**기획 결정이 선행돼야 하는 것**

알림 도메인 런칭 범위 · 고객지원 대체 방안
