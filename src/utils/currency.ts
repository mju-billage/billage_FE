/** 금액을 천단위 콤마 + '원' 접미사로 포맷한다. 부호는 숫자 자체의 표현을 따른다. */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString()}`;
}
