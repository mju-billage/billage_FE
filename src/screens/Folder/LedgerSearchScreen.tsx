/** @screen FDR-3-PAGE-02-0 내역 검색_장부 */
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import SearchField from '../../components/Input/Search/SearchField';
import TextButton from '../../components/Input/Button/TextButton';
import Button from '../../components/Input/Button/Button';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import type { EntryApprovalStatus, EntrySummary, EntryType } from '../../types/entry';
import * as entryService from '../../services/entryService';
import LedgerFilterSheet, {
  DEFAULT_LEDGER_FILTER,
  type LedgerFilterValue,
} from './LedgerFilterSheet';
import {
  LEDGER_DETAIL_RETRY_LABEL,
  LEDGER_ENTRIES_LOADING_MORE,
  LEDGER_SEARCH_EMPTY,
  LEDGER_SEARCH_PLACEHOLDER,
} from '../../constants/ledgerScreenText';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const FILTER_LABEL = '필터';

type LedgerSearchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LedgerSearch'
>;
type LedgerSearchRouteProp = RouteProp<RootStackParamList, 'LedgerSearch'>;

function toApiType(type: LedgerFilterValue['type']): EntryType | undefined {
  if (type === 'income') return 'INCOME';
  if (type === 'expense') return 'EXPENSE';
  return undefined;
}

function toApiStatus(
  status: LedgerFilterValue['status'],
): EntryApprovalStatus | undefined {
  if (status === 'pending') return 'PENDING';
  if (status === 'approved') return 'APPROVED';
  return undefined;
}

/** 장부 상세에서 진입하는 내역 검색 화면: 제목/메모 검색(keyword) + 필터 시트. */
function LedgerSearchScreen() {
  const navigation = useNavigation<LedgerSearchNavigationProp>();
  const route = useRoute<LedgerSearchRouteProp>();
  const ledgerId = route.params.ledgerId;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [results, setResults] = useState<EntrySummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const search = useCallback(
    async (reset: boolean) => {
      const nextPage = reset ? 0 : page + 1;
      if (!reset) {
        setIsLoadingMore(true);
      }
      try {
        const result = await entryService.getEntries(ledgerId, {
          keyword: query.trim() || undefined,
          type: toApiType(filter.type),
          status: toApiStatus(filter.status),
          sort: filter.sort === 'latest' ? 'occurredOn,desc' : 'occurredOn,asc',
          page: nextPage,
        });
        setResults(current => (reset ? result.items : [...current, ...result.items]));
        setPage(result.page);
        setHasMore(!result.last);
        if (reset) {
          setSearchError(undefined);
        }
      } catch (error) {
        // "결과 없음"과 "요청 실패"를 구분한다 — 전에는 둘 다 빈 목록으로만
        // 보여서 사용자가 검색이 실패한 건지 그냥 결과가 없는 건지 알 수 없었다.
        if (reset) {
          setResults([]);
          setHasMore(false);
          setSearchError(toErrorMessage(error));
        }
      } finally {
        setIsLoadingMore(false);
      }
    },
    [ledgerId, query, filter, page],
  );

  useEffect(() => {
    search(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, query, filter]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      search(false);
    }
  };

  return (
    <ScreenContainer background="secondary" edges={['bottom']} style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.searchWrapper}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={LEDGER_SEARCH_PLACEHOLDER}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <TextButton
          label={FILTER_LABEL}
          hierarchy="tertiary"
          onPress={() => setFilterSheetVisible(true)}
        />
      </View>

      {searchError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{searchError}</Text>
          <Button
            label={LEDGER_DETAIL_RETRY_LABEL}
            onPress={() => search(true)}
            hierarchy="secondary"
            style={styles.retryButton}
          />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{LEDGER_SEARCH_EMPTY}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            isLoadingMore ? (
              <Text style={styles.loadingMoreText}>{LEDGER_ENTRIES_LOADING_MORE}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TransactionListItem
              label={item.occurredOn}
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

      <LedgerFilterSheet
        visible={filterSheetVisible}
        value={filter}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilter}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchWrapper: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  retryButton: {
    marginTop: 4,
  },
});

export default LedgerSearchScreen;
