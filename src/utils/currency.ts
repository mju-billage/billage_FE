/** 금액을 천단위 콤마로 포맷한다. '원' 접미사는 붙이지 않으니 호출부에서 붙인다. 부호는 숫자 자체의 표현을 따른다. */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString()}`;
}

/** 지출 금액을 '원' 단위로 표기한다. 0이면 부호 없이, 양수면 '-'를 접두한다(`-0` 방지). */
export function formatExpense(amount: number): string {
  return `${amount > 0 ? '-' : ''}${formatWon(amount)}원`;
}
