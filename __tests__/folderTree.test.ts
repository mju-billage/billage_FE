import {
  buildFolderTree,
  findFolderNode,
  getChildFolders,
  flattenFolderIds,
  mergeFolderListItems,
  type RawFolderNode,
} from '../src/utils/folderTree';
import type { LedgerSummary } from '../src/types/ledger';

function ledger(id: string, name: string, budget: number | null): LedgerSummary {
  return {
    id,
    folderId: null,
    name,
    budget,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    remainingBudget: budget,
    entryCount: 0,
  };
}

describe('buildFolderTree', () => {
  it('서버 재귀 트리를 문자열 id 기반 FolderNode 트리로 변환한다', () => {
    const raw: RawFolderNode[] = [
      {
        folderId: 1,
        name: '2026년 상반기',
        parentFolderId: null,
        ledgerCount: 2,
        childFolders: [
          {
            folderId: 2,
            name: '정기공연',
            parentFolderId: 1,
            ledgerCount: 0,
            childFolders: [],
          },
        ],
      },
    ];

    const tree = buildFolderTree(raw);

    expect(tree).toEqual([
      {
        id: '1',
        parentId: null,
        name: '2026년 상반기',
        ledgerCount: 2,
        children: [
          {
            id: '2',
            parentId: '1',
            name: '정기공연',
            ledgerCount: 0,
            children: [],
          },
        ],
      },
    ]);
  });

  it('순환 참조가 와도 무한 루프 없이 두 번째 등장부터 하위를 잘라낸다', () => {
    // folderId 1의 childFolders 안에 folderId 1 자신이 다시 나타나는 손상된 응답을 흉내낸다.
    const cyclicChild: RawFolderNode = {
      folderId: 1,
      name: '순환',
      parentFolderId: 1,
      ledgerCount: 0,
      childFolders: [],
    };
    const raw: RawFolderNode[] = [
      {
        folderId: 1,
        name: '순환',
        parentFolderId: null,
        ledgerCount: 0,
        childFolders: [cyclicChild],
      },
    ];

    const tree = buildFolderTree(raw);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    // 두 번째 등장(자기 자신 참조)은 하위 없이 잘린다 — 무한 재귀가 나지 않는 게 핵심.
    expect(tree[0].children[0].children).toEqual([]);
  });
});

describe('findFolderNode / getChildFolders', () => {
  const raw: RawFolderNode[] = [
    {
      folderId: 1,
      name: 'MT',
      parentFolderId: null,
      ledgerCount: 1,
      childFolders: [
        {
          folderId: 2,
          name: '2월',
          parentFolderId: 1,
          ledgerCount: 3,
          childFolders: [],
        },
      ],
    },
    {
      folderId: 3,
      name: '축제',
      parentFolderId: null,
      ledgerCount: 0,
      childFolders: [],
    },
  ];
  const tree = buildFolderTree(raw);

  it('id로 깊이와 무관하게 노드를 찾는다', () => {
    expect(findFolderNode(tree, '2')?.name).toBe('2월');
    expect(findFolderNode(tree, '999')).toBeUndefined();
  });

  it('parentId가 null이면 최상위 목록, 아니면 그 폴더의 직계 하위를 반환한다', () => {
    expect(getChildFolders(tree, null)).toHaveLength(2);
    expect(getChildFolders(tree, '1')).toHaveLength(1);
    expect(getChildFolders(tree, '1')[0].name).toBe('2월');
    expect(getChildFolders(tree, '999')).toEqual([]);
  });
});

describe('flattenFolderIds', () => {
  it('트리의 모든 폴더 id를 평탄화한다', () => {
    const raw: RawFolderNode[] = [
      {
        folderId: 1,
        name: 'A',
        parentFolderId: null,
        ledgerCount: 0,
        childFolders: [
          { folderId: 2, name: 'A-1', parentFolderId: 1, ledgerCount: 0, childFolders: [] },
        ],
      },
      { folderId: 3, name: 'B', parentFolderId: null, ledgerCount: 0, childFolders: [] },
    ];
    expect(flattenFolderIds(buildFolderTree(raw))).toEqual(['1', '2', '3']);
  });
});

describe('mergeFolderListItems', () => {
  it('하위 폴더 + 장부를 이름순으로 합치고 폴더 itemCount를 계산한다', () => {
    const raw: RawFolderNode[] = [
      {
        folderId: 1,
        name: '나',
        parentFolderId: null,
        ledgerCount: 2,
        childFolders: [
          { folderId: 2, name: 'x', parentFolderId: 1, ledgerCount: 0, childFolders: [] },
        ],
      },
    ];
    const tree = buildFolderTree(raw);
    const ledgers = [ledger('10', '가', 3000000), ledger('11', '다', null)];

    const merged = mergeFolderListItems(tree, ledgers);

    expect(merged.map(item => item.name)).toEqual(['가', '나', '다']);
    const folderItem = merged.find(item => item.kind === 'folder');
    expect(folderItem).toMatchObject({ kind: 'folder', itemCount: 1 + 2 });
  });
});
