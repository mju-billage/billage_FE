/** 보관함(ArchiveListScreen 및 관련 다이얼로그) 전용 문구. */
export const ARCHIVE_SCREEN_TITLE = '보관함';
export const ARCHIVE_LOADING = '보관 기록을 불러오는 중이에요.';
export const ARCHIVE_RETRY_LABEL = '다시 시도';
export const ARCHIVE_EMPTY_TITLE = '보관된 내역이 없어요.';
export const ARCHIVE_CARD_LEDGER_COUNT_SUFFIX = '개 장부';
export const ARCHIVE_CARD_VIEW_LABEL = '기록보기';

export const ARCHIVE_RENAME_DIALOG_TITLE = '보관 제목 변경하기';
export const ARCHIVE_RENAME_PLACEHOLDER = '변경할 제목을 입력해주세요';
export const ARCHIVE_RENAME_CONFIRM_LABEL = '변경';
export const ARCHIVE_TITLE_MAX_LENGTH = 20;

export const ARCHIVE_DELETE_DIALOG_TITLE = '지난 기록을 모두 삭제할까요?';
export const ARCHIVE_DELETE_DIALOG_DESCRIPTION =
  '삭제한 기록은 다시 복구할 수 없어요.';
export const ARCHIVE_DELETE_CONFIRM_LABEL = '삭제';

export const SNACKBAR_ARCHIVE_DELETED = '보관 기록이 삭제되었어요.';
export const SNACKBAR_ARCHIVE_RENAMED = '변경 사항이 저장되었어요.';

export const ARCHIVE_DETAIL_LOADING = '보관 기록을 불러오는 중이에요.';
/** 시안(더보기_기록보관_상세보기.png) UI 요소 2번 문구 그대로 — "보관 일시"가 아니라 "백업 일시". */
export const ARCHIVE_DETAIL_CREATED_AT_LABEL = '백업 일시';
export const ARCHIVE_DETAIL_EMPTY = '보관된 장부가 없어요.';
export const ARCHIVE_DETAIL_INCOME_LABEL = '수입';
export const ARCHIVE_DETAIL_EXPENSE_LABEL = '지출';

/** 장부 요약 카드(더보기_기록보관_상세보기.png UI 요소 3번) 터치 시 진입하는
 * "장부 상세 뷰어"(`ArchiveLedgerEntriesScreen`/`ArchiveEntryDetailScreen`) 전용
 * 문구 — 시안 [액션]에 이동이 명시돼 있다. */
export const ARCHIVE_ENTRY_DETAIL_TITLE = '상세 내역';
export const ARCHIVE_ENTRY_DETAIL_TITLE_LABEL = '내역명';
export const ARCHIVE_ENTRY_DETAIL_TYPE_LABEL = '구분';
export const ARCHIVE_ENTRY_DETAIL_DATE_LABEL = '발생일';
export const ARCHIVE_ENTRY_DETAIL_AMOUNT_LABEL = '금액';
export const ARCHIVE_ENTRY_DETAIL_LEDGER_LABEL = '장부';
/** 시안 크롭(`ETC-5-PAGE-02-0.png`) 그대로 "담당자" — 실제로는 API의 `createdByName`
 * (등록자)을 여기 매핑한다, 별도 담당자 필드가 보관 스냅샷엔 없다(스크린 파일 주석 참고). */
export const ARCHIVE_ENTRY_DETAIL_CREATOR_LABEL = '담당자';
export const ARCHIVE_ENTRY_DETAIL_MEMO_LABEL = '메모';
export const ARCHIVE_ENTRY_DETAIL_MEMO_PLACEHOLDER = '메모가 없어요.';
export const ARCHIVE_ENTRY_DETAIL_RECEIPT_LABEL = '증빙 자료';
