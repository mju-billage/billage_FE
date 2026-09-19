/** DashboardScreen 전용 문구. */
export const DASHBOARD_DUES_SECTION_TITLE = '이만큼 회비를 모았어요';
export const DASHBOARD_QUICK_SERVICE_SUBTITLE_SUFFIX = '총무님을 위한';
export const DASHBOARD_QUICK_SERVICE_TITLE = '간편 서비스를 이용해보세요';
export const DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL = '알림';

/** 로딩/에러 문구 — 디자인 시안 자체가 '예정'(CLAUDE.md) 상태라 최소 형태로 통일. */
export const DASHBOARD_LOADING = '모임 현황을 불러오는 중이에요.';
export const DASHBOARD_RETRY_LABEL = '다시 시도';

/** 2026-09-11 정정 — `GET /dashboard`가 실제로는 `upcomingDues[]`(마감 임박 3건, 건별
 * D-day/납부인원)를 준다(이전 메모는 활성 회비 합계 한 줄만 온다고 잘못 적어뒀었다).
 * 캐러셀이 비었을 때만 이 문구를 쓴다. */
export const DASHBOARD_DUES_EMPTY = '진행 중인 회비가 없어요.';
/** 회비 현황 카드(대시보드_메인화면.png UI 요소 3번) — "전체 회비가 모이기까지" +
 * "{N}명 남았어요". */
export const DASHBOARD_DUES_CARD_DESCRIPTION = '전체 회비가 모이기까지';
export const DASHBOARD_DUES_CARD_REMAINING_SUFFIX = '명 남았어요';
