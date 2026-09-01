/** @screen DTB-2-PAGE-01-0 내역 검색_전체 */
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import SearchField from '../../components/Input/Search/SearchField';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import { groupTransactionsByDate, searchTransactions } from '../../types/transaction';
import { LEDGER_SEARCH_EMPTY } from '../../constants/ledgerScreenText';
import {
  TRANSACTION_SEARCH_PLACEHOLDER,
  TRANSACTIONS_TITLE,
} from '../../constants/transactionScreenText';
import { CALENDAR_WEEKDAY_LABELS } from '../../constants/calendarScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

/** 'YYYY.MM.DD' -> 'M월 D일 요일'. */
function formatDateHeader(date: string): string {
  const [year, month, day] = date.split('.').map(Number);
  const jsDate = new Date(year, month - 1, day);
  return `${month}월 ${day}일 ${CALENDAR_WEEKDAY_LABELS[jsDate.getDay()]}요일`;
}

type TransactionSearchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionSearch'
>;

/** 내역 메인 화면의 검색 화면: 내역명/장부명으로 전체 내역을 검색한다. */
function TransactionSearchScreen() {
  const navigation = useNavigation<TransactionSearchNavigationProp>();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchTransactions(query), [query]);
  const sections = useMemo(
    () =>
      groupTransactionsByDate(results).map(group => ({
        title: formatDateHeader(group.date),
        data: group.items,
      })),
    [results],
  );

  const trimmed = query.trim();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type="sub"
        title={TRANSACTIONS_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={TRANSACTION_SEARCH_PLACEHOLDER}
        />

        {trimmed.length === 0 ? null : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{LEDGER_SEARCH_EMPTY}</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <TransactionListItem
                label={item.ledgerName}
                itemName={item.itemName}
                amount={item.amount}
                hasReceipt={item.hasReceipt}
                isPendingApproval={item.isPendingApproval}
                onPress={() =>
                  navigation.navigate('TransactionDetail', {
                    transactionId: item.id,
                  })
                }
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  // 12px+Bold 조합은 정식 스타일에 없어 body3+bold를 예외로 채택.
  sectionHeader: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default TransactionSearchScreen;
