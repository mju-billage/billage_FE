/**
 * 서버 미구현. 명세 `Notification & Support (알림·고객지원).txt` 기준 작성.
 * A(알림 설정) + B(공지사항/약관/FAQ/문의) 전부 서버 API 자체가 없다 — 화면은 이 함수를
 * 실제로 호출하고, 서버가 없으니 에러 상태가 뜨는 게 정상이다.
 */
import { request } from './apiClient';

export type NotificationSettings = {
  groupActivity: boolean;
  approval: boolean;
  dues: boolean;
  noticeAndUpdate: boolean;
  marketing: boolean;
  nightTime: boolean;
};

export type NoticeSummary = {
  id: string;
  title: string;
  createdAt: string;
};

export type NoticeDetail = NoticeSummary & {
  body: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

/** 설정 > 약관 목록에 노출되는 3종(마케팅 제외). */
export type TermType = 'SERVICE' | 'PRIVACY' | 'AUTO_RECORD';

type NoticeListItemResponse = {
  noticeId: number;
  title: string;
  createdAt: string;
};

type NoticeDetailResponse = NoticeListItemResponse & {
  body: string;
};

type FaqResponse = {
  faqId: number;
  question: string;
  answer: string;
};

type TermResponse = {
  termType: TermType;
  body: string;
};

/** 알림 설정(토글 6종)을 조회한다. */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  return request<NotificationSettings>('/api/v1/notifications/settings', {
    method: 'GET',
  });
}

/**
 * 알림 설정 일부를 변경한다. 토글 하나를 누를 때마다 그 필드만 보내 즉시 저장한다
 * (명세: "별도 저장 버튼 없음").
 */
export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  return request<NotificationSettings>('/api/v1/notifications/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

/** 공지사항 목록을 최신순으로 조회한다. */
export async function getNotices(): Promise<NoticeSummary[]> {
  const response = await request<NoticeListItemResponse[]>(
    '/api/v1/notices',
    { method: 'GET' },
  );
  return response.map(item => ({
    id: String(item.noticeId),
    title: item.title,
    createdAt: item.createdAt,
  }));
}

/** 공지사항 상세(본문 포함)를 조회한다. */
export async function getNoticeDetail(noticeId: string): Promise<NoticeDetail> {
  const response = await request<NoticeDetailResponse>(
    `/api/v1/notices/${noticeId}`,
    { method: 'GET' },
  );
  return {
    id: String(response.noticeId),
    title: response.title,
    createdAt: response.createdAt,
    body: response.body,
  };
}

/** 약관/정책 전문을 조회한다. */
export async function getTermsText(termType: TermType): Promise<string> {
  const response = await request<TermResponse>(`/api/v1/terms/${termType}`, {
    method: 'GET',
  });
  return response.body;
}

/** 문의하기 화면의 FAQ 아코디언 목록을 조회한다. */
export async function getFaqs(): Promise<Faq[]> {
  const response = await request<FaqResponse[]>('/api/v1/faqs', {
    method: 'GET',
  });
  return response.map(item => ({
    id: String(item.faqId),
    question: item.question,
    answer: item.answer,
  }));
}

export type NotificationCategory =
  | 'GROUP_ACTIVITY'
  | 'APPROVAL'
  | 'DUES'
  | 'NOTICE'
  | 'MARKETING';
export type NotificationTargetType = 'ENTRY' | 'DUES' | 'GROUP' | 'NOTICE';

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  groupId: string;
  targetType: NotificationTargetType;
  targetId: string;
  readAt: string | null;
  createdAt: string;
};

type NotificationResponse = {
  notificationId: number;
  category: NotificationCategory;
  title: string;
  body: string;
  groupId: number;
  targetType: NotificationTargetType;
  targetId: number;
  readAt: string | null;
  createdAt: string;
};

type NotificationListResponse = {
  content: NotificationResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

function toNotificationItem(response: NotificationResponse): NotificationItem {
  return {
    id: String(response.notificationId),
    category: response.category,
    title: response.title,
    body: response.body,
    groupId: String(response.groupId),
    targetType: response.targetType,
    targetId: String(response.targetId),
    readAt: response.readAt,
    createdAt: response.createdAt,
  };
}

/**
 * 알림 목록을 최신순으로 조회한다(Notification.txt 1번). 수신 거부한 카테고리는
 * 서버가 생성 시점에 걸러내므로 클라이언트에서 다시 필터링하지 않는다.
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await request<NotificationListResponse>(
    '/api/v1/notifications',
    { method: 'GET' },
  );
  return response.content.map(toNotificationItem);
}

/** 알림 하나를 읽음 처리한다(Notification.txt 2번). */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await request<void>(`/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export type SubmitInquiryRequest = {
  email: string;
  title: string;
  content: string;
};

/**
 * 문의를 접수한다. 현재 시안(디자인 '진행' 중)엔 입력 폼이 없어 이 화면 배치에선
 * 호출하는 곳이 없지만, 명세에 있는 API라 그대로 옮겨 둔다(§ 배치 규칙 — 향후 폼이
 * 추가되면 이 함수를 그대로 쓰면 된다).
 */
export async function submitInquiry(payload: SubmitInquiryRequest): Promise<void> {
  await request<void>('/api/v1/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
