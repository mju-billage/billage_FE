export function formatRelativeTime(isoDateTime: string, now: Date = new Date()): string {
  const created = new Date(isoDateTime);
  const diffMs = now.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffMinutes < 1) {
    return '방금 전';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }
  return `${created.getMonth() + 1}월 ${created.getDate()}일`;
}
