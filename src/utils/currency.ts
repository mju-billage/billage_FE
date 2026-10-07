export function formatWon(amount: number): string {
  return `${amount.toLocaleString()}`;
}

export function formatExpense(amount: number): string {
  return `${amount > 0 ? '-' : ''}${formatWon(amount)}원`;
}
