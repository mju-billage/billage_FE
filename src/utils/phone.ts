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

export function isValidPhoneNumber(raw: string): boolean {
  if (!/^[0-9\-\s]+$/.test(raw)) {
    return false;
  }
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 11;
}
