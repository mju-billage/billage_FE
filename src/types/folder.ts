/** 폴더 트리의 폴더 노드. parentId가 null이면 최상위(폴더 탭 루트)에 있다. */
export type FolderNode = {
  id: string;
  parentId: string | null;
  kind: 'folder';
  name: string;
  createdAt: string;
};

/** 폴더 트리의 장부 노드. 폴더와 같은 트리에 섞여 들어간다. */
export type LedgerNode = {
  id: string;
  parentId: string | null;
  kind: 'ledger';
  name: string;
  createdAt: string;
  /** null이면 예산 미설정. */
  budget: number | null;
};

export type FolderTreeNode = FolderNode | LedgerNode;

export type LedgerTransaction = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  itemName: string;
  /** 지출은 음수, 수입은 양수. */
  amount: number;
  date: string;
  manager: string;
  memo: string;
  receiptImages: string[];
  receiptLineItems?: { name: string; quantity: number; amount: number }[];
};

const SEED_FOLDER_TREE: FolderTreeNode[] = [
  // 최상위(폴더 탭 루트)
  {
    id: 'mt',
    parentId: null,
    kind: 'folder',
    name: 'MT',
    createdAt: '25.03.02',
  },
  {
    id: 'ledger-semester-1-root',
    parentId: null,
    kind: 'ledger',
    name: '1학기',
    createdAt: '25.03.02',
    budget: 902000,
  },
  {
    id: 'club-fair',
    parentId: null,
    kind: 'folder',
    name: '동아리박람회',
    createdAt: '25.03.15',
  },
  {
    id: 'ledger-training',
    parentId: null,
    kind: 'ledger',
    name: '훈련',
    createdAt: '25.04.01',
    budget: null,
  },
  {
    id: 'semester-1-folder',
    parentId: null,
    kind: 'folder',
    name: '1학기',
    createdAt: '25.03.02',
  },
  {
    id: 'festival',
    parentId: null,
    kind: 'folder',
    name: '축제',
    createdAt: '25.05.01',
  },

  // MT 폴더 하위
  {
    id: 'mt-feb',
    parentId: 'mt',
    kind: 'folder',
    name: '2월',
    createdAt: '25.02.01',
  },
  {
    id: 'ledger-semester-1-mt',
    parentId: 'mt',
    kind: 'ledger',
    name: '1학기',
    createdAt: '25.03.02',
    budget: null,
  },

  // MT > 2월 하위
  {
    id: 'ledger-mt-feb',
    parentId: 'mt-feb',
    kind: 'ledger',
    name: 'MT 정산',
    createdAt: '25.02.10',
    budget: 500000,
  },
  {
    id: 'ledger-mt-feb-transport',
    parentId: 'mt-feb',
    kind: 'ledger',
    name: '이동 경비',
    createdAt: '25.02.11',
    budget: null,
  },
  {
    id: 'mt-feb-photo',
    parentId: 'mt-feb',
    kind: 'folder',
    name: '사진 자료',
    createdAt: '25.02.12',
  },

  // 1학기 폴더(최상위의 6번째 항목) 하위
  {
    id: 'ledger-semester-1-sub',
    parentId: 'semester-1-folder',
    kind: 'ledger',
    name: '1학기 총무',
    createdAt: '25.03.03',
    budget: null,
  },

  // 동아리박람회 하위
  {
    id: 'ledger-club-fair-booth',
    parentId: 'club-fair',
    kind: 'ledger',
    name: '부스 운영',
    createdAt: '25.03.16',
    budget: 300000,
  },
  {
    id: 'ledger-club-fair-goods',
    parentId: 'club-fair',
    kind: 'ledger',
    name: '홍보물 제작',
    createdAt: '25.03.17',
    budget: null,
  },
  {
    id: 'club-fair-day1',
    parentId: 'club-fair',
    kind: 'folder',
    name: '1일차',
    createdAt: '25.03.18',
  },
  {
    id: 'club-fair-day2',
    parentId: 'club-fair',
    kind: 'folder',
    name: '2일차',
    createdAt: '25.03.19',
  },

  // 축제 하위
  {
    id: 'ledger-festival-stage',
    parentId: 'festival',
    kind: 'ledger',
    name: '무대 진행',
    createdAt: '25.05.02',
    budget: 1000000,
  },
  {
    id: 'ledger-festival-booth',
    parentId: 'festival',
    kind: 'ledger',
    name: '부스 운영',
    createdAt: '25.05.03',
    budget: null,
  },
];

const SEED_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'tx-1',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '주류 구매',
    amount: -150000,
    date: '2026.04.16',
    manager: '김시현',
    memo: '고기, 술, 음료 등',
    receiptImages: ['receipt-1', 'receipt-2'],
    receiptLineItems: [
      { name: '소주', quantity: 20, amount: 200000 },
      { name: '플라스틱 접시', quantity: 10, amount: 20000 },
      { name: '소주컵', quantity: 10, amount: 15000 },
    ],
  },
  {
    id: 'tx-2',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '레크레이션 경품',
    amount: -43000,
    date: '2026.04.16',
    manager: '강민수',
    memo: '',
    receiptImages: [],
  },
  {
    id: 'tx-3',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: 'MT 택시비',
    amount: -12000,
    date: '2026.04.16',
    manager: '이정현',
    memo: '',
    receiptImages: ['receipt-3'],
  },
  {
    id: 'tx-4',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '강민수',
    amount: 20000,
    date: '2026.04.14',
    manager: '강민수',
    memo: '회비 납부',
    receiptImages: [],
  },
  {
    id: 'tx-5',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '이정현',
    amount: 20000,
    date: '2026.04.14',
    manager: '이정현',
    memo: '회비 납부',
    receiptImages: [],
  },
  {
    id: 'tx-6',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '저녁 회식',
    amount: 120000,
    date: '2026.04.14',
    manager: '김시현',
    memo: '',
    receiptImages: [],
  },
  {
    id: 'tx-7',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '졸업생 후원금',
    amount: 300000,
    date: '2026.04.14',
    manager: '봉서연',
    memo: '',
    receiptImages: [],
  },
  {
    id: 'tx-8',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '(주)스타벅스 명지대점',
    amount: -12000,
    date: '2026.04.14',
    manager: '김시현',
    memo: '',
    receiptImages: ['receipt-4'],
  },
  {
    id: 'tx-9',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: 'MT 렌트카 대여',
    amount: -150000,
    date: '2026.04.14',
    manager: '김시현',
    memo: '',
    receiptImages: ['receipt-5'],
  },
  {
    id: 'tx-10',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: 'MT 장보기',
    amount: -235000,
    date: '2025.11.15',
    manager: '김시현',
    memo: '고기, 술, 음료 등',
    receiptImages: ['receipt-6', 'receipt-7'],
    receiptLineItems: [
      { name: '소주', quantity: 20, amount: 200000 },
      { name: '플라스틱 접시', quantity: 10, amount: 20000 },
      { name: '소주컵', quantity: 10, amount: 15000 },
    ],
  },
  {
    id: 'tx-11',
    ledgerId: 'ledger-semester-1-root',
    ledgerName: '1학기',
    itemName: '봉서연',
    amount: 50000,
    date: '2025.11.15',
    manager: '김시현',
    memo: '',
    receiptImages: [],
  },
];

// 세션 동안 유지되는 메모리 내 목(mock) 저장소. 실제 백엔드가 없어 새로고침(앱 재시작) 시 초기화된다.
let folderTree: FolderTreeNode[] = [...SEED_FOLDER_TREE];
let transactions: LedgerTransaction[] = [...SEED_TRANSACTIONS];
let nextNodeId = 1;

function generateId(prefix: string): string {
  nextNodeId += 1;
  return `${prefix}-${Date.now()}-${nextNodeId}`;
}

/** 특정 폴더(parentId)의 직계 자식 노드를 반환한다. null이면 최상위 노드를 반환한다. */
export function getChildNodes(parentId: string | null): FolderTreeNode[] {
  return folderTree.filter(node => node.parentId === parentId);
}

/** id로 폴더/장부 노드 하나를 찾는다. */
export function getNodeById(id: string): FolderTreeNode | undefined {
  return folderTree.find(node => node.id === id);
}

/** 트리 깊이와 무관하게 전체 장부 노드를 반환한다 (전체 예산 설정 목록용). */
export function getAllLedgerNodes(): LedgerNode[] {
  return folderTree.filter(
    (node): node is LedgerNode => node.kind === 'ledger',
  );
}

/** 트리 전체에서 이름에 query가 포함된 폴더/장부를 찾는다(대소문자 무시). */
export function searchNodes(query: string): FolderTreeNode[] {
  const lower = query.trim().toLowerCase();
  if (!lower) {
    return [];
  }
  return folderTree.filter(node => node.name.toLowerCase().includes(lower));
}

/** 특정 장부의 거래 내역을 최신순으로 반환한다. */
export function getTransactionsByLedgerId(
  ledgerId: string,
): LedgerTransaction[] {
  return transactions
    .filter(tx => tx.ledgerId === ledgerId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** id로 거래 내역 하나를 찾는다. */
export function getTransactionById(id: string): LedgerTransaction | undefined {
  return transactions.find(tx => tx.id === id);
}

/** 새 폴더를 생성한다. */
export function addFolderNode(
  parentId: string | null,
  name: string,
): FolderNode {
  const node: FolderNode = {
    id: generateId('folder'),
    parentId,
    kind: 'folder',
    name,
    createdAt: formatToday(),
  };
  folderTree.push(node);
  return node;
}

/** 새 장부를 생성한다. */
export function addLedgerNode(
  parentId: string | null,
  name: string,
  budget: number | null,
): LedgerNode {
  const node: LedgerNode = {
    id: generateId('ledger'),
    parentId,
    kind: 'ledger',
    name,
    createdAt: formatToday(),
    budget,
  };
  folderTree.push(node);
  return node;
}

/** 폴더/장부 이름을 변경한다. */
export function renameNode(id: string, name: string): void {
  folderTree = folderTree.map(node =>
    node.id === id ? { ...node, name } : node,
  );
}

/** 장부의 예산을 설정/수정한다. */
export function setLedgerBudget(id: string, budget: number): void {
  folderTree = folderTree.map(node =>
    node.id === id && node.kind === 'ledger' ? { ...node, budget } : node,
  );
}

/** 폴더를 해제한다: 폴더 자신은 사라지고, 내부 항목은 상위 폴더로 승격된다. */
export function unlinkFolder(id: string): void {
  const target = folderTree.find(node => node.id === id);
  if (!target) {
    return;
  }
  folderTree = folderTree
    .filter(node => node.id !== id)
    .map(node =>
      node.parentId === id ? { ...node, parentId: target.parentId } : node,
    );
}

/** 장부를 삭제한다. 장부에 속한 거래 내역도 함께 삭제된다. */
export function deleteLedgerNode(id: string): void {
  folderTree = folderTree.filter(node => node.id !== id);
  transactions = transactions.filter(tx => tx.ledgerId !== id);
}

/** 선택한 폴더/장부들을 다른 폴더 하위로 이동한다. */
export function moveNodes(
  ids: string[],
  destinationParentId: string | null,
): void {
  folderTree = folderTree.map(node =>
    ids.includes(node.id) ? { ...node, parentId: destinationParentId } : node,
  );
}

/** 거래 내역 하나를 삭제한다. */
export function deleteTransaction(id: string): void {
  transactions = transactions.filter(tx => tx.id !== id);
}

function formatToday(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}
