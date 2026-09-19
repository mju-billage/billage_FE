/**
 * 내역(Entry) 타입. 목록/상세 응답 shape가 달라(목록엔 `receiptCount`만, 상세엔
 * `receiptFiles`/`createdBy`/`approvedBy` 객체) 타입을 분리했다(services/entryService.ts).
 *
 * ⚠️ 이 파일엔 캐시가 없다 — 다른 도메인(`types/ledger.ts` 등)과 달리 목록이
 * page/size/keyword/type/status로 매번 달라지는 페이지네이션 목록이라 "그 모임의
 * 목록 하나"로 캐시할 수 없다. 화면이 자기 조회 조건에 맞는 페이지 배열을 직접
 *들고 있고, `entryService`는 매번 서버를 그대로 불러 반환만 한다.
 *
 * `EntryListFilterValue`/`getEntryListFilterDateRange()`는 4-B 정리 때
 * `types/transaction.ts`(4-B로 통째 걷어냄)에서 옮겨왔다 — DTB 화면들이 쓰는
 * "필터 UI 상태 → API 쿼리" 변환은 mock이 아니라 Entry 도메인 로직이라 여기가
 * 맞는 자리다.
 */
import { todayKey } from '../utils/calendarGrid';

export type EntryType = 'INCOME' | 'EXPENSE';
export type EntryApprovalStatus = 'PENDING' | 'APPROVED';

export type EntrySummary = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: EntryType;
  title: string;
  amount: number;
  /** 'YYYY-MM-DD'. */
  occurredOn: string;
  approvalStatus: EntryApprovalStatus;
  createdByUserId: string;
  createdByName: string;
  receiptCount: number;
  /** 마감된 회비에서 생성된 수입 내역이면 그 회비 id, 아니면 null(Entry.txt §7). */
  duesId: string | null;
};

/** 모임 전체 내역 목록(§7)의 잔액 요약 — 현재 필터 조건을 그대로 따른 승인 완료분 집계. */
export type EntryGroupSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

/** `occurredOn`('YYYY-MM-DD') 기준으로 묶는다. 서버가 이미 그 정렬로 내려주므로
 * (occurredOn,desc 기본) 그룹 내부를 다시 정렬하지 않고 순서를 그대로 유지한다. */
export function groupEntriesByDate(
  list: EntrySummary[],
): { date: string; items: EntrySummary[] }[] {
  const groups: { date: string; items: EntrySummary[] }[] = [];
  for (const entry of list) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === entry.occurredOn) {
      lastGroup.items.push(entry);
    } else {
      groups.push({ date: entry.occurredOn, items: [entry] });
    }
  }
  return groups;
}

export type EntryListFilterValue = {
  period: '1month' | '3month' | '6month' | 'custom';
  customStart?: string;
  customEnd?: string;
  ledgerIds: string[];
  type: 'all' | 'income' | 'expense';
  sort: 'latest' | 'oldest';
};

export const DEFAULT_ENTRY_LIST_FILTER: EntryListFilterValue = {
  period: '1month',
  ledgerIds: [],
  type: 'all',
  sort: 'latest',
};

/** 'YYYY.MM.DD' → 'YYYY-MM-DD'(Entry API 형식). */
function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

function isoMonthsAgo(months: number): string {
  const now = new Date();
  now.setMonth(now.getMonth() - months);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const FILTER_PERIOD_MONTHS = { '1month': 1, '3month': 3, '6month': 6 } as const;

/**
 * 필터 값을 `entryService.getGroupEntries()`의 `from`/`to` 쿼리로 환산한다 —
 * 1/3/6개월 프리셋은 "오늘부터 N개월 전"으로, 커스텀 기간은 그대로(점 표기만
 * ISO로) 변환한다(Entry.txt §7 "1/3/6개월 프리셋은 클라이언트가 날짜로 환산").
 */
export function getEntryListFilterDateRange(
  filter: EntryListFilterValue,
): { from?: string; to?: string } {
  if (filter.period === 'custom') {
    return filter.customStart && filter.customEnd
      ? { from: toIsoDate(filter.customStart), to: toIsoDate(filter.customEnd) }
      : {};
  }
  return {
    from: isoMonthsAgo(FILTER_PERIOD_MONTHS[filter.period]),
    to: toIsoDate(todayKey()),
  };
}

export type EntryReceiptFile = {
  id: string;
  url: string;
  name?: string;
};

export type EntryDetail = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: EntryApprovalStatus;
  createdBy: { userId: string; name: string };
  /** 담당자(`GroupMembership`, User 기준 — 납부 명단 Member와 다름). 안 보내고
   * 등록해도 서버가 등록자 본인으로 채워 항상 값이 있다(Entry.txt §3). */
  manager: { userId: string; name: string };
  approvedBy: { userId: string; name: string } | null;
  approvedAt: string | null;
  receiptFiles: EntryReceiptFile[];
  /**
   * 마감된 회비에서 생성된 수입 내역이면 채워진다(Entry.txt §8). 2026-09-11
   * Swagger 대조로 `GET /entries/{entryId}` 응답에 실제로 있는 걸 확인해
   * 타입에 추가했다 — `TransactionDetailScreen.tsx`는 아직 이 필드들을 안 써서
   * "상세 내역_납부관리_수입내역"(일반 내역과 다르게 납부자 명수·명단, "회비
   * 상세보기" 버튼을 보여줘야 함) 변형이 지금 일반 내역과 똑같이 뜬다 —
   * `design-verification.md`의 `DTB-2-PAGE-02-0` 행 참고, 화면 쪽 반영은 별도 작업.
   */
  duesId: string | null;
  duesTitle: string | null;
  duesExists: boolean;
  payerCount: number;
  payers: { memberId: string; name: string; amount: number }[];
};
