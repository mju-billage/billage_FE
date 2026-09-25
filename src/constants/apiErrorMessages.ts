export const API_ERROR_DEFAULT_MESSAGE =
  '일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.';

export const API_NETWORK_ERROR_MESSAGE =
  '네트워크 연결을 확인해주세요.';

export const NO_ACTIVE_GROUP_MESSAGE =
  '모임 정보를 불러오지 못했어요. 다시 시도해주세요.';

const COMMON_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '로그인이 필요해요. 다시 로그인해주세요.',
  ACCESS_DENIED: '이 작업을 할 권한이 없어요.',
  INVALID_REQUEST: '입력값을 다시 확인해주세요.',
  INVALID_QUERY_PARAMETER: '목록을 불러오지 못했어요. 다시 시도해주세요.',
  RESOURCE_NOT_FOUND: '요청한 정보를 찾을 수 없어요.',
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: '현재 비밀번호와 일치하지 않아요. 다시 입력해주세요.',
  ACCESS_TOKEN_EXPIRED: '로그인이 만료됐어요. 다시 로그인해주세요.',
  INVALID_TOKEN: '로그인이 만료됐어요. 다시 로그인해주세요.',
  REFRESH_TOKEN_EXPIRED: '로그인이 만료됐어요. 다시 로그인해주세요.',
  REFRESH_TOKEN_REVOKED: '로그인이 만료됐어요. 다시 로그인해주세요.',
  INVALID_VERIFICATION_CODE: '인증 코드가 올바르지 않아요. 다시 확인해 주세요.',
  VERIFICATION_CODE_EXPIRED: '인증 시간이 만료되었어요. 다시 시도해 주세요.',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일이에요. 로그인해주세요.',
  PASSWORD_CHANGE_NOT_ALLOWED: '소셜 로그인 계정은 비밀번호를 변경할 수 없어요.',
  VERIFICATION_NOT_FOUND: '인증 요청을 찾을 수 없어요. 인증 코드를 다시 받아주세요.',
};

const GROUP_ERROR_MESSAGES: Record<string, string> = {
  GROUP_NOT_FOUND: '모임을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_FILE_PURPOSE: '대표 이미지로 쓸 수 없는 파일이에요.',
  FILE_NOT_FOUND: '이미지 파일을 찾을 수 없어요.',
  FILE_IN_USE: '이미 다른 모임이 쓰고 있는 이미지예요.',
  GROUP_NAME_MISMATCH: '모임명이 일치하지 않아요.',
};

const GROUP_MEMBERSHIP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_ROLE: '허용되지 않은 권한이에요.',
  MEMBERSHIP_NOT_FOUND: '모임 관리자 정보를 찾을 수 없어요.',
  LAST_OWNER_REQUIRED:
    '마지막 총무는 권한을 내려놓을 수 없어요. 다른 관리자에게 먼저 위임해주세요.',
  INVALID_INVITATION_CODE: '코드가 일치하지 않아요. 다시 입력해주세요.',
  INVITATION_EXPIRED: '코드가 일치하지 않아요. 다시 입력해주세요.',
  ALREADY_GROUP_MEMBER: '코드가 일치하지 않아요. 다시 입력해주세요.',
};

const FOLDER_ERROR_MESSAGES: Record<string, string> = {
  FOLDER_NOT_FOUND: '폴더를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_PARENT_FOLDER:
    '이동할 수 없는 위치예요. 자기 자신이나 하위 폴더로는 옮길 수 없어요.',
};

const LEDGER_ERROR_MESSAGES: Record<string, string> = {
  LEDGER_NOT_FOUND: '장부를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_BUDGET: '예산은 0원 이상 999,999,999원 이하로 입력해주세요.',
  GROUP_MISMATCH: '다른 모임의 폴더로는 옮길 수 없어요.',
};

const USER_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: '사용자 정보를 찾을 수 없어요.',
  OWNER_TRANSFER_REQUIRED: '권한을 위임할 멤버를 모두 선택해주세요.',
};

const MEMBER_ERROR_MESSAGES: Record<string, string> = {
  MEMBER_NOT_FOUND: '모임원을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
};

const DUES_ERROR_MESSAGES: Record<string, string> = {
  DUES_NOT_FOUND: '회비를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  DUES_ALREADY_CLOSED: '이미 마감된 회비예요.',
  DUES_AMOUNT_IMMUTABLE: '금액은 수정할 수 없어요.',
  DUES_NOT_STARTED: '아직 시작하지 않은 회비예요.',
  INVALID_PAYMENT_STATUS: '납부 상태를 변경할 수 없어요. 다시 시도해주세요.',
};

const ENTRY_ERROR_MESSAGES: Record<string, string> = {
  ENTRY_NOT_FOUND: '내역을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  ENTRY_ALREADY_APPROVED: '이미 승인된 내역이에요. 새로고침 후 다시 확인해주세요.',
};

const FILE_ERROR_MESSAGES: Record<string, string> = {
  INVALID_FILE: '파일을 열 수 없어요. 다른 파일을 선택해주세요.',
  UNSUPPORTED_FILE_TYPE: '지원하지 않는 파일 형식이에요. JPG·PNG 이미지를 사용해주세요.',
  FILE_SIZE_EXCEEDED: '파일 용량이 너무 커요. 10MB 이하 파일을 사용해주세요.',
  FILE_UPLOAD_FAILED: '파일 업로드에 실패했어요. 잠시 후 다시 시도해주세요.',
  FILE_DELETE_FAILED: '파일 삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
};

const OCR_ERROR_MESSAGES: Record<string, string> = {
  INVALID_OCR_FILE: '영수증으로 인식할 수 없는 이미지예요. 다른 사진을 선택해주세요.',
  OCR_RESULT_EMPTY: '영수증에서 내용을 읽지 못했어요. 다른 사진으로 다시 시도해주세요.',
  OCR_PROCESSING_FAILED: '영수증 인식에 실패했어요. 잠시 후 다시 시도해주세요.',
};

const ARCHIVE_ERROR_MESSAGES: Record<string, string> = {
  ARCHIVE_NOT_FOUND: '보관 기록을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  ARCHIVE_IN_PROGRESS: '이미 백업 작업이 진행 중이에요. 잠시 후 다시 시도해주세요.',
  ARCHIVE_EMPTY: '아직 등록된 내역이 없어요. 내역을 추가한 뒤 다시 시도해주세요.',
};

const REPORT_ERROR_MESSAGES: Record<string, string> = {
  REPORT_NOT_FOUND: '보고서를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  REPORT_RANGE_EMPTY: '선택한 장부·기간에 보고서로 만들 내역이 없어요.',
};

const API_ERROR_MESSAGES: Record<string, string> = {
  ...COMMON_ERROR_MESSAGES,
  ...AUTH_ERROR_MESSAGES,
  ...GROUP_ERROR_MESSAGES,
  ...GROUP_MEMBERSHIP_ERROR_MESSAGES,
  ...FOLDER_ERROR_MESSAGES,
  ...LEDGER_ERROR_MESSAGES,
  ...MEMBER_ERROR_MESSAGES,
  ...DUES_ERROR_MESSAGES,
  ...ENTRY_ERROR_MESSAGES,
  ...FILE_ERROR_MESSAGES,
  ...OCR_ERROR_MESSAGES,
  ...USER_ERROR_MESSAGES,
  ...ARCHIVE_ERROR_MESSAGES,
  ...REPORT_ERROR_MESSAGES,
};

export function getApiErrorMessage(code: string): string {
  return API_ERROR_MESSAGES[code] ?? API_ERROR_DEFAULT_MESSAGE;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}
