// 이메일 가입(SignupInfoScreen)과 소셜 가입(SocialSignupInfoScreen)이 공유하는 문구
export const SIGNUP_INFO_TITLE = '가입 정보 입력';
export const SIGNUP_NAME_LABEL = '이름';
export const SIGNUP_NAME_PLACEHOLDER = '이름을 입력해주세요.';
export const SIGNUP_NAME_HELPER = '* 최대 8자 이내로 입력할 수 있어요.';
export const SIGNUP_EMAIL_LABEL = '이메일';
export const SIGNUP_EMAIL_PLACEHOLDER = '이메일을 입력해주세요.';
export const SIGNUP_EMAIL_FORMAT_ERROR = '올바른 이메일 형식을 입력해주세요.';
export const SIGNUP_EMAIL_ALREADY_EXISTS_ERROR = '이미 가입된 이메일입니다.';

// SignupInfoScreen 전용 (비밀번호 필드)
export const SIGNUP_PASSWORD_LABEL = '비밀번호';
export const SIGNUP_PASSWORD_PLACEHOLDER = '비밀번호를 입력해주세요.';
export const SIGNUP_PASSWORD_HELPER =
  '* 영문 대소문자, 숫자, 특수문자 포함 8자 이상';
export const SIGNUP_PASSWORD_CONFIRM_LABEL = '비밀번호 확인';
export const SIGNUP_PASSWORD_MISMATCH_ERROR = '비밀번호가 동일하지 않습니다.';
export const SIGNUP_GENERIC_ERROR =
  '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';

// SocialSignupInfoScreen 전용
export const SOCIAL_SIGNUP_GENERIC_ERROR =
  '가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
// 시안 목업(`SNS 간편 회원가입_가입 정보 입력.png`)의 CTA 라벨은 `다음으로`(설명표 No.5는 `다음`) — 목업을 따른다.
export const SOCIAL_SIGNUP_SUBMIT_LABEL = '다음으로';
/** 소셜 가입 이름 최대 글자 수(설명표 COM-3-PAGE-02-0 No.3 — 일반 가입의 10자와 다르다). */
export const SOCIAL_SIGNUP_NAME_MAX_LENGTH = 8;
/** 8자 초과 입력 시 이름 필드 하단 에러 문구(입력 라인은 레드). */
export const SOCIAL_SIGNUP_NAME_TOO_LONG_ERROR = '최대 8자 이내로 입력할 수 있어요.';
