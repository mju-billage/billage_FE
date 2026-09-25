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

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return request<NotificationSettings>('/api/v1/notifications/settings', {
    method: 'GET',
  });
}

export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  return request<NotificationSettings>('/api/v1/notifications/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

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

export async function getTermsText(termType: TermType): Promise<string> {
  const response = await request<TermResponse>(`/api/v1/terms/${termType}`, {
    method: 'GET',
  });
  return response.body;
}

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

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await request<NotificationListResponse>(
    '/api/v1/notifications',
    { method: 'GET' },
  );
  return response.content.map(toNotificationItem);
}

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

export async function submitInquiry(payload: SubmitInquiryRequest): Promise<void> {
  await request<void>('/api/v1/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
