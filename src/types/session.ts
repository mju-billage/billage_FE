/**
 * 현재 로그인한 사용자 식별자 캐시. 세션 동안 메모리에만 유지한다(앱 재시작 시
 * `authService.restoreSession()`이 다시 채운다).
 *
 * `GroupMembership.isMe`(멤버가 나 자신인지) 계산에 필요해 2단계(GroupMembership)에서
 * 도입했다 — `authService.login()`/`restoreSession()`이 채우고 `logout()`이 비운다.
 * 화면에서 직접 API를 다시 호출하지 않도록 group.ts의 활성 모임 캐시와 같은 패턴을 쓴다.
 */
export type CurrentUser = {
  userId: string;
  name: string;
  email: string;
};

let currentUser: CurrentUser | null = null;

export function setCurrentUser(user: CurrentUser): void {
  currentUser = user;
}

export function getCurrentUser(): CurrentUser | null {
  return currentUser;
}

export function clearCurrentUser(): void {
  currentUser = null;
}
