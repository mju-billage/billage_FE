/** 내역(DTB) 메인/검색/필터/등록 화면 전용 문구. */
export const TRANSACTIONS_TITLE = '내역';
export const TRANSACTIONS_TAB_ALL = '전체 내역';
export const TRANSACTIONS_TAB_PENDING = '승인요청';
export const TRANSACTIONS_COUNT_SUFFIX = ' 건';
export const TRANSACTIONS_EMPTY = '등록된 내역이 없어요.';
/** 4-B(모임 전체 내역 목록 API 연동) — 디자인 시안에 로딩/에러 상태가 없어 최소 형태로 통일. */
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
/** 입력창의 placeholder 자체가 글자수 제한 안내문이다(별도 헬퍼 캡션 없음). */
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

/** 재스캔 시(이미 한 번 스캔에 성공한 적 있을 때) 기존 스캔 데이터를 덮어쓸지 묻는 모달. */
export const SCAN_RESCAN_CONFIRM_TITLE = '기존 내역을 덮어쓸까요?';
export const SCAN_RESCAN_CONFIRM_DESCRIPTION =
  '인식된 정보로 기존 세부 내역이 변경돼요.';
export const SCAN_RESCAN_CANCEL_LABEL = '취소';
export const SCAN_RESCAN_CONFIRM_LABEL = '덮어쓰기';

/** 스캔 결과가 현재 입력된 금액/날짜와 다를 때 반영 여부를 묻는 모달. */
export const SCAN_APPLY_CONFIRM_TITLE = '스캔된 내용으로 반영할까요?';
export const SCAN_APPLY_CONFIRM_DESCRIPTION =
  '작성한 내용과 스캔 결과가 서로 달라요.';
export const SCAN_APPLY_CANCEL_LABEL = '아니요';
export const SCAN_APPLY_CONFIRM_LABEL = '예';

export const SCAN_FAILED_TITLE = '영수증 인식에 실패했어요.';
export const SCAN_FAILED_SUBTITLE = '영수증 전체가 잘 나오도록 촬영해주세요.';
export const SCAN_FAILED_RETRY_LABEL = '다시 촬영하기';

export const SNACKBAR_RECEIPT_ADDED = '영수증을 등록했어요.';
export const SNACKBAR_RECEIPT_MAX_LIMIT =
  '사진은 최대 10장까지 첨부할 수 있어요.';
export const SNACKBAR_TRANSACTION_ADDED = '내역이 추가되었어요.';
/** 0-2: 등록자가 일반 관리자(MEMBER)면 서버가 PENDING으로 만든다 — 그 사실을 그대로 알려준다. */
export const SNACKBAR_TRANSACTION_ADDED_PENDING =
  '내역이 추가되었어요. 총무 승인 후 반영돼요.';
export const SNACKBAR_TRANSACTION_UPDATED = '내역이 수정되었어요.';
/** 실 Entry 등록/수정 화면 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const TRANSACTION_REGISTER_LOADING = '불러오는 중이에요.';
export const TRANSACTION_REGISTER_RETRY_LABEL = '다시 시도';
/** PATCH /entries는 ledgerId를 안 받는다 — 등록 후엔 장부를 바꿀 수 없다(Entry.txt). */
export const TRANSACTION_REGISTER_LEDGER_LOCKED_HINT =
  '등록된 내역의 장부는 변경할 수 없어요.';

export const TRANSACTION_REGISTER_LEAVE_TITLE = '내역 작성을 그만둘까요?';
export const TRANSACTION_REGISTER_LEAVE_DESCRIPTION =
  '작성 중인 내용은 저장되지 않아요.';
export const TRANSACTION_REGISTER_LEAVE_CANCEL_LABEL = '취소';
export const TRANSACTION_REGISTER_LEAVE_CONFIRM_LABEL = '그만두기';
