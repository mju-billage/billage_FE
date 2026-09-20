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
/** 시안(전체모임관리_모임추가_코드로참여하기.png) No.4 [액션] 문구 그대로 — "유효하지
 * 않은 코드이거나 이미 가입된 모임일 경우" 실패 사유를 구분 안 하고 하나로 보여준다.
 * 2026-09-13: 만료된 코드(`INVITATION_EXPIRED`)도 같은 취급 — 시안이 실패 사유를
 * 굳이 나누지 않는 설계라 그대로 따랐다. */
export const JOIN_GROUP_INVALID_CODE_ERROR = '코드가 일치하지 않아요. 다시 입력해주세요.';
export const SNACKBAR_GROUP_JOINED_SUFFIX = " 모임에 참여했어요.";

// 모임 관리 (ETC-2-PAGE-02-0) — "모임 관리자"(GroupMembership 권한 관리)와는
// 별개 화면이다. 더보기 > 모임 관리가 중간 화면 없이 바로 모임 관리자로
// 직행하던 게 design-verification.md §5-4의 미해결 항목이었는데, 시안
// (더보기_모임관리_모임삭제하기.png 배경 화면)이 "< 모임 관리"라는 별도
// 페이지 경로/제목으로 등장해 실재를 확인했다 — 오기가 아니다.
export const GROUP_MANAGE_TITLE = '모임 관리';
export const GROUP_MANAGE_PROFILE_EDIT_LABEL = '모임 프로필 변경';
export const GROUP_MANAGE_MEMBER_MANAGE_LABEL = '모임원 관리';
export const GROUP_MANAGE_LEAVE_LABEL = '모임 나가기';
export const GROUP_MANAGE_DELETE_LABEL = '모임 삭제하기';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const GROUP_MANAGE_LOADING = '모임 정보를 불러오는 중이에요.';
export const GROUP_MANAGE_RETRY_LABEL = '다시 시도';

// 모임 프로필 변경 (ETC-3-PAGE-01-0)
export const GROUP_PROFILE_EDIT_TITLE = '모임 프로필 변경';
export const GROUP_PROFILE_EDIT_NAME_LABEL = '모임명';
/** 시안 UI 요소 3번: "10자 제한 적용되며 10자 이상 입력시 입력 차단". */
export const GROUP_PROFILE_EDIT_NAME_MAX_LENGTH = 10;
export const GROUP_PROFILE_EDIT_SUBMIT_LABEL = '저장하기';

// 이미지 선택 (ETC-4-PAGE-02-0) — 모임 프로필/글로벌 내 프로필(미구현) 공용.
// 시안엔 체크박스·선택 개수·확인 버튼이 없다(단일 선택, 탭하면 바로 반영) —
// 다중 선택인 ADD 도메인의 동명 ID(증빙자료 앨범 선택)와는 다른 화면이다.
export const GROUP_IMAGE_PICKER_TITLE = '최근 항목';

// 모임 프로필 이미지 선택 방식 바텀시트 — `ProfileEditScreen`의 이미지 메뉴와 동일 로직.
export const GROUP_PROFILE_IMAGE_SHEET_CAMERA_LABEL = '사진 촬영하기';
export const GROUP_PROFILE_IMAGE_SHEET_GALLERY_LABEL = '사진 선택하기';

// 모임 삭제하기 (ETC-3-MODAL-02-0)
export const GROUP_DELETE_CONFIRM_TITLE = '모임을 삭제할까요?';
export const GROUP_DELETE_CONFIRM_DESCRIPTION = '삭제를 위해 모임명을 입력해 주세요.';
export const GROUP_DELETE_NAME_PLACEHOLDER = '모임명';
/** 시안 UI 요소 3번: 입력값이 현재 모임명과 실시간으로 다르면 보여주는 헬프 메시지. */
export const GROUP_DELETE_NAME_MISMATCH_ERROR = '모임명이 일치하지 않아요.';
export const GROUP_DELETE_CANCEL_LABEL = '취소';
export const GROUP_DELETE_CONFIRM_LABEL = '삭제';
export const SNACKBAR_GROUP_DELETED_PREFIX = "'";
export const SNACKBAR_GROUP_DELETED_SUFFIX = "' 모임을 삭제했어요.";

// 모임 전환 완료 (ETC-5-SNACKBAR-05-0) — 시안 이미지 0장. 다른 완료 스낵바들
// ("'{이름}' 모임에 참여했어요." 등)의 프리픽스+서픽스 패턴을 그대로 따랐다
// (design-verification.md §5-4에 디자인 없음으로 기록).
export const SNACKBAR_GROUP_SWITCHED_PREFIX = "'";
export const SNACKBAR_GROUP_SWITCHED_SUFFIX = "' 모임으로 전환했어요.";

// 모임 관리자 (모임원 관리)
export const GROUP_MANAGER_TITLE = '모임 관리자';
/**
 * "모임원 관리"(DUE-2-PAGE-02-0) 진입 행. IA엔 "더보기 > 모임 관리 > 모임원
 * 명단 관리"로 정의돼 있지만 "모임 관리"(ETC-2-PAGE-02-0) 허브 화면 자체가
 * 없어(design-verification.md §5-4) 이 화면(현재 "모임 관리" 진입 시 실제로
 * 도착하는 화면)에 바로 둔다 — docs/api-integration-plan.md (A) 참고.
 */
export const GROUP_MANAGER_MEMBER_MANAGE_LABEL = '모임원 관리';
export const GROUP_MANAGER_INVITE_CODE_PREFIX = '초대코드 : ';
export const SNACKBAR_INVITE_CODE_COPIED = '초대 코드가 복사되었어요.';
/** 조회/발급 중(화면 진입 시 자동, GET .../invitations/current). */
export const GROUP_MANAGER_INVITE_CODE_ISSUING = '발급 중...';
/** 코드가 없고 내가 총무가 아닐 때(INVITATION_NOT_FOUND, 발급은 총무만 가능 — GroupMembership.txt 7번 정책). */
export const GROUP_MANAGER_INVITE_CODE_PENDING = '총무에게 발급을 요청해주세요';
/** 조회/발급 요청이 실패했을 때 — 행을 다시 누르면 재시도한다. */
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
