/** 더보기 메인 / 전체 모임 관리 / 모임 생성·참여 / 모임 관리자(모임원 관리) 화면 전용 문구. */

// 더보기 메인
export const MORE_MEMBER_CARD_TITLE = '모임 관리자';
export const MORE_MEMBER_CARD_VIEW_ALL = '전체보기';
export const MORE_MEMBER_CARD_ADD = '추가하기';
export const MORE_MENU_GROUP_MANAGE = '모임 관리';
export const MORE_MENU_REPORT = '보고서 생성';
export const MORE_MENU_RECEIPT_ALBUM = '증빙자료 앨범';
export const MORE_MENU_STATISTICS = '소비 통계/분석';
export const MORE_MENU_ARCHIVE = '보관함';
/** 로딩/에러/빈 목록 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const MORE_LOADING = '모임 정보를 불러오는 중이에요.';
export const MORE_RETRY_LABEL = '다시 시도';
export const MORE_EMPTY_MESSAGE = '아직 속한 모임이 없어요.';
export const MORE_EMPTY_ADD_LABEL = '모임 만들기 / 참여하기';

// 닉네임(모임명) 드롭다운
export const GROUP_SWITCHER_ADD_ALL = '전체 모임 관리';

// 전체 모임 관리
export const ALL_GROUPS_TITLE = '전체 모임 관리';
export const ALL_GROUPS_ROLE_TREASURER = '총무';
export const ALL_GROUPS_ADD_NEW = '새로운 모임 추가하기';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일(api-integration-plan.md "표준 패턴" 참고). */
export const ALL_GROUPS_LOADING = '모임 목록을 불러오는 중이에요.';
export const ALL_GROUPS_RETRY_LABEL = '다시 시도';

// 새 모임 추가 시트
export const ADD_GROUP_SHEET_TITLE = '새로운 모임 추가';
export const ADD_GROUP_CREATE_LABEL = '모임 생성하기';
export const ADD_GROUP_JOIN_LABEL = '코드로 참여하기';

// 모임 생성하기
export const GROUP_CREATE_TITLE = '모임 생성하기';
export const GROUP_CREATE_SUBTITLE = '새로운 모임을 만들고 회비 관리를 시작해보세요';
export const GROUP_NAME_LABEL = '모임 이름';
export const GROUP_NAME_PLACEHOLDER = '모임 이름을 입력해주세요.';
export const GROUP_CREATE_SUBMIT_LABEL = '생성하기';
export const SNACKBAR_GROUP_CREATED_SUFFIX = " 모임이 생성되었어요.";

// 코드로 참여하기
export const JOIN_GROUP_SHEET_TITLE = '코드로 참여하기';
export const JOIN_GROUP_PLACEHOLDER = '초대 코드를 입력해주세요.';
export const JOIN_GROUP_SUBMIT_LABEL = '참여하기';
export const JOIN_GROUP_INVALID_CODE_ERROR = '유효하지 않은 초대 코드예요.';
export const SNACKBAR_GROUP_JOINED_SUFFIX = " 모임에 참여했어요.";

// 모임 관리자 (모임원 관리)
export const GROUP_MANAGER_TITLE = '모임 관리자';
export const GROUP_MANAGER_INVITE_CODE_PREFIX = '초대코드 : ';
export const SNACKBAR_INVITE_CODE_COPIED = '초대 코드가 복사되었어요.';
/** 카드를 눌러 발급을 요청한 직후(사용자 액션 기반, 자동 발급 아님). */
export const GROUP_MANAGER_INVITE_CODE_ISSUING = '발급 중...';
/** 아직 발급받지 않은 초기 상태 — 카드를 누르면 그때 발급을 요청한다. */
export const GROUP_MANAGER_INVITE_CODE_PENDING = '탭하여 초대코드 발급받기';
/** 발급 요청이 실패했을 때 — 행을 다시 누르면 재시도한다. */
export const GROUP_MANAGER_INVITE_CODE_ERROR = '발급 실패 · 눌러서 재시도';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const GROUP_MANAGER_LOADING = '모임원 목록을 불러오는 중이에요.';
export const GROUP_MANAGER_RETRY_LABEL = '다시 시도';

// 프로필 시트
export const PROFILE_SHEET_TITLE = '프로필';
export const PROFILE_SHEET_TITLE_ME = '내 프로필';
export const PROFILE_PERMISSION_SECTION_TITLE = '권한 설정';
export const PROFILE_PROMOTE_TO_TREASURER = '총무로 전환하기';
export const PROFILE_DEMOTE_TO_MEMBER = '일반으로 전환하기';
export const PROFILE_REMOVE_MEMBER = '모임 내보내기';
export const PROFILE_LEAVE_GROUP = '모임 나가기';

// 확인 모달들
export const DIALOG_CANCEL_LABEL = '취소';

export const PROMOTE_CONFIRM_TITLE_PREFIX = "'";
export const PROMOTE_CONFIRM_TITLE_SUFFIX = "'님을 총무로 전환할까요?";
export const PROMOTE_CONFIRM_DESCRIPTION = '모임의 회비 및 장부 관리 권한을 받게 돼요.';
export const PROMOTE_CONFIRM_LABEL = '전환';

export const DEMOTE_CONFIRM_TITLE_PREFIX = "'";
export const DEMOTE_CONFIRM_TITLE_SUFFIX = "'님을 일반으로 전환할까요?";
export const DEMOTE_CONFIRM_DESCRIPTION = '총무 권한이 해제되고 일반 기능만 사용 가능해요.';
export const DEMOTE_CONFIRM_LABEL = '전환';

export const REMOVE_MEMBER_CONFIRM_TITLE_PREFIX = "'";
export const REMOVE_MEMBER_CONFIRM_TITLE_SUFFIX = "'님을 모임에서 내보낼까요?";
export const REMOVE_MEMBER_CONFIRM_LABEL = '내보내기';

export const LEAVE_GROUP_CONFIRM_TITLE = '모임에서 나가시겠어요?';
export const LEAVE_GROUP_CONFIRM_LABEL = '나가기';

export const LEAVE_GROUP_BLOCKED_TITLE = '총무 권한을 넘긴 후 나갈 수 있어요.';
export const LEAVE_GROUP_BLOCKED_DESCRIPTION = '다른 모임원에게 권한을 위임해 주세요.';
export const LEAVE_GROUP_BLOCKED_CONFIRM_LABEL = '확인';

// 스낵바
export const SNACKBAR_ROLE_CHANGED_PREFIX = "'";
export const SNACKBAR_ROLE_CHANGED_SUFFIX = "'님의 권한을 변경했어요.";
export const SNACKBAR_MEMBER_REMOVED_PREFIX = "'";
export const SNACKBAR_MEMBER_REMOVED_SUFFIX = "'님을 모임에서 내보냈어요.";
