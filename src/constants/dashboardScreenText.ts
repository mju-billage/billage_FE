/** DashboardScreen 전용 문구. */
export const DASHBOARD_DUES_SECTION_TITLE = '이만큼 회비를 모았어요';
export const DASHBOARD_QUICK_SERVICE_SUBTITLE_SUFFIX = '총무님을 위한';
export const DASHBOARD_QUICK_SERVICE_TITLE = '간편 서비스를 이용해보세요';
export const DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL = '알림';

/** 로딩/에러 문구 — 디자인 시안 자체가 '예정'(CLAUDE.md) 상태라 최소 형태로 통일. */
export const DASHBOARD_LOADING = '모임 현황을 불러오는 중이에요.';
export const DASHBOARD_RETRY_LABEL = '다시 시도';

/** 회비(Dues) 도메인 구현 전까지 activeDuesCount는 항상 0 — 그때는 이 문구로 대체한다
 * (기존 회비 카드 캐러셀 대신). Dashboard API는 회비 건별 상세(D-day 등)가 아니라
 * 합계만 주므로, 활성 회비가 생겨도 건별 카드가 아니라 합계 한 줄로만 보여준다. */
export const DASHBOARD_DUES_EMPTY = '진행 중인 회비가 없어요.';
export const DASHBOARD_DUES_SUMMARY_PREFIX = '회비 ';
export const DASHBOARD_DUES_SUMMARY_MIDDLE = '건 진행 중 · ';
export const DASHBOARD_DUES_SUMMARY_SUFFIX = '명 납부완료';

export const DASHBOARD_SUMMARY_SECTION_TITLE = '모임 현황';
export const DASHBOARD_LEDGER_COUNT_SUFFIX = '개 장부';
export const DASHBOARD_PENDING_APPROVAL_PREFIX = '승인 대기 ';
export const DASHBOARD_PENDING_APPROVAL_SUFFIX = '건';

export const DASHBOARD_RECENT_ENTRIES_TITLE = '최근 내역';
export const DASHBOARD_RECENT_ENTRIES_EMPTY = '최근 등록된 내역이 없어요.';
