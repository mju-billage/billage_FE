/** 장부 생성/상세/검색/필터/상세내역 화면 전용 문구. */
export const LEDGER_CREATE_TITLE = '장부 생성하기';
export const LEDGER_CREATE_SUBTITLE = '새 장부로 내역 관리를 시작해보세요.';
export const LEDGER_NAME_LABEL = '장부 이름';
export const LEDGER_NAME_PLACEHOLDER = '장부 이름을 입력해주세요.';
export const LEDGER_NAME_HELPER = '* 최대 20자 이내로 입력할 수 있어요.';
/** Ledger.txt "name: 필수, 공백 문자열 불가, 최대 20자" — 서버 확정값. */
export const LEDGER_NAME_MAX_LENGTH = 20;
export const LEDGER_BUDGET_LABEL = '예산 설정';
export const LEDGER_BUDGET_PLACEHOLDER = '예산 금액을 입력해주세요.';
/** Ledger.txt "budget: 0 이상 999,999,999 이하의 원 단위 정수" — 서버 확정값. */
export const LEDGER_BUDGET_MAX = 999_999_999;
export const LEDGER_CREATE_SUBMIT_LABEL = '생성하기';

export const LEDGER_LEAVE_CONFIRM_TITLE = '장부 생성을 그만두시겠습니까?';
export const LEDGER_LEAVE_CONFIRM_DESCRIPTION =
  '작성한 내용은 저장되지 않습니다.';
export const LEDGER_LEAVE_CONFIRM_LABEL = '그만두기';
export const LEDGER_LEAVE_CANCEL_LABEL = '취소';

export const LEDGER_MENU_BUDGET = '예산 설정';
export const LEDGER_MENU_RENAME = '장부 이름 변경';
export const LEDGER_MENU_DELETE = '장부 삭제';

export const LEDGER_RENAME_DIALOG_TITLE = '장부 이름 변경하기';
/** 20자 — 시안 목업 원문은
 * "최대 10자 이내로 입력해주세요."지만, 앱 내 이름/제목 필드 4/4가 20자(그중
 * 3개 서버 도메인 문서 근거)이고 같은 명세서 설명표 No.2/No.3도 20을 두 번
 * 명시해 설명표+서버 근거를 따랐다. 목업의 "10"은 기획 확인 필요. */
export const LEDGER_RENAME_DIALOG_DESCRIPTION = '최대 20자까지 입력할 수 있어요.';
export const LEDGER_RENAME_PLACEHOLDER = '변경할 이름을 입력해주세요.';
export const LEDGER_RENAME_CONFIRM_LABEL = '변경';

export const LEDGER_BUDGET_DIALOG_TITLE = '예산 설정하기';
export const LEDGER_BUDGET_SAVE_LABEL = '저장';

export const LEDGER_DELETE_DIALOG_TITLE = '장부를 삭제하시겠습니까?';
export const LEDGER_DELETE_DIALOG_DESCRIPTION =
  '삭제 이후에는 데이터 복구가 어렵습니다.';
export const LEDGER_DELETE_CONFIRM_LABEL = '삭제';

export const SNACKBAR_LEDGER_RENAMED_PREFIX = "'";
export const SNACKBAR_LEDGER_RENAMED_SUFFIX = "'으로 장부 이름이 변경되었어요.";
export const SNACKBAR_LEDGER_DELETED_SUFFIX = ' 장부가 삭제되었어요.';

/** 장부 상세 목록 개수 단위 — `24 건`(숫자와 단위 사이 공백 한 칸, 0건이면 `0 건`). 설명표
 * FDR-2-PAGE-05-0 No.5. **폴더 목록은 `개`(`FOLDER_COUNT_SUFFIX`), 장부 내역 목록은 `건`이 의도된
 * 구분이다 — "통일"하지 말 것.** */
export const LEDGER_COUNT_SUFFIX = ' 건';
export const LEDGER_LIST_EMPTY_TITLE = '아직 내역이 존재하지 않아요.';
export const LEDGER_LIST_EMPTY_SUBTITLE =
  '내역을 추가하여 모임 장부를 정리해보세요.';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const LEDGER_DETAIL_LOADING = '장부 정보를 불러오는 중이에요.';
export const LEDGER_DETAIL_RETRY_LABEL = '다시 시도';
/** 무한 스크롤로 다음 페이지를 불러오는 중일 때 목록 하단에 보여주는 문구. */
export const LEDGER_ENTRIES_LOADING_MORE = '불러오는 중...';

/** keyword 파라미터는 제목·메모만 검색한다(Entry.txt) — "장부명"은 뺐다(이미 그
 * 장부 안에서 검색 중이라 의미가 없다). */
/** 시안 목업 문구를 따른다(설명표는 '검색어를 입력해주세요.'). 장부 안 검색인데 '장부명'이 들어가는 이유는 기획 확인 필요. */
export const LEDGER_SEARCH_PLACEHOLDER = '내역명, 장부명을 입력해주세요.';
/** 내역 검색(`TransactionSearchScreen`)의 결과 없음 문구. 장부 안 검색(`FDR-3-PAGE-02-0`)은 마침표 없는
 * `LEDGER_ENTRY_SEARCH_EMPTY`를 따로 쓴다 — 이 상수는 다른 화면이 같이 써서 바꾸지 않았다. */
export const LEDGER_SEARCH_EMPTY = '해당되는 내역이 없어요.';
/** 장부 안 검색 결과 없음. 시안(원본 스펙시트 Case B, 크롭 `FDR-3-PAGE-02-0-3.png`)과 설명표 3-1 모두
 * 마침표 없음. */
export const LEDGER_ENTRY_SEARCH_EMPTY = '해당되는 내역이 없어요';

export const FILTER_SHEET_TITLE = '필터 선택';
export const FILTER_PERIOD_LABEL = '기간';
export const FILTER_PERIOD_1MONTH = '1개월';
export const FILTER_PERIOD_3MONTH = '3개월';
export const FILTER_PERIOD_6MONTH = '6개월';
export const FILTER_PERIOD_CUSTOM = '직접입력';
export const FILTER_TYPE_LABEL = '구분';
export const FILTER_TYPE_ALL = '전체';
/** 승인 상태 필터(Entry API의 status 파라미터) — 장부 상세 검색 전용, DTB 전체
 * 목록 필터(TransactionFilterSheet)엔 없다(모임 전체 목록 API 자체가 없어서). */
export const FILTER_STATUS_LABEL = '승인 상태';
export const FILTER_STATUS_ALL = '전체';
export const FILTER_STATUS_PENDING = '승인 대기';
export const FILTER_STATUS_APPROVED = '승인 완료';
export const FILTER_TYPE_INCOME = '수입';
export const FILTER_TYPE_EXPENSE = '지출';
export const FILTER_SORT_LABEL = '정렬 순서';
export const FILTER_SORT_LATEST = '최신순';
export const FILTER_SORT_OLDEST = '과거순';
export const FILTER_RESET_LABEL = '초기화';
export const FILTER_APPLY_LABEL = '적용하기';

export const TRANSACTION_DETAIL_TITLE = '상세 내역';
export const TRANSACTION_DATE_LABEL_INCOME = '수입일';
export const TRANSACTION_DATE_LABEL_EXPENSE = '지출일';
export const TRANSACTION_ITEM_NAME_LABEL = '내역명';
export const TRANSACTION_MANAGER_LABEL = '담당자';
export const TRANSACTION_LEDGER_LABEL = '장부';
export const TRANSACTION_MEMO_LABEL = '메모';
export const TRANSACTION_MEMO_PLACEHOLDER = '메모를 남길 수 있어요.';
export const TRANSACTION_MEMO_EMPTY_PLACEHOLDER = '-';
export const TRANSACTION_RECEIPT_LABEL = '증빙 자료';
export const TRANSACTION_RECEIPT_DETAIL_LABEL = '증빙 자료 세부 내역';
export const TRANSACTION_RECEIPT_ITEM_NAME_LABEL = '상품명';
export const TRANSACTION_RECEIPT_QUANTITY_LABEL = '수량';
export const TRANSACTION_RECEIPT_AMOUNT_LABEL = '금액';
export const TRANSACTION_RECEIPT_TOTAL_LABEL = '합계';
/** 상세 내역_납부관리_수입내역(마감된 회비에서 생성된 수입 내역, `entry.duesExists`) 전용. */
export const TRANSACTION_PAYER_COUNT_SUFFIX = '명';
export const TRANSACTION_DUES_DETAIL_CTA_LABEL = '회비 상세보기';
export const TRANSACTION_DELETE_CONFIRM_TITLE = '내역을 삭제하시겠습니까?';
export const TRANSACTION_DELETE_CONFIRM_DESCRIPTION =
  '삭제 이후에는 데이터 복구가 어렵습니다.';
export const TRANSACTION_DELETE_CONFIRM_LABEL = '삭제';

/** 로딩/에러 문구(실 Entry 상세 조회) — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const TRANSACTION_DETAIL_LOADING = '내역을 불러오는 중이에요.';
export const TRANSACTION_DETAIL_RETRY_LABEL = '다시 시도';
export const TRANSACTION_APPROVE_LABEL = '승인하기';
export const TRANSACTION_APPROVAL_PENDING_BADGE = '승인 대기';
export const SNACKBAR_ENTRY_APPROVED = '내역을 승인했어요.';
