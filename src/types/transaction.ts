/**
 * ⚠️ 목(mock) 데이터 — 4-A(Entry API 연동) 이후에도 일부러 남겨뒀다. "모임 전체
 * 내역 목록" API가 없어(docs/api-gaps.md (A)) `TransactionsScreen`/
 * `TransactionSearchScreen`/`TransactionFilterSheet`/`TransactionLedgerMultiSelectSheet`
 * (전부 모임 전체 목록에 딸린 화면)는 여전히 이 목 배열을 그대로 쓴다 — 4-B(그
 * API가 생긴 뒤)에 옮긴다. `TransactionDetailScreen`/`TransactionRegisterScreen`은
 * 이 목(`dtb-tx-N` id)과 실 Entry(숫자 id)를 id 모양으로 구분해 같이 처리한다.
 *
 * 새로 만드는 내역은 이제 전부 실 API로 간다 — `addTransaction()`/
 * `generateTransactionId()`는 그래서 지웠다(더 이상 호출하는 곳이 없다).
 * `updateTransaction()`은 남아 있다 — `TransactionRegisterScreen`의 `editMock`
 * 경로(dtb-tx-N 수정)가 이제 이걸 실제로 부른다(전엔 호출부가 없어 죽은 코드였다).
 */
export type Transaction = {
  id: string;
  /** 'YYYY.MM.DD' 형식. */
  date: string;
  ledgerId: string;
  ledgerName: string;
  itemName: string;
  /** 지출은 음수, 수입은 양수. */
  amount: number;
  manager: string;
  memo: string;
  hasReceipt: boolean;
  receiptImages: string[];
  isPendingApproval: boolean;
};

/** 오늘 날짜를 'YYYY.MM.DD' 형식으로 반환한다. */
export function todayKey(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'dtb-tx-1',
    date: '2026.04.16',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '주류 구매',
    amount: -150000,
    manager: '김시현',
    memo: '고기, 술, 음료 등',
    hasReceipt: true,
    receiptImages: ['receipt-1', 'receipt-2'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-2',
    date: '2026.04.16',
    ledgerId: 'ledger-mt-feb',
    ledgerName: 'MT 정산',
    itemName: '레크레이션 경품',
    amount: -43000,
    manager: '봉서연',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: true,
  },
  {
    id: 'dtb-tx-3',
    date: '2026.04.16',
    ledgerId: 'ledger-training',
    ledgerName: '훈련',
    itemName: '회비 입금',
    amount: 300000,
    manager: '이정현',
    memo: '4월 회비',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-4',
    date: '2026.04.15',
    ledgerId: 'ledger-mt-feb-transport',
    ledgerName: '이동 경비',
    itemName: 'MT 렌트카 대여',
    amount: -150000,
    manager: '김민주',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-5'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-5',
    date: '2026.04.15',
    ledgerId: 'ledger-mt-feb',
    ledgerName: 'MT 정산',
    itemName: 'MT 장보기',
    amount: -235000,
    manager: '김시현',
    memo: '고기, 술, 음료 등',
    hasReceipt: true,
    receiptImages: ['receipt-6', 'receipt-7'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-6',
    date: '2026.04.14',
    ledgerId: 'ledger-club-fair-booth',
    ledgerName: '부스 운영',
    itemName: '부스 재료 구매',
    amount: -87000,
    manager: '봉서연',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-8'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-7',
    date: '2026.04.14',
    ledgerId: 'ledger-club-fair-goods',
    ledgerName: '홍보물 제작',
    itemName: '배너 제작',
    amount: -60000,
    manager: '이정현',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: true,
  },
  {
    id: 'dtb-tx-8',
    date: '2026.04.12',
    ledgerId: 'ledger-semester-1-sub',
    ledgerName: '1학기 총무',
    itemName: '회비 입금',
    amount: 900000,
    manager: '김민주',
    memo: '3월 회비 일괄 입금',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-9',
    date: '2026.04.10',
    ledgerId: 'ledger-festival-stage',
    ledgerName: '무대 진행',
    itemName: '음향 장비 대여',
    amount: -420000,
    manager: '김시현',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-9'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-10',
    date: '2026.04.10',
    ledgerId: 'ledger-festival-booth',
    ledgerName: '부스 운영',
    itemName: '부스 천막 대여',
    amount: -180000,
    manager: '봉서연',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-11',
    date: '2026.04.08',
    ledgerId: 'ledger-mt-feb',
    ledgerName: 'MT 정산',
    itemName: '숙소 예약금',
    amount: -500000,
    manager: '이정현',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-10'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-12',
    date: '2026.04.08',
    ledgerId: 'ledger-semester-1-mt',
    ledgerName: '1학기',
    itemName: 'MT 회비 입금',
    amount: 600000,
    manager: '김민주',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-13',
    date: '2026.04.05',
    ledgerId: 'ledger-training',
    ledgerName: '훈련',
    itemName: '간식 구매',
    amount: -32000,
    manager: '봉서연',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-11'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-14',
    date: '2026.04.05',
    ledgerId: 'ledger-club-fair-booth',
    ledgerName: '부스 운영',
    itemName: '경품 구매',
    amount: -95000,
    manager: '김시현',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: true,
  },
  {
    id: 'dtb-tx-15',
    date: '2026.04.03',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '회비 입금',
    amount: 300000,
    manager: '이정현',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-16',
    date: '2026.04.03',
    ledgerId: 'ledger-mt-feb-transport',
    ledgerName: '이동 경비',
    itemName: '주유비',
    amount: -60000,
    manager: '김민주',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-12'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-17',
    date: '2026.04.01',
    ledgerId: 'ledger-festival-stage',
    ledgerName: '무대 진행',
    itemName: '조명 장비 대여',
    amount: -350000,
    manager: '봉서연',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-13'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-18',
    date: '2026.04.01',
    ledgerId: 'ledger-club-fair-goods',
    ledgerName: '홍보물 제작',
    itemName: '스티커 제작',
    amount: -25000,
    manager: '김시현',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-19',
    date: '2026.03.28',
    ledgerId: 'ledger-semester-1-sub',
    ledgerName: '1학기 총무',
    itemName: '문구류 구매',
    amount: -18000,
    manager: '이정현',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-14'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-20',
    date: '2026.03.28',
    ledgerId: 'ledger-training',
    ledgerName: '훈련',
    itemName: '훈련 장소 대관료',
    amount: -200000,
    manager: '김민주',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: true,
  },
  {
    id: 'dtb-tx-21',
    date: '2026.03.25',
    ledgerId: 'ledger-festival-booth',
    ledgerName: '부스 운영',
    itemName: '부스 재료 구매',
    amount: -76000,
    manager: '봉서연',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-15'],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-22',
    date: '2026.03.25',
    ledgerId: 'ledger-mt-feb',
    ledgerName: 'MT 정산',
    itemName: '보험료',
    amount: -40000,
    manager: '김시현',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-23',
    date: '2026.03.20',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '회비 입금',
    amount: 300000,
    manager: '이정현',
    memo: '',
    hasReceipt: false,
    receiptImages: [],
    isPendingApproval: false,
  },
  {
    id: 'dtb-tx-24',
    date: '2026.03.20',
    ledgerId: 'ledger-club-fair-booth',
    ledgerName: '부스 운영',
    itemName: '현수막 제작',
    amount: -55000,
    manager: '김민주',
    memo: '',
    hasReceipt: true,
    receiptImages: ['receipt-16'],
    isPendingApproval: false,
  },
];

// 세션 동안 유지되는 메모리 내 목(mock) 저장소. 실제 백엔드가 없어 새로고침(앱 재시작) 시 초기화된다.
let transactions: Transaction[] = [...SEED_TRANSACTIONS];

/** 전체 내역을 최신순으로 반환한다. */
export function getAllTransactions(): Transaction[] {
  return [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 승인요청 중인 내역만 최신순으로 반환한다. */
export function getPendingApprovalTransactions(): Transaction[] {
  return getAllTransactions().filter(tx => tx.isPendingApproval);
}

/** id로 내역 하나를 찾는다. */
export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find(tx => tx.id === id);
}

/** 날짜(date) 기준으로 그룹핑한다. 각 그룹 내부는 최신순을 유지한다. */
export function groupTransactionsByDate(
  list: Transaction[],
): { date: string; items: Transaction[] }[] {
  const groups: { date: string; items: Transaction[] }[] = [];
  for (const tx of list) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === tx.date) {
      lastGroup.items.push(tx);
    } else {
      groups.push({ date: tx.date, items: [tx] });
    }
  }
  return groups;
}

export type TransactionFilterValue = {
  period: '1month' | '3month' | '6month' | 'custom';
  customStart?: string;
  customEnd?: string;
  ledgerIds: string[];
  type: 'all' | 'income' | 'expense';
  sort: 'latest' | 'oldest';
};

export const DEFAULT_TRANSACTION_FILTER: TransactionFilterValue = {
  period: '1month',
  ledgerIds: [],
  type: 'all',
  sort: 'latest',
};

/** 필터 값에 맞춰 전체 내역을 걸러 정렬해 반환한다. */
export function applyTransactionFilter(
  filter: TransactionFilterValue,
): Transaction[] {
  let list = [...transactions];

  if (filter.ledgerIds.length > 0) {
    list = list.filter(tx => filter.ledgerIds.includes(tx.ledgerId));
  }
  if (filter.type === 'income') {
    list = list.filter(tx => tx.amount > 0);
  } else if (filter.type === 'expense') {
    list = list.filter(tx => tx.amount < 0);
  }
  if (filter.period === 'custom' && filter.customStart && filter.customEnd) {
    list = list.filter(
      tx => tx.date >= filter.customStart! && tx.date <= filter.customEnd!,
    );
  }

  list.sort((a, b) =>
    filter.sort === 'latest'
      ? a.date < b.date
        ? 1
        : -1
      : a.date > b.date
      ? 1
      : -1,
  );

  return list;
}

/** 내역명 또는 장부명에 query가 포함된 내역을 찾는다(대소문자 무시). */
export function searchTransactions(query: string): Transaction[] {
  const lower = query.trim().toLowerCase();
  if (!lower) {
    return [];
  }
  return getAllTransactions().filter(
    tx =>
      tx.itemName.toLowerCase().includes(lower) ||
      tx.ledgerName.toLowerCase().includes(lower),
  );
}

/**
 * 장부 선택 시트에서 쓸 전체 장부 목록(id/name) — 이 목 데이터(`SEED_TRANSACTIONS`)에
 * 실제로 등장하는 장부만 중복 없이 뽑는다. Folder/Ledger 도메인이 3단계에서 실 API로
 * 옮겨가며 그쪽 목 트리(`types/folder.ts`)가 사라졌으므로, DTB(Entry) 도메인은 아직
 * 4단계 전이라 이 파일 자체의 목 데이터로 자급자족한다(예전에도 두 목 데이터의
 * 장부 id·이름 10개가 우연히 일치했을 뿐 — 이제 이 파일 하나가 유일한 출처다).
 */
const LEDGER_OPTIONS: { id: string; name: string }[] = Array.from(
  new Map(
    SEED_TRANSACTIONS.map(tx => [tx.ledgerId, { id: tx.ledgerId, name: tx.ledgerName }]),
  ).values(),
);

export function getTransactionLedgerOptions(): { id: string; name: string }[] {
  return LEDGER_OPTIONS;
}

/** 내역 하나를 수정한다. */
export function updateTransaction(
  id: string,
  patch: Partial<Omit<Transaction, 'id'>>,
): void {
  transactions = transactions.map(tx =>
    tx.id === id ? { ...tx, ...patch } : tx,
  );
}

/** 내역 하나를 삭제한다. */
export function deleteTransactionById(id: string): void {
  transactions = transactions.filter(tx => tx.id !== id);
}
