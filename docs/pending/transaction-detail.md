# 내역 상세 화면 QA — `DTB-2-PAGE-02-0`

파일: `src/screens/Folder/TransactionDetailScreen.tsx`
라우트: `TransactionDetail`
관련 공용 컴포넌트: `AppBar`, `Snackbar`, `Thumbnail`, `AttachmentAddButton`,
`useReceiptAttachments`, `ReceiptScanningView`, `useAuthenticatedImage`,
`apiClient.fetchAuthenticatedDataUri`

---

## 해결

| 항목 | 내용 | 범위 | 커밋 |
|---|---|---|---|
| 금액·값 텍스트·날짜·앱바 아이콘 | 수입 파랑 제거(검정 통일), 값 텍스트 body2, 날짜 0패딩, 앱바 아이콘 tintColor 추가 | 화면+전역(AppBar) | `da7836b` |
| 승인 대기 badge 제거 | `TRANSACTION_APPROVAL_PENDING_BADGE` 상수·렌더 삭제 | 화면 | `da7836b` |
| 승인하기 버튼 위치 | ScrollView 안 → 화면 하단 고정 footer | 화면 | `da7836b` |
| 수정·삭제 진입점 없음 | `SHOW_TRAILING_ACTIONS` 제거, OWNER + `!hideActions` 조건으로 앱바 아이콘 복원 | 화면 | `da7836b` |
| 행별 즉시 수정 | 날짜/내역명/담당자/메모 탭 → 시트 → 즉시 PATCH, Field에 chevron 추가 | 화면 | `94d6438` |
| 증빙 추가/삭제 | AttachmentAddButton + X, 업로드 완료·삭제 시 PATCH | 화면 | `94d6438` |
| 사진 첨부 흐름 공통화 | `useReceiptAttachments` 훅으로 분리(등록 화면과 공유) | 전역 | `94d6438` |
| 스낵바 X 버튼 없음 | Snackbar 컴포넌트에 X 상시 노출 추가(`cleanup.md` 8번 이관) | 전역 | `f3b57a1` |
| 승인 완료 후 흐름 | 현재 화면 스낵바 대신 내역 탭으로 이동 + "내역이 승인되었어요." | 화면 | `f3b57a1` |
| 상세 내역 수정·삭제 진입점 디자이너 확인 (`design.md` 7번 이관) | QA-038 로 해결됨(위 "수정·삭제 진입점 없음" 행과 동일 커밋) | 화면 | `da7836b` |
| 스캔 첨부 사진 상세 안 열림 | `ScanOutcome`에 `sourceUrl` 추가, `uploadFile` 응답의 url을 인식 성공/실패 양쪽에 실어 보냄 | 전역(ReceiptScanningView, useReceiptAttachments) | `a6c1017` |
| 증빙 썸네일 미표시(`cleanup.md` 10번 이관) | `<Image source={{uri,headers}}>` 가 안드로이드에서 401 → JS fetch 로 data URI 받아 그리는 `fetchAuthenticatedDataUri`/`useAuthenticatedImage` 로 우회 | 전역(apiClient, Thumbnail, ZoomableImage 사용 화면 전부) | 이 커밋(QA-042) |

---

## 처리 중 알게 된 것

- Entry API 는 수정·삭제·승인 모두 OWNER 만 허용한다 — 일반 권한 관리자(MEMBER)는
  배제됐다. 기획 의도가 다르면 백엔드와 함께 권한을 넓혀야 한다
  (`docs/pending/design.md` 9번, 미해결).
- 캘린더 경로(`hideActions`)는 앱바 아이콘만 숨기고 행별 수정·증빙 추가/삭제·
  승인하기 버튼은 그대로 열려 있다(`docs/pending/design.md` 11번, 미해결).
- MEMBER 가 승인 대기 내역을 눌렀을 때의 기대 동작은 아직 안 정해졌다
  (`docs/pending/design.md` 10번, 미해결).
- 스낵바 자동 숨김과 X 버튼을 동시에 둘지는 미결정이라 QA-040 은 둘 다 켜 둔
  채로 두었다(`docs/pending/design.md` 12번, 미해결 — 이 화면 전용 항목은 아니다).
