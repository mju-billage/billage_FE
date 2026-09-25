export type LoginProvider = 'EMAIL' | 'KAKAO' | 'NAVER' | 'GOOGLE';

export type CurrentUser = {
  userId: string;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  loginProvider?: LoginProvider;
  createdAt?: string;
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
