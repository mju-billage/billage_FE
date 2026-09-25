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

/** 회비 생성(DUE-2-PAGE-01-0 + DUE-3-PAGE-01-0) 전용 문구. */
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
/** 시안(납부관리_메인_새회비생성.png No.4) 문구 — 박스 안 "+ 선택하기" 고정 노출. */
export const DUES_CREATE_LEDGER_PLACEHOLDER = '+ 선택하기';

/**
 * 화면명세서(DUE-2-PAGE-01-0)가 요구하는 "기간"(시작~마감 범위)이다.
 * 서버는 `startDate` 없이는 400을 준다. 범위 선택은 `DuesDateRangeSheet`(DTB-3-SHEET-01-0과
 * 같은 유형의 기간 선택 캘린더)를 쓴다.
 */
export const DUES_CREATE_PERIOD_LABEL = '기간';
/** 시안(납부관리_메인_새회비생성.png No.5) placeholder 형식 문구 그대로 — 실제
 * 채워진 값은 4자리 연도("2026.04.22 ~ 2026.04.25")지만, placeholder 자체는
 * 시트에 박힌 "YY.MM.DD ~ YY.MM.DD" 표기를 그대로 쓴다(보고서 쪽 2자리 표기와
 * 다른 시트라 공용 포맷 함수로 묶지 않는다). */
export const DUES_CREATE_PERIOD_PLACEHOLDER = 'YY.MM.DD ~ YY.MM.DD';

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

/** 회비 상세 ⋮ 메뉴(DUE-2-PAGE-03-0) 전용 문구. 전부 총무 전용이라
 * ⋮ 버튼 자체를 일반 관리자에게 숨긴다. */
export const DUES_MENU_ACCESSIBILITY_LABEL = '회비 관리 메뉴';
export const DUES_MENU_EDIT_LABEL = '회비 수정';
export const DUES_MENU_MEMBERS_LABEL = '모임원 선택';
export const DUES_MENU_CLOSE_LABEL = '회비 마감';
export const DUES_MENU_DELETE_LABEL = '회비 삭제';

/** 회비 수정(DUE-3-PAGE-06-0, +DUE-4-MODAL-02-0 이탈 방지) 전용 문구. */
export const DUES_EDIT_TITLE = '회비 수정';
export const DUES_EDIT_AMOUNT_LOCKED_HINT =
  '금액은 마감 전까지도 수정할 수 없어요.';
export const DUES_EDIT_SUBMIT_LABEL = '수정하기';
export const DUES_EDIT_LEAVE_TITLE = '회비 수정을 그만둘까요?';
export const DUES_EDIT_LOADING = '회비 정보를 불러오는 중이에요.';
export const DUES_EDIT_RETRY_LABEL = '다시 시도';
export const SNACKBAR_DUES_UPDATED = '회비 수정이 완료되었어요.';

/** 회비 수정_모임원 선택(DUE-3-PAGE-02-0, +DUE-4-MODAL-02-0 이탈 방지) 전용 문구.
 * 제목/검색창/전체선택/빈 상태 문구는 생성 화면(DUES_MEMBER_SELECT_*)과 동일해
 * 그대로 재사용하고, CTA·이탈 모달·완료 스낵바만 별도로 둔다(문구가 다름). */
export const DUES_MEMBER_EDIT_SUBMIT_LABEL = '수정하기';
export const DUES_MEMBER_EDIT_LEAVE_TITLE = '모임원 선택을 그만둘까요?';
export const SNACKBAR_DUES_MEMBERS_UPDATED = '변경 사항이 저장되었어요.';

/** 회비 삭제(DUE-3-MODAL-01-0, +DUE-4-SNACKBAR-03-0) 전용 문구. */
export const DUES_DELETE_CONFIRM_TITLE = '해당 회비를 삭제하시겠습니까?';
export const DUES_DELETE_CONFIRM_DESCRIPTION =
  '삭제 이후에는 데이터 복구가 어렵습니다.';
export const DUES_DELETE_CONFIRM_LABEL = '삭제';
export const SNACKBAR_DUES_DELETED_PREFIX = "'";
export const SNACKBAR_DUES_DELETED_SUFFIX = "' 회비가 삭제되었어요.";

/** 납부 상태 일괄 변경(DUE-2-PAGE-03-0의 체크박스+CTA) 전용 문구.
 * `OPEN` 상태에서만 노출(SCHEDULED/CLOSED는 체크박스·CTA 자체를 숨김). */
export const DUES_PAYMENT_MARK_PAID_LABEL = '납부 완료하기';
export const DUES_PAYMENT_MARK_UNPAID_LABEL = '납부 취소하기';
/** "{changedCount}" + 이 접미사 — 선택 인원수가 아니라 서버가 실제로 반영한
 * 인원수(changedCount)를 써야 한다(duesService.ts 주석 참고). */
export const SNACKBAR_DUES_PAYMENT_CONFIRMED_SUFFIX = '명의 납부가 확인되었어요.';
export const SNACKBAR_DUES_PAYMENT_CANCELLED_SUFFIX = '명의 납부가 취소되었어요.';

/** 회비 요청 작성(DUE-3-PAGE-04-0) 전용 문구. 서버 API 없음(Dues.txt "회비
 * 요청 — 서버 기능이 아닙니다") — 작성한 텍스트를 OS 공유 시트로 넘기기만 한다. */
export const DUES_REQUEST_TITLE = '회비 요청';
export const DUES_REQUEST_PLACEHOLDER = '회비 납부 요청 글을 작성해 주세요';
export const DUES_REQUEST_SUBMIT_LABEL = '회비 요청하기';
export const DUES_REQUEST_LEAVE_TITLE = '회비 요청 작성을 그만둘까요?';
export const DUES_REQUEST_LEAVE_DESCRIPTION = '작성 중인 내용이 사라져요.';
export const DUES_REQUEST_ENTRY_LABEL = '회비 요청하기';

/** 회비 마감(DUE-3-MODAL-02-0, +DUE-4-SNACKBAR-02-0) 전용 문구. */
export const DUES_CLOSE_CONFIRM_TITLE = '회비 수납을 마감할까요?';
export const DUES_CLOSE_CONFIRM_DESCRIPTION =
  '현재 금액이 전체 내역의 수입으로 기록돼요.';
export const DUES_CLOSE_CONFIRM_LABEL = '마감';
export const SNACKBAR_DUES_CLOSED_PREFIX = "'";
export const SNACKBAR_DUES_CLOSED_SUFFIX = "' 회비를 마감했어요.";
