export type Member = {
  memberId: string;
  groupId: string;
  name: string;
  phoneNumber: string | null;
  tags: string[];
  memo: string | null;
  createdAt: string;
};

export type MemberDetail = Member & {
  totalPaidAmount: number;
};

export type MemberPayment = {
  duesId: string;
  duesTitle: string;
  ledgerId: string;
  ledgerName: string;
  amount: number;
  paidAt: string;
};
