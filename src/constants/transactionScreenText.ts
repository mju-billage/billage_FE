export const TRANSACTIONS_TITLE = '내역';
export const TRANSACTIONS_TAB_ALL = '전체 내역';
export const TRANSACTIONS_TAB_PENDING = '승인요청';
export const TRANSACTIONS_COUNT_SUFFIX = ' 건';
export const TRANSACTIONS_EMPTY = '등록된 내역이 없어요.';
export const TRANSACTIONS_LOADING = '불러오는 중이에요.';
export const TRANSACTIONS_RETRY_LABEL = '다시 시도';

export const TRANSACTION_SEARCH_PLACEHOLDER = '내역명, 장부명을 입력해주세요.';

export const FILTER_LEDGER_LABEL = '장부';
export const FILTER_LEDGER_ADD_LABEL = '선택하기';
export const FILTER_PERIOD_CUSTOM_ICON_LABEL = '기간 선택';

export const LEDGER_SELECT_SHEET_TITLE = '장부 선택';
export const LEDGER_SELECT_EMPTY_GUIDE = '새로운 장부를 생성해주세요.';
export const LEDGER_SELECT_CREATE_NEW_LABEL = '새 장부 생성하기';
export const LEDGER_SELECT_PREVIOUS_LABEL = '이전';
export const LEDGER_SELECT_CONFIRM_LABEL = '선택하기';
export const LEDGER_SELECT_CANCEL_LABEL = '취소';

export const MANAGER_SELECT_SHEET_TITLE = '담당자 선택';

export const ITEM_NAME_SHEET_TITLE = '내역명 작성';
export const ITEM_NAME_SHEET_PLACEHOLDER = '20자까지 입력 가능해요.';
export const ITEM_NAME_MAX_LENGTH = 20;
export const TEXT_INPUT_SHEET_SAVE_LABEL = '입력하기';
export const TEXT_INPUT_SHEET_CANCEL_LABEL = '취소';

export const MEMO_SHEET_TITLE = '메모 등록';
export const MEMO_SHEET_PLACEHOLDER = '30자까지 입력 가능해요.';
export const MEMO_MAX_LENGTH = 30;

export const TRANSACTION_REGISTER_TITLE = '내역 추가';
export const TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER = '금액을 입력해주세요.';
export const TRANSACTION_REGISTER_ITEM_NAME_PLACEHOLDER = '내역명을 입력해주세요.';
export const TRANSACTION_REGISTER_MANAGER_PLACEHOLDER = '담당자를 선택해주세요.';
export const TRANSACTION_REGISTER_LEDGER_PLACEHOLDER = '장부를 선택해주세요.';
export const TRANSACTION_REGISTER_RECEIPT_LABEL = '증빙 자료';
export const TRANSACTION_REGISTER_RECEIPT_MAX = 10;
export const TRANSACTION_REGISTER_SUBMIT_LABEL = '추가하기';

export const AMOUNT_SHEET_TITLE = '금액 입력';

export const DATE_SHEET_TITLE_INCOME = '수입일 선택';
export const DATE_SHEET_TITLE_EXPENSE = '지출일 선택';
export const DATE_SHEET_CANCEL_LABEL = '취소';
export const DATE_SHEET_CONFIRM_LABEL = '선택하기';

export const ATTACH_MENU_SCAN_LABEL = '영수증 스캔하기';
export const ATTACH_MENU_PHOTO_LABEL = '사진 촬영하기';
export const ATTACH_MENU_GALLERY_LABEL = '사진 선택하기';

export const GALLERY_PICKER_TITLE = '최근 항목';
export const GALLERY_PICKER_CONFIRM_LABEL = '완료';

export const SCAN_RESCAN_CONFIRM_TITLE = '기존 내역을 덮어쓸까요?';
export const SCAN_RESCAN_CONFIRM_DESCRIPTION =
  '인식된 정보로 기존 세부 내역이 변경돼요.';
export const SCAN_RESCAN_CANCEL_LABEL = '취소';
export const SCAN_RESCAN_CONFIRM_LABEL = '덮어쓰기';

export const SCAN_APPLY_CONFIRM_TITLE = '스캔된 내용으로 반영할까요?';
export const SCAN_APPLY_CONFIRM_DESCRIPTION =
  '작성한 내용과 스캔 결과가 서로 달라요.';
export const SCAN_APPLY_CANCEL_LABEL = '아니요';
export const SCAN_APPLY_CONFIRM_LABEL = '예';

export const SCAN_FAILED_TITLE = '영수증 인식에 실패했어요.';
export const SCAN_FAILED_SUBTITLE = '영수증 전체가 잘 나오도록 촬영해주세요.';
export const SCAN_FAILED_RETRY_LABEL = '다시 촬영하기';

export const SNACKBAR_RECEIPT_ADDED = '영수증을 등록했어요.';
/** 인식은 못 했지만 촬영본은 증빙으로 붙었다 — 사용자가 헛수고했다고 느끼지 않게 그 사실을 알린다. */
export const SNACKBAR_SCAN_NOT_RECOGNIZED =
  '영수증을 인식하지 못했어요. 사진은 증빙으로 첨부했어요.';
/** 인식 요청 한도 초과. 재촬영을 권하면 안 된다 — 서버가 외부 OCR 을 건당 과금으로 부른다. */
export const SNACKBAR_SCAN_ERROR_ATTACHED =
  '영수증 인식 중 문제가 생겼어요. 사진은 증빙으로 첨부했어요.';
export const SNACKBAR_SCAN_NETWORK_ERROR_ATTACHED =
  '네트워크 연결을 확인해주세요. 사진은 증빙으로 첨부했어요.';
export const SNACKBAR_SCAN_RATE_LIMITED =
  '영수증 인식을 너무 많이 요청했어요. 잠시 후 다시 시도해주세요.';
export const SNACKBAR_RECEIPT_MAX_LIMIT =
  '사진은 최대 10장까지 첨부할 수 있어요.';
export const SNACKBAR_TRANSACTION_ADDED = '내역이 추가되었어요.';
export const SNACKBAR_TRANSACTION_ADDED_PENDING =
  '내역이 추가되었어요. 총무 승인 후 반영돼요.';
export const SNACKBAR_TRANSACTION_UPDATED = '내역이 수정되었어요.';
export const TRANSACTION_REGISTER_LOADING = '불러오는 중이에요.';
export const TRANSACTION_REGISTER_RETRY_LABEL = '다시 시도';
export const TRANSACTION_REGISTER_LEDGER_LOCKED_HINT =
  '등록된 내역의 장부는 변경할 수 없어요.';

export const TRANSACTION_REGISTER_LEAVE_TITLE = '내역 작성을 그만둘까요?';
export const TRANSACTION_REGISTER_LEAVE_DESCRIPTION =
  '작성 중인 내용은 저장되지 않아요.';
export const TRANSACTION_REGISTER_LEAVE_CANCEL_LABEL = '취소';
export const TRANSACTION_REGISTER_LEAVE_CONFIRM_LABEL = '그만두기';
