/** @screen DTB-2-PAGE-01-0 내역 검색_전체 */
/**
 * 4-B(모임 전체 내역 목록 API 연동): 목(`searchTransactions`)을 걷어내고
 * `entryService.getGroupEntries({ keyword })`(Entry.txt §7)로 옮겼다. `keyword`는
 * 내역명 또는 장부명에 걸린다(명세 그대로 — placeholder 문구도 이미 그렇게
 * 돼 있었다). 타이핑마다 서버를 부르되 과도한 호출을 막으려고 300ms
 * 디바운스만 얹었다(`MemberManageScreen` 검색과 같은 패턴). 페이지네이션은
 * 4-A에서 확정한 무한 스크롤(FlatList/SectionList `onEndReached`) 그대로 쓴다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import SearchField from '../../components/Input/Search/SearchField';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import type { EntrySummary } from '../../types/entry';
import { groupEntriesByDate } from '../../types/entry';
import { getActiveGroup } from '../../types/group';
import * as entryService from '../../services/entryService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import { LEDGER_ENTRIES_LOADING_MORE, LEDGER_SEARCH_EMPTY } from '../../constants/ledgerScreenText';
import {
  TRANSACTION_SEARCH_PLACEHOLDER,
  TRANSACTIONS_RETRY_LABEL,
  TRANSACTIONS_TITLE,
} from '../../constants/transactionScreenText';
import { CALENDAR_WEEKDAY_LABELS } from '../../constants/calendarScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SEARCH_DEBOUNCE_MS = 300;

/** 'YYYY-MM-DD' -> 'M월 D일 요일'. */
function formatDateHeader(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const jsDate = new Date(year, month - 1, day);
  return `${month}월 ${day}일 ${CALENDAR_WEEKDAY_LABELS[jsDate.getDay()]}요일`;
}

type TransactionSearchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionSearch'
>;

type SearchState = 'idle' | 'loading' | 'error' | 'ready';

/** 내역 메인 화면의 검색 화면: 내역명/장부명으로 모임 전체 내역을 검색한다. */
function TransactionSearchScreen() {
  const navigation = useNavigation<TransactionSearchNavigationProp>();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const search = useCallback(async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setSearchState('idle');
      setEntries([]);
      return;
    }
    setSearchState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setSearchState('error');
        return;
      }
      const firstPage = await entryService.getGroupEntries(group.id, {
        keyword: trimmed,
        page: 0,
      });
      setEntries(firstPage.items);
      setPage(firstPage.page);
      setHasMore(!firstPage.last);
      setSearchState('ready');
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      setSearchState('error');
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      search(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  const loadMoreEntries = useCallback(async () => {
    const trimmed = query.trim();
    if (isLoadingMore || !hasMore || !trimmed) {
      return;
    }
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await entryService.getGroupEntries(group.id, {
        keyword: trimmed,
        page: page + 1,
      });
      setEntries(current => [...current, ...nextPage.items]);
      setPage(nextPage.page);
      setHasMore(!nextPage.last);
    } catch {
      // 다음 페이지 실패는 조용히 무시한다 — 목록 끝에서 다시 스크롤하면 재시도된다.
    } finally {
      setIsLoadingMore(false);
    }
  }, [query, page, isLoadingMore, hasMore]);

  const sections = groupEntriesByDate(entries).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

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

        {searchState === 'idle' ? null : searchState === 'loading' ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : searchState === 'error' ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{errorMessage}</Text>
            <Button
              label={TRANSACTIONS_RETRY_LABEL}
              onPress={() => search(query)}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{LEDGER_SEARCH_EMPTY}</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            onEndReachedThreshold={0.4}
            onEndReached={loadMoreEntries}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.loadingMoreRow}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.loadingMoreText}>
                    {LEDGER_ENTRIES_LOADING_MORE}
                  </Text>
                </View>
              ) : null
            }
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <TransactionListItem
                label={item.ledgerName}
                itemName={item.title}
                amount={item.type === 'INCOME' ? item.amount : -item.amount}
                hasReceipt={item.receiptCount > 0}
                isPendingApproval={item.approvalStatus === 'PENDING'}
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
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 40,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
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
  loadingMoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default TransactionSearchScreen;
