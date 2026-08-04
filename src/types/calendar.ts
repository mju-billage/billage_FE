export type CalendarTransaction = {
  id: string;
  groupName: string;
  itemName: string;
  /** 지출은 음수, 입금은 양수. */
  amount: number;
  hasReceipt: boolean;
  isPendingApproval: boolean;
};

export type CalendarMonthData = {
  year: number;
  month: number;
  /** 목데이터 상 "오늘"로 강조할 날짜(실제 기기 날짜와 무관한 고정값). */
  todayDate: number;
  transactionsByDate: Record<number, CalendarTransaction[]>;
};

export const MOCK_CALENDAR_MONTH: CalendarMonthData = {
  year: 2026,
  month: 7,
  todayDate: 12,
  transactionsByDate: {
    2: [
      {
        id: 'jul-02-income',
        groupName: 'MT',
        itemName: '회비 입금',
        amount: 15000,
        hasReceipt: false,
        isPendingApproval: false,
      },
    ],
    3: [
      {
        id: 'jul-03-expense',
        groupName: 'MT',
        itemName: '모임 지출',
        amount: -10000,
        hasReceipt: false,
        isPendingApproval: false,
      },
    ],
    8: [
      {
        id: 'jul-08-income',
        groupName: 'MT',
        itemName: '회비 입금',
        amount: 15000,
        hasReceipt: false,
        isPendingApproval: false,
      },
      {
        id: 'jul-08-expense',
        groupName: 'MT',
        itemName: '모임 지출',
        amount: -10000,
        hasReceipt: false,
        isPendingApproval: false,
      },
    ],
    9: [
      {
        id: 'jul-09-income',
        groupName: 'MT',
        itemName: '회비 입금',
        amount: 15000,
        hasReceipt: false,
        isPendingApproval: false,
      },
    ],
    10: [
      {
        id: 'jul-10-expense',
        groupName: 'MT',
        itemName: '모임 지출',
        amount: -10000,
        hasReceipt: false,
        isPendingApproval: false,
      },
    ],
    11: [
      {
        id: 'jul-11-expense',
        groupName: 'MT',
        itemName: '모임 지출',
        amount: -10000,
        hasReceipt: false,
        isPendingApproval: false,
      },
    ],
    12: [
      {
        id: 'jul-12-emart',
        groupName: 'MT',
        itemName: '(주)이마트',
        amount: -150000,
        hasReceipt: true,
        isPendingApproval: false,
      },
      {
        id: 'jul-12-recreation-prize',
        groupName: 'MT',
        itemName: '레크레이션 경품',
        amount: -43000,
        hasReceipt: false,
        isPendingApproval: true,
      },
    ],
  },
};
