/** 납부관리(DUE) 메인/상세 화면 전용 문구. */
export const DUES_MAIN_TITLE = '납부관리';
export const DUES_ADD_ACCESSIBILITY_LABEL = '회비 생성';
export const DUES_MEMBER_MANAGE_ACCESSIBILITY_LABEL = '모임원 관리';

export const DUES_TAB_ALL = '전체';
export const DUES_TAB_IN_PROGRESS = '진행중';

export const DUES_COUNT_SUFFIX = '건';
export const DUES_EMPTY_MESSAGE = '새로운 회비를 생성해보세요.';

/** 로딩/에러 문구 — 디자인 시안이 '디자인 중' 상태라 최소 형태로 통일. */
export const DUES_LOADING = '회비 목록을 불러오는 중이에요.';
export const DUES_RETRY_LABEL = '다시 시도';

/** 목록 응답엔 생성일이 없어(docs/api-gaps.md) "예정" 카드에 시작일 배지를 못
 * 만든다 — 날짜 대신 상태 라벨로 대체. */
export const DUES_BADGE_UPCOMING = '예정';
export const DUES_BADGE_CLOSED = '마감';

export const DUES_DETAIL_LOADING = '회비 정보를 불러오는 중이에요.';
export const DUES_DETAIL_RETRY_LABEL = '다시 시도';
/** DuesStatusCard 재사용 시 카드 자체의 고정 타이틀(회비 제목이 아니라 카드 라벨) — 회비
 * 제목은 이미 AppBar에 있다. */
export const DUES_DETAIL_CARD_TITLE = '회비가 모이기까지';

export const DUES_MEMBER_TAB_UNPAID = '미납부';
export const DUES_MEMBER_TAB_PAID = '납부 완료';
export const DUES_MEMBER_COUNT_SUFFIX = '명';
export const DUES_MEMBER_LIST_EMPTY = '대상자가 없어요.';

/** 회비 생성(6-B, DUE-2-PAGE-01-0 + DUE-3-PAGE-01-0) 전용 문구. */
export const DUES_CREATE_TITLE = '회비 생성';
export const DUES_CREATE_TITLE_FIELD_LABEL = '제목';
export const DUES_CREATE_TITLE_PLACEHOLDER = '제목을 입력해주세요.';
/** Dues.txt "title: 최대 20자". */
export const DUES_TITLE_MAX_LENGTH = 20;

export const DUES_CREATE_AMOUNT_LABEL = '금액';
export const DUES_CREATE_AMOUNT_PLACEHOLDER = '금액을 입력해주세요.';
/** Dues.txt "amount: 0보다 크고 999,999,999 이하". */
export const DUES_AMOUNT_MAX = 999_999_999;

export const DUES_CREATE_LEDGER_LABEL = '장부';
export const DUES_CREATE_LEDGER_PLACEHOLDER = '장부를 선택해주세요.';

/**
 * 화면명세서(DUE-2-PAGE-01-0)는 "기간"(시작~마감 캘린더 범위)을 필수 항목으로
 * 요구하지만, `POST /groups/{groupId}/dues`엔 `dueDate`(마감일) 하나뿐이다 —
 * 시작일을 받을 자리가 서버에 없다. ADD 화면의 "담당자" 필드(받아놓고 저장 안 됨)와
 * 같은 실수를 반복하지 않기 위해 아예 마감일 단일 입력으로 줄였다 —
 * docs/api-gaps.md (A) "회비 시작일 필드 부재", design-verification.md §5-4 참고.
 */
export const DUES_CREATE_DUE_DATE_LABEL = '마감일';
export const DUES_CREATE_DUE_DATE_PLACEHOLDER = '마감일을 선택해주세요.';

export const DUES_CREATE_NEXT_LABEL = '다음으로';

export const DUES_CREATE_LEAVE_TITLE = '회비 생성을 그만둘까요?';
export const DUES_CREATE_LEAVE_DESCRIPTION = '변경된 내용은 저장되지 않아요.';
export const DUES_CREATE_LEAVE_CANCEL_LABEL = '취소';
export const DUES_CREATE_LEAVE_CONFIRM_LABEL = '그만두기';

export const DUES_MEMBER_SELECT_TITLE = '모임원 선택';
export const DUES_MEMBER_SELECT_SEARCH_PLACEHOLDER = '검색어를 입력해주세요.';
export const DUES_MEMBER_SELECT_ALL_LABEL = '전체 선택';
export const DUES_MEMBER_SELECT_COUNT_SUFFIX = '명';
export const DUES_MEMBER_SELECT_EMPTY = '모임원을 추가해보세요.';
export const DUES_MEMBER_SELECT_SUBMIT_LABEL = '회비 생성하기';
export const DUES_MEMBER_SELECT_LOADING = '모임원 목록을 불러오는 중이에요.';
export const DUES_MEMBER_SELECT_RETRY_LABEL = '다시 시도';

export const SNACKBAR_DUES_CREATED_PREFIX = "'";
export const SNACKBAR_DUES_CREATED_SUFFIX = "' 회비가 생성되었어요.";
