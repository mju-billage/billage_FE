/** 모임원 관리(DUE-2-PAGE-02-0)·모임원 추가(DUE-3-SHEET-02-0/DUE-4-PAGE-01-0/
 * DUE-4-PAGE-02-0/DUE-5-PAGE-01-0) 화면 전용 문구. */

// 모임원 관리 (목록)
export const MEMBER_MANAGE_TITLE = '모임원 관리';
export const MEMBER_MANAGE_SEARCH_PLACEHOLDER = '검색어를 입력해주세요.';
export const MEMBER_MANAGE_COUNT_SUFFIX = '명';
/** 그룹에 등록된 모임원이 0명일 때(검색 전). */
export const MEMBER_MANAGE_EMPTY = '모임원을 추가하여 관리해보세요.';
/** 검색 결과가 0건일 때. */
export const MEMBER_MANAGE_SEARCH_EMPTY = '검색 결과가 없어요.';
export const MEMBER_MANAGE_ADD_MENU_LABEL = '모임원 추가';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const MEMBER_MANAGE_LOADING = '모임원 목록을 불러오는 중이에요.';
export const MEMBER_MANAGE_RETRY_LABEL = '다시 시도';

// 모임원 추가 선택 시트 (DUE-3-SHEET-02-0)
export const MEMBER_ADD_SHEET_TITLE = '모임원 추가';
export const MEMBER_ADD_SHEET_INDIVIDUAL_LABEL = '개별 추가하기';
export const MEMBER_ADD_SHEET_BULK_LABEL = '일괄 추가하기';

// 개별 추가 (DUE-4-PAGE-01-0)
export const MEMBER_ADD_INDIVIDUAL_TITLE = '개별 추가';
export const MEMBER_NAME_LABEL = '이름';
export const MEMBER_NAME_PLACEHOLDER = '이름을 입력해주세요.';
/** Member.txt 필드표 "name: 최대 10자". */
export const MEMBER_NAME_MAX_LENGTH = 10;
export const MEMBER_PHONE_LABEL = '전화번호';
export const MEMBER_PHONE_PLACEHOLDER = '전화번호를 입력해주세요.';
export const MEMBER_PHONE_INVALID_ERROR = '숫자만 9~11자리로 입력해주세요.';
export const MEMBER_TAG_LABEL = '태그';
export const MEMBER_TAG_EMPTY_VALUE = '선택사항';
export const MEMBER_MEMO_LABEL = '메모';
export const MEMBER_MEMO_PLACEHOLDER = '메모를 입력해주세요.';
/** Member.txt 필드표 "memo: 최대 30자". */
export const MEMBER_MEMO_MAX_LENGTH = 30;
export const MEMBER_ADD_SUBMIT_LABEL = '추가하기';

// 태그 입력 (DUE-5-PAGE-01-0) — 개별 추가 화면 내부 스텝으로 구현
export const MEMBER_TAG_INPUT_TITLE = '태그';
/**
 * Member.txt Validation은 "최대 3개(화면명세 '# 태그를 입력해 주세요 (최대 3개)')"라고
 * 명시하지만 같은 문서 필드표는 "최대 10개"라 적혀 있다 — 명세 자기모순.
 * 화면명세서 실제 문구("# 태그를 입력해 주세요(최대 3개)")를
 * 근거로 3개로 막는다.
 */
export const MEMBER_TAG_MAX_COUNT = 3;
export const MEMBER_TAG_INPUT_PLACEHOLDER = `# 태그를 입력해 주세요(최대 ${MEMBER_TAG_MAX_COUNT}개)`;
export const MEMBER_TAG_INPUT_HELPER = '회비를 모을 때 태그로 멤버를 쉽게 선택할 수 있어요';
export const MEMBER_TAG_INPUT_SUBMIT_LABEL = '입력하기';

// 일괄 추가 (DUE-4-PAGE-02-0)
export const MEMBER_ADD_BULK_TITLE = '일괄 추가';
export const MEMBER_ADD_BULK_PLACEHOLDER =
  '띄어쓰기 또는 쉼표로 구분하여 명단을 입력해주세요.';
export const MEMBER_ADD_BULK_HELPER =
  '여기서는 이름만 추가할 수 있어요. 모임원의 상세 정보는 개별 페이지에서 수정할 수 있어요.';
/** Member.txt "names: 필수, 공백 불가, 최대 2000자". */
export const MEMBER_ADD_BULK_TEXT_MAX_LENGTH = 2000;
/** Member.txt "잘라 낸 이름은 각각 최대 10자". */
export const MEMBER_ADD_BULK_NAME_TOO_LONG_ERROR = '이름은 각각 최대 10자예요.';
/** Member.txt "1회 최대 100명". */
export const MEMBER_ADD_BULK_MAX_COUNT = 100;
export const MEMBER_ADD_BULK_TOO_MANY_ERROR = '한 번에 최대 100명까지 등록할 수 있어요.';

// 스낵바
export const SNACKBAR_MEMBER_ADDED = '모임원이 추가되었어요.';
export const SNACKBAR_MEMBER_BULK_ADDED_SUFFIX = '명의 모임원이 일괄 추가되었어요.';
export const SNACKBAR_MEMBER_BULK_ADDED_DESCRIPTION =
  '상세 정보는 개별 페이지에서 수정할 수 있어요.';

// 모임원 관리 (목록) — 삭제 모드 (Case A)
export const MEMBER_MANAGE_DELETE_MENU_LABEL = '모임원 삭제';
export const MEMBER_MANAGE_SELECT_ALL_LABEL = '전체 선택';
export const MEMBER_MANAGE_SELECT_COUNT_SUFFIX = '명';
export const MEMBER_MANAGE_DELETE_SUBMIT_SUFFIX = '명 삭제하기';

// 모임원 상세 (DUE-3-PAGE-03-0)
export const MEMBER_DETAIL_TOTAL_PAID_LABEL = '총 납부 금액';
export const MEMBER_DETAIL_TOTAL_PAID_SUFFIX = '원';
export const MEMBER_DETAIL_NAME_LABEL = '이름';
export const MEMBER_DETAIL_PHONE_LABEL = '전화번호';
export const MEMBER_DETAIL_TAG_LABEL = '태그';
/** 전화번호·태그·메모 중 등록된 값이 없을 때(화면명세 "빈 값(Empty) 처리"). */
export const MEMBER_DETAIL_EMPTY_VALUE = '-';
export const MEMBER_DETAIL_LOADING = '모임원 정보를 불러오는 중이에요.';

// 모임원 수정 (DUE-4-PAGE-03-0)
export const MEMBER_EDIT_TITLE = '정보 수정';
export const MEMBER_EDIT_SUBMIT_LABEL = '저장하기';
/** COM-1-SNACKBAR-02-0(수정 완료) — Member 도메인에서 쓰는 문구. */
export const SNACKBAR_MEMBER_UPDATED = '변경 사항이 저장되었어요.';

// 모임원 삭제 확인 — DUE-4-MODAL-01-0(상세) / 목록 일괄 삭제(Case A) 공용.
// 시안(모임원삭제-1.png, 모임원삭제.png) 둘 다 인원수와 무관하게 같은 문구를 쓴다.
export const MEMBER_DELETE_CONFIRM_TITLE = '해당 모임원을 삭제할까요?';
export const MEMBER_DELETE_CONFIRM_DESCRIPTION = '기존 납부 내역은 그대로 유지돼요.';
export const MEMBER_DELETE_CONFIRM_LABEL = '삭제';
export const SNACKBAR_MEMBER_DELETED_SUFFIX = '명의 모임원이 삭제되었어요.';

// 모임원 납부 내역 (DUE-4-PAGE-04-0)
export const MEMBER_PAYMENT_HISTORY_TITLE = '납부 내역';
export const MEMBER_PAYMENT_COUNT_SUFFIX = '건';
export const MEMBER_PAYMENT_EMPTY = '납부 내역이 없어요.';
export const MEMBER_PAYMENT_LOADING = '납부 내역을 불러오는 중이에요.';
export const MEMBER_PAYMENT_LOADING_MORE = '불러오는 중이에요.';
