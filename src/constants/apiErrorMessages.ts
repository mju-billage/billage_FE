/**
 * API 에러 code → 화면 문구 매핑. 공통규칙 §6에 따라 화면은 서버 message가 아니라
 * code로 분기한다(§20 "서버 메시지를 화면에 직접 표시할지"가 미합의 항목이라 더더욱).
 * 도메인이 늘어날 때마다 이 파일에 `{DOMAIN}_ERROR_MESSAGES`를 추가하고
 * `API_ERROR_MESSAGES`에 합친다 — Group 1단계에서 확정한 패턴.
 */

/** 매핑에 없는 code가 오면 이 문구를 쓴다. */
export const API_ERROR_DEFAULT_MESSAGE =
  '일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.';

/** fetch 자체가 실패(DNS/TLS/연결 거부 등)해 서버 응답조차 못 받았을 때. */
export const API_NETWORK_ERROR_MESSAGE =
  '네트워크 연결을 확인해주세요.';

/**
 * [치명1] `getActiveGroup()`이 비어 있을 때 쓴다 — 로그인/세션 복원 직후 모임
 * 캐시를 아직 못 채웠거나(레이스, 재시도로 해결됨) 정말 속한 모임이 없는 경우
 * (재시도로 해결 안 됨) 둘 다 이 메시지 하나로 통일한다. 원인이 뭐든 "화면이
 * 영원히 로딩 중" 상태로 남겨두지 않는 것이 목적이라 문구를 세분화하지 않았다.
 */
export const NO_ACTIVE_GROUP_MESSAGE =
  '모임 정보를 불러오지 못했어요. 다시 시도해주세요.';

/** 여러 도메인 API에 공통으로 나오는 에러 코드. */
const COMMON_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '로그인이 필요해요. 다시 로그인해주세요.',
  ACCESS_DENIED: '이 작업을 할 권한이 없어요.',
  INVALID_REQUEST: '입력값을 다시 확인해주세요.',
};

/** Group 도메인 고유 에러 코드. */
const GROUP_ERROR_MESSAGES: Record<string, string> = {
  GROUP_NOT_FOUND: '모임을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_FILE_PURPOSE: '대표 이미지로 쓸 수 없는 파일이에요.',
  FILE_NOT_FOUND: '이미지 파일을 찾을 수 없어요.',
  FILE_IN_USE: '이미 다른 모임이 쓰고 있는 이미지예요.',
};

/** GroupMembership 도메인 고유 에러 코드(2단계에서 실제로 붙지만 매핑은 여기 같이 정리). */
const GROUP_MEMBERSHIP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_ROLE: '허용되지 않은 권한이에요.',
  MEMBERSHIP_NOT_FOUND: '모임 관리자 정보를 찾을 수 없어요.',
  LAST_OWNER_REQUIRED:
    '마지막 총무는 권한을 내려놓을 수 없어요. 다른 관리자에게 먼저 위임해주세요.',
};

/** Folder 도메인 고유 에러 코드(3단계). */
const FOLDER_ERROR_MESSAGES: Record<string, string> = {
  FOLDER_NOT_FOUND: '폴더를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_PARENT_FOLDER:
    '이동할 수 없는 위치예요. 자기 자신이나 하위 폴더로는 옮길 수 없어요.',
};

/** Ledger 도메인 고유 에러 코드(3단계). */
const LEDGER_ERROR_MESSAGES: Record<string, string> = {
  LEDGER_NOT_FOUND: '장부를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_BUDGET: '예산은 0원 이상 999,999,999원 이하로 입력해주세요.',
  GROUP_MISMATCH: '다른 모임의 폴더로는 옮길 수 없어요.',
};

/** User 도메인 고유 에러 코드(`GET/PATCH/DELETE /auth/me`, 8-A, 11). */
const USER_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: '사용자 정보를 찾을 수 없어요.',
  OWNER_TRANSFER_REQUIRED: '권한을 위임할 멤버를 모두 선택해주세요.',
};

/** Member 도메인 고유 에러 코드(6-B에서 회비 생성 대상자 검증 중 실제로 붙음). */
const MEMBER_ERROR_MESSAGES: Record<string, string> = {
  MEMBER_NOT_FOUND: '모임원을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
};

/** Dues 도메인 고유 에러 코드(6-B, 7-B-1, 7-B-2). */
const DUES_ERROR_MESSAGES: Record<string, string> = {
  DUES_NOT_FOUND: '회비를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  DUES_ALREADY_CLOSED: '이미 마감된 회비예요.',
  DUES_AMOUNT_IMMUTABLE: '금액은 수정할 수 없어요.',
  DUES_NOT_STARTED: '아직 시작하지 않은 회비예요.',
};

/** Archive(보관함) 도메인 고유 에러 코드(Folder.txt 5·8번, 서버 시작 전). */
const ARCHIVE_ERROR_MESSAGES: Record<string, string> = {
  ARCHIVE_NOT_FOUND: '보관 기록을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  ARCHIVE_IN_PROGRESS: '이미 백업 작업이 진행 중이에요. 잠시 후 다시 시도해주세요.',
};

const API_ERROR_MESSAGES: Record<string, string> = {
  ...COMMON_ERROR_MESSAGES,
  ...GROUP_ERROR_MESSAGES,
  ...GROUP_MEMBERSHIP_ERROR_MESSAGES,
  ...FOLDER_ERROR_MESSAGES,
  ...LEDGER_ERROR_MESSAGES,
  ...MEMBER_ERROR_MESSAGES,
  ...DUES_ERROR_MESSAGES,
  ...USER_ERROR_MESSAGES,
  ...ARCHIVE_ERROR_MESSAGES,
};

/** ApiError.code를 화면에 띄울 한글 문구로 바꾼다. 매핑에 없으면 기본 문구. */
export function getApiErrorMessage(code: string): string {
  return API_ERROR_MESSAGES[code] ?? API_ERROR_DEFAULT_MESSAGE;
}

/** fetch 실패(네트워크 끊김 등)로 서버 응답 자체를 못 받은 경우인지 판별한다. */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}
