/** LoginScreen 전용 문구. */
export const LOGIN_EMAIL_PLACEHOLDER = '이메일';
export const LOGIN_PASSWORD_PLACEHOLDER = '비밀번호';
export const LOGIN_SUBMIT_LABEL = '로그인하기';
export const LOGIN_FIND_PASSWORD_LABEL = '비밀번호를 잊으셨나요?';
export const LOGIN_GO_TO_SIGNUP_LABEL = '회원가입하기';
export const LOGIN_INVALID_CREDENTIALS_ERROR =
  '이메일 또는 비밀번호가 올바르지 않습니다.';
export const LOGIN_GENERIC_ERROR =
  '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
/** 2026-09-12: 통짜 "소셜 로그인 중 문제가 발생했습니다."를 실패 단계별로 나눴다
 * — SDK(카카오/네이버/구글 자체) 실패는 이 문구, 나머지는 아래 3개로 구분한다. */
export const LOGIN_SOCIAL_SDK_ERROR = '소셜 로그인 중 문제가 발생했습니다.';
export const LOGIN_SOCIAL_NETWORK_ERROR =
  '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
export const LOGIN_SOCIAL_PARSE_ERROR =
  '로그인 응답을 처리하지 못했습니다. 다시 시도해주세요.';
export const LOGIN_MOCK_BUTTON_LABEL = '목 계정으로 로그인 (개발용)';
