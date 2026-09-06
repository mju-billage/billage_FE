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
 * 적었지만(`TransactionListItem`은 `hasReceipt` prop으로 이미 지원함) 여기선
 * 안 넣었다 — `GET /reports/{reportId}` 응답의 `entries`(스냅샷)에
 * `receiptCount`/`receipts` 자체가 없다(2026-09-05 실호출 확인). 자리만
 * 비워 두지 않은 이유: 데이터 없이 빈 아이콘 슬롯을 넣으면 나중에 실제
 * 데이터가 와서 정렬(아이콘 유무에 따른 좌우 정렬)이 바뀔 때 지금 만든
 * 레이아웃과 어긋난다. `docs/backend-requests.md` 1순위 요청이 받아들여져
 * 스냅샷에 `receiptCount`가 추가되면 아래 `renderItem`에
 * `hasReceipt={item.receiptCount > 0}`을 그때 추가할 것.
 */
import { useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import { CALENDAR_WEEKDAY_LABELS } from '../../constants/calendarScreenText';
import {
  REPORT_ENTRY_LIST_COUNT_SUFFIX,
  REPORT_ENTRY_LIST_EMPTY,
  REPORT_LEDGER_ENTRIES_TAB_ALL,
  REPORT_LEDGER_ENTRIES_TAB_EXPENSE,
  REPORT_LEDGER_ENTRIES_TAB_INCOME,
} from '../../constants/reportScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type TaggedReportEntry = {
  ledgerName: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
};

type Tab = 'all' | 'income' | 'expense';

const TABS: { label: string; value: Tab }[] = [
  { label: REPORT_LEDGER_ENTRIES_TAB_ALL, value: 'all' },
  { label: REPORT_LEDGER_ENTRIES_TAB_INCOME, value: 'income' },
  { label: REPORT_LEDGER_ENTRIES_TAB_EXPENSE, value: 'expense' },
];

/** 'YYYY-MM-DD' -> 'M월 D일 요일'(TransactionsScreen과 동일 포맷). */
function formatDateHeader(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const jsDate = new Date(year, month - 1, day);
  return `${month}월 ${day}일 ${CALENDAR_WEEKDAY_LABELS[jsDate.getDay()]}요일`;
}

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
};

function ReportEntryList({ entries, onPressEntry }: ReportEntryListProps) {
  const [tab, setTab] = useState<Tab>('all');

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
    <View style={styles.container}>
      <Tabs items={TABS} value={tab} onChange={setTab} showIcon={false} />

      <Text style={styles.countText}>
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
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            // TODO: receiptCount가 스냅샷에 추가되면 hasReceipt={item.receiptCount > 0}
            // 넣을 것 — 지금은 스냅샷에 그 필드가 없어 뺐다(파일 상단 주석,
            // docs/backend-requests.md 1순위 참고).
            <TransactionListItem
              label={item.ledgerName}
              itemName={item.title}
              amount={item.type === 'INCOME' ? item.amount : -item.amount}
              onPress={() => onPressEntry(item)}
            />
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
