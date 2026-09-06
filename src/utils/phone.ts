/** 숫자만 남은 전화번호(01012345678)를 010-1234-5678 형태의 표기로 바꾼다.
 * 9~11자리가 아니면 하이픈 없이 숫자만 그대로 보여준다(Member.txt §필드). */
export function formatPhoneNumber(raw: string | null | undefined): string {
  if (!raw) {
    return '';
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

/** 전화번호 입력값이 서버 검증(숫자·하이픈·공백만, 숫자 9~11자리)을 통과하는지 앞단에서 미리 확인한다. */
export function isValidPhoneNumber(raw: string): boolean {
  if (!/^[0-9\-\s]+$/.test(raw)) {
    return false;
  }
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 11;
}
