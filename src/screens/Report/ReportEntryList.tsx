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
  approvalStatus?: 'PENDING' | 'APPROVED';
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
