# 백엔드 확인 대기

서버 응답이 바뀌거나 백엔드가 답해야 풀리는 것들. 디자인·기능 QA가 한 바퀴 돈 뒤에 모아서 전달하기로 했다. (2026-10-13 결정)

---

## 1. 카카오 소셜 로그인 SOCIAL_TOKEN_INVALID

**현상/생긴 경위**

개발 서버(https://220-66-233-75.nip.io)에서 카카오 소셜 로그인 시
`POST /api/v1/auth/social/login` 요청이 `SOCIAL_TOKEN_INVALID` 로 거절된다.
앱 쪽 카카오 SDK 로그인(키 해시 검증 포함)은 성공한다. 2026-10-16 확인.

앱이 보내는 값: `{ provider: "KAKAO", token: <카카오 SDK access token> }`
Swagger 의 요청 형식과 같다(`src/services/authService.ts` socialLogin).

**답 (백엔드, 2026-11-08/09)**

- 서버는 access token 을 받는 게 맞다(id_token 아님). 지금 보내는 형식이 맞다.
- 11-03 배포로 (1) 토큰이 서버의 카카오 앱에서 발급됐는지 확인하고, (2) 실패
  사유를 서버 로그에 남기도록 고쳤다.
- 배포 뒤로 카카오 로그인 시도 기록이 아예 없다 — 한 번 다시 시도하고 시각을
  알려달라고 했다.

**할 일**

- 실기기에서 카카오 로그인 한 번 더 시도하고 시각을 백엔드에 전달해 로그 확인
  요청한다.
- 같이 확인해 달라고 한 것: (1) 카카오 로그인 동의 항목에서 이메일이 필수인지
  (2) 앱의 네이티브 앱 키와 서버에 등록된 카카오 앱이 같은지 — 카카오
  디벨로퍼스 콘솔에서 확인.
- 재현되면 이 항목에 다시 적고, 안 되면 지운다.

---

## 2. 모임원 납부 내역 조회 API — 장부/정렬 쿼리 파라미터 없음

**현상/생긴 경위**

`GET /api/v1/groups/{groupId}/members/{memberId}/payments` (`memberService.getMemberPayments`)
가 지금 `from`/`to`(기간)만 받는다. 디자인 QA 실측(더보기#200)으로
`MemberPaymentHistoryScreen`에 필터바를 추가하면서 장부 선택 + 정렬순서(최신/과거)
필터도 같이 넣었는데, 서버 파라미터가 없어서 **기간만 서버로 넘기고 장부
필터링·정렬은 클라이언트(`MemberPaymentHistoryScreen.tsx`)에서 임시로 처리**했다.
지금은 이 엔드포인트가 페이지네이션 없이 전체 목록을 한 번에 주기 때문에 클라이언트
처리가 당장 깨지진 않지만, 모임원 1명의 납부 건수가 많아지면(장기 운영) 매번 전체
목록을 받아 클라이언트에서 거르는 구조라 비효율적이고, 서버가 나중에 페이지네이션을
넣으면 클라이언트 필터링 자체가 깨진다.

**물어볼 것**

이 엔드포인트에 `ledgerId`(단일 장부 필터), `sort`(예: `paidAt,desc` /
`paidAt,asc`) 쿼리 파라미터를 추가해줄 수 있는지.

**답이 오면 할 일**

파라미터 추가되면 `memberService.ts`의 `MemberPaymentParams`에 `ledgerId`/`sort`
추가하고, `MemberPaymentHistoryScreen.tsx`의 클라이언트 측 필터링·정렬 로직을
제거하고 서버 호출로 옮긴다.
