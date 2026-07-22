const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/** 이메일 형식이 올바른지 검사한다. */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

/** 영문 대소문자, 숫자, 특수문자를 포함한 8자 이상 비밀번호인지 검사한다. */
export function isValidPassword(value: string): boolean {
  return PASSWORD_PATTERN.test(value);
}
