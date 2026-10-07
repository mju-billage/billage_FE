export function parseMemberNames(text: string): string[] {
  return text
    .split(/[,\s]+/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
}
