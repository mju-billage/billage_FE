/**
 * 장부 상세 내역(ETC-4-PAGE-05-0)·전체 통합 시간순(ETC-4-PAGE-07-0) 둘 다 쓰는
 * "구분 탭 + 건수 + 일자별 그룹 리스트" 조각. 두 화면이 상단 요약 카드만
 * 다르고(하나는 단일 카드, 하나는 캐러셀) 탭·리스트 로직은 완전히 같아 이
 * 부분만 분리했다.
 *
 * 입력 `entries`는 이미 `ledgerName`이 태그된 스냅샷이다 — 05-0(장부 하나
 * 스코프)은 호출부가 같은 장부명을 모든 항목에 채워 넣어서 넘기고, 07-0
 * (여러 장부 통합)은 각 항목의 실제 소속 장부명을 그대로 넘긴다. 목록 행이
 * `TransactionListItem`(label=장부명)을 그대로 재사용할 수 있는 이유다.
 *
 * ⚠️ 시안 UI 요소 6번은 이 리스트 행에 "영수증 첨부 아이콘"이 있다고
 * 적었다. 보관함 스냅샷(`ArchivedEntry`)은 `approvalStatus`/`receiptFiles[]`가
 * 있어 `TransactionListItem`의 승인요청 배지·영수증 아이콘을 그린다(2026-09-21).
 * 보고서 스냅샷(`GET /reports/{reportId}`의 `entries`)엔 그 필드 자체가 없어
 * (2026-09-05 실호출 확인) 보고서 두 화면은 여전히 배지·아이콘이 안 뜬다. 자리만
 * 비워 두지 않은 이유: 데이터 없이 빈 아이콘 슬롯을 넣으면 나중에 실제
 * 데이터가 와서 정렬이 바뀔 때 지금 만든 레이아웃과 어긋난다.
 * `docs/backend-requests.md` 2순위 요청이 받아들여져 스냅샷에 `receiptCount`가
 * 추가되면 아래 `renderItem`의 `hasReceipt`에 그 값도 반영할 것.
 * 배지·영수증이 없는 행은 `TransactionListItem`이 납부관리 아이콘(기본)을 그린다.
 */
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import { formatDateHeader } from '../../utils/dateHeader';
import {
  REPORT_ENTRY_LIST_COUNT_SUFFIX,
  REPORT_ENTRY_LIST_EMPTY,
  REPORT_LEDGER_ENTRIES_TAB_ALL,
  REPORT_LEDGER_ENTRIES_TAB_EXPENSE,
  REPORT_LEDGER_ENTRIES_TAB_INCOME,
} from '../../constants/reportScreenText';
import { BACKGROUND_SECONDARY, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type TaggedReportEntry = {
  ledgerName: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
  /** 보관함 스냅샷(`ArchivedEntry`)에만 있다 — 보고서 스냅샷엔 없어 그 화면들은 배지가 안 뜬다. */
  approvalStatus?: 'PENDING' | 'APPROVED';
  /** 보관함 스냅샷에만 있다(위와 같은 이유). 하나라도 있으면 영수증 아이콘을 그린다. */
  receiptFiles?: { fileId: string }[];
};

type Tab = 'all' | 'income' | 'expense';

const TABS: { label: string; value: Tab }[] = [
  { label: REPORT_LEDGER_ENTRIES_TAB_ALL, value: 'all' },
  { label: REPORT_LEDGER_ENTRIES_TAB_INCOME, value: 'income' },
  { label: REPORT_LEDGER_ENTRIES_TAB_EXPENSE, value: 'expense' },
];

function groupByDate(
  list: TaggedReportEntry[],
): { date: string; items: TaggedReportEntry[] }[] {
  const groups: { date: string; items: TaggedReportEntry[] }[] = [];
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

type ReportEntryListProps = {
  entries: TaggedReportEntry[];
  onPressEntry: (entry: TaggedReportEntry) => void;
  /** true면 목록 전체를 흰 배경 + 화면 가로 전체 폭으로 그리고(탭도 좌우 여백 없이 절반/삼분할),
   * 좌우 20은 안쪽 콘텐츠 패딩으로만 준다. 부모가 좌우 패딩 없이 화면 폭 그대로 넣어야 한다.
   * 기본 false(기존 모양 — 부모 패딩 안, 투명 배경). */
  sheet?: boolean;
};

function ReportEntryList({ entries, onPressEntry, sheet = false }: ReportEntryListProps) {
  const [tab, setTab] = useState<Tab>('all');
  const insets = useSafeAreaInsets();
  const inset = sheet ? styles.sheetInset : undefined;

  const filtered = entries
    .filter(entry => {
      if (tab === 'income') {
        return entry.type === 'INCOME';
      }
      if (tab === 'expense') {
        return entry.type === 'EXPENSE';
      }
      return true;
    })
    // 보고서 상세 응답은 발생일 오름차순으로 온다(2026-09-05 실호출 확인) —
    // 시안은 최신순이라 여기서 뒤집는다.
    .sort((a, b) => (a.occurredOn < b.occurredOn ? 1 : a.occurredOn > b.occurredOn ? -1 : 0));

  const sections = groupByDate(filtered).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

  return (
    <View style={[styles.container, sheet && styles.containerSheet]}>
      <Tabs items={TABS} value={tab} onChange={setTab} showIcon={false} fullWidth={sheet} />

      <Text style={[styles.countText, inset]}>
        {filtered.length}
        {REPORT_ENTRY_LIST_COUNT_SUFFIX}
      </Text>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{REPORT_ENTRY_LIST_EMPTY}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.ledgerName}-${item.occurredOn}-${index}`}
          contentContainerStyle={[
            styles.listContent,
            sheet && { paddingBottom: 24 + insets.bottom },
          ]}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, inset]}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            // 보고서 스냅샷은 approvalStatus/receiptFiles가 없어 배지·영수증이 안 뜬다.
            // TODO: 스냅샷에 receiptCount가 추가되면 그 값도 hasReceipt에 반영할 것
            // (파일 상단 주석, docs/backend-requests.md 2순위 참고).
            <View style={inset}>
              <TransactionListItem
                label={item.ledgerName}
                itemName={item.title}
                amount={item.type === 'INCOME' ? item.amount : -item.amount}
                hasReceipt={(item.receiptFiles?.length ?? 0) > 0}
                isPendingApproval={item.approvalStatus === 'PENDING'}
                onPress={() => onPressEntry(item)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerSheet: {
    backgroundColor: BACKGROUND_SECONDARY,
  },
  // `sheet` 모드에서 콘텐츠(건수·날짜 헤더·내역 행)의 좌우 패딩.
  sheetInset: {
    paddingHorizontal: 20,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
    marginBottom: 4,
  },
});

export default ReportEntryList;
