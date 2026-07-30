export type NotificationItem = {
  id: string;
  title: string;
  /** 여러 줄인 경우 \n으로 구분되고, [이름]처럼 대괄호로 감싼 부분은 강조 표시한다. */
  description: string;
  relativeTimeLabel: string;
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'approval-request',
    title: '승인 요청이 도착했어요',
    description:
      '[김민주]님이 내역 상세 정보를 등록했어요.\n내용을 확인하고 승인해주세요.',
    relativeTimeLabel: '방금 전',
  },
  {
    id: 'revision-needed',
    title: '수정이 필요한 내역이 있어요',
    description: '관리자가 제출된 내역에 대해 보완을 요청했어요.',
    relativeTimeLabel: '1일 전',
  },
  {
    id: 'new-member',
    title: '새로운 멤버가 있어요',
    description: '[김민주]님이 모임에 참여했어요.\n프로필을 확인해보세요.',
    relativeTimeLabel: '1일 전',
  },
  {
    id: 'feature-update',
    title: '더 편해진 빌리지를 만나보세요!',
    description: '통계 리포트 자동 생성 기능이 업데이트되었어요.',
    relativeTimeLabel: '1일 전',
  },
  {
    id: 'dues-deadline',
    title: '회비 마감이 코앞이에요!',
    description: '아직 미납부한 회원들이 있어요.\n납부 요청을 보내보세요.',
    relativeTimeLabel: '5월 22일',
  },
];
