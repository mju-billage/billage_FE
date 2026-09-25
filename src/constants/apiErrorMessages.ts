/**
 * API 에러 code → 화면 문구 매핑. 공통규칙 §6에 따라 화면은 서버 message가 아니라
 * code로 분기한다(§20 "서버 메시지를 화면에 직접 표시할지"가 미합의 항목이라 더더욱).
 * 도메인이 늘어날 때마다 이 파일에 `{DOMAIN}_ERROR_MESSAGES`를 추가하고
 * `API_ERROR_MESSAGES`에 합친다.
 *
 * ⚠️ 도메인 블록이 통째로 빠지면 서버가 보낸 구체적 원인이 fallback 문구로 덮인다.
 * "일시적인 문제가 발생했어요"가 뜨면 서버 장애로 단정하기 전에 여기 매핑부터 확인할 것.
 */

/** 매핑에 없는 code가 오면 이 문구를 쓴다. */
export const API_ERROR_DEFAULT_MESSAGE =
  '일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.';

/** fetch 자체가 실패(DNS/TLS/연결 거부 등)해 서버 응답조차 못 받았을 때. */
export const API_NETWORK_ERROR_MESSAGE =
  '네트워크 연결을 확인해주세요.';

/**
 * `getActiveGroup()`이 비어 있을 때 쓴다 — 로그인/세션 복원 직후 모임
 * 캐시를 아직 못 채웠거나(레이스, 재시도로 해결됨) 정말 속한 모임이 없는 경우
 * (재시도로 해결 안 됨) 둘 다 이 메시지 하나로 통일한다. 원인이 뭐든 "화면이
 * 영원히 로딩 중" 상태로 남겨두지 않는 것이 목적이라 문구를 세분화하지 않았다.
 */
export const NO_ACTIVE_GROUP_MESSAGE =
  '모임 정보를 불러오지 못했어요. 다시 시도해주세요.';

/** 여러 도메인 API에 공통으로 나오는 에러 코드.
 * `INVALID_QUERY_PARAMETER`(2-2, 자체 작성): Dashboard/Dues/Entry/Report 등 목록 조회
 * 다수가 공유한다 — 우리 쪽 페이지네이션 파라미터 버그가 아니면 사용자가 유발할 방법이
 * 없는 코드라 "다시 시도" 정도로만 안내한다. */
const COMMON_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '로그인이 필요해요. 다시 로그인해주세요.',
  ACCESS_DENIED: '이 작업을 할 권한이 없어요.',
  INVALID_REQUEST: '입력값을 다시 확인해주세요.',
  INVALID_QUERY_PARAMETER: '목록을 불러오지 못했어요. 다시 시도해주세요.',
  // 404 — 서버에 라우트가 없을 때도(미구현 엔드포인트) 이 코드가 온다.
  // 매핑이 없으면 "일시적인 문제가 발생했어요" fallback으로 덮이므로 채워둔다.
  RESOURCE_NOT_FOUND: '요청한 정보를 찾을 수 없어요.',
};

/**
 * Auth 도메인 고유 에러 코드(`Auth (인증).txt`). 대부분 각 화면이 이미 로컬로 특수 처리하고 있어(로그인
 * `INVALID_CREDENTIALS`, 이메일 인증 `INVALID_VERIFICATION_CODE`/`VERIFICATION_CODE_EXPIRED`/
 * `EMAIL_ALREADY_EXISTS`, 비밀번호 변경 `INVALID_CREDENTIALS`) 이 맵까지 안 타는 경로가
 * 대부분이지만, 다른 호출부가 생기거나 로컬 분기가 빠졌을 때의 방어망으로 채운다.
 *
 * - `INVALID_CREDENTIALS`(2-2): 로그인 실패("이메일 또는 비밀번호 불일치")와 비밀번호
 *   변경 실패("현재 비밀번호 불일치") 두 맥락에서 같은 코드를 쓴다
 *   — 두 화면 다 로컬 문구로 우회하므로 여기 값은 **비밀번호 변경 화면
 *   기준**(`PasswordChangeScreen`이 이 맵을 실제로 타는 유일한 곳)으로 맞췄다. 로그인
 *   화면 문구가 필요하면 `LOGIN_INVALID_CREDENTIALS_ERROR`를 따로 쓸 것 — 여기 안 바꿔도 됨.
 * - `INVALID_VERIFICATION_CODE`/`VERIFICATION_CODE_EXPIRED`(2-1, 스펙 지정): Auth.txt
 *   7번 에러 응답에 화면 문구가 그대로 적혀 있다 — `EmailVerificationScreen`의 로컬
 *   상수(`EMAIL_VERIFICATION_INVALID_CODE_ERROR`/`EMAIL_VERIFICATION_CODE_EXPIRED_ERROR`)와
 *   동일 문구로 맞춰 이 맵과 화면이 항상 같은 말을 하게 했다.
 * - `EMAIL_ALREADY_EXISTS`(2-2): 화면 지정 문구 없음, 서버 message("이미 가입된
 *   이메일") 기준으로 다음 행동(로그인)까지 넣어 다듬었다 — `SocialSignupInfoScreen`의
 *   로컬 상수(`SIGNUP_EMAIL_ALREADY_EXISTS_ERROR`, "이미 가입된 이메일입니다.")와
 *   문장 종결만 다르다(우리 쪽에 다음 행동 안내를 추가함), 크게 벌어지지 않아 그대로 둠.
 * - `PASSWORD_CHANGE_NOT_ALLOWED`(2-1, 스펙 지정): "화면은 이 경우 메뉴 자체를
 *   숨기지만 서버도 막습니다" — 정상 경로로는 도달 못 하는 방어용 코드, 스펙에 지정된
 *   맥락 설명 그대로 문구를 만듦.
 *
 * 2-4. 토큰 갱신 관련 3개는 `apiClient.ts`의 `request()`가 삼킨다 — Access Token 요청이
 * `ACCESS_TOKEN_EXPIRED`/`UNAUTHORIZED`로 실패하면 `refreshSession()`을 먼저 시도하고,
 * 그 안에서 `/auth/refresh`가 `INVALID_TOKEN`/`REFRESH_TOKEN_EXPIRED`/
 * `REFRESH_TOKEN_REVOKED` 중 무엇으로 실패하든 그 에러는 버려지고 **원래 요청의 코드**
 * (`ACCESS_TOKEN_EXPIRED`/`UNAUTHORIZED`)가 다시 던져진다 — 이 세 코드는 구조상 화면까지
 * 못 올라온다. 그래도 매핑은 채운다: 이 문구가 실제로 보이면 그 삼키는 로직 자체가
 * 깨졌다는 신호다. `ACCESS_TOKEN_EXPIRED`는 갱신까지 실패했을 때 원래 요청 코드로
 * 화면까지 올라오는 **진짜 경로**라 `UNAUTHORIZED`와 같은 문구(다시 로그인)로 맞췄다.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: '현재 비밀번호와 일치하지 않아요. 다시 입력해주세요.',
  ACCESS_TOKEN_EXPIRED: '로그인이 만료됐어요. 다시 로그인해주세요.',
  // 아래 세 코드는 2-4 참고 — 정상 동작한다면 이 문구가 뜰 일이 없다.
  INVALID_TOKEN: '로그인이 만료됐어요. 다시 로그인해주세요.',
  REFRESH_TOKEN_EXPIRED: '로그인이 만료됐어요. 다시 로그인해주세요.',
  REFRESH_TOKEN_REVOKED: '로그인이 만료됐어요. 다시 로그인해주세요.',
  INVALID_VERIFICATION_CODE: '인증 코드가 올바르지 않아요. 다시 확인해 주세요.',
  VERIFICATION_CODE_EXPIRED: '인증 시간이 만료되었어요. 다시 시도해 주세요.',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일이에요. 로그인해주세요.',
  PASSWORD_CHANGE_NOT_ALLOWED: '소셜 로그인 계정은 비밀번호를 변경할 수 없어요.',
  // Auth.txt엔 없는 코드(존재하지 않는 이메일로 인증 코드
  // 검증 시도 → 404). `INVALID_VERIFICATION_CODE`(코드는 있는데 틀림)와 달리 이건
  // "발송된 인증 요청 자체가 없음"이라 문구를 분리했다.
  VERIFICATION_NOT_FOUND: '인증 요청을 찾을 수 없어요. 인증 코드를 다시 받아주세요.',
};

/** Group 도메인 고유 에러 코드.
 * `GROUP_NAME_MISMATCH`(2-1, 스펙 지정): Group.txt 5번 "화면은 '모임명이 일치하지
 * 않아요.' 헬프 메시지를 띄웁니다" — `GroupManageScreen`의 로컬 상수
 * (`GROUP_DELETE_NAME_MISMATCH_ERROR`)와 동일 문구. 단, 이 코드의 서버 검증
 * 자체가 Group.txt에 `미구현`으로 명시돼 있어(클라이언트 대조만 동작)
 * 아직 안 뜬다 — 서버가 붙이면 바로 맞는 문구가 나가도록 미리 채워둔다. */
const GROUP_ERROR_MESSAGES: Record<string, string> = {
  GROUP_NOT_FOUND: '모임을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_FILE_PURPOSE: '대표 이미지로 쓸 수 없는 파일이에요.',
  FILE_NOT_FOUND: '이미지 파일을 찾을 수 없어요.',
  FILE_IN_USE: '이미 다른 모임이 쓰고 있는 이미지예요.',
  GROUP_NAME_MISMATCH: '모임명이 일치하지 않아요.',
};

/** GroupMembership 도메인 고유 에러 코드.
 * `INVALID_INVITATION_CODE`/`INVITATION_EXPIRED`/`ALREADY_GROUP_MEMBER`(2-1, 스펙
 * 지정): 시안(`전체모임관리_모임추가_코드로참여하기.png` No.4 [액션])이 "유효하지 않은
 * 코드이거나 이미 가입된 모임일 경우" 실패 사유를 구분하지 않고 하나로 보여주도록
 * 설계돼 있다 — 세 코드 전부 같은 문구를 쓴다(`JoinGroupSheet`의 로컬 상수
 * `JOIN_GROUP_INVALID_CODE_ERROR`와 동일 문구로 맞췄다). */
const GROUP_MEMBERSHIP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_ROLE: '허용되지 않은 권한이에요.',
  MEMBERSHIP_NOT_FOUND: '모임 관리자 정보를 찾을 수 없어요.',
  LAST_OWNER_REQUIRED:
    '마지막 총무는 권한을 내려놓을 수 없어요. 다른 관리자에게 먼저 위임해주세요.',
  INVALID_INVITATION_CODE: '코드가 일치하지 않아요. 다시 입력해주세요.',
  INVITATION_EXPIRED: '코드가 일치하지 않아요. 다시 입력해주세요.',
  ALREADY_GROUP_MEMBER: '코드가 일치하지 않아요. 다시 입력해주세요.',
};

/** Folder 도메인 고유 에러 코드. */
const FOLDER_ERROR_MESSAGES: Record<string, string> = {
  FOLDER_NOT_FOUND: '폴더를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_PARENT_FOLDER:
    '이동할 수 없는 위치예요. 자기 자신이나 하위 폴더로는 옮길 수 없어요.',
};

/** Ledger 도메인 고유 에러 코드. */
const LEDGER_ERROR_MESSAGES: Record<string, string> = {
  LEDGER_NOT_FOUND: '장부를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  INVALID_BUDGET: '예산은 0원 이상 999,999,999원 이하로 입력해주세요.',
  GROUP_MISMATCH: '다른 모임의 폴더로는 옮길 수 없어요.',
};

/** User 도메인 고유 에러 코드(`GET/PATCH/DELETE /auth/me`). */
const USER_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: '사용자 정보를 찾을 수 없어요.',
  OWNER_TRANSFER_REQUIRED: '권한을 위임할 멤버를 모두 선택해주세요.',
};

/** Member 도메인 고유 에러 코드(회비 생성 대상자 검증 등). */
const MEMBER_ERROR_MESSAGES: Record<string, string> = {
  MEMBER_NOT_FOUND: '모임원을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
};

/** Dues 도메인 고유 에러 코드.
 * `INVALID_PAYMENT_STATUS`(2-2, 자체 작성): Dues.txt 7번 "허용되지 않은 상태값" —
 * 정상 UI로는 유발하기 어려운 코드라(토글 값 자체가 서버가 정의한 enum 밖으로 나갈
 * 방법이 없음) 방어용으로만 채운다.
 * **`UNPAID_MEMBER_EXISTS`는 안 채운다**: Dues.txt 8번(회비 마감)
 * 정책 메모가 "미납자가 남아 있어도 마감합니다 ...
 * 기존 UNPAID_MEMBER_EXISTS(409) 제약은 **제거**합니다"라고 명시한다 — 이 코드는
 * 폐기 예정으로 문서화된 것이지 현재 유효한 에러가 아니라 (a) 목록에서 뺐다. */
const DUES_ERROR_MESSAGES: Record<string, string> = {
  DUES_NOT_FOUND: '회비를 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  DUES_ALREADY_CLOSED: '이미 마감된 회비예요.',
  DUES_AMOUNT_IMMUTABLE: '금액은 수정할 수 없어요.',
  DUES_NOT_STARTED: '아직 시작하지 않은 회비예요.',
  INVALID_PAYMENT_STATUS: '납부 상태를 변경할 수 없어요. 다시 시도해주세요.',
};

/** Entry(내역) 도메인 고유 에러 코드(`Entry (내역).txt`). 화면 지정 문구 없음(2-2, 자체 작성), 서버 message 기준으로 다듬음. */
const ENTRY_ERROR_MESSAGES: Record<string, string> = {
  ENTRY_NOT_FOUND: '내역을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  ENTRY_ALREADY_APPROVED: '이미 승인된 내역이에요. 새로고침 후 다시 확인해주세요.',
};

/** File(파일) 도메인 고유 에러 코드(`File (파일).txt` 1·2번) — 이미지 업로드·증빙 경로. 화면 지정 문구 없음(2-2, 자체 작성) —
 * "무엇이 잘못됐는지 + 뭘 하면 되는지" 원칙에 맞춰 용량(10MB)·형식(jpeg/png/webp)
 * 등 File.txt 정책 메모의 구체값을 그대로 문구에 반영했다. */
const FILE_ERROR_MESSAGES: Record<string, string> = {
  INVALID_FILE: '파일을 열 수 없어요. 다른 파일을 선택해주세요.',
  UNSUPPORTED_FILE_TYPE: '지원하지 않는 파일 형식이에요. JPG·PNG 이미지를 사용해주세요.',
  FILE_SIZE_EXCEEDED: '파일 용량이 너무 커요. 10MB 이하 파일을 사용해주세요.',
  FILE_UPLOAD_FAILED: '파일 업로드에 실패했어요. 잠시 후 다시 시도해주세요.',
  FILE_DELETE_FAILED: '파일 삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
};

/** OCR(영수증 인식) 도메인 고유 에러 코드(`OCR (영수증 인식).txt`).
 * 어느 화면도 `ocrService`를 아직 안 쓴다(기능 자체 미착수). 화면 지정 문구 없음
 * (2-2, 자체 작성), 나중에 실제로 붙을 때 재검토할 것. */
const OCR_ERROR_MESSAGES: Record<string, string> = {
  INVALID_OCR_FILE: '영수증으로 인식할 수 없는 이미지예요. 다른 사진을 선택해주세요.',
  OCR_RESULT_EMPTY: '영수증에서 내용을 읽지 못했어요. 다른 사진으로 다시 시도해주세요.',
  OCR_PROCESSING_FAILED: '영수증 인식에 실패했어요. 잠시 후 다시 시도해주세요.',
};

/** Archive(보관함) 도메인 고유 에러 코드(Folder.txt 5·8번). `ARCHIVE_EMPTY`는 실제 코드이고
 * 나머지 둘은 명세 추정값이다.
 *
 * `ARCHIVE_EMPTY` 조건은 **"모임 전체에 내역이 1건도 없으면"**이다 — 장부가 여러 개 있어도
 * 내역이 하나도 없으면 `ARCHIVE_EMPTY`가 나고, 내역이 1건이라도 있으면 성공하며 이때
 * **내역이 없는 빈 장부까지 전부 함께 보관된다**. 그래서 문구도 "장부만 있어도 될
 * 것처럼" 읽히지 않게 조건에 맞춰 썼다. 디자인 시안(`FDR\폴더\백업\FDR-2-MODAL-02-0/-1.png`)엔
 * 확인 다이얼로그 2장과 완료 스낵바만 있고 이 에러 상태의 지정 문구는 없어 자체 작성. */
const ARCHIVE_ERROR_MESSAGES: Record<string, string> = {
  ARCHIVE_NOT_FOUND: '보관 기록을 찾을 수 없어요. 이미 삭제됐을 수 있어요.',
  ARCHIVE_IN_PROGRESS: '이미 백업 작업이 진행 중이에요. 잠시 후 다시 시도해주세요.',
  ARCHIVE_EMPTY: '아직 등록된 내역이 없어요. 내역을 추가한 뒤 다시 시도해주세요.',
};

/** Report 도메인 고유 에러 코드(`Report (보고서).txt` 2번 에러 응답).
 * `REPORT_RANGE_EMPTY`는 선택한 장부/기간에 담을 내역이 0건일 때 나며, 매핑이 없으면
 * 기본 fallback 문구로 덮여 사용자가 실제 원인(빈 장부 선택)을 알 수 없다. */
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

/** ApiError.code를 화면에 띄울 한글 문구로 바꾼다. 매핑에 없으면 기본 문구. */
export function getApiErrorMessage(code: string): string {
  return API_ERROR_MESSAGES[code] ?? API_ERROR_DEFAULT_MESSAGE;
}

/** fetch 실패(네트워크 끊김 등)로 서버 응답 자체를 못 받은 경우인지 판별한다. */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}
