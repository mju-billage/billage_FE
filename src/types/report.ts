export type ReportType = 'BY_LEDGER' | 'BY_PERIOD';

/**
 * "구분" 필터값. 명세엔 `ALL | INCOME | EXPENSE`라 적혀 있지만 2026-09-05
 * 실호출로 확인한 결과 `entryType: "ALL"`을 그대로 보내면 `400`(빈
 * `fieldErrors`라 원인이 응답에 안 드러남)이 난다 — "전체"는 이 필드 자체를
 * 생략해야 한다(services/reportService.ts 참고). 그래서 타입에 `ALL`을 아예
 * 넣지 않았다 — 호출자가 "전체"를 표현하고 싶으면 `entryType`을 `undefined`로
 * 둔다.
 */
export type ReportEntryType = 'INCOME' | 'EXPENSE';

export type ReportSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entryCount: number;
  /** 기간별(BY_PERIOD) 보고서만 값이 있다. 장부별은 null. */
  openingBalance: number | null;
  closingBalance: number | null;
};

export type ReportLedgerBreakdown = {
  ledgerId: string;
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

/** 보고서 생성 성공 응답 — 상세 조회 화면(다음 단계)에서도 같은 모양을 쓸 것으로 보인다. */
export type Report = {
  reportId: string;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: ReportSummary;
  ledgers: ReportLedgerBreakdown[];
  createdAt: string;
};

/**
 * 보고서 상세(`GET /reports/{reportId}`) 안의 내역 한 건 — **스냅샷이다**.
 * 원본 Entry가 나중에 수정·삭제돼도 이 값은 안 바뀐다(Report.txt 정책 메모:
 * "원본 장부·내역이 수정되거나 삭제되어도 응답의 스냅샷 데이터는 변경되지
 * 않습니다"). 그래서 `entryId`가 없다 — 2026-09-05 실호출로 확인, 명세
 * 예시에도 처음부터 없었다. **`services/entryService.ts`의 `EntrySummary`와
 * 절대 섞지 마라** — 이쪽엔 `id`/`ledgerId`/`receiptCount`/`memo`/`manager`가
 * 전부 없다. `ReportEntryDetailScreen`(ETC-5-PAGE-02-0)이
 * `TransactionDetailScreen`을 재사용하지 않고 새로 만들어진 이유이기도 하다.
 */
export type ReportEntrySnapshot = {
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  /** 'YYYY-MM-DD'. */
  occurredOn: string;
};

/** 보고서 상세 안의 장부 하나 — 이것도 `ledgerId`가 없다(스냅샷, 위 주석 참고). */
export type ReportLedgerDetail = {
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entries: ReportEntrySnapshot[];
};

/** 보고서 상세 전체(`GET /reports/{reportId}`). 생성 응답(`Report`)과 달리
 * `ledgers[].entries`가 함께 온다 — 별도 내역 조회 엔드포인트도, 페이지네이션도
 * 없다(실호출로 확인, 한 번에 전부 옴). */
export type ReportDetail = {
  reportId: string;
  groupId: string;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: ReportSummary;
  ledgers: ReportLedgerDetail[];
  createdAt: string;
};

/** 보고서 목록(`GET /groups/{groupId}/reports`) 항목 — 상세보다 필드가 적다. */
export type ReportSummaryItem = {
  reportId: string;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  ledgerCount: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  createdAt: string;
};
