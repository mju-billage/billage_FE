export function formatWon(amount: number): string {
  return `${amount.toLocaleString()}`;
}

export function formatExpense(amount: number): string {
  return `${amount > 0 ? '-' : ''}${formatWon(amount)}원`;
}

export function truncateDigits(text: string, maxDigits: number): string {
  let digitCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i])) {
      digitCount++;
      if (digitCount > maxDigits) {
        return text.slice(0, i) + '...';
      }
    }
  }
  return text;
}
