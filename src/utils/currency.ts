export function formatWon(amount: number): string {
  return `${amount.toLocaleString()}`;
}

export function formatExpense(amount: number): string {
  return `${amount > 0 ? '-' : ''}${formatWon(amount)}원`;
}

export function capDigits(
  digitsOnly: string,
  maxDigits: number,
): { value: string; overflow: boolean } {
  if (digitsOnly.length > maxDigits) {
    return { value: digitsOnly.slice(0, maxDigits), overflow: true };
  }
  return { value: digitsOnly, overflow: false };
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
