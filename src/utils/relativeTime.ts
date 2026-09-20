/** ISO 날짜문자열을 "방금 전"/"N분 전"/"N시간 전"/"N일 전"/날짜(N월 N일)로 바꾼다.
 * 서버는 `createdAt`만 내려주고 경과 시간 표기는 클라이언트가 만든다(명세 정책). */
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
