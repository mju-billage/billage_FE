export function truncateWithEllipsis(text: string, max = 10): string {
  const chars = Array.from(text);
  if (chars.length <= max) {
    return text;
  }
  return `${chars.slice(0, max).join('')}...`;
}
