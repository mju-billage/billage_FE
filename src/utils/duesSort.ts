import type { DuesSummary } from '../types/dues';

/**
 * 명세(DUE-1-PAGE-01-0 No.4) 리스트 정렬 순서를 그대로 구현한다: 납부 예정(시작일
 * 빠른순) → 납부 진행 중(마감 임박한 순) → 납부 마감. "예정"은 서버 상태가 아니라
 * `status === 'OPEN' && paidCount === 0`(아직 아무도 안 낸, 막 만들어진 회비)으로
 * 클라이언트가 판단한다 — "시작일"필드가 없어(docs/api-gaps.md) 정렬 키는 마감일로
 * 대체한다.
 */
export function sortDuesForList(list: DuesSummary[]): DuesSummary[] {
  const groupOrder = (dues: DuesSummary): number => {
    if (dues.status === 'CLOSED') {
      return 2;
    }
    return dues.paidCount === 0 ? 0 : 1;
  };
  return [...list].sort((a, b) => {
    const groupDiff = groupOrder(a) - groupOrder(b);
    if (groupDiff !== 0) {
      return groupDiff;
    }
    return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
  });
}

/** 목록 화면(DUE-1) 카드가 "예정" 상태인지 — 진행 중이지만 납부자가 아직 0명. */
export function isUpcomingDues(dues: DuesSummary): boolean {
  return dues.status === 'OPEN' && dues.paidCount === 0;
}
